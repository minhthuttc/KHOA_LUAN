const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'Thu2220403',
  database: 'ai_sim_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function approveOrder() {
  try {
    // Lấy orderId từ command line argument
    const orderId = process.argv[2];
    
    if (!orderId) {
      console.log('\n❌ Vui lòng cung cấp Order ID!');
      console.log('Usage: node quick-approve.js <orderId>');
      console.log('Example: node quick-approve.js 13');
      console.log('');
      process.exit(1);
    }

    console.log('\n🚀 === QUICK APPROVE ORDER ===');
    console.log('⏰ Time:', new Date().toLocaleString());
    console.log('🆔 Order ID:', orderId);
    console.log('');

    // Check order exists
    const [orders] = await pool.query(
      'SELECT ma_don_hang, so_sim, gia_mua, payment_status, paid_at FROM don_hang WHERE ma_don_hang = ?',
      [orderId]
    );

    if (orders.length === 0) {
      console.log('❌ Order not found:', orderId);
      process.exit(1);
    }

    const order = orders[0];
    console.log('📋 Order:', order.so_sim, '-', order.gia_mua, 'VNĐ');
    console.log('📊 Current status:', order.payment_status);
    console.log('');

    if (order.payment_status === 'PAID') {
      console.log('⚠️ Order already PAID!');
      console.log('✅ No action needed.');
      process.exit(0);
    }

    // Update to PAID
    console.log('🔄 Updating to PAID...');
    const transactionId = 'MANUAL_' + Date.now();
    
    await pool.query(
      'UPDATE don_hang SET payment_status = ?, paid_at = NOW(), transaction_id = ? WHERE ma_don_hang = ?',
      ['PAID', transactionId, orderId]
    );

    console.log('✅ ORDER UPDATED TO PAID!');
    console.log('   Transaction ID:', transactionId);
    console.log('');
    
    // CẬP NHẬT SIM THÀNH "ĐÃ BÁN"
    console.log('🔄 Updating sim to "Đã bán"...');
    await pool.query(
      'UPDATE the_sim SET trang_thai = ? WHERE so_sim = ?',
      ['Đã bán', order.so_sim]
    );
    console.log('✅ Sim', order.so_sim, 'marked as "Đã bán"');
    console.log('');
    
    console.log('⏰ Polling will detect in ~3 seconds...');
    console.log('💡 Check browser console for auto-update!');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

approveOrder();
