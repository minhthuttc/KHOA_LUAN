# TEST PAYOS INTEGRATION

## LỖI ĐÃ SỬA:
✅ Import PayOS: Changed to `const { PayOS } = require('@payos/node')`

## RESTART BACKEND:
```bash
cd backend
# Stop current server (Ctrl+C)
node index.js
```

## VERIFY:
Backend should start without errors and show:
```
Backend server is running on http://localhost:5000
```

## TEST FLOW:

### 1. Create Order
- Login: Admin / 123
- Select any SIM
- Click "Mua Ngay"
- Fill form:
  - Phone: 0123456789
  - Address: 123 Test
  - Payment: Chuyển khoản
- Click "Xác nhận mua"

### 2. Expected Console Logs (Frontend):
```
📋 PURCHASE REQUEST DATA: { ... }
🌐 Calling API: POST http://localhost:5000/api/purchase
📥 API Response: { success: true, orderId: 21 }
✅ ORDER CREATED
🆔 ORDER ID: 21
🔷 Creating PayOS payment link...
✅ PayOS payment link created:
   - checkoutUrl: https://pay.payos.vn/...
   - qrCode: https://qr.payos.vn/...
   - paymentLinkId: ...
✅ QR Modal opened with PayOS payment link
```

### 3. Expected Backend Logs:
```
🔵 === POST /api/purchase RECEIVED ===
✅ Order created with ID: 21

🔷 === POST /api/payment/create ===
🔍 Loading order: 21
✅ Order loaded: ...
🔷 === CREATING PAYOS PAYMENT LINK ===
📤 Sending to PayOS: { ... }
✅ PayOS Payment Link Created
```

### 4. QR Modal Should Show:
- PayOS QR code image
- Payment info
- "Hệ thống PayOS đang tự động kiểm tra..."

### 5. Pay via PayOS:
- Scan QR with banking app
- Complete payment

### 6. Webhook Received (Backend log):
```
🔔 === PAYOS WEBHOOK RECEIVED ===
🔐 Verifying webhook signature...
✅ Signature verified
💰 Payment successful
🔄 Updating order to PAID...
✅ Order updated to PAID
🔄 Updating sim to "Đã bán"...
✅ Sim marked as "Đã bán"
```

### 7. Frontend Detects PAID:
```
=== POLLING TICK ===
📊 PAYMENT STATUS: PAID
🎉🎉🎉 PAID DETECTED!!!
2️⃣ CLOSING QR MODAL
3️⃣ OPENING SUCCESS MODAL
```

### 8. UI Updates:
- ✅ QR modal closes
- ✅ Success modal opens
- ✅ Alert: "Thanh toán thành công"
- ✅ Redirect after 3 seconds
- ✅ Order history shows "Đã thanh toán"

## IF ERRORS:

### Error: "PayOS is not a constructor"
**FIXED** - Changed import to: `const { PayOS } = require('@payos/node')`

### Error: "Cannot create payment link"
Check:
1. `.env` file has correct PayOS credentials
2. PayOS credentials are valid
3. Backend logs show PayOS error details

### Error: "Webhook not received"
Setup required:
1. Use ngrok: `ngrok http 5000`
2. Copy ngrok URL
3. Configure in PayOS dashboard: `https://abc123.ngrok.io/api/payos/webhook`

### Error: "Payment status not updating"
Check:
1. Webhook received (backend logs)
2. Database updated: `SELECT * FROM don_hang WHERE ma_don_hang = 21`
3. API returns PAID: `curl http://localhost:5000/api/order/payment-status/21`

## SUCCESS CRITERIA:
- [ ] Backend starts without errors
- [ ] Can create order
- [ ] PayOS payment link created
- [ ] QR code displays
- [ ] Can scan and pay
- [ ] Webhook received
- [ ] Database updated to PAID
- [ ] Frontend detects PAID
- [ ] QR modal closes
- [ ] Success modal opens
- [ ] Order history updated
