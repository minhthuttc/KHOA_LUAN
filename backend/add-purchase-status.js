const mysql = require('mysql2/promise');

async function addPurchaseStatus() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('🔄 Kiểm tra cột status trong bảng purchases...');
    
    // Kiểm tra xem cột status đã tồn tại chưa
    const [columns] = await connection.query('SHOW COLUMNS FROM purchases LIKE "status"');
    
    if (columns.length > 0) {
      console.log('✅ Cột status đã tồn tại!');
    } else {
      console.log('➕ Đang thêm cột status...');
      await connection.query(`
        ALTER TABLE purchases 
        ADD COLUMN status VARCHAR(20) DEFAULT 'Chờ duyệt' AFTER payment_method
      `);
      console.log('✅ Đã thêm cột status thành công!');
    }

    // Cập nhật status cho các đơn hàng cũ
    console.log('\n🔄 Cập nhật status cho các đơn hàng cũ...');
    await connection.query(`
      UPDATE purchases 
      SET status = 'Đã duyệt' 
      WHERE status IS NULL OR status = ''
    `);
    
    console.log('✅ Hoàn tất!');
    
    // Hiển thị cấu trúc bảng
    console.log('\n📋 Cấu trúc bảng purchases:');
    const [allColumns] = await connection.query('SHOW COLUMNS FROM purchases');
    allColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Default ? `DEFAULT '${col.Default}'` : ''}`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

addPurchaseStatus();
