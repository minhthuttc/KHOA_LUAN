# PayOS Migration Documentation

# PayOS Migration Documentation

## ✅ COMPLETED - Latest Fix: QR Code Display

**Issue**: QR code image not displaying in payment modal  
**Root Cause**: PayOS API returns `qrCode` as raw EMVCo QR data string, not an image URL  
**Solution**: Use `qrcode` npm library to generate QR image from data string

```javascript
// PayOS returns raw QR data string:
const payosResponse = {
  qrCode: "00020101021238570010A000000727012700069704220113VQRQAJPOJ415...",
  checkoutUrl: "https://pay.payos.vn/web/..."
};

// Convert to image using qrcode library:
const qrImageUrl = await QRCode.toDataURL(payosResponse.qrCode, {
  width: 400,
  margin: 2
});
// Now qrImageUrl = "data:image/png;base64,iVBORw0KGgo..."
```

**Files Changed**: `frontend/src/components/SimCard.js`

---

## Overview
Migrated from custom bank transfer matching to official PayOS payment gateway integration.

## Changes Made

### 1. Backend Dependencies
**Added:**
- `@payos/node` - Official PayOS SDK

**Installation:**
```bash
cd backend
npm install @payos/node
```

### 2. Environment Variables (backend/.env)
```env
PAYOS_CLIENT_ID=019edbf0-b561-40a4-92ff-9f530fb7eada
PAYOS_API_KEY=b65de818-00a9-4b26-85db-0fddb9b9f2ae
PAYOS_CHECKSUM_KEY=f50ecce42561f2e6f951b6047cf1320dd363b67aa27275566d25f77aec29b59c
```

### 3. New Files Created

#### backend/services/payosService.js
PayOS service wrapper providing:
- `createPaymentLink(orderData)` - Create payment link
- `verifyWebhookSignature(webhookData)` - Verify webhook
- `getPaymentInfo(paymentLinkId)` - Get payment status
- `cancelPaymentLink(paymentLinkId)` - Cancel payment

### 4. New API Endpoints

#### POST /api/payment/create
**Purpose:** Create PayOS payment link for order

**Request:**
```json
{
  "orderId": 123
}
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://pay.payos.vn/...",
  "qrCode": "https://qr.payos.vn/...",
  "paymentLinkId": "...",
  "orderCode": "123"
}
```

#### POST /api/payos/webhook
**Purpose:** Receive PayOS payment notifications

**Workflow:**
1. Verify webhook signature
2. Extract payment data
3. Update order: `payment_status = 'PAID'`
4. Update sim: `trang_thai = 'Đã bán'`

**PayOS Webhook Data Format:**
```json
{
  "code": "00",
  "desc": "success",
  "data": {
    "orderCode": 123,
    "amount": 1500000,
    "paymentLinkId": "...",
    "reference": "..."
  }
}
```

### 5. Frontend Changes (SimCard.js)

**Removed:**
- Manual VietQR URL generation
- Custom bank transfer description
- Manual amount/description matching

**Added:**
- Call `/api/payment/create` after order creation
- Display PayOS QR code
- Updated instructions for PayOS

**Flow:**
1. User clicks "Xác nhận mua"
2. Frontend calls `/api/purchase` → creates order
3. Frontend calls `/api/payment/create` → gets PayOS link
4. Display PayOS QR code
5. User scans and pays
6. PayOS webhook → backend updates order
7. Frontend polling detects PAID
8. Success modal appears

### 6. Database Changes
**No schema changes required**

Existing fields used:
- `don_hang.payment_status` - PENDING → PAID
- `don_hang.paid_at` - Timestamp of payment
- `don_hang.transaction_id` - PayOS payment link ID or reference
- `the_sim.trang_thai` - "Còn hàng" → "Đã bán"

### 7. Removed Code

**Deleted from backend/index.js:**
- Old webhook `/api/webhook/bank-transfer`
- Bank account number matching logic
- Regex description parsing (MUA SO...)
- Amount difference tolerance logic

**Files can be deleted:**
- `backend/test-payment-flow.js` (old custom test)

### 8. Webhook Configuration

**PayOS Dashboard Setup:**
1. Login to https://business.payos.vn
2. Navigate to Settings → Webhook
3. Set webhook URL: `https://your-domain.com/api/payos/webhook`
4. Save configuration

**For local testing:**
Use ngrok or similar:
```bash
ngrok http 5000
# Use the ngrok URL in PayOS dashboard:
# https://abc123.ngrok.io/api/payos/webhook
```

## Testing

### Full End-to-End Test

1. **Start Backend:**
```bash
cd backend
npm install  # First time only
node index.js
```

2. **Start Frontend:**
```bash
cd frontend
npm run dev
```

3. **Test Flow:**
- ✅ Login to system
- ✅ Select a SIM card
- ✅ Click "Mua Ngay"
- ✅ Fill customer information
- ✅ Choose "Chuyển khoản" payment method
- ✅ Click "Xác nhận mua"
- ✅ Verify PayOS QR code appears
- ✅ Scan QR with banking app
- ✅ Complete payment
- ✅ Verify webhook received (check backend logs)
- ✅ Verify database updated (payment_status = PAID)
- ✅ Verify frontend polling detects PAID
- ✅ Verify QR modal closes
- ✅ Verify success modal appears
- ✅ Verify "Thanh toán thành công" message
- ✅ Verify redirect after 3 seconds
- ✅ Verify order history shows "Đã thanh toán"
- ✅ Verify SIM removed from available inventory

### Manual Testing Scripts

**Test PayOS Payment Link Creation:**
```bash
cd backend
node -e "
const payos = require('./services/payosService');
payos.createPaymentLink({
  orderId: 999,
  orderCode: 999,
  amount: 1000,
  description: 'Test payment',
  buyerName: 'Test User',
  buyerPhone: '0123456789'
}).then(console.log).catch(console.error);
"
```

**Check Order Status:**
```bash
mysql -u root -pThu2220403 ai_sim_db -e "
SELECT ma_don_hang, so_sim, payment_status, paid_at, transaction_id 
FROM don_hang 
ORDER BY ngay_mua DESC 
LIMIT 5;
"
```

## Deployment

### Production Environment Variables
Update `.env` with production PayOS credentials:
```env
PAYOS_CLIENT_ID=<production_client_id>
PAYOS_API_KEY=<production_api_key>
PAYOS_CHECKSUM_KEY=<production_checksum_key>
FRONTEND_URL=https://your-production-domain.com
```

### Webhook URL
Configure in PayOS dashboard:
```
https://your-production-api-domain.com/api/payos/webhook
```

### SSL Certificate
PayOS requires HTTPS for webhook. Ensure SSL certificate is installed.

## Troubleshooting

### Webhook not received
- Check PayOS dashboard webhook configuration
- Verify webhook URL is publicly accessible
- Check backend logs for incoming requests
- Test webhook manually using PayOS test tool

### Payment not detected by frontend
- Check backend logs for webhook processing
- Verify database `payment_status` updated to PAID
- Check frontend console for polling logs
- Verify API `/api/order/payment-status/:orderId` returns PAID

### QR code not displaying
- Check network tab for `/api/payment/create` response
- Verify PayOS credentials in `.env`
- Check backend logs for PayOS API errors

## Support
- PayOS Documentation: https://payos.vn/docs
- PayOS Support: support@payos.vn
