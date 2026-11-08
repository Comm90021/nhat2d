// Các địa điểm trong thị trấn + nói chuyện với NPC.
import { G, MIDNIGHT, RATE, applyFx, advance, clockStr, yen, vnd, dow, seasonIdx, addLog, save, isNewYear, year, luckP, addBuff } from './state.js';
import { studyJapanese } from './quiz.js';
import { canRegister, register, nextSessionText } from './exam.js';
import { applyPR } from './career.js';
import { JOBS, PHRASES, LONG_TIPS, TEACHER_TALK } from './data.js';
import { modal, chips, toast, esc } from './ui.js';
import { sleep } from './days.js';
import { workActions } from './work.js';
import { sfx } from './audio.js';
import { pay, assetEffect } from './finance.js';
import { talkTo, peopleHere, atLeast, isAt, P, gain, personActions, PEOPLE } from './social.js';
import { enterBuilding, exitBuilding, travelTo, curMap } from './town.js';
import { npcsAt, stateOf } from './ai/sim.js';
import { AI_PLACES } from './ai/world.js';
import { COMPANY } from './content/companies.js';
import { workName, RANKS, schoolActions } from './jobs.js';
import { placeInterior } from './world/scene.js';
import { INTERIOR_OF } from './content/interiors.js';
import { community } from './community.js';
import { fam, famGain, canVisitHome, visitHome } from './family.js';
import { canSpouseVisa } from './romance.js';
import { setVisa } from './career.js';
import { ringBell, mailbox } from './homes.js';

const H = (h, m = 0) => h * 60 + m;
const openHours = (a, b) => (S) => (S.time < H(a) || S.time >= H(b) ? `Mở cửa ${a}:00 – ${b}:00.` : null);
const PLACE_CAT = { cafe: 'food', izakaya: 'social', karaoke: 'social', cinema: 'social', gamecenter: 'social', mall: 'shop', gym: 'health', library: 'study', sento: 'health', konbini: 'food', super: 'food', clinic: 'health', class: 'study', remit: 'remit', center: 'social', park: 'social', shrine: 'other', dorm: 'food', river: 'other', work: 'other' };
let curPlace = '';
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const buy = (label, cost, fx, res, sub) => ({ label, cost, minutes: 5, fx, res, sub });

const PLACES = {
  dorm: {
    name: 'Ký túc xá', jp: '寮',
    desc: (S) => `Phòng 4 người, chiếu tatami cũ, góc bếp nhỏ. Bây giờ là ${clockStr(S.time)}.`,
    actions: (S) => [
      {
        label: '😴 Đi ngủ', sub: S.home ? 'Bạn đã chuyển ra ở riêng' : 'Ngủ đến 06:30 sáng mai · lưu game',
        cond: (s) => (s.home ? 'Bạn đã chuyển ra ở riêng — giường cũ đã có người khác. Về nhà mình mà ngủ.' : null),
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
      { label: '🍳 Nấu ăn', sub: `Còn ${S.inv.ingredients} phần nguyên liệu`, minutes: 40, fx: { full: 45, mood: 4, health: 1, cook: 1.5 }, cond: (s) => (s.inv.ingredients > 0 ? null : 'Hết nguyên liệu — mua ở siêu thị'), after: (s) => { s.inv.ingredients--; }, res: '「いただきます！」 Cơm nhà tự nấu vừa rẻ vừa ngon.' },
      {
        label: '📱 Gọi video về nhà', minutes: 30, fx: { mood: 10 }, cond: (s) => (s.today.call ? 'Hôm nay đã gọi rồi' : null),
        after: (s) => { s.today.call = true; fam(s).lastCall = s.day; famGain(s, 3); if (s.time >= H(22) && Math.random() < 0.5) s.flags.lateCall = true; },
        res: (s) => (s.time >= H(22) ? 'Nói chuyện vui quá, quên mất đã khuya. Tường ký túc xá mỏng lắm…' : 'Mẹ hỏi ăn uống thế nào, bố dặn giữ sức khỏe. Bạn thấy nhẹ lòng hơn.'),
      },
      { label: '📖 Tự học tiếng Nhật', sub: '3 câu hỏi · 60 phút', minutes: 60, energy: 10, run: selfStudy },
      ...(atLeast(S, 'ha', 2) && isAt(S, 'ha', 'dorm') ? [{ label: '🍲 Nấu ăn chung với Hà', sub: 'Không cần nguyên liệu', minutes: 60, fx: { full: 45, mood: 6, health: 1, cook: 1 }, cond: (s) => (s.today.cookHa ? 'Hôm nay đã nấu rồi' : null), after: (s) => { s.today.cookHa = true; gain(s, 'ha', 2); }, res: 'Hà nấu canh chua, bạn rán cá. Bữa cơm có mùi quê nhà.' }] : []),
      ...(canVisitHome(S) ? [{ label: '✈️ Xin nghỉ phép về thăm nhà', sub: 'Dịp Tết / hè · 4 ngày', run: async (s) => { if (await visitHome(s)) return 'leave'; } }] : []),
      ...(canSpouseVisa(S) || ['ssw2', 'spouse'].includes(S.career.visa) ? [{ label: '📄 Thủ tục visa / thường trú', sub: 'Làm ở 🛂 Văn phòng Xuất nhập cảnh (phố Kawabata)', cond: () => 'Làm ở Văn phòng Xuất nhập cảnh, phố Kawabata (ngày thường 9:00–16:00)', run: () => null }] : []),
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
        { label: '🥬 Nguyên liệu nấu 1 bữa', cost: Math.round(320 * (1 - assetEffect(S, 'cook'))), minutes: 10, after: (s) => { s.inv.ingredients += 1; }, res: 'Đã mua rau, trứng, thịt gà. Về ký túc xá nấu nhé.' },
        { label: '🛒 Nguyên liệu 3 bữa', sub: assetEffect(S, 'cook') ? 'Có nồi cơm + tủ lạnh: nấu nhiều, đỡ phí' : 'Tiết kiệm hơn', cost: Math.round(900 * (1 - assetEffect(S, 'cook'))), minutes: 15, after: (s) => { s.inv.ingredients += 3; }, res: 'Túi đồ đầy ắp. Về ký túc xá nấu dần.' },
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
    desc: (S) => `Tỷ giá tháng này: 1¥ = ${S.fin.fx}₫ (thay đổi mỗi tháng). Nợ còn: <b>${vnd(Math.max(0, S.debt))}</b>. Cũng có thể chuyển qua app ngân hàng trên điện thoại.`,
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
        { label: '🧧 Mua bùa omamori (お守り)', sub: '¥800 · 🍀 may mắn +8 trong 1 tháng', cost: 800, minutes: 10, cond: (s) => (s.buffs && s.buffs.omamori && s.buffs.omamori.until >= s.day ? 'Bùa cũ vẫn còn hiệu lực' : null), after: (s) => addBuff(s, 'omamori', { luck: 8, until: s.day + 7 }), res: 'Bùa 開運 (khai vận) đỏ thắm. Người Nhật thường thay bùa mới mỗi năm và trả bùa cũ về đền.' },
        { label: '🙏 Cầu nguyện', sub: 'Thả đồng 5¥', cost: 5, minutes: 10, fx: { mood: 3 }, cond: (s) => (s.today.pray ? 'Hôm nay đã cầu rồi' : null), after: (s) => { s.today.pray = true; }, res: 'Đồng 5 yên (五円, go-en) đồng âm với ご縁 — "duyên lành". Người Nhật hay thả đồng 5 yên khi cầu nguyện.' },
      ];
      if (isNewYear(S)) a.unshift({ label: '⛩️ Đi lễ đầu năm (初詣)', minutes: 60, cost: 500, fx: { mood: 14, health: 2 }, after: (s) => { s.flags.hatsu = year(s); applyFx(s, { luck: 5 }); }, res: 'Bạn xếp hàng cùng mọi người, cầu cho gia đình bình an và năm mới may mắn. 「あけましておめでとうございます！」' });
      return a;
    },
  },
  work: {
    name: (S) => workName(S), jp: (S) => JOBS[S.job].jp,
    desc: (S) => `${S.emp ? esc(S.emp.title) + ' · ' + RANKS[S.emp.rank] + '. ' : ''}${JOBS[S.job].desc}<br>Lương chờ lĩnh: <b>${yen(S.wage)}</b> (trả vào Chủ Nhật cuối tháng).`,
    actions: workActions,
  },
  park: {
    name: 'Công viên Hikari', jp: '公園',
    desc: (S) => ['Hoa anh đào nở rộ, cánh hoa bay lả tả.', 'Ve kêu râm ran, trẻ con chơi nước ở đài phun.', 'Lá phong đỏ rực cả một góc trời.', 'Tuyết phủ trắng ghế đá, hồ nước đóng băng mỏng.'][seasonIdx(S)],
    actions: (S) => {
      const si = seasonIdx(S);
      const a = [
        { label: '🪑 Ngồi nghỉ ngắm cảnh', minutes: 60, fx: { mood: 7, energy: 4 }, res: 'Bạn ngồi thả lỏng, ngắm người qua lại.' },
        { label: '🏃 Chạy bộ', minutes: 30, energy: 15, fx: { energy: -12, health: 3, mood: 3, fit: 1.5, stress: -4 }, res: 'Chạy vài vòng quanh hồ, người khỏe khoắn hẳn.' },
      ];
      if (npcsAt(S, 'park').some((id) => stateOf(S, id).act === 'sport')) a.unshift({ label: '⚽ Đá bóng với CLB', sub: 'Sáng Chủ Nhật · ai đến cũng được', minutes: 120, energy: 20, fx: (s) => ({ energy: -15, health: atLeast(s, 'daiki', 2) ? 7 : 4, mood: 7, full: -10, fit: 2, soc: 1, stress: -6 }), cond: (s) => (s.today.football ? 'Hôm nay đá rồi' : null), after: (s) => { s.today.football = true; gain(s, 'daiki', 3); }, res: 'Hai tiếng chạy hết sân, cả đội hò hét 「ナイス！」. Mệt mà vui.' });
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
      { label: '📄 Hỏi về việc điều dưỡng', minutes: 10, res: 'Ngành điều dưỡng (介護) cần người. Muốn làm theo visa Kỹ năng đặc định phải thi kỹ năng điều dưỡng + tiếng Nhật điều dưỡng, cộng với JLPT N4 trở lên. (Ứng tuyển trong 📱 → Việc làm; thi chứng chỉ điều dưỡng cũng ở đó.)' },
    ],
  },
  // ======================= PHỐ KAWABATA =======================
  cafe: {
    name: 'Cà phê Komorebi', jp: 'カフェ', closed: openHours(8, 21),
    desc: () => 'Quán cà phê nhỏ, nhạc jazz nhẹ, mùi cà phê rang. Nhiều sinh viên ngồi học, vài cặp đôi hẹn hò.',
    actions: () => [
      { label: '☕ Gọi một ly cà phê', cost: 450, minutes: 20, fx: { energy: 10, mood: 4, stress: -3 }, res: '「ホットコーヒー、お願いします」 Thơm, đắng nhẹ, tỉnh cả người.' },
      { label: '🍰 Cà phê + bánh ngọt', cost: 900, minutes: 30, fx: { energy: 8, full: 15, mood: 6, stress: -4 }, res: 'Bánh phô mai mềm tan. Thỉnh thoảng tự thưởng cho mình cũng được.' },
      { label: '📝 Ngồi học ở quán', sub: '¥450 · 2 câu · có không khí học', cost: 450, minutes: 60, energy: 6, run: async (s) => { pay(s, 450, 'food', 'Cà phê'); const r = await studyJapanese(s, 2, { title: 'Học ở quán · Câu', mult: 1.15 }); advance(s, 50); const out = applyFx(s, { int: 1, stress: -2 }); await modal({ title: `Học ở quán: ${r.ok}/2 câu đúng`, html: progressHtml(r) + chips(out) }); } },
    ],
  },
  karaoke: {
    name: 'Karaoke Utaya', jp: 'カラオケ', closed: openHours(12, 24),
    desc: () => 'Phòng hát cách âm, đồ uống không giới hạn (ドリンクバー). Hát một mình (ひとカラ) ở Nhật là chuyện bình thường.',
    actions: () => [
      { label: '🎤 Hát một mình 1 tiếng (ひとカラ)', cost: 1200, minutes: 60, energy: 8, fx: { stress: -12, mood: 8, soc: 1, energy: -5 }, res: 'Bạn hát hết bài Việt rồi thử cả bài Nhật. Giọng chưa hay nhưng xả stress cực đã!' },
      { label: '🎶 Luyện hát bài tiếng Nhật', cost: 1200, minutes: 60, energy: 8, fx: { stress: -8, mood: 5, jp: 1.5, soc: 1 }, res: 'Lời bài hát chạy trên màn hình có furigana — học từ vựng kiểu này nhớ lâu ghê.' },
    ],
  },
  cinema: {
    name: 'Rạp phim Hikari Cinema', jp: '映画館', closed: openHours(10, 23),
    desc: () => 'Rạp nhỏ 3 phòng chiếu. Phim nước ngoài có phụ đề tiếng Nhật (字幕), phim hoạt hình thì lồng tiếng.',
    actions: () => [
      { label: '🎬 Xem một suất phim', sub: '¥1,900 · 2 tiếng · luyện nghe đọc phụ đề', cost: 1900, minutes: 120, fx: { mood: 10, stress: -12, jp: 1.5 }, res: () => ['Phim hoạt hình về cô bé đưa thư bay trên chổi — cả rạp cười rồi khóc.', 'Phim hành động bom tấn, phụ đề chạy nhanh quá đọc không kịp.', 'Phim tình cảm Nhật, đoạn cuối cả rạp sụt sịt.', 'Phim kinh dị Nhật — bạn nhắm mắt nửa phim.'][Math.floor(Math.random() * 4)] },
      { label: '📋 Xem lịch chiếu', minutes: 5, res: 'Hôm nay: 「空の郵便屋さん」 (hoạt hình) · 「東京ラストダンス」 (tình cảm) · 「呪いの家」 (kinh dị) · bom tấn Mỹ (字幕). Thứ Tư là ngày giảm giá (レディースデー / サービスデー).' },
    ],
  },
  gamecenter: {
    name: 'Game center Arcadia', jp: 'ゲームセンター', closed: openHours(10, 23),
    desc: () => 'Tiếng nhạc điện tử ầm ĩ, máy gắp thú xếp hàng, học sinh chơi game đánh trống.',
    actions: () => [
      { label: '🕹️ Chơi game 30 phút', cost: 500, minutes: 30, fx: { mood: 6, stress: -6 }, res: 'Đánh trống Taiko được hạng "Đạt" — đông người vỗ tay luôn.' },
      { label: '🧸 Thử gắp thú', cost: 300, minutes: 10, run: async (s) => { pay(s, 300, 'social', 'Gắp thú'); advance(s, 10); const win = Math.random() < 0.15; if (win) { s.inv.plush = (s.inv.plush || 0) + 1; } const out = applyFx(s, { mood: win ? 8 : -1 }); await modal({ title: win ? '🧸 Gắp được rồi!' : '😩 Trượt…', text: win ? 'Một con gấu bông nhỏ — có thể đem tặng ai đó.' : 'Móc gắp lỏng lẻo như mọi khi. Máy gắp thú là "máy hút tiền" đấy.', html: chips([['money', -300], ...out]) }); } },
    ],
  },
  mall: {
    name: 'Trung tâm mua sắm Aeon-ya', jp: 'ショッピングセンター', closed: openHours(10, 21),
    desc: () => 'Ba tầng: quần áo, mỹ phẩm, tiệm tóc, đồ gia dụng. Cuối tuần rất đông gia đình.',
    actions: (S) => [
      { label: '👕 Mua bộ quần áo mới', sub: 'Ngoại hình +, tinh thần +', cost: 6000, minutes: 60, fx: { look: 6, mood: 5 }, cat: 'shop', res: 'Áo khoác mới, quần gọn gàng. Nhìn gương thấy khác hẳn.' },
      { label: '💇 Cắt tóc', sub: 'Mỗi tháng 1 lần là đủ', cost: 3500, minutes: 60, fx: { look: 5, mood: 3 }, cat: 'shop', cond: (s) => (s.lastHaircut && s.day - s.lastHaircut < 7 ? 'Mới cắt tóc gần đây' : null), after: (s) => { s.lastHaircut = s.day; }, res: 'Thợ cắt hỏi 「今日はどうしますか？」. Bạn chỉ ảnh trên điện thoại — ra đúng kiểu luôn.' },
      { label: '🧴 Mỹ phẩm, chăm sóc da', cost: 2000, minutes: 20, fx: { look: 2.5 }, cat: 'shop', res: 'Sữa rửa mặt, kem dưỡng, lăn khử mùi. Người Nhật rất chú trọng vệ sinh cá nhân.' },
    ],
  },
  gym: {
    name: 'Phòng gym Power', jp: 'ジム', closed: openHours(6, 23),
    desc: (S) => `Mở 6:00–23:00. Vé lẻ ¥800/lượt, thẻ tháng ¥6,000.${S.gymUntil >= S.day ? ' <b>Bạn đang có thẻ tháng.</b>' : ''}`,
    actions: (S) => {
      const fee = S.gymUntil >= S.day ? 0 : 800;
      const lim = (s) => ((s.today.gym || 0) >= 2 ? 'Hôm nay tập đủ rồi, nghỉ cho cơ phục hồi' : null);
      const done = (s) => { s.today.gym = (s.today.gym || 0) + 1; };
      return [
        { label: '🎫 Làm thẻ tháng', sub: '¥6,000 · tập không giới hạn trong 1 tháng (7 ngày)', cost: 6000, cat: 'health', cond: (s) => (s.gymUntil >= s.day ? 'Thẻ còn hạn' : null), after: (s) => { s.gymUntil = s.day + 6; }, res: 'Nhân viên đưa bạn thẻ thành viên: 「頑張ってください！」' },
        { label: '🏋️ Tập tạ', sub: fee ? '¥800/lượt' : 'Có thẻ tháng', cost: fee, cat: 'health', minutes: 60, energy: 25, cond: lim, after: done, fx: { fit: 3, energy: -22, stress: -5, mood: 3, full: -10 }, res: 'Đẩy ngực, kéo xà, squat. Mai chắc đau cơ nhưng sướng.' },
        { label: '🏃 Chạy máy 45 phút', sub: fee ? '¥800/lượt' : 'Có thẻ tháng', cost: fee, cat: 'health', minutes: 45, energy: 18, cond: lim, after: done, fx: { fit: 2.2, stress: -7, health: 1, energy: -16 }, res: 'Mồ hôi đầm đìa, đầu óc trống rỗng dễ chịu.' },
        { label: '🧘 Lớp yoga', sub: fee ? '¥800/lượt' : 'Có thẻ tháng', cost: fee, cat: 'health', minutes: 45, cond: lim, after: done, fx: { stress: -10, fit: 1, mood: 4 }, res: 'Hít vào… thở ra… Cô giáo nói chậm nên bạn nghe hiểu được kha khá.' },
      ];
    },
  },
  library: {
    name: 'Thư viện thành phố', jp: '図書館', closed: (S) => (dow(S) === 0 ? 'Thứ Hai thư viện nghỉ.' : openHours(9, 20)(S)),
    desc: () => 'Miễn phí. Có góc sách tiếng Nhật dễ đọc (やさしい日本語), sách dạy nấu ăn, chỗ ngồi học yên tĩnh.',
    actions: () => [
      { label: '📖 Đọc sách', sub: 'Trí tuệ +', minutes: 60, energy: 5, cond: (s) => ((s.today.read || 0) >= 2 ? 'Đọc nhiều quá nhức mắt rồi' : null), after: (s) => { s.today.read = (s.today.read || 0) + 1; }, fx: { int: 2.5, stress: -3, mood: 2 }, res: () => ['Cuốn sách kinh tế cho người mới — hiểu thêm về tiền lương, thuế.', 'Truyện ngắn bằng やさしい日本語, đọc được gần hết không cần từ điển.', 'Sách lịch sử Nhật có tranh minh họa — thú vị hơn tưởng.'][Math.floor(Math.random() * 3)] },
      { label: '📚 Học tiếng Nhật yên tĩnh', sub: '3 câu · ×1.25 · 60 phút', minutes: 60, energy: 10, run: async (s) => { const r = await studyJapanese(s, 3, { title: 'Thư viện · Câu', mult: 1.25 }); advance(s, 60); const out = applyFx(s, { int: 1, energy: -6 }); await modal({ title: `Thư viện: ${r.ok}/3 câu đúng`, html: progressHtml(r) + chips(out) }); } },
      { label: '🍳 Đọc sách dạy nấu ăn', sub: 'Nấu ăn +', minutes: 30, cond: (s) => (s.today.cookbook ? 'Hôm nay đọc rồi' : null), after: (s) => { s.today.cookbook = true; }, fx: { cook: 2 }, res: 'Học được cách làm 肉じゃが và cơm cà ri Nhật — rẻ mà ngon.' },
    ],
  },
  sento: {
    name: 'Nhà tắm Matsu-no-yu', jp: '銭湯', closed: openHours(15, 24),
    desc: () => 'Nhà tắm công cộng kiểu cũ, ¥520. Tắm rửa sạch sẽ ở vòi trước rồi mới ngâm bồn; khăn không cho vào bồn. Nam nữ tắm riêng.',
    actions: () => [
      { label: '♨️ Tắm nước nóng', cost: 520, minutes: 60, fx: { stress: -15, health: 3, energy: 12, mood: 5 }, cat: 'health', cond: (s) => (s.today.sento ? 'Hôm nay tắm rồi' : null), after: (s) => { s.today.sento = true; }, res: 'Nước 42 độ, ngâm đến đỏ cả người. Bao mệt mỏi tan hết.' },
      { label: '🥛 Uống sữa chai sau khi tắm', cost: 150, minutes: 5, fx: { mood: 2, full: 5 }, cat: 'food', res: 'Tay chống hông, ngửa cổ uống một hơi — đúng kiểu người Nhật sau khi tắm sentō.' },
    ],
  },
  izakaya: {
    name: 'Izakaya Torikizoku-ya', jp: '居酒屋', closed: openHours(17, 24),
    desc: () => 'Quán nhậu kiểu Nhật: gà nướng xiên, bia tươi, ồn ào vui vẻ. Đồng nghiệp hay rủ nhau đến sau giờ làm.',
    actions: () => [
      { label: '🍺 Nhậu một mình', cost: 2500, minutes: 90, fx: { mood: 6, stress: -8, health: -2, full: 35 }, cat: 'social', res: '「とりあえずビール！」 Gà nướng xiên với bia lạnh — ngày dài cũng qua.' },
      { label: '🍢 Ăn tối (không uống rượu)', cost: 1500, minutes: 60, fx: { full: 45, mood: 4 }, cat: 'food', res: 'Cơm gà, súp miso, đậu nành luộc. No căng.' },
    ],
  },
  jpark: {
    name: 'Công viên Hikari-dai', jp: '公園',
    desc: () => 'Công viên nhỏ giữa khu manshon: hồ nước, ghế đá, các cụ tập thể dục buổi sáng, trẻ con chơi buổi chiều.',
    actions: () => [{ label: '🚶 Đi dạo một vòng', minutes: 30, energy: 3, fx: () => ({ mood: 5, energy: -3 }), res: 'Gió mát, tiếng trẻ con cười. Đầu óc nhẹ hẳn.' }],
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

// Module khác (housing.js, gov.js) đăng ký thêm địa điểm / xử lý tòa nhà đặc biệt (lô đất nhà riêng)
export function addPlaces(o) { Object.assign(PLACES, o); }
export const buildingHooks = { lot: null };
export { reasonOf, doAction };

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
  const r = 1 - luckP(S, 1 - Math.random(), true);
  let title, text, fx;
  if (r < 0.15) { title = '大吉 — Đại cát!'; text = 'Quẻ tốt nhất! Mọi việc hanh thông. 🍀 May mắn +5 hôm nay.'; fx = { mood: 10 }; addBuff(S, 'kuji', { luck: 5, until: S.day }); }
  else if (r < 0.55) { title = '吉 — Cát'; text = 'Quẻ tốt. Cứ chăm chỉ là sẽ có kết quả.'; fx = { mood: 5 }; }
  else if (r < 0.85) { title = '小吉 — Tiểu cát'; text = 'Có chút may mắn nhỏ. Chú ý sức khỏe.'; fx = { mood: 2 }; }
  else { title = '凶 — Hung'; text = 'Quẻ xấu… Người Nhật buộc quẻ xấu lên giá ở đền để "gửi lại" vận xui. Bạn cũng làm vậy và thấy nhẹ nhõm.'; fx = { mood: -1 }; addBuff(S, 'kuji', { luck: -3, until: S.day }); }
  const out = applyFx(S, fx);
  out.unshift(['money', -100]);
  await modal({ who: 'おみくじ', title, text, html: chips(out) });
}

// ---------- chuyển tiền ----------
async function remit(S, illegal) {
  const fee = illegal ? 0 : atLeast(S, 'long', 2) ? 500 : 990;
  const rate = illegal ? S.fin.fx + 6 : S.fin.fx;
  const all = Math.floor((S.money - 5000 - fee) / 1000) * 1000;
  const amounts = [10000, 30000, 50000];
  const choices = amounts.map((v) => ({ label: `${yen(v)} → ${vnd(v * rate)}`, value: v, disabled: S.money < v + fee, reason: 'Không đủ tiền' }));
  if (all > 0 && !amounts.includes(all)) choices.push({ label: `Tất cả, chừa lại 5.000¥: ${yen(all)} → ${vnd(all * rate)}`, value: all });
  choices.push({ label: 'Thôi', value: 0, cancel: true });
  const v = await modal({ who: illegal ? 'Kênh không phép' : 'Công ty chuyển tiền có giấy phép', title: '💸 Gửi bao nhiêu?', text: illegal ? 'Tỷ giá cao hơn, không mất phí… nhưng không có gì đảm bảo.' : `Phí ${yen(fee)} mỗi lần gửi. Tiền về tài khoản gia đình trong ngày.`, choices });
  if (!v) return;
  pay(S, v + fee, 'remit', illegal ? 'Chuyển tiền qua kênh không phép' : `Chuyển tiền về nhà (phí ${fee}¥)`);
  advance(S, 20);
  if (illegal) { applyFx(S, { luck: -3 }); S.fin.shady = (S.fin.shady || 0) + 1; S.fin.credit = Math.max(300, (S.fin.credit || 600) - 8); }
  if (illegal && Math.random() < luckP(S, 0.22, false)) {
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
    const workHere = S.emp && S.emp.co && placeInterior(S, S.emp.co) === curMap(S).key;
    if (o.act === 'company') return companyMenu(S, curMap(S).key);
    if (o.act === 'unit') return ringBell(S, o.unit);
    if (o.act === 'mailbox') return mailbox(S, curMap(S).bid);
    if (o.act === 'work' && !workHere) { await modal({ title: o.name, text: 'Bạn không còn làm ở đây.' }); return; }
    if (!o.act) return openPlace('work', ['Vào ca', 'Làm thêm', 'Thi tay nghề', 'Đã xong', 'được nghỉ', 'Chủ Nhật', 'Thay', 'Rửa tay', 'bảng', 'thất nghiệp']);
    return openPlace(o.act, o.pick || null);
  }
  if (target.type === 'building') {
    const id = target.id;
    if (/^lot\d+$/.test(id) && buildingHooks.lot) return buildingHooks.lot(S, id);
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
  const extra = [...(key === 'it' ? schoolActions(S) : []), ...(S.emp && S.emp.co === key ? workActions(S).filter((a) => /Chuyển|Thi tay/.test(a.label)) : [])];
  if (extra.length || (S.emp && S.emp.co === key)) {
    const i = await modal({ who: C.jp, title: C.name, text: S.emp && S.emp.co === key ? `Bạn đang làm ở đây: <b>${esc(S.emp.title)}</b> · ${RANKS[S.emp.rank]}. Vào ca ở vị trí làm việc trong xưởng / văn phòng.` : esc(C.note), choices: [...extra.map((a, k) => { const r = reasonOf(a, S); return { label: a.label, sub: a.sub, value: k, disabled: !!r, reason: r }; }), { label: '📄 Thông tin tuyển dụng', value: -2 }, { label: '✖ Thôi', value: -1, cancel: true }] });
    if (i >= 0) { await extra[i].run(S); return; }
    if (i === -1) return;
  }
  await modal({
    who: C.jp, title: C.name, wide: true,
    html: `<div class="payslip"><div class="prow"><span>Ngành</span><span>${C.sector}</span></div><div class="prow"><span>Lương tham khảo</span><span>${C.pay}</span></div><div class="prow"><span>Yêu cầu</span><span>${C.req}</span></div><div class="prow"><span>Visa phù hợp</span><span>${C.visa}</span></div><div class="prow"><span>Đang làm việc</span><span>${staff.length} người</span></div></div><p class="dim">${C.note}</p><p class="dim">📄 Ứng tuyển, phỏng vấn: mở 📱 → Việc làm.</p>`,
    ok: 'Đã hiểu',
  });
}
