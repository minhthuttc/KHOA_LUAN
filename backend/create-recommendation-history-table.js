const mysql = require('mysql2/promise');

async function createRecommendationHistoryTable() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('Đang tạo bảng recommendation_history...');

    // Tạo bảng lịch sử phân tích nhu cầu
    await connection.query(`
      CREATE TABLE IF NOT EXISTS recommendation_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        birth_date DATE,
        lucky_numbers VARCHAR(100),
        price_limit DECIMAL(15, 2),
        expected_network VARCHAR(50),
        purpose TEXT,
        result_count INT DEFAULT 0,
        search_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✓ Đã tạo bảng recommendation_history');

    // Kiểm tra cấu trúc bảng
    const [columns] = await connection.query('SHOW COLUMNS FROM recommendation_history');
    
    console.log('\n=== Cấu trúc bảng recommendation_history ===');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n✅ Hoàn thành!');
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

createRecommendationHistoryTable();
