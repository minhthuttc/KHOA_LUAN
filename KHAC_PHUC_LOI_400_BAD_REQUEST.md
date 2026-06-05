# KHẮC PHỤC LỖI 400 BAD REQUEST KHI MUA SIM

## 🔴 LỖI GỐC

Khi người dùng chọn phương thức thanh toán "Chuyển khoản" và mua sim, hệ thống báo lỗi:

```
Purchase error: AxiosError: Request failed with status code 400
```

**Vị trí lỗi:** `frontend/src/components/SimCard.js:424`

---

## 🔍 NGUYÊN NHÂN

### Luồng cũ (SAI):

1. User điền form (họ tên, số điện thoại, địa chỉ)
2. User chọn "Chuyển khoản" → Nhấn "Xác nhận mua"
3. Code **CHỈ HIỂN THỊ QR** mà **CHƯA TẠO ĐơN HÀNG**
4. User chuyển khoản xong → Nhấn "Đã thanh toán"
5. Code gọi `handleConfirmTransfer()` để tạo đơn hàng
6. **LỖI XẢY RA:** Vì `purchaseForm.phone` và `purchaseForm.address` đã bị **RESET/EMPTY** → Backend trả về 400 Bad Request

### Vấn đề cụ thể:

- Biến `purchaseForm` trong state bị mất dữ liệu giữa các lần render
- Khi user nhấn "Đã thanh toán", function `handleConfirmTransfer` cố gắng tạo đơn với form trống
- Backend yêu cầu `customer_phone` và `customer_address` → Thiếu → 400 error

---

## ✅ GIẢI PHÁP

### Luồng mới (ĐÚNG):

1. User điền form (họ tên, số điện thoại, địa chỉ)
2. User chọn "Chuyển khoản" → Nhấn "Xác nhận mua"
3. Code **VALIDATE FORM** trước:
   ```javascript
   if (!purchaseForm.phone || !purchaseForm.address) {
     alert("Vui lòng điền đầy đủ số điện thoại và địa chỉ!");
     return;
   }
   ```
4. Code **TẠO ĐƠN HÀNG NGAY LẬP TỨC** qua API `/api/purchase`
5. Lưu `orderId` → Bắt đầu polling kiểm tra payment status
6. Hiển thị QR code với thông tin chuyển khoản
7. User chuyển khoản → Webhook tự động cập nhật `payment_status = PAID`
8. Polling phát hiện status = PAID → Tự động đóng modal QR → Hiển thị modal thành công

### Thay đổi code:

#### 1. Cập nhật `handlePurchase` function:

**TRƯỚC:**
```javascript
if (purchaseForm.paymentMethod === 'bank_transfer') {
  // Chỉ hiển thị QR, KHÔNG TẠO ĐƠN
  const qrContent = `https://img.vietqr.io/...`;
  setQrCodeUrl(qrContent);
  setShowQRModal(true);
  return;
}
```

**SAU:**
```javascript
if (purchaseForm.paymentMethod === 'bank_transfer') {
  // VALIDATE trước
  if (!purchaseForm.phone || !purchaseForm.address) {
    alert("Vui lòng điền đầy đủ số điện thoại và địa chỉ!");
    return;
  }

  // TẠO ĐƠN HÀNG TRƯỚC
  setLoading(true);
  try {
    const response = await axios.post("http://localhost:5000/api/purchase", {
      user_id: user.id,
      user_name: user.name,
      sim_number,
      network,
      price,
      category,
      customer_name: purchaseForm.fullName,
      customer_phone: purchaseForm.phone,
      customer_address: purchaseForm.address,
      payment_method: 'bank_transfer'
    });

    // Lưu orderId và bắt đầu polling
    if (response.data.orderId) {
      setCurrentOrderId(response.data.orderId);
      setPaymentStatus('PENDING');
    }

    // SAU ĐÓ mới hiển thị QR
    const qrContent = `https://img.vietqr.io/...`;
    setQrCodeUrl(qrContent);
    setShowQRModal(true);
    setShowPurchaseModal(false);
  } catch (error) {
    console.error("Purchase error:", error);
    alert(error.response?.data?.message || "Có lỗi xảy ra!");
  } finally {
    setLoading(false);
  }
  return;
}
```

#### 2. Xóa function `handleConfirmTransfer`:

**TRƯỚC:**
```javascript
const handleConfirmTransfer = async () => {
  // Function này GỌI API tạo đơn với form đã bị reset
  // → 400 Bad Request
};
```

**SAU:**
```javascript
// Đã không cần handleConfirmTransfer nữa vì đơn hàng được tạo ngay khi hiển thị QR
```

#### 3. Cập nhật button trong QR modal:

**TRƯỚC:**
```javascript
<button
  onClick={handleConfirmTransfer}
  disabled={loading}
  className="..."
>
  {loading ? "Đang xử lý..." : "Đã thanh toán"}
</button>

<p>💡 Sau khi chuyển khoản, chúng tôi sẽ xác nhận và liên hệ với bạn trong vòng 24h</p>
```

**SAU:**
```javascript
<button
  onClick={() => setShowQRModal(false)}
  className="..."
>
  Đóng
</button>

<p>💡 Hệ thống sẽ tự động xác nhận sau khi bạn chuyển khoản thành công</p>
```

#### 4. Cập nhật hướng dẫn trong QR modal:

**TRƯỚC:**
```
5. Nhấn "Đã thanh toán" bên dưới sau khi chuyển khoản xong
```

**SAU:**
```
5. Hệ thống sẽ tự động cập nhật khi bạn chuyển khoản thành công
```

---

## 🎯 KẾT QUẢ

### Ưu điểm của giải pháp mới:

✅ **Không còn lỗi 400:** Đơn hàng được tạo ngay với đầy đủ thông tin  
✅ **Tự động hóa:** Polling tự động kiểm tra payment status mỗi 5 giây  
✅ **Trải nghiệm tốt hơn:** User không cần nhấn "Đã thanh toán", hệ thống tự nhận biết  
✅ **Chính xác hơn:** Webhook từ ngân hàng cập nhật thay vì user tự xác nhận  
✅ **Đồng bộ:** orderId được tạo ngay từ đầu, dễ dàng tracking  

### Luồng hoàn chỉnh:

```
User điền form
    ↓
User nhấn "Xác nhận mua"
    ↓
[VALIDATE] Kiểm tra phone & address
    ↓
[API] Tạo đơn hàng → Nhận orderId
    ↓
[POLLING] Bắt đầu kiểm tra payment status mỗi 5s
    ↓
[QR] Hiển thị QR code
    ↓
User chuyển khoản qua app ngân hàng
    ↓
[WEBHOOK] Ngân hàng gửi thông báo → Backend update payment_status = PAID
    ↓
[POLLING] Phát hiện status = PAID
    ↓
[UI] Tự động đóng QR modal → Hiển thị Success modal
    ↓
✅ HOÀN THÀNH
```

---

## 📋 CHECKLIST VERIFY

- [x] Đã xóa function `handleConfirmTransfer`
- [x] Đã cập nhật `handlePurchase` để tạo đơn trước khi hiển thị QR
- [x] Đã thêm validation cho `phone` và `address`
- [x] Đã thay đổi button "Đã thanh toán" → "Đóng"
- [x] Đã cập nhật hướng dẫn trong QR modal
- [x] Đã cập nhật thông báo phía dưới modal
- [x] Code không có lỗi syntax (verified bằng getDiagnostics)

---

## 🧪 CÁCH TEST

1. Đăng nhập vào hệ thống
2. Chọn một sim và nhấn "Mua Ngay"
3. Điền đầy đủ: Họ tên, Số điện thoại, Địa chỉ
4. Chọn phương thức "Chuyển khoản"
5. Nhấn "Xác nhận mua"
6. **KIỂM TRA:** 
   - Modal QR hiển thị ngay lập tức
   - Không có lỗi 400 Bad Request
   - Console log hiển thị: "✅ Đã tạo đơn hàng: [orderId]"
   - Console log hiển thị: "🔄 Đang chờ thanh toán... Polling sẽ tự động kiểm tra"
7. Mô phỏng thanh toán bằng script: `node backend/approve-order-11.js` (thay 11 bằng orderId thực tế)
8. **KIỂM TRA:**
   - Sau 5 giây, modal QR tự động đóng
   - Modal "Đặt mua thành công" hiển thị
   - Alert "✅ Thanh toán thành công!" xuất hiện

---

## 📝 GHI CHÚ

- Frontend sẽ tự động rebuild khi save file
- Không cần restart backend vì chỉ sửa frontend
- Polling sẽ tự động dừng khi:
  - Payment status = PAID
  - User đóng QR modal
  - Component unmount

**File đã sửa:** `frontend/src/components/SimCard.js`

**Ngày khắc phục:** 2026-06-05
