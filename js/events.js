// Sự kiện: cố định theo ngày + ngẫu nhiên (buổi sáng / sau ca làm).
import { G, applyFx, advance, addLog, isWorkday, dow, seasonIdx, yen, doy, year } from './state.js';
import { modal, chips } from './ui.js';

// Lựa chọn: { label, sub, need (yên), cond(S)->lý do|null, fx (obj|fn), res (str|fn), minutes, setTime,
//             today:{}, flag, unflag, sick, run(S), chance:{p, fx, res} }
export const EVENTS = [
  // ===================== cố định =====================
  {
    id: 'hanami', day: 4, when: 'after', who: 'Tổ trưởng Yamada', title: '🌸 Ngắm hoa đêm cùng công ty', jp: '夜桜を見に行きましょう！',
    text: 'Tối nay sau giờ làm, công ty tổ chức ngắm hoa anh đào đêm (夜桜) ở công viên. Mọi người trải bạt dưới gốc cây, mỗi người góp 1.000¥ tiền đồ ăn.',
    choices: [
      { label: 'Tham gia!', sub: '−1.000¥ · khoảng 3 tiếng', need: 1000, minutes: 180, fx: { money: -1000, mood: 15, rep: 4, jp: 1, full: 35 },
        res: 'Trưởng xưởng hát karaoke lạc tông, chị Yamada dạy bạn hô 「乾杯！」(cạn ly). Lần đầu tiên bạn thấy đồng nghiệp cười nhiều đến thế.' },
      { label: 'Xin phép về nghỉ', fx: { energy: 8, rep: -1 }, res: 'Bạn về ký túc xá nghỉ. Hôm sau nghe mọi người kể lại, thấy hơi tiếc.' },
    ],
  },
  {
    id: 'garbage', day: 9, when: 'morning', who: 'Trước cửa ký túc xá', title: '🗑️ Túi rác bị trả lại', jp: '分別してください',
    text: 'Túi rác bạn bỏ hôm qua bị dán giấy vàng và để lại trước cửa: 「分別してください」— "Hãy phân loại rác".',
    choices: [
      { label: 'Sang hỏi bà Sato cách phân loại', minutes: 30, fx: { jp: 2, mood: 2, rel: { sato: 2 } },
        res: 'Bà Sato chỉ bảng lịch đổ rác của khu: rác cháy được (đồ ăn thừa, giấy bẩn) đổ thứ Hai & thứ Năm; chai nhựa, lon đổ thứ Tư; rác không cháy được đổ thứ Sáu đầu tháng. Mỗi khu một lịch riêng — nhớ xem bảng ở trạm rác!' },
      { label: 'Để tối mang đi vứt chỗ khác', fx: { rep: -4, mood: -3, rel: { sato: -3 } },
        res: 'Có người nhìn thấy và báo ban quản lý. Nghiệp đoàn gọi điện nhắc nhở công ty của bạn…' },
    ],
  },
  {
    id: 'tsuyu', day: 12, when: 'morning', who: 'Dự báo thời tiết', title: '☔ Bắt đầu mùa mưa', jp: '梅雨入り',
    text: 'Mùa Hạ đến cùng mùa mưa tsuyu: ẩm ướt, quần áo phơi mãi không khô. Sau đó sẽ là những ngày nắng nóng hầm hập.',
    choices: [{ label: 'Nhớ uống đủ nước, tránh say nắng (熱中症)', fx: { jp: 0.5 } }],
  },
  {
    id: 'matsuri', day: 20, when: 'morning', who: 'Tờ rơi trên bảng tin', title: '🏮 Lễ hội mùa hè tối nay', jp: '夏祭り',
    text: 'Tối nay từ 18:00 đến 22:00 có lễ hội ở công viên: quầy takoyaki, kẹo táo, múa bon odori và bắn pháo hoa.',
    choices: [{ label: 'Nhất định phải đi!', today: { matsuri: true }, res: 'Nhớ ra công viên (phía nam thị trấn) sau 18:00 nhé.' }],
  },
  {
    id: 'quake', day: 24, when: 'morning', who: '2 giờ sáng', title: '⚠️ Động đất!', jp: '緊急地震速報',
    text: 'Điện thoại kêu inh ỏi, cả phòng rung lắc mạnh, tủ quần áo kêu lạch cạch.',
    choices: [
      { label: 'Chui xuống gầm bàn, che đầu, đợi hết rung',
        fx: (S) => (S.flags.kit ? { mood: -2, jp: 1 } : { mood: -8, jp: 1 }),
        res: (S) => (S.flags.kit
          ? 'Hết rung, mất điện. Bạn lấy đèn pin và nước trong túi khẩn cấp ra, bình tĩnh nghe đài.'
          : 'Hết rung, mất điện tối om. Bạn không có đèn pin hay nước dự trữ — nên mua túi khẩn cấp ở konbini.') +
          ' Ghi nhớ: 「地震」= động đất, 「避難所」= nơi sơ tán.' },
      { label: 'Lao ngay ra khỏi phòng', fx: { health: -6, mood: -10 },
        res: 'Bạn vấp ngã ở cầu thang. Khi đang rung, chạy ra ngoài rất nguy hiểm vì đồ vật rơi. Hãy cúi thấp – che đầu – bám chặt, hết rung mới sơ tán.' },
    ],
  },
  {
    id: 'autumn', day: 29, when: 'morning', who: 'Lịch', title: '🍁 Mùa Thu', jp: '秋',
    text: 'Trời mát dần, lá bắt đầu chuyển đỏ. Mùa thu cũng là mùa bão — để ý thông báo thời tiết nhé.',
    choices: [{ label: 'OK' }],
  },
  {
    id: 'typhoon', day: 26, when: 'morning', who: 'Thông báo của công ty', title: '🌀 Bão đổ bộ', jp: '台風のため、本日は休業です',
    text: 'Bão lớn đổ bộ. Công ty cho nghỉ làm, yêu cầu mọi người ở trong nhà đến chiều.',
    choices: [
      { label: 'Ở yên trong phòng đến chiều', today: { noWork: true }, setTime: 16 * 60,
        fx: (S) => (S.flags.kit ? { mood: -1, energy: 10 } : { mood: -8, full: -15, energy: 5 }),
        res: (S) => (S.flags.kit ? 'Có đồ dự trữ nên bạn yên tâm đọc sách, ngủ trưa, gọi về nhà.' : 'Không có đồ dự trữ, konbini cũng hết hàng, bạn nhịn đói tới chiều…') },
    ],
  },
  {
    id: 'winter', day: 43, when: 'morning', who: 'Sáng nay', title: '❄️ Tuyết đầu mùa', jp: '初雪',
    text: 'Mở cửa ra, cả thị trấn phủ một lớp tuyết mỏng. Lạnh, dễ cảm, tiền điện sưởi cũng tăng.',
    choices: [{ label: 'Đẹp quá!', fx: { mood: 5 } }],
  },
  {
    id: 'bonenkai', day: 40, when: 'after', who: 'Chị Yamada', title: '🍻 Tiệc tất niên', jp: '忘年会',
    text: 'Tối nay công ty tổ chức tiệc tất niên — "quên đi năm cũ". Mỗi người góp 4.000¥.',
    choices: [
      { label: 'Đi!', sub: '−4.000¥', need: 4000, minutes: 180, fx: { money: -4000, mood: 15, rep: 5, full: 40, jp: 1 },
        res: 'Giám đốc cảm ơn bạn đã cố gắng cả năm. Mọi người nâng ly 「今年もお疲れ様でした！」' },
      { label: 'Xin phép không đi', fx: { rep: -3 }, res: 'Không sao, nhưng tiệc tất niên là dịp gắn kết quan trọng ở công ty Nhật.' },
    ],
  },
  {
    id: 'omisoka', day: 41, when: 'morning', who: 'Cuối năm', title: '🎍 Đêm giao thừa', jp: '大晦日',
    text: 'Ngày cuối năm. Ở đền, người ta xếp hàng cầu may đầu năm (初詣). Bạn có thể ghé đền hôm nay hoặc ngày mai.',
    choices: [{ label: 'Ghi nhớ', run: (S) => { S.flags.newyear = year(S); } }],
  },

  // ===================== ngẫu nhiên buổi sáng =====================
  {
    id: 'throat', when: 'morning', w: 3, cond: (S) => S.sick === 0 && (S.health < 60 || seasonIdx(S) === 3),
    who: 'Sáng nay', title: '🤒 Đau họng, hơi sốt', jp: '熱があります',
    text: 'Cổ họng rát, người hâm hấp. Hôm nay mà cố đi làm thì có khi nặng thêm.',
    choices: [
      { label: 'Gọi báo quản lý, xin nghỉ ốm', sub: '「熱があります。今日は休ませてください」', cond: (S) => (isWorkday(S) ? null : 'Hôm nay không phải ngày làm'),
        today: { sickLeave: true }, sick: 2, fx: { rep: -2, health: 6, jp: 1 }, res: 'Chị Yamada dặn bạn đi khám và nghỉ ngơi. Báo trước đàng hoàng nên chỉ bị trừ chút ít.' },
      { label: 'Kệ, uống nước ấm rồi đi tiếp', sick: 3, fx: { health: -6 }, res: 'Bạn bị cảm rồi. Nên ghé phòng khám hoặc mua thuốc ở konbini.' },
    ],
  },
  {
    id: 'omiyage', when: 'morning', w: 2, cond: isWorkday,
    who: 'Phòng nghỉ ở chỗ làm', title: '🎁 Quà omiyage', jp: 'お土産です。どうぞ',
    text: 'Anh Suzuki đi du lịch Hokkaido về, để một hộp bánh ở phòng nghỉ. Mỗi người lấy một cái.',
    choices: [
      { label: 'Lấy một cái, nói 「ありがとうございます」', fx: { mood: 4, rep: 2, jp: 0.5 }, res: 'Anh Suzuki cười: 「美味しいでしょう？」 (Ngon chứ?)' },
      { label: 'Lấy ba cái cho đỡ đói', fx: { full: 10, rep: -3 }, res: 'Mọi người liếc nhìn… Quà omiyage là để chia đều, mỗi người một phần.' },
    ],
  },
  {
    id: 'momcall', when: 'morning', w: 2, once: true, cond: (S) => S.day > 10,
    who: 'Mẹ gọi điện', title: '📞 Nhà cần tiền', jp: '',
    text: 'Em trai sắp nhập học, nhà còn thiếu tiền đóng học phí. Mẹ ngập ngừng hỏi bạn có gửi thêm được không.',
    choices: [
      { label: 'Gửi 15.000¥ về cho em', need: 15000, fx: { money: -15000, mood: 6 }, res: 'Mẹ khóc, cảm ơn rối rít. Em trai nhắn: "Em sẽ học thật tốt!"' },
      { label: 'Hứa cuối tháng gửi', fx: { mood: -6 }, res: 'Mẹ bảo không sao, nhưng bạn cứ thấy áy náy cả ngày.' },
    ],
  },
  {
    id: 'wallet', when: 'morning', w: 2, once: true, cond: (S) => dow(S) >= 5 && S.money >= 8000,
    who: 'Tối qua', title: '👛 Rơi ví!', jp: '財布を落としました',
    text: 'Sáng dậy mới phát hiện mất ví! Trong ví có 8.000¥ và thẻ lưu trú (在留カード).',
    choices: [
      { label: 'Đến đồn cảnh sát khu vực (交番) trình báo', minutes: 60, fx: { mood: 8, jp: 1 },
        res: 'Một bác lớn tuổi đã nhặt được và nộp cho koban. Bạn nhận lại ví, không thiếu một đồng!' },
      { label: 'Thôi, coi như mất', fx: { money: -8000, mood: -10 }, res: 'Mất trắng, lại phải đi làm lại thẻ lưu trú. Lần sau nhớ đến koban — ở Nhật đồ rơi rất hay được trả lại.' },
    ],
  },
  {
    id: 'sidejob', when: 'morning', w: 2, once: true, cond: (S) => S.day > 8,
    who: 'Tin nhắn lạ', title: '💼 Lời mời làm thêm', jp: 'アルバイトしない？',
    text: 'Một người quen trên mạng rủ bạn đi làm thêm cuối tuần ở xưởng đóng gói: 1.200¥/giờ, trả tiền mặt, "không ai biết đâu".',
    choices: [
      { label: 'Nhận lời', fx: { money: 14000, energy: -25 }, flag: 'sideJob', res: 'Bạn kiếm được 14.000¥… nhưng thực tập sinh làm thêm bên ngoài là vi phạm quy định lưu trú. Mong là không ai phát hiện.' },
      { label: 'Từ chối — thực tập sinh không được làm thêm', fx: { mood: -1 }, res: 'Quyết định đúng. Thực tập sinh chỉ được làm ở công ty tiếp nhận; vi phạm có thể bị cho về nước.' },
    ],
  },
  {
    id: 'caught', when: 'morning', w: 4, once: true, cond: (S) => S.flags.sideJob && S.day > 20,
    who: 'Nghiệp đoàn', title: '🚨 Bị phát hiện làm thêm', jp: '不法就労',
    text: 'Nghiệp đoàn gọi bạn lên. Họ đã biết chuyện bạn đi làm thêm ở xưởng đóng gói.',
    choices: [
      { label: 'Thành thật nhận lỗi, hứa không tái phạm', fx: { rep: -28, mood: -15 }, res: 'Bạn bị cảnh cáo nặng và ghi vào hồ sơ. Lần sau là về nước.' },
      { label: 'Chối', fx: { rep: -42, mood: -18 }, res: 'Họ có bằng chứng. Việc chối làm mọi chuyện tệ hơn nhiều.' },
    ],
  },
  {
    id: 'cat', when: 'morning', w: 1,
    who: 'Trước cửa ký túc xá', title: '🐈 Mèo hoang', jp: 'ニャー',
    text: 'Một chú mèo mướp nằm trước cửa, kêu meo meo nhìn bạn.',
    choices: [
      { label: 'Mua cho nó gói đồ ăn', sub: '−150¥', need: 150, fx: { money: -150, mood: 6 }, res: 'Nó ăn ngon lành rồi dụi đầu vào chân bạn.' },
      { label: 'Vuốt ve một chút rồi đi', minutes: 10, fx: { mood: 3 } },
    ],
  },
  {
    id: 'bike', when: 'morning', w: 3, once: true, cond: (S) => !S.flags.bike && S.day > 3,
    who: 'Anh Long', title: '🚲 Xe đạp cũ', jp: 'ママチャリ',
    text: 'Anh Long mua xe mới, bán lại chiếc xe đạp mamachari giá 6.000¥. Có xe thì đi lại nhanh hơn hẳn.',
    choices: [
      { label: 'Mua', sub: '−6.000¥ · đi nhanh hơn', need: 6000, fx: { money: -6000, mood: 4 }, flag: 'bike',
        res: 'Nhớ: xe đạp phải đăng ký chống trộm (防犯登録), không chở người, tối phải bật đèn.' },
      { label: 'Thôi, đi bộ cho khỏe' },
    ],
  },
  {
    id: 'tax', when: 'morning', w: 3, once: true, cond: (S) => S.day >= 30,
    who: 'Hộp thư', title: '✉️ Thư từ tòa thị chính', jp: '住民税のお知らせ',
    text: 'Thông báo thuế cư trú: 6.000¥. Có thể nộp ngay tại konbini.',
    choices: [
      { label: 'Ra konbini nộp luôn', need: 6000, minutes: 15, fx: { money: -6000, jp: 1 }, res: 'Nộp xong trong 2 phút. Ở Nhật, nhiều hóa đơn thuế, điện, nước đều trả được ở konbini.' },
      { label: 'Để sau', flag: 'taxLate' },
    ],
  },
  {
    id: 'tax2', when: 'morning', w: 4, once: true, cond: (S) => S.flags.taxLate && S.day >= 36,
    who: 'Hộp thư', title: '✉️ Thư nhắc nộp thuế', jp: '督促状',
    text: 'Bạn chưa nộp thuế cư trú. Tiền phạt chậm nộp đã được cộng thêm.',
    choices: [{ label: 'Nộp ngay (7.500¥)', fx: { money: -7500, rep: -2 }, res: 'Nợ thuế có thể gây khó khăn khi gia hạn visa. Hãy nộp đúng hạn.' }],
  },
  {
    id: 'phrase', when: 'morning', w: 2, cond: isWorkday,
    who: 'Anh Kimura (senpai người Nhật)', title: '🗣️ Học từ senpai', jp: 'ここ、危ないから気をつけて',
    text: 'Anh Kimura chỉ vào máy và nói: 「ここ、危ないから気をつけて」 — Chỗ này nguy hiểm, cẩn thận nhé.',
    choices: [
      { label: 'Lặp lại: 「はい、気をつけます！」', fx: { jp: 2, rep: 2 } },
      { label: 'Gật đầu cho qua', fx: { jp: 0.3 } },
    ],
  },
  {
    id: 'chuiAd', when: 'morning', w: 2, once: true, cond: (S) => S.day > 4,
    who: 'Nhóm Facebook đồng hương', title: '📢 Chuyển tiền "giá tốt"', jp: '',
    text: 'Có người quảng cáo nhận chuyển tiền về Việt Nam với tỷ giá cao hơn, không mất phí. "Uy tín, nhanh gọn".',
    choices: [
      { label: 'Lưu số lại', flag: 'chuiAd', res: 'Kênh chuyển tiền không phép rất rủi ro: có thể mất tiền, thậm chí liên quan tới rửa tiền.' },
      { label: 'Bỏ qua' },
    ],
  },
  {
    id: 'noise', when: 'morning', w: 4, once: true, cond: (S) => S.flags.lateCall,
    who: 'Trước cửa phòng', title: '📝 Hàng xóm phàn nàn', jp: '夜は静かにしてください',
    text: 'Một tờ giấy dán trước cửa: 「夜は静かにしてください」— "Buổi tối xin giữ yên lặng".',
    choices: [
      { label: 'Sang xin lỗi: 「すみませんでした」', minutes: 15, fx: { jp: 1, mood: -1, rel: { sato: 1 } }, res: 'Bác hàng xóm gật đầu, bảo lần sau để ý là được.' },
      { label: 'Kệ', fx: { mood: -1, rel: { sato: -2 }, rep: -2 } },
    ],
  },
  {
    id: 'rain', when: 'morning', w: 3, once: true, cond: (S) => S.weather === 'rain' && !S.flags.umbrella,
    who: 'Sáng nay', title: '☔ Mưa to', jp: '雨',
    text: 'Trời mưa như trút mà bạn không có ô.',
    choices: [
      { label: 'Mua ô nilon ở konbini', sub: '−500¥', need: 500, fx: { money: -500 }, flag: 'umbrella', res: 'Ô nilon trong suốt — "đặc sản" của Nhật.' },
      { label: 'Đội mưa mà đi', fx: { health: -4, mood: -3 } },
    ],
  },
  {
    id: 'homesick', when: 'morning', w: 3, cond: (S) => S.mood < 45,
    who: 'Sáng nay', title: '🏠 Nhớ nhà', jp: 'ホームシック',
    text: 'Bạn mơ thấy bữa cơm ở nhà. Tỉnh dậy, phòng ký túc xá trống trải lạ thường.',
    choices: [
      { label: 'Gọi video về nhà', minutes: 30, fx: { mood: 10 } },
      { label: 'Đi dạo bờ sông cho khuây khỏa', minutes: 45, fx: { mood: 6, energy: -3 } },
    ],
  },

  {
    id: 'ikusei', when: 'morning', w: 3, once: true, cond: (S) => S.day > 15,
    who: 'Tin tức', title: '📰 Chế độ thực tập sinh sắp thay đổi', jp: '育成就労制度',
    text: 'Báo đưa tin: Nhật Bản đã thông qua luật thay chế độ thực tập sinh kỹ năng bằng chế độ mới 「育成就労」 (dự kiến áp dụng từ năm 2027). Mục tiêu là đào tạo người lao động lên trình độ Kỹ năng đặc định số 1, và cho phép chuyển chỗ làm trong cùng ngành khi đủ điều kiện.',
    choices: [
      { label: 'Hỏi anh Long xem ảnh hưởng gì tới mình', minutes: 20, fx: { jp: 0.5, mood: 1 }, res: 'Anh Long: "Người đang là TTS vẫn theo hợp đồng cũ. Quan trọng nhất vẫn là tay nghề và tiếng Nhật — có hai cái đó thì chế độ nào cũng sống được."' },
      { label: 'Đọc lướt rồi đi làm', fx: { jp: 0.3 } },
    ],
  },
  {
    id: 'kisoRemind', when: 'morning', w: 6, once: true, cond: (S) => S.career && S.career.visa === 'tts1' && S.day - S.career.start >= 28,
    who: 'Tổ trưởng Yamada', title: '📋 Đăng ký thi tay nghề', jp: '技能検定基礎級',
    text: 'Chị Yamada báo: thực tập sinh năm nhất phải thi 技能検定 基礎級 (lý thuyết + thực hành). Không đỗ thì không được gia hạn lên TTS số 2. Công ty đã đăng ký cho bạn — ngày thường đến chỗ làm trước 10:00 là thi được.',
    choices: [{ label: '「はい、頑張ります！」', fx: { rep: 1 } }],
  },

  // ===================== sau ca làm =====================
  {
    id: 'zangyo', when: 'after', w: 3, cond: (S) => isWorkday(S),
    who: 'Chị Yamada (tổ trưởng)', title: '⏱️ Làm thêm giờ?', jp: '今日、残業できますか？',
    text: 'Có đơn hàng gấp, cần thêm người làm 2 tiếng nữa. Lương làm thêm cao hơn lương thường.',
    choices: [
      { label: '「はい、できます！」', sub: '+3.600¥ lương · mệt hơn', minutes: 120, fx: { wage: 3600, energy: -18, full: -8, rep: 4 } },
      { label: '「すみません、今日はちょっと…」', fx: { rep: -1 }, res: 'Chị Yamada gật đầu: 「分かりました」.' },
    ],
  },
  {
    id: 'izakaya', when: 'after', w: 4, cond: (S) => dow(S) === 4,
    who: 'Đồng nghiệp', title: '🏮 Đi nhậu cuối tuần', jp: '飲みに行こうよ！',
    text: 'Mấy anh trong xưởng rủ đi izakaya. "Đi đi, nói chuyện cho quen!"',
    choices: [
      { label: 'Đi!', sub: '−3.500¥', need: 3500, minutes: 150, fx: { money: -3500, mood: 12, rep: 3, energy: -8, full: 35, jp: 1 },
        res: 'Bạn học được câu 「お疲れ様でした、乾杯！」 và được anh Kimura chỉ cách rót bia cho người lớn tuổi.' },
      { label: '「今日はちょっと…」 (từ chối khéo)', fx: { mood: -1, jp: 0.5 } },
    ],
  },
  {
    id: 'scold', when: 'after', w: 5, cond: (S) => S.lastScore < 0.5,
    who: 'Quản lý', title: '😠 Bị nhắc nhở', jp: 'ミスが多いですね',
    text: 'Quản lý gọi bạn lại: hôm nay bạn sai sót hơi nhiều.',
    choices: [
      { label: '「申し訳ありません。次は気をつけます」', fx: { rep: 2, jp: 1, mood: -3 }, res: 'Quản lý gật đầu. Ở Nhật, nhận lỗi trước rồi mới trình bày nguyên nhân sẽ được đánh giá cao.' },
      { label: 'Giải thích là do máy chạy nhanh quá', fx: { rep: -3, mood: -2 }, res: 'Quản lý cau mày. Đổ lỗi ngay lập tức thường bị xem là thiếu trách nhiệm.' },
    ],
  },
  {
    id: 'praise', when: 'after', w: 4, cond: (S) => S.lastScore >= 0.85,
    who: 'Quản lý', title: '👍 Được khen', jp: '今日はよく頑張りましたね',
    text: '"Hôm nay làm tốt lắm!" — quản lý vỗ vai bạn.',
    choices: [{ label: '「ありがとうございます！」', fx: { mood: 6, rep: 2 } }],
  },
  {
    id: 'horenso', when: 'after', w: 2,
    who: 'Cuối ca', title: '🔧 Phát hiện sự cố', jp: '報告・連絡・相談',
    text: 'Lúc dọn dẹp, bạn thấy một vũng dầu nhỏ rỉ ra dưới gầm máy.',
    choices: [
      { label: 'Báo ngay cho quản lý (報告)', minutes: 10, fx: { rep: 4, jp: 1 }, res: 'Quản lý cảm ơn bạn. "Hō-ren-sō" — báo cáo, liên lạc, bàn bạc — là nguyên tắc vàng ở công ty Nhật.' },
      { label: 'Chắc không sao, về thôi', chance: { p: 0.5, fx: { rep: -6 }, res: 'Hôm sau máy hỏng, cả dây chuyền dừng nửa ngày. Quản lý hỏi: "Hôm qua có ai thấy gì không?"' } },
    ],
  },
];

function reasonOf(c, S) {
  if (c.need && S.money < c.need) return `Cần ${yen(c.need)}`;
  if (c.cond) return c.cond(S);
  return null;
}

export async function runEvent(ev) {
  const S = G.S;
  if (ev.once) S.flags['ev_' + ev.id] = true;
  const choices = ev.choices.map((c, i) => {
    const r = reasonOf(c, S);
    return { label: c.label, sub: c.sub, value: i, disabled: !!r, reason: r };
  });
  if (choices.every((c) => c.disabled)) { choices[choices.length - 1].disabled = false; }
  const i = await modal({ who: ev.who, title: ev.title, jp: ev.jp, text: ev.text, choices });
  await applyChoice(S, ev.choices[i], ev.title);
}

export async function applyChoice(S, c, title) {
  let fx = typeof c.fx === 'function' ? c.fx(S) : c.fx;
  let res = c.res;
  if (c.run) c.run(S);
  if (typeof c.fx === 'function') fx = c.fx(S);
  if (c.chance && Math.random() < c.chance.p) { fx = c.chance.fx; res = c.chance.res; }
  if (typeof res === 'function') res = res(S);
  if (c.minutes) advance(S, c.minutes);
  if (c.setTime && S.time < c.setTime) S.time = c.setTime;
  if (c.today) Object.assign(S.today, c.today);
  if (c.flag) S.flags[c.flag] = true;
  if (c.sick) S.sick = Math.max(S.sick, c.sick);
  const out = applyFx(S, fx);
  addLog(S, `${title}: ${c.label.replace(/<[^>]+>/g, '')}`);
  if (res || out.length) await modal({ title: res ? '' : 'Kết quả', text: res || '', html: chips(out) });
}

// Sự kiện cố định lặp lại hằng năm theo ngày trong năm (doy)
export function fixedEvent(S, when) {
  return EVENTS.find((e) => e.day === doy(S) && e.when === when && !S.flags[`fx_${e.id}_${year(S)}`]);
}
export function markFixed(S, ev) { S.flags[`fx_${ev.id}_${year(S)}`] = true; }

export function randomEvent(S, when) {
  const pool = EVENTS.filter((e) => !e.day && e.when === when && !(e.once && S.flags['ev_' + e.id]) && (!e.cond || e.cond(S)));
  const total = pool.reduce((a, e) => a + (e.w || 1), 0);
  let r = Math.random() * total;
  for (const e of pool) { r -= e.w || 1; if (r < 0) return e; }
  return null;
}
