// Trạng thái game, lưu/tải, quy đổi save. Không phụ thuộc DOM.
import { newLang, passiveXp, levelLabel } from './learning.js';
import { YEAR_DAYS, DAYS_PER_SEASON, doy, year, monthOf, month, seasonIdx, dow, isWorkday, scaleDay } from './calendar.js';
import { newFin, attach, addDebt } from './finance.js';

export { YEAR_DAYS, DAYS_PER_SEASON, doy, year, monthOf, month, seasonIdx, dow, isWorkday };

export const SAVE_KEY = 'nhatky-tts-2d-v1';
export const START_DEBT = 150000000;   // nợ đi Nhật (VND) — phí môi giới, đào tạo, vé máy bay
export const RATE = 170;               // 1 yên ≈ 170 đồng
export const DAY_START = 6 * 60 + 30;  // 06:30
export const MIDNIGHT = 24 * 60;
export const TIME_RATE = 1.2;          // phút trong game / giây thật khi đi ngoài đường

export const SEASONS = [
  { id: 'spring', name: 'Xuân', jp: '春' },
  { id: 'summer', name: 'Hạ', jp: '夏' },
  { id: 'autumn', name: 'Thu', jp: '秋' },
  { id: 'winter', name: 'Đông', jp: '冬' },
];
export const DOW = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

// G.S = trạng thái đang chơi; G.busy = đang có hội thoại / cảnh khác
export const G = { S: null, busy: false, onEnd: null };

export const STAT_INFO = {
  health: { label: 'Sức khỏe', icon: '❤️' },
  energy: { label: 'Năng lượng', icon: '⚡' },
  full: { label: 'No bụng', icon: '🍙' },
  mood: { label: 'Tinh thần', icon: '🙂' },
  jp: { label: 'Tiếng Nhật (xp)', icon: '🗣️' },
  rep: { label: 'Uy tín', icon: '⭐' },
  money: { label: 'Tiền', icon: '💴' },
  wage: { label: 'Lương chờ lĩnh', icon: '🧾' },
  aff: { label: 'Thân thiết', icon: '💞' },
  att: { label: 'Rung động', icon: '💗' },
  fit: { label: 'Thể lực', icon: '💪' },
  int: { label: 'Trí tuệ', icon: '🧠' },
  look: { label: 'Ngoại hình', icon: '✨' },
  soc: { label: 'Giao tiếp', icon: '🗣️' },
  cook: { label: 'Nấu ăn', icon: '🍳' },
  stress: { label: 'Căng thẳng', icon: '😣' },
  luck: { label: 'May mắn', icon: '🍀' },
};
// Chỉ số phụ (0–100): tăng chậm dần khi đã cao (trừ căng thẳng, may mắn)
export const ATTR_KEYS = ['fit', 'int', 'look', 'soc', 'cook', 'stress', 'luck'];
const NO_DIMINISH = ['stress', 'luck'];
export function ensureAttr(S) {
  if (!S.attr) S.attr = { fit: 35, int: 25 + 6 * (S.certs || []).filter((c) => c.type === 'JLPT').length, look: 30, soc: 25, cook: 20, stress: 30 };
  if (S.attr.luck == null) S.attr.luck = 35 + Math.floor(Math.random() * 31);
  return S.attr;
}
// May mắn hiệu lực = gốc + bùa / quẻ còn hạn
export function luckOf(S) {
  const A = ensureAttr(S);
  let v = A.luck;
  for (const b of Object.values(S.buffs || {})) if (b.luck && b.until >= S.day) v += b.luck;
  return Math.max(0, Math.min(100, v));
}
// Đẩy xác suất theo may mắn: good = chuyện tốt (tăng khi may), bad = chuyện xấu (giảm khi may)
export function luckP(S, p, good) {
  const k = (luckOf(S) - 50) / 150;
  return Math.max(0, Math.min(1, p * (good ? 1 + k : 1 - k)));
}
export function addBuff(S, id, b) { S.buffs = S.buffs || {}; S.buffs[id] = b; }
const BOUNDED = ['health', 'energy', 'mood', 'full', 'rep'];

const newCareer = (day = 1) => ({ visa: 'tts1', start: day, end: day + YEAR_DAYS, passed: {}, tried: {}, ssw1Start: null, history: [{ visa: 'tts1', day }], notified: null });

export function newState({ name, gender, look, job, pref }) {
  const lang = newLang();
  lang.phrases = [];
  const S = {
    v: 3, name, gender, look, job, pref: pref || (gender === 'm' ? 'f' : 'm'),
    day: 1, time: DAY_START,
    fin: newFin(30000, START_DEBT), wage: 0, workDays: 0,
    health: 85, energy: 100, mood: 70, full: 60, rep: 50,
    lang, certs: [], exam: null, skill: {},
    career: newCareer(1),
    settings: { shiftMode: 'quiz', adult: false },
    sick: 0, worked: false, lastScore: 0.6,
    weather: 'clear',
    today: {}, flags: {},
    inv: { ingredients: 0 },
    npc: {},
    stats: { shifts: 0, lates: 0, absences: 0, earned: 0, sentVnd: 0, best: 0 },
    log: [],
    pos: null, dir: 'down', map: 'town',
  };
  return attach(S);
}

// ---------- quy đổi save cũ ----------
export function migrate(S) {
  // v1 → v2: tiếng Nhật theo cấp, chứng chỉ
  if (S.v === 1) {
    S.lang = newLang();
    passiveXp(S.lang, Math.min(30, (S.jp || 0) * 0.6));
    delete S.jp;
    S.certs = S.cert ? [{ type: 'JLPT', lv: S.cert, day: S.day }] : [];
    delete S.cert;
    S.exam = null; S.skill = {}; S.settings = { shiftMode: 'quiz' };
    S.v = 2;
  }
  if (!S.career) S.career = { ...newCareer(1), end: Math.max(1 + 56, S.day + 20) };
  // v2 → v3: lịch 56 → 84 ngày, sổ cái tài chính, gộp hệ quan hệ
  if (S.v === 2) {
    const sc = scaleDay;
    S.day = sc(S.day);
    S.day -= (S.day - 1) % 7;                        // về Thứ Hai đầu "tháng"
    const C = S.career;
    C.start = sc(C.start); C.end = sc(C.end); C.ssw1Start = sc(C.ssw1Start); C.notified = sc(C.notified);
    C.history.forEach((h) => { h.day = sc(h.day); });
    for (const k in C.passed) C.passed[k] = sc(C.passed[k]);
    for (const k in C.tried) C.tried[k] = sc(C.tried[k]);
    if (C.end <= S.day) C.end = S.day + 14;
    (S.certs || []).forEach((c) => { c.day = sc(c.day); });
    (S.log || []).forEach((l) => { l.d = sc(l.d); });
    const people = S.people || {};
    for (const p of Object.values(people)) { p.last = sc(p.last); p.talked = sc(p.talked); p.gift = sc(p.gift); p.msg = sc(p.msg); }
    if (S.love) {
      const L = S.love;
      L.since = sc(L.since); L.lastDate = sc(L.lastDate); L.engaged = sc(L.engaged); L.married = sc(L.married); L.wantKids = sc(L.wantKids);
      if (L.pregnant) L.pregnant.start = sc(L.pregnant.start);
    }
    (S.kids || []).forEach((k) => { k.born = sc(k.born); k.seen = sc(k.seen); });
    if (S.family) {
      S.family.lastRemit = sc(S.family.lastRemit); S.family.lastCall = sc(S.family.lastCall);
      for (const k in S.family.events) S.family.events[k] = sc(S.family.events[k]);
    }
    // tiền → sổ cái
    S.fin = newFin(Math.round(S.money || 0), Math.round(S.debt || 0));
    if (S.loan) { addDebt(S, { id: 'shark', kind: 'shark', lender: 'Anh Thắng (vay nóng)', currency: 'JPY', principal: 50000, balance: S.loan.amount, due: sc(S.loan.due), rate: 0 }); }
    delete S.money; delete S.debt; delete S.loan;
    // quan hệ
    S.npc = people; delete S.people; delete S.rel;
    S.lang.phrases = S.learned || []; delete S.learned;
    S.settings = { adult: false, ...S.settings };
    S.workDays = 0;
    S.map = 'town';
    S.v = 3;
  }
  return attach(S);
}

// ---------- tiện ích ----------
export const isNewYear = (S) => S.flags.newyear === year(S) && doy(S) >= 63 && doy(S) <= 67 && S.flags.hatsu !== year(S);
export const season = (S) => SEASONS[seasonIdx(S)];
export const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));

export function clockStr(min) {
  const m = Math.max(0, Math.floor(min));
  const h = Math.floor(m / 60) % 24, mm = m % 60;
  return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}
export const yen = (n) => (n < 0 ? '-¥' : '¥') + Math.abs(Math.round(n)).toLocaleString('en-US');
export const vnd = (n) => Math.round(n).toLocaleString('vi-VN') + '₫';

export const jpLevel = (S) => levelLabel(S.lang);
// Chứng chỉ JLPT cao nhất ('' nếu chưa có)
export function bestCert(S) {
  const order = ['N5', 'N4', 'N3', 'N2', 'N1'];
  let best = '';
  for (const c of S.certs || []) if (c.type === 'JLPT' && order.indexOf(c.lv) > order.indexOf(best)) best = c.lv;
  return best;
}
export const energyCap = (S) => (S.sick > 0 ? 70 : 100) + Math.round((((S.attr && S.attr.fit) || 35) - 35) / 6);

// Áp dụng thay đổi chỉ số. Trả về danh sách [key, delta] để hiển thị.
export function applyFx(S, fx) {
  const out = [];
  if (!fx) return out;
  for (const k in fx) {
    const v = fx[k];
    if (k === 'rel') continue; // hệ quan hệ cũ (v1) — đã gộp vào S.npc
    if (typeof v !== 'number' || !v) continue;
    if (k === 'money' || k === 'wage') { S[k] += v; out.push([k, v]); continue; }
    if (k === 'jp') { if (v > 0) { passiveXp(S.lang, v); out.push(['jp', v * 0.6]); } continue; }
    if (ATTR_KEYS.includes(k)) {
      const A = ensureAttr(S), before = A[k];
      // tăng: càng cao càng chậm (trừ căng thẳng); giảm: trực tiếp
      const d = v > 0 && !NO_DIMINISH.includes(k) ? v * Math.max(0.15, 1 - before / 115) : v;
      A[k] = Math.max(0, Math.min(100, before + d));
      if (Math.abs(A[k] - before) >= 0.1) out.push([k, A[k] - before]);
      continue;
    }
    if (BOUNDED.includes(k)) {
      const cap = k === 'energy' ? energyCap(S) : 100;
      const before = S[k];
      S[k] = v > 0 ? Math.max(before, Math.min(cap, before + v)) : Math.max(0, before + v);
      const d = S[k] - before;
      if (Math.abs(d) >= 0.1) out.push([k, d]);
    }
  }
  return out;
}

// Đói / mệt theo thời gian
export function tickNeeds(S, minutes, sleeping = false) {
  const h = minutes / 60;
  S.full = clamp(S.full - h * (sleeping ? 1.5 : 4));
  if (!sleeping) S.energy = clamp(S.energy - h * 2);
  if (S.full < 20) { S.health -= h * 1.2; S.mood -= h * 2; }
  if (!sleeping && S.energy < 10) { S.health -= h; S.mood -= h; }
  if (S.sick > 0 && !sleeping) S.health -= h * 0.4;
  S.health = clamp(S.health); S.mood = clamp(S.mood);
}
export function advance(S, minutes) { S.time += minutes; tickNeeds(S, minutes); }

export function addLog(S, text) {
  S.log.unshift({ d: S.day, t: text });
  if (S.log.length > 80) S.log.length = 80;
}

export function save() {
  try { if (G.S) localStorage.setItem(SAVE_KEY, JSON.stringify(G.S)); } catch (e) { /* bộ nhớ bị chặn */ }
}
export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const S = JSON.parse(raw);
    if (!S || ![1, 2, 3].includes(S.v)) return null;
    if (S.v < 3) { try { localStorage.setItem(SAVE_KEY + '.bak', raw); } catch (e) { /* ignore */ } }
    return migrate(S);
  } catch (e) { console.error(e); return null; }
}
export function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } }
