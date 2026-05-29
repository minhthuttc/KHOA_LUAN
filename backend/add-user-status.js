const mysql = require('mysql2/promise');

async function addUserStatus() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    const [existing] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'ai_sim_db' 
      AND TABLE_NAME = 'nguoi_dung' 
      AND COLUMN_NAME = 'trang_thai'
    `);
    
    if (existing.length === 0) {
      await connection.query(`
        ALTER TABLE nguoi_dung 
        ADD COLUMN trang_thai VARCHAR(20) DEFAULT 'active'
        COMMENT 'active = hoat dong, locked = bi khoa'
      `);
      console.log('added trang_thai column');
    } else {
      console.log('column exists');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

addUserStatus();
