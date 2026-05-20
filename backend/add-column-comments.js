const mysql = require('mysql2/promise');

async function addColumnComments() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('🔄 Bắt đầu thêm COMMENT tiếng Việt cho các cột...\n');

    // ===== BẢNG USERS =====
    console.log('📋 Bảng users (Người dùng):');
    await connection.query(`ALTER TABLE users MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'ID người dùng'`);
    await connection.query(`ALTER TABLE users MODIFY COLUMN name VARCHAR(255) NOT NULL COMMENT 'Tên đăng nhập'`);
    await connection.query(`ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NOT NULL COMMENT 'Mật khẩu'`);
    await connection.query(`ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'customer') DEFAULT 'customer' COMMENT 'Vai trò (admin/khách hàng)'`);
    await connection.query(`ALTER TABLE users MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo tài khoản'`);
    console.log('   ✅ Đã thêm comment cho 5 cột\n');

    // ===== BẢNG SIM_CARDS =====
    console.log('📋 Bảng sim_cards (Thẻ sim):');
    await connection.query(`ALTER TABLE sim_cards MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'ID sim'`);
    await connection.query(`ALTER TABLE sim_cards MODIFY COLUMN sim_number VARCHAR(20) NOT NULL UNIQUE COMMENT 'Số sim'`);
    await connection.query(`ALTER TABLE sim_cards MODIFY COLUMN network VARCHAR(50) NOT NULL COMMENT 'Nhà mạng (Viettel/Vinaphone/Mobifone)'`);
    await connection.query(`ALTER TABLE sim_cards MODIFY COLUMN price DECIMAL(10,2) NOT NULL COMMENT 'Giá bán (VNĐ)'`);
    await connection.query(`ALTER TABLE sim_cards MODIFY COLUMN category VARCHAR(100) COMMENT 'Loại sim (Sim thần tài, Sim lộc phát...)'`);
    await connection.query(`ALTER TABLE sim_cards MODIFY COLUMN feng_shui_element VARCHAR(50) COMMENT 'Mệnh phong thủy (Kim/Mộc/Thủy/Hỏa/Thổ)'`);
    await connection.query(`ALTER TABLE sim_cards MODIFY COLUMN total_nodes INT DEFAULT 5 COMMENT 'Điểm nút sim (1-10)'`);
    await connection.query(`ALTER TABLE sim_cards MODIFY COLUMN status VARCHAR(50) DEFAULT 'Còn hàng' COMMENT 'Trạng thái (Còn hàng/Đã bán)'`);
    await connection.query(`ALTER TABLE sim_cards MODIFY COLUMN description TEXT COMMENT 'Mô tả chi tiết về sim'`);
    console.log('   ✅ Đã thêm comment cho 9 cột\n');

    // ===== BẢNG PURCHASES =====
    console.log('📋 Bảng purchases (Đơn hàng):');
    await connection.query(`ALTER TABLE purchases MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'ID đơn hàng'`);
    await connection.query(`ALTER TABLE purchases MODIFY COLUMN user_id INT COMMENT 'ID người mua'`);
    await connection.query(`ALTER TABLE purchases MODIFY COLUMN user_name VARCHAR(255) COMMENT 'Tên người mua'`);
    await connection.query(`ALTER TABLE purchases MODIFY COLUMN sim_number VARCHAR(20) NOT NULL COMMENT 'Số sim đã mua'`);
    await connection.query(`ALTER TABLE purchases MODIFY COLUMN network VARCHAR(50) COMMENT 'Nhà mạng'`);
    await connection.query(`ALTER TABLE purchases MODIFY COLUMN price DECIMAL(10,2) COMMENT 'Giá mua (VNĐ)'`);
    await connection.query(`ALTER TABLE purchases MODIFY COLUMN category VARCHAR(100) COMMENT 'Loại sim'`);
    await connection.query(`ALTER TABLE purchases MODIFY COLUMN customer_name VARCHAR(255) COMMENT 'Tên khách hàng nhận sim'`);
    await connection.query(`ALTER TABLE purchases MODIFY COLUMN customer_phone VARCHAR(20) COMMENT 'SĐT khách hàng'`);
    await connection.query(`ALTER TABLE purchases MODIFY COLUMN customer_address TEXT COMMENT 'Địa chỉ nhận sim'`);
    await connection.query(`ALTER TABLE purchases MODIFY COLUMN payment_method VARCHAR(50) COMMENT 'Phương thức thanh toán (bank_transfer/cod)'`);
    await connection.query(`ALTER TABLE purchases MODIFY COLUMN purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày mua'`);
    await connection.query(`ALTER TABLE purchases MODIFY COLUMN status VARCHAR(50) DEFAULT 'Chờ duyệt' COMMENT 'Trạng thái đơn (Chờ duyệt/Đã duyệt/Đã hủy)'`);
    await connection.query(`ALTER TABLE purchases MODIFY COLUMN approval_date TIMESTAMP NULL COMMENT 'Ngày duyệt/hủy đơn'`);
    console.log('   ✅ Đã thêm comment cho 14 cột\n');

    // ===== BẢNG FENGSHUI_HISTORY =====
    console.log('📋 Bảng fengshui_history (Lịch sử phong thủy):');
    await connection.query(`ALTER TABLE fengshui_history MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'ID lịch sử'`);
    await connection.query(`ALTER TABLE fengshui_history MODIFY COLUMN user_id INT COMMENT 'ID người dùng'`);
    await connection.query(`ALTER TABLE fengshui_history MODIFY COLUMN user_name VARCHAR(255) COMMENT 'Tên người dùng'`);
    await connection.query(`ALTER TABLE fengshui_history MODIFY COLUMN birth_date DATE COMMENT 'Ngày sinh'`);
    await connection.query(`ALTER TABLE fengshui_history MODIFY COLUMN birth_time TIME COMMENT 'Giờ sinh'`);
    await connection.query(`ALTER TABLE fengshui_history MODIFY COLUMN gender VARCHAR(10) COMMENT 'Giới tính (male/female)'`);
    await connection.query(`ALTER TABLE fengshui_history MODIFY COLUMN calendar_type VARCHAR(20) COMMENT 'Loại lịch (solar/lunar)'`);
    await connection.query(`ALTER TABLE fengshui_history MODIFY COLUMN element VARCHAR(50) COMMENT 'Mệnh ngũ hành'`);
    await connection.query(`ALTER TABLE fengshui_history MODIFY COLUMN lucky_numbers VARCHAR(100) COMMENT 'Số may mắn'`);
    await connection.query(`ALTER TABLE fengshui_history MODIFY COLUMN view_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày xem phong thủy'`);
    console.log('   ✅ Đã thêm comment cho 10 cột\n');

    // ===== BẢNG RECOMMENDATION_HISTORY =====
    console.log('📋 Bảng recommendation_history (Lịch sử phân tích):');
    await connection.query(`ALTER TABLE recommendation_history MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'ID lịch sử'`);
    await connection.query(`ALTER TABLE recommendation_history MODIFY COLUMN user_id INT COMMENT 'ID người dùng'`);
    await connection.query(`ALTER TABLE recommendation_history MODIFY COLUMN user_name VARCHAR(255) COMMENT 'Tên người dùng'`);
    await connection.query(`ALTER TABLE recommendation_history MODIFY COLUMN birth_date DATE COMMENT 'Ngày sinh'`);
    await connection.query(`ALTER TABLE recommendation_history MODIFY COLUMN lucky_numbers VARCHAR(100) COMMENT 'Số may mắn'`);
    await connection.query(`ALTER TABLE recommendation_history MODIFY COLUMN price_limit DECIMAL(10,2) COMMENT 'Ngân sách tối đa (VNĐ)'`);
    await connection.query(`ALTER TABLE recommendation_history MODIFY COLUMN expected_network VARCHAR(50) COMMENT 'Nhà mạng mong muốn'`);
    await connection.query(`ALTER TABLE recommendation_history MODIFY COLUMN purpose TEXT COMMENT 'Mục đích sử dụng sim'`);
    await connection.query(`ALTER TABLE recommendation_history MODIFY COLUMN result_count INT COMMENT 'Số lượng sim gợi ý'`);
    await connection.query(`ALTER TABLE recommendation_history MODIFY COLUMN search_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày phân tích'`);
    console.log('   ✅ Đã thêm comment cho 10 cột\n');

    // ===== BẢNG MESSAGES =====
    console.log('📋 Bảng messages (Tin nhắn):');
    await connection.query(`ALTER TABLE messages MODIFY COLUMN id INT AUTO_INCREMENT COMMENT 'ID tin nhắn'`);
    await connection.query(`ALTER TABLE messages MODIFY COLUMN name VARCHAR(255) NOT NULL COMMENT 'Tên người gửi'`);
    await connection.query(`ALTER TABLE messages MODIFY COLUMN phone VARCHAR(20) NOT NULL COMMENT 'SĐT người gửi'`);
    await connection.query(`ALTER TABLE messages MODIFY COLUMN email VARCHAR(255) COMMENT 'Email người gửi'`);
    await connection.query(`ALTER TABLE messages MODIFY COLUMN message TEXT NOT NULL COMMENT 'Nội dung tin nhắn'`);
    await connection.query(`ALTER TABLE messages MODIFY COLUMN status VARCHAR(50) DEFAULT 'Chưa đọc' COMMENT 'Trạng thái (Chưa đọc/Đã đọc)'`);
    await connection.query(`ALTER TABLE messages MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày gửi'`);
    console.log('   ✅ Đã thêm comment cho 7 cột\n');

    console.log('✅ Hoàn thành thêm COMMENT tiếng Việt cho tất cả các cột!');
    console.log('\n📝 Xem comment cột: SELECT column_name, column_comment FROM information_schema.columns WHERE table_schema = "ai_sim_db" AND table_name = "users"');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

addColumnComments();
