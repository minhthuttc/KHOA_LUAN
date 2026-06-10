# ✅ CHECKLIST: ĐẢM BẢO CẬP NHẬT KHI THANH TOÁN THÀNH CÔNG

## 🎯 MỤC TIÊU
Khi thanh toán thành công (webhook hoặc approve thủ công), hệ thống PHẢI:
1. ✅ Cập nhật database
2. ✅ Frontend tự động detect
3. ✅ Đóng QR modal
4. ✅ Mở Success modal
5. ✅ Hiện thông báo
6. ✅ Redirect trang chủ

---

## 📋 BACKEND CHECKLIST

### ✅ 1. Webhook Route (`/api/payos/webhook`)
**File**: `backend/index.js` (line ~1193)

**Phải update các fields**:
```sql
UPDATE don_hang SET
  payment_status = 'PAID',     ✅ CRITICAL
  paid_at = NOW(),             ✅ CRITICAL
  transaction_id = ?,          ✅ CRITICAL
  trang_thai = 'Đã duyệt',     ✅ Optional
  ngay_duyet = NOW()           ✅ Optional
WHERE ma_don_hang = ?
```

**Verify**:
```bash
# Check webhook code
grep -A 10 "UPDATE don_hang" backend/index.js | grep payment_status
```

### ✅ 2. Update SIM Status
**Sau khi update đơn hàng, PHẢI update sim**:
```sql
UPDATE the_sim SET trang_thai = 'Đã bán' WHERE so_sim = ?
```

**Verify**:
```bash
# Check sim update code
grep -A 5 "Đã bán" backend/index.js
```

### ✅ 3. Payment Status API (`/api/order/payment-status/:orderId`)
**File**: `backend/index.js` (line ~1030)

**Phải return**:
```json
{
  "success": true,
  "data": {
    "paymentStatus": "PAID",  ✅ CRITICAL - Frontend check field này
    "paidAt": "2026-06-10...",
    "transactionId": "..."
  }
}
```

**Verify**:
```bash
# Test API
curl http://localhost:5000/api/order/payment-status/29
```

---

## 📋 FRONTEND CHECKLIST

### ✅ 1. Polling Logic
**File**: `frontend/src/components/SimCard.js` (line ~50)

**Điều kiện bật polling**:
```javascript
if (currentOrderId && paymentStatus === 'PENDING' && showQRModal) {
  // Start polling ✅
}
```

**Verify**: Check browser console có log này không:
```
✅ POLLING CONDITIONS MET - STARTING POLLING
🔄 POLLING STARTED FOR ORDER: 29
```

### ✅ 2. Detect PAID
**Trong polling interval** (mỗi 3 giây):
```javascript
if (status === 'PAID') {
  setPaymentStatus('PAID');      ✅
  setShowQRModal(false);         ✅
  setShowSuccessModal(true);     ✅
  clearInterval(pollingInterval);✅
  alert('Thanh toán thành công');✅
}
```

**Verify**: Check browser console có log này không:
```
🎉🎉🎉 PAID DETECTED!!!
2️⃣ CLOSING QR MODAL
3️⃣ OPENING SUCCESS MODAL
```

### ✅ 3. Success Modal Render
**File**: `frontend/src/components/SimCard.js`

**Điều kiện hiển thị**:
```javascript
{showSuccessModal && (
  <div>Success Modal Content</div>
)}
```

**Verify**: Mở React DevTools → Tìm `showSuccessModal` state = true

### ✅ 4. Auto Redirect
**Trong Success Modal**:
```javascript
useEffect(() => {
  if (showSuccessModal) {
    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
  }
}, [showSuccessModal]);
```

**Verify**: Sau 3 giây tự redirect về trang chủ

---

## 🧪 TEST WORKFLOW

### Test Script 1: Check Order Status
```bash
cd backend
node check-order-status.js
```

**Expected output**:
```
⚠️  FOUND PROBLEMATIC ORDERS:
Orders with transaction_id BUT payment_status=PENDING:
   node quick-approve.js 29
```

### Test Script 2: Simulate Webhook
```bash
cd backend
node test-webhook.js 29
```

**Expected backend logs**:
```
🔔 === PAYOS WEBHOOK RECEIVED ===
⚠️  TEST MODE: Skipping signature verification
💰 Payment successful
🔄 Updating order to PAID...
✅ Order updated to PAID
🔄 Updating sim to "Đã bán"...
✅ Sim marked as "Đã bán"
```

**Expected frontend logs** (trong ~3 giây):
```
=== POLLING TICK ===
📊 PAYMENT STATUS: PAID
🎉🎉🎉 PAID DETECTED!!!
2️⃣ CLOSING QR MODAL
3️⃣ OPENING SUCCESS MODAL
```

### Test Script 3: Full Flow Test
```bash
cd backend
node test-full-flow.js 29
```

**Expected output**:
```
🎉🎉🎉 ALL TESTS PASSED!

✅ Verification Results:
   ✅ Database payment_status = PAID
   ✅ Database paid_at is set
   ✅ Database trang_thai = "Đã duyệt"
   ✅ API returns success: true
   ✅ API returns paymentStatus: PAID
   ✅ API returns paidAt (not null)
```

---

## 🔍 DEBUGGING STEPS

### Nếu frontend KHÔNG detect PAID:

#### 1. Check Polling Started
**Browser Console → Tìm log**:
```
✅ POLLING CONDITIONS MET - STARTING POLLING
```

Nếu KHÔNG có → Check:
- `currentOrderId` có giá trị không?
- `paymentStatus` = 'PENDING'?
- `showQRModal` = true?

#### 2. Check API Response
**Browser Console → Network Tab → Filter: "payment-status"**

Xem response:
```json
{
  "success": true,
  "data": {
    "paymentStatus": "PAID"  ← Phải là "PAID"
  }
}
```

Nếu vẫn "PENDING" → Webhook chưa chạy hoặc database chưa update

#### 3. Check Database Manually
```bash
cd backend
node check-order-status.js
```

Hoặc query trực tiếp:
```sql
SELECT ma_don_hang, payment_status, paid_at, transaction_id 
FROM don_hang 
WHERE ma_don_hang = 29;
```

#### 4. Check Backend Logs
Khi webhook nhận, backend console PHẢI có:
```
🔔 === PAYOS WEBHOOK RECEIVED ===
✅ Order updated to PAID
```

Nếu KHÔNG có → Webhook chưa được gọi

#### 5. Force Approve
```bash
cd backend
node quick-approve.js 29
```

Sau đó check lại frontend console (trong 3 giây)

---

## 🎓 TÓM TẮT

### Critical Points:
1. **Webhook PHẢI update**: `payment_status='PAID'`, `paid_at=NOW()`
2. **API PHẢI return**: `paymentStatus: "PAID"`
3. **Polling PHẢI chạy**: Check điều kiện `currentOrderId && paymentStatus==='PENDING' && showQRModal`
4. **Frontend PHẢI detect**: if `status === 'PAID'` → setState

### Quick Test:
```bash
# 1. Check problematic orders
node check-order-status.js

# 2. Approve one order
node test-webhook.js 29

# 3. Verify full flow
node test-full-flow.js 29

# 4. Check frontend (browser console)
# Should see: "🎉🎉🎉 PAID DETECTED!!!"
```

### Files to Review:
- ✅ `backend/index.js` (webhook route ~1193, API ~1030)
- ✅ `frontend/src/components/SimCard.js` (polling ~50, detect ~75)
- ✅ `backend/test-full-flow.js` (complete test)
- ✅ `backend/check-order-status.js` (check database)

### Production Setup:
1. Cài ngrok: `ngrok http 5000`
2. Copy URL: `https://abc123.ngrok.io`
3. PayOS Dashboard → Webhook: `https://abc123.ngrok.io/api/payos/webhook`
4. Test thanh toán thật → Webhook tự động về → Frontend tự động update

---

## ✅ VERIFICATION COMMAND

Chạy tất cả tests một lần:
```bash
cd backend

echo "1️⃣ Checking order status..."
node check-order-status.js

echo ""
echo "2️⃣ Testing webhook for order 29..."
node test-webhook.js 29

echo ""
echo "3️⃣ Testing full flow..."
node test-full-flow.js 29

echo ""
echo "✅ All tests completed! Check frontend console now."
```
