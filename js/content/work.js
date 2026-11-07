// Câu hỏi tình huống ở chỗ làm. [câu hỏi, [đáp án ĐÚNG đầu tiên, ...sai], giải thích]

const GENERAL = [
  ['Tổ trưởng nói: 「これ、今日中にお願いね」. Ý chị ấy là?', ['Làm xong việc này trong hôm nay', 'Làm vào ngày mai', 'Không cần làm nữa', 'Làm trong tuần này'], '今日中 (きょうじゅう) = trong ngày hôm nay.'],
  ['Bạn làm hỏng một sản phẩm nhưng không ai nhìn thấy. Nên làm gì?', ['Báo ngay cho tổ trưởng', 'Giấu đi cho xong', 'Nói là do máy', 'Để cuối tuần mới nói'], '報告 (báo cáo) ngay cả lỗi nhỏ — giấu lỗi mới là điều người Nhật ghét nhất.'],
  ['Tàu bị dừng, chắc chắn bạn sẽ đến muộn. Nên làm gì?', ['Gọi điện báo trước giờ làm', 'Đến nơi rồi giải thích', 'Nhắn tin sau khi đến', 'Nghỉ luôn hôm đó'], '連絡 (liên lạc) trước giờ làm. Tàu trễ thì xin giấy xác nhận trễ tàu (遅延証明書) ở ga.'],
  ['Senpai giải thích nhanh quá, bạn không hiểu. Nên?', ['「すみません、もう一度お願いします」', 'Gật đầu cho qua', 'Làm theo ý mình', 'Để lát hỏi đồng nghiệp người Việt'], 'Hỏi lại ngay tốt hơn làm sai. 相談 (bàn bạc) là một phần của 報連相.'],
  ['Hết giờ, mọi người vẫn đang làm. Khi ra về bạn nói gì?', ['お先に失礼します', 'いただきます', 'いらっしゃいませ', 'おやすみなさい'], 'お先に失礼します = Tôi xin phép về trước. Người ở lại sẽ đáp: お疲れ様でした.'],
  ['5S ở nhà máy Nhật: 整理・整頓・清掃・清潔・…?', ['しつけ (躾 – kỷ luật)', 'しごと (仕事)', 'しずか (静か)', 'しんせつ (親切)'], '5S: Sàng lọc – Sắp xếp – Sạch sẽ – Săn sóc – Sẵn sàng (躾).'],
  ['Sáng dậy bị sốt 38 độ. Nên làm gì?', ['Gọi báo tổ trưởng trước giờ làm rồi đi khám', 'Cố đi làm, không nói ai', 'Nghỉ mà không báo', 'Đợi trưa mới nhắn tin'], 'Báo trước giờ làm: 「熱があるので、今日は休ませてください」.'],
  ['「ヒヤリハット」 là gì?', ['Sự cố suýt gây tai nạn — cần báo cáo', 'Mũ bảo hộ', 'Giờ nghỉ giải lao', 'Làm thêm giờ'], 'ヒヤリハット = giật mình, thót tim. Báo cáo để phòng tai nạn thật.'],
  ['Bạn xin nghỉ thứ Sáu, tổ trưởng đáp: 「ちょっと難しいですね…」. Nghĩa là?', ['Có lẽ chị ấy đang từ chối khéo', 'Chị ấy đồng ý', 'Chị ấy không hiểu', 'Chị ấy hỏi lý do'], 'Người Nhật hay từ chối gián tiếp: 「ちょっと…」, 「難しい」 thường là "không được".'],
  ['Trên phiếu lương có khoản 「社会保険」. Đó là?', ['Bảo hiểm xã hội (y tế, hưu trí…)', 'Tiền thưởng', 'Tiền phạt', 'Phí nghiệp đoàn'], '社会保険 gồm bảo hiểm y tế và lương hưu. Nhờ nó bạn chỉ trả 30% khi đi khám.'],
  ['Công ty đòi giữ hộ chiếu và thẻ lưu trú của bạn "cho an toàn". Điều này?', ['Không hợp pháp — có thể nhờ nghiệp đoàn hoặc OTIT tư vấn', 'Bình thường ở Nhật', 'Hợp pháp nếu có ký giấy', 'Nên cảm ơn công ty'], 'Luật cấm giữ hộ chiếu, thẻ lưu trú của TTS. OTIT (外国人技能実習機構) có tư vấn bằng tiếng Việt.'],
  ['Bị bắt làm thêm giờ nhưng không được trả lương. Nên làm gì?', ['Ghi chép giờ làm, hỏi nghiệp đoàn / Thanh tra lao động', 'Im lặng chịu đựng', 'Bỏ trốn khỏi công ty', 'Đánh nhau với quản lý'], 'Ghi giờ làm mỗi ngày. Có thể liên hệ 労働基準監督署 (Thanh tra lao động).'],
  ['「朝礼」 là gì?', ['Buổi họp ngắn đầu giờ sáng', 'Bữa sáng của công ty', 'Giờ nghỉ buổi sáng', 'Tăng ca buổi sáng'], '朝礼 (ちょうれい): họp đầu ngày, thông báo công việc và lưu ý an toàn.'],
  ['Bạn rất mệt, đồng nghiệp hỏi 「大丈夫？」. Nên trả lời?', ['Nói thật: 「ちょっと体調が悪いです」', 'Nói 「大丈夫です」 dù không ổn', 'Im lặng', 'Bỏ về luôn'], 'Nói thật tình trạng sức khỏe giúp tránh tai nạn — đó cũng là 報連相.'],
  ['「指差呼称」 (chỉ tay hô to) để làm gì?', ['Xác nhận an toàn, giảm sai sót', 'Chào hỏi', 'Gọi người khác', 'Báo hết giờ'], 'Chỉ tay + hô 「ヨシ！」 giúp tập trung, giảm sai sót đáng kể — đường sắt Nhật dùng cách này từ lâu.'],
  ['Nhận phiếu lương, nên kiểm tra gì?', ['Giờ làm, tiền tăng ca và các khoản bị trừ', 'Chỉ cần xem tổng tiền', 'Không cần kiểm tra', 'Hỏi bạn bè lương bao nhiêu'], 'Kiểm tra 給与明細 mỗi tháng để phát hiện sai sót kịp thời.'],
];

const FACTORY = [
  ['Trước khi vào khu sản xuất thực phẩm phải làm gì?', ['Rửa tay, sát khuẩn, đội mũ trùm, lăn bụi quần áo', 'Chỉ cần rửa tay', 'Đeo nhẫn và đồng hồ', 'Mang điện thoại vào'], 'Vệ sinh cá nhân là bước bắt buộc để chống lẫn dị vật và vi khuẩn.'],
  ['Thấy một sợi tóc trong sản phẩm. Nên?', ['Loại sản phẩm ra và báo tổ trưởng', 'Nhặt tóc ra rồi cho đi tiếp', 'Kệ, không ai biết', 'Ăn thử xem'], '異物混入 (lẫn dị vật) là lỗi nghiêm trọng — phải báo để tìm nguyên nhân.'],
  ['「賞味期限」 là gì?', ['Hạn dùng ngon nhất', 'Hạn sử dụng an toàn', 'Ngày sản xuất', 'Giá bán'], '賞味期限 = hạn ngon nhất; 消費期限 = hạn sử dụng an toàn (thường cho đồ tươi).'],
  ['Nhiệt kế kho lạnh chỉ 12°C, quy định là dưới 10°C. Nên?', ['Báo ngay cho quản lý', 'Tự chỉnh rồi im lặng', 'Kệ', 'Ghi 10°C vào sổ'], 'Ghi sai số liệu là gian lận. Báo ngay để xử lý hàng trong kho.'],
  ['「異物混入」 nghĩa là?', ['Lẫn dị vật vào sản phẩm', 'Hết nguyên liệu', 'Máy hỏng', 'Đóng gói sai'], '異物混入 (いぶつこんにゅう) = lẫn dị vật.'],
  ['Vì sao phải vệ sinh dây chuyền khi đổi sang sản phẩm khác?', ['Tránh lẫn chất gây dị ứng (アレルゲン)', 'Cho dây chuyền đẹp', 'Để tiết kiệm nước', 'Chỉ là thói quen'], 'Tôm, cua, trứng, sữa, lúa mì… lẫn sang sản phẩm khác có thể gây sốc phản vệ.'],
  ['Bị đứt tay nhẹ khi đang làm. Nên?', ['Báo tổ trưởng, băng lại, đeo găng, không để máu dính sản phẩm', 'Mút vết thương rồi làm tiếp', 'Giấu đi', 'Bỏ về luôn'], 'Báo cáo cả tai nạn nhỏ; sản phẩm có thể bị nhiễm bẩn.'],
  ['「先入れ先出し」 là nguyên tắc gì?', ['Hàng nhập trước thì xuất trước', 'Hàng mới xuất trước', 'Xuất ngẫu nhiên', 'Chỉ nhập không xuất'], 'FIFO — tránh để hàng cũ quá hạn trong kho.'],
  ['Bạn bị tiêu chảy, buồn nôn. Có nên vào khu sản xuất không?', ['Không — báo tổ trưởng, không tiếp xúc thực phẩm', 'Có, đeo khẩu trang là được', 'Uống thuốc rồi vào', 'Có, nhưng không nói'], 'Có thể là ngộ độc / norovirus — lây qua thực phẩm rất nhanh.'],
  ['Máy đóng gói kêu tiếng lạ. Nên?', ['Dừng máy theo quy trình và báo', 'Thò tay vào kiểm tra', 'Tăng tốc cho xong', 'Kệ'], 'Tuyệt đối không thò tay vào máy đang chạy.'],
  ['Tháo trang sức khi làm việc vì?', ['Tránh rơi vào sản phẩm và bị kẹt máy', 'Sợ mất', 'Theo sở thích tổ trưởng', 'Không cần tháo'], 'Nhẫn, khuyên tai, đồng hồ đều là nguồn dị vật.'],
  ['Một chiếc onigiri rơi xuống sàn. Xử lý thế nào?', ['Bỏ vào thùng hủy', 'Nhặt lên cho lại dây chuyền', 'Thổi bụi rồi dùng tiếp', 'Mang về ăn'], 'Sản phẩm rơi là hàng hủy, không được đưa lại dây chuyền.'],
  ['「品質管理」 là gì?', ['Quản lý chất lượng', 'Quản lý nhân sự', 'Quản lý kho', 'Quản lý tài chính'], '品質管理 (ひんしつかんり) = quản lý chất lượng (QC).'],
  ['「HACCP」 là gì?', ['Hệ thống quản lý an toàn thực phẩm theo điểm kiểm soát tới hạn', 'Tên một loại máy', 'Tên công ty', 'Một loại bảo hiểm'], 'Từ 2021, mọi cơ sở thực phẩm ở Nhật phải áp dụng HACCP.'],
];

const FARM = [
  ['Dâu tây nên hái khi nào?', ['Khi quả đỏ đều gần tới cuống', 'Khi quả còn trắng', 'Khi nửa đỏ nửa xanh', 'Khi đã thâm mềm'], 'Dâu không chín thêm sau khi hái — phải hái đúng độ chín.'],
  ['Cầm dâu khi hái thế nào?', ['Cầm nhẹ phần cuống, không bóp quả', 'Bóp chặt quả', 'Kéo thật mạnh', 'Lắc cây cho rụng'], 'Quả dâu rất dễ dập — dập là mất giá.'],
  ['Vì sao thường thu hoạch vào sáng sớm?', ['Trời mát, quả cứng, giữ tươi lâu', 'Để kịp ngủ trưa', 'Vì luật quy định', 'Không có lý do'], 'Nhiệt độ thấp giúp quả giữ độ tươi khi vận chuyển.'],
  ['Trong nhà kính 38°C, bạn thấy chóng mặt. Nên?', ['Báo người phụ trách, uống nước muối, nghỉ chỗ mát', 'Cố làm tiếp', 'Uống nước tăng lực', 'Cởi áo phơi nắng'], 'Dấu hiệu say nắng (熱中症) — có thể nguy hiểm tính mạng.'],
  ['Khi phun thuốc bảo vệ thực vật cần?', ['Đồ bảo hộ, và chờ đủ thời gian cách ly mới hái', 'Không cần bảo hộ', 'Hái ngay sau khi phun', 'Phun lúc gió to cho nhanh'], 'Thời gian cách ly đảm bảo dư lượng thuốc an toàn cho người ăn.'],
  ['「農薬」 là gì?', ['Thuốc bảo vệ thực vật', 'Phân bón', 'Hạt giống', 'Nước tưới'], '農薬 (のうやく) = thuốc BVTV; 肥料 (ひりょう) = phân bón.'],
  ['Thả ong trong nhà kính để làm gì?', ['Thụ phấn cho hoa dâu', 'Lấy mật ong', 'Đuổi sâu', 'Trang trí'], 'Không có ong thụ phấn, quả dâu sẽ méo mó.'],
  ['Thấy quả bị mốc xám. Nên?', ['Hái bỏ riêng ra, không để lẫn quả tốt', 'Để lẫn vào thùng', 'Bán giảm giá', 'Rửa nước rồi xếp'], 'Nấm mốc lây rất nhanh sang quả khác.'],
  ['Xếp dâu vào hộp thế nào?', ['Xếp nhẹ, cùng cỡ, không chồng đè', 'Đổ đầy cho nhanh', 'Ấn chặt cho vừa', 'Trộn lẫn cỡ to nhỏ'], 'Hình thức quả quyết định giá bán ở Nhật.'],
  ['Bạn chưa được hướng dẫn lái máy kéo nhỏ. Có nên tự lái?', ['Không — phải được hướng dẫn và cho phép', 'Được nếu cẩn thận', 'Thử lúc vắng người', 'Nhờ bạn lái hộ'], 'Tai nạn máy nông nghiệp là nguyên nhân tử vong hàng đầu trong nông nghiệp Nhật.'],
  ['「出荷」 nghĩa là?', ['Xuất hàng, giao hàng', 'Thu hoạch', 'Nhập hàng', 'Trả hàng'], '出荷 (しゅっか) = xuất hàng; 収穫 (しゅうかく) = thu hoạch.'],
  ['Mưa đá làm rách mái nilon nhà kính. Nên?', ['Báo chủ trang trại, không tự trèo lên khi chưa an toàn', 'Trèo lên vá ngay', 'Kệ', 'Về nhà'], 'Làm việc trên cao khi thời tiết xấu rất nguy hiểm.'],
  ['「収穫」 nghĩa là?', ['Thu hoạch', 'Tưới nước', 'Gieo hạt', 'Bón phân'], '収穫 (しゅうかく) = thu hoạch.'],
  ['Dụng cụ cắt cuống dâu dùng xong nên?', ['Vệ sinh và cất đúng chỗ', 'Để lại trên luống', 'Mang về phòng', 'Cho người khác mượn'], '整理整頓 — dụng cụ để bừa bãi dễ gây thương tích.'],
];

const BUILD = [
  ['Làm việc ở độ cao từ 2m trở lên phải?', ['Đeo đai an toàn toàn thân và móc vào điểm neo', 'Chỉ cần mũ bảo hộ', 'Bám tay cho chắc', 'Đi nhanh cho xong'], 'Từ 2022, đai toàn thân (フルハーネス) là bắt buộc ở nhiều công việc trên cao.'],
  ['「KY活動」 là gì?', ['Hoạt động dự đoán nguy hiểm trước khi làm', 'Kiểm tra sức khỏe', 'Họp tăng ca', 'Đếm vật tư'], 'KY = 危険予知 (きけんよち): cả nhóm cùng chỉ ra nguy hiểm trước khi bắt đầu.'],
  ['Có người đang làm việc ngay bên dưới chỗ bạn. Nên?', ['Không để rơi vật, báo và khoanh vùng cấm bên dưới', 'Kệ', 'Ném đồ xuống cho nhanh', 'Chỉ cần hét to'], 'Vật rơi từ trên cao là một trong những tai nạn chết người phổ biến nhất.'],
  ['Cẩu đang nâng hàng. Bạn nên?', ['Không đứng hoặc đi dưới hàng đang treo', 'Đứng dưới để đỡ', 'Chạy qua thật nhanh', 'Đứng dưới chụp ảnh'], 'Cáp có thể đứt bất cứ lúc nào.'],
  ['Gió mạnh, có giông. Làm việc trên cao thế nào?', ['Dừng theo chỉ thị của người phụ trách', 'Làm nhanh cho xong', 'Buộc chặt rồi làm tiếp', 'Tự quyết'], 'Gió từ 10m/s trở lên thường phải dừng làm việc trên cao.'],
  ['「玉掛け」 là công việc gì?', ['Móc cáp, buộc hàng để cẩu (cần chứng chỉ)', 'Đổ bê tông', 'Hàn điện', 'Sơn tường'], '玉掛け cần có chứng chỉ hoặc khóa đào tạo mới được làm.'],
  ['Dây quai mũ bảo hộ nên?', ['Cài chặt dưới cằm', 'Để lỏng cho thoáng', 'Không cần cài', 'Vắt ra sau đầu'], 'Không cài quai, mũ sẽ văng ra khi ngã.'],
  ['Thấy giàn giáo bị thiếu lan can. Nên?', ['Không sử dụng, báo ngay người phụ trách', 'Đi cẩn thận là được', 'Tự tháo chỗ khác lắp vào', 'Kệ'], 'Tự ý tháo lắp giàn giáo là vi phạm nghiêm trọng.'],
  ['Hô 「ヨシ！」 khi chỉ tay nghĩa là?', ['Đã xác nhận an toàn', 'Chào buổi sáng', 'Đồng ý tăng ca', 'Gọi nghỉ'], 'ヨシ！ = "OK!", xác nhận đã kiểm tra.'],
  ['Mùa hè nắng gắt ở công trường nên?', ['Uống nước và bổ sung muối định kỳ, nghỉ chỗ mát', 'Nhịn khát cho quen', 'Uống bia cho mát', 'Đợi trưa mới uống'], 'Say nắng ở công trường rất phổ biến vào tháng 7–8.'],
  ['Bị đinh đâm xuyên giày. Nên?', ['Báo, sơ cứu và đi khám (phòng uốn ván)', 'Rút ra làm tiếp', 'Giấu đi', 'Băng tạm làm tiếp'], 'Mọi chấn thương lao động phải báo — còn liên quan bảo hiểm tai nạn (労災).'],
  ['Vì sao mỗi sáng công trường tập ラジオ体操?', ['Khởi động cơ thể, phòng chấn thương', 'Cho vui', 'Để điểm danh lương', 'Vì sếp thích'], 'Khởi động giúp giảm chấn thương cơ, đặc biệt khi trời lạnh.'],
  ['Khi dùng máy mài cắt (グラインダー) cần?', ['Kính bảo hộ, kiểm tra đá cắt, không tháo nắp che', 'Không cần kính', 'Tháo nắp cho dễ cắt', 'Cắt hướng về phía người'], 'Đá cắt vỡ có thể văng như mảnh đạn.'],
  ['「労災」 là gì?', ['Bảo hiểm / tai nạn lao động', 'Ngày nghỉ lễ', 'Phụ cấp đi lại', 'Tiền thưởng'], '労災 (ろうさい): tai nạn lao động được bảo hiểm chi trả — TTS cũng được hưởng.'],
];

const mk = (arr, tag) => arr.map(([q, opts, ex], i) => ({ id: `${tag}-${i}`, tag, q, opts, ex }));
export const WORK_Q = {
  general: mk(GENERAL, 'gen'),
  factory: mk(FACTORY, 'fac'),
  farm: mk(FARM, 'farm'),
  build: mk(BUILD, 'bld'),
};
