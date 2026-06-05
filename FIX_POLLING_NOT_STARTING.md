# FIX: POLLING KHÔNG BẮT ĐẦU - currentOrderId = null

## 🔴 LỖI PHÁT HIỆN

Console log hiển thị:
```
currentOrderId: null
showQRModal: false
POLLING CONDITIONS NOT MET
```

**Kết quả:** Polling không bắt đầu → Không tự động phát hiện thanh toán

---

## 🔍 NGUYÊN NHÂN

### Vấn đề 1: React setState là BẤT ĐỒNG BỘ

Khi gọi:
```javascript
setCurrentOrderId(123);
setShowQRModal(true);
```

State **KHÔNG** update ngay lập tức. React sẽ batch các setState lại và update trong lần render tiếp theo.

### Vấn đề 2: useEffect chạy với state CŨ

useEffect polling có dependencies `[currentOrderId, paymentStatus, showQRModal]`:
- Lần đầu render: `currentOrderId = null`, `showQRModal = false`
- useEffect chạy → Không đủ điều kiện → Không start polling
- setState được gọi → Schedule re-render
- Lần render thứ 2: `currentOrderId = 123`, `showQRModal = true`
- useEffect chạy LẠI → Đủ điều kiện → Start polling ✅

**NHƯNG:** Nếu có vấn đề gì trong quá trình này, polling sẽ không bắt đầu.

---

## ✅ GIẢI PHÁP

### 1. Thêm Debug useEffect

Thêm một useEffect riêng để log MỖI KHI state thay đổi:

```javascript
// Debug useEffect - Log mỗi khi state thay đổi
useEffect(() => {
  console.log('\n📊 === STATE CHANGED ===');
  console.log('currentOrderId:', currentOrderId);
  console.log('paymentStatus:', paymentStatus);
  console.log('showQRModal:', showQRModal);
  console.log('showSuccessModal:', showSuccessModal);
  console.log('======================\n');
}, [currentOrderId, paymentStatus, showQRModal, showSuccessModal]);
```

**Lợi ích:**
- Biết chính xác khi nào state thay đổi
- Verify setState có hoạt động không
- Track sequence of state updates

---

### 2. Thêm Log Chi Tiết trong handlePurchase

**TRƯỚC:**
```javascript
setCurrentOrderId(response.data.orderId);
setShowQRModal(true);
```

**SAU:**
```javascript
const newOrderId = response.data.orderId;

console.log('✅ ORDER CREATED');
console.log('📥 Full response.data:', JSON.stringify(response.data, null, 2));
console.log('🆔 ORDER ID:', newOrderId);

console.log('🔧 Calling setCurrentOrderId(' + newOrderId + ')');
setCurrentOrderId(newOrderId);

console.log('🔧 Calling setPaymentStatus("PENDING")');
setPaymentStatus('PENDING');

console.log('⏳ State sẽ được update sau render tiếp theo...');

// ...

console.log('🔧 Calling setShowQRModal(true) - OPEN QR MODAL');
console.log('📊 Current state BEFORE setState:');
console.log('   - currentOrderId (old):', currentOrderId);
console.log('   - showQRModal (old):', showQRModal);

setShowQRModal(true);

console.log('✅ All setState called - waiting for React to re-render...');
```

**Lợi ích:**
- Thấy rõ orderId có được nhận từ API không
- Thấy setState có được gọi không
- Biết state cũ trước khi update

---

### 3. Log Chi Tiết trong Backend

```javascript
app.post('/api/purchase', async (req, res) => {
  // ...
  
  const orderId = result.insertId;
  
  console.log('✅ Order created with ID:', orderId);

  res.json({ 
    success: true, 
    message: 'Đặt mua sim thành công!',
    orderId: orderId,  // ← XÁC NHẬN TRẢ VỀ
    simNumber: sim_number
  });
});
```

---

## 🧪 CÁCH VERIFY

### Bước 1: Mở Console và làm theo flow mua sim

### Bước 2: Kiểm tra Log Sequence

**PHẢI THẤY THEO THỨ TỰ:**

```
// Trong handlePurchase
✅ ORDER CREATED
📥 Full response.data: {"success":true,"orderId":123,...}
🆔 ORDER ID: 123
🔧 Calling setCurrentOrderId(123)
🔧 Calling setPaymentStatus("PENDING")
⏳ State sẽ được update sau render tiếp theo...
📊 Current state BEFORE setState:
   - currentOrderId (old): null
   - showQRModal (old): false
🔧 Calling setShowQRModal(true) - OPEN QR MODAL
✅ All setState called - waiting for React to re-render...

// React re-render → Debug useEffect chạy
📊 === STATE CHANGED ===
currentOrderId: 123          ← ✅ ĐÃ CÓ GIÁ TRỊ
paymentStatus: PENDING
showQRModal: true            ← ✅ ĐÃ MỞ
showSuccessModal: false
======================

// Polling useEffect chạy LẠI
=== POLLING USEEFFECT TRIGGERED ===
currentOrderId: 123          ← ✅ KHÔNG CÒN NULL
paymentStatus: PENDING
showQRModal: true            ← ✅ KHÔNG CÒN FALSE

✅ POLLING CONDITIONS MET - STARTING POLLING  ← ✅ BẮT ĐẦU POLLING
🔄 POLLING STARTED FOR ORDER: 123
⏰ Tự động kiểm tra mỗi 3 giây...

// Sau 3 giây
=== POLLING TICK ===
⏰ CHECK PAYMENT STATUS AT: 10:30:45
📋 ORDER ID: 123
🌐 Calling API: http://localhost:5000/api/order/payment-status/123
...
```

---

## ❓ NẾU VẪN THẤY "POLLING CONDITIONS NOT MET"

### Check 1: orderId có được trả về từ backend không?

**Log cần kiểm tra:**
```
📥 Full response.data: {"success":true,"orderId":123,...}
```

**Nếu orderId = undefined:**
- Backend không trả về orderId
- Check backend code: `res.json({ orderId: orderId })`

---

### Check 2: setState có được gọi không?

**Log cần kiểm tra:**
```
🔧 Calling setCurrentOrderId(123)
🔧 Calling setShowQRModal(true)
```

**Nếu không thấy log này:**
- Code không chạy tới đó
- Có lỗi trước đó (try-catch)
- Check error logs

---

### Check 3: State có được update không?

**Log cần kiểm tra:**
```
📊 === STATE CHANGED ===
currentOrderId: 123  ← ĐÃ KHÁC null
showQRModal: true    ← ĐÃ KHÁC false
```

**Nếu vẫn thấy null/false:**
- React không re-render
- setState bị block
- Component unmount trước khi re-render

---

### Check 4: useEffect polling có chạy LẠI không?

**Log cần kiểm tra:**
```
=== POLLING USEEFFECT TRIGGERED ===
currentOrderId: 123
showQRModal: true
✅ POLLING CONDITIONS MET - STARTING POLLING
```

**Nếu không chạy lại:**
- Dependencies không thay đổi
- useEffect bị disable
- Component unmount

---

## 🎯 KẾT QUẢ MONG ĐỢI SAU KHI FIX

### Flow hoàn chỉnh:

```
1. User nhấn "Xác nhận mua"
2. API /api/purchase được gọi
3. Backend trả về: {orderId: 123}
4. Frontend log: "ORDER CREATED", orderId: 123
5. setState được gọi: setCurrentOrderId(123), setShowQRModal(true)
6. React re-render
7. Debug useEffect log: currentOrderId: 123, showQRModal: true
8. Polling useEffect chạy lại
9. Polling log: "POLLING CONDITIONS MET"
10. Polling log: "POLLING STARTED FOR ORDER: 123"
11. Sau 3s: "POLLING TICK"
12. Gọi API: GET /api/order/payment-status/123
13. Nhận response: {paymentStatus: "PENDING"}
14. Log: "Status is still: PENDING - Continue polling..."
15. [Sau khi thanh toán] DB update: payment_status = 'PAID'
16. Polling tick tiếp theo: Nhận {paymentStatus: "PAID"}
17. Log: "🎉🎉🎉 PAID DETECTED!!!"
18. Tự động: Đóng QR modal, Mở Success modal, Alert
19. ✅ HOÀN TẤT
```

---

## 📝 FILES ĐÃ SỬA

### 1. `frontend/src/components/SimCard.js`

**Thêm Debug useEffect:**
```javascript
// DÒNG ~23 (sau khi khai báo state)
useEffect(() => {
  console.log('\n📊 === STATE CHANGED ===');
  console.log('currentOrderId:', currentOrderId);
  console.log('paymentStatus:', paymentStatus);
  console.log('showQRModal:', showQRModal);
  console.log('showSuccessModal:', showSuccessModal);
  console.log('======================\n');
}, [currentOrderId, paymentStatus, showQRModal, showSuccessModal]);
```

**Thêm Log trong handlePurchase:**
```javascript
// DÒNG ~405 (trong try block của bank_transfer)
const newOrderId = response.data.orderId;

console.log('✅ ORDER CREATED');
console.log('📥 Full response.data:', JSON.stringify(response.data, null, 2));
console.log('🆔 ORDER ID:', newOrderId);

// ... các setState ...

console.log('📊 Current state BEFORE setState:');
console.log('   - currentOrderId (old):', currentOrderId);
console.log('   - showQRModal (old):', showQRModal);

setShowQRModal(true);

console.log('✅ All setState called - waiting for React to re-render...');
```

---

## 🔧 NEXT STEPS

1. ✅ Frontend đã có log đầy đủ
2. ✅ Backend đã có log đầy đủ
3. ✅ Debug useEffect để track state changes
4. ⏳ **TEST THỰC TẾ:** Chạy lại flow mua sim và xem log
5. ⏳ **VERIFY:** Polling có bắt đầu không
6. ⏳ **VERIFY:** Khi update DB, có tự động phát hiện không

---

**Ngày sửa:** 2026-06-05  
**Trạng thái:** ✅ CODE ĐÃ SỬA - CHỜ TEST
