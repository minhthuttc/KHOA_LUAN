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

async function updateAllUsers() {
  try {
    // Update sample birth dates for all users
    const updates = [
      { name: 'Admin', birthDate: '1990-01-01' },
      { name: 'Lâm Vĩnh Lộc', birthDate: '1995-05-15' },
      { name: 'Nguyễn Võ Minh Thư', birthDate: '2003-04-22' },
      { name: 'Quốc', birthDate: '1998-08-20' },
      { name: 'Nguyễn Võ Thư Kỳ', birthDate: '2002-03-10' },
      { name: 'Thư Nguyễn', birthDate: '2001-07-25' },
      { name: 'Nguyễn Minh Thư', birthDate: '2003-06-18' },
      { name: 'Võ Minh Thư', birthDate: '2003-04-22' },
      { name: 'Võ Thư Kỳ', birthDate: '2004-09-12' }
    ];
    
    console.log('Đang cập nhật ngày sinh cho tất cả users...\n');
    
    for (const user of updates) {
      await pool.query(
        'UPDATE nguoi_dung SET ngay_sinh = ? WHERE ten_dang_nhap = ?',
        [user.birthDate, user.name]
      );
      console.log(`✅ ${user.name}: ${user.birthDate}`);
    }
    
    console.log('\n✅ Hoàn tất! Tất cả users đã có ngày sinh.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

updateAllUsers();
