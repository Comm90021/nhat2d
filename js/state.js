// Trạng thái game, lịch, lưu/tải. Không phụ thuộc DOM.
export const SAVE_KEY = 'nhatky-tts-2d-v1';
export const TOTAL_DAYS = 56;          // 4 mùa x 14 ngày (1 năm rút gọn)
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
  jp: { label: 'Tiếng Nhật', icon: '🗣️' },
  rep: { label: 'Uy tín', icon: '⭐' },
  money: { label: 'Tiền', icon: '💴' },
  wage: { label: 'Lương chờ lĩnh', icon: '🧾' },
};
const BOUNDED = ['health', 'energy', 'mood', 'full', 'jp', 'rep'];

export function newState({ name, gender, look, job }) {
  return {
    v: 1, name, gender, look, job,
    day: 1, time: DAY_START,
    money: 30000, debt: START_DEBT, wage: 0,
    health: 85, energy: 100, mood: 70, full: 60, jp: 8, rep: 50,
    sick: 0, worked: false, lastScore: 0.6, cert: null,
    weather: 'clear',
    today: {}, flags: {},
    inv: { ingredients: 0 },
    rel: { sato: 0, long: 0 },
    stats: { shifts: 0, lates: 0, absences: 0, earned: 0, sentVnd: 0, best: 0 },
    learned: [], log: [],
    pos: null, dir: 'down',
  };
}

export const seasonIdx = (S) => Math.min(3, Math.floor((S.day - 1) / DAYS_PER_SEASON));
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

export function jpLevel(jp) {
  return jp >= 90 ? 'N1' : jp >= 75 ? 'N2' : jp >= 55 ? 'N3' : jp >= 35 ? 'N4' : jp >= 18 ? 'N5' : 'Sơ cấp';
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
    return S && S.v === 1 ? S : null;
  } catch (e) { return null; }
}
export function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } }
