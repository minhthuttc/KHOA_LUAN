const mysql = require('mysql2/promise');

async function checkOldTables() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('🔍 Kiểm tra các bảng cũ (nhamang, khosim):\n');

    // Lấy danh sách tất cả các bảng
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => t[`Tables_in_ai_sim_db`]);
    
    console.log('📋 Tất cả các bảng hiện có:');
    tableNames.forEach(name => console.log(`  - ${name}`));

    // Kiểm tra bảng nhamang
    if (tableNames.includes('nhamang')) {
      console.log('\n✅ Bảng nhamang TỒN TẠI');
      const [rows] = await connection.query('SELECT * FROM nhamang');
      console.log(`   Số bản ghi: ${rows.length}`);
      if (rows.length > 0) {
        console.log('   Dữ liệu mẫu:');
        rows.forEach(row => {
          console.log(`   - ${row.ten_nha_mang}`);
        });
      }
    } else {
      console.log('\n❌ Bảng nhamang KHÔNG TỒN TẠI');
    }

    // Kiểm tra bảng khosim
    if (tableNames.includes('khosim')) {
      console.log('\n✅ Bảng khosim TỒN TẠI');
      const [rows] = await connection.query('SELECT COUNT(*) as count FROM khosim');
      console.log(`   Số bản ghi: ${rows[0].count}`);
      
      // Lấy 5 sim mẫu
      const [samples] = await connection.query('SELECT * FROM khosim LIMIT 5');
      if (samples.length > 0) {
        console.log('   Dữ liệu mẫu:');
        samples.forEach(row => {
          console.log(`   - ${row.so_sim} (${row.gia_ban}đ) - ${row.loai_sim}`);
        });
      }
    } else {
      console.log('\n❌ Bảng khosim KHÔNG TỒN TẠI');
    }

    console.log('\n💡 Lưu ý:');
    console.log('   - Hiện tại hệ thống đang dùng bảng "sim_cards" thay vì "khosim"');
    console.log('   - Dữ liệu nhà mạng được lưu trực tiếp trong cột "network" của bảng sim_cards');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

checkOldTables();
