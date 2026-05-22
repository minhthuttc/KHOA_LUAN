const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'Thu2220403',
  database: 'ai_sim_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function checkSimColumns() {
  try {
    console.log('📋 Cấu trúc bảng the_sim:\n');
    
    const [columns] = await pool.query('SHOW COLUMNS FROM the_sim');
    
    columns.forEach(col => {
      console.log(`${col.Field}: ${col.Type} ${col.Key ? `[${col.Key}]` : ''}`);
    });
    
    console.log('\n📊 Dữ liệu mẫu (3 sim đầu tiên):\n');
    
    const [sims] = await pool.query('SELECT * FROM the_sim LIMIT 3');
    console.log(sims);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkSimColumns();
