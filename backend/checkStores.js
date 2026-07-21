const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5433, database: 'rad_db', user: 'rad_user', password: 'rad_password' });

async function run() {
  try {
    const stores = await pool.query('SELECT id, name FROM stores');
    console.log('STORES in DB:');
    stores.rows.forEach(s => console.log(`- ${s.name}: ${s.id}`));

    const users = await pool.query('SELECT username, store_id FROM users');
    console.log('\nUSERS in DB:');
    users.rows.forEach(u => console.log(`- ${u.username}: store_id = ${u.store_id}`));

    const products = await pool.query('SELECT store_id, COUNT(*) FROM products GROUP BY store_id');
    console.log('\nPRODUCTS count per store_id:');
    products.rows.forEach(p => console.log(`- store_id = ${p.store_id}: count = ${p.count}`));

    const inventory = await pool.query('SELECT store_id, COUNT(*) FROM inventory GROUP BY store_id');
    console.log('\nINVENTORY count per store_id:');
    inventory.rows.forEach(i => console.log(`- store_id = ${i.store_id}: count = ${i.count}`));

  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
