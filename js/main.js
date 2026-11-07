// Khởi động game: màn hình chính, tạo nhân vật, vòng lặp khung hình.
import { G, newState, load, save, clearSave, MIDNIGHT, YEAR_DAYS, year, bestCert } from './state.js';
import { levelStats, progress } from './learning.js';
import { ending } from './days.js';
import { nextSessionText } from './exam.js';
import { journeyHtml } from './career.js';
import { openPhone } from './phone.js';
import { PEOPLE, stageName } from './social.js';
import { loveHtml } from './romance.js';
import { familyHtml } from './family.js';
import { JOBS, LOOK } from './data.js';
import { input, initInput } from './input.js';
import { modal, showHud, updateHud, toast, modalOpen, esc } from './ui.js';
import { view, engine, resize } from './engine.js';
import { townScene, initTown, placePlayer, objective } from './town.js';
import { interact } from './places.js';
import { passOut, critical } from './days.js';
import { drawPerson } from './pixel.js';
import { sfx, isMuted, setMuted } from './audio.js';
import { jpLevel, yen, vnd, STAT_INFO } from './state.js';

const $ = (id) => document.getElementById(id);
const canvas = $('game');
const ctx = canvas.getContext('2d');

// ---------- lỗi: hiện ra màn hình để dễ báo lỗi ----------
function showErr(msg) {
  const e = $('err');
  e.hidden = false;
  e.textContent = '⚠️ Lỗi: ' + msg;
}
window.addEventListener('error', (e) => showErr(e.message));
window.addEventListener('unhandledrejection', (e) => showErr(e.reason && (e.reason.stack || e.reason.message) || String(e.reason)));

// ---------- luồng có hội thoại (tạm dừng thị trấn) ----------
async function runFlow(fn) {
  if (G.busy) return;
  G.busy = true;
  try { await fn(); } catch (err) { console.error(err); showErr(err.stack || err.message); }
  finally {
    G.busy = false;
    input.suppress();
    if (G.S) { save(); updateHud(G.S, objective(G.S).text); }
  }
}

// ---------- màn hình chính ----------
function showScreen(id) {
  for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== id;
}
function showTitle() {
  showHud(false);
  engine.scene = null;
  $('btn-continue').hidden = !load();
  $('btn-act').hidden = true;
  showScreen('screen-title');
}
G.onEnd = showTitle;

// ---------- tạo nhân vật ----------
const draft = { name: '', gender: 'm', pref: 'f', look: { hair: LOOK.hair[0], shirt: LOOK.shirt[1], pants: LOOK.pants[0], skin: LOOK.skin[1] } };
function swatches(id, key) {
  const box = $(id);
  box.innerHTML = LOOK[key].map((c) => `<button type="button" class="sw" style="--c:${c}" data-c="${c}" aria-label="${c}" aria-pressed="${draft.look[key] === c}"></button>`).join('');
  box.onclick = (e) => {
    const b = e.target.closest('.sw');
    if (!b) return;
    draft.look[key] = b.dataset.c;
    box.querySelectorAll('.sw').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    sfx('tap');
  };
}
let previewT = 0;
function drawPreview(dt) {
  const pc = $('preview');
  if (!pc || $('screen-create').hidden) return;
  previewT += dt;
  const c = pc.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, pc.width, pc.height);
  c.imageSmoothingEnabled = false;
  c.setTransform(5, 0, 0, 5, 0, 0);
  const dirs = ['down', 'right', 'up', 'left'];
  const dir = dirs[Math.floor(previewT / 1.2) % 4];
  drawPerson(c, 12, 22, { ...draft.look, gender: draft.gender }, dir, previewT, true);
}

function creator() {
  return new Promise((resolve) => {
    showScreen('screen-create');
    $('in-name').value = draft.name;
    swatches('sw-hair', 'hair'); swatches('sw-shirt', 'shirt'); swatches('sw-pants', 'pants'); swatches('sw-skin', 'skin');
    const seg = $('seg-gender');
    seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.g === draft.gender ? 'true' : 'false'));
    const pref = $('seg-pref');
    const syncPref = () => pref.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x.dataset.g === draft.pref ? 'true' : 'false'));
    syncPref();
    seg.onclick = (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      draft.gender = b.dataset.g;
      draft.pref = draft.gender === 'm' ? 'f' : 'm';
      syncPref();
      seg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    };
    pref.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; draft.pref = b.dataset.g; syncPref(); };
    $('cr-back').onclick = () => resolve(null);
    $('cr-next').onclick = () => {
      const name = $('in-name').value.trim();
      if (!name) { $('in-name').focus(); toast('Hãy nhập tên nhân vật'); return; }
      draft.name = name.slice(0, 16);
      resolve({ name: draft.name, gender: draft.gender, pref: draft.pref, look: { ...draft.look } });
    };
  });
}

async function newGame() {
  const d = await creator();
  if (!d) return showTitle();
  const job = await modal({
    who: 'Chọn nghề', title: '🧰 Bạn sang Nhật làm nghề gì?', wide: true,
    text: 'Mỗi nghề có bộ câu hỏi tình huống và mini-game riêng.',
    choices: [
      ...Object.values(JOBS).map((j) => ({ label: `${j.icon} ${j.name} · ${j.jp}`, sub: `${j.desc} Lương cơ bản ${yen(j.pay)}/ca.`, value: j.id })),
      { label: '← Sửa nhân vật', value: null, cancel: true },
    ],
  });
  if (!job) return newGame();
  clearSave();
  G.S = newState({ ...d, job });
  G.S.pref = d.pref;
  placePlayer('dorm');
  startPlaying();
  await runFlow(intro);
}

async function intro() {
  const S = G.S, job = JOBS[S.job];
  await modal({
    who: 'Tháng Tư · Sân bay Narita', title: '✈️ Đặt chân đến Nhật Bản', jp: 'ようこそ日本へ',
    text: `${esc(S.name)} kéo vali bước ra khỏi sân bay. Trong túi còn <b>30.000¥</b>, còn ở quê là khoản nợ <b>40 triệu đồng</b> gia đình đã vay để lo chi phí cho bạn sang Nhật.`,
  });
  await modal({
    who: 'Nghiệp đoàn', title: '🏘️ Thị trấn Hikari-chō', jp: 'ひかり町',
    text: `Bạn được đưa về ký túc xá ở thị trấn nhỏ Hikari. Từ ngày mai bạn làm ở <b>${job.place}</b> (${job.name}).<br><br>Không có thời hạn: bạn ở Nhật bao lâu là tùy bạn. Hãy trả hết nợ, giữ sức khỏe và học tiếng Nhật — trả lời đúng càng nhiều thì tiến bộ càng nhanh.<br><span class="dim">(Một năm trong game được rút gọn còn ${YEAR_DAYS} ngày: mỗi mùa 14 ngày.)</span>`,
  });
  await modal({ who: 'Cách chơi', title: '🎮 Hướng dẫn nhanh', html: HELP_HTML, ok: 'Bắt đầu! 💪' });
}

const HELP_HTML = `<ul class="help">
  <li>🕹️ <b>Di chuyển:</b> WASD / phím mũi tên. Điện thoại: cần điều khiển góc trái.</li>
  <li>🚪 <b>Vào nhà, nói chuyện:</b> lại gần rồi nhấn <b>E</b> / <b>Space</b> (điện thoại: nút tròn góc phải).</li>
  <li>🔢 Trong hộp thoại có thể bấm phím số <b>1–9</b> để chọn nhanh.</li>
  <li>🏭 <b>Thứ Hai – Thứ Sáu</b> phải có mặt ở chỗ làm trước <b>08:00</b>. Nghỉ không phép bị trừ uy tín nặng. Uy tín về 0 là bị cho về nước!</li>
  <li>🧾 Lương trả vào <b>Chủ Nhật</b> (trừ tiền nhà, điện nước). Ra <b>tiệm chuyển tiền</b> gửi về để trả nợ.</li>
  <li>🍙 Nhớ ăn uống, ngủ trước <b>0:00</b>. Sức khỏe về 0 sẽ phải nhập viện.</li>
  <li>🗣️ <b>Tiếng Nhật:</b> học ở lớp tối, tự học ở ký túc xá, nói chuyện với bà Sato. Trả lời đúng liên tục được nhân điểm 🔥. Muốn có <b>chứng chỉ JLPT</b> phải đăng ký thi (tháng 7 và tháng 12).</li>
  <li>💞 <b>Quan hệ:</b> nói chuyện, tặng quà, rủ đi ăn để thân hơn. Người thân giúp bạn rất nhiều: gợi ý khi làm, giới thiệu việc, học nhanh hơn. Mở 📱 → "Ai ở đâu?" để biết gặp ai ở đâu. Cẩn thận người lạ rủ vay tiền, góp vốn, làm chui!</li>
  <li>🛂 <b>Visa:</b> năm đầu phải đỗ thi tay nghề 基礎級 ở chỗ làm để được gia hạn. Sau đó có thể lên TTS số 3, Kỹ năng đặc định, thậm chí thường trú.</li>
  <li>🧩 Ca làm là các câu hỏi tình huống. Thích chơi mini-game thì bật trong menu ⏸.</li>
  <li>➡️ Mũi tên vàng cạnh nhân vật chỉ chỗ nên đến tiếp theo.</li>
</ul>`;

function startPlaying() {
  showScreen(null);
  engine.scene = townScene;
  showHud(true);
  updateHud(G.S, objective(G.S).text);
}

function continueGame() {
  const S = load();
  if (!S) { toast('Không tìm thấy bản lưu'); return; }
  G.S = S;
  if (!S.pos) placePlayer('dorm');
  startPlaying();
  toast(`Chào mừng trở lại, ${esc(S.name)}!`);
}

// ---------- sổ tay & menu ----------
function bookHtml(S) {
  const row = (a, b) => `<div class="prow"><span>${a}</span><span>${b}</span></div>`;
  const st = ['health', 'energy', 'full', 'mood', 'rep'].map((k) => row(`${STAT_INFO[k].icon} ${STAT_INFO[k].label}`, Math.round(S[k]))).join('');
  const items = [
    S.inv.ingredients ? `🥬 Nguyên liệu nấu ăn ×${S.inv.ingredients}` : '',
    S.flags.bike ? '🚲 Xe đạp' : '', S.flags.kit ? '🎒 Túi khẩn cấp' : '', S.flags.umbrella ? '☂️ Ô' : '',
    ...(S.certs || []).map((c) => `📜 ${c.type} ${c.lv}`),
  ].filter(Boolean);
  const log = S.log.slice(0, 10).map((l) => `<li><span class="dim">Ngày ${l.d}:</span> ${esc(l.t)}</li>`).join('');
  return `<div class="payslip">${row('💴 Tiền mặt', yen(S.money))}${row('🧾 Lương chờ lĩnh', yen(S.wage))}${row('🏦 Nợ ở quê', vnd(Math.max(0, S.debt)))}${row('💸 Đã gửi về', vnd(S.stats.sentVnd))}${row('📅 Thời gian ở Nhật', `Năm ${year(S)} · ${S.day} ngày`)}${st}${row('👵 Câu bà Sato đã dạy', S.learned.length)}${row('🏭 Ca đã làm / đi muộn / nghỉ', `${S.stats.shifts} / ${S.stats.lates} / ${S.stats.absences}`)}</div>
    <h3>🛂 Visa & nghề nghiệp</h3>${journeyHtml(S)}
    <h3>🏡 Gia đình & tình cảm</h3>${familyHtml(S)}${loveHtml(S)}
    <h3>💞 Mối quan hệ</h3><div class="payslip">${Object.keys(PEOPLE).filter((id) => S.people && S.people[id] && S.people[id].met).map((id) => `<div class="prow"><span>${esc(PEOPLE[id].name)}</span><span>${stageName(S.people[id].aff)} · ${Math.round(S.people[id].aff)}</span></div>`).join('') || '<div class="dim">Chưa quen ai — mở 📱 → "Ai ở đâu?"</div>'}</div>
    <h3>🗣️ Tiếng Nhật — trình độ ${jpLevel(S)}${bestCert(S) ? ` · chứng chỉ ${bestCert(S)}` : ''}</h3>
    <div class="payslip">${levelStats(S.lang).map((l) => `<div class="prow"><span>${l.reached ? '✅' : '⬜'} ${l.lv}</span><span>${Math.min(100, Math.round((l.xp / l.need) * 100))}% · chính xác ${Math.round(l.acc * 100)}%</span></div>`).join('')}
    <div class="prow"><span>🔥 Chuỗi đúng dài nhất</span><span>${S.lang.best}</span></div></div>
    <p class="dim">📝 ${S.exam ? `Đã đăng ký thi JLPT ${S.exam.lv}${S.exam.taken ? ' — đang chờ kết quả' : ''}` : nextSessionText(S)}</p>
    <p class="dim">Đồ dùng: ${items.length ? items.join(' · ') : 'chưa có gì'}</p>
    ${log ? `<h3>Nhật ký gần đây</h3><ul class="log">${log}</ul>` : ''}`;
}
$('btn-phone').onclick = () => { if (G.S && !G.busy) runFlow(() => openPhone(G.S)); };
$('btn-book').onclick = () => { if (G.S && !G.busy) runFlow(() => modal({ who: `Sổ tay của ${G.S.name}`, title: '📒 Sổ tay', html: bookHtml(G.S), wide: true, ok: 'Đóng' })); };
$('btn-menu').onclick = () => {
  if (!G.S || G.busy) return;
  runFlow(async () => {
    const S0 = G.S;
    const v = await modal({
      title: '⏸ Tạm dừng',
      choices: [
        { label: '▶ Chơi tiếp', value: 'go', primary: true },
        { label: '🎮 Hướng dẫn', value: 'help' },
        { label: S0.settings.shiftMode === 'mini' ? '🎮 Ca làm: Mini-game' : '🧩 Ca làm: Trắc nghiệm', sub: 'Bấm để đổi', value: 'mode' },
        { label: isMuted() ? '🔇 Âm thanh: tắt' : '🔊 Âm thanh: bật', value: 'snd' },
        { label: '✈️ Về nước (kết thúc hành trình)', value: 'home' },
        { label: '💾 Lưu & về màn hình chính', value: 'quit' },
      ],
    });
    if (v === 'help') await modal({ title: '🎮 Hướng dẫn', html: HELP_HTML });
    if (v === 'mode') { S0.settings.shiftMode = S0.settings.shiftMode === 'mini' ? 'quiz' : 'mini'; toast(S0.settings.shiftMode === 'mini' ? '🎮 Ca làm: Mini-game' : '🧩 Ca làm: Trắc nghiệm'); }
    if (v === 'home') {
      const ok = await modal({ title: 'Về nước thật sao?', text: 'Hành trình ở Nhật sẽ kết thúc và bạn xem tổng kết. Bản lưu sẽ bị xóa.', choices: [{ label: '✈️ Về nước', value: true }, { label: 'Ở lại', value: false, cancel: true }] });
      if (ok) await ending(S0, 'home');
    }
    if (v === 'snd') { setMuted(!isMuted()); toast(isMuted() ? '🔇 Đã tắt âm thanh' : '🔊 Đã bật âm thanh'); }
    if (v === 'quit') { save(); G.S = null; showTitle(); }
  });
};

$('btn-new').onclick = () => {
  if (load()) {
    modal({ title: 'Bắt đầu lại từ đầu?', text: 'Bản lưu hiện tại sẽ bị xóa khi bạn bắt đầu game mới.', choices: [{ label: 'Bắt đầu mới', value: true }, { label: 'Thôi', value: false, cancel: true }] })
      .then((ok) => { if (ok) newGame(); });
  } else newGame();
};
$('btn-continue').onclick = continueGame;
$('btn-help').onclick = () => modal({ title: '🎮 Hướng dẫn', html: HELP_HTML });

// ---------- vòng lặp ----------
canvas.addEventListener('pointerdown', (e) => {
  const sc = engine.scene;
  if (!sc || !sc.pointer) return;
  const r = canvas.getBoundingClientRect();
  sc.pointer((e.clientX - r.left) / view.z, (e.clientY - r.top) / view.z, view);
});

let last = performance.now(), hudT = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const sc = engine.scene;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (!sc) {
    ctx.fillStyle = '#141a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    if (sc.isMini || !G.busy) sc.update(dt, view);
    const s = view.z * view.dpr;
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.imageSmoothingEnabled = false;
    if (G.S || sc.isMini) sc.draw(ctx, view);
  }
  if (sc === townScene && G.S && !G.busy && !modalOpen()) {
    const S = G.S;
    if (S.time >= MIDNIGHT) runFlow(() => passOut(S));
    else if (S.health <= 0 || S.mood <= 0 || S.rep <= 0) runFlow(() => critical(S));
    else if (input.act() && townScene.target) { const t = townScene.target; runFlow(() => interact(t)); }
  }
  hudT -= dt;
  if (hudT <= 0 && G.S && sc === townScene) { hudT = 0.2; updateHud(G.S, objective(G.S).text); }
  drawPreview(dt);
  input.endFrame();
  requestAnimationFrame(frame);
}

// ---------- khởi động ----------
if (/[?&]debug\b/.test(location.search)) Object.assign(window, { __G: G, __engine: engine, __view: view });
if (matchMedia('(pointer: coarse)').matches) document.body.classList.add('touch');
initInput(() => document.body.classList.add('touch'));
resize(canvas);
addEventListener('resize', () => resize(canvas));
initTown();
engine.town = townScene;
showTitle();
requestAnimationFrame(frame);
