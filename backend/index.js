const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'Thu2220403',
  database: 'ai_sim_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Mock weights
const w1 = 0.5; // Phong thủy
const w2 = 0.4; // Sở thích
const w3 = 0.1; // Hành vi

app.post('/api/recommend', async (req, res) => {
  try {
    const { birthDate, luckyNumbers, priceLimit, expectedNetwork } = req.body;
    
    // Fetch sim cards roughly matching price and network if provided
    let query = 'SELECT * FROM the_sim WHERE trang_thai = "Còn hàng"';
    const params = [];

    if (expectedNetwork) {
      query += ' AND nha_mang = ?';
      params.push(expectedNetwork);
    }

    if (priceLimit) {
      query += ' AND gia_ban <= ?';
      params.push(priceLimit);
    }

    const [rows] = await pool.query(query, params);

    // Filter and score
    const recommendations = rows.map(sim => {
      let fengShuiPoint = 0;
      let interestPoint = 0;
      let behaviorPoint = Math.floor(Math.random() * 5) + 5; // Mock 5-9 points
      let explanations = [];

      // 1. Calculate P (Feng Shui)
      const nodes = sim.diem_nut || 0;
      fengShuiPoint += nodes; // 1 point per node
      explanations.push(`Điểm nút sim là ${nodes}/10.`);

      if (['Sim thần tài', 'Sim lộc phát'].includes(sim.loai_sim)) {
        fengShuiPoint = Math.min(10, fengShuiPoint + 2);
        explanations.push('Chứa yếu tố chiêu tài tiến bảo.');
      }
      fengShuiPoint = Math.min(10, fengShuiPoint);

      // 2. Calculate I (Interest Point)
      const simStr = sim.so_sim;
      if (birthDate) {
        // Simple logic: if sim endswith birth year
        const year = birthDate.split('-')[0]; // Format expected YYYY-MM-DD
        if (year && simStr.endsWith(year)) {
          interestPoint += 5;
          explanations.push(`Đuôi sim chứa năm sinh ${year} của bạn.`);
        }
      }

      if (luckyNumbers && Array.isArray(luckyNumbers)) {
        let matched = 0;
        luckyNumbers.forEach(num => {
          if (simStr.includes(num)) {
            interestPoint += 2;
            matched++;
          }
        });
        if (matched > 0) {
          explanations.push(`Sim chứa ${matched} con số may mắn của bạn.`);
        }
      }
      interestPoint = Math.min(10, interestPoint);
      if (interestPoint === 0) interestPoint = 2; // base score

      // 3. Final Score
      const suitabilityScore = (w1 * fengShuiPoint) + (w2 * interestPoint) + (w3 * behaviorPoint);

      return {
        ...sim,
        fengShuiPoint,
        interestPoint,
        behaviorPoint,
        suitabilityScore: suitabilityScore.toFixed(2),
        explainableAI: explanations
      };
    });

    // Sort by S point descending
    recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    // Return top 10
    res.json({
      success: true,
      data: recommendations.slice(0, 10)
    });

  } catch (error) {
    console.error('Error in /api/recommend:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// API endpoint to get all sims
app.get('/api/sims', async (req, res) => {
  try {
    // Lấy tất cả sim, bao gồm cả sim đã bán
    const [rows] = await pool.query('SELECT * FROM the_sim ORDER BY gia_ban ASC');
    
    // Thêm suitabilityScore mặc định cho kho sim
    const simsWithScore = rows.map(sim => ({
      ...sim,
      sim_number: sim.so_sim,
      network: sim.nha_mang,
      price: sim.gia_ban,
      category: sim.loai_sim,
      feng_shui_element: sim.menh_phong_thuy,
      total_nodes: sim.diem_nut,
      status: sim.trang_thai,
      description: sim.mo_ta,
      suitabilityScore: 0,
      explainableAI: []
    }));
    
    res.json({
      success: true,
      data: simsWithScore
    });
  } catch (error) {
    console.error('Error in /api/sims:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// API đăng ký
app.post('/api/register', async (req, res) => {
  try {
    const { name, password } = req.body;
    
    // Kiểm tra tên đã tồn tại
    const [existing] = await pool.query('SELECT * FROM nguoi_dung WHERE ten_dang_nhap = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập đã được sử dụng' });
    }
    
    // Thêm user mới
    await pool.query(
      'INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau, vai_tro) VALUES (?, ?, ?)',
      [name, password, 'customer']
    );
    
    res.json({ success: true, message: 'Đăng ký thành công' });
  } catch (error) {
    console.error('Error in /api/register:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API đăng nhập
app.post('/api/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    
    const [users] = await pool.query('SELECT * FROM nguoi_dung WHERE ten_dang_nhap = ? AND mat_khau = ?', [name, password]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }
    
    const user = users[0];
    res.json({
      success: true,
      user: {
        id: user.ma_nguoi_dung,
        name: user.ten_dang_nhap,
        role: user.vai_tro
      }
    });
  } catch (error) {
    console.error('Error in /api/login:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API lấy danh sách users (admin only)
app.get('/api/admin/users', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT ma_nguoi_dung as id, ten_dang_nhap as name, vai_tro as role, ngay_tao as created_at FROM nguoi_dung ORDER BY ngay_tao DESC');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error in /api/admin/users:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API quản lý sim (admin)
app.post('/api/admin/sims', async (req, res) => {
  try {
    const { sim_number, network, price, category, feng_shui_element, total_nodes } = req.body;
    
    await pool.query(
      'INSERT INTO the_sim (so_sim, nha_mang, gia_ban, loai_sim, menh_phong_thuy, diem_nut, trang_thai) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [sim_number, network, price, category, feng_shui_element, total_nodes, 'Còn hàng']
    );
    
    res.json({ success: true, message: 'Thêm sim thành công' });
  } catch (error) {
    console.error('Error in /api/admin/sims:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.delete('/api/admin/sims/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM the_sim WHERE ma_sim = ?', [id]);
    res.json({ success: true, message: 'Xóa sim thành công' });
  } catch (error) {
    console.error('Error in /api/admin/sims:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API cập nhật status sim (admin)
app.put('/api/admin/sims/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await pool.query('UPDATE the_sim SET trang_thai = ? WHERE ma_sim = ?', [status, id]);
    res.json({ success: true, message: 'Cập nhật trạng thái sim thành công' });
  } catch (error) {
    console.error('Error in /api/admin/sims/status:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API cập nhật status đơn hàng (admin)
app.put('/api/admin/purchases/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Lấy thông tin đơn hàng
    const [purchases] = await pool.query('SELECT * FROM don_hang WHERE ma_don_hang = ?', [id]);
    if (purchases.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    
    const purchase = purchases[0];
    
    // Cập nhật status đơn hàng và ngày duyệt/hủy
    await pool.query(
      'UPDATE don_hang SET trang_thai = ?, ngay_duyet = NOW() WHERE ma_don_hang = ?', 
      [status, id]
    );
    
    // Nếu hủy đơn, trả sim về kho (status = "Còn hàng")
    if (status === 'Đã hủy') {
      await pool.query('UPDATE the_sim SET trang_thai = ? WHERE so_sim = ?', ['Còn hàng', purchase.so_sim]);
    }
    
    res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công' });
  } catch (error) {
    console.error('Error in /api/admin/purchases/status:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API mua sim (lưu lịch sử)
app.post('/api/purchase', async (req, res) => {
  try {
    const { user_id, user_name, sim_number, network, price, category, customer_name, customer_phone, customer_address, payment_method } = req.body;
    
    // Lưu lịch sử mua hàng
    await pool.query(
      'INSERT INTO don_hang (ma_nguoi_dung, ten_nguoi_dung, so_sim, nha_mang, gia_mua, loai_sim, ten_khach_hang, sdt_khach_hang, dia_chi_khach_hang, phuong_thuc_thanh_toan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, user_name, sim_number, network, price, category, customer_name, customer_phone, customer_address, payment_method]
    );
    
    // Đổi status sim thành "Đã bán" thay vì xóa
    await pool.query('UPDATE the_sim SET trang_thai = ? WHERE so_sim = ?', ['Đã bán', sim_number]);
    
    res.json({ success: true, message: 'Đã lưu lịch sử mua sim và cập nhật trạng thái' });
  } catch (error) {
    console.error('Error in /api/purchase:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API lưu lịch sử xem phong thủy
app.post('/api/fengshui-history', async (req, res) => {
  try {
    const { user_id, user_name, birth_date, birth_time, gender, calendar_type, element, lucky_numbers } = req.body;
    
    await pool.query(
      'INSERT INTO lich_su_phong_thuy (ma_nguoi_dung, ten_nguoi_dung, ngay_sinh, gio_sinh, gioi_tinh, loai_lich, menh, so_may_man) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, user_name, birth_date, birth_time, gender, calendar_type, element, lucky_numbers]
    );
    
    res.json({ success: true, message: 'Đã lưu lịch sử xem phong thủy' });
  } catch (error) {
    console.error('Error in /api/fengshui-history:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API lấy lịch sử mua sim (admin)
app.get('/api/admin/purchases', async (req, res) => {
  try {
    const [purchases] = await pool.query(
      'SELECT ma_don_hang as id, ma_nguoi_dung as user_id, ten_nguoi_dung as user_name, so_sim as sim_number, nha_mang as network, gia_mua as price, loai_sim as category, ten_khach_hang as customer_name, sdt_khach_hang as customer_phone, dia_chi_khach_hang as customer_address, phuong_thuc_thanh_toan as payment_method, ngay_mua as purchase_date, trang_thai as status, ngay_duyet as approval_date FROM don_hang ORDER BY ngay_mua DESC'
    );
    res.json({ success: true, data: purchases });
  } catch (error) {
    console.error('Error in /api/admin/purchases:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API lấy lịch sử xem phong thủy (admin)
app.get('/api/admin/fengshui-history', async (req, res) => {
  try {
    const [history] = await pool.query(
      'SELECT ma_lich_su as id, ma_nguoi_dung as user_id, ten_nguoi_dung as user_name, ngay_sinh as birth_date, gio_sinh as birth_time, gioi_tinh as gender, loai_lich as calendar_type, menh as element, so_may_man as lucky_numbers, ngay_xem as view_date FROM lich_su_phong_thuy ORDER BY ngay_xem DESC'
    );
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error in /api/admin/fengshui-history:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API lưu lịch sử phân tích nhu cầu
app.post('/api/recommendation-history', async (req, res) => {
  try {
    const { user_id, user_name, birth_date, lucky_numbers, price_limit, expected_network, purpose, result_count } = req.body;
    
    await pool.query(
      'INSERT INTO lich_su_phan_tich (ma_nguoi_dung, ten_nguoi_dung, ngay_sinh, so_may_man, ngan_sach, nha_mang_mong_muon, muc_dich, so_ket_qua) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, user_name, birth_date, lucky_numbers, price_limit, expected_network, purpose, result_count]
    );
    
    res.json({ success: true, message: 'Đã lưu lịch sử phân tích' });
  } catch (error) {
    console.error('Error in /api/recommendation-history:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API lấy lịch sử phân tích nhu cầu (admin)
app.get('/api/admin/recommendation-history', async (req, res) => {
  try {
    const [history] = await pool.query(
      'SELECT ma_lich_su as id, ma_nguoi_dung as user_id, ten_nguoi_dung as user_name, ngay_sinh as birth_date, so_may_man as lucky_numbers, ngan_sach as price_limit, nha_mang_mong_muon as expected_network, muc_dich as purpose, so_ket_qua as result_count, ngay_tim_kiem as search_date FROM lich_su_phan_tich ORDER BY ngay_tim_kiem DESC'
    );
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error in /api/admin/recommendation-history:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API lưu tin nhắn liên hệ
app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
    
    await pool.query(
      'INSERT INTO tin_nhan (ten_nguoi_gui, sdt_nguoi_gui, email_nguoi_gui, noi_dung) VALUES (?, ?, ?, ?)',
      [name, phone, email || null, message]
    );
    
    res.json({ success: true, message: 'Đã gửi tin nhắn thành công' });
  } catch (error) {
    console.error('Error in /api/contact:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API lấy danh sách tin nhắn (admin)
app.get('/api/admin/messages', async (req, res) => {
  try {
    const [messages] = await pool.query(
      'SELECT ma_tin_nhan as id, ten_nguoi_gui as name, sdt_nguoi_gui as phone, email_nguoi_gui as email, noi_dung as message, trang_thai as status, ngay_gui as created_at FROM tin_nhan ORDER BY ngay_gui DESC'
    );
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error in /api/admin/messages:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API đánh dấu tin nhắn đã đọc
app.put('/api/admin/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await pool.query('UPDATE tin_nhan SET trang_thai = ? WHERE ma_tin_nhan = ?', [status, id]);
    res.json({ success: true, message: 'Đã cập nhật trạng thái' });
  } catch (error) {
    console.error('Error in /api/admin/messages:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
