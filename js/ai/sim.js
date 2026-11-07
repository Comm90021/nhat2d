// Mô phỏng NPC: mỗi giờ chọn hoạt động theo quy luật (tái lập được theo hạt), tâm trạng theo ngày,
// quan hệ giữa các NPC, tin đồn. Không có kịch bản riêng cho từng người.
import { AI_PLACES, WORKPLACES, SPECIAL_SHIFTS, PEOPLE } from './world.js';
import { rnd, gauss, needAt, traitWeight, WEATHER_OUT, OUTDOOR_ACTS, skipsWork, nextMood, moodOf, pairDrift } from './rules.js';
import { dow, doy, HOLIDAYS, placeOpenOnHoliday } from '../calendar.js';

const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
export const ids = () => Object.keys(PEOPLE).filter((k) => PEOPLE[k].traits);

export function shiftOf(d) {
  if (!d.job) return null;
  if (typeof d.job.shift === 'string') return SPECIAL_SHIFTS[d.job.shift];
  const W = WORKPLACES[d.job.place];
  return W ? W.shifts[d.job.shift] || W.shifts[0] : null;
}
const isOpen = (pl, h) => !pl || !pl.open || (h >= pl.open[0] && h < pl.open[1]);

export function moodToday(S, id) {
  const w = S.world;
  return clamp((w.mood[id] ?? 55) + (w.moodAdj[id] || 0));
}
export const moodInfo = (S, id) => moodOf(moodToday(S, id));
export function adjustMood(S, id, v) { S.world.moodAdj[id] = (S.world.moodAdj[id] || 0) + v; }

const PLACE_FOR = {
  eat: ['konbini', 'ramen', 'teishoku', 'HOME'],
  shop: ['konbini', 'super'],
  leisure: ['park', 'river', 'center', 'mpark', 'jpark'],
  social: ['ramen', 'teishoku', 'park', 'konbini_front', 'center'],
  study: ['class', 'center', 'HOME'],
  worship: ['shrine'],
  home: ['HOME'],
};
const mapOf = (p) => (AI_PLACES[p] ? AI_PLACES[p].map : 'off');

function moodMod(act, mood) {
  if (mood < 25) return { social: 0.4, home: 1.6, leisure: 1.2 }[act] || 1;
  if (mood >= 75) return { social: 1.5, leisure: 1.2, home: 0.7 }[act] || 1;
  return 1;
}

export function decide(S, id, hour) {
  const d = PEOPLE[id], tr = d.traits, seed = S.world.seed, day = S.day, wd = dow(S);
  const hol = !!HOLIDAYS[doy(S)], wk = wd >= 5 || hol;
  const mood = moodToday(S, id);
  const ov = S.world.override && S.world.override[id];
  if (ov && ov.day === day && hour >= ov.from && hour < ov.to) return { act: ov.act, place: ov.place };
  const sh = shiftOf(d);
  const early = sh && sh.from <= 6 ? 1 : 0;
  const old = d.age >= 65;
  const wake = (old ? 5 : 6) + Math.round(rnd(seed, id, 'wake') * 2) + (wk && !old ? 1 : 0) - early;
  const bed = (old ? 20 : 22) + Math.round(rnd(seed, id, 'bed') * 2) + (sh && sh.to >= 23 ? 1 : 0);
  if (hour < wake || hour >= Math.min(24, bed)) return { act: 'sleep', place: d.home };
  // ốm hôm nay
  if (rnd(seed, id, day, 'sick') < 0.012 + 0.02 * tr.neu) {
    if (hour >= 10 && hour < 12 && wd !== 6) return { act: 'health', place: 'clinic' };
    return { act: 'home', place: d.home, sick: true };
  }
  // đi làm theo ca
  const closedToday = hol && d.job && !placeOpenOnHoliday(d.job.place);
  if (sh && !closedToday && sh.days.includes(wd) && hour >= sh.from && hour < sh.to && !skipsWork(tr, mood, `${seed}|${id}|${day}`)) {
    // nghỉ trưa: người làm ca dài đi ăn lúc 12h
    if (hour === 12 && sh.to - sh.from >= 8 && rnd(seed, id, day, 'lunch') < 0.35) return { act: 'eat', place: rnd(seed, id, day, 'lp') < 0.5 ? 'konbini' : (d.job.place === 'work' ? 'konbini' : AI_PLACES[d.job.place].map === 'minato' ? 'teishoku' : 'ramen') };
    return { act: 'work', place: d.job.place };
  }
  if (d.student && !wk && hour >= 9 && hour < 15 && !closedToday) return { act: 'study', place: 'school' };
  // ứng viên theo điểm
  let best = { act: 'home', place: d.home }, bestScore = 0;
  for (const act of Object.keys(PLACE_FOR)) {
    let s = needAt(act, hour, wk) * traitWeight(act, tr) * moodMod(act, mood) * (0.75 + 0.5 * rnd(seed, id, day, hour, act));
    if (OUTDOOR_ACTS.has(act)) s *= WEATHER_OUT[S.weather] || 1;
    if (s > bestScore) { bestScore = s; best = { act, place: null }; }
  }
  const hb = d.hobby;
  if (hb && hb.days.includes(wd) && hour >= hb.from && hour < hb.to) {
    let s = hb.w * (0.7 + 0.6 * rnd(seed, id, day, hour, 'hobby'));
    if (AI_PLACES[hb.place] && AI_PLACES[hb.place].spot && AI_PLACES[hb.place].map !== 'off') s *= WEATHER_OUT[S.weather] || 1;
    if (s > bestScore && isOpen(AI_PLACES[hb.place], hour)) return { act: hb.act || 'hobby', place: hb.place };
  }
  if (best.place) return best;
  // chọn nơi cho hoạt động
  const homeMap = mapOf(d.home), workMap = d.job ? mapOf(d.job.place) : homeMap;
  let bp = d.home, bw = -1;
  for (const p of PLACE_FOR[best.act]) {
    const place = p === 'HOME' ? d.home : p;
    if (!isOpen(AI_PLACES[place], hour)) continue;
    if (place === 'center' && !(wk && hour >= 10 && hour < 17)) continue;
    const m = mapOf(place);
    const w = 1 + (m === homeMap ? 1.5 : 0) + (m === workMap ? 0.6 : 0) + rnd(seed, id, day, hour, place) * 1.5 + (place === d.home ? (best.act === 'eat' ? 1.2 - tr.spd : 0) : 0);
    if (w > bw) { bw = w; bp = place; }
  }
  return { act: best.act, place: bp };
}

// bộ nhớ đệm theo giờ
let cache = { key: '', st: {} };
export function stateOf(S, id) {
  const hour = Math.floor(S.time / 60) % 24;
  const key = `${S.day}:${hour}:${S.weather}`;
  if (cache.key !== key) cache = { key, st: {} };
  return cache.st[id] || (cache.st[id] = decide(S, id, hour));
}
export function stateAtHour(S, id, hour) { return decide(S, id, ((hour % 24) + 24) % 24); }
export function resetCache() { cache = { key: '', st: {} }; }
export const whereIs = (S, id) => stateOf(S, id).place;
export const npcsAt = (S, place) => ids().filter((id) => stateOf(S, id).place === place);

// ---------- mỗi sáng: tâm trạng mới, quan hệ NPC–NPC, tin đồn ----------
const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
export function aiDayStart(S) {
  const W = S.world;
  const all = ids();
  for (const id of all) {
    const prev = W.mood[id] ?? 55;
    W.mood[id] = Math.round(nextMood(PEOPLE[id].traits, prev, `${W.seed}|${id}|${S.day}`, S.weather, (W.moodAdj[id] || 0) * 0.5));
  }
  W.moodAdj = {};
  // NPC gặp nhau ở chỗ làm / chỗ ở → quan hệ trôi theo tính cách
  const groups = {};
  for (const id of all) {
    const d = PEOPLE[id];
    if (d.job) (groups['w:' + d.job.place] = groups['w:' + d.job.place] || []).push(id);
    if (d.home !== 'home_jp') (groups['h:' + d.home] = groups['h:' + d.home] || []).push(id);
  }
  const news = [];
  for (const [g, list] of Object.entries(groups)) {
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      if (rnd(W.seed, S.day, a, b, 'meet') > 0.5) continue;
      const k = pairKey(a, b);
      const before = W.pairs[k] || 0;
      const A = PEOPLE[a], B = PEOPLE[b];
      const after = Math.max(-100, Math.min(100, before + 3 * pairDrift(A.traits, B.traits) + 4 * gauss(W.seed, S.day, k)));
      W.pairs[k] = Math.round(after);
      const where = g.startsWith('w:') ? `ở ${AI_PLACES[g.slice(2)].name}` : g === 'h:dorm' ? 'ở ký túc xá' : 'ở chung cư';
      if (before > -35 && after <= -35) news.push(`💢 Nghe nói ${A.name} và ${B.name} cãi nhau to ${where}.`);
      if (before < 45 && after >= 45) news.push(`🤝 ${A.name} và ${B.name} dạo này thân nhau lắm, hay đi ăn cùng.`);
      const compatible = A.romance && B.romance && (A.gender !== B.gender ? A.orientation !== 'homo' && B.orientation !== 'homo' : A.orientation !== 'hetero' && B.orientation !== 'hetero');
      if (compatible && before < 75 && after >= 75) news.push(`💕 Có tin đồn ${A.name} và ${B.name} đang hẹn hò!`);
    }
  }
  // sự kiện cá nhân sinh theo tính cách
  for (const id of all) {
    const d = PEOPLE[id], t = d.traits;
    if (d.job && rnd(W.seed, S.day, id, 'promo') < 0.002 * (0.5 + t.amb) * (0.5 + t.con)) news.push(`🎉 ${d.name} vừa được lên chức ở ${AI_PLACES[d.job.place].name}.`);
    if (rnd(W.seed, S.day, id, 'lotto') < 0.0006 * (0.3 + t.luck)) news.push(`🎫 ${d.name} trúng vé số nhỏ, khao cả nhóm một bữa.`);
    if (d.job && rnd(W.seed, S.day, id, 'quit') < 0.0006 * (1.5 - t.con) * (1 + t.neu)) news.push(`🚪 ${d.name} đang tính nghỉ việc vì áp lực.`);
  }
  for (const n of news) W.gossip.unshift({ d: S.day, t: n });
  if (W.gossip.length > 30) W.gossip.length = 30;
  resetCache();
  return news;
}

export function pairScore(S, a, b) { return S.world.pairs[pairKey(a, b)] || 0; }
export { mapOf };
