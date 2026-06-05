const mysql = require('mysql2/promise');

/**
 * Script test: Chuyển đơn hàng từ PENDING sang PAID
 * Mục đích: Test hiển thị trạng thái thanh toán trên frontend
 */

async function approvePayment() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('🧪 MANUAL PAYMENT APPROVAL TEST\n');
    console.log('================================================================================\n');

    // Lấy đơn hàng PENDING
    const [pendingOrders] = await connection.query(`
      SELECT ma_don_hang, so_sim, ten_khach_hang, gia_mua, payment_status, phuong_thuc_thanh_toan
      FROM don_hang 
      WHERE payment_status = 'PENDING' 
      ORDER BY ma_don_hang DESC 
      LIMIT 10
    `);

    if (pendingOrders.length === 0) {
      console.log('⚠️  Không có đơn hàng nào có payment_status = PENDING\n');
      await connection.end();
      return;
    }

    console.log(`📋 Tìm thấy ${pendingOrders.length} đơn hàng PENDING:\n`);
    console.log('┌──────┬──────────────┬────────────────────┬─────────────┬──────────────┐');
    console.log('│ ID   │ SIM          │ Khách hàng         │ Giá         │ PT Toán      │');
    console.log('├──────┼──────────────┼────────────────────┼─────────────┼──────────────┤');
    
    pendingOrders.forEach(order => {
      const id = String(order.ma_don_hang).padEnd(4);
      const sim = String(order.so_sim).padEnd(12);
      const customer = String(order.ten_khach_hang).padEnd(18).substring(0, 18);
      const price = String(Number(order.gia_mua).toLocaleString('vi-VN')).padEnd(11);
      const method = order.phuong_thuc_thanh_toan === 'bank_transfer' ? 'Chuyển khoản' : 'COD';
      console.log(`│ ${id} │ ${sim} │ ${customer} │ ${price} │ ${method.padEnd(12)} │`);
    });
    console.log('└──────┴──────────────┴────────────────────┴─────────────┴──────────────┘\n');

    // Chọn đơn hàng đầu tiên
    const targetOrder = pendingOrders[0];
    const orderId = targetOrder.ma_don_hang;
    const simNumber = targetOrder.so_sim;
    const amount = Number(targetOrder.gia_mua);

    console.log(`\n🎯 Chọn đơn hàng ID: ${orderId}`);
    console.log(`   Sim: ${simNumber}`);
    console.log(`   Giá: ${amount.toLocaleString('vi-VN')}đ`);
    console.log(`   Khách: ${targetOrder.ten_khach_hang}\n`);

    // Tạo transaction ID giả
    const transactionId = `TEST${Date.now()}`;

    console.log('🔄 Đang cập nhật payment_status = PAID...\n');

    // Cập nhật đơn hàng
    const [result] = await connection.query(`
      UPDATE don_hang 
      SET payment_status = 'PAID',
          paid_at = NOW(),
          transaction_id = ?,
          trang_thai = 'Đã duyệt',
          ngay_duyet = NOW()
      WHERE ma_don_hang = ?
    `, [transactionId, orderId]);

    console.log(`✅ Đã cập nhật ${result.affectedRows} đơn hàng!\n`);
    console.log(`   payment_status: PENDING → PAID ✓`);
    console.log(`   paid_at: NULL → NOW() ✓`);
    console.log(`   transaction_id: NULL → ${transactionId} ✓`);
    console.log(`   trang_thai: Chờ duyệt → Đã duyệt ✓\n`);

    // Verify
    const [verifyOrders] = await connection.query(`
      SELECT ma_don_hang, so_sim, payment_status, paid_at, transaction_id, trang_thai
      FROM don_hang 
      WHERE ma_don_hang = ?
    `, [orderId]);

    if (verifyOrders.length > 0) {
      const updated = verifyOrders[0];
      console.log('🔍 VERIFY - Dữ liệu sau khi update:\n');
      console.log('   Order ID:', updated.ma_don_hang);
      console.log('   Sim:', updated.so_sim);
      console.log('   Status:', updated.trang_thai);
      console.log('   Payment Status:', updated.payment_status);
      console.log('   Paid At:', updated.paid_at);
      console.log('   Transaction ID:', updated.transaction_id);
      console.log('');
    }

    console.log('================================================================================');
    console.log('✨ Test hoàn tất!\n');
    console.log('📋 NEXT STEPS:');
    console.log('   1. Mở trình duyệt: http://localhost:3000/admin');
    console.log('   2. Xem tab "Lịch sử mua sim"');
    console.log('   3. Tìm đơn hàng ID:', orderId);
    console.log('   4. Kiểm tra badge hiển thị: 🟢 "Đã thanh toán"\n');
    console.log('💡 Nếu vẫn không thấy badge:');
    console.log('   - Reload trang (Ctrl+R hoặc F5)');
    console.log('   - Clear cache (Ctrl+Shift+R)');
    console.log('   - Restart frontend: cd frontend && npm run dev\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

approvePayment();
