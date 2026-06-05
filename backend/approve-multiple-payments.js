const mysql = require('mysql2/promise');

/**
 * Script duyệt nhiều đơn hàng PENDING cùng lúc
 * Dùng để test hiển thị trạng thái thanh toán
 */

async function approveMultiplePayments() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('🧪 APPROVE MULTIPLE PAYMENTS\n');
    console.log('================================================================================\n');

    // Lấy tất cả đơn hàng PENDING với trang_thai = 'Chờ duyệt'
    const [pendingOrders] = await connection.query(`
      SELECT ma_don_hang, so_sim, ten_khach_hang, gia_mua, payment_status, phuong_thuc_thanh_toan, trang_thai
      FROM don_hang 
      WHERE payment_status = 'PENDING' AND trang_thai = 'Chờ duyệt'
      ORDER BY ma_don_hang DESC
    `);

    if (pendingOrders.length === 0) {
      console.log('⚠️  Không có đơn hàng nào cần duyệt (payment_status=PENDING, trang_thai=Chờ duyệt)\n');
      await connection.end();
      return;
    }

    console.log(`📋 Tìm thấy ${pendingOrders.length} đơn hàng cần duyệt:\n`);
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

    // Hỏi user muốn duyệt bao nhiêu đơn
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      readline.question(`Bạn muốn duyệt bao nhiêu đơn? (Enter = tất cả, hoặc nhập số): `, resolve);
    });
    readline.close();

    const count = answer.trim() === '' ? pendingOrders.length : Math.min(parseInt(answer) || 1, pendingOrders.length);
    const ordersToApprove = pendingOrders.slice(0, count);

    console.log(`\n🔄 Đang duyệt ${ordersToApprove.length} đơn hàng...\n`);

    let approved = 0;
    for (const order of ordersToApprove) {
      const transactionId = `TEST${Date.now()}_${order.ma_don_hang}`;
      
      await connection.query(`
        UPDATE don_hang 
        SET payment_status = 'PAID',
            paid_at = NOW(),
            transaction_id = ?,
            trang_thai = 'Đã duyệt',
            ngay_duyet = NOW()
        WHERE ma_don_hang = ?
      `, [transactionId, order.ma_don_hang]);

      approved++;
      console.log(`  ✅ Đơn #${order.ma_don_hang} - Sim ${order.so_sim} - ${Number(order.gia_mua).toLocaleString('vi-VN')}đ`);
    }

    console.log(`\n✅ Đã duyệt ${approved} đơn hàng thành công!\n`);

    // Verify
    console.log('🔍 VERIFY - Kiểm tra lại database:\n');
    const [verifyOrders] = await connection.query(`
      SELECT ma_don_hang, so_sim, payment_status, trang_thai, paid_at
      FROM don_hang 
      WHERE ma_don_hang IN (${ordersToApprove.map(o => o.ma_don_hang).join(',')})
      ORDER BY ma_don_hang DESC
    `);

    console.log('┌──────┬──────────────┬─────────────┬─────────────────┬─────────────────────┐');
    console.log('│ ID   │ SIM          │ STATUS      │ PAYMENT_STATUS  │ PAID_AT             │');
    console.log('├──────┼──────────────┼─────────────┼─────────────────┼─────────────────────┤');
    
    verifyOrders.forEach(order => {
      const id = String(order.ma_don_hang).padEnd(4);
      const sim = String(order.so_sim).padEnd(12);
      const status = String(order.trang_thai).padEnd(11);
      const paymentStatus = order.payment_status === 'PAID' ? '🟢 PAID' : '🟡 PENDING';
      const paidAt = order.paid_at ? new Date(order.paid_at).toLocaleString('vi-VN') : 'NULL';
      console.log(`│ ${id} │ ${sim} │ ${status} │ ${paymentStatus.padEnd(15)} │ ${paidAt.padEnd(19)} │`);
    });
    console.log('└──────┴──────────────┴─────────────┴─────────────────┴─────────────────────┘\n');

    console.log('================================================================================');
    console.log('✨ Hoàn tất!\n');
    console.log('📋 NEXT STEPS:');
    console.log('   1. Mở trình duyệt: http://localhost:3000/admin');
    console.log('   2. Click tab "Lịch sử mua sim"');
    console.log('   3. Kiểm tra các đơn đã duyệt có badge: 🟢 "Đã thanh toán"\n');
    console.log('💡 Nếu không thấy:');
    console.log('   - Reload trang (F5)');
    console.log('   - Check console.log trong browser (F12)\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

approveMultiplePayments();
