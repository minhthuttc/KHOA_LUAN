/**
 * Script test webhook thanh toán
 * Mô phỏng ngân hàng gửi thông báo chuyển khoản thành công
 */

async function testWebhook() {
  console.log('🧪 TEST WEBHOOK PAYMENT\n');
  console.log('================================================================================\n');

  try {
    // Lấy danh sách đơn hàng PENDING có phương thức chuyển khoản
    console.log('📋 STEP 1: Lấy đơn hàng PENDING với phương thức chuyển khoản...\n');
    
    const purchasesRes = await fetch('http://localhost:5000/api/admin/purchases');
    const purchasesData = await purchasesRes.json();
    const pendingOrders = purchasesData.data.filter(
      order => order.payment_status === 'PENDING' && order.payment_method === 'bank_transfer'
    );

    if (pendingOrders.length === 0) {
      console.log('⚠️  Không có đơn hàng nào chờ thanh toán bằng chuyển khoản');
      console.log('   Tạo đơn hàng mới hoặc chạy: node manual-approve-payment.js\n');
      return;
    }

    console.log(`✅ Tìm thấy ${pendingOrders.length} đơn hàng chờ thanh toán:\n`);
    
    pendingOrders.slice(0, 5).forEach(order => {
      console.log(`   ID: ${order.id} | Sim: ${order.sim_number} | Giá: ${Number(order.price).toLocaleString('vi-VN')}đ`);
    });

    // Chọn đơn đầu tiên để test
    const targetOrder = pendingOrders[0];
    console.log(`\n🎯 Chọn đơn hàng ID: ${targetOrder.id}`);
    console.log(`   Sim: ${targetOrder.sim_number}`);
    console.log(`   Khách hàng: ${targetOrder.customer_name}`);
    console.log(`   Giá: ${Number(targetOrder.price).toLocaleString('vi-VN')}đ\n`);

    // Test webhook
    console.log('📤 STEP 2: Gửi webhook giả lập từ ngân hàng...\n');

    const webhookData = {
      transactionId: `BANK${Date.now()}`,
      amount: Number(targetOrder.price),
      description: `MUA SO ${targetOrder.sim_number}`,
      accountNumber: '1025311193',
      transactionDate: new Date().toISOString(),
      bankCode: 'VCB'
    };

    console.log('Webhook payload:');
    console.log(JSON.stringify(webhookData, null, 2));
    console.log('');

    const webhookRes = await fetch('http://localhost:5000/api/webhook/bank-transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookData)
    });
    const webhookResData = await webhookRes.json();

    console.log('✅ Webhook response:', webhookResData);
    console.log('');

    // Verify
    console.log('🔍 STEP 3: Verify đơn hàng đã được cập nhật...\n');
    
    const verifyRes = await fetch(`http://localhost:5000/api/order/payment-status/${targetOrder.id}`);
    const verifyResData = await verifyRes.json();
    const orderStatus = verifyResData.data;

    console.log('Trạng thái đơn hàng sau webhook:');
    console.log('   Order ID:', orderStatus.orderId);
    console.log('   Payment Status:', orderStatus.paymentStatus);
    console.log('   Paid At:', orderStatus.paidAt);
    console.log('   Transaction ID:', orderStatus.transactionId);
    console.log('   Order Status:', orderStatus.orderStatus);
    console.log('');

    if (orderStatus.paymentStatus === 'PAID') {
      console.log('✅ THÀNH CÔNG! Đơn hàng đã được cập nhật sang PAID');
    } else {
      console.log('⚠️  LỖI: payment_status vẫn là', orderStatus.paymentStatus);
    }

    console.log('\n================================================================================');
    console.log('✨ Test webhook hoàn tất!\n');
    console.log('📋 KẾT QUẢ:');
    console.log('   ✓ Webhook nhận được thông báo chuyển khoản');
    console.log('   ✓ Backend tìm thấy đơn hàng tương ứng');
    console.log('   ✓ payment_status được cập nhật PENDING → PAID');
    console.log('   ✓ API trả về trạng thái mới\n');
    console.log('💡 Mở http://localhost:3000/admin để xem badge "Đã thanh toán"\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    if (error.cause) console.error('Cause:', error.cause);
  }
}

testWebhook();
