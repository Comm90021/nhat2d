// 🏛️ Cơ quan nhà nước + 💒 hội trường cưới (v3.7), ở dãy phía nam phố Kawabata.
// Tòa thị chính: 住民票, 転居届, 婚姻届 / tuyên thệ đối tác, khai sinh + 児童手当, thuế cư trú.
// Xuất nhập cảnh: đổi visa vợ/chồng, xin vĩnh trú, tái nhập cảnh. Hello Work: tìm việc, trợ cấp thất nghiệp, đào tạo nghề.
// Hội trường cưới: 3 mức lễ, khách mời là người quen, phong bì ご祝儀, tình huống ngẫu nhiên.
import { yen, addLog, applyFx, advance, isWorkday, clamp } from './state.js';
import { modal, chips, toast, esc } from './ui.js';
import { pay, deposit, earn } from './finance.js';
import { CITYHALL, IMMIGRATION, HELLOWORK } from './content/gov_text.js';
import { WEDDING_TIERS, WEDDING_EVENTS, GUEST_LINES } from './content/wedding_text.js';
import { addPlaces } from './places.js';
import { PEOPLE, P, gain, stageIdx } from './social.js';
import { VISAS, setVisa, applyPR } from './career.js';
import { canSpouseVisa, partner, isMarried } from './romance.js';
import { famGain } from './family.js';
import { openJobs, employed, monthlyPay } from './jobs.js';
import { bus } from './bus.js';
import { sfx } from './audio.js';
import { hackOn } from './hackflag.js';
import { dayRoll } from './ai/rules.js';

const H = (h, m = 0) => h * 60 + m;
const pick1 = (a) => a[Math.floor(Math.random() * a.length)];
const say = (o) => `<p>${esc(o.text)}</p><p class="dim">💡 ${esc(o.note)}</p>`;
// giờ hành chính: ngày thường (trừ lễ) 8:30–17:15
const officeClosed = (a, b, name) => (S) => (!isWorkday(S) ? `${name} nghỉ thứ Bảy, Chủ Nhật và ngày lễ.` : S.time < a || S.time >= b ? `${name} làm việc ${Math.floor(a / 60)}:${String(a % 60).padStart(2, '0')} – ${Math.floor(b / 60)}:${String(b % 60).padStart(2, '0')} ngày thường.` : null);

// ---------- đăng ký kết hôn (婚姻届) / tuyên thệ đối tác ----------
export async function registerMarriage(S) {
  const d = partner(S);
  const same = d.gender === S.gender;
  await modal({ who: same ? CITYHALL.partnership.title : CITYHALL.marriage.title, title: same ? '🌈 Tuyên thệ đối tác' : '💍 Nộp 婚姻届', html: say(same ? CITYHALL.partnership : CITYHALL.marriage) });
  advance(S, 60);
  S.love.stage = 'married';
  S.love.married = S.day;
  S.love.partnership = same;
  famGain(S, 12);
  addLog(S, `${same ? 'Tuyên thệ đối tác' : 'Đăng ký kết hôn'} với ${d.name}`);
  sfx('end');
  const myVisa = VISAS[S.career.visa];
  let note;
  if (same) note = 'Nhật Bản chưa công nhận hôn nhân đồng giới trên toàn quốc. Giấy tuyên thệ đối tác được công nhận ở nhiều thủ tục địa phương (thuê nhà chung, thăm bệnh…) nhưng <b>không có visa vợ/chồng</b>.';
  else if (d.jp) note = 'Kết hôn với người Nhật: bạn có thể xin đổi sang <b>visa vợ/chồng người Nhật</b> ở 🛂 Văn phòng Xuất nhập cảnh (cùng dãy phố). Visa này không giới hạn ngành nghề.';
  else if (!myVisa.family) note = `Visa <b>${esc(myVisa.short)}</b> của bạn không được bảo lãnh gia đình. Hai người vẫn có visa riêng; nếu có con, bé chỉ ở Nhật được khi một trong hai có visa cho phép bảo lãnh.`;
  else note = 'Visa của bạn cho phép bảo lãnh gia đình — sau này có con, bé có thể sống cùng bạn ở Nhật.';
  const out = applyFx(S, { mood: 25 });
  await modal({ who: 'Cột mốc', title: `💒 ${same ? 'Đối tác chính thức' : 'Vợ chồng hợp pháp'} với ${d.name}!`, text: `Cán bộ hộ tịch đóng dấu tiếp nhận: 「おめでとうございます」.<br>${note}${!S.love.wedding ? '<br><span class="dim">Muốn làm đám cưới? Ghé 💒 Hội trường cưới Hoshizora ngay cạnh.</span>' : ''}`, html: chips(out) });
}

// ---------- đám cưới ----------
const TIER = { register: { cost: 0, max: 0 }, small: { cost: 350000, max: 12 }, full: { cost: 3000000, max: 40 } };
export async function weddingFlow(S) {
  const d = partner(S);
  const guests = Object.keys(S.npc || {}).filter((id) => id !== S.love.id && PEOPLE[id] && S.npc[id].met && S.npc[id].aff >= 30).sort((a, b) => S.npc[b].aff - S.npc[a].aff);
  const tier = await modal({
    who: 'Hội trường cưới Hoshizora', title: `💒 Đám cưới của bạn và ${esc(d.name)}`, wide: true,
    text: `Người quen có thể mời: <b>${guests.length}</b> người. Khách người Nhật thường mừng phong bì ご祝儀 khoảng 3 vạn yên, người Việt tùy tình cảm.`,
    choices: [
      ...Object.entries(WEDDING_TIERS).map(([k, t]) => ({ label: `${k === 'register' ? '📜' : k === 'small' ? '🥂' : '💒'} ${t.name} (${t.jp})${TIER[k].cost ? ` · ${yen(TIER[k].cost)}` : ' · miễn phí'}`, sub: `${esc(t.desc)}${TIER[k].max ? ` · tối đa ${TIER[k].max} khách` : ''}`, value: k, disabled: S.money < TIER[k].cost, reason: 'Không đủ tiền' })),
      { label: '← Để sau', value: null, cancel: true },
    ],
  });
  if (!tier) return;
  const T = WEDDING_TIERS[tier], cost = TIER[tier].cost;
  const invited = guests.slice(0, TIER[tier].max);
  const guestTxt = invited.length ? invited.slice(0, 6).map((id) => PEOPLE[id].name).join(', ') + (invited.length > 6 ? ` và ${invited.length - 6} người khác` : '') : 'vài người bạn';
  const fill = (s) => String(s).replace(/\{me\}/g, S.name).replace(/\{p\}/g, d.name).replace(/\{guests\}/g, guestTxt);
  if (cost) pay(S, cost, 'wedding', `Đám cưới (${T.name})`);
  advance(S, tier === 'full' ? 360 : tier === 'small' ? 240 : 60);
  let mood = 0;
  const evs = [...WEDDING_EVENTS].sort(() => Math.random() - 0.5).slice(0, tier === 'full' ? 2 : tier === 'small' ? 1 : 0);
  for (let i = 0; i < T.scenes.length; i++) {
    const sc = T.scenes[i];
    await modal({ who: `${T.name} · ${i + 1}/${T.scenes.length}`, title: fill(sc.title), text: esc(fill(sc.text)) });
    const e = evs.shift();
    if (e && i < T.scenes.length - 1) {
      const best = hackOn(S) ? e.choices.reduce((b, c, j) => (c[2] > e.choices[b][2] ? j : b), 0) : -1;
      const j = await modal({ who: 'Tình huống', text: esc(fill(e.text)), choices: e.choices.map((c, k) => ({ label: esc(fill(c[0])) + (k === best ? ' ⭐' : ''), value: k })) });
      mood += e.choices[j][2] * 3;
      await modal({ who: 'Tình huống', text: esc(fill(e.choices[j][1])) });
    }
  }
  // lời chúc + ご祝儀
  let gifts = 0;
  if (tier !== 'register') {
    for (const id of invited) { gain(S, id, 3); gifts += PEOPLE[id].jp ? (tier === 'full' ? 30000 : 10000) : (tier === 'full' ? 20000 : 5000); }
    if (gifts) earn(S, gifts, 'wedding', 'Tiền mừng cưới (ご祝儀)');
    const lines = [...GUEST_LINES].sort(() => Math.random() - 0.5).slice(0, 3).map((l) => `<li>${esc(l)}</li>`).join('');
    await modal({ who: 'Lời chúc', title: '🎊 Khách mời chúc mừng', html: `<ul class="log">${lines}</ul>` });
  }
  S.love.wedding = { tier, day: S.day, guests: invited.length };
  gain(S, S.love.id, 10);
  famGain(S, tier === 'full' ? 15 : 8);
  addLog(S, `Đám cưới với ${d.name} (${T.name})`);
  sfx('end');
  const out = applyFx(S, { mood: 20 + mood, stress: -15 });
  await modal({ who: 'Cột mốc', title: '💒 Hạnh phúc!', text: `${cost ? `Chi phí ${yen(cost)}. ` : ''}${gifts ? `Tiền mừng nhận được: ${yen(gifts)}. ` : ''}${S.love.stage !== 'married' ? '<br>📜 Nhớ nộp 婚姻届 ở 🏛️ Tòa thị chính để hôn nhân có giá trị pháp lý.' : ''}`, html: chips([...(cost ? [['money', -cost]] : []), ...(gifts ? [['money', gifts]] : []), ...out]) });
}

// ---------- trợ cấp ----------
const kidsInJp = (S) => (S.kids || []).filter((k) => k.where === 'jp');
bus.on('month:end', 17, (S, ctx) => {
  // 児童手当: 1 vạn yên / bé / tháng (đơn giản hóa)
  if (S.flags.jidou && kidsInJp(S).length) { const a = 10000 * kidsInJp(S).length; deposit(S, a, 'salary', 'Trợ cấp nuôi con (児童手当)'); ctx.msgs.push(`👶 Nhận trợ cấp nuôi con (児童手当): ${yen(a)}.`); }
  // 失業手当: tối đa 3 tháng khi chưa có việc
  const U = S.unemp;
  if (U && U.left > 0) {
    if (employed(S)) { S.unemp = null; }
    else { deposit(S, U.amount, 'salary', 'Trợ cấp thất nghiệp (基本手当)'); U.left--; ctx.msgs.push(`💴 Trợ cấp thất nghiệp: ${yen(U.amount)} (còn ${U.left} tháng).`); }
  }
}, 'trợ cấp: nuôi con, thất nghiệp');

// ---------- địa điểm ----------
addPlaces({
  cityhall: {
    name: 'Tòa thị chính Hikari', jp: '市役所',
    closed: officeClosed(H(8, 30), H(17, 15), 'Tòa thị chính'),
    desc: () => esc(CITYHALL.intro.text),
    actions: (S) => {
      const L = S.love;
      const unregKids = (S.kids || []).filter((k) => !k.registered);
      return [
        { label: '📄 Xin phiếu cư trú (住民票)', cost: 300, minutes: 20, res: () => `${esc(CITYHALL.juminhyo.text)}<br><span class="dim">💡 ${esc(CITYHALL.juminhyo.note)}</span>` },
        { label: '🏠 Khai báo chuyển nhà (転居届)', minutes: 30, cond: (s) => (s.flags.tenkyo ? null : 'Bạn chưa chuyển nhà gần đây'), after: (s) => { if (s.day > s.flags.tenkyo) applyFx(s, { rep: -1 }); s.flags.tenkyo = null; s.flags.address = s.day; }, res: () => `${esc(CITYHALL.move.text)}<br><span class="dim">💡 ${esc(CITYHALL.move.note)}</span>` },
        ...(L && L.stage !== 'married' ? [{
          label: PEOPLE[L.id].gender === S.gender ? '🌈 Tuyên thệ đối tác (パートナーシップ宣誓)' : '💍 Nộp đăng ký kết hôn (婚姻届)',
          sub: L.stage === 'engaged' ? `Cùng ${PEOPLE[L.id].name} · cần 2 người làm chứng` : 'Cần đính hôn trước (cầu hôn ở menu người yêu)',
          cond: (s) => (s.love.stage !== 'engaged' ? 'Hai người chưa đính hôn' : null),
          run: registerMarriage,
        }] : []),
        ...(unregKids.length ? [{ label: '👶 Khai sinh + đăng ký trợ cấp nuôi con', sub: '出生届 · 児童手当', minutes: 60, run: async (s) => { for (const k of unregKids) k.registered = true; s.flags.jidou = true; advance(s, 60); await modal({ who: CITYHALL.birth.title, title: '👶 Khai sinh', html: say(CITYHALL.birth) + say(CITYHALL.childAllowance) }); } }] : []),
        ...(S.kids && S.kids.length && !S.flags.jidou ? [{ label: '💴 Đăng ký trợ cấp nuôi con (児童手当)', minutes: 30, after: (s) => { s.flags.jidou = true; }, res: () => `${esc(CITYHALL.childAllowance.text)}<br><span class="dim">💡 ${esc(CITYHALL.childAllowance.note)}</span>` }] : []),
        { label: '🧾 Hỏi về thuế cư trú (住民税)', minutes: 15, res: () => `${esc(CITYHALL.tax.text)}<br><span class="dim">💡 ${esc(CITYHALL.tax.note)}</span>` },
      ];
    },
  },
  immigration: {
    name: 'Văn phòng Xuất nhập cảnh', jp: '出入国在留管理局 出張所',
    closed: officeClosed(H(9), H(16), 'Văn phòng Xuất nhập cảnh'),
    desc: () => esc(IMMIGRATION.intro.text),
    actions: (S) => [
      ...(canSpouseVisa(S) ? [{ label: '📄 Đổi sang visa vợ/chồng người Nhật', sub: '日本人の配偶者等 · lệ phí ¥6,000', cost: 6000, minutes: 180, run: async (s) => { pay(s, 6000, 'other', 'Lệ phí đổi visa'); advance(s, 180); await modal({ who: IMMIGRATION.spouse.title, title: IMMIGRATION.spouse.title, html: say(IMMIGRATION.spouse) }); setVisa(s, 'spouse', 3); await modal({ title: '🛂 Visa vợ/chồng người Nhật', text: 'Hồ sơ được chấp thuận. Visa này không giới hạn ngành nghề, gia hạn 1–3 năm một lần, và sau 3 năm kết hôn có thể xin thường trú.' }); } }] : []),
      ...(['ssw2', 'spouse', 'eng'].includes(S.career.visa) ? [{ label: '📄 Nộp hồ sơ xin vĩnh trú (永住)', sub: 'Lệ phí ¥10,000 · xét điều kiện', minutes: 180, run: async (s) => { await modal({ who: IMMIGRATION.pr.title, title: IMMIGRATION.pr.title, html: say(IMMIGRATION.pr) }); advance(s, 180); await applyPR(s); } }] : []),
      { label: '🔁 Hỏi về gia hạn tư cách lưu trú', minutes: 15, res: () => `${esc(IMMIGRATION.renew.text)}<br><span class="dim">💡 ${esc(IMMIGRATION.renew.note)}</span>` },
      { label: '🔀 Hỏi về đổi tư cách lưu trú', minutes: 15, res: () => `${esc(IMMIGRATION.change.text)}<br><span class="dim">💡 ${esc(IMMIGRATION.change.note)}</span>` },
      { label: '✈️ Hướng dẫn tái nhập cảnh (về nước tạm thời)', minutes: 10, res: () => `${esc(IMMIGRATION.reentry.text)}<br><span class="dim">💡 ${esc(IMMIGRATION.reentry.note)}</span>` },
    ],
  },
  hellowork: {
    name: 'Hello Work Hikari', jp: 'ハローワーク',
    closed: officeClosed(H(8, 30), H(17, 15), 'Hello Work'),
    desc: (S) => `${esc(HELLOWORK.intro.text)}${S.unemp ? `<br>💴 Đang nhận trợ cấp thất nghiệp: ${yen(S.unemp.amount)}/tháng, còn ${S.unemp.left} tháng.` : ''}`,
    actions: (S) => [
      { label: '🔎 Tra cứu & tìm việc', sub: 'Có giấy giới thiệu (紹介状) của Hello Work', minutes: 30, run: async (s) => { advance(s, 30); s.today.hwRef = true; await openJobs(s); } },
      { label: '💴 Đăng ký nhận trợ cấp thất nghiệp (失業手当)', sub: 'Khi đã nghỉ việc và từng đóng bảo hiểm việc làm', minutes: 60,
        cond: (s) => (employed(s) ? 'Bạn đang có việc làm' : s.unemp ? 'Đã đăng ký rồi' : (s.stats.shifts || 0) < 30 ? 'Chưa đóng bảo hiểm việc làm đủ lâu (cần ~6 tháng làm việc)' : null),
        run: async (s) => { const amount = Math.round(monthlyPay(s) * 0.6 / 1000) * 1000; s.unemp = { amount, left: 3, since: s.day }; advance(s, 60); await modal({ who: HELLOWORK.benefit.title, title: '💴 Trợ cấp thất nghiệp', html: say(HELLOWORK.benefit) + `<p>Bạn sẽ nhận <b>${yen(amount)}</b>/tháng, tối đa 3 tháng, chừng nào còn chưa có việc mới.</p>` }); } },
      { label: '📚 Học khóa đào tạo nghề miễn phí (3 tiếng)', sub: 'Kỹ năng · trí tuệ', minutes: 180, energy: 15, fx: { int: 1.5, stress: 2, energy: -10 }, after: (s) => { s.skill[s.job] = (s.skill[s.job] || 0) + 2; }, res: () => `${esc(HELLOWORK.training.text)}<br><span class="dim">💡 ${esc(HELLOWORK.training.note)}</span><br>🛠️ Tay nghề +2.` },
    ],
  },
  wedding: {
    name: 'Hội trường cưới Hoshizora', jp: '結婚式場',
    closed: (S) => (S.time < H(10) || S.time >= H(20) ? 'Hội trường mở 10:00 – 20:00.' : null),
    desc: (S) => (S.love ? `Phòng tư vấn cưới trang trí hoa trắng. ${S.love.wedding ? 'Hai bạn đã tổ chức đám cưới ở đây.' : 'Nhân viên tươi cười: 「ご結婚おめでとうございます！」'}` : 'Nhà nguyện trắng, sảnh tiệc lấp lánh. Cuối tuần nào cũng có một đám cưới.'),
    actions: (S) => [
      ...(S.love && (S.love.stage === 'engaged' || S.love.stage === 'married') && !S.love.wedding ? [{ label: `💒 Đặt đám cưới với ${PEOPLE[S.love.id].name}`, sub: 'Chọn mức lễ, mời người quen', run: weddingFlow }] : []),
      ...(S.love && S.love.stage === 'dating' ? [{ label: '💍 Tư vấn cưới', sub: 'Cần đính hôn trước', minutes: 20, fx: { mood: 3 }, res: 'Nhân viên cho xem album váy cưới, thực đơn tiệc. Hai bạn nhìn nhau cười ngượng.' }] : []),
      { label: '⛪ Ngắm nhà nguyện', minutes: 20, fx: { mood: 3 }, res: 'Ánh nắng xuyên qua ô kính màu, rải lên lối đi trải thảm trắng.' },
    ],
  },
});

