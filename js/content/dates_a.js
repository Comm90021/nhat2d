export const DATES_A = {
  park: {
    name: 'Đi dạo công viên',
    jp: '公園さんぽ',
    icon: '🌳',
    events: [
      {
        text: 'Trời bỗng nổi cơn gió se se lạnh, {npc} khẽ rùng mình rồi kéo cao cổ áo len.',
        choices: [
          ['"Bạn có lạnh không? Để mình nhường khăn choàng cho nhé."', 'care'],
          ['"Đứng sát lại gần mình này, hai đứa đi cạnh nhau sẽ ấm hơn."', 'sweet'],
          ['"Rùng mình thế kia là chuẩn bị biến hình thành siêu nhân à?"', 'fun'],
        ],
      },
      {
        text: 'Hai bạn dừng chân trước một máy bán nước tự động bên lối đi rải sỏi, {npc} ngập ngừng chưa biết chọn gì.',
        choices: [
          ['"Uống một lon trà nóng nhé, để mình ấn nút mua cho."', 'care'],
          ['"Hay là nhắm mắt bấm đại một nút xem vận may hôm nay thế nào?"', 'fun'],
          ['"Cứ thong thả chọn món bạn thích đi, mình đợi được mà."', 'calm'],
        ],
      },
      {
        text: 'Đến hồ nước giữa công viên, một đàn bồ câu sà xuống quanh chân, {npc} thích thú đưa tay vẫy chúng.',
        choices: [
          ['"Coi chừng chúng tưởng ngón tay bạn là bánh mì đấy nhé!"', 'fun'],
          ['"Nhìn nụ cười của {npc} lúc này rạng rỡ và đáng yêu thật đấy."', 'sweet'],
          ['"Không khí ở đây bình yên thật, bao mệt mỏi sau tuần làm việc tan biến hết."', 'calm'],
        ],
      },
      {
        text: 'Ngồi nghỉ trên chiếc ghế gỗ dài, {npc} lặng nhìn những chiếc lá vàng rơi rồi khẽ thở dài như có điều suy nghĩ.',
        choices: [
          ['"Ở nơi đất khách này, có tâm sự gì bạn cứ chia sẻ với mình nhé."', 'deep'],
          ['"Đưa tay đây nào, dù có chuyện gì thì hôm nay cứ dựa vào mình."', 'bold'],
          ['"Chỉ cần được ngồi cạnh {npc} thế này, bao muộn phiền của mình cũng hóa nhẹ tênh."', 'sweet'],
        ],
      },
    ],
  },

  cafe: {
    name: 'Quán cà phê',
    jp: 'カフェ',
    icon: '☕',
    events: [
      {
        text: 'Quán cà phê nhỏ mở nhạc jazz êm dịu, nhân viên mang thực đơn toàn chữ Hán khiến {npc} hơi bối rối.',
        choices: [
          ['"Để mình xem menu giúp bạn, bạn thích uống ngọt hay vị cà phê đậm hơn?"', 'care'],
          ['"Món này tên nghe lạ ghê, khéo lại là bí kíp gia truyền của quán đấy!"', 'fun'],
          ['"Không vội đâu, để mình tra từ điển rồi hai đứa cùng chọn nhé."', 'calm'],
        ],
      },
      {
        text: 'Đĩa bánh ngọt hình chú gấu xinh xắn được dọn lên bàn, {npc} cầm nĩa ngập ngừng không nỡ cắt bánh.',
        choices: [
          ['"Ăn đi kẻo chú gấu buồn vì bị bỏ rơi đấy!"', 'fun'],
          ['"Dễ thương thế này thì để mình chụp cho {npc} một tấm ảnh kỷ niệm nhé."', 'sweet'],
          ['"Tiếc làm gì, để mình xúc miếng đầu tiên đút cho bạn nếm thử trước."', 'bold'],
        ],
      },
      {
        text: '{npc} vô tình làm sánh vài giọt cà phê ra bàn rồi luống cuống tìm giấy lau.',
        choices: [
          ['"Cẩn thận nóng đấy! Để mình lấy khăn ướt lau giúp bạn, không sao đâu."', 'care'],
          ['"Chuyện nhỏ thôi mà, ai đi cà phê cũng từng lỡ tay một lần."', 'calm'],
          ['"Họa sĩ trừu tượng vừa tạo ra một tác phẩm nghệ thuật trên bàn rồi!"', 'fun'],
        ],
      },
      {
        text: 'Nhìn làn khói mỏng bốc lên từ tách cà phê ấm, {npc} chợt bộc bạch về những khó khăn khi mới sang Nhật tự lập.',
        choices: [
          ['"Tự lập xứ người chưa bao giờ dễ dàng, nhưng mình rất nể nghị lực của bạn."', 'deep'],
          ['"Từ giờ con đường phía trước của bạn sẽ luôn có mình đồng hành, đừng lo nhé."', 'sweet'],
          ['"Cứ bước từng bước một thôi, nhìn lại xem bạn đã đi được một đoạn rất xa rồi."', 'calm'],
        ],
      },
    ],
  },

  cinema: {
    name: 'Xem phim ở rạp',
    jp: '映画館',
    icon: '🎬',
    events: [
      {
        text: 'Đứng trước quầy vé xem danh sách phim đang chiếu, {npc} phân vân giữa phim hoạt hình vui nhộn và phim trinh thám hồi hộp.',
        choices: [
          ['"Hôm nay cứ ưu tiên thể loại phim mà bạn cảm thấy muốn xem nhất đi."', 'calm'],
          ['"Xem hoạt hình đi, lớn rồi nhưng tâm hồn mình vẫn còn thiếu nhi lắm!"', 'fun'],
          ['"Chọn trinh thám đi, nếu có đoạn giật mình thì cứ nắm chặt tay mình này."', 'bold'],
        ],
      },
      {
        text: 'Hai bạn cùng chia nhau một hộp bắp rang bơ cỡ lớn, tay bạn và {npc} vô tình chạm nhau trong hộp bắp.',
        choices: [
          ['Khẽ mỉm cười và nhường hộp bắp sang phía {npc}: "Bạn ăn phần nhiều hơn đi."', 'sweet'],
          ['Không rút tay lại ngay mà khẽ nắm nhẹ đầu ngón tay của {npc} một nhịp.', 'bold'],
          ['"Bắt quả tang có người định lấy trộm miếng bắp to nhất của mình nha!"', 'fun'],
        ],
      },
      {
        text: 'Bộ phim đến phân cảnh cao trào xúc động, {npc} khẽ đưa tay quệt khóe mắt rưng rưng.',
        choices: [
          ['Lặng lẽ lấy gói khăn giấy sạch trong túi áo đưa tận tay cho {npc}.', 'care'],
          ['"Đoạn này chạm vào cảm xúc thật đấy, tình cảm chân thành luôn làm người ta rơi nước mắt."', 'deep'],
          ['Giữ không gian yên tĩnh và ngồi sát lại để {npc} cảm thấy được an ủi.', 'calm'],
        ],
      },
      {
        text: 'Bước ra khỏi rạp chiếu bóng khi phố xá đã lên đèn, {npc} vẫn còn hào hứng bàn luận về cái kết bất ngờ của phim.',
        choices: [
          ['"Cái kết ấy làm mình suy nghĩ mãi về giá trị của lòng tin và sự chân thành."', 'deep'],
          ['"Cái kết đỉnh ghê, giá mà đạo diễn cho nhân vật chính trúng số độc đắc thì tuyệt hơn!"', 'fun'],
          ['"Phim rất hay, nhưng điều tuyệt vời nhất hôm nay là được ngồi xem cùng bạn."', 'sweet'],
        ],
      },
    ],
  },

  karaoke: {
    name: 'Hát karaoke',
    jp: 'カラオケ',
    icon: '🎤',
    events: [
      {
        text: 'Vào phòng karaoke có ánh đèn xoay rực rỡ, {npc} cầm micro nhưng bối rối thú nhận là bản thân hát không hay lắm.',
        choices: [
          ['"Lo gì chứ, phòng này cách âm tốt lắm, chúng mình cứ hát cho thỏa thích!"', 'fun'],
          ['"Không sao đâu, ở đây chỉ có hai đứa mình thôi, cứ thoải mái vui vẻ là được."', 'calm'],
          ['"Chỉ cần là giọng của bạn cất lên thì với mình bài nào cũng đều hay hết."', 'sweet'],
        ],
      },
      {
        text: 'Đến lượt bạn bấm chọn bài, {npc} háo hức chờ xem bạn sẽ thể hiện ca khúc gì.',
        choices: [
          ['"Để mình biểu diễn một bài hát thiếu nhi sôi động khuấy đảo không khí nhé!"', 'fun'],
          ['"Mình sẽ hát một bản tình ca nhẹ nhàng tặng riêng cho {npc} hôm nay."', 'sweet'],
          ['"Mình muốn hát một bài hát quê hương da diết, nhớ về những ngày tháng đã qua."', 'deep'],
        ],
      },
      {
        text: 'Hát liền mấy bài sôi động, {npc} bắt đầu ho nhẹ vì hơi khản tiếng.',
        choices: [
          ['Rót một ly nước ấm đẩy sang trước mặt {npc}: "Uống chút nước ấm cho dịu cổ họng nào."', 'care'],
          ['"Hát bốc quá cháy cả giọng rồi! Tạm nghỉ để ca sĩ chính nạp năng lượng đã."', 'fun'],
          ['"Để mình chuyển sang bật nhạc nền êm dịu, hai đứa ngồi trò chuyện một lát nhé."', 'calm'],
        ],
      },
      {
        text: 'Gần hết giờ hát, trên màn hình hiện lên một bản song ca lãng mạn, {npc} đưa chiếc micro thứ hai về phía bạn.',
        choices: [
          ['Nhận lấy micro và đứng sát lại: "Sẵn sàng rồi, bài này hai đứa mình phải rinh điểm tuyệt đối!"', 'bold'],
          ['Nhìn vào mắt {npc} và hòa giọng theo từng câu hát như gửi gắm tâm tình.', 'sweet'],
          ['"Cứ hát tự nhiên theo tông của bạn nhé, mình sẽ bè trầm để nâng giọng bạn lên."', 'care'],
        ],
      },
    ],
  },

  dinner: {
    name: 'Ăn tối ở nhà hàng',
    jp: 'レストランで夕食',
    icon: '🍽️',
    events: [
      {
        text: 'Người phục vụ mang ra món ăn đặc biệt bốc khói thơm lừng, {npc} nhìn đĩa thức ăn với ánh mắt háo hức.',
        choices: [
          ['"Để mình chia phần cho bạn trước nhé, cẩn thận kẻo đĩa còn nóng đấy."', 'care'],
          ['"Món ăn trông ngon thật, nhưng vẫn chưa cuốn hút bằng người ngồi đối diện mình."', 'sweet'],
          ['"Trông hấp dẫn quá, cái bụng của mình bắt đầu đánh trống reo hò rồi này!"', 'fun'],
        ],
      },
      {
        text: 'Trong đĩa có một món ăn truyền thống địa phương mà {npc} chưa từng thử bao giờ và có chút ngần ngại.',
        choices: [
          ['"Để mình ăn thử một miếng trước xem sao, nếu ngon mình bảo kê cho!"', 'bold'],
          ['"Nếu bạn thấy không quen thì đừng ép bản thân, cứ ăn những món mình thích thôi."', 'calm'],
          ['"Coi như thử thách lòng dũng cảm đi, nhắm mắt nếm thử một xíu xem sao nào!"', 'fun'],
        ],
      },
      {
        text: 'Trong không gian ấm cúng của quán ăn, {npc} bồi hồi nhắc đến bữa cơm gia đình đầm ấm ở quê nhà.',
        choices: [
          ['"Xa nhà ai cũng thèm bữa cơm mẹ nấu, những lúc nhớ quê cứ nói với mình nhé."', 'deep'],
          ['"Hôm nào rảnh mình sẽ nấu món quê cho bạn ăn, tuy vụng về nhưng chứa trọn tấm lòng."', 'sweet'],
          ['"Nhớ ăn uống đầy đủ mỗi ngày nhé, đừng bỏ bữa làm bố mẹ ở quê thêm lo."', 'care'],
        ],
      },
      {
        text: 'Bữa ăn kết thúc, người phục vụ đặt hóa đơn lên bàn và {npc} vội vã đưa tay mở ví muốn chia đôi tiền.',
        choices: [
          ['Nhẹ nhàng giữ tay {npc} lại: "Hôm nay để mình mời, lần sau tới lượt bạn bao mình nhé!"', 'bold'],
          ['"Chúng mình chia đôi sòng phẳng như thói quen ở đây nhé, để bạn không phải ngại."', 'calm'],
          ['"Được ăn tối cùng bạn là niềm vui lớn nhất hôm nay của mình rồi, để mình thanh toán cho."', 'sweet'],
        ],
      },
    ],
  },

  river: {
    name: 'Dạo bờ sông lúc hoàng hôn',
    jp: '夕暮れの河川敷',
    icon: '🌅',
    events: [
      {
        text: 'Ánh hoàng hôn đỏ rực buông xuống triền đê ven sông, gió chiều thổi làm rối nhẹ mái tóc của {npc}.',
        choices: [
          ['Đưa tay nhẹ nhàng chỉnh lại lọn tóc bay cho {npc}: "Gió làm tóc bạn bay trông thơ mộng lắm."', 'sweet'],
          ['"Gió thổi mạnh thế này khéo bay mất cả người, để mình làm điểm tựa cho nhé!"', 'fun'],
          ['"Không khí bờ sông lúc hoàng hôn thật trong lành, đi dạo ở đây dễ chịu ghê."', 'calm'],
        ],
      },
      {
        text: 'Hai bạn bước xuống thảm cỏ ven triền sông, {npc} ngắm nhìn mặt nước lấp lánh phản chiếu ánh tà dương.',
        choices: [
          ['"Mỗi khi nhìn hoàng hôn nơi đất khách, mình lại tự nhủ phải cố gắng nhiều hơn cho tương lai."', 'deep'],
          ['"Mặt trời lặn rất đẹp, nhưng khoảnh khắc được đứng ở đây cùng bạn mới là đẹp nhất."', 'sweet'],
          ['"Mặt nước lấp lánh như dát vàng thế kia, tiếc là không vớt lên đổi ra tiền yên được nhỉ!"', 'fun'],
        ],
      },
      {
        text: 'Một đoàn tàu chạy qua cây cầu sắt phía xa vang lên tiếng còi giòn giã, {npc} ngước mắt nhìn theo bóng tàu.',
        choices: [
          ['"Tiếng tàu chạy quen thuộc thật, mỗi ngày đều chở bao ước mơ của những người xa xứ."', 'calm'],
          ['Đưa tay vẫy thật cao về phía đoàn tàu: "Nào, cùng vẫy tay chào đoàn tàu cho nhẹ nhõm lòng đi!"', 'bold'],
          ['"Không biết trên chuyến tàu đó có ai cũng đang mang nhiều nỗi niềm như chúng mình không nhỉ."', 'deep'],
        ],
      },
      {
        text: 'Hai bạn ngồi cạnh nhau trên bậc cỏ ngắm thị trấn dần thắp đèn, {npc} khẽ tựa vai về phía bạn.',
        choices: [
          ['Khẽ nghiêng đầu tựa lại vào {npc}: "Cứ ngồi thế này một lúc nhé, bình yên quá."', 'sweet'],
          ['"Cỏ bắt đầu có sương lạnh rồi, để mình trải áo khoác xuống cho bạn ngồi đỡ lạnh nhé."', 'care'],
          ['Nhẹ nhàng nắm lấy bàn tay của {npc} rồi đặt vào túi áo khoác của mình để sưởi ấm.', 'bold'],
        ],
      },
    ],
  },

  hanami: {
    name: 'Picnic ngắm hoa anh đào',
    jp: 'お花見ピクニック',
    icon: '🌸',
    events: [
      {
        text: 'Dưới tán hoa anh đào nở rộ, {npc} trải tấm bạt picnic màu xanh trên thảm cỏ xanh mướt.',
        choices: [
          ['"Để mình giữ các góc bạt cho phẳng rồi lấy đồ chặn lại kẻo gió thổi bay nhé."', 'care'],
          ['"Chúng mình xí được vị trí đắc địa nhất công viên rồi, tài thương lượng đỉnh cao thật!"', 'fun'],
          ['"Ngồi dưới tán cây này vừa râm mát lại ngắm được trọn vẹn cành hoa đẹp nhất."', 'calm'],
        ],
      },
      {
        text: '{npc} mở hộp cơm bento chuẩn bị từ sớm ra, những món ăn tự tay làm trông vô cùng bắt mắt.',
        choices: [
          ['"Bạn khéo tay quá, nhìn hộp cơm đẹp thế này mình chỉ muốn ngắm mãi không nỡ ăn thôi."', 'sweet'],
          ['"Bạn đã phải dậy từ sớm tinh mơ để chuẩn bị đúng không? Cảm ơn bạn nhiều lắm nhé."', 'care'],
          ['"Tuyệt đỉnh mỹ vị đây rồi! Hôm nay mình sẽ làm ban giám khảo chấm điểm mười trên mười!"', 'fun'],
        ],
      },
      {
        text: 'Một cơn gió xuân thổi qua làm những cánh hoa anh đào rụng lả tả, một cánh hoa khẽ vương trên tóc {npc}.',
        choices: [
          ['Đưa tay nhẹ nhàng gỡ cánh hoa trên tóc {npc}: "Hoa cũng biết chọn chỗ đẹp nhất để đậu lại này."', 'sweet'],
          ['Nhặt cánh hoa rồi đặt nhẹ vào lòng bàn tay {npc}: "Tặng bạn một mảnh mùa xuân nhé."', 'bold'],
          ['"Một cánh hoa rơi trúng đầu là sắp tới sẽ gặp may mắn ngập tràn đấy nha!"', 'fun'],
        ],
      },
      {
        text: 'Cùng nâng ly trà ấm ngắm nhìn dòng người nhộn nhịp đi thưởng hoa, {npc} thở phào nhẹ nhõm cảm thán mùa xuân thật đẹp.',
        choices: [
          ['"Sau một mùa đông giá rét, hoa lại nở rực rỡ... Khó khăn nào rồi cũng sẽ qua bạn nhỉ."', 'deep'],
          ['"Mùa hoa năm sau và nhiều năm sau nữa, mình vẫn muốn được cùng bạn đi ngắm hoa thế này."', 'sweet'],
          ['"Được thong thả tận hưởng một buổi chiều mùa xuân yên bình như hôm nay thật đáng quý."', 'calm'],
        ],
      },
    ],
  },
};
