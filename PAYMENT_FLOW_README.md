# 💳 LUỒNG THANH TOÁN PAYOS - HƯỚNG DẪN ĐẦY ĐỦ

## 📚 TÀI LIỆU QUAN TRỌNG (ĐỌC THEO THỨ TỰ)

### 🔴 CRITICAL - ĐỌC TRƯỚC KHI TEST:
1. ⭐⭐⭐ **`CHECKLIST_PAYMENT_UPDATE.md`** - Checklist đảm bảo cập nhật khi thanh toán thành công
2. ⭐⭐⭐ **`TEST_LOCAL_PAYOS.md`** - Hướng dẫn test 3 cách (giả lập webhook, approve thủ công, ngrok)
3. ⭐⭐ **`PAYMENT_STATUS_EXPLAINED.md`** - Giải thích payment_status vs order_status

### 🟡 TÀI LIỆU THAM KHẢO:
4. **`QR_CODE_FIX.md`** - Fix lỗi QR code không hiển thị
5. **`PAYOS_MIGRATION.md`** - Migration từ VietQR sang PayOS
6. **`TEST_PAYOS.md`** - Test cơ bản PayOS
7. **`HUONG_DAN_APPROVE_PAYOS.md`** - Approve đơn hàng thủ công

---

## 🚀 QUICK START - 4 BƯỚC

### Bước 1: Kiểm tra đơn hàng cần fix
```bash
cd backend
node check-order-status.js
```

**Output mẫu**:
```
⚠️  FOUND PROBLEMATIC ORDERS:
Orders with transaction_id BUT payment_status=PENDING:
   node quick-approve.js 29
   node quick-approve.js 28
```

### Bước 2: Approve đơn hàng (chọn 1 trong 2)

**Cách A: Giả lập webhook** ⭐ (khuyến nghị - test full flow)
```bash
node test-webhook.js 29
```

**Cách B: Approve nhanh**
```bash
node quick-approve.js 29
```

### Bước 3: Verify toàn bộ flow
```bash
node test-full-flow.js 29
```

**Expected**:
```
🎉🎉🎉 ALL TESTS PASSED!
✅ Database payment_status = PAID
✅ API returns paymentStatus: PAID
```

### Bước 4: Check frontend
Mở browser console, trong vòng **3 giây** sẽ thấy:
```
=== POLLING TICK ===
📊 PAYMENT STATUS: PAID
🎉🎉🎉 PAID DETECTED!!!
2️⃣ CLOSING QR MODAL
3️⃣ OPENING SUCCESS MODAL
✅ Thanh toán thành công!
```

---

## 📊 LUỒNG HOẠT ĐỘNG

### Development (Local - Webhook không về):
```
1. User: Mua sim 
   → Backend tạo đơn hàng (payment_status=PENDING)
   → Backend tạo PayOS link (lưu transaction_id)
   → Frontend hiển thị QR code

2. User: Quét QR PayOS → Thanh toán trên app ngân hàng
   ⚠️  PayOS webhook KHÔNG về localhost

3. Dev: node test-webhook.js 29
   → Giả lập webhook call
   → Backend update: payment_status=PAID, paid_at=NOW(), sim="Đã bán"

4. Frontend: Polling detect PAID (trong 3s)
   → Đóng QR modal
   → Mở Success modal
   → Alert "Thanh toán thành công"
   → Redirect trang chủ
```

### Production (Webhook tự động):
```
1. User: Mua sim 
   → Backend tạo đơn (payment_status=PENDING)
   → Backend tạo PayOS link (lưu transaction_id)
   → Frontend hiển thị QR

2. User: Quét QR → Thanh toán

3. PayOS: Gửi webhook TỰ ĐỘNG → Backend
   → Backend update: payment_status=PAID, paid_at=NOW(), sim="Đã bán"

4. Frontend: Polling detect PAID (trong 3s) TỰ ĐỘNG
   → Success modal TỰ ĐỘNG
```

---

## 🛠️ SCRIPTS AVAILABLE

| Script | Mục đích | Khi nào dùng | Usage |
|--------|----------|--------------|-------|
| `check-order-status.js` | Kiểm tra orders có vấn đề | Trước khi test | `node check-order-status.js` |
| `test-webhook.js` | Giả lập PayOS webhook | Test full flow | `node test-webhook.js 29` |
| `quick-approve.js` | Approve thủ công | Fix nhanh | `node quick-approve.js 29` |
| `test-full-flow.js` | Verify toàn bộ flow | Sau khi approve | `node test-full-flow.js 29` |
| `test-payos-qr.js` | Test PayOS API | Debug PayOS | `node test-payos-qr.js` |

**Ví dụ workflow**:
```bash
# 1. Check xem order nào cần fix
node check-order-status.js

# 2. Approve order 29
node test-webhook.js 29

# 3. Verify đã PAID chưa
node test-full-flow.js 29

# 4. Mở browser → Xem console log frontend
```

---

## 🔧 SETUP PRODUCTION WEBHOOK

### Tại sao cần?
- Local test: PayOS không thể gọi `localhost:5000`
- Production: Cần URL công khai + HTTPS

### Setup với ngrok:

**1. Install ngrok**
```bash
# Windows
choco install ngrok

# Mac  
brew install ngrok

# Linux
snap install ngrok
```

**2. Run ngrok**
```bash
ngrok http 5000
```

**Output**:
```
Forwarding: https://abc123xyz.ngrok.io -> http://localhost:5000
```

**3. Copy ngrok URL**
```
https://abc123xyz.ngrok.io
```

**4. Configure PayOS Dashboard**
1. Login: https://my.payos.vn
2. Settings → Webhook
3. Webhook URL: `https://abc123xyz.ngrok.io/api/payos/webhook`
4. Save

**5. Test thật**
- Tạo đơn mới
- Thanh toán qua PayOS
- Webhook TỰ ĐỘNG về
- Frontend TỰ ĐỘNG cập nhật

---

## ⚠️ TROUBLESHOOTING

### 🔴 Lỗi 1: QR code không hiển thị

**Triệu chứng**: Modal mở nhưng QR không thấy

**Nguyên nhân**: PayOS trả về QR data string (không phải URL ảnh)

**Đã fix**: Dùng `qrcode` library convert string → image

**Chi tiết**: Xem `QR_CODE_FIX.md`

---

### 🔴 Lỗi 2: Thanh toán rồi nhưng vẫn PENDING

**Triệu chứng**:
```sql
transaction_id = "32cb7a18..." -- PayOS link đã tạo
payment_status = "PENDING"    -- Vẫn chờ thanh toán  
```

**Nguyên nhân**: Webhook không về localhost

**Fix ngay**:
```bash
node test-webhook.js 29  # Giả lập webhook
# hoặc
node quick-approve.js 29 # Approve thủ công
```

**Chi tiết**: Xem `TEST_LOCAL_PAYOS.md`

---

### 🔴 Lỗi 3: Frontend không detect PAID

**Debug checklist**:

**1. Check polling có chạy không?**
```
Browser console → Tìm:
"✅ POLLING CONDITIONS MET - STARTING POLLING"
```

Nếu KHÔNG có → Check:
- `currentOrderId` có giá trị?
- `paymentStatus` = 'PENDING'?
- `showQRModal` = true?

**2. Check API response**
```
Browser → Network tab → Filter: "payment-status"
→ Click vào request → Response tab
→ Xem: { "data": { "paymentStatus": "PAID" } }
```

Nếu vẫn "PENDING" → Webhook chưa chạy

**3. Check database**
```bash
node check-order-status.js
```

Hoặc query:
```sql
SELECT ma_don_hang, payment_status, paid_at 
FROM don_hang 
WHERE ma_don_hang = 29;
```

**4. Force approve**
```bash
node test-webhook.js 29
```

Sau đó đợi 3 giây, check browser console

**Chi tiết**: Xem `CHECKLIST_PAYMENT_UPDATE.md`

---

## 📈 PAYMENT_STATUS vs ORDER_STATUS

### 2 khái niệm RIÊNG BIỆT:

| Field | Database Column | Values | Ý nghĩa |
|-------|----------------|---------|---------|
| Payment Status | `payment_status` | PENDING, PAID, FAILED | Trạng thái thanh toán |
| Order Status | `trang_thai` | Chờ duyệt, Đã duyệt, Đã hủy | Trạng thái đơn hàng (admin) |

### Trường hợp hợp lý:

**✅ Case 1: Thanh toán rồi, chờ admin duyệt**
```sql
payment_status = 'PAID'
trang_thai = 'Chờ duyệt'
```
**UI**: 🟢 Đã thanh toán | 🟡 Chờ duyệt

**✅ Case 2: Hoàn tất**
```sql
payment_status = 'PAID'
trang_thai = 'Đã duyệt'
```
**UI**: 🟢 Đã thanh toán | 🟢 Đã duyệt

**⚠️ Case 3: Đang chờ thanh toán**
```sql
payment_status = 'PENDING'
trang_thai = 'Chờ duyệt'
transaction_id = '32cb7a18...' -- PayOS link đã tạo
```
**UI**: 🟡 Chờ thanh toán | 🟡 Chờ duyệt

**Giải thích**: User chưa thanh toán (hoặc webhook chưa về)

**Chi tiết**: Xem `PAYMENT_STATUS_EXPLAINED.md`

---

## ✅ VERIFICATION - TEST ĐẦY ĐỦ

### Test 1 lệnh:
```bash
cd backend

# Check orders
node check-order-status.js

# Approve order 29
node test-webhook.js 29

# Verify
node test-full-flow.js 29
```

### Expected output:
```
🎉🎉🎉 ALL TESTS PASSED!

✅ Verification Results:
   ✅ Database payment_status = PAID
   ✅ Database paid_at is set
   ✅ Database trang_thai = "Đã duyệt"
   ✅ API returns success: true
   ✅ API returns paymentStatus: PAID
   ✅ API returns paidAt (not null)

💡 Frontend polling should now:
   1. Detect paymentStatus = "PAID"
   2. Close QR modal
   3. Open Success modal
   4. Show alert "Thanh toán thành công"
   5. Redirect after 3 seconds
```

---

## 🎯 TÓM TẮT

### ✅ Code đúng rồi:
- Backend webhook update đầy đủ fields
- Frontend polling detect PAID
- UI hiển thị đúng 2 status

### ⚠️ Vấn đề duy nhất:
- Webhook không về khi test local

### 🔧 Giải pháp:
- **Local**: Dùng `test-webhook.js` hoặc `quick-approve.js`
- **Production**: Setup ngrok hoặc deploy với URL công khai

### 📂 Files quan trọng:
- `backend/index.js` - Webhook route (line ~1193), API (line ~1030)
- `frontend/src/components/SimCard.js` - Polling (line ~50)
- `backend/test-webhook.js` - Test script
- `CHECKLIST_PAYMENT_UPDATE.md` - Checklist đầy đủ

### 🚀 Bắt đầu ngay:
```bash
cd backend
node check-order-status.js
node test-webhook.js 29
# Mở browser → Đợi 3s → Xem Success modal
```
