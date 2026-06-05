# HƯỚNG DẪN DEBUG HỆ THỐNG THANH TOÁN TỰ ĐỘNG

## 🎯 MỤC ĐÍCH

Debug từng bước để tìm nguyên nhân tại sao giao diện không tự động chuyển sang màn "Đã thanh toán" sau khi chuyển khoản thành công.

---

## 📋 CHUẨN BỊ

### 1. Mở 3 Terminal:

**Terminal 1: Backend**
```bash
cd backend
node index.js
```

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
```

**Terminal 3: Debug Scripts** (sẽ dùng sau)
```bash
cd backend
```

### 2. Mở Browser Console (F12)

---

## 🔍 BƯỚC DEBUG

### BƯỚC 1: Tạo đơn hàng và mở QR Modal

1. Mở browser: `http://localhost:3000`
2. Đăng nhập
3. Chọn sim → "Mua Ngay"
4. Điền form:
   - Họ tên
   - Số điện thoại
   - Địa chỉ
5. Chọn "Chuyển khoản"
6. Nhấn "Xác nhận mua"

### ✅ KIỂM TRA Console Log (Frontend):

```
=== BẮT ĐẦU QUY TRÌNH MUA SIM - CHUYỂN KHOẢN ===
✅ Validation passed
📤 Đang gọi API tạo đơn hàng...
📋 Purchase data: {...}
📥 API Response: {orderId: 123, ...}
✅ Đã tạo đơn hàng thành công!
🆔 ORDER ID: 123
🔧 setCurrentOrderId(123)
🔧 setPaymentStatus("PENDING")
🔄 Polling sẽ tự động bắt đầu khi QR modal mở...
🔗 QR URL: ...
🔧 setQrCodeUrl()
🔧 setShowQRModal(true) - Mở QR Modal
🔧 setShowPurchaseModal(false) - Đóng Purchase Modal
=== QUY TRÌNH TẠO ĐƠN HOÀN TẤT ===
```

**❓ CÂU HỎI:**
- Có thấy log này không?
- orderId có giá trị không?
- QR modal có mở không?

**⚠️ NẾU KHÔNG:**
- Kiểm tra Network tab xem API `/api/purchase` có lỗi không
- Kiểm tra backend console có lỗi không

---

### BƯỚC 2: Kiểm tra Polling bắt đầu

Sau khi QR modal mở, ngay lập tức phải thấy log:

### ✅ KIỂM TRA Console Log (Frontend):

```
=== POLLING USEEFFECT TRIGGERED ===
currentOrderId: 123
paymentStatus: PENDING
showQRModal: true
✅ POLLING CONDITIONS MET - STARTING POLLING
🔄 POLLING STARTED FOR ORDER: 123
⏰ Tự động kiểm tra mỗi 3 giây...
```

**❓ CÂU HỎI:**
- Có thấy log này không?
- `currentOrderId` có giá trị không?
- `paymentStatus` là "PENDING" không?
- `showQRModal` là `true` không?

**⚠️ NẾU KHÔNG THẤY "POLLING CONDITIONS MET":**

Kiểm tra log hiển thị gì:
```
❌ POLLING CONDITIONS NOT MET:
  - currentOrderId is null/undefined   ← orderId không được set
  - paymentStatus is not PENDING: ... ← status sai
  - showQRModal is false               ← modal không mở
```

**🔧 CÁCH FIX:**
- Nếu orderId null → Kiểm tra API `/api/purchase` có trả về `orderId` không
- Nếu status sai → Kiểm tra `setPaymentStatus('PENDING')` có được gọi không
- Nếu modal false → Kiểm tra `setShowQRModal(true)` có được gọi không

---

### BƯỚC 3: Kiểm tra Polling tick đầu tiên

Sau 3 giây, phải thấy log polling tick:

### ✅ KIỂM TRA Console Log (Frontend):

```
=== POLLING TICK ===
⏰ CHECK PAYMENT STATUS AT: 10:30:45
📋 ORDER ID: 123
🌐 Calling API: http://localhost:5000/api/order/payment-status/123
📥 API RESPONSE RECEIVED:
response.data: {
  "success": true,
  "data": {
    "orderId": 123,
    "paymentStatus": "PENDING",
    "paidAt": null,
    "transactionId": null
  }
}
📊 PAYMENT STATUS: PENDING
⏳ Status is still: PENDING - Continue polling...
```

### ✅ KIỂM TRA Console Log (Backend Terminal 1):

```
=== API PAYMENT STATUS CALLED ===
⏰ Time: 10:30:45
🆔 Order ID: 123
🔍 Querying database for order: 123
✅ Order found in database:
   - ma_don_hang: 123
   - payment_status: PENDING
   - paid_at: null
   - transaction_id: null
📤 Returning response: {...}
=== END API CALL ===
```

**❓ CÂU HỎI:**
- Frontend có gọi API không?
- Backend có nhận request không?
- Backend có trả về response không?
- Frontend có nhận response không?
- `paymentStatus` trong response là gì?

**⚠️ NẾU KHÔNG THẤY LOG:**
- Kiểm tra polling có bắt đầu không (Bước 2)
- Kiểm tra Network tab có request `/api/order/payment-status/123` không
- Kiểm tra có lỗi CORS không

---

### BƯỚC 4: Lấy Order ID

Từ console log, copy Order ID (ví dụ: 123)

---

### BƯỚC 5: Kiểm tra Database TRƯỚC khi thanh toán

**Terminal 3:**
```bash
node debug-check-order.js 123
```

### ✅ KIỂM TRA Output:

```
=== DEBUG CHECK ORDER ===
🆔 Order ID: 123
⏰ Time: 2026-06-05 10:30:00

✅ Tìm thấy đơn hàng:

📋 THÔNG TIN CƠ BẢN:
   - Mã đơn hàng: 123
   - Số sim: 0987654321
   - Nhà mạng: Viettel
   - Giá: 1500000 VNĐ
   - Khách hàng: Nguyễn Văn A
   - SĐT: 0912345678

💳 THÔNG TIN THANH TOÁN:
   - payment_status: PENDING
   - paid_at: NULL
   - transaction_id: NULL
   - Phương thức: bank_transfer

📊 TRẠNG THÁI:
   - Trạng thái đơn: pending
   - Ngày mua: 2026-06-05 10:25:00

⏳ ĐƠN HÀNG CHỜ THANH TOÁN
```

**✅ XÁC NHẬN:**
- payment_status = PENDING
- paid_at = NULL
- transaction_id = NULL

---

### BƯỚC 6: Mô phỏng thanh toán (Chuyển PENDING → PAID)

**Terminal 3:**
```bash
# Sửa file approve-order-11.js, thay orderId = 11 thành orderId = 123
# Hoặc dùng:
node approve-payment.js 123
```

Hoặc tạo script nhanh:

**Terminal 3:**
```bash
node -e "
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'Thu2220403',
  database: 'ai_sim_db'
});
(async () => {
  const orderId = 123;
  await pool.query(
    'UPDATE don_hang SET payment_status = ?, paid_at = NOW(), transaction_id = ? WHERE ma_don_hang = ?',
    ['PAID', 'TEST_' + Date.now(), orderId]
  );
  console.log('✅ Updated order', orderId, 'to PAID');
  await pool.end();
})();
"
```

---

### BƯỚC 7: Kiểm tra Database SAU khi thanh toán

**Terminal 3:**
```bash
node debug-check-order.js 123
```

### ✅ KIỂM TRA Output:

```
💳 THÔNG TIN THANH TOÁN:
   - payment_status: PAID        ← PHẢI LÀ PAID
   - paid_at: 2026-06-05 10:31:00  ← PHẢI CÓ TIMESTAMP
   - transaction_id: TEST_1234567890  ← PHẢI CÓ TRANSACTION ID

✅ ĐƠN HÀNG ĐÃ THANH TOÁN
```

**⚠️ NẾU VẪN LÀ PENDING:**
- Script update không chạy
- Database connection lỗi
- Sai order ID

---

### BƯỚC 8: Chờ polling phát hiện (tối đa 3 giây)

Sau khi update database, trong vòng 3 giây, phải thấy log:

### ✅ KIỂM TRA Console Log (Frontend):

```
=== POLLING TICK ===
⏰ CHECK PAYMENT STATUS AT: 10:31:02
📋 ORDER ID: 123
🌐 Calling API: http://localhost:5000/api/order/payment-status/123
📥 API RESPONSE RECEIVED:
response.data: {
  "success": true,
  "data": {
    "orderId": 123,
    "paymentStatus": "PAID",           ← PHẢI LÀ PAID
    "paidAt": "2026-06-05 10:31:00",
    "transactionId": "TEST_1234567890"
  }
}
📊 PAYMENT STATUS: PAID                ← PHẢI LÀ PAID

🎉🎉🎉 PAID DETECTED!!! 🎉🎉🎉
✅ Phát hiện thanh toán thành công!
🔄 Đang thực hiện các actions...
1️⃣ setPaymentStatus("PAID")
2️⃣ CLOSING PAYMENT MODAL - setShowQRModal(false)
3️⃣ OPEN SUCCESS MODAL - setShowSuccessModal(true)
4️⃣ clearInterval(pollingInterval)
5️⃣ Hiển thị alert...
✅ ALL ACTIONS COMPLETED
```

### ✅ KIỂM TRA Console Log (Backend):

```
=== API PAYMENT STATUS CALLED ===
⏰ Time: 10:31:02
🆔 Order ID: 123
🔍 Querying database for order: 123
✅ Order found in database:
   - ma_don_hang: 123
   - payment_status: PAID           ← PHẢI LÀ PAID
   - paid_at: 2026-06-05 10:31:00
   - transaction_id: TEST_1234567890
📤 Returning response: {...}
=== END API CALL ===
```

**❓ CÂU HỎI:**
- Frontend có nhận được `paymentStatus: "PAID"` không?
- Có thấy "🎉🎉🎉 PAID DETECTED!!!" không?
- Có thấy các actions (1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣) không?

---

### BƯỚC 9: Kiểm tra UI

**✅ PHẢI THẤY:**
1. ❌ QR modal tự động đóng
2. ✅ Success modal tự động hiển thị
3. ✅ Alert "Thanh toán thành công!" xuất hiện
4. ✅ Polling dừng (không còn log "POLLING TICK" nữa)

**⚠️ NẾU KHÔNG:**

#### Trường hợp 1: Backend trả PAID nhưng Frontend không phát hiện

**Nguyên nhân:**
- API response format sai
- Frontend parse sai

**Cách fix:**
- Kiểm tra `response.data.data.paymentStatus` có đúng không
- Kiểm tra có `response.data.success === true` không

#### Trường hợp 2: Frontend phát hiện PAID nhưng UI không đổi

**Nguyên nhân:**
- `setShowQRModal(false)` không hoạt động
- `setShowSuccessModal(true)` không hoạt động
- React state không update

**Cách fix:**
- Kiểm tra log "2️⃣ CLOSING PAYMENT MODAL" có xuất hiện không
- Kiểm tra log "3️⃣ OPEN SUCCESS MODAL" có xuất hiện không
- Kiểm tra React DevTools xem state có đổi không

#### Trường hợp 3: Polling không chạy sau khi update DB

**Nguyên nhân:**
- Polling đã dừng trước khi update
- Modal đã bị đóng
- Order ID bị mất

**Cách fix:**
- Kiểm tra "🛑 CLEANUP - DỪNG POLLING" có xuất hiện TRƯỚC khi update DB không
- Đảm bảo modal vẫn mở khi update DB

---

## 📊 CHECKLIST HOÀN CHỈNH

| Bước | Kiểm tra | Status |
|------|----------|--------|
| 1 | Tạo đơn hàng thành công | ⬜ |
| 2 | Order ID được set | ⬜ |
| 3 | QR modal mở | ⬜ |
| 4 | Polling bắt đầu | ⬜ |
| 5 | Polling tick chạy mỗi 3s | ⬜ |
| 6 | API payment-status được gọi | ⬜ |
| 7 | Backend nhận request | ⬜ |
| 8 | Backend query DB thành công | ⬜ |
| 9 | Backend trả về response | ⬜ |
| 10 | Frontend nhận response | ⬜ |
| 11 | Status ban đầu là PENDING | ⬜ |
| 12 | Update DB thành công (PAID) | ⬜ |
| 13 | Polling tick tiếp theo phát hiện PAID | ⬜ |
| 14 | Frontend log "PAID DETECTED" | ⬜ |
| 15 | setPaymentStatus("PAID") gọi | ⬜ |
| 16 | setShowQRModal(false) gọi | ⬜ |
| 17 | setShowSuccessModal(true) gọi | ⬜ |
| 18 | clearInterval gọi | ⬜ |
| 19 | QR modal tự động đóng | ⬜ |
| 20 | Success modal tự động hiển thị | ⬜ |
| 21 | Alert xuất hiện | ⬜ |
| 22 | Polling dừng | ⬜ |

---

## 🐛 CÁC LỖI PHỔ BIẾN

### Lỗi 1: orderId is null

**Nguyên nhân:**
- API `/api/purchase` không trả về `orderId`
- `response.data.orderId` undefined

**Fix:**
- Kiểm tra backend `/api/purchase` có return orderId không
- Kiểm tra frontend có parse đúng không

---

### Lỗi 2: Polling không bắt đầu

**Nguyên nhân:**
- `currentOrderId` null
- `paymentStatus` không phải "PENDING"
- `showQRModal` false

**Fix:**
- Kiểm tra 3 điều kiện trong useEffect
- Đảm bảo cả 3 đều đúng

---

### Lỗi 3: Backend trả PENDING mặc dù DB là PAID

**Nguyên nhân:**
- Database cache
- Query sai bảng
- Connection pool cũ

**Fix:**
- Restart backend
- Check query SQL
- Clear connection pool

---

### Lỗi 4: Frontend không phát hiện PAID

**Nguyên nhân:**
- Parse response sai
- `response.data.data.paymentStatus` undefined
- Typo trong field name

**Fix:**
- Log full response
- Check field name chính xác
- Verify API contract

---

### Lỗi 5: UI không đổi sau khi phát hiện PAID

**Nguyên nhân:**
- React state không update
- Modal state conflict
- setState không async

**Fix:**
- Kiểm tra React DevTools
- Verify state changes
- Check modal component logic

---

## 📝 SCRIPTS HỮU ÍCH

### Check order:
```bash
node debug-check-order.js <orderId>
```

### Quick approve:
```bash
node approve-payment.js <orderId>
```

### Watch polling:
```bash
# Mở browser console, filter by "POLLING"
```

### Watch backend:
```bash
# Backend terminal sẽ log mỗi API call
```

---

## ✅ KẾT QUẢ MONG ĐỢI

Sau khi debug xong, luồng phải như sau:

```
User mua sim → Tạo đơn (PENDING) → Mở QR modal
    ↓
Polling bắt đầu (mỗi 3s check DB)
    ↓
[User chuyển khoản] → Webhook/Manual update DB → payment_status = PAID
    ↓
Polling tick tiếp theo phát hiện PAID (< 3s)
    ↓
Frontend tự động:
  - Đóng QR modal
  - Hiển thị Success modal
  - Alert thông báo
  - Dừng polling
    ↓
✅ HOÀN TẤT
```

**Thời gian:** < 3 giây sau khi DB update  
**Không cần:** User bấm bất kỳ nút nào

---

**Ngày tạo:** 2026-06-05  
**Version:** 1.0 - Full Debug Guide
