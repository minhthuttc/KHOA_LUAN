// Script để cập nhật thông tin cho tài khoản Nguyễn Võ Minh Thư
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'Thu2220403',
  database: 'ai_sim_db'
});

async function updateUserInfo() {
  try {
    console.log('\n🔄 === UPDATING USER INFO ===\n');
    
    const username = 'Nguyễn Võ Minh Thư';
    const phone = '0868535745';
    const address = '402 Nguyễn Văn Cừ, Phường An Bình, Ninh Kiều, Cần Thơ';
    
    // Check if user exists
    console.log('🔍 Checking if user exists...');
    const [users] = await pool.query(
      'SELECT * FROM nguoi_dung WHERE ten_dang_nhap = ?',
      [username]
    );
    
    if (users.length === 0) {
      console.error('❌ User not found:', username);
      console.log('\n💡 Available users:');
      const [allUsers] = await pool.query('SELECT ten_dang_nhap FROM nguoi_dung LIMIT 10');
      allUsers.forEach(u => console.log('   -', u.ten_dang_nhap));
      return;
    }
    
    console.log('✅ User found!');
    console.log('\n📋 Current info:');
    console.log('   Username:', users[0].ten_dang_nhap);
    console.log('   Phone:', users[0].so_dien_thoai || '(empty)');
    console.log('   Address:', users[0].dia_chi || '(empty)');
    
    // Update user info
    console.log('\n🔄 Updating user info...');
    await pool.query(
      'UPDATE nguoi_dung SET so_dien_thoai = ?, dia_chi = ? WHERE ten_dang_nhap = ?',
      [phone, address, username]
    );
    
    // Verify update
    console.log('✅ Update completed!\n');
    const [updated] = await pool.query(
      'SELECT ten_dang_nhap, so_dien_thoai, dia_chi, ngay_sinh FROM nguoi_dung WHERE ten_dang_nhap = ?',
      [username]
    );
    
    console.log('📋 New info:');
    console.log('   Username:', updated[0].ten_dang_nhap);
    console.log('   Phone:', updated[0].so_dien_thoai);
    console.log('   Address:', updated[0].dia_chi);
    console.log('   Birth Date:', updated[0].ngay_sinh || '(not set)');
    
    console.log('\n💡 Next steps:');
    console.log('1. Login with username: "Nguyễn Võ Minh Thư"');
    console.log('2. Click "Mua Ngay" on any SIM');
    console.log('3. Form will auto-fill:');
    console.log('   - Name: Nguyễn Võ Minh Thư');
    console.log('   - Phone:', phone);
    console.log('   - Address:', address);
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

updateUserInfo();
