const mysql = require('mysql2/promise');

async function checkPurchasesTable() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('Checking purchases table structure...\n');
    
    const [columns] = await connection.query('DESCRIBE purchases');
    console.log('Columns in purchases table:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkPurchasesTable();
