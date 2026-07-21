const db = require('../config/db');
const { logAction } = require('../services/auditLogger');

exports.getCustomers = async (req, res) => {
  const storeId = req.user.store_id;
  const { search } = req.query;

  try {
    let queryParams = [storeId];
    let queryStr = 'SELECT * FROM customers WHERE store_id = $1';

    if (search) {
      queryParams.push(`%${search}%`);
      queryStr += ` AND (name ILIKE $2 OR phone ILIKE $2)`;
    }

    queryStr += ' ORDER BY name ASC';

    const result = await db.query(queryStr, queryParams);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('getCustomers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
};

exports.createCustomer = async (req, res) => {
  const storeId = req.user.store_id;
  const { name, phone, email, loyaltyPoints, creditBalance } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and Phone number are required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO customers (store_id, name, phone, email, loyalty_points, credit_balance)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (store_id, phone) DO NOTHING
       RETURNING *`,
      [storeId, name, phone, email || null, loyaltyPoints || 0, creditBalance || 0.00]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Customer with this phone number already exists in this store' });
    }

    await logAction(storeId, req.user.id, 'CREATE_CUSTOMER', 'customers', { name, phone });
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('createCustomer error:', error);
    res.status(500).json({ success: false, message: 'Failed to register customer' });
  }
};

exports.getCustomerHistory = async (req, res) => {
  const storeId = req.user.store_id;
  const { id } = req.params;

  try {
    // Verify customer belongs to store
    const custCheck = await db.query(
      'SELECT id FROM customers WHERE id = $1 AND store_id = $2',
      [id, storeId]
    );

    if (custCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Fetch invoices
    const result = await db.query(
      `SELECT * FROM invoices 
       WHERE customer_id = $1 AND store_id = $2
       ORDER BY created_at DESC`,
      [id, storeId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('getCustomerHistory error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer purchase history' });
  }
};
