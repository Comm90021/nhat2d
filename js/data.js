// Dữ liệu tĩnh: nghề, màu nhân vật, câu tiếng Nhật, lời khuyên.

export const JOBS = {
  factory: {
    id: 'factory', icon: '🍙', name: 'Chế biến thực phẩm', jp: '食品工場',
    place: 'Xưởng Midori', sign: '工場', monthly: 178000, energy: 34, game: 'factory',
    desc: 'Đứng dây chuyền kiểm tra cơm nắm. Cần mắt tinh, tay nhanh. Lương vừa, sức vừa.',
    tip: 'Cơm nắm thiếu rong biển, bị vỡ, dính tóc hay có vết bẩn thì loại ra. Đừng loại nhầm hàng tốt!',
  },
  farm: {
    id: 'farm', icon: '🍓', name: 'Nông nghiệp', jp: '農業',
    place: 'Nhà kính Hoshino', sign: '農園', monthly: 168000, energy: 30, game: 'farm',
    desc: 'Thu hoạch dâu tây trong nhà kính. Hái đúng quả chín đỏ, đừng làm dập quả xanh. Nhẹ việc nhất.',
    tip: 'Chỉ hái quả đỏ. Quả xanh, quả trắng chưa chín — chạm vào là dập. Quả vàng hiếm được tính gấp đôi!',
  },
  build: {
    id: 'build', icon: '🏗️', name: 'Xây dựng', jp: '建設',
    place: 'Công trường Aoba', sign: '現場', monthly: 198000, energy: 44, game: 'build',
    desc: 'Lắp giàn giáo, dựng khung thép. Lương cao nhất nhưng mệt nhất, và phải tuân thủ an toàn.',
    tip: 'Thả thanh thép chồng thật thẳng lên tầng dưới. Phần thừa sẽ bị cắt. 安全第一 — an toàn là trên hết!',
  },
};

// Nghề mới khi chuyển việc (v3.3) — chỉ có ca làm trắc nghiệm, không có mini-game
Object.assign(JOBS, {
  it: { id: 'it', icon: '💻', name: 'Công nghệ thông tin', jp: 'IT', place: 'Văn phòng Kaizen IT', sign: 'IT', monthly: 280000, energy: 26, game: null, desc: 'Lập trình, kiểm thử, họp dự án.', tip: 'Gặp lỗi thì báo cáo sớm (報連相), đừng ôm một mình đến sát deadline.' },
  electric: { id: 'electric', icon: '⚡', name: 'Điện – tự động hóa', jp: '電気', place: 'Tōhoku Denki', sign: '電気', monthly: 210000, energy: 34, game: null, desc: 'Đấu dây, lắp tủ điện, bảo trì.', tip: 'Luôn ngắt nguồn, khóa và treo biển (ロックアウト) trước khi làm việc với điện.' },
  parts: { id: 'parts', icon: '🔩', name: 'Sản xuất linh kiện', jp: '部品製造', place: 'Minato Parts', sign: '部品', monthly: 195000, energy: 34, game: null, desc: 'Vận hành máy dập, robot hàn, kiểm tra hàng.', tip: 'Thấy bất thường thì bấm dừng khẩn cấp và báo ngay.' },
  logistics: { id: 'logistics', icon: '📦', name: 'Kho vận', jp: '物流', place: 'Kho vận Hayabusa', sign: '物流', monthly: 200000, energy: 38, game: null, desc: 'Lấy hàng, đóng gói, xếp kệ, lái xe nâng.', tip: 'Đi đúng lối đi bộ, mang vác đúng tư thế để không đau lưng.' },
  care: { id: 'care', icon: '🧓', name: 'Điều dưỡng', jp: '介護', place: 'Viện dưỡng lão Hinata', sign: '介護', monthly: 215000, energy: 36, game: null, desc: 'Chăm sóc người cao tuổi: ăn uống, di chuyển, trò chuyện.', tip: 'Nói chậm, rõ, dùng kính ngữ; để ý thay đổi nhỏ về sức khỏe của các cụ.' },
  restaurant: { id: 'restaurant', icon: '🍜', name: 'Nhà hàng', jp: '外食', place: 'Quán ramen Taishō', sign: '外食', monthly: 190000, energy: 34, game: null, desc: 'Bếp và phục vụ ở quán ramen.', tip: 'Hỏi kỹ dị ứng thức ăn của khách, rửa tay mỗi lần đổi việc.' },
});

export const LOOK = {
  hair: ['#1e1a1a', '#3b2a20', '#6b4226', '#9c5a2e', '#2f3d5c', '#b8a17a'],
  shirt: ['#e35d5b', '#3f88c5', '#44a36b', '#f2a541', '#8e6bbf', '#f1ece0', '#2e3440'],
  pants: ['#2f3a56', '#3d3d3d', '#5b4636', '#6b7a8f', '#1f4e5f'],
  skin: ['#f6d7b8', '#eac39c', '#d9a77c', '#b9825b'],
};

// [chữ Nhật, cách đọc, nghĩa]
export const PHRASES = [
  ['おはようございます', 'ohayō gozaimasu', 'Chào buổi sáng (lịch sự)'],
  ['お疲れ様です', 'otsukaresama desu', 'Chào đồng nghiệp / anh chị vất vả rồi'],
  ['お先に失礼します', 'osaki ni shitsurei shimasu', 'Tôi xin phép về trước'],
  ['すみません', 'sumimasen', 'Xin lỗi / Cho tôi hỏi'],
  ['申し訳ありません', 'mōshiwake arimasen', 'Tôi thành thật xin lỗi (trang trọng)'],
  ['ありがとうございます', 'arigatō gozaimasu', 'Cảm ơn (lịch sự)'],
  ['よろしくお願いします', 'yoroshiku onegaishimasu', 'Rất mong được giúp đỡ'],
  ['分かりました', 'wakarimashita', 'Tôi hiểu rồi'],
  ['もう一度お願いします', 'mō ichido onegaishimasu', 'Xin nói lại một lần nữa'],
  ['ゆっくり話してください', 'yukkuri hanashite kudasai', 'Xin hãy nói chậm'],
  ['危ない！', 'abunai!', 'Nguy hiểm! Coi chừng!'],
  ['気をつけて', 'ki o tsukete', 'Cẩn thận nhé'],
  ['安全第一', 'anzen daiichi', 'An toàn là trên hết'],
  ['休憩', 'kyūkei', 'Giờ nghỉ giải lao'],
  ['残業', 'zangyō', 'Làm thêm giờ'],
  ['給料', 'kyūryō', 'Tiền lương'],
  ['遅刻', 'chikoku', 'Đi muộn'],
  ['早退', 'sōtai', 'Về sớm'],
  ['報連相', 'hō-ren-sō', 'Báo cáo – liên lạc – bàn bạc'],
  ['頭が痛いです', 'atama ga itai desu', 'Tôi bị đau đầu'],
  ['熱があります', 'netsu ga arimasu', 'Tôi bị sốt'],
  ['薬', 'kusuri', 'Thuốc'],
  ['病院', 'byōin', 'Bệnh viện'],
  ['燃えるゴミ', 'moeru gomi', 'Rác cháy được'],
  ['燃えないゴミ', 'moenai gomi', 'Rác không cháy được'],
  ['地震', 'jishin', 'Động đất'],
  ['避難所', 'hinanjo', 'Nơi sơ tán'],
  ['台風', 'taifū', 'Bão'],
  ['温めますか', 'atatamemasu ka', 'Có cần hâm nóng không?'],
  ['半額', 'hangaku', 'Giảm nửa giá'],
  ['いくらですか', 'ikura desu ka', 'Bao nhiêu tiền?'],
  ['駅はどこですか', 'eki wa doko desu ka', 'Nhà ga ở đâu?'],
  ['いただきます', 'itadakimasu', 'Câu nói trước khi ăn'],
  ['ごちそうさまでした', 'gochisōsama deshita', 'Câu nói sau khi ăn xong'],
  ['先輩', 'senpai', 'Tiền bối, người vào trước'],
  ['手袋', 'tebukuro', 'Găng tay'],
  ['失礼します', 'shitsurei shimasu', 'Xin phép (khi vào / ra phòng)'],
  ['いらっしゃいませ', 'irasshaimase', 'Xin mời quý khách'],
  ['大丈夫です', 'daijōbu desu', 'Không sao / Tôi ổn'],
  ['乾杯', 'kanpai', 'Cạn ly!'],
].map(([jp, ro, vi], id) => ({ id, jp, ro, vi }));

export const LONG_TIPS = [
  'Sau 7 giờ tối siêu thị dán tem 半額 lên bento — mua lúc đó rẻ một nửa đấy em.',
  'Đi làm muộn là bị trừ uy tín nặng lắm. Ngủ trước nửa đêm cho anh!',
  'Chuyển tiền qua công ty có giấy phép thì mất chút phí nhưng an toàn. Mấy kênh "người quen" trên mạng mất tiền như chơi.',
  'Tự nấu ăn rẻ hơn ăn konbini nhiều. Ra siêu thị mua nguyên liệu mà nấu.',
  'Thực tập sinh không được đi làm thêm bên ngoài đâu. Bị phát hiện là về nước luôn.',
  'Bị ốm thì gọi báo quản lý trước giờ làm: 「熱があります。今日は休ませてください」.',
  'Chủ nhật tranh thủ ra lớp tiếng Nhật. Có N3 là sau này dễ gia hạn, chuyển visa.',
  'Gặp ai trong xưởng cũng chào 「お疲れ様です」, người ta quý lắm.',
  'Rác phải phân loại đúng ngày, không là bị dán giấy vàng trả lại đấy.',
  'Mua túi đồ khẩn cấp ở konbini đi. Bên này động đất, bão là chuyện thường.',
  'Mệt quá thì nghỉ, đừng uống nước tăng lực hoài, hại người lắm.',
  'Thứ Bảy có làm thêm buổi sáng, lương cao hơn. Nhưng nhớ chừa sức.',
];

export const TEACHER_TALK = [
  'Cô Mori kể: người Nhật hay nói vòng — 「ちょっと…」 thường có nghĩa là "không được" đấy.',
  'Cô Mori dặn: vào nhà người Nhật nhớ cởi giày, xếp mũi giày quay ra cửa.',
  'Cô Mori giải thích: 「いただきます」 là lời cảm ơn đồ ăn và người nấu.',
  'Cô Mori cười: lên tàu điện nhớ để điện thoại chế độ im lặng, đừng gọi điện.',
  'Cô Mori nói: tắm onsen phải tắm sạch trước khi xuống bể, không cho khăn vào nước.',
  'Cô Mori kể về 「お盆」 — dịp người Nhật về quê thăm mộ tổ tiên vào mùa hè.',
  'Cô Mori nhắc: đổ rác đúng giờ buổi sáng, không đổ từ tối hôm trước.',
];
