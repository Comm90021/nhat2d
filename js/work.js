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
import { shiftRate } from './payroll.js';
import { recordShift, employed, workName } from './jobs.js';
import { player, curMap } from './town.js';
import { TS } from './pixel.js';

function standAtStation(S) {
  const M = curMap(S);
  if (!M || M.outdoor || !M.slots || !M.slots.work) return;
  let best = null, bd = 1e9;
  for (const s of M.slots.work) { const d = Math.hypot(s.x * TS + 8 - S.pos.x, s.y * TS + 12 - S.pos.y); if (d < bd) { bd = d; best = s; } }
  if (best) { S.pos = { x: best.x * TS + 8, y: best.y * TS + 13 }; S.dir = best.face || 'up'; }
  player.pose = 'work';
}
import { certBonus } from './exam.js';
import { payMul, availableTest, takeTest, TESTS, testBlockReason, visaInfo } from './career.js';
import { atLeast, anyAtLeast } from './social.js';

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
  // quy định nơi làm việc: thay đồng phục, rửa tay (xưởng thực phẩm)
  const warn = [];
  if (!S.today.uniform) warn.push(S.job === 'build' ? 'chưa lấy mũ bảo hộ, đai an toàn ở giá đồ' : 'chưa thay đồng phục ở tủ đồ');
  if (S.job === 'factory' && !S.today.washed) warn.push('chưa rửa tay, sát khuẩn trước khi vào dây chuyền');
  if (warn.length) {
    const out = applyFx(S, { rep: -2 * warn.length });
    await modal({ who: 'Tổ trưởng Yamada', title: '⚠️ Nhắc nhở', jp: 'ちゃんと準備してください', text: `Bạn ${warn.join(' và ')}. Lần sau nhớ chuẩn bị trước khi vào ca (bấm vào tủ đồ / bồn rửa tay trong xưởng).`, html: chips(out) });
    S.today.uniform = true; S.today.washed = true;
  }
  if (S.job === 'build') await safety(S);
  // đứng vào vị trí làm việc, bật hoạt ảnh làm việc
  standAtStation(S);
  let score;
  if (S.settings && S.settings.shiftMode === 'mini' && job.game) {
    const diff = Math.min(0.6, S.stats.shifts / 40);
    const res = await runScene((done) => SCENES[job.game](diff, done));
    score = res.score;
    S.skill[S.job] = (S.skill[S.job] || 0) + Math.round(score * 3);
  } else {
    const n = overtime ? 3 : 4;
    await modal({ who: job.place, title: overtime ? '⏱️ Ca thứ Bảy' : `${job.icon} Vào ca`, text: `Trong ca sẽ có <b>${n} tình huống</b>. Chọn cách xử lý đúng — đúng càng nhiều, đánh giá càng cao và tay nghề càng lên.`, ok: 'Bắt đầu →' });
    const ok = await workQuiz(S, S.job, n, { who: job.place, hint: () => atLeast(S, 'yamada', 2) && Math.random() < 0.35 });
    score = ok / n;
    S.skill[S.job] = (S.skill[S.job] || 0) + ok;
  }
  player.pose = null;
  const base = overtime ? shiftRate(S) * 0.5 * 1.25 : shiftRate(S);
  const pay = Math.round((base * (0.95 + 0.1 * score) * (1 + certBonus(S)) * payMul(S)) / 10) * 10;
  if (!overtime) S.workDays = (S.workDays || 0) + 1;
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
  recordShift(S, score);
  S.stats.shifts++;
  S.stats.earned += pay;
  S.stats.best = Math.max(S.stats.best, score);
  const rank = score >= 0.9 ? 'S' : score >= 0.75 ? 'A' : score >= 0.55 ? 'B' : score >= 0.35 ? 'C' : 'D';
  addLog(S, `${overtime ? 'Làm thêm thứ Bảy' : 'Ca làm'}: hạng ${rank}, ${yen(pay)}`);
  sfx(score >= 0.55 ? 'coin' : 'bad');
  await modal({
    who: job.place, title: `${overtime ? 'Kết thúc ca thứ Bảy' : 'Hết ca'} — Hạng ${rank}`, jp: 'お疲れ様でした！',
    text: `Điểm ${Math.round(score * 100)}/100. Ca này được tính <b>${yen(pay)}</b> vào lương tháng (trả vào Chủ Nhật cuối tháng). Làm tốt thì được đánh giá cao, uy tín tăng.`,
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
  if (!employed(S)) return [{ label: '🚫 Bạn đang thất nghiệp', cond: () => 'Tìm việc mới trong 📱 → Việc làm' }];
  const sat = (S.day - 1) % 7 === 5;
  a.push({ label: S.job === 'build' ? '⛑️ Thay đồ: lấy mũ bảo hộ, đai an toàn' : '👕 Thay đồng phục', sub: S.today.uniform ? 'Đã chuẩn bị' : 'Nên làm trước khi vào ca', minutes: 5, cond: (s) => (s.today.uniform ? 'Đã thay rồi' : null), after: (s) => { s.today.uniform = true; }, res: S.job === 'build' ? 'Mũ cài quai, đai móc chắc. 「ヨシ！」' : 'Mũ trùm tóc, áo trắng, ủng. Lăn bụi quần áo xong.' });
  if (S.job === 'factory') a.push({ label: '🧼 Rửa tay, sát khuẩn', minutes: 3, cond: (s) => (s.today.washed ? 'Đã rửa rồi' : null), after: (s) => { s.today.washed = true; }, res: 'Rửa tay 30 giây, sát khuẩn cồn. Vệ sinh là trên hết (衛生第一).' });
  a.push({ label: '📋 Xem bảng thông báo', minutes: 3, res: (s) => `Chỉ tiêu tháng: không tai nạn, tỉ lệ lỗi dưới 1%.<br>Ca làm: 08:00 – 17:00, nghỉ trưa 12:00.<br>Ngày công tháng này: <b>${s.workDays || 0}</b>.<br>${S.job === 'build' ? 'KY: hôm nay gió mạnh — chú ý vật rơi từ trên cao.' : 'Nhắc nhở: báo cáo ngay mọi sự cố nhỏ (報連相).'}` });
  if (visaInfo(S).change && !S.flags.betterJob && anyAtLeast(S, ['kimura', 'mai', 'daiki', 'long'], 3)) {
    a.push({ label: '🔁 Chuyển sang chỗ làm mới (lương +10%)', sub: 'Bạn thân giới thiệu · visa của bạn được phép đổi chỗ làm cùng ngành', run: async (s) => { s.flags.betterJob = true; addLog(s, 'Chuyển sang chỗ làm mới nhờ người quen giới thiệu'); await modal({ title: '🔁 Chỗ làm mới', text: 'Nhờ người quen giới thiệu, bạn chuyển sang một công ty cùng ngành trả lương cao hơn 10%, chế độ tốt hơn. Mối quan hệ chính là tài sản!' }); } });
  }
  if (S.today.noWork) a.push({ label: '🚫 Hôm nay bạn được nghỉ', cond: () => 'Bão hoặc ngày đi thi' });
  else if (S.worked) a.push({ label: '✅ Đã xong ca hôm nay', cond: () => 'Mai quay lại nhé' });
  else if (isWorkday(S)) {
    const tid = availableTest(S);
    if (tid) {
      a.push({
        label: `📋 Thi tay nghề: ${TESTS[tid].name}`, sub: `${TESTS[tid].vi} · thay cho ca làm hôm nay, vẫn được tính lương`,
        cond: (s) => testBlockReason(s, tid) || (s.time > 10 * 60 ? 'Phải đến trước 10:00' : s.today.sickLeave ? 'Hôm nay bạn đã xin nghỉ ốm' : null),
        run: async (s) => {
          await takeTest(s, tid);
          const pay = Math.round((shiftRate(s) * payMul(s)) / 10) * 10;
          s.wage += pay; s.stats.earned += pay; s.workDays = (s.workDays || 0) + 1;
          applyFx(s, { energy: -20, full: -25 });
        },
      });
    }
    a.push({
      label: S.time <= 8 * 60 ? `${job.icon} Vào ca (08:00 – 17:00)` : `🏃 Vào ca muộn`,
      sub: S.time <= 8 * 60 ? 'Đúng giờ' : 'Bạn đã muộn giờ!',
      cond: (s) => (s.today.sickLeave ? 'Hôm nay bạn đã xin nghỉ ốm' : s.time > 10 * 60 ? 'Quá 10:00 — hôm nay bị tính nghỉ' : null),
      run: (s) => startShift(s, false),
    });
  } else if (sat) {
    a.push({
      label: '⏱️ Làm thêm thứ Bảy (đến 13:00)', sub: 'Tự nguyện · phụ cấp 25% · uy tín +',
      cond: (s) => (s.time > 9 * 60 ? 'Phải đến trước 09:00' : null),
      run: (s) => startShift(s, true),
    });
  } else a.push({ label: '😴 Chủ Nhật — công ty nghỉ', cond: () => 'Nghỉ ngơi đi!' });
  return a;
}
