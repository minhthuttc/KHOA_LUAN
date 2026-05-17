const mysql = require('mysql2/promise');

async function addApprovalDate() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('🔄 Thêm cột ngày duyệt/hủy vào bảng purchases...');
    
    // Kiểm tra cột approval_date
    const [columns1] = await connection.query('SHOW COLUMNS FROM purchases LIKE "approval_date"');
    
    if (columns1.length === 0) {
      await connection.query(`
        ALTER TABLE purchases 
        ADD COLUMN approval_date TIMESTAMP NULL AFTER status
      `);
      console.log('✅ Đã thêm cột approval_date!');
    } else {
      console.log('✅ Cột approval_date đã tồn tại!');
    }

    console.log('\n📋 Cấu trúc bảng purchases:');
    const [allColumns] = await connection.query('SHOW COLUMNS FROM purchases');
    allColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

addApprovalDate();
