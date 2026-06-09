/**
 * SCRIPT TEST LUỒNG THANH TOÁN HOÀN CHỈNH
 * 
 * Test từ A → Z:
 * 1. Tạo đơn hàng
 * 2. Giả lập webhook thanh toán
 * 3. Kiểm tra DB đã update PAID chưa
 * 4. Kiểm tra API payment-status trả đúng không
 */

const axios = require('axios');
const mysql = require('mysql2/promise');

const BASE_URL = 'http://localhost:5000';

// MySQL connection
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'Thu2220403',
  database: 'ai_sim_db'
});

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testPaymentFlow() {
  console.log('\n🚀 === BẮT ĐẦU TEST LUỒNG THANH TOÁN ===\n');
  
  try {
    // STEP 1: Tạo đơn hàng test
    console.log('STEP 1: Tạo đơn hàng test...');
    
    const testSimNumber = `099999${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const testPrice = 1500000;
    
    // Thêm sim test vào DB trước
    await pool.query(
      'INSERT IGNORE INTO the_sim (so_sim, nha_mang, gia_ban, loai_sim, menh_phong_thuy, diem_nut, trang_thai) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [testSimNumber, 'Viettel', testPrice, 'Sim test', 'Kim', 5, 'Còn hàng']
    );
    
    // Tạo đơn hàng
    const purchaseResponse = await axios.post(`${BASE_URL}/api/purchase`, {
      user_id: 1,
      user_name: 'Admin',
      sim_number: testSimNumber,
      network: 'Viettel',
      price: testPrice,
      category: 'Sim test',
      customer_name: 'Test User',
      customer_phone: '0123456789',
      customer_address: 'Test Address',
      payment_method: 'bank_transfer'
    });
    
    if (!purchaseResponse.data.success) {
      throw new Error('Tạo đơn hàng FAILED: ' + purchaseResponse.data.message);
    }
    
    const orderId = purchaseResponse.data.orderId;
    console.log(`✅ Đơn hàng đã tạo thành công!`);
    console.log(`   - Order ID: ${orderId}`);
    console.log(`   - Sim: ${testSimNumber}`);
    console.log(`   - Price: ${testPrice} VNĐ`);
    console.log('');
    
    // STEP 2: Kiểm tra payment_status ban đầu = PENDING
    console.log('STEP 2: Kiểm tra payment_status ban đầu...');
    const [ordersBefore] = await pool.query(
      'SELECT payment_status, trang_thai, paid_at, transaction_id FROM don_hang WHERE ma_don_hang = ?',
      [orderId]
    );
    
    console.log('📊 Trạng thái ban đầu từ DB:');
    console.log('   - payment_status:', ordersBefore[0].payment_status);
    console.log('   - trang_thai:', ordersBefore[0].trang_thai);
    console.log('   - paid_at:', ordersBefore[0].paid_at);
    console.log('   - transaction_id:', ordersBefore[0].transaction_id);
    console.log('');
    
    if (ordersBefore[0].payment_status !== 'PENDING') {
      throw new Error(`❌ payment_status ban đầu phải là PENDING, nhưng là: ${ordersBefore[0].payment_status}`);
    }
    console.log('✅ payment_status ban đầu = PENDING');
    console.log('');
    
    // STEP 3: Kiểm tra API payment-status trả đúng không
    console.log('STEP 3: Test API /api/order/payment-status...');
    const statusResponse = await axios.get(`${BASE_URL}/api/order/payment-status/${orderId}`);
    
    console.log('📊 Response từ API:');
    console.log(JSON.stringify(statusResponse.data, null, 2));
    console.log('');
    
    if (statusResponse.data.data.paymentStatus !== 'PENDING') {
      throw new Error(`❌ API trả paymentStatus sai: ${statusResponse.data.data.paymentStatus}`);
    }
    console.log('✅ API trả paymentStatus = PENDING');
    console.log('');
    
    // STEP 4: Giả lập webhook thanh toán
    console.log('STEP 4: Giả lập webhook thanh toán...');
    const webhookData = {
      transactionId: `TEST${Date.now()}`,
      amount: testPrice,
      description: `MUASO${testSimNumber}`,
      accountNumber: '1025311193',
      transactionDate: new Date().toISOString(),
      bankCode: 'VCB'
    };
    
    console.log('📤 Gửi webhook với data:');
    console.log(JSON.stringify(webhookData, null, 2));
    console.log('');
    
    const webhookResponse = await axios.post(`${BASE_URL}/api/webhook/bank-transfer`, webhookData);
    
    console.log('📥 Webhook response:');
    console.log(JSON.stringify(webhookResponse.data, null, 2));
    console.log('');
    
    if (!webhookResponse.data.success) {
      throw new Error('❌ Webhook FAILED: ' + webhookResponse.data.message);
    }
    console.log('✅ Webhook xử lý thành công!');
    console.log('');
    
    // STEP 5: Kiểm tra DB đã update PAID chưa
    console.log('STEP 5: Kiểm tra DB sau webhook...');
    await sleep(500); // Đợi 500ms để chắc chắn DB đã update
    
    const [ordersAfter] = await pool.query(
      'SELECT payment_status, trang_thai, paid_at, transaction_id FROM don_hang WHERE ma_don_hang = ?',
      [orderId]
    );
    
    console.log('📊 Trạng thái sau webhook từ DB:');
    console.log('   - payment_status:', ordersAfter[0].payment_status);
    console.log('   - trang_thai:', ordersAfter[0].trang_thai);
    console.log('   - paid_at:', ordersAfter[0].paid_at);
    console.log('   - transaction_id:', ordersAfter[0].transaction_id);
    console.log('');
    
    if (ordersAfter[0].payment_status !== 'PAID') {
      throw new Error(`❌ payment_status sau webhook phải là PAID, nhưng là: ${ordersAfter[0].payment_status}`);
    }
    console.log('✅ DB đã update payment_status = PAID');
    console.log('');
    
    // STEP 6: Kiểm tra API payment-status trả PAID chưa
    console.log('STEP 6: Test API /api/order/payment-status sau thanh toán...');
    const statusAfterResponse = await axios.get(`${BASE_URL}/api/order/payment-status/${orderId}`);
    
    console.log('📊 Response từ API sau thanh toán:');
    console.log(JSON.stringify(statusAfterResponse.data, null, 2));
    console.log('');
    
    if (statusAfterResponse.data.data.paymentStatus !== 'PAID') {
      throw new Error(`❌ API trả paymentStatus sai sau thanh toán: ${statusAfterResponse.data.data.paymentStatus}`);
    }
    console.log('✅ API trả paymentStatus = PAID');
    console.log('');
    
    // CLEANUP: Xóa data test
    console.log('🧹 Cleanup: Xóa data test...');
    await pool.query('DELETE FROM don_hang WHERE ma_don_hang = ?', [orderId]);
    await pool.query('DELETE FROM the_sim WHERE so_sim = ?', [testSimNumber]);
    console.log('✅ Đã xóa data test');
    console.log('');
    
    console.log('\n🎉🎉🎉 === TẤT CẢ TESTS PASS === 🎉🎉🎉\n');
    console.log('✅ 1. Tạo đơn hàng: PASS');
    console.log('✅ 2. payment_status ban đầu = PENDING: PASS');
    console.log('✅ 3. API trả PENDING đúng: PASS');
    console.log('✅ 4. Webhook xử lý thành công: PASS');
    console.log('✅ 5. DB update payment_status = PAID: PASS');
    console.log('✅ 6. API trả PAID đúng: PASS');
    console.log('');
    console.log('🔥 HỆ THỐNG HOẠT ĐỘNG CHÍNH XÁC! 🔥\n');
    
  } catch (error) {
    console.error('\n❌❌❌ === TEST FAILED === ❌❌❌\n');
    console.error('Lỗi:', error.message);
    console.error('');
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    console.error('');
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

// Chạy test
testPaymentFlow();
