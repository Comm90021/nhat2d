export const TOPICS_A = [
  {
    id: 'home', icon: '🏡', label: 'Hỏi về quê hương',
    ask: [
      'Quê của bạn ở đâu thế? Ở đó có gì đẹp hay có món gì nổi tiếng không?',
      'Mỗi lần nhớ nhà, bạn thường nhớ điều gì nhất ở quê hương mình?',
      'Ở quê bạn phong cảnh thế nào? Có yên bình giống như ở thị trấn này không?',
    ],
    like: {
      vn: [
        'Nhắc quê là vui rồi! Em ở Nghệ An, nhớ nhất mấy món mẹ nấu với biển Cửa Lò.',
        'Anh ở Nam Định, quê anh nhiều món ngon lắm, hôm nào rảnh anh em mình làm bữa!',
        'Quê em ở vùng trung du, cây trái quanh năm, hè nào bưởi với cam cũng trĩu cành.',
      ],
      jp: [
        '「私は北海道出身ですよ！夏は涼しくて大自然が広がっていて最高です」 (Tôi quê ở Hokkaido đấy! Mùa hè mát mẻ và thiên nhiên bạt ngàn tuyệt vời lắm.)',
        '「実家は長野県でね、山がきれいで空気が本当においしい所だよ」 (Quê tôi ở tỉnh Nagano, núi non tuyệt đẹp và không khí thực sự trong lành.)',
        '「{me}さんの故郷の話も聞かせて！ベトナムの風景ってとても魅力的ね」 (Kể tôi nghe về quê của {me} với! Phong cảnh Việt Nam trông cuốn hút lắm.)',
      ],
    },
    neutral: {
      vn: [
        'Quê anh ở ngoại thành thôi, cuộc sống bình thường, lâu lâu mới về thăm một lần.',
        'Em ở miền Tây, cảnh sông nước êm đềm, cơ mà ở quen rồi thì thấy cũng bình thường.',
        'Quê em xa lắm, từ ngày sang đây bận rộn nên cũng ít khi có thời gian nhớ nhung.',
      ],
      jp: [
        '「実家は隣の県です。連休にたまに顔を出すくらいですね」 (Nhà bố mẹ tôi ở tỉnh bên. Thỉnh thoảng kỳ nghỉ dài tôi mới ghé qua thôi.)',
        '「地方の小さな町ですよ。特に名物と言えるようなものはないかな」 (Chỉ là một thị trấn nhỏ ở quê thôi. Chắc chẳng có đặc sản gì nổi bật đâu.)',
        '「故郷ですか…仕事が忙しくて、ずいぶん長く帰っていませんね」 (Quê hương à... Công việc bận rộn nên cũng lâu lắm rồi tôi chưa về thăm.)',
      ],
    },
    dislike: {
      vn: [
        'Thôi đừng nhắc quê nữa, nhắc lại thấy nhớ nhà cồn cào, đêm nằm khó ngủ lắm...',
        'Quê em nghèo và ít việc nên mới phải sang đây bươn chải, có gì vui đâu mà kể.',
        'Dạo này ở quê đang nhiều chuyện phức tạp, nhắc đến chỉ thấy thêm nặng đầu thôi.',
      ],
      jp: [
        '「実家の話はあまり…ちょっと事情があって話したくないんです」 (Chuyện quê nhà thì tôi không tiện nói... Có chút chuyện riêng tôi không muốn kể.)',
        '「田舎の人間関係が嫌でここへ出てきたので、思い出したくないですね」 (Vì ghét các mối quan hệ ở quê nên tôi mới lên đây, chẳng muốn nhớ lại chút nào.)',
        '「すみません、今は故郷のことを振り返るような気分じゃないんです」 (Xin lỗi, lúc này tôi không có tâm trạng để nhớ lại chuyện quê hương đâu.)',
      ],
    },
  },
  {
    id: 'work', icon: '🏭', label: 'Chuyện công việc',
    ask: [
      'Dạo này công việc ở chỗ làm có bận rộn và nhiều việc làm thêm không anh/chị?',
      'Hôm nay làm ca có mệt mỏi không bạn? Mọi việc trên chuyền vẫn ổn thỏa chứ?',
      'Anh/chị làm ở đây lâu chưa? Có kinh nghiệm hay mẹo làm việc gì chỉ cho em với!',
    ],
    like: {
      vn: [
        'Hôm nay chạy hàng trơn tru lắm em! Cả tổ hoàn thành sớm nên được nghỉ ngơi thoải mái.',
        'Chăm chỉ học việc là làm tốt ngay thôi, có gì vướng mắc cứ ới, anh sẵn sàng chỉ bảo!',
        'Làm việc cùng mọi người vui vẻ lắm, vừa làm vừa giúp đỡ nhau nên hết ca lúc nào không hay.',
      ],
      jp: [
        '「今日の作業は順調でしたね！{me}さんも本当によく動いてくれていますよ」 (Công việc hôm nay rất suôn sẻ! {me} cũng làm việc hết mình và tháo vát lắm đấy.)',
        '「段取りよく作業が進むと爽快ですね。明日もこの調子で安全にいきましょう」 (Chuẩn bị chu đáo việc chạy bon bon thấy sảng khoái ghê. Mai cứ thế làm an toàn nhé.)',
        '「腕が上がると仕事は楽しいよ。コツならいつでも聞いてね」 (Tay nghề tiến bộ thì làm việc vui lắm. Muốn biết mẹo gì cứ hỏi tôi nhé.)',
      ],
    },
    neutral: {
      vn: [
        'Cũng đều đều vậy thôi em, ngày nào cũng đúng quy trình và đúng giờ mà làm.',
        'Hôm nay hàng vừa phải, không dồn ứ cũng không thiếu việc, hết giờ là bấm thẻ về.',
        'Đi làm thì ở đâu cũng có vất vả, cứ làm tròn phần việc của mình là được rồi.',
      ],
      jp: [
        '「まあ、いつも通りですよ。安全第一でミスなくこなすのが一番大切です」 (À thì cũng như thường lệ thôi. An toàn trên hết và làm không sai sót là quan trọng nhất.)',
        '「今日は残業もなく定時で上がれそうですね。可もなく不可もない一日でした」 (Hôm nay không phải tăng ca chắc về đúng giờ. Một ngày bình thường, không tốt không xấu.)',
        '「毎日のルーティンですからね。無理をせず淡々と作業を進めていますよ」 (Vì là công việc lặp lại hàng ngày mà. Tôi cứ làm việc túc tắc vừa sức thôi.)',
      ],
    },
    dislike: {
      vn: [
        'Đang mệt rã rời đây em, hôm nay máy hỏng liên tục mà tổ trưởng cứ giục cuống cuồng.',
        'Tan ca là chỉ muốn về phòng nằm vật ra, đừng nhắc chuyện xưởng nữa cho nhẹ đầu.',
        'Tăng ca liên miên đau ê ẩm cả người, làm nhiều mà áp lực đủ thứ mệt mỏi ghê.',
      ],
      jp: [
        '「今は仕事の話は勘弁してください…残業続きで心身ともに限界なんです」 (Lúc này xin đừng nói chuyện công việc nữa... Tăng ca liên tục khiến tôi kiệt sức rồi.)',
        '「トラブルの対応ばかりで本当に疲れました。少し一人で休ませてください」 (Toàn phải giải quyết sự cố phát sinh mệt mỏi thật sự. Để tôi yên tĩnh nghỉ một lát đi.)',
        '「職場のことを思い出すと胃が痛くなります。早く忘れて帰りたいですね」 (Cứ nghĩ đến chỗ làm là tôi lại đau cả dạ dày. Chỉ muốn quên hết đi để về nhà thôi.)',
      ],
    },
  },
  {
    id: 'hobby', icon: '🎮', label: 'Sở thích',
    ask: [
      'Những ngày nghỉ cuối tuần bạn thường thích dành thời gian làm gì nhất?',
      'Bạn có sở thích hay thói quen gì đặc biệt để giải tỏa căng thẳng không?',
      'Dạo này bạn có đang mê mẩn bộ phim, cuốn sách hay môn thể thao nào không?',
    ],
    like: {
      vn: [
        'Anh mê câu cá dã ngoại lắm! Cuối tuần vác cần ra bờ sông ngồi ngắm cảnh là hết mệt.',
        'Em thích nấu ăn với làm bánh, nghỉ là rủ bạn bè qua ký túc xá cùng nấu ăn vui cực!',
        'Mình thích chụp ảnh phong cảnh! Mỗi mùa lá đổi màu lại xách máy đi chụp khắp nơi.',
      ],
      jp: [
        '「休日にキャンプに行くのが大好きでね！自然の中で飲む珈琲は格別だよ」 (Tôi thích đi cắm trại ngày nghỉ lắm! Nhâm nhi cà phê giữa thiên nhiên là tuyệt nhất đấy.)',
        '「アニメやゲームが大好きなんです！{me}さんもおすすめがあったら教えてね」 (Tôi mê anime với game lắm luôn! Nếu {me} có bộ nào hay thì giới thiệu cho tôi với nhé.)',
        '「家庭菜園で野菜を育てるのが楽しくて！今度採れたてのトマトをあげるよ」 (Trồng rau trong vườn vui cực kỳ! Hôm nào tôi sẽ tặng bạn ít cà chua vừa mới hái nhé.)',
      ],
    },
    neutral: {
      vn: [
        'Cuối tuần em chỉ ngủ bù với lướt điện thoại thôi, cũng không có sở thích gì đặc biệt.',
        'Lâu lâu rảnh thì dạo quanh siêu thị mua ít đồ lặt vặt, hết ngày là về nghỉ ngơi.',
        'Cũng muốn học thêm sở thích mới nhưng đi làm về đuối quá chỉ muốn nằm thư giãn.',
      ],
      jp: [
        '「趣味と言えるほどじゃないですが、休日は家で動画を眺めて過ごしています」 (Chẳng tính là sở thích đâu, nhưng ngày nghỉ tôi hay ở nhà xem mấy video giải trí.)',
        '「読書や散歩くらいですね。静かに自分のペースで過ごすのが一番落ち着きます」 (Tôi chỉ đọc sách hoặc đi dạo thôi. Trải qua ngày nghỉ yên tĩnh là bình yên nhất rồi.)',
        '「これといって熱中しているものはないかな。のんびり過ごせれば満足です」 (Tôi chẳng có món nào đam mê cuồng nhiệt cả. Cứ thong thả nghỉ ngơi là mãn nguyện rồi.)',
      ],
    },
    dislike: {
      vn: [
        'Cơm áo gạo tiền lo còn chưa xong, làm gì có thời gian với tâm trí cho thú vui hả em.',
        'Hồi ở nhà thì thích nhiều thứ, sang đây bận tối mày tối mặt nên bỏ hết từ lâu rồi.',
        'Hỏi sở thích làm chi, cả tuần làm hùng hục, ngày nghỉ chỉ mong không ai làm phiền.',
      ],
      jp: [
        '「趣味を楽しむような心の余裕はありませんよ。生きるだけで手一杯ですから」 (Tôi chẳng có tâm trí đâu mà hưởng thụ sở thích. Sống qua ngày đã đủ chật vật rồi mà.)',
        '「個人の私生活について、あまり根掘り葉掘り聞かれるのは好きじゃないんです」 (Tôi không thích việc đời tư cá nhân của mình bị người khác tò mò gặng hỏi đâu.)',
        '「そんな無駄な趣味にお金や時間を使う気にはなれませんね…」 (Tôi chẳng có hứng thú tiêu tiền bạc hay thời gian vào những thú vui vô bổ đó đâu...)',
      ],
    },
  },
  {
    id: 'family', icon: '👨👩👧', label: 'Chuyện gia đình',
    ask: [
      'Gia đình và bố mẹ anh/chị ở nhà dạo này vẫn bình an, khỏe mạnh cả chứ?',
      'Những lúc rảnh rỗi bạn có thường gọi điện video về thăm gia đình không?',
      'Người nhà có ủng hộ quyết định sang Nhật làm việc của bạn không?',
    ],
    like: {
      vn: [
        'Trộm vía bố mẹ anh khỏe lắm, tuần nào cũng gọi điện dặn dò đủ thứ chuyện ở nhà.',
        'Nhà em đông anh em, mỗi lần gọi về là cả nhà xúm lại nói chuyện rôm rả vui cực!',
        'Bố mẹ luôn là chỗ dựa lớn nhất của em, xa nhà nhưng lúc nào cũng thấy ấm lòng.',
      ],
      jp: [
        '「家族はみんな元気ですよ！先週も実家から旬の果物が届いて嬉しかったです」 (Cả nhà tôi đều khỏe mạnh cả! Tuần trước ở quê gửi hoa quả theo mùa lên làm tôi vui lắm.)',
        '「離れて暮らしていても、家族が支えてくれるから毎日前向きに頑張れますね」 (Dù sống xa nhau nhưng nhờ gia đình luôn ủng hộ nên tôi mới có động lực cố gắng mỗi ngày.)',
        '「{me}さんは家族思いで優しいですね。親御さんもきっと誇りに思っていますよ」 ({me} thật hiếu thảo và biết nghĩ cho gia đình. Bố mẹ bạn nhất định rất tự hào đấy.)',
      ],
    },
    neutral: {
      vn: [
        'Gia đình ở quê vẫn bình thường, cuối tuần rảnh rỗi em mới gọi điện hỏi thăm chút.',
        'Bố mẹ em có tuổi rồi nhưng vẫn tự chăm sóc được, thỉnh thoảng mới cần dặn dò.',
        'Ai cũng có cuộc sống riêng bận rộn, chỉ khi nào có việc quan trọng mới liên lạc.',
      ],
      jp: [
        '「家族とはたまに連絡を取るくらいですね。特に変わったこともないようです」 (Tôi cũng chỉ thỉnh thoảng liên lạc với gia đình thôi. Mọi chuyện xem ra vẫn bình thường.)', // ⚠️
        '「親も元気にしてますよ。用事がある時だけメッセージを送る程度ですが」 (Bố mẹ tôi vẫn khỏe mạnh cả. Cơ mà cũng chỉ khi nào có việc tôi mới nhắn tin thôi.)',
        '「お互い自立して暮らしていますから、頻繁に干渉し合うことはないですね」 (Đôi bên đều sống tự lập cả rồi nên chúng tôi cũng không can thiệp nhiều vào nhau.)',
      ],
    },
    dislike: {
      vn: [
        'Thôi em đừng hỏi chuyện nhà nữa... Đợt này ở quê đang có nhiều chuyện buồn lắm.',
        'Mỗi lần gọi về lại cãi nhau chuyện tiền nong gửi về, áp lực chẳng muốn gọi nữa.',
        'Xa nhà nghe tin người thân ốm mà không về được, nghĩ tới là lòng dạ như lửa đốt.',
      ],
      jp: [
        '「家族のことはプライベートなので、他人に立ち入られたくはないですね」 (Chuyện gia đình là chuyện riêng tư, tôi không muốn người ngoài can thiệp vào đâu.)',
        '「実家とは少し折り合いが悪くてね…あまりその話は掘り返さないでほしいな」 (Tôi với gia đình có chút xích mích... Bạn đừng khơi lại chuyện đó thì hơn.)',
        '「家庭の事情は人それぞれ複雑なんです。あまり深く踏み込まないでください」 (Hoàn cảnh gia đình mỗi người đều phức tạp. Xin bạn đừng gặng hỏi quá sâu.)',
      ],
    },
  },
  {
    id: 'food', icon: '🍜', label: 'Đồ ăn',
    ask: [
      'Anh/chị thích ăn món Nhật nào nhất? Đã quen với đồ ăn bên này chưa?',
      'Hôm nay bạn đã ăn gì ngon chưa? Quanh đây có quán ăn nào ngon bổ rẻ không?',
      'Bạn thích tự nấu ăn ở nhà hay hay đi ăn ngoài tiệm cùng bạn bè hơn?',
    ],
    like: {
      vn: [
        'Anh mê ramen với sushi bên này lắm, mà cuối tuần vẫn phải làm nồi canh chua mới đã!',
        'Quán mì udon đầu phố ngon tuyệt cú mèo luôn, hôm nào rảnh anh em mình đi ăn chung đi!',
        'Em nấu món Việt chuẩn vị lắm nha, hôm nào rảnh em mời qua phòng làm bữa lẩu liên hoan!',
      ],
      jp: [
        '「ラーメンの食べ歩きが大好きです！近所におすすめの店があるから案内するね」 (Tôi mê đi lùng các quán ramen lắm! Gần đây có quán ngon lắm, để tôi dẫn bạn đi nhé.)',
        '「ベトナムのフォーや生春巻きは最高ですね！パクチーも大好きなんですよ」 (Phở và gỏi cuốn Việt Nam ngon tuyệt vời luôn! Tôi cũng cực kỳ thích rau mùi đấy.)',
        '「美味しいご飯を食べると幸せな気持ちになりますね！{me}さんの得意料理は何？」 (Được ăn món ngon là thấy hạnh phúc ngập tràn! Món tủ của {me} là món gì thế?)',
      ],
    },
    neutral: {
      vn: [
        'Em dễ ăn lắm, nấu gì ăn nấy, cơm hộp siêu thị giảm giá nửa giá ăn cũng no nê rồi.',
        'Đồ ăn bên này hơi ngọt với nhạt so với khẩu vị quê mình, nhưng ăn riết rồi cũng quen.',
        'Ngày thường đi làm về mệt cứ nấu bát mì với quả trứng cho nhanh còn nghỉ ngơi.',
      ],
      jp: [
        '「平日は自炊かコンビニ弁当で簡単に済ませますね。食べられれば何でもいいです」 (Ngày thường tôi tự nấu hoặc mua cơm hộp konbini ăn cho nhanh. Ăn được là được rồi.)',
        '「味の好みは人並みですよ。特にこだわりはなく何でも美味しくいただきます」 (Khẩu vị của tôi cũng như bao người thôi. Không cầu kỳ gì, món gì tôi cũng ăn ngon lành.)',
        '「ベトナム料理は食べたことがありませんが、機会があれば試してみたいですね」 (Tôi chưa từng ăn món Việt Nam bao giờ, nhưng nếu có dịp thì cũng muốn thử xem sao.)',
      ],
    },
    dislike: {
      vn: [
        'Đồ ăn Nhật nhạt nhẽo lại thiếu rau muống với nước mắm, nhiều bữa nuốt chẳng trôi em ơi.',
        'Dạo này dạ dày yếu nên ăn uống chán lắm, nhìn món gì cũng không thấy ngon miệng.',
        'Tiết kiệm từng đồng gửi về nhà nên toàn ăn mì gói qua ngày, nhắc đồ ăn chỉ thêm thèm.',
      ],
      jp: [
        '「香草の強い匂いや辛いスパイスが本当に苦手で…食べられないんです」 (Tôi cực kỳ sợ mùi rau thơm nồng và các loại gia vị cay... Không tài nào ăn nổi.)',
        '「最近胃腸の調子が悪くて食欲がないんです。食べ物の話は少し控えてほしいな」 (Dạo này dạ dày tôi kém nên không thèm ăn. Bạn hạn chế nói chuyện đồ ăn giúp tôi nhé.)',
        '「食事なんて栄養を補給する作業に過ぎないですよ。特に興味も湧きませんね」 (Ăn uống chỉ là việc nạp chất dinh dưỡng vào người thôi. Tôi chẳng thấy hứng thú gì.)',
      ],
    },
  },
  {
    id: 'season', icon: '🌸', label: 'Thời tiết, mùa',
    ask: [
      'Anh/chị thích mùa nào nhất trong bốn mùa ở đất nước Nhật Bản?',
      'Thời tiết đợt này thay đổi thất thường ghê, bạn có quen được với khí hậu ở đây không?',
      'Mùa đông ở vùng này lạnh buốt giá, phòng bạn đã bật lò sưởi và có đủ chăn ấm chưa?',
    ],
    like: {
      vn: [
        'Em mê nhất mùa xuân ngắm hoa anh đào nở rộ, cảnh đẹp lãng mạn như trong phim vậy!',
        'Mùa thu lá phong đỏ rực khắp các sườn núi, đi dạo ngắm cảnh thấy lòng thanh thản hẳn.',
        'Lần đầu được thấy tuyết rơi thích mê luôn em, dù rét buốt tay nhưng vẫn nặn người tuyết!',
      ],
      jp: [
        '「春の桜の季節が一番好きですね！満開の桜の下でお花見をするのは日本の風情です」 (Tôi thích nhất mùa hoa anh đào nở! Ngắm hoa dưới cội anh đào là nét tao nhã của Nhật.)',
        '「秋の紅葉狩りは本当に素晴らしいですよ！山歩きをするには一番いい季節ですね」 (Ngắm lá đỏ mùa thu thực sự rất tuyệt vời! Đây là mùa thích hợp nhất để đi dạo núi đấy.)',
        '「四季折々の美しい変化を感じられるのが日本の良さですね。冬の雪景色も格別ですよ」 (Cảm nhận bốn mùa đổi thay là nét đẹp của nước Nhật. Cảnh tuyết mùa đông cũng rất đặc sắc.)',
      ],
    },
    neutral: {
      vn: [
        'Mùa nào cũng vậy thôi em, đi làm trong nhà xưởng cả ngày nên ít khi để ý thời tiết.',
        'Trời ấm thì dễ chịu hơn chút, nhưng mùa nào thì sáng sớm cũng phải dậy đi làm đúng giờ.',
        'Nghe dự báo mai trời mưa to và gió lạnh, nhớ mang theo áo mưa và ô đi làm là được.',
      ],
      jp: [
        '「今日は過ごしやすい気温ですね。季節の変わり目は風邪を引かないように注意です」 (Hôm nay nhiệt độ khá dễ chịu. Thời điểm giao mùa bạn chú ý kẻo bị cảm lạnh nhé.)',
        '「日本の夏は湿度が高くて蒸し暑いですね。まあ、エアコンがあれば乗り切れますよ」 (Mùa hè Nhật Bản ẩm và oi bức lắm. Cơ mà có máy điều hòa thì cũng vượt qua được thôi.)',
        '「明日は天気が崩れる予報ですね。折りたたみ傘を持ってお出かけした方がいいですよ」 (Dự báo mai thời tiết sẽ xấu đi đấy. Bạn nên mang theo ô gấp khi ra ngoài nhé.)',
      ],
    },
    dislike: {
      vn: [
        'Mùa đông bên này lạnh buốt đến thấu xương, cóng hết ngón tay ngón chân, sợ phát khiếp!',
        'Mùa hè oi ả ngột ngạt kinh khủng, mặc đồ bảo hộ trong xưởng mồ hôi chảy ròng ròng ướt sũng.',
        'Mưa dầm dề buốt giá mà phải đạp xe đi làm thì đúng là cực hình, ghét thời tiết này ghê.',
      ],
      jp: [
        '「花粉症が本当にひどくて春は大嫌いです…目がかゆくて鼻水も止まらないんですよ」 (Dị ứng phấn hoa nặng làm tôi cực ghét mùa xuân... Mắt ngứa mũi chảy không ngừng.)', // ⚠️
        '「私は寒さに本当に弱くてね…冬は朝起きるだけでも拷問のように感じてしまいます」 (Tôi chịu lạnh kém vô cùng... Vào mùa đông, chỉ việc thức dậy buổi sáng đã như tra tấn rồi.)',
        '「蒸し暑い夏は熱中症の危険もあるし、体がだるくなるので本当に苦手なんですよ」 (Mùa hè oi bức dễ bị say nắng lại mệt mỏi rã rời, tôi thực sự rất sợ mùa này.)',
      ],
    },
  },
  {
    id: 'dream', icon: '🌟', label: 'Ước mơ, tương lai',
    ask: [
      'Sau này kết thúc hợp đồng về nước, bạn đã ấp ủ dự định gì cho tương lai chưa?',
      'Mục tiêu lớn nhất và động lực thôi thúc bạn sang Nhật Bản làm việc là gì thế?',
      'Anh/chị có dự định thi lên visa Kỹ năng đặc định để gắn bó lâu dài ở đây không?',
    ],
    like: {
      vn: [
        'Em cố gắng tích lũy vốn liếng, về quê sẽ mở một tiệm sửa xe hoặc xưởng cơ khí nhỏ!',
        'Anh đang quyết tâm ôn thi lấy chứng chỉ N2 để chuyển sang visa Tokutei ở lại làm tiếp.', // ⚠️
        'Ước mơ của em là gom đủ tiền sửa sang nhà cửa cho bố mẹ rồi mới tính chuyện lập gia đình.',
      ],
      jp: [
        '「将来は自分のお店を持つのが夢なんです！そのために今できる努力を重ねています」 (Ước mơ của tôi là mở tiệm riêng! Vì thế tôi đang nỗ lực từng ngày để chuẩn bị cho nó.)',
        '「{me}さんの目標、すごく素敵ですね！努力は裏切らないから応援していますよ」 (Mục tiêu của {me} thật tuyệt vời! Nỗ lực sẽ không phụ lòng người, tôi luôn ủng hộ bạn.)',
        '「いつか海外へ旅に出て色々な文化を体験したいです。夢を持つと前向きになれますね」 (Ước gì có ngày đi du lịch nước ngoài trải nghiệm văn hóa. Có ước mơ làm ta lạc quan hơn.)',
      ],
    },
    neutral: {
      vn: [
        'Trước mắt cứ làm tốt công việc hàng ngày tích lũy từng tháng, chuyện tương lai để sau tính.',
        'Hết hợp đồng rồi tính tiếp em ơi, tùy tình hình xem có cơ hội ở lại không thì quyết định.',
        'Cũng chưa có mục tiêu gì to tát, đi làm kiếm tiền trang trải cuộc sống ổn định là mừng rồi.',
      ],
      jp: [
        '「将来の計画はまだ白紙ですね。今は目の前の仕事を堅実にこなすだけで精一杯です」 (Kế hoạch tương lai tôi vẫn để ngỏ. Giờ chỉ cố gắng làm chắc chắn việc trước mắt thôi.)',
        '「大きな夢は特にないですが、平穏無事に暮らせる日常が続けばそれで満足ですよ」 (Tôi không có ước mơ lớn lao gì, chỉ mong những ngày tháng bình yên êm ả là mãn nguyện rồi.)',
        '「焦って目標を決めなくてもいいと思いますよ。マイペースに進むのが一番確実です」 (Tôi nghĩ không cần phải vội vàng đặt mục tiêu đâu. Cứ túc tắc tiến bước là chắc chắn nhất.)',
      ],
    },
    dislike: {
      vn: [
        'Nợ chi phí đi Nhật lo còn chưa trả hết, mơ mộng tương lai làm gì cho thêm xót xa em ơi.',
        'Mỗi ngày trôi qua chật vật mỏi mệt lắm rồi, đừng ép em phải nghĩ đến tương lai mù mịt nữa.',
        'Bao nhiêu kỳ vọng hồi ở nhà sang đây vỡ mộng hết rồi, giờ chỉ mong hết hạn được về sớm thôi.',
      ],
      jp: [
        '「夢だなんて…そんなキラキラした理想を語れるほど、私の人生は甘くないですよ」 (Ước mơ sao... Cuộc đời tôi đâu có màu hồng để mà bàn về những lý tưởng lấp lánh như thế.)',
        '「将来のことを考えると先行きが不安で暗い気持ちになるので、考えないようにしてます」 (Nghĩ đến tương lai chỉ thấy bất an và u tối, nên tôi cố gắng không nghĩ tới nó nữa.)',
        '「他人に自分の将来や進路について詮索される筋合いはありません。放っておいてください」 (Người khác không có quyền can thiệp săm soi tương lai của tôi. Xin để tôi yên.)',
      ],
    },
  },
];
