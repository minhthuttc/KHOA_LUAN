const mysql = require('mysql2/promise');
(async () => {
  const c = await mysql.createConnection({host:'127.0.0.1',user:'root',password:'Thu2220403',database:'ai_sim_db'});
  const [rows] = await c.query("SELECT ten_dang_nhap, ngay_sinh FROM nguoi_dung WHERE ten_dang_nhap LIKE '%Minh%Thu%'");
  console.log(rows);
  await c.end();
})();
