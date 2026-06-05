async function testLiveAPI() {
  console.log('🧪 TESTING LIVE API ENDPOINTS\n');
  console.log('=' .repeat(80));

  let backendRunning = false;

  // Test 1: Kiểm tra backend có đang chạy không
  console.log('\n📡 STEP 1: Kiểm tra backend server\n');
  try {
    const healthCheck = await fetch('http://localhost:5000/api/sims');
    if (healthCheck.ok) {
      console.log('✅ Backend đang chạy tại http://localhost:5000');
      backendRunning = true;
    }
  } catch (error) {
    console.log('❌ Backend KHÔNG chạy!');
    console.log('💡 GIẢI PHÁP:');
    console.log('   1. Mở terminal mới');
    console.log('   2. cd backend');
    console.log('   3. node index.js');
    console.log('\n⚠️  Không thể tiếp tục test API khi backend chưa chạy!');
    return;
  }

  // Test 2: Test API admin/purchases
  console.log('\n🔍 STEP 2: Test GET /api/admin/purchases\n');
  try {
    const response = await fetch('http://localhost:5000/api/admin/purchases');
    const data = await response.json();
    
    if (data.success && data.data.length > 0) {
      const firstOrder = data.data[0];
      console.log('Response status:', response.status);
      console.log('Response có payment_status?', 'payment_status' in firstOrder ? '✅ CÓ' : '❌ KHÔNG');
      console.log('Response có paid_at?', 'paid_at' in firstOrder ? '✅ CÓ' : '❌ KHÔNG');
      console.log('Response có transaction_id?', 'transaction_id' in firstOrder ? '✅ CÓ' : '❌ KHÔNG');
      
      console.log('\nSample order data:');
      console.log('  ID:', firstOrder.id);
      console.log('  Sim:', firstOrder.sim_number);
      console.log('  Status:', firstOrder.status);
      console.log('  Payment Status:', firstOrder.payment_status || '❌ THIẾU');
      console.log('  Paid At:', firstOrder.paid_at || 'NULL');
      console.log('  Transaction ID:', firstOrder.transaction_id || 'NULL');

      if (!firstOrder.payment_status && firstOrder.payment_status !== null) {
        console.log('\n❌ VẤN ĐỀ: API không trả về payment_status');
        console.log('🔧 NGUYÊN NHÂN: Backend chưa được restart sau khi sửa code');
        console.log('💡 GIẢI PHÁP:');
        console.log('   1. Stop backend hiện tại (Ctrl + C)');
        console.log('   2. Chạy lại: node backend/index.js');
        console.log('   3. Chạy lại script này để verify');
      } else {
        console.log('\n✅ API đã trả về đầy đủ thông tin thanh toán!');
      }
    } else {
      console.log('⚠️  Chưa có đơn hàng nào');
    }
  } catch (error) {
    console.log('❌ Lỗi khi gọi API:', error.message);
  }

  // Test 3: Test API payment-status
  console.log('\n🔍 STEP 3: Test GET /api/order/payment-status/:orderId\n');
  try {
    // Lấy order ID từ API purchases
    const purchasesRes = await fetch('http://localhost:5000/api/admin/purchases');
    const purchasesData = await purchasesRes.json();
    
    if (purchasesData.success && purchasesData.data.length > 0) {
      const orderId = purchasesData.data[0].id;
      console.log('Testing với Order ID:', orderId);
      
      const statusRes = await fetch(`http://localhost:5000/api/order/payment-status/${orderId}`);
      const contentType = statusRes.headers.get('content-type');
      
      console.log('Response status:', statusRes.status);
      console.log('Content-Type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        const statusData = await statusRes.json();
        console.log('Response data:', JSON.stringify(statusData, null, 2));
        
        if (statusData.success) {
          console.log('\n✅ API kiểm tra trạng thái hoạt động!');
          console.log('  Payment Status:', statusData.data.paymentStatus);
        }
      } else {
        console.log('\n❌ API trả về HTML thay vì JSON!');
        const html = await statusRes.text();
        console.log('Response preview:', html.substring(0, 100) + '...');
        console.log('\n🔧 NGUYÊN NHÂN: Route không tồn tại hoặc backend chưa restart');
      }
    }
  } catch (error) {
    console.log('❌ Lỗi:', error.message);
  }

  // Test 4: Kiểm tra frontend có gọi đúng API không
  console.log('\n🎨 STEP 4: Kiểm tra Frontend Integration\n');
  console.log('Frontend cần:');
  console.log('  1. ✓ Gọi GET /api/admin/purchases để lấy danh sách');
  console.log('  2. ✓ Đọc field purchase.payment_status từ response');
  console.log('  3. ✓ Hiển thị badge dựa trên payment_status');
  console.log('');
  console.log('Badge logic:');
  console.log('  - payment_status === "PAID"    → 🟢 Đã thanh toán');
  console.log('  - payment_status === "PENDING" → 🟡 Chờ thanh toán');
  console.log('  - payment_status === "FAILED"  → 🔴 Thất bại');

  console.log('\n' + '='.repeat(80));
  console.log('✨ Test hoàn tất!');
  console.log('\n📋 CHECKLIST:');
  
  if (backendRunning) {
    console.log('  ✅ Backend đang chạy');
    console.log('  ⚠️  Kiểm tra xem API có trả về payment_status không');
    console.log('  ⚠️  Nếu không → Restart backend');
  } else {
    console.log('  ❌ Backend chưa chạy → Khởi động backend trước');
  }
  
  console.log('\n💡 NEXT STEPS:');
  console.log('  1. Đảm bảo backend đang chạy');
  console.log('  2. Restart backend nếu cần: cd backend && node index.js');
  console.log('  3. Chạy lại script này để verify: node backend/test-live-api.js');
  console.log('  4. Mở http://localhost:3000/admin để xem giao diện');
}

testLiveAPI().catch(console.error);
