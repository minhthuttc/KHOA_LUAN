// Test PayOS webhook locally by simulating webhook call
const axios = require('axios');

async function testWebhook() {
  const orderId = process.argv[2];
  
  if (!orderId) {
    console.log('\n❌ Vui lòng cung cấp Order ID!');
    console.log('Usage: node test-webhook.js <orderId>');
    console.log('Example: node test-webhook.js 22');
    console.log('');
    console.log('💡 This simulates a PayOS webhook call');
    console.log('   Uses centralized handlePaymentSuccess() handler');
    console.log('   Automatically skips signature verification (TEST_ prefix)');
    process.exit(1);
  }
  
  console.log('\n🧪 === TESTING PAYOS WEBHOOK (SIMULATED) ===');
  console.log('🆔 Order ID:', orderId);
  console.log('📍 Source: test-webhook (signature verification bypassed)');
  console.log('');
  
  // Simulate PayOS webhook payload
  const webhookPayload = {
    code: '00',
    desc: 'Success',
    data: {
      orderCode: parseInt(orderId),
      amount: 1000000,
      description: `Test payment for order ${orderId}`,
      accountNumber: '1234567890',
      reference: 'TEST_' + Date.now(), // TEST_ prefix bypasses signature check
      transactionDateTime: new Date().toISOString(),
      paymentLinkId: 'test_webhook_' + Date.now()
    }
  };
  
  console.log('📤 Sending webhook payload to backend...');
  console.log('');
  
  try {
    console.log('🌐 Calling: POST http://localhost:5000/api/payos/webhook');
    const response = await axios.post('http://localhost:5000/api/payos/webhook', webhookPayload);
    
    console.log('\n✅ WEBHOOK CALL SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('');
    console.log('💡 What happened:');
    console.log('1. ✅ Webhook received by backend');
    console.log('2. ✅ Signature verification bypassed (TEST_ prefix)');
    console.log('3. ✅ handlePaymentSuccess() executed');
    console.log('4. ✅ Database updated: payment_status=PAID, paid_at=NOW()');
    console.log('5. ✅ SIM marked as "Đã bán"');
    console.log('');
    console.log('💡 Next steps:');
    console.log('1. Backend is now returning PAID status');
    console.log('2. Frontend polling should detect in ~3 seconds');
    console.log('3. Check browser console for:');
    console.log('   "🎉🎉🎉 PAID DETECTED!!!"');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ WEBHOOK CALL FAILED!');
    console.error('Error:', error.response?.data || error.message);
    console.error('');
    console.error('Debug steps:');
    console.error('1. Check if backend is running (localhost:5000)');
    console.error('2. Check backend console logs');
    console.error('3. Verify order exists in database');
  }
}

testWebhook();
