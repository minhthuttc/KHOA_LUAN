const axios = require('axios');

async function testSimsAPI() {
  try {
    console.log('🧪 Test API: GET /api/sims\n');
    
    const response = await axios.get('http://localhost:5000/api/sims');
    
    if (response.data.success) {
      const allSims = response.data.data;
      console.log(`✅ Tổng số sim từ API: ${allSims.length}`);
      
      const availableSims = allSims.filter(sim => sim.status === 'Còn hàng');
      const soldSims = allSims.filter(sim => sim.status === 'Đã bán');
      
      console.log(`📦 Sim còn hàng: ${availableSims.length}`);
      console.log(`🚫 Sim đã bán: ${soldSims.length}\n`);
      
      console.log('📋 5 Sim mới nhất còn hàng:\n');
      availableSims.slice(0, 5).forEach((sim, index) => {
        console.log(`${index + 1}. ${sim.sim_number} - ${sim.network}`);
        console.log(`   Giá: ${Number(sim.price).toLocaleString('vi-VN')} đ`);
        console.log(`   Loại: ${sim.category}`);
        console.log(`   Trạng thái: ${sim.status}\n`);
      });
      
      // Kiểm tra sim vừa thêm
      const newSim = allSims.find(sim => sim.sim_number === '0312345677');
      if (newSim) {
        console.log('✨ Tìm thấy sim mới thêm: 0312345677');
        console.log('   Status:', newSim.status);
        console.log('   Price:', newSim.price);
        console.log('   Network:', newSim.network);
      } else {
        console.log('❌ Không tìm thấy sim 0312345677 trong API response');
      }
      
    } else {
      console.log('❌ API trả về lỗi:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi gọi API:', error.message);
  }
}

testSimsAPI();
