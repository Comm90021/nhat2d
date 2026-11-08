// Cờ chế độ hack (tách riêng để mọi module đọc được mà không vướng import vòng).
export const hackOn = (S) => !!(S && S.hack && S.hack.on);
