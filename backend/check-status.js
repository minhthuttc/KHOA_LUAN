const mysql = require('mysql2/promise');

async function checkStatus() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    // Kiểm tra status của sim
    const [rows] = await connection.query('SELECT sim_number, status FROM sim_cards LIMIT 10');
    
    console.log('📋 10 sim đầu tiên:');
    rows.forEach(r => {
      console.log(`  ${r.sim_number} - Status: ${r.status}`);
    });

    // Đếm số sim theo status
    const [counts] = await connection.query(`
      SELECT status, COUNT(*) as count 
      FROM sim_cards 
      GROUP BY status
    `);
    
    console.log('\n📊 Thống kê theo status:');
    counts.forEach(c => {
      console.log(`  ${c.status}: ${c.count} sim`);
    });

    // Cập nhật 3 sim đầu tiên thành "Đã bán" để test
    console.log('\n🔄 Đang cập nhật 3 sim đầu tiên thành "Đã bán" để test...');
    await connection.query(`
      UPDATE sim_cards 
      SET status = 'Đã bán' 
      WHERE id IN (1, 2, 3)
    `);
    
    console.log('✅ Đã cập nhật thành công!');
    
    // Kiểm tra lại
    const [updated] = await connection.query('SELECT sim_number, status FROM sim_cards WHERE id IN (1, 2, 3)');
    console.log('\n📋 3 sim vừa cập nhật:');
    updated.forEach(r => {
      console.log(`  ${r.sim_number} - Status: ${r.status}`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

checkStatus();
