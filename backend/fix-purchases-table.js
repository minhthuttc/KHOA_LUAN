const mysql = require('mysql2/promise');

async function fixPurchasesTable() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('Đang kiểm tra và cập nhật bảng purchases...');

    // Kiểm tra các cột đã tồn tại chưa
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'ai_sim_db' 
      AND TABLE_NAME = 'purchases'
    `);

    const existingColumns = columns.map(col => col.COLUMN_NAME);
    console.log('Các cột hiện tại:', existingColumns);

    // Thêm các cột thiếu
    if (!existingColumns.includes('customer_name')) {
      await connection.query(`
        ALTER TABLE purchases 
        ADD COLUMN customer_name VARCHAR(100) NOT NULL DEFAULT ''
      `);
      console.log('✓ Đã thêm cột customer_name');
    }

    if (!existingColumns.includes('customer_phone')) {
      await connection.query(`
        ALTER TABLE purchases 
        ADD COLUMN customer_phone VARCHAR(20) NOT NULL DEFAULT ''
      `);
      console.log('✓ Đã thêm cột customer_phone');
    }

    if (!existingColumns.includes('customer_address')) {
      await connection.query(`
        ALTER TABLE purchases 
        ADD COLUMN customer_address TEXT
      `);
      console.log('✓ Đã thêm cột customer_address');
    }

    if (!existingColumns.includes('payment_method')) {
      await connection.query(`
        ALTER TABLE purchases 
        ADD COLUMN payment_method VARCHAR(20) DEFAULT 'bank_transfer'
      `);
      console.log('✓ Đã thêm cột payment_method');
    }

    // Kiểm tra lại cấu trúc bảng
    const [finalColumns] = await connection.query(`
      SHOW COLUMNS FROM purchases
    `);
    
    console.log('\n=== Cấu trúc bảng purchases sau khi cập nhật ===');
    finalColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    // Kiểm tra dữ liệu
    const [purchases] = await connection.query('SELECT * FROM purchases');
    console.log(`\nSố lượng đơn hàng trong database: ${purchases.length}`);
    
    if (purchases.length > 0) {
      console.log('\nMẫu dữ liệu:');
      console.log(purchases[0]);
    }

    console.log('\n✅ Hoàn thành!');
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

fixPurchasesTable();
