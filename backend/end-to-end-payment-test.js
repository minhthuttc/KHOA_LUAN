const mysql = require('mysql2/promise');

/**
 * END-TO-END PAYMENT TEST - VERIFY THỰC TẾ
 * Tạo đơn hàng → Webhook → Verify toàn bộ
 */

async function endToEndTest() {
  console.log('\n🔬 END-TO-END PAYMENT TEST - VERIFY THỰC TẾ\n');
  console.log('='.repeat(80) + '\n');

  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  const testResults = {
    orderId: null,
    simNumber: null,
    beforeData: null,
    afterData: null,
    apiResponse: null,
    webhookResponse: null,
    passed: [],
    failed: []
  };

  try {
    // ============================================================================
    // STEP 1: TẠO ĐƠN HÀNG TEST MỚI
    // ============================================================================
    console.log('📝 STEP 1: TẠO ĐƠN HÀNG TEST MỚI\n');
    
    const testSimNumber = '0999888777'; // Sim test
    const testPrice = 500000;
    const testUserId = 1;
    const testUserName = 'Test User';

    // Tạo đơn hàng mới
    const [insertResult] = await connection.query(`
      INSERT INTO don_hang (
        ma_nguoi_dung, 
        ten_nguoi_dung, 
        so_sim, 
        nha_mang, 
        gia_mua, 
        loai_sim,
        ten_khach_hang,
        sdt_khach_hang,
        dia_chi_khach_hang,
        phuong_thuc_thanh_toan,
        trang_thai,
        payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      testUserId,
      testUserName,
      testSimNumber,
      'Viettel',
      testPrice,
      'Sim test',
      'Khách hàng test',
      '0912345678',
      'Địa chỉ test',
      'bank_transfer',
      'Chờ duyệt',
      'PENDING'
    ]);

    testResults.orderId = insertResult.insertId;
    testResults.simNumber = testSimNumber;

    console.log('✅ Đã tạo đơn hàng test:');
    console.log(`   Order ID: ${testResults.orderId}`);
    console.log(`   Sim Number: ${testResults.simNumber}`);
    console.log(`   Price: ${testPrice.toLocaleString('vi-VN')}đ`);
    console.log(`   Payment Method: Chuyển khoản`);
    console.log(`   Initial Status: PENDING\n`);

    testResults.passed.push('✅ Tạo đơn hàng test thành công');

    // ============================================================================
    // STEP 2: QUERY DATABASE TRƯỚC KHI WEBHOOK
    // ============================================================================
    console.log('📊 STEP 2: QUERY DATABASE - TRƯỚC KHI WEBHOOK\n');

    const [beforeOrders] = await connection.query(`
      SELECT 
        ma_don_hang as id,
        so_sim,
        gia_mua,
        trang_thai,
        payment_status,
        paid_at,
        transaction_id,
        ngay_mua
      FROM don_hang 
      WHERE ma_don_hang = ?
    `, [testResults.orderId]);

    testResults.beforeData = beforeOrders[0];

    console.log('┌────────────────────┬─────────────────────────────────────────┐');
    console.log('│ Field              │ Value (BEFORE WEBHOOK)                  │');
    console.log('├────────────────────┼─────────────────────────────────────────┤');
    console.log(`│ Order ID           │ ${String(testResults.beforeData.id).padEnd(39)} │`);
    console.log(`│ Sim Number         │ ${String(testResults.beforeData.so_sim).padEnd(39)} │`);
    console.log(`│ Price              │ ${String(testResults.beforeData.gia_mua).padEnd(39)} │`);
    console.log(`│ Order Status       │ ${String(testResults.beforeData.trang_thai).padEnd(39)} │`);
    console.log(`│ ⭐ payment_status  │ ${String(testResults.beforeData.payment_status || 'NULL').padEnd(39)} │`);
    console.log(`│ ⭐ paid_at         │ ${String(testResults.beforeData.paid_at || 'NULL').padEnd(39)} │`);
    console.log(`│ ⭐ transaction_id  │ ${String(testResults.beforeData.transaction_id || 'NULL').padEnd(39)} │`);
    console.log('└────────────────────┴─────────────────────────────────────────┘\n');

    if (testResults.beforeData.payment_status === 'PENDING') {
      testResults.passed.push('✅ Đơn hàng ban đầu có payment_status = PENDING');
    } else {
      testResults.failed.push(`❌ payment_status ban đầu = ${testResults.beforeData.payment_status} (Expected: PENDING)`);
    }

    // ============================================================================
    // STEP 3: MÔ PHỎNG WEBHOOK TỪ NGÂN HÀNG
    // ============================================================================
    console.log('🔔 STEP 3: MÔ PHỎNG WEBHOOK TỪ NGÂN HÀNG\n');

    const webhookPayload = {
      transactionId: `E2E_TEST_${Date.now()}`,
      amount: testPrice,
      description: `MUA SO ${testSimNumber}`,
      accountNumber: '1025311193',
      transactionDate: new Date().toISOString(),
      bankCode: 'VCB'
    };

    console.log('📤 Webhook Payload:');
    console.log(JSON.stringify(webhookPayload, null, 2));
    console.log('');

    try {
      const webhookRes = await fetch('http://localhost:5000/api/webhook/bank-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload)
      });

      const webhookData = await webhookRes.json();
      testResults.webhookResponse = webhookData;

      console.log('📥 Webhook Response:');
      console.log(`   Status: ${webhookRes.status}`);
      console.log(`   Success: ${webhookData.success}`);
      console.log(`   Message: ${webhookData.message}`);
      if (webhookData.orderId) {
        console.log(`   Order ID: ${webhookData.orderId}`);
      }
      console.log('');

      if (webhookData.success) {
        testResults.passed.push('✅ Webhook xử lý thành công');
      } else {
        testResults.failed.push(`⚠️  Webhook không thành công: ${webhookData.message}`);
      }
    } catch (error) {
      testResults.failed.push(`❌ Webhook error: ${error.message}`);
      console.error('❌ Webhook error:', error.message);
    }

    // Đợi 1 giây để đảm bảo database đã update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ============================================================================
    // STEP 4: QUERY DATABASE SAU KHI WEBHOOK
    // ============================================================================
    console.log('📊 STEP 4: QUERY DATABASE - SAU KHI WEBHOOK\n');

    const [afterOrders] = await connection.query(`
      SELECT 
        ma_don_hang as id,
        so_sim,
        gia_mua,
        trang_thai,
        payment_status,
        paid_at,
        transaction_id,
        ngay_mua
      FROM don_hang 
      WHERE ma_don_hang = ?
    `, [testResults.orderId]);

    testResults.afterData = afterOrders[0];

    console.log('┌────────────────────┬─────────────────────────────────────────┐');
    console.log('│ Field              │ Value (AFTER WEBHOOK)                   │');
    console.log('├────────────────────┼─────────────────────────────────────────┤');
    console.log(`│ Order ID           │ ${String(testResults.afterData.id).padEnd(39)} │`);
    console.log(`│ Sim Number         │ ${String(testResults.afterData.so_sim).padEnd(39)} │`);
    console.log(`│ Price              │ ${String(testResults.afterData.gia_mua).padEnd(39)} │`);
    console.log(`│ Order Status       │ ${String(testResults.afterData.trang_thai).padEnd(39)} │`);
    console.log(`│ ⭐ payment_status  │ ${String(testResults.afterData.payment_status || 'NULL').padEnd(39)} │`);
    console.log(`│ ⭐ paid_at         │ ${String(testResults.afterData.paid_at ? new Date(testResults.afterData.paid_at).toLocaleString('vi-VN') : 'NULL').padEnd(39)} │`);
    console.log(`│ ⭐ transaction_id  │ ${String(testResults.afterData.transaction_id || 'NULL').substring(0, 39).padEnd(39)} │`);
    console.log('└────────────────────┴─────────────────────────────────────────┘\n');

    // ============================================================================
    // STEP 5: SO SÁNH TRƯỚC VÀ SAU
    // ============================================================================
    console.log('🔄 STEP 5: SO SÁNH TRƯỚC VÀ SAU WEBHOOK\n');

    console.log('┌────────────────────┬─────────────┬─────────────┬──────────┐');
    console.log('│ Field              │ BEFORE      │ AFTER       │ Changed? │');
    console.log('├────────────────────┼─────────────┼─────────────┼──────────┤');
    
    const compareFields = [
      { field: 'payment_status', before: testResults.beforeData.payment_status, after: testResults.afterData.payment_status },
      { field: 'paid_at', before: testResults.beforeData.paid_at || 'NULL', after: testResults.afterData.paid_at ? 'SET' : 'NULL' },
      { field: 'transaction_id', before: testResults.beforeData.transaction_id || 'NULL', after: testResults.afterData.transaction_id ? 'SET' : 'NULL' },
      { field: 'trang_thai', before: testResults.beforeData.trang_thai, after: testResults.afterData.trang_thai }
    ];

    compareFields.forEach(({ field, before, after }) => {
      const changed = String(before) !== String(after) ? '✅ YES' : '⚪ NO';
      console.log(`│ ${field.padEnd(18)} │ ${String(before).padEnd(11)} │ ${String(after).padEnd(11)} │ ${changed.padEnd(8)} │`);
    });
    console.log('└────────────────────┴─────────────┴─────────────┴──────────┘\n');

    // Verify changes
    if (testResults.afterData.payment_status === 'PAID') {
      testResults.passed.push('✅ payment_status chuyển PENDING → PAID');
    } else {
      testResults.failed.push(`❌ payment_status = ${testResults.afterData.payment_status} (Expected: PAID)`);
    }

    if (testResults.afterData.paid_at) {
      testResults.passed.push('✅ paid_at được cập nhật');
    } else {
      testResults.failed.push('❌ paid_at vẫn NULL');
    }

    if (testResults.afterData.transaction_id) {
      testResults.passed.push('✅ transaction_id được cập nhật');
    } else {
      testResults.failed.push('❌ transaction_id vẫn NULL');
    }

    // ============================================================================
    // STEP 6: TEST API ENDPOINTS
    // ============================================================================
    console.log('🌐 STEP 6: TEST API ENDPOINTS\n');

    // Test API /api/admin/purchases
    try {
      console.log('📡 Testing: GET /api/admin/purchases\n');
      const apiRes = await fetch('http://localhost:5000/api/admin/purchases');
      const apiData = await apiRes.json();
      
      const ourOrder = apiData.data.find(o => o.id === testResults.orderId);
      
      if (ourOrder) {
        console.log('✅ Tìm thấy đơn hàng trong API response');
        console.log(`   Order ID: ${ourOrder.id}`);
        console.log(`   payment_status: ${ourOrder.payment_status}`);
        console.log(`   paid_at: ${ourOrder.paid_at || 'NULL'}`);
        console.log(`   transaction_id: ${ourOrder.transaction_id || 'NULL'}`);
        console.log('');
        
        if (ourOrder.payment_status === 'PAID') {
          testResults.passed.push('✅ API /api/admin/purchases trả về payment_status = PAID');
        } else {
          testResults.failed.push(`❌ API trả về payment_status = ${ourOrder.payment_status}`);
        }

        testResults.apiResponse = ourOrder;
      } else {
        testResults.failed.push('❌ Không tìm thấy đơn hàng trong API response');
      }
    } catch (error) {
      testResults.failed.push(`❌ API /api/admin/purchases error: ${error.message}`);
    }

    // Test API /api/order/payment-status/:id
    try {
      console.log(`📡 Testing: GET /api/order/payment-status/${testResults.orderId}\n`);
      const statusRes = await fetch(`http://localhost:5000/api/order/payment-status/${testResults.orderId}`);
      const statusData = await statusRes.json();
      
      if (statusData.success && statusData.data) {
        console.log('✅ API payment-status hoạt động');
        console.log(`   paymentStatus: ${statusData.data.paymentStatus}`);
        console.log(`   paidAt: ${statusData.data.paidAt || 'NULL'}`);
        console.log(`   transactionId: ${statusData.data.transactionId || 'NULL'}`);
        console.log('');
        
        if (statusData.data.paymentStatus === 'PAID') {
          testResults.passed.push('✅ API /api/order/payment-status trả về PAID');
        } else {
          testResults.failed.push(`❌ API trả về paymentStatus = ${statusData.data.paymentStatus}`);
        }
      } else {
        testResults.failed.push('❌ API /api/order/payment-status không trả về data');
      }
    } catch (error) {
      testResults.failed.push(`❌ API /api/order/payment-status error: ${error.message}`);
    }

    // ============================================================================
    // STEP 7: SUMMARY & EVIDENCE
    // ============================================================================
    console.log('='.repeat(80));
    console.log('\n📋 SUMMARY - KẾT QUẢ TEST\n');

    console.log('🎯 TEST ORDER INFORMATION:');
    console.log(`   Order ID: ${testResults.orderId}`);
    console.log(`   Sim Number: ${testResults.simNumber}`);
    console.log(`   Price: ${testPrice.toLocaleString('vi-VN')}đ`);
    console.log('');

    console.log('📊 DATABASE EVIDENCE:');
    console.log(`   BEFORE: payment_status = ${testResults.beforeData.payment_status}`);
    console.log(`   AFTER:  payment_status = ${testResults.afterData.payment_status}`);
    console.log(`   RESULT: ${testResults.beforeData.payment_status} → ${testResults.afterData.payment_status} ✅`);
    console.log('');

    console.log('🌐 API EVIDENCE:');
    if (testResults.apiResponse) {
      console.log(`   GET /api/admin/purchases → payment_status = ${testResults.apiResponse.payment_status} ✅`);
    }
    console.log('');

    console.log('✅ PASSED TESTS:');
    testResults.passed.forEach(p => console.log('   ' + p));
    console.log('');

    if (testResults.failed.length > 0) {
      console.log('❌ FAILED TESTS:');
      testResults.failed.forEach(f => console.log('   ' + f));
      console.log('');
    }

    const totalTests = testResults.passed.length + testResults.failed.length;
    const passRate = Math.round((testResults.passed.length / totalTests) * 100);

    console.log('='.repeat(80));
    console.log(`\n📊 TEST SCORE: ${testResults.passed.length}/${totalTests} (${passRate}%)\n`);

    if (testResults.failed.length === 0) {
      console.log('🎉 END-TO-END TEST: PASS ✅\n');
      console.log('✅ DATABASE: PENDING → PAID ✓');
      console.log('✅ WEBHOOK: Hoạt động chính xác ✓');
      console.log('✅ API: Trả về PAID ✓');
      console.log('✅ INTEGRATION: Hoàn hảo ✓\n');
      console.log('💡 Bước tiếp theo:');
      console.log(`   1. Mở http://localhost:3000/admin`);
      console.log(`   2. Tìm đơn hàng ID: ${testResults.orderId}`);
      console.log(`   3. Verify badge hiển thị: 🟢 "✓ Đã thanh toán"\n`);
    } else {
      console.log('⚠️  END-TO-END TEST: FAIL ❌\n');
      console.log(`   Có ${testResults.failed.length} test thất bại`);
      console.log('   Xem chi tiết ở trên\n');
    }

    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error.stack);
  } finally {
    await connection.end();
  }
}

endToEndTest();
