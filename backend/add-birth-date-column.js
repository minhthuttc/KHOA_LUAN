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

async function addBirthDateColumn() {
  try {
    console.log('Checking if ngay_sinh column exists...');
    
    // Check if column exists
    const [columns] = await pool.query(`
      SHOW COLUMNS FROM nguoi_dung LIKE 'ngay_sinh'
    `);
    
    if (columns.length === 0) {
      console.log('Adding ngay_sinh column to nguoi_dung table...');
      await pool.query(`
        ALTER TABLE nguoi_dung 
        ADD COLUMN ngay_sinh DATE NULL 
        COMMENT 'Ngày sinh của người dùng'
      `);
      console.log('✅ Successfully added ngay_sinh column!');
    } else {
      console.log('✅ Column ngay_sinh already exists!');
    }
    
    // Check the table structure
    const [allColumns] = await pool.query(`
      SHOW COLUMNS FROM nguoi_dung
    `);
    
    console.log('\nCurrent nguoi_dung table structure:');
    allColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

addBirthDateColumn();
