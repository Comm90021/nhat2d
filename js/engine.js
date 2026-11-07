// Kích thước màn hình ảo + quản lý cảnh (thị trấn / mini-game).
import { showHud } from './ui.js';

// w, h: kích thước "pixel ảo"; z: số pixel CSS cho mỗi pixel ảo
export const view = { w: 320, h: 240, z: 2, dpr: 1 };
export const engine = { scene: null, town: null };

export function resize(canvas) {
  const cssW = window.innerWidth, cssH = window.innerHeight;
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  let z = Math.max(2, Math.min(cssW / 320, cssH / 240, 5));
  const s = Math.max(1, Math.round(z * dpr)); // số pixel vật lý / pixel ảo: lấy số nguyên cho nét
  z = s / dpr;
  view.z = z; view.dpr = dpr;
  view.w = Math.ceil(cssW / z); view.h = Math.ceil(cssH / z);
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
}

export function setScene(s) { engine.scene = s; }

// Chạy một mini-game; trả về kết quả khi người chơi xong.
export function runScene(makeScene) {
  return new Promise((resolve) => {
    showHud(false);
    document.body.classList.add('in-mini');
    const scene = makeScene((result) => {
      document.body.classList.remove('in-mini');
      engine.scene = engine.town;
      showHud(true);
      resolve(result);
    });
    engine.scene = scene;
  });
}
