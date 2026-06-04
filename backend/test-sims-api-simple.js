const http = require('http');

function testSimsAPI() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/sims',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  console.log('🧪 Test API: GET http://localhost:5000/api/sims\n');

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (response.success) {
          const allSims = response.data;
          console.log(`✅ Tổng số sim từ API: ${allSims.length}`);
          
          const availableSims = allSims.filter(sim => sim.status === 'Còn hàng');
          const soldSims = allSims.filter(sim => sim.status === 'Đã bán');
          
          console.log(`📦 Sim còn hàng: ${availableSims.length}`);
          console.log(`🚫 Sim đã bán: ${soldSims.length}\n`);
          
          // Kiểm tra sim vừa thêm
          const newSim = allSims.find(sim => sim.sim_number === '0312345677');
          if (newSim) {
            console.log('✨ Tìm thấy sim mới thêm: 0312345677');
            console.log('   ID:', newSim.id);
            console.log('   Status:', newSim.status);
            console.log('   Price:', newSim.price);
            console.log('   Network:', newSim.network);
            console.log('   Category:', newSim.category);
            console.log('\n✅ Sim đã sẵn sàng hiển thị trên trang kho-so!');
          } else {
            console.log('❌ Không tìm thấy sim 0312345677 trong API response');
          }
          
        } else {
          console.log('❌ API trả về lỗi:', response.message);
        }
      } catch (error) {
        console.error('❌ Lỗi parse JSON:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Lỗi kết nối:', error.message);
    console.log('\n⚠️  Đảm bảo backend đang chạy trên http://localhost:5000');
  });

  req.end();
}

testSimsAPI();
