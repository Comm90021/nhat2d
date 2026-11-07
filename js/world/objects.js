// Vẽ đồ đạc trong nhà bằng pixel. Phần tĩnh vẽ một lần; phần động (băng chuyền, hơi nước, màn hình, robot) vẽ mỗi khung hình.
import { TS, rect, disc, shade, text } from '../pixel.js';

const wood = '#8a5a35', wood2 = '#6b4428', metal = '#9aa3ab', metal2 = '#6f777e';

export function drawObjectStatic(c, o) {
  const X = o.x * TS, Y = o.y * TS, W = o.w * TS, H = o.h * TS;
  switch (o.kind) {
    case 'futon':
      for (let i = 0; i < o.w * o.h; i += 2) { /* nhiều đệm */ }
      rect(c, '#f1ece0', X + 2, Y + 2, W - 4, H - 4); rect(c, '#5d86c4', X + 2, Y + 10, W - 4, H - 12);
      rect(c, '#ffffff', X + 4, Y + 3, W - 8, 6); rect(c, shade('#5d86c4', -0.2), X + 2, Y + H - 4, W - 4, 2);
      break;
    case 'stove':
      rect(c, '#cfd3d6', X, Y + 2, W, H - 2); rect(c, '#2b2b2b', X + 2, Y + 4, W - 4, 8);
      for (let i = 0; i < o.w; i++) disc(c, '#555', X + i * TS + 8, Y + 8, 3);
      rect(c, shade('#cfd3d6', -0.2), X, Y + H - 2, W, 2);
      break;
    case 'sink':
      rect(c, '#cfd3d6', X, Y + 2, W, H - 2); rect(c, '#8fb7d6', X + 3, Y + 5, W - 6, 6); rect(c, metal2, X + W / 2 - 1, Y + 2, 2, 4);
      break;
    case 'fridge':
      rect(c, '#e9edf0', X + 1, Y, W - 2, H); rect(c, '#c7cdd2', X + 1, Y + H / 2, W - 2, 1);
      if (o.w > 1) for (let i = 0; i < o.w; i++) { rect(c, '#bfe6f5', X + i * TS + 3, Y + 2, TS - 6, H / 2 - 4); rect(c, ['#e35d5b', '#f2a541', '#44a36b', '#3f88c5'][i % 4], X + i * TS + 4, Y + 5, 3, 4); rect(c, '#f1c40f', X + i * TS + 9, Y + 5, 3, 4); }
      else rect(c, metal2, X + W - 5, Y + 4, 1, 6);
      break;
    case 'lowtable':
      rect(c, 'rgba(0,0,0,.18)', X + 3, Y + H - 4, W - 6, 3);
      rect(c, wood, X + 2, Y + 3, W - 4, H - 8); rect(c, shade(wood, 0.15), X + 2, Y + 3, W - 4, 2);
      disc(c, '#f1ece0', X + W / 2, Y + H / 2 - 2, 3);
      break;
    case 'desk': case 'schooldesk': case 'pcdesk':
      rect(c, 'rgba(0,0,0,.18)', X + 1, Y + H - 3, W - 2, 3);
      rect(c, o.kind === 'schooldesk' ? '#c7a26e' : wood, X + 1, Y + 4, W - 2, H - 7); rect(c, shade(wood, 0.2), X + 1, Y + 4, W - 2, 2);
      if (o.kind !== 'schooldesk') { rect(c, '#2e3440', X + 4, Y, 9, 7); rect(c, '#2e3440', X + 7, Y + 7, 3, 2); }
      else rect(c, '#f1ece0', X + 4, Y + 6, 6, 4);
      if (o.kind === 'desk' && o.w > 1) rect(c, '#f1ece0', X + TS + 2, Y + 6, 8, 5);
      break;
    case 'locker': case 'cabinet': case 'helmets':
      for (let i = 0; i < o.w; i++) {
        rect(c, o.kind === 'cabinet' ? '#e9edf0' : '#7f98ad', X + i * TS + 1, Y, TS - 2, H); rect(c, shade('#7f98ad', -0.25), X + i * TS + 1, Y + H - 2, TS - 2, 2);
        rect(c, '#3b4b5a', X + i * TS + 3, Y + 3, 4, 1); rect(c, '#3b4b5a', X + i * TS + 9, Y + 3, 4, 1);
        if (o.kind === 'helmets') { disc(c, '#f2c230', X + i * TS + 5, Y + 7, 3); disc(c, '#ffffff', X + i * TS + 11, Y + 7, 3); }
      }
      break;
    case 'shoes':
      rect(c, wood2, X + 1, Y + 6, W - 2, 8);
      for (let i = 0; i < o.w * 3; i++) rect(c, ['#222', '#7a4f30', '#3f88c5'][i % 3], X + 3 + i * 5, Y + 8, 3, 2);
      break;
    case 'shelf': case 'veg': case 'bookshelf': case 'rack':
      rect(c, 'rgba(0,0,0,.18)', X + 1, Y + H - 3, W - 2, 3);
      rect(c, o.kind === 'rack' ? '#3d6aa8' : o.kind === 'bookshelf' ? wood : '#d5d9dc', X, Y + 1, W, H - 3);
      for (let r = 0; r < 3; r++) for (let i = 0; i < o.w * 4; i++) {
        const col = o.kind === 'veg' ? ['#5bb85c', '#e35d5b', '#f2a541', '#7cc35a'][(i + r) % 4] : o.kind === 'rack' ? '#c9a77a' : o.kind === 'bookshelf' ? ['#e35d5b', '#3f88c5', '#44a36b', '#f2a541'][(i + r) % 4] : ['#e35d5b', '#3f88c5', '#f2c230', '#44a36b', '#f1ece0'][(i * 3 + r) % 5];
        rect(c, col, X + 1 + i * 4, Y + 3 + r * Math.floor((H - 5) / 3), 3, Math.max(2, Math.floor((H - 5) / 3) - 2));
      }
      break;
    case 'counter':
      rect(c, 'rgba(0,0,0,.18)', X, Y + H - 2, W, 2);
      rect(c, '#b9895a', X, Y + 3, W, H - 5); rect(c, '#d4a670', X, Y + 3, W, 3);
      rect(c, '#2e3440', X + 4, Y, 8, 5); rect(c, '#6fdc8c', X + 5, Y + 1, 6, 2);
      break;
    case 'medbed':
      rect(c, '#e9edf0', X + 1, Y + 1, W - 2, H - 2); rect(c, '#bfe0e6', X + 2, Y + 8, W - 4, H - 10); rect(c, '#ffffff', X + 3, Y + 2, W - 6, 5);
      break;
    case 'chair': rect(c, '#5d86c4', X + 3, Y + 6, 10, 6); rect(c, '#476a9e', X + 3, Y + 3, 10, 3); break;
    case 'blackboard':
      rect(c, wood2, X, Y + 1, W, H - 2); rect(c, '#2f5a3c', X + 2, Y + 3, W - 4, H - 6);
      rect(c, '#ffffff', X + 8, Y + 6, 20, 1); rect(c, '#ffffff', X + 8, Y + 9, 14, 1); rect(c, '#ffe08a', X + W - 30, Y + 6, 12, 1);
      break;
    case 'board':
      rect(c, '#c9a77a', X + 1, Y + 2, W - 2, H - 4);
      for (let i = 0; i < o.w * 2; i++) rect(c, ['#ffffff', '#ffe08a', '#bfe0f5'][i % 3], X + 3 + i * 7, Y + 4 + (i % 2) * 3, 5, 6);
      break;
    case 'table':
      rect(c, 'rgba(0,0,0,.18)', X + 2, Y + H - 3, W - 4, 3);
      rect(c, '#d4a670', X + 1, Y + 2, W - 2, H - 5); rect(c, '#e6bd88', X + 1, Y + 2, W - 2, 2);
      break;
    case 'sofa':
      rect(c, '#b85450', X + 1, Y + 3, W - 2, H - 5); rect(c, '#9c3f3c', X + 1, Y + 2, W - 2, 4);
      break;
    case 'bench':
      rect(c, wood, X + 1, Y + 7, W - 2, 4); rect(c, '#555', X + 2, Y + 11, 2, 3); rect(c, '#555', X + W - 4, Y + 11, 2, 3);
      break;
    case 'pot':
      rect(c, '#cfd3d6', X, Y + 4, W, H - 4);
      for (let i = 0; i < o.w; i++) { rect(c, '#555', X + i * TS + 2, Y + 3, 12, 9); rect(c, '#c9a77a', X + i * TS + 3, Y + 4, 10, 3); }
      break;
    case 'wheelchair': disc(c, '#333', X + 5, Y + 11, 4); disc(c, '#333', X + 11, Y + 11, 4); rect(c, '#3f88c5', X + 4, Y + 4, 8, 6); break;
    case 'vending':
      rect(c, '#c0392b', X + 2, Y, 12, 15); rect(c, '#ecf0f1', X + 4, Y + 2, 8, 6);
      for (let i = 0; i < 4; i++) rect(c, ['#3498db', '#e67e22', '#2ecc71', '#f1c40f'][i], X + 4 + i * 2, Y + 3, 1, 4);
      break;
    case 'conveyor': case 'roller':
      rect(c, metal2, X, Y + 2, W, H - 4); rect(c, '#2b2f36', X, Y + 4, W, H - 8);
      for (let i = 0; i < o.w; i++) { rect(c, metal2, X + i * TS + 2, Y + H - 2, 2, 2); rect(c, metal2, X + i * TS + 12, Y + H - 2, 2, 2); }
      if (o.kind === 'roller') { disc(c, '#5b6166', X + 8, Y + 8, 5); rect(c, '#e6c84a', X + 2, Y + 2, 12, 2); }
      break;
    case 'strawbed':
      rect(c, '#5a3a24', X, Y + 3, W, H - 5);
      for (let i = 0; i < o.w; i++) { disc(c, '#4fa652', X + i * TS + 5, Y + 7, 4); disc(c, '#5bb85c', X + i * TS + 11, Y + 8, 4); }
      break;
    case 'scaffold':
      for (let i = 0; i <= o.w; i++) rect(c, '#9aa3ab', X + i * TS - (i === o.w ? 2 : 0), Y, 2, H);
      for (let j = 0; j < o.h * 2; j++) rect(c, '#e9a23b', X, Y + 3 + j * 8, W, 2);
      break;
    case 'rebar': for (let j = 0; j < 4; j++) rect(c, '#8b4a2e', X + 1, Y + 4 + j * 2, W - 2, 1); break;
    case 'mixer': disc(c, '#f2a541', X + 10, Y + 8, 7); rect(c, '#555', X + 2, Y + 12, W - 4, 3); break;
    case 'crate': for (let i = 0; i < o.w; i++) { rect(c, '#b9895a', X + i * TS + 1, Y + 3, 14, 12); rect(c, '#8a6340', X + i * TS + 1, Y + 8, 14, 1); } break;
    case 'panel': for (let i = 0; i < o.w; i++) { rect(c, '#9fa8b0', X + i * TS + 1, Y, 14, H - 1); rect(c, '#6f777e', X + i * TS + 7, Y + 2, 1, H - 4); } break;
    case 'workbench':
      rect(c, '#7a6a55', X, Y + 4, W, H - 6); rect(c, '#9c8a70', X, Y + 4, W, 2);
      rect(c, '#e35d5b', X + 4, Y + 6, 6, 2); rect(c, '#2f6db5', X + 14, Y + 7, 8, 1);
      break;
    case 'robot': rect(c, '#f2a541', X + 2, Y + 8, W - 4, H - 8); rect(c, '#5b6166', X + 4, Y + 10, W - 8, 4); break;
    case 'forklift':
      rect(c, '#f2c230', X + 1, Y + 2, W - 6, H - 4); rect(c, '#333', X + W - 6, Y, 2, H); rect(c, '#333', X + 3, Y + 4, 8, 6);
      break;
    case 'unitdoor':
      rect(c, '#6b5444', X + 2, Y, 12, H); rect(c, '#8a6c56', X + 3, Y + 1, 10, H - 2);
      rect(c, '#e8d9a8', X + 4, Y + 3, 8, 3); rect(c, '#d9c27a', X + 11, Y + 9, 2, 2);
      break;
    case 'floorsign':
      rect(c, '#2f3e4f', X + 2, Y + 3, 12, 9); rect(c, '#ffffff', X + 3, Y + 4, 10, 7);
      break;
    case 'mailbox':
      for (let i = 0; i < o.w * 2; i++) for (let j = 0; j < 3; j++) { rect(c, '#9aa3ab', X + 1 + i * 8, Y + 1 + j * 5, 7, 4); rect(c, '#3b4b5a', X + 3 + i * 8, Y + 2 + j * 5, 3, 1); }
      break;
    case 'plant':
      rect(c, '#9c5a2e', X + 5, Y + 9, 6, 6); disc(c, '#3f8a46', X + 8, Y + 6, 5); disc(c, '#56a85c', X + 6, Y + 5, 3);
      break;
    case 'tv':
      rect(c, wood2, X + 1, Y + 9, W - 2, 6); rect(c, '#1d2229', X + 2, Y + 1, W - 4, 9);
      break;
    case 'bed':
      rect(c, wood2, X + 1, Y + 1, W - 2, H - 2); rect(c, '#f1ece0', X + 2, Y + 2, W - 4, H - 4);
      rect(c, '#c98a6b', X + 2, Y + 9, W - 4, H - 11); rect(c, '#ffffff', X + 4, Y + 3, W - 8, 5);
      break;
    default: rect(c, '#888', X + 2, Y + 2, W - 4, H - 4);
  }
}

// Phần động
export function drawObjectAnim(c, o, t, busy) {
  const X = o.x * TS, Y = o.y * TS, W = o.w * TS, H = o.h * TS;
  if (o.kind === 'conveyor') {
    const off = Math.floor(t * 18) % 6;
    for (let x = off; x < W; x += 6) rect(c, '#41464e', X + x, Y + 5, 2, H - 10);
    // hàng hóa chạy trên băng
    for (let k = 0; k < Math.ceil(o.w / 3); k++) {
      const px = ((t * 14 + k * 46) % W);
      rect(c, '#f7f3ea', X + px, Y + 5, 6, 5); rect(c, '#1f3a2a', X + px + 1, Y + 8, 4, 2);
    }
  } else if (o.kind === 'stove' || o.kind === 'pot') {
    if (busy) for (let i = 0; i < 3; i++) {
      const ph = (t * 0.8 + i * 0.33) % 1;
      c.globalAlpha = 0.5 * (1 - ph);
      rect(c, '#ffffff', X + 4 + i * 4 + Math.round(Math.sin(t * 3 + i) * 2), Y - ph * 14, 2, 2);
      c.globalAlpha = 1;
    }
  } else if (o.kind === 'pcdesk' || o.kind === 'desk') {
    if (o.kind === 'pcdesk' || busy) { rect(c, Math.floor(t * 2 + o.x) % 3 ? '#6fa3cf' : '#8fc3ef', X + 5, Y + 1, 7, 4); }
  } else if (o.kind === 'robot') {
    const a = Math.sin(t * 3 + o.x) * 4;
    rect(c, '#5b6166', X + W / 2 - 1, Y + 1, 2, 8); rect(c, '#f2a541', X + W / 2 - 1 + a, Y, 6, 2);
    if (Math.floor(t * 8 + o.x) % 5 === 0) { rect(c, '#fff6a8', X + W / 2 + a + 4, Y + 1, 2, 2); rect(c, '#ffb347', X + W / 2 + a + 6, Y + 3, 1, 1); }
  } else if (o.kind === 'workbench' || o.kind === 'scaffold') {
    if (busy && Math.floor(t * 6 + o.x) % 4 === 0) { rect(c, '#fff6a8', X + 8, Y + 4, 2, 2); rect(c, '#ffb347', X + 11, Y + 2, 1, 1); rect(c, '#ffb347', X + 6, Y + 2, 1, 1); }
  } else if (o.kind === 'panel') {
    for (let i = 0; i < o.w; i++) rect(c, Math.floor(t * 2 + i) % 2 ? '#6fdc8c' : '#e35d5b', X + i * TS + 3, Y + 3, 2, 2);
  } else if (o.kind === 'tv') {
    if (busy) { c.globalAlpha = 0.85; rect(c, ['#6fa3cf', '#8fc3ef', '#f2c48a'][Math.floor(t * 1.5 + o.x) % 3], X + 3, Y + 2, W - 6, 7); c.globalAlpha = 1; }
  } else if (o.kind === 'fridge' && o.w > 1) {
    // ánh đèn tủ lạnh
    c.globalAlpha = 0.12 + 0.05 * Math.sin(t * 2); rect(c, '#ffffff', X + 1, Y, W - 2, H / 2); c.globalAlpha = 1;
  }
}
