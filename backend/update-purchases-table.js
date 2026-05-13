const mysql = require('mysql2/promise');

async function updatePurchasesTable() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('Updating purchases table...');
    
    // Xóa bảng cũ
    await connection.query('DROP TABLE IF EXISTS purchases');
    
    // Tạo lại bảng với đầy đủ thông tin
    await connection.query(`
      CREATE TABLE purchases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        sim_number VARCHAR(15) NOT NULL,
        network VARCHAR(50) NOT NULL,
        price DECIMAL(15, 2) NOT NULL,
        category VARCHAR(50),
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_address TEXT NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('✅ Purchases table updated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

updatePurchasesTable();
