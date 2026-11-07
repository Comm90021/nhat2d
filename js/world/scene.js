// Cảnh thế giới: vẽ bản đồ hiện tại (ngoài trời hoặc trong nhà), người chơi, NPC theo AI, xe, tàu,
// ngày/đêm, thời tiết, chuyển cảnh mờ dần, mục tiêu tương tác và mũi tên chỉ đường.
import { G, seasonIdx, tickNeeds, TIME_RATE, isWorkday, dow, MIDNIGHT, isNewYear } from '../state.js';
import { input } from '../input.js';
import { TS, hash2, rect, pick, text, pill, drawPerson, drawCat, drawCar } from '../pixel.js';
import { buildTown, buildIndustrial, buildResidential, renderStatic, entrance } from './maps.js';
import { buildInterior, renderInterior } from './interior.js';
import { drawObjectAnim } from './objects.js';
import { findPath } from './path.js';
import { T, SOLID } from './tiles.js';
import { INTERIOR_OF } from '../content/interiors.js';
import { PEOPLE, AI_PLACES } from '../ai/world.js';
import { stateOf, moodInfo, ids as npcIds } from '../ai/sim.js';
import { ACT } from '../ai/rules.js';
import { drawEmote, emoteFor, drawCloud } from '../anim.js';
import { JOBS, LOOK } from '../data.js';
import { canRegister } from '../exam.js';
import { availableTest, testBlockReason, TESTS } from '../career.js';
import { assetEffect } from '../finance.js';
import { myPlace, workName } from '../jobs.js';
import { homesVer, unitLabel } from '../homes.js';

// ---------- bản đồ ----------
const MAPS = {};
export function getMap(id) {
  if (!MAPS[id]) {
    if (id === 'town') MAPS[id] = buildTown();
    else if (id === 'minato') MAPS[id] = buildIndustrial();
    else if (id === 'jutaku') MAPS[id] = buildResidential();
    else if (id.startsWith('int:')) { MAPS[id] = buildInterior(id.slice(4)); MAPS[id].ver = homesVer; }
  } else if (id.startsWith('int:unit:') && MAPS[id].ver !== homesVer) {
    // nội thất căn hộ phụ thuộc người ở → dựng lại khi thế giới đổi
    MAPS[id] = buildInterior(id.slice(4)); MAPS[id].ver = homesVer; delete statics[id + ':0'];
  }
  return MAPS[id];
}
const statics = {};
function staticOf(M, si) {
  const k = M.id + ':' + (M.outdoor ? si : 0);
  if (!statics[k]) statics[k] = M.outdoor ? renderStatic(M, si) : renderInterior(M);
  return statics[k];
}
export function invalidateMap() { for (const k in statics) if (!k.startsWith('int:')) delete statics[k]; }

export const curMap = (S) => getMap(S.map || 'town');
const orig = (S) => S.origJob || S.job;
export function interiorKeyFor(S, bId) { return bId === 'work' ? 'work_' + orig(S) : INTERIOR_OF[bId] || null; }
export const placeInterior = (S, place) => (place === 'work' ? 'work_' + orig(S) : AI_PLACES[place] && AI_PLACES[place].interior) || null;
export function buildingName(b, S) { return b.id === 'work' && S ? JOBS[orig(S)].place : b.name; }
export function findBuilding(id) {
  for (const mid of ['town', 'minato', 'jutaku']) { const M = getMap(mid); const b = M.buildings.find((x) => x.id === id); if (b) return { M, b }; }
  return null;
}

// ---------- vị trí người chơi ----------
export function placePlayer(id = 'dorm') {
  const S = G.S;
  const fb = findBuilding(id) || findBuilding('dorm');
  const e = entrance(fb.b);
  const key = interiorKeyFor(S, fb.b.id);
  if (key) {
    const I = getMap('int:' + key);
    S.map = I.id;
    S.ret = { map: fb.M.id, x: e.x, y: e.y + 2 };
    const mine = I.slots.mysleep || I.slots.sleep;
    const bed = id === 'dorm' && mine ? mine[0] : null;
    S.pos = bed ? { x: bed.x * TS + 8, y: (bed.y + 2) * TS + 4 } : { ...I.entry };
    if (S.pos && I.blockedTile(Math.floor(S.pos.x / TS), Math.floor((S.pos.y - 2) / TS))) S.pos = { ...I.entry };
  } else {
    S.map = fb.M.id;
    S.pos = { x: e.x, y: e.y + 2 };
  }
  S.dir = 'down';
  S.retStack = [];
  travelers.length = 0;
}

// ---------- va chạm ----------
function solidPx(M, px, py) {
  const tx = Math.floor(px / TS), ty = Math.floor(py / TS);
  if (tx < 0 || ty < 0 || tx >= M.w || ty >= M.h) return true;
  if (!M.outdoor) return M.blockedTile(tx, ty);
  return SOLID.has(M.at(tx, ty)) || M.decorSolid.has(tx + ',' + ty);
}
const blocked = (M, x, y) => solidPx(M, x - 4, y - 4) || solidPx(M, x + 4, y - 4) || solidPx(M, x - 4, y) || solidPx(M, x + 4, y);

// ---------- chuyển cảnh mờ dần ----------
const fade = { a: 0, dir: 0, cb: null };
export function transition(cb) {
  return new Promise((res) => {
    fade.dir = 1; fade.cb = () => { cb(); fade.dir = -1; setTimeout(res, 260); };
  });
}
export async function enterBuilding(bId) {
  const S = G.S;
  const key = interiorKeyFor(S, bId);
  const fb = findBuilding(bId);
  if (!key || !fb) return false;
  await transition(() => {
    const I = getMap('int:' + key);
    const e = entrance(fb.b);
    S.ret = { map: fb.M.id, x: e.x, y: e.y + 2 };
    S.map = I.id;
    S.pos = { ...I.entry };
    S.dir = 'up';
    S.retStack = [];
    travelers.length = 0;
  });
  return true;
}
// Vào một căn hộ từ hành lang tòa nhà (lối ra quay về hành lang)
export async function enterUnit(uid) {
  const S = G.S;
  const M = curMap(S);
  const I = getMap('int:unit:' + uid);
  await transition(() => {
    S.retStack = [...(S.retStack || []), S.ret];
    S.ret = { map: M.id, x: S.pos.x, y: S.pos.y };
    S.map = I.id; S.pos = { ...I.entry }; S.dir = 'up';
  });
}
export async function exitBuilding() {
  const S = G.S;
  if (!S.ret) return;
  await transition(() => {
    S.map = S.ret.map; S.pos = { x: S.ret.x, y: S.ret.y }; S.dir = 'down';
    S.ret = S.retStack && S.retStack.length ? S.retStack.pop() : null;
    travelers.length = 0; lastHourKey = '';
  });
}
export async function travelTo(mapId) {
  const S = G.S;
  const st = mapId === 'minato' ? 'station2' : 'station';
  await transition(() => {
    const fb = findBuilding(st);
    const e = entrance(fb.b);
    S.map = mapId; S.pos = { x: e.x, y: e.y + 2 }; S.dir = 'down'; S.ret = null; S.retStack = [];
    travelers.length = 0; lastHourKey = '';
    train.t = 0.2;
  });
}

// ---------- tự đi bộ tới đích (chọn trên bản đồ) ----------
let auto = null;   // { path, i, map, stuck }
const blockedTile = (M) => (x, y) => SOLID.has(M.at(x, y)) || M.decorSolid.has(x + ',' + y);
export function autoWalkTo(S, px, py) {
  const M = curMap(S);
  if (!M.outdoor) return false;
  const path = findPath(M.w, M.h, blockedTile(M), Math.floor(S.pos.x / TS), Math.floor((S.pos.y - 2) / TS), Math.floor(px / TS), Math.floor((py - 2) / TS), 8000);
  if (!path || !path.length) return false;
  auto = { path, i: 0, map: M.id, stuck: 0 };
  return true;
}
export const autoWalking = () => !!auto;
export const cancelAutoWalk = () => { auto = null; };
// Bản đồ ngoài trời mà người chơi đang ở (kể cả khi đang trong nhà)
export function outdoorMapId(S) {
  if (curMap(S).outdoor) return S.map;
  for (const r of [S.ret, ...[...(S.retStack || [])].reverse()]) if (r && getMap(r.map).outdoor) return r.map;
  return 'town';
}
// Ra thẳng ngoài trời (từ căn hộ → hành lang → ngoài đường) trong một lần chuyển cảnh
export async function leaveToOutdoor(S) {
  if (curMap(S).outdoor) return;
  const chain = [S.ret, ...[...(S.retStack || [])].reverse()].filter(Boolean);
  const out = chain.find((r) => getMap(r.map).outdoor);
  if (!out) return;
  await transition(() => { S.map = out.map; S.pos = { x: out.x, y: out.y }; S.dir = 'down'; S.ret = null; S.retStack = []; travelers.length = 0; lastHourKey = ''; });
}
// Đi xe buýt / taxi: tới thẳng điểm đích
export async function teleportTo(S, mapId, x, y) {
  auto = null;
  await transition(() => { S.map = mapId; S.pos = { x, y }; S.dir = 'down'; S.ret = null; S.retStack = []; travelers.length = 0; lastHourKey = ''; });
}
export const mapImage = (M, si) => staticOf(M, si);

// ---------- người đi đường và xe (không gắn với AI) ----------
const ambient = { mapId: '', walkers: [], cars: [] };
const CAR_COLORS = ['#e74c3c', '#ecf0f1', '#2c3e50', '#3498db', '#f1c40f', '#95a5a6', '#27ae60'];
function randomLook() { return { hair: pick(LOOK.hair), shirt: pick(LOOK.shirt), pants: pick(LOOK.pants), skin: pick(LOOK.skin), gender: Math.random() < 0.5 ? 'f' : 'm' }; }
function spawnAmbient(M) {
  ambient.mapId = M.id; ambient.walkers = []; ambient.cars = [];
  if (!M.outdoor) return;
  const lanes = [...M.walkLanes.h.map((l) => ({ h: true, l })), ...M.walkLanes.v.map((l) => ({ h: false, l }))];
  for (let i = 0; i < 3; i++) {
    const L = lanes[i % lanes.length];
    const [at, a, b] = L.l;
    ambient.walkers.push({ horiz: L.h, lane: at, a: a * TS, b: b * TS, p: (a + Math.random() * (b - a)) * TS, d: Math.random() < 0.5 ? 1 : -1, sp: 14 + Math.random() * 10, look: randomLook(), t: Math.random() * 5 });
  }
  for (let i = 0; i < 5; i++) {
    const L = M.carLanes[i % M.carLanes.length];
    ambient.cars.push({ L, p: Math.random() * L.len * TS, len: L.len * TS, sp: 45 + Math.random() * 25, col: pick(CAR_COLORS), wait: 0 });
  }
}

// ---------- tàu chạy qua ga ----------
const train = { t: -1, next: 40 };

// ---------- NPC trên bản đồ hiện tại ----------
// travelers: NPC đang đi bộ giữa hai địa điểm trên bản đồ hiện tại (hiển thị thật)
const travelers = [];
let lastHourKey = '', prevPlaces = {};
// Đường đi giữa các khu: Hikari-dai ↔ thị trấn (đi bộ qua mép đường), thị trấn ↔ Minato (tàu)
export function nextHop(from, to) {
  if (from === to) return null;
  if (from === 'jutaku') return 'town';
  if (from === 'town') return to === 'jutaku' ? 'jutaku' : 'minato';
  return 'town';
}
// Điểm rời khu hiện tại để tới khu `to`: mép đường hoặc cửa ga
export function exitPoint(M, to) {
  const hop = nextHop(M.id, to);
  const e = (M.edges || []).find((x) => x.to === hop);
  if (e) return { x: e.side === 'w' ? 10 : M.w * TS - 10, y: e.y0 * TS + 12, edge: e };
  const st = M.buildings.find((b) => b.id === (M.id === 'minato' ? 'station2' : 'station'));
  return st ? entrance(st) : null;
}
function walkEdge(S, e) {
  if (fade.dir) return;
  const T = getMap(e.to);
  const back = (T.edges || []).find((x) => x.to === S.map);
  const ty = Math.floor(S.pos.y / TS);
  transition(() => {
    S.map = e.to;
    const yy = back ? Math.min(back.y1, Math.max(back.y0, ty)) : ty;
    S.pos = { x: back && back.side === 'w' ? 20 : T.w * TS - 20, y: yy * TS + 10 };
    S.dir = back && back.side === 'w' ? 'right' : 'left';
    S.ret = null; S.retStack = [];
    travelers.length = 0; lastHourKey = '';
  });
}
function placePoint(M, place, idx = 0) {
  const P = AI_PLACES[place];
  if (!P) return null;
  if (P.map !== M.id) {
    // ở bản đồ khác → đi về ga; ở 'off' (nhà riêng, trường) → mép bản đồ
    if (P.map === 'off') return M.id === 'town' ? { x: 1 * TS, y: 15 * TS + 10 } : { x: (M.w - 1) * TS, y: 12 * TS + 10 };
    return exitPoint(M, P.map);
  }
  if (P.spot) {
    const list = M.aiSpots[P.spot] || [[M.spots[0].tx, M.spots[0].ty]];
    const [tx, ty] = list[idx % list.length];
    return { x: tx * TS + 8, y: ty * TS + 12, spot: true };
  }
  const bid = place === 'work' ? 'work' : P.building || place;
  const b = M.buildings.find((x) => x.id === bid) || M.buildings.find((x) => x.id === (place === 'apt' ? 'apt' : ''));
  if (!b) return null;
  const e = entrance(b);
  return { x: e.x, y: e.y };
}
function onHourChange(S, M) {
  const key = `${S.day}:${Math.floor(S.time / 60)}:${M.id}`;
  if (key === lastHourKey) return;
  const first = lastHourKey === '' || !lastHourKey.endsWith(M.id);
  lastHourKey = key;
  if (!M.outdoor) { prevPlaces = {}; return; }
  const list = npcIds();
  const cur = {};
  for (const id of list) cur[id] = stateOf(S, id).place;
  if (!first) {
    let n = 0;
    for (const id of list) {
      if (n >= 18) break;
      const a = prevPlaces[id], b = cur[id];
      if (!a || a === b) continue;
      const pa = AI_PLACES[a], pb = AI_PLACES[b];
      if (!pa || !pb) continue;
      if (pa.map !== M.id && pb.map !== M.id) continue;
      if (pa.map === 'off' && pb.map === 'off') continue;
      const A = placePoint(M, a, hash2(id.length, 3, 1) * 10 | 0), B = placePoint(M, b, hash2(id.length, 5, 2) * 10 | 0);
      if (!A || !B) continue;
      const path = findPath(M.w, M.h, (x, y) => SOLID.has(M.at(x, y)) || M.decorSolid.has(x + ',' + y), Math.floor(A.x / TS), Math.floor((A.y - 2) / TS), Math.floor(B.x / TS), Math.floor((B.y - 2) / TS), 3000);
      if (!path || !path.length) continue;
      travelers.push({ id, x: A.x, y: A.y, path, i: 0, t: Math.random() * 3, dir: 'down', delay: Math.random() * 6 });
      n++;
    }
  }
  prevPlaces = cur;
}
function updateTravelers(dt) {
  for (let i = travelers.length - 1; i >= 0; i--) {
    const w = travelers[i];
    w.t += dt;
    if (w.delay > 0) { w.delay -= dt; continue; }
    const node = w.path[w.i];
    if (!node) { travelers.splice(i, 1); continue; }
    const tx = node[0] * TS + 8, ty = node[1] * TS + 12;
    const dx = tx - w.x, dy = ty - w.y, d = Math.hypot(dx, dy), sp = 34 * dt;
    if (d <= sp) { w.x = tx; w.y = ty; w.i++; } else { w.x += (dx / d) * sp; w.y += (dy / d) * sp; }
    w.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
  }
}
// NPC đứng ở các điểm ngoài trời (công viên, trước ký túc xá…)
function spotNpcs(S, M) {
  const out = [];
  const busy = new Set(travelers.filter((w) => w.delay <= 0).map((w) => w.id));
  const count = {};
  for (const id of npcIds()) {
    if (busy.has(id)) continue;
    const st = stateOf(S, id);
    const P = AI_PLACES[st.place];
    if (!P || !P.spot || P.map !== M.id) continue;
    const list = M.aiSpots[P.spot];
    if (!list) continue;
    const k = count[P.spot] = (count[P.spot] || 0) + 1;
    const [tx, ty] = list[(k - 1) % list.length];
    const off = Math.floor((k - 1) / list.length) * 6;
    out.push({ id, x: tx * TS + 8 + off, y: ty * TS + 12, st, dir: st.act === 'sport' ? (Math.floor(tAnim + k) % 2 ? 'left' : 'right') : 'down', moving: st.act === 'sport' && Math.floor(tAnim * 2 + k) % 3 === 0 });
  }
  return out;
}
// NPC trong nhà: xếp vào chỗ theo hoạt động
const SLOT_PREF = {
  work: ['work', 'staff', 'boss'], boss: ['boss', 'staff', 'work'], staff: ['staff', 'work'], eat: ['eat', 'rest'], shop: ['shop'],
  home: ['rest', 'study', 'cook'], sleep: ['sleep'], study: ['study', 'rest'], leisure: ['rest'], social: ['rest', 'eat'],
  volunteer: ['rest'], health: ['patient'], hobby: ['rest'],
};
function interiorNpcs(S, M) {
  const out = [];
  const taken = new Set();
  // ký túc xá chia phòng nam / nữ: chỉ thấy bạn cùng phòng cùng giới
  const sameRoom = (id) => M.key !== 'dorm' || stateOf(S, id).place !== 'dorm' || PEOPLE[id].gender === (S.gender || 'm');
  const list = npcIds().filter((id) => placeInterior(S, stateOf(S, id).place) === M.key && sameRoom(id)).sort();
  for (const id of list) {
    const d = PEOPLE[id], st = stateOf(S, id);
    const staffish = st.act === 'work' && (d.job && d.job.boss) ? 'boss' : st.act === 'work' && ['konbini', 'super', 'clinic', 'remit', 'class', 'ramen', 'teishoku'].includes(st.place) ? 'staff' : st.act;
    const prefs = SLOT_PREF[staffish] || ['rest'];
    let slot = null;
    for (const kind of prefs) {
      const sl = M.slots[kind] || [];
      if (!sl.length) continue;
      const start = Math.floor(hash2(id.length * 7, id.charCodeAt(id.length - 1), 1) * sl.length);
      for (let k = 0; k < sl.length; k++) { const s = sl[(start + k) % sl.length]; if (!taken.has(s.x + ',' + s.y)) { slot = s; break; } }
      if (slot) break;
    }
    if (!slot) { const e = M.entry; out.push({ id, x: e.x + ((out.length % 5) - 2) * 10, y: e.y - 18 - Math.floor(out.length / 5) * 10, st, dir: 'down' }); continue; }
    taken.add(slot.x + ',' + slot.y);
    const pose = st.act === 'sleep' && slot.sit ? 'sleep' : slot.sit ? 'sit' : st.act === 'work' && !staffish.includes('boss') ? 'work' : undefined;
    out.push({ id, x: slot.x * TS + 8, y: slot.y * TS + (slot.sit ? 10 : 13), st, dir: slot.face || 'down', pose });
  }
  return out;
}

// ---------- mục tiêu gợi ý ----------
export function objective(S) {
  const t = S.time;
  if (S.today.appt && !S.today.appt.done && t < S.today.appt.at + 120) {
    const a = S.today.appt;
    return { text: `💬 Hẹn ${PEOPLE[a.id].name} lúc ${Math.floor(a.at / 60)}:00 ở ${AI_PLACES[a.place].name}`, target: a.place };
  }
  if (t >= 22 * 60) return { text: '🌙 Khuya rồi — về Ký túc xá ngủ trước 0:00', target: 'dorm' };
  const wp = myPlace(S);
  if (!wp) return { text: '💼 Bạn đang thất nghiệp — mở 📱 → Việc làm để tìm việc', target: null };
  if (isWorkday(S) && !S.worked && !S.today.noWork && !S.today.sickLeave && t <= 10 * 60)
    return { text: t <= 8 * 60 ? `🏭 Đến ${workName(S)} trước 08:00${AI_PLACES[wp] && AI_PLACES[wp].map === 'minato' ? ' (khu Minato, đi tàu)' : ''}` : '🏃 Muộn rồi! Chạy nhanh đến chỗ làm!', target: wp };
  const tid = availableTest(S);
  if (tid && isWorkday(S) && !S.worked && t <= 10 * 60 && !testBlockReason(S, tid))
    return { text: `📋 Có thể thi tay nghề ${TESTS[tid].name} ở chỗ làm${tid === 'kiso' ? ' — bắt buộc để gia hạn visa!' : ''}`, target: wp };
  if (S.career.visa === 'tts1' && !S.career.passed.kiso && S.career.end - S.day <= 14)
    return { text: '❗ Visa sắp hết — phải đỗ thi tay nghề 基礎級 (ngày thường, trước 10:00, ở chỗ làm)', target: wp };
  if (S.sick > 0) return { text: '🤒 Bạn đang ốm — đến phòng khám hoặc mua thuốc ở konbini', target: t >= 9 * 60 && t < 18 * 60 && dow(S) !== 6 ? 'clinic' : 'konbini' };
  if (S.full < 25) return { text: '🍙 Đói bụng — mua đồ ăn ở konbini / siêu thị hoặc về nấu', target: 'konbini' };
  if (S.energy < 20) return { text: '😪 Kiệt sức — về ký túc xá nghỉ ngơi', target: 'dorm' };
  if (S.today.matsuri && t >= 17 * 60) return { text: '🏮 Lễ hội mùa hè đang diễn ra ở công viên!', target: 'park' };
  if (isNewYear(S)) return { text: '⛩️ Năm mới — ghé đền đi lễ đầu năm', target: 'shrine' };
  if (S.exam && !S.exam.taken) return { text: `📝 Đã đăng ký thi JLPT ${S.exam.lv} — ôn bài ở lớp hoặc tự học trong ký túc xá`, target: (dow(S) < 5 && t >= 17.5 * 60 && t < 21 * 60) || (dow(S) >= 5 && t >= 10 * 60 && t < 17 * 60) ? 'class' : 'dorm' };
  if (canRegister(S)) return { text: '📝 Đang mở đăng ký thi JLPT — đăng ký qua mạng ở bàn học trong ký túc xá', target: 'dorm' };
  if (dow(S) === 5 && !S.worked && t <= 9 * 60) return { text: '⏱️ Thứ Bảy: có thể làm thêm buổi sáng (đến trước 09:00)', target: wp };
  if (S.money >= 25000 && S.debt > 0 && t >= 10 * 60 && t < 19 * 60) return { text: '💸 Có tiền rồi — ghé tiệm chuyển tiền gửi về trả nợ', target: 'remit' };
  if (!S.today.class && ((dow(S) < 5 && t >= 17.5 * 60 && t < 21 * 60) || (dow(S) >= 5 && t >= 10 * 60 && t < 17 * 60)))
    return { text: '📝 Lớp tiếng Nhật đang mở — học miễn phí', target: 'class' };
  return { text: '🌿 Thời gian tự do — đi dạo, nói chuyện, học tiếng Nhật… (📱 xem ai đang ở đâu)', target: null };
}
// Điểm đích của mũi tên trên bản đồ hiện tại
function arrowPoint(S, M, target) {
  if (!target) return null;
  if (!M.outdoor) {
    const here = M.key === placeInterior(S, target);
    if (here) return null;
    return { x: M.door.x * TS + 8, y: M.door.y * TS + 8 };
  }
  const P = AI_PLACES[target];
  const bmap = P ? P.map : 'town';
  if (bmap !== M.id && bmap !== 'off') return exitPoint(M, bmap);
  const b = M.buildings.find((x) => x.id === ((P && P.building) || target));
  if (b) return entrance(b);
  const s = M.spots.find((x) => x.id === target);
  return s ? { x: s.tx * TS + 8, y: s.ty * TS + 12 } : null;
}

// ---------- ngày / đêm, thời tiết ----------
function darkness(t) {
  const h = t / 60, D = 0.72;
  if (h < 5) return D;
  if (h < 7) return D * (1 - (h - 5) / 2);
  if (h < 17) return 0;
  if (h < 19.5) return D * ((h - 17) / 2.5);
  return D;
}
let shadeCanvas = null;
const parts = [];
function updateParticles(dt, vw, vh, kind) {
  const want = kind === 'rain' ? 90 : kind === 'snow' ? 70 : kind === 'petal' || kind === 'leaf' ? 14 : 0;
  while (parts.length < want) parts.push({ x: Math.random() * vw, y: Math.random() * vh, s: Math.random() });
  if (parts.length > want) parts.length = want;
  for (const p of parts) {
    if (kind === 'rain') { p.x -= 40 * dt; p.y += 230 * dt; }
    else if (kind === 'snow') { p.x += Math.sin((p.y + p.s * 50) / 14) * 10 * dt; p.y += (14 + p.s * 14) * dt; }
    else { p.x += (18 + p.s * 10) * dt; p.y += (12 + p.s * 8) * dt; }
    if (p.y > vh) { p.y = -4; p.x = Math.random() * vw; }
    if (p.x < -4) p.x = vw; if (p.x > vw + 4) p.x = 0;
  }
}
function drawParticles(c, kind) {
  for (const p of parts) {
    if (kind === 'rain') rect(c, 'rgba(180,205,255,.55)', Math.round(p.x), Math.round(p.y), 1, 4);
    else if (kind === 'snow') rect(c, '#fff', Math.round(p.x), Math.round(p.y), p.s > 0.6 ? 2 : 1, p.s > 0.6 ? 2 : 1);
    else if (kind === 'petal') rect(c, '#f7b7cc', Math.round(p.x), Math.round(p.y), 2, 1);
    else rect(c, p.s > 0.5 ? '#d9662f' : '#e3a33a', Math.round(p.x), Math.round(p.y), 2, 2);
  }
}

// ---------- cảnh ----------
let tAnim = 0, moving = false, lastTargetLabel = null;
export const player = { pose: null };
let drawn = [];   // NPC đang hiển thị (để chọn mục tiêu)

function findTarget(S, M) {
  const px = S.pos.x, py = S.pos.y;
  let best = null, bd = 17;
  if (M.outdoor) {
    for (const b of M.buildings) {
      const e = entrance(b), d = Math.hypot(e.x - px, e.y - 4 - py);
      if (d < bd) { bd = d; best = { type: 'building', id: b.id, label: 'Vào ' + buildingName(b, S) }; }
    }
    for (const s of M.spots) {
      if (!s.interact) continue;
      const d = Math.hypot(s.tx * TS + 8 - px, s.ty * TS + 12 - py);
      if (d < bd) { bd = d; best = { type: 'place', id: s.id, label: s.name }; }
    }
    if (M.id === 'town') { const d = Math.hypot(9 * TS + 8 - px, 29 * TS + 12 - py); if (d < bd) { bd = d; best = { type: 'npc', id: 'cat', label: 'Mèo mướp' }; } }
  } else {
    const ex = M.door.x * TS + 8, ey = M.door.y * TS + 4;
    const de = Math.hypot(ex - px, ey - py);
    if (de < 16) { bd = de; best = { type: 'exit', label: 'Ra ngoài' }; }
    const workHere = S.emp && S.emp.co && placeInterior(S, S.emp.co) === M.key;
    for (const o of M.objects) {
      if (!o.act && !(workHere && o.slot && o.slot.kind === 'work')) continue;
      const cx = Math.max(o.x * TS, Math.min(px, (o.x + o.w) * TS)), cy = Math.max(o.y * TS, Math.min(py - 4, (o.y + o.h) * TS));
      const d = Math.hypot(cx - px, cy - (py - 4));
      if (d < 13 && d < bd) { bd = d; best = { type: 'obj', obj: o, label: o.act === 'unit' ? unitLabel(S, o.unit) : o.act ? o.name : `${o.name} (vị trí làm việc của bạn)` }; }
    }
  }
  for (const n of drawn) {
    if (n.cat) continue;
    const d = Math.hypot(n.x - px, n.y - py);
    if (d < 20 && d < bd + 6) { bd = d; const P = PEOPLE[n.id]; best = { type: 'npc', id: n.id, label: `${P.name} ${moodInfo(S, n.id).icon} · ${(ACT[n.st.act] || ACT.home).label}` }; }
  }
  return best;
}

export const worldScene = {
  target: null,
  // chạy mỗi khung hình kể cả khi đang có hộp thoại (G.busy) — để chuyển cảnh không bị treo
  tick(dt) {
    if (!fade.dir) return;
    fade.a += fade.dir * dt * 4.5;
    if (fade.dir > 0 && fade.a >= 1) { fade.a = 1; const cb = fade.cb; fade.cb = null; fade.dir = 0; if (cb) cb(); }
    else if (fade.dir < 0 && fade.a <= 0) { fade.a = 0; fade.dir = 0; }
  },
  update(dt) {
    const S = G.S;
    if (!S) return;
    tAnim += dt;
    if (fade.dir || fade.a > 0) return;
    const M = curMap(S);
    if (ambient.mapId !== M.id) spawnAmbient(M);
    const gm = dt * TIME_RATE;
    S.time += gm;
    tickNeeds(S, gm);
    onHourChange(S, M);
    // di chuyển
    let a = player.pose ? { x: 0, y: 0 } : input.axis();
    if (Math.abs(a.x) + Math.abs(a.y) > 0.05) auto = null;            // tự điều khiển → hủy tự đi
    else if (auto && auto.map === M.id) {
      const node = auto.path[auto.i];
      if (!node) auto = null;
      else {
        const tx = node[0] * TS + 8, ty = node[1] * TS + 11, dx = tx - S.pos.x, dy = ty - S.pos.y, d = Math.hypot(dx, dy);
        if (d < 3) auto.i++; else a = { x: dx / d, y: dy / d };
      }
    } else if (auto) auto = null;
    const before = auto ? S.pos.x + S.pos.y : 0;
    moving = Math.abs(a.x) > 0.05 || Math.abs(a.y) > 0.05;
    if (moving) {
      const sp = (M.outdoor ? 62 * assetEffect(S, 'speed') : 48) * (S.energy < 15 ? 0.7 : 1);
      S.dir = Math.abs(a.x) > Math.abs(a.y) ? (a.x < 0 ? 'left' : 'right') : (a.y < 0 ? 'up' : 'down');
      const nx = S.pos.x + a.x * sp * dt;
      if (!blocked(M, nx, S.pos.y)) S.pos.x = nx;
      const ny = S.pos.y + a.y * sp * dt;
      if (!blocked(M, S.pos.x, ny)) S.pos.y = ny;
      // tự đi mà bị kẹt ở góc → nhích sang ô kế tiếp, kẹt lâu thì dừng
      if (auto) {
        if (Math.abs(S.pos.x + S.pos.y - before) < 0.01) { auto.stuck += dt; if (auto.stuck > 0.35) { const n = auto.path[auto.i]; if (n) S.pos = { x: n[0] * TS + 8, y: n[1] * TS + 11 }; auto.stuck = 0; } }
        else auto.stuck = 0;
      }
      // bước ra cửa trong nhà → ra ngoài
      if (!M.outdoor && S.dir === 'down' && Math.floor(S.pos.y / TS) >= M.door.y - 0 && Math.abs(S.pos.x - (M.door.x * TS + 8)) < 8) { G.pendingExit = true; }
      // đi hết đường ra mép bản đồ → sang khu bên cạnh
      if (M.outdoor && M.edges) for (const e of M.edges) {
        const ty = Math.floor(S.pos.y / TS);
        if (ty >= e.y0 && ty <= e.y1 && ((e.side === 'w' && S.pos.x < 11) || (e.side === 'e' && S.pos.x > M.w * TS - 11))) { walkEdge(S, e); break; }
      }
    }
    // xe, người đi đường, tàu
    const night = S.time < 6 * 60 || S.time > 22 * 60;
    ambient.walkers.forEach((w, i) => {
      w.t += dt;
      if (night && i > 0) return;
      w.p += w.d * w.sp * dt;
      if (w.p < w.a + 4 || w.p > w.b - 4) { w.d *= -1; w.p = Math.max(w.a + 4, Math.min(w.b - 4, w.p)); }
    });
    for (const car of ambient.cars) {
      if (car.wait > 0) { car.wait -= dt; continue; }
      car.p += car.L.d * car.sp * dt;
      if (car.p < -30 || car.p > car.len + 30) { car.p = car.L.d > 0 ? -28 : car.len + 28; car.wait = 1 + Math.random() * 4; car.col = pick(CAR_COLORS); }
    }
    if (M.rails) {
      if (train.t < 0) { train.next -= gm; if (train.next <= 0) { train.t = 0; train.next = 35 + Math.random() * 20; } }
      else { train.t += dt * 0.28; if (train.t > 1) train.t = -1; }
    }
    updateTravelers(dt);
    this.target = findTarget(S, M);
    const lbl = this.target && this.target.label;
    if (lbl !== lastTargetLabel) {
      lastTargetLabel = lbl;
      const btn = document.getElementById('btn-act');
      btn.hidden = !this.target;
      if (this.target) btn.textContent = this.target.type === 'npc' ? '💬' : this.target.type === 'obj' ? '✋' : '🚪';
    }
    if (M.outdoor) {
      const si = seasonIdx(S);
      const kind = S.weather === 'rain' ? 'rain' : S.weather === 'snow' ? 'snow' : si === 0 ? 'petal' : si === 2 ? 'leaf' : '';
      updateParticles(dt, this.vw || 320, this.vh || 240, kind);
    }
  },

  draw(c, view) {
    const S = G.S;
    if (!S) return;
    const M = curMap(S);
    const si = seasonIdx(S);
    const vw = view.w, vh = view.h;
    this.vw = vw; this.vh = vh;
    const mw = M.w * TS, mh = M.h * TS;
    let cx = Math.round(S.pos.x - vw / 2), cy = Math.round(S.pos.y - 10 - vh / 2);
    cx = mw <= vw ? Math.round((mw - vw) / 2) : Math.max(0, Math.min(mw - vw, cx));
    cy = mh <= vh ? Math.round((mh - vh) / 2) : Math.max(0, Math.min(mh - vh, cy));
    rect(c, M.outdoor ? '#1b2238' : '#141a2e', 0, 0, vw, vh);
    c.drawImage(staticOf(M, si), -cx, -cy);
    c.save();
    c.translate(-cx, -cy);
    const ents = [];
    drawn = [];
    if (M.outdoor) {
      // nước lấp lánh
      for (let i = 0; i < 14 && M.id === 'town'; i++) {
        const x = Math.floor(hash2(i, Math.floor(tAnim * 1.5), 3) * mw), y = 35 * TS + 3 + Math.floor(hash2(i, Math.floor(tAnim * 1.5), 8) * 44);
        if (x < 19 * TS || x > 23 * TS) rect(c, 'rgba(255,255,255,.55)', x, y, 3, 1);
      }
      for (const car of ambient.cars) {
        if (car.wait > 0) continue;
        drawCar(c, car.L.h ? car.p : car.L.at * TS + 8, car.L.h ? car.L.at * TS + 8 : car.p, car.L.h, car.col);
      }
      // tàu
      if (M.rails && train.t >= 0) {
        const len = 4 * 26, total = mh + len;
        const y0 = M.rails.dir > 0 ? -len + train.t * total : mh - train.t * total;
        for (let k = 0; k < 4; k++) {
          const ty = Math.round(y0 + k * 26), tx = M.rails.x * TS + 2;
          rect(c, '#e9eef2', tx, ty, 28, 24); rect(c, '#2f6db5', tx, ty + 9, 28, 4); rect(c, '#9cc7e0', tx + 4, ty + 2, 20, 5);
          rect(c, '#9aa3ab', tx, ty + 23, 28, 1);
        }
      }
      ambient.walkers.forEach((w, i) => {
        if ((S.time < 6 * 60 || S.time > 22 * 60) && i > 0) return;
        const x = w.horiz ? w.p : w.lane * TS + 8, y = w.horiz ? w.lane * TS + 12 : w.p;
        ents.push({ y, f: () => drawPerson(c, x, y, w.look, w.horiz ? (w.d > 0 ? 'right' : 'left') : (w.d > 0 ? 'down' : 'up'), w.t, true) });
      });
      if (M.id === 'town') ents.push({ y: 29 * TS + 12, f: () => drawCat(c, 9 * TS + 8, 29 * TS + 12, tAnim) });
      for (const w of travelers) {
        if (w.delay > 0) continue;
        const P = PEOPLE[w.id];
        const n = { id: w.id, x: w.x, y: w.y, st: stateOf(S, w.id) };
        drawn.push(n);
        ents.push({ y: w.y, f: () => drawPerson(c, w.x, w.y, P.look, w.dir, w.t, true) });
      }
      for (const n of spotNpcs(S, M)) {
        drawn.push(n);
        ents.push({ y: n.y, f: () => drawNpc(c, S, n) });
      }
    } else {
      for (const o of M.objects) {
        const busy = (o.kind === 'stove' || o.kind === 'pot') ? (S.time > 6 * 60 && S.time < 22 * 60) : true;
        drawObjectAnim(c, o, tAnim, busy);
      }
      for (const n of interiorNpcs(S, M)) {
        drawn.push(n);
        ents.push({ y: n.y, f: () => drawNpc(c, S, n) });
      }
    }
    ents.push({ y: S.pos.y, f: () => drawPerson(c, S.pos.x, S.pos.y, { ...S.look, gender: S.gender }, player.pose === 'work' ? 'up' : S.dir, tAnim, moving, player.pose || undefined) });
    ents.sort((a, b) => a.y - b.y).forEach((e) => e.f());
    // biểu cảm NPC
    for (const n of drawn) {
      const mi = moodInfo(S, n.id);
      const em = emoteFor(mi.id, n.st.act, tAnim, n.id.length + n.id.charCodeAt(n.id.length - 1));
      if (em) drawEmote(c, n.x, n.y - (n.pose === 'sleep' ? 12 : n.pose === 'sit' ? 18 : 21), em, tAnim);
      else if (mi.id === 'cranky' && n.st.act !== 'sleep') drawCloud(c, n.x, n.y - 23, tAnim);
      const met = S.npc && S.npc[n.id] && S.npc[n.id].met;
      if (!met && n.st.act !== 'sleep' && Math.floor(tAnim * 2) % 6 === 0 && PEOPLE[n.id].core) { rect(c, '#ffcf5a', n.x - 1, n.y - 27, 3, 5); rect(c, '#ffcf5a', n.x - 1, n.y - 21, 3, 2); }
    }
    if (M.outdoor) {
      for (const b of M.buildings) {
        const X = b.x * TS, W = b.w * TS;
        if (X + W < cx - 20 || X > cx + vw + 20) continue;
        if (b.sign) text(c, b.id === 'work' ? JOBS[orig(S)].sign : b.jp, b.sign.x, b.sign.y, { size: 7, color: '#ffe7a3', align: 'center', shadow: false });
        pill(c, buildingName(b, S), X + W / 2, b.y * TS - 5, { size: 6 });
      }
      if (M.id === 'town') pill(c, 'Công viên', 12 * TS + 8, 28 * TS + 6, { size: 6, bg: 'rgba(30,70,40,.8)' });
      for (const e of M.edges || []) pill(c, e.side === 'w' ? `◀ ${e.name}` : `${e.name} ▶`, e.side === 'w' ? 52 : M.w * TS - 52, e.y0 * TS - 4, { size: 6, bg: 'rgba(40,60,110,.85)' });
    }
    if (!M.outdoor) {
      // biển tầng, số phòng trên cửa
      for (const o of M.objects) {
        if (o.text) pill(c, o.text, o.x * TS + 8, o.y * TS + 8, { size: 6, bg: 'rgba(47,62,79,.95)' });
        if (o.room) pill(c, o.room, o.x * TS + 8, o.y * TS + 1, { size: 5, bg: 'rgba(60,45,35,.9)' });
      }
    }
    if (!M.outdoor && this.target && this.target.type === 'obj') {
      const o = this.target.obj;
      c.strokeStyle = 'rgba(255,207,90,.9)'; c.lineWidth = 1;
      c.strokeRect(o.x * TS + 0.5, o.y * TS + 0.5, o.w * TS - 1, o.h * TS - 1);
    }
    c.restore();

    if (M.outdoor) {
      if (S.weather === 'rain' || S.weather === 'cloudy') { c.fillStyle = 'rgba(50,60,85,.16)'; c.fillRect(0, 0, vw, vh); }
      const kind = S.weather === 'rain' ? 'rain' : S.weather === 'snow' ? 'snow' : si === 0 ? 'petal' : si === 2 ? 'leaf' : '';
      if (kind) drawParticles(c, kind);
      const h = S.time / 60;
      if (h > 16.3 && h < 19) { c.fillStyle = `rgba(255,130,60,${0.12 * Math.sin(((h - 16.3) / 2.7) * Math.PI)})`; c.fillRect(0, 0, vw, vh); }
      const dark = darkness(Math.min(S.time, MIDNIGHT + 60));
      if (dark > 0.01) {
        if (!shadeCanvas) shadeCanvas = document.createElement('canvas');
        if (shadeCanvas.width !== vw || shadeCanvas.height !== vh) { shadeCanvas.width = vw; shadeCanvas.height = vh; }
        const sc = shadeCanvas.getContext('2d');
        sc.globalCompositeOperation = 'source-over';
        sc.clearRect(0, 0, vw, vh);
        sc.fillStyle = `rgba(10,14,40,${dark})`;
        sc.fillRect(0, 0, vw, vh);
        sc.globalCompositeOperation = 'destination-out';
        const light = (x, y, r, a = 0.9) => {
          const X = x - cx, Y = y - cy;
          if (X < -r || Y < -r || X > vw + r || Y > vh + r) return;
          const g = sc.createRadialGradient(X, Y, 0, X, Y, r);
          g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
          sc.fillStyle = g; sc.fillRect(X - r, Y - r, r * 2, r * 2);
        };
        for (const [lx, ly] of M.lamps) light(lx * TS + 14, ly * TS + 2, 34);
        for (const b of M.buildings) { const e = entrance(b); light(e.x, e.y - 14, 26, 0.7); }
        for (const car of ambient.cars) if (car.wait <= 0) light(car.L.h ? car.p + car.L.d * 14 : car.L.at * TS + 8, car.L.h ? car.L.at * TS + 8 : car.p + car.L.d * 14, 16, 0.6);
        light(S.pos.x, S.pos.y - 8, 26, 0.75);
        c.drawImage(shadeCanvas, 0, 0);
      }
    } else {
      // trong nhà buổi tối: ánh đèn ấm
      const h = S.time / 60;
      if (h >= 18 || h < 6) { c.fillStyle = 'rgba(255,190,110,.07)'; c.fillRect(0, 0, vw, vh); }
      pill(c, M.name, vw / 2, document.body.classList.contains('touch') ? vh - 8 : 24, { size: 6, bg: 'rgba(16,20,36,.7)' });
    }

    // mũi tên chỉ đường + gợi ý tương tác
    const ob = objective(S);
    const tp = arrowPoint(S, M, ob.target);
    const px = S.pos.x - cx, py = S.pos.y - cy;
    if (tp) {
      const dx = tp.x - S.pos.x, dy = tp.y - S.pos.y, d = Math.hypot(dx, dy);
      if (d > 40) {
        const ang = Math.atan2(dy, dx), r = 22 + Math.sin(tAnim * 5);
        c.save(); c.translate(px + Math.cos(ang) * r, py - 8 + Math.sin(ang) * r); c.rotate(ang);
        c.fillStyle = '#ffcf5a'; c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(5, 0); c.lineTo(-3, -4); c.lineTo(-1, 0); c.lineTo(-3, 4); c.closePath(); c.fill(); c.stroke();
        c.restore();
      }
    }
    if (this.target && !G.busy) {
      const touch = document.body.classList.contains('touch');
      pill(c, (touch ? '' : '[E] ') + this.target.label, px, py - 30, { size: 6.5, bg: 'rgba(255,207,90,.95)', color: '#1b2238' });
    }
    // bản đồ nhỏ ở góc phải trên (ngoài trời)
    if (M.outdoor && !(S.settings && S.settings.minimap === false)) {
      const mw = 78, mh = Math.round((mw * M.h) / M.w), mx = vw - mw - 5, my = 26;
      c.globalAlpha = 0.88;
      rect(c, '#0e1326', mx - 2, my - 2, mw + 4, mh + 4);
      c.drawImage(staticOf(M, si), 0, 0, M.w * TS, M.h * TS, mx, my, mw, mh);
      c.globalAlpha = 1;
      const k = mw / (M.w * TS);
      // khung nhìn hiện tại
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 0.6;
      c.strokeRect(mx + cx * k, my + cy * k, Math.min(mw, vw * k), Math.min(mh, vh * k));
      if (tp) { rect(c, '#ffcf5a', mx + tp.x * k - 1.5, my + tp.y * k - 1.5, 3, 3); }
      rect(c, '#ff5a5a', mx + S.pos.x * k - 1.5, my + S.pos.y * k - 1.5, 3, 3);
      text(c, 'M: bản đồ', mx + mw / 2, my + mh + 7, { size: 5, color: '#c9d2ff', align: 'center' });
    }
    if (fade.a > 0) { c.fillStyle = `rgba(8,10,20,${fade.a})`; c.fillRect(0, 0, vw, vh); }
  },
};

function drawNpc(c, S, n) {
  const P = PEOPLE[n.id];
  let dir = n.dir || 'down', pose = n.pose;
  // người quen thân thấy bạn thì quay sang, vẫy tay (nếu đang vui và không bận tay)
  const rel = S.npc && S.npc[n.id];
  const d = Math.hypot(S.pos.x - n.x, S.pos.y - n.y);
  if (rel && rel.met && d < 56 && !pose && n.st.act !== 'work' && n.st.act !== 'sleep') {
    dir = Math.abs(S.pos.x - n.x) > Math.abs(S.pos.y - n.y) ? (S.pos.x < n.x ? 'left' : 'right') : (S.pos.y < n.y ? 'up' : 'down');
    if (rel.aff >= 40 && moodInfo(S, n.id).id !== 'cranky' && d > 24 && Math.floor(tAnim / 3 + n.x) % 3 === 0) pose = 'wave';
  }
  drawPerson(c, n.x, n.y, P.look, dir, tAnim + n.x * 0.01, !!n.moving, pose);
}

export function initWorld() { getMap('town'); getMap('minato'); getMap('jutaku'); }
export function fadeActive() { return fade.dir !== 0 || fade.a > 0; }
