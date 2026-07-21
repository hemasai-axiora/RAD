const db = require('../config/db');
const { logAction } = require('../services/auditLogger');

// Generate unique invoice number: INV-YYYYMMDD-XXXX
async function generateInvoiceNumber(storeId, client) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `INV-${dateStr}-`;
  
  // Get count of invoices for today to determine sequence
  const queryStr = `
    SELECT COUNT(*) as today_count 
    FROM invoices 
    WHERE store_id = $1 AND invoice_number LIKE $2
  `;
  const result = await client.query(queryStr, [storeId, `${prefix}%`]);
  const count = parseInt(result.rows[0].today_count) + 1;
  const sequence = String(count).padStart(4, '0');
  
  return `${prefix}${sequence}`;
}

exports.createInvoice = async (req, res) => {
  const storeId = req.user.store_id;
  const userId = req.user.id;
  const { customerId, items, payments, discountAmount = 0 } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No items in the invoice' });
  }

  if (!payments || payments.length === 0) {
    return res.status(400).json({ success: false, message: 'No payments specified' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Generate Invoice Number
    const invoiceNumber = await generateInvoiceNumber(storeId, client);

    // 2. Calculate Totals
    let subtotal = 0;
    let taxAmount = 0;
    let totalItemDiscount = 0;
    let finalDiscountAmount = parseFloat(discountAmount);

    const validatedItems = [];

    for (const item of items) {
      // Fetch product to verify details
      const prodRes = await client.query(
        `SELECT p.*, i.quantity 
         FROM products p
         JOIN inventory i ON p.id = i.product_id
         WHERE p.id = $1 AND p.store_id = $2 FOR UPDATE`,
        [item.productId, storeId]
      );

      if (prodRes.rows.length === 0) {
        throw new Error(`Product not found or inactive: ${item.productId}`);
      }

      const product = prodRes.rows[0];
      
      // Stock Check
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.quantity}, requested: ${item.quantity}`);
      }

      const itemQty = parseInt(item.quantity);
      const itemPrice = parseFloat(product.price);
      const itemCost = parseFloat(product.cost_price);
      const taxRate = parseFloat(product.tax_rate);
      const itemDiscount = parseFloat(item.discount || 0);

      // Line calculations
      const itemSubtotal = itemPrice * itemQty;
      // Tax calculations: price includes tax or excludes?
      // Standard: Tax is calculated on the discounted amount. E.g. Tax = (Price - Discount) * TaxRate / 100
      const itemTaxableAmount = itemSubtotal - itemDiscount;
      const itemTaxAmount = (itemTaxableAmount * taxRate) / 100;

      subtotal += itemSubtotal;
      taxAmount += itemTaxAmount;
      totalItemDiscount += itemDiscount;

      validatedItems.push({
        id: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        quantity: itemQty,
        price: itemPrice,
        taxRate,
        taxAmount: itemTaxAmount,
        discountAmount: itemDiscount,
        costPrice: itemCost
      });
    }

    const totalDiscountApplied = finalDiscountAmount + totalItemDiscount;
    const totalAmount = subtotal - totalDiscountApplied + taxAmount;

    // Verify payments match the total
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    // Allow small rounding difference
    if (Math.abs(totalPaid - totalAmount) > 0.05) {
      throw new Error(`Total payments (${totalPaid}) do not match bill total (${totalAmount.toFixed(2)})`);
    }

    // 3. Insert Invoice
    const invoiceRes = await client.query(
      `INSERT INTO invoices (store_id, invoice_number, customer_id, user_id, subtotal, discount_amount, tax_amount, total_amount, payment_status, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Paid', $9)
       RETURNING *`,
      [
        storeId,
        invoiceNumber,
        customerId || null,
        userId,
        subtotal,
        totalDiscountApplied,
        taxAmount,
        totalAmount,
        payments.length > 1 ? 'Split' : payments[0].paymentMethod
      ]
    );

    const invoice = invoiceRes.rows[0];

    // 4. Insert Invoice Items, Decrement Inventory & Log Stock Transactions
    for (const item of validatedItems) {
      // Insert item
      await client.query(
        `INSERT INTO invoice_items (invoice_id, product_id, quantity, price, tax_rate, tax_amount, discount_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [invoice.id, item.id, item.quantity, item.price, item.taxRate, item.taxAmount, item.discountAmount]
      );

      // Decrement stock
      await client.query(
        `UPDATE inventory 
         SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP 
         WHERE store_id = $2 AND product_id = $3`,
        [item.quantity, storeId, item.id]
      );

      // Log transaction
      await client.query(
        `INSERT INTO stock_transactions (store_id, product_id, type, quantity, reference_id, reason, performed_by)
         VALUES ($1, $2, 'Sale', $3, $4, $5, $6)`,
        [storeId, item.id, item.quantity, invoice.id, `Sale Invoice ${invoiceNumber}`, userId]
      );
    }

    // 5. Insert Invoice Payments
    let isCreditAccountUsed = false;
    let creditAmount = 0;

    for (const pay of payments) {
      await client.query(
        `INSERT INTO invoice_payments (invoice_id, payment_method, amount, transaction_reference)
         VALUES ($1, $2, $3, $4)`,
        [invoice.id, pay.paymentMethod, pay.amount, pay.reference || null]
      );

      if (pay.paymentMethod === 'Credit') {
        isCreditAccountUsed = true;
        creditAmount += parseFloat(pay.amount);
      }
    }

    // 6. Update Customer (Loyalty & Credit)
    if (customerId) {
      // Calculate loyalty points earned (1 point per 100 spent)
      const pointsEarned = Math.floor(totalAmount / 100);

      if (isCreditAccountUsed) {
        // Enforce credit balance increase
        await client.query(
          `UPDATE customers 
           SET loyalty_points = loyalty_points + $1, credit_balance = credit_balance + $2, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $3 AND store_id = $4`,
          [pointsEarned, creditAmount, customerId, storeId]
        );
      } else {
        await client.query(
          `UPDATE customers 
           SET loyalty_points = loyalty_points + $1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2 AND store_id = $3`,
          [pointsEarned, customerId, storeId]
        );
      }
    }

    await client.query('COMMIT');
    await logAction(storeId, userId, 'CREATE_INVOICE', 'billing', { invoiceId: invoice.id, invoiceNumber, totalAmount });

    // Fetch the full details to return
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        totalAmount: invoice.total_amount,
        subtotal: invoice.subtotal,
        taxAmount: invoice.tax_amount,
        discountAmount: invoice.discount_amount,
        paymentMethod: invoice.payment_method,
        createdAt: invoice.created_at,
        items: validatedItems
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('createInvoice error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to create invoice' });
  } finally {
    client.release();
  }
};

// Hold and Resume Bills
exports.holdBill = async (req, res) => {
  const storeId = req.user.store_id;
  const userId = req.user.id;
  const { customerId, items, subtotal, discountAmount, taxAmount, totalAmount } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No items to hold' });
  }

  try {
    const result = await db.query(
      `INSERT INTO held_bills (store_id, user_id, customer_id, items, subtotal, discount_amount, tax_amount, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        storeId,
        userId,
        customerId || null,
        JSON.stringify(items),
        subtotal || 0,
        discountAmount || 0,
        taxAmount || 0,
        totalAmount || 0
      ]
    );

    await logAction(storeId, userId, 'HOLD_BILL', 'billing', { heldBillId: result.rows[0].id });
    res.status(201).json({ success: true, data: result.rows[0], message: 'Bill held successfully' });
  } catch (error) {
    console.error('holdBill error:', error);
    res.status(500).json({ success: false, message: 'Failed to hold bill' });
  }
};

exports.getHeldBills = async (req, res) => {
  const storeId = req.user.store_id;
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT h.*, c.name as customer_name, c.phone as customer_phone 
       FROM held_bills h
       LEFT JOIN customers c ON h.customer_id = c.id
       WHERE h.store_id = $1 AND h.user_id = $2
       ORDER BY h.created_at DESC`,
      [storeId, userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('getHeldBills error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch held bills' });
  }
};

exports.resumeBill = async (req, res) => {
  const storeId = req.user.store_id;
  const { id } = req.params;

  try {
    // Fetch held bill
    const heldRes = await db.query(
      'SELECT * FROM held_bills WHERE id = $1 AND store_id = $2',
      [id, storeId]
    );

    if (heldRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Held bill not found' });
    }

    const heldBill = heldRes.rows[0];

    // Delete the held bill record now that it is being resumed
    await db.query('DELETE FROM held_bills WHERE id = $1 AND store_id = $2', [id, storeId]);

    await logAction(storeId, req.user.id, 'RESUME_BILL', 'billing', { heldBillId: id });
    res.json({ success: true, data: heldBill });
  } catch (error) {
    console.error('resumeBill error:', error);
    res.status(500).json({ success: false, message: 'Failed to resume bill' });
  }
};

// Returns & Refunds Workflow
exports.refundInvoice = async (req, res) => {
  const storeId = req.user.store_id;
  const userId = req.user.id;
  const { invoiceId } = req.params;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch Invoice
    const invoiceRes = await client.query(
      'SELECT * FROM invoices WHERE id = $1 AND store_id = $2 FOR UPDATE',
      [invoiceId, storeId]
    );

    if (invoiceRes.rows.length === 0) {
      throw new Error('Invoice not found');
    }

    const invoice = invoiceRes.rows[0];

    if (invoice.payment_status === 'Refunded') {
      throw new Error('Invoice has already been refunded');
    }

    // 2. Fetch Invoice Items
    const itemsRes = await client.query(
      'SELECT * FROM invoice_items WHERE invoice_id = $1',
      [invoiceId]
    );

    // 3. Restore Inventory & Log Transactions
    for (const item of itemsRes.rows) {
      // Re-increment stock
      await client.query(
        `UPDATE inventory 
         SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP 
         WHERE store_id = $2 AND product_id = $3`,
        [item.quantity, storeId, item.product_id]
      );

      // Log transaction
      await client.query(
        `INSERT INTO stock_transactions (store_id, product_id, type, quantity, reference_id, reason, performed_by)
         VALUES ($1, $2, 'Return', $3, $4, $5, $6)`,
        [storeId, item.product_id, item.quantity, invoice.id, `Refund for Invoice ${invoice.invoice_number}`, userId]
      );
    }

    // 4. Adjust Customer loyalty & credit if applicable
    if (invoice.customer_id) {
      const pointsToDeduct = Math.floor(parseFloat(invoice.total_amount) / 100);
      
      // Check if invoice payment was Credit, if so reduce their credit balance
      const paymentsRes = await client.query(
        `SELECT SUM(amount) as credit_amount 
         FROM invoice_payments 
         WHERE invoice_id = $1 AND payment_method = 'Credit'`,
        [invoiceId]
      );

      const creditToReduce = parseFloat(paymentsRes.rows[0].credit_amount || 0);

      await client.query(
        `UPDATE customers 
         SET loyalty_points = GREATEST(0, loyalty_points - $1), credit_balance = GREATEST(0.00, credit_balance - $2), updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3 AND store_id = $4`,
        [pointsToDeduct, creditToReduce, invoice.customer_id, storeId]
      );
    }

    // 5. Update Invoice status to Refunded
    await client.query(
      `UPDATE invoices 
       SET payment_status = 'Refunded', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND store_id = $2`,
      [invoiceId, storeId]
    );

    await client.query('COMMIT');
    await logAction(storeId, userId, 'REFUND_INVOICE', 'billing', { invoiceId, invoiceNumber: invoice.invoice_number, totalRefunded: invoice.total_amount });

    res.json({ success: true, message: 'Invoice refunded and inventory restored successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('refundInvoice error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to refund invoice' });
  } finally {
    client.release();
  }
};
