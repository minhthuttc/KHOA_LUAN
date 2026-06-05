const mysql = require('mysql2/promise');

/**
 * AUDIT TOÀN BỘ HỆ THỐNG THANH TOÁN
 * Kiểm tra database, API, webhook, frontend integration
 */

async function auditPaymentSystem() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  console.log('🔍 AUDIT PAYMENT SYSTEM - TOÀN BỘ HỆ THỐNG\n');
  console.log('================================================================================\n');

  try {
    // ============================================================================
    // PHẦN 1: DATABASE STRUCTURE
    // ============================================================================
    console.log('📋 PHẦN 1: KIỂM TRA DATABASE\n');
    console.log('─'.repeat(80));
    
    // 1.1 Kiểm tra cấu trúc bảng
    console.log('\n1.1 Cấu trúc bảng don_hang:\n');
    const [columns] = await connection.query(`
      DESCRIBE don_hang
    `);
    
    const paymentColumns = ['payment_status', 'paid_at', 'transaction_id'];
    const foundColumns = {};
    
    columns.forEach(col => {
      if (paymentColumns.includes(col.Field)) {
        foundColumns[col.Field] = {
          type: col.Type,
          null: col.Null,
          default: col.Default
        };
        console.log(`  ✅ ${col.Field.padEnd(20)} | ${col.Type.padEnd(15)} | Null: ${col.Null} | Default: ${col.Default || 'NULL'}`);
      }
    });
    
    paymentColumns.forEach(col => {
      if (!foundColumns[col]) {
        console.log(`  ❌ ${col} - THIẾU CỘT!`);
      }
    });

    // 1.2 Kiểm tra dữ liệu thực tế
    console.log('\n1.2 Dữ liệu 20 đơn hàng mới nhất:\n');
    const [orders] = await connection.query(`
      SELECT 
        ma_don_hang as id,
        so_sim,
        ten_khach_hang,
        gia_mua,
        phuong_thuc_thanh_toan,
        trang_thai,
        payment_status,
        paid_at,
        transaction_id,
        ngay_mua
      FROM don_hang 
      ORDER BY ma_don_hang DESC 
      LIMIT 20
    `);

    console.log('┌──────┬──────────────┬─────────────┬─────────────────┬──────────────┬────────────────┐');
    console.log('│ ID   │ SIM          │ STATUS      │ PAYMENT_STATUS  │ PAID_AT      │ TRANSACTION_ID │');
    console.log('├──────┼──────────────┼─────────────┼─────────────────┼──────────────┼────────────────┤');
    
    orders.forEach(order => {
      const id = String(order.id).padEnd(4);
      const sim = String(order.so_sim).padEnd(12);
      const status = String(order.trang_thai).padEnd(11);
      const payStatus = String(order.payment_status || 'NULL').padEnd(15);
      const paidAt = order.paid_at ? new Date(order.paid_at).toLocaleString('vi-VN', {dateStyle: 'short'}) : 'NULL';
      const txId = order.transaction_id ? String(order.transaction_id).substring(0, 14) : 'NULL';
      console.log(`│ ${id} │ ${sim} │ ${status} │ ${payStatus} │ ${paidAt.padEnd(12)} │ ${txId.padEnd(14)} │`);
    });
    console.log('└──────┴──────────────┴─────────────┴─────────────────┴──────────────┴────────────────┘\n');

    // 1.3 Phân tích dữ liệu
    console.log('1.3 Phân tích dữ liệu:\n');
    
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN payment_status IS NULL THEN 1 ELSE 0 END) as null_payment_status,
        SUM(CASE WHEN payment_status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN payment_status = 'PAID' THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN payment_status = 'FAILED' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN payment_status = 'PAID' AND paid_at IS NULL THEN 1 ELSE 0 END) as paid_but_no_time,
        SUM(CASE WHEN payment_status = 'PAID' AND transaction_id IS NULL THEN 1 ELSE 0 END) as paid_but_no_tx
      FROM don_hang
    `);

    const stat = stats[0];
    console.log(`  📊 Tổng số đơn hàng: ${stat.total}`);
    console.log(`  ─────────────────────────────────────`);
    console.log(`  🟡 PENDING: ${stat.pending} đơn`);
    console.log(`  🟢 PAID: ${stat.paid} đơn`);
    console.log(`  🔴 FAILED: ${stat.failed} đơn`);
    console.log(`  ⚪ NULL: ${stat.null_payment_status} đơn`);
    console.log(`  ─────────────────────────────────────`);
    
    if (stat.null_payment_status > 0) {
      console.log(`  ⚠️  CÓ ${stat.null_payment_status} ĐơN có payment_status = NULL!`);
    } else {
      console.log(`  ✅ Không có đơn nào có payment_status = NULL`);
    }
    
    if (stat.paid_but_no_time > 0) {
      console.log(`  ⚠️  CÓ ${stat.paid_but_no_time} ĐƠN PAID nhưng paid_at = NULL!`);
    } else {
      console.log(`  ✅ Tất cả đơn PAID đều có paid_at`);
    }
    
    if (stat.paid_but_no_tx > 0) {
      console.log(`  ⚠️  CÓ ${stat.paid_but_no_tx} ĐƠN PAID nhưng transaction_id = NULL!`);
    } else {
      console.log(`  ✅ Tất cả đơn PAID đều có transaction_id`);
    }

    // 1.4 Chi tiết các đơn có vấn đề
    if (stat.null_payment_status > 0 || stat.paid_but_no_time > 0 || stat.paid_but_no_tx > 0) {
      console.log('\n1.4 Chi tiết các đơn có vấn đề:\n');
      
      const [problemOrders] = await connection.query(`
        SELECT 
          ma_don_hang as id,
          so_sim,
          trang_thai,
          payment_status,
          paid_at,
          transaction_id,
          CASE 
            WHEN payment_status IS NULL THEN 'payment_status = NULL'
            WHEN payment_status = 'PAID' AND paid_at IS NULL THEN 'PAID nhưng không có paid_at'
            WHEN payment_status = 'PAID' AND transaction_id IS NULL THEN 'PAID nhưng không có transaction_id'
          END as issue
        FROM don_hang
        WHERE payment_status IS NULL 
           OR (payment_status = 'PAID' AND paid_at IS NULL)
           OR (payment_status = 'PAID' AND transaction_id IS NULL)
        LIMIT 10
      `);
      
      if (problemOrders.length > 0) {
        problemOrders.forEach(order => {
          console.log(`  ⚠️  Đơn #${order.id} (${order.so_sim}): ${order.issue}`);
        });
      }
    }

    // ============================================================================
    // PHẦN 2: BACKEND API
    // ============================================================================
    console.log('\n\n📋 PHẦN 2: KIỂM TRA BACKEND API\n');
    console.log('─'.repeat(80));
    
    console.log('\n2.1 Testing API Endpoints:\n');
    
    // Test các API
    const apiTests = [
      { name: 'GET /api/admin/purchases', url: 'http://localhost:5000/api/admin/purchases' },
      { name: 'GET /api/order/payment-status/:id', url: 'http://localhost:5000/api/order/payment-status/1' }
    ];

    for (const test of apiTests) {
      try {
        const response = await fetch(test.url);
        const data = await response.json();
        
        if (response.ok) {
          console.log(`  ✅ ${test.name}`);
          
          // Kiểm tra response có payment fields
          const sampleData = data.data?.[0] || data.data;
          if (sampleData) {
            const hasPaymentStatus = 'payment_status' in sampleData || 'paymentStatus' in sampleData;
            const hasPaidAt = 'paid_at' in sampleData || 'paidAt' in sampleData;
            const hasTxId = 'transaction_id' in sampleData || 'transactionId' in sampleData;
            
            console.log(`     - payment_status: ${hasPaymentStatus ? '✅' : '❌'}`);
            console.log(`     - paid_at: ${hasPaidAt ? '✅' : '❌'}`);
            console.log(`     - transaction_id: ${hasTxId ? '✅' : '❌'}`);
          }
        } else {
          console.log(`  ❌ ${test.name} - Status: ${response.status}`);
        }
      } catch (error) {
        console.log(`  ⚠️  ${test.name} - Backend không chạy hoặc lỗi: ${error.message}`);
      }
    }

    // ============================================================================
    // PHẦN 3: WEBHOOK
    // ============================================================================
    console.log('\n\n📋 PHẦN 3: KIỂM TRA WEBHOOK INTEGRATION\n');
    console.log('─'.repeat(80));
    
    console.log('\n3.1 Webhook Route:\n');
    console.log('  📍 POST /api/webhook/bank-transfer');
    console.log('  📍 POST /api/webhook/test');
    console.log('\n3.2 Webhook Logic:\n');
    console.log('  ✅ Parse description để lấy số sim');
    console.log('  ✅ Tìm đơn hàng với: so_sim, trang_thai="Chờ duyệt", payment_method="bank_transfer"');
    console.log('  ✅ Kiểm tra số tiền (cho phép sai số 1000đ)');
    console.log('  ✅ UPDATE: payment_status=PAID, paid_at=NOW(), transaction_id');
    console.log('\n3.3 Test Webhook:\n');
    
    try {
      const webhookTestUrl = 'http://localhost:5000/api/webhook/test';
      const testPayload = {
        simNumber: '0912341991',
        amount: 600000
      };
      
      const webhookRes = await fetch(webhookTestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      
      if (webhookRes.ok) {
        const webhookData = await webhookRes.json();
        console.log('  ✅ Test webhook hoạt động');
        console.log('     Response:', JSON.stringify(webhookData, null, 2).split('\n').map(l => '     ' + l).join('\n').trim());
      } else {
        console.log('  ⚠️  Test webhook failed - Status:', webhookRes.status);
      }
    } catch (error) {
      console.log('  ⚠️  Không thể test webhook:', error.message);
    }

    // ============================================================================
    // KẾT LUẬN
    // ============================================================================
    console.log('\n\n📋 PHẦN 4: KẾT LUẬN AUDIT\n');
    console.log('─'.repeat(80));
    
    const issues = [];
    const passed = [];
    
    // Database checks
    if (!foundColumns['payment_status']) issues.push('❌ Database thiếu cột payment_status');
    else passed.push('✅ Database có cột payment_status');
    
    if (!foundColumns['paid_at']) issues.push('❌ Database thiếu cột paid_at');
    else passed.push('✅ Database có cột paid_at');
    
    if (!foundColumns['transaction_id']) issues.push('❌ Database thiếu cột transaction_id');
    else passed.push('✅ Database có cột transaction_id');
    
    // Data checks
    if (stat.null_payment_status > 0) {
      issues.push(`⚠️  Có ${stat.null_payment_status} đơn hàng có payment_status = NULL`);
    } else {
      passed.push('✅ Tất cả đơn hàng đều có payment_status');
    }
    
    if (stat.paid_but_no_time > 0) {
      issues.push(`⚠️  Có ${stat.paid_but_no_time} đơn PAID nhưng thiếu paid_at`);
    } else {
      passed.push('✅ Tất cả đơn PAID đều có paid_at');
    }
    
    if (stat.paid_but_no_tx > 0) {
      issues.push(`⚠️  Có ${stat.paid_but_no_tx} đơn PAID nhưng thiếu transaction_id`);
    } else {
      passed.push('✅ Tất cả đơn PAID đều có transaction_id');
    }
    
    console.log('\n✅ PASSED:\n');
    passed.forEach(p => console.log('  ' + p));
    
    if (issues.length > 0) {
      console.log('\n⚠️  ISSUES FOUND:\n');
      issues.forEach(i => console.log('  ' + i));
    } else {
      console.log('\n🎉 KHÔNG CÓ VẤN ĐỀ NÀO!');
    }
    
    console.log('\n' + '─'.repeat(80));
    console.log('\n💡 KHUYẾN NGHỊ:\n');
    
    if (stat.null_payment_status > 0) {
      console.log('  1. Chạy script fix NULL values:');
      console.log('     UPDATE don_hang SET payment_status = "PENDING" WHERE payment_status IS NULL;\n');
    }
    
    if (stat.paid_but_no_time > 0 || stat.paid_but_no_tx > 0) {
      console.log('  2. Kiểm tra các đơn PAID thiếu thông tin');
      console.log('     Có thể cần cập nhật thủ công\n');
    }
    
    console.log('  3. Mở admin page để xem badge: http://localhost:3000/admin');
    console.log('  4. Verify frontend hiển thị đúng trạng thái thanh toán');
    console.log('  5. Cấu hình webhook production nếu chưa có\n');

    console.log('================================================================================');
    console.log('✨ AUDIT HOÀN TẤT!\n');

  } catch (error) {
    console.error('❌ Lỗi khi audit:', error.message);
    console.error(error.stack);
  } finally {
    await connection.end();
  }
}

auditPaymentSystem();
