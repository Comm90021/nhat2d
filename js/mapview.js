// Bản đồ (phím M / 📱): xem cả 3 khu, chỗ nào ở đâu, bạn bè đang ở đâu, nhà người quen;
// chọn điểm đến → tự đi bộ / xe buýt / taxi.
import { advance, yen, seasonIdx } from './state.js';
import { modal, toast, esc } from './ui.js';
import { getMap, curMap, mapImage, autoWalkTo, teleportTo, exitPoint, objective, outdoorMapId, leaveToOutdoor, buildingName } from './world/scene.js';
import { entrance } from './world/maps.js';
import { AI_PLACES, PEOPLE } from './ai/world.js';
import { stateOf, ids } from './ai/sim.js';
import { pay } from './finance.js';
import { TS } from './pixel.js';
import { BUILDINGS, parseUnit } from './content/units.js';
import { myPlace } from './jobs.js';

const DISTRICTS = { town: 'Thị trấn Hikari', jutaku: 'Khu dân cư Hikari-dai', minato: 'Khu công nghiệp Minato' };
const ICON = {
  dorm: '🛏️', konbini: '🏪', work: '🏭', clinic: '🏥', station: '🚉', station2: '🚉', super: '🛒', class: '📚', remit: '💸', shrine: '⛩️',
  ramen: '🍜', center: '🤝', care: '🧓', bento: '🍱', it: '💻', electric: '⚡', parts: '🔩', teishoku: '🍚', logistics: '📦', site: '🏗️',
  apt: '🏢', hikari: '🏢', sakura: '🏢', residence: '🏢', fudosan: '🏠', park: '🌳', river: '🌊', jpark: '🌳', mpark: '🌳',
};
const COLOR = { work: '#e67e22', shop: '#3498db', food: '#e74c3c', home: '#9b59b6', leisure: '#27ae60', service: '#16a085', health: '#e84393', study: '#f1c40f', temple: '#c0392b' };

const metIds = (S) => ids().filter((id) => S.npc && S.npc[id] && S.npc[id].met);
// vị trí (px trên bản đồ) của một địa điểm AI nếu nó nằm ở bản đồ M
function placePos(M, place) {
  const P = AI_PLACES[place];
  if (!P || P.map !== M.id) return null;
  if (P.spot) { const s = M.spots.find((x) => x.id === P.spot) || (M.aiSpots[P.spot] && { tx: M.aiSpots[P.spot][0][0], ty: M.aiSpots[P.spot][0][1] }); return s ? { x: s.tx * TS + 8, y: s.ty * TS + 8 } : null; }
  const b = M.buildings.find((x) => x.id === (P.building || place));
  return b ? { x: (b.x + b.w / 2) * TS, y: (b.y + b.h / 2) * TS } : null;
}

function render(S, M) {
  const si = seasonIdx(S);
  const W = 640, k = W / (M.w * TS), H = Math.round(M.h * TS * k);
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  c.imageSmoothingEnabled = false;
  c.drawImage(mapImage(M, si), 0, 0, W, H);
  c.fillStyle = 'rgba(10,14,30,.25)'; c.fillRect(0, 0, W, H);
  c.textAlign = 'center'; c.textBaseline = 'middle';
  // tòa nhà
  for (const b of M.buildings) {
    const x = (b.x + b.w / 2) * TS * k, y = (b.y + b.h / 2) * TS * k;
    const kind = (AI_PLACES[b.id] && AI_PLACES[b.id].kind) || (b.id.startsWith('station') ? 'service' : 'shop');
    c.font = 'bold 11px sans-serif';
    const label = `${ICON[b.id] || '🏠'} ${buildingName(b, S)}`;
    const tw = c.measureText(label).width + 10;
    c.fillStyle = 'rgba(16,20,36,.82)'; c.fillRect(x - tw / 2, y - 9, tw, 18);
    c.fillStyle = COLOR[kind] || '#888'; c.fillRect(x - tw / 2, y + 7, tw, 2);
    c.fillStyle = '#fff'; c.fillText(label, x, y);
  }
  for (const s of M.spots) { const x = (s.tx * TS + 8) * k, y = (s.ty * TS + 8) * k; c.font = '11px sans-serif'; c.fillStyle = 'rgba(20,60,30,.85)'; const t = `${ICON[s.id] || '📍'} ${s.name}`; const tw = c.measureText(t).width + 8; c.fillRect(x - tw / 2, y - 8, tw, 16); c.fillStyle = '#fff'; c.fillText(t, x, y); }
  for (const e of M.edges || []) { const x = e.side === 'w' ? 60 : W - 60, y = (e.y0 + 2) * TS * k; c.font = 'bold 11px sans-serif'; c.fillStyle = 'rgba(40,60,110,.9)'; const t = e.side === 'w' ? `◀ ${e.name}` : `${e.name} ▶`; const tw = c.measureText(t).width + 8; c.fillRect(x - tw / 2, y - 8, tw, 16); c.fillStyle = '#fff'; c.fillText(t, x, y); }
  // bạn bè đang ở đâu
  const at = {};
  for (const id of metIds(S)) {
    const p = placePos(M, stateOf(S, id).place);
    if (!p) continue;
    const key = Math.round(p.x) + ',' + Math.round(p.y);
    const n = (at[key] = (at[key] || 0) + 1);
    const x = p.x * k + 14 + (n - 1) * 13, y = p.y * k - 16;
    c.beginPath(); c.arc(x, y, 6, 0, 7); c.fillStyle = PEOPLE[id].look.shirt; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke();
    c.font = 'bold 8px sans-serif'; c.fillStyle = '#fff'; c.fillText(PEOPLE[id].name.replace(/^(Chị|Anh|Bà) /, '')[0], x, y + 0.5);
  }
  // mục tiêu + vị trí của bạn
  const ob = objective(S);
  const tp = ob.target ? placePos(M, ob.target === 'work' ? 'work' : ob.target) : null;
  if (tp) { c.font = '18px sans-serif'; c.fillText('⭐', tp.x * k - 20, tp.y * k - 16); }
  if (outdoorMapId(S) === M.id) {
    const pos = curMap(S).outdoor ? S.pos : (() => { const r = [S.ret, ...(S.retStack || [])].find((q) => q && getMap(q.map).outdoor); return r || S.pos; })();
    c.beginPath(); c.arc(pos.x * k, pos.y * k, 7, 0, 7); c.fillStyle = '#ff4d4d'; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
    c.font = 'bold 10px sans-serif'; c.fillStyle = '#fff'; c.fillText('Bạn', pos.x * k, pos.y * k - 13);
  }
  return cv.toDataURL();
}

// Nhà của người quen nằm ở tòa nào
function friendHomes(S, bid) {
  return metIds(S).filter((id) => { const h = PEOPLE[id].home; return h && h.startsWith('u:') && parseUnit(h.slice(2)).bid === bid; })
    .map((id) => `${PEOPLE[id].name} (${parseUnit(PEOPLE[id].home.slice(2)).room})`);
}

export async function openMap(S, start) {
  let mid = start || outdoorMapId(S);
  for (;;) {
    const M = getMap(mid);
    const here = metIds(S).reduce((o, id) => { const pl = stateOf(S, id).place, P = AI_PLACES[pl]; if (P && P.map === mid) { const k = P.building || (P.spot ? pl : pl); (o[k] = o[k] || []).push(PEOPLE[id].name); } return o; }, {});
    const wp = myPlace(S);
    const dests = [
      ...M.buildings.map((b) => {
        const fr = here[b.id] || [], homes = BUILDINGS[b.id] ? friendHomes(S, b.id) : [];
        const sub = [b.id === wp || (b.id === 'work' && wp === 'work') ? '💼 chỗ làm của bạn' : '', fr.length ? `👥 ${fr.slice(0, 3).join(', ')}${fr.length > 3 ? '…' : ''}` : '', homes.length ? `🏠 nhà ${homes.slice(0, 3).join(', ')}` : ''].filter(Boolean).join(' · ');
        return { label: `${ICON[b.id] || '🏠'} ${buildingName(b, S)}`, sub, value: 'b:' + b.id };
      }),
      ...M.spots.filter((s) => s.interact).map((s) => ({ label: `${ICON[s.id] || '📍'} ${s.name}`, sub: (here[s.id] || []).length ? `👥 ${here[s.id].join(', ')}` : '', value: 's:' + s.id })),
    ];
    const v = await modal({
      who: 'Bản đồ', title: `🗺️ ${DISTRICTS[mid]}`, wide: true,
      html: `<img src="${render(S, M)}" style="width:100%;image-rendering:pixelated;border-radius:6px"><p class="dim">⭐ mục tiêu hiện tại · 🔴 bạn · chấm tròn = người quen đang ở đó. Chọn một nơi để đi tới.</p>`,
      choices: [
        ...Object.keys(DISTRICTS).filter((d) => d !== mid).map((d) => ({ label: `🗺️ Xem ${DISTRICTS[d]}`, value: 'd:' + d })),
        ...dests,
        { label: '✖ Đóng bản đồ', value: null, cancel: true },
      ],
    });
    if (!v) return;
    if (v.startsWith('d:')) { mid = v.slice(2); continue; }
    const [t, id] = v.split(':');
    let dest;
    if (t === 'b') { const b = M.buildings.find((x) => x.id === id); const e = entrance(b); dest = { x: e.x, y: e.y + 2, name: buildingName(b, S) }; }
    else { const s = M.spots.find((x) => x.id === id); dest = { x: s.tx * TS + 8, y: s.ty * TS + 12, name: s.name }; }
    if (await travelMenu(S, mid, dest)) return;
  }
}

async function travelMenu(S, mid, dest) {
  const from = outdoorMapId(S);
  const same = from === mid;
  const hour = S.time / 60;
  const busOk = hour >= 6 && hour < 22;
  const bus = same ? { cost: 220, min: 15 } : { cost: 420, min: 40 };
  const taxi = same ? { cost: 1500, min: 5 } : { cost: 3200, min: 15 };
  const v = await modal({
    who: 'Đi tới', title: `📍 ${esc(dest.name)}`, text: same ? 'Cùng khu với bạn.' : `Ở ${DISTRICTS[mid]} — bạn đang ở ${DISTRICTS[from]}.`,
    choices: [
      { label: same ? '🚶 Tự đi bộ tới' : '🚶 Đi bộ tới chỗ chuyển khu', sub: same ? 'Miễn phí · nhân vật tự đi, bấm phím di chuyển để dừng' : (from === 'jutaku' || mid === 'jutaku') && (from !== 'minato' && mid !== 'minato') ? 'Đi hết con đường lớn là sang khu bên cạnh' : 'Đi tới ga tàu (¥200 / chuyến)', value: 'walk' },
      { label: `🚌 Xe buýt${same ? '' : ' + tàu'} · ${yen(bus.cost)} · ${bus.min} phút`, value: 'bus', disabled: !busOk || S.money < bus.cost, reason: !busOk ? 'Xe buýt chạy 06:00–22:00' : 'Không đủ tiền' },
      { label: `🚕 Taxi · ${yen(taxi.cost)} · ${taxi.min} phút`, value: 'taxi', disabled: S.money < taxi.cost, reason: 'Không đủ tiền' },
      { label: '← Quay lại', value: null, cancel: true },
    ],
  });
  if (!v) return false;
  if (v === 'walk') {
    await leaveToOutdoor(S);
    const M = curMap(S);
    const goal = same ? dest : exitPoint(M, mid);
    if (!goal || !autoWalkTo(S, goal.x, goal.y)) { toast('Không tìm được đường đi'); return true; }
    toast(same ? `🚶 Đang đi tới ${dest.name}…` : '🚶 Đang đi tới chỗ chuyển khu…');
    return true;
  }
  const o = v === 'bus' ? bus : taxi;
  pay(S, o.cost, 'travel', v === 'bus' ? 'Xe buýt' : 'Taxi');
  advance(S, o.min);
  await teleportTo(S, mid, dest.x, dest.y);
  toast(`${v === 'bus' ? '🚌' : '🚕'} Đã tới ${dest.name}`);
  return true;
}
