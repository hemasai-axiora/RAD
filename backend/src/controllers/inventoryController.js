const db = require('../config/db');
const { logAction } = require('../services/auditLogger');

exports.getInventory = async (req, res) => {
  const storeId = req.user.store_id;
  try {
    const queryStr = `
      SELECT i.*, p.name as product_name, p.sku, p.barcode, p.price, p.cost_price, c.name as category_name
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE i.store_id = $1
      ORDER BY p.name ASC
    `;
    const result = await db.query(queryStr, [storeId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('getInventory error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory levels' });
  }
};

exports.adjustStock = async (req, res) => {
  const storeId = req.user.store_id;
  const { productId, quantity, type, reason } = req.body; // type: 'Stock In', 'Stock Out', 'Adjustment'

  if (!productId || isNaN(quantity) || !type) {
    return res.status(400).json({ success: false, message: 'ProductId, quantity, and type are required' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch current quantity
    const invRes = await client.query(
      'SELECT quantity FROM inventory WHERE store_id = $1 AND product_id = $2 FOR UPDATE',
      [storeId, productId]
    );

    if (invRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Inventory record not found for this product' });
    }

    const currentQty = invRes.rows[0].quantity;
    
    // Adjust quantity based on type
    // If quantity is sent as a delta, e.g. 5, type = 'Stock In' -> newQty = current + 5.
    // If type = 'Stock Out' -> newQty = current - 5.
    // If type = 'Adjustment' -> we can either set absolute or add delta. Standard is adding/subtracting delta.
    let delta = quantity;
    if (type === 'Stock Out' && delta > 0) {
      delta = -delta;
    }

    const newQty = currentQty + delta;
    if (newQty < 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Stock adjustment would result in negative inventory' });
    }

    // 2. Update quantity
    await client.query(
      `UPDATE inventory 
       SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE store_id = $2 AND product_id = $3`,
      [newQty, storeId, productId]
    );

    // 3. Log stock transaction
    await client.query(
      `INSERT INTO stock_transactions (store_id, product_id, type, quantity, reason, performed_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [storeId, productId, type, Math.abs(delta), reason || 'Manual adjustment', req.user.id]
    );

    await client.query('COMMIT');
    await logAction(storeId, req.user.id, 'ADJUST_INVENTORY', 'inventory', { productId, type, delta });

    res.json({ success: true, message: 'Stock adjusted successfully', data: { quantity: newQty } });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('adjustStock error:', error);
    res.status(500).json({ success: false, message: 'Failed to adjust inventory' });
  } finally {
    client.release();
  }
};
