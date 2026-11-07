# Nhật Ký TTS 2D — Thiết kế v3: "Sống ở Nhật" (life simulation)

> Tài liệu thiết kế trước khi triển khai. Mỗi hệ thống có dữ liệu, trạng thái, điều kiện kích hoạt và hậu quả liên kết với hệ thống khác.
> Ký hiệu: ✅ = đã có ở v2 · ♻️ = có nhưng phải làm lại · 🆕 = mới · ⚠️ = cần kiểm chứng thông tin khi triển khai.

---

## 0. Các quyết định cần chốt

| # | Quyết định | Đề xuất |
|---|---|---|
| D1 | Lịch | **1 năm = 12 tháng = 84 ngày chơi; 1 tuần (T2→CN) = 1 tháng.** Năm bắt đầu tháng 4. Lương, tiền nhà, hóa đơn, trả góp tính **theo tháng** vào Chủ Nhật. |
| D2 | Nội dung người lớn | Tình dục có đồng thuận giữa người trưởng thành được mô tả **không chi tiết (chuyển cảnh)**. Có **công tắc "Nội dung 18+"**, mặc định **tắt**. Khi tắt: vẫn còn hẹn hò, yêu, cưới, mang thai sau khi kết hôn; ẩn ngoại tình và quan hệ ngoài hôn nhân. Nâng nhãn tuổi của game lên **18+** khi công tắc bật. |
| D3 | Lưu game | Giữ một key trong `localStorage`, nâng `v: 3`, có `migrate()` từ v1/v2. Ngày tuyệt đối của save cũ được quy đổi theo tỉ lệ 84/56. |
| D4 | Kiến trúc | Thêm 4 lõi dùng chung: **lịch**, **sổ cái tài chính**, **bus sự kiện**, **bộ nhớ NPC**. Mọi hệ thống đọc/ghi qua các lõi này thay vì sửa thẳng `S.money`, `S.people`… |

---

## 1. Hiện trạng (v2)

**Module:** khoảng 3.900 dòng JS thuần, không có bước build.

| Nhóm | File | Vai trò |
|---|---|---|
| Lõi | `state.js` (trạng thái, lịch 56 ngày, `applyFx`, save/migrate), `engine.js`, `input.js`, `ui.js` (`modal`, `chips`, HUD), `audio.js`, `pixel.js` | |
| Thế giới | `town.js` (bản đồ, NPC đứng đường, ngày/đêm, `objective`), `places.js` (9 địa điểm + menu) | |
| Vòng ngày | `days.js` (ngủ, ngày mới, lĩnh lương tuần, ốm, kết thúc), `events.js` (sự kiện cố định theo ngày trong năm + ngẫu nhiên) | |
| Nghề | `work.js` (ca trắc nghiệm / mini-game), `career.js` (visa TTS1→PR, thi tay nghề), `content/work.js`, `mini/*` | |
| Học | `learning.js` (N5→N1, chuỗi đúng, ôn câu sai), `quiz.js`, `exam.js` (JLPT), `content/jlpt.js` | |
| Xã hội | `social.js` (thân thiết 0–100, 4 mức, quà, đi ăn), `content/people.js` (10 NPC), `community.js` (lừa đảo, vay nóng), `phone.js` | |
| Gia đình | `romance.js` (1 người yêu, tỏ tình→cưới→con), `family.js` (hài lòng gia đình, sự kiện, về thăm nhà) | |

**Trạng thái `S` hiện có:** `day, time, money, debt (VND), wage, health, energy, full, mood, rep, lang, certs, exam, skill, career, settings, sick, worked, today, flags, inv, rel, people, love, kids, family, loan, scams, stats, learned, log, pos…`

---

## 2. Trùng lặp và xung đột phải dọn trước

| Vấn đề | Hiện tại | Hướng xử lý |
|---|---|---|
| Hai hệ quan hệ | `S.rel` (v1, chỉ đếm) và `S.people` (v2) | Bỏ `S.rel`, gộp vào `S.npc[id]` |
| Hai hệ "vay" | `S.loan` (vay nóng) và nợ quê `S.debt` | Gộp vào **sổ cái**: `S.fin.debts[]` (ngân hàng, người quen, cho vay nặng lãi, nợ quê) |
| Tiền một con số | `S.money` bị sửa trực tiếp ở hơn 40 chỗ | Tách **tiền mặt** + **tài khoản ngân hàng**. Mọi thay đổi đi qua `fin.tx()` để có lịch sử giao dịch |
| Lương theo tuần | `payday()` mỗi Chủ Nhật, tính trên từng ca | **Lương tháng**: lương cơ bản theo hợp đồng × số ngày công + tăng ca − khấu trừ thật |
| Một nơi làm duy nhất | `S.job` là chuỗi `factory/farm/build`, một tòa nhà `work` | `S.job = {companyId, roleId, rank, contract…}`; nhiều công ty trên bản đồ |
| Một người yêu duy nhất | `S.love = {id, stage}` | `S.romance[id]` cho **từng NPC** (cho phép quan hệ song song, ngoại tình, chia tay rồi quay lại) |
| Lịch NPC viết cứng | `AVAIL` + `npcPos()` | **Bảng lịch trình** dữ liệu cho mỗi NPC theo thứ/giờ, có ngoại lệ (ốm, đi chơi với người chơi, nghỉ phép) |
| Sự kiện rời rạc | `sidejob`, `chuiAd` (events.js) trùng ý với `community.js` | Gộp thành hệ **"Lời mời / Cơ hội"** (`offers`) có nguồn là NPC và để lại ký ức |
| Từ bà Sato dạy | `S.learned` tách khỏi hệ học | Gộp vào `S.lang` (từ đã gặp) |
| Lịch 56 ngày | `YEAR_DAYS = 56`, các sự kiện, kỳ thi, visa tính theo đó | Lịch 84 ngày (mục 3), quy đổi save |

---

## 3. Thời gian mới: 84 ngày = 12 tháng

### 3.1 Quy ước

```
ngày trong năm  doy = 1..84
tháng           monthIdx = floor((doy-1)/7)         // 0 = tháng 4 … 11 = tháng 3
tháng hiển thị  ((3 + monthIdx) % 12) + 1
thứ             (day-1) % 7                         // 0 = Thứ Hai … 6 = Chủ Nhật  → mỗi tháng = đúng 1 tuần
mùa             Xuân = T4–T6 (doy 1–21) · Hạ = T7–T9 (22–42) · Thu = T10–T12 (43–63) · Đông = T1–T3 (64–84)
```

### 3.2 Lịch sự kiện cố định (theo doy)

| Sự kiện | Tháng thật | doy |
|---|---|---|
| Nhập cảnh / bắt đầu năm tài chính | 4 | 1 |
| Hanami (夜桜 sau ca) | 4 | 4 |
| Golden Week (nghỉ) | 5 | 8–10 |
| Mùa mưa | 6 | 15 |
| **Thi JLPT tháng 7** (Chủ Nhật đầu tháng 7) | 7 | 28 → đặt **CN tuần tháng 7 = doy 28** |
| Lễ hội mùa hè / Obon | 8 | 34–35 |
| Động đất diễn tập / bão | 9 | 38–40 |
| Lá đỏ | 11 | 50 |
| **Thi JLPT tháng 12** | 12 | 63 (CN) |
| Tất niên 忘年会 | 12 | 61 |
| Giao thừa / 初詣 | 12–1 | 63–64 |
| Tết Việt Nam (về thăm nhà) | 1–2 | 66–75 (âm lịch, dao động) |
| Khai thuế / 住民税 | 6 | 15–21 |

Đăng ký JLPT: kỳ tháng 7 mở ở tháng 4–5 (doy 1–14); kỳ tháng 12 mở ở tháng 8–9 (doy 29–42) ⚠️. Kết quả: tháng 8 (doy 29–35) và tháng 2 (doy 71–77).

### 3.3 Kinh tế theo tháng (số liệu thật, làm tròn) ⚠️

| Khoản / tháng | TTS | KNĐĐ số 1 | Kỹ sư (技人国) |
|---|---|---|---|
| Lương gộp (総支給) | 170.000–200.000¥ | 200.000–250.000¥ | 230.000–350.000¥ |
| Bảo hiểm xã hội (~15%) | −26.000 | −33.000 | −40.000 |
| Thuế thu nhập | −3.000 | −4.500 | −6.000 |
| Thuế cư trú (từ năm 2) | −5.000 | −8.000 | −12.000 |
| Tiền nhà | −20.000 (ký túc xá) | −35.000 | −55.000 |
| Điện, nước, gas, mạng | −10.000 | −12.000 | −14.000 |
| Ăn uống cơ bản | −30.000 | −35.000 | −40.000 |

**Đơn giản hóa:** mỗi ngày chơi đại diện cho khoảng 4 ngày thật, nên chi phí sinh hoạt cơ bản được trừ tự động theo tháng. Mua đồ trong ngày (bento, quà, hẹn hò) là chi tiêu thêm. Giá từng món giữ như ngoài đời.

### 3.4 Quy đổi save cũ (v2 → v3)

Mọi trường "ngày tuyệt đối" được nhân 1,5 và làm tròn (56 → 84):
`day, career.start/end/history[].day/passed/tried/ssw1Start, exam, people[].last/talked/gift/msg, love.since/lastDate/engaged/married/pregnant.start, kids[].born/seen, family.lastRemit/lastCall/events, loan.due, log[].d`.

Sau khi quy đổi, đưa `day` về **Thứ Hai gần nhất** để lịch tháng khớp với tuần. Viết test tự động: tạo save v2 giả → load → kiểm tra năm/tháng/visa còn hạn đúng.

---

## 4. Lõi dùng chung (v3.0)

### 4.1 Bus sự kiện

```js
bus.on('day:start', fn) · bus.on('month:end', fn) · bus.on('shift:done', fn)
bus.emit('romance:stage', {id, from, to}) · bus.emit('fin:tx', tx) · bus.emit('npc:memory', {...})
```

`days.js` không gọi trực tiếp từng hệ thống nữa: nó phát `day:start`, `month:end`, `year:start`. Mỗi hệ thống tự đăng ký xử lý theo thứ tự ưu tiên (visa → tài chính → gia đình → tình cảm → xã hội → sự kiện ngẫu nhiên). Hàng đợi hộp thoại buổi sáng gom tất cả thông báo vào **một màn tóm tắt** kèm tối đa 1–2 sự kiện cần lựa chọn, để không bị spam hộp thoại.

### 4.2 Sổ cái tài chính

```js
S.fin = {
  cash: 30000,                                  // tiền mặt (¥)
  accounts: [{ id:'yucho', type:'bank', bal:0 }, { id:'nisa', type:'nisa', holdings:[] }],
  tx: [{ day, acc, amt, cat:'salary|rent|food|remit|loan|invest|gift|date|child|…', memo, ref }], // giữ 300 dòng gần nhất + tổng hợp tháng
  debts: [{ id, kind:'home|bank|card|friend|shark', lender, principal, rate, due, paid, status }],
  receivables: [{ npcId, amount, due, status }],   // tiền người chơi cho NPC vay
  assets: [{ id:'bike|car|laptop|ring|…', value, bought }],
  credit: 600,                                  // điểm tín dụng (ảnh hưởng vay, thuê nhà)
}
fin.tx(S, amt, cat, memo)   // ← hàm DUY NHẤT được phép đổi số dư
```

### 4.3 NPC: hồ sơ, lịch trình, bộ nhớ

```js
NPC_DEF[id] = { name, gender, age, nationality:'jp|vn|…', orientation:'hetero|homo|bi',
  traits:{ jealousy, loyalty, money, ambition, kindness },    // 0..1, cố định
  job:{ companyId, role }, home:'dorm|apt…',
  schedule:{ weekday:[[7,'work'],[18,'konbini'],[22,'home']], sat:[…], sun:[…] },
  likes:[…], dislikes:[…], romanceable:true }
S.npc[id] = { met, aff, trust, mood, last, memory:[{day, tag, w}], flags:{}, debtToPlayer, status:'ok|sick|away|moved' }
```

- **Lịch trình:** mỗi khung giờ có địa điểm. Bị ghi đè khi NPC ốm, đi chơi với người chơi, nghỉ phép hay chuyển nhà. Bản đồ chỉ vẽ NPC theo lịch.
- **Bộ nhớ:** chuỗi thẻ có trọng số, ví dụ `helped_when_sick +3`, `borrowed_not_repaid −5`, `cheated −10`, `stood_up −2`. Trọng số giảm dần theo thời gian (trừ thẻ "vĩnh viễn"). Bộ nhớ quyết định câu thoại, khả năng chấp nhận lời mời / cho vay / giới thiệu việc, và sức lan của tin đồn.

---

## 5. Dating Simulator (làm lại)

### 5.1 Chỉ số riêng cho mỗi cặp `S.romance[id]`

| Chỉ số | Ý nghĩa | Tăng khi | Giảm khi |
|---|---|---|---|
| **Affection** | yêu mến | nói chuyện, quà hợp sở thích, hẹn hò vui | bỏ bê, cãi nhau |
| **Trust** | tin tưởng | giữ lời hẹn, thành thật, trả nợ | nói dối, lỡ hẹn, bị phát hiện ngoại tình |
| **Attraction** | hấp dẫn | ngoại hình, sức khỏe, tinh thần, sự nghiệp, tiếng Nhật (với NPC Nhật) | mệt mỏi, nghèo túng kéo dài, lôi thôi |
| **Intimacy** | gần gũi | hẹn hò riêng, chia sẻ tâm sự, (18+) gần gũi thể xác | xa cách lâu |
| **Commitment** | cam kết | thời gian bên nhau, sống chung, ra mắt gia đình | tránh né chuyện tương lai |
| **Jealousy** | ghen | thấy người chơi thân với NPC khác, tin đồn | trấn an, minh bạch (theo tính ghen của NPC) |

Mỗi chỉ số trong khoảng 0–100. Điều kiện chuyển giai đoạn dùng **tổ hợp** chỉ số, không chỉ một con số.

### 5.2 Máy trạng thái

```
STRANGER ─gặp─▶ ACQUAINTANCE ─aff≥30─▶ FRIEND ─(aff≥55 ∧ attr≥50) hẹn riêng─▶ DATING
DATING ─tỏ tình được nhận (aff≥65 ∧ trust≥50 ∧ attr≥55)─▶ LOVERS
LOVERS ─intimacy≥60 ∧ trust≥60 [∧ 18+ bật cho cảnh thân mật]─▶ INTIMATE
INTIMATE ─commit≥60─▶ COHABITING (thuê nhà chung)   ─commit≥75─▶ ENGAGED ─đăng ký─▶ MARRIED
mọi trạng thái từ DATING trở lên ─trust<25 hoặc aff<35 hoặc bị phát hiện ngoại tình─▶ BREAKUP (cooldown, có thể quay lại nếu trust hồi phục)
MARRIED ─khủng hoảng kéo dài─▶ SEPARATED ─▶ DIVORCED (hậu quả visa nếu là 配偶者ビザ)
```

100% không phải kết thúc. Sau mỗi giai đoạn lại mở thêm: sống chung (chia tiền nhà, việc nhà, va chạm thói quen), ra mắt hai gia đình, du lịch chung, kế hoạch sinh con, mua nhà, về Việt Nam ra mắt…

### 5.3 Hẹn hò

Có địa điểm hẹn hò (đặt chỗ, giá, giờ mở cửa, hợp sở thích ai): công viên, quán cà phê, izakaya, karaoke, rạp phim, thủy cung (đi tàu), onsen (2 ngày), lễ hội theo mùa, nhà riêng. Mỗi buổi hẹn có mini-hội thoại: chọn chủ đề → phản ứng theo sở thích và tính cách NPC → cộng/trừ chỉ số. Đến muộn hay hủy hẹn sẽ trừ trust và để lại ký ức.

### 5.4 Tin nhắn chủ động từ NPC

Hàng đợi `S.inbox`. NPC tự nhắn dựa trên lịch trình, tâm trạng và chỉ số: rủ đi chơi, hỏi thăm, ghen, đòi nợ, mời việc, tin đồn. Có hạn trả lời: không trả lời thì trừ affection và trust tùy tính cách.

### 5.5 Gần gũi, tránh thai, nguy cơ mang thai (chỉ khi 18+ bật)

- Luôn có **bước đồng thuận rõ ràng**: NPC có thể từ chối. Từ chối không bị phạt chỉ số.
- **Không mô tả chi tiết**, chỉ chuyển cảnh.
- Lựa chọn tránh thai:

| Cách | Nguy cơ mang thai trong game | Ghi chú thực tế |
|---|---|---|
| Không dùng | cao | |
| Bao cao su | thấp | mua ở konbini |
| Thuốc uống hằng ngày | rất thấp | cần đơn bác sĩ ở Nhật ⚠️ |
| Thuốc khẩn cấp | giảm | quy định bán tại nhà thuốc đang thay đổi ⚠️ |

- Có thai ngoài dự định → chuỗi quyết định có hậu quả: nói với người kia, phản ứng của họ dựa trên commitment, gia đình, công việc, visa.

### 5.6 Ngoại tình, ghen tuông, quan hệ song song

- Hai mối quan hệ cùng ở DATING trở lên → cờ "song song".
- Mỗi ngày có xác suất bị phát hiện. Xác suất này tăng khi hai người có chung mạng lưới (cùng công ty, cùng hội), hẹn ở nơi công cộng, hoặc có tin đồn.
- Bị phát hiện: trust giảm mạnh, có thể chia tay; tin đồn lan trong nhóm xã hội; nếu đã kết hôn thì có thể ly thân/ly hôn và chịu hậu quả visa.

### 5.7 Quan hệ đồng giới

- NPC có xu hướng tính dục riêng. Người chơi chọn "quan tâm: nam / nữ / cả hai".
- **Thực tế pháp lý:** Nhật chưa công nhận hôn nhân đồng giới. Nhiều địa phương có 「パートナーシップ制度」 (chứng nhận đối tác) nhưng **không có giá trị cấp visa** ⚠️. Việt Nam cũng không công nhận. Vì vậy cặp đồng giới **không có tuyến visa vợ/chồng** nhưng có tuyến "chứng nhận đối tác", sống chung, nhận nuôi (đơn giản hóa).

### 5.8 Quan hệ với cấp trên và đồng nghiệp

- Yêu đồng nghiệp: tin đồn trong công ty, ảnh hưởng uy tín. Chia tay thì làm việc cùng nhau rất khó xử.
- Quan hệ với cấp trên: rủi ro **quấy rối quyền lực (パワハラ/セクハラ)**. Game không thưởng cho việc "lên chức nhờ quan hệ". Nếu người chơi bị cấp trên ép buộc → tuyến báo cáo (phòng nhân sự, nghiệp đoàn, OTIT, công đoàn), có hậu quả cho kẻ quấy rối.

---

## 6. Career Simulator

### 6.1 Thị trường việc làm

Thêm khu "thành phố" (đi tàu từ ga thị trấn mới) hoặc dùng **app tìm việc** trên điện thoại cho các công ty ở xa. Mỗi công ty:

```js
COMPANY[id] = { name, sector:'it|electric|factory|food|construction|care|logistics', location,
  visaOK:['ssw1','ssw2','eng','spouse','pr'], culture:{ overtime, strict, foreignFriendly },
  roles:[{ id, title, req:{ jp:'N3', certs:['電気工事士2種'], skill:{electric:40}, exp:12 /*tháng*/ },
           pay:{ base:230000, ot:1.25, bonus:2 /*tháng lương/năm*/ }, ranks:['一般','主任','係長','課長'] }],
  staff:[npcIds], openings: () => [...] /* tin tuyển dụng thay đổi theo tháng */ }
S.job = { companyId, roleId, rank, since, contract:'tts|fixed|permanent', probation:true, perf:0..100, otHours, warnings:0 }
S.skills = { factory, food, construction, electric, it, care, … }   // kinh nghiệm theo ngành (thay cho S.skill[job])
S.certs = [...]   // JLPT, 技能検定, 電気工事士2種, 基本情報技術者, フォークリフト, 普通免許…
```

### 6.2 Máy trạng thái việc làm

```
BROWSE ─nộp hồ sơ (đủ req ∧ visa cho phép đổi việc)─▶ APPLIED ─▶ INTERVIEW (trắc nghiệm hội thoại + kính ngữ + tay nghề)
INTERVIEW ─đỗ─▶ OFFER ─nhận─▶ (thủ tục visa nếu cần) ─▶ PROBATION (3 tháng) ─perf≥60─▶ REGULAR
REGULAR ─perf cao ∧ thâm niên ∧ chứng chỉ─▶ PROMOTION ─▶ rank+1, lương tăng, quản lý người khác
REGULAR ─nghỉ (báo trước 1 tháng) / bị cho nghỉ (warnings≥3) ─▶ UNEMPLOYED
UNEMPLOYED ─▶ phải tìm việc trong 3 tháng nếu visa lao động, nếu không thì rủi ro visa ⚠️
```

**Ràng buộc visa (thực tế):**
- TTS: về nguyên tắc **không được tự đổi chỗ làm** (trừ trường hợp đặc biệt như công ty phá sản hay bị ngược đãi).
- KNĐĐ số 1/số 2: đổi được trong cùng lĩnh vực, phải làm thủ tục đổi tư cách lưu trú; muốn sang lĩnh vực khác phải thi đỗ kỹ năng lĩnh vực đó.
- Kỹ sư (技人国): cần bằng đại học / 専門士 đúng chuyên ngành (hoặc nhiều năm kinh nghiệm). **Tuyến game:** học trường nghề buổi tối/cuối tuần 2 năm → 専門士 → mở công ty IT / điện ⚠️.
- Vợ/chồng, thường trú: làm việc gì cũng được.

### 6.3 Nhiệm vụ và thăng tiến

Mỗi tháng có "dự án / chỉ tiêu" theo vai trò, ví dụ: không tai nạn, tỉ lệ lỗi, đào tạo người mới, hoàn thành sprint (IT). Kết quả được tính từ ca làm trắc nghiệm, tăng ca và mối quan hệ với quản lý. Thăng chức thì lương tăng, có thêm trách nhiệm (quản lý TTS mới, xử lý xung đột) và mở các sự kiện mới.

---

## 7. Social Simulator

| Tính năng | Dữ liệu | Liên kết |
|---|---|---|
| Rủ đi chơi (2 chiều) | inbox, lịch NPC | tình cảm, tài chính, tâm trạng |
| Nhờ vay / cho vay / đòi nợ | `fin.receivables`, `fin.debts(kind:friend)` | NPC trả đúng hạn hay không tùy tính cách và tình hình tài chính; đòi nợ quá gắt thì mất bạn; ghi vào bộ nhớ |
| Giới thiệu việc | thẻ `referral` từ NPC thân, có ngành | mở tin tuyển dụng ẩn, cộng điểm phỏng vấn |
| Rủ đầu tư | `offers` | cổ phiếu thật (an toàn hơn), góp vốn kinh doanh (rủi ro), đa cấp / lừa đảo (mất trắng) |
| Tin đồn | `S.rumors[{about, topic, spread, truth}]` | lan theo nhóm (công ty, ký túc xá, hội Việt); ảnh hưởng uy tín, trust, ghen tuông; dập bằng cách thành thật hoặc nhờ người có uy tín |
| Mâu thuẫn | sự kiện giữa NPC với NPC hoặc NPC với người chơi | đứng về phía ai thì ảnh hưởng hai mối quan hệ |
| Ngoại tình của NPC | NPC có thể phản bội người chơi (tùy loyalty) | bị phát hiện qua tin đồn hoặc tin nhắn |

---

## 8. Economic Simulator (app ngân hàng)

| Chức năng | Cơ chế | Thực tế ⚠️ |
|---|---|---|
| Nhận lương | công ty chuyển khoản vào tài khoản, có phiếu lương chi tiết | lương ở Nhật trả qua ngân hàng |
| Chuyển tiền về VN | phí, tỷ giá dao động theo tháng, kênh hợp pháp / kênh chui | |
| Tiết kiệm | lãi gần 0 (thực tế lãi tiết kiệm ở Nhật rất thấp) | |
| Vay ngân hàng | xét visa, thời gian ở Nhật, thu nhập, điểm tín dụng | người nước ngoài visa ngắn hạn rất khó vay; lãi tối đa 15–20%/năm theo 利息制限法 |
| Thẻ tín dụng | hạn mức, trả chậm thì trừ điểm tín dụng | |
| Đầu tư | quỹ chỉ số (biến động thấp, kỳ vọng dương), cổ phiếu riêng lẻ (biến động cao), mô phỏng giá theo tháng | |
| NISA | tài khoản miễn thuế: 1,2 triệu¥/năm (tích lũy) + 2,4 triệu¥/năm (tăng trưởng), tổng tối đa 18 triệu¥ | người nước ngoài cư trú ở Nhật mở được |
| Vé số | Jumbo, Loto: giá vé, tỉ lệ trúng rất thấp, tỉ lệ hoàn trả dưới 50% | |
| Tài sản | xe đạp, xe máy, ô tô (cần bằng lái, bãi đỗ, bảo hiểm), laptop, đồ gia dụng, nhà | |

Mọi giao dịch đều được ghi trong lịch sử, có báo cáo tháng (thu, chi theo nhóm, tổng tài sản ròng).

---

## 9. Family Simulator

| Mảng | Nội dung | Thực tế ⚠️ |
|---|---|---|
| Vợ chồng | chỉ số quan hệ tiếp tục chạy sau cưới; việc nhà, tiền nong, gia đình hai bên, thời gian cho nhau | |
| Mang thai | 3 giai đoạn, khám thai, ốm nghén, nghỉ việc nhẹ | sổ mẹ con 母子手帳; trợ cấp sinh 出産育児一時金 khoảng 500.000¥ |
| Nghỉ thai sản | 産休: 6 tuần trước sinh, 8 tuần sau sinh, nhận 2/3 lương; nghỉ chăm con 育休 đến khi con 1 tuổi, nhận khoảng 67% lương rồi 50% | áp dụng cả lao động nước ngoài có bảo hiểm |
| Trẻ em | lớn theo năm game; nhà trẻ 保育園 (0–2 tuổi tốn phí, 3–5 tuổi miễn phí), tiểu học, trung học; trợ cấp nuôi con 児童手当 | |
| Visa của con | bố mẹ là TTS / KNĐĐ số 1 thì con không ở cùng được; KNĐĐ số 2, kỹ sư, vợ/chồng, thường trú thì được | |
| Bố mẹ ở quê | sức khỏe giảm theo năm, ốm đau, cần người chăm, xây nhà, em đi học | |
| Gửi tiền | hài lòng gia đình + trả nợ + quỹ riêng | |
| Quyết định lớn | ở lại Nhật lâu dài, hay về Việt Nam (mang theo tiết kiệm, kỹ năng, mở xưởng, làm cho công ty Nhật ở VN) | **Kết thúc mở**: nhiều kết cục theo tổng hợp các hệ thống |

---

## 10. Liên kết giữa các hệ thống (ví dụ chuỗi hậu quả)

| Nguồn | Tác động | Đích |
|---|---|---|
| Thăng chức (Career) | lương tăng → Attraction ↑ | Dating, Economy |
| Tăng ca nhiều (Career) | ít hẹn hò → Intimacy ↓, Jealousy ↑ | Dating, Health |
| Ngoại tình bị lộ (Dating) | tin đồn lan trong công ty → uy tín ↓ → bị đánh giá thấp | Social, Career |
| Ly hôn với người Nhật (Family) | mất cơ sở visa vợ/chồng → phải đổi tư cách lưu trú | Career, Visa |
| Cho bạn vay không đòi được (Social) | số dư ↓, bộ nhớ NPC "nợ" → bạn tránh mặt | Economy, Social |
| Vay nặng lãi (Economy) | đòi nợ, đe dọa → tinh thần ↓, có thể bị công ty biết | Social, Career |
| Có con (Family) | chi phí ↑; con ở VN vì visa → nhớ con, về thăm nhà | Economy, Visa, Mood |
| N2 + 専門士 (Learning) | mở việc IT, kỹ sư → visa kỹ sư → bảo lãnh gia đình | Career, Family |
| Đầu tư thua lỗ (Economy) | stress → cãi nhau với người yêu | Dating |

---

## 11. Lộ trình phiên bản

Mỗi phiên bản đều chơi được, có test tự động, có migrate save, và được đẩy lên GitHub Pages.

| Bản | Phạm vi | File chính | Kiểm tra |
|---|---|---|---|
| **v3.0 Lõi** | Lịch 84 ngày / 12 tháng; bus sự kiện; sổ cái `fin` (tiền mặt + tài khoản, nợ quê vào `debts`); lương tháng với khấu trừ thật; `S.npc` + lịch trình + bộ nhớ (chuyển dữ liệu từ `people`/`rel`); màn tóm tắt buổi sáng; migrate v2 → v3; dọn các trùng lặp ở mục 2 | `calendar.js`, `bus.js`, `finance.js`, `npc.js`, `state.js`, `days.js` | save v1/v2 → v3; mô phỏng 3 năm không lỗi; số dư khớp tổng giao dịch |
| **v3.1 Kinh tế** | App ngân hàng: lịch sử giao dịch, tiết kiệm, chuyển tiền (tỷ giá thay đổi), vay ngân hàng / thẻ / vay nặng lãi, quỹ, cổ phiếu, NISA, vé số, mua tài sản, báo cáo tháng | `bank.js`, `market.js`, `content/assets.js` | mô phỏng thị trường 10 năm; lãi vay đúng; NISA không vượt hạn mức |
| **v3.2 Nghề nghiệp** | Ga tàu + "thành phố"; 6 lĩnh vực, khoảng 12 công ty; app tìm việc; nộp hồ sơ, phỏng vấn, thử việc, thăng chức, nghỉ, bị đuổi; ràng buộc visa; chứng chỉ nghề; trường nghề → 専門士 → visa kỹ sư | `jobs.js`, `content/companies.js`, `career.js` | không đổi việc trái visa; lộ trình TTS → kỹ sư chạy được |
| **v3.3 Xã hội** | Inbox chủ động; rủ đi chơi 2 chiều; cho vay / mượn / đòi nợ; giới thiệu việc; mời đầu tư; tin đồn lan theo nhóm; mâu thuẫn; bộ nhớ ảnh hưởng thoại và quyết định | `social.js`, `rumor.js`, `inbox.js`, `content/npc.js` (mở rộng 25–30 NPC) | NPC nhớ đúng sự kiện; tin đồn lan và tắt dần |
| **v3.4 Tình cảm 2.0** | 6 chỉ số; máy trạng thái 5.2; địa điểm hẹn hò; công tắc 18+; đồng thuận; tránh thai; ghen, ngoại tình, quan hệ song song; đồng giới; tình công sở / cấp trên (kèm tuyến chống quấy rối) | `romance.js` (viết lại), `dates.js`, `content/dates.js` | mọi chuyển trạng thái đúng điều kiện; tắt 18+ thì không lộ nội dung người lớn |
| **v3.5 Gia đình 2.0** | Thai kỳ 3 giai đoạn, 産休/育休 và trợ cấp, con lớn lên (nhà trẻ → trường), 児童手当, bố mẹ già, sống chung, ly thân/ly hôn, quyết định ở lại hay về Việt Nam, nhiều kết cục | `family.js`, `children.js`, `endings.js` | chạy 15 năm game có con; chi phí và trợ cấp đúng bảng |

**Ước lượng:** mỗi bản khoảng 1 phiên làm việc. v3.0 lớn nhất vì phải đụng tới gần như mọi file.

---

## 12. Rủi ro và cách giảm

| Rủi ro | Cách giảm |
|---|---|
| Quá nhiều hộp thoại mỗi sáng | màn tóm tắt gom thông báo; chỉ dừng ở sự kiện cần lựa chọn |
| Số liệu pháp lý, thuế thay đổi theo năm | gom vào `content/law.js` có ghi năm tham chiếu; hiện "đơn giản hóa" trong game |
| Save cũ hỏng khi đổi lịch | migrate có test; giữ bản sao `nhatky-tts-2d-v1.bak` trước khi chuyển |
| Nội dung nhạy cảm | công tắc 18+ mặc định tắt; không mô tả chi tiết; luôn có đồng thuận; có tuyến hỗ trợ khi bị quấy rối |
| Cân bằng kinh tế | mô phỏng tự động hàng nghìn tháng trước khi phát hành mỗi bản |
