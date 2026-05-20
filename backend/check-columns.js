const mysql = require('mysql2/promise');

async function checkColumns() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('🔍 Kiểm tra cấu trúc các bảng:\n');

    // Kiểm tra bảng tin_nhan
    console.log('📋 Bảng tin_nhan:');
    const [msgColumns] = await connection.query('SHOW COLUMNS FROM tin_nhan');
    msgColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    // Kiểm tra bảng lich_su_phan_tich
    console.log('\n📋 Bảng lich_su_phan_tich:');
    const [recColumns] = await connection.query('SHOW COLUMNS FROM lich_su_phan_tich');
    recColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

checkColumns();
