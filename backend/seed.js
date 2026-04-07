const mysql = require('mysql2/promise');

async function seed() {
  try {
    console.log('Connecting to MySQL...');
    // Connect without a specific database first to create it
    let connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'Thu2220403'
    });

    console.log('Creating database ai_sim_db if not exists...');
    await connection.query('CREATE DATABASE IF NOT EXISTS ai_sim_db');
    await connection.end();

    // Reconnect to the newly created database
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'Thu2220403',
      database: 'ai_sim_db'
    });

    console.log('Creating sim_cards table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sim_cards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sim_number VARCHAR(15) NOT NULL,
        network VARCHAR(50) NOT NULL,
        price DECIMAL(15, 2) NOT NULL,
        category VARCHAR(50),
        feng_shui_element VARCHAR(20),
        total_nodes INT,
        status VARCHAR(20) DEFAULT 'Còn hàng'
      )
    `);

    console.log('Truncating table... (Cleaning old data)');
    await connection.query('TRUNCATE TABLE sim_cards');

    console.log('Inserting mock data...');
    const data = [
      ['0981234567', 'Viettel', 1500000, 'Sim thần tài', 'Kim', 8, 'Còn hàng'],
      ['0912223334', 'Vinaphone', 2000000, 'Sim tam hoa', 'Mộc', 7, 'Còn hàng'],
      ['0909999888', 'Mobifone', 5000000, 'Sim tứ quý', 'Thủy', 9, 'Còn hàng'],
      ['0988668866', 'Viettel', 4500000, 'Sim lộc phát', 'Hỏa', 6, 'Còn hàng'],
      ['0911112222', 'Vinaphone', 6000000, 'Sim tứ quý', 'Thổ', 4, 'Còn hàng'],
      ['0903456789', 'Mobifone', 2500000, 'Sim sảnh tiến', 'Kim', 5, 'Còn hàng'],
      ['0987111222', 'Viettel', 1200000, 'Sim tam hoa', 'Mộc', 8, 'Còn hàng'],
      ['0913999999', 'Vinaphone', 10000000, 'Sim ngũ quý', 'Thủy', 9, 'Còn hàng'],
      ['0905123123', 'Mobifone', 1800000, 'Sim lặp', 'Hỏa', 6, 'Còn hàng'],
      ['0983333333', 'Viettel', 15000000, 'Sim lục quý', 'Thổ', 9, 'Còn hàng'],
      ['0912797979', 'Vinaphone', 3000000, 'Sim thần tài lớn', 'Kim', 8, 'Còn hàng'],
      ['0908686868', 'Mobifone', 3500000, 'Sim lộc phát', 'Mộc', 7, 'Còn hàng'],
      ['0986110204', 'Viettel', 800000, 'Sim ngày tháng năm sinh', 'Thủy', 5, 'Còn hàng'],
      ['0915220305', 'Vinaphone', 850000, 'Sim năm sinh', 'Hỏa', 6, 'Còn hàng'],
      ['0901235678', 'Mobifone', 900000, 'Sim dễ nhớ', 'Thổ', 8, 'Còn hàng']
    ];

    const sql = `INSERT INTO sim_cards (sim_number, network, price, category, feng_shui_element, total_nodes, status) VALUES ?`;
    await connection.query(sql, [data]);

    console.log('Database seeded successfully!');
    await connection.end();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();
