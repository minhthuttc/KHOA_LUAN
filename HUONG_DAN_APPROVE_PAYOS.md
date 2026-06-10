# HƯỚNG DẪN APPROVE THANH TOÁN PAYOS (TEST LOCAL)

## VẤN ĐỀ
Sau khi chuyển khoản PayOS thành công, trạng thái đơn hàng vẫn "Chờ thanh toán" (PENDING).

## NGUYÊN NHÂN
PayOS webhook KHÔNG hoạt động trên localhost. Webhook cần:
- URL công khai (public internet)
- HTTPS
- Cấu hình trong PayOS dashboard

Khi test local (localhost:5000), PayOS không thể gửi webhook về máy bạn.

## GIẢI PHÁP TEST LOCAL - 3 CÁCH

### ✅ Cách 1: Giả lập webhook (KHUYẾN NGHỊ - Giống production nhất)

**Ưu điểm**: Test toàn bộ luồng webhook như production

1. **Lấy Order ID** từ console log hoặc database:
```bash
# Trong frontend console log, tìm:
✅ ORDER CREATED
🆔 ORDER ID: 22
```

2. **Chạy script giả lập webhook**:
```bash
cd backend
node test-webhook.js 22
```

3. **Kết quả**:
```
🧪 === TESTING PAYOS WEBHOOK (SIMULATED) ===
🆔 Order ID: 22
📤 Sending webhook payload...

✅ WEBHOOK CALL SUCCESS!
💡 Frontend polling should detect in ~3 seconds
```

4. **Backend log sẽ hiện**:
```
🔔 === PAYOS WEBHOOK RECEIVED ===
⚠️  TEST MODE: Skipping signature verification
💰 Payment successful
🔄 Updating order to PAID...
✅ Order updated to PAID
🔄 Updating sim to "Đã bán"...
✅ Sim marked as "Đã bán"
```

5. **Frontend tự động** (sau ~3 giây):
   - Detect PAID
   - Đóng QR modal  
   - Mở Success modal
   - Hiện "Thanh toán thành công"

---

### Cách 2: Approve thủ công bằng script (NHANH NHẤT)

**Ưu điểm**: Đơn giản, nhanh, không cần webhook

1. **Lấy Order ID** từ giao diện hoặc database
   - Xem trong console log frontend: "ORDER ID: 22"
   - Hoặc query database: `SELECT ma_don_hang FROM don_hang ORDER BY ma_don_hang DESC LIMIT 1`

2. **Chạy script approve**:
```bash
cd backend
node quick-approve.js <ORDER_ID>
```

Ví dụ:
```bash
node quick-approve.js 22
```

3. **Kết quả**:
```
🚀 === QUICK APPROVE ORDER ===
🆔 Order ID: 22
📋 Order: 0909123456 - 5000000 VNĐ
📊 Current status: PENDING

🔄 Updating to PAID...
✅ ORDER UPDATED TO PAID!
🔄 Updating sim to "Đã bán"...
✅ Sim 0909123456 marked as "Đã bán"

⏰ Polling will detect in ~3 seconds...
💡 Check browser console for auto-update!
```

4. **Trong 3 giây**, frontend sẽ tự động:
   - Detect PAID
   - Đóng QR modal
   - Mở Success modal
   - Hiện thông báo "Thanh toán thành công"

### Cách 2: Approve thủ công bằng script (NHANH NHẤT)

**Ưu điểm**: Đơn giản, nhanh, không cần webhook

1. **Chạy script approve**:
```bash
cd backend
node quick-approve.js 22
```

2. **Kết quả**: Frontend tự động detect PAID sau ~3 giây

---

### Cách 3: Dùng ngrok để PayOS gọi webhook thật (PRODUCTION-LIKE)

1. **Cài đặt ngrok**:
   - Download: https://ngrok.com/download
   - Hoặc: `choco install ngrok` (Windows)

2. **Chạy ngrok**:
```bash
ngrok http 5000
```

Kết quả:
```
Forwarding: https://abc123xyz.ngrok.io -> http://localhost:5000
```

3. **Cấu hình PayOS webhook**:
   - Đăng nhập PayOS Dashboard
   - Vào Settings → Webhook
   - Webhook URL: `https://abc123xyz.ngrok.io/api/payos/webhook`
   - Lưu lại

4. **Test thật**:
   - Tạo đơn hàng mới
   - Thanh toán PayOS
   - PayOS sẽ TỰ ĐỘNG gọi webhook
   - Backend log sẽ hiện: `🔔 === PAYOS WEBHOOK RECEIVED ===`
   - Đơn hàng TỰ ĐỘNG chuyển PAID

## KIỂM TRA TRẠNG THÁI

### Check database:
```sql
SELECT ma_don_hang, so_sim, payment_status, paid_at, transaction_id 
FROM don_hang 
ORDER BY ma_don_hang DESC 
LIMIT 5;
```

### Check API:
```bash
curl http://localhost:5000/api/order/payment-status/<ORDER_ID>
```

Ví dụ:
```bash
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

## WORKFLOW HOÀN CHỈNH

### Local Testing (với quick-approve):
1. User: Bấm "Mua Ngay" → Quét QR PayOS
2. User: Thanh toán thành công trên app ngân hàng
3. **Dev**: Chạy `node quick-approve.js 22`
4. Frontend: Tự động detect PAID sau 3s → Success modal

### Production (với ngrok webhook):
1. User: Bấm "Mua Ngay" → Quét QR PayOS
2. User: Thanh toán thành công
3. PayOS: Tự động gọi webhook → Backend nhận
4. Backend: Cập nhật PAID + "Đã bán"
5. Frontend: Tự động detect PAID → Success modal

## DEBUG LOGS

### Frontend console (khi PAID):
```
=== POLLING TICK ===
📊 PAYMENT STATUS: PAID
🎉🎉🎉 PAID DETECTED!!!
2️⃣ CLOSING QR MODAL
3️⃣ OPENING SUCCESS MODAL
✅ Thanh toán thành công!
```

### Backend console (khi webhook nhận):
```
🔔 === PAYOS WEBHOOK RECEIVED ===
🔐 Verifying webhook signature...
✅ Signature verified
💰 Payment successful for order: 22
🔄 Updating order to PAID...
✅ Order updated
🔄 Updating sim to "Đã bán"...
✅ Sim marked as sold
```

## TÓM TẮT

| Cách | Lệnh | Tự động? | Giống production? |
|------|------|----------|-------------------|
| **1. Giả lập webhook** | `node test-webhook.js <ID>` | ✅ Tự động | ⭐⭐⭐ Cao nhất |
| **2. Approve thủ công** | `node quick-approve.js <ID>` | ✅ Tự động | ⭐ Thấp (skip webhook) |
| **3. ngrok webhook** | Cấu hình ngrok + PayOS | ✅ Tự động | ⭐⭐⭐ 100% thật |

**Khuyến nghị test local**: 
1. **Thường xuyên**: Dùng `test-webhook.js` - test cả luồng webhook
2. **Debug nhanh**: Dùng `quick-approve.js` - chỉ update database
3. **Test production**: Dùng ngrok - webhook thật từ PayOS
