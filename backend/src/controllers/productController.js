const db = require('../config/db');
const { logAction } = require('../services/auditLogger');
const fs = require('fs');
const csv = require('csv-parser');

// 1. Categories
exports.getCategories = async (req, res) => {
  const storeId = req.user.store_id; // Store isolation
  try {
    const result = await db.query(
      'SELECT * FROM categories WHERE store_id = $1 ORDER BY name ASC',
      [storeId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('getCategories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

exports.createCategory = async (req, res) => {
  const storeId = req.user.store_id;
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO categories (store_id, name, description) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (store_id, name) DO NOTHING 
       RETURNING *`,
      [storeId, name, description]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    await logAction(storeId, req.user.id, 'CREATE_CATEGORY', 'products', { name });
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('createCategory error:', error);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};

// 2. Brands
exports.getBrands = async (req, res) => {
  const storeId = req.user.store_id;
  try {
    const result = await db.query(
      'SELECT * FROM brands WHERE store_id = $1 ORDER BY name ASC',
      [storeId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('getBrands error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch brands' });
  }
};

exports.createBrand = async (req, res) => {
  const storeId = req.user.store_id;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Brand name is required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO brands (store_id, name, description) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (store_id, name) DO NOTHING 
       RETURNING *`,
      [storeId, name, description]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Brand already exists' });
    }

    await logAction(storeId, req.user.id, 'CREATE_BRAND', 'products', { name });
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('createBrand error:', error);
    res.status(500).json({ success: false, message: 'Failed to create brand' });
  }
};

// 3. Products
exports.getProducts = async (req, res) => {
  // Allow Super Admin to pass storeId, otherwise enforce user's store isolation
  let storeId = req.user.store_id;
  if (!storeId && req.query.storeId) {
    storeId = req.query.storeId;
  }

  const { search, categoryId, brandId, barcode, lowStock } = req.query;

  try {
    let queryParams = [storeId];
    let queryStr = `
      SELECT p.*, c.name as category_name, b.name as brand_name, i.quantity, i.low_stock_threshold, i.expiry_date, i.batch_number
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN inventory i ON p.id = i.product_id AND p.store_id = i.store_id
      WHERE p.store_id = $1
    `;

    if (search) {
      queryParams.push(`%${search}%`);
      queryStr += ` AND (p.name ILIKE $${queryParams.length} OR p.sku ILIKE $${queryParams.length} OR p.barcode ILIKE $${queryParams.length})`;
    }

    if (categoryId) {
      queryParams.push(categoryId);
      queryStr += ` AND p.category_id = $${queryParams.length}`;
    }

    if (brandId) {
      queryParams.push(brandId);
      queryStr += ` AND p.brand_id = $${queryParams.length}`;
    }

    if (barcode) {
      queryParams.push(barcode);
      queryStr += ` AND p.barcode = $${queryParams.length}`;
    }

    if (lowStock === 'true') {
      queryStr += ` AND i.quantity <= i.low_stock_threshold`;
    }

    queryStr += ` ORDER BY p.name ASC`;

    const result = await db.query(queryStr, queryParams);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

exports.createProduct = async (req, res) => {
  const storeId = req.user.store_id;
  const {
    sku,
    barcode,
    name,
    description,
    category_id,
    brand_id,
    price,
    cost_price,
    tax_rate,
    quantity,
    low_stock_threshold,
    batch_number,
    expiry_date
  } = req.body;

  if (!name || !price || !cost_price) {
    return res.status(400).json({ success: false, message: 'Name, selling price, and cost price are required' });
  }

  // Generate unique barcode if not provided
  let finalBarcode = barcode;
  if (!finalBarcode) {
    finalBarcode = 'RAD' + Math.floor(100000000 + Math.random() * 900000000).toString();
  }

  // Generate unique SKU if not provided
  let finalSku = sku;
  if (!finalSku) {
    finalSku = 'SKU-' + name.substring(0, 3).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000).toString();
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Insert product
    const prodRes = await client.query(
      `INSERT INTO products (store_id, sku, barcode, name, description, category_id, brand_id, price, cost_price, tax_rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [storeId, finalSku, finalBarcode, name, description, category_id, brand_id, price, cost_price, tax_rate || 18.00]
    );

    const product = prodRes.rows[0];
    const initialQty = quantity || 0;

    // Create inventory record
    await client.query(
      `INSERT INTO inventory (store_id, product_id, quantity, low_stock_threshold, batch_number, expiry_date)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [storeId, product.id, initialQty, low_stock_threshold || 10, batch_number || null, expiry_date || null]
    );

    // Write stock transaction if initial stock > 0
    if (initialQty > 0) {
      await client.query(
        `INSERT INTO stock_transactions (store_id, product_id, type, quantity, reason, performed_by)
         VALUES ($1, $2, 'Stock In', $3, 'Initial Product Setup', $4)`,
        [storeId, product.id, initialQty, req.user.id]
      );
    }

    await client.query('COMMIT');

    await logAction(storeId, req.user.id, 'CREATE_PRODUCT', 'products', { sku: finalSku, name });
    
    // Attach inventory info for return response
    product.quantity = initialQty;
    product.low_stock_threshold = low_stock_threshold || 10;

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('createProduct error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'SKU or Barcode already exists in this store' });
    }
    res.status(500).json({ success: false, message: 'Failed to create product' });
  } finally {
    client.release();
  }
};

exports.updateProduct = async (req, res) => {
  const storeId = req.user.store_id;
  const { id } = req.params;
  const {
    sku,
    barcode,
    name,
    description,
    category_id,
    brand_id,
    price,
    cost_price,
    tax_rate,
    status,
    low_stock_threshold,
    batch_number,
    expiry_date
  } = req.body;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Update product properties
    const prodRes = await client.query(
      `UPDATE products 
       SET sku = $1, barcode = $2, name = $3, description = $4, category_id = $5, brand_id = $6, price = $7, cost_price = $8, tax_rate = $9, status = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 AND store_id = $12
       RETURNING *`,
      [sku, barcode, name, description, category_id, brand_id, price, cost_price, tax_rate, status, id, storeId]
    );

    if (prodRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Update inventory threshold, batch, expiry
    await client.query(
      `UPDATE inventory 
       SET low_stock_threshold = $1, batch_number = $2, expiry_date = $3, updated_at = CURRENT_TIMESTAMP
       WHERE product_id = $4 AND store_id = $5`,
      [low_stock_threshold || 10, batch_number || null, expiry_date || null, id, storeId]
    );

    await client.query('COMMIT');
    await logAction(storeId, req.user.id, 'UPDATE_PRODUCT', 'products', { id, name });

    res.json({ success: true, data: prodRes.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('updateProduct error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  } finally {
    client.release();
  }
};

exports.deleteProduct = async (req, res) => {
  const storeId = req.user.store_id;
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM products WHERE id = $1 AND store_id = $2 RETURNING name',
      [id, storeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await logAction(storeId, req.user.id, 'DELETE_PRODUCT', 'products', { id, name: result.rows[0].name });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('deleteProduct error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

// 4. Bulk Import Products from CSV
exports.bulkImport = async (req, res) => {
  const storeId = req.user.store_id;
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const results = [];
  const errors = [];
  let successCount = 0;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      // Clean up temporary uploaded file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Failed to delete temp file:', err);
      }

      const client = await db.pool.connect();
      try {
        for (let i = 0; i < results.length; i++) {
          const row = results[i];
          const name = row.name || row.Name;
          const sku = row.sku || row.Sku || row.SKU;
          let barcode = row.barcode || row.Barcode || row.BARCODE;
          const price = parseFloat(row.price || row.Price || 0);
          const cost_price = parseFloat(row.cost_price || row.CostPrice || row.costPrice || 0);
          const tax_rate = parseFloat(row.tax_rate || row.TaxRate || row.taxRate || 18.00);
          const quantity = parseInt(row.quantity || row.Qty || row.Quantity || 0);

          if (!name || isNaN(price) || isNaN(cost_price)) {
            errors.push(`Row ${i + 1}: Name, price and cost_price are required and must be numbers`);
            continue;
          }

          if (!barcode) {
            barcode = 'RAD' + Math.floor(100000000 + Math.random() * 900000000).toString();
          }

          const finalSku = sku || 'SKU-' + name.substring(0, 3).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000).toString();

          try {
            await client.query('BEGIN');

            const prodRes = await client.query(
              `INSERT INTO products (store_id, sku, barcode, name, price, cost_price, tax_rate)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (store_id, barcode) DO NOTHING
               RETURNING id`,
              [storeId, finalSku, barcode, name, price, cost_price, tax_rate]
            );

            if (prodRes.rows.length > 0) {
              const prodId = prodRes.rows[0].id;
              // Create inventory
              await client.query(
                `INSERT INTO inventory (store_id, product_id, quantity)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (store_id, product_id) DO NOTHING`,
                [storeId, prodId, quantity]
              );

              if (quantity > 0) {
                await client.query(
                  `INSERT INTO stock_transactions (store_id, product_id, type, quantity, reason, performed_by)
                   VALUES ($1, $2, 'Stock In', $3, 'Bulk Import', $4)`,
                  [storeId, prodId, quantity, req.user.id]
                );
              }

              await client.query('COMMIT');
              successCount++;
            } else {
              await client.query('ROLLBACK');
              errors.push(`Row ${i + 1}: Barcode ${barcode} already exists`);
            }
          } catch (rowErr) {
            await client.query('ROLLBACK');
            errors.push(`Row ${i + 1}: DB Error - ${rowErr.message}`);
          }
        }

        await logAction(storeId, req.user.id, 'BULK_IMPORT_PRODUCTS', 'products', { successCount, totalCount: results.length });
        res.json({
          success: true,
          message: `Bulk import completed. Successfully imported ${successCount}/${results.length} products.`,
          errors: errors.length > 0 ? errors : null,
        });
      } catch (err) {
        console.error('Bulk import process error:', err);
        res.status(500).json({ success: false, message: 'Failed to process bulk import' });
      } finally {
        client.release();
      }
    });
};
