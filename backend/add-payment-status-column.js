const mysql = require('mysql2/promise');

async function addPaymentStatusColumn() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  console.log('🔄 Thêm cột payment_status vào bảng don_hang...\n');

  try {
    // Kiểm tra và thêm cột payment_status
    try {
      await connection.query(`
        ALTER TABLE don_hang 
        ADD COLUMN payment_status VARCHAR(20) DEFAULT 'PENDING' AFTER trang_thai
      `);
      console.log('✅ Đã thêm cột payment_status');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Cột payment_status đã tồn tại');
      } else throw e;
    }

    // Kiểm tra và thêm cột paid_at
    try {
      await connection.query(`
        ALTER TABLE don_hang 
        ADD COLUMN paid_at TIMESTAMP NULL AFTER payment_status
      `);
      console.log('✅ Đã thêm cột paid_at');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Cột paid_at đã tồn tại');
      } else throw e;
    }

    // Kiểm tra và thêm cột transaction_id
    try {
      await connection.query(`
        ALTER TABLE don_hang 
        ADD COLUMN transaction_id VARCHAR(100) NULL AFTER paid_at
      `);
      console.log('✅ Đã thêm cột transaction_id');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Cột transaction_id đã tồn tại');
      } else throw e;
    }

    // Cập nhật các đơn hàng đã duyệt thành PAID
    const [result] = await connection.query(`
      UPDATE don_hang 
      SET payment_status = 'PAID', paid_at = ngay_duyet 
      WHERE trang_thai = 'Đã duyệt' AND (payment_status IS NULL OR payment_status = 'PENDING')
    `);
    console.log(`✅ Đã cập nhật ${result.affectedRows} đơn hàng đã duyệt thành PAID`);

    console.log('\n✨ Hoàn tất! Database đã được cập nhật với các trường:');
    console.log('   - payment_status: PENDING | PAID | FAILED');
    console.log('   - paid_at: Thời gian thanh toán');
    console.log('   - transaction_id: Mã giao dịch');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }

  await connection.end();
}

addPaymentStatusColumn().catch(console.error);
