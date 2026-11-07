// Hệ thống học tiếng Nhật: năng lực theo từng cấp, chuỗi đúng, ôn câu sai.
// Không import state.js (state.js import file này).
import { QUESTIONS, LEVELS } from './content/jlpt.js';

export { LEVELS };
// Điểm kinh nghiệm cần để "đạt" mỗi cấp (cộng thêm điều kiện độ chính xác)
export const NEED = { N5: 45, N4: 135, N3: 300, N2: 540, N1: 840 };
const WIN = 12;       // xét độ chính xác trên 12 câu gần nhất của cấp đó
const MIN_WIN = 6;
export const ACC_REQ = 0.7;

export function newLang() {
  return {
    lv: Object.fromEntries(LEVELS.map((l) => [l, { xp: 0, win: [], seen: 0, ok: 0 }])),
    wrong: [], recent: [], streak: 0, best: 0,
  };
}

const accOf = (s) => (s.win.length ? s.win.filter(Boolean).length / s.win.length : 0);
function reachedNow(L, lv) {
  const s = L.lv[lv];
  return s.xp >= NEED[lv] && s.win.length >= MIN_WIN && accOf(s) >= ACC_REQ;
}
// Đã đạt một lần thì giữ luôn (năng lực không mất vì một lần trả lời sai)
export function reached(L, lv) {
  L.got = L.got || [];
  if (L.got.includes(lv)) return true;
  if (reachedNow(L, lv)) { L.got.push(lv); return true; }
  return false;
}
// Cấp cao nhất đạt liên tiếp từ N5 trở lên ('' nếu chưa đạt cấp nào)
export function currentLevel(L) {
  let cur = '';
  for (const lv of LEVELS) { if (reached(L, lv)) cur = lv; else break; }
  return cur;
}
export function targetLevel(L) {
  const cur = currentLevel(L);
  const i = cur ? LEVELS.indexOf(cur) + 1 : 0;
  return LEVELS[Math.min(i, LEVELS.length - 1)];
}
// Đỗ JLPT cấp lv: coi như năng lực đã đạt cấp đó và mọi cấp dưới (kỳ thi thật đã chứng minh)
export function grantLevel(L, lv) {
  L.got = L.got || [];
  for (const l of LEVELS.slice(0, LEVELS.indexOf(lv) + 1)) {
    if (!L.got.includes(l)) L.got.push(l);
    L.lv[l].xp = Math.max(L.lv[l].xp, NEED[l]);
  }
}
export const levelLabel = (L) => currentLevel(L) || 'Sơ cấp';
export const levelIndex = (L) => (currentLevel(L) ? LEVELS.indexOf(currentLevel(L)) + 1 : 0); // 0..5

export function progress(L) {
  const t = targetLevel(L), s = L.lv[t];
  return { cur: levelLabel(L), target: t, xp: s.xp, need: NEED[t], acc: accOf(s), answered: s.win.length, done: currentLevel(L) === 'N1' };
}
export function levelStats(L) {
  return LEVELS.map((lv) => ({ lv, xp: L.lv[lv].xp, need: NEED[lv], acc: accOf(L.lv[lv]), seen: L.lv[lv].seen, reached: reached(L, lv) }));
}

// Điểm học "thụ động" (nghe, nói chuyện…): chỉ cộng xp, không tính độ chính xác
export function passiveXp(L, v) {
  const s = L.lv[targetLevel(L)];
  s.xp = Math.min(s.xp + v * 0.6, NEED[targetLevel(L)] * 1.5);
}

function shuffled(q) {
  const order = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
  return { ...q, opts: order.map((i) => q.opts[i]), a: order.indexOf(0) };
}

// Chọn câu hỏi thích nghi. opts.lv = ép cấp (dùng khi thi)
export function pickQuestion(L, opts = {}) {
  const target = targetLevel(L);
  const ti = LEVELS.indexOf(target);
  let pool;
  if (opts.lv) pool = QUESTIONS.filter((q) => q.lv === opts.lv);
  else {
    const r = Math.random();
    const wrong = L.wrong.map((id) => QUESTIONS.find((q) => q.id === id)).filter((q) => q && LEVELS.indexOf(q.lv) <= ti);
    if (wrong.length && r < 0.2) pool = wrong;
    else if (ti > 0 && r < 0.35) pool = QUESTIONS.filter((q) => LEVELS.indexOf(q.lv) < ti);
    else pool = QUESTIONS.filter((q) => q.lv === target);
  }
  const fresh = pool.filter((q) => !L.recent.includes(q.id));
  const list = fresh.length ? fresh : pool;
  const q = list[Math.floor(Math.random() * list.length)];
  L.recent.push(q.id);
  if (L.recent.length > 14) L.recent.shift();
  return shuffled(q);
}

// Ghi nhận câu trả lời. Trả về { gain, streak, levelUp }
export function answer(L, q, ok, opts = {}) {
  const before = currentLevel(L);
  const target = targetLevel(L);
  const s = L.lv[q.lv];
  s.seen++;
  s.win.push(!!ok);
  if (s.win.length > WIN) s.win.shift();
  let gain = 0;
  if (ok) {
    s.ok++;
    L.streak++;
    L.best = Math.max(L.best, L.streak);
    const mult = L.streak >= 6 ? 2 : L.streak >= 3 ? 1.5 : 1;
    const base = q.lv === target ? 1 : LEVELS.indexOf(q.lv) < LEVELS.indexOf(target) ? 0.3 : 1.2;
    gain = base * mult * (opts.mult || 1);
    s.xp = Math.min(s.xp + gain, NEED[q.lv] * 2);
    L.wrong = L.wrong.filter((id) => id !== q.id);
  } else {
    L.streak = 0;
    if (!L.wrong.includes(q.id)) L.wrong.push(q.id);
    if (L.wrong.length > 30) L.wrong.shift();
  }
  const after = currentLevel(L);
  return { gain, streak: L.streak, levelUp: after !== before ? after : null };
}

export function questionsOfLevel(lv) { return QUESTIONS.filter((q) => q.lv === lv); }
export function shuffleQ(q) { return shuffled(q); }
