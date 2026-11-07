// Thế giới NPC: địa điểm, chỗ làm, sinh dân cư theo quy luật (có hạt ngẫu nhiên lưu trong save).
import { rnd } from './rules.js';
import { VN, JP } from '../content/names.js';
import { PEOPLE } from '../content/people.js';
import { LOOK } from '../data.js';

// ---------- địa điểm ----------
// kind: home | work | shop | food | health | study | leisure | temple | service | spot | off
export const AI_PLACES = {
  dorm: { map: 'town', kind: 'home', interior: 'dorm', name: 'Ký túc xá' },
  apt: { map: 'minato', kind: 'home', name: 'Chung cư Minato' },
  home_jp: { map: 'off', kind: 'home', name: 'nhà riêng' },
  school: { map: 'off', kind: 'study', name: 'trường học' },
  konbini: { map: 'town', kind: 'shop', interior: 'konbini', name: 'Konbini' },
  super: { map: 'town', kind: 'shop', open: [9, 21], interior: 'super', name: 'Siêu thị' },
  ramen: { map: 'town', kind: 'food', open: [11, 23], interior: 'ramen', name: 'Quán ramen' },
  teishoku: { map: 'minato', kind: 'food', open: [7, 21], interior: 'teishoku', name: 'Quán cơm Ōmori' },
  clinic: { map: 'town', kind: 'health', open: [9, 18], interior: 'clinic', name: 'Phòng khám' },
  class: { map: 'town', kind: 'study', open: [17, 21], interior: 'class', name: 'Lớp tiếng Nhật' },
  center: { map: 'town', kind: 'leisure', open: [10, 17], interior: 'center', name: 'Trung tâm giao lưu' },
  remit: { map: 'town', kind: 'service', open: [10, 19], interior: 'remit', name: 'Tiệm chuyển tiền' },
  shrine: { map: 'town', kind: 'temple', spot: 'shrine', name: 'Đền Hikari' },
  park: { map: 'town', kind: 'leisure', spot: 'park', name: 'Công viên' },
  river: { map: 'town', kind: 'leisure', spot: 'river', name: 'Bờ sông' },
  mpark: { map: 'minato', kind: 'leisure', spot: 'mpark', name: 'Công viên Minato' },
  jpark: { map: 'jutaku', kind: 'leisure', spot: 'jpark', name: 'Công viên Hikari-dai' },
  fudosan: { map: 'jutaku', kind: 'service', open: [10, 19], name: 'Bất động sản Hikari' },
  // phố Kawabata
  cafe: { map: 'shotengai', kind: 'food', open: [8, 21], interior: 'cafe', name: 'Cà phê Komorebi' },
  karaoke: { map: 'shotengai', kind: 'leisure', open: [12, 24], interior: 'karaoke', name: 'Karaoke Utaya' },
  cinema: { map: 'shotengai', kind: 'leisure', open: [10, 23], interior: 'cinema', name: 'Rạp phim Hikari Cinema' },
  gamecenter: { map: 'shotengai', kind: 'leisure', open: [10, 23], interior: 'gamecenter', name: 'Game center Arcadia' },
  mall: { map: 'shotengai', kind: 'shop', open: [10, 21], interior: 'mall', name: 'TTTM Aeon-ya' },
  gym: { map: 'shotengai', kind: 'leisure', open: [6, 23], interior: 'gym', name: 'Phòng gym Power' },
  library: { map: 'shotengai', kind: 'study', open: [9, 20], interior: 'library', name: 'Thư viện thành phố' },
  sento: { map: 'shotengai', kind: 'leisure', open: [15, 24], interior: 'sento', name: 'Nhà tắm Matsu-no-yu' },
  izakaya: { map: 'shotengai', kind: 'food', open: [17, 24], interior: 'izakaya', name: 'Izakaya Torikizoku-ya' },
  shotengai_street: { map: 'shotengai', kind: 'spot', spot: 'shotengai_street', name: 'phố đi bộ Kawabata' },
  dorm_front: { map: 'town', kind: 'spot', spot: 'dorm_front', name: 'trước ký túc xá' },
  work_corner: { map: 'town', kind: 'spot', spot: 'work_corner', name: 'góc đường trước xưởng' },
  konbini_front: { map: 'town', kind: 'spot', spot: 'konbini_front', name: 'trước konbini' },
  station_front: { map: 'town', kind: 'spot', spot: 'station_front', name: 'trước ga Hikari' },
  parts_corner: { map: 'minato', kind: 'spot', spot: 'parts_corner', name: 'góc nhà máy Minato Parts' },
  // chỗ làm
  work: { map: 'town', kind: 'work', interior: 'work', name: 'chỗ làm của bạn' },
  care: { map: 'town', kind: 'work', interior: 'care', name: 'Viện dưỡng lão Hinata' },
  bento: { map: 'minato', kind: 'work', interior: 'bento', name: 'Nhà máy cơm hộp Sakura' },
  it: { map: 'minato', kind: 'work', interior: 'it', name: 'Văn phòng Kaizen IT' },
  electric: { map: 'minato', kind: 'work', interior: 'electric', name: 'Công ty điện Tōhoku Denki' },
  parts: { map: 'minato', kind: 'work', interior: 'parts', name: 'Nhà máy Minato Parts' },
  logistics: { map: 'minato', kind: 'work', interior: 'logistics', name: 'Kho vận Hayabusa' },
  site: { map: 'minato', kind: 'work', interior: 'site', name: 'Công trường Minato' },
};

// ---------- chỗ làm: ca làm, số người, mẫu nhân viên ----------
const WD = [0, 1, 2, 3, 4], WD6 = [0, 1, 2, 3, 4, 5];
export const WORKPLACES = {
  work: { shifts: [{ days: WD, from: 8, to: 17 }], staff: [['vn_tts', 2], ['jp_worker', 1]] },
  care: { shifts: [{ days: WD6, from: 7, to: 16 }, { days: [1, 2, 3, 4, 5, 6], from: 14, to: 22 }], staff: [['jp_boss', 1], ['vn_ssw', 2], ['jp_worker', 1]] },
  bento: { shifts: [{ days: WD6, from: 6, to: 15 }, { days: WD, from: 14, to: 23 }], staff: [['jp_boss', 1], ['vn_tts', 3], ['jp_worker', 1]] },
  it: { shifts: [{ days: WD, from: 9, to: 18 }], staff: [['jp_boss', 1], ['vn_eng', 1], ['jp_office', 2]] },
  electric: { shifts: [{ days: WD, from: 8, to: 17 }], staff: [['jp_boss', 1], ['vn_ssw', 1], ['jp_worker', 1]] },
  parts: { shifts: [{ days: WD, from: 8, to: 17 }, { days: WD, from: 17, to: 23 }], staff: [['jp_boss', 1], ['vn_tts', 3], ['jp_worker', 1]] },
  logistics: { shifts: [{ days: WD6, from: 6, to: 15 }, { days: WD6, from: 14, to: 23 }], staff: [['jp_boss', 1], ['vn_ssw', 1], ['jp_worker', 2]] },
  site: { shifts: [{ days: WD6, from: 8, to: 17 }], staff: [['jp_boss', 1], ['vn_tts', 2], ['jp_worker', 1]] },
  konbini: { shifts: [{ days: [0, 1, 2, 3, 4, 5, 6], from: 7, to: 15 }], staff: [['jp_worker', 1]] },
  super: { shifts: [{ days: WD6, from: 9, to: 18 }], staff: [['jp_worker', 1]] },
  ramen: { shifts: [{ days: [1, 2, 3, 4, 5, 6], from: 11, to: 23 }], staff: [['jp_owner', 1], ['vn_student', 1]] },
  teishoku: { shifts: [{ days: WD6, from: 7, to: 15 }], staff: [['jp_owner', 1]] },
  clinic: { shifts: [{ days: WD6, from: 9, to: 18 }], staff: [['jp_doctor', 1]] },
  class: { shifts: [{ days: WD, from: 17, to: 21 }, { days: [5, 6], from: 10, to: 17 }], staff: [['jp_teacher', 1]] },
  remit: { shifts: [{ days: [0, 1, 2, 3, 4, 5, 6], from: 10, to: 19 }], staff: [['vn_clerk', 1]] },
};

const ARCH = {
  vn_tts: { nat: 'vn', age: [20, 30], home: ['dorm', 'apt'], role: 'Thực tập sinh', romance: true },
  vn_ssw: { nat: 'vn', age: [24, 34], home: ['apt'], role: 'Lao động Kỹ năng đặc định', romance: true },
  vn_eng: { nat: 'vn', age: [24, 33], home: ['apt'], role: 'Kỹ sư người Việt', romance: true },
  vn_student: { nat: 'vn', age: [19, 26], home: ['apt'], role: 'Du học sinh làm thêm', romance: true, student: true },
  vn_clerk: { nat: 'vn', age: [28, 45], home: ['apt'], role: 'Nhân viên tiệm chuyển tiền' },
  jp_worker: { nat: 'jp', age: [20, 58], home: ['home_jp'], role: 'Nhân viên người Nhật', romance: true },
  jp_office: { nat: 'jp', age: [23, 40], home: ['home_jp'], role: 'Nhân viên văn phòng', romance: true },
  jp_boss: { nat: 'jp', age: [40, 60], home: ['home_jp'], role: 'Quản lý' },
  jp_owner: { nat: 'jp', age: [45, 70], home: ['home_jp'], role: 'Chủ quán' },
  jp_doctor: { nat: 'jp', age: [40, 65], home: ['home_jp'], role: 'Bác sĩ' },
  jp_teacher: { nat: 'jp', age: [55, 72], home: ['home_jp'], role: 'Giáo viên tình nguyện' },
  jp_elder: { nat: 'jp', age: [68, 88], home: ['home_jp'], role: 'Cụ già trong thị trấn' },
  jp_student: { nat: 'jp', age: [19, 23], home: ['home_jp'], role: 'Sinh viên', romance: true, student: true },
};

// ---------- NPC chính: tham số AI (bối cảnh, lời thoại vẫn ở content/people.js) ----------
const tr = (ext, agr, con, neu, opn, jea, loy, spd, amb, luck) => ({ ext, agr, con, neu, opn, jea, loy, spd, amb, luck });
export const CORE_AI = {
  yamada: { age: 46, traits: tr(0.4, 0.55, 0.9, 0.35, 0.4, 0.2, 0.9, 0.3, 0.6, 0.2), home: 'home_jp', job: { place: 'work', shift: 0, boss: true } },
  kimura: { age: 38, traits: tr(0.2, 0.5, 0.85, 0.3, 0.3, 0.3, 0.8, 0.5, 0.4, 0.5), home: 'home_jp', job: { place: 'work', shift: 0 }, hobby: { place: 'work_corner', days: [0, 1, 2, 3, 4], from: 17, to: 19, w: 2.5 } },
  sato: { age: 79, traits: tr(0.6, 0.9, 0.8, 0.2, 0.5, 0.1, 0.9, 0.2, 0.1, 0.6), home: 'home_jp', job: null, hobby: { place: 'dorm_front', days: [0, 1, 2, 3, 4, 5, 6], from: 7, to: 12, w: 2.5 } },
  long: { age: 27, traits: tr(0.85, 0.75, 0.6, 0.35, 0.6, 0.3, 0.7, 0.6, 0.5, 0.5), home: 'dorm', job: { place: 'parts', shift: 0 }, hobby: { place: 'konbini_front', days: [0, 1, 2, 3, 4], from: 18, to: 22, w: 1.4 } },
  ha: { age: 23, traits: tr(0.55, 0.8, 0.75, 0.45, 0.5, 0.5, 0.85, 0.3, 0.5, 0.4), home: 'dorm', job: { place: 'bento', shift: 0 } },
  tuan: { age: 22, traits: tr(0.7, 0.65, 0.55, 0.4, 0.7, 0.4, 0.6, 0.5, 0.7, 0.3), home: 'apt', job: { place: 'konbini', shift: 'eve' }, student: true },
  yui: { age: 26, traits: tr(0.7, 0.85, 0.7, 0.3, 0.85, 0.35, 0.8, 0.4, 0.5, 0.3), home: 'home_jp', job: { place: 'it', shift: 0 }, hobby: { place: 'center', days: [5, 6], from: 10, to: 17, w: 3, act: 'volunteer' } },
  kenta: { age: 21, traits: tr(0.75, 0.7, 0.5, 0.35, 0.9, 0.3, 0.7, 0.5, 0.6, 0.4), home: 'home_jp', job: null, student: true, hobby: { place: 'center', days: [5, 6], from: 11, to: 16, w: 2.2 } },
  mai: { age: 29, traits: tr(0.6, 0.75, 0.9, 0.25, 0.7, 0.3, 0.85, 0.25, 0.85, 0.2), home: 'apt', job: { place: 'electric', shift: 0 }, hobby: { place: 'center', days: [6], from: 13, to: 17, w: 2.5, act: 'social' } },
  daiki: { age: 31, traits: tr(0.8, 0.6, 0.6, 0.4, 0.5, 0.4, 0.7, 0.6, 0.5, 0.6), home: 'home_jp', job: { place: 'logistics', shift: 0 }, hobby: { place: 'park', days: [6], from: 8, to: 12, w: 3, act: 'sport' } },
};
// Ca tối đặc biệt của Tuấn (du học sinh: tối đa 28 giờ/tuần)
export const SPECIAL_SHIFTS = { eve: { days: [0, 1, 2, 3, 4, 5], from: 18, to: 23 } };

export const pick = (arr, ...seed) => arr[Math.floor(rnd(...seed) * arr.length)];
export const between = (a, b, ...seed) => a + Math.floor(rnd(...seed) * (b - a + 1));

export function makeTraits(seed) {
  const t = {};
  for (const k of ['ext', 'agr', 'con', 'neu', 'opn', 'jea', 'loy', 'spd', 'amb', 'luck']) t[k] = Math.round(Math.min(0.95, Math.max(0.05, 0.5 + (rnd(seed, k) + rnd(seed, k, 2) - 1) * 0.6)) * 100) / 100;
  return t;
}
export function makeLook(nat, gender, age, seed) {
  const hair = age >= 65 ? pick(['#d4d4da', '#b8b8c0', '#9a9aa2'], seed, 'h') : nat === 'jp' ? pick(['#1e1a1a', '#3b2a20', '#6b4226', '#9c5a2e'], seed, 'h') : pick(['#1e1a1a', '#2b1d16', '#3b2a20'], seed, 'h');
  return { hair, shirt: pick(LOOK.shirt, seed, 's'), pants: pick(LOOK.pants, seed, 'p'), skin: pick(nat === 'jp' ? ['#f6d7b8', '#f1d3b5', '#eac39c'] : ['#eac39c', '#e2b48c', '#d9a77c'], seed, 'k'), gender };
}
export function likesOf(t) {
  const l = [];
  if (t.spd > 0.55) l.push('beer'); if (t.agr > 0.6) l.push('flower'); if (t.opn > 0.55) l.push('vncoffee'); if (!l.length || t.con > 0.6) l.push('sweets');
  return l.slice(0, 2);
}

// Lời thoại sinh theo quy luật: theo quốc tịch + mức thân thiết + chi tiết tiểu sử
export function makeLines(d) {
  const b = d.bio;
  if (d.jp) return [
    `${d.name} gật đầu chào: 「どうも」.`,
    `${d.name} kể quê ở ${b.que}, ${b.hoanCanh}.`,
    `${d.name} rủ bạn cuối tuần đi ${b.soThich} cùng.`,
    `${d.name} tâm sự thật lòng: ${b.biMat}.`,
  ];
  return [
    `${d.name} chào: "Bạn cũng ở Việt Nam sang à? Mình người ${b.que}."`,
    `${d.name} kể sang Nhật để ${b.lyDo}.`,
    `${d.name} chia sẻ: ${b.hoanCanh}, mục tiêu là ${b.mucTieu}.`,
    `${d.name} hạ giọng: "Nói riêng bạn thôi nhé… mình ${b.biMat}."`,
  ];
}

export function generateWorld(seed) {
  const defs = {};
  let n = 0;
  const add = (arch, job, extra = {}) => {
    const A = ARCH[arch];
    const id = `g${n++}`;
    const s = `${seed}:${id}`;
    const gender = rnd(s, 'g') < 0.5 ? 'm' : 'f';
    const nat = A.nat;
    const L = nat === 'jp' ? JP : VN;
    const name = nat === 'jp' ? `${pick(L.ho, s, 'ho')} ${pick(L[gender], s, 'ten')}` : `${pick(L[gender], s, 'ten')}`;
    const age = between(A.age[0], A.age[1], s, 'age');
    const traits = makeTraits(s);
    const bio = nat === 'jp'
      ? { que: pick(JP.que, s, 'q'), hoanCanh: pick(JP.hoanCanh, s, 'hc'), soThich: pick(JP.soThich, s, 'st'), biMat: pick(JP.biMat, s, 'bm') }
      : { que: pick(VN.que, s, 'q'), lyDo: pick(VN.lyDo, s, 'ld'), hoanCanh: pick(VN.hoanCanh, s, 'hc'), mucTieu: pick(VN.mucTieu, s, 'mt'), biMat: pick(VN.biMat, s, 'bm') };
    const home = pick(A.home, s, 'home');
    const placeName = job ? AI_PLACES[job.place].name : '';
    const d = {
      id, gen: true, name: nat === 'jp' ? `${name.split(' ')[0]}-san` : name, fullName: name, gender, age, jp: nat === 'jp', nat,
      role: `${A.role}${placeName ? ' · ' + placeName : ''}`, group: job && WORKPLACES[job.place] && AI_PLACES[job.place].kind === 'work' ? 'Đồng nghiệp & chỗ làm' : nat === 'vn' ? 'Cộng đồng Việt' : 'Người trong thị trấn',
      look: makeLook(nat, gender, age, s), traits, bio, home, job, student: !!A.student,
      romance: !!A.romance && age >= 20 && age <= 40, orientation: rnd(s, 'or') < 0.08 ? 'homo' : rnd(s, 'or2') < 0.06 ? 'bi' : 'hetero',
      likes: likesOf(traits), hobby: null, ...extra,
    };
    d.intro = nat === 'jp'
      ? `${d.fullName}, ${age} tuổi, quê ở ${bio.que}, ${bio.hoanCanh}. Thích ${bio.soThich}.`
      : `${d.fullName}, ${age} tuổi, quê ${bio.que}. Sang Nhật để ${bio.lyDo}; ${bio.hoanCanh}.`;
    d.lines = makeLines(d);
    d.perks = ['', '', 'Chia sẻ tin tức, rủ bạn đi chơi', `Có thể giới thiệu việc ở ${placeName || 'chỗ quen'}`];
    // thói quen sinh theo tính cách (không viết tay)
    if (traits.luck > 0.7) d.hobby = { place: 'shrine', days: [5, 6], from: 9, to: 12, w: 1.6, act: 'worship' };
    else if (traits.ext > 0.7 && rnd(s, 'hb') < 0.5) d.hobby = { place: 'park', days: [6], from: 8, to: 12, w: 2.2, act: 'sport' };
    else if (traits.amb > 0.7 && nat === 'vn') d.hobby = { place: 'class', days: [0, 1, 2, 3, 4], from: 18, to: 21, w: 1.8, act: 'study' };
    defs[id] = d;
    return d;
  };
  for (const [place, W] of Object.entries(WORKPLACES)) {
    for (const [arch, count] of W.staff) for (let i = 0; i < count; i++) {
      const shift = W.shifts.length > 1 ? Math.floor(rnd(seed, place, arch, i) * W.shifts.length) : 0;
      add(arch, { place, shift, boss: arch === 'jp_boss' || arch === 'jp_owner' || arch === 'jp_doctor' || arch === 'jp_teacher' });
    }
  }
  for (let i = 0; i < 3; i++) add('jp_elder', null, { hobby: { place: rnd(seed, 'eld', i) < 0.5 ? 'park' : 'shrine', days: [0, 1, 2, 3, 4, 5, 6], from: 8, to: 11, w: 2, act: 'leisure' } });
  for (let i = 0; i < 2; i++) add('jp_student', null);
  for (let i = 0; i < 2; i++) add('vn_student', { place: 'teishoku', shift: 0 });
  return defs;
}

// Đăng ký NPC vào danh sách dùng chung (social.js đọc PEOPLE)
const CORE_IDS = Object.keys(PEOPLE);
export function registerWorld(S) {
  for (const k of Object.keys(PEOPLE)) if (!CORE_IDS.includes(k)) delete PEOPLE[k];
  for (const id of CORE_IDS) Object.assign(PEOPLE[id], { id, core: true, nat: PEOPLE[id].jp ? 'jp' : 'vn', ...CORE_AI[id] });
  Object.assign(PEOPLE, S.world.defs);
}
export function ensureWorld(S) {
  if (!S.world) S.world = { seed: Math.floor(Math.random() * 1e9), mood: {}, moodAdj: {}, pairs: {}, gossip: [] };
  if (!S.world.defs) S.world.defs = generateWorld(S.world.seed);
  registerWorld(S);
  return S.world;
}
export { PEOPLE };
