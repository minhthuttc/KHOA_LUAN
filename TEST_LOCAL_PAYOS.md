# TEST PAYOS THANH TOÁN LOCAL - HƯỚNG DẪN ĐẦY ĐỦ

## 🎯 MỤC TIÊU
Test toàn bộ luồng thanh toán PayOS trên localhost mà không cần deploy lên production.

## ⚠️ VẤN ĐỀ KHI TEST LOCAL

**Triệu chứng**: 
- Thanh toán PayOS thành công trên app ngân hàng
- Nhưng đơn hàng vẫn hiện "Chờ thanh toán" (PENDING)
- QR modal không tự đóng
- Success modal không xuất hiện

**Nguyên nhân**:
PayOS webhook KHÔNG thể gọi về `localhost:5000` vì:
- Localhost không có IP công khai
- PayOS cần URL có thể truy cập từ internet
- PayOS cần HTTPS (production)

## ✅ GIẢI PHÁP - 3 CÁCH

---

### 🔷 CÁCH 1: Giả lập webhook (KHUYẾN NGHỊ)

**Tốt nhất cho**: Test toàn bộ flow webhook như production

#### Bước 1: Tạo đơn hàng
1. Đăng nhập: Admin / 123
2. Chọn sim → Mua Ngay
3. Điền form → Xác nhận mua
4. **GHI LẠI ORDER ID** từ console log:
```
✅ ORDER CREATED
🆔 ORDER ID: 22
```

#### Bước 2: Thanh toán (hoặc không cần)
- Có thể quét QR thanh toán thật (nhưng webhook không về)
- Hoặc bỏ qua bước này nếu chỉ test flow

#### Bước 3: Giả lập webhook
```bash
cd backend
node test-webhook.js 22
```

#### Bước 4: Kiểm tra kết quả

**Backend console sẽ log**:
```
🔔 === PAYOS WEBHOOK RECEIVED ===
⚠️  TEST MODE: Skipping signature verification
💰 Payment successful: Order 22
🔄 Updating order to PAID...
✅ Order updated to PAID
🔄 Updating sim to "Đã bán"...
✅ Sim marked as "Đã bán"
⏰ Frontend polling will detect in ~3 seconds
```

**Frontend (browser console) sẽ log** (sau ~3 giây):
```
=== POLLING TICK ===
📊 PAYMENT STATUS: PAID
🎉🎉🎉 PAID DETECTED!!!
2️⃣ CLOSING QR MODAL
3️⃣ OPENING SUCCESS MODAL
```

**UI sẽ**:
- ✅ QR modal tự đóng
- ✅ Success modal xuất hiện
- ✅ Alert "Thanh toán thành công!"
- ✅ Redirect về trang chủ sau 3s
- ✅ Lịch sử đơn hàng hiện "Đã thanh toán"

---

### 🔷 CÁCH 2: Approve thủ công (NHANH NHẤT)

**Tốt nhất cho**: Debug nhanh, skip webhook flow

```bash
cd backend
node quick-approve.js 22
```

Kết quả tương tự Cách 1, nhưng skip webhook flow.

---

### 🔷 CÁCH 3: Ngrok webhook thật (GIỐNG PRODUCTION 100%)

**Tốt nhất cho**: Test giống production hoàn toàn

#### Bước 1: Cài đặt ngrok
```bash
# Download: https://ngrok.com/download
# Hoặc:
choco install ngrok  # Windows
brew install ngrok   # macOS
```

#### Bước 2: Chạy ngrok
```bash
ngrok http 5000
```

Kết quả:
```
Forwarding: https://abc123xyz.ngrok.io -> http://localhost:5000
```

**Sao chép URL ngrok**: `https://abc123xyz.ngrok.io`

#### Bước 3: Cấu hình PayOS Dashboard
1. Đăng nhập PayOS Dashboard
2. Vào Settings → Webhook
3. Webhook URL: `https://abc123xyz.ngrok.io/api/payos/webhook`
4. Save

#### Bước 4: Test thật
1. Tạo đơn hàng mới
2. Quét QR PayOS
3. Thanh toán trên app ngân hàng
4. PayOS TỰ ĐỘNG gọi webhook
5. Backend nhận webhook → Update PAID
6. Frontend detect → Success modal

**Backend log sẽ hiện**:
```
🔔 === PAYOS WEBHOOK RECEIVED ===
🔐 Verifying webhook signature...
✅ Webhook signature verified  ← Khác với test mode!
💰 Payment successful
```

---

## 📊 SO SÁNH 3 CÁCH

| Tiêu chí | Cách 1: Giả lập | Cách 2: Approve | Cách 3: Ngrok |
|----------|-----------------|-----------------|---------------|
| **Độ khó** | ⭐ Dễ | ⭐ Rất dễ | ⭐⭐⭐ Phức tạp |
| **Tốc độ** | ⚡ Nhanh | ⚡⚡⚡ Rất nhanh | ⚡ Nhanh |
| **Giống production** | ⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ |
| **Test webhook flow** | ✅ Có | ❌ Không | ✅ Có |
| **Cần thanh toán thật** | ❌ | ❌ | ✅ |
| **Cần cấu hình** | ❌ | ❌ | ✅ PayOS dashboard |
| **Verify signature** | ❌ Skip | ❌ Skip | ✅ Thật |

**Khuyến nghị**:
- **Dev thường ngày**: Cách 1 (giả lập webhook)
- **Debug nhanh**: Cách 2 (approve thủ công)
- **Test cuối**: Cách 3 (ngrok + thanh toán thật)

---

## 🔍 DEBUG & VERIFY

### Kiểm tra database
```sql
-- Xem đơn hàng mới nhất
SELECT ma_don_hang, so_sim, gia_mua, payment_status, paid_at, transaction_id 
FROM don_hang 
ORDER BY ma_don_hang DESC 
LIMIT 5;

-- Kiểm tra sim đã bán
SELECT so_sim, gia_ban, trang_thai 
FROM the_sim 
WHERE trang_thai = 'Đã bán'
ORDER BY ma_sim DESC
LIMIT 5;
```

### Kiểm tra API
```bash
# Lấy order ID mới nhất từ database trước
curl http://localhost:5000/api/order/payment-status/22
```

Kết quả mong đợi:
```json
{
  "success": true,
  "data": {
    "paymentStatus": "PAID",
    "paidAt": "2026-06-10T15:30:45.000Z"
  }
}
```

### Frontend console logs

**Khi tạo đơn**:
```
📤 Đang gọi API tạo đơn hàng...
✅ ORDER CREATED
🆔 ORDER ID: 22
🔷 Creating PayOS payment link...
✅ PayOS payment link created
✅ QR Modal opened
```

**Khi polling detect PAID**:
```
=== POLLING TICK ===
📊 PAYMENT STATUS: PAID
🎉🎉🎉 PAID DETECTED!!!
2️⃣ CLOSING QR MODAL
3️⃣ OPENING SUCCESS MODAL
```

---

## 🚨 TROUBLESHOOTING

### Lỗi: "Order not found"
```bash
# Kiểm tra order ID có đúng không
SELECT * FROM don_hang WHERE ma_don_hang = 22;
```

### Lỗi: "Webhook signature verification failed"
- Đây là bình thường khi dùng test-webhook.js
- Script tự động skip verification với TEST_ prefix
- Nếu vẫn lỗi, check backend logs

### Frontend không detect PAID
1. Mở browser console → Network tab
2. Filter: `payment-status`
3. Xem API có được gọi không (mỗi 3s)
4. Check response có trả `"paymentStatus": "PAID"` không

### QR modal không đóng
1. Check browser console logs
2. Tìm "PAID DETECTED"
3. Nếu không có → polling chưa chạy
4. Nếu có nhưng modal vẫn mở → React state issue

---

## 📝 WORKFLOW HOÀN CHỈNH

### Local Development (Cách 1 - Khuyến nghị):
```
User: Tạo đơn → Lấy ORDER_ID từ log
Dev:  node test-webhook.js <ORDER_ID>
       ↓
Backend: Nhận webhook → Update PAID + "Đã bán"
       ↓
Frontend: Polling detect (3s) → Close QR → Open Success
       ↓
User: Thấy "Thanh toán thành công" → Redirect trang chủ
```

### Production (Cách 3):
```
User: Tạo đơn → Quét QR → Thanh toán
       ↓
PayOS: Webhook → Backend
       ↓
Backend: Verify signature → Update PAID + "Đã bán"
       ↓
Frontend: Polling detect → Close QR → Open Success
       ↓
User: Thấy "Thanh toán thành công" → Redirect
```

---

## 🎓 TÓM TẮT

1. **Test local**: Dùng `test-webhook.js` hoặc `quick-approve.js`
2. **Webhook tự động skip signature** nếu reference bắt đầu với `TEST_`
3. **Polling frontend** tự động detect PAID mỗi 3 giây
4. **Success modal** tự động mở khi detect PAID
5. **Production**: Cấu hình ngrok hoặc webhook URL thật

**Lệnh quan trọng**:
```bash
# Giả lập webhook (khuyến nghị)
node test-webhook.js 22

# Approve thủ công (nhanh)
node quick-approve.js 22

# Test PayOS API format
node test-payos-qr.js
```
