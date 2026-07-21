const db = require('../config/db');

exports.getDashboardSummary = async (req, res) => {
  const storeId = req.user.store_id;

  try {
    // 1. Sales Summary for today (local time)
    const todayRes = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total_sales, COUNT(*) as txn_count
       FROM invoices
       WHERE store_id = $1 AND payment_status != 'Refunded' AND created_at >= CURRENT_DATE`,
      [storeId]
    );
    const todaySales = parseFloat(todayRes.rows[0].total_sales);
    const todayTxns = parseInt(todayRes.rows[0].txn_count);

    // 2. Low Stock Count
    const lowStockRes = await db.query(
      `SELECT COUNT(*) as low_stock_count
       FROM inventory
       WHERE store_id = $1 AND quantity <= low_stock_threshold`,
      [storeId]
    );
    const lowStockCount = parseInt(lowStockRes.rows[0].low_stock_count);

    // 3. Customer count
    const customerRes = await db.query(
      `SELECT COUNT(*) as customer_count FROM customers WHERE store_id = $1`,
      [storeId]
    );
    const customerCount = parseInt(customerRes.rows[0].customer_count);

    // 4. Sales Trends (Last 7 Days)
    const salesTrendRes = await db.query(
      `SELECT DATE(created_at) as date, COALESCE(SUM(total_amount), 0) as amount
       FROM invoices
       WHERE store_id = $1 AND payment_status != 'Refunded' AND created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) ASC`,
      [storeId]
    );

    // 5. Top 5 Selling Products
    const topProductsRes = await db.query(
      `SELECT p.name, SUM(ii.quantity) as qty, SUM(ii.quantity * ii.price) as revenue
       FROM invoice_items ii
       JOIN products p ON ii.product_id = p.id
       JOIN invoices i ON ii.invoice_id = i.id
       WHERE i.store_id = $1 AND i.payment_status != 'Refunded'
       GROUP BY p.name
       ORDER BY qty DESC
       LIMIT 5`,
      [storeId]
    );

    res.json({
      success: true,
      data: {
        summary: {
          todaySales,
          todayTxns,
          lowStockCount,
          customerCount
        },
        salesTrend: salesTrendRes.rows,
        topProducts: topProductsRes.rows
      }
    });
  } catch (error) {
    console.error('getDashboardSummary error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate dashboard summary' });
  }
};

exports.getSalesReport = async (req, res) => {
  const storeId = req.user.store_id;
  const { startDate, endDate } = req.query; // YYYY-MM-DD formats

  try {
    let queryParams = [storeId];
    let queryStr = `
      SELECT i.*, c.name as customer_name, u.username as cashier_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.store_id = $1
    `;

    if (startDate) {
      queryParams.push(startDate);
      queryStr += ` AND i.created_at >= $${queryParams.length}::timestamp`;
    }

    if (endDate) {
      queryParams.push(endDate + ' 23:59:59');
      queryStr += ` AND i.created_at <= $${queryParams.length}::timestamp`;
    }

    queryStr += ' ORDER BY i.created_at DESC';

    const invoicesRes = await db.query(queryStr, queryParams);

    // Calculate aggregations
    let totalRevenue = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    let refundedCount = 0;

    invoicesRes.rows.forEach(inv => {
      if (inv.payment_status !== 'Refunded') {
        totalRevenue += parseFloat(inv.total_amount);
        totalTax += parseFloat(inv.tax_amount);
        totalDiscount += parseFloat(inv.discount_amount);
      } else {
        refundedCount++;
      }
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalTax,
          totalDiscount,
          totalTransactions: invoicesRes.rows.length,
          refundedTransactions: refundedCount,
        },
        invoices: invoicesRes.rows,
      }
    });
  } catch (error) {
    console.error('getSalesReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate sales report' });
  }
};

exports.getGstReport = async (req, res) => {
  const storeId = req.user.store_id;
  const { startDate, endDate } = req.query;

  try {
    let queryParams = [storeId];
    let queryStr = `
      SELECT ii.tax_rate, COALESCE(SUM(ii.tax_amount), 0) as tax_amount, COALESCE(SUM(ii.quantity * ii.price - ii.discount_amount), 0) as taxable_value
      FROM invoice_items ii
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.store_id = $1 AND i.payment_status != 'Refunded'
    `;

    if (startDate) {
      queryParams.push(startDate);
      queryStr += ` AND i.created_at >= $${queryParams.length}::timestamp`;
    }

    if (endDate) {
      queryParams.push(endDate + ' 23:59:59');
      queryStr += ` AND i.created_at <= $${queryParams.length}::timestamp`;
    }

    queryStr += ' GROUP BY ii.tax_rate ORDER BY ii.tax_rate ASC';

    const result = await db.query(queryStr, queryParams);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('getGstReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate GST report' });
  }
};

exports.getAuditLogs = async (req, res) => {
  const storeId = req.user.store_id;

  try {
    let result;
    if (storeId) {
      // Store-scoped admin: show logs for this store
      result = await db.query(
        `SELECT a.*, u.username 
         FROM audit_logs a
         LEFT JOIN users u ON a.user_id = u.id
         WHERE a.store_id = $1
         ORDER BY a.created_at DESC
         LIMIT 200`,
        [storeId]
      );
    } else {
      // Super admin: show all audit logs across stores
      result = await db.query(
        `SELECT a.*, u.username 
         FROM audit_logs a
         LEFT JOIN users u ON a.user_id = u.id
         ORDER BY a.created_at DESC
         LIMIT 200`
      );
    }
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('getAuditLogs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
};


exports.getDailySalesReport = async (req, res) => {
  const storeId = req.user.store_id;
  const { startDate, endDate } = req.query;

  try {
    let queryParams = [storeId];
    let queryStr = `
      SELECT 
        DATE(created_at) as date, 
        COUNT(id) as invoice_count,
        COALESCE(SUM(subtotal), 0) as subtotal,
        COALESCE(SUM(discount_amount), 0) as discount_amount,
        COALESCE(SUM(tax_amount), 0) as tax_amount,
        COALESCE(SUM(total_amount), 0) as total_amount
      FROM invoices
      WHERE store_id = $1 AND payment_status != 'Refunded'
    `;

    if (startDate) {
      queryParams.push(startDate);
      queryStr += ` AND created_at >= $${queryParams.length}::timestamp`;
    }

    if (endDate) {
      queryParams.push(endDate + ' 23:59:59');
      queryStr += ` AND created_at <= $${queryParams.length}::timestamp`;
    }

    queryStr += ` GROUP BY DATE(created_at) ORDER BY DATE(created_at) DESC`;

    const result = await db.query(queryStr, queryParams);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('getDailySalesReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate daily sales report' });
  }
};

exports.getItemSalesReport = async (req, res) => {
  const storeId = req.user.store_id;
  const { startDate, endDate } = req.query;

  try {
    let queryParams = [storeId];
    let queryStr = `
      SELECT 
        p.name, 
        p.sku, 
        p.barcode,
        COALESCE(SUM(ii.quantity), 0) as quantity_sold,
        COALESCE(AVG(ii.price), 0) as avg_selling_price,
        COALESCE(SUM(ii.discount_amount), 0) as total_discount,
        COALESCE(SUM(ii.tax_amount), 0) as total_tax,
        COALESCE(SUM((ii.price * ii.quantity) - ii.discount_amount + ii.tax_amount), 0) as total_revenue
      FROM invoice_items ii
      JOIN products p ON ii.product_id = p.id
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.store_id = $1 AND i.payment_status != 'Refunded'
    `;

    if (startDate) {
      queryParams.push(startDate);
      queryStr += ` AND i.created_at >= $${queryParams.length}::timestamp`;
    }

    if (endDate) {
      queryParams.push(endDate + ' 23:59:59');
      queryStr += ` AND i.created_at <= $${queryParams.length}::timestamp`;
    }

    queryStr += ` GROUP BY p.id, p.name, p.sku, p.barcode ORDER BY quantity_sold DESC`;

    const result = await db.query(queryStr, queryParams);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('getItemSalesReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate item sales report' });
  }
};

exports.getCustomerSalesReport = async (req, res) => {
  const storeId = req.user.store_id;

  try {
    const queryStr = `
      SELECT 
        c.name,
        c.phone,
        c.email,
        c.credit_balance,
        c.loyalty_points,
        COUNT(i.id) as total_purchases,
        COALESCE(SUM(i.total_amount), 0) as total_spend
      FROM customers c
      LEFT JOIN invoices i ON c.id = i.customer_id AND i.payment_status != 'Refunded'
      WHERE c.store_id = $1
      GROUP BY c.id, c.name, c.phone, c.email, c.credit_balance, c.loyalty_points
      ORDER BY total_spend DESC
    `;

    const result = await db.query(queryStr, [storeId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('getCustomerSalesReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate customer sales report' });
  }
};

exports.getInventoryReport = async (req, res) => {
  const storeId = req.user.store_id;

  try {
    const queryStr = `
      SELECT 
        p.name,
        p.sku,
        p.barcode,
        p.cost_price,
        p.price,
        i.quantity,
        i.low_stock_threshold,
        (i.quantity * p.cost_price) as total_cost_value,
        (i.quantity * p.price) as total_retail_value
      FROM products p
      JOIN inventory i ON p.id = i.product_id
      WHERE p.store_id = $1 AND p.status = 'Active'
      ORDER BY i.quantity ASC
    `;

    const result = await db.query(queryStr, [storeId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('getInventoryReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate inventory report' });
  }
};
