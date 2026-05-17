const mysql = require('mysql2/promise');

async function checkAllTables() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('📊 Kiểm tra tất cả các bảng trong database ai_sim_db:\n');

    // Lấy danh sách tất cả các bảng
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log('✅ Các bảng hiện có:');
    for (const table of tables) {
      const tableName = table[`Tables_in_ai_sim_db`];
      const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      const count = rows[0].count;
      console.log(`  - ${tableName}: ${count} bản ghi`);
    }

    console.log('\n📋 Kiểm tra cấu trúc các bảng quan trọng:\n');

    // Kiểm tra bảng sim_cards
    console.log('🔍 Bảng sim_cards:');
    const [simColumns] = await connection.query('SHOW COLUMNS FROM sim_cards');
    simColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    // Kiểm tra bảng messages nếu tồn tại
    const tableExists = tables.some(t => t[`Tables_in_ai_sim_db`] === 'messages');
    if (tableExists) {
      console.log('\n🔍 Bảng messages:');
      const [msgColumns] = await connection.query('SHOW COLUMNS FROM messages');
      msgColumns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
    } else {
      console.log('\n❌ Bảng messages chưa tồn tại!');
    }

    // Kiểm tra bảng recommendation_history nếu tồn tại
    const recTableExists = tables.some(t => t[`Tables_in_ai_sim_db`] === 'recommendation_history');
    if (recTableExists) {
      console.log('\n🔍 Bảng recommendation_history:');
      const [recColumns] = await connection.query('SHOW COLUMNS FROM recommendation_history');
      recColumns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
    } else {
      console.log('\n❌ Bảng recommendation_history chưa tồn tại!');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

checkAllTables();
