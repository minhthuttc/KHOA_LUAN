const mysql = require('mysql2/promise');

async function checkAllOrders() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  console.log('🔍 Kiểm tra tất cả đơn hàng trong hệ thống...\n');

  // Lấy tất cả đơn hàng
  const [orders] = await connection.query(
    `SELECT ma_don_hang, ten_nguoi_dung, ten_khach_hang, sdt_khach_hang, 
            so_sim, nha_mang, gia_mua, phuong_thuc_thanh_toan, trang_thai, ngay_mua
     FROM don_hang 
     ORDER BY ngay_mua DESC`
  );

  if (orders.length === 0) {
    console.log('❌ Không có đơn hàng nào trong hệ thống');
    await connection.end();
    return;
  }

  console.log(`📋 Tìm thấy ${orders.length} đơn hàng:\n`);
  
  orders.forEach((order, index) => {
    console.log(`${index + 1}. Đơn hàng #${order.ma_don_hang}`);
    console.log(`   - User: ${order.ten_nguoi_dung}`);
    console.log(`   - Khách hàng: ${order.ten_khach_hang}`);
    console.log(`   - SĐT: ${order.sdt_khach_hang}`);
    console.log(`   - Số sim: ${order.so_sim}`);
    console.log(`   - Nhà mạng: ${order.nha_mang}`);
    console.log(`   - Giá: ${order.gia_mua.toLocaleString('vi-VN')}đ`);
    console.log(`   - Thanh toán: ${order.phuong_thuc_thanh_toan === 'bank_transfer' ? 'Chuyển khoản' : 'Tiền mặt'}`);
    console.log(`   - Trạng thái: ${order.trang_thai}`);
    console.log(`   - Ngày mua: ${new Date(order.ngay_mua).toLocaleString('vi-VN')}`);
    console.log('');
  });

  // Thống kê
  const pendingOrders = orders.filter(o => o.trang_thai === 'Chờ duyệt');
  const approvedOrders = orders.filter(o => o.trang_thai === 'Đã duyệt');

  console.log('\n📊 THỐNG KÊ:');
  console.log(`   - Tổng đơn hàng: ${orders.length}`);
  console.log(`   - Chờ duyệt: ${pendingOrders.length}`);
  console.log(`   - Đã duyệt: ${approvedOrders.length}`);

  if (pendingOrders.length > 0) {
    console.log('\n⏳ CÁC ĐỜN HÀNG CHỜ DUYỆT:');
    pendingOrders.forEach((order, index) => {
      console.log(`   ${index + 1}. #${order.ma_don_hang} - ${order.ten_khach_hang} - ${order.so_sim} - ${order.gia_mua.toLocaleString('vi-VN')}đ`);
    });
  }

  await connection.end();
}

checkAllOrders().catch(console.error);
