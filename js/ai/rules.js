// Quy luật hành vi chung cho mọi NPC. Không có kịch bản riêng cho từng người:
// hành vi = tham số tính cách × trạng thái (tâm trạng, giờ, thời tiết, quan hệ) × ngẫu nhiên có hạt.

// ---------- ngẫu nhiên có hạt (tái lập được) ----------
export function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export function rnd(...parts) {
  let h = hashStr(parts.join('|'));
  h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
export function gauss(...parts) { const u = Math.max(1e-6, rnd(...parts, 'a')), v = rnd(...parts, 'b'); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
export const sigmoid = (x) => 1 / (1 + Math.exp(-x));

// ---------- tâm trạng ----------
export const MOODS = [
  { min: 75, id: 'great', name: 'Rất vui', icon: '😄' },
  { min: 58, id: 'good', name: 'Vui', icon: '🙂' },
  { min: 40, id: 'ok', name: 'Bình thường', icon: '😐' },
  { min: 25, id: 'cranky', name: 'Cáu', icon: '😠' },
  { min: -1e9, id: 'sad', name: 'Buồn', icon: '😢' },
];
export const moodOf = (v) => MOODS.find((m) => v >= m.min);
const WEATHER_MOOD = { clear: 4, cloudy: -2, rain: -7, snow: -1 };

// mood mới = 0.6 × hôm qua + 0.4 × nền (dễ chịu, ít bất ổn) + nhiễu theo độ bất ổn + thời tiết + dư âm sự kiện
export function nextMood(tr, prev, seed, weather, adj = 0) {
  const base = 55 + 20 * (tr.agr - 0.5) - 18 * (tr.neu - 0.5);
  const noise = gauss(seed) * 25 * tr.neu;
  return Math.max(0, Math.min(100, 0.6 * prev + 0.4 * base + noise + (WEATHER_MOOD[weather] || 0) + adj));
}

// ---------- hoạt động ----------
// Mỗi giờ NPC chọn hoạt động có điểm cao nhất: nhu cầu theo giờ × tính cách × thời tiết × ngẫu nhiên.
export const ACT = {
  sleep: { label: 'đang ngủ' }, home: { label: 'ở nhà' }, work: { label: 'đang làm việc' }, eat: { label: 'đang ăn' },
  shop: { label: 'đang mua sắm' }, leisure: { label: 'đang thư giãn' }, social: { label: 'đang tụ tập bạn bè' },
  study: { label: 'đang học' }, worship: { label: 'đi lễ đền' }, sport: { label: 'đang đá bóng' }, hobby: { label: 'đang thong thả' },
  volunteer: { label: 'đang làm tình nguyện' }, health: { label: 'đang đi khám' },
};

// Nhu cầu theo khung giờ (0..1)
export function needAt(act, h, wk) {
  switch (act) {
    case 'eat': return (h >= 7 && h < 8) || (h >= 12 && h < 13) || (h >= 18 && h < 20) ? 0.9 : 0.05;
    case 'shop': return h >= 10 && h < 21 ? (wk ? 0.35 : 0.18) : 0;
    case 'leisure': return h >= 9 && h < 20 ? (wk ? 0.55 : 0.2) : 0;
    case 'social': return h >= 18 && h < 23 ? 0.45 : wk && h >= 12 && h < 22 ? 0.35 : 0;
    case 'study': return (h >= 19 && h < 22) || (wk && h >= 10 && h < 17) ? 0.3 : 0;
    case 'worship': return wk && h >= 8 && h < 17 ? 0.08 : 0;
    case 'home': return 0.3;
    default: return 0;
  }
}
// Trọng số tính cách cho từng hoạt động
export function traitWeight(act, tr) {
  switch (act) {
    case 'eat': return 1;
    case 'shop': return 0.6 + tr.spd;
    case 'leisure': return 0.5 + tr.opn * 0.6 + (1 - tr.ext) * 0.3;
    case 'social': return 0.2 + tr.ext * 1.3;
    case 'study': return 0.2 + tr.amb * 0.8 + tr.con * 0.4;
    case 'worship': return 0.3 + tr.luck * 1.2;
    case 'home': return 0.6 + (1 - tr.ext) * 0.8;
    default: return 1;
  }
}
export const WEATHER_OUT = { clear: 1, cloudy: 0.9, rain: 0.45, snow: 0.6 };
export const OUTDOOR_ACTS = new Set(['leisure', 'sport', 'worship']);

// Có đi làm hôm nay không (ốm, tâm trạng tệ mà kém tận tâm)
export function skipsWork(tr, mood, seed) {
  const p = 0.01 + (mood < 25 ? 0.08 * (1 - tr.con) : 0) + 0.02 * tr.neu;
  return rnd(seed, 'skip') < p;
}

// ---------- hành vi hướng tới người chơi (xác suất mỗi ngày) ----------
// p = cơ_sở × Π hệ_số. aff = thân thiết 0..100, mood 0..100.
export const PROACTIVE = {
  invite: { base: 0.035, f: (tr, aff, mood) => tr.ext * 1.6 * (aff / 50) * (mood / 55) },
  borrow: { base: 0.006, f: (tr, aff, mood, ctx) => (0.5 + ctx.moneyStress) * (0.4 + tr.spd) * (1.2 - tr.con) * (aff / 40) },
  gossip: { base: 0.05, f: (tr) => tr.ext * 1.4 * (1.3 - tr.agr) },
  quarrel: { base: 0.012, f: (tr, aff, mood) => tr.neu * 1.8 * (mood < 30 ? 2.2 : mood < 45 ? 1 : 0.3) * (aff > 15 ? 1 : 0.3) },
  crush: { base: 0.02, f: (tr, aff, mood, ctx) => (ctx.attraction / 60) * (0.5 + tr.opn) * (aff >= 55 ? 1 : 0) },
  help: { base: 0.02, f: (tr, aff) => tr.agr * 1.5 * (aff / 50) },
};

// ---------- phản hồi khi người chơi tương tác ----------
// chấp nhận lời mời đi chơi
export const acceptInvite = (tr, aff, mood, busy) => (busy ? 0.05 : sigmoid(0.06 * (aff - 30) + 0.05 * (mood - 50) + 1.5 * (tr.ext - 0.5)));
// sẵn lòng nói chuyện hôm nay
export const willTalk = (tr, mood) => sigmoid(0.09 * (mood - 22) + 2.5 * (tr.agr - 0.3));
// hệ số thân thiết nhận được theo tâm trạng
export const moodGain = (mood) => (mood >= 75 ? 1.4 : mood >= 58 ? 1.15 : mood >= 40 ? 1 : mood >= 25 ? 0.6 : 0.8);
// ---------- giải thích quyết định (để người chơi hiểu vì sao NPC đồng ý / từ chối) ----------
export function reasons({ tr, aff = 0, mood = 50, act = '', att = 0 }) {
  const r = [];
  if (act === 'work') r.push('💼 đang làm việc');
  if (act === 'sleep') r.push('💤 đang ngủ');
  const m = moodOf(mood);
  if (mood < 40 || mood >= 58) r.push(`${m.icon} đang ${m.name.toLowerCase()} (tâm trạng ${Math.round(mood)})`);
  r.push(aff < 15 ? 'mới quen' : aff < 40 ? 'quen biết' : aff < 70 ? 'đã thân' : 'rất thân');
  if (att >= 50) r.push('💗 có rung động với bạn');
  if (tr) {
    if (tr.ext < 0.35) r.push('tính hướng nội'); else if (tr.ext > 0.7) r.push('tính hướng ngoại');
    if (tr.agr > 0.72) r.push('dễ tính'); else if (tr.agr < 0.35) r.push('khó tính');
  }
  return r.join(' · ');
}
export const chanceWord = (p) => (p >= 0.8 ? 'rất dễ' : p >= 0.55 ? 'dễ' : p >= 0.3 ? 'khó' : 'rất khó');
// Quyết định nhất quán trong ngày: cùng người, cùng việc → cùng con xúc xắc. Điều kiện tốt lên (quà, tâm trạng) thì dễ đồng ý hơn,
// nhưng hỏi đi hỏi lại không đổi được kết quả.
export const dayRoll = (S, id, action) => rnd(S.world ? S.world.seed : 0, S.day, id, action);

// NPC trả nợ đúng hạn
export const repayChance = (tr, moneyStress) => sigmoid(3 * (tr.con - 0.4) - 2 * (moneyStress - 0.4) + 1.2 * (tr.agr - 0.5));
// quan hệ giữa hai NPC trôi theo tính cách hai người
export const pairDrift = (a, b) => 0.6 * (a.agr + b.agr - 1) - 0.5 * Math.abs(a.ext - b.ext) - 0.4 * (a.neu + b.neu - 1);
