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

async function addDescriptionColumn() {
  try {
    // Kiểm tra xem cột description đã tồn tại chưa
    const [columns] = await pool.query(`
      SHOW COLUMNS FROM sim_cards LIKE 'description'
    `);

    if (columns.length === 0) {
      // Thêm cột description nếu chưa có
      await pool.query(`
        ALTER TABLE sim_cards 
        ADD COLUMN description TEXT
      `);
      console.log('✅ Đã thêm cột description vào bảng sim_cards');
    } else {
      console.log('ℹ️ Cột description đã tồn tại');
    }

    // Cập nhật description cho các sim hiện có
    const updateQueries = [
      {
        sim_number: '0981234567',
        description: 'Sim thần tài đẹp, số 39 mang lại may mắn và tài lộc. Phù hợp cho người kinh doanh, buôn bán.'
      },
      {
        sim_number: '0912223334',
        description: 'Sim tam hoa 222, số đẹp dễ nhớ. Mang ý nghĩa sum vầy, hòa hợp. Thích hợp cho người yêu thích sự cân bằng.'
      },
      {
        sim_number: '0909999888',
        description: 'Sim tứ quý 9999 cực đẹp, kết hợp 888 - số phát tài. Sim VIP dành cho doanh nhân thành đạt.'
      },
      {
        sim_number: '0988668866',
        description: 'Sim lộc phát 68 kép đôi, mang ý nghĩa tài lộc kéo đến. Số đẹp, dễ nhớ, phù hợp mọi mệnh.'
      },
      {
        sim_number: '0911112222',
        description: 'Sim tứ quý 1111 và 2222, số đẹp hiếm có. Thể hiện sự mạnh mẽ và quyết đoán.'
      },
      {
        sim_number: '0903456789',
        description: 'Sim sảnh tiến từ 3-9, mang ý nghĩa tiến triển, phát triển không ngừng. Phù hợp cho người khởi nghiệp.'
      },
      {
        sim_number: '0987111222',
        description: 'Sim tam hoa 111 và 222, số đẹp cân đối. Mang lại sự may mắn và thuận lợi trong công việc.'
      },
      {
        sim_number: '0913999999',
        description: 'Sim ngũ quý 99999 - sim VIP cực phẩm. Số 9 tượng trưng cho sự trường tồn, bền vững.'
      },
      {
        sim_number: '0905123123',
        description: 'Sim lặp 123123, dễ nhớ và độc đáo. Phù hợp cho người thích sự đơn giản nhưng ấn tượng.'
      },
      {
        sim_number: '0983333333',
        description: 'Sim lục quý 3333333 - sim siêu VIP. Số 3 mang ý nghĩa sinh sôi, phát triển mạnh mẽ.'
      },
      {
        sim_number: '0912797979',
        description: 'Sim thần tài lớn 79 kép đôi. Số 79 là tổ hợp thần tài mạnh nhất, mang lại tài lộc dồi dào.'
      },
      {
        sim_number: '0908686868',
        description: 'Sim lộc phát 68 lặp 3 lần, cực kỳ may mắn. Phù hợp cho người làm kinh doanh, buôn bán.'
      },
      {
        sim_number: '0986110204',
        description: 'Sim ngày sinh 11/02/04, phù hợp làm quà tặng sinh nhật. Ý nghĩa đặc biệt và độc đáo.'
      },
      {
        sim_number: '0915220305',
        description: 'Sim ngày sinh 22/03/05, số đẹp có ý nghĩa. Thích hợp làm quà tặng cho người thân yêu.'
      },
      {
        sim_number: '0901235678',
        description: 'Sim dễ nhớ 12345678, số sảnh tiến đầy đủ. Mang ý nghĩa tiến bộ, phát triển liên tục.'
      }
    ];

    for (const item of updateQueries) {
      await pool.query(
        'UPDATE sim_cards SET description = ? WHERE sim_number = ?',
        [item.description, item.sim_number]
      );
    }

    console.log('✅ Đã cập nhật description cho tất cả sim');
    console.log('✅ Hoàn tất!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

addDescriptionColumn();
