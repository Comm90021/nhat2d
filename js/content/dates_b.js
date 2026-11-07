export const DATES_B = {
  matsuri: {
    name: 'Đi lễ hội mùa hè', jp: '夏祭り', icon: '🏮',
    events: [
      {
        text: 'Đám đông chen chúc trên con đường dẫn vào đền thờ. Giữa dòng người mặc yukata tấp nập, bạn thấy {npc} hơi loạng choạng vì bị xô đẩy.',
        choices: [
          ['Chủ động nắm chặt lấy tay {npc}: "Đi sát vào mình kẻo lạc đấy."', 'bold'],
          ['Hỏi han ân cần: "{npc} có sao không? Để mình đi phía ngoài che chắn cho nhé."', 'care'],
          ['Cười trêu: "Đi lọt thỏm giữa đám đông thế này, tí nữa lạc là mình phải bắc loa tìm {npc} đấy!"', 'fun'],
        ],
      },
      {
        text: 'Hai bạn dừng chân trước quầy vớt cá vàng bên đường. {npc} cầm chiếc vợt giấy mỏng manh ngập ngừng mãi chưa dám nhúng xuống chậu nước.',
        choices: [
          ['Cổ vũ nhẹ nhàng: "Đừng vội, cứ lựa lúc cá bơi chậm rồi nghiêng vợt mà vớt."', 'calm'],
          ['Ghé sát lại gần, cùng chạm tay vào cán vợt với {npc}: "Để hai đứa mình cùng vớt chú cá to nhất kia nhé."', 'sweet'],
          ['Hào hứng thách đố: "Cá vàng nhìn hiền thế thôi chứ nhanh lắm, đố {npc} vớt được một con trước khi rách giấy đấy!"', 'fun'],
        ],
      },
      {
        text: 'Mua được xâu bánh dango nướng và kẹo táo, bạn cùng {npc} tìm được một bậc thềm đá yên tĩnh dưới bóng đèn lồng đỏ.',
        choices: [
          ['Đưa khăn giấy cho {npc} rồi từ tốn nói: "Đi bộ nãy giờ mỏi chân rồi, ngồi nghỉ một chút cho lại sức nhé."', 'care'],
          ['Bẻ nửa que bánh đưa cho {npc}, mỉm cười: "Ăn miếng này đi, ở lễ hội cùng ăn chung mới thấy ngon."', 'sweet'],
          ['Thành thật tâm sự: "Những ngày làm việc vất vả xa quê, có những khoảnh khắc thảnh thơi thế này bên {npc} thật sự rất quý."', 'deep'],
        ],
      },
      {
        text: 'Tiếng nổ lớn vang lên trên bầu trời đêm, màn pháo hoa rực rỡ bừng sáng phản chiếu lung linh trong ánh mắt của {npc}.',
        choices: [
          ['Nghiêng đầu nhìn {npc}, khẽ thì thầm: "Pháo hoa đẹp thật, nhưng ánh mắt của {npc} lúc này còn đẹp hơn."', 'sweet'],
          ['Bất ngờ kéo {npc} lại gần hơn giữa tiếng pháo hoa rộn rã: "Đứng sát lại đây với mình ngắm cho rõ nào!"', 'bold'],
          ['Ngước nhìn bầu trời lung linh, bùi ngùi chia sẻ: "Ước gì sau này, mùa hè năm nào hai đứa mình cũng được cùng ngắm pháo hoa như thế này."', 'deep'],
        ],
      },
    ],
  },
  aquarium: {
    name: 'Thủy cung thành phố', jp: '水族館', icon: '🐬',
    events: [
      {
        text: 'Bước vào đường hầm kính vòm dưới nước, bạn thấy một chú cá đuối khổng lồ lướt qua trên đầu khiến {npc} tròn xoe mắt ngước nhìn đầy thích thú.',
        choices: [
          ['Chỉ tay lên vòm kính và bình tĩnh giải thích: "Đó là loài cá đuối gai độc, nhưng trong bể này chúng được chăm sóc rất ngoan."', 'calm'],
          ['Lén rút điện thoại chụp lại khoảnh khắc ngơ ngác đáng yêu của {npc}: "Biểu cảm của {npc} nhìn đáng yêu hệt như mấy chú rái cá vậy!"', 'fun'],
          ['Đứng cạnh bên, khẽ nghiêng người che bớt ánh đèn chói cho {npc}: "Cứ ngắm thoải mái nhé, mình đứng ngay sau lưng bảo vệ bạn."', 'care'],
        ],
      },
      {
        text: 'Đến khu vực hồ sứa huyền ảo với ánh đèn xanh lam dịu mát, không gian tĩnh lặng lạ thường khiến {npc} dường như chìm vào suy tư.',
        choices: [
          ['Lắng giọng chia sẻ: "Nhìn chúng lơ lửng vô ưu thấy lòng mình nhẹ nhõm hẳn. Ở bên {npc}, mình luôn thấy bình yên như thế."', 'deep'],
          ['Nắm nhẹ lấy những đầu ngón tay của {npc} trong ánh sáng mờ ảo: "Đẹp như trong một giấc mơ cổ tích vậy, chỉ muốn thời gian dừng lại thôi."', 'sweet'],
          ['Khẽ nhắc nhở: "Khu vực này sàn hơi tối và trơn, {npc} chú ý từng bước chân nhé."', 'care'],
        ],
      },
      {
        text: 'Buổi biểu diễn của cá heo chuẩn bị bắt đầu ở khán đài lớn. Hàng ghế đầu có biển cảnh báo sẽ bị bắn tung tóe nước, khiến {npc} phân vân chưa biết ngồi đâu.',
        choices: [
          ['Kéo tay {npc} ngồi ngay hàng ghế đầu: "Đã đi xem thì phải ngồi hàng đầu ướt sũng mới đã chứ!"', 'bold'],
          ['Cười bảo: "Ngồi lùi lại hai hàng cho an toàn, nhường phần tắm mát cho người khác nhé {npc}."', 'fun'],
          ['Chu đáo lấy áo mưa mỏng trong túi ra đưa cho {npc}: "Mình chuẩn bị sẵn áo mưa tiện lợi đây rồi, {npc} mặc vào là không lo bị ướt."', 'care'],
        ],
      },
      {
        text: 'Rời khỏi các khu trưng bày, hai bạn ghé qua cửa hàng lưu niệm ngập tràn thú bông chim cánh cụt. {npc} cầm một chú chim bông nhỏ mân mê không nỡ đặt xuống.',
        choices: [
          ['Dứt khoát cầm lấy chú chim bông mang ra quầy tính tiền tặng {npc}: "Thích thì để mình mua tặng, làm kỷ niệm cho ngày hôm nay nhé."', 'bold'],
          ['Chân thành nói: "Dù sau này có thế nào, nhìn món quà này mình mong {npc} sẽ luôn nhớ về chuyến đi hôm nay."', 'deep'],
          ['Cầm một con rái cá bông dí vào má {npc}: "Con này với {npc} cười giống nhau y đúc luôn này!"', 'fun'],
        ],
      },
    ],
  },
  shopping: {
    name: 'Mua sắm ở trung tâm thương mại', jp: 'ショッピングモール', icon: '🛍️',
    events: [
      {
        text: 'Ngay lối vào sảnh lớn của trung tâm thương mại, {npc} choáng ngợp nhìn bảng chỉ dẫn chi chít các cửa hiệu mà chưa biết nên ghé đâu trước.',
        choices: [
          ['Xem bản đồ rồi từ tốn vạch lộ trình: "Đừng lo, mình đi theo vòng tròn từ tầng dưới lên nhé, vừa thong thả vừa không lo bỏ sót quầy nào."', 'calm'],
          ['Chủ động khoác tay {npc}: "Hôm nay mình là hoa tiêu dẫn đường, {npc} chỉ việc đi theo thôi!"', 'bold'],
          ['Ân cần hỏi: "{npc} có muốn ghé tiệm cà phê nghỉ chân uống chút gì mát lạnh trước khi dạo quanh không?"', 'care'],
        ],
      },
      {
        text: 'Ghé vào một cửa hàng thời trang, bạn thấy {npc} ướm thử một chiếc áo len dáng rộng màu be rồi ngại ngùng hỏi xem có hợp không.',
        choices: [
          ['Khen ngợi ánh mắt rạng rỡ: "Màu này rất tôn da, {npc} mặc vào trông vừa dịu dàng vừa ấm áp lắm."', 'sweet'],
          ['Đùa vui: "Mặc chiếc này thì chuẩn phong cách người mẫu rồi, đi cạnh {npc} khéo người ta tưởng mình là vệ sĩ!"', 'fun'],
          ['Quan sát kỹ chất vải rồi góp ý thực tế: "Chất len dày dặn và đường may rất kỹ, mùa đông tới ở vùng này gió lạnh mặc đi làm hay đi chơi đều hợp."', 'calm'],
        ],
      },
      {
        text: 'Khu ẩm thực (food court) giờ trưa chật kín người tìm bàn, trên tay hai bạn là hai khay mì ramen nóng hổi khiến {npc} nhìn quanh đầy bối rối.',
        choices: [
          ['Nhanh nhẹn bước tới giữ một bàn vừa trống rồi vẫy {npc}: "Qua đây mau {npc} ơi, mình xí được chỗ đắc địa rồi này!"', 'bold'],
          ['Đỡ lấy khay đồ ăn trên tay {npc}: "Khay nóng lắm để mình bưng cho cả hai, {npc} đi tìm chỗ ngồi thoải mái đi."', 'care'],
          ['Cười bảo: "Chiến trường săn bàn giờ cao điểm gay cấn chẳng kém gì lúc tăng ca, chuẩn bị tinh thần tác chiến nhé {npc}!"', 'fun'],
        ],
      },
      {
        text: 'Trước tiệm tạp hóa phong cách Nhật Bản, bạn thấy {npc} chăm chú ngắm đôi móc khóa hình mèo may mắn làm thủ công rất tinh xảo.',
        choices: [
          ['Mua luôn đôi móc khóa và móc một chiếc vào balo của {npc}: "Mỗi đứa giữ một con nhé, xem như bùa may mắn của hai chúng mình."', 'sweet'],
          ['Bộc bạch chân thành: "Xa quê hương một mình, mình thấy may mắn lắm khi tìm được một người đồng hành ấm áp như {npc}."', 'deep'],
          ['Đọc dòng chữ trên móc khóa rồi giải thích: "Mèo giơ chân phải là cầu tài lộc, chân trái là cầu nhân duyên, con này giơ cả hai chân thì toàn vẹn rồi."', 'calm'],
        ],
      },
    ],
  },
  gym: {
    name: 'Tập gym cùng nhau', jp: 'スポーツジム', icon: '🏋️',
    events: [
      {
        text: 'Bước vào phòng tập thể hình với đủ loại máy móc hiện đại, bạn thấy {npc} nhìn dàn tạ nặng trịch mà có phần e dè, lúng túng.',
        choices: [
          ['Nhẹ nhàng động viên: "Mới đầu ai cũng bỡ ngỡ cả, mình qua khu khởi động nhẹ nhàng làm nóng cơ trước nhé {npc}."', 'calm'],
          ['Chỉnh lại găng tay rồi bước đi dứt khoát: "Để mình dẫn đầu mở đường, có mình ở đây thì {npc} không phải ngại ai hết!"', 'bold'],
          ['Đùa cho bớt căng thẳng: "Cứ coi mấy cục tạ này như mấy kiện hàng ở xưởng thôi, chúng mình khiêng quen rồi mà!"', 'fun'],
        ],
      },
      {
        text: 'Khi {npc} bước lên máy chạy bộ và bắt đầu tăng tốc, bạn nhận thấy nhịp thở và sải bước của người ấy có vẻ chưa đều đặn.',
        choices: [
          ['Bấm nút giảm tốc độ giúp {npc} rồi hướng dẫn: "Hít sâu bằng mũi, thở chậm bằng miệng nào, duy trì nhịp tim ổn định trước đã."', 'calm'],
          ['Đưa chai nước điện giải cho {npc}: "Chạy chậm lại chút đã nào, uống ngụm nước kẻo bị mất nước mệt người đấy."', 'care'],
          ['Chạy máy bên cạnh rồi vẫy tay trêu: "Bắt kịp mình không nào {npc}, ai chạy thua lát nữa phải mua nước đấy nhé!"', 'fun'],
        ],
      },
      {
        text: 'Sau bài tập căng thẳng, hai bạn ngồi bệt trên thảm tập để giãn cơ, những giọt mồ hôi lấm tấm trên trán {npc} và nhịp thở dần chậm lại.',
        choices: [
          ['Lấy khăn sạch thấm nhẹ mồ hôi trên trán cho {npc}: "Hôm nay {npc} nỗ lực lắm rồi, để mình giúp bạn thả lỏng cơ bắp chân nhé."', 'care'],
          ['Ngắm nhìn gương mặt mộc ửng hồng đầy sức sống của {npc}: "Lúc tập luyện nghiêm túc thế này, trông {npc} cuốn hút thật đấy."', 'sweet'],
          ['Trầm ngâm bộc bạch: "Mỗi ngày đi làm mệt mỏi chỉ muốn nằm, nhưng cùng {npc} rèn luyện thế này thấy bản thân có thêm nhiều động lực để cố gắng."', 'deep'],
        ],
      },
      {
        text: 'Rời phòng thay đồ bước ra sảnh chờ, {npc} than thở hai bắp chân bắt đầu mỏi nhừ và bước đi có phần khập khiễng.',
        choices: [
          ['Đỡ nhẹ tay {npc} rồi ghé vai: "Nếu mỏi quá thì cứ tựa vào vai mình mà bước, để mình đưa {npc} về tận phòng."', 'sweet'],
          ['Bật cười chọc ghẹo: "Mai dậy đảm bảo bước xuống giường như chim cánh cụt cho xem, cố lên chiến binh {npc} ơi!"', 'fun'],
          ['Bấm mua hai hộp sữa tươi từ máy bán hàng tự động: "Uống hộp này ngay đi {npc}, bổ sung protein và khoáng chất sẽ giúp cơ bớt nhức mỏi đấy."', 'care'],
        ],
      },
    ],
  },
  library: {
    name: 'Học cùng nhau ở thư viện', jp: '図書館', icon: '📚',
    events: [
      {
        text: 'Giữa không gian tĩnh lặng của thư viện thị trấn, {npc} mở cuốn giáo trình tiếng Nhật ra bàn rồi khẽ thở dài trước danh sách chữ Hán dày đặc.',
        choices: [
          ['Kéo ghế ngồi sát lại gần, chỉ vào từng bộ thủ: "Đừng nản, chữ Hán này tách ra nhìn sẽ rất dễ nhớ, để mình chỉ mẹo cho {npc}."', 'calm'],
          ['Ghé sát tai thì thầm dịu dàng: "Mỗi ngày học cùng {npc} vài trang thế này, khó mấy mình cũng thấy vui."', 'sweet'],
          ['Vẽ một hình ngộ nghĩnh bên lề cuốn vở nháp đẩy qua cho {npc}: "Nhìn mặt chữ Hán này giống ông sếp lúc cáu ghét chưa kìa!"', 'fun'],
        ],
      },
      {
        text: 'Bạn thấy {npc} với tay cố lấy một cuốn từ điển dày trên ngăn giá sách trên cao nhưng chiều cao hơi với không tới.',
        choices: [
          ['Bước ngay tới phía sau, vươn tay lấy cuốn sách xuống cho {npc}: "Để mình lấy cho, những việc cần chiều cao cứ giao hết cho mình."', 'bold'],
          ['Giữ chân thang chắc chắn rồi nhắc nhở: "Cẩn thận đấy {npc}, để mình lấy cái bục bước chân nhỏ cho bạn đứng lên cho an toàn."', 'care'],
          ['Bình tĩnh mỉm cười: "Quyển này xuất bản lâu rồi nên hơi nặng tay, để mình đỡ gáy sách cho bạn rút ra."', 'calm'],
        ],
      },
      {
        text: 'Ngồi học được hơn một tiếng, bạn thấy {npc} bắt đầu gà gật, đầu thỉnh thoảng gục xuống bàn vì cơn buồn ngủ ập đến sau tuần làm việc mệt mỏi.',
        choices: [
          ['Khẽ đưa bàn tay ra đỡ nhẹ lấy trán {npc} trước khi chạm mặt bàn: "Buồn ngủ rồi phải không? Cứ chợp mắt mười phút đi, mình trông chừng cho."', 'care'],
          ['Để mặc cho đầu {npc} tựa vào vai mình, mỉm cười lặng lẽ ngắm nhìn gương mặt say ngủ yên bình.', 'sweet'],
          ['Lấy đầu bút bi chọc nhẹ vào gò má {npc}: "Tỉnh táo lên nào sĩ tử, chuẩn bị thi đỗ chứng chỉ để đổi visa cơ mà!"', 'fun'],
        ],
      },
      {
        text: 'Ra khỏi thư viện lúc chiều muộn, đứng ở ban công lộng gió nhìn xuống quảng trường, {npc} tâm sự về những áp lực học tập và nỗi lo cho tương lai ở Nhật.',
        choices: [
          ['Lắng nghe chân thành rồi đáp: "Sang đây ai cũng có lúc chông chênh, nhưng có {npc} cùng đồng hành và nỗ lực, mình thấy vững lòng hơn rất nhiều."', 'deep'],
          ['Tự tin nắm lấy bàn tay {npc}: "Cứ yên tâm, tương lai dẫu có khó khăn thế nào thì chúng mình cũng sẽ cùng nhau vượt qua."', 'bold'],
          ['Từ tốn động viên: "Học ngoại ngữ là một chặng đường dài, chỉ cần mỗi ngày tiến bộ một chút như hôm nay là {npc} đã rất giỏi rồi."', 'calm'],
        ],
      },
    ],
  },
  gamecenter: {
    name: 'Game center', jp: 'ゲームセンター', icon: '🕹️',
    events: [
      {
        text: 'Tiếng nhạc điện tử sôi động bủa vây xung quanh, bạn thấy {npc} đứng trước máy gắp thú bông nhìn chú gấu bông xinh xắn bên trong mà mắt sáng rực.',
        choices: [
          ['Đút ngay đồng 100 yên vào khe máy, gạt cần điều khiển: "Đứng lùi lại chiêm ngưỡng tay gắp siêu đẳng, mình sẽ rinh con gấu này về cho {npc}!"', 'bold'],
          ['Nhìn kỹ vị trí móc gắp rồi phân tích: "Càng gắp bên trái lực giữ hơi yếu, {npc} phải đẩy lệch về phía mép rơi thì mới rơi được."', 'calm'],
          ['Mỉm cười ngọt ngào: "Nếu gắp trúng thì gấu thuộc về {npc}, còn nếu trượt thì {npc} phải đền cho mình một nụ cười đấy nhé."', 'sweet'],
        ],
      },
      {
        text: 'Hai bạn cùng ngồi vào buồng lái của máy đua xe tốc độ cao. {npc} nắm chặt vô lăng với vẻ mặt quyết tâm không chịu thua.',
        choices: [
          ['Nhấn ga gầm rú động cơ rồi thách thức: "Đừng có nhìn gương chiếu hậu nhé {npc}, mình sắp vượt lên dẫn đầu rồi đây!"', 'fun'],
          ['Liếc nhìn vẻ mặt tập trung đáng yêu của {npc}: "Thắng thua không quan trọng, nhìn {npc} vui vẻ thế này là mình mãn nguyện rồi."', 'sweet'],
          ['Nhắc nhở qua loa tai nghe: "Đoạn cua gắt phía trước cua sớm kẻo va vào rào chắn đấy {npc} ơi."', 'calm'],
        ],
      },
      {
        text: 'Đứng trước máy gõ trống taiko, bản nhạc hoạt hình quen thuộc vang lên rộn rã khiến cả bạn và {npc} đều hào hứng cầm dùi gõ theo nhịp.',
        choices: [
          ['Gõ trống thoăn thoắt, thỉnh thoảng liếc nhìn {npc} cười toe toét: "Tay mình dẻo như thợ đập bột bánh mochi chưa {npc}!"', 'fun'],
          ['Cùng phối hợp gõ nhịp điệu rộn ràng: "Hai đứa mình ăn ý thế này, đúng là sinh ra để làm một cặp phối hợp hoàn hảo."', 'sweet'],
          ['Cổ vũ hết mình: "Cứ quẩy hết sức để xả sạch mọi muộn phiền công việc đi {npc}, hôm nay chúng mình bung xõa hết mình!"', 'bold'],
        ],
      },
      {
        text: 'Trước khi ra về, {npc} kéo tay bạn vào buồng chụp ảnh lấy liền (purikura) với đủ loại sticker và hiệu ứng lung linh.',
        choices: [
          ['Chủ động ôm vai {npc} nhìn thẳng vào ống kính máy ảnh: "Tạo dáng thật tươi nào, lưu lại bức ảnh đôi đầu tiên của chúng mình nhé!"', 'bold'],
          ['Làm mặt xấu trợn mắt thè lưỡi: "Để xem máy ảnh tự động làm đẹp có cứu nổi biểu cảm khó đỡ này của mình và {npc} không!"', 'fun'],
          ['Cùng nhau dán sticker và nắn nót viết từng dòng chữ kỷ niệm: "Bức ảnh này mình sẽ giữ thật cẩn thận, xem như một kỷ niệm vô giá với {npc}."', 'deep'],
        ],
      },
    ],
  },
  onsen: {
    name: 'Đi tắm onsen / sentō', jp: '温泉・銭湯', icon: '♨️',
    events: [
      {
        text: 'Đến trước cửa tiệm tắm công cộng với tấm rèm noren phấp phới, bạn thấy {npc} hơi ngập ngừng trước lối rẽ phân chia hai bên nam nữ.',
        choices: [
          ['Chu đáo đưa chai nước khoáng và khăn bông cho {npc}: "Tắm nước nóng nhớ uống nhiều nước kẻo say sóng nhiệt nhé, tắm xong mình đợi ở phòng nghỉ tatami."', 'care'],
          ['Bình tĩnh giải thích: "Đây là nhà tắm sentō địa phương nên nước khá nóng, {npc} dội nước ấm làm quen từ từ trước khi bước vào bồn nhé."', 'calm'],
          ['Vẫy tay cười trêu: "Bên nào tắm nhanh hơn là thắng nhé, ai ra muộn phải mua sữa cho người kia đấy {npc}!"', 'fun'],
        ],
      },
      {
        text: 'Trong lúc ngâm mình trong làn nước nóng ấm áp bốc khói nghi ngút, bạn nghĩ đến {npc} ở phòng bên kia cũng đang thả lỏng cơ thể sau chuỗi ngày lao động mệt nhọc.',
        choices: [
          ['Nhìn làn khói mờ ảo bốc lên trần gỗ, lòng thầm ước: "Mong rằng sự ấm áp này sẽ gột rửa hết những nhọc nhằn, tủi thân xa xứ của {npc}."', 'deep'],
          ['Khẽ mỉm cười thầm nghĩ: "Không biết {npc} tắm có thoải mái không, lát ra phòng nghỉ phải hỏi xem mới được."', 'sweet'],
          ['Ngâm mình chừng mực rồi đứng dậy: "Không nên ngâm quá 15 phút kẻo chóng mặt, phải giữ sức khỏe thật tốt để chăm sóc cho cả hai."', 'calm'],
        ],
      },
      {
        text: 'Gặp lại nhau ở gian phòng nghỉ trải chiếu tatami thoáng đãng, bạn thấy {npc} bước ra với mái tóc còn hơi ẩm ướt và đôi gò má ửng hồng vì hơi ấm.',
        choices: [
          ['Đưa ngay chai sữa bò thủy tinh mát lạnh cho {npc}: "Tắm suối nước nóng xong mà uống sữa lạnh là chuẩn bài nhất Nhật Bản đấy, {npc} uống đi cho mát."', 'care'],
          ['Ngắm nhìn vẻ mộc mạc dịu dàng của {npc}, khẽ thì thầm: "Mặt {npc} ửng hồng trông đáng yêu và xinh đẹp lạ thường."', 'sweet'],
          ['Chủ động vỗ nhẹ lên chiếc ghế massage bên cạnh: "Qua đây ngồi mát-xa lưng đi {npc}, bao nhiêu nhức mỏi ca làm tan biến hết ngay!"', 'bold'],
        ],
      },
      {
        text: 'Ngồi bên hiên gỗ ngắm khu vườn nhỏ rêu phong tĩnh mịch phía sau nhà tắm, bạn cùng {npc} tận hưởng làn gió mát lành thổi qua làm lay động nhành tre xào xạc.',
        choices: [
          ['Chân thành giãi bày cùng {npc}: "Những ngày đầu sang Nhật bỡ ngỡ và cô đơn lắm, nhờ có {npc} mà nơi đất khách này dần trở nên ấm áp như một mái nhà."', 'deep'],
          ['Nhích lại ngồi gần hơn, để vai hai người khẽ chạm vào nhau: "Gió lạnh rồi đấy, ngồi sát vào đây cho ấm nhé {npc}."', 'sweet'],
          ['Bật cười thư thái: "Cảm giác sảng khoái thế này làm mình muốn tuần nào cũng rủ {npc} đi tắm sentō xả stress thôi!"', 'fun'],
        ],
      },
    ],
  },
  illumination: {
    name: 'Ngắm đèn trang trí mùa đông', jp: 'イルミネーション', icon: '✨',
    events: [
      {
        text: 'Con đường hàng cây mùa đông bừng sáng bởi hàng triệu ngọn đèn LED lung linh, gió đêm đông thổi buốt giá khiến bạn thấy {npc} khẽ rùng mình co ro.',
        choices: [
          ['Cởi chiếc khăn quàng cổ ấm áp của mình quàng nhẹ lên cổ cho {npc}: "Đêm nay lạnh lắm, quàng khăn này vào kẻo bị cảm lạnh đấy."', 'care'],
          ['Chủ động nắm lấy bàn tay lạnh buốt của {npc} rồi đút vào túi áo khoác dày của mình: "Bàn tay lạnh ngắt thế này, để mình sưởi ấm cho nhé."', 'bold'],
          ['Mỉm cười dịu dàng: "Gió lạnh thật, nhưng nhìn ánh đèn lung linh thế này thấy lòng ấm áp hẳn lên {npc} nhỉ."', 'calm'],
        ],
      },
      {
        text: 'Hai bạn cùng bước qua một đường hầm ánh sáng rực rỡ như dải ngân hà lấp lánh, giữa bao cặp đôi dạo bước, {npc} ngước nhìn vòm đèn đầy say mê.',
        choices: [
          ['Nghiêng đầu ngắm nhìn {npc}, khẽ thổ lộ: "Cả nghìn ngọn đèn lung linh ngoài kia cũng không sáng và đẹp bằng nụ cười của {npc} đêm nay."', 'sweet'],
          ['Cười đùa: "Lạc vào đường hầm ánh sáng này trông {npc} cứ như nhân vật chính vừa bước ra từ một bộ phim truyền hình vậy!"', 'fun'],
          ['Nắm chặt tay {npc} sải bước đầy tự tin: "Cứ ngẩng cao đầu bước đi nào, con đường ánh sáng này như đang trải thảm chào đón chúng mình đấy."', 'bold'],
        ],
      },
      {
        text: 'Dừng chân bên chiếc máy bán hàng tự động bên lề đường, bạn nhìn thấy làn khói phả ra trắng xóa theo từng hơi thở gấp của {npc}.',
        choices: [
          ['Mua ngay hai lon trà sữa nóng hổi áp vào má {npc}: "Cầm lấy lon này ủ tay cho ấm trước đi nhé, vừa ấm tay vừa ngọt ngào."', 'care'],
          ['Đứng che hướng gió thổi cho {npc} rồi từ tốn nói: "Mùa đông ở Nhật khắc nghiệt thật, nhưng nhờ có hơi ấm của những lon nước nóng và tình cảm bạn bè mà thấy dễ chịu hơn nhiều."', 'calm'],
          ['Nhìn làn khói trắng thở ra rồi cười bảo: "Nhìn hơi thở tụi mình như hai đầu tàu hỏa đang nhả khói này {npc}, thi xem ai phả khói xa hơn không!"', 'fun'],
        ],
      },
      {
        text: 'Đứng trước cây thông Noel khổng lồ rực rỡ ở trung tâm quảng trường, tiếng chuông ngân vang trong đêm đông tĩnh lặng khiến bạn và {npc} cùng dừng bước.',
        choices: [
          ['Nhìn sâu vào mắt {npc}, chân thành trải lòng: "Mùa đông xa nhà từng rất lạnh lẽo và cô đơn, nhưng kể từ khi có {npc} bên cạnh, mùa đông năm nay đối với mình là mùa ấm áp nhất."', 'deep'],
          ['Khẽ ôm nhẹ {npc} từ phía sau giữa không gian lung linh: "Ước gì khoảnh khắc kỳ diệu này có thể kéo dài mãi mãi."', 'sweet'],
          ['Nhìn lên đỉnh ngôi sao sáng trên ngọn cây rồi quyết đoán: "Dù cuộc sống thực tập sinh phía trước còn nhiều thử thách, mình tin chắc hai đứa mình sẽ đạt được ước mơ tại đất nước này."', 'bold'],
        ],
      },
    ],
  },
};
