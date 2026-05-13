const mysql = require('mysql2/promise');

async function checkDatabase() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('📊 Kiểm tra dữ liệu trong database ai_sim_db:\n');

    // Kiểm tra sim_cards
    const [sims] = await connection.query('SELECT COUNT(*) as count FROM sim_cards');
    console.log(`✅ Bảng sim_cards: ${sims[0].count} bản ghi`);

    // Kiểm tra users
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Bảng users: ${users[0].count} bản ghi`);

    // Kiểm tra purchases
    const [purchases] = await connection.query('SELECT COUNT(*) as count FROM purchases');
    console.log(`✅ Bảng purchases: ${purchases[0].count} bản ghi`);

    // Kiểm tra fengshui_history
    const [fengshui] = await connection.query('SELECT COUNT(*) as count FROM fengshui_history');
    console.log(`✅ Bảng fengshui_history: ${fengshui[0].count} bản ghi`);

    console.log('\n📋 Danh sách một số sim:');
    const [simList] = await connection.query('SELECT sim_number, network, price, category FROM sim_cards LIMIT 5');
    simList.forEach(sim => {
      console.log(`  - ${sim.sim_number} (${sim.network}) - ${sim.price.toLocaleString()}đ - ${sim.category}`);
    });

    console.log('\n👥 Danh sách users:');
    const [userList] = await connection.query('SELECT name, role FROM users');
    userList.forEach(user => {
      console.log(`  - ${user.name} (${user.role})`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await connection.end();
  }
}

checkDatabase();
