const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('Starting database seeding...');
  
  try {
    // 1. Check if store already exists
    const existingStore = await db.query("SELECT id FROM stores WHERE name = 'RAD Flagship Store' LIMIT 1");
    let storeId = null;
    
    if (existingStore.rows.length > 0) {
      storeId = existingStore.rows[0].id;
      console.log(`Using existing store with ID: ${storeId}`);
    } else {
      const storeRes = await db.query(
        `INSERT INTO stores (name, address, phone, email, gstin) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id`,
        ['RAD Flagship Store', '123 Retail Lane, Tech City', '9876543210', 'flagship@rad.com', '29AAAAA1111A1Z1']
      );
      storeId = storeRes.rows[0].id;
      console.log(`Default store created with ID: ${storeId}`);
    }

    // 2. Hash passwords
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const superPasswordHash = await bcrypt.hash('super123', 10);

    // 3. Create Super Admin
    await db.query(
      `INSERT INTO users (store_id, username, email, password_hash, role_id)
       VALUES (NULL, $1, $2, $3, 1)
       ON CONFLICT (username) DO NOTHING`,
      ['superadmin', 'superadmin@rad.com', superPasswordHash]
    );
    console.log('Super Admin user created (username: superadmin, password: super123)');

    // 4. Create Store Admin
    await db.query(
      `INSERT INTO users (store_id, username, email, password_hash, role_id)
       VALUES ($1, $2, $3, $4, 2)
       ON CONFLICT (username) DO NOTHING`,
      [storeId, 'admin', 'admin@rad.com', adminPasswordHash]
    );
    console.log('Store Admin user created (username: admin, password: admin123)');

    // 5. Create some categories
    const catRes1 = await db.query(
      `INSERT INTO categories (store_id, name, description) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (store_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [storeId, 'Electronics', 'Gadgets and appliances']
    );
    const catRes2 = await db.query(
      `INSERT INTO categories (store_id, name, description) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (store_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [storeId, 'Apparel', 'Clothing and garments']
    );
    const catRes3 = await db.query(
      `INSERT INTO categories (store_id, name, description) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (store_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [storeId, 'Fruits & Vegetables', 'Fresh farm produce']
    );

    const electronicsCatId = catRes1.rows[0]?.id;
    const apparelCatId = catRes2.rows[0]?.id;
    const produceCatId = catRes3.rows[0]?.id;

    // 6. Create some brands
    const brandRes1 = await db.query(
      `INSERT INTO brands (store_id, name, description) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (store_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [storeId, 'Apex', 'Premium tech brand']
    );
    const brandRes2 = await db.query(
      `INSERT INTO brands (store_id, name, description) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (store_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [storeId, 'Vogue', 'Fashion brand']
    );
    const brandRes3 = await db.query(
      `INSERT INTO brands (store_id, name, description) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (store_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [storeId, 'FarmFresh', 'Organic directly from farms']
    );

    const apexBrandId = brandRes1.rows[0]?.id;
    const vogueBrandId = brandRes2.rows[0]?.id;
    const farmFreshBrandId = brandRes3.rows[0]?.id;

    // 7. Create some default products & inventory
    const productsToSeed = [
      {
        sku: 'APX-PH-01',
        barcode: '123456789012',
        name: 'Apex Phone X1',
        description: 'Flagship smartphone with high resolution camera',
        price: 49999.00,
        cost_price: 35000.00,
        tax_rate: 18.00,
        category_id: electronicsCatId,
        brand_id: apexBrandId,
        qty: 50,
        low_stock: 5
      },
      {
        sku: 'VOG-TS-02',
        barcode: '987654321098',
        name: 'Vogue Polo T-Shirt M',
        description: 'Cotton slim-fit polo t-shirt',
        price: 999.00,
        cost_price: 400.00,
        tax_rate: 5.00,
        category_id: apparelCatId,
        brand_id: vogueBrandId,
        qty: 120,
        low_stock: 15
      },
      {
        sku: 'APX-CB-03',
        barcode: '111222333444',
        name: 'Apex Fast Charger 30W',
        description: 'Fast charger for smartphone devices',
        price: 1499.00,
        cost_price: 600.00,
        tax_rate: 18.00,
        category_id: electronicsCatId,
        brand_id: apexBrandId,
        qty: 4,
        low_stock: 10
      },
      // Vegetables and Fruits (30 items)
      { sku: 'VFG-APP-01', barcode: 'RADVFG01', name: 'Fresh Apple (Royal Gala) - 1kg', description: 'Sweet and crunchy gala apples', price: 180.00, cost_price: 120.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 50, low_stock: 10 },
      { sku: 'VFG-BAN-02', barcode: 'RADVFG02', name: 'Fresh Banana (Robusta) - 1 Dozen', description: 'Ripe yellow bananas', price: 60.00, cost_price: 40.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 100, low_stock: 15 },
      { sku: 'VFG-ORG-03', barcode: 'RADVFG03', name: 'Nagpur Oranges - 1kg', description: 'Juicy Nagpur oranges', price: 110.00, cost_price: 70.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 40, low_stock: 8 },
      { sku: 'VFG-MNG-04', barcode: 'RADVFG04', name: 'Mango (Alphonso) - 1kg', description: 'Sweet Alphonso mangoes', price: 350.00, cost_price: 250.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 30, low_stock: 5 },
      { sku: 'VFG-STR-05', barcode: 'RADVFG05', name: 'Strawberries - 1 Pack (200g)', description: 'Fresh red strawberries', price: 90.00, cost_price: 60.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 25, low_stock: 5 },
      { sku: 'VFG-GRP-06', barcode: 'RADVFG06', name: 'Green Grapes (Seedless) - 1kg', description: 'Sweet green grapes seedless', price: 140.00, cost_price: 90.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 35, low_stock: 8 },
      { sku: 'VFG-WTM-07', barcode: 'RADVFG07', name: 'Sweet Watermelon - 1 Unit', description: 'Fresh watermelon approx 3kg', price: 80.00, cost_price: 50.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 40, low_stock: 10 },
      { sku: 'VFG-POM-08', barcode: 'RADVFG08', name: 'Fresh Pomegranate - 1kg', description: 'Ruby red pomegranates', price: 160.00, cost_price: 110.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 30, low_stock: 6 },
      { sku: 'VFG-PIN-09', barcode: 'RADVFG09', name: 'Queen Pineapple - 1 Unit', description: 'Juicy queen pineapple', price: 75.00, cost_price: 45.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 20, low_stock: 5 },
      { sku: 'VFG-KIW-10', barcode: 'RADVFG10', name: 'Kiwi Fruit (Imported) - 1 Pack', description: 'Kiwi fruit pack of 3 units', price: 120.00, cost_price: 80.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 30, low_stock: 5 },
      { sku: 'VFG-PAP-11', barcode: 'RADVFG11', name: 'Papaya (Semi-Ripe) - 1 Unit', description: 'Fresh papaya approx 1.5kg', price: 60.00, cost_price: 35.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 25, low_stock: 5 },
      { sku: 'VFG-GUA-12', barcode: 'RADVFG12', name: 'Pink Guava - 1kg', description: 'Sweet pink guava', price: 90.00, cost_price: 50.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 30, low_stock: 6 },
      { sku: 'VFG-POT-13', barcode: 'RADVFG13', name: 'Potato (Jyoti) - 1kg', description: 'Fresh Jyoti potatoes', price: 35.00, cost_price: 20.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 200, low_stock: 30 },
      { sku: 'VFG-TOM-14', barcode: 'RADVFG14', name: 'Tomato (Local Hybrid) - 1kg', description: 'Fresh hybrid red tomatoes', price: 45.00, cost_price: 25.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 150, low_stock: 25 },
      { sku: 'VFG-ONN-15', barcode: 'RADVFG15', name: 'Red Onion (Nasik) - 1kg', description: 'Nasik red onions', price: 50.00, cost_price: 30.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 250, low_stock: 40 },
      { sku: 'VFG-GAR-16', barcode: 'RADVFG16', name: 'Garlic (White) - 250g', description: 'Peeled white garlic', price: 60.00, cost_price: 35.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 80, low_stock: 12 },
      { sku: 'VFG-GIN-17', barcode: 'RADVFG17', name: 'Fresh Ginger - 250g', description: 'Organic ginger root', price: 45.00, cost_price: 25.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 70, low_stock: 10 },
      { sku: 'VFG-CUC-18', barcode: 'RADVFG18', name: 'Salad Cucumber - 1kg', description: 'Crisp green salad cucumber', price: 35.00, cost_price: 20.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 90, low_stock: 15 },
      { sku: 'VFG-CAR-19', barcode: 'RADVFG19', name: 'Orange Carrot (Ooty) - 1kg', description: 'Sweet Ooty carrots', price: 70.00, cost_price: 40.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 80, low_stock: 12 },
      { sku: 'VFG-CAU-20', barcode: 'RADVFG20', name: 'Cauliflower - 1 Unit', description: 'Fresh white cauliflower head', price: 45.00, cost_price: 25.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 60, low_stock: 10 },
      { sku: 'VFG-CAB-21', barcode: 'RADVFG21', name: 'Green Cabbage - 1 Unit', description: 'Fresh green cabbage', price: 30.00, cost_price: 15.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 70, low_stock: 10 },
      { sku: 'VFG-BRO-22', barcode: 'RADVFG22', name: 'Green Broccoli - 1 Unit', description: 'Broccoli unit approx 300g', price: 75.00, cost_price: 40.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 40, low_stock: 8 },
      { sku: 'VFG-SPI-23', barcode: 'RADVFG23', name: 'Spinach (Palak Bundle)', description: 'Fresh green palak bundle', price: 20.00, cost_price: 12.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 100, low_stock: 20 },
      { sku: 'VFG-COR-24', barcode: 'RADVFG24', name: 'Coriander (Dhania Bundle)', description: 'Fresh coriander leaves bundle', price: 15.00, cost_price: 8.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 120, low_stock: 25 },
      { sku: 'VFG-MNT-25', barcode: 'RADVFG25', name: 'Fresh Mint (Pudina Bundle)', description: 'Pudina leaves bundle', price: 15.00, cost_price: 8.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 100, low_stock: 20 },
      { sku: 'VFG-CHL-26', barcode: 'RADVFG26', name: 'Green Chilli - 250g', description: 'Spicy green chillies', price: 30.00, cost_price: 15.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 60, low_stock: 10 },
      { sku: 'VFG-LEM-27', barcode: 'RADVFG27', name: 'Yellow Lemon - 1 Pack', description: 'Lemon pack of 6 units', price: 30.00, cost_price: 15.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 150, low_stock: 20 },
      { sku: 'VFG-CAP-28', barcode: 'RADVFG28', name: 'Green Capsicum - 1kg', description: 'Fresh green capsicum', price: 85.00, cost_price: 50.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 75, low_stock: 12 },
      { sku: 'VFG-OKR-29', barcode: 'RADVFG29', name: 'Ladies Finger (Okra) - 1kg', description: 'Fresh green ladies finger okras', price: 55.00, cost_price: 30.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 80, low_stock: 15 },
      { sku: 'VFG-BRN-30', barcode: 'RADVFG30', name: 'Brinjal (Bharta Eggplant) - 1kg', description: 'Big round bharta eggplants', price: 45.00, cost_price: 25.00, tax_rate: 0.00, category_id: produceCatId, brand_id: farmFreshBrandId, qty: 70, low_stock: 10 }
    ];

    for (const prod of productsToSeed) {
      const prodRes = await db.query(
        `INSERT INTO products (store_id, sku, barcode, name, description, category_id, brand_id, price, cost_price, tax_rate)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (store_id, barcode) DO NOTHING
         RETURNING id`,
        [
          storeId,
          prod.sku,
          prod.barcode,
          prod.name,
          prod.description,
          prod.category_id,
          prod.brand_id,
          prod.price,
          prod.cost_price,
          prod.tax_rate,
        ]
      );

      if (prodRes.rows.length > 0) {
        const prodId = prodRes.rows[0].id;
        // Insert inventory
        await db.query(
          `INSERT INTO inventory (store_id, product_id, quantity, low_stock_threshold)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (store_id, product_id) DO NOTHING`,
          [storeId, prodId, prod.qty, prod.low_stock]
        );
        
        // Log transaction
        await db.query(
          `INSERT INTO stock_transactions (store_id, product_id, type, quantity, reason)
           VALUES ($1, $2, 'Stock In', $3, 'Initial Seeding')`,
          [storeId, prodId, prod.qty]
        );
      }
    }
    console.log('Seeded sample categories, brands, products, and inventory levels');

    // 8. Create a default customer
    await db.query(
      `INSERT INTO customers (store_id, name, phone, email, loyalty_points, credit_balance)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (store_id, phone) DO NOTHING`,
      [storeId, 'Walk-in Customer', '0000000000', 'walkin@rad.com', 0, 0.00]
    );
    await db.query(
      `INSERT INTO customers (store_id, name, phone, email, loyalty_points, credit_balance)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (store_id, phone) DO NOTHING`,
      [storeId, 'Jane Doe', '9876500001', 'jane@doe.com', 120, 1500.00]
    );
    console.log('Seeded default customer records');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    process.exit(0);
  }
}

seed();
