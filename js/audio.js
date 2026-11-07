// Hiệu ứng âm thanh 8-bit tạo bằng WebAudio, không cần file nhạc.
let ac = null;
let muted = false;
try { muted = localStorage.getItem('nhatky-mute') === '1'; } catch (e) { /* ignore */ }

export const isMuted = () => muted;
export function setMuted(m) {
  muted = m;
  try { localStorage.setItem('nhatky-mute', m ? '1' : '0'); } catch (e) { /* ignore */ }
}

const SEQ = {
  tap: [[520, 0.05]],
  good: [[660, 0.07], [880, 0.09]],
  bad: [[200, 0.08], [150, 0.12]],
  coin: [[988, 0.06], [1319, 0.14]],
  start: [[440, 0.08], [554, 0.08], [659, 0.14]],
  end: [[659, 0.1], [784, 0.1], [1047, 0.2]],
  door: [[330, 0.06], [392, 0.08]],
};

export function sfx(kind) {
  if (muted) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    let t = ac.currentTime;
    for (const [f, d] of SEQ[kind] || SEQ.tap) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = kind === 'bad' ? 'sawtooth' : 'square';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(ac.destination);
      o.start(t); o.stop(t + d + 0.02);
      t += d;
    }
  } catch (e) { /* không có âm thanh cũng không sao */ }
}
