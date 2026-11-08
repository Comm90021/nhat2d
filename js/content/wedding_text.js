export const WEDDING_TIERS = {
  register: {
    name: 'Chỉ đăng ký kết hôn',
    jp: '入籍のみ',
    desc: 'Lựa chọn giản tiện và tiết kiệm chi phí nhất, chỉ tiến hành thủ tục pháp lý tại tòa thị chính địa phương.',
    scenes: [
      {
        title: 'Nộp đơn tại tòa thị chính',
        text: '{me} và {p} cùng nhau mang tờ đơn đăng ký kết hôn (婚姻届) đến nộp tại quầy hộ tịch của tòa thị chính (役所). Sau khi đối chiếu kỹ lưỡng hộ chiếu, thẻ lưu trú và giấy tờ tư pháp, bác cán bộ mỉm cười đóng dấu tiếp nhận và gửi lời chúc mừng hai bạn đã chính thức nên duyên vợ chồng. Cầm trên tay tờ giấy chứng nhận thụ lý (婚姻届受理証明書), cả hai nhìn nhau mỉm cười với niềm hạnh phúc bình dị.',
      },
      {
        title: 'Bữa cơm mừng ấm cúng',
        text: 'Rời tòa thị chính, hai bạn ghé vào quán ăn quen thuộc bên ga gọi hai bát mì nóng hổi để ăn mừng ngày trọng đại. Buổi tối trong căn phòng nhỏ, {me} và {p} mở cuộc gọi video về quê nhà khoe cặp nhẫn cưới giản dị và nhận lời chúc phúc rưng rưng từ hai bên gia đình. Dù không có váy cưới lộng lẫy hay tiệc tùng đông vui, sự gắn kết chân thành của người bạn đời đã là điều tuyệt vời nhất.',
      },
    ],
  },

  small: {
    name: 'Tiệc nhỏ thân mật',
    jp: '少人数ウェディング',
    desc: 'Bữa tiệc ấm cúng, tinh tế trong không gian riêng tư quây quần bên người thân và bạn bè gắn bó nhất.',
    scenes: [
      {
        title: 'Đón tiếp thân tình',
        text: 'Một phòng tiệc riêng ấm cúng tại nhà hàng đã được trang trí nhẹ nhàng bằng hoa tươi để chào đón {guests}. {me} diện bộ vest chỉn chu còn {p} rạng ngời trong chiếc váy cưới thanh lịch, cùng nhau cúi chào và đón nhận những lời chúc mừng nồng nhiệt. Không khí thân mật như một buổi sum họp gia đình lớn nơi đất khách giúp xua tan mọi khoảng cách và mệt mỏi thường ngày.',
      },
      {
        title: 'Cắt bánh và nâng ly chúc mừng',
        text: 'Dưới ánh nến dịu dàng, đôi uyên ương cùng nhau cắt chiếc bánh cưới nhỏ xinh và trao nhau lời hẹn ước gắn bó trăm năm. Tất cả quan khách cùng đứng dậy nâng ly hô vang 「乾杯！」, chúc cho tình yêu của hai bạn luôn bền chặt qua năm tháng. Màn hình nhỏ chiếu lại những bức ảnh kỷ niệm từ ngày đầu bỡ ngỡ sang Nhật đến khi tìm thấy nhau, mang lại nhiều tiếng cười và cả những giọt nước mắt xúc động.',
      },
      {
        title: 'Quà cảm ơn và lời chào tạm biệt',
        text: 'Trước khi tan tiệc, {me} và {p} tận tay trao cho từng vị khách món quà nhỏ (プチギフト) kèm tấm thiệp cảm ơn do chính tay hai bạn nắn nót viết từng dòng. Mọi người cùng đứng lại trước cửa nhà hàng chụp chung một tấm ảnh kỷ niệm rạng rỡ tiếng cười. Một ngày trọng đại khép lại thật bình yên, để lại dư vị ngọt ngào và sự tiếp sức vô giá từ những người bạn chân tình.',
      },
    ],
  },

  full: {
    name: 'Lễ cưới đầy đủ',
    jp: '挙式・披露宴',
    desc: 'Hôn lễ trọn vẹn và trang trọng với nghi thức lễ đường thiêng liêng kết hợp tiệc chiêu đãi truyền thống rộn rã.',
    scenes: [
      {
        title: 'Thề nguyền nơi thánh đường',
        text: 'Dưới vòm thánh đường nhà nguyện (チャペル) trang nghiêm vang vọng tiếng nhạc chuông ngân, {me} hồi hộp ngắm nhìn {p} thướt tha tiến vào lễ đường. Trước sự chứng kiến của mục sư và quan khách, cả hai cùng cất lời thề ước trăm năm và trao nhau cặp nhẫn cưới thiêng liêng. Khi cánh cửa lớn mở ra ngoài khoảng sân rực nắng, những cánh hoa tươi rợp trời tung bay chúc phúc cho đôi tân lang tân nương.',
      },
      {
        title: 'Khai tiệc chiêu đãi',
        text: 'Tại bàn lễ tân (受付), đại diện hai bên hân hoan đón tiếp {guests} và tiếp nhận những phong bì mừng cưới ご祝儀 trang trọng đính dây mizuhiki đỏ trắng mang lời cầu may. Tiệc 披露宴 chính thức mở màn trong sự vỗ tay chúc mừng giòn giã của đồng nghiệp, cấp trên và bạn bè thân thiết. Người dẫn chương trình trang trọng giới thiệu câu chuyện tình yêu vượt qua bao thử thách nơi xứ người của hai bạn.',
      },
      {
        title: 'Giao thoa văn hóa và tri ân',
        text: 'Sau phần nghi thức cắt bánh kem, {me} và {p} tạo bất ngờ lớn khi đổi trang phục (お色直し) xuất hiện trong tà áo dài truyền thống Việt Nam đầy duyên dáng. Giây phút màn hình lớn kết nối trực tiếp với quê nhà, cả hội trường lặng đi trước giọt nước mắt nghẹn ngào của bố mẹ hai bên qua màn hình điện thoại. {me} xúc động đọc lá thư tri ân công ơn sinh thành dưỡng dục bằng cả tiếng Việt lẫn tiếng Nhật, khiến ai nấy đều rưng rưng xúc động.',
      },
      {
        title: 'Tiễn khách và tiệc tăng hai',
        text: 'Kết thúc buổi lễ, cô dâu chú rể đứng ở cửa sảnh cúi đầu cảm tạ và tận tay trao những túi quà 引き出物 trân quý tới từng vị khách. Sau những nghi thức trang trọng của tiệc chính, nhóm bạn thân cùng kéo nhau tới quán izakaya tổ chức buổi tiệc tăng hai (二次会) rộn rã thâu đêm. Một ngày cưới hoàn hảo với đầy đủ mọi cung bậc cảm xúc, đánh dấu một khởi đầu mới rực rỡ và vững chắc tại xứ sở hoa anh đào.',
      },
    ],
  },
};

export const WEDDING_EVENTS = [
  {
    text: 'Đến lượt {me} phải bước lên bục phát biểu cảm ơn quan khách bằng tiếng Nhật, trong lòng vô cùng hồi hộp vì sợ phát âm sai.',
    choices: [
      ['Cố gắng nói bài phát biểu chuẩn mực đã dày công tập luyện suốt tuần', 'Sự chân thành và nỗ lực của bạn chạm đến trái tim mọi người, nhận về tràng pháo tay rộn rã.', +2],
      ['Phát biểu ngắn gọn bằng tiếng Nhật rồi xen lẫn vài câu tiếng Việt mộc mạc', 'Không khí trở nên gần gũi, quan khách mỉm cười ấm áp trước sự tự nhiên của bạn.', 0],
      ['Quá run nên quên bài và nói vấp váp liên tục', 'Bầu không khí hơi ngượng ngùng một chút, may nhờ {p} đứng bên nắm tay tiếp thêm dũng khí cho bạn.', -2],
    ],
  },
  {
    text: 'Đúng lúc chuẩn bị kết nối video trực tiếp để bố mẹ ở quê chia vui cùng quan khách, đường truyền mạng sảnh tiệc bỗng chập chờn.',
    choices: [
      ['Nhanh trí chuyển sang phát sóng từ gói dữ liệu 5G cá nhân tốc độ cao', 'Hình ảnh bố mẹ hiện lên rõ nét kèm tiếng cười hạnh phúc, cả hội trường cùng vỗ tay chúc mừng.', +2],
      ['Kiên nhẫn chờ kỹ thuật viên nhà hàng khởi động lại bộ định tuyến mạng', 'Sau vài phút chờ đợi, cuộc gọi cũng kết nối thành công trong tiếng thở phào nhẹ nhõm của mọi người.', 0],
      ['Luống cuống thao tác khiến cuộc gọi bị ngắt hẳn và mất nhiều thời gian', 'Cả hội trường tiếc nuối vì bỏ lỡ khoảnh khắc kết nối trọn vẹn cùng gia đình ở quê.', -2],
    ],
  },
  {
    text: 'Sau tiệc chính, nhóm bạn thân kéo {me} và {p} tới quán izakaya tổ chức 二次会 náo nhiệt và thách đố tham gia trò chơi.',
    choices: [
      ['Hết mình tham gia các trò đố vui và song ca một bài hát tình cảm cùng {p}', 'Cả hội quán bùng nổ tiếng cười và vỗ tay, tạo nên kỷ niệm vui nổ trời khó quên.', +2],
      ['Vui vẻ ngồi nhâm nhi trò chuyện và chia sẻ câu chuyện tình yêu cùng mọi người', 'Không khí tiệc diễn ra nhẹ nhàng, ấm cúng và đầy ắp những câu chuyện chân thành.', 0],
      ['Uống cạn nhiều ly rượu chúc mừng liên tiếp theo lời thách thức của bạn bè', 'Bạn bị say xỉn chóng mặt đến mức phải nhờ người dìu về phòng sớm, bỏ dở bữa tiệc.', -2],
    ],
  },
  {
    text: 'Vừa chuẩn bị bước ra khu vườn ngoài trời để chụp ảnh kỷ niệm thì mây đen kéo tới và trút xuống một cơn mưa rào bất chợt.',
    choices: [
      ['Mượn ngay những chiếc ô trong suốt đậm phong cách Nhật để chụp ảnh dưới mưa', 'Bộ ảnh cưới dưới mưa đẹp lung linh và lãng mạn bất ngờ, khiến ai nấy đều xuýt xoa.', +2],
      ['Chuyển toàn bộ nhóm vào chụp ảnh tại góc cầu thang trang trí hoa trong sảnh', 'Buổi chụp ảnh vẫn diễn ra đúng lịch trình dù không gian có phần hạn chế hơn ban đầu.', 0],
      ['Buồn bã thở dài và nài nỉ mọi người nán lại chờ tạnh mưa làm trễ giờ tiệc', 'Không khí chùng xuống đôi chút và làm xáo trộn thời gian biểu của sảnh tiệc.', -2],
    ],
  },
  {
    text: 'Một người bạn thân bối rối thì thầm nhờ bạn giúp vì lỡ bỏ tiền chẵn vào phong bì ご祝儀, điều vốn kiêng kỵ trong đám cưới Nhật.',
    choices: [
      ['Kín đáo đổi giúp người bạn tờ tiền mới số lẻ và vỗ vai động viên bạn an tâm', 'Người bạn thở phào nhẹ nhõm và vô cùng cảm kích trước sự tinh tế, chu đáo của bạn.', +2],
      ['Mỉm cười bảo bạn không cần bận tâm lễ nghi, tấm lòng đến chung vui là quý nhất', 'Người bạn cảm thấy nhẹ nhõm hơn hẳn và vui vẻ hòa mình vào buổi tiệc.', 0],
      ['Nhăn mặt nhắc nhở thẳng thắn khiến người bạn lúng túng đỏ mặt trước nhiều người', 'Bầu không khí giữa hai người có chút sượng sùng và ngượng ngập đầu giờ tiệc.', -2],
    ],
  },
  {
    text: 'Đến phần nghi lễ đổi trang phục (お色直し), bạn có cơ hội chuẩn bị một điều đặc biệt để dành tặng {p} trước toàn thể quan khách.',
    choices: [
      ['Bí mật khoác lên bộ áo dài truyền thống Việt Nam và tặng {p} một bó hoa rực rỡ', '{p} xúc động rơi nước mắt vì bất ngờ ngọt ngào, cả khán phòng vỗ tay tán thưởng nồng nhiệt.', +2],
      ['Thay bộ lễ phục trang nhã theo đúng tiến trình kịch bản đã lên từ trước', 'Nghi thức diễn ra trôi chảy, chỉn chu và đúng chuẩn mực truyền thống.', 0],
      ['Lúng túng chỉnh sửa trang phục quá lâu khiến chương trình bị kéo dài quá giờ quy định', 'Người dẫn chương trình phải vất vả nói đỡ và một số khách lớn tuổi tỏ vẻ thấm mệt.', -2],
    ],
  },
];

export const GUEST_LINES = [
  '「ご結婚おめでとうございます！」 Chúc hai bạn trăm năm hạnh phúc, luôn yêu thương và cùng nhau vượt qua mọi sóng gió nơi đất khách!',
  'Bác tổ trưởng xưởng mỉm cười vỗ vai chúc: 「お似合いの二人だね、末永くお幸せに！」, rồi dặn hai đứa phải luôn đồng lòng trong cuộc sống.',
  'Mấy anh em đồng hương người Việt nắm chặt tay bạn xúc động: "Thấy mày tìm được bến đỗ bình yên ở đất nước này, anh em mừng rớt nước mắt!"',
  'Bác chủ nhà trọ lớn tuổi trao món quà nhỏ và ân cần nhắn nhủ: 「二人で力を合わせて、温かい家庭を築いてくださいね」.',
  'Người bạn thân thời đi học nâng ly chúc phúc thật to: 「乾杯！これからも笑顔の絶えない毎日を！」, chúc hai bạn ngọt ngào trọn đời.',
  'Senpai kỳ cựu ở công ty gật đầu hài lòng: 「これからは二人三脚で、一歩ずつ進んでいってね」, chúc tổ ấm nhỏ luôn tràn ngập tiếng cười.',
  'Chị đồng nghiệp gửi gắm lời chúc chân thành qua tấm thiệp xinh xắn: 「お互いを思いやる気持ちを大切に、ずっと仲良くね」.',
  'Bác giám đốc đại diện xí nghiệp trang trọng phát biểu: 「お二人の前途が幸多きものであることを心よりお祈り申し上げます」.',
];
