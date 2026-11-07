// Trạng thái game, lịch, lưu/tải. Không phụ thuộc DOM.
import { newLang, passiveXp, levelLabel } from './learning.js';

export const SAVE_KEY = 'nhatky-tts-2d-v1';
export const YEAR_DAYS = 56;           // 1 năm trong game = 4 mùa x 14 ngày, bắt đầu từ tháng 4
export const DAYS_PER_SEASON = 14;
export const START_DEBT = 40000000;    // nợ ở quê (VND)
export const RATE = 170;               // 1 yên = 170 đồng
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
};
const BOUNDED = ['health', 'energy', 'mood', 'full', 'rep'];

export function newState({ name, gender, look, job }) {
  return {
    v: 2, name, gender, look, job,
    day: 1, time: DAY_START,
    money: 30000, debt: START_DEBT, wage: 0,
    health: 85, energy: 100, mood: 70, full: 60, rep: 50,
    lang: newLang(), certs: [], exam: null, skill: {},
    career: { visa: 'tts1', start: 1, end: 1 + YEAR_DAYS, passed: {}, tried: {}, ssw1Start: null, history: [{ visa: 'tts1', day: 1 }], notified: null },
    settings: { shiftMode: 'quiz' },
    sick: 0, worked: false, lastScore: 0.6,
    weather: 'clear',
    today: {}, flags: {},
    inv: { ingredients: 0 },
    rel: { sato: 0, long: 0 },
    stats: { shifts: 0, lates: 0, absences: 0, earned: 0, sentVnd: 0, best: 0 },
    learned: [], log: [],
    pos: null, dir: 'down',
  };
}

// Bản lưu cũ (v1: chỉ có 56 ngày, tiếng Nhật là 1 con số) → v2
export function migrate(S) {
  if (S.v === 1) {
    S.lang = newLang();
    passiveXp(S.lang, Math.min(30, (S.jp || 0) * 0.6));
    delete S.jp;
    S.certs = S.cert ? [{ type: 'JLPT', lv: S.cert, day: S.day }] : [];
    delete S.cert;
    S.exam = null; S.skill = {}; S.settings = { shiftMode: 'quiz' };
    S.v = 2;
  }
  if (!S.career) {
    S.career = { visa: 'tts1', start: 1, end: Math.max(1 + YEAR_DAYS, S.day + 20), passed: {}, tried: {}, ssw1Start: null, history: [{ visa: 'tts1', day: 1 }], notified: null };
  }
  return S;
}

// ---------- lịch ----------
export const doy = (S) => ((S.day - 1) % YEAR_DAYS) + 1;               // ngày trong năm: 1..56
export const year = (S) => Math.floor((S.day - 1) / YEAR_DAYS) + 1;
export const monthOf = (d) => ((3 + Math.floor(((d - 1) * 12) / YEAR_DAYS)) % 12) + 1; // 1..12; ngày 1 = tháng 4, mỗi mùa đúng 3 tháng
export const month = (S) => monthOf(doy(S));
export const isNewYear = (S) => S.flags.newyear === year(S) && doy(S) >= 41 && doy(S) <= 45 && S.flags.hatsu !== year(S);
export const seasonIdx = (S) => Math.min(3, Math.floor((doy(S) - 1) / DAYS_PER_SEASON));
export const season = (S) => SEASONS[seasonIdx(S)];
export const dow = (S) => (S.day - 1) % 7;
export const isWorkday = (S) => dow(S) < 5;
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
export const energyCap = (S) => (S.sick > 0 ? 70 : 100);

// Áp dụng thay đổi chỉ số. Trả về danh sách [key, delta] để hiển thị.
export function applyFx(S, fx) {
  const out = [];
  if (!fx) return out;
  for (const k in fx) {
    const v = fx[k];
    if (k === 'rel') { for (const n in v) S.rel[n] = (S.rel[n] || 0) + v[n]; continue; }
    if (typeof v !== 'number' || !v) continue;
    if (k === 'money' || k === 'wage') { S[k] += v; out.push([k, v]); continue; }
    if (k === 'jp') { if (v > 0) { passiveXp(S.lang, v); out.push(['jp', v * 0.6]); } continue; }
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
    return S && (S.v === 1 || S.v === 2) ? migrate(S) : null;
  } catch (e) { return null; }
}
export function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } }
