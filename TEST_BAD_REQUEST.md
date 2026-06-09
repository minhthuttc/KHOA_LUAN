# TEST LỖI 400 BAD REQUEST - /api/purchase

## ĐÃ THÊM LOG:

### Backend (backend/index.js):
- ✅ Log request body
- ✅ Log từng field được extract
- ✅ Validation chi tiết từng field
- ✅ Log missing fields nếu có
- ✅ Log database operations
- ✅ Log response trả về

### Frontend (SimCard.js):
- ✅ Log purchase data trước khi gửi
- ✅ Log error response chi tiết
- ✅ Alert hiển thị lỗi đầy đủ

## CÁCH TEST:

### 1. RESTART BACKEND (BẮT BUỘC)

```bash
# Stop backend hiện tại (Ctrl+C)
# Start lại để load code mới
cd backend
node index.js
```

### 2. RESTART FRONTEND (nếu cần)

```bash
# Frontend có thể tự reload, nhưng nếu không thì:
cd frontend
npm run dev
```

### 3. MỞ BROWSER + CONSOLE

1. Mở: http://localhost:3000
2. F12 → Console tab
3. Đăng nhập: Admin / 123

### 4. MUA SIM VỚI CHUYỂN KHOẢN

1. Chọn sim bất kỳ
2. Click "Mua Ngay"
3. Điền form:
   - Số điện thoại: **0123456789**
   - Địa chỉ: **123 Test Street**
   - Phương thức: **Chuyển khoản**
4. Click "Xác nhận mua"

### 5. XEM LOGS

**FRONTEND Console sẽ hiện:**

```
📋 PURCHASE REQUEST DATA:
{
  "user_id": 1,
  "user_name": "Admin",
  "sim_number": "0912345678",
  "network": "Viettel",
  "price": 1500000,
  "category": "Sim đẹp",
  "customer_name": "Admin",
  "customer_phone": "0123456789",
  "customer_address": "123 Test Street",
  "payment_method": "bank_transfer"
}

🌐 Calling API: POST http://localhost:5000/api/purchase
```

**BACKEND Terminal sẽ hiện:**

```
🔵 === POST /api/purchase RECEIVED ===
📥 Request Body: {
  "user_id": 1,
  "user_name": "Admin",
  ...
}

📋 Extracted fields:
  - user_id: 1
  - user_name: Admin
  ...
```

## NẾU LỖI 400:

Backend sẽ log:

```
❌ VALIDATION FAILED - Missing required fields:
  - customer_name is missing
  (hoặc field nào đó khác)
```

Frontend sẽ hiện alert:

```
❌ LỖI MUA SIM:

Thiếu thông tin bắt buộc

Chi tiết: {
  "success": false,
  "message": "Thiếu thông tin bắt buộc",
  "missing": {
    "customer_name": true,
    ...
  }
}
```

## NẾU THÀNH CÔNG:

Backend log:

```
✅ Validation passed
🔍 Checking if sim is available...
✅ Sim is available
💾 Creating order in database...
✅ Order created with ID: 21
🔄 Updating sim status to "Đã bán"...
✅ Sim status updated
📤 Sending response: {
  "success": true,
  "orderId": 21,
  ...
}
```

Frontend console:

```
📥 API Response: { success: true, orderId: 21, ... }
✅ ORDER CREATED
🆔 ORDER ID: 21
```

QR Modal sẽ mở!

## NẾU VẪN LỖI SAU KHI RESTART:

Copy toàn bộ:
1. Frontend console log
2. Backend terminal log
3. Alert message

Gửi cho dev để debug.
