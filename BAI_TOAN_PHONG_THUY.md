# BÀI TOÁN TÍNH PHONG THỦY - HỆ THỐNG MINHTHUSIM

## 📋 TỔNG QUAN

Hệ thống tính phong thủy của MINHTHUSIM sử dụng phương pháp **Nạp Âm** truyền thống kết hợp với **Can Chi** và **12 Giờ Địa Chi** để phân tích mệnh số, tính cách, và vận mệnh của người dùng.

---

## 🔮 1. TÍNH MỆNH NGŨ HÀNH (NẠP ÂM)

### Nguyên lý
Nạp Âm là phương pháp tính mệnh dựa trên chu kỳ 60 năm (60 Giáp Tý). Mỗi năm trong chu kỳ tương ứng với một loại Nạp Âm cụ thể.

### Công thức
```javascript
position = (năm_sinh - 1924) % 60
mệnh = napAm[position]
```

### Bảng Nạp Âm 60 Năm (Ví dụ)
| Năm | Can Chi | Nạp Âm | Mệnh |
|-----|---------|---------|------|
| 1924, 1984 | Giáp Tý | Hải Trung Kim | Kim |
| 1925, 1985 | Ất Sửu | Hải Trung Kim | Kim |
| 1926, 1986 | Bính Dần | Lư Trung Hỏa | Hỏa |
| 1927, 1987 | Đinh Mão | Lư Trung Hỏa | Hỏa |
| 1928, 1988 | Mậu Thìn | Đại Lâm Mộc | Mộc |
| 1929, 1989 | Kỷ Tỵ | Đại Lâm Mộc | Mộc |
| 1930, 1990 | Canh Ngọ | Lộ Bàng Thổ | Thổ |
| ... | ... | ... | ... |

### 5 Mệnh Ngũ Hành
1. **Kim (金)** - Kim loại
2. **Mộc (木)** - Gỗ, cây cối
3. **Thủy (水)** - Nước
4. **Hỏa (火)** - Lửa
5. **Thổ (土)** - Đất

---

## 📅 2. TÍNH CAN CHI NĂM

### Công thức
```javascript
Can = ["Canh", "Tân", "Nhâm", "Quý", "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ"]
Chi = ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi"]

Can_Chi = Can[năm % 10] + " " + Chi[năm % 12]
```

### Ví dụ
- Năm 2024: Giáp Thìn
- Năm 2025: Ất Tỵ
- Năm 2026: Bính Ngọ

---

## 🎲 3. SỐ MAY MẮN

### Nguyên lý
Mỗi mệnh có 2 số cơ bản theo nguyên lý Hà Đồ - Lạc Thư, thêm số phụ dựa trên giới tính.

### Cơ sở lý thuyết
Theo Hà Đồ - Lạc Thư trong Dịch học:
- **Thiên nhất sinh Thủy** → Thủy = 1, 6
- **Địa nhị sinh Hỏa** → Hỏa = 2, 7
- **Thiên tam sinh Mộc** → Mộc = 3, 8
- **Địa tứ sinh Kim** → Kim = 4, 9
- **Thiên ngũ sinh Thổ** → Thổ = 5, 0

### Công thức tính
```javascript
function getLuckyNumbers(element, gender) {
  // Bước 1: Xác định số cơ bản theo mệnh
  const baseNumbers = {
    "Kim": [4, 9],    // Địa tứ sinh Kim, Thiên cửu thành Kim
    "Thủy": [1, 6],   // Thiên nhất sinh Thủy, Địa lục thành Thủy
    "Hỏa": [2, 7],    // Địa nhị sinh Hỏa, Thiên thất thành Hỏa
    "Thổ": [5, 0],    // Thiên ngũ sinh Thổ, Địa thập thành Thổ
    "Mộc": [3, 8]     // Thiên tam sinh Mộc, Địa bát thành Mộc
  };
  
  let numbers = [...baseNumbers[element]];
  
  // Bước 2: Thêm số phụ dựa trên giới tính
  if (gender === "male") {
    // Nam: Dương (+1 vào số đầu)
    numbers.push(numbers[0] + 1);
  } else {
    // Nữ: Âm (-1 vào số cuối)
    numbers.push(numbers[1] - 1);
  }
  
  // Bước 3: Lọc số hợp lệ (0-9)
  return numbers.filter(n => n >= 0 && n <= 9).slice(0, 3);
}
```

### Ví dụ tính toán

#### Ví dụ 1: Mệnh Kim - Nam
```
Số cơ bản: [4, 9]
Nam (+1): 4 + 1 = 5
Kết quả: [4, 9, 5]
```

#### Ví dụ 2: Mệnh Thủy - Nữ
```
Số cơ bản: [1, 6]
Nữ (-1): 6 - 1 = 5
Kết quả: [1, 6, 5]
```

#### Ví dụ 3: Mệnh Thổ - Nam
```
Số cơ bản: [5, 0]
Nam (+1): 5 + 1 = 6
Kết quả: [5, 0, 6]
```

#### Ví dụ 4: Mệnh Mộc - Nữ
```
Số cơ bản: [3, 8]
Nữ (-1): 8 - 1 = 7
Kết quả: [3, 8, 7]
```

### Bảng Số May Mắn Đầy Đủ
| Mệnh | Số Cơ Bản | Nam (+1) | Nữ (-1) | Giải thích |
|------|-----------|----------|---------|------------|
| Kim | 4, 9 | 4, 9, 5 | 4, 9, 8 | Địa tứ sinh Kim, Thiên cửu thành Kim |
| Thủy | 1, 6 | 1, 6, 2 | 1, 6, 5 | Thiên nhất sinh Thủy, Địa lục thành Thủy |
| Hỏa | 2, 7 | 2, 7, 3 | 2, 7, 6 | Địa nhị sinh Hỏa, Thiên thất thành Hỏa |
| Thổ | 5, 0 | 5, 0, 6 | 5, 0, 4 | Thiên ngũ sinh Thổ, Địa thập thành Thổ |
| Mộc | 3, 8 | 3, 8, 4 | 3, 8, 7 | Thiên tam sinh Mộc, Địa bát thành Mộc |

### Mức độ ưu tiên
1. **Số chính (Sinh)**: Số đầu tiên - quan trọng nhất
2. **Số phụ (Thành)**: Số thứ hai - quan trọng thứ hai
3. **Số bổ trợ**: Số thứ ba dựa trên giới tính - hỗ trợ

### Ứng dụng thực tế

#### 1. Chọn số điện thoại
```javascript
// Ví dụ: Mệnh Kim - Nam [4, 9, 5]
Sim tốt: 0984 999 555 (có cả 3 số may mắn)
Sim khá: 0912 345 949 (có 2 số may mắn)
Sim bình thường: 0987 654 321 (có 1 số may mắn)
```

#### 2. Chọn biển số xe
```javascript
// Ví dụ: Mệnh Thủy - Nữ [1, 6, 5]
Biển tốt: 51A-165.16 (có nhiều số may mắn)
Biển khá: 30B-156.78 (có 2-3 số may mắn)
```

#### 3. Chọn số nhà, tầng lầu
```javascript
// Ví dụ: Mệnh Hỏa - Nam [2, 7, 3]
Tầng tốt: Tầng 7, 27, 37
Số nhà tốt: Số 23, 72, 237
```

#### 4. Chọn ngày giờ quan trọng
```javascript
// Ví dụ: Mệnh Mộc - Nữ [3, 8, 7]
Ngày tốt: Ngày 3, 8, 13, 18, 23, 28
Giờ tốt: 3h, 7h, 8h, 13h, 17h, 18h
```

### Lưu ý quan trọng
⚠️ **Không nên dùng số xung khắc:**
- Mệnh Kim tránh số Hỏa (2, 7)
- Mệnh Thủy tránh số Thổ (5, 0)
- Mệnh Hỏa tránh số Thủy (1, 6)
- Mệnh Thổ tránh số Mộc (3, 8)
- Mệnh Mộc tránh số Kim (4, 9)

---

## 🎨 4. MÀU SẮC MAY MẮN

### Bảng Màu Sắc
| Mệnh | Màu May Mắn | Màu Nên Tránh |
|------|-------------|---------------|
| Kim | Trắng, Vàng, Nâu | Đỏ, Hồng |
| Thủy | Đen, Xanh dương, Xám | Vàng, Nâu |
| Hỏa | Đỏ, Hồng, Tím | Đen, Xanh dương |
| Thổ | Vàng, Nâu, Cam | Xanh lá |
| Mộc | Xanh lá, Xanh lơ, Xanh ngọc | Trắng, Vàng |

### Ứng dụng
- Chọn màu quần áo
- Chọn màu sơn nhà
- Chọn màu xe
- Chọn màu trang sức

---

## 🧭 5. HƯỚNG MAY MẮN

### Bảng Hướng
| Mệnh | Nam | Nữ |
|------|-----|-----|
| Kim | Tây, Tây Bắc | Tây, Tây Nam |
| Thủy | Bắc | Bắc, Đông Bắc |
| Hỏa | Nam | Nam, Đông Nam |
| Thổ | Trung tâm, Tây Nam | Trung tâm, Đông Bắc |
| Mộc | Đông, Đông Nam | Đông, Đông Bắc |

### Ứng dụng
- Hướng nhà, hướng cửa
- Hướng bàn làm việc
- Hướng giường ngủ
- Hướng đi du lịch, công tác

---

## ⏰ 6. 12 GIỜ ĐỊA CHI

### Bảng Giờ Địa Chi
| Giờ | Tên | Mệnh | Tính Cách |
|-----|-----|------|-----------|
| 23:00 - 01:00 | Tý | Thủy | Thông minh, linh hoạt |
| 01:00 - 03:00 | Sửu | Thổ | Chăm chỉ, kiên nhẫn |
| 03:00 - 05:00 | Dần | Mộc | Dũng cảm, quyết đoán |
| 05:00 - 07:00 | Mão | Mộc | Nhẹ nhàng, tinh tế |
| 07:00 - 09:00 | Thìn | Thổ | Mạnh mẽ, tự tin |
| 09:00 - 11:00 | Tỵ | Hỏa | Nhiệt huyết, năng động |
| 11:00 - 13:00 | Ngọ | Hỏa | Sáng tạo, lạc quan |
| 13:00 - 15:00 | Mùi | Thổ | Hiền lành, chu đáo |
| 15:00 - 17:00 | Thân | Kim | Thông minh, nhanh nhẹn |
| 17:00 - 19:00 | Dậu | Kim | Cẩn thận, tỉ mỉ |
| 19:00 - 21:00 | Tuất | Thổ | Trung thành, đáng tin |
| 21:00 - 23:00 | Hợi | Thủy | Hòa đồng, dễ gần |

### Ý nghĩa
Giờ sinh ảnh hưởng đến tính cách và vận mệnh. Kết hợp với mệnh năm sinh để phân tích tương sinh tương khắc.

---

## ♻️ 7. TƯƠNG SINH TƯƠNG KHẮC

### Quy Luật Tương Sinh (✅ Tốt)
```
Kim → Thủy → Mộc → Hỏa → Thổ → Kim
```

**Giải thích:**
- Kim sinh Thủy: Kim loại nóng chảy thành nước
- Thủy sinh Mộc: Nước nuôi cây
- Mộc sinh Hỏa: Gỗ sinh lửa
- Hỏa sinh Thổ: Lửa tạo tro (đất)
- Thổ sinh Kim: Đất chứa kim loại

### Quy Luật Tương Khắc (⚠️ Xung đột)
```
Kim → Mộc → Thổ → Thủy → Hỏa → Kim
```

**Giải thích:**
- Kim khắc Mộc: Rìu chặt cây
- Mộc khắc Thổ: Cây phá đất
- Thổ khắc Thủy: Đất ngăn nước
- Thủy khắc Hỏa: Nước dập lửa
- Hỏa khắc Kim: Lửa nóng chảy kim loại

### Bảng Tương Sinh Tương Khắc Chi Tiết

| Mệnh 1 | Mệnh 2 | Quan Hệ | Đánh Giá |
|--------|--------|---------|----------|
| Kim | Thủy | Sinh | ✅ Rất tốt |
| Kim | Mộc | Khắc | ⚠️ Cần cẩn trọng |
| Kim | Hỏa | Bị khắc | ⚠️ Khó khăn |
| Kim | Thổ | Được sinh | ✅ Tốt |
| Kim | Kim | Bình | ➖ Bình thường |
| Thủy | Mộc | Sinh | ✅ Rất tốt |
| Thủy | Hỏa | Khắc | ⚠️ Mâu thuẫn |
| Thủy | Thổ | Bị khắc | ⚠️ Trở ngại |
| Thủy | Kim | Được sinh | ✅ Tốt |
| Thủy | Thủy | Bình | ➖ Bình thường |
| Mộc | Hỏa | Sinh | ✅ Rất tốt |
| Mộc | Thổ | Khắc | ⚠️ Xung đột |
| Mộc | Kim | Bị khắc | ⚠️ Khó khăn |
| Mộc | Thủy | Được sinh | ✅ Tốt |
| Mộc | Mộc | Bình | ➖ Bình thường |
| Hỏa | Thổ | Sinh | ✅ Rất tốt |
| Hỏa | Kim | Khắc | ⚠️ Khó khăn |
| Hỏa | Thủy | Bị khắc | ⚠️ Mâu thuẫn |
| Hỏa | Mộc | Được sinh | ✅ Tốt |
| Hỏa | Hỏa | Bình | ➖ Bình thường |
| Thổ | Kim | Sinh | ✅ Rất tốt |
| Thổ | Thủy | Khắc | ⚠️ Trở ngại |
| Thổ | Mộc | Bị khắc | ⚠️ Xung đột |
| Thổ | Hỏa | Được sinh | ✅ Tốt |
| Thổ | Thổ | Bình | ➖ Bình thường |

---

## 👤 8. PHÂN TÍCH TÍNH CÁCH

### Theo Mệnh và Giới Tính

#### Mệnh Kim
- **Nam**: Mạnh mẽ, quyết đoán, có tính lãnh đạo cao
- **Nữ**: Kiên cường, độc lập, thông minh sắc sảo

#### Mệnh Thủy
- **Nam**: Linh hoạt, thông minh, biết thích nghi
- **Nữ**: Dịu dàng, nhạy cảm, giàu cảm xúc

#### Mệnh Hỏa
- **Nam**: Nhiệt huyết, năng động, đầy nhiệt tình
- **Nữ**: Sôi nổi, tự tin, quyến rũ

#### Mệnh Thổ
- **Nam**: Chân thành, đáng tin cậy, kiên nhẫn
- **Nữ**: Hiền lành, chu đáo, chăm sóc người khác

#### Mệnh Mộc
- **Nam**: Sáng tạo, lạc quan, yêu tự do
- **Nữ**: Nhẹ nhàng, tinh tế, giàu lòng nhân ái

---

## 💼 9. NGHỀ NGHIỆP PHÙ HỢP

| Mệnh | Nghề Nghiệp Phù Hợp |
|------|---------------------|
| Kim | Tài chính, Ngân hàng, Kế toán, Luật sư, Kỹ sư cơ khí, Kinh doanh kim loại |
| Thủy | Marketing, Truyền thông, Du lịch, Ngoại thương, Vận tải, Kinh doanh đồ uống |
| Hỏa | Giáo dục, Nghệ thuật, Điện tử, Công nghệ thông tin, Năng lượng, Nhà hàng |
| Thổ | Bất động sản, Xây dựng, Nông nghiệp, Y tế, Giáo dục, Quản lý |
| Mộc | Thiết kế, Nghệ thuật, Thời trang, Xuất bản, Môi trường, Dược phẩm |

---

## 💕 10. TÌNH DUYÊN

### Bảng Hợp - Tránh

| Mệnh | Hợp Nhất | Tránh | Lời Khuyên |
|------|----------|-------|------------|
| Kim | Thổ, Thủy | Hỏa, Mộc | Nên tìm người mệnh Thổ hoặc Thủy |
| Thủy | Kim, Mộc | Thổ | Hợp với người mệnh Kim hoặc Mộc |
| Hỏa | Mộc, Thổ | Thủy, Kim | Nên chọn người mệnh Mộc hoặc Thổ |
| Thổ | Hỏa, Kim | Mộc | Phù hợp với người mệnh Hỏa hoặc Kim |
| Mộc | Thủy, Hỏa | Kim, Thổ | Hợp với người mệnh Thủy hoặc Hỏa |

---

## 💰 11. TÀI LỘC

### Phân Tích Theo Mệnh

#### Mệnh Kim
- Tài lộc ổn định, có khả năng tích lũy tốt
- Nên đầu tư: Kim loại quý, bất động sản

#### Mệnh Thủy
- Tài lộc lưu thông, có nhiều cơ hội kiếm tiền
- Phù hợp: Kinh doanh, thương mại

#### Mệnh Hỏa
- Tài lộc đến nhanh nhưng cũng đi nhanh
- Cần: Biết tiết kiệm và đầu tư khôn ngoan

#### Mệnh Thổ
- Tài lộc vững chắc, tích lũy từ từ
- Nên: Đầu tư dài hạn, bất động sản

#### Mệnh Mộc
- Tài lộc phát triển tốt, nhiều nguồn thu nhập
- Phù hợp: Kinh doanh sáng tạo

---

## 💡 12. LỜI KHUYÊN PHONG THỦY

### Mệnh Kim
1. Đặt đồ vật bằng kim loại ở hướng Tây hoặc Tây Bắc
2. Trồng cây cảnh có lá tròn để tăng vận may
3. Tránh đặt bể cá quá lớn trong nhà
4. Nên mặc trang sức vàng, bạc

### Mệnh Thủy
1. Đặt bể cá hoặc thác nước ở hướng Bắc
2. Sử dụng màu đen, xanh dương trong trang trí
3. Tránh đặt đồ vật màu đỏ, vàng quá nhiều
4. Nên uống nhiều nước và giữ gìn sức khỏe

### Mệnh Hỏa
1. Đặt đèn hoặc nến ở hướng Nam
2. Sử dụng màu đỏ, cam trong trang trí
3. Tránh đặt bể nước lớn trong phòng ngủ
4. Nên tập thể dục thường xuyên

### Mệnh Thổ
1. Đặt đồ gốm sứ hoặc đá tự nhiên trong nhà
2. Sử dụng màu vàng, nâu trong trang trí
3. Trồng cây cảnh để tăng sinh khí
4. Nên ăn uống điều độ và nghỉ ngơi đầy đủ

### Mệnh Mộc
1. Trồng nhiều cây xanh trong nhà
2. Sử dụng đồ nội thất bằng gỗ tự nhiên
3. Đặt cây cảnh ở hướng Đông hoặc Đông Nam
4. Nên tiếp xúc với thiên nhiên thường xuyên

---

## 🔄 13. QUY TRÌNH TÍNH TOÁN

### Bước 1: Thu thập thông tin
- Ngày sinh (YYYY-MM-DD)
- Giờ sinh (HH:MM) - không bắt buộc
- Giới tính (Nam/Nữ)
- Loại lịch (Dương lịch/Âm lịch)

### Bước 2: Tính toán cơ bản
```javascript
1. Tính Can Chi năm = Can[năm % 10] + Chi[năm % 12]
2. Tính vị trí Nạp Âm = (năm - 1924) % 60
3. Xác định mệnh = napAm[vị_trí]
```

### Bước 3: Phân tích giờ sinh (nếu có)
```javascript
1. Xác định giờ Địa Chi dựa trên giờ sinh
2. Xác định mệnh giờ sinh
3. Kiểm tra tương sinh/khắc với mệnh năm
```

### Bước 4: Tính toán các yếu tố
```javascript
1. Số may mắn = getLuckyNumbers(mệnh, giới_tính)
2. Màu sắc = getLuckyColors(mệnh, giới_tính)
3. Hướng = getLuckyDirection(mệnh, giới_tính)
4. Tính cách = getPersonality(mệnh, giới_tính)
5. Nghề nghiệp = getSuitableCareer(mệnh)
6. Tình duyên = getLoveCompatibility(mệnh)
7. Tài lộc = getWealthFortune(mệnh, mệnh_giờ)
8. Lời khuyên = getFengShuiAdvice(mệnh)
```

### Bước 5: Hiển thị kết quả
- Thông tin cơ bản
- Mệnh ngũ hành
- Giờ sinh & tương sinh khắc
- Tính cách
- Số may mắn
- Màu sắc may mắn
- Hướng may mắn
- Nghề nghiệp phù hợp
- Tình duyên
- Tài lộc
- Lời khuyên phong thủy

---

## 📊 14. ỨNG DỤNG TRONG HỆ THỐNG SIM

### Gợi ý sim dựa trên phong thủy
1. **Số may mắn**: Tìm sim có chứa số may mắn
2. **Mệnh hợp**: Gợi ý sim phù hợp với mệnh
3. **Điểm phong thủy**: Tính điểm dựa trên:
   - Số lượng số may mắn trong sim
   - Tổng các chữ số có hợp mệnh không
   - Đuôi sim có phải số may mắn không

### Công thức tính điểm phong thủy sim
```javascript
fengShuiPoint = 0

// Kiểm tra từng số trong sim
for (số in sim_number) {
  if (số in luckyNumbers) {
    fengShuiPoint += 1
  }
}

// Bonus nếu đuôi là số may mắn
if (đuôi_sim in luckyNumbers) {
  fengShuiPoint += 2
}

// Tính tổng các chữ số
tổng = sum(các_chữ_số_trong_sim)
if (tổng % 10 in luckyNumbers) {
  fengShuiPoint += 1
}

return fengShuiPoint (max 10 điểm)
```

---

## 🎯 15. KẾT LUẬN

Hệ thống tính phong thủy của MINHTHUSIM kết hợp:
- ✅ Phương pháp Nạp Âm truyền thống (60 năm)
- ✅ Can Chi năm sinh
- ✅ 12 Giờ Địa Chi
- ✅ Tương sinh tương khắc ngũ hành
- ✅ Phân tích đa chiều (tính cách, nghề nghiệp, tình duyên, tài lộc)
- ✅ Ứng dụng thực tế trong việc chọn sim số đẹp

Đây là một hệ thống phong thủy **chính xác, đầy đủ và dễ hiểu**, giúp người dùng hiểu rõ về bản thân và đưa ra quyết định đúng đắn trong cuộc sống.

---

**Tác giả**: Hệ thống MINHTHUSIM  
**Ngày tạo**: 2024  
**Phiên bản**: 1.0
