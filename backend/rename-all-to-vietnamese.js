const mysql = require('mysql2/promise');

async function renameAllToVietnamese() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('🔄 BẮT ĐẦU ĐỔI TÊN TẤT CẢ BẢNG VÀ CỘT SANG TIẾNG VIỆT\n');
    console.log('⚠️  LƯU Ý: Sau khi chạy xong, bạn PHẢI cập nhật lại toàn bộ code backend!\n');

    // ========================================
    // BƯỚC 1: ĐỔI TÊN CÁC BẢNG
    // ========================================
    console.log('📋 BƯỚC 1: Đổi tên các bảng...\n');

    const tableRenames = [
      { old: 'users', new: 'nguoi_dung' },
      { old: 'sim_cards', new: 'the_sim' },
      { old: 'purchases', new: 'don_hang' },
      { old: 'fengshui_history', new: 'lich_su_phong_thuy' },
      { old: 'recommendation_history', new: 'lich_su_phan_tich' },
      { old: 'messages', new: 'tin_nhan' }
    ];

    for (const { old, new: newName } of tableRenames) {
      try {
        await connection.query(`RENAME TABLE \`${old}\` TO \`${newName}\``);
        console.log(`   ✅ ${old} → ${newName}`);
      } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
          console.log(`   ⚠️  Bảng ${old} không tồn tại`);
        } else if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`   ⚠️  Bảng ${newName} đã tồn tại`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Hoàn thành đổi tên bảng!\n');

    // ========================================
    // BƯỚC 2: ĐỔI TÊN CỘT BẢNG NGUOI_DUNG
    // ========================================
    console.log('📋 BƯỚC 2: Đổi tên cột bảng nguoi_dung...\n');

    await connection.query(`ALTER TABLE nguoi_dung CHANGE COLUMN id ma_nguoi_dung INT AUTO_INCREMENT`);
    console.log('   ✅ id → ma_nguoi_dung');

    await connection.query(`ALTER TABLE nguoi_dung CHANGE COLUMN name ten_dang_nhap VARCHAR(255) NOT NULL`);
    console.log('   ✅ name → ten_dang_nhap');

    await connection.query(`ALTER TABLE nguoi_dung CHANGE COLUMN password mat_khau VARCHAR(255) NOT NULL`);
    console.log('   ✅ password → mat_khau');

    await connection.query(`ALTER TABLE nguoi_dung CHANGE COLUMN role vai_tro ENUM('admin', 'customer') DEFAULT 'customer'`);
    console.log('   ✅ role → vai_tro');

    await connection.query(`ALTER TABLE nguoi_dung CHANGE COLUMN created_at ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    console.log('   ✅ created_at → ngay_tao');

    // ========================================
    // BƯỚC 3: ĐỔI TÊN CỘT BẢNG THE_SIM
    // ========================================
    console.log('\n📋 BƯỚC 3: Đổi tên cột bảng the_sim...\n');

    await connection.query(`ALTER TABLE the_sim CHANGE COLUMN id ma_sim INT AUTO_INCREMENT`);
    console.log('   ✅ id → ma_sim');

    await connection.query(`ALTER TABLE the_sim CHANGE COLUMN sim_number so_sim VARCHAR(20) NOT NULL UNIQUE`);
    console.log('   ✅ sim_number → so_sim');

    await connection.query(`ALTER TABLE the_sim CHANGE COLUMN network nha_mang VARCHAR(50) NOT NULL`);
    console.log('   ✅ network → nha_mang');

    await connection.query(`ALTER TABLE the_sim CHANGE COLUMN price gia_ban DECIMAL(10,2) NOT NULL`);
    console.log('   ✅ price → gia_ban');

    await connection.query(`ALTER TABLE the_sim CHANGE COLUMN category loai_sim VARCHAR(100)`);
    console.log('   ✅ category → loai_sim');

    await connection.query(`ALTER TABLE the_sim CHANGE COLUMN feng_shui_element menh_phong_thuy VARCHAR(50)`);
    console.log('   ✅ feng_shui_element → menh_phong_thuy');

    await connection.query(`ALTER TABLE the_sim CHANGE COLUMN total_nodes diem_nut INT DEFAULT 5`);
    console.log('   ✅ total_nodes → diem_nut');

    await connection.query(`ALTER TABLE the_sim CHANGE COLUMN status trang_thai VARCHAR(50) DEFAULT 'Còn hàng'`);
    console.log('   ✅ status → trang_thai');

    await connection.query(`ALTER TABLE the_sim CHANGE COLUMN description mo_ta TEXT`);
    console.log('   ✅ description → mo_ta');

    // ========================================
    // BƯỚC 4: ĐỔI TÊN CỘT BẢNG DON_HANG
    // ========================================
    console.log('\n📋 BƯỚC 4: Đổi tên cột bảng don_hang...\n');

    await connection.query(`ALTER TABLE don_hang CHANGE COLUMN id ma_don_hang INT AUTO_INCREMENT`);
    console.log('   ✅ id → ma_don_hang');

    await connection.query(`ALTER TABLE don_hang CHANGE COLUMN user_id ma_nguoi_dung INT`);
    console.log('   ✅ user_id → ma_nguoi_dung');

    await connection.query(`ALTER TABLE don_hang CHANGE COLUMN user_name ten_nguoi_dung VARCHAR(255)`);
    console.log('   ✅ user_name → ten_nguoi_dung');

    await connection.query(`ALTER TABLE don_hang CHANGE COLUMN sim_number so_sim VARCHAR(20) NOT NULL`);
    console.log('   ✅ sim_number → so_sim');

    await connection.query(`ALTER TABLE don_hang CHANGE COLUMN network nha_mang VARCHAR(50)`);
    console.log('   ✅ network → nha_mang');

    await connection.query(`ALTER TABLE don_hang CHANGE COLUMN price gia_mua DECIMAL(10,2)`);
    console.log('   ✅ price → gia_mua');

    await connection.query(`ALTER TABLE don_hang CHANGE COLUMN category loai_sim VARCHAR(100)`);
    console.log('   ✅ category → loai_sim');

    await connection.query(`ALTER TABLE don_hang CHANGE COLUMN customer_name ten_khach_hang VARCHAR(255)`);
    console.log('   ✅ customer_name → ten_khach_hang');

    await connection.query(`ALTER TABLE don_hang CHANGE COLUMN customer_phone sdt_khach_hang VARCHAR(20)`);
    console.log('   ✅ customer_phone → sdt_khach_hang');

    await connection.query(`ALTER TABLE don_hang CHANGE COLUMN customer_address dia_chi_khach_hang TEXT`);
    console.log('   ✅ customer_address → dia_chi_khach_hang');

    await connection.query(`ALTER TABLE don_hang CHANGE COLUMN payment_method phuong_thuc_thanh_toan VARCHAR(50)`);
    console.log('   ✅ payment_method → phuong_thuc_thanh_toan');

    await connection.query(`ALTER TABLE don_hang CHANGE COLUMN purchase_date ngay_mua TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    console.log('   ✅ purchase_date → ngay_mua');

    await connection.query(`ALTER TABLE don_hang CHANGE COLUMN status trang_thai VARCHAR(50) DEFAULT 'Chờ duyệt'`);
    console.log('   ✅ status → trang_thai');

    await connection.query(`ALTER TABLE don_hang CHANGE COLUMN approval_date ngay_duyet TIMESTAMP NULL`);
    console.log('   ✅ approval_date → ngay_duyet');

    // ========================================
    // BƯỚC 5: ĐỔI TÊN CỘT BẢNG LICH_SU_PHONG_THUY
    // ========================================
    console.log('\n📋 BƯỚC 5: Đổi tên cột bảng lich_su_phong_thuy...\n');

    await connection.query(`ALTER TABLE lich_su_phong_thuy CHANGE COLUMN id ma_lich_su INT AUTO_INCREMENT`);
    console.log('   ✅ id → ma_lich_su');

    await connection.query(`ALTER TABLE lich_su_phong_thuy CHANGE COLUMN user_id ma_nguoi_dung INT`);
    console.log('   ✅ user_id → ma_nguoi_dung');

    await connection.query(`ALTER TABLE lich_su_phong_thuy CHANGE COLUMN user_name ten_nguoi_dung VARCHAR(255)`);
    console.log('   ✅ user_name → ten_nguoi_dung');

    await connection.query(`ALTER TABLE lich_su_phong_thuy CHANGE COLUMN birth_date ngay_sinh DATE`);
    console.log('   ✅ birth_date → ngay_sinh');

    await connection.query(`ALTER TABLE lich_su_phong_thuy CHANGE COLUMN birth_time gio_sinh TIME`);
    console.log('   ✅ birth_time → gio_sinh');

    await connection.query(`ALTER TABLE lich_su_phong_thuy CHANGE COLUMN gender gioi_tinh VARCHAR(10)`);
    console.log('   ✅ gender → gioi_tinh');

    await connection.query(`ALTER TABLE lich_su_phong_thuy CHANGE COLUMN calendar_type loai_lich VARCHAR(20)`);
    console.log('   ✅ calendar_type → loai_lich');

    await connection.query(`ALTER TABLE lich_su_phong_thuy CHANGE COLUMN element menh VARCHAR(50)`);
    console.log('   ✅ element → menh');

    await connection.query(`ALTER TABLE lich_su_phong_thuy CHANGE COLUMN lucky_numbers so_may_man VARCHAR(100)`);
    console.log('   ✅ lucky_numbers → so_may_man');

    await connection.query(`ALTER TABLE lich_su_phong_thuy CHANGE COLUMN view_date ngay_xem TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    console.log('   ✅ view_date → ngay_xem');

    // ========================================
    // BƯỚC 6: ĐỔI TÊN CỘT BẢNG LICH_SU_PHAN_TICH
    // ========================================
    console.log('\n📋 BƯỚC 6: Đổi tên cột bảng lich_su_phan_tich...\n');

    await connection.query(`ALTER TABLE lich_su_phan_tich CHANGE COLUMN id ma_lich_su INT AUTO_INCREMENT`);
    console.log('   ✅ id → ma_lich_su');

    await connection.query(`ALTER TABLE lich_su_phan_tich CHANGE COLUMN user_id ma_nguoi_dung INT`);
    console.log('   ✅ user_id → ma_nguoi_dung');

    await connection.query(`ALTER TABLE lich_su_phan_tich CHANGE COLUMN user_name ten_nguoi_dung VARCHAR(255)`);
    console.log('   ✅ user_name → ten_nguoi_dung');

    await connection.query(`ALTER TABLE lich_su_phan_tich CHANGE COLUMN birth_date ngay_sinh DATE`);
    console.log('   ✅ birth_date → ngay_sinh');

    await connection.query(`ALTER TABLE lich_su_phan_tich CHANGE COLUMN lucky_numbers so_may_man VARCHAR(100)`);
    console.log('   ✅ lucky_numbers → so_may_man');

    await connection.query(`ALTER TABLE lich_su_phan_tich CHANGE COLUMN price_limit ngan_sach DECIMAL(10,2)`);
    console.log('   ✅ price_limit → ngan_sach');

    await connection.query(`ALTER TABLE lich_su_phan_tich CHANGE COLUMN expected_network nha_mang_mong_muon VARCHAR(50)`);
    console.log('   ✅ expected_network → nha_mang_mong_muon');

    await connection.query(`ALTER TABLE lich_su_phan_tich CHANGE COLUMN purpose muc_dich TEXT`);
    console.log('   ✅ purpose → muc_dich');

    await connection.query(`ALTER TABLE lich_su_phan_tich CHANGE COLUMN result_count so_ket_qua INT`);
    console.log('   ✅ result_count → so_ket_qua');

    await connection.query(`ALTER TABLE lich_su_phan_tich CHANGE COLUMN search_date ngay_tim_kiem TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    console.log('   ✅ search_date → ngay_tim_kiem');

    // ========================================
    // BƯỚC 7: ĐỔI TÊN CỘT BẢNG TIN_NHAN
    // ========================================
    console.log('\n📋 BƯỚC 7: Đổi tên cột bảng tin_nhan...\n');

    await connection.query(`ALTER TABLE tin_nhan CHANGE COLUMN id ma_tin_nhan INT AUTO_INCREMENT`);
    console.log('   ✅ id → ma_tin_nhan');

    await connection.query(`ALTER TABLE tin_nhan CHANGE COLUMN name ten_nguoi_gui VARCHAR(255) NOT NULL`);
    console.log('   ✅ name → ten_nguoi_gui');

    await connection.query(`ALTER TABLE tin_nhan CHANGE COLUMN phone sdt_nguoi_gui VARCHAR(20) NOT NULL`);
    console.log('   ✅ phone → sdt_nguoi_gui');

    await connection.query(`ALTER TABLE tin_nhan CHANGE COLUMN email email_nguoi_gui VARCHAR(255)`);
    console.log('   ✅ email → email_nguoi_gui');

    await connection.query(`ALTER TABLE tin_nhan CHANGE COLUMN message noi_dung TEXT NOT NULL`);
    console.log('   ✅ message → noi_dung');

    await connection.query(`ALTER TABLE tin_nhan CHANGE COLUMN status trang_thai VARCHAR(50) DEFAULT 'Chưa đọc'`);
    console.log('   ✅ status → trang_thai');

    await connection.query(`ALTER TABLE tin_nhan CHANGE COLUMN created_at ngay_gui TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    console.log('   ✅ created_at → ngay_gui');

    console.log('\n✅✅✅ HOÀN THÀNH ĐỔI TÊN TẤT CẢ BẢNG VÀ CỘT!\n');

    // ========================================
    // HIỂN THỊ DANH SÁCH TÊN MỚI
    // ========================================
    console.log('📊 DANH SÁCH TÊN MỚI:\n');
    console.log('1️⃣  BẢNG: nguoi_dung');
    console.log('   - ma_nguoi_dung, ten_dang_nhap, mat_khau, vai_tro, ngay_tao\n');

    console.log('2️⃣  BẢNG: the_sim');
    console.log('   - ma_sim, so_sim, nha_mang, gia_ban, loai_sim, menh_phong_thuy, diem_nut, trang_thai, mo_ta\n');

    console.log('3️⃣  BẢNG: don_hang');
    console.log('   - ma_don_hang, ma_nguoi_dung, ten_nguoi_dung, so_sim, nha_mang, gia_mua, loai_sim,');
    console.log('     ten_khach_hang, sdt_khach_hang, dia_chi_khach_hang, phuong_thuc_thanh_toan,');
    console.log('     ngay_mua, trang_thai, ngay_duyet\n');

    console.log('4️⃣  BẢNG: lich_su_phong_thuy');
    console.log('   - ma_lich_su, ma_nguoi_dung, ten_nguoi_dung, ngay_sinh, gio_sinh, gioi_tinh,');
    console.log('     loai_lich, menh, so_may_man, ngay_xem\n');

    console.log('5️⃣  BẢNG: lich_su_phan_tich');
    console.log('   - ma_lich_su, ma_nguoi_dung, ten_nguoi_dung, ngay_sinh, so_may_man, ngan_sach,');
    console.log('     nha_mang_mong_muon, muc_dich, so_ket_qua, ngay_tim_kiem\n');

    console.log('6️⃣  BẢNG: tin_nhan');
    console.log('   - ma_tin_nhan, ten_nguoi_gui, sdt_nguoi_gui, email_nguoi_gui, noi_dung, trang_thai, ngay_gui\n');

    console.log('⚠️⚠️⚠️  QUAN TRỌNG: BẠN PHẢI CẬP NHẬT LẠI CODE BACKEND! ⚠️⚠️⚠️\n');
    console.log('Tôi sẽ tạo file hướng dẫn cập nhật code...\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await connection.end();
  }
}

renameAllToVietnamese();
