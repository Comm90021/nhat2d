// Tài sản có thể mua. effects chỉ dùng các khóa: speed (hệ số tốc độ đi lại ngoài trời, vd 1.5), sleep (năng lượng hồi thêm mỗi đêm, vd 5),
// study (hệ số điểm học tiếng Nhật, vd 1.1), mood (tinh thần cộng thêm mỗi tháng, vd 3), cook (giảm giá nguyên liệu nấu ăn, vd 0.2 = 20%)

export const ASSETS = [
  // req: null | 'license_moped' (bằng xe máy 原付) | 'license_car' (bằng lái ô tô) | 'parking' (chỗ đậu xe)
  // upkeep: chi phí duy trì mỗi tháng (¥), resale: tỷ lệ bán lại được (so với giá mua gốc)
  {
    id: 'bike',
    name: 'Xe đạp cũ (ママチャリ)',
    price: 8000,
    upkeep: 0,
    resale: 0.25,
    req: null,
    effects: { speed: 1.4 },
    desc: 'Xe đạp có giỏ trước mua tại tiệm đồ cũ. Giúp đi làm và đi siêu thị nhanh hơn đi bộ rất nhiều, không tốn xăng hay phí bãi đỗ.',
  },
  {
    id: 'electric_bike',
    name: 'Xe đạp trợ lực điện (電動アシスト自転車)',
    price: 68000,
    upkeep: 500, // chi phí điện sạc pin hàng tháng
    resale: 0.40,
    req: null,
    effects: { speed: 1.8 },
    desc: 'Xe đạp có mô-tơ điện hỗ trợ trợ lực nhẹ nhàng khi lên dốc hoặc ngược gió. Giúp giữ gìn sức lực sau ca làm việc nặng nhọc ở xưởng.',
  },
  {
    id: 'moped',
    name: 'Xe máy 50cc cũ (原付スクーター)',
    price: 88000,
    upkeep: 3500, // gồm xăng ~2.000¥ + chia bình quân bảo hiểm bắt buộc 自賠責 và thuế xe nhẹ ~1.500¥/tháng
    resale: 0.45,
    req: 'license_moped',
    effects: { speed: 2.2 },
    desc: 'Xe máy phân khối nhỏ 50cc thuận tiện đi lại bất kể thời tiết nắng mưa. Bắt buộc phải có bằng lái 原付, tốc độ giới hạn tối đa 30km/h.',
  },
  {
    id: 'car_used',
    name: 'Ô tô cũ biển vàng (軽自動車)',
    price: 320000,
    upkeep: 18000, // gồm thuê bãi đỗ ~8.000¥, xăng ~5.000¥, bảo hiểm tự nguyện + bắt buộc ~5.000¥; chưa tính đăng kiểm 車検 2 năm/lần ~80.000¥
    resale: 0.35,
    req: 'license_car',
    effects: { speed: 2.8 },
    desc: 'Ô tô phân khối nhỏ biển vàng tiết kiệm xăng, che nắng che mưa và chở đồ đi xa thuận tiện. Chi phí duy trì hàng tháng tốn kém và phải làm đăng kiểm (車検) định kỳ 2 năm một lần.',
  },
  {
    id: 'laptop',
    name: 'Laptop học tập & làm việc',
    price: 55000,
    upkeep: 0,
    resale: 0.30,
    req: null,
    effects: { study: 1.25 },
    desc: 'Máy tính xách tay cấu hình văn phòng mượt mà. Hỗ trợ tra từ điển, luyện đề thi JLPT qua mạng và gọi video chất lượng cao về cho gia đình ở quê.',
  },
  {
    id: 'smartphone',
    name: 'Điện thoại thông minh đời mới',
    price: 85000,
    upkeep: 0,
    resale: 0.50,
    req: null,
    effects: { mood: 3, study: 1.05 },
    desc: 'Màn hình sắc nét, camera xịn sò và cấu hình nhanh nhạy. Giúp giải trí xem phim sau giờ tăng ca mệt mỏi và tra cứu tài liệu học tiếng Nhật mọi lúc mọi nơi.',
  },
  {
    id: 'futon_set',
    name: 'Bộ đệm futon cao cấp (高級布団)',
    price: 22000,
    upkeep: 0,
    resale: 0.10,
    req: null,
    effects: { sleep: 8 },
    desc: 'Bộ đệm và chăn bông dày êm ái, giữ nhiệt cực tốt vào mùa đông và bảo vệ cột sống. Nâng cao chất lượng giấc ngủ, giúp hồi phục thể lực nhanh chóng mỗi đêm.',
  },
  {
    id: 'cooker_fridge',
    name: 'Combo nồi cơm điện IH & tủ lạnh mini',
    price: 32000,
    upkeep: 1000, // tiền điện phát sinh mỗi tháng
    resale: 0.25,
    req: null,
    effects: { cook: 0.20 }, // giảm 20% chi phí ăn uống nhờ tự nấu và trữ đông đồ ăn giảm giá siêu thị
    desc: 'Nồi cơm điện cao tần nấu cơm dẻo ngon kết hợp tủ lạnh 2 cánh trữ đồ ăn giảm giá từ siêu thị. Giúp bạn tự nấu nướng và tiết kiệm 20% tiền ăn hàng tháng.',
  },
  {
    id: 'gaming_console',
    name: 'Máy chơi game cầm tay',
    price: 38000,
    upkeep: 0,
    resale: 0.55,
    req: null,
    effects: { mood: 6 },
    desc: 'Thiết bị chơi game giải trí di động nhỏ gọn với kho game phong phú. Giúp bạn thư giãn tâm trí, xua tan áp lực công việc và nỗi nhớ nhà vào dịp cuối tuần.',
  },
  {
    id: 'interview_suit',
    name: 'Bộ vest phỏng vấn (リクルートスーツ)',
    price: 28000,
    upkeep: 0,
    resale: 0.20,
    req: null,
    effects: {},
    desc: 'Trang phục công sở chuẩn mực gồm áo vest đen, sơ mi trắng, cà vạt và giày tây. Vật dụng bắt buộc phải mặc khi tham gia phỏng vấn xin việc, thi Tokutei hoặc làm thủ tục chuyển đổi tư cách lưu trú.',
  },
  {
    id: 'luxury_gift',
    name: 'Đồng hồ đeo tay hàng hiệu',
    price: 65000,
    upkeep: 0,
    resale: 0.60,
    req: null,
    effects: { mood: 4 },
    desc: 'Phụ kiện thời trang sang trọng tự thưởng cho bản thân sau chuỗi ngày tăng ca vất vả. Mang lại cảm giác tự tin và nâng cao vị thế khi đi giao lưu, gặp gỡ bạn bè.',
  },
];

export const LICENSES = [
  // ⚠️ chi phí thi thực tế tại các trung tâm sát hạch lái xe (運転免許センター) dao động khoảng 8.000–8.500¥ tùy tỉnh (lệ phí thi lý thuyết ~1.500¥, cấp bằng ~2.050¥, học thực hành kỹ năng lái xe 原付講習 ~4.500¥)
  {
    id: 'license_moped',
    name: 'Bằng xe máy 50cc (原付免許)',
    price: 8000,
    desc: 'Bằng lái xe máy phân khối dưới 50cc. Đăng ký thi lý thuyết trực tiếp tại Trung tâm sát hạch cảnh sát và hoàn thành khóa huấn luyện kỹ năng lái xe ngắn trong ngày.',
  },
  // ⚠️ học trường lái chỉ định (指定自動車教習所) phổ biến khoảng 270.000–350.000¥ cho bằng AT (mùa thấp điểm hoặc gói học nội trú 合宿免許 có thể hạ còn 220.000–260.000¥; thi trực tiếp một lần 一発試験 rẻ hơn nhiều nhưng tỷ lệ đỗ của người nước ngoài cực thấp)
  {
    id: 'license_car',
    name: 'Bằng lái ô tô phổ thông (普通免許 AT)',
    price: 300000,
    desc: 'Bằng lái xe ô tô số tự động hạng phổ thông. Học trọn gói tại trường đào tạo lái xe chỉ định gồm toàn bộ khóa lý thuyết, lái sa hình trong trường và sát hạch lái đường trường thực tế.',
  },
];

export const FIN_TEXT = {
  nisa: 'Chính sách NISA mới từ năm 2024 miễn thuế vĩnh viễn cho toàn bộ lợi nhuận và cổ tức đầu tư thay vì phải nộp mức thuế thông thường 20,315%. Hạn mức đầu tư hàng năm gồm 1.200.000¥ cho khung tích lũy (つみたて投資枠) và 2.400.000¥ cho khung tăng trưởng (成長投資枠), với tổng hạn mức trọn đời lên tới 18.000.000¥ (trong đó khung tăng trưởng tối đa 12.000.000¥). Người nước ngoài từ 18 tuổi có tư cách cư trú trung và dài hạn hợp pháp tại Nhật Bản đều hoàn toàn đủ điều kiện mở tài khoản NISA.',

  loan: 'Theo Luật Hạn chế Lãi suất (利息制限法) tại Nhật Bản, mức trần lãi suất cho vay hàng năm được kiểm soát chặt chẽ theo quy mô khoản nợ: tối đa 20% đối với khoản vay dưới 100.000¥, 18% cho khoản từ 100.000¥ đến dưới 1.000.000¥, và 15% cho khoản từ 1.000.000¥ trở lên. Người lao động nước ngoài có visa ngắn hạn hoặc thu nhập chưa ổn định rất khó được ngân hàng chính thống phê duyệt vay vốn. Cần tuyệt đối cảnh giác và tránh xa các đường dây tín dụng đen (ヤミ金) vì lãi suất cắt cổ trái pháp luật cùng những thủ đoạn đòi nợ đe dọa nguy hiểm.',

  card: 'Thủ tục mở thẻ tín dụng tại Nhật Bản được thẩm định vô cùng khắt khe dựa trên loại hợp đồng lao động, thời hạn còn lại của thẻ ngoại kiều (在留カード) và lịch sử tín dụng lưu trữ tại tổ chức CIC/JICC. Người lao động mới sang Nhật thường dễ bị từ chối phát hành thẻ do chưa xây dựng được điểm tín dụng trong nước. Khi đã có thẻ, cần đặc biệt thận trọng với hình thức trả góp cố định hàng tháng (リボ払い) do mức lãi suất thực tế lên tới 15%–18%/năm, rất dễ biến thành chiếc bẫy nợ nần dai dẳng.',

  savings: 'Lãi suất tiền gửi tiết kiệm thông thường tại hệ thống ngân hàng Nhật Bản rất thấp (dưới 1%/năm, dù đã nhích lên sau khi Ngân hàng Trung ương Nhật tăng lãi suất), thường không theo kịp tốc độ trượt giá. Dẫu vậy, tiền gửi tại các tổ chức tín dụng được bảo vệ tối đa tới 10.000.000¥ tiền gốc cộng lãi phát sinh cho mỗi cá nhân thông qua cơ chế Bảo hiểm tiền gửi (預金保険制度). Người lao động nên duy trì một khoản tiền mặt dự phòng tương đương 3 đến 6 tháng sinh hoạt thiết yếu trước khi tham gia các kênh đầu tư có rủi ro.',

  remit: 'Khi có nhu cầu chuyển tiền lương về phụng dưỡng gia đình tại Việt Nam, bắt buộc phải giao dịch qua các công ty kiều hối đã được Cục Tài chính Nhật Bản (財務局) cấp phép chính thức. Tuyệt đối không giao dịch chuyển đổi ngoại tệ qua các dịch vụ đổi tiền ngầm trái phép (地下銀行) trên mạng để tránh bị phong tỏa tài khoản hoặc xử lý hình sự. Hãy giữ lại chứng từ chuyển tiền (送金関係書類): đây là giấy tờ bắt buộc nếu xin giảm trừ người phụ thuộc ở nước ngoài (扶養控除). Từ năm 2023 điều kiện giảm trừ cho người thân 30–69 tuổi ở nước ngoài đã chặt hơn nhiều — nên hỏi kỹ công ty hoặc cơ quan thuế.',

  lottery: 'Vé số tại Nhật Bản (宝くじ) chịu sự điều chỉnh của Luật Vé số chuyên biệt, trong đó quy định tổng giá trị giải thưởng hoàn trả cho người chơi bắt buộc không được vượt quá 50% doanh thu (thực tế dao động trong khoảng 45%–47%). Khoảng 40% doanh thu bán vé được nộp vào ngân sách các địa phương để phục vụ các dự án công cộng và công trình phúc lợi xã hội. Điểm ưu việt là toàn bộ số tiền trúng vé số hợp pháp tại Nhật Bản đều được miễn thuế thu nhập cá nhân 100%.',

  stocks: 'Đầu tư cổ phiếu luôn đi liền với rủi ro biến động giá theo từng chu kỳ kinh tế và tình hình hoạt động kinh doanh của từng doanh nghiệp niêm yết. Nhà đầu tư không nên dồn toàn bộ nguồn lực vào một cổ phiếu duy nhất mà cần đa dạng hóa danh mục đầu tư qua nhiều nhóm ngành nghề khác nhau. Chiến lược tích sản dài hạn vào các doanh nghiệp đầu ngành có nền tảng tài chính lành mạnh sẽ giúp hạn chế rủi ro trước những nhịp rung lắc ngắn hạn của thị trường.',
};
