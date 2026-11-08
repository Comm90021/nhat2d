// ⏩ Chờ / bỏ qua thời gian (phím Z): chờ tới giờ chọn. Thời gian chạy từng 30 phút để mọi thứ theo giờ
// (NPC đổi chỗ, hẹn hò, đói/mệt) vẫn diễn ra; tới giờ hẹn thì dừng lại.
import { advance, applyFx, clockStr, MIDNIGHT, isWorkday } from './state.js';
import { modal, toast } from './ui.js';
import { employed } from './jobs.js';
import { AI_PLACES } from './ai/world.js';
import { PEOPLE } from './ai/world.js';

const H = (h, m = 0) => h * 60 + m;

export async function openWait(S) {
  const now = S.time, opts = [];
  const add = (label, to, sub) => { if (to > now + 4 && to <= MIDNIGHT - 10 && !opts.some((o) => Math.abs(o.to - to) < 10)) opts.push({ label, to, sub }); };
  add('⏳ 30 phút', now + 30);
  add('⏳ 1 tiếng', now + 60);
  add('⏳ 3 tiếng', now + 180);
  const ap = S.today.appt;
  if (ap && !ap.done && ap.at - 15 > now) add(`📅 Tới giờ hẹn với ${PEOPLE[ap.id] ? PEOPLE[ap.id].name : '…'}`, ap.at - 15, `${clockStr(ap.at)} ở ${AI_PLACES[ap.place] ? AI_PLACES[ap.place].name : ap.place} — dừng trước 15 phút`);
  if (isWorkday(S) && employed(S) && !S.worked && now < H(7, 30)) add('💼 Tới giờ đi làm', H(7, 30), 'Dừng lúc 07:30, kịp tới chỗ làm trước 08:00');
  for (const [h, t] of [[9, '🌅 Tới 09:00 (cửa hàng mở)'], [12, '🍱 Tới trưa (12:00)'], [17, '🌆 Tới chiều (17:00)'], [18, '🌇 Tới 18:00'], [21, '🌙 Tới 21:00']]) add(t, H(h));
  const v = await modal({
    who: `Bây giờ ${clockStr(now)}`, title: '⏩ Chờ / bỏ qua thời gian',
    text: 'Ngồi nghỉ chờ thời gian trôi: hồi chút năng lượng, nhưng vẫn đói dần. Có giờ hẹn thì tự dừng lại.',
    choices: [...opts.map((o) => ({ label: o.label, sub: o.sub || `tới ${clockStr(o.to)}`, value: o.to })), { label: '← Thôi', value: null, cancel: true }],
  });
  if (!v) return;
  await runWait(S, v);
}

export async function runWait(S, to) {
  const start = S.time;
  while (S.time < to - 0.5) {
    const ap0 = S.today.appt;
    const stopAt = ap0 && !ap0.done && ap0.at - 15 > S.time + 0.5 ? ap0.at - 15 : Infinity;
    const step = Math.min(30, to - S.time, stopAt - S.time);
    advance(S, step);
    applyFx(S, { energy: (step / 30) * 3, stress: -(step / 60) * 0.5 });
    const ap = S.today.appt;
    if (ap && !ap.done && S.time >= ap.at - 15 && S.time < ap.at + 60 && start < ap.at - 15) { toast(`📅 Sắp tới giờ hẹn (${clockStr(ap.at)})!`, 2600); break; }
    if (S.full < 15) { toast('🍙 Đói quá — dừng chờ để đi ăn'); break; }
  }
  toast(`⏩ Bây giờ là ${clockStr(S.time)}`);
}
