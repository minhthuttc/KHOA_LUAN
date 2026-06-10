// Check payment consistency for all orders
const { checkPaymentConsistency } = require('./services/paymentHandler');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'Thu2220403',
  database: 'ai_sim_db'
});

async function checkAllOrders() {
  try {
    console.log('\n🔍 === CHECKING PAYMENT CONSISTENCY FOR ALL ORDERS ===\n');
    
    // Get all orders
    const [orders] = await pool.query(
      `SELECT ma_don_hang, so_sim, payment_status, paid_at, transaction_id, trang_thai
       FROM don_hang 
       ORDER BY ma_don_hang DESC 
       LIMIT 50`
    );
    
    console.log(`📊 Checking ${orders.length} recent orders...\n`);
    
    const inconsistentOrders = [];
    const consistentOrders = [];
    
    for (const order of orders) {
      const result = await checkPaymentConsistency(order.ma_don_hang);
      
      if (!result.consistent) {
        inconsistentOrders.push({
          orderId: order.ma_don_hang,
          simNumber: order.so_sim,
          payment_status: order.payment_status,
          paid_at: order.paid_at,
          transaction_id: order.transaction_id,
          order_status: order.trang_thai,
          issues: result.inconsistencies || [{ message: result.reason }]
        });
      } else {
        consistentOrders.push(order.ma_don_hang);
      }
    }
    
    console.log('📈 SUMMARY:');
    console.log(`   ✅ Consistent orders: ${consistentOrders.length}`);
    console.log(`   ❌ Inconsistent orders: ${inconsistentOrders.length}`);
    console.log('');
    
    if (inconsistentOrders.length > 0) {
      console.log('🚨 === INCONSISTENT ORDERS FOUND ===\n');
      
      inconsistentOrders.forEach(order => {
        console.log(`❌ Order #${order.orderId} - SIM: ${order.simNumber}`);
        console.log(`   payment_status: ${order.payment_status}`);
        console.log(`   paid_at: ${order.paid_at}`);
        console.log(`   transaction_id: ${order.transaction_id}`);
        console.log(`   order_status: ${order.order_status}`);
        console.log(`   Issues:`);
        order.issues.forEach(issue => {
          console.log(`      - ${issue.message} [${issue.severity || 'ERROR'}]`);
        });
        console.log('');
      });
      
      console.log('🔧 TO FIX THESE ORDERS:\n');
      inconsistentOrders.forEach(order => {
        // Determine fix action
        if (order.transaction_id && order.payment_status === 'PENDING') {
          console.log(`   node quick-approve.js ${order.orderId}  # Fix order ${order.orderId}`);
        }
      });
      console.log('');
      
    } else {
      console.log('✅ All orders are consistent! No issues found.\n');
    }
    
    // Show examples of consistent states
    console.log('📋 EXAMPLES OF CONSISTENT STATES:\n');
    const [exampleOrders] = await pool.query(
      `SELECT ma_don_hang, payment_status, paid_at, transaction_id 
       FROM don_hang 
       LIMIT 5`
    );
    
    console.table(exampleOrders.map(o => ({
      order_id: o.ma_don_hang,
      payment_status: o.payment_status,
      has_paid_at: o.paid_at ? 'YES' : 'NO',
      has_transaction_id: o.transaction_id ? 'YES' : 'NO',
      consistent: checkConsistentQuick(o) ? '✅' : '❌'
    })));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

function checkConsistentQuick(order) {
  // Quick consistency check
  if (order.transaction_id && order.payment_status === 'PENDING') return false;
  if (order.payment_status === 'PAID' && !order.paid_at) return false;
  if (order.paid_at && order.payment_status !== 'PAID') return false;
  return true;
}

checkAllOrders();
