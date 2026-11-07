// Trắc nghiệm dùng chung: học tiếng Nhật, ca làm, thi.
import { modal, toast, esc } from './ui.js';
import { sfx } from './audio.js';
import { KIND } from './content/jlpt.js';
import { pickQuestion, answer, progress, shuffleQ } from './learning.js';
import { WORK_Q } from './content/work.js';

// Hỏi một câu. q: {q, opts[], a, ex, k?}. Trả về true nếu đúng.
// opts.feedback: 'full' (hiện giải thích khi sai) | 'none' (thi: không cho biết đáp án)
export async function ask(q, o = {}) {
  const kind = q.k ? KIND[q.k] : null;
  const isJp = !!kind;
  const hide = new Set(o.hide || []);
  const choices = q.opts.map((t, i) => ({ label: esc(t), value: i, disabled: hide.has(i), reason: hide.has(i) ? 'Senpai bảo: không phải cái này' : '' }));
  const v = await modal({
    who: o.who || (kind ? `${kind.label} · ${q.lv}` : 'Tình huống'),
    title: o.title || '',
    html: isJp
      ? `<div class="qbox"><div class="qjp">${esc(q.q)}</div><div class="qask">${kind.ask}</div></div>`
      : `<div class="qbox"><div class="qtxt">${esc(q.q)}</div></div>`,
    choices,
  });
  const ok = v === q.a;
  if (o.feedback === 'none') { sfx('tap'); return ok; }
  if (ok) sfx('good'); else sfx('bad');
  return ok;
}

async function wrongBox(q) {
  await modal({ title: '❌ Chưa đúng', text: `Đáp án đúng: <b>${esc(q.opts[q.a])}</b><br><span class="dim">${esc(q.ex)}</span>`, ok: 'Đã hiểu →' });
}

// Học tiếng Nhật n câu. Trả về { ok, n, xp, levelUp }
export async function studyJapanese(S, n, o = {}) {
  let ok = 0, xp = 0, levelUp = null;
  for (let i = 0; i < n; i++) {
    const q = pickQuestion(S.lang);
    const right = await ask(q, { title: `${o.title || 'Câu'} ${i + 1}/${n}` });
    const r = answer(S.lang, q, right, { mult: o.mult || 1 });
    xp += r.gain;
    if (right) {
      ok++;
      toast(`✅ Đúng! +${r.gain.toFixed(1)} xp${r.streak >= 3 ? ` · 🔥 chuỗi ${r.streak}` : ''}`, 1600);
    } else await wrongBox(q);
    if (r.levelUp) {
      levelUp = r.levelUp;
      sfx('end');
      await modal({ title: `🎉 Trình độ mới: ${r.levelUp}!`, text: `Năng lực tiếng Nhật của bạn đã đạt mức <b>${r.levelUp}</b>.<br>Năng lực là năng lực — muốn có <b>chứng chỉ</b> thì phải đăng ký thi JLPT (tháng 7 và tháng 12).` });
    }
  }
  const p = progress(S.lang);
  return { ok, n, xp, levelUp, p };
}

// Câu hỏi tình huống ở chỗ làm
export function pickWork(S, job) {
  S.workRecent = S.workRecent || [];
  const pool = [...WORK_Q[job], ...WORK_Q.general];
  const fresh = pool.filter((q) => !S.workRecent.includes(q.id));
  const list = fresh.length >= 4 ? fresh : pool;
  const q = list[Math.floor(Math.random() * list.length)];
  S.workRecent.push(q.id);
  if (S.workRecent.length > 24) S.workRecent.shift();
  return shuffleQ(q);
}

export async function workQuiz(S, job, n, o = {}) {
  let ok = 0;
  for (let i = 0; i < n; i++) {
    const q = pickWork(S, job);
    // Senpai thân thiết có thể gợi ý: loại bớt 1 đáp án sai
    let hide = [];
    if (o.hint && o.hint()) {
      const wrongs = [0, 1, 2, 3].filter((x) => x !== q.a);
      hide = [wrongs[Math.floor(Math.random() * wrongs.length)]];
    }
    const right = await ask(q, { who: `${o.who || 'Ca làm'} · Câu ${i + 1}/${n}`, hide });
    if (right) { ok++; toast('✅ Chuẩn!', 1200); } else await wrongBox(q);
  }
  return ok;
}
