// Các lô đất nhà riêng (一戸建て) ở khu Hikari-dai. Trạng thái mỗi lô do housing.js quyết định theo save:
// npc = nhà của một gia đình trong khu · land = đất trống đang bán (売地) · used = nhà cũ đang bán (中古住宅)
// building = đang xây · player = nhà của người chơi.
export const LOTS = {
  lot1: { x: 28, y: 19, w: 5, h: 3, area: 132, land: 7200000 },
  lot2: { x: 34, y: 19, w: 5, h: 3, area: 128, land: 6900000 },
  lot3: { x: 40, y: 19, w: 4, h: 3, area: 110, land: 5800000 },
  lot4: { x: 28, y: 24, w: 5, h: 3, area: 135, land: 7400000 },
  lot5: { x: 34, y: 24, w: 5, h: 3, area: 126, land: 6800000 },
  lot6: { x: 40, y: 24, w: 4, h: 3, area: 108, land: 5600000 },
  lot7: { x: 27, y: 36, w: 5, h: 4, area: 165, land: 8200000 },
  lot8: { x: 33, y: 36, w: 5, h: 4, area: 160, land: 7900000 },
  lot9: { x: 39, y: 36, w: 5, h: 4, area: 158, land: 7700000 },
};
// Trạng thái ban đầu (save mới): ba nhà có người ở, một nhà cũ đang bán, còn lại là đất trống
export const LOT_START = { lot1: 'npc', lot4: 'npc', lot6: 'npc', lot7: 'used', lot2: 'land', lot3: 'land', lot5: 'land', lot8: 'land', lot9: 'land' };
export const PLAN_LOOK = {
  compact: { wall: '#f2efe6', roof: '#4a5a6a' },
  family: { wall: '#efe4d2', roof: '#8a4b3a' },
  japanese: { wall: '#e9dfc8', roof: '#3b3f46' },
};
// trạng thái hiện tại (housing.js cập nhật) + số phiên bản để bản đồ biết khi nào cần vẽ lại
export const lotState = {};
export let lotVer = 0;
export function setLots(st) {
  for (const k of Object.keys(lotState)) delete lotState[k];
  Object.assign(lotState, st);
  lotVer++;
}
