# HƯỚNG DẪN CẬP NHẬT CODE SAU KHI ĐỔI TÊN DATABASE

## ⚠️ QUAN TRỌNG
Sau khi chạy `node rename-all-to-vietnamese.js`, bạn PHẢI cập nhật lại toàn bộ code backend!

---

## 📋 BẢNG ĐỐI CHIẾU TÊN CŨ - TÊN MỚI

### 1. TÊN BẢNG

| Tên Cũ | Tên Mới |
|---------|---------|
| users | nguoi_dung |
| sim_cards | the_sim |
| purchases | don_hang |
| fengshui_history | lich_su_phong_thuy |
| recommendation_history | lich_su_phan_tich |
| messages | tin_nhan |

### 2. TÊN CỘT - BẢNG NGUOI_DUNG

| Tên Cũ | Tên Mới |
|---------|---------|
| id | ma_nguoi_dung |
| name | ten_dang_nhap |
| password | mat_khau |
| role | vai_tro |
| created_at | ngay_tao |

### 3. TÊN CỘT - BẢNG THE_SIM

| Tên Cũ | Tên Mới |
|---------|---------|
| id | ma_sim |
| sim_number | so_sim |
| network | nha_mang |
| price | gia_ban |
| category | loai_sim |
| feng_shui_element | menh_phong_thuy |
| total_nodes | diem_nut |
| status | trang_thai |
| description | mo_ta |

### 4. TÊN CỘT - BẢNG DON_HANG

| Tên Cũ | Tên Mới |
|---------|---------|
| id | ma_don_hang |
| user_id | ma_nguoi_dung |
| user_name | ten_nguoi_dung |
| sim_number | so_sim |
| network | nha_mang |
| price | gia_mua |
| category | loai_sim |
| customer_name | ten_khach_hang |
| customer_phone | sdt_khach_hang |
| customer_address | dia_chi_khach_hang |
| payment_method | phuong_thuc_thanh_toan |
| purchase_date | ngay_mua |
| status | trang_thai |
| approval_date | ngay_duyet |

### 5. TÊN CỘT - BẢNG LICH_SU_PHONG_THUY

| Tên Cũ | Tên Mới |
|---------|---------|
| id | ma_lich_su |
| user_id | ma_nguoi_dung |
| user_name | ten_nguoi_dung |
| birth_date | ngay_sinh |
| birth_time | gio_sinh |
| gender | gioi_tinh |
| calendar_type | loai_lich |
| element | menh |
| lucky_numbers | so_may_man |
| view_date | ngay_xem |

### 6. TÊN CỘT - BẢNG LICH_SU_PHAN_TICH

| Tên Cũ | Tên Mới |
|---------|---------|
| id | ma_lich_su |
| user_id | ma_nguoi_dung |
| user_name | ten_nguoi_dung |
| birth_date | ngay_sinh |
| lucky_numbers | so_may_man |
| price_limit | ngan_sach |
| expected_network | nha_mang_mong_muon |
| purpose | muc_dich |
| result_count | so_ket_qua |
| search_date | ngay_tim_kiem |

### 7. TÊN CỘT - BẢNG TIN_NHAN

| Tên Cũ | Tên Mới |
|---------|---------|
| id | ma_tin_nhan |
| name | ten_nguoi_gui |
| phone | sdt_nguoi_gui |
| email | email_nguoi_gui |
| message | noi_dung |
| status | trang_thai |
| created_at | ngay_gui |

---

## 🔧 VÍ DỤ CẬP NHẬT CODE

### Ví dụ 1: Query đơn giản

**CŨ:**
```javascript
const [rows] = await pool.query('SELECT * FROM users');
```

**MỚI:**
```javascript
const [rows] = await pool.query('SELECT * FROM nguoi_dung');
```

### Ví dụ 2: Query với cột cụ thể

**CŨ:**
```javascript
const [users] = await pool.query(
  'SELECT id, name, role FROM users WHERE name = ?',
  [name]
);
```

**MỚI:**
```javascript
const [users] = await pool.query(
  'SELECT ma_nguoi_dung, ten_dang_nhap, vai_tro FROM nguoi_dung WHERE ten_dang_nhap = ?',
  [name]
);
```

### Ví dụ 3: INSERT

**CŨ:**
```javascript
await pool.query(
  'INSERT INTO users (name, password, role) VALUES (?, ?, ?)',
  [name, password, 'customer']
);
```

**MỚI:**
```javascript
await pool.query(
  'INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau, vai_tro) VALUES (?, ?, ?)',
  [name, password, 'customer']
);
```

### Ví dụ 4: UPDATE

**CŨ:**
```javascript
await pool.query(
  'UPDATE sim_cards SET status = ? WHERE sim_number = ?',
  ['Đã bán', sim_number]
);
```

**MỚI:**
```javascript
await pool.query(
  'UPDATE the_sim SET trang_thai = ? WHERE so_sim = ?',
  ['Đã bán', sim_number]
);
```

### Ví dụ 5: Truy cập kết quả

**CŨ:**
```javascript
const user = users[0];
console.log(user.id, user.name, user.role);
```

**MỚI:**
```javascript
const user = users[0];
console.log(user.ma_nguoi_dung, user.ten_dang_nhap, user.vai_tro);
```

---

## 📝 DANH SÁCH FILE CẦN CẬP NHẬT

### Backend Files (Quan trọng nhất)
- ✅ `backend/index.js` - File chính, có rất nhiều query
- ✅ `backend/seed.js` - File seed dữ liệu
- ✅ `backend/check-db.js` - File kiểm tra database
- ✅ `backend/update-db.js` - File cập nhật database
- ✅ Tất cả các file `backend/*.js` khác

### Frontend Files (Ít hơn)
- Frontend chủ yếu nhận data từ API, nên ít cần sửa
- Chỉ cần sửa nếu có hardcode tên cột

---

## 🚀 CÁCH CHẠY

### Bước 1: Backup database
```bash
mysqldump -u root -p ai_sim_db > backup_before_rename.sql
```

### Bước 2: Chạy script đổi tên
```bash
cd backend
node rename-all-to-vietnamese.js
```

### Bước 3: Kiểm tra kết quả
```sql
-- Xem danh sách bảng mới
SHOW TABLES;

-- Xem cấu trúc bảng mới
DESCRIBE nguoi_dung;
DESCRIBE the_sim;
DESCRIBE don_hang;
```

### Bước 4: Cập nhật code backend
- Mở file `backend/index.js`
- Tìm và thay thế tất cả tên cũ bằng tên mới
- Sử dụng Find & Replace trong editor

### Bước 5: Test lại hệ thống
```bash
cd backend
node index.js
```

---

## 🔍 TÌM VÀ THAY THẾ NHANH (Find & Replace)

Trong VS Code, bấm `Ctrl + Shift + H` để mở Find & Replace trong toàn bộ project:

### Thay thế tên bảng:
```
FROM users          → FROM nguoi_dung
FROM sim_cards      → FROM the_sim
FROM purchases      → FROM don_hang
FROM fengshui_history → FROM lich_su_phong_thuy
FROM recommendation_history → FROM lich_su_phan_tich
FROM messages       → FROM tin_nhan

INTO users          → INTO nguoi_dung
INTO sim_cards      → INTO the_sim
INTO purchases      → INTO don_hang
(tương tự cho INTO...)

UPDATE users        → UPDATE nguoi_dung
UPDATE sim_cards    → UPDATE the_sim
(tương tự cho UPDATE...)
```

### Thay thế tên cột (cẩn thận hơn):
```
user.id             → user.ma_nguoi_dung
user.name           → user.ten_dang_nhap
sim.sim_number      → sim.so_sim
sim.price           → sim.gia_ban
purchase.status     → purchase.trang_thai
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Backup trước khi chạy!** Nếu có lỗi, bạn có thể restore lại.

2. **Test từng bước:** Sau khi đổi tên, test từng API một để đảm bảo hoạt động đúng.

3. **Frontend ít bị ảnh hưởng:** Vì frontend nhận data từ API dưới dạng object, nên chỉ cần sửa backend.

4. **Khó debug:** Khi có lỗi, sẽ khó debug hơn vì tên tiếng Việt không phổ biến trong lập trình.

5. **Không theo chuẩn:** Hầu hết các dự án quốc tế đều dùng tiếng Anh cho database.

---

## 🔙 CÁCH ROLLBACK (Quay lại tên cũ)

Nếu bạn muốn quay lại tên tiếng Anh:

```bash
# Restore từ backup
mysql -u root -p ai_sim_db < backup_before_rename.sql
```

Hoặc chạy script ngược lại (tôi có thể tạo nếu cần).

---

## ✅ CHECKLIST SAU KHI ĐỔI TÊN

- [ ] Đã backup database
- [ ] Đã chạy script đổi tên thành công
- [ ] Đã cập nhật `backend/index.js`
- [ ] Đã cập nhật các file backend khác
- [ ] Đã test API đăng ký/đăng nhập
- [ ] Đã test API lấy danh sách sim
- [ ] Đã test API mua sim
- [ ] Đã test API admin
- [ ] Đã test toàn bộ chức năng trên frontend
- [ ] Hệ thống hoạt động bình thường

---

**Chúc bạn thành công!** 🎉
