// Đề thi trắc nghiệm chứng chỉ và đào tạo nghề thực tế tại Nhật Bản.
// Định dạng mỗi câu: ['câu hỏi', ['đáp án ĐÚNG (vị trí 0)', 'sai 1', 'sai 2', 'sai 3'], 'giải thích']

// 1. 普通自動車免許 (Bằng lái ô tô thông thường)
export const MENKYO = [
  [
    'Khi gặp biển báo hình tam giác ngược màu đỏ có chữ 「止まれ」, người lái xe phải làm gì?',
    [
      'Dừng hẳn xe trước vạch dừng và quan sát an toàn hai bên.',
      'Chỉ cần giảm tốc độ và quan sát nếu không thấy xe nào khác.',
      'Bấm còi cảnh báo rồi từ từ cho xe lăn bánh qua ngã tư.',
      'Dừng lại chỉ khi có xe khác hoặc người đi bộ đang tới gần.',
    ],
    'Biển 止まれ (Tomare) bắt buộc xe phải dừng hẳn bánh (一時停止) trước vạch dừng, dù đường hoàn toàn vắng xe.',
  ],
  [
    'Tốc độ tối đa theo luật định (法定速度) cho xe ô tô con trên đường thông thường là bao nhiêu?',
    [
      '60 km/h.',
      '50 km/h.',
      '70 km/h.',
      '40 km/h.',
    ],
    'Trên đường thông thường (一般道路) không có biển báo giới hạn riêng thì tốc độ tối đa theo luật định là 60 km/h.',
  ],
  [
    'Khi đến gần vạch kẻ cho người đi bộ (横断歩道) và có người đang đứng chờ sang đường, tài xế phải làm gì?',
    [
      'Dừng xe trước vạch để nhường đường cho người đi bộ.',
      'Nháy đèn pha và bấm còi báo hiệu người đi bộ đứng chờ.',
      'Giảm tốc độ từ từ và vòng tránh người đi bộ để đi tiếp.',
      'Tăng tốc chạy qua thật nhanh trước khi người ta bước qua.',
    ],
    'Theo Luật Giao thông Đường bộ Nhật Bản, phương tiện bắt buộc phải dừng lại nhường đường nếu có người chuẩn bị qua đường tại 横断歩道.',
  ],
  [
    'Quy định xử phạt đối với hành vi lái xe sau khi uống rượu bia (飲酒運転) ở Nhật Bản như thế nào?',
    [
      'Cấm tuyệt đối, từ 0,15 mg/l khí thở đã bị phạt nặng và treo bằng lái.',
      'Được phép lái xe nếu nồng độ cồn trong hơi thở đo được dưới 0,25 mg/l.',
      'Uống một lon bia thì vẫn được lái xe sau khi nghỉ ngơi tĩnh dưỡng 30 phút.',
      'Chỉ bị phạt tiền hành chính mức nhẹ nếu như không gây ra tai nạn giao thông.',
    ],
    'Nhật Bản xử lý cực kỳ khắt khe với 飲酒運転: nồng độ cồn từ 0,15 mg/l khí thở (酒気帯び運転) đã bị trừ 13–25 điểm (treo bằng), phạt tù đến 3 năm hoặc phạt tiền; từ 0,25 mg/l thì bị tước bằng.',
  ],
  [
    'Hành khách biết rõ tài xế đã uống rượu bia nhưng vẫn ngồi cùng xe (同乗) thì sẽ bị xử lý ra sao?',
    [
      'Bị xử phạt tù hoặc phạt tiền nặng, có thể bị tước bằng lái xe.',
      'Chỉ bị cảnh sát nhắc nhở tại chỗ và không chịu hình phạt nào.',
      'Chỉ bị phạt tiền nhẹ nếu không phải là chủ sở hữu chiếc xe đó.',
      'Hoàn toàn vô can vì trách nhiệm điều khiển xe thuộc về tài xế.',
    ],
    'Tội ngồi cùng xe (同乗罪) với tài xế say xỉn bị phạt tù đến 2–3 năm hoặc phạt tiền nặng, người có bằng lái còn bị tước bằng.',
  ],
  [
    'Khi đèn tín hiệu giao thông chuyển sang màu vàng (黄色), quy tắc điều khiển xe đúng luật là gì?',
    [
      'Phải dừng xe trước vạch dừng, trừ khi dừng lại gây nguy hiểm.',
      'Được phép đạp ga tăng tốc nhanh để vượt qua nút giao thông.',
      'Bấm còi cảnh báo các phương tiện khác rồi tiếp tục đi thẳng.',
      'Được phép rẽ phải nhưng tuyệt đối không được phép đi thẳng.',
    ],
    'Đèn vàng có nghĩa là dừng lại trước vạch dừng, chỉ được đi tiếp nếu đã tới quá sát vạch mà phanh gấp có thể gây nguy hiểm phía sau.',
  ],
  [
    'Khi lái xe ô tô vượt qua người đi xe đạp đang chạy cùng chiều phía trước, tài xế phải làm gì?',
    [
      'Giữ khoảng cách an toàn rộng rãi hoặc giảm tốc độ nếu đường hẹp.',
      'Bấm còi liên tục từ xa để người đi xe đạp tấp hẳn vào lề nhường.',
      'Duy trì nguyên tốc độ cũ và lách sát người đi xe đạp để vượt qua.',
      'Bật đèn khẩn cấp hazard rồi chạy song song ngang hàng với xe đạp.',
    ],
    'Khi vượt xe đạp hay người đi bộ, tài xế phải duy trì khoảng cách an toàn (thường từ 1,5m trở lên) hoặc giảm tốc độ nếu đường hẹp.',
  ],
  [
    'Trong phạm vi bao nhiêu mét tính từ góc nút giao nhau (交差点) thì cấm dừng và đỗ xe (駐停車禁止)?',
    [
      'Trong phạm vi 5 mét tính từ mép góc giao lộ.',
      'Trong phạm vi 10 mét tính từ mép góc giao lộ.',
      'Trong phạm vi 3 mét tính từ mép góc giao lộ.',
      'Trong phạm vi 15 mét tính từ mép góc giao lộ.',
    ],
    'Khu vực trong vòng 5m tính từ góc giao lộ (交差点の側端) hoặc chỗ đường cong bị khuất tầm nhìn là nơi cấm đỗ và cấm dừng xe.',
  ],
];

// 2. 玉掛け技能講習 (Khóa học kỹ năng móc cẩu)
export const TAMAKAKE = [
  [
    'Khi cẩu hàng bằng hai nhánh cáp, góc kẹp giữa hai sợi cáp (吊り角度) an toàn nhất là bao nhiêu?',
    [
      'Dưới 60 độ (không nên vượt quá 60 độ).',
      'Từ 90 độ đến 120 độ để cáp căng đều.',
      'Càng lớn càng tốt, tốt nhất khoảng 100 độ.',
      'Đúng 90 độ trong mọi trường hợp nâng hạ.',
    ],
    'Góc kẹp càng lớn thì lực căng tác dụng lên mỗi sợi cáp càng tăng vọt; tiêu chuẩn an toàn khuyến nghị giữ góc dưới 60°.',
  ],
  [
    'Thao tác nâng tải lên khỏi mặt đất khoảng 20–30 cm rồi dừng cẩu để kiểm tra an toàn gọi là gì?',
    [
      'Địa thiết (地切り – Jigiri).',
      'Hợp đồ (合図 – Aizu).',
      'Triệt khứ (撤去 – Tekkyo).',
      'Định vị (定位置 – Teiichi).',
    ],
    '地切り (Jigiri) là thao tác nhấc tải cách mặt đất 20–30cm, dừng lại kiểm tra độ cân bằng, phanh cẩu và dây móc trước khi nâng tiếp.',
  ],
  [
    'Ký hiệu tay chuẩn của người ra hiệu (合図者) để báo cho lái cẩu "Dừng khẩn cấp" (急停止) là gì?',
    [
      'Giơ cao cả hai tay lên và vẫy mạnh sang hai bên.',
      'Giơ ngón tay trỏ lên trời và xoay tròn theo chiều kim đồng hồ.',
      'Đưa hai bàn tay bắt chéo trước ngực rồi từ từ hạ thấp xuống.',
      'Vẫy một bàn tay nhẹ nhàng lên xuống ngang hông nhiều lần.',
    ],
    'Ký hiệu dừng khẩn cấp (急停止) là giơ cao hai tay và vẫy mạnh sang hai bên; bất kỳ ai thấy nguy hiểm đều có quyền ra hiệu lệnh này cho lái cẩu.',
  ],
  [
    'Khóa huấn luyện kỹ năng móc cẩu (玉掛け技能講習) cho phép người có chứng chỉ móc cẩu tải trọng bao nhiêu?',
    [
      'Không giới hạn tải trọng cẩu (kể cả từ 1 tấn trở lên).',
      'Chỉ được phép móc kiện hàng có tải trọng dưới 1 tấn.',
      'Chỉ được phép móc kiện hàng có tải trọng dưới 5 tấn.',
      'Chỉ được móc hàng từ 5 tấn trở lên đến dưới 10 tấn.',
    ],
    '玉掛け特別教育 chỉ được móc cẩu dưới 1 tấn, còn 技能講習 cho phép móc hàng không giới hạn tải trọng của thiết bị nâng.',
  ],
  [
    'Dây cáp thép (ワイヤロープ) dùng móc cẩu bắt buộc phải loại bỏ ngay trong trường hợp nào?',
    [
      'Đứt từ 10% số sợi thép con trở lên trong một bước bện.',
      'Có dính một lượng nhỏ dầu mỡ bám trên bề mặt sợi cáp.',
      'Đã sử dụng liên tục quá 3 tháng kể từ ngày mở cuộn mới.',
      'Bề mặt cáp chuyển sang màu xám sẫm do tiếp xúc không khí.',
    ],
    'Theo quy chuẩn an toàn lao động Nhật Bản, cáp đứt từ 10% số sợi con trên một bước bện hoặc giảm đường kính trên 7% phải loại bỏ.',
  ],
  [
    'Khi cẩu đang nâng hạ và di chuyển kiện hàng, công nhân móc cẩu tuyệt đối KHÔNG được đứng ở đâu?',
    [
      'Bên dưới kiện hàng hoặc giữa kiện hàng với chướng ngại vật.',
      'Khu vực thoáng đãng có tầm nhìn bao quát toàn bộ kiện hàng.',
      'Phía người lái cần cẩu có thể nhìn thấy rõ ràng mọi cử chỉ.',
      'Bên ngoài bán kính quay của cần cẩu và hướng di chuyển tải.',
    ],
    'Cấm đứng dưới hàng treo hoặc đứng ở góc kẹt giữa hàng và tường/vật cản vì hàng có thể rơi hoặc va đập đè chết người.',
  ],
  [
    'Khi móc cẩu các kiện hàng kim loại có cạnh sắc nhọn, người móc cẩu phải làm gì để bảo vệ dây cáp?',
    [
      'Chêm miếng lót đệm bảo vệ (当て物) vào các góc cạnh sắc.',
      'Quấn thêm nhiều lớp băng dính cách điện xung quanh sợi cáp.',
      'Bôi một lớp mỡ bò dày lên các cạnh sắc nhọn của kiện hàng.',
      'Dùng dây cáp có đường kính thật nhỏ để tăng độ uốn cong.',
    ],
    'Phải dùng 当て物 (tấm đệm bằng gỗ, cao su hoặc góc bảo vệ chuyên dụng) để tránh mép sắc cứa đứt cáp hoặc gập gãy tao cáp.',
  ],
  [
    'Ký hiệu tay chuẩn để ra hiệu cho tài xế cần cẩu "Hạ móc cẩu xuống" (巻き下げ) là gì?',
    [
      'Một tay chĩa ngón trỏ hướng xuống đất và xoay tròn.',
      'Một tay giơ ngón trỏ hướng lên trời và xoay vòng tròn.',
      'Giơ nắm đấm cao quá đầu rồi giữ nguyên vị trí cố định.',
      'Úp hai lòng bàn tay lại rồi vỗ vào nhau ba lần liên tục.',
    ],
    'Chĩa ngón trỏ xuống đất quay tròn là lệnh hạ móc (巻き下げ); chĩa ngón trỏ lên trời quay tròn là lệnh nâng móc (巻き上げ).',
  ],
];

// 3. アーク溶接特別教育 (Đào tạo đặc biệt hàn hồ quang)
export const YOSETSU = [
  [
    'Thiết bị tự động chống điện giật (自動電撃防止装置) trên máy hàn hồ quang xoay chiều có tác dụng gì?',
    [
      'Hạ điện áp không tải xuống mức an toàn (dưới 25V) khi chưa hàn.',
      'Tự động ngắt toàn bộ nguồn điện phân xưởng khi dây hàn bị rò rỉ.',
      'Tăng dòng điện hàn lên mức cực đại để đốt cháy que hàn nhanh hơn.',
      'Chuyển đổi dòng điện xoay chiều thành dòng điện một chiều ổn định.',
    ],
    'Khi không hàn (trạng thái không tải), thiết bị tự động giảm điện áp không tải (無負荷電圧) xuống dưới 25V để chống điện giật chết người.',
  ],
  [
    'Vì sao thợ hàn bắt buộc phải dùng mặt nạ hàn có kính lọc sáng (遮光面) khi hàn hồ quang?',
    [
      'Chống tia cực tím và hồng ngoại gây tổn thương mắt và da mặt.',
      'Giúp nhìn rõ các kích thước và ký hiệu ghi trên bản vẽ thiết kế.',
      'Ngăn gió lạnh từ quạt thông gió thổi vào làm khô cay giác mạc.',
      'Giúp giữ ấm khuôn mặt người thợ khi làm việc ngoài trời giá rét.',
    ],
    'Hồ quang hàn phát ra tia cực tím (UV) và tia hồng ngoại cực mạnh, gây viêm giác mạc (電気性眼炎) và bỏng da nếu không che chắn.',
  ],
  [
    'Khói hàn hồ quang (溶接ヒューム) có đặc tính nguy hại nào đối với sức khỏe của thợ hàn?',
    [
      'Chứa hạt oxit kim loại siêu mịn có thể gây ung thư và bệnh phổi.',
      'Chỉ là hơi nước bốc lên từ lớp thuốc bọc ngoài của que hàn điện.',
      'Hoàn toàn vô hại với sức khỏe nếu hàn trong phòng kín không có gió.',
      'Chỉ gây mùi khét khó chịu tạm thời chứ không đọng lại trong phổi.',
    ],
    '溶接ヒューム chứa mangan và oxit kim loại siêu nhỏ, hít phải lâu dài gây bệnh bụi phổi và nguy cơ ung thư (được xếp vào 特定化学物質).',
  ],
  [
    'Khi thay que hàn mới vào kìm hàn (溶接棒ホルダ), thao tác nào sau đây đảm bảo an toàn điện?',
    [
      'Mang găng tay da khô cách điện và không chạm vào phần dẫn điện.',
      'Dùng găng tay ướt mồ hôi cầm trực tiếp vào lõi kim loại que hàn.',
      'Kẹp kìm hàn vào nách để dùng cả hai tay thay que hàn cho nhanh.',
      'Chạm một tay vào bàn hàn bằng sắt để giữ thăng bằng cơ thể vững.',
    ],
    'Điện áp không tải của máy hàn đủ gây giật chết người; phải luôn đeo găng tay da khô cách điện và tuyệt đối không kẹp kìm hàn vào nách.',
  ],
  [
    'Để phòng ngừa hỏa hoạn khi hàn hồ quang tại xưởng sản xuất, điều nào sau đây là bắt buộc?',
    [
      'Dọn sạch vật dễ cháy xung quanh và chuẩn bị sẵn bình chữa cháy.',
      'Tưới thật nhiều nước ướt đẫm toàn bộ dây cáp điện và thân máy hàn.',
      'Đóng kín tất cả các cửa ra vào để ngăn tia lửa hàn văng ra ngoài.',
      'Xịt cồn khử trùng toàn bộ bề mặt sàn xung quanh vị trí chuẩn bị hàn.',
    ],
    'Xỉ hàn và tia lửa có thể bắn xa tới 10m; phải dọn sạch chất dễ cháy, che bạt chống cháy (スパッタシート) và bố trí bình chữa cháy cạnh nơi làm việc.',
  ],
  [
    'Trang phục bảo hộ lao động của thợ hàn hồ quang cần đáp ứng tiêu chuẩn nào sau đây?',
    [
      'Quần áo bằng vải cotton dày hoặc da, tay áo cài kín cổ tay.',
      'Quần áo bằng vải sợi nilon tổng hợp mỏng nhẹ và thoáng khí.',
      'Áo cộc tay kết hợp với tạp dề nhựa mỏng để thao tác đỡ vướng.',
      'Đi dép nhựa thông thoáng để dễ dàng lội qua các vũng nước đọng.',
    ],
    'Vải nilon hay sợi tổng hợp rất dễ bắt lửa và chảy nhựa dính chặt vào da; thợ hàn phải mặc đồ cotton chịu nhiệt hoặc đồ da chống tia lửa.',
  ],
  [
    'Khi phải hàn hồ quang bên trong bồn kim loại kín hẹp, quy định an toàn bắt buộc là gì?',
    [
      'Thông gió cưỡng bức liên tục và đo nồng độ oxy định kỳ.',
      'Đưa trực tiếp máy hàn vào đặt bên trong bồn cùng thợ hàn.',
      'Đóng chặt nắp bồn lại để tia lửa không lọt ra ngoài xưởng.',
      'Thổi khí oxy nguyên chất vào bồn để thợ hàn hít thở dễ hơn.',
    ],
    'Không gian kín dễ thiếu oxy (dưới 18%) hoặc ngạt khói hàn; phải đặt máy hàn bên ngoài, thông gió liên tục và cấm tuyệt đối bơm oxy vì gây cháy nổ.',
  ],
  [
    'Kìm hàn hồ quang (溶接棒ホルダ) đạt tiêu chuẩn an toàn bắt buộc phải có đặc điểm nào?',
    [
      'Có lớp vỏ bọc cách điện hoàn toàn ở tay cầm và thân kìm.',
      'Để lộ thanh đồng kim loại bên ngoài để thoát nhiệt nhanh.',
      'Quấn tạm vải ướt quanh tay cầm để giảm bớt độ nóng khi hàn.',
      'Được nối đất trực tiếp vào khung sườn của xe nâng trong xưởng.',
    ],
    'Kìm hàn đạt chuẩn (JIS) phải có vỏ bọc cách điện hoàn toàn để tay thợ hàn không bao giờ tiếp xúc với phần dẫn điện mang điện áp cao.',
  ],
];

// 4. 調理師 (Đầu bếp chuyên nghiệp)
export const CHORI = [
  [
    'Vi khuẩn ngộ độc thực phẩm Salmonella (サルモネラ菌) lây nhiễm phổ biến nhất qua nguồn nào?',
    [
      'Trứng gà sống và thịt gia cầm chưa nấu chín kỹ.',
      'Các loại đồ hộp đóng gói hút chân không để lâu.',
      'Cơm nguội và các món mì xào để qua đêm ở bếp.',
      'Các loại nấm rừng tự nhiên mọc hoang sau mưa.',
    ],
    'Salmonella ký sinh phổ biến ở đường ruột gia cầm và vỏ trứng gà sống; cần nấu chín thực phẩm trên 75°C trong tối thiểu 1 phút.',
  ],
  [
    '"Ba nguyên tắc vàng" trong phòng chống ngộ độc thực phẩm do vi khuẩn tại Nhật Bản là gì?',
    [
      'Không làm lây nhiễm, Không để gia tăng, Tiêu diệt vi khuẩn.',
      'Nấu thật nhanh, Nêm thật nhiều muối, Cho vào tủ đông ngay.',
      'Dùng nhiều dầu mỡ, Chiên ngập dầu sôi, Ăn ngay khi còn nóng.',
      'Rửa bằng nước nóng, Dùng xà phòng thơm, Phơi khô dưới nắng.',
    ],
    '3 nguyên tắc phòng ngộ độc vi khuẩn: 付けない (không dính - giữ sạch), 増やさない (không nhân lên - làm lạnh), やっつける (tiêu diệt - nấu chín).',
  ],
  [
    'Vi khuẩn Campylobacter (カンピロバクター) thường gây ngộ độc khi ăn món ăn nào chưa chín kỹ?',
    [
      'Thịt gà (như món gà tái, gan gà nướng chưa chín).',
      'Các loại rau cải trồng bằng phương pháp thủy canh.',
      'Đậu phụ trắng tươi mua từ siêu thị về ăn liền ngay.',
      'Bánh mì ngọt nướng tại các lò nướng bánh thủ công.',
    ],
    'Campylobacter là nguyên nhân gây ra số vụ ngộ độc vi khuẩn hàng đầu ở Nhật, thường do ăn thịt gà sống hoặc nấu chưa chín (như torisashi).',
  ],
  [
    '"Ba nhóm dưỡng chất đa lượng" (三大栄養素) cung cấp năng lượng cho cơ thể người gồm những chất nào?',
    [
      'Carbohydrate (đường bột), Protein (chất đạm), Lipid (chất béo).',
      'Vitamin nhóm B, Vitamin C hòa tan và các khoáng chất vi lượng.',
      'Nước tinh khiết, Chất xơ hòa tan và Canxi hữu cơ dễ hấp thu.',
      'Muối khoáng tự nhiên, Sắt sinh học và Acid folic thiết yếu.',
    ],
    '三大栄養素 gồm: 炭水化物 (carbohydrate - 4 kcal/g), たんぱく質 (protein - 4 kcal/g) và 脂質 (lipid - 9 kcal/g).',
  ],
  [
    'Để ngăn ngừa nhiễm khuẩn chéo (二次汚染), người đầu bếp cần sử dụng thớt cắt như thế nào?',
    [
      'Dùng thớt riêng biệt cho thịt sống, cá sống và thực phẩm ăn chín.',
      'Dùng chung một thớt gỗ duy nhất cho tất cả các loại nguyên liệu.',
      'Chỉ cần lau sơ qua bằng khăn ẩm giữa mỗi lần thái thịt và rau sống.',
      'Cắt thịt sống trước rồi dùng luôn mặt thớt đó để thái dưa chuột.',
    ],
    'Phân chia dao thớt riêng biệt theo màu sắc hoặc ký hiệu cho đồ sống và đồ chín là nguyên tắc cơ bản tránh lây vi khuẩn sang đồ ăn liền.',
  ],
  [
    'Độc tố thần kinh Tetrodotoxin trong cá nóc (フグ) có đặc tính nguy hiểm nào sau đây?',
    [
      'Bền nhiệt, đun sôi bình thường không thể phá hủy được chất độc.',
      'Tan biến hoàn toàn khi đem ngâm giấm chua đậm đặc trong 10 phút.',
      'Bị vô hiệu hóa dễ dàng nếu đem ướp muối thật mặn qua đêm ở bếp.',
      'Bị phân hủy hết nếu cho vào lò vi sóng quay ở nhiệt độ tối đa.',
    ],
    'Tetrodotoxin là độc tố thần kinh cực mạnh không bị phá hủy bởi nhiệt đun nấu thông thường; chỉ đầu bếp có giấy phép cá nóc (ふぐ調理師) mới được chế biến.',
  ],
  [
    'Vi khuẩn kỵ khí Clostridium botulinum (ボツリヌス菌) phát triển và sinh độc tố trong điều kiện nào?',
    [
      'Môi trường kín thiếu oxy như đồ hộp đóng kín hoặc hút chân không.',
      'Trên bề mặt lá rau xanh được phơi ráo ngoài trời nắng nhiều gió.',
      'Trong các món canh súp đang được đun sôi sùng sục trên bếp gas.',
      'Ở khay làm đá lạnh âm sâu bên trong ngăn đông của tủ lạnh lớn.',
    ],
    'Botulinum là vi khuẩn kỵ khí sinh nha bào chịu nhiệt, phát triển mạnh trong đồ hộp hoặc túi hút chân không bảo quản sai cách, sinh độc tố gây liệt cơ.',
  ],
  [
    'Quy chuẩn vệ sinh quy định nhiệt độ tâm (中心温度) khi gia nhiệt nấu thịt phải đạt mức nào?',
    [
      'Đạt tối thiểu 75°C và duy trì liên tục từ 1 phút trở lên.',
      'Chỉ cần bề mặt ngoài miếng thịt đổi màu xám là đạt chuẩn.',
      'Đạt tối thiểu 50°C trong khoảng thời gian ngắn tầm 15 giây.',
      'Đạt mức 100°C nhưng chỉ cần duy trì trong vòng 2 giây thôi.',
    ],
    'Tiêu chuẩn vệ sinh chế biến món ăn ở Nhật yêu cầu đo nhiệt độ tâm món thịt đạt tối thiểu 75°C trong ít nhất 1 phút để diệt vi khuẩn gây bệnh.',
  ],
];

// 5. 食品衛生責任者 (Người chịu trách nhiệm vệ sinh an toàn thực phẩm)
export const SHOKUEI = [
  [
    'Theo Luật Vệ sinh Thực phẩm Nhật Bản, các cơ sở kinh doanh ăn uống bắt buộc phải làm gì?',
    [
      'Bố trí ít nhất 1 người làm 食品衛生責任者 tại mỗi cơ sở.',
      'Chỉ quán ăn có từ 50 nhân viên trở lên mới cần cử người phụ trách.',
      'Chỉ khi nào bị thanh tra y tế phạt thì mới phải đăng ký cử người.',
      'Quán ăn gia đình quy mô nhỏ thì hoàn toàn được miễn nghĩa vụ này.',
    ],
    'Mọi cơ sở sản xuất, chế biến, kinh doanh thực phẩm có giấy phép đều bắt buộc phải chỉ định ít nhất 1 người chịu trách nhiệm vệ sinh thực phẩm (食品衛生責任者).',
  ],
  [
    'Khi nhân viên quán ăn có triệu chứng nôn mửa, tiêu chảy nghi do Norovirus thì phải xử lý ra sao?',
    [
      'Cho nghỉ làm việc tiếp xúc thực phẩm và đi khám y tế ngay.',
      'Đeo hai lớp găng tay ni lông rồi tiếp tục đứng nấu bình thường.',
      'Chuyển sang làm việc rửa chén bát và dọn bàn ăn thay vì nấu nướng.',
      'Cho uống một cốc nước trà nóng pha gừng rồi tiếp tục làm việc.',
    ],
    'Norovirus lây lan cực mạnh qua thực phẩm; nhân viên có biểu hiện nôn mửa, tiêu chảy tuyệt đối không được tham gia chế biến thực phẩm.',
  ],
  [
    'Khái niệm "CCP" (Điểm kiểm soát tới hạn) trong hệ thống quản lý HACCP có ý nghĩa là gì?',
    [
      'Công đoạn thiết yếu nhằm phòng ngừa, loại bỏ hoặc giảm thiểu mối nguy.',
      'Thời điểm chốt doanh thu và kiểm kê toàn bộ nguyên vật liệu cuối ngày.',
      'Vị trí lắp đặt camera an ninh để giám sát thao tác của nhân viên bếp.',
      'Khu vực quầy thu ngân dành riêng cho việc thanh toán tiền của khách.',
    ],
    'CCP (Critical Control Point) là bước then chốt có thể kiểm soát (như bước gia nhiệt, làm lạnh) để ngăn ngừa hoặc triệt tiêu mối nguy an toàn thực phẩm.',
  ],
  [
    'Khi khử trùng khu vực dính chất nôn mửa nghi nhiễm Norovirus, hóa chất nào có hiệu quả diệt virus?',
    [
      'Dung dịch Natri hypoclorit (nước Javel pha loãng đúng tỉ lệ).',
      'Cồn y tế 70 độ thông thường xịt trực tiếp thật nhiều lên vết bẩn.',
      'Nước xà phòng thơm pha với nước ấm xối rửa liên tục nhiều lần.',
      'Dung dịch giấm ăn pha loãng với nước máy sạch để khử mùi hôi tanh.',
    ],
    'Cồn (ethanol) không diệt được Norovirus hiệu quả; bắt buộc phải dùng dung dịch clo như Natri hypoclorit (次亜塩素酸ナトリウム) nồng độ thích hợp.',
  ],
  [
    'Theo quy trình HACCP tại quán ăn, việc kiểm tra nhiệt độ của tủ lạnh và tủ đông cần thực hiện thế nào?',
    [
      'Kiểm tra định kỳ hàng ngày và ghi chép đầy đủ vào sổ theo dõi.',
      'Chỉ cần kiểm tra mỗi tháng một lần vào ngày nộp báo cáo cho sếp.',
      'Chỉ cần dùng tay sờ xem có hơi lạnh phả ra không chứ không cần đo.',
      'Khi nào thực phẩm trong tủ có mùi thiu mới mở ra kiểm tra nhiệt độ.',
    ],
    'HACCP yêu cầu theo dõi và ghi chép (記録) nhiệt độ tủ lạnh (thường dưới 10°C) và tủ đông (dưới -15°C) hàng ngày để đảm bảo chuỗi cung ứng lạnh.',
  ],
  [
    'Mục đích chính của việc lưu mẫu thức ăn (検食の保存) tại các cơ sở chế biến thực phẩm là gì?',
    [
      'Cung cấp mẫu đối chứng cho cơ quan y tế kiểm nghiệm nếu có ngộ độc.',
      'Giữ lại để bếp trưởng nếm thử kiểm tra chất lượng trước bữa ăn sau.',
      'Tận dụng làm khẩu phần ăn ca sau cho nhân viên để tránh lãng phí đồ.',
      'Để lưu lại làm tư liệu so sánh giá thành món ăn giữa các mùa trong năm.',
    ],
    '検食 là việc lưu mẫu riêng từng món ăn (thường để ở -20°C trong ít nhất 2 tuần) nhằm truy tìm nguyên nhân vi khuẩn/virus khi xảy ra sự cố ngộ độc thực phẩm.',
  ],
  [
    'Thao tác rửa tay đúng chuẩn của nhân viên tiếp xúc thực phẩm cần tuân thủ điểm nào sau đây?',
    [
      'Rửa kỹ kẽ ngón tay bằng xà phòng và lau bằng khăn giấy dùng một lần.',
      'Chỉ cần xối nhanh hai bàn tay dưới vòi nước máy chảy mạnh trong 3 giây.',
      'Dùng chung một chiếc khăn bông ẩm treo ở bồn rửa cho toàn bộ ca làm.',
      'Rửa xà phòng sạch rồi lau khô hai tay trực tiếp vào tạp dề đang mặc.',
    ],
    'Phải xoa xà phòng kỹ các kẽ ngón tay, mu bàn tay, cổ tay tối thiểu 30 giây, xả sạch và lau bằng khăn giấy dùng 1 lần (ペーパータオル) để tránh tái nhiễm.',
  ],
  [
    'Khi tiếp nhận nguyên liệu thực phẩm (検収) từ nhà cung cấp giao đến, nhân viên quán cần kiểm tra gì?',
    [
      'Kiểm tra hạn sử dụng, độ nguyên vẹn bao bì và nhiệt độ lúc nhận hàng.',
      'Chỉ cần đếm đủ số lượng kiện hàng rồi ký nhận hóa đơn cho tài xế về.',
      'Bỏ qua việc kiểm tra hạn dùng nếu đó là đơn vị cung ứng quen nhiều năm.',
      'Nhận hàng xong để ngoài sân cho ráo nước rồi đợi đến chiều mới phân loại.',
    ],
    'Kiểm tra tiếp nhận (検収) là chốt chặn đầu tiên của HACCP: kiểm tra hạn dùng, tình trạng bao bì, nhiệt độ xe giao hàng để từ chối hàng không đạt chuẩn.',
  ],
];

// 6. 介護職員初任者研修 (Đào tạo ban đầu cho nhân viên chăm sóc điều dưỡng)
export const SHONIN = [
  [
    'Nguyên lý cốt lõi "Hỗ trợ tự lập" (自立支援) trong ngành điều dưỡng chăm sóc Nhật Bản có nghĩa là gì?',
    [
      'Hỗ trợ người cao tuổi tự làm những việc mà khả năng họ còn làm được.',
      'Làm thay toàn bộ tất cả mọi việc để người già được nghỉ ngơi an dưỡng.',
      'Để mặc người cao tuổi tự xoay xở một mình và không can thiệp giúp đỡ.',
      'Chỉ nhận chăm sóc cho những cụ già còn khả năng đi lại bình thường thôi.',
    ],
    '自立支援 không phải là bao bọc làm thay tất cả mà là khai thác năng lực tiềm tàng còn lại (残存能力) để người già tự chủ tối đa cuộc sống.',
  ],
  [
    'Để bảo vệ cột sống tránh đau lưng khi hỗ trợ người già di chuyển (Body mechanics), nhân viên nên làm gì?',
    [
      'Hạ thấp trọng tâm cơ thể và mở rộng hai bàn chân làm chân đế.',
      'Giữ thẳng hai đầu gối và chỉ cúi gập cong phần thắt lưng xuống.',
      'Đứng thật xa người già rồi dùng sức của hai cánh tay để kéo mạnh.',
      'Nín thở và dùng toàn bộ sức bật giật người già lên thật nhanh chóng.',
    ],
    'Nguyên lý ボディメカニクス yêu cầu hạ thấp trọng tâm (重心を低く), mở rộng chân đế (支持基底面を広く) và kéo sát người bệnh vào người mình.',
  ],
  [
    'Khi trò chuyện với người cao tuổi bị suy giảm thính lực (lãng tai), nhân viên chăm sóc nên làm gì?',
    [
      'Nhìn thẳng mặt cụ, nói chậm rãi, rõ ràng với âm điệu trầm.',
      'Đứng sát vào vành tai cụ và hét thật to bằng giọng cao vút.',
      'Đứng nói từ phía sau lưng cụ để tránh làm cụ bị mất tập trung.',
      'Không trò chuyện nữa mà chỉ dùng cử chỉ tay cho đỡ tốn sức.',
    ],
    'Người già nghe kém thường khó tiếp nhận âm tần số cao; nên nhìn đối diện để cụ nhìn khẩu hình, nói chậm, giọng trầm và rõ ràng.',
  ],
  [
    'Nhân viên chăm sóc chụp ảnh người già tại viện rồi đăng lên mạng xã hội cá nhân thì điều này thế nào?',
    [
      'Vi phạm nghiêm trọng nghĩa vụ bảo mật thông tin cá nhân (守秘義務).',
      'Được phép thoải mái nếu bài đăng nhận được nhiều lượt yêu thích.',
      'Hợp pháp nếu nhân viên đã dùng hình dán che bớt một phần khuôn mặt.',
      'Không sao cả nếu đó là bức ảnh chụp kỷ niệm trong bữa tiệc sinh nhật.',
    ],
    'Luật quy định nhân viên chăm sóc phải giữ bí mật thông tin (守秘義務); tự ý chụp và phát tán hình ảnh người dùng dịch vụ là vi phạm pháp luật.',
  ],
  [
    'Để phòng ngừa loét do tỳ đè (褥瘡 - Jokuso) cho người cao tuổi nằm liệt giường, biện pháp quan trọng là gì?',
    [
      'Đổi tư thế nằm định kỳ khoảng 2 giờ một lần và giữ da khô sạch.',
      'Để người bệnh nằm yên một tư thế suốt cả ngày để đỡ bị đau mỏi.',
      'Rắc thật nhiều phấn rôm thơm lên các vùng da đang bị đè ép ửng đỏ.',
      'Cho người bệnh nằm trên một tấm nệm mỏng trải trực tiếp dưới đất.',
    ],
    'Tỳ đè liên tục quá 2 giờ làm tắc mạch máu nuôi da gây hoại tử mô; cần đổi tư thế (体位変換) thường xuyên khoảng 2 giờ/lần và giữ da sạch sẽ.',
  ],
  [
    'Khi hỗ trợ người cao tuổi ăn cơm, tư thế ngồi nào sau đây giúp hạn chế nguy cơ bị nuốt sặc (誤嚥)?',
    [
      'Ngồi thẳng lưng trên ghế, đầu hơi cúi nhẹ cằm về phía trước.',
      'Nằm ngửa hoàn toàn trên giường và ngửa cổ ra phía sau thật thẳng.',
      'Ngửa mặt nhìn lên trần nhà để thức ăn dễ dàng trôi tuột xuống cổ.',
      'Vừa ăn vừa cười đùa nói to để tạo bầu không khí vui vẻ cho bữa ăn.',
    ],
    'Tư thế hơi gập cằm (あごを引く) giúp đóng kín nắp thanh quản, ngăn ngừa thức ăn và nước rơi nhầm vào khí quản gây sặc phổi (誤嚥).',
  ],
  [
    'Một cụ già mắc chứng sa sút trí tuệ (認知症) liên tục đòi "về nhà", nhân viên chăm sóc nên ứng xử thế nào?',
    [
      'Lắng nghe, thấu hiểu tâm trạng của cụ rồi khéo léo chuyển mối quan tâm.',
      'Khẳng định gay gắt rằng đây là viện dưỡng lão chứ không có nhà nào cả.',
      'Khóa chặt cửa phòng lại để ngăn cụ không thể đi lang thang ra ngoài.',
      'Phê bình cụ là già rồi mà không chịu hiểu chuyện và hay làm phiền người.',
    ],
    'Với người bị 認知症, không tranh cãi hay phủ nhận thực tế của họ; cần lắng nghe đồng cảm (受容・共感) rồi nhẹ nhàng hướng cụ sang hoạt động khác.',
  ],
  [
    'Khi hỗ trợ chọn trang phục mặc buổi sáng cho người cao tuổi, hành vi nào thể hiện sự tôn trọng đúng đắn?',
    [
      'Đưa ra 2–3 bộ quần áo phù hợp để người cao tuổi tự do lựa chọn bộ cụ thích.',
      'Tự ý chọn lấy bộ đồ mà nhân viên thấy đẹp nhất rồi mặc nhanh vào cho cụ.',
      'Bắt buộc cụ phải mặc đúng bộ đồng phục theo quy định chung của cơ sở.',
      'Mặc đại bất kỳ chiếc áo nào lấy được đầu tiên từ trong ngăn kéo tủ đồ ra.',
    ],
    'Tôn trọng quyền tự quyết (自己決定の尊重) từ việc nhỏ nhất như chọn quần áo giúp người cao tuổi giữ gìn phẩm giá và cảm giác tự chủ cuộc sống.',
  ],
];

// 7. 介護福祉士 (Nhân viên chăm sóc phúc lợi chuyên nghiệp)
export const KAIGOF = [
  [
    'Theo Luật Bảo hiểm Chăm sóc (介護保険法) của Nhật Bản, người được bảo hiểm loại 1 (第1号被保険者) là ai?',
    [
      'Người từ đủ 65 tuổi trở lên sinh sống tại địa phương.',
      'Người từ đủ 40 tuổi đến 64 tuổi có tham gia bảo hiểm.',
      'Mọi công dân có quốc tịch Nhật Bản từ đủ 20 tuổi trở lên.',
      'Chỉ những người cao tuổi đang sinh sống tại viện dưỡng lão.',
    ],
    '第1号被保険者 là người từ 65 tuổi trở lên; còn 第2号被保険者 là người từ 40 đến 64 tuổi có tham gia bảo hiểm y tế công lập.',
  ],
  [
    'Bước đầu tiên trong quy trình xây dựng Kế hoạch chăm sóc điều dưỡng (介護過程) là bước nào?',
    [
      'Đánh giá nhu cầu và thu thập dữ liệu (アセスメント - Assessment).',
      'Lập danh sách các mục tiêu chăm sóc cụ thể cần đạt được trong năm.',
      'Triển khai thực hiện ngay các kỹ thuật chăm sóc vệ sinh thân thể.',
      'Họp hội đồng chuyên môn để đánh giá kết quả chăm sóc sau 6 tháng.',
    ],
    '介護過程 bắt đầu bằng アセスメント (Assessment - thu thập và phân tích thông tin về cuộc sống, mong muốn của người bệnh), sau đó mới lập kế hoạch.',
  ],
  [
    'Triệu chứng vận động điển hình nào sau đây thường xuất hiện ở người mắc bệnh Parkinson (パーキンソン病)?',
    [
      'Run tay khi nghỉ ngơi, căng cứng cơ bắp và dáng đi lê bước nhỏ.',
      'Sốt cao co giật đột ngột kèm theo hiện tượng xuất huyết dưới da.',
      'Đau nhức dữ dội các khớp ngón tay và sưng đỏ mắt cá hai bên chân.',
      'Mất hoàn toàn thị lực trong bóng tối kèm theo tiếng ù tai kéo dài.',
    ],
    'Bệnh Parkinson có 4 triệu chứng vận động chính: run khi nghỉ (安静時振戦), cứng đờ cơ (固縮), chậm vận động (無動) và rối loạn thăng bằng (姿勢反射障害).',
  ],
  [
    'Phân loại quốc tế về hoạt động, khuyết tật và sức khỏe (ICF) của WHO nhìn nhận con người theo hướng nào?',
    [
      'Tương tác đa chiều giữa tình trạng sức khỏe, môi trường và cá nhân.',
      'Chỉ tập trung thuần túy vào việc chữa trị dứt điểm căn bệnh y khoa.',
      'Quy chụp mọi khó khăn trong sinh hoạt là do khiếm khuyết của bản thân.',
      'Chỉ phân loại mức độ trợ cấp tài chính xã hội dựa theo thang tuổi tác.',
    ],
    'ICF xem xét người khuyết tật toàn diện, nhấn mạnh mối quan hệ tương hỗ giữa chức năng cơ thể, hoạt động, sự tham gia xã hội với các yếu tố môi trường.',
  ],
  [
    'Hành vi nào sau đây bị pháp luật Nhật Bản xếp vào diện giam hãm thể xác (身体拘束) bị nghiêm cấm?',
    [
      'Dùng dây vải buộc cố định tay chân người bệnh vào thành giường nằm.',
      'Dìu người cao tuổi đi dạo chậm rãi ngoài hành lang của viện dưỡng lão.',
      'Hướng dẫn người bệnh tự tập các động tác co duỗi ngón tay vào buổi sáng.',
      'Mời người cao tuổi cùng tham gia hoạt động văn nghệ tập thể tại phòng ăn.',
    ],
    'Trói buộc cơ thể (身体拘束) bị cấm ngặt; chỉ được áp dụng trong trường hợp bất khả kháng khi thỏa mãn đủ 3 điều kiện: cấp bách, không thể thay thế và tạm thời.',
  ],
  [
    'Khi hỗ trợ thay quần áo cho người bệnh bị liệt nửa người (片麻痺), nguyên tắc chuẩn xác là gì?',
    [
      'Cởi bên lành trước, mặc bên liệt trước (脱健着患).',
      'Cởi bên liệt trước, mặc bên lành trước (脱患着健).',
      'Luôn cởi và mặc bên lành trước trong mọi trường hợp.',
      'Luôn cởi và mặc bên liệt trước trong mọi trường hợp.',
    ],
    'Quy tắc 脱健着患 (Dak-ken Chaku-kan): Cởi bên lành trước (vì bên lành cử động linh hoạt dễ rút tay ra), Mặc bên liệt trước (để tránh kéo căng khớp bên yếu).',
  ],
  [
    'Khi người cao tuổi tiểu đường có biểu hiện vã mồ hôi lạnh, run rẩy do hạ đường huyết, cần xử lý thế nào?',
    [
      'Cho uống ngay nước đường hoặc ăn kẹo ngọt có chứa đường glucose.',
      'Tiêm bổ sung ngay một liều insulin nồng độ cao vào bắp tay của cụ.',
      'Bắt người bệnh nhịn ăn thêm vài tiếng để đưa đường huyết trở về mức thấp.',
      'Cho người bệnh uống một ly nước lọc nguội rồi bảo cụ nằm nghỉ yên tĩnh.',
    ],
    'Hạ đường huyết (低血糖) có thể gây hôn mê tử vong nhanh chóng; sơ cứu khẩn cấp là nạp ngay đường hấp thu nhanh (kẹo, nước đường) và báo nhân viên y tế.',
  ],
  [
    'Trong công tác chăm sóc phúc lợi, thuật ngữ "Advocacy" (権利擁護 - Quyền lợi ủng hộ) mang ý nghĩa gì?',
    [
      'Bảo vệ, bênh vực và đại diện cho quyền lợi chính đáng của thân chủ.',
      'Quản lý thay và toàn quyền định đoạt sổ tiết kiệm của người cao tuổi.',
      'Thay mặt gia đình ký vào các cam kết y tế nguy hiểm mà không cần hỏi cụ.',
      'Hòa giải các vụ tranh chấp quyền phân chia tài sản thừa kế trong dòng họ.',
    ],
    'Advocacy (権利擁護) là hành động đứng về phía đối tượng yếu thế để bảo vệ nhân quyền, phẩm giá và quyền lợi hợp pháp khi họ không thể tự bảo vệ mình.',
  ],
];

// 8. 第一種電気工事士 (Thợ điện loại 1)
export const DENKI1 = [
  [
    'Theo Pháp lệnh kỹ thuật điện lực Nhật Bản, điện áp xoay chiều (交流) mức "Cao áp" (高圧) được định nghĩa là gì?',
    [
      'Điện áp vượt quá 600V đến 7000V.',
      'Điện áp vượt quá 100V đến 600V.',
      'Điện áp vượt quá 1000V đến 10000V.',
      'Điện áp vượt quá 7000V trở lên.',
    ],
    'Quy định điện áp xoay chiều (交流): Hạ áp ≤600V; Cao áp >600V đến 7000V (lưới phân phối 6600V); Đặc biệt cao áp là >7000V.',
  ],
  [
    'Máy ngắt chân không VCB (真空遮断器) trong trạm biến áp cao thế 6600V có chức năng chính là gì?',
    [
      'Đóng cắt dòng điện phụ tải bình thường và cắt dòng ngắn mạch sự cố.',
      'Chỉ dùng để đo lường công suất tiêu thụ điện năng hàng tháng của nhà máy.',
      'Biến đổi trực tiếp điện áp cao thế 6600V thành điện áp dân dụng 100V.',
      'Tích trữ nguồn điện năng dự phòng để cấp điện khi hệ thống lưới bị mất.',
    ],
    'VCB (Vacuum Circuit Breaker) dập hồ quang trong chân không, đóng cắt an toàn cả dòng tải thông thường và ngắt dòng ngắn mạch cực lớn khi xảy ra sự cố chập điện.',
  ],
  [
    'Trong hệ thống tủ điện cao áp, máy biến dòng (CT - 変流器) có công dụng chính là gì?',
    [
      'Biến đổi dòng điện cao áp lớn thành dòng nhỏ (chuẩn 5A) để đo lường.',
      'Biến đổi điện áp cao thế 6600V thành điện áp thấp 110V cho đồng hồ đo.',
      'Lọc sạch các sóng hài bậc cao phát sinh từ các bộ biến tần công suất lớn.',
      'Bù công suất phản kháng để nâng cao hệ số công suất cos phi của hệ thống.',
    ],
    'CT (Current Transformer - 変流器) biến dòng điện lớn mạch cao thế thành dòng điện nhỏ chuẩn 5A cấp cho rơle bảo vệ và ampe kế; còn VT biến điện áp xuống 110V.',
  ],
  [
    'Quy tắc an toàn cốt lõi khi thao tác đóng mở dao cách ly DS (断路器) trong trạm biến áp là gì?',
    [
      'Chỉ được đóng mở khi mạch điện không có tải (máy ngắt CB đã ngắt).',
      'Dùng để dập hồ quang và cắt dòng điện ngắn mạch khi máy biến áp nổ.',
      'Phải đóng mở thật nhanh tay khi phụ tải đang hoạt động ở mức cực đại.',
      'Có thể đóng cắt tùy ý bất cứ lúc nào mà không cần tắt các thiết bị khác.',
    ],
    'DS không có bộ phận dập tắt hồ quang; nếu đóng mở khi đang có dòng tải chạy qua sẽ phóng tia hồ quang điện cực lớn gây chập nổ thiêu cháy người thao tác.',
  ],
  [
    'Trị số điện trở đất quy định cho nối đất loại A (A種接地工事) để bảo vệ vỏ thiết bị điện cao áp là bao nhiêu?',
    [
      'Điện trở tiếp địa tối đa là 10 Ω (Ohm).',
      'Điện trở tiếp địa tối đa là 100 Ω (Ohm).',
      'Điện trở tiếp địa tối đa là 500 Ω (Ohm).',
      'Điện trở tiếp địa tối đa là 50 Ω (Ohm).',
    ],
    'Tiêu chuẩn kỹ thuật điện Nhật quy định nối đất vỏ thiết bị cao áp (>600V) là A種接地工事 với điện trở đất không được vượt quá 10 Ω.',
  ],
  [
    'Rơle quá dòng OCR (過電流継電器) kết hợp với máy ngắt VCB trong trạm cao áp làm nhiệm vụ gì?',
    [
      'Phát hiện sự cố quá tải hoặc ngắn mạch để gửi tín hiệu cho máy ngắt nhảy.',
      'Tự động ổn định tần số của dòng điện luôn dao động quanh mức 50Hz hoặc 60Hz.',
      'Hạ nhiệt độ dầu tuần hoàn làm mát bên trong vỏ máy biến áp khi trời nắng gắt.',
      'Cảnh báo khi độ ẩm không khí bên trong khoang tủ điện hạ thế vượt quá ngưỡng.',
    ],
    'OCR (Overcurrent Relay) nhận tín hiệu dòng từ CT; khi dòng vượt quá trị số cài đặt do quá tải hoặc chập mạch, rơle sẽ đóng tiếp điểm kích cuộn cắt VCB ngắt điện.',
  ],
  [
    'Thiết bị chống sét van LA (避雷器 - Lightning Arrester) lắp đặt tại trạm biến áp có công dụng gì?',
    [
      'Xả xung quá điện áp do sét đánh lan truyền xuống đất để bảo vệ thiết bị.',
      'Thu hút sấm sét tự nhiên đánh vào trạm để sạc điện vào hệ thống ắc quy phụ.',
      'Đo lường chính xác cường độ dòng điện sét đánh trúng trạm trong mùa mưa bão.',
      'Chuyển hóa năng lượng của sét thành dòng điện xoay chiều cấp cho phụ tải nhẹ.',
    ],
    'LA (Lightning Arrester) giới hạn quá điện áp do sét hoặc đóng cắt gây ra bằng cách phóng dòng xung xuống đất, bảo vệ cách điện máy biến áp và thiết bị trạm.',
  ],
  [
    'Sau khi cắt điện trạm cao áp để bảo dưỡng, quy trình an toàn bắt buộc trước khi chạm vào dây dẫn là gì?',
    [
      'Dùng bút thử điện cao áp kiểm tra hết điện rồi kẹp tiếp địa ngắn mạch.',
      'Chỉ cần quan sát đèn báo pha trên mặt tủ đã tắt hết hay chưa rồi làm việc.',
      'Dùng mu bàn tay chạm thật nhanh vào thanh cái đồng để thử cảm giác điện thế.',
      'Đợi khoảng 1 phút sau khi ngắt dao cách ly là có thể an tâm chạm tay trần vào.',
    ],
    'Thao tác an toàn bất di bất dịch: Cắt điện -> Kiểm tra không còn điện bằng bút thử điện cao thế (検電器) -> Lắp bộ tiếp địa ngắn mạch lưu động (短絡接地器具).',
  ],
];
