// Các địa điểm trong thị trấn + nói chuyện với NPC.
import { G, MIDNIGHT, RATE, applyFx, advance, clockStr, yen, vnd, dow, seasonIdx, addLog, save, isNewYear, year } from './state.js';
import { studyJapanese } from './quiz.js';
import { canRegister, register, nextSessionText } from './exam.js';
import { applyPR } from './career.js';
import { JOBS, PHRASES, LONG_TIPS, TEACHER_TALK } from './data.js';
import { modal, chips, toast } from './ui.js';
import { sleep } from './days.js';
import { workActions } from './work.js';
import { sfx } from './audio.js';
import { pay } from './finance.js';
import { talkTo, peopleHere, atLeast, isAt, P, gain, personActions, PEOPLE } from './social.js';
import { enterBuilding, exitBuilding, travelTo, curMap } from './town.js';
import { npcsAt, stateOf } from './ai/sim.js';
import { AI_PLACES } from './ai/world.js';
import { COMPANY } from './content/companies.js';
import { INTERIOR_OF } from './content/interiors.js';
import { community } from './community.js';
import { fam, famGain, canVisitHome, visitHome } from './family.js';
import { canSpouseVisa } from './romance.js';
import { setVisa } from './career.js';

const H = (h, m = 0) => h * 60 + m;
const PLACE_CAT = { konbini: 'food', super: 'food', clinic: 'health', class: 'study', remit: 'remit', center: 'social', park: 'social', shrine: 'other', dorm: 'food', river: 'other', work: 'other' };
let curPlace = '';
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const buy = (label, cost, fx, res, sub) => ({ label, cost, minutes: 5, fx, res, sub });

const PLACES = {
  dorm: {
    name: 'Ký túc xá', jp: '寮',
    desc: (S) => `Phòng 4 người, chiếu tatami cũ, góc bếp nhỏ. Bây giờ là ${clockStr(S.time)}.`,
    actions: (S) => [
      {
        label: '😴 Đi ngủ', sub: 'Ngủ đến 06:30 sáng mai · lưu game',
        run: async (s) => {
          if (s.time < H(19)) {
            const ok = await modal({ title: 'Ngủ luôn bây giờ?', text: `Mới ${clockStr(s.time)}. Đi ngủ sẽ bỏ qua phần còn lại của ngày hôm nay.`, choices: [{ label: 'Ngủ', value: true }, { label: 'Thôi', value: false, cancel: true }] });
            if (!ok) return;
          }
          await sleep(s);
          return 'leave';
        },
      },
      { label: '💤 Chợp mắt 1 tiếng', minutes: 60, fx: { energy: 14, mood: 1 }, cond: (s) => (s.today.nap ? 'Hôm nay đã chợp mắt rồi' : null), after: (s) => { s.today.nap = true; }, res: 'Bạn ngủ một giấc ngắn, người tỉnh táo hơn.' },
      { label: '🍳 Nấu ăn', sub: `Còn ${S.inv.ingredients} phần nguyên liệu`, minutes: 40, fx: { full: 45, mood: 4, health: 1 }, cond: (s) => (s.inv.ingredients > 0 ? null : 'Hết nguyên liệu — mua ở siêu thị'), after: (s) => { s.inv.ingredients--; }, res: '「いただきます！」 Cơm nhà tự nấu vừa rẻ vừa ngon.' },
      {
        label: '📱 Gọi video về nhà', minutes: 30, fx: { mood: 10 }, cond: (s) => (s.today.call ? 'Hôm nay đã gọi rồi' : null),
        after: (s) => { s.today.call = true; fam(s).lastCall = s.day; famGain(s, 3); if (s.time >= H(22) && Math.random() < 0.5) s.flags.lateCall = true; },
        res: (s) => (s.time >= H(22) ? 'Nói chuyện vui quá, quên mất đã khuya. Tường ký túc xá mỏng lắm…' : 'Mẹ hỏi ăn uống thế nào, bố dặn giữ sức khỏe. Bạn thấy nhẹ lòng hơn.'),
      },
      { label: '📖 Tự học tiếng Nhật', sub: '3 câu hỏi · 60 phút', minutes: 60, energy: 10, run: selfStudy },
      ...(atLeast(S, 'ha', 2) && isAt(S, 'ha', 'dorm') ? [{ label: '🍲 Nấu ăn chung với Hà', sub: 'Không cần nguyên liệu', minutes: 60, fx: { full: 45, mood: 6, health: 1 }, cond: (s) => (s.today.cookHa ? 'Hôm nay đã nấu rồi' : null), after: (s) => { s.today.cookHa = true; gain(s, 'ha', 2); }, res: 'Hà nấu canh chua, bạn rán cá. Bữa cơm có mùi quê nhà.' }] : []),
      ...(canVisitHome(S) ? [{ label: '✈️ Xin nghỉ phép về thăm nhà', sub: 'Dịp Tết / hè · 4 ngày', run: async (s) => { if (await visitHome(s)) return 'leave'; } }] : []),
      ...(canSpouseVisa(S) ? [{ label: '📄 Đổi sang visa vợ/chồng người Nhật', sub: 'Đã kết hôn với người Nhật', run: async (s) => { setVisa(s, 'spouse', 3); await modal({ who: 'Cục Quản lý Xuất nhập cảnh', title: '🛂 Visa vợ/chồng người Nhật', text: 'Hồ sơ được chấp thuận. Visa này không giới hạn ngành nghề, gia hạn 1–3 năm một lần, và sau 3 năm kết hôn có thể xin thường trú.' }); } }] : []),
      ...(['ssw2', 'spouse'].includes(S.career.visa) ? [{ label: '📄 Nộp hồ sơ xin thường trú (永住)', sub: 'Lệ phí ¥10,000 · xét điều kiện', run: applyPR }] : []),
      { label: '📝 Đăng ký thi JLPT qua mạng', sub: canRegister(S) ? 'Đang mở đăng ký · lệ phí ¥7,500' : nextSessionText(S), cond: (s) => (canRegister(s) ? null : 'Chưa tới đợt đăng ký'), run: register },
    ],
  },
  konbini: {
    name: 'Konbini Hoshi', jp: 'コンビニ · 24時間',
    desc: () => '「いらっしゃいませ！」 Cửa hàng tiện lợi mở cửa 24/24.',
    actions: () => [
      buy('🍙 Cơm nắm onigiri', 160, { full: 15 }, 'Onigiri cá hồi — món "cứu đói" quốc dân.'),
      buy('🍱 Cơm hộp bento', 520, { full: 45, mood: 2 }, 'Nhân viên: 「温めますか？」 — Bạn: 「はい、お願いします」. Hâm nóng xong ăn ngon hẳn.'),
      buy('🍜 Mì cốc', 230, { full: 28, health: -1 }, 'Rẻ và nhanh, nhưng ăn hoài không tốt cho sức khỏe.'),
      buy('🥤 Nước tăng lực', 210, { energy: 18, health: -2 }, 'Tỉnh hẳn… tạm thời thôi.'),
      { label: '💊 Thuốc cảm', cost: 1280, minutes: 5, fx: { health: 5 }, cond: (s) => (s.sick > 0 ? null : 'Bạn không bị ốm'), after: (s) => { s.sick = 0; }, res: 'Uống thuốc, giữ ấm, bạn đỡ hẳn.' },
      { label: '🎒 Túi đồ khẩn cấp', sub: 'Nước, đồ hộp, đèn pin, pin dự phòng', cost: 3200, minutes: 10, fx: { mood: 2 }, cond: (s) => (s.flags.kit ? 'Đã có rồi' : null), after: (s) => { s.flags.kit = true; }, res: 'Nhật Bản hay có động đất và bão — chuẩn bị trước cho yên tâm.' },
      { label: '📰 Đứng đọc tạp chí (立ち読み)', minutes: 20, fx: { mood: 2, jp: 0.3 }, res: 'Bạn lật xem tạp chí, học thêm được vài chữ katakana.' },
      ...(atLeast(G.S, 'tuan', 2) && isAt(G.S, 'tuan', 'konbini') ? [{ label: '🍱 Nhận cơm hộp sắp hết hạn từ Tuấn', sub: 'Miễn phí', minutes: 5, fx: { full: 40, mood: 3 }, cond: (s) => (s.today.tuanFood ? 'Hôm nay nhận rồi' : null), after: (s) => { s.today.tuanFood = true; }, res: 'Tuấn nháy mắt: "Sắp tới giờ bỏ rồi, cầm về ăn đi."' }] : []),
    ],
  },
  super: {
    name: 'Siêu thị Mitsuba', jp: 'スーパー',
    closed: (S) => (S.time < H(9) || S.time >= H(21) ? 'Siêu thị mở cửa 09:00 – 21:00.' : null),
    desc: (S) => (S.time >= H(19) ? 'Sau 19:00 — nhân viên đang dán tem 半額 (giảm nửa giá) lên đồ ăn!' : 'Rau, thịt, cá… rẻ hơn konbini.'),
    actions: (S) => {
      const half = S.time >= H(19);
      return [
        { label: '🥬 Nguyên liệu nấu 1 bữa', cost: 320, minutes: 10, after: (s) => { s.inv.ingredients += 1; }, res: 'Đã mua rau, trứng, thịt gà. Về ký túc xá nấu nhé.' },
        { label: '🛒 Nguyên liệu 3 bữa', sub: 'Tiết kiệm hơn', cost: 900, minutes: 15, after: (s) => { s.inv.ingredients += 3; }, res: 'Túi đồ đầy ắp. Về ký túc xá nấu dần.' },
        half
          ? buy('🍱 Bento dán tem 半額', 230, { full: 45, mood: 4 }, 'Mẹo của dân thực tập sinh: sau 19:00 nhiều siêu thị giảm nửa giá đồ ăn sắp hết hạn trong ngày!')
          : buy('🍱 Bento siêu thị', 460, { full: 45, mood: 1 }, 'Rẻ hơn konbini một chút.'),
        buy('🍎 Trái cây', 300, { health: 3, mood: 2, full: 8 }, 'Táo Aomori giòn ngọt.'),
      ];
    },
  },
  clinic: {
    name: 'Phòng khám Aoi', jp: 'クリニック',
    closed: (S) => (dow(S) === 6 ? 'Chủ Nhật phòng khám nghỉ. Mua thuốc ở konbini nếu cần.' : S.time < H(9) || S.time >= H(18) ? 'Phòng khám mở 09:00 – 18:00.' : null),
    desc: () => 'Đưa thẻ bảo hiểm (保険証) ở quầy lễ tân, bạn chỉ phải trả 30% chi phí.',
    actions: (S) => [
      S.sick > 0
        ? { label: '🩺 Khám bệnh', sub: 'Có bảo hiểm · mất khoảng 90 phút', cost: 1800, minutes: 90, fx: { health: 12, mood: 2 }, after: (s) => { s.sick = 0; }, res: 'Bác sĩ hỏi 「どうしましたか？」. Bạn nói 「熱があります」. Uống thuốc theo đơn, bạn khỏi hẳn.' }
        : { label: '🩺 Khám sức khỏe tổng quát', cost: 1500, minutes: 60, fx: { health: 6 }, cond: (s) => (s.today.checkup ? 'Hôm nay đã khám rồi' : null), after: (s) => { s.today.checkup = true; }, res: 'Bác sĩ dặn ăn nhiều rau, ngủ đủ giấc.' },
    ],
  },
  class: {
    name: 'Lớp tiếng Nhật', jp: '日本語教室',
    closed: (S) => {
      const t = S.time, wk = dow(S) < 5;
      if (wk && (t < H(17, 30) || t >= H(21))) return 'Lớp tình nguyện mở tối ngày thường 17:30 – 21:00.';
      if (!wk && (t < H(10) || t >= H(17))) return 'Cuối tuần lớp mở 10:00 – 17:00.';
      return null;
    },
    desc: () => 'Lớp do tình nguyện viên trong thị trấn dạy miễn phí. Cô Mori chào bạn: 「こんにちは！」',
    actions: () => [
      { label: '📝 Học một buổi (90 phút)', sub: 'Trả lời 5 câu hỏi', minutes: 90, energy: 8, cond: (s) => (s.today.class ? 'Hôm nay đã học rồi' : null), run: quiz },
      { label: '☕ Trò chuyện với cô giáo', minutes: 20, fx: { jp: 0.8, mood: 3 }, cond: (s) => (s.today.chat ? 'Hôm nay đã nói chuyện rồi' : null), after: (s) => { s.today.chat = true; }, res: () => TEACHER_TALK[Math.floor(Math.random() * TEACHER_TALK.length)] },
    ],
  },
  remit: {
    name: 'Tiệm chuyển tiền', jp: '海外送金',
    closed: (S) => (S.time < H(10) || S.time >= H(19) ? 'Tiệm mở cửa 10:00 – 19:00 hằng ngày.' : null),
    desc: (S) => `Tỷ giá hôm nay: 1¥ = ${RATE}₫. Nợ còn: <b>${vnd(Math.max(0, S.debt))}</b>.`,
    actions: (S) => {
      const fee = atLeast(S, 'long', 2) ? 500 : 990;
      const a = [{ label: '💸 Gửi tiền về nhà', sub: `Công ty có giấy phép · phí ${fee}¥ · an toàn`, run: (s) => remit(s, false) }];
      if (S.flags.chuiAd) a.push({ label: '🕶️ Gửi qua "người quen" trên mạng', sub: 'Không phí · 1¥ = 176₫ · KHÔNG có giấy phép', run: (s) => remit(s, true) });
      return a;
    },
  },
  shrine: {
    name: 'Đền Hikari', jp: '神社',
    desc: () => 'Rửa tay ở thủy tự (手水舎) trước khi vào. Cổng torii đỏ, rừng cây yên tĩnh.',
    actions: (S) => {
      const a = [
        { label: '🎴 Rút quẻ omikuji', cost: 100, minutes: 10, cond: (s) => (s.today.omikuji ? 'Mỗi ngày rút một lần thôi' : null), run: omikuji },
        { label: '🙏 Cầu nguyện', sub: 'Thả đồng 5¥', cost: 5, minutes: 10, fx: { mood: 3 }, cond: (s) => (s.today.pray ? 'Hôm nay đã cầu rồi' : null), after: (s) => { s.today.pray = true; }, res: 'Đồng 5 yên (五円, go-en) đồng âm với ご縁 — "duyên lành". Người Nhật hay thả đồng 5 yên khi cầu nguyện.' },
      ];
      if (isNewYear(S)) a.unshift({ label: '⛩️ Đi lễ đầu năm (初詣)', minutes: 60, cost: 500, fx: { mood: 14, health: 2 }, after: (s) => { s.flags.hatsu = year(s); }, res: 'Bạn xếp hàng cùng mọi người, cầu cho gia đình bình an và năm mới may mắn. 「あけましておめでとうございます！」' });
      return a;
    },
  },
  work: {
    name: (S) => JOBS[S.job].place, jp: (S) => JOBS[S.job].jp,
    desc: (S) => `${JOBS[S.job].desc}<br>Lương chờ lĩnh: <b>${yen(S.wage)}</b> (trả vào Chủ Nhật).`,
    actions: workActions,
  },
  park: {
    name: 'Công viên Hikari', jp: '公園',
    desc: (S) => ['Hoa anh đào nở rộ, cánh hoa bay lả tả.', 'Ve kêu râm ran, trẻ con chơi nước ở đài phun.', 'Lá phong đỏ rực cả một góc trời.', 'Tuyết phủ trắng ghế đá, hồ nước đóng băng mỏng.'][seasonIdx(S)],
    actions: (S) => {
      const si = seasonIdx(S);
      const a = [
        { label: '🪑 Ngồi nghỉ ngắm cảnh', minutes: 60, fx: { mood: 7, energy: 4 }, res: 'Bạn ngồi thả lỏng, ngắm người qua lại.' },
        { label: '🏃 Chạy bộ', minutes: 30, energy: 15, fx: { energy: -12, health: 3, mood: 3 }, res: 'Chạy vài vòng quanh hồ, người khỏe khoắn hẳn.' },
      ];
      if (npcsAt(S, 'park').some((id) => stateOf(S, id).act === 'sport')) a.unshift({ label: '⚽ Đá bóng với CLB', sub: 'Sáng Chủ Nhật · ai đến cũng được', minutes: 120, energy: 20, fx: (s) => ({ energy: -15, health: atLeast(s, 'daiki', 2) ? 7 : 4, mood: 7, full: -10 }), cond: (s) => (s.today.football ? 'Hôm nay đá rồi' : null), after: (s) => { s.today.football = true; gain(s, 'daiki', 3); }, res: 'Hai tiếng chạy hết sân, cả đội hò hét 「ナイス！」. Mệt mà vui.' });
      if (S.today.matsuri && S.time >= H(18) && S.time < H(22)) a.unshift({ label: '🏮 Đi lễ hội mùa hè', cost: 1500, minutes: 120, fx: { mood: 18, full: 20, jp: 1 }, cond: (s) => (s.today.matsuriDone ? 'Đã đi rồi' : null), after: (s) => { s.today.matsuriDone = true; }, res: 'Takoyaki, kẹo táo, múa bon odori theo tiếng trống… rồi pháo hoa rực trời. 「きれい〜！」' });
      if (si === 0 && !S.flags.hanamiSelf) a.push({ label: '🌸 Ngắm hoa anh đào', minutes: 60, fx: { mood: 10 }, after: (s) => { s.flags.hanamiSelf = true; }, res: 'Dưới tán hoa anh đào, bạn chụp tấm ảnh gửi về cho mẹ.' });
      if (si === 2 && !S.flags.momiji) a.push({ label: '🍁 Ngắm lá đỏ (紅葉)', minutes: 60, fx: { mood: 10 }, after: (s) => { s.flags.momiji = true; }, res: 'Lá phong đỏ như lửa. Người Nhật gọi đi ngắm lá là 紅葉狩り (momijigari).' });
      if (si === 3 && !S.flags.snowman && S.weather === 'snow') a.push({ label: '⛄ Đắp người tuyết', minutes: 45, fx: { mood: 10, energy: -5 }, after: (s) => { s.flags.snowman = true; }, res: 'Lần đầu thấy tuyết thật! Người tuyết của bạn hơi méo nhưng rất đáng yêu.' });
      return a;
    },
  },
  center: {
    name: 'Trung tâm giao lưu quốc tế', jp: '国際交流センター',
    closed: (S) => { const t = S.time, d = dow(S); if (d >= 5 && t >= H(10) && t < H(17)) return null; if (d === 2 && t >= H(18) && t < H(21)) return null; return 'Mở cửa: cuối tuần 10:00–17:00, tối thứ Tư 18:00–21:00.'; },
    desc: () => 'Nơi người nước ngoài và người Nhật trong vùng gặp gỡ: lớp giao lưu ngôn ngữ, tư vấn đời sống, sinh hoạt cộng đồng.',
    actions: (S) => [
      { label: '🗣️ Giao lưu ngôn ngữ', sub: 'Nói chuyện với tình nguyện viên · 3 câu · 60 phút', minutes: 60, energy: 8, cond: (s) => (s.today.exchange ? 'Hôm nay đã tham gia rồi' : null), run: langExchange },
      ...(dow(S) === 6 && S.time >= H(13) && S.time < H(17) ? [{ label: '🇻🇳 Sinh hoạt hội người Việt', sub: 'Chiều Chủ Nhật · ăn uống, chia sẻ kinh nghiệm', minutes: 120, cond: (s) => (s.today.community ? 'Hôm nay đã tham gia rồi' : null), run: community }] : []),
      { label: '📌 Xem bảng thông tin', minutes: 5, res: '• Giao lưu ngôn ngữ: cuối tuần 10–17h, tối thứ Tư 18–21h<br>• Hội người Việt: chiều Chủ Nhật 13–17h<br>• CLB bóng đá: sáng Chủ Nhật ở công viên<br>• Tư vấn lao động bằng tiếng Việt: OTIT, nghiệp đoàn<br>• Cảnh báo: KHÔNG vay tiền, góp vốn hay nhận việc qua người lạ!' },
    ],
  },
  station: {
    name: 'Ga Hikari', jp: 'ひかり駅',
    closed: (S) => (S.time < H(5, 30) ? 'Chuyến tàu đầu tiên lúc 05:30.' : null),
    desc: () => 'Tàu địa phương 2 toa. Khu công nghiệp Minato cách 2 ga.',
    actions: () => [{ label: '🚃 Đi tàu sang khu công nghiệp Minato', sub: '¥200 · khoảng 20 phút', cost: 200, minutes: 20, run: async (s) => { pay(s, 200, 'travel', 'Vé tàu Hikari → Minato'); advance(s, 20); await travelTo('minato'); return 'leave'; } }],
  },
  station2: {
    name: 'Ga Minato', jp: 'みなと駅',
    closed: (S) => (S.time < H(5, 30) ? 'Chuyến tàu đầu tiên lúc 05:30.' : null),
    desc: () => 'Ga của khu công nghiệp. Giờ tan ca rất đông công nhân.',
    actions: () => [{ label: '🚃 Về thị trấn Hikari', sub: '¥200 · khoảng 20 phút', cost: 200, minutes: 20, run: async (s) => { pay(s, 200, 'travel', 'Vé tàu Minato → Hikari'); advance(s, 20); await travelTo('town'); return 'leave'; } }],
  },
  ramen: {
    name: 'Quán ramen Taishō', jp: 'ラーメン',
    closed: (S) => (dow(S) === 0 ? 'Thứ Hai quán nghỉ.' : S.time < H(11) || S.time >= H(23) ? 'Quán mở 11:00 – 23:00.' : null),
    desc: () => '「いらっしゃい！」 Nước dùng xương heo hầm 12 tiếng.',
    actions: () => [
      buy('🍜 Ramen tonkotsu', 900, { full: 55, mood: 7 }, 'Nóng hổi, béo ngậy. Người Nhật ăn mì phải xì xụp thành tiếng — không phải bất lịch sự đâu.'),
      buy('🥟 Ramen + gyoza', 1250, { full: 70, mood: 9 }, 'Combo cứu đói sau ca làm.'),
      buy('🍺 Bia hơi', 550, { mood: 5, health: -1 }, '「乾杯！」'),
    ],
  },
  teishoku: {
    name: 'Quán cơm Ōmori', jp: '定食屋',
    closed: (S) => (dow(S) === 6 ? 'Chủ Nhật quán nghỉ.' : S.time < H(7) || S.time >= H(21) ? 'Quán mở 07:00 – 21:00.' : null),
    desc: () => 'Quán cơm suất (定食) quen của công nhân khu công nghiệp.',
    actions: () => [
      buy('🍱 Cơm suất cá nướng', 780, { full: 55, mood: 4, health: 1 }, 'Cơm, canh miso, cá thu nướng, dưa muối — bữa cơm kiểu Nhật đầy đủ.'),
      buy('🍛 Cơm cà ri', 650, { full: 50, mood: 4 }, 'Rẻ, no lâu.'),
    ],
  },
  care: {
    name: 'Viện dưỡng lão Hinata', jp: '介護施設',
    closed: (S) => (S.time < H(9) || S.time >= H(19) ? 'Giờ thăm 09:00 – 19:00.' : null),
    desc: () => 'Nhiều điều dưỡng ở đây là lao động Việt Nam theo visa Kỹ năng đặc định ngành điều dưỡng.',
    actions: () => [
      { label: '🤝 Làm tình nguyện: trò chuyện với các cụ', sub: '60 phút', minutes: 60, fx: { mood: 7, jp: 1.5 }, cond: (s) => (s.today.careVol ? 'Hôm nay đã làm rồi' : null), after: (s) => { s.today.careVol = true; }, res: 'Một cụ bà kể chuyện thời trẻ, bạn nghe được một nửa. Cụ nắm tay bạn: 「ありがとうね」.' },
      { label: '📄 Hỏi về việc điều dưỡng', minutes: 10, res: 'Ngành điều dưỡng (介護) cần người. Muốn làm theo visa Kỹ năng đặc định phải thi kỹ năng điều dưỡng + tiếng Nhật điều dưỡng, cộng với JLPT N4 trở lên. (Chuyển việc sẽ có ở bản cập nhật nghề nghiệp.)' },
    ],
  },
  apt: {
    name: 'Chung cư Minato', jp: 'アパート',
    desc: () => 'Chung cư cũ nơi nhiều lao động nước ngoài ở. Hộp thư dán chi chít tên.',
    actions: () => [{ label: '📮 Xem hộp thư chung', minutes: 2, res: 'Tờ rơi tuyển dụng, hóa đơn điện, quảng cáo sim giá rẻ… và một tờ giấy: 「ゴミは決められた日に出してください」.' }],
  },
  river: {
    name: 'Bờ sông', jp: '川辺',
    desc: () => 'Dòng sông chảy hiền hòa, phía xa là núi.',
    actions: () => [
      { label: '🌊 Ngồi ngắm sông', minutes: 30, fx: { mood: 5 }, res: 'Gió mát, tiếng nước chảy — giống bờ sông quê nhà.' },
      { label: '🎵 Hát một bài quê nhà', minutes: 20, fx: { mood: 6 }, cond: (s) => (s.today.sing ? 'Hát rồi mà' : null), after: (s) => { s.today.sing = true; }, res: 'Bạn khe khẽ hát. Một bà cụ đi ngang vỗ tay: 「上手ですね！」' },
    ],
  },
};

const val = (v, S) => (typeof v === 'function' ? v(S) : v);

function reasonOf(a, S) {
  if (a.cost && S.money < a.cost) return 'Không đủ tiền';
  if (a.minutes && S.time + a.minutes > MIDNIGHT) return 'Quá khuya rồi';
  if (a.energy && S.energy < a.energy) return 'Quá mệt';
  if (a.cond) return a.cond(S);
  return null;
}

export const placeClosed = (id, S) => (PLACES[id] && PLACES[id].closed ? PLACES[id].closed(S) : null);

// keywords: chỉ hiện các lựa chọn có nhãn chứa một trong các từ khóa (dùng khi bấm vào đồ vật trong phòng)
export async function openPlace(id, keywords = null) {
  const P = PLACES[id];
  curPlace = id;
  const S = G.S;
  sfx('door');
  const closed = P.closed && P.closed(S);
  if (closed) { await modal({ who: val(P.jp, S), title: val(P.name, S), text: `🔒 ${closed}` }); return; }
  for (;;) {
    if (G.S !== S || S.time >= MIDNIGHT) return;
    let acts = [...P.actions(S), ...(keywords ? [] : peopleHere(S, id))];
    if (keywords) {
      const k = keywords.map((x) => x.toLowerCase());
      acts = acts.filter((a) => k.some((w) => a.label.toLowerCase().includes(w)));
      if (!acts.length) { await modal({ who: val(P.jp, S), title: val(P.name, S), text: 'Lúc này không có việc gì để làm ở đây.' }); return; }
      if (acts.length === 1 && !reasonOf(acts[0], S)) { const r = await doAction(acts[0], S); save(); return r; }
    }
    const choices = acts.map((a, i) => {
      const r = reasonOf(a, S);
      return { label: a.label + (a.cost ? ` · ${yen(a.cost)}` : ''), sub: a.sub, value: i, disabled: !!r, reason: r };
    });
    choices.push({ label: keywords ? '✖ Thôi' : '🚪 Ra ngoài', value: -1, cancel: true });
    const i = await modal({ who: val(P.jp, S), title: val(P.name, S), text: `${val(P.desc, S)}<br><span class="dim">🕒 ${clockStr(S.time)} · 💴 ${yen(S.money)}</span>`, choices });
    if (i === -1) break;
    const r = await doAction(acts[i], S);
    if (r === 'leave') return;
  }
  save();
}

async function doAction(a, S) {
  if (a.run) return a.run(S);
  if (a.cost) { pay(S, a.cost, a.cat || PLACE_CAT[curPlace] || 'other', a.label.replace(/^\S+\s/, '')); sfx('coin'); }
  if (a.minutes) advance(S, a.minutes);
  if (a.after) a.after(S);
  const out = applyFx(S, val(a.fx, S));
  if (a.cost) out.unshift(['money', -a.cost]);
  const res = val(a.res, S);
  if (res || out.length > 1 || (!a.cost && out.length)) await modal({ text: res || '', html: chips(out) });
  else toast(`${a.label} ✔`);
  return null;
}

// ---------- lớp học: trắc nghiệm ----------
function progressHtml(r) {
  const p = r.p;
  const pct = Math.min(100, Math.round((p.xp / p.need) * 100));
  return `<div class="payslip"><div class="prow"><span>Trình độ hiện tại</span><span><b>${p.cur}</b></span></div>` +
    (p.done ? '' : `<div class="prow"><span>Tiến độ lên ${p.target}</span><span>${pct}% · chính xác ${Math.round(p.acc * 100)}%</span></div>
    <div class="pbar"><i style="width:${pct}%"></i></div><div class="dim">Cần đủ điểm và độ chính xác ≥ 70% trên các câu gần nhất của cấp ${p.target}.</div>`) + '</div>';
}
// Lớp có giáo viên: điểm ×1.3
async function quiz(S) {
  S.today.class = true;
  const r = await studyJapanese(S, 5, { title: 'Lớp tối · Câu', mult: 1.3 });
  advance(S, 90);
  const out = applyFx(S, { energy: -8, mood: r.ok >= 4 ? 3 : 0 });
  await modal({ title: `Kết quả: ${r.ok}/5 câu đúng`, text: r.ok >= 4 ? 'Cô Mori khen: 「すごい！」' : 'Cô Mori động viên: 「頑張って！」 (Cố lên!)', html: progressHtml(r) + chips(out) });
}
async function selfStudy(S) {
  const r = await studyJapanese(S, 3, { title: 'Tự học · Câu' });
  advance(S, 60);
  const out = applyFx(S, { energy: -8, mood: -1 });
  await modal({ title: `Tự học: ${r.ok}/3 câu đúng`, html: progressHtml(r) + chips(out) });
}

// ---------- đền: rút quẻ ----------
async function omikuji(S) {
  S.today.omikuji = true;
  pay(S, 100, 'other', 'Omikuji');
  advance(S, 10);
  const r = Math.random();
  let title, text, fx;
  if (r < 0.15) { title = '大吉 — Đại cát!'; text = 'Quẻ tốt nhất! Mọi việc hanh thông.'; fx = { mood: 10 }; }
  else if (r < 0.55) { title = '吉 — Cát'; text = 'Quẻ tốt. Cứ chăm chỉ là sẽ có kết quả.'; fx = { mood: 5 }; }
  else if (r < 0.85) { title = '小吉 — Tiểu cát'; text = 'Có chút may mắn nhỏ. Chú ý sức khỏe.'; fx = { mood: 2 }; }
  else { title = '凶 — Hung'; text = 'Quẻ xấu… Người Nhật buộc quẻ xấu lên giá ở đền để "gửi lại" vận xui. Bạn cũng làm vậy và thấy nhẹ nhõm.'; fx = { mood: -1 }; }
  const out = applyFx(S, fx);
  out.unshift(['money', -100]);
  await modal({ who: 'おみくじ', title, text, html: chips(out) });
}

// ---------- chuyển tiền ----------
async function remit(S, illegal) {
  const fee = illegal ? 0 : atLeast(S, 'long', 2) ? 500 : 990;
  const rate = illegal ? 176 : RATE;
  const all = Math.floor((S.money - 5000 - fee) / 1000) * 1000;
  const amounts = [10000, 30000, 50000];
  const choices = amounts.map((v) => ({ label: `${yen(v)} → ${vnd(v * rate)}`, value: v, disabled: S.money < v + fee, reason: 'Không đủ tiền' }));
  if (all > 0 && !amounts.includes(all)) choices.push({ label: `Tất cả, chừa lại 5.000¥: ${yen(all)} → ${vnd(all * rate)}`, value: all });
  choices.push({ label: 'Thôi', value: 0, cancel: true });
  const v = await modal({ who: illegal ? 'Kênh không phép' : 'Công ty chuyển tiền có giấy phép', title: '💸 Gửi bao nhiêu?', text: illegal ? 'Tỷ giá cao hơn, không mất phí… nhưng không có gì đảm bảo.' : `Phí ${yen(fee)} mỗi lần gửi. Tiền về tài khoản gia đình trong ngày.`, choices });
  if (!v) return;
  pay(S, v + fee, 'remit', illegal ? 'Chuyển tiền qua kênh không phép' : `Chuyển tiền về nhà (phí ${fee}¥)`);
  advance(S, 20);
  if (illegal && Math.random() < 0.22) {
    const out = applyFx(S, { mood: -18 });
    out.unshift(['money', -v]);
    addLog(S, `Mất ${yen(v)} khi chuyển tiền chui`);
    sfx('bad');
    await modal({ title: '😱 Mất tiền!', text: `Người kia nhận ${yen(v)} rồi chặn liên lạc. Gia đình không nhận được đồng nào. Chuyển tiền qua kênh không phép có thể mất trắng mà không ai bảo vệ bạn.`, html: chips(out) });
    S.flags.chuiAd = false;
    return;
  }
  const money = v * rate;
  const before = S.debt;
  S.debt -= money;
  S.stats.sentVnd += money;
  fam(S).lastRemit = S.day;
  famGain(S, Math.min(15, Math.round(v / 4000)));
  const out = applyFx(S, { mood: 5 });
  out.unshift(['money', -(v + fee)]);
  addLog(S, `Gửi về ${vnd(money)}`);
  sfx('coin');
  let text = `Đã gửi <b>${vnd(money)}</b> về nhà. Nợ còn: <b>${vnd(Math.max(0, S.debt))}</b>.`;
  if (before > 0 && S.debt <= 0) {
    applyFx(S, { mood: 20 });
    text += '<br>🎉 <b>ĐÃ TRẢ HẾT NỢ!</b> Cả nhà mừng rỡ. Từ giờ tiền gửi về là tiền tiết kiệm của gia đình.';
  }
  await modal({ title: '✅ Chuyển tiền thành công', text, html: chips(out) });
}

// ---------- NPC ----------
export async function talk(id) {
  const S = G.S;
  if (id === 'cat') {
    if (S.today.cat) { toast('🐈 Mèo đang ngủ say…'); return; }
    S.today.cat = true;
    const out = applyFx(S, { mood: 3 });
    await modal({ who: 'Mèo mướp', title: '🐈 ニャー', text: 'Chú mèo dụi đầu vào tay bạn rồi lăn ra đất phơi bụng.', html: chips(out) });
    return;
  }
  // Người đứng ngoài đường: menu nhỏ (nói chuyện / tặng quà / rủ đi ăn)
  const acts = personActions(S, id);
  if (!P(S, id).met) { await talkTo(S, id); return; }
  const i = await modal({
    who: PEOPLE[id].role, title: PEOPLE[id].name,
    choices: [...acts.map((a, k) => { const r = reasonOf(a, S); return { label: a.label, sub: a.sub, value: k, disabled: !!r, reason: r }; }), { label: 'Tạm biệt', value: -1, cancel: true }],
  });
  if (i >= 0) await acts[i].run(S);
}

// Trung tâm giao lưu: học có tình nguyện viên, có bạn thân thì nhanh hơn
async function langExchange(S) {
  S.today.exchange = true;
  const mult = (atLeast(S, 'yui', 2) || atLeast(S, 'kenta', 2)) ? 1.8 : (atLeast(S, 'yui', 1) || atLeast(S, 'kenta', 1)) ? 1.5 : 1.3;
  const r = await studyJapanese(S, 3, { title: 'Giao lưu · Câu', mult });
  advance(S, 60);
  const out = applyFx(S, { energy: -8, mood: 4 });
  await modal({ title: `Giao lưu: ${r.ok}/3 câu đúng`, text: mult > 1.3 ? `Có bạn quen giúp nên bạn học nhanh hơn (điểm ×${mult}).` : 'Kết bạn với Yui hoặc Kenta để học nhanh hơn.', html: progressHtml(r) + chips(out) });
}

export async function interact(target) {
  const S = G.S;
  if (target.type === 'npc') return talk(target.id);
  if (target.type === 'exit') return exitBuilding();
  if (target.type === 'obj') {
    const o = target.obj;
    if (o.act === 'company') return companyMenu(S, curMap(S).key);
    return openPlace(o.act, o.pick || null);
  }
  if (target.type === 'building') {
    const id = target.id;
    const closed = placeClosed(id, S);
    if (closed) { await modal({ title: val(PLACES[id].name, S), text: `🔒 ${closed}` }); return; }
    if (id === 'work' || INTERIOR_OF[id]) { sfx('door'); return enterBuilding(id); }
    if (PLACES[id]) return openPlace(id);
    return;
  }
  return openPlace(target.id);
}

// Sảnh công ty của NPC (khu công nghiệp, viện dưỡng lão…)
async function companyMenu(S, key) {
  const C = COMPANY[key];
  if (!C) return;
  const staff = npcsAt(S, key).filter((id) => stateOf(S, id).act === 'work');
  await modal({
    who: C.jp, title: C.name, wide: true,
    html: `<div class="payslip"><div class="prow"><span>Ngành</span><span>${C.sector}</span></div><div class="prow"><span>Lương tham khảo</span><span>${C.pay}</span></div><div class="prow"><span>Yêu cầu</span><span>${C.req}</span></div><div class="prow"><span>Visa phù hợp</span><span>${C.visa}</span></div><div class="prow"><span>Đang làm việc</span><span>${staff.length} người</span></div></div><p class="dim">${C.note}</p><p class="dim">📄 Nộp hồ sơ, phỏng vấn, chuyển việc sẽ có ở bản cập nhật nghề nghiệp (v3.3).</p>`,
    ok: 'Đã hiểu',
  });
}
