const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'Thu2220403',
  database: 'ai_sim_db'
});

async function checkOrders() {
  try {
    console.log('\n🔍 === CHECKING RECENT ORDERS ===\n');
    
    const [orders] = await pool.query(
      `SELECT 
        ma_don_hang AS order_id,
        so_sim,
        gia_mua AS amount,
        payment_status,
        trang_thai AS order_status,
        paid_at,
        transaction_id
      FROM don_hang 
      ORDER BY ma_don_hang DESC 
      LIMIT 10`
    );
    
    console.log('📊 Recent Orders:\n');
    console.table(orders);
    
    // Find problematic orders
    const problematic = orders.filter(o => o.transaction_id && o.payment_status === 'PENDING');
    
    if (problematic.length > 0) {
      console.log('\n⚠️  FOUND PROBLEMATIC ORDERS:');
      console.log('Orders with transaction_id BUT payment_status=PENDING:\n');
      console.table(problematic);
      
      console.log('\n🔧 These orders need fixing!');
      console.log('transaction_id exists = PayOS link created');
      console.log('payment_status=PENDING = Webhook NOT received yet\n');
      
      console.log('💡 To fix manually:');
      problematic.forEach(o => {
        console.log(`   node quick-approve.js ${o.order_id}`);
      });
    } else {
      console.log('\n✅ All orders are consistent!');
    }
    
    // Check paid orders
    const paid = orders.filter(o => o.payment_status === 'PAID');
    if (paid.length > 0) {
      console.log('\n💚 PAID Orders:');
      console.table(paid);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkOrders();
