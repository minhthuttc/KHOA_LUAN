# QR CODE DISPLAY FIX

## Problem
Mã QR không hiển thị khi thanh toán PayOS. Console log báo: "PayOS QR Image load error"

## Root Cause
PayOS API không trả về URL ảnh QR. Thay vào đó, nó trả về **chuỗi dữ liệu QR thô** (EMVCo format):

```
"00020101021238570010A000000727012700069704220113VQRQAJPOJ41560208QRIBFTTA530370454061000005802VN62140810Test order6304175D"
```

Đây là dữ liệu QR ở dạng text, cần được **chuyển đổi thành ảnh** trước khi hiển thị.

## Solution
Sử dụng thư viện `qrcode` (đã có sẵn trong project) để tạo ảnh QR từ chuỗi dữ liệu:

### Before (Sai):
```javascript
// Cố gắng hiển thị string như image URL ❌
setQrCodeUrl(paymentResponse.data.qrCode);
// qrCode = "00020101021238570010A000000727..." 
// <img src="00020101021238570010A000000727..." /> ❌ Fail!
```

### After (Đúng):
```javascript
// Tạo ảnh QR từ string data ✅
const qrImageUrl = await QRCode.toDataURL(paymentResponse.data.qrCode, {
  width: 400,
  margin: 2
});
setQrCodeUrl(qrImageUrl);
// qrImageUrl = "data:image/png;base64,iVBORw0KGgo..." 
// <img src="data:image/png;base64,..." /> ✅ Works!
```

## Changes Made

### frontend/src/components/SimCard.js

1. **Added new state variable**:
```javascript
const [qrCodeData, setQrCodeData] = useState(""); // Store raw PayOS string
```

2. **Generate QR image in handlePurchase**:
```javascript
const qrDataString = paymentResponse.data.qrCode;
const qrImageUrl = await QRCode.toDataURL(qrDataString, {
  width: 400,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
});
setQrCodeUrl(qrImageUrl);
```

3. **Always show checkout URL button**:
- Hiển thị button "Mở trang thanh toán PayOS" 
- Dùng làm phương án dự phòng nếu QR không load
- User có thể click vào link thay vì quét QR

## How It Works Now

1. **User clicks "Mua Ngay"** → Tạo đơn hàng
2. **Call PayOS API** → Nhận về `qrCode` (string) và `checkoutUrl` (link)
3. **Generate QR Image** → Dùng `QRCode.toDataURL()` để tạo ảnh PNG từ string
4. **Display QR Modal** → Hiển thị ảnh QR + button link PayOS
5. **User quét QR** HOẶC **click button** → Thanh toán
6. **Webhook confirms** → Cập nhật PAID → Success modal

## Testing

Run this test to verify PayOS response format:
```bash
cd backend
node test-payos-qr.js
```

Expected output:
```
✅ PayOS Response:
{
  "checkoutUrl": "https://pay.payos.vn/web/...",
  "qrCode": "00020101021238570010A00000072701270006970422...",
  "paymentLinkId": "..."
}

📊 Field Analysis:
qrCode:
  - Type: string
  - Is image URL?: false
  - Is data string?: true ✅
```

## Result

✅ QR code now displays correctly  
✅ Checkout URL button always available as fallback  
✅ Better error handling  
✅ Logs show QR generation success/failure  

## Files Changed
- `frontend/src/components/SimCard.js`
- `TEST_PAYOS.md` (updated)
- `PAYOS_MIGRATION.md` (updated)
- `backend/test-payos-qr.js` (created for testing)
