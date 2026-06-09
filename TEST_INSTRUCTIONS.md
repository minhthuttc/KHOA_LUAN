# HƯỚNG DẪN TEST VỚI ORDER ID 20 (ĐÃ PAID)

## HIỆN TRẠNG:
- Order ID: **20**
- Sim: **0999996766**
- Payment Status: **PAID** (đã confirm bằng API)
- API Response: `{"success":true,"data":{"orderId":20,"paymentStatus":"PAID",...}}`

## CÁCH TEST:

### BƯỚC 1: Khởi động hệ thống

```bash
# Terminal 1 - Backend
cd backend
node index.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### BƯỚC 2: Mở Browser với DevTools

1. Mở: **http://localhost:3000**
2. Nhấn **F12** để mở DevTools
3. Chọn tab **Console**
4. Clear console (Ctrl+L)

### BƯỚC 3: Tạo đơn hàng mới hoặc dùng đơn cũ

**OPTION A: Tạo đơn mới**
1. Đăng nhập (Admin/123)
2. Chọn sim bất kỳ → Mua Ngay
3. Điền form → Chọn Chuyển khoản
4. Click "Xác nhận mua"
5. **QR Modal mở** → Note lại Order ID trong console

**OPTION B: Trigger polling cho Order 20**

Mở Console trong browser, paste code này:

```javascript
// Giả lập component SimCard với Order ID 20
(async function testPolling() {
  console.log('🧪 MANUAL POLLING TEST FOR ORDER 20');
  console.log('');
  
  const orderId = 20;
  const apiUrl = `http://localhost:5000/api/order/payment-status/${orderId}`;
  
  console.log('🌐 Calling API:', apiUrl);
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    console.log('📥 POLLING RESPONSE:', JSON.stringify(data, null, 2));
    console.log('');
    
    if (data.success && data.data.paymentStatus === 'PAID') {
      console.log('🎉 PAID DETECTED!!!');
      console.log('');
      console.log('Expected behavior:');
      console.log('✅ QR Modal should close');
      console.log('✅ Success Modal should open');
      console.log('✅ Alert should show');
    } else {
      console.log('❌ Status:', data.data?.paymentStatus);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
```

### BƯỚC 4: Approve đơn hàng (nếu dùng option A)

Nếu bạn tạo đơn mới, mở terminal mới:

```bash
cd backend
node quick-approve.js [ORDER_ID] MANUAL
```

Thay `[ORDER_ID]` bằng số order bạn vừa tạo.

### BƯỚC 5: Quan sát Console Logs

**Logs BẮT BUỘC phải xuất hiện theo thứ tự:**

```
=== POLLING TICK ===
⏰ CHECK PAYMENT STATUS AT: ...
📋 ORDER ID: 20
🌐 Calling API: http://localhost:5000/api/order/payment-status/20
📥 API RESPONSE RECEIVED:
response.data: { "success": true, "data": { "paymentStatus": "PAID", ... } }
📊 PAYMENT STATUS: PAID

🎉🎉🎉 PAID DETECTED!!! 🎉🎉🎉
✅ Phát hiện thanh toán thành công!
🔄 Đang thực hiện các actions...

BEFORE setState:
  - paymentStatus (current): PENDING
  - showQRModal (current): true
  - showSuccessModal (current): false

1️⃣ Calling setPaymentStatus("PAID")...
2️⃣ CLOSING QR MODAL - Calling setShowQRModal(false)...
3️⃣ OPENING SUCCESS MODAL - Calling setShowSuccessModal(true)...
4️⃣ Clearing interval...
5️⃣ Showing alert...

✅ ALL SETSTATE CALLS COMPLETED
⏳ Waiting for React to re-render...
   Next, check STATE CHANGED log to confirm state updates
```

**SAU ĐÓ:**

```
📊 === STATE CHANGED ===
currentOrderId: 20
paymentStatus: PAID
showQRModal: false
showSuccessModal: true
======================

🎉 SUCCESS MODAL SHOULD BE VISIBLE NOW!
   - paymentStatus = PAID ✓
   - showQRModal = false ✓
   - showSuccessModal = true ✓
```

**SAU ĐÓ:**

```
🔵 RENDERING QR MODAL - showQRModal = false
   (QR Modal KHÔNG render)

🟢 RENDERING SUCCESS MODAL - showSuccessModal = true
   (Success Modal ĐANG render)
```

### BƯỚC 6: Quan sát UI

**NẾU LOGS ĐÚNG:**
- ✅ Alert "Thanh toán thành công" xuất hiện
- ✅ QR Modal biến mất
- ✅ Success Modal (màn xanh với ✓ icon) xuất hiện
- ✅ Hiển thị thông tin đơn hàng

**NẾU LOGS ĐÚNG NHƯNG UI KHÔNG ĐỔI:**
→ **Lỗi render hoặc CSS z-index**

**NẾU KHÔNG CÓ LOG "PAID DETECTED":**
→ **Polling không chạy hoặc API không trả PAID**

**NẾU CÓ "PAID DETECTED" NHƯNG KHÔNG CÓ "STATE CHANGED":**
→ **setState không hoạt động (React lỗi)**

## CLEAN UP:

```bash
# Xóa order test
mysql -u root -pThu2220403 ai_sim_db -e "DELETE FROM don_hang WHERE ma_don_hang = 20;"
mysql -u root -pThu2220403 ai_sim_db -e "DELETE FROM the_sim WHERE so_sim = '0999996766';"
```

## KẾT QUẢ MONG ĐỢI:

1. ✅ Console log "PAID DETECTED"
2. ✅ Console log "STATE CHANGED" với paymentStatus = PAID
3. ✅ Console log "RENDERING SUCCESS MODAL"
4. ✅ Alert xuất hiện
5. ✅ QR Modal đóng
6. ✅ Success Modal mở
7. ✅ UI hiển thị đúng

## NẾU BẤT KỲ BƯỚC NÀO FAILED:

Copy toàn bộ console log và gửi cho dev để debug.
