const mysql = require('mysql2/promise');

/**
 * Duyệt đơn hàng ID 11 (đơn test vừa tạo)
 */

async function approveOrder11() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('\n🔧 DUYỆT ĐƠN HÀNG ID 11 (Test Order)\n');
    console.log('='.repeat(80) + '\n');

    const orderId = 11;
    const transactionId = `MANUAL_${Date.now()}`;

    // Query trước khi update
    console.log('📊 BEFORE UPDATE:\n');
    const [before] = await connection.query(`
      SELECT 
        ma_don_hang, so_sim, trang_thai, 
        payment_status, paid_at, transaction_id
      FROM don_hang 
      WHERE ma_don_hang = ?
    `, [orderId]);

    if (before.length === 0) {
      console.log('❌ Không tìm thấy đơn hàng ID 11\n');
      return;
    }

    console.log('┌────────────────────┬──────────────────────────────┐');
    console.log('│ Field              │ Value                        │');
    console.log('├────────────────────┼──────────────────────────────┤');
    console.log(`│ Order ID           │ ${before[0].ma_don_hang.toString().padEnd(28)} │`);
    console.log(`│ Sim Number         │ ${before[0].so_sim.padEnd(28)} │`);
    console.log(`│ Order Status       │ ${before[0].trang_thai.padEnd(28)} │`);
    console.log(`│ Payment Status     │ ${(before[0].payment_status || 'NULL').padEnd(28)} │`);
    console.log(`│ Paid At            │ ${(before[0].paid_at || 'NULL').toString().padEnd(28)} │`);
    console.log(`│ Transaction ID     │ ${(before[0].transaction_id || 'NULL').toString().padEnd(28)} │`);
    console.log('└────────────────────┴──────────────────────────────┘\n');

    // UPDATE
    console.log('🔄 Executing UPDATE...\n');
    const [result] = await connection.query(`
      UPDATE don_hang 
      SET payment_status = 'PAID',
          paid_at = NOW(),
          transaction_id = ?,
          trang_thai = 'Đã duyệt',
          ngay_duyet = NOW()
      WHERE ma_don_hang = ?
    `, [transactionId, orderId]);

    console.log(`✅ Updated ${result.affectedRows} row(s)\n`);

    // Query sau khi update
    console.log('📊 AFTER UPDATE:\n');
    const [after] = await connection.query(`
      SELECT 
        ma_don_hang, so_sim, trang_thai, 
        payment_status, paid_at, transaction_id
      FROM don_hang 
      WHERE ma_don_hang = ?
    `, [orderId]);

    console.log('┌────────────────────┬──────────────────────────────┐');
    console.log('│ Field              │ Value                        │');
    console.log('├────────────────────┼──────────────────────────────┤');
    console.log(`│ Order ID           │ ${after[0].ma_don_hang.toString().padEnd(28)} │`);
    console.log(`│ Sim Number         │ ${after[0].so_sim.padEnd(28)} │`);
    console.log(`│ Order Status       │ ${after[0].trang_thai.padEnd(28)} │`);
    console.log(`│ Payment Status     │ ${(after[0].payment_status || 'NULL').padEnd(28)} │`);
    console.log(`│ Paid At            │ ${new Date(after[0].paid_at).toLocaleString('vi-VN').padEnd(28)} │`);
    console.log(`│ Transaction ID     │ ${after[0].transaction_id.substring(0, 28).padEnd(28)} │`);
    console.log('└────────────────────┴──────────────────────────────┘\n');

    // So sánh
    console.log('🔄 CHANGES:\n');
    console.log(`   payment_status: ${before[0].payment_status} → ${after[0].payment_status} ✅`);
    console.log(`   paid_at: NULL → ${new Date(after[0].paid_at).toLocaleString('vi-VN')} ✅`);
    console.log(`   transaction_id: NULL → ${after[0].transaction_id} ✅`);
    console.log(`   trang_thai: ${before[0].trang_thai} → ${after[0].trang_thai} ✅\n`);

    // Test API
    console.log('🌐 Testing API...\n');
    try {
      const apiRes = await fetch('http://localhost:5000/api/admin/purchases');
      const apiData = await apiRes.json();
      const order = apiData.data.find(o => o.id === orderId);

      if (order) {
        console.log(`✅ API trả về đơn #${orderId}:`);
        console.log(`   payment_status: ${order.payment_status}`);
        console.log(`   paid_at: ${order.paid_at}`);
        console.log(`   transaction_id: ${order.transaction_id}\n`);
      } else {
        console.log(`⚠️  Không tìm thấy đơn #${orderId} trong API\n`);
      }
    } catch (error) {
      console.log(`⚠️  API error: ${error.message}\n`);
    }

    console.log('='.repeat(80));
    console.log('\n✅ HOÀN TẤT!\n');
    console.log('📋 Next Steps:');
    console.log(`   1. Mở http://localhost:3000/admin`);
    console.log(`   2. Tìm đơn hàng ID: ${orderId}`);
    console.log(`   3. Verify badge: 🟢 "✓ Đã thanh toán"\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

approveOrder11();
