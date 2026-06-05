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
    const orderId = 13;
    
    console.log('\n=== MÔ PHỎNG THANH TOÁN ĐƠN HÀNG 13 ===');
    console.log('⏰ Time:', new Date().toLocaleString());
    console.log('🆔 Order ID:', orderId);
    console.log('');

    // Check order trước
    console.log('📋 Kiểm tra đơn hàng TRƯỚC khi approve...');
    const [ordersBefore] = await pool.query(
      'SELECT ma_don_hang, so_sim, gia_mua, payment_status, paid_at, transaction_id FROM don_hang WHERE ma_don_hang = ?',
      [orderId]
    );

    if (ordersBefore.length === 0) {
      console.log('❌ Không tìm thấy đơn hàng với ID:', orderId);
      process.exit(1);
    }

    const orderBefore = ordersBefore[0];
    console.log('✅ Tìm thấy đơn hàng:');
    console.log('   - Số sim:', orderBefore.so_sim);
    console.log('   - Giá:', orderBefore.gia_mua, 'VNĐ');
    console.log('   - payment_status:', orderBefore.payment_status);
    console.log('   - paid_at:', orderBefore.paid_at);
    console.log('   - transaction_id:', orderBefore.transaction_id);
    console.log('');

    if (orderBefore.payment_status === 'PAID') {
      console.log('⚠️ Đơn hàng đã được thanh toán rồi!');
      process.exit(0);
    }

    // Update to PAID
    console.log('🔄 Đang cập nhật payment_status → PAID...');
    const transactionId = 'MANUAL_' + Date.now();
    
    const [updateResult] = await pool.query(
      'UPDATE don_hang SET payment_status = ?, paid_at = NOW(), transaction_id = ? WHERE ma_don_hang = ?',
      ['PAID', transactionId, orderId]
    );

    console.log('✅ UPDATE thành công!');
    console.log('   - Rows affected:', updateResult.affectedRows);
    console.log('   - Transaction ID:', transactionId);
    console.log('');

    // Check order sau
    console.log('📋 Kiểm tra đơn hàng SAU khi approve...');
    const [ordersAfter] = await pool.query(
      'SELECT ma_don_hang, so_sim, gia_mua, payment_status, paid_at, transaction_id FROM don_hang WHERE ma_don_hang = ?',
      [orderId]
    );

    const orderAfter = ordersAfter[0];
    console.log('✅ Trạng thái mới:');
    console.log('   - payment_status:', orderAfter.payment_status, orderAfter.payment_status === 'PAID' ? '✅' : '❌');
    console.log('   - paid_at:', orderAfter.paid_at, orderAfter.paid_at ? '✅' : '❌');
    console.log('   - transaction_id:', orderAfter.transaction_id, orderAfter.transaction_id ? '✅' : '❌');
    console.log('');

    console.log('🎉 HOÀN TẤT!');
    console.log('');
    console.log('📊 SO SÁNH:');
    console.log('   TRƯỚC: payment_status =', orderBefore.payment_status);
    console.log('   SAU:   payment_status =', orderAfter.payment_status);
    console.log('');
    console.log('⏰ Polling sẽ phát hiện thay đổi trong vòng 3 giây...');
    console.log('💡 Kiểm tra browser console để xem frontend tự động update!');
    console.log('');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

approveOrder();
