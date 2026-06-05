const mysql = require('mysql2/promise');

/**
 * Script nhanh: Duyệt 3 đơn hàng PENDING đầu tiên
 * Không cần nhập gì, chạy là duyệt ngay
 */

async function quickApprove() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('⚡ QUICK APPROVE - Duyệt nhanh 3 đơn hàng đầu\n');
    console.log('================================================================================\n');

    // Lấy 3 đơn hàng PENDING với trang_thai = 'Chờ duyệt'
    const [pendingOrders] = await connection.query(`
      SELECT ma_don_hang, so_sim, ten_khach_hang, gia_mua, phuong_thuc_thanh_toan
      FROM don_hang 
      WHERE payment_status = 'PENDING' AND trang_thai = 'Chờ duyệt'
      ORDER BY ma_don_hang DESC
      LIMIT 3
    `);

    if (pendingOrders.length === 0) {
      console.log('✅ Không có đơn hàng nào cần duyệt!\n');
      await connection.end();
      return;
    }

    console.log(`🎯 Tìm thấy ${pendingOrders.length} đơn hàng, đang duyệt...\n`);

    let approved = 0;
    for (const order of pendingOrders) {
      const transactionId = `AUTO${Date.now()}_${order.ma_don_hang}`;
      
      await connection.query(`
        UPDATE don_hang 
        SET payment_status = 'PAID',
            paid_at = NOW(),
            transaction_id = ?,
            trang_thai = 'Đã duyệt',
            ngay_duyet = NOW()
        WHERE ma_don_hang = ?
      `, [transactionId, order.ma_don_hang]);

      const method = order.phuong_thuc_thanh_toan === 'bank_transfer' ? '💳 Chuyển khoản' : '💵 COD';
      console.log(`  ✅ #${order.ma_don_hang} | ${order.so_sim} | ${Number(order.gia_mua).toLocaleString('vi-VN')}đ | ${method}`);
      approved++;
    }

    console.log(`\n🎉 Đã duyệt ${approved}/${pendingOrders.length} đơn hàng!\n`);
    
    // Verify
    const orderIds = pendingOrders.map(o => o.ma_don_hang).join(',');
    const [results] = await connection.query(`
      SELECT 
        ma_don_hang as id,
        so_sim,
        payment_status,
        trang_thai as status,
        DATE_FORMAT(paid_at, '%H:%i:%s') as paid_time
      FROM don_hang 
      WHERE ma_don_hang IN (${orderIds})
    `);

    console.log('📊 Kết quả:\n');
    results.forEach(r => {
      const badge = r.payment_status === 'PAID' ? '🟢' : '🟡';
      console.log(`  ${badge} Đơn #${r.id}: ${r.so_sim} - ${r.status} - Thanh toán: ${r.payment_status} (${r.paid_time})`);
    });

    console.log('\n================================================================================');
    console.log('✨ Hoàn tất!\n');
    console.log('🌐 Mở admin page để xem: http://localhost:3000/admin\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

quickApprove();
