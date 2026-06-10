// Test PayOS QR code response format
const payosService = require('./services/payosService');

async function testPayOSQR() {
  console.log('🔷 Testing PayOS QR Code Format...\n');
  
  try {
    const testOrder = {
      orderId: 999999,
      orderCode: 999999,
      amount: 100000,
      description: 'Test order',
      buyerName: 'Test User',
      buyerPhone: '0123456789'
    };
    
    console.log('📤 Creating payment link with test data...');
    const result = await payosService.createPaymentLink(testOrder);
    
    console.log('\n✅ PayOS Response:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n📊 Field Analysis:');
    console.log('checkoutUrl:', result.checkoutUrl);
    console.log('  - Type:', typeof result.checkoutUrl);
    console.log('  - Starts with https?:', result.checkoutUrl?.startsWith('https'));
    console.log('');
    console.log('qrCode:', result.qrCode);
    console.log('  - Type:', typeof result.qrCode);
    console.log('  - Is image URL?:', result.qrCode?.startsWith('http'));
    console.log('  - Is base64?:', result.qrCode?.startsWith('data:image'));
    console.log('  - Is data string?:', result.qrCode?.length > 100);
    
    console.log('\n💡 To test in browser:');
    if (result.checkoutUrl) {
      console.log('Checkout URL:', result.checkoutUrl);
    }
    if (result.qrCode) {
      console.log('QR Code:', result.qrCode.substring(0, 100) + '...');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  process.exit(0);
}

testPayOSQR();
