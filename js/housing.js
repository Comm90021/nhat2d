// 🏠 Nhà ở của người chơi (v3.7): thuê căn hộ, mua căn hộ cũ, mua nhà cũ, mua đất xây nhà, vay mua nhà,
// sống ở nhà riêng (ngủ, nấu, tắm…), người yêu / vợ chồng chuyển về ở cùng.
// Văn phòng: 🏠 Bất động sản Hikari (khu Hikari-dai). Lô đất: world/lots.js. Căn hộ: content/units.js.
import { G, yen, addLog, applyFx, clamp, advance, MIDNIGHT, clockStr, bestCert } from './state.js';
import { modal, chips, toast, esc } from './ui.js';
import { pay, deposit, spendable } from './finance.js';
import { BUILDINGS, unitsOf, parseUnit, TYPE_NAME } from './content/units.js';
import { LOTS, LOT_START, setLots } from './world/lots.js';
import { AGENT, LISTING_NOTES, HOUSE_PLANS } from './content/housing_text.js';
import { INTERIOR_OF } from './content/interiors.js';
import { JP } from './content/names.js';
import { PEOPLE, P, gain, stageIdx } from './social.js';
import { rnd, dayRoll, chanceWord } from './ai/rules.js';
import { stateOf } from './ai/sim.js';
import { applyHomes, residents } from './homes.js';
import { addPlaces, buildingHooks } from './places.js';
import { mortgageOffer, takeMortgage } from './bank.js';
import { employed, monthlyPay } from './jobs.js';
import { levelIndex } from './learning.js';
import { hackOn } from './hackflag.js';
import { enterBuilding, placeHome } from './world/scene.js';
import { bus } from './bus.js';
import { sfx } from './audio.js';
import { fam, famGain } from './family.js';

const H = (h, m = 0) => h * 60 + m;
const pick1 = (a) => a[Math.floor(Math.random() * a.length)];
const PLAN = {
  compact: { cost: 14500000, days: 21, type: '2LDK', fee: 9000 },
  family: { cost: 19800000, days: 28, type: '3LDK', fee: 11000 },
  japanese: { cost: 23500000, days: 28, type: '3LDK', fee: 12000 },
};
const USED_HOUSE = { price: 14800000, plan: 'family' };

// ---------- trạng thái ----------
export function ensureHousing(S) {
  if (!S.housing) {
    const seed = (S.world && S.world.seed) || 1;
    const lots = {}, used = new Set();
    for (const id of Object.keys(LOTS)) {
      const kind = LOT_START[id];
      lots[id] = { kind };
      if (kind === 'npc') {
        let k = Math.floor(rnd(seed, 'lotfam', id) * JP.ho.length);
        while (used.has(k)) k = (k + 1) % JP.ho.length;
        used.add(k);
        lots[id].family = JP.ho[k]; lots[id].plan = ['family', 'japanese', 'compact'][Math.floor(rnd(seed, 'lotplan', id) * 3)]; }
      if (kind === 'used') { lots[id].plan = USED_HOUSE.plan; lots[id].price = USED_HOUSE.price; }
    }
    S.housing = { lots };
  }
  syncLots(S);
  return S.housing;
}
export function syncLots(S) {
  const L = S.housing.lots;
  for (const [id, st] of Object.entries(L)) if (st.kind === 'player') INTERIOR_OF[id] = 'house:' + id; else delete INTERIOR_OF[id];
  setLots(L);
}
// phòng trống: không có ai ở và không phải nhà bạn
const vacant = (S, uid) => !residents(S, uid).length && !(S.home && S.home.unit === uid);
const unitPrice = (S, uid) => { const B = BUILDINGS[parseUnit(uid).bid]; return Math.round(B.price * (0.82 + rnd(S.world.seed, 'uprice', uid) * 0.26) / 10000) * 10000; };
const yearIncome = (S) => (employed(S) ? Math.round(monthlyPay(S) * 12) : 0);
const homeName = (S, h = S.home) => {
  if (!h) return 'Ký túc xá công ty';
  if (h.unit) { const { bid, room } = parseUnit(h.unit); return `Phòng ${room} · ${BUILDINGS[bid].name}`; }
  return `Nhà riêng (${h.lot.replace('lot', 'lô ')}) · khu Hikari-dai`;
};
export const homeLabel = (S) => homeName(S);

// ---------- chuyển nhà ----------
async function moveTo(S, home, text) {
  const old = S.home;
  // trả căn đang thuê: lấy lại tiền cọc trừ phí vệ sinh
  if (old && !old.own && old.deposit) {
    const back = Math.max(0, old.deposit - 30000);
    if (back) deposit(S, back, 'rent', 'Hoàn tiền cọc (敷金) nhà cũ');
  }
  const partners = livingWith(S);
  S.home = { ...home, since: S.day };
  for (const id of partners) relocate(S, id, S.home);
  S.flags.tenkyo = S.day + 14;
  syncLots(S);
  applyHomes(S);
  addLog(S, `Chuyển nhà: ${homeName(S)}`);
  sfx('end');
  await modal({ who: '🏠 Nhà mới', title: `🔑 ${homeName(S)}`, text: `${text || pick1(AGENT.moveIn)}<br><span class="dim">📌 Nhớ khai báo chuyển nhà (転居届) ở 🏛️ Tòa thị chính trong 14 ngày. Từ giờ ngủ dậy bạn sẽ ở nhà mới; tiền nhà trừ vào cuối tháng.</span>` });
  // mời người yêu về ở cùng
  if (S.love && !partners.includes(S.love.id)) await offerMoveIn(S, S.love.id);
}

// Người (NPC) đang sống cùng bạn
export function livingWith(S) {
  const W = S.world, h = S.home;
  if (!h || !W) return [];
  if (h.unit) return ((W.units || {})[h.unit] || []).filter((id) => PEOPLE[id]);
  return ((W.houses || {})[h.lot] || []).filter((id) => PEOPLE[id]);
}
// Dời một NPC (cả hộ của họ) về nhà của bạn, hoặc ra khỏi nhà bạn (home = null → về phòng trống / khu khác)
function relocate(S, id, home) {
  const W = S.world;
  W.houses = W.houses || {};
  for (const [u, m] of Object.entries(W.units)) if (m.includes(id)) W.units[u] = m.filter((x) => x !== id);
  for (const [l, m] of Object.entries(W.houses)) if (m.includes(id)) W.houses[l] = m.filter((x) => x !== id);
  const Hh = W.hh[id] || (W.hh[id] = { members: [id], kids: [], who: 'single' });
  if (home && home.unit) { W.units[home.unit] = [...(W.units[home.unit] || []), id]; Hh.unit = home.unit; Hh.note = 'sống cùng bạn'; }
  else if (home && home.lot) { W.houses[home.lot] = [...(W.houses[home.lot] || []), id]; Hh.unit = null; Hh.note = 'sống cùng bạn ở nhà riêng'; }
  else {
    const free = Object.keys(BUILDINGS).filter((b) => BUILDINGS[b].map === 'jutaku').flatMap((b) => unitsOf(b).map((u) => u.uid)).find((u) => vacant(S, u));
    if (free) { W.units[free] = [id]; Hh.unit = free; Hh.note = 'đã dọn ra ở riêng'; }
    else { Hh.unit = null; Hh.note = 'đã chuyển sang khu khác'; PEOPLE[id].home = 'home_jp'; if (W.defs[id]) W.defs[id].home = 'home_jp'; }
  }
}
async function offerMoveIn(S, id) {
  const d = PEOPLE[id], p = P(S, id);
  const H0 = d.household;
  if (H0 && H0.married) return;                     // còn đang có gia đình
  const v = await modal({ who: d.name, title: '💞 Về ở cùng nhau?', text: `Bạn đã có nhà riêng. Rủ ${esc(d.name)} chuyển về sống chung?${H0 && (H0.kids || []).length ? `<br><span class="dim">${esc(d.name)} có con — các con sẽ về ở cùng.</span>` : ''}`, choices: [{ label: '💞 Rủ về ở chung', value: true }, { label: 'Để sau', value: false, cancel: true }] });
  if (!v) return;
  const L = S.love;
  const chance = L && L.stage !== 'dating' ? 0.95 : 1 / (1 + Math.exp(-(((p.att || 0) - 65) / 8 + (p.aff - 60) / 15)));
  if (dayRoll(S, id, 'movein') > chance) { await modal({ who: d.name, text: `${esc(d.name)} ngập ngừng: "Mình muốn chắc chắn hơn đã… để sau nhé."${hackOn(S) ? `<br><span class="hackpct">🛠️ ${Math.round(chance * 100)}%</span>` : ''}` }); return; }
  relocate(S, id, S.home);
  applyHomes(S);
  if (L) L.together = S.day;
  gain(S, id, 6);
  addLog(S, `${d.name} chuyển về sống cùng bạn`);
  await modal({ who: d.name, title: '🏡 Sống chung', text: `${esc(d.name)} chuyển đồ sang. Hai bàn chải đánh răng trong cùng một cốc — cảm giác thật lạ, thật ấm.<br><span class="dim">Sống chung: không còn "lâu không hẹn hò thì nguội", mỗi ngày thân thiết tăng nhẹ, tối về nhà sẽ gặp nhau.</span>`, html: chips([['aff', 6]]) });
}

// ---------- duyệt hồ sơ thuê nhà ----------
function rentChance(S, uid) {
  const B = BUILDINGS[parseUnit(uid).bid];
  const jl = levelIndex(S.lang);
  let p = B.foreignOk + (jl >= 3 ? 0.15 : 0) + (jl >= 4 ? 0.1 : 0) + ((S.fin.credit || 600) - 600) / 800 - (B.rent > monthlyPay(S) * 0.45 ? 0.3 : 0);
  if (!employed(S)) p -= 0.6;
  if (S.career.visa === 'pr' || S.career.visa === 'spouse') p += 0.25;
  return clamp(p, 0, 0.98);
}
function initialCost(B) {
  const r = B.rent;
  const rows = [
    ['Tiền cọc (敷金)', B.zero ? 0 : r],
    ['Tiền lễ (礼金)', B.zero ? 0 : r],
    ['Phí môi giới (仲介手数料)', Math.round(r * 1.1)],
    ['Tiền nhà tháng đầu (前家賃)', r],
    ['Công ty bảo lãnh (保証会社)', Math.round(r * 0.5)],
    ['Bảo hiểm cháy nổ (火災保険)', 15000],
    ['Thay ổ khóa (鍵交換)', 16500],
  ];
  return { rows, total: rows.reduce((a, x) => a + x[1], 0), deposit: B.zero ? 0 : r };
}
const costHtml = (rows, total) => `<div class="payslip">${rows.filter((r) => r[1]).map(([l, a]) => `<div class="prow"><span>${l}</span><span>${yen(a)}</span></div>`).join('')}<div class="prow net"><span>Tổng</span><span>${yen(total)}</span></div></div>`;

async function rentFlow(S) {
  const list = Object.keys(BUILDINGS).filter((b) => BUILDINGS[b].map === 'jutaku' || b === 'apt').flatMap((b) => unitsOf(b)).filter((u) => vacant(S, u.uid));
  if (!list.length) { await modal({ who: 'Bất động sản', text: 'Hiện không còn phòng trống cho thuê.' }); return; }
  const uid = await modal({
    who: 'Bất động sản Hikari', title: '🔑 Phòng đang cho thuê (賃貸)', wide: true,
    html: `<p class="dim">${esc(AGENT.initialCost)}</p>`,
    choices: [...list.map((u) => { const B = BUILDINGS[u.bid]; return { label: `🏢 ${B.name} ${u.room} · ${u.type} · ${yen(B.rent)}/tháng`, sub: `${B.zero ? '0 cọc 0 lễ (ゼロゼロ) · ' : ''}${B.foreignOk >= 1 ? 'chủ nhà nhận người nước ngoài' : 'chủ nhà xét hồ sơ'}${B.fresh ? ' · tòa mới xây' : ''}`, value: u.uid }; }), { label: '← Quay lại', value: null, cancel: true }],
  });
  if (!uid) return;
  const { bid, room } = parseUnit(uid), B = BUILDINGS[bid], C = initialCost(B);
  const ch = rentChance(S, uid);
  const tts = S.career.visa.startsWith('tts');
  const v = await modal({
    who: `${B.name} ${room}`, title: `🏢 ${TYPE_NAME[B.type] || B.type}`, wide: true,
    text: `${esc(pick1(LISTING_NOTES[B.type] || LISTING_NOTES['1K']))}<br>Tiền thuê <b>${yen(B.rent)}</b>/tháng (trừ vào cuối tháng).`,
    html: costHtml(C.rows, C.total) + `<p class="dim">${esc(AGENT.guarantor)}</p><p>Khả năng được duyệt: <b>${hackOn(S) ? Math.round(ch * 100) + '%' : chanceWord(ch)}</b>${tts ? '<br><span class="dim">Thực tập sinh muốn tự thuê nhà phải được công ty / nghiệp đoàn đồng ý (cần uy tín ≥ 55).</span>' : ''}</p>`,
    choices: [
      { label: '📝 Nộp hồ sơ thuê (入居審査)', value: true, disabled: spendable(S) < C.total || (tts && S.rep < 55), reason: tts && S.rep < 55 ? 'Công ty chưa đồng ý (uy tín < 55)' : `Thiếu ${yen(C.total - spendable(S))}` },
      { label: '← Thôi', value: false, cancel: true },
    ],
  });
  if (!v) return;
  advance(S, 30);
  if (dayRoll(S, uid, 'rent') > ch) {
    const why = !employed(S) ? 'Công ty bảo lãnh từ chối vì bạn chưa có việc làm ổn định.' : (S.fin.credit || 600) < 500 ? 'Công ty bảo lãnh từ chối vì điểm tín dụng thấp.' : pick1(AGENT.foreignerNo);
    await modal({ who: 'Bất động sản Hikari', title: '🙏 Hồ sơ không được duyệt', text: `${esc(why)}<br><span class="dim">Thử căn khác (tòa Aoba nhận người nước ngoài), học thêm tiếng Nhật, hoặc giữ điểm tín dụng tốt.</span>` });
    return;
  }
  pay(S, C.total, 'rent', `Chi phí vào nhà ${B.name} ${room}`);
  await moveTo(S, { unit: uid, own: false, rent: B.rent, deposit: C.deposit, type: B.type });
}

// ---------- mua ----------
async function payFor(S, price, what) {
  const fees = Math.round(price * 0.03 + 60000 + price * 0.01 + 100000);   // 仲介 3%+6万, thuế đăng ký ~1%, 司法書士
  const cash = spendable(S);
  // vay tối đa 90% giá nhà và không quá 7 lần thu nhập năm; phần còn lại trả bằng tiền mặt
  const loanAmt = Math.floor(Math.min(price * 0.9, yearIncome(S) * 7) / 10000) * 10000;
  const offer = loanAmt > 0 ? mortgageOffer(S, loanAmt, yearIncome(S)) : mortgageOffer(S, 1, 0);
  const down = price - loanAmt + fees;
  const v = await modal({
    who: 'Bất động sản Hikari', title: `💴 Thanh toán · ${what}`, wide: true,
    html: `<div class="payslip"><div class="prow"><span>Giá</span><span>${yen(price)}</span></div><div class="prow"><span>Phí môi giới, thuế đăng ký, 司法書士</span><span>${yen(fees)}</span></div><div class="prow net"><span>Tổng</span><span>${yen(price + fees)}</span></div></div>
      <p class="dim">${esc(AGENT.loan)}</p>
      ${offer.ok ? `<p>🏦 Ngân hàng cho vay tối đa <b>${yen(loanAmt)}</b>${loanAmt < price * 0.9 ? ' (giới hạn 7 lần thu nhập năm)' : ' (90% giá nhà)'}, lãi ${(offer.rate * 100).toFixed(1)}%/năm, 35 năm → góp <b>${yen(offer.installment)}</b>/tháng. Phần tự trả (頭金) + phí: <b>${yen(down)}</b>.</p>` : `<p class="dim">🏦 Không vay được: ${esc(offer.why)}</p>`}`,
    choices: [
      { label: `💴 Trả hết bằng tiền mặt · ${yen(price + fees)}`, value: 'cash', disabled: cash < price + fees, reason: `Thiếu ${yen(price + fees - cash)}` },
      { label: `🏦 Vay mua nhà (住宅ローン) · tự trả ${yen(down)}`, value: 'loan', disabled: !offer.ok || cash < down, reason: offer.ok ? `Thiếu ${yen(down - cash)} tiền tự trả` : 'Không đủ điều kiện vay' },
      { label: '← Thôi', value: null, cancel: true },
    ],
  });
  if (!v) return false;
  if (v === 'loan') takeMortgage(S, loanAmt, offer, what);
  pay(S, price + fees, 'rent', `Mua ${what}`);
  return true;
}
async function buyUnitFlow(S) {
  const list = Object.keys(BUILDINGS).filter((b) => BUILDINGS[b].map === 'jutaku' && BUILDINGS[b].price).flatMap((b) => unitsOf(b)).filter((u) => vacant(S, u.uid));
  if (!list.length) { await modal({ who: 'Bất động sản', text: 'Hiện không có căn hộ nào rao bán.' }); return; }
  const uid = await modal({
    who: 'Bất động sản Hikari', title: '🏢 Căn hộ đang bán (中古マンション)', wide: true, html: `<p class="dim">${esc(AGENT.buyUsed)}</p>`,
    choices: [...list.map((u) => ({ label: `🏢 ${BUILDINGS[u.bid].name} ${u.room} · ${u.type} · ${yen(unitPrice(S, u.uid))}`, sub: `Phí quản lý ~${yen(BUILDINGS[u.bid].rent * 0.2)}/tháng`, value: u.uid })), { label: '← Quay lại', value: null, cancel: true }],
  });
  if (!uid) return;
  const price = unitPrice(S, uid), { bid, room } = parseUnit(uid);
  if (!(await payFor(S, price, `${BUILDINGS[bid].name} ${room}`))) return;
  await moveTo(S, { unit: uid, own: true, value: price, fee: Math.round(BUILDINGS[bid].rent * 0.2), type: BUILDINGS[bid].type });
}
async function buyHouseFlow(S, lot) {
  const st = S.housing.lots[lot];
  if (!(await payFor(S, st.price, `nhà cũ ${lot.replace('lot', 'lô ')}`))) return;
  st.kind = 'player';
  syncLots(S);
  await moveTo(S, { lot, own: true, value: st.price, fee: PLAN[st.plan].fee, type: PLAN[st.plan].type });
}
async function landFlow(S, lot0) {
  const lands = Object.entries(S.housing.lots).filter(([, st]) => st.kind === 'land').map(([id]) => id);
  if (!lands.length) { await modal({ who: 'Bất động sản', text: 'Hiện không còn lô đất nào đang bán.' }); return; }
  const lot = lot0 || await modal({
    who: 'Bất động sản Hikari', title: '🌱 Đất đang bán (売地)', wide: true, html: `<p class="dim">${esc(AGENT.land)}</p>`,
    choices: [...lands.map((id) => ({ label: `🟫 ${id.replace('lot', 'Lô ')} · ${LOTS[id].area} m² · ${yen(LOTS[id].land)}`, value: id })), { label: '← Quay lại', value: null, cancel: true }],
  });
  if (!lot) return;
  const plan = await modal({
    who: 'Công ty xây dựng (工務店)', title: '📐 Chọn mẫu nhà', wide: true,
    choices: [...HOUSE_PLANS.map((p) => ({ label: `🏡 ${p.name} · ${p.jp}`, sub: `${esc(p.desc)} · xây ${yen(PLAN[p.id].cost)} · ${PLAN[p.id].days} ngày`, value: p.id })), { label: '← Quay lại', value: null, cancel: true }],
  });
  if (!plan) return;
  const total = LOTS[lot].land + PLAN[plan].cost;
  if (!(await payFor(S, total, `đất ${lot.replace('lot', 'lô ')} + nhà ${HOUSE_PLANS.find((p) => p.id === plan).name}`))) return;
  const st = S.housing.lots[lot];
  Object.assign(st, { kind: 'building', plan, doneDay: S.day + PLAN[plan].days, value: total });
  syncLots(S);
  addLog(S, `Mua đất ${lot}, khởi công nhà`);
  await modal({ who: 'Công ty xây dựng (工務店)', title: '🏗️ Khởi công!', text: `Hồ sơ xin phép xây dựng (建築確認) đã được duyệt. Lễ động thổ (地鎮祭) diễn ra buổi sáng, thầy cúng của đền Hikari làm lễ cầu an. Dự kiến bàn giao sau <b>${PLAN[plan].days} ngày</b> (ngày ${st.doneDay}).<br><span class="dim">Ghé xem công trình ở khu Hikari-dai bất cứ lúc nào.</span>` });
}

// ---------- hợp đồng nhà của tôi ----------
async function myHome(S) {
  const h = S.home, with_ = livingWith(S);
  const building = Object.entries((S.housing && S.housing.lots) || {}).filter(([, st]) => st.kind === 'building');
  const v = await modal({
    who: 'Nhà của tôi', title: `🏠 ${homeName(S)}`,
    html: `<div class="payslip">${h ? `<div class="prow"><span>Hình thức</span><span>${h.own ? 'Nhà sở hữu' : `Thuê · ${yen(h.rent)}/tháng`}</span></div><div class="prow"><span>Loại</span><span>${esc(TYPE_NAME[h.type] || h.type || '')}</span></div><div class="prow"><span>Ở từ</span><span>ngày ${h.since}</span></div>${h.own ? `<div class="prow"><span>Giá trị ước tính</span><span>${yen(h.value || 0)}</span></div><div class="prow"><span>Phí quản lý / thuế nhà đất</span><span>${yen(h.fee || 0)}/tháng</span></div>` : ''}<div class="prow"><span>Sống cùng</span><span>${with_.length ? with_.map((id) => esc(PEOPLE[id].name)).join(', ') : 'một mình'}</span></div>` : '<div class="dim">Bạn đang ở ký túc xá công ty.</div>'}
      ${building.map(([id, st]) => `<div class="prow"><span>🏗️ Đang xây ${id.replace('lot', 'lô ')}</span><span>xong ngày ${st.doneDay} (còn ${Math.max(0, st.doneDay - S.day)} ngày)</span></div>`).join('')}</div>`,
    choices: [
      ...(h && S.love && !with_.includes(S.love.id) ? [{ label: `💞 Rủ ${esc(PEOPLE[S.love.id].name)} về ở cùng`, value: 'movein' }] : []),
      ...(h && !h.own ? [{ label: '📦 Trả nhà (解約) · về ký túc xá', sub: 'Hoàn cọc trừ phí vệ sinh ¥30,000', value: 'leave', disabled: !!with_.length, reason: 'Đang sống cùng người khác — chuyển sang nhà mới thay vì trả nhà' }] : []),
      ...(h && h.own ? [{ label: `💴 Bán nhà · khoảng ${yen(Math.round((h.value || 0) * (h.lot ? 0.85 : 0.9)))}`, value: 'sell', disabled: !!with_.length, reason: 'Đang sống cùng người khác' }] : []),
      { label: '← Đóng', value: null, cancel: true },
    ],
  });
  if (v === 'movein') await offerMoveIn(S, S.love.id);
  if (v === 'leave' || v === 'sell') {
    const ok = await modal({ title: v === 'sell' ? 'Bán nhà?' : 'Trả nhà?', text: 'Bạn sẽ về lại ký túc xá công ty.', choices: [{ label: 'Đồng ý', value: true }, { label: 'Thôi', value: false, cancel: true }] });
    if (!ok) return;
    if (v === 'sell') {
      const got = Math.round((h.value || 0) * (h.lot ? 0.85 : 0.9));
      deposit(S, got, 'rent', `Bán ${homeName(S)}`);
      const m = S.fin.debts.find((d) => d.status === 'active' && d.kind === 'mortgage');
      if (m) { const owe = m.balance; S.fin.bank -= Math.min(S.fin.bank, owe); m.balance = 0; m.status = 'paid'; }
      if (h.lot) { S.housing.lots[h.lot] = { kind: 'used', plan: S.housing.lots[h.lot].plan || 'family', price: Math.round(got * 1.08) }; }
    } else if (h.deposit) deposit(S, Math.max(0, h.deposit - 30000), 'rent', 'Hoàn tiền cọc (敷金)');
    S.home = null;
    syncLots(S); applyHomes(S);
    addLog(S, 'Về lại ký túc xá');
    toast('📦 Đã dọn về ký túc xá');
  }
}

// ---------- bấm vào lô đất / nhà riêng trên bản đồ ----------
buildingHooks.lot = async (S, lot) => {
  const st = S.housing.lots[lot] || {};
  if (st.kind === 'player') { sfx('door'); return enterBuilding(lot); }
  if (st.kind === 'npc') { await modal({ title: `🏡 Nhà ${esc(st.family)}`, text: `Biển tên 「${esc(st.family)}」 trên cổng. Một gia đình người Nhật sống ở đây — xe đạp trẻ con dựng trước hiên, chậu cây cảnh ngay ngắn.<br><span class="dim">Nhà riêng của người khác: không tự ý vào.</span>` }); return; }
  if (st.kind === 'building') { await modal({ title: '🏗️ Công trình nhà của bạn', text: `Thợ đang dựng khung gỗ, lưới che phủ kín. Dự kiến bàn giao ngày ${st.doneDay} (còn ${Math.max(0, st.doneDay - S.day)} ngày).` }); return; }
  if (st.kind === 'used') {
    const v = await modal({ title: '🏡 Nhà cũ đang bán (中古住宅)', text: `${esc(pick1(LISTING_NOTES.house))}<br>Giá rao: <b>${yen(st.price)}</b> · ${LOTS[lot].area} m².`, choices: [{ label: '💴 Hỏi mua (liên hệ Bất động sản)', value: true }, { label: 'Xem thôi', value: false, cancel: true }] });
    if (v) await buyHouseFlow(S, lot);
    return;
  }
  const v = await modal({ title: '🟫 Đất bán (売地)', text: `Lô ${lot.replace('lot', '')} · ${LOTS[lot].area} m² · giá <b>${yen(LOTS[lot].land)}</b>. Biển ghi: 「売地 · 建築条件なし · お問い合わせ: ひかり不動産」.`, choices: [{ label: '🌱 Mua đất & xây nhà', value: true }, { label: 'Xem thôi', value: false, cancel: true }] });
  if (v) await landFlow(S, lot);
};

// ---------- địa điểm: văn phòng bất động sản + nhà của bạn ----------
addPlaces({
  fudosan: {
    name: 'Bất động sản Hikari', jp: '不動産',
    closed: (S) => (S.time < H(10) || S.time >= H(19) ? 'Văn phòng mở 10:00 – 19:00.' : null),
    desc: () => esc(AGENT.intro),
    actions: (S) => {
      ensureHousing(S);
      const lots = S.housing.lots;
      return [
        { label: '🔑 Thuê nhà (賃貸)', sub: 'Căn hộ trống: Aoba (nhận người nước ngoài), Midori Court mới xây…', minutes: 20, run: rentFlow },
        { label: '🏢 Mua căn hộ cũ (中古マンション)', minutes: 20, run: buyUnitFlow },
        ...(Object.values(lots).some((x) => x.kind === 'used') ? [{ label: '🏡 Mua nhà cũ (中古住宅)', minutes: 20, run: (s) => buyHouseFlow(s, Object.keys(lots).find((k) => lots[k].kind === 'used')) }] : []),
        { label: '🌱 Mua đất & xây nhà (注文住宅)', minutes: 20, run: (s) => landFlow(s) },
        { label: '📋 Nhà của tôi / hợp đồng', run: myHome },
        { label: '❓ Hỏi về chi phí, bảo lãnh, vay mua nhà', minutes: 10, run: async () => { await modal({ who: 'Bất động sản Hikari', title: '❓ Hỏi đáp', html: `<p>${esc(AGENT.initialCost)}</p><p>${esc(AGENT.guarantor)}</p><p>${esc(AGENT.loan)}</p>` }); } },
      ];
    },
  },
  myhome: {
    name: (S) => homeName(S), jp: 'わが家',
    desc: (S) => { const w = livingWith(S).filter((id) => stateOf(S, id).place === PEOPLE[id].home); return `Nhà của bạn. Bây giờ là ${clockStr(S.time)}.${w.length ? ` Ở nhà có: ${w.map((id) => esc(PEOPLE[id].name)).join(', ')}.` : ''}`; },
    actions: (S) => {
      const atHome = livingWith(S).filter((id) => stateOf(S, id).place === PEOPLE[id].home && stateOf(S, id).act !== 'sleep');
      const a = [
        { label: '😴 Đi ngủ', sub: 'Ngủ đến sáng mai · lưu game', run: async (s) => { if (s.time < H(19)) { const ok = await modal({ title: 'Ngủ luôn bây giờ?', text: `Mới ${clockStr(s.time)}.`, choices: [{ label: 'Ngủ', value: true }, { label: 'Thôi', value: false, cancel: true }] }); if (!ok) return; } const { sleep } = await import('./days.js'); await sleep(s); return 'leave'; } },
        { label: '💤 Chợp mắt 1 tiếng', minutes: 60, fx: { energy: 16, mood: 1 }, cond: (s) => (s.energy >= 60 ? 'Chưa mệt lắm (năng lượng ≥ 60)' : null), res: 'Ngủ một giấc ngắn trên giường nhà mình — dễ chịu hơn hẳn ký túc xá.' },
        { label: '🍳 Nấu ăn', sub: `Còn ${S.inv.ingredients} phần nguyên liệu`, minutes: 40, fx: { full: 45, mood: 5, health: 1, cook: 1.5 }, cond: (s) => (s.inv.ingredients <= 0 ? 'Hết nguyên liệu — mua ở siêu thị' : s.full >= 85 ? 'Đang no' : null), after: (s) => { s.inv.ingredients--; }, res: 'Bếp nhà mình rộng rãi, nấu gì cũng ngon hơn.' },
        { label: '📱 Gọi video về nhà', minutes: 30, fx: (s) => ({ mood: s.today.call ? 3 : 10 }), after: (s) => { s.today.call = true; fam(s).lastCall = s.day; famGain(s, 2); }, res: 'Bố mẹ xem bạn đi một vòng quanh nhà mới qua điện thoại, cứ khen mãi.' },
        { label: '📖 Tự học tiếng Nhật', sub: '3 câu · 60 phút', minutes: 0, energy: 10, run: async (s) => { const { studyJapanese } = await import('./quiz.js'); const r = await studyJapanese(s, 3, { title: 'Tự học · Câu', mult: 1.1 }); advance(s, 60); applyFx(s, { energy: -8 }); toast(`📖 ${r.ok}/3 câu đúng`); } },
        { label: '🛁 Tắm bồn (お風呂)', minutes: 30, fx: { stress: -6, mood: 4, health: 1 }, res: 'Ngâm mình trong bồn nước nóng 41°C — kiểu thư giãn rất Nhật.' },
        { label: '📺 Xem TV, nghỉ ngơi', minutes: 60, fx: { mood: 3, stress: -3, energy: 4 }, res: 'Chương trình tạp kỹ ồn ào, bạn hiểu được kha khá câu đùa.' },
        { label: '🏠 Nhà của tôi', sub: 'Hợp đồng, sống chung, trả / bán nhà', run: myHome },
      ];
      for (const id of atHome) {
        const d = PEOPLE[id];
        a.push({ label: `🍲 Ăn tối cùng ${d.name}`, minutes: 60, cond: (s) => (s.time < H(17) ? 'Đợi tới bữa tối' : s.today['dine' + id] ? 'Tối nay ăn cùng rồi' : null), after: (s) => { s.today['dine' + id] = true; gain(s, id, 3); }, fx: { full: 45, mood: 8, stress: -4 }, res: `Hai người nấu chung, vừa ăn vừa kể chuyện cả ngày. ${d.name} gắp cho bạn miếng ngon nhất.` });
        a.push({ label: `🛋️ Xem phim cùng ${d.name}`, minutes: 120, cond: (s) => (s.time < H(18) ? 'Buổi tối mới rảnh' : null), after: (s) => { gain(s, id, 2); P(s, id).att = clamp((P(s, id).att || 0) + 2); }, fx: { mood: 6, stress: -5 }, res: `Hai người cuộn chăn trên sofa xem phim. Nửa phim thì ${d.name} ngủ gục lên vai bạn.` });
      }
      if (S.love && !livingWith(S).includes(S.love.id)) a.push({ label: `💞 Mời ${PEOPLE[S.love.id].name} về ở chung`, run: (s) => offerMoveIn(s, s.love.id) });
      return a;
    },
  },
});

// ---------- theo ngày ----------
bus.on('day:start', 7, (S, ctx) => {
  ensureHousing(S);
  // công trình xây xong
  for (const [id, st] of Object.entries(S.housing.lots)) if (st.kind === 'building' && S.day >= st.doneDay) { st.kind = 'player'; st.ready = true; ctx.housingDone = id; }
  if (ctx.housingDone) syncLots(S);
  // sống chung: tình cảm giữ ấm
  const w = livingWith(S);
  if (S.love && w.includes(S.love.id)) { S.love.lastDate = S.day; gain(S, S.love.id, 0.5); }
  // nhắc khai báo chuyển nhà
  if (S.flags.tenkyo && S.day === S.flags.tenkyo) ctx.msgs.push('📌 Hôm nay hết hạn khai báo chuyển nhà (転居届) — ghé 🏛️ Tòa thị chính nhé.');
}, 'nhà ở: công trình, sống chung');
bus.on('morning', 45, async (S, ctx) => {
  const lot = ctx.housingDone;
  if (!lot) return null;
  const st = S.housing.lots[lot];
  const v = await modal({ who: 'Công ty xây dựng (工務店)', title: '🔑 Bàn giao nhà mới (引き渡し)', text: pick1(AGENT.houseDone), choices: [{ label: '🏡 Chuyển vào ở ngay', value: true, primary: true }, { label: 'Để sau', value: false }] });
  if (v) { await moveTo(S, { lot, own: true, value: st.value, fee: PLAN[st.plan].fee, type: PLAN[st.plan].type }); placeHome(S); }
  return 'stop';
}, 'bàn giao nhà mới');

export { rentFlow, buyUnitFlow, landFlow, myHome, offerMoveIn, relocate };
