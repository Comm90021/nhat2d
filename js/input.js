// Bàn phím + cần điều khiển cảm ứng.
const down = new Set();
const hit = new Set();
const GAME_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE', 'Enter']);
let suppressUntil = 0;

export const input = {
  joy: { x: 0, y: 0, active: false },
  actTap: false,
  isDown: (c) => down.has(c),
  hit: (c) => hit.has(c),
  axis() {
    let x = 0, y = 0;
    if (down.has('ArrowLeft') || down.has('KeyA')) x--;
    if (down.has('ArrowRight') || down.has('KeyD')) x++;
    if (down.has('ArrowUp') || down.has('KeyW')) y--;
    if (down.has('ArrowDown') || down.has('KeyS')) y++;
    if (this.joy.active) { x += this.joy.x; y += this.joy.y; }
    const l = Math.hypot(x, y);
    if (l > 1) { x /= l; y /= l; }
    return { x, y };
  },
  act() { return hit.has('KeyE') || hit.has('Space') || hit.has('Enter') || this.actTap; },
  endFrame() { hit.clear(); this.actTap = false; },
  // Bỏ qua phím vừa bấm để đóng hộp thoại, tránh mở lại ngay
  suppress(ms = 220) { hit.clear(); this.actTap = false; suppressUntil = performance.now() + ms; },
};

const modalOpen = () => { const m = document.getElementById('modal'); return m && !m.hidden; };
const typing = (e) => e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');

export function initInput(onTouch) {
  addEventListener('keydown', (e) => {
    if (typing(e)) return;
    if (modalOpen()) return;
    if (GAME_KEYS.has(e.code)) e.preventDefault();
    if (!e.repeat && performance.now() > suppressUntil) hit.add(e.code);
    down.add(e.code);
  });
  addEventListener('keyup', (e) => down.delete(e.code));
  addEventListener('blur', () => down.clear());

  const joy = document.getElementById('joy');
  const knob = document.getElementById('joy-knob');
  let pid = null, cx = 0, cy = 0;
  const R = 44;
  const move = (e) => {
    let dx = e.clientX - cx, dy = e.clientY - cy;
    const l = Math.hypot(dx, dy);
    if (l > R) { dx *= R / l; dy *= R / l; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    let x = dx / R, y = dy / R;
    if (Math.hypot(x, y) < 0.22) { x = 0; y = 0; }
    input.joy = { x, y, active: true };
  };
  const end = (e) => {
    if (e.pointerId !== pid) return;
    pid = null;
    input.joy = { x: 0, y: 0, active: false };
    knob.style.transform = '';
  };
  joy.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    pid = e.pointerId;
    joy.setPointerCapture(pid);
    const r = joy.getBoundingClientRect();
    cx = r.left + r.width / 2; cy = r.top + r.height / 2;
    move(e);
  });
  joy.addEventListener('pointermove', (e) => { if (e.pointerId === pid) move(e); });
  joy.addEventListener('pointerup', end);
  joy.addEventListener('pointercancel', end);

  document.getElementById('btn-act').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (performance.now() > suppressUntil) input.actTap = true;
  });
  addEventListener('touchstart', () => onTouch && onTouch(), { once: true, passive: true });
}
