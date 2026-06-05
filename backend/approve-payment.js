const mysql = require('mysql2/promise');

async function approvePayment() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  console.log('🔍 Tìm đơn hàng của Đỗ Thành...\n');

  // Tìm đơn hàng chờ duyệt của Đỗ Thành
  const [orders] = await connection.query(
    `SELECT ma_don_hang, ten_khach_hang, so_sim, nha_mang, gia_mua, 
            phuong_thuc_thanh_toan, trang_thai, ngay_mua
     FROM don_hang 
     WHERE ten_khach_hang LIKE ? 
     ORDER BY ngay_mua DESC`,
    ['%Đỗ Thành%']
  );

  if (orders.length === 0) {
    console.log('❌ Không tìm thấy đơn hàng nào của Đỗ Thành');
    await connection.end();
    return;
  }

  console.log(`📋 Tìm thấy ${orders.length} đơn hàng của Đỗ Thành:\n`);
  
  orders.forEach((order, index) => {
    console.log(`${index + 1}. Đơn hàng #${order.ma_don_hang}`);
    console.log(`   - Khách hàng: ${order.ten_khach_hang}`);
    console.log(`   - Số sim: ${order.so_sim}`);
    console.log(`   - Nhà mạng: ${order.nha_mang}`);
    console.log(`   - Giá: ${order.gia_mua.toLocaleString('vi-VN')}đ`);
    console.log(`   - Thanh toán: ${order.phuong_thuc_thanh_toan === 'bank_transfer' ? 'Chuyển khoản' : 'Tiền mặt'}`);
    console.log(`   - Trạng thái: ${order.trang_thai}`);
    console.log(`   - Ngày mua: ${new Date(order.ngay_mua).toLocaleString('vi-VN')}`);
    console.log('');
  });

  // Tìm đơn hàng chờ duyệt gần nhất
  const pendingOrder = orders.find(o => o.trang_thai === 'Chờ duyệt');
  
  if (!pendingOrder) {
    console.log('⚠️  Không có đơn hàng nào đang chờ duyệt. Tất cả đơn đã được xử lý.');
    await connection.end();
    return;
  }

  console.log(`✅ Xác nhận thanh toán cho đơn hàng #${pendingOrder.ma_don_hang}...\n`);

  // Cập nhật trạng thái thành "Đã duyệt"
  await connection.query(
    `UPDATE don_hang 
     SET trang_thai = 'Đã duyệt',
         ngay_duyet = NOW(),
         ghi_chu = CONCAT(IFNULL(ghi_chu, ''), '\nAdmin xác nhận thanh toán thủ công - ', NOW())
     WHERE ma_don_hang = ?`,
    [pendingOrder.ma_don_hang]
  );

  console.log('✅ Đã xác nhận thanh toán thành công!');
  console.log(`📦 Đơn hàng #${pendingOrder.ma_don_hang} - Sim ${pendingOrder.so_sim}`);
  console.log(`💰 Số tiền: ${pendingOrder.gia_mua.toLocaleString('vi-VN')}đ`);
  console.log(`✅ Trạng thái: Đã duyệt`);
  console.log(`\n👉 Khách hàng ${pendingOrder.ten_khach_hang} đã được xác nhận thanh toán!`);

  await connection.end();
}

approvePayment().catch(console.error);
