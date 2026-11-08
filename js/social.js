// Quan hệ: làm quen, nói chuyện, tặng quà, rủ đi chơi, quyền lợi theo mức thân thiết.
import { applyFx, advance, addLog, clamp, yen, MIDNIGHT, isWorkday, dow } from './state.js';
import { PEOPLE, GIFTS, STAGES } from './content/people.js';
import { PHRASES, LONG_TIPS } from './data.js';
import { modal, chips, toast, esc } from './ui.js';
import { pickQuestion, answer } from './learning.js';
import { ask } from './quiz.js';
import { sfx } from './audio.js';
import { pay } from './finance.js';
import { stateOf, moodToday, moodInfo, adjustMood, npcsAt } from './ai/sim.js';
import { willTalk, moodGain, acceptInvite, reasons, dayRoll, chanceWord } from './ai/rules.js';
import { hackOn } from './hackflag.js';
// Chế độ hack: hiện xác suất chính xác
export const hackPct = (S, p) => (hackOn(S) ? `<br><span class="hackpct">🛠️ Xác suất đồng ý: ${Math.round(p * 100)}%</span>` : '');
const isPartnerId = (S, id) => !!(S.love && S.love.id === id);
import { chatTopic, inviteDate, firstImpression, isBirthday, addAtt, heartsHtml, yamadaBeat } from './dating.js';

export { PEOPLE };
// Cho phép module khác (romance.js) gắn thêm lựa chọn vào menu từng người
export const hooks = { extra: null };
export function P(S, id) {
  S.npc = S.npc || {};
  if (!S.npc[id]) S.npc[id] = { aff: 0, met: false, last: 0, talked: 0 };
  return S.npc[id];
}
export const stageIdx = (aff) => (aff >= 70 ? 3 : aff >= 40 ? 2 : aff >= 15 ? 1 : 0);
export const stageName = (aff) => STAGES[stageIdx(aff)].name;
// Đã đạt mức thân thiết st (0..3) với người id?
export const atLeast = (S, id, st) => !!(S.npc && S.npc[id] && S.npc[id].met && stageIdx(S.npc[id].aff) >= st);
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
  if (d.traits) await firstImpression(S, id);
}

// Làm lại cùng một việc với cùng một người trong ngày: hiệu quả giảm dần, quá nhiều thì người ta thấy phiền.
// Người yêu / rất thân chịu được nhiều hơn. Trả về hệ số (1, 0.5, 0.25…) hoặc -1 nếu đã phiền.
export function repeatMult(S, p, key, close = false) {
  const r = p.rep || (p.rep = {});
  if (!r[key] || r[key].d !== S.day) r[key] = { d: S.day, n: 0 };
  const n = r[key].n++;
  const steps = close || stageIdx(p.aff) >= 3 ? [1, 0.75, 0.5, 0.35, 0.25] : [1, 0.5, 0.25];
  return n < steps.length ? steps[n] : -1;
}
export function repeatNote(S, p, key) {
  const r = p.rep && p.rep[key];
  const n = r && r.d === S.day ? r.n : 0;
  return n ? ` · lần ${n + 1} hôm nay — hiệu quả giảm dần` : '';
}

// Nói chuyện. Với người Nhật: có 1 câu tiếng Nhật lồng trong hội thoại.
// Không giới hạn số lần, nhưng nói nhiều trong một ngày thì hiệu quả giảm dần.
export async function talkTo(S, id) {
  const d = PEOPLE[id], p = P(S, id);
  if (!p.met) await meet(S, id);
  const st = stageIdx(p.aff);
  // tâm trạng hôm nay quyết định có muốn nói chuyện không (kết quả nhất quán trong ngày)
  const mood = d.traits ? moodToday(S, id) : 60;
  const mi = d.traits ? moodInfo(S, id) : { icon: '🙂', name: 'Bình thường' };
  const act = d.traits ? stateOf(S, id).act : '';
  const pTalk = d.traits ? willTalk(d.traits, mood) * (act === 'work' ? 0.75 : 1) : 1;
  if (d.traits && dayRoll(S, id, 'talk') > pTalk) {
    advance(S, 3);
    await modal({ who: `${d.name} · ${mi.icon} ${mi.name}`, title: `💬 ${d.name}`, text: `${esc(d.name)} trả lời cụt lủn rồi quay đi. Hôm nay có vẻ không có tâm trạng nói chuyện.<br><span class="dim">Vì sao: ${esc(reasons({ tr: d.traits, aff: p.aff, mood, act }))}. Thử tặng quà nhỏ, hoặc gặp lại lúc người ấy vui hơn.</span>${hackPct(S, pTalk)}` });
    return;
  }
  const k = repeatMult(S, p, 'talk', isPartnerId(S, id));
  if (k < 0) {
    gain(S, id, -1);
    await modal({ who: `${d.name} · ${mi.icon} ${mi.name}`, title: `💬 ${d.name}`, text: `${esc(d.name)} cười gượng: ${d.jp ? '「今日はもうたくさん話したね…」' : '"Hôm nay mình nói chuyện nhiều lắm rồi…"'} Có vẻ hơi phiền rồi — để mai nhé.`, html: chips([['aff', -1]]) });
    return;
  }
  p.talked = S.day;
  advance(S, 15);
  let v = 3, extra = '';
  const fx = { mood: 2 };
  if (d.jp) {
    const q = pickQuestion(S.lang);
    const ok = await ask(q, { who: `${d.name} hỏi bạn`, title: d.lines[st] });
    answer(S.lang, q, ok, { mult: 0.8 });
    if (ok) { v = 5; extra = 'Bạn trả lời trôi chảy, câu chuyện rôm rả hẳn lên.'; } else { v = 2; extra = `Bạn lúng túng… (đáp án: ${esc(q.opts[q.a])})`; }
  } else extra = d.lines[st];
  // quyền lợi riêng (chỉ lần nói chuyện đầu trong ngày)
  const first = k >= 1;
  if (first && id === 'kimura' && st >= 2) { S.skill[S.job] = (S.skill[S.job] || 0) + 1; extra += '<br>🛠️ Anh chỉ bạn một mẹo nghề: tay nghề +1.'; }
  if (first && id === 'mai' && st >= 2) fx.jp = 1;
  if (first && id === 'long') extra += `<br>💡 "${esc(LONG_TIPS[(p.aff + S.day) % LONG_TIPS.length])}"`;
  if (first && id === 'sato') {
    S.lang.phrases = S.lang.phrases || [];
    const next = PHRASES.find((x) => !S.lang.phrases.includes(x.id)) || PHRASES[S.day % PHRASES.length];
    if (!S.lang.phrases.includes(next.id)) S.lang.phrases.push(next.id);
    extra += `<br>👵 Bà dạy bạn: <b>${esc(next.jp)}</b> (<i>${esc(next.ro)}</i>) — ${esc(next.vi)}`;
    fx.jp = (fx.jp || 0) + 1;
  }
  v = Math.max(1, Math.round(v * (d.traits ? moodGain(mood) : 1) * k));
  if (!first) extra += `<br><span class="dim">(Lần nói chuyện thứ ${p.rep.talk.n} hôm nay — thân thiết tăng ít hơn.)</span>`;
  if (d.traits) adjustMood(S, id, 3);
  const up = gain(S, id, v);
  const out = applyFx(S, fx);
  out.push(['aff', v]);
  await modal({ who: `${d.name} · ${stageName(p.aff)} · ${mi.icon} ${mi.name}`, title: `💬 ${d.name}`, text: extra, html: chips(out) + affBar(p.aff) });
  if (up) await stageUp(S, id, up);
  if (id === 'yamada') await yamadaBeat(S);
}

// Lời từ chối khớp nguyên nhân thật
export function refuseLine(S, id, act) {
  const d = PEOPLE[id], p = P(S, id), mood = d.traits ? moodToday(S, id) : 50;
  if (act === 'work') return '"Mình đang làm, hôm khác nhé!"';
  if (act === 'sleep') return '"(ngái ngủ)… Mai nói chuyện nhé…"';
  if (S.love && S.love.id !== id && (p.att || 0) >= 40 && d.traits && d.traits.jea > 0.5) return '"Bạn có người yêu rồi mà… mình không muốn bị hiểu lầm."';
  if (mood < 25) return '"Hôm nay mình buồn lắm, muốn ở một mình…"';
  if (mood < 40) return '"Hôm nay mình đang bực mấy chuyện, để dịp khác nha."';
  if (p.aff < 15) return '"Ơ… mình mới quen nhau thôi mà. Để lần sau nhé."';
  if (d.traits && d.traits.ext < 0.35) return '"Mình thích ở nhà hơn… hôm khác nhé."';
  return '"Hôm nay mình có hẹn trước rồi, xin lỗi nha."';
}

export function affBar(aff) {
  return `<div class="pbar aff"><i style="width:${aff}%"></i></div><div class="dim">Thân thiết ${Math.round(aff)}/100 · ${stageName(aff)}</div>`;
}

export async function giveGift(S, id) {
  const d = PEOPLE[id];
  // kiểm tra trước khi trả tiền: người Nhật ngại nhận quà liên tục (phải đáp lễ — お返し)
  if (P(S, id).gift === S.day) { await modal({ who: d.name, text: `${esc(d.name)} ngại ngùng xua tay: "Hôm nay nhận rồi mà…"<br><span class="dim">Ở Nhật, nhận quà là phải nghĩ tới chuyện đáp lễ (お返し) — tặng dồn dập khiến người ta khó xử. Mỗi ngày một món là đủ.</span>` }); return; }
  const v = await modal({
    who: d.name, title: `🎁 Tặng quà cho ${d.name}`,
    choices: [
      ...Object.entries(GIFTS).map(([gid, g]) => ({ label: `${g.name} · ${yen(g.cost)}${hackOn(S) && d.likes.includes(gid) ? ' ⭐' : ''}`, value: gid, disabled: S.money < g.cost, reason: 'Không đủ tiền' })),
      ...(S.inv.plush ? [{ label: '🧸 Gấu bông gắp được ở game center', sub: `Còn ${S.inv.plush} con`, value: 'plush' }] : []),
      { label: 'Thôi', value: null, cancel: true },
    ],
  });
  if (!v) return;
  const g = v === 'plush' ? { name: 'Gấu bông', cost: 0 } : GIFTS[v];
  if (v === 'plush') S.inv.plush--; else pay(S, g.cost, 'gift', `Quà cho ${d.name}`);
  const p = P(S, id);
  p.gift = S.day;
  const bday = d.traits && isBirthday(S, id);
  const like = d.likes.includes(v) || (v === 'plush' && d.traits && d.traits.agr > 0.5);
  const v2 = (like ? 9 : 3) * (bday ? 2 : 1);
  const up = gain(S, id, v2);
  const da = like ? addAtt(S, id, bday ? 6 : 3) : 0;
  sfx(like ? 'good' : 'tap');
  await modal({ who: d.name, title: like ? '😊 Rất thích!' : '🙂 Cảm ơn nhé', text: `${bday ? '🎂 Đúng sinh nhật! ' : ''}${like ? `${d.name} vui ra mặt: 「わあ、ありがとう！」` : `${d.name} lịch sự nhận quà.`}`, html: chips([...(g.cost ? [['money', -g.cost]] : []), ['aff', v2], ...(da ? [['att', da]] : [])]) + affBar(p.aff) });
  if (up) await stageUp(S, id, up);
}

export async function invite(S, id) {
  const d = PEOPLE[id];
  const cost = 2000;
  if (S.money < cost) { toast('Không đủ tiền đi ăn'); return; }
  if (S.time + 120 > MIDNIGHT) { toast('Khuya quá rồi'); return; }
  if (d.traits) {
    const st0 = stateOf(S, id);
    const pAcc = acceptInvite(d.traits, P(S, id).aff, moodToday(S, id), st0.act === 'work' || st0.act === 'sleep');
    if (dayRoll(S, id, 'invite') > pAcc) {
      await modal({ who: d.name, title: '🙏 Từ chối', text: `${esc(d.name)}: ${refuseLine(S, id, st0.act)}<br><span class="dim">Vì sao: ${esc(reasons({ tr: d.traits, aff: P(S, id).aff, mood: moodToday(S, id), act: st0.act }))}</span>${hackPct(S, pAcc)}` });
      return;
    }
  }
  pay(S, cost, 'social', `Đi ăn với ${d.name}`);
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
  const talkP = d.traits && p.met ? willTalk(d.traits, moodToday(S, id)) * (stateOf(S, id).act === 'work' ? 0.75 : 1) : 1;
  const a = [{ label: `💬 Nói chuyện với ${d.name}`, sub: p.met ? `${stageName(p.aff)} · ${Math.round(p.aff)}/100${d.traits ? ` · khả năng muốn nói chuyện: ${hackOn(S) ? Math.round(talkP * 100) + '%' : chanceWord(talkP)}` : ''}${repeatNote(S, p, 'talk')}` : esc(d.role), minutes: 15, run: (s) => talkTo(s, id) }];
  if (p.met) a.push({ label: `🎁 Tặng quà ${d.name}`, sub: p.gift === S.day ? 'Hôm nay đã tặng rồi — người Nhật ngại nhận quà dồn dập' : '', run: (s) => giveGift(s, id) });
  if (p.met && d.traits) {
    a.push({ label: '🗨️ Trò chuyện theo chủ đề', sub: `Tìm hiểu sở thích${repeatNote(S, p, 'chat')}`, minutes: 15, run: (s) => chatTopic(s, id) });
    a.push({ label: `📅 Rủ ${d.name} đi chơi`, sub: 'Cà phê, xem phim, karaoke, công viên, ăn tối…', cond: (s) => (stageIdx(P(s, id).aff) < 1 && (P(s, id).att || 0) < 40 ? 'Chưa đủ thân (cần quen biết, hoặc có chút rung động)' : null), run: (s) => inviteDate(s, id) });
  }
  if (hooks.extra) a.push(...hooks.extra(S, id));
  return a;
}

// Giảm thân thiết khi lâu không liên lạc (gọi mỗi ngày)
export function socialDaily(S) {
  for (const p of Object.values(S.npc || {})) {
    if (!p.met) continue;
    const gap = S.day - (p.last || 0);
    if (gap > 14 && gap % 3 === 0 && p.aff > 15) p.aff = Math.max(15, p.aff - 2);
  }
}

// Ai có mặt ở đâu do bộ quy luật AI quyết định (ai/sim.js)
export const isAt = (S, id, place) => !!PEOPLE[id] && !!PEOPLE[id].traits && stateOf(S, id).place === place && stateOf(S, id).act !== 'sleep';
const H = (h) => h * 60;
export const AVAIL_OLD = {
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
  return npcsAt(S, place).filter((id) => stateOf(S, id).act !== 'sleep').slice(0, 6).flatMap((id) => personActions(S, id).slice(0, 1));
}

export function friendsCount(S, st = 2) {
  return Object.keys(PEOPLE).filter((id) => atLeast(S, id, st)).length;
}
