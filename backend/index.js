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
    let query = 'SELECT * FROM sim_cards WHERE status = "Còn hàng"';
    const params = [];

    if (expectedNetwork) {
      query += ' AND network = ?';
      params.push(expectedNetwork);
    }

    if (priceLimit) {
      query += ' AND price <= ?';
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
      const nodes = sim.total_nodes || 0;
      fengShuiPoint += nodes; // 1 point per node
      explanations.push(`Điểm nút sim là ${nodes}/10.`);

      if (['Sim thần tài', 'Sim lộc phát'].includes(sim.category)) {
        fengShuiPoint = Math.min(10, fengShuiPoint + 2);
        explanations.push('Chứa yếu tố chiêu tài tiến bảo.');
      }
      fengShuiPoint = Math.min(10, fengShuiPoint);

      // 2. Calculate I (Interest Point)
      const simStr = sim.sim_number;
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
    const [rows] = await pool.query('SELECT * FROM sim_cards ORDER BY price ASC');
    
    // Thêm suitabilityScore mặc định cho kho sim
    const simsWithScore = rows.map(sim => ({
      ...sim,
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
    const [existing] = await pool.query('SELECT * FROM users WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập đã được sử dụng' });
    }
    
    // Thêm user mới
    await pool.query(
      'INSERT INTO users (name, password, role) VALUES (?, ?, ?)',
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
    
    const [users] = await pool.query('SELECT * FROM users WHERE name = ? AND password = ?', [name, password]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }
    
    const user = users[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
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
    const [users] = await pool.query('SELECT id, name, role, created_at FROM users ORDER BY created_at DESC');
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
      'INSERT INTO sim_cards (sim_number, network, price, category, feng_shui_element, total_nodes, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
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
    await pool.query('DELETE FROM sim_cards WHERE id = ?', [id]);
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
    
    await pool.query('UPDATE sim_cards SET status = ? WHERE id = ?', [status, id]);
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
    const [purchases] = await pool.query('SELECT * FROM purchases WHERE id = ?', [id]);
    if (purchases.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    
    const purchase = purchases[0];
    
    // Cập nhật status đơn hàng và ngày duyệt/hủy
    await pool.query(
      'UPDATE purchases SET status = ?, approval_date = NOW() WHERE id = ?', 
      [status, id]
    );
    
    // Nếu hủy đơn, trả sim về kho (status = "Còn hàng")
    if (status === 'Đã hủy') {
      await pool.query('UPDATE sim_cards SET status = ? WHERE sim_number = ?', ['Còn hàng', purchase.sim_number]);
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
      'INSERT INTO purchases (user_id, user_name, sim_number, network, price, category, customer_name, customer_phone, customer_address, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, user_name, sim_number, network, price, category, customer_name, customer_phone, customer_address, payment_method]
    );
    
    // Đổi status sim thành "Đã bán" thay vì xóa
    await pool.query('UPDATE sim_cards SET status = ? WHERE sim_number = ?', ['Đã bán', sim_number]);
    
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
      'INSERT INTO fengshui_history (user_id, user_name, birth_date, birth_time, gender, calendar_type, element, lucky_numbers) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
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
      'SELECT * FROM purchases ORDER BY purchase_date DESC'
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
      'SELECT * FROM fengshui_history ORDER BY view_date DESC'
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
      'INSERT INTO recommendation_history (user_id, user_name, birth_date, lucky_numbers, price_limit, expected_network, purpose, result_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
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
      'SELECT * FROM recommendation_history ORDER BY search_date DESC'
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
      'INSERT INTO messages (name, phone, email, message) VALUES (?, ?, ?, ?)',
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
      'SELECT * FROM messages ORDER BY created_at DESC'
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
    
    await pool.query('UPDATE messages SET status = ? WHERE id = ?', [status, id]);
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
