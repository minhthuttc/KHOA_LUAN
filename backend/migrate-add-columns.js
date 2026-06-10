// Migration: Thêm cột so_dien_thoai và dia_chi vào bảng nguoi_dung
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'Thu2220403',
  database: 'ai_sim_db'
});

async function migrate() {
  try {
    console.log('\n🔄 === DATABASE MIGRATION ===\n');
    console.log('Adding columns: so_dien_thoai, dia_chi to nguoi_dung table');
    console.log('');
    
    // Step 1: Check current table structure
    console.log('1️⃣ Checking current table structure...');
    const [columns] = await pool.query('DESCRIBE nguoi_dung');
    const existingColumns = columns.map(col => col.Field);
    console.log('   Existing columns:', existingColumns.join(', '));
    
    // Step 2: Add so_dien_thoai column if not exists
    if (!existingColumns.includes('so_dien_thoai')) {
      console.log('\n2️⃣ Adding column: so_dien_thoai...');
      await pool.query(`
        ALTER TABLE nguoi_dung 
        ADD COLUMN so_dien_thoai VARCHAR(15) DEFAULT NULL AFTER ngay_sinh
      `);
      console.log('   ✅ Column so_dien_thoai added!');
    } else {
      console.log('\n2️⃣ Column so_dien_thoai already exists ✓');
    }
    
    // Step 3: Add dia_chi column if not exists
    if (!existingColumns.includes('dia_chi')) {
      console.log('\n3️⃣ Adding column: dia_chi...');
      await pool.query(`
        ALTER TABLE nguoi_dung 
        ADD COLUMN dia_chi TEXT DEFAULT NULL AFTER so_dien_thoai
      `);
      console.log('   ✅ Column dia_chi added!');
    } else {
      console.log('\n3️⃣ Column dia_chi already exists ✓');
    }
    
    // Step 4: Verify new structure
    console.log('\n4️⃣ Verifying new table structure...');
    const [newColumns] = await pool.query('DESCRIBE nguoi_dung');
    console.log('\n📋 Updated table structure:');
    console.table(newColumns.map(col => ({
      Field: col.Field,
      Type: col.Type,
      Null: col.Null,
      Key: col.Key,
      Default: col.Default
    })));
    
    // Step 5: Update Nguyễn Võ Minh Thư's info
    console.log('\n5️⃣ Updating user info for Nguyễn Võ Minh Thư...');
    const username = 'Nguyễn Võ Minh Thư';
    const phone = '0868535745';
    const address = '402 Nguyễn Văn Cừ, Phường An Bình, Ninh Kiều, Cần Thơ';
    
    await pool.query(
      'UPDATE nguoi_dung SET so_dien_thoai = ?, dia_chi = ? WHERE ten_dang_nhap = ?',
      [phone, address, username]
    );
    
    console.log('   ✅ User info updated!');
    
    // Step 6: Show updated user info
    const [users] = await pool.query(
      'SELECT ten_dang_nhap, so_dien_thoai, dia_chi, ngay_sinh FROM nguoi_dung WHERE ten_dang_nhap = ?',
      [username]
    );
    
    if (users.length > 0) {
      console.log('\n📋 Updated user info:');
      console.log('   Username:', users[0].ten_dang_nhap);
      console.log('   Phone:', users[0].so_dien_thoai);
      console.log('   Address:', users[0].dia_chi);
      console.log('   Birth Date:', users[0].ngay_sinh || '(not set)');
    }
    
    console.log('\n✅ === MIGRATION COMPLETED ===\n');
    console.log('💡 Next steps:');
    console.log('1. Restart backend server');
    console.log('2. Login as "Nguyễn Võ Minh Thư"');
    console.log('3. Click "Mua Ngay" - form will auto-fill phone & address');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await pool.end();
  }
}

migrate();
