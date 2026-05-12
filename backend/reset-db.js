const mysql = require('mysql2/promise');

async function resetDB() {
  try {
    console.log('Connecting to MySQL...');
    let connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'Thu2220403'
    });

    console.log('Dropping and recreating database...');
    await connection.query('DROP DATABASE IF EXISTS ai_sim_db');
    await connection.query('CREATE DATABASE ai_sim_db');
    await connection.end();

    console.log('Database reset successfully!');
    console.log('Now run: node seed.js');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

resetDB();
