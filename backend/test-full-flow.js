// Test full payment flow from webhook to frontend polling
const axios = require('axios');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'Thu2220403',
  database: 'ai_sim_db'
});

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testFullFlow() {
  const orderId = process.argv[2];
  
  if (!orderId) {
    console.log('\n❌ Vui lòng cung cấp Order ID!');
    console.log('Usage: node test-full-flow.js <orderId>');
    console.log('Example: node test-full-flow.js 29');
    console.log('');
    process.exit(1);
  }
  
  console.log('\n🧪 === TESTING FULL PAYMENT FLOW ===');
  console.log('🆔 Order ID:', orderId);
  console.log('');
  
  try {
    // Step 1: Check initial state
    console.log('📊 STEP 1: Checking initial state...');
    const [beforeOrders] = await pool.query(
      'SELECT ma_don_hang, payment_status, paid_at, transaction_id FROM don_hang WHERE ma_don_hang = ?',
      [orderId]
    );
    
    if (beforeOrders.length === 0) {
      console.error('❌ Order not found:', orderId);
      process.exit(1);
    }
    
    const before = beforeOrders[0];
    console.log('BEFORE state:');
    console.table({
      order_id: before.ma_don_hang,
      payment_status: before.payment_status,
      paid_at: before.paid_at,
      transaction_id: before.transaction_id
    });
    
    if (before.payment_status === 'PAID') {
      console.log('⚠️  Order already PAID. Nothing to test.');
      process.exit(0);
    }
    
    console.log('');
    
    // Step 2: Simulate webhook
    console.log('📊 STEP 2: Simulating PayOS webhook...');
    const webhookPayload = {
      code: '00',
      desc: 'Success',
      data: {
        orderCode: parseInt(orderId),
        amount: 1000000,
        description: `Test payment for order ${orderId}`,
        accountNumber: '1234567890',
        reference: 'TEST_FLOW_' + Date.now(),
        transactionDateTime: new Date().toISOString(),
        paymentLinkId: 'test_full_flow_' + Date.now()
      }
    };
    
    const webhookResponse = await axios.post('http://localhost:5000/api/payos/webhook', webhookPayload);
    
    if (webhookResponse.data.success) {
      console.log('✅ Webhook processed successfully');
    } else {
      console.error('❌ Webhook failed:', webhookResponse.data);
      process.exit(1);
    }
    
    console.log('');
    
    // Step 3: Wait a bit for database update
    console.log('📊 STEP 3: Waiting for database update...');
    await sleep(500);
    console.log('');
    
    // Step 4: Check database after webhook
    console.log('📊 STEP 4: Checking database after webhook...');
    const [afterOrders] = await pool.query(
      'SELECT ma_don_hang, payment_status, paid_at, transaction_id, trang_thai FROM don_hang WHERE ma_don_hang = ?',
      [orderId]
    );
    
    const after = afterOrders[0];
    console.log('AFTER webhook state:');
    console.table({
      order_id: after.ma_don_hang,
      payment_status: after.payment_status,
      order_status: after.trang_thai,
      paid_at: after.paid_at,
      transaction_id: after.transaction_id
    });
    
    console.log('');
    
    // Step 5: Test frontend polling API
    console.log('📊 STEP 5: Testing frontend polling API...');
    const pollingResponse = await axios.get(`http://localhost:5000/api/order/payment-status/${orderId}`);
    
    console.log('Polling API response:');
    console.log(JSON.stringify(pollingResponse.data, null, 2));
    
    console.log('');
    
    // Step 6: Verify results
    console.log('📊 STEP 6: Verifying results...');
    console.log('');
    
    const checks = {
      'Database payment_status = PAID': after.payment_status === 'PAID',
      'Database paid_at is set': after.paid_at !== null,
      'Database trang_thai = "Đã duyệt"': after.trang_thai === 'Đã duyệt',
      'API returns success: true': pollingResponse.data.success === true,
      'API returns paymentStatus: PAID': pollingResponse.data.data.paymentStatus === 'PAID',
      'API returns paidAt (not null)': pollingResponse.data.data.paidAt !== null
    };
    
    console.log('✅ Verification Results:');
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    console.log('');
    
    const allPassed = Object.values(checks).every(v => v === true);
    
    if (allPassed) {
      console.log('🎉🎉🎉 ALL TESTS PASSED! 🎉🎉🎉');
      console.log('');
      console.log('💡 Frontend polling should now:');
      console.log('   1. Detect paymentStatus = "PAID"');
      console.log('   2. Close QR modal');
      console.log('   3. Open Success modal');
      console.log('   4. Show alert "Thanh toán thành công"');
      console.log('   5. Redirect after 3 seconds');
      console.log('');
      console.log('👉 Open browser and check frontend console logs!');
    } else {
      console.log('❌ SOME TESTS FAILED!');
      console.log('');
      console.log('Debug steps:');
      console.log('1. Check backend console logs');
      console.log('2. Check database manually');
      console.log('3. Verify webhook code is correct');
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED WITH ERROR:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  } finally {
    await pool.end();
  }
}

testFullFlow();
