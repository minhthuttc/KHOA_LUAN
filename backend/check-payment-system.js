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

async function checkPaymentSystem() {
  try {
    console.log('\n🔍 === KIỂM TRA HỆ THỐNG THANH TOÁN ===\n');

    // 1. Kiểm tra các đơn hàng PENDING
    console.log('1️⃣ KIỂM TRA ĐƠN HÀNG PENDING:');
    const [pendingOrders] = await pool.query(
      `SELECT ma_don_hang, so_sim, gia_mua, payment_status, 
              phuong_thuc_thanh_toan, ngay_mua, ten_khach_hang, sdt_khach_hang
       FROM don_hang 
       WHERE payment_status = 'PENDING' 
       ORDER BY ngay_mua DESC 
       LIMIT 10`
    );

    if (pendingOrders.length === 0) {
      console.log('   ✅ Không có đơn hàng nào đang chờ thanh toán\n');
    } else {
      console.log(`   📋 Có ${pendingOrders.length} đơn hàng đang chờ thanh toán:\n`);
      pendingOrders.forEach(order => {
        console.log(`   Order ID: ${order.ma_don_hang}`);
        console.log(`   - Sim: ${order.so_sim}`);
        console.log(`   - Giá: ${order.gia_mua.toLocaleString()} VNĐ`);
        console.log(`   - Khách hàng: ${order.ten_khach_hang} - ${order.sdt_khach_hang}`);
        console.log(`   - Phương thức: ${order.phuong_thuc_thanh_toan}`);
        console.log(`   - Ngày mua: ${order.ngay_mua}`);
        console.log(`   - Status: ${order.payment_status}`);
        console.log('');
      });
    }

    // 2. Kiểm tra đơn hàng mới nhất
    console.log('2️⃣ ĐƠN HÀNG MỚI NHẤT:');
    const [latestOrders] = await pool.query(
      `SELECT ma_don_hang, so_sim, gia_mua, payment_status, paid_at, 
              transaction_id, phuong_thuc_thanh_toan, ngay_mua
       FROM don_hang 
       ORDER BY ma_don_hang DESC 
       LIMIT 5`
    );

    latestOrders.forEach(order => {
      console.log(`   Order ${order.ma_don_hang}:`);
      console.log(`   - Sim: ${order.so_sim}`);
      console.log(`   - Payment Status: ${order.payment_status}`);
      console.log(`   - Paid At: ${order.paid_at || 'NULL'}`);
      console.log(`   - Transaction ID: ${order.transaction_id || 'NULL'}`);
      console.log('');
    });

    // 3. Kiểm tra columns
    console.log('3️⃣ KIỂM TRA CẤU TRÚC BẢNG:');
    const [columns] = await pool.query(
      `SHOW COLUMNS FROM don_hang WHERE Field IN ('payment_status', 'paid_at', 'transaction_id')`
    );
    
    const requiredColumns = ['payment_status', 'paid_at', 'transaction_id'];
    const existingColumns = columns.map(col => col.Field);
    
    requiredColumns.forEach(col => {
      if (existingColumns.includes(col)) {
        console.log(`   ✅ Column '${col}' tồn tại`);
      } else {
        console.log(`   ❌ Column '${col}' KHÔNG TỒN TẠI!`);
      }
    });
    console.log('');

    // 4. Thống kê
    console.log('4️⃣ THỐNG KÊ:');
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN payment_status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN payment_status = 'PAID' THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN payment_status = 'FAILED' THEN 1 ELSE 0 END) as failed
       FROM don_hang`
    );
    
    console.log(`   📊 Tổng đơn hàng: ${stats[0].total}`);
    console.log(`   ⏳ Chờ thanh toán: ${stats[0].pending}`);
    console.log(`   ✅ Đã thanh toán: ${stats[0].paid}`);
    console.log(`   ❌ Thất bại: ${stats[0].failed}`);
    console.log('');

    // 5. Gợi ý
    console.log('5️⃣ HƯỚNG DẪN:');
    if (pendingOrders.length > 0) {
      const latestPending = pendingOrders[0];
      console.log(`   💡 Để test thanh toán cho Order ${latestPending.ma_don_hang}:`);
      console.log(`      node quick-approve.js ${latestPending.ma_don_hang}`);
      console.log('');
      console.log(`   📋 Hoặc kiểm tra chi tiết:`);
      console.log(`      node debug-check-order.js ${latestPending.ma_don_hang}`);
    } else {
      console.log('   ✅ Không có đơn hàng nào cần test!');
      console.log('   💡 Tạo đơn mới bằng cách mua sim trên website');
    }

    console.log('\n=== END CHECK ===\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await pool.end();
  }
}

checkPaymentSystem();
