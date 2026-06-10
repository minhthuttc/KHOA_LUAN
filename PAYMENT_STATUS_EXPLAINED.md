# PAYMENT STATUS vs ORDER STATUS - GIẢI THÍCH ĐẦY ĐỦ

## 🔍 BUG BẠN GẶP PHẢI

**Triệu chứng**:
```
Database: transaction_id = "32cb7a18bb984944b05f46885f41c316"
Database: payment_status = "PENDING"
Database: paid_at = NULL
UI: Hiển thị "Chờ thanh toán" (màu vàng)
```

**Trạng thái**: ❌ **KHÔNG NHẤT QUÁN**

## 🎯 HAI KHÁI NIỆM RIÊNG BIỆT

### 1️⃣ PAYMENT STATUS (Trạng thái thanh toán)
**Database field**: `payment_status`  
**Values**: `PENDING` | `PAID` | `FAILED`

**Ý nghĩa**:
- `PENDING` = Chưa thanh toán (đang chờ)
- `PAID` = Đã thanh toán thành công  
- `FAILED` = Thanh toán thất bại

**Khi nào update?**:
- Ngay khi **webhook PayOS** nhận được thông báo thanh toán thành công
- Hoặc thủ công bằng script `quick-approve.js`

### 2️⃣ ORDER STATUS (Trạng thái đơn hàng)  
**Database field**: `trang_thai` / `status`  
**Values**: `Chờ duyệt` | `Đã duyệt` | `Đã hủy`

**Ý nghĩa**:
- `Chờ duyệt` = Admin chưa xác nhận đơn
- `Đã duyệt` = Admin đã xác nhận, chuẩn bị giao sim
- `Đã hủy` = Đơn bị hủy bởi admin/user

**Khi nào update?**:
- Admin click "Duyệt" trong trang quản trị
- Hoặc tự động khi webhook PayOS nhận (logic hiện tại)

---

## 📊 CÁC TRƯỜNG HỢP LOGIC

### ✅ CASE 1: Thanh toán thành công, chờ duyệt (BÌNH THƯỜNG)
```sql
payment_status = 'PAID'
trang_thai = 'Chờ duyệt'
paid_at = '2026-06-10 15:30:00'
transaction_id = '32cb7a18bb984944b05f46885f41c316'
```

**UI hiển thị**:
- Trạng thái đơn: 🟡 Chờ duyệt
- Thanh toán: 🟢 Đã thanh toán

**Giải thích**: User đã thanh toán, nhưng admin chưa duyệt đơn. Đây là trạng thái hợp lý!

### ✅ CASE 2: Thanh toán thành công, đã duyệt (HOÀN THÀNH)
```sql
payment_status = 'PAID'
trang_thai = 'Đã duyệt'
paid_at = '2026-06-10 15:30:00'
transaction_id = '32cb7a18bb984944b05f46885f41c316'
```

**UI hiển thị**:
- Trạng thái đơn: 🟢 Đã duyệt  
- Thanh toán: 🟢 Đã thanh toán

**Giải thích**: Đơn hoàn tất! User thanh toán + admin duyệt.

### ⚠️ CASE 3: Chưa thanh toán, chờ duyệt (ĐANG CHỜ)
```sql
payment_status = 'PENDING'
trang_thai = 'Chờ duyệt'
paid_at = NULL
transaction_id = '32cb7a18bb984944b05f46885f41c316'
```

**UI hiển thị**:
- Trạng thái đơn: 🟡 Chờ duyệt
- Thanh toán: 🟡 Chờ thanh toán

**Giải thích**: 
- `transaction_id` có = PayOS payment link đã tạo
- `payment_status=PENDING` = User chưa thanh toán (hoặc webhook chưa nhận)
- **Đây là case bạn đang gặp!**

### ❌ CASE 4: Không nhất quán (LỖI LOGIC)
```sql
payment_status = 'PENDING'
trang_thai = 'Đã duyệt'
```
**Giải thích**: Admin duyệt nhưng chưa thanh toán? **Không nên xảy ra!**

---

## 🔧 TẠI SAO TRANSACTION_ID TỒN TẠI NHƯNG VẪN PENDING?

### Luồng PayOS bình thường:

```
1. User bấm "Mua Ngay"
   ↓
2. Backend tạo đơn hàng (payment_status=PENDING)
   ↓
3. Backend gọi PayOS API → Nhận payment link
   ↓
4. Backend LƯU transaction_id (paymentLinkId)
   ⚠️  LÚC NÀY: payment_status vẫn = PENDING
   ↓
5. Frontend hiển thị QR code
   ↓
6. User quét QR và thanh toán
   ↓
7. PayOS GỬI WEBHOOK về backend
   ↓
8. Backend nhận webhook → CẬP NHẬT:
   - payment_status = 'PAID' ✅
   - paid_at = NOW() ✅
   - trang_thai = 'Đã duyệt' ✅
   ↓
9. Frontend polling detect → Success modal
```

### ⚠️ VẤN ĐỀ KHI TEST LOCAL:

**Bước 7 BỊ BLOCK** vì:
- PayOS webhook không thể gọi về `localhost:5000`
- Cần URL công khai (public IP + HTTPS)

**Kết quả**:
- ✅ Bước 1-6 chạy OK
- ❌ Bước 7 không xảy ra (webhook không về)
- ❌ Bước 8 không được thực thi
- ❌ `payment_status` mãi mãi = PENDING

---

## ✅ GIẢI PHÁP

### 🔷 Cách 1: Giả lập webhook (TEST LOCAL)

```bash
cd backend
node test-webhook.js 29
```

**Kết quả**:
```
🔔 Webhook received
💰 Payment successful
🔄 Updating:
   - payment_status = 'PAID' ✅
   - paid_at = NOW() ✅
   - trang_thai = 'Đã duyệt' ✅
   - sim → 'Đã bán' ✅
```

### 🔷 Cách 2: Approve thủ công (QUICK)

```bash
cd backend
node quick-approve.js 29
```

Tương tự Cách 1 nhưng bỏ qua webhook flow.

### 🔷 Cách 3: Ngrok (PRODUCTION-LIKE)

Setup ngrok để PayOS có thể gọi webhook thật về localhost. Xem `TEST_LOCAL_PAYOS.md`.

---

## 📋 KIỂM TRA TRẠNG THÁI

### Check database:
```bash
cd backend
node check-order-status.js
```

**Output mẫu**:
```
📊 Recent Orders:
┌────────┬──────────────┬────────────────┬──────────────┐
│ id     │ payment_status│ order_status  │ transaction_id│
├────────┼──────────────┼────────────────┼──────────────┤
│ 29     │ PENDING      │ Chờ duyệt     │ 32cb7a18...  │ ← ⚠️ Chưa thanh toán
│ 28     │ PENDING      │ Chờ duyệt     │ c9d09124...  │ ← ⚠️ Chưa thanh toán
│ 20     │ PAID         │ Đã hủy        │ MANUAL_...   │ ← ✅ Đã thanh toán
└────────┴──────────────┴────────────────┴──────────────┘

⚠️  FOUND PROBLEMATIC ORDERS:
Orders with transaction_id BUT payment_status=PENDING:
   node quick-approve.js 29
   node quick-approve.js 28
```

---

## 🎨 UI HIỂN THỊ

Frontend đã implement đúng - hiển thị **CẢ HAI** badge:

```jsx
{/* Order Status Badge */}
<span className={...}>
  {purchase.status || 'Chờ duyệt'}
</span>

{/* Payment Status Badge */}
<span className={...}>
  {purchase.payment_status === 'PAID' 
    ? '✓ Đã thanh toán' 
    : '⏳ Chờ thanh toán'}
</span>
```

**Kết quả trong UI**:

Đơn hàng #29  
🟡 Chờ duyệt  
🟡 Chờ thanh toán ← Đúng, vì webhook chưa nhận

---

## 🚀 WORKFLOW ĐÚNG

### Development (Local):
```
1. Tạo đơn hàng → transaction_id được lưu
2. User thanh toán (hoặc bỏ qua)
3. Dev chạy: node test-webhook.js 29
4. payment_status → PAID
5. Frontend detect → Success modal
```

### Production:
```
1. Tạo đơn hàng → transaction_id được lưu
2. User thanh toán qua PayOS
3. PayOS TỰ ĐỘNG gọi webhook
4. payment_status → PAID (tự động)
5. Frontend detect → Success modal (tự động)
```

---

## 🎓 TÓM TẮT

✅ **Frontend đúng**: Hiển thị cả order status và payment status  
✅ **Backend đúng**: Webhook update đầy đủ tất cả fields  
✅ **Logic đúng**: transaction_id được lưu khi tạo payment link  

❌ **Vấn đề duy nhất**: Webhook không về khi test local

**Giải pháp**:
- Local: Dùng `test-webhook.js` hoặc `quick-approve.js`
- Production: Cấu hình webhook URL công khai trong PayOS dashboard

**Files để chạy**:
```bash
# Kiểm tra orders có vấn đề
node check-order-status.js

# Fix thủ công
node quick-approve.js 29
node test-webhook.js 29
```
