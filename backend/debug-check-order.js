const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'Thu2220403',
  database: 'ai_sim_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function checkOrder() {
  try {
    // Lấy orderId từ command line
    const orderId = process.argv[2];
    
    if (!orderId) {
      console.log('Usage: node debug-check-order.js <orderId>');
      console.log('Example: node debug-check-order.js 123');
      process.exit(1);
    }

    console.log('\n=== DEBUG CHECK ORDER ===');
    console.log('🆔 Order ID:', orderId);
    console.log('⏰ Time:', new Date().toLocaleString());
    console.log('');

    // Query database
    const [orders] = await pool.query(
      'SELECT * FROM don_hang WHERE ma_don_hang = ?',
      [orderId]
    );

    if (orders.length === 0) {
      console.log('❌ Không tìm thấy đơn hàng với ID:', orderId);
      process.exit(1);
    }

    const order = orders[0];

    console.log('✅ Tìm thấy đơn hàng:');
    console.log('');
    console.log('📋 THÔNG TIN CƠ BẢN:');
    console.log('   - Mã đơn hàng:', order.ma_don_hang);
    console.log('   - Số sim:', order.so_sim);
    console.log('   - Nhà mạng:', order.nha_mang);
    console.log('   - Giá:', order.gia, 'VNĐ');
    console.log('   - Khách hàng:', order.ten_khach_hang);
    console.log('   - SĐT:', order.sdt_khach_hang);
    console.log('');

    console.log('💳 THÔNG TIN THANH TOÁN:');
    console.log('   - payment_status:', order.payment_status || 'NULL');
    console.log('   - paid_at:', order.paid_at || 'NULL');
    console.log('   - transaction_id:', order.transaction_id || 'NULL');
    console.log('   - Phương thức:', order.phuong_thuc_thanh_toan);
    console.log('');

    console.log('📊 TRẠNG THÁI:');
    console.log('   - Trạng thái đơn:', order.trang_thai);
    console.log('   - Ngày mua:', order.ngay_mua);
    console.log('');

    // Kiểm tra trạng thái
    if (order.payment_status === 'PAID') {
      console.log('✅ ĐƠN HÀNG ĐÃ THANH TOÁN');
    } else if (order.payment_status === 'PENDING') {
      console.log('⏳ ĐƠN HÀNG CHỜ THANH TOÁN');
    } else if (order.payment_status === 'FAILED') {
      console.log('❌ THANH TOÁN THẤT BẠI');
    } else {
      console.log('⚠️ TRẠNG THÁI KHÔNG XÁC ĐỊNH:', order.payment_status);
    }

    console.log('');
    console.log('=== END DEBUG ===\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await pool.end();
  }
}

checkOrder();
