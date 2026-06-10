-- Cập nhật thông tin cho tài khoản Nguyễn Võ Minh Thư
-- Thêm số điện thoại và địa chỉ mặc định

UPDATE nguoi_dung 
SET 
  so_dien_thoai = '0382286177',
  dia_chi = '282 Nguyễn Thị Minh Khai, Phường 7, Trà Vinh'
WHERE ten_dang_nhap = 'Nguyễn Võ Minh Thư';

-- Kiểm tra kết quả
SELECT 
  ma_nguoi_dung,
  ten_dang_nhap,
  so_dien_thoai,
  dia_chi,
  ngay_sinh
FROM nguoi_dung 
WHERE ten_dang_nhap = 'Nguyễn Võ Minh Thư';
