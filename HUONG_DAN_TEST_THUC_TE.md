# HƯỚNG DẪN TEST THỰC TẾ LUỒNG THANH TOÁN

## ĐÃ XÁC NHẬN HOẠT ĐỘNG:

✅ **Backend:**
- API `/api/purchase` tạo đơn hàng với `payment_status = PENDING` ✓
- Database lưu đơn hàng đúng ✓
- API `/api/order/payment-status/:orderId` trả đúng `paymentStatus` ✓
- Script `quick-approve.js` update `payment_status = PAID` thành công ✓

## CHUẨN BỊ TEST:

1. **Khởi động backend:**
   ```
   cd backend
   node index.js
   ```

2. **Khởi động frontend:**
   ```
   cd frontend
   npm run dev
   ```

## TEST LUỒNG THỰC TẾ:

### BƯỚC 1: MUA SIM VỚI CHUYỂN KHOẢN

1. Mở browser: http://localhost:3000
2. Đăng nhập (nếu chưa): username = `Admin`, password = `123`
3. Chọn 1 sim bất kỳ trên trang chủ
4. Click "Mua Ngay"
5. Điền form:
   - Số điện thoại: 0123456789
   - Địa chỉ: 123 Test St
   - Phương thức: **Chuyển khoản**
6. Click "Xác nhận mua"
7. **QR Modal sẽ hiện** ← Tại đây POLLING bắt đầu chạy

### BƯỚC 2: MỞ DEVELOPER CONSOLE

**QUAN TRỌNG:** Mở DevTools (F12) và xem tab Console

Bạn sẽ thấy logs:
```
=== POLLING USEEFFECT TRIGGERED ===
currentOrderId: 21
paymentStatus: PENDING
showQRModal: true
✅ POLLING CONDITIONS MET - STARTING POLLING
🔄 POLLING STARTED FOR ORDER: 21
⏰ Tự động kiểm tra mỗi 3 giây...
```

Sau 3 giây, sẽ có log:
```
=== POLLING TICK ===
⏰ CHECK PAYMENT STATUS AT: 8:35:12 AM
📋 ORDER ID: 21
🌐 Calling API: http://localhost:5000/api/order/payment-status/21
📥 API RESPONSE RECEIVED:
response.data: { success: true, data: { ... paymentStatus: "PENDING" } }
📊 PAYMENT STATUS: PENDING
⏳ Status is still: PENDING - Continue polling...
```

### BƯỚC 3: MANUAL APPROVE (Giả lập webhook)

Mở terminal mới, chạy:
```
cd backend
node quick-approve.js [ORDER_ID] TESTMANUAL
```

Thay `[ORDER_ID]` bằng số Order ID bạn thấy trong console log (ví dụ: 21)

### BƯỚC 4: XEM KẾT QUẢ

**NẾU THÀNH CÔNG:**

Console sẽ log:
```
=== POLLING TICK ===
📊 PAYMENT STATUS: PAID
🎉🎉🎉 PAID DETECTED!!! 🎉🎉🎉
1️⃣ setPaymentStatus("PAID")
2️⃣ CLOSING PAYMENT MODAL - setShowQRModal(false)
3️⃣ OPEN SUCCESS MODAL - setShowSuccessModal(true)
4️⃣ clearInterval(pollingInterval)
5️⃣ Hiển thị alert...
✅ ALL ACTIONS COMPLETED
```

- QR Modal sẽ tự ĐÓNG
- Success Modal sẽ tự MỞ
- Alert "Thanh toán thành công" sẽ hiện

**NẾU THẤT BẠI:**

- QR Modal vẫn mở
- Không có log `PAID DETECTED`
- Polling vẫn tiếp tục mỗi 3 giây

## VẤN ĐỀ CÓ THỂ GẶP:

### 1. Polling không chạy
**Nguyên nhân:** Dependencies trong useEffect sai
**Kiểm tra:** Console có log "POLLING CONDITIONS NOT MET"

### 2. API trả sai
**Nguyên nhân:** Backend route sai hoặc database chưa update
**Kiểm tra:** Xem response.data trong console

### 3. State không update
**Nguyên nhân:** React không re-render hoặc setState bị batching
**Kiểm tra:** Log ở useEffect đầu tiên không thay đổi

### 4. Modal không đóng/mở
**Nguyên nhân:** Condition render modal sai
**Kiểm tra:** React DevTools xem state `showQRModal`, `showSuccessModal`

## DEBUG COMMANDS:

```bash
# Kiểm tra đơn hàng trong DB
mysql -u root -pThu2220403 ai_sim_db -e "SELECT ma_don_hang, so_sim, payment_status, paid_at FROM don_hang ORDER BY ngay_mua DESC LIMIT 5;"

# Test API payment-status
curl http://localhost:5000/api/order/payment-status/21

# Manual approve
node backend/quick-approve.js 21 MANUAL123
```

## KẾT QUẢ MONG ĐỢI:

✅ Tạo đơn hàng → `payment_status = PENDING`
✅ QR Modal mở → Polling bắt đầu
✅ Chạy quick-approve → Database update `PAID`
✅ Polling phát hiện PAID trong ~3 giây
✅ QR Modal tự động đóng
✅ Success Modal tự động mở
✅ Alert "Thanh toán thành công"
✅ Trang tự reload hoặc chuyển về home
✅ Đơn hàng hiển thị "Đã thanh toán" trong /tai-khoan
