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

async function checkUsers() {
  try {
    console.log('📋 Danh sách người dùng:\n');
    
    const [users] = await pool.query(`
      SELECT ma_nguoi_dung, ten_dang_nhap, vai_tro, ngay_sinh, ngay_tao 
      FROM nguoi_dung 
      ORDER BY ngay_tao DESC
    `);
    
    users.forEach(user => {
      console.log(`ID: ${user.ma_nguoi_dung}`);
      console.log(`Tên: ${user.ten_dang_nhap}`);
      console.log(`Vai trò: ${user.vai_tro}`);
      console.log(`Ngày sinh: ${user.ngay_sinh || 'Chưa cập nhật'}`);
      console.log(`Ngày tạo: ${user.ngay_tao}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkUsers();
