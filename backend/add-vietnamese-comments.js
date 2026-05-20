const mysql = require('mysql2/promise');

async function addVietnameseComments() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('🔄 Bắt đầu thêm COMMENT tiếng Việt cho các bảng...\n');

    // Thêm comment cho bảng users
    await connection.query(`
      ALTER TABLE users COMMENT = 'Bảng người dùng - Lưu thông tin tài khoản'
    `);
    console.log('✅ users - Đã thêm comment');

    // Thêm comment cho bảng sim_cards
    await connection.query(`
      ALTER TABLE sim_cards COMMENT = 'Bảng thẻ sim - Lưu thông tin các sim số đẹp'
    `);
    console.log('✅ sim_cards - Đã thêm comment');

    // Thêm comment cho bảng purchases
    await connection.query(`
      ALTER TABLE purchases COMMENT = 'Bảng đơn hàng - Lưu lịch sử mua sim'
    `);
    console.log('✅ purchases - Đã thêm comment');

    // Thêm comment cho bảng fengshui_history
    await connection.query(`
      ALTER TABLE fengshui_history COMMENT = 'Bảng lịch sử phong thủy - Lưu lịch sử xem phong thủy'
    `);
    console.log('✅ fengshui_history - Đã thêm comment');

    // Thêm comment cho bảng recommendation_history
    await connection.query(`
      ALTER TABLE recommendation_history COMMENT = 'Bảng lịch sử phân tích - Lưu lịch sử phân tích nhu cầu AI'
    `);
    console.log('✅ recommendation_history - Đã thêm comment');

    // Thêm comment cho bảng messages
    await connection.query(`
      ALTER TABLE messages COMMENT = 'Bảng tin nhắn - Lưu tin nhắn liên hệ từ khách hàng'
    `);
    console.log('✅ messages - Đã thêm comment');

    console.log('\n✅ Hoàn thành thêm COMMENT tiếng Việt!');
    console.log('\n📝 Xem comment: SELECT table_name, table_comment FROM information_schema.tables WHERE table_schema = "ai_sim_db"');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

addVietnameseComments();
