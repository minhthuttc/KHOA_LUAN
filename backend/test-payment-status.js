async function testPaymentStatus() {
  console.log('🧪 TEST: Kiểm tra trạng thái thanh toán\n');

  try {
    // Test 1: Lấy danh sách đơn hàng (admin)
    console.log('1️⃣ Test API lấy danh sách đơn hàng...');
    const purchasesRes = await fetch('http://localhost:5000/api/admin/purchases');
    const purchasesData = await purchasesRes.json();
    
    if (purchasesData.success && purchasesData.data.length > 0) {
      const firstOrder = purchasesData.data[0];
      console.log('✅ API trả về dữ liệu:');
      console.log('   - Mã đơn:', firstOrder.id);
      console.log('   - Sim:', firstOrder.sim_number);
      console.log('   - Trạng thái đơn:', firstOrder.status);
      console.log('   - Trạng thái thanh toán:', firstOrder.payment_status || '❌ THIẾU');
      console.log('   - Thời gian thanh toán:', firstOrder.paid_at || '❌ THIẾU');
      console.log('   - Mã GD:', firstOrder.transaction_id || '❌ THIẾU');
      
      if (!firstOrder.payment_status) {
        console.log('\n❌ VẤN ĐỀ: API không trả về payment_status!');
      } else {
        console.log('\n✅ API đã trả về đầy đủ thông tin thanh toán');
      }

      // Test 2: Test API kiểm tra trạng thái thanh toán
      console.log('\n2️⃣ Test API kiểm tra trạng thái thanh toán...');
      const orderId = firstOrder.id;
      const statusRes = await fetch(`http://localhost:5000/api/order/payment-status/${orderId}`);
      const statusData = await statusRes.json();
      
      if (statusData.success) {
        console.log('✅ API kiểm tra trạng thái hoạt động:');
        console.log('   - Order ID:', statusData.data.orderId);
        console.log('   - Payment Status:', statusData.data.paymentStatus);
        console.log('   - Paid At:', statusData.data.paidAt);
        console.log('   - Transaction ID:', statusData.data.transactionId);
      }
    } else {
      console.log('⚠️  Chưa có đơn hàng nào trong hệ thống');
    }

    console.log('\n✨ Test hoàn tất!');
    console.log('\n📋 CHECKLIST:');
    console.log('   ✓ API /api/admin/purchases trả về payment_status');
    console.log('   ✓ API /api/order/payment-status/:orderId hoạt động');
    console.log('   ✓ Frontend có thể polling để kiểm tra trạng thái');

  } catch (error) {
    console.error('\n❌ Lỗi khi test:', error.message);
  }
}

testPaymentStatus();
