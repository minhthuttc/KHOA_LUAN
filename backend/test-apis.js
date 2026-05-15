const axios = require('axios');

async function testAPIs() {
  const baseURL = 'http://localhost:5000';
  
  console.log('=== TESTING BACKEND APIs ===\n');

  // Test 1: Users API
  try {
    console.log('1. Testing /api/admin/users...');
    const usersRes = await axios.get(`${baseURL}/api/admin/users`);
    console.log(`✓ SUCCESS: ${usersRes.data.data.length} users found`);
    console.log('Sample:', usersRes.data.data[0]);
  } catch (error) {
    console.log('✗ FAILED:', error.response?.data || error.message);
  }

  console.log('\n');

  // Test 2: Purchases API
  try {
    console.log('2. Testing /api/admin/purchases...');
    const purchasesRes = await axios.get(`${baseURL}/api/admin/purchases`);
    console.log(`✓ SUCCESS: ${purchasesRes.data.data.length} purchases found`);
    if (purchasesRes.data.data.length > 0) {
      console.log('Sample:', purchasesRes.data.data[0]);
    }
  } catch (error) {
    console.log('✗ FAILED:', error.response?.data || error.message);
  }

  console.log('\n');

  // Test 3: Sims API
  try {
    console.log('3. Testing /api/sims...');
    const simsRes = await axios.get(`${baseURL}/api/sims`);
    console.log(`✓ SUCCESS: ${simsRes.data.data.length} sims found`);
  } catch (error) {
    console.log('✗ FAILED:', error.response?.data || error.message);
  }

  console.log('\n');

  // Test 4: Fengshui History API
  try {
    console.log('4. Testing /api/admin/fengshui-history...');
    const fengshuiRes = await axios.get(`${baseURL}/api/admin/fengshui-history`);
    console.log(`✓ SUCCESS: ${fengshuiRes.data.data.length} fengshui records found`);
  } catch (error) {
    console.log('✗ FAILED:', error.response?.data || error.message);
  }

  console.log('\n=== TEST COMPLETED ===');
}

testAPIs();
