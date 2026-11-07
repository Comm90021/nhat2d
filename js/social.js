// Quan hệ: làm quen, nói chuyện, tặng quà, rủ đi chơi, quyền lợi theo mức thân thiết.
import { applyFx, advance, addLog, clamp, yen, MIDNIGHT, isWorkday, dow } from './state.js';
import { PEOPLE, GIFTS, STAGES } from './content/people.js';
import { PHRASES, LONG_TIPS } from './data.js';
import { modal, chips, toast, esc } from './ui.js';
import { pickQuestion, answer } from './learning.js';
import { ask } from './quiz.js';
import { sfx } from './audio.js';

export { PEOPLE };
// Cho phép module khác (romance.js) gắn thêm lựa chọn vào menu từng người
export const hooks = { extra: null };
export function P(S, id) {
  S.people = S.people || {};
  if (!S.people[id]) S.people[id] = { aff: 0, met: false, last: 0, talked: 0 };
  return S.people[id];
}
export const stageIdx = (aff) => (aff >= 70 ? 3 : aff >= 40 ? 2 : aff >= 15 ? 1 : 0);
export const stageName = (aff) => STAGES[stageIdx(aff)].name;
// Đã đạt mức thân thiết st (0..3) với người id?
export const atLeast = (S, id, st) => !!(S.people && S.people[id] && S.people[id].met && stageIdx(S.people[id].aff) >= st);
export const anyAtLeast = (S, ids, st) => ids.some((id) => atLeast(S, id, st));

export function gain(S, id, v) {
  const p = P(S, id);
  const before = stageIdx(p.aff);
  p.aff = clamp(p.aff + v);
  p.last = S.day;
  const after = stageIdx(p.aff);
  return after > before ? after : null;
}

async function stageUp(S, id, st) {
  const d = PEOPLE[id];
  sfx('end');
  addLog(S, `${d.name}: ${STAGES[st].name}`);
  const perk = d.perks[st];
  await modal({ who: d.name, title: `💞 Mức quan hệ mới: ${STAGES[st].name}`, text: perk ? `Quyền lợi mới: <b>${esc(perk)}</b>` : 'Hai người đã thân hơn rồi đấy.' });
}

async function meet(S, id) {
  const d = PEOPLE[id], p = P(S, id);
  p.met = true;
  p.aff = Math.max(p.aff, 3);
  p.last = S.day;
  addLog(S, `Làm quen với ${d.name}`);
  await modal({ who: `${d.group} · Người mới`, title: `👋 Làm quen: ${d.name}`, text: `<b>${esc(d.role)}</b><br>${esc(d.intro)}` });
}

// Nói chuyện (mỗi người 1 lần/ngày). Với người Nhật: có 1 câu tiếng Nhật lồng trong hội thoại.
export async function talkTo(S, id) {
  const d = PEOPLE[id], p = P(S, id);
  if (!p.met) await meet(S, id);
  if (p.talked === S.day) { toast(`${d.name} đang bận, mai nói chuyện tiếp nhé.`); return; }
  p.talked = S.day;
  const st = stageIdx(p.aff);
  advance(S, 15);
  let v = 3, extra = '';
  const fx = { mood: 2 };
  if (d.jp) {
    const q = pickQuestion(S.lang);
    const ok = await ask(q, { who: `${d.name} hỏi bạn`, title: d.lines[st] });
    answer(S.lang, q, ok, { mult: 0.8 });
    if (ok) { v = 5; extra = 'Bạn trả lời trôi chảy, câu chuyện rôm rả hẳn lên.'; } else { v = 2; extra = `Bạn lúng túng… (đáp án: ${esc(q.opts[q.a])})`; }
  } else extra = d.lines[st];
  // quyền lợi riêng
  if (id === 'kimura' && st >= 2) { S.skill[S.job] = (S.skill[S.job] || 0) + 1; extra += '<br>🛠️ Anh chỉ bạn một mẹo nghề: tay nghề +1.'; }
  if (id === 'mai' && st >= 2) fx.jp = 1;
  if (id === 'long') extra += `<br>💡 "${esc(LONG_TIPS[(p.aff + S.day) % LONG_TIPS.length])}"`;
  if (id === 'sato') {
    S.learned = S.learned || [];
    const next = PHRASES.find((x) => !S.learned.includes(x.id)) || PHRASES[S.day % PHRASES.length];
    if (!S.learned.includes(next.id)) S.learned.push(next.id);
    extra += `<br>👵 Bà dạy bạn: <b>${esc(next.jp)}</b> (<i>${esc(next.ro)}</i>) — ${esc(next.vi)}`;
    fx.jp = (fx.jp || 0) + 1;
  }
  const up = gain(S, id, v);
  const out = applyFx(S, fx);
  out.push(['aff', v]);
  await modal({ who: `${d.name} · ${stageName(p.aff)}`, title: `💬 ${d.name}`, text: extra, html: chips(out) + affBar(p.aff) });
  if (up) await stageUp(S, id, up);
}

export function affBar(aff) {
  return `<div class="pbar aff"><i style="width:${aff}%"></i></div><div class="dim">Thân thiết ${Math.round(aff)}/100 · ${stageName(aff)}</div>`;
}

export async function giveGift(S, id) {
  const d = PEOPLE[id];
  const v = await modal({
    who: d.name, title: `🎁 Tặng quà cho ${d.name}`,
    choices: [
      ...Object.entries(GIFTS).map(([gid, g]) => ({ label: `${g.name} · ${yen(g.cost)}`, value: gid, disabled: S.money < g.cost, reason: 'Không đủ tiền' })),
      { label: 'Thôi', value: null, cancel: true },
    ],
  });
  if (!v) return;
  const g = GIFTS[v];
  S.money -= g.cost;
  const p = P(S, id);
  if (p.gift === S.day) { await modal({ text: `${d.name} ngại ngùng: "Hôm nay nhận rồi mà…"` }); return; }
  p.gift = S.day;
  const like = d.likes.includes(v);
  const up = gain(S, id, like ? 9 : 3);
  sfx(like ? 'good' : 'tap');
  await modal({ who: d.name, title: like ? '😊 Rất thích!' : '🙂 Cảm ơn nhé', text: like ? `${d.name} vui ra mặt: 「わあ、ありがとう！」` : `${d.name} lịch sự nhận quà.`, html: chips([['money', -g.cost], ['aff', like ? 9 : 3]]) + affBar(p.aff) });
  if (up) await stageUp(S, id, up);
}

export async function invite(S, id) {
  const d = PEOPLE[id];
  const cost = 2000;
  if (S.money < cost) { toast('Không đủ tiền đi ăn'); return; }
  if (S.time + 120 > MIDNIGHT) { toast('Khuya quá rồi'); return; }
  S.money -= cost;
  advance(S, 120);
  const up = gain(S, id, 7);
  const out = applyFx(S, { mood: 8, full: 40 });
  out.unshift(['money', -cost]);
  out.push(['aff', 7]);
  const where = d.jp ? 'quán ramen gần ga' : 'quán phở của người Việt ở thành phố bên';
  await modal({ who: d.name, title: `🍜 Đi ăn cùng ${d.name}`, text: `Hai người đi ${where}, nói chuyện đủ thứ trên đời.`, html: chips(out) + affBar(P(S, id).aff) });
  if (up) await stageUp(S, id, up);
}

// Các lựa chọn với một người (dùng trong menu địa điểm và danh bạ)
export function personActions(S, id) {
  const d = PEOPLE[id], p = P(S, id);
  const a = [{ label: `💬 Nói chuyện với ${d.name}`, sub: p.met ? `${stageName(p.aff)} · ${Math.round(p.aff)}/100` : esc(d.role), minutes: 15, cond: (s) => (P(s, id).talked === s.day ? 'Hôm nay đã nói chuyện rồi' : null), run: (s) => talkTo(s, id) }];
  if (p.met) a.push({ label: `🎁 Tặng quà ${d.name}`, run: (s) => giveGift(s, id) });
  if (p.met && stageIdx(p.aff) >= 1) a.push({ label: `🍜 Rủ ${d.name} đi ăn`, sub: '¥2,000 · 2 tiếng', cost: 0, minutes: 120, cond: (s) => (s.money < 2000 ? 'Không đủ tiền' : null), run: (s) => invite(s, id) });
  if (hooks.extra) a.push(...hooks.extra(S, id));
  return a;
}

// Giảm thân thiết khi lâu không liên lạc (gọi mỗi ngày)
export function socialDaily(S) {
  for (const p of Object.values(S.people || {})) {
    if (!p.met) continue;
    const gap = S.day - (p.last || 0);
    if (gap > 7 && gap % 3 === 0 && p.aff > 15) p.aff = Math.max(15, p.aff - 2);
  }
}

// Ai có mặt ở đâu, lúc nào
const H = (h) => h * 60;
export const AVAIL = {
  yamada: (S) => isWorkday(S) && S.time >= H(7) && S.time < H(18),
  ha: (S) => S.time >= H(18) || dow(S) >= 5,
  tuan: (S) => S.time >= H(18) && S.time < H(23),
  yui: (S) => (dow(S) >= 5 && S.time >= H(10) && S.time < H(17)) || (dow(S) === 2 && S.time >= H(18) && S.time < H(21)),
  kenta: (S) => dow(S) >= 5 && S.time >= H(10) && S.time < H(17),
  mai: (S) => dow(S) === 6 && S.time >= H(13) && S.time < H(17),
  daiki: (S) => dow(S) === 6 && S.time >= H(8) && S.time < H(12),
};
export const WHEN_TXT = {
  yamada: 'Ở chỗ làm, ngày thường 07:00–18:00',
  kimura: 'Góc đường trước chỗ làm, ngày thường 17:00–19:00',
  sato: 'Trước ký túc xá, 07:00–19:00',
  long: 'Gần konbini buổi tối; cuối tuần ở công viên',
  ha: 'Ký túc xá, buổi tối và cuối tuần',
  tuan: 'Konbini, 18:00–23:00',
  yui: 'Trung tâm giao lưu: cuối tuần 10–17h, tối thứ Tư',
  kenta: 'Trung tâm giao lưu: cuối tuần 10–17h',
  mai: 'Hội người Việt ở Trung tâm giao lưu: chiều Chủ Nhật',
  daiki: 'Công viên, sáng Chủ Nhật (đá bóng)',
};
export function peopleHere(S, place) {
  return Object.entries(PEOPLE)
    .filter(([id, d]) => d.place === place && AVAIL[id] && AVAIL[id](S))
    .flatMap(([id]) => personActions(S, id));
}

export function friendsCount(S, st = 2) {
  return Object.keys(PEOPLE).filter((id) => atLeast(S, id, st)).length;
}
