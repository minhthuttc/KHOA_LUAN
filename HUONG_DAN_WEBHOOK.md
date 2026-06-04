# HƯỚNG DẪN SỬ DỤNG WEBHOOK NGÂN HÀNG

## 📋 Tổng quan

Webhook cho phép hệ thống **tự động phát hiện** khi khách hàng chuyển khoản và **tự động duyệt đơn hàng** mà không cần admin xử lý thủ công.

---

## 🔧 API Endpoints

### 1. **Webhook Nhận Thông Báo Từ Ngân Hàng**

**Endpoint:** `POST /api/webhook/bank-transfer`

**Mục đích:** Ngân hàng sẽ gửi thông báo đến endpoint này khi có giao dịch chuyển khoản.

**Request Body:**
```json
{
  "transactionId": "FT23060412345678",
  "amount": 600000,
  "description": "MUA SO 0912341991",
  "accountNumber": "1025311193",
  "transactionDate": "2024-06-04T10:30:00Z",
  "bankCode": "VCB"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Đã xác nhận thanh toán và cập nhật đơn hàng",
  "orderId": 123,
  "simNumber": "0912341991"
}
```

**Quy trình tự động:**
1. ✅ Kiểm tra STK có đúng `1025311193` không
2. ✅ Trích xuất số sim từ nội dung (VD: "MUA SO 0912341991")
3. ✅ Tìm đơn hàng chờ duyệt với số sim đó
4. ✅ Kiểm tra số tiền có khớp không (sai số ±1000đ)
5. ✅ Tự động duyệt đơn hàng
6. ✅ Ghi log mã giao dịch vào ghi chú

---

### 2. **API Test Webhook (Dùng để test)**

**Endpoint:** `POST /api/webhook/test`

**Mục đích:** Test thủ công webhook mà không cần ngân hàng thật.

**Request Body:**
```json
{
  "simNumber": "0912341991",
  "amount": 600000
}
```

**Cách dùng:**
```bash
# Test bằng curl
curl -X POST http://localhost:5000/api/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"simNumber":"0912341991","amount":600000}'
```

**Hoặc dùng Postman:**
- Method: POST
- URL: `http://localhost:5000/api/webhook/test`
- Body (JSON):
  ```json
  {
    "simNumber": "0912341991",
    "amount": 600000
  }
  ```

---

## 🏦 Cách Tích Hợp Với Ngân Hàng

### **Vietcombank Business**

1. Đăng ký tài khoản doanh nghiệp Vietcombank
2. Đăng ký dịch vụ **VCB Webhook** hoặc **VCB API**
3. Cung cấp URL webhook: `https://yourdomain.com/api/webhook/bank-transfer`
4. Vietcombank sẽ gửi POST request khi có giao dịch

### **VietQR / Napas**

1. Đăng ký tài khoản merchant với Napas
2. Tích hợp VietQR Webhook
3. Cấu hình callback URL
4. Nhận thông báo real-time khi quét mã QR

### **Ngân hàng khác**

Hầu hết ngân hàng Việt Nam đều cung cấp webhook/API cho doanh nghiệp:
- Techcombank API
- BIDV API  
- ACB API
- MB Bank API

---

## 🧪 Test Webhook Thủ Công

### **Bước 1: Tạo đơn hàng test**

1. Vào website, mua 1 sim bất kỳ
2. Chọn phương thức **Chuyển khoản**
3. Nhấn **Xác nhận đặt mua**
4. Đơn hàng sẽ ở trạng thái **"Chờ duyệt"**

### **Bước 2: Gọi API test webhook**

```bash
curl -X POST http://localhost:5000/api/webhook/test \
  -H "Content-Type: application/json" \
  -d '{
    "simNumber": "0912341991",
    "amount": 600000
  }'
```

### **Bước 3: Kiểm tra kết quả**

- Vào trang **Admin → Quản lý đơn hàng**
- Đơn hàng sim `0912341991` sẽ chuyển từ **"Chờ duyệt"** → **"Đã duyệt"**
- Ghi chú sẽ có thêm mã giao dịch

---

## 🔐 Bảo Mật Webhook

### **1. Xác thực chữ ký (Signature Verification)**

Thêm vào đầu hàm webhook:

```javascript
// Kiểm tra chữ ký từ ngân hàng
const signature = req.headers['x-webhook-signature'];
const secret = 'YOUR_WEBHOOK_SECRET'; // Ngân hàng cung cấp

const expectedSignature = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (signature !== expectedSignature) {
  return res.status(401).json({ success: false, message: 'Invalid signature' });
}
```

### **2. Whitelist IP**

Chỉ cho phép IP của ngân hàng:

```javascript
const allowedIPs = ['203.162.71.10', '118.69.178.50']; // IP của Vietcombank
const clientIP = req.ip || req.connection.remoteAddress;

if (!allowedIPs.includes(clientIP)) {
  return res.status(403).json({ success: false, message: 'IP not allowed' });
}
```

### **3. Rate Limiting**

Giới hạn số request:

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 100 // Tối đa 100 requests/phút
});

app.post('/api/webhook/bank-transfer', webhookLimiter, async (req, res) => {
  // ...
});
```

---

## 📊 Logs & Monitoring

Webhook sẽ log ra console:

```
📥 Webhook nhận thông báo chuyển khoản: { transactionId: ... }
✅ Đã tự động duyệt đơn hàng #123 - Sim: 0912341991
⚠️ Số tiền không khớp. Nhận: 500000, Cần: 600000
❌ Lỗi webhook: Error...
```

**Khuyến nghị:** Lưu logs vào database hoặc file để theo dõi:

```javascript
// Lưu log webhook vào database
await pool.query(
  'INSERT INTO webhook_logs (transaction_id, amount, description, status, created_at) VALUES (?, ?, ?, ?, NOW())',
  [transactionId, amount, description, 'success']
);
```

---

## 🚀 Deploy Lên Production

### **1. Dùng ngrok (Test trên local)**

```bash
npm install -g ngrok
ngrok http 5000
```

Copy URL ngrok (VD: `https://abc123.ngrok.io`) và cấu hình vào ngân hàng:
```
https://abc123.ngrok.io/api/webhook/bank-transfer
```

### **2. Deploy lên server thật**

```bash
# Ví dụ: Deploy lên Heroku, Railway, Vercel
# URL webhook sẽ là:
https://yourdomain.com/api/webhook/bank-transfer
```

Cung cấp URL này cho ngân hàng để họ gửi webhook tới.

---

## 🎯 Lợi Ích Của Webhook

✅ **Tự động hóa 100%**: Không cần admin duyệt đơn thủ công  
✅ **Real-time**: Khách chuyển khoản xong → Đơn được duyệt ngay lập tức  
✅ **Chính xác**: Tự động đối chiếu số tiền, nội dung, STK  
✅ **Trải nghiệm tốt**: Khách hàng nhận được xác nhận nhanh chóng  
✅ **Giảm sai sót**: Không lo nhầm lẫn hay quên duyệt đơn  

---

## 📞 Hỗ Trợ

Nếu có vấn đề, kiểm tra:
1. Backend có đang chạy không? (`http://localhost:5000`)
2. Database có kết nối không?
3. Đơn hàng có đúng trạng thái "Chờ duyệt" không?
4. Nội dung chuyển khoản có đúng format "MUA SO [số sim]" không?

---

**Tác giả**: MINH THU SIM  
**Ngày tạo**: 2024-06-04  
**Version**: 1.0
