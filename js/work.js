// Ca làm việc: chào quản lý → (an toàn) → mini-game → phiếu kết quả → sự kiện sau ca.
import { G, applyFx, seasonIdx, clockStr, yen, addLog, isWorkday } from './state.js';
import { JOBS } from './data.js';
import { modal, multi, chips } from './ui.js';
import { runScene } from './engine.js';
import { factoryScene } from './mini/factory.js';
import { farmScene } from './mini/farm.js';
import { buildScene } from './mini/build.js';
import { fixedEvent, markFixed, randomEvent, runEvent } from './events.js';
import { sfx } from './audio.js';
import { workQuiz } from './quiz.js';
import { certBonus } from './exam.js';

const SCENES = { factory: factoryScene, farm: farmScene, build: buildScene };

async function greet(S, late) {
  if (late) {
    const v = await modal({
      who: 'Chị Yamada · tổ trưởng', title: '⏰ Bạn đến muộn!', jp: '遅刻ですよ。',
      text: `Đã ${clockStr(S.time)} rồi. Mọi người bắt đầu từ 08:00.`,
      choices: [
        { label: '「遅刻して申し訳ありません！」', sub: 'Xin lỗi nghiêm túc', value: 0 },
        { label: '"Tại xe buýt trễ ạ…"', sub: 'Viện lý do', value: 1 },
      ],
    });
    const out = applyFx(S, v === 0 ? { rep: -3, jp: 0.5 } : { rep: -7 });
    S.stats.lates++;
    await modal({ text: v === 0 ? 'Chị Yamada gật đầu: 「次から気をつけてね」 (Lần sau chú ý nhé).' : 'Chị Yamada thở dài. Ở Nhật, đi muộn thì xin lỗi trước, đừng viện cớ.', html: chips(out) });
    return;
  }
  const job = JOBS[S.job];
  const v = await modal({
    who: 'Chị Yamada · tổ trưởng', title: '🌅 Đầu ca làm', jp: 'おはようございます。今日もよろしく。',
    text: `<b>Mẹo hôm nay:</b> ${job.tip}`,
    choices: [
      { label: '「おはようございます！よろしくお願いします！」', value: 0 },
      { label: '(Gật đầu chào)', value: 1 },
    ],
  });
  applyFx(S, v === 0 ? { rep: 1, jp: 0.3 } : {});
}

async function safety(S) {
  const items = [
    { label: '⛑️ Mũ bảo hộ', value: 'helmet' },
    { label: '🎧 Tai nghe nghe nhạc', value: 'music' },
    { label: '🦺 Đai an toàn', value: 'harness' },
    { label: '🩴 Dép lê', value: 'sandal' },
    { label: '🥾 Giày bảo hộ mũi thép', value: 'boots' },
    { label: '🧤 Găng tay', value: 'gloves' },
  ];
  const sel = await multi({
    who: 'Chỉ huy công trường', title: '安全確認 — Kiểm tra an toàn', text: 'Chọn <b>tất cả</b> đồ cần mang trước khi lên giàn giáo:', items, confirm: 'Lên giàn giáo →',
  });
  const need = ['helmet', 'harness', 'boots', 'gloves'];
  const missing = need.filter((n) => !sel.includes(n));
  const wrong = sel.filter((n) => !need.includes(n));
  if (!missing.length && !wrong.length) {
    const out = applyFx(S, { rep: 2 });
    await modal({ title: '✅ 安全第一！', text: 'Chuẩn! Mũ, đai an toàn, giày mũi thép, găng tay — đủ cả.', html: chips(out) });
  } else {
    const out = applyFx(S, { rep: -4, mood: -2 });
    const names = { helmet: 'mũ bảo hộ', harness: 'đai an toàn', boots: 'giày bảo hộ', gloves: 'găng tay', music: 'tai nghe', sandal: 'dép lê' };
    let t = '';
    if (missing.length) t += `Thiếu: ${missing.map((n) => names[n]).join(', ')}. `;
    if (wrong.length) t += `Không được mang: ${wrong.map((n) => names[n]).join(', ')}. `;
    await modal({ title: '⚠️ 危ない！', text: t + 'Chỉ huy bắt bạn quay lại chuẩn bị đầy đủ. Tai nạn lao động ở công trường rất nguy hiểm.', html: chips(out) });
  }
}

export async function startShift(S, overtime) {
  const job = JOBS[S.job];
  const late = !overtime && S.time > 8 * 60 + 2;
  await greet(S, late);
  if (S.job === 'build') await safety(S);
  let score;
  if (S.settings && S.settings.shiftMode === 'mini') {
    const diff = Math.min(0.6, S.stats.shifts / 40);
    const res = await runScene((done) => SCENES[job.game](diff, done));
    score = res.score;
    S.skill[S.job] = (S.skill[S.job] || 0) + Math.round(score * 3);
  } else {
    const n = overtime ? 3 : 4;
    await modal({ who: job.place, title: overtime ? '⏱️ Ca thứ Bảy' : `${job.icon} Vào ca`, text: `Trong ca sẽ có <b>${n} tình huống</b>. Chọn cách xử lý đúng — đúng càng nhiều, đánh giá càng cao và tay nghề càng lên.`, ok: 'Bắt đầu →' });
    const ok = await workQuiz(S, S.job, n, { who: job.place });
    score = ok / n;
    S.skill[S.job] = (S.skill[S.job] || 0) + ok;
  }
  const base = overtime ? job.pay * 0.625 : job.pay;
  const pay = Math.round((base * (0.75 + 0.45 * score) * (1 + certBonus(S))) / 10) * 10;
  const k = overtime ? 0.55 : 1;
  S.time = Math.max(S.time + 60, overtime ? 13 * 60 : 17 * 60);
  const out = applyFx(S, {
    wage: pay,
    energy: -job.energy * k,
    full: -30 * k,
    rep: Math.round((score - 0.55) * 10) + (overtime ? 2 : 0),
    mood: score >= 0.8 ? 4 : score < 0.4 ? -5 : -1,
    jp: 0.5,
  });
  S.worked = true;
  S.lastScore = score;
  S.stats.shifts++;
  S.stats.earned += pay;
  S.stats.best = Math.max(S.stats.best, score);
  const rank = score >= 0.9 ? 'S' : score >= 0.75 ? 'A' : score >= 0.55 ? 'B' : score >= 0.35 ? 'C' : 'D';
  addLog(S, `${overtime ? 'Làm thêm thứ Bảy' : 'Ca làm'}: hạng ${rank}, ${yen(pay)}`);
  sfx(score >= 0.55 ? 'coin' : 'bad');
  await modal({
    who: job.place, title: `${overtime ? 'Kết thúc ca thứ Bảy' : 'Hết ca'} — Hạng ${rank}`, jp: 'お疲れ様でした！',
    text: `Điểm ${Math.round(score * 100)}/100. Lương ca này <b>${yen(pay)}</b> sẽ được trả vào Chủ Nhật.`,
    html: chips(out),
  });
  // sự kiện sau ca
  const fixed = fixedEvent(S, 'after');
  if (fixed) { markFixed(S, fixed); await runEvent(fixed); }
  else if (Math.random() < 0.4) {
    const ev = randomEvent(S, 'after');
    if (ev) await runEvent(ev);
  }
}

export function workActions(S) {
  const job = JOBS[S.job];
  const a = [];
  const sat = (S.day - 1) % 7 === 5;
  if (S.today.noWork) a.push({ label: '🚫 Hôm nay bạn được nghỉ', cond: () => 'Bão hoặc ngày đi thi' });
  else if (S.worked) a.push({ label: '✅ Đã xong ca hôm nay', cond: () => 'Mai quay lại nhé' });
  else if (isWorkday(S)) {
    a.push({
      label: S.time <= 8 * 60 ? `${job.icon} Vào ca (08:00 – 17:00)` : `🏃 Vào ca muộn`,
      sub: S.time <= 8 * 60 ? 'Đúng giờ' : 'Bạn đã muộn giờ!',
      cond: (s) => (s.today.sickLeave ? 'Hôm nay bạn đã xin nghỉ ốm' : s.time > 10 * 60 ? 'Quá 10:00 — hôm nay bị tính nghỉ' : null),
      run: (s) => startShift(s, false),
    });
  } else if (sat) {
    a.push({
      label: '⏱️ Làm thêm thứ Bảy (đến 13:00)', sub: 'Tự nguyện · lương ×1.25 · uy tín +',
      cond: (s) => (s.time > 9 * 60 ? 'Phải đến trước 09:00' : null),
      run: (s) => startShift(s, true),
    });
  } else a.push({ label: '😴 Chủ Nhật — công ty nghỉ', cond: () => 'Nghỉ ngơi đi!' });
  return a;
}
