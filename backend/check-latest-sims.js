const mysql = require('mysql2/promise');

async function checkLatestSims() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  console.log('🔍 Kiểm tra 10 sim mới nhất trong database:\n');

  const [rows] = await connection.query(
    'SELECT ma_sim, so_sim, nha_mang, gia_ban, loai_sim, menh_phong_thuy, diem_nut, trang_thai FROM the_sim ORDER BY ma_sim DESC LIMIT 10'
  );

  console.log('Tổng số sim tìm thấy:', rows.length);
  console.log('\n📋 Danh sách sim mới nhất:\n');

  rows.forEach((sim, index) => {
    console.log(`${index + 1}. Sim: ${sim.so_sim}`);
    console.log(`   - ID: ${sim.ma_sim}`);
    console.log(`   - Nhà mạng: ${sim.nha_mang}`);
    console.log(`   - Giá: ${sim.gia_ban.toLocaleString('vi-VN')} đ`);
    console.log(`   - Loại: ${sim.loai_sim}`);
    console.log(`   - Mệnh: ${sim.menh_phong_thuy}`);
    console.log(`   - Điểm nút: ${sim.diem_nut}/10`);
    console.log(`   - Trạng thái: ${sim.trang_thai}`);
    console.log('');
  });

  await connection.end();
}

checkLatestSims().catch(console.error);
