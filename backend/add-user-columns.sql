-- Thêm cột số điện thoại và địa chỉ vào bảng nguoi_dung

-- Kiểm tra xem các cột đã tồn tại chưa
-- Nếu chưa có, thêm vào

-- Thêm cột số điện thoại
ALTER TABLE nguoi_dung 
ADD COLUMN IF NOT EXISTS so_dien_thoai VARCHAR(15) DEFAULT NULL AFTER ngay_sinh;

-- Thêm cột địa chỉ
ALTER TABLE nguoi_dung 
ADD COLUMN IF NOT EXISTS dia_chi TEXT DEFAULT NULL AFTER so_dien_thoai;

-- Kiểm tra cấu trúc bảng
DESCRIBE nguoi_dung;

-- Cập nhật thông tin cho Nguyễn Võ Minh Thư
UPDATE nguoi_dung 
SET 
  so_dien_thoai = '0868535745',
  dia_chi = '402 Nguyễn Văn Cừ, Phường An Bình, Ninh Kiều, Cần Thơ'
WHERE ten_dang_nhap = 'Nguyễn Võ Minh Thư';

-- Xem kết quả
SELECT 
  ma_nguoi_dung,
  ten_dang_nhap,
  so_dien_thoai,
  dia_chi,
  ngay_sinh
FROM nguoi_dung 
WHERE ten_dang_nhap = 'Nguyễn Võ Minh Thư';
