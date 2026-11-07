// Tương tác kiểu dating sim, chạy bằng quy luật (không viết sẵn kết quả cho từng nhân vật):
// - Sở thích ẩn của mỗi NPC (chủ đề, kiểu ứng xử, địa điểm) sinh từ tính cách + hạt ngẫu nhiên của save.
// - Trò chuyện theo chủ đề, rủ đi chơi ở địa điểm thật, sự kiện nhỏ khi hẹn hò.
// - 💗 Rung động (att) tách khỏi 💞 thân thiết (aff). Tỏ tình không cần chờ thời gian — chỉ cần hợp và đủ rung động.
// - Cử chỉ thân mật, qua đêm (nội dung 18+ chỉ chuyển cảnh, có công tắc, mặc định tắt), tuyến ngoại tình có rủi ro.
import { G, applyFx, advance, addLog, clamp, yen, MIDNIGHT, dow, seasonIdx, doy, ensureAttr } from './state.js';
import { modal, chips, toast, esc } from './ui.js';
import { PEOPLE, P, gain, stageIdx, stageName, affBar } from './social.js';
import { rnd } from './ai/rules.js';
import { acceptInvite } from './ai/rules.js';
import { stateOf, stateAtHour, moodToday, moodInfo, adjustMood } from './ai/sim.js';
import { AI_PLACES } from './ai/world.js';
import { TOPICS_A } from './content/talk_a.js';
import { TOPICS_B } from './content/talk_b.js';
import { DATES_A } from './content/dates_a.js';
import { DATES_B } from './content/dates_b.js';
import { pay } from './finance.js';
import { sfx } from './audio.js';
import { myPlace } from './jobs.js';

export const TOPICS = [...TOPICS_A, ...TOPICS_B];
export const DATES = { ...DATES_A, ...DATES_B };
const sig = (x) => 1 / (1 + Math.exp(-x));

// ---------- sở thích ẩn ----------
const TOPIC_W = {
  home: (t) => 0.1 + t.agr * 0.3, work: (t) => t.amb - 0.45, hobby: (t) => t.ext * 0.5 + t.opn * 0.3 - 0.3,
  family: (t) => t.agr - 0.35, food: (t) => t.spd * 0.5 - 0.05, season: (t) => 0.1 + t.con * 0.2, dream: (t) => t.amb + t.opn - 0.85,
  love: (t) => t.opn + t.ext - 1, worry: (t) => t.agr - 0.3 * t.neu - 0.25, joke: (t) => t.ext - 0.45, praise: (t) => 0.25 + 0.3 * t.neu,
  culture: (t) => t.opn - 0.3, money: (t) => t.spd + t.luck - 0.95, movie: (t) => t.opn * 0.5 + t.ext * 0.3 - 0.3,
};
const TONE_W = {
  sweet: (t) => t.agr + t.opn - 1, fun: (t) => t.ext - 0.5, deep: (t) => t.opn + t.con - 1.05,
  bold: (t) => t.ext + t.opn - t.con - 0.45, care: (t) => t.agr - 0.4, calm: (t) => t.con - t.ext * 0.5 - 0.1,
};
// địa điểm hẹn: nơi diễn ra, chi phí hai người, thời lượng, điều kiện
export const SPOTS = {
  park: { place: 'park', cost: 600, min: 90, w: (t) => t.agr - 0.3 },
  cafe: { place: 'cafe', cost: 1400, min: 90, w: (t) => t.opn - 0.3 },
  cinema: { place: 'cinema', cost: 4200, min: 150, from: 10, w: (t) => t.opn * 0.6 - 0.2 },
  karaoke: { place: 'karaoke', cost: 2600, min: 120, from: 12, w: (t) => t.ext - 0.45 },
  dinner: { place: 'izakaya', cost: 6000, min: 120, from: 17, w: (t) => t.spd - 0.35 },
  river: { place: 'river', cost: 0, min: 60, from: 16, w: (t) => t.agr + t.opn - 1.05 },
  hanami: { place: 'park', cost: 1600, min: 120, season: 0, w: (t) => 0.3 },
  matsuri: { place: 'park', cost: 3200, min: 150, season: 1, from: 17, w: (t) => t.ext * 0.6 },
  aquarium: { place: 'station', cost: 7600, min: 360, weekend: true, trip: true, w: (t) => t.opn - 0.2 },
  shopping: { place: 'mall', cost: 3000, min: 120, from: 10, w: (t) => t.spd - 0.4 },
  gym: { place: 'gym', cost: 1600, min: 90, w: (t) => t.con + t.amb - 1.1 },
  library: { place: 'library', cost: 0, min: 90, w: (t) => t.con + t.amb - 1.05 },
  gamecenter: { place: 'gamecenter', cost: 1600, min: 90, from: 10, w: (t) => t.ext - 0.5 },
  onsen: { place: 'sento', cost: 1400, min: 90, from: 15, w: (t) => 0.2 - t.neu * 0.2 },
  illumination: { place: 'jpark', cost: 0, min: 60, season: 3, from: 17, w: (t) => t.agr * 0.6 - 0.1 },
};

const prefCache = new Map();
export function prefsOf(S, id) {
  const seed = S.world.seed, key = seed + ':' + id;
  if (prefCache.has(key)) return prefCache.get(key);
  const d = PEOPLE[id], t = d.traits;
  const noise = (...k) => (rnd(seed, 'pf', id, ...k) - 0.5) * 0.7;
  const topics = {}, tones = {}, spots = {};
  for (const [k, f] of Object.entries(TOPIC_W)) topics[k] = f(t) + noise('t', k) + (k === 'family' && d.nat === 'vn' ? 0.15 : 0) + (k === 'culture' && d.nat === 'jp' ? 0.1 : 0);
  for (const [k, f] of Object.entries(TONE_W)) tones[k] = f(t) + noise('o', k);
  for (const [k, s] of Object.entries(SPOTS)) spots[k] = s.w(t) + noise('s', k);
  const P0 = { topics, tones, spots, chem: rnd(seed, 'chem', id), birthday: 1 + Math.floor(rnd(seed, 'bd', id) * 84) };
  prefCache.set(key, P0);
  return P0;
}
const known = (p) => (p.known = p.known || { t: {}, s: {} });

// ---------- ai có thể yêu ai ----------
const attractedTo = (d, g) => { const o = d.orientation || 'hetero'; return o === 'bi' || (o === 'homo' ? d.gender === g : d.gender !== g); };
const playerLikes = (S, d) => !S.pref || S.pref === 'any' || S.pref === d.gender;
// Trả về { ok, affair, reason }
export function romanceGate(S, id) {
  const d = PEOPLE[id];
  if (!d || !d.traits) return { ok: false, reason: '' };
  if (d.age < 18) return { ok: false, reason: 'Chưa đủ 18 tuổi' };
  if (!playerLikes(S, d)) return { ok: false, reason: 'Không phải giới bạn chọn để yêu' };
  if (!attractedTo(d, S.gender)) return { ok: false, reason: `${d.name} không có cảm xúc kiểu đó với ${S.gender === d.gender ? 'người cùng giới' : 'người khác giới'}` };
  // chênh lệch tuổi quá xa thì người kia không nghĩ theo hướng đó (giới hạn nới rộng theo tuổi)
  const myAge = (S.age || 22) + Math.floor((S.day - 1) / 84);
  const gap = Math.abs(d.age - myAge), lim = 10 + Math.round(Math.min(d.age, myAge) / 4);
  if (gap > lim) return { ok: false, reason: `${d.name} coi bạn như ${d.age > myAge ? 'con cháu' : 'em nhỏ'} (chênh ${gap} tuổi)` };
  if (d.married) {
    if (d.traits.loy >= 0.55) return { ok: false, reason: `${d.name} đã có gia đình và rất chung thủy` };
    return { ok: true, affair: true, reason: `${d.name} đã có gia đình` };
  }
  return { ok: true };
}
export const isPartner = (S, id) => !!(S.love && S.love.id === id);
export const isAffair = (S, id) => !!(S.affairs && S.affairs[id]);

// Ấn tượng lần đầu gặp: ngoại hình, giao tiếp, độ "hợp" ngẫu nhiên theo save
export async function firstImpression(S, id) {
  const p = P(S, id), A = ensureAttr(S);
  if (p.att != null) return;
  const g = romanceGate(S, id), pr = prefsOf(S, id);
  p.att = g.ok ? clamp(Math.round(pr.chem * 30 + (A.look - 30) * 0.35 + (A.soc - 25) * 0.2 + rnd(S.world.seed, 'fi', id) * 8)) : 0;
  if (g.ok && !g.affair && pr.chem > 0.88 && A.look >= 30) {
    p.att = clamp(p.att + 30);
    await modal({ who: PEOPLE[id].name, title: '💘 Tiếng sét ái tình?', text: `Ánh mắt hai người chạm nhau lâu hơn bình thường một chút. Tim bạn đập nhanh — có vẻ ${esc(PEOPLE[id].name)} cũng vậy.`, html: chips([['att', 30]]) });
  }
}
export function addAtt(S, id, v) {
  const p = P(S, id), g = romanceGate(S, id);
  if (!g.ok) return 0;
  const before = p.att || 0;
  p.att = clamp(before + v);
  return p.att - before;
}
export function heartsHtml(S, id) {
  const p = P(S, id), g = romanceGate(S, id);
  if (!g.ok) return g.reason ? `<div class="dim">💗 ${esc(g.reason)}</div>` : '';
  const a = Math.round(p.att || 0);
  return `<div class="pbar" style="--c:#ff6b9a"><i style="width:${a}%;background:#ff6b9a"></i></div><div class="dim">Rung động 💗 ${a}/100${g.affair ? ' · ⚠️ đã có gia đình' : ''}</div>`;
}
// Những gì đã biết về sở thích của người này
export function knownHtml(S, id) {
  const k = known(P(S, id));
  const like = Object.entries(k.t).filter(([, v]) => v === 'like').map(([t]) => TOPICS.find((x) => x.id === t)?.label);
  const dis = Object.entries(k.t).filter(([, v]) => v === 'dislike').map(([t]) => TOPICS.find((x) => x.id === t)?.label);
  const sp = Object.entries(k.s).filter(([, v]) => v === 'like').map(([s]) => DATES[s]?.name);
  const pr = prefsOf(S, id);
  const bdKnown = stageIdx(P(S, id).aff) >= 2;
  const parts = [];
  if (like.length) parts.push(`😊 Thích nói về: ${like.join(', ')}`);
  if (dis.length) parts.push(`😒 Không thích: ${dis.join(', ')}`);
  if (sp.length) parts.push(`📍 Thích đi: ${sp.join(', ')}`);
  if (bdKnown) parts.push(`🎂 Sinh nhật: ngày ${((pr.birthday - 1) % 7) + 1} tháng ${((3 + Math.floor((pr.birthday - 1) / 7)) % 12) + 1}`);
  return parts.length ? `<div class="dim">${parts.map(esc).join('<br>')}</div>` : '<div class="dim">Chưa biết nhiều về sở thích của người này — trò chuyện nhiều hơn để hiểu.</div>';
}
export const isBirthday = (S, id) => prefsOf(S, id).birthday === doy(S);

// ---------- trò chuyện theo chủ đề ----------
const fill = (s, S, d) => s.replace(/\{me\}/g, S.name).replace(/\{npc\}/g, d.name);
export async function chatTopic(S, id) {
  const d = PEOPLE[id], p = P(S, id);
  if (!p.chat || p.chat.d !== S.day) p.chat = { d: S.day, n: 0 };
  if (p.chat.n >= 3) { toast(`${d.name} có vẻ muốn làm việc khác rồi.`); return; }
  const k = known(p), st = stageIdx(p.aff);
  const topic = await modal({
    who: `${d.name} · ${moodInfo(S, id).icon} ${moodInfo(S, id).name}`, title: '🗨️ Nói chuyện về…',
    html: knownHtml(S, id),
    choices: [...TOPICS.map((t) => {
      const deep = ['love', 'worry', 'money'].includes(t.id);
      const mark = k.t[t.id] === 'like' ? ' 😊' : k.t[t.id] === 'dislike' ? ' 😒' : '';
      return { label: `${t.icon} ${t.label}${mark}`, value: t.id, sub: deep && st < 2 ? 'Chủ đề riêng tư — người chưa thân dễ ngại' : '' };
    }), { label: '← Thôi', value: null, cancel: true }],
  });
  if (!topic) return;
  const T = TOPICS.find((x) => x.id === topic);
  p.chat.n++;
  advance(S, 15);
  const pr = prefsOf(S, id), A = ensureAttr(S);
  const mood = moodToday(S, id);
  let score = pr.topics[topic] + (mood - 50) / 120 + (A.soc - 30) / 250;
  if (['love', 'worry', 'money'].includes(topic) && st < 2) score -= 0.45;
  if (topic === 'praise' && st === 0) score -= 0.2;
  if (topic === 'love' && (P(S, id).att || 0) > 50) score += 0.3;
  const r = score > 0.22 ? 'like' : score < -0.12 ? 'dislike' : 'neutral';
  k.t[topic] = r;
  const pool = T[r][d.jp ? 'jp' : 'vn'];
  const line = fill(pool[Math.floor(Math.random() * pool.length)], S, d);
  const ask = fill(T.ask[Math.floor(Math.random() * T.ask.length)], S, d);
  const affD = r === 'like' ? 4 : r === 'neutral' ? 1 : -2;
  const attD = r === 'like' && ['love', 'praise', 'dream', 'hobby', 'movie', 'joke'].includes(topic) ? 3 : r === 'like' ? 1 : r === 'dislike' ? -1 : 0;
  gain(S, id, affD);
  const da = attD ? addAtt(S, id, attD) : 0;
  adjustMood(S, id, r === 'like' ? 4 : r === 'dislike' ? -4 : 0);
  const out = applyFx(S, { mood: r === 'like' ? 3 : r === 'dislike' ? -2 : 1, soc: 0.6, jp: d.jp ? 0.4 : 0 });
  out.push(['aff', affD]); if (da) out.push(['att', da]);
  sfx(r === 'like' ? 'good' : r === 'dislike' ? 'bad' : 'tap');
  await modal({
    who: `${d.name} · ${r === 'like' ? '😊 hào hứng' : r === 'dislike' ? '😒 không thích chủ đề này' : '🙂 bình thường'}`, title: `${T.icon} ${T.label}`,
    html: `<p><b>Bạn:</b> ${esc(ask)}</p><p><b>${esc(d.name)}:</b> ${esc(line)}</p>${chips(out)}${affBar(p.aff)}${heartsHtml(S, id)}`,
  });
}

// ---------- rủ đi chơi / hẹn hò ----------
function spotAvailable(S, key, atMin) {
  const s = SPOTS[key], h = atMin / 60, wk = dow(S) >= 5;
  if (s.season != null && seasonIdx(S) !== s.season) return s.season === 0 ? 'Chỉ mùa xuân' : s.season === 1 ? 'Chỉ mùa hè' : 'Chỉ mùa đông';
  if (s.weekend && !wk) return 'Chỉ cuối tuần (đi cả ngày)';
  if (s.from && h < s.from) return `Từ ${s.from}:00`;
  const P0 = AI_PLACES[s.place];
  if (P0 && P0.open && (h < P0.open[0] || h + s.min / 60 > P0.open[1] + 0.5)) return `Mở ${P0.open[0]}:00–${P0.open[1]}:00`;
  if (atMin + s.min > MIDNIGHT) return 'Khuya quá rồi';
  return null;
}
export async function inviteDate(S, id) {
  const d = PEOPLE[id], p = P(S, id), k = known(p);
  const now = Math.ceil((S.time + 30) / 60) * 60;
  const slots = [{ at: now, label: `Bây giờ (gặp lúc ${now / 60}:00)` }];
  for (const h of [12, 15, 19]) if (h * 60 > now) slots.push({ at: h * 60, label: `Hôm nay ${h}:00` });
  const at = slots.length > 1 ? await modal({ who: d.name, title: '📅 Hẹn lúc nào?', choices: [...slots.map((s) => ({ label: s.label, value: s.at })), { label: '← Thôi', value: null, cancel: true }] }) : now;
  if (!at) return;
  const key = await modal({
    who: d.name, title: `📍 Rủ ${d.name} đi đâu?`, html: knownHtml(S, id),
    choices: [...Object.keys(SPOTS).map((k2) => {
      const why = spotAvailable(S, k2, at);
      const D = DATES[k2], s = SPOTS[k2];
      return { label: `${D.icon} ${D.name}${k.s[k2] === 'like' ? ' 😊' : ''}`, sub: `${s.cost ? 'khoảng ' + yen(s.cost) : 'miễn phí'} · ${Math.round(s.min / 60 * 10) / 10} tiếng`, value: k2, disabled: !!why || S.money < s.cost, reason: why || 'Không đủ tiền' };
    }), { label: '← Thôi', value: null, cancel: true }],
  });
  if (!key) return;
  // NPC có rảnh / có muốn đi không: tính theo lịch AI, tâm trạng, thân thiết, rung động, địa điểm hợp ý
  const busyAct = stateAtHour(S, id, at / 60).act;
  const busy = busyAct === 'work' || busyAct === 'sleep';
  const pr = prefsOf(S, id);
  let chance = acceptInvite(d.traits, p.aff + (p.att || 0) * 0.5, moodToday(S, id), busy) * (1 + pr.spots[key] * 0.6);
  if (isPartner(S, id)) chance = Math.max(chance, busy ? 0.15 : 0.85);
  advance(S, 5);
  if (Math.random() > Math.min(0.97, chance)) {
    p.aff = clamp(p.aff - (d.traits.agr > 0.6 ? 0 : 1));
    await modal({ who: `📱 ${d.name}`, title: '🙏 Không đi được', text: busy ? `"Giờ đó mình ${busyAct === 'work' ? 'phải đi làm' : 'ngủ mất rồi'}, hôm khác nhé!"` : `"Hôm nay mình không có hứng lắm… để dịp khác nha."` });
    return;
  }
  const s = SPOTS[key];
  if (s.trip || at === now) {
    // đi ngay cùng nhau
    await modal({ who: d.name, title: '😊 Đồng ý!', text: s.trip ? `Hai người đi tàu lên thành phố chơi cả ngày.` : `"Ok, đi luôn!" Hai người cùng đến ${esc(DATES[key].name.toLowerCase())}.` });
    S.time = Math.max(S.time, at - 30);
    await runDate(S, id, key);
    return;
  }
  S.today.appt = { id, place: s.place, at, done: false, date: key };
  S.world.override = S.world.override || {};
  S.world.override[id] = { day: S.day, from: at / 60, to: at / 60 + Math.ceil(s.min / 60), act: 'social', place: s.place };
  toast(`📅 Hẹn ${d.name} lúc ${at / 60}:00 · ${DATES[key].name}`, 2800);
}

// Buổi hẹn: 2 tình huống, mỗi lựa chọn có "giọng" — người này thích giọng nào là do tính cách
export async function runDate(S, id, key) {
  const d = PEOPLE[id], p = P(S, id), D = DATES[key], s = SPOTS[key], pr = prefsOf(S, id), k = known(p);
  const split = d.nat === 'jp' && !isPartner(S, id) && Math.random() < 0.5;
  const cost = split ? Math.round(s.cost / 2) : s.cost;
  if (cost) pay(S, cost, 'date', `${D.name} với ${d.name}`);
  advance(S, s.min);
  let affT = 4, attT = 2;
  const evs = [...D.events].sort(() => Math.random() - 0.5).slice(0, 2);
  for (const e of evs) {
    const opts = [...e.choices].sort(() => Math.random() - 0.5);
    const i = await modal({ who: `${D.icon} ${D.name} · ${d.name}`, title: D.jp || D.name, text: esc(fill(e.text, S, d)), choices: opts.map((c, j) => ({ label: esc(fill(c[0], S, d)), value: j })) });
    const tone = opts[i][1];
    const sc = pr.tones[tone] + (Math.random() - 0.5) * 0.3 + ((p.att || 0) > 60 && tone === 'bold' ? 0.3 : 0);
    if (sc > 0.15) { affT += 3; attT += 4; await modal({ who: d.name, text: `${esc(d.name)} ${['cười tươi', 'đỏ mặt cười', 'gật đầu thích thú', 'nhìn bạn lâu hơn một chút'][Math.floor(Math.random() * 4)]}. Có vẻ rất hợp ý.` }); }
    else if (sc < -0.2) { affT -= 1; attT -= 2; await modal({ who: d.name, text: `${esc(d.name)} hơi khựng lại, cười gượng. Có lẽ không hợp kiểu này.` }); }
    else { affT += 1; attT += 1; }
  }
  // địa điểm có hợp ý không
  const spotLike = pr.spots[key] > 0.15;
  k.s[key] = spotLike ? 'like' : pr.spots[key] < -0.15 ? 'dislike' : 'ok';
  if (spotLike) { affT += 2; attT += 2; }
  if (isBirthday(S, id)) { affT += 4; attT += 2; }
  const up = gain(S, id, affT);
  const da = addAtt(S, id, attT);
  adjustMood(S, id, 10);
  if (isPartner(S, id)) S.love.lastDate = S.day;
  const out = applyFx(S, { mood: 10, stress: -8, soc: 1, full: key === 'dinner' ? 45 : key === 'cafe' ? 15 : 0 });
  if (cost) out.unshift(['money', -cost]);
  out.push(['aff', affT]); if (da) out.push(['att', da]);
  sfx('good');
  await modal({ who: d.name, title: `💕 Kết thúc buổi đi chơi`, text: `${split ? 'Hai người chia đôi tiền (割り勘). ' : ''}${spotLike ? `${esc(d.name)} có vẻ rất thích chỗ này.` : 'Một buổi đi chơi vui vẻ.'}`, html: chips(out) + affBar(p.aff) + heartsHtml(S, id) });
  if (up) toast(`💞 ${d.name}: ${stageName(p.aff)}`);
  // cuối buổi hẹn buổi tối: cơ hội tỏ tình / ở lại
  const g = romanceGate(S, id);
  if (g.ok && S.time >= 18 * 60) {
    if (isPartner(S, id) || isAffair(S, id)) { const v = await modal({ who: d.name, title: '🌙 Đêm đã khuya', choices: [{ label: '🌙 Rủ ở lại cùng nhau đêm nay', value: true }, { label: '👋 Tiễn về, hẹn hôm khác', value: false }] }); if (v) await stayOver(S, id); }
    else if ((p.att || 0) >= 55 && !S.love) { const v = await modal({ who: d.name, title: '🌆 Trên đường về', text: `Hai người đi chậm lại. Không khí có gì đó khác lạ…`, choices: [{ label: '💗 Tỏ tình ngay bây giờ', value: true }, { label: 'Thôi, để lần sau', value: false }] }); if (v) await confess(S, id); }
  }
}

// ---------- tỏ tình ----------
export function confessReason(S, id) {
  const p = P(S, id), g = romanceGate(S, id);
  if (!g.ok) return g.reason || 'Không thể';
  if (S.love && S.love.id !== id) return 'Bạn đang có người yêu rồi';
  if (isAffair(S, id) || isPartner(S, id)) return 'Hai người đã là người yêu';
  if (p.confessCD && S.day < p.confessCD) return 'Vừa bị từ chối, đợi vài ngày đã';
  const need = g.affair ? 75 : 45;
  if ((p.att || 0) < need) return `Chưa đủ rung động 💗 ${Math.round(p.att || 0)}/${need}`;
  if (g.affair && p.aff < 50) return 'Chưa đủ thân (cần 💞 50)';
  return null;
}
export async function confess(S, id) {
  const d = PEOPLE[id], p = P(S, id), g = romanceGate(S, id);
  const r = confessReason(S, id);
  if (r) { await modal({ title: '💗 Tỏ tình', text: r }); return; }
  const A = ensureAttr(S);
  const chance = sig(0.12 * ((p.att || 0) - 62) + 0.04 * (p.aff - 35) + 0.03 * (moodToday(S, id) - 50) + (A.soc - 30) / 60 - (g.affair ? 0.8 : 0));
  await modal({ who: d.name, title: '💗 Tỏ tình', text: g.affair ? `Bạn biết ${esc(d.name)} đã có gia đình. Nhưng bạn vẫn nói ra: "Mình… có tình cảm với bạn."` : `Bạn lấy hết can đảm${d.jp ? ': 「好きです。付き合ってください」' : ': "Mình thích bạn. Mình hẹn hò nhé?"'}`, ok: 'Hồi hộp…' });
  advance(S, 20);
  if (Math.random() < chance) {
    if (g.affair) { S.affairs = S.affairs || {}; S.affairs[id] = { since: S.day, nights: 0 }; addLog(S, `Bắt đầu mối quan hệ bí mật với ${d.name}`); }
    else { S.love = { id, stage: 'dating', since: S.day, lastDate: S.day, touch: 0 }; addLog(S, `Bắt đầu hẹn hò với ${d.name}`); }
    gain(S, id, 5); addAtt(S, id, 8);
    sfx('end');
    const out = applyFx(S, { mood: 25, stress: -10 });
    await modal({ who: d.name, title: g.affair ? '🤫 Mối quan hệ bí mật' : '💞 Đồng ý!', text: g.affair ? `${esc(d.name)} im lặng rất lâu rồi khẽ nắm tay bạn. "Không ai được biết chuyện này."<br><span class="dim">⚠️ Ngoại tình có thể bị phát hiện: vợ/chồng, hàng xóm, đồng nghiệp… Hậu quả rất nặng.</span>` : `${esc(d.name)} đỏ mặt gật đầu${d.jp ? ': 「…はい。よろしくお願いします」' : ': "Mình cũng thích bạn."'}`, html: chips(out) });
  } else {
    p.att = clamp((p.att || 0) - 8); p.aff = clamp(p.aff - 3); p.confessCD = S.day + 3;
    sfx('bad');
    const out = applyFx(S, { mood: -15 });
    await modal({ who: d.name, title: '💔 Chưa phải lúc', text: `${esc(d.name)} bối rối: "Mình… chưa nghĩ đến chuyện đó. Cho mình thêm thời gian nhé."`, html: chips(out) });
  }
}

// ---------- cử chỉ thân mật (người yêu) ----------
const TOUCH = [
  { label: '🤝 Nắm tay', need: 40, txt: 'Bạn khẽ nắm tay. Bàn tay ấy nắm lại.' },
  { label: '🤗 Ôm', need: 55, txt: 'Một cái ôm thật lâu. Mùi dầu gội thoang thoảng.' },
  { label: '💋 Hôn', need: 68, txt: 'Hai người hôn nhau. Thời gian như ngừng lại.' },
];
export function touchActions(S, id) {
  const L = S.love && S.love.id === id ? S.love : isAffair(S, id) ? S.affairs[id] : null;
  if (!L) return [];
  const lv = L.touch || 0;
  const a = [];
  if (lv < TOUCH.length) {
    const T = TOUCH[lv];
    a.push({ label: T.label, sub: 'Bước tiếp theo — người kia có thể chưa sẵn sàng', minutes: 5, run: (s) => touch(s, id, lv) });
  }
  if (lv >= 2) a.push({ label: '🌙 Rủ ở lại cùng nhau đêm nay', sub: 'Cần chỗ riêng tư · buổi tối', minutes: 0, cond: (s) => (s.time < 19 * 60 ? 'Đợi buổi tối đã' : null), run: (s) => stayOver(s, id) });
  return a;
}
async function touch(S, id, lv) {
  const d = PEOPLE[id], p = P(S, id), T = TOUCH[lv];
  const L = S.love && S.love.id === id ? S.love : S.affairs[id];
  const ok = Math.random() < sig(((p.att || 0) - T.need) / 7 + (moodToday(S, id) - 50) / 40);
  if (ok) { L.touch = lv + 1; addAtt(S, id, 3); const out = applyFx(S, { mood: 8, stress: -4 }); await modal({ who: d.name, title: T.label, text: T.txt, html: chips(out) }); }
  else await modal({ who: d.name, title: T.label, text: `${esc(d.name)} hơi lùi lại, cười ngượng: "Từ từ đã nhé…" Tôn trọng nhịp của người ấy — không sao cả.` });
}

// ---------- qua đêm (đồng thuận; 18+ chỉ chuyển cảnh, có công tắc) ----------
const others = (S, id, uid, hour) => (S.world.units[uid] || []).filter((x) => x !== id && PEOPLE[x] && stateAtHour(S, x, hour).place === 'u:' + uid);
export async function stayOver(S, id) {
  const d = PEOPLE[id], p = P(S, id), adult = !!(S.settings && S.settings.adult);
  const affair = isAffair(S, id);
  const uid = d.home && d.home.startsWith('u:') ? d.home.slice(2) : null;
  const homeFree = uid && !others(S, id, uid, 23).length;
  const choices = [];
  if (uid) choices.push({ label: `🏠 Về nhà ${d.name}`, value: 'npc', disabled: !homeFree, reason: 'Nhà có người khác ở nhà' });
  if (S.home && S.home.unit) choices.push({ label: '🏠 Về nhà bạn', value: 'mine' });
  choices.push({ label: '🏨 Khách sạn (¥8,000)', value: 'hotel', disabled: S.money < 8000, reason: 'Không đủ tiền' });
  choices.push({ label: '← Thôi', value: null, cancel: true });
  const where = await modal({ who: d.name, title: '🌙 Ở đâu?', text: 'Ký túc xá có người ở chung và có nội quy không cho người ngoài ở lại qua đêm.', choices });
  if (!where) return;
  // đồng thuận của người kia: tính theo rung động, tâm trạng; có thể từ chối
  const yes = Math.random() < sig(((p.att || 0) - 65) / 7 + (moodToday(S, id) - 50) / 40 + 0.8);
  if (!yes) { await modal({ who: d.name, text: `${esc(d.name)} lắc đầu nhẹ: "Hôm nay mình muốn về nhà. Hẹn lần sau nhé." Không sao — tôn trọng quyết định của nhau.` }); return; }
  let protectedSex = true;
  if (adult) {
    const v = await modal({ who: d.name, title: '🔞 Xác nhận', text: `${esc(d.name)} nhìn bạn: "Bạn chắc chứ?" Cả hai đều muốn điều này.`, choices: [{ label: '💗 Có, mình chắc', value: 'yes' }, { label: 'Để lần sau', value: null, cancel: true }] });
    if (!v) return;
    const c = await modal({ title: '🛡️ Biện pháp an toàn', text: 'Ở Nhật, bao cao su bán ở mọi konbini và hiệu thuốc. Thuốc tránh thai khẩn cấp cần đơn bác sĩ.', choices: [{ label: '🛡️ Dùng bao cao su', value: true }, { label: 'Không dùng gì', value: false }] });
    protectedSex = !!c;
  }
  if (where === 'hotel') pay(S, 8000, 'date', 'Khách sạn');
  const out = applyFx(S, { mood: 15, stress: -12 });
  addAtt(S, id, 5); gain(S, id, 4);
  await modal({ who: d.name, title: '🌙 Đêm nay', text: adult ? '(Chuyển cảnh)' : 'Hai người nói chuyện đến khuya rồi ngủ thiếp đi bên nhau.', html: chips(out) });
  // mang thai: chỉ khi khác giới
  if (adult && d.gender !== S.gender && Math.random() < (protectedSex ? 0.02 : 0.12)) {
    if (isPartner(S, id) && !S.love.pregnant) S.love.pregnant = { start: S.day, unplanned: S.love.stage !== 'married' };
    else if (affair) S.affairs[id].preg = S.day;
  }
  if (affair) { S.affairs[id].nights++; await affairRisk(S, id, where, uid); }
  // ngủ lại, sáng dậy ở đó
  S.wakeUnit = where === 'npc' ? uid : where === 'mine' ? S.home.unit : null;
  const { sleep } = await import('./days.js');
  await sleep(S);
}

// ---------- ngoại tình: rủi ro bị phát hiện ----------
async function affairRisk(S, id, where, uid) {
  const d = PEOPLE[id], A = S.affairs[id];
  const spouse = d.spouse && PEOPLE[d.spouse];
  // vợ/chồng về sớm (về nhà sớm hơn bình thường) khi ở nhà người đó; hàng xóm nhìn thấy; đồng nghiệp bắt gặp ở khách sạn
  let risk = 0.04 + A.nights * 0.015;
  if (where === 'npc' && spouse) risk += 0.12 + (spouse.job ? 0 : 0.15);
  if (where === 'hotel') risk += d.job && d.job.place === myPlace(S) ? 0.06 : 0.02;
  if (Math.random() > risk) {
    if (Math.random() < 0.08) S.world.gossip.unshift({ d: S.day, t: `🤫 Có người thấy ${d.name} đi cùng một người lạ vào buổi tối…` });
    return;
  }
  await discovered(S, id);
}
export async function discovered(S, id) {
  const d = PEOPLE[id], spouse = d.spouse && PEOPLE[d.spouse];
  sfx('bad');
  if (spouse) { const sp = P(S, d.spouse); sp.met = true; sp.aff = 0; }
  P(S, id).aff = clamp(P(S, id).aff - 20);
  delete S.affairs[id];
  if (d.household) d.household.crisis = S.day;
  const boss = d.job && d.job.place === myPlace(S);
  const out = applyFx(S, { rep: boss ? -22 : -12, mood: -25, stress: 20 });
  S.world.gossip.unshift({ d: S.day, t: `💥 Cả khu xôn xao: chuyện ngoại tình của ${d.name} bị phát hiện.` });
  addLog(S, `Bị phát hiện ngoại tình với ${d.name}`);
  await modal({ who: spouse ? spouse.name : 'Hàng xóm', title: '💥 Bị phát hiện', text: `${spouse ? `${esc(spouse.name)} — ${spouse.gender === 'm' ? 'chồng' : 'vợ'} của ${esc(d.name)} — đã biết hết.` : 'Chuyện của hai người đã bị lộ.'} Gia đình ${esc(d.name)} rạn nứt, mọi người bàn tán.${boss ? '<br>Ở chỗ làm, chuyện quan hệ với cấp trên khiến bạn mất uy tín nghiêm trọng; công ty xem xét kỷ luật.' : ''}`, html: chips(out) });
  if (boss && S.emp && S.emp.perf) S.emp.perf.push(0.1);
}
