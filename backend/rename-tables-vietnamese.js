const mysql = require('mysql2/promise');

async function renameTablesVietnamese() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Thu2220403',
    database: 'ai_sim_db'
  });

  try {
    console.log('🔄 Bắt đầu đổi tên bảng sang tiếng Việt...\n');

    // Đổi tên các bảng
    const renames = [
      { old: 'users', new: 'nguoi_dung', desc: 'Người dùng' },
      { old: 'sim_cards', new: 'the_sim', desc: 'Thẻ sim' },
      { old: 'purchases', new: 'don_hang', desc: 'Đơn hàng' },
      { old: 'fengshui_history', new: 'lich_su_phong_thuy', desc: 'Lịch sử phong thủy' },
      { old: 'recommendation_history', new: 'lich_su_phan_tich', desc: 'Lịch sử phân tích' },
      { old: 'messages', new: 'tin_nhan', desc: 'Tin nhắn' }
    ];

    for (const { old, new: newName, desc } of renames) {
      try {
        await connection.query(`RENAME TABLE \`${old}\` TO \`${newName}\``);
        console.log(`✅ Đã đổi: ${old} → ${newName} (${desc})`);
      } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
          console.log(`⚠️  Bảng ${old} không tồn tại, bỏ qua`);
        } else if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`⚠️  Bảng ${newName} đã tồn tại, bỏ qua`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Hoàn thành đổi tên bảng!');
    console.log('\n⚠️  LƯU Ý: Bạn cần cập nhật lại TẤT CẢ code backend để dùng tên mới!');
    console.log('   - backend/index.js');
    console.log('   - Tất cả các file query database');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

renameTablesVietnamese();
