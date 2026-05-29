const mysql = require('mysql2/promise');

async function addSearchTracking() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    // Kiểm tra xem cột đã tồn tại chưa
    const [existing] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'ai_sim_db' 
      AND TABLE_NAME = 'the_sim' 
      AND COLUMN_NAME = 'so_lan_tim_kiem'
    `);
    
    if (existing.length === 0) {
      // Thêm cột so_lan_tim_kiem vào bảng the_sim
      await connection.query(`
        ALTER TABLE the_sim 
        ADD COLUMN so_lan_tim_kiem INT DEFAULT 0
        COMMENT 'Số lần sim được tìm kiếm/xem'
      `);
      console.log('✅ Đã thêm cột so_lan_tim_kiem');
    } else {
      console.log('ℹ️ Cột so_lan_tim_kiem đã tồn tại');
    }
    
    console.log('✅ Đã thêm cột so_lan_tim_kiem vào bảng the_sim');
    
    // Kiểm tra cột đã được thêm
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM the_sim LIKE 'so_lan_tim_kiem'
    `);
    
    console.log('Thông tin cột:', columns);
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

addSearchTracking();
