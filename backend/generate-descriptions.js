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

// Hàm tạo description dựa trên category và số sim
function generateDescription(simNumber, category) {
  const descriptions = {
    'Sim thần tài': [
      'Sim thần tài mang lại tài lộc và may mắn. Phù hợp cho người kinh doanh, buôn bán, mong muốn phát tài phát lộc.',
      'Số thần tài đẹp, thu hút tài lộc. Thích hợp cho doanh nhân, người làm kinh doanh muốn gia tăng vận may.',
      'Sim chứa số thần tài, mang ý nghĩa chiêu tài tiến bảo. Dành cho người làm ăn, buôn bán cần may mắn.'
    ],
    'Sim tam hoa': [
      'Sim tam hoa đẹp, số lặp 3 lần mang ý nghĩa sum vầy, hòa hợp. Phù hợp cho người yêu thích sự cân bằng trong cuộc sống.',
      'Số tam hoa dễ nhớ, thể hiện sự ổn định và hài hòa. Thích hợp cho mọi đối tượng, đặc biệt là người trung niên.',
      'Sim có 3 số giống nhau, mang lại sự may mắn và thuận lợi. Phù hợp cho người cần số đẹp, dễ nhớ.'
    ],
    'Sim tứ quý': [
      'Sim tứ quý VIP, 4 số giống nhau thể hiện đẳng cấp và quyền lực. Dành cho doanh nhân thành đạt, người có địa vị.',
      'Số tứ quý hiếm có, mang ý nghĩa mạnh mẽ và quyết đoán. Phù hợp cho lãnh đạo, người muốn khẳng định vị thế.',
      'Sim 4 số lặp cực đẹp, thể hiện sự vững chắc và bền vững. Thích hợp cho người thành đạt, có tầm ảnh hưởng.'
    ],
    'Sim lộc phát': [
      'Sim lộc phát 68, mang ý nghĩa tài lộc kéo đến, phát tài phát lộc. Phù hợp cho người kinh doanh, làm ăn buôn bán.',
      'Số 68 - lộc phát đẹp, thu hút tài lộc và may mắn. Dành cho doanh nhân, người mong muốn thịnh vượng.',
      'Sim chứa 68, tượng trưng cho sự giàu có và phát đạt. Thích hợp cho người làm kinh doanh, cần vận may.'
    ],
    'Sim ngũ quý': [
      'Sim ngũ quý siêu VIP, 5 số giống nhau cực kỳ hiếm. Dành cho người thành công, muốn thể hiện đẳng cấp tối thượng.',
      'Số ngũ quý đỉnh cao, mang ý nghĩa trường tồn và bền vững. Phù hợp cho doanh nhân lớn, người có tầm ảnh hưởng.',
      'Sim 5 số lặp cực phẩm, thể hiện quyền lực và địa vị. Thích hợp cho người thành đạt, muốn số độc nhất.'
    ],
    'Sim lục quý': [
      'Sim lục quý đỉnh cao, 6 số giống nhau vô cùng hiếm. Dành cho người cực kỳ thành công, muốn số độc nhất vô nhị.',
      'Số lục quý siêu VIP, mang ý nghĩa sinh sôi phát triển mạnh mẽ. Phù hợp cho doanh nhân đỉnh cao, người có tầm ảnh hưởng lớn.',
      'Sim 6 số lặp cực phẩm, thể hiện đẳng cấp tối thượng. Thích hợp cho người thành đạt nhất, muốn khẳng định vị thế.'
    ],
    'Sim sảnh tiến': [
      'Sim sảnh tiến, các số tăng dần mang ý nghĩa tiến triển không ngừng. Phù hợp cho người khởi nghiệp, muốn phát triển sự nghiệp.',
      'Số sảnh tiến đẹp, thể hiện sự tiến bộ liên tục. Thích hợp cho người trẻ, đang xây dựng sự nghiệp.',
      'Sim các số liên tiếp, mang lại sự thuận lợi và phát triển. Dành cho người muốn tiến xa trong công việc.'
    ],
    'Sim lặp': [
      'Sim lặp dễ nhớ, các số lặp lại tạo sự ấn tượng. Phù hợp cho mọi đối tượng, đặc biệt là người thích sự đơn giản.',
      'Số lặp độc đáo, dễ nhớ và nổi bật. Thích hợp cho người cần số đẹp với giá hợp lý.',
      'Sim có pattern lặp, mang lại may mắn và dễ ghi nhớ. Phù hợp cho người muốn số đẹp, giá tốt.'
    ],
    'Sim ngày sinh': [
      'Sim chứa ngày sinh, ý nghĩa đặc biệt và độc đáo. Phù hợp làm quà tặng sinh nhật, kỷ niệm cho người thân yêu.',
      'Số có ngày tháng năm sinh, mang giá trị cá nhân cao. Thích hợp cho người muốn sim có ý nghĩa riêng.',
      'Sim ngày kỷ niệm đẹp, phù hợp làm quà tặng ý nghĩa. Dành cho người muốn số có giá trị tình cảm.'
    ],
    'Sim dễ nhớ': [
      'Sim dễ nhớ, số đơn giản và nổi bật. Phù hợp cho mọi đối tượng, đặc biệt là người lớn tuổi.',
      'Số dễ nhớ, tiện lợi cho việc liên lạc. Thích hợp cho người cần sim đơn giản, dễ sử dụng.',
      'Sim pattern đơn giản, dễ ghi nhớ và chia sẻ. Phù hợp cho người muốn số tiện dụng, giá hợp lý.'
    ],
    'Sim năm sinh': [
      'Sim chứa năm sinh, mang ý nghĩa cá nhân đặc biệt. Phù hợp cho người muốn số có giá trị riêng, dễ nhớ.',
      'Số có năm sinh đẹp, thể hiện tuổi đời và kinh nghiệm. Thích hợp làm quà tặng hoặc sử dụng cá nhân.',
      'Sim năm sinh độc đáo, mang giá trị tình cảm cao. Dành cho người muốn số có ý nghĩa đặc biệt.'
    ]
  };

  // Lấy mô tả ngẫu nhiên từ category
  const categoryDescriptions = descriptions[category] || [
    'Sim đẹp, giá tốt, phù hợp cho mọi nhu cầu sử dụng. Số dễ nhớ, tiện lợi cho việc liên lạc hàng ngày.'
  ];

  // Chọn ngẫu nhiên một mô tả
  const randomIndex = Math.floor(Math.random() * categoryDescriptions.length);
  return categoryDescriptions[randomIndex];
}

async function updateAllDescriptions() {
  try {
    // Lấy tất cả sim chưa có description hoặc có description mặc định
    const [sims] = await pool.query(`
      SELECT id, sim_number, category 
      FROM sim_cards 
      WHERE description IS NULL 
         OR description = '' 
         OR description = 'Sim đẹp, giá tốt, phù hợp cho mọi nhu cầu sử dụng.'
    `);

    console.log(`📝 Tìm thấy ${sims.length} sim cần cập nhật description`);

    let updated = 0;
    for (const sim of sims) {
      const description = generateDescription(sim.sim_number, sim.category);
      
      await pool.query(
        'UPDATE sim_cards SET description = ? WHERE id = ?',
        [description, sim.id]
      );
      
      updated++;
      if (updated % 10 === 0) {
        console.log(`✅ Đã cập nhật ${updated}/${sims.length} sim`);
      }
    }

    console.log(`✅ Hoàn tất! Đã cập nhật description cho ${updated} sim`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

updateAllDescriptions();
