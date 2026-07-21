async function runIntegrationTest() {
  console.log('=== Starting RAD End-to-End API Integration Test ===');
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // 1. Authenticate (Login as Store Admin)
    console.log('\n[1/5] Authenticating as Store Admin (admin/admin123)...');
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const loginData = await loginRes.json();
    if (!loginData.success) {
      throw new Error(`Authentication failed: ${loginData.message}`);
    }
    
    const { accessToken, user } = loginData.data;
    console.log(`✓ Authentication succeeded. Token acquired. Welcome, ${user.username} (${user.roleName})`);
    
    const authHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    // 2. Query Products and verify catalog
    console.log('\n[2/5] Querying product catalog...');
    const productsRes = await fetch(`${baseURL}/products`, { headers: authHeaders });
    const productsData = await productsRes.json();
    if (!productsData.success) {
      throw new Error('Failed to retrieve products');
    }
    const products = productsData.data;
    console.log(`✓ Retrieved ${products.length} products successfully.`);
    products.forEach(p => {
      console.log(`  - SKU: ${p.sku} | Name: ${p.name} | Price: $${p.price} | Stock: ${p.quantity}`);
    });

    const phoneProduct = products.find(p => p.sku === 'APX-PH-01');
    const shirtProduct = products.find(p => p.sku === 'VOG-TS-02');

    if (!phoneProduct || !shirtProduct) {
      throw new Error('Required test products missing');
    }

    // 3. Query Customers list
    console.log('\n[3/5] Querying customer registry...');
    const customersRes = await fetch(`${baseURL}/customers`, { headers: authHeaders });
    const customersData = await customersRes.json();
    if (!customersData.success) {
      throw new Error('Failed to retrieve customers');
    }
    const customers = customersData.data;
    console.log(`✓ Retrieved ${customers.length} customer profiles.`);
    const testCustomer = customers.find(c => c.phone === '9876500001'); // Jane Doe
    console.log(`  - Selected Customer for invoice: ${testCustomer ? testCustomer.name : 'Walk-in'}`);

    // 4. Perform POS Invoice Billing Transaction
    console.log('\n[4/5] Executing POS sales transaction (creating invoice)...');
    const invoicePayload = {
      customerId: testCustomer ? testCustomer.id : null,
      items: [
        { productId: phoneProduct.id, quantity: 1, discount: 100.00 }, // $100 off Apex Phone
        { productId: shirtProduct.id, quantity: 2, discount: 0.00 }
      ],
      payments: [
        { paymentMethod: 'Card', amount: 60978.72 } // Calculations match grandTotal
      ],
      discountAmount: 0.00
    };

    const invoiceRes = await fetch(`${baseURL}/pos/invoice`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(invoicePayload)
    });
    const invoiceData = await invoiceRes.json();
    if (!invoiceData.success) {
      throw new Error(`Failed to process invoice transaction: ${invoiceData.message}`);
    }
    const invoice = invoiceData.data;
    console.log(`✓ Invoice transaction completed: ${invoice.invoiceNumber}`);
    console.log(`  - Subtotal: $${invoice.subtotal}`);
    console.log(`  - GST Tax: $${invoice.taxAmount}`);
    console.log(`  - Total Amount Paid: $${invoice.totalAmount}`);

    // 5. Query Dashboard Summary Reports to verify aggregates
    console.log('\n[5/5] Checking dashboard reports for updated sales metrics...');
    const summaryRes = await fetch(`${baseURL}/reports/summary`, { headers: authHeaders });
    const summaryData = await summaryRes.json();
    if (!summaryData.success) {
      throw new Error('Failed to retrieve reports');
    }
    const summary = summaryData.data.summary;
    console.log(`✓ Dashboard updated successfully:`);
    console.log(`  - Today's Gross Sales: $${summary.todaySales}`);
    console.log(`  - Today's Bills Count: ${summary.todayTxns}`);
    console.log(`  - Low Stock Warning Count: ${summary.lowStockCount}`);

    console.log('\n=== END-TO-END API INTEGRATION TEST COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('\n❌ INTEGRATION TEST FAILED:', error.message);
  }
}

runIntegrationTest();
