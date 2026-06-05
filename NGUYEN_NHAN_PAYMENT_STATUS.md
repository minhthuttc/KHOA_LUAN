# NGUYÊN NHÂN VÀ GIẢI PHÁP: Payment Status Không Hiển thị

## 📊 PHÂN TÍCH NGUYÊN NHÂN GỐC

### ✅ Những gì đã hoạt động:
1. **Database**: Có đầy đủ 3 cột `payment_status`, `paid_at`, `transaction_id`
2. **Backend API**: Trả về đầy đủ các field thanh toán
3. **Frontend Code**: Có logic hiển thị badge dựa trên `payment_status`

### ❌ VẤN ĐỀ THỰC SỰ:

**Tất cả đơn hàng đều có `payment_status = 'PENDING'` vì không có cơ chế nào cập nhật sang `PAID`!**

---

## 🔍 LUỒNG THANH TOÁN HIỆN TẠI

### Khi khách hàng mua sim:

```javascript
// frontend/src/components/SimCard.js - Line 314
const response = await axios.post("http://localhost:5000/api/purchase", {
  user_id, sim_number, price, payment_method, ...
});
```

```javascript
// backend/index.js - Line 254
app.post('/api/purchase', async (req, res) => {
  await pool.query(
    `INSERT INTO don_hang (..., payment_status) 
     VALUES (..., 'PENDING')` // ✅ Tạo đơn với PENDING
  );
  res.json({ orderId: result.insertId });
});
```

### Cách duy nhất để chuyển sang PAID:

```javascript
// backend/index.js - Line 750
app.post('/api/webhook/bank-transfer', async (req, res) => {
  // ✅ Webhook từ ngân hàng
  const { transactionId, amount, description } = req.body;
  
  // Parse số sim từ description
  const simMatch = description?.match(/MUA SO[:\s]*(\d{10})/i);
  
  // Tìm đơn hàng
  const [orders] = await pool.query(`
    SELECT * FROM don_hang 
    WHERE so_sim = ? 
    AND trang_thai = 'Chờ duyệt' 
    AND phuong_thuc_thanh_toan = 'bank_transfer'
  `, [simNumber]);
  
  // Cập nhật
  await pool.query(`
    UPDATE don_hang 
    SET trang_thai = 'Đã duyệt', 
        payment_status = 'PAID',  // ✅ Chuyển sang PAID
        paid_at = NOW(),
        transaction_id = ?
    WHERE ma_don_hang = ?
  `, [transactionId, order.ma_don_hang]);
});
```

---

## ⚠️ TẠI SAO TẤT CẢ ĐƠN HÀNG VẪN LÀ PENDING?

### Lý do:
- Webhook `/api/webhook/bank-transfer` **chỉ được gọi khi ngân hàng gửi thông báo**
- Hiện tại **chưa có webhook thực sự được cấu hình**
- User click "Đã thanh toán" **KHÔNG** tự động cập nhật `payment_status`

### Code hiện tại khi user click "Đã thanh toán":

```javascript
// frontend/src/components/SimCard.js - Line 386
const handleConfirmTransfer = async () => {
  const response = await axios.post("http://localhost:5000/api/purchase", {
    // ... data
    payment_method: 'bank_transfer'
  });
  
  setCurrentOrderId(response.data.orderId);
  setPaymentStatus('PENDING'); // ⚠️ Vẫn PENDING!
  
  // ✅ Polling bắt đầu kiểm tra mỗi 5s
  // Nhưng payment_status không bao giờ đổi vì webhook không được gọi
};
```

---

## 🛠️ GIẢI PHÁP

### Giải pháp 1: Cấu hình Webhook thật (Khuyến nghị cho production)

Cấu hình ngân hàng gửi webhook đến server của bạn khi có giao dịch:

```
URL webhook: https://your-domain.com/api/webhook/bank-transfer
Method: POST
Body: {
  "transactionId": "FT23123456789",
  "amount": 650000,
  "description": "MUA SO 0981686234",
  "accountNumber": "1025311193",
  "transactionDate": "2026-06-05T10:30:00Z",
  "bankCode": "VCB"
}
```

**Hướng dẫn chi tiết**: Xem `HUONG_DAN_WEBHOOK.md`

---

### Giải pháp 2: Test Webhook thủ công (Cho development)

Sử dụng script test:

```bash
# Test với đơn hàng PENDING
cd backend
node test-webhook-payment.js
```

Script sẽ:
1. Tìm đơn hàng PENDING với payment_method = 'bank_transfer'
2. Gửi webhook giả lập
3. Cập nhật payment_status = PAID
4. Verify kết quả

---

### Giải pháp 3: Duyệt thủ công (Cho admin)

Chạy script duyệt thủ công:

```bash
cd backend
node manual-approve-payment.js
```

Script sẽ:
1. Liệt kê tất cả đơn hàng PENDING
2. Chọn đơn đầu tiên
3. Cập nhật payment_status = PAID
4. Thêm transaction_id test
5. Chuyển trang_thai = 'Đã duyệt'

---

### Giải pháp 4: Thêm API "Xác nhận đã thanh toán" (Tùy chọn)

Tạo endpoint mới cho user tự xác nhận:

```javascript
// backend/index.js
app.post('/api/order/confirm-payment', async (req, res) => {
  const { orderId, userId } = req.body;
  
  // Kiểm tra user có phải chủ đơn hàng
  const [orders] = await pool.query(
    'SELECT * FROM don_hang WHERE ma_don_hang = ? AND ma_nguoi_dung = ?',
    [orderId, userId]
  );
  
  if (orders.length === 0) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
  }
  
  // Cập nhật thành "Chờ admin xác nhận"
  await pool.query(`
    UPDATE don_hang 
    SET ghi_chu = CONCAT(IFNULL(ghi_chu, ''), '\nKhách đã xác nhận chuyển khoản lúc: ', NOW())
    WHERE ma_don_hang = ?
  `, [orderId]);
  
  // Admin sẽ xác nhận sau
  res.json({ success: true, message: 'Đã ghi nhận. Admin sẽ kiểm tra và xác nhận.' });
});
```

---

## 📝 LUỒNG HOÀN CHỈNH (Với Webhook)

```
1. User chọn sim → Click "Mua Ngay"
   ↓
2. Nhập thông tin → Chọn "Chuyển khoản"
   ↓
3. Hiển thị QR code với số tiền
   ↓
4. User chuyển khoản qua ngân hàng
   Nội dung: "MUA SO 0981686234"
   ↓
5. Ngân hàng ghi nhận giao dịch
   ↓
6. Ngân hàng gửi webhook → Backend
   POST /api/webhook/bank-transfer
   ↓
7. Backend nhận webhook:
   - Parse số sim từ description
   - Tìm đơn hàng tương ứng
   - Kiểm tra số tiền
   - UPDATE payment_status = 'PAID'
   ↓
8. Frontend polling (mỗi 5s):
   GET /api/order/payment-status/:orderId
   ↓
9. Phát hiện payment_status = 'PAID'
   → Đóng QR modal
   → Hiển thị "Thanh toán thành công"
   ↓
10. Admin xem dashboard
    → Badge hiển thị: 🟢 "Đã thanh toán"
```

---

## 🧪 TEST VÀ VERIFY

### Test 1: Cập nhật thủ công
```bash
cd backend
node manual-approve-payment.js
```

Kết quả mong đợi:
- ✅ payment_status = 'PAID'
- ✅ paid_at = NOW()
- ✅ transaction_id = 'TEST...'

### Test 2: Test webhook
```bash
cd backend
node test-webhook-payment.js
```

Kết quả mong đợi:
- ✅ Webhook nhận thành công
- ✅ Đơn hàng được cập nhật
- ✅ API trả về PAID

### Test 3: Test API
```bash
cd backend
node test-live-api.js
```

Kết quả mong đợi:
- ✅ GET /api/admin/purchases trả về payment_status
- ✅ GET /api/order/payment-status/:orderId hoạt động

### Test 4: Kiểm tra Frontend

1. Mở http://localhost:3000/admin
2. Click tab "Lịch sử mua sim"
3. Tìm đơn hàng vừa test
4. Kiểm tra badge:
   - 🟢 "Đã thanh toán" (nếu PAID)
   - 🟡 "Chờ thanh toán" (nếu PENDING)

---

## 📋 CHECKLIST HOÀN THÀNH

- [x] Database có payment_status, paid_at, transaction_id
- [x] Backend API trả về các field mới
- [x] Frontend có code hiển thị badge
- [x] Webhook API hoạt động
- [x] Polling kiểm tra trạng thái
- [ ] **Webhook thật được cấu hình từ ngân hàng** ⚠️

---

## 🎯 KẾT LUẬN

### Nguyên nhân gốc:
**Không có cơ chế nào cập nhật payment_status từ PENDING sang PAID sau khi user chuyển khoản.**

### Giải pháp ngắn hạn (Development):
- Sử dụng `manual-approve-payment.js` để test
- Sử dụng `test-webhook-payment.js` để mô phỏng webhook

### Giải pháp dài hạn (Production):
- Cấu hình webhook thật với ngân hàng
- Hoặc tích hợp API kiểm tra giao dịch của ngân hàng
- Hoặc thêm admin dashboard để duyệt thủ công

---

## 📞 HỖ TRỢ

### Scripts có sẵn:
1. `backend/manual-approve-payment.js` - Duyệt đơn thủ công
2. `backend/test-webhook-payment.js` - Test webhook
3. `backend/test-live-api.js` - Test API endpoints
4. `backend/diagnostic-check-payment.js` - Kiểm tra hệ thống

### Tài liệu liên quan:
- `HUONG_DAN_WEBHOOK.md` - Hướng dẫn cấu hình webhook
- `HUONG_DAN_KHAC_PHUC_THANH_TOAN.md` - Hướng dẫn khắc phục
- `BAO_CAO_KHAC_PHUC_THANH_TOAN.md` - Báo cáo chi tiết

---

**Cập nhật lần cuối**: 2026-06-05
**Người viết**: Kiro AI Assistant
