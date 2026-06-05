# 🔧 HƯỚNG DẪN KHẮC PHỤC TRẠNG THÁI THANH TOÁN

## ❌ VẤN ĐỀ HIỆN TẠI

Sau khi test API, phát hiện:
- ❌ API `/api/admin/purchases` không trả về `payment_status`, `paid_at`, `transaction_id`
- ❌ Lỗi: `Unexpected token '<', "<!DOCTYPE "...` khi gọi API kiểm tra trạng thái

## ✅ NGUYÊN NHÂN

1. **Backend chưa được restart** sau khi sửa code
2. Server đang chạy phiên bản cũ của API

## 🔧 CÁCH KHẮC PHỤC

### BƯỚC 1: RESTART BACKEND

#### Cách 1: Sử dụng file restart.bat (Windows)
```cmd
cd backend
restart.bat
```

#### Cách 2: Restart thủ công
```cmd
# Dừng server hiện tại (Ctrl + C trong terminal đang chạy backend)

# Chạy lại backend
cd backend
node index.js
```

#### Cách 3: Sử dụng npm (nếu có script)
```cmd
cd backend
npm start
```

### BƯỚC 2: KIỂM TRA BACKEND ĐÃ CHẠY

Kiểm tra log trong terminal, phải thấy:
```
Backend server is running on http://localhost:5000
```

### BƯỚC 3: TEST LẠI API

```cmd
node backend/test-payment-status.js
```

**Kết quả mong đợi:**
```
✅ API trả về dữ liệu:
   - Mã đơn: 10
   - Sim: 0981686234
   - Trạng thái đơn: Chờ duyệt
   - Trạng thái thanh toán: PENDING     ✅ (không còn THIẾU)
   - Thời gian thanh toán: null         ✅
   - Mã GD: null                        ✅

✅ API đã trả về đầy đủ thông tin thanh toán
```

### BƯỚC 4: KIỂM TRA FRONTEND

1. **Mở trình duyệt**: http://localhost:3000/admin
2. **Đăng nhập** với tài khoản admin
3. **Vào tab "Lịch sử mua sim"**
4. **Kiểm tra cột "TT Thanh toán"**:
   - Phải hiển thị badge: "⏳ Chờ thanh toán" (vàng) cho đơn PENDING
   - Phải hiển thị badge: "✓ Đã thanh toán" (xanh) cho đơn PAID

5. **Kiểm tra trang tài khoản**: http://localhost:3000/tai-khoan
   - Mỗi đơn hàng phải có 2 badges:
     - Badge 1: Trạng thái đơn (Chờ duyệt/Đã duyệt/Đã hủy)
     - Badge 2: Trạng thái thanh toán (Chờ thanh toán/Đã thanh toán)

## 📊 KIỂM TRA DATABASE

Nếu vẫn có vấn đề, kiểm tra database:

```sql
-- Kiểm tra cấu trúc bảng
DESCRIBE don_hang;

-- Phải thấy các cột:
-- payment_status VARCHAR(20)
-- paid_at TIMESTAMP NULL
-- transaction_id VARCHAR(100) NULL

-- Kiểm tra dữ liệu
SELECT 
  ma_don_hang, 
  so_sim, 
  trang_thai, 
  payment_status, 
  paid_at, 
  transaction_id 
FROM don_hang 
LIMIT 5;
```

## 🔄 LUỒNG HOẠT ĐỘNG SAU KHI SỬA

### 1. Tạo đơn hàng (Chuyển khoản)
```
User: Chọn sim → Điền thông tin → Chọn "Chuyển khoản" → "Xác nhận mua"
↓
Frontend: Gọi POST /api/purchase
↓
Backend: Lưu đơn với payment_status = 'PENDING'
↓
Frontend: Hiển thị QR code + Bắt đầu polling
```

### 2. Polling kiểm tra thanh toán
```
Frontend: Gọi GET /api/order/payment-status/:orderId mỗi 5 giây
↓
Backend: Trả về { payment_status: 'PENDING' }
↓
Frontend: Tiếp tục hiển thị QR, chờ thanh toán
```

### 3. User chuyển khoản
```
User: Quét QR → Chuyển khoản trong app ngân hàng
↓
Ngân hàng: Gửi webhook đến /api/webhook/bank-transfer
↓
Backend: Cập nhật payment_status = 'PAID', paid_at = NOW()
```

### 4. Polling phát hiện đã thanh toán
```
Frontend: Gọi GET /api/order/payment-status/:orderId
↓
Backend: Trả về { payment_status: 'PAID' }
↓
Frontend: 
  - Đóng QR modal
  - Hiển thị Success modal
  - Alert "✅ Thanh toán thành công!"
```

### 5. Admin xem đơn hàng
```
Admin: Vào /admin → Tab "Lịch sử mua sim"
↓
Frontend: Gọi GET /api/admin/purchases
↓
Backend: Trả về đơn hàng với payment_status
↓
Frontend: Hiển thị badge "✓ Đã thanh toán" (xanh)
```

## 📁 FILES ĐÃ SỬA

### Backend
1. **backend/add-payment-status-column.js** (MỚI)
   - Script thêm 3 cột mới vào bảng don_hang

2. **backend/index.js**
   - ✅ Line 560-580: Cập nhật `/api/admin/purchases` - Thêm payment_status, paid_at, transaction_id
   - ✅ Line 583-603: Cập nhật `/api/user/:userId/history` - Thêm payment_status, paid_at, transaction_id
   - ✅ Line 254-295: Cập nhật `/api/purchase` - Lưu với payment_status='PENDING', trả về orderId
   - ✅ Line 750-765: Cập nhật webhook - Cập nhật payment_status='PAID' khi xác nhận
   - ✅ Line 857-880: Thêm `/api/order/payment-status/:orderId` - Kiểm tra trạng thái
   - ✅ Line 882-910: Thêm `/api/order/by-sim/:simNumber` - Lấy đơn theo sim

### Frontend
3. **frontend/src/app/admin/page.js**
   - ✅ Line 650-660: Thêm cột "TT Thanh toán" vào header
   - ✅ Line 677-697: Hiển thị badge payment_status với màu sắc + thời gian + mã GD

4. **frontend/src/app/tai-khoan/page.js**
   - ✅ Line 162-185: Thêm badge payment_status bên cạnh status badge

5. **frontend/src/components/SimCard.js**
   - ✅ Line 14-15: Thêm state currentOrderId và paymentStatus
   - ✅ Line 24-54: Thêm useEffect polling mỗi 5s kiểm tra trạng thái
   - ✅ Line 314-332: Cập nhật handlePurchase (COD) - Lưu orderId
   - ✅ Line 348-366: Cập nhật handleConfirmTransfer - Lưu orderId, bắt đầu polling

### Test & Documentation
6. **backend/test-payment-status.js** (MỚI)
   - Script test API trả về payment_status

7. **HUONG_DAN_KHAC_PHUC_THANH_TOAN.md** (MỚI)
   - File này - Hướng dẫn khắc phục

## ⚠️ LƯU Ý QUAN TRỌNG

### Lỗi "Unexpected token '<', "<!DOCTYPE "..."
**Nguyên nhân:** API endpoint không tồn tại hoặc backend chưa khởi động
**Giải pháp:**
1. Kiểm tra backend đang chạy: http://localhost:5000
2. Restart backend
3. Kiểm tra route đã được đăng ký trong backend/index.js

### Webhook không hoạt động
**Nguyên nhân:** Webhook cần được cấu hình từ ngân hàng
**Giải pháp tạm thời:** Dùng API test webhook
```bash
POST http://localhost:5000/api/webhook/test
Body:
{
  "simNumber": "0981686234",
  "amount": 2000
}
```

### Frontend không cập nhật trạng thái
**Nguyên nhân:** Polling chưa hoạt động
**Giải pháp:**
1. Mở DevTools Console (F12)
2. Kiểm tra log: "🔄 Bắt đầu polling trạng thái thanh toán"
3. Kiểm tra log: "📊 Trạng thái thanh toán: PENDING"
4. Sau khi thanh toán thành công, phải thấy: "📊 Trạng thái thanh toán: PAID"

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Database có 3 cột mới (payment_status, paid_at, transaction_id)
- [ ] Backend restart thành công
- [ ] Test API trả về payment_status (không còn THIẾU)
- [ ] Admin page hiển thị cột "TT Thanh toán"
- [ ] Đơn PENDING hiển thị badge vàng "⏳ Chờ thanh toán"
- [ ] Đơn PAID hiển thị badge xanh "✓ Đã thanh toán"
- [ ] User page hiển thị 2 badges cho mỗi đơn
- [ ] Polling hoạt động (kiểm tra console log)
- [ ] QR modal tự động đóng khi thanh toán thành công
- [ ] Success modal hiển thị sau khi thanh toán

## 🆘 NẾU VẪN CÒN VẤN ĐỀ

1. **Kiểm tra backend log** - Có lỗi gì không?
2. **Kiểm tra frontend console** - Có lỗi API nào không?
3. **Kiểm tra network tab** - API trả về gì?
4. **Chạy lại migration**: `node backend/add-payment-status-column.js`
5. **Xóa node_modules và cài lại**: `cd backend && npm install`

## 📞 DEBUGGING

### In log API response
Thêm vào frontend để debug:
```javascript
const response = await axios.get('http://localhost:5000/api/admin/purchases');
console.log('API Response:', response.data.data[0]);
// Phải thấy: payment_status, paid_at, transaction_id
```

### Test trực tiếp trong browser
```
http://localhost:5000/api/admin/purchases
```
Phải thấy JSON với payment_status field.

---

**Tác giả:** Kiro AI Assistant  
**Ngày:** 2026-06-05  
**Version:** 1.0
