// Nhà ở của NPC: hộ gia đình sinh theo quy luật (tuổi, tính cách, hạt ngẫu nhiên của save),
// gán vào từng căn hộ trong khu manshon / apato. Bấm chuông, hộp thư, vào nhà người quen.
import { rnd } from './ai/rules.js';
import { AI_PLACES, PEOPLE, ensureWorld, makeTraits, makeLook, makeLines, likesOf, pick, between } from './ai/world.js';
import { JP } from './content/names.js';
import { INTERIOR_OF } from './content/interiors.js';
import { BUILDINGS, unitsOf, unitDef, corridorDef, parseUnit, TYPE_NAME } from './content/units.js';
import { DYNAMIC } from './world/interior.js';
import { stateOf, moodToday, moodInfo, companionsText } from './ai/sim.js';
import { acceptInvite, dayRoll, reasons, chanceWord } from './ai/rules.js';
import { hackOn } from './hackflag.js';
import { modal, esc, chips } from './ui.js';
import { P, talkTo, gain, stageIdx } from './social.js';
import { advance, applyFx } from './state.js';
import { enterUnit } from './world/scene.js';

// ---------- đăng ký tòa nhà ----------
for (const bid of Object.keys(BUILDINGS)) {
  INTERIOR_OF[bid] = 'mansion:' + bid;
  const B = BUILDINGS[bid];
  AI_PLACES[bid] = { ...(AI_PLACES[bid] || {}), map: B.map, kind: 'home', interior: 'mansion:' + bid, name: B.name };
}
DYNAMIC.mansion = (bid) => corridorDef(bid);
let worldRef = null;   // S.world hiện tại (để dựng nội thất căn hộ theo người ở)
export let homesVer = 0;
DYNAMIC.unit = (uid) => {
  const ids = (worldRef && worldRef.units[uid]) || [];
  const owner = ids[0] && PEOPLE[ids[0]];
  const t = owner && owner.traits;
  // đồ trang trí theo tính cách chủ nhà
  const pickDecor = (i) => {
    if (!t) return 'plant';
    const opts = [t.opn > 0.55 ? 'books' : 'plant', t.ext > 0.5 ? 'tv' : 'books', owner.job && /it|electric/.test(owner.job.place) ? 'pc' : 'plant', owner.student ? 'desk' : 'tv', 'plant'];
    return opts[i % opts.length];
  };
  return unitDef(uid, owner ? plate(owner) : '', pickDecor);
};

// Tên trên biển cửa: họ (người Nhật) hoặc tên (người Việt)
export function plate(d) {
  if (!d) return '';
  if (d.gen && d.nat === 'jp') return d.fullName.split(' ')[0];
  return d.name.replace(/^(Chị|Anh|Bà|Ông|Cô|Chú) /, '').replace(/-san$/, '');
}

// ---------- sinh hộ gia đình ----------
// Hộ của NPC chính (bối cảnh viết tay); NPC sinh ngẫu nhiên thì theo quy luật tuổi.
const CORE_HH = {
  yamada: { spouse: { g: 'm', age: 49, given: 'Takeshi', job: 'parts' }, kids: [{ g: 'f', age: 16 }] },
  sato: { widow: true },
};
// Hoàn cảnh của chị Yamada sinh ngẫu nhiên theo từng save — trường hợp nào cũng có đường đến với chị.
export const YAMADA_VARIANT_P = [['cold', 0.4], ['away', 0.25], ['divorced', 0.25], ['widow', 0.1]];
export function yamadaVariant(seed, migrate = false) {
  let r = rnd(seed, 'yamada'), v = 'cold';
  for (const [k, p] of YAMADA_VARIANT_P) { if (r < p) { v = k; break; } r -= p; }
  // save cũ (chồng đã là NPC có thật): "đi xa" coi như "nguội lạnh", "góa" coi như "ly hôn"
  if (migrate) v = v === 'away' ? 'cold' : v === 'widow' ? 'divorced' : v;
  return v;
}
const YAMADA_NOTE = {
  cold: 'chồng con ở cùng nhưng hai vợ chồng gần như không nói chuyện',
  away: 'chồng đi làm xa ở Nagoya (単身赴任), mỗi năm về vài lần',
  divorced: 'đã ly hôn, sống cùng con gái',
  widow: 'chồng mất vì tai nạn đã nhiều năm, sống cùng con gái',
};
// Độ gắn bó hôn nhân (0..1) — thấp thì dễ nảy sinh tình cảm bên ngoài, dễ ly hôn
const bondOf = (seed, id) => Math.round((0.15 + rnd(seed, 'bond', id) * 0.8) * 100) / 100;
const SPOUSE_JOBS = ['parts', 'logistics', 'electric', 'it', 'super', 'clinic', 'care', null, null];

function marriedChance(d) {
  if (d.nat !== 'jp' || d.student || d.age < 26) return 0;
  return Math.min(0.8, (d.age - 26) * 0.035 + 0.05);
}

export function augmentWorld(S) {
  const W = S.world;
  if (W.hh && W.units) return;
  const seed = W.seed;
  W.hh = {}; W.units = {};
  const ids = Object.keys(PEOPLE).filter((k) => PEOPLE[k].traits).sort();
  let n = Object.keys(W.defs).length + 100;
  const households = [];
  for (const id of ids) {
    const d = PEOPLE[id];
    if (d.home === 'dorm') continue;
    if (W.hh[id]) continue; // đã là vợ/chồng của người khác
    const H = { members: [id], kids: [], who: d.nat === 'vn' ? 'vn' : 'single' };
    const core = CORE_HH[id];
    const yv = id === 'yamada' ? yamadaVariant(seed) : null;
    if (yv) { W.yamada = yv; H.note = YAMADA_NOTE[yv]; }
    const m = yv ? yv === 'cold' : core ? !!core.spouse : rnd(seed, 'hh', id) < marriedChance(d);
    if (core && core.widow) H.note = 'Ông nhà mất đã lâu, con cái ở Tokyo';
    if (yv && yv !== 'cold') {
      // không có chồng ở cùng: chỉ là thông tin gia đình
      H.kids = core.kids.map((k) => ({ ...k, born: S.day - k.age * 84 }));
      H.who = 'family';
      if (yv === 'away') { H.married = true; H.bond = 0.25; H.spouseAway = 'Takeshi (đi làm xa ở Nagoya)'; }
    }
    if (m) {
      // tạo vợ/chồng là NPC có lịch sinh hoạt riêng
      const sid = `g${n++}`, s = `${seed}:${sid}`;
      const g = core ? core.spouse.g : d.gender === 'm' ? 'f' : 'm';
      const age = core ? core.spouse.age : Math.max(24, d.age + between(-4, 4, s, 'a'));
      const sur = d.gen ? d.fullName.split(' ')[0] : plate(d);
      const given = core ? core.spouse.given : pick(JP[g], s, 'ten');
      const jobPlace = core ? core.spouse.job : pick(SPOUSE_JOBS, s, 'job');
      const job = jobPlace ? { place: jobPlace, shift: 0 } : null;
      const traits = makeTraits(s);
      const bio = { que: pick(JP.que, s, 'q'), hoanCanh: 'đã lập gia đình', soThich: pick(JP.soThich, s, 'st'), biMat: pick(JP.biMat, s, 'bm') };
      const sp = {
        id: sid, gen: true, spouseOf: id, name: `${given}-san`, fullName: `${sur} ${given}`, gender: g, age, jp: true, nat: 'jp',
        role: `${g === 'm' ? 'Chồng' : 'Vợ'} của ${d.name}${job ? ' · ' + AI_PLACES[job.place].name : ' · nội trợ'}`, group: 'Người trong thị trấn',
        look: makeLook('jp', g, age, s), traits, bio, home: 'home_jp', job, student: false, romance: false, orientation: 'hetero', likes: likesOf(traits),
        hobby: job ? null : { place: 'super', days: [0, 1, 2, 3, 4, 5], from: 10, to: 12, w: 2.2, act: 'shop' },
      };
      sp.intro = `${sp.fullName}, ${age} tuổi, ${g === 'm' ? 'chồng' : 'vợ'} của ${d.name}. Quê ở ${bio.que}, thích ${bio.soThich}.`;
      sp.lines = makeLines(sp);
      sp.perks = ['', '', 'Chia sẻ tin tức trong khu phố', ''];
      W.defs[sid] = sp; PEOPLE[sid] = sp;
      H.members.push(sid);
      H.married = true;
      H.bond = yv ? Math.round((0.1 + rnd(seed, 'ybond') * 0.2) * 100) / 100 : bondOf(seed, id);
      H.who = 'couple';
      // con cái (chỉ là thông tin gia đình, không phải nhân vật tương tác)
      const kids = core ? core.kids || [] : d.age >= 30 && d.age <= 60 && rnd(seed, 'kid', id) < 0.6
        ? Array.from({ length: rnd(seed, 'kid2', id) < 0.4 ? 2 : 1 }, (_, k) => ({ g: rnd(seed, 'kg', id, k) < 0.5 ? 'm' : 'f', age: Math.max(1, Math.min(d.age - 24, between(1, 22, seed, 'ka', id, k))) }))
        : [];
      H.kids = kids.map((k) => ({ ...k, born: S.day - k.age * 84 }));
      if (H.kids.some((k) => k.age < 23)) H.who = 'family';
    } else if (d.nat === 'vn' && d.age >= 27 && rnd(seed, 'vnm', id) < 0.35) {
      H.away = 'Vợ/chồng và con ở quê, mỗi tối gọi video';
    }
    for (const mid of H.members) W.hh[mid] = H;
    households.push(H);
  }
  // xếp hộ vào căn hộ: đơn thân → Hikari Heights, vợ chồng → Sakura, có con → Residence, người Việt → apato Minato
  const free = {};
  for (const bid of Object.keys(BUILDINGS)) free[bid] = unitsOf(bid).map((u) => u.uid);
  const PREF = { single: ['hikari', 'sakura', 'residence'], couple: ['sakura', 'residence', 'hikari'], family: ['residence', 'sakura'], vn: ['apt'] };
  const keepFree = { hikari: 3, sakura: 3, residence: 2, apt: 3 }; // chừa phòng trống cho người chơi thuê
  for (const H of households) {
    let uid = null;
    for (const bid of PREF[H.who]) if (free[bid].length > keepFree[bid]) { uid = free[bid].splice(Math.floor(rnd(seed, 'u', H.members[0]) * (free[bid].length - keepFree[bid])), 1)[0]; break; }
    if (!uid && H.who === 'vn') uid = Object.keys(W.units).find((u) => u.startsWith('apt-') && W.units[u].length === 1); // ở ghép 2 người
    if (!uid) for (const bid of PREF[H.who]) if (free[bid].length) { uid = free[bid].shift(); break; }
    if (!uid) continue;
    H.unit = uid;
    W.units[uid] = [...(W.units[uid] || []), ...H.members];
  }
  W.hhVer = 2;
  homesVer++;
}

// Save cũ (trước v3.6): thêm độ gắn bó hôn nhân + hoàn cảnh ngẫu nhiên của chị Yamada
function migrateHomes(S) {
  const W = S.world;
  if (W.hhVer >= 2) return;
  W.hhVer = 2;
  for (const [id, H] of Object.entries(W.hh)) if (H.married && H.bond == null) H.bond = bondOf(W.seed, H.members[0] || id);
  const v = yamadaVariant(W.seed, true);
  W.yamada = v;
  const H = W.hh.yamada;
  if (!H) return;
  H.note = YAMADA_NOTE[v];
  for (const m of H.members) if (W.hh[m]) W.hh[m].note = H.note;
  if (v === 'cold') { H.bond = 0.2; for (const m of H.members) if (W.hh[m]) W.hh[m].bond = 0.2; }
  else splitHousehold(S, 'yamada', { silent: true });
}

// Ly hôn: tách hộ. Vợ/chồng cũ chuyển sang phòng trống (ưu tiên Hikari Heights), con ở với người được chọn.
const freeUnits = (W, bid) => unitsOf(bid).map((u) => u.uid).filter((u) => !(W.units[u] && W.units[u].length));
export function splitHousehold(S, id, o = {}) {
  const W = S.world, d = PEOPLE[id], H = W.hh && W.hh[id];
  if (!H || !H.married) return null;
  const sid = H.members.find((m) => m !== id);
  H.married = false; delete H.bond; delete H.spouseAway;
  H.members = [id]; H.divorced = S.day;
  H.who = (H.kids || []).length ? 'family' : 'single';
  if (!o.silent || !H.note) H.note = `đã ly hôn${(H.kids || []).length ? ', sống cùng con' : ''}`;
  if (sid && PEOPLE[sid]) {
    const sp = PEOPLE[sid];
    if (H.unit && W.units[H.unit]) W.units[H.unit] = W.units[H.unit].filter((x) => x !== sid);
    const to = freeUnits(W, 'hikari')[0] || freeUnits(W, 'sakura')[0] || freeUnits(W, 'residence')[0] || null;
    // hết phòng trống trong khu → chuyển sang sống ở khu khác (vẫn đi làm như cũ)
    const H2 = { members: [sid], kids: [], who: 'single', note: to ? 'đã ly hôn, sống một mình' : 'đã ly hôn, chuyển sang sống ở khu khác', unit: to, divorced: S.day };
    W.hh[sid] = H2;
    if (to) W.units[to] = [sid];
    const role = `${sp.gender === 'm' ? 'Chồng cũ' : 'Vợ cũ'} của ${d.name}${sp.job ? ' · ' + AI_PLACES[sp.job.place].name : ''}`;
    for (const o of [sp, W.defs[sid]].filter(Boolean)) { o.role = role; o.exOf = id; delete o.spouseOf; if (!to) o.home = 'home_jp'; }
  }
  W.hh[id] = H;
  applyHomes(S);
  return sid;
}

// Đảm bảo thế giới + nhà ở (thay cho ensureWorld ở mọi nơi gọi)
export function ensureHomes(S) { const W = ensureWorld(S); augmentWorld(S); migrateHomes(S); applyHomes(S); return W; }

// Áp dụng nhà ở vào NPC (gọi mỗi lần đăng ký thế giới)
export function applyHomes(S) {
  const W = S.world;
  worldRef = W;
  for (const k of Object.keys(AI_PLACES)) if (k.startsWith('u:')) delete AI_PLACES[k];
  for (const [uid, members] of Object.entries(W.units || {})) {
    const { bid, room } = parseUnit(uid), B = BUILDINGS[bid];
    AI_PLACES['u:' + uid] = { map: B.map, kind: 'home', interior: 'unit:' + uid, name: `phòng ${room} ${B.name}`, building: bid };
    for (const id of members) if (PEOPLE[id]) PEOPLE[id].home = 'u:' + uid;
  }
  for (const [id, H] of Object.entries(W.hh || {})) {
    const d = PEOPLE[id];
    if (!d) continue;
    d.household = H;
    d.married = !!H.married;
    d.spouse = H.married ? H.members.find((m) => m !== id) || null : null;
  }
  // chị Yamada: chung thủy theo hoàn cảnh, yêu được cả nam lẫn nữ
  const y = PEOPLE.yamada;
  if (y && y.traits && W.yamada) {
    y.traits = { ...y.traits, loy: W.yamada === 'cold' || W.yamada === 'away' ? 0.4 : 0.85 };
    y.orientation = 'bi';
  }
  homesVer++;
}

export const residents = (S, uid) => ((S.world && S.world.units && S.world.units[uid]) || []).filter((id) => PEOPLE[id]);
export function unitLabel(S, uid) {
  const { room } = parseUnit(uid);
  if (S.home && S.home.unit === uid) return `🚪 ${room} · nhà bạn`;
  const r = residents(S, uid);
  return `🚪 ${room} · ${r.length ? plate(PEOPLE[r[0]]) : 'phòng trống'}`;
}
// Mô tả gia đình (hiện trong danh bạ)
export function familyText(S, id) {
  const d = PEOPLE[id], H = d && d.household;
  if (!H) return d && d.home === 'dorm' ? 'Ở ký túc xá' : '';
  const parts = [];
  if (H.married) parts.push(`đã kết hôn với ${esc(PEOPLE[d.spouse] ? PEOPLE[d.spouse].name : H.spouseAway || '…')}`);
  else if (!H.divorced && !H.note) parts.push('độc thân');
  for (const k of H.kids || []) { const age = Math.floor((S.day - k.born) / 84); parts.push(`${k.g === 'm' ? 'con trai' : 'con gái'} ${age} tuổi`); }
  if (H.away) parts.push(H.away.toLowerCase());
  if (H.note) parts.push(H.note.toLowerCase());
  const pl = AI_PLACES[d.home];
  return `${parts.join(', ')}${pl ? ` · sống ở ${pl.name}` : ''}`;
}

// ---------- hộp thư ở sảnh ----------
export async function mailbox(S, bid) {
  const B = BUILDINGS[bid];
  const rows = unitsOf(bid).reverse().map((u) => {
    const r = residents(S, u.uid);
    const isMet = (id) => !!(S.npc && S.npc[id] && S.npc[id].met);
    const met = r.filter(isMet), unmet = r.filter((id) => !isMet(id));
    const names = r.length
      ? [...met.map((id) => `<b>${esc(PEOPLE[id].name)}</b>`), unmet.length ? `${esc(plate(PEOPLE[unmet[0]]))}${unmet.length > 1 ? ` (${unmet.length} người)` : ''}` : ''].filter(Boolean).join(', ')
      : '<span class="dim">trống — đang cho thuê</span>';
    return `<div class="prow"><span>${u.room}</span><span>${names}</span></div>`;
  }).join('');
  await modal({ who: B.jp, title: `📬 Hộp thư · ${B.name}`, text: `Loại phòng: ${TYPE_NAME[B.type] || B.type} · tiền thuê khoảng ${B.rent.toLocaleString('en-US')}¥/tháng.`, html: `<div class="payslip">${rows}</div>` });
}

// ---------- bấm chuông ----------
export async function ringBell(S, uid) {
  const { room } = parseUnit(uid);
  if (S.home && S.home.unit === uid) { await enterUnit(uid); return; }
  const all = residents(S, uid);
  if (!all.length) { await modal({ title: `🚪 Phòng ${room}`, text: 'Cửa dán tờ 「入居者募集」 — phòng đang cho thuê. Muốn thuê thì hỏi văn phòng bất động sản (sẽ mở ở bản sau).' }); return; }
  const home = all.filter((id) => stateOf(S, id).place === 'u:' + uid);
  const awake = home.filter((id) => stateOf(S, id).act !== 'sleep');
  advance(S, 3);
  if (!home.length) { await modal({ title: `🔔 ピンポーン… (${room})`, text: 'Không ai ra mở cửa. Có vẻ cả nhà đi vắng.<br><span class="dim">Mẹo: 📱 → "Ai đang ở đâu?" để xem người quen đang ở đâu.</span>' }); return; }
  if (!awake.length) {
    const out = applyFx(S, { rep: -1 });
    await modal({ title: `🔔 ピンポーン… (${room})`, text: 'Đèn tắt, không ai trả lời — chắc mọi người đã ngủ. Ở Nhật, bấm chuông nhà người khác lúc khuya là rất bất lịch sự.', html: chips(out) });
    return;
  }
  // người ra mở cửa: người thân với bạn nhất trong nhà
  const host = [...awake].sort((a, b) => P(S, b).aff - P(S, a).aff)[0];
  const d = PEOPLE[host], p = P(S, host);
  const mi = moodInfo(S, host);
  if (!p.met) {
    await modal({ who: `インターホン · ${room}`, title: `🔔 「はい、どちら様ですか？」`, text: `${d.jp ? 'Một giọng người Nhật hỏi qua chuông cửa.' : 'Có tiếng người Việt: "Ai đấy ạ?"'} Bạn tự giới thiệu là người mới chuyển đến khu này…` });
    await talkTo(S, host);
    return;
  }
  const hour = S.time / 60;
  const lateish = hour >= 21 || hour < 8;
  const chance = acceptInvite(d.traits, p.aff, moodToday(S, host), false) * (lateish ? 0.25 : 1) * (stageIdx(p.aff) >= 1 ? 1 : 0.35);
  const inside = companionsText(S, host, 6);
  const v = await modal({
    who: `${d.name} · ${mi.icon} ${mi.name}`, title: `🔔 Phòng ${room}`,
    text: (d.jp ? `「あ、${esc(S.name)}さん！どうしたの？」` : `"Ơ, ${esc(S.name)} à? Có chuyện gì thế?"`)
      + `<br><span class="dim">🏠 Trong nhà: ${esc(d.name)}${inside ? `, ${esc(inside)}` : ' (ở nhà một mình)'} · khả năng được mời vào: ${hackOn(S) ? Math.round(chance * 100) + '%' : chanceWord(chance)}</span>`,
    choices: [
      { label: d.jp ? '「近くまで来たので、ちょっと寄ってみました」' : '"Mình qua chơi một chút được không?"', sub: 'Xin vào nhà chơi', value: 'in' },
      { label: '💬 Nói chuyện ở cửa', value: 'talk' },
      { label: 'Thôi, xin lỗi đã làm phiền', value: null, cancel: true },
    ],
  });
  if (!v) return;
  if (v === 'talk') { await talkTo(S, host); return; }
  if (dayRoll(S, host, 'bell') < chance) {
    gain(S, host, 2);
    const fam = inside ? ` Trong nhà còn có ${esc(inside)} — ai cũng chào bạn.` : '';
    let extra = '';
    if (host === 'yamada' && S.world.yamada) {
      const { YAMADA_VARIANTS } = await import('./content/yamada_routes.js');
      const Y = YAMADA_VARIANTS[S.world.yamada];
      if (Y) extra = `<br>${esc(Y.bell)}`;
    }
    await modal({ who: d.name, title: '🏠 「どうぞ、上がって」', text: `${esc(d.name)} mời bạn vào nhà, rót trà mời bạn.${fam}${extra}<br><span class="dim">Ở Nhật nhớ cởi giày ở genkan và nói 「お邪魔します」.</span>` });
    await enterUnit(uid);
  } else {
    await modal({ who: d.name, title: '🙏 「ごめんね、今ちょっと…」', text: `${lateish ? 'Muộn rồi, để hôm khác nhé.' : `${esc(d.name)} xin lỗi, giờ đang bận. Có thể lần sau, khi hai người thân hơn hoặc lúc ${esc(d.name)} vui vẻ hơn.`}<br><span class="dim">Vì sao: ${lateish ? 'đã khuya · ' : ''}${esc(reasons({ tr: d.traits, aff: p.aff, mood: moodToday(S, host) }))}</span>` });
  }
}
