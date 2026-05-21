const mysql = require('mysql2/promise');
const readline = require('readline');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'Thu2220403',
  database: 'ai_sim_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function updateUserBirthdate() {
  try {
    // Show all users
    const [users] = await pool.query(`
      SELECT ma_nguoi_dung, ten_dang_nhap, ngay_sinh 
      FROM nguoi_dung 
      ORDER BY ma_nguoi_dung
    `);
    
    console.log('\n📋 Danh sách người dùng:\n');
    users.forEach(user => {
      console.log(`${user.ma_nguoi_dung}. ${user.ten_dang_nhap} - Ngày sinh: ${user.ngay_sinh || 'Chưa cập nhật'}`);
    });
    
    const userId = await question('\nNhập ID người dùng cần cập nhật: ');
    const birthDate = await question('Nhập ngày sinh (YYYY-MM-DD): ');
    
    await pool.query(
      'UPDATE nguoi_dung SET ngay_sinh = ? WHERE ma_nguoi_dung = ?',
      [birthDate, userId]
    );
    
    console.log('\n✅ Đã cập nhật ngày sinh thành công!');
    
    // Show updated user
    const [updated] = await pool.query(
      'SELECT * FROM nguoi_dung WHERE ma_nguoi_dung = ?',
      [userId]
    );
    
    if (updated.length > 0) {
      console.log('\nThông tin đã cập nhật:');
      console.log(`Tên: ${updated[0].ten_dang_nhap}`);
      console.log(`Ngày sinh: ${updated[0].ngay_sinh}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
    await pool.end();
  }
}

updateUserBirthdate();
