// Gia đình ở quê: mức hài lòng, áp lực gửi tiền, chuyện phát sinh, về thăm nhà. Con cái: chi phí, nơi sống.
import { applyFx, addLog, clamp, yen, doy, year, YEAR_DAYS } from './state.js';
import { modal, chips, esc } from './ui.js';
import { sfx } from './audio.js';
import { pay } from './finance.js';

export function fam(S) {
  if (!S.family) S.family = { sat: 60, lastRemit: 0, lastCall: 0, visits: 0, events: {} };
  return S.family;
}
export const famText = (v) => (v >= 80 ? 'Rất tự hào về bạn' : v >= 60 ? 'Hài lòng' : v >= 40 ? 'Lo lắng' : v >= 20 ? 'Không vui' : 'Căng thẳng');
export function famGain(S, v) { const f = fam(S); f.sat = clamp(f.sat + v); }

// Sự kiện gia đình (sáng Chủ Nhật – ngày lĩnh lương, hoặc ngẫu nhiên)
const FAM_EVENTS = [
  {
    id: 'dadSick', cond: (S) => S.day > 45, once: false, gap: 180,
    title: '🏥 Bố ốm phải nằm viện', text: 'Mẹ gọi điện, giọng run run: bố bị ngã khi đi làm đồng, phải mổ. Viện phí khoảng 60.000¥.',
    choices: [
      { label: 'Gửi ngay 60.000¥', need: 60000, run: (S) => { pay(S, 60000, 'family', 'Viện phí cho bố'); famGain(S, 15); return { text: 'Bố mổ thành công. Mẹ bảo "May có con". Bạn thở phào.', fx: { mood: 4 } }; } },
      { label: 'Gửi 20.000¥, hẹn gửi thêm sau', need: 20000, run: (S) => { pay(S, 20000, 'family', 'Gửi tiền viện phí'); famGain(S, 3); return { text: 'Nhà phải vay thêm họ hàng. Bạn áy náy.', fx: { mood: -6 } }; } },
      { label: 'Không có tiền', run: (S) => { famGain(S, -10); return { text: 'Bạn chỉ biết gọi điện an ủi. Đêm đó bạn không ngủ được.', fx: { mood: -15 } }; } },
    ],
  },
  {
    id: 'house', cond: (S) => S.debt <= 0, once: true,
    title: '🏠 Nhà muốn xây nhà mới', text: 'Hết nợ rồi, bố mẹ bàn chuyện xây lại căn nhà cấp bốn. "Con gửi về góp được bao nhiêu thì góp."',
    choices: [
      { label: 'Hứa mỗi tháng gửi đều đặn', run: (S) => { S.flags.houseFund = true; famGain(S, 12); return { text: 'Bố mẹ vui lắm. Từ giờ gửi tiền về sẽ được tính vào quỹ xây nhà.', fx: { mood: 3 } }; } },
      { label: 'Nói thật: con muốn để dành cho tương lai của mình', run: (S) => { famGain(S, -6); return { text: 'Bố im lặng. Mẹ bảo "Ừ, con lớn rồi". Bạn thấy nhẹ lòng mà cũng hơi buồn.', fx: { mood: -2 } }; } },
    ],
  },
  {
    id: 'marryPressure', cond: (S) => year(S) >= 3 && !(S.love && S.love.stage === 'married'), once: false, gap: 112,
    title: '💬 "Bao giờ lấy vợ/lấy chồng?"', text: 'Cả họ gọi video dịp giỗ. Bác cả hỏi: "Đi Nhật mấy năm rồi, bao giờ cưới? Bằng tuổi mày người ta con bế con bồng cả rồi."',
    choices: [
      { label: 'Cười trừ cho qua', run: (S) => { famGain(S, -2); return { text: 'Câu hỏi muôn thuở của mỗi dịp họp họ.', fx: { mood: -4 } }; } },
      { label: 'Nói thẳng: con tự quyết chuyện của mình', run: (S) => { famGain(S, -6); return { text: 'Không khí hơi căng, nhưng bạn thấy nhẹ nhõm vì đã nói ra.', fx: { mood: 2 } }; } },
    ],
  },
  {
    id: 'sibling', cond: (S) => S.day > 90, once: true,
    title: '🎓 Em đỗ đại học', text: 'Em nhắn tin: "Em đỗ đại học rồi! Nhưng học phí năm đầu hơi cao…" Khoảng 40.000¥.',
    choices: [
      { label: 'Lo học phí năm đầu cho em', need: 40000, run: (S) => { pay(S, 40000, 'family', 'Học phí cho em'); famGain(S, 15); return { text: 'Em hứa sẽ học thật giỏi. Bạn thấy những năm vất vả có ý nghĩa.', fx: { mood: 10 } }; } },
      { label: 'Động viên em vay vốn sinh viên', run: (S) => { famGain(S, -3); return { text: 'Em hơi buồn nhưng hiểu cho bạn.', fx: { mood: -3 } }; } },
    ],
  },
];

export async function familyWeekly(S) {
  const f = fam(S);
  const msgs = [];
  if (S.day - (f.lastRemit || 0) > 14) { f.sat = clamp(f.sat - 4); msgs.push('📞 Mẹ nhắn: "Dạo này con có khó khăn gì không? Lâu rồi không thấy con gửi tiền…" (gia đình −4)'); }
  if (S.day - (f.lastCall || 0) > 14) { f.sat = clamp(f.sat - 2); msgs.push('📵 Lâu rồi bạn chưa gọi về nhà (gia đình −2).'); }
  // con cái
  for (const k of S.kids || []) {
    const cost = k.where === 'jp' ? 35000 : 15000;
    pay(S, cost, 'child', k.where === 'jp' ? `Nuôi bé ${k.name}` : `Gửi tiền nuôi bé ${k.name}`);
    msgs.push(k.where === 'jp' ? `👶 Chi phí nuôi bé ${esc(k.name)} (nhà trẻ, sữa, tã): −${yen(cost)}` : `👶 Gửi tiền nuôi bé ${esc(k.name)} ở quê với ông bà: −${yen(cost)}`);
  }
  // sự kiện gia đình
  const pool = FAM_EVENTS.filter((e) => (!e.once || !f.events[e.id]) && (!e.gap || !f.events[e.id] || S.day - f.events[e.id] > e.gap) && e.cond(S));
  if (pool.length && Math.random() < 0.3) {
    const e = pool[Math.floor(Math.random() * pool.length)];
    f.events[e.id] = S.day;
    return { msgs, event: e };
  }
  return { msgs, event: null };
}

export async function runFamilyEvent(S, e) {
  const i = await modal({
    who: 'Gia đình ở quê', title: e.title, text: e.text,
    choices: e.choices.map((c, k) => ({ label: c.label, value: k, disabled: !!(c.need && S.money < c.need), reason: 'Không đủ tiền' })),
  });
  const r = e.choices[i].run(S);
  const out = applyFx(S, r.fx);
  addLog(S, `${e.title}: ${e.choices[i].label}`);
  await modal({ text: r.text, html: chips(out) + `<p class="dim">Gia đình: ${famText(fam(S).sat)} (${Math.round(fam(S).sat)}/100)</p>` });
}

// Về thăm nhà dịp Tết Việt Nam (tháng 1–2: doy 66–75) hoặc Obon (tháng 8: doy 31–35)
export function canVisitHome(S) {
  const d = doy(S);
  return ((d >= 66 && d <= 75) || (d >= 31 && d <= 35)) && fam(S).visitYear !== `${year(S)}-${d >= 66 ? 't' : 'h'}`;
}
export async function visitHome(S) {
  const d = doy(S), cost = d >= 66 ? 90000 : 70000;
  const ok = await modal({
    who: '一時帰国', title: `✈️ Về thăm nhà dịp ${d >= 66 ? 'Tết' : 'hè'}`,
    text: `Vé máy bay và quà cáp khoảng <b>${yen(cost)}</b>. Bạn xin nghỉ phép có lương (有給休暇) khoảng 10 ngày (3 ngày trong game).`,
    choices: [{ label: 'Về!', value: true, disabled: S.money < cost, reason: 'Không đủ tiền' }, { label: 'Thôi, để dịp khác', value: false, cancel: true }],
  });
  if (!ok) return false;
  const f = fam(S);
  f.visitYear = `${year(S)}-${d >= 66 ? 't' : 'h'}`;
  f.visits++;
  pay(S, cost, 'travel', 'Về thăm nhà');
  famGain(S, 20);
  f.lastCall = S.day + 3;
  for (const k of S.kids || []) if (k.where === 'vn') k.seen = S.day;
  addLog(S, 'Về thăm nhà');
  sfx('end');
  const kidTxt = (S.kids || []).some((k) => k.where === 'vn') ? ' Đứa con ở quê lúc đầu còn ngại, đến hôm về thì ôm chặt không cho đi.' : '';
  await modal({ who: 'Quê nhà', title: '🏡 Về đến nhà', text: `Mẹ nấu cả mâm cơm, bố khoe với hàng xóm "con tôi đi Nhật về". Mấy ngày ngắn ngủi trôi qua thật nhanh.${kidTxt}`, html: chips([['money', -cost]]) });
  // nghỉ phép: tua 2 ngày
  S.day += 2;
  S.today = { noWork: true };
  S.time = 18 * 60;
  S.mood = Math.min(100, S.mood + 30);
  S.health = Math.min(100, S.health + 10);
  return true;
}

export function familyHtml(S) {
  const f = fam(S);
  const row = (a, b) => `<div class="prow"><span>${a}</span><span>${b}</span></div>`;
  const kids = (S.kids || []).map((k) => row(`👶 ${esc(k.name)}`, `${Math.floor((S.day - k.born) / YEAR_DAYS)} tuổi · ${k.where === 'jp' ? 'sống cùng bạn ở Nhật' : 'ở quê với ông bà'}`)).join('');
  return `<div class="payslip">${row('🏡 Gia đình ở quê', `${famText(f.sat)} (${Math.round(f.sat)}/100)`)}${row('✈️ Số lần về thăm', f.visits)}${kids}</div>`;
}
