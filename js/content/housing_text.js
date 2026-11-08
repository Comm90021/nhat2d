// Dữ liệu hội thoại và thông tin nhà đất tại văn phòng bất động sản thị trấn

export const AGENT = {
  intro: '「いらっしゃいませ！」 Chào mừng bạn ghé văn phòng bất động sản thị trấn. Bạn đang tìm phòng trọ hay muốn tìm hiểu thủ tục mua nhà đất, cứ để chúng tôi tư vấn tận tình nhé.',
  foreignerNo: [
    '「大変申し訳ありません…」 Chủ nhà là bác lớn tuổi, họ ngại trở ngại ngôn ngữ khi có việc khẩn cấp nên xin phép không nhận người nước ngoài ạ.',
    'Rất tiếc căn này chủ nhà có ghi chú 「外国人不可」 vì lo lắng việc phân loại rác và thói quen sinh hoạt khác biệt. Để tôi tìm cho bạn những căn khác chủ nhà cởi mở hơn nhé!',
    'Chủ nhà từ chối hồ sơ vì e ngại trường hợp bạn hết hạn visa hoặc về nước đột ngột thì không liên lạc được. Xin bạn đừng nản lòng, thị trấn mình vẫn còn nhiều chủ nhà rất thân thiện.',
  ],
  guarantor: 'Ở Nhật hiện nay hầu hết các căn nhà đều yêu cầu thông qua công ty bảo lãnh (保証会社) thay vì người bảo lãnh cá nhân. Họ sẽ thẩm định hồ sơ công việc và thu nhập (審査) của bạn, đứng ra đảm bảo thanh toán nếu có rủi ro, với mức phí đầu vào thường từ 50% đến 100% một tháng tiền nhà kèm phí gia hạn hàng năm.',
  initialCost: 'Chi phí vào nhà (初期費用) thường gấp 3 đến 5 lần tiền nhà một tháng, gồm: tiền cọc (敷金) được hoàn lại sau khi trừ phí hoàn trả mặt bằng, tiền lễ biếu chủ nhà (礼金) không hoàn lại, phí môi giới (仲介手数料 - tối đa 1 tháng tiền nhà cộng thuế), tiền nhà trả trước (前家賃), bảo hiểm cháy nổ (火災保険) bắt buộc và phí đổi khóa mới (鍵交換費用).',
  buyUsed: 'Quy trình mua căn hộ cũ (中古マンション) gồm đặt cọc hợp đồng mua bán, thẩm định vay và làm thủ tục thanh toán sang tên sổ đỏ. Bạn cần chuẩn bị tiền mặt cho phí môi giới 仲介手数料 (theo luật tối đa 3% giá nhà + 60.000 yên cộng thuế tiêu thụ), thuế đăng ký trước bạ (登録免許税) nộp cho nhà nước, cùng chi phí thù lao cho tư pháp thư sĩ (司法書士).',
  land: 'Mua đất (土地) rồi chọn nhà thầu địa phương (工務店) xây dựng trọn gói thường mất từ 6 tháng đến 1 năm từ khâu lên bản vẽ đến khi dọn vào ở. Trước khi khởi công, bắt buộc phải nộp hồ sơ xin thẩm tra xác nhận xây dựng (建築確認) để cơ quan thẩm quyền chứng nhận thiết kế đạt chuẩn an toàn phòng cháy và kháng chấn.',
  loan: 'Khi vay mua nhà (住宅ローン) tại Nhật, các ngân hàng thường yêu cầu người nước ngoài phải có vĩnh trú (永住権) hoặc kết hôn với người mang quốc tịch Nhật. Quá trình xét duyệt (審査) gồm vòng sơ loại và vòng thẩm định chính thức, xét rất kỹ thâm niên làm việc tại công ty, thu nhập hàng năm (年収), cùng lịch sử đóng thuế và bảo hiểm đầy đủ.',
  moveIn: [
    'Xe dỡ đồ vừa rời đi, căn phòng mới vẫn còn vương mùi gỗ và lớp sơn tươi mới. Bạn cẩn thận cầm túi quà nhỏ là hộp khăn mặt trang nhã sang gõ cửa hai nhà bên cạnh và nhà đối diện để chào hỏi (引っ越しの挨拶): 「これからお世話になります」. Sự lễ phép ban đầu sẽ giúp cuộc sống nơi ngõ xóm thêm phần thuận hòa.',
    'Sau một ngày dài mệt nhoài kê dọn tủ bàn và mắc rèm cửa, bạn tắm rửa sạch sẽ rồi mang hộp bánh ngọt chuẩn bị sẵn sang nhà bác tổ trưởng dân phố và hàng xóm liền vách. Nhận món quà chào nhà mới (引っ越しの挨拶), các bác mỉm cười thân thiện dặn dò ngày thu gom rác và chỉ cho bạn lối tắt ra ga. Cảm giác ấm áp xua tan nỗi bỡ ngỡ nơi ở mới.',
    'Những thùng các-tông đã được dỡ gần hết, ánh hoàng hôn dịu dàng tràn qua khung cửa sổ phòng khách. Bạn mang theo mấy chai nước giặt xinh xắn chia làm quà chào hàng xóm (引っ越しの挨拶) cho tầng trên và tầng dưới để xin lỗi trước nếu lỡ làm ồn trong lúc chuyển đồ. Nhận lại những cái cúi đầu chúc mừng nồng hậu, bạn mỉm cười nhận ra nơi đây đã thực sự là tổ ấm của mình.',
  ],
  houseDone: [
    'Ngày nhận bàn giao nhà mới (引き渡し) ngập tràn cảm xúc khi bác giám đốc xưởng thầu (工務店) cúi đầu trao tận tay bạn bộ chìa khóa cùng tập hồ sơ bảo hành móng và kết cấu. Bước chân vào phòng khách ngào ngạt hương gỗ bách Hinoki với ánh nắng ấm áp chiếu qua sàn gỗ, bạn thấy sống mũi cay cay khi nghĩ về chặng đường dài đã vượt qua. Ngôi nhà mơ ước của chính mình trên đất Nhật cuối cùng đã hoàn thành.',
    'Sau khi cùng kỹ sư kiểm tra tỉ mỉ lần cuối từng công tắc điện, đường ống nước và ký vào biên bản bàn giao (引き渡し), chiếc chìa khóa thông minh chính thức được kích hoạt thuộc về bạn. Đứng trước hiên nhà ngắm nhìn biển tên gia đình gắn bên cánh cửa mới, bao nhiêu giọt mồ hôi tăng ca những ngày đông buốt giá dường như đều được đền đáp xứng đáng.',
  ],
};

export const LISTING_NOTES = {
  '1K': [
    'Căn hộ 1K khép kín với khu bếp tách biệt khỏi phòng ngủ bằng cửa lùa, phù hợp cho người sống một mình thích không gian yên tĩnh và tiết kiệm chi phí.',
    'Thiết kế 1K gọn gàng tầm 20m², tiền thuê mềm và chỉ mất vài phút đi bộ ra bến xe buýt của thị trấn.',
    'Phòng 1K ban công hướng Nam ngập tràn ánh nắng, trang bị sẵn điều hòa hai chiều và máy hút mùi tiện dụng cho người đi làm.',
  ],
  '1LDK': [
    'Căn 1LDK rộng rãi có phòng khách liền bếp thoáng đãng, cực kỳ thích hợp cho các cặp đôi hoặc người độc thân muốn có không gian tiếp bạn bè.',
    'Không gian 1LDK hiện đại với bếp nấu chữ L đối diện bàn ăn, tách biệt hoàn toàn với phòng ngủ yên tĩnh phía sau.',
    'Căn hộ 1LDK tiện nghi có bồn tắm tự động hâm nóng và chỗ để máy giặt trong nhà, mang lại trải nghiệm sống tiện nghi vượt bậc.',
  ],
  '2LDK': [
    'Căn hộ 2LDK tiêu chuẩn với 2 phòng ngủ độc lập, lựa chọn tuyệt vời cho gia đình trẻ có con nhỏ hoặc hai đồng nghiệp rủ nhau thuê chung.',
    'Thiết kế 2LDK ấm cúng với phòng sinh hoạt chung rộng rãi, bếp đối mặt phòng khách giúp cả nhà vừa nấu ăn vừa trò chuyện vui vẻ.',
    'Căn góc 2LDK có hai mặt thoáng đón gió mát mẻ, tủ âm tường lớn ở mỗi phòng giúp cất gọn chăn đệm mùa đông.',
  ],
  '3LDK': [
    'Căn hộ 3LDK diện tích lớn đáp ứng trọn vẹn nhu cầu sinh hoạt cho gia đình từ 3 đến 5 người cùng chung sống thoải mái.',
    'Bố cục 3LDK thông minh kết hợp giữa hai phòng sàn gỗ hiện đại và một phòng tatami truyền thống rất ấm cúng khi tiếp khách.',
    'Căn hộ 3LDK ngập tràn ánh sáng tự nhiên với ban công dài, gần trường tiểu học và công viên trung tâm của thị trấn.',
  ],
  house: [
    'Nhà nguyên căn biệt lập (一戸建て) 2 tầng kèm chỗ đậu ô tô miễn phí trước sân, tha hồ sinh hoạt thoải mái mà không lo ảnh hưởng hàng xóm.',
    'Căn nhà riêng khung gỗ yên tĩnh có mảnh vườn nhỏ để bạn trồng vài luống rau thơm Việt Nam và đặt bàn trà ngắm cảnh.',
    'Ngôi nhà độc lập kiên cố trong khu dân cư thanh bình, không gian rộng rãi cho trẻ con thỏa thích chạy nhảy và gia đình sum họp cuối tuần.',
  ],
};

export const HOUSE_PLANS = [
  {
    id: 'compact',
    name: 'Nhà 2 tầng nhỏ gọn 2LDK',
    jp: 'コンパクト2階建て (2LDK)',
    desc: 'Mẫu nhà tối ưu diện tích cho các lô đất nhỏ hẹp; tầng 1 là phòng khách bếp ấm cúng, tầng 2 gồm 2 phòng ngủ riêng biệt giúp tiết kiệm chi phí xây dựng lẫn hóa đơn tiền điện.',
  },
  {
    id: 'family',
    name: 'Nhà gia đình tiêu chuẩn 3LDK',
    jp: 'ファミリー向け3LDK住宅',
    desc: 'Thiết kế 3LDK tiện nghi đáp ứng hoàn hảo cho gia đình 3–4 thành viên, với phòng khách liên thông bếp mở hiện đại, sân phơi đồ đón nắng và bãi đỗ xe ô tô thuận tiện trước cửa.',
  },
  {
    id: 'japanese',
    name: 'Nhà truyền thống kết hợp hiện đại',
    jp: '和風モダン住宅 (縁側・畳)',
    desc: 'Ngôi nhà mang đậm phong cách Nhật Bản với phòng khách lót chiếu tatami thơm hương cỏ igusa, cửa lùa shoji thanh nhã và hàng hiên engawa (縁側) đón gió nhìn ra khu vườn xanh mát.',
  },
];
