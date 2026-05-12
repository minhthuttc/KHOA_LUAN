const mysql = require('mysql2/promise');

async function updateDatabase() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('Creating purchases table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        sim_number VARCHAR(15) NOT NULL,
        network VARCHAR(50) NOT NULL,
        price DECIMAL(15, 2) NOT NULL,
        category VARCHAR(50),
        purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Purchases table created');

    console.log('Creating fengshui_history table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fengshui_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        birth_date DATE NOT NULL,
        birth_time VARCHAR(10),
        gender VARCHAR(10) NOT NULL,
        calendar_type VARCHAR(10) NOT NULL,
        element VARCHAR(20) NOT NULL,
        lucky_numbers VARCHAR(50),
        view_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Fengshui_history table created');

    console.log('\n✅ Database updated successfully!');
  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    await connection.end();
  }
}

updateDatabase();
