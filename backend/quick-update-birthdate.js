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

async function quickUpdate() {
  try {
    // Update user "Võ Minh Thư" with birth date
    await pool.query(
      'UPDATE nguoi_dung SET ngay_sinh = ? WHERE ten_dang_nhap = ?',
      ['2003-04-22', 'Võ Minh Thư']
    );
    
    console.log('✅ Đã cập nhật ngày sinh cho user "Võ Minh Thư": 2003-04-22');
    
    // Show updated user
    const [users] = await pool.query(
      'SELECT ten_dang_nhap, ngay_sinh FROM nguoi_dung WHERE ten_dang_nhap = ?',
      ['Võ Minh Thư']
    );
    
    console.log('\nThông tin user:');
    console.log(users[0]);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

quickUpdate();
