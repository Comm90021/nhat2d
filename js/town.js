// Giữ tên cũ cho các module khác: thế giới (bản đồ, nội thất, NPC) nằm trong world/scene.js
export { worldScene as townScene, initWorld as initTown, placePlayer, objective, invalidateMap, buildingName, enterBuilding, exitBuilding, travelTo, curMap, player, fadeActive } from './world/scene.js';
