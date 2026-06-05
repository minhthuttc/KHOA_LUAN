const mysql = require('mysql2/promise');

async function diagnosticCheck() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  console.log('🔍 DIAGNOSTIC CHECK - PAYMENT STATUS\n');
  console.log('=' .repeat(80));

  // STEP 1: Kiểm tra cấu trúc bảng
  console.log('\n📋 STEP 1: Kiểm tra cấu trúc bảng don_hang\n');
  const [columns] = await connection.query('DESCRIBE don_hang');
  
  const hasPaymentStatus = columns.find(col => col.Field === 'payment_status');
  const hasPaidAt = columns.find(col => col.Field === 'paid_at');
  const hasTransactionId = columns.find(col => col.Field === 'transaction_id');
  
  console.log(`payment_status: ${hasPaymentStatus ? '✅ CÓ' : '❌ KHÔNG CÓ'}`);
  console.log(`paid_at: ${hasPaidAt ? '✅ CÓ' : '❌ KHÔNG CÓ'}`);
  console.log(`transaction_id: ${hasTransactionId ? '✅ CÓ' : '❌ KHÔNG CÓ'}`);

  if (!hasPaymentStatus || !hasPaidAt || !hasTransactionId) {
    console.log('\n❌ NGUYÊN NHÂN: Thiếu cột trong database!');
    console.log('💡 GIẢI PHÁP: Chạy: node backend/add-payment-status-column.js');
    await connection.end();
    return;
  }

  // STEP 2: Kiểm tra dữ liệu
  console.log('\n📊 STEP 2: Kiểm tra 5 đơn hàng mới nhất\n');
  const [orders] = await connection.query(`
    SELECT 
      ma_don_hang as id,
      so_sim,
      trang_thai as status,
      payment_status,
      paid_at,
      transaction_id,
      ngay_mua
    FROM don_hang 
    ORDER BY ngay_mua DESC 
    LIMIT 5
  `);

  if (orders.length === 0) {
    console.log('⚠️  Chưa có đơn hàng nào');
    await connection.end();
    return;
  }

  console.log('┌─────┬──────────────┬─────────────┬─────────────────┬─────────────┬────────────────┐');
  console.log('│ ID  │ SIM          │ STATUS      │ PAYMENT_STATUS  │ PAID_AT     │ TRANSACTION_ID │');
  console.log('├─────┼──────────────┼─────────────┼─────────────────┼─────────────┼────────────────┤');
  
  orders.forEach(order => {
    const id = String(order.id).padEnd(3);
    const sim = String(order.so_sim).padEnd(12);
    const status = String(order.status || 'NULL').padEnd(11);
    const paymentStatus = String(order.payment_status || 'NULL').padEnd(15);
    const paidAt = order.paid_at ? new Date(order.paid_at).toLocaleDateString('vi-VN').padEnd(11) : 'NULL'.padEnd(11);
    const transactionId = String(order.transaction_id || 'NULL').padEnd(14);
    
    console.log(`│ ${id} │ ${sim} │ ${status} │ ${paymentStatus} │ ${paidAt} │ ${transactionId} │`);
  });
  
  console.log('└─────┴──────────────┴─────────────┴─────────────────┴─────────────┴────────────────┘');

  // STEP 3: Kiểm tra API response
  console.log('\n🌐 STEP 3: Mô phỏng API response\n');
  
  const [apiResponse] = await connection.query(`
    SELECT 
      ma_don_hang as id, 
      ma_nguoi_dung as user_id, 
      ten_nguoi_dung as user_name, 
      so_sim as sim_number, 
      nha_mang as network, 
      gia_mua as price, 
      loai_sim as category, 
      ten_khach_hang as customer_name, 
      sdt_khach_hang as customer_phone, 
      dia_chi_khach_hang as customer_address, 
      phuong_thuc_thanh_toan as payment_method, 
      ngay_mua as purchase_date, 
      trang_thai as status, 
      ngay_duyet as approval_date,
      payment_status,
      paid_at,
      transaction_id
    FROM don_hang 
    ORDER BY ngay_mua DESC 
    LIMIT 1
  `);

  if (apiResponse.length > 0) {
    console.log('API Response sample:');
    console.log(JSON.stringify(apiResponse[0], null, 2));
    
    if (apiResponse[0].payment_status) {
      console.log('\n✅ payment_status CÓ trong response');
    } else {
      console.log('\n❌ payment_status KHÔNG CÓ trong response (giá trị NULL)');
    }
  }

  // STEP 4: Phân tích vấn đề
  console.log('\n🔧 STEP 4: Phân tích vấn đề\n');
  
  const nullPaymentStatus = orders.filter(o => !o.payment_status);
  if (nullPaymentStatus.length > 0) {
    console.log(`⚠️  ${nullPaymentStatus.length}/${orders.length} đơn có payment_status = NULL`);
    console.log('💡 NGUYÊN NHÂN: Đơn hàng được tạo TRƯỚC KHI thêm cột mới');
    console.log('💡 GIẢI PHÁP: Cập nhật payment_status cho các đơn cũ:');
    console.log('');
    console.log('   UPDATE don_hang SET payment_status = \'PENDING\' WHERE payment_status IS NULL;');
    console.log('');
  } else {
    console.log('✅ Tất cả đơn hàng đều có payment_status');
  }

  // STEP 5: Kiểm tra webhook endpoint
  console.log('\n🔌 STEP 5: Kiểm tra backend routes\n');
  console.log('Expected routes:');
  console.log('  ✓ GET  /api/admin/purchases');
  console.log('  ✓ GET  /api/user/:userId/history');
  console.log('  ✓ POST /api/purchase');
  console.log('  ✓ GET  /api/order/payment-status/:orderId');
  console.log('  ✓ GET  /api/order/by-sim/:simNumber');
  console.log('  ✓ POST /api/webhook/bank-transfer');
  
  console.log('\n⚠️  Backend PHẢI được restart để áp dụng thay đổi!');
  console.log('   Chạy: cd backend && node index.js');

  await connection.end();
  
  console.log('\n' + '='.repeat(80));
  console.log('✨ Diagnostic check hoàn tất!');
}

diagnosticCheck().catch(console.error);
