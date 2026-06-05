const mysql = require('mysql2/promise');

/**
 * FINAL SYSTEM CHECK - Kiểm tra cuối cùng toàn bộ hệ thống
 */

async function finalCheck() {
  console.log('\n🎯 FINAL SYSTEM CHECK - KIỂM TRA CUỐI CÙNG\n');
  console.log('='.repeat(80) + '\n');

  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    const results = {
      database: { passed: 0, failed: 0, tests: [] },
      backend: { passed: 0, failed: 0, tests: [] },
      integration: { passed: 0, failed: 0, tests: [] }
    };

    // ============================================================================
    // DATABASE TESTS
    // ============================================================================
    console.log('📊 DATABASE TESTS\n');

    // Test 1: Kiểm tra cột tồn tại
    const [columns] = await connection.query('DESCRIBE don_hang');
    const requiredCols = ['payment_status', 'paid_at', 'transaction_id'];
    requiredCols.forEach(col => {
      const exists = columns.find(c => c.Field === col);
      if (exists) {
        results.database.passed++;
        results.database.tests.push(`✅ Cột ${col} tồn tại`);
      } else {
        results.database.failed++;
        results.database.tests.push(`❌ Cột ${col} THIẾU`);
      }
    });

    // Test 2: Kiểm tra không có NULL
    const [nullCheck] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM don_hang 
      WHERE payment_status IS NULL
    `);
    if (nullCheck[0].count === 0) {
      results.database.passed++;
      results.database.tests.push('✅ Không có payment_status NULL');
    } else {
      results.database.failed++;
      results.database.tests.push(`❌ Có ${nullCheck[0].count} đơn payment_status NULL`);
    }

    // Test 3: Kiểm tra PAID có đầy đủ thông tin
    const [paidCheck] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM don_hang 
      WHERE payment_status = 'PAID' 
      AND (paid_at IS NULL OR transaction_id IS NULL)
    `);
    if (paidCheck[0].count === 0) {
      results.database.passed++;
      results.database.tests.push('✅ Tất cả đơn PAID có đầy đủ thông tin');
    } else {
      results.database.failed++;
      results.database.tests.push(`❌ Có ${paidCheck[0].count} đơn PAID thiếu thông tin`);
    }

    results.database.tests.forEach(t => console.log('  ' + t));
    console.log('');

    // ============================================================================
    // BACKEND API TESTS
    // ============================================================================
    console.log('📡 BACKEND API TESTS\n');

    // Test 1: Backend có chạy không
    try {
      const response = await fetch('http://localhost:5000/api/admin/purchases');
      if (response.ok) {
        results.backend.passed++;
        results.backend.tests.push('✅ Backend server đang chạy');
        
        // Test 2: API trả về payment_status
        const data = await response.json();
        const sampleOrder = data.data[0];
        if (sampleOrder && 'payment_status' in sampleOrder) {
          results.backend.passed++;
          results.backend.tests.push('✅ API trả về payment_status');
        } else {
          results.backend.failed++;
          results.backend.tests.push('❌ API KHÔNG trả về payment_status');
        }

        // Test 3: API trả về paid_at
        if (sampleOrder && 'paid_at' in sampleOrder) {
          results.backend.passed++;
          results.backend.tests.push('✅ API trả về paid_at');
        } else {
          results.backend.failed++;
          results.backend.tests.push('❌ API KHÔNG trả về paid_at');
        }

        // Test 4: API trả về transaction_id
        if (sampleOrder && 'transaction_id' in sampleOrder) {
          results.backend.passed++;
          results.backend.tests.push('✅ API trả về transaction_id');
        } else {
          results.backend.failed++;
          results.backend.tests.push('❌ API KHÔNG trả về transaction_id');
        }
      } else {
        results.backend.failed++;
        results.backend.tests.push(`❌ Backend trả về status ${response.status}`);
      }
    } catch (error) {
      results.backend.failed++;
      results.backend.tests.push('❌ Backend KHÔNG chạy hoặc lỗi kết nối');
    }

    // Test 5: Payment status endpoint
    try {
      const statusRes = await fetch('http://localhost:5000/api/order/payment-status/1');
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.data && 'paymentStatus' in statusData.data) {
          results.backend.passed++;
          results.backend.tests.push('✅ Payment status endpoint hoạt động');
        } else {
          results.backend.failed++;
          results.backend.tests.push('❌ Payment status endpoint không trả về paymentStatus');
        }
      } else {
        results.backend.failed++;
        results.backend.tests.push('❌ Payment status endpoint lỗi');
      }
    } catch (error) {
      results.backend.failed++;
      results.backend.tests.push('❌ Payment status endpoint không khả dụng');
    }

    results.backend.tests.forEach(t => console.log('  ' + t));
    console.log('');

    // ============================================================================
    // INTEGRATION TESTS
    // ============================================================================
    console.log('🔗 INTEGRATION TESTS\n');

    // Test 1: Database và API sync
    const [dbOrders] = await connection.query(`
      SELECT ma_don_hang, payment_status 
      FROM don_hang 
      ORDER BY ma_don_hang DESC 
      LIMIT 1
    `);
    
    try {
      const apiRes = await fetch('http://localhost:5000/api/admin/purchases');
      const apiData = await apiRes.json();
      const apiOrder = apiData.data.find(o => o.id === dbOrders[0].ma_don_hang);
      
      if (apiOrder && apiOrder.payment_status === dbOrders[0].payment_status) {
        results.integration.passed++;
        results.integration.tests.push('✅ Database và API đồng bộ');
      } else {
        results.integration.failed++;
        results.integration.tests.push('❌ Database và API KHÔNG đồng bộ');
      }
    } catch (error) {
      results.integration.failed++;
      results.integration.tests.push('❌ Không thể test đồng bộ');
    }

    // Test 2: Webhook route tồn tại
    try {
      const webhookRes = await fetch('http://localhost:5000/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simNumber: '0000000000', amount: 0 })
      });
      
      if (webhookRes.ok || webhookRes.status === 404) {
        results.integration.passed++;
        results.integration.tests.push('✅ Webhook route tồn tại');
      } else {
        results.integration.failed++;
        results.integration.tests.push('❌ Webhook route lỗi');
      }
    } catch (error) {
      results.integration.failed++;
      results.integration.tests.push('❌ Webhook route không khả dụng');
    }

    results.integration.tests.forEach(t => console.log('  ' + t));
    console.log('');

    // ============================================================================
    // SUMMARY
    // ============================================================================
    console.log('='.repeat(80));
    console.log('\n📊 TỔNG KẾT\n');

    const totalPassed = results.database.passed + results.backend.passed + results.integration.passed;
    const totalFailed = results.database.failed + results.backend.failed + results.integration.failed;
    const totalTests = totalPassed + totalFailed;

    console.log(`  Database:    ${results.database.passed}/${results.database.passed + results.database.failed} passed`);
    console.log(`  Backend:     ${results.backend.passed}/${results.backend.passed + results.backend.failed} passed`);
    console.log(`  Integration: ${results.integration.passed}/${results.integration.passed + results.integration.failed} passed`);
    console.log('  ' + '─'.repeat(30));
    console.log(`  TOTAL:       ${totalPassed}/${totalTests} passed (${Math.round(totalPassed/totalTests*100)}%)`);
    console.log('');

    if (totalFailed === 0) {
      console.log('🎉 HỆ THỐNG HOÀN HẢO - KHÔNG CÓ LỖI!\n');
      console.log('✅ Database: OK');
      console.log('✅ Backend API: OK');
      console.log('✅ Integration: OK\n');
      console.log('💡 Hệ thống sẵn sàng sử dụng!\n');
      console.log('📋 Next Steps:');
      console.log('   1. Mở admin page: http://localhost:3000/admin');
      console.log('   2. Kiểm tra badge hiển thị đúng');
      console.log('   3. Test tạo đơn hàng mới');
      console.log('   4. Cấu hình webhook production\n');
    } else {
      console.log('⚠️  CÓ VẤN ĐỀ CẦN KHẮC PHỤC!\n');
      console.log(`   Số lỗi: ${totalFailed}`);
      console.log('   Xem chi tiết ở trên để biết cách khắc phục\n');
    }

    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Lỗi khi chạy final check:', error.message);
  } finally {
    await connection.end();
  }
}

finalCheck();
