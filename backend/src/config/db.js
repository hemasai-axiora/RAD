const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'rad_user',
  password: process.env.DB_PASSWORD || 'rad_password',
  database: process.env.DB_NAME || 'rad_db',
});

// Test connection on startup
pool.on('connect', () => {
  console.log('Database pool connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
