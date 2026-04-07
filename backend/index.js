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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
