import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Search, 
  Barcode, 
  Trash2, 
  UserPlus, 
  Pause, 
  Play, 
  CreditCard, 
  DollarSign, 
  QrCode, 
  Layers,
  Printer,
  ChevronRight,
  Plus,
  Minus,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const POS = () => {
  // Cart & items states
  const [cart, setCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [billDiscount, setBillDiscount] = useState(0);

  // Customer states
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  // Held Bills states
  const [heldBills, setHeldBills] = useState([]);
  const [showHeldBillsModal, setShowHeldBillsModal] = useState(false);

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState('Cash'); // Cash, Card, UPI, Credit, Split
  const [splitAmounts, setSplitAmounts] = useState({ Cash: 0, Card: 0, UPI: 0 });
  const [paidReference, setPaidReference] = useState('');

  // Refund states
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundInvoiceNumber, setRefundInvoiceNumber] = useState('');
  const [refundInvoiceData, setRefundInvoiceData] = useState(null);

  // Print Receipt states
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [message, setMessage] = useState({ text: '', type: '' });

  // Refs for focusing
  const barcodeRef = useRef(null);
  const searchRef = useRef(null);

  // Autocomplete and initial load
  useEffect(() => {
    fetchCustomers();
    fetchHeldBills();
    // Keep focus on barcode scanner input for speed
    focusBarcodeField();
  }, []);

  const focusBarcodeField = () => {
    if (barcodeRef.current) {
      barcodeRef.current.focus();
    }
  };

  const showFeedback = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/customers');
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      console.error('Fetch customers error:', error);
    }
  };

  const fetchHeldBills = async () => {
    try {
      const response = await axios.get('/pos/held');
      if (response.data.success) {
        setHeldBills(response.data.data);
      }
    } catch (error) {
      console.error('Fetch held bills error:', error);
    }
  };

  // Search Products from query
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        searchProducts(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const searchProducts = async (query) => {
    try {
      const response = await axios.get(`/products?search=${query}`);
      if (response.data.success) {
        setSearchResults(response.data.data);
      }
    } catch (error) {
      console.error('Search products error:', error);
    }
  };

  // Handle Scanning or Submit Barcode
  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    try {
      const response = await axios.get(`/products?barcode=${barcodeInput.trim()}`);
      if (response.data.success && response.data.data.length > 0) {
        const product = response.data.data[0];
        addToCart(product);
        setBarcodeInput('');
      } else {
        showFeedback(`Barcode not found: ${barcodeInput}`, 'error');
        setBarcodeInput('');
      }
    } catch (error) {
      console.error('Barcode scan error:', error);
      showFeedback('Barcode lookup failed', 'error');
    }
    focusBarcodeField();
  };

  // Add Item to Cart
  const addToCart = (product) => {
    if (product.status !== 'Active') {
      showFeedback('Product is inactive', 'error');
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      
      // Stock warning check
      const currentQty = existing ? existing.cartQty : 0;
      if (product.quantity <= currentQty) {
        showFeedback(`Warning: Stock limit reached for ${product.name}`, 'error');
        return prevCart;
      }

      if (existing) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, cartQty: item.cartQty + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, cartQty: 1, discount: 0 }];
      }
    });
    setSearchQuery('');
    setSearchResults([]);
    showFeedback(`Added ${product.name} to cart`);
  };

  // Remove Item or adjust quantity
  const updateQty = (id, newQty) => {
    if (newQty <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== id));
      return;
    }

    const item = cart.find(i => i.id === id);
    if (item.quantity < newQty) {
      showFeedback(`Insufficient stock! Only ${item.quantity} units available.`, 'error');
      return;
    }

    setCart(prevCart => prevCart.map(item => 
      item.id === id ? { ...item, cartQty: newQty } : item
    ));
  };

  const updateItemDiscount = (id, discVal) => {
    const val = parseFloat(discVal) || 0;
    setCart(prevCart => prevCart.map(item => 
      item.id === id ? { ...item, discount: val } : item
    ));
  };

  // Calculations
  const calculateCart = () => {
    let subtotal = 0;
    let taxAmount = 0;
    let itemDiscounts = 0;

    cart.forEach(item => {
      const lineTotal = parseFloat(item.price) * item.cartQty;
      const discount = parseFloat(item.discount || 0);
      const taxable = lineTotal - discount;
      const tax = (taxable * parseFloat(item.tax_rate)) / 100;

      subtotal += lineTotal;
      itemDiscounts += discount;
      taxAmount += tax;
    });

    const totalDiscount = itemDiscounts + parseFloat(billDiscount || 0);
    const grandTotal = subtotal - totalDiscount + taxAmount;

    return {
      subtotal,
      taxAmount,
      totalDiscount,
      grandTotal: Math.max(0, grandTotal)
    };
  };

  const { subtotal, taxAmount, totalDiscount, grandTotal } = calculateCart();

  // Register Customer
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomerName || !newCustomerPhone) {
      showFeedback('Name and phone are required', 'error');
      return;
    }

    try {
      const response = await axios.post('/customers', {
        name: newCustomerName,
        phone: newCustomerPhone
      });
      if (response.data.success) {
        showFeedback('Customer registered successfully');
        setNewCustomerName('');
        setNewCustomerPhone('');
        setShowAddCustomerModal(false);
        fetchCustomers();
        setSelectedCustomerId(response.data.data.id);
      }
    } catch (error) {
      showFeedback(error.response?.data?.message || 'Failed to register customer', 'error');
    }
  };

  // Hold Bill
  const handleHoldBill = async () => {
    if (cart.length === 0) {
      showFeedback('Cart is empty', 'error');
      return;
    }

    try {
      const response = await axios.post('/pos/hold', {
        customerId: selectedCustomerId || null,
        items: cart,
        subtotal,
        discountAmount: totalDiscount,
        taxAmount,
        totalAmount: grandTotal
      });

      if (response.data.success) {
        showFeedback('Bill put on hold successfully');
        setCart([]);
        setSelectedCustomerId('');
        setBillDiscount(0);
        fetchHeldBills();
      }
    } catch (error) {
      showFeedback('Failed to hold bill', 'error');
    }
  };

  // Resume Bill
  const handleResumeBill = async (heldBillId) => {
    try {
      const response = await axios.post(`/pos/resume/${heldBillId}`);
      if (response.data.success) {
        const heldBill = response.data.data;
        // Parse items back to cart
        setCart(heldBill.items);
        setSelectedCustomerId(heldBill.customer_id || '');
        setBillDiscount(heldBill.discount_amount || 0);
        setShowHeldBillsModal(false);
        fetchHeldBills();
        showFeedback('Bill resumed');
      }
    } catch (error) {
      showFeedback('Failed to resume bill', 'error');
    }
  };

  // Checkout
  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) {
      showFeedback('Cart is empty', 'error');
      return;
    }

    // Assemble payments payload
    let paymentsPayload = [];
    if (paymentType === 'Split') {
      const totalSplitPaid = Object.values(splitAmounts).reduce((sum, v) => sum + parseFloat(v || 0), 0);
      if (Math.abs(totalSplitPaid - grandTotal) > 0.05) {
        showFeedback(`Split amounts total (${totalSplitPaid}) must match invoice total (${grandTotal.toFixed(2)})`, 'error');
        return;
      }
      paymentsPayload = Object.entries(splitAmounts)
        .filter(([_, amt]) => parseFloat(amt) > 0)
        .map(([method, amt]) => ({ paymentMethod: method, amount: parseFloat(amt), reference: paidReference }));
    } else {
      paymentsPayload = [{ paymentMethod: paymentType, amount: grandTotal, reference: paidReference }];
    }

    // Enforce Customer selection if payment type is 'Credit'
    if (paymentType === 'Credit' && !selectedCustomerId) {
      showFeedback('Customer profile is required for Credit sales account', 'error');
      return;
    }

    try {
      const payload = {
        customerId: selectedCustomerId || null,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.cartQty,
          discount: item.discount
        })),
        payments: paymentsPayload,
        discountAmount: billDiscount
      };

      const response = await axios.post('/pos/invoice', payload);
      if (response.data.success) {
        showFeedback('Transaction completed successfully!');
        
        // Save receipt data and launch receipt modal
        setActiveReceipt(response.data.data);
        setShowReceiptModal(true);
        
        // Reset states
        setCart([]);
        setSelectedCustomerId('');
        setBillDiscount(0);
        setPaidReference('');
        setSplitAmounts({ Cash: 0, Card: 0, UPI: 0 });
        setShowPaymentModal(false);
      }
    } catch (error) {
      showFeedback(error.response?.data?.message || 'Transaction failed', 'error');
    }
  };

  // Process Return/Refund Lookup
  const handleRefundSearch = async (e) => {
    e.preventDefault();
    if (!refundInvoiceNumber.trim()) return;

    try {
      const response = await axios.get(`/reports/sales?search=${refundInvoiceNumber.trim()}`);
      if (response.data.success && response.data.data.invoices.length > 0) {
        setRefundInvoiceData(response.data.data.invoices[0]);
      } else {
        showFeedback('Invoice number not found', 'error');
      }
    } catch (error) {
      showFeedback('Lookup failed', 'error');
    }
  };

  const handleProcessRefund = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to refund this invoice? All inventory counts will be restored.')) return;
    try {
      const response = await axios.post(`/pos/refund/${invoiceId}`);
      if (response.data.success) {
        showFeedback('Refund processed, inventory restored.');
        setRefundInvoiceData(null);
        setRefundInvoiceNumber('');
        setShowRefundModal(false);
      }
    } catch (error) {
      showFeedback(error.response?.data?.message || 'Refund failed', 'error');
    }
  };

  const triggerPrintReceipt = () => {
    window.print();
  };

  return (
    <div className="flex h-full flex-col space-y-4 no-print text-slate-100">
      {/* Top Banner Message */}
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 rounded-lg p-4 text-sm font-semibold shadow-lg transition-all duration-300 ${
          message.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {message.text}
        </div>
      )}

      {/* Top Bar controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">POS Sales Register</h1>
          <p className="text-xs text-slate-400 mt-0.5">Terminal ID: #RAD-01 | Cashier Active</p>
        </div>

        {/* Hold, Resume & Refund quick launch */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleHoldBill}
            disabled={cart.length === 0}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-slate-700 text-slate-300 disabled:opacity-50 cursor-pointer transition-all"
          >
            <Pause className="h-4 w-4" />
            <span>Hold Bill</span>
          </button>
          
          <button
            onClick={() => setShowHeldBillsModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-slate-700 text-slate-300 cursor-pointer transition-all relative"
          >
            <Play className="h-4 w-4" />
            <span>Resume</span>
            {heldBills.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] rounded-full h-4.5 w-4.5 flex items-center justify-center font-bold">
                {heldBills.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowRefundModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-red-950/40 text-xs font-semibold border border-slate-700 hover:border-red-900/50 text-slate-300 cursor-pointer transition-all"
          >
            <RotateCcw className="h-4 w-4 text-red-400" />
            <span className="text-red-300">Process Return</span>
          </button>
        </div>
      </div>

      {/* POS main panels split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Side: Product Search, Scanner, Items Table */}
        <div className="lg:col-span-8 flex flex-col space-y-4 min-h-0 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
          
          {/* Scanner Input & Search Bar Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Barcode scanner */}
            <form onSubmit={handleBarcodeSubmit} className="md:col-span-5 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Barcode className="h-5 w-5" />
              </span>
              <input
                ref={barcodeRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-800 bg-slate-950/60 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                placeholder="Scan barcode or press enter..."
              />
            </form>

            {/* Manual product search */}
            <div className="md:col-span-7 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="h-5 w-5" />
              </span>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-800 bg-slate-950/60 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                placeholder="Search products by SKU / Name..."
              />

              {/* Search dropdown results */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 z-30 max-h-60 overflow-y-auto bg-slate-900 border border-slate-850 rounded-lg shadow-2xl p-1">
                  {searchResults.map(prod => (
                    <button
                      key={prod.id}
                      onClick={() => addToCart(prod)}
                      className="w-full text-left flex items-center justify-between p-2 rounded-md hover:bg-slate-800/80 transition cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-semibold text-white">{prod.name}</p>
                        <p className="text-[10px] text-slate-400">SKU: {prod.sku} | Barcode: {prod.barcode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-indigo-400">₹{parseFloat(prod.price).toFixed(2)}</p>
                        <p className={`text-[9px] font-semibold ${prod.quantity <= 10 ? 'text-amber-400' : 'text-slate-500'}`}>
                          Stock: {prod.quantity}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Table */}
          <div className="flex-1 overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-2">Item Detail</th>
                  <th className="py-3 px-2 text-center">Qty</th>
                  <th className="py-3 px-2 text-right">Price</th>
                  <th className="py-3 px-2 text-right">Discount</th>
                  <th className="py-3 px-2 text-right">GST %</th>
                  <th className="py-3 px-2 text-right">Net Amount</th>
                  <th className="py-3 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-sm">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-slate-500 font-medium">
                      No products added. Scan barcodes or search above to begin checkout.
                    </td>
                  </tr>
                ) : (
                  cart.map(item => {
                    const totalLineVal = parseFloat(item.price) * item.cartQty;
                    const lineTaxable = totalLineVal - (item.discount || 0);
                    const lineTax = (lineTaxable * parseFloat(item.tax_rate)) / 100;
                    const netLine = lineTaxable + lineTax;

                    return (
                      <tr key={item.id} className="hover:bg-slate-850/20">
                        <td className="py-3 px-2">
                          <p className="font-semibold text-slate-200">{item.name}</p>
                          <p className="text-[10px] text-slate-500">SKU: {item.sku}</p>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => updateQty(item.id, item.cartQty - 1)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-755 hover:text-white cursor-pointer"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold">{item.cartQty}</span>
                            <button
                              onClick={() => updateQty(item.id, item.cartQty + 1)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-755 hover:text-white cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right font-medium text-slate-300">
                          ₹{parseFloat(item.price).toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <input
                            type="number"
                            value={item.discount || ''}
                            onChange={(e) => updateItemDiscount(item.id, e.target.value)}
                            className="w-16 text-right px-1 py-0.5 rounded border border-slate-800 bg-slate-950 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="py-3 px-2 text-right text-xs text-slate-400 font-medium">
                          {item.tax_rate}%
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-slate-200">
                          ₹{netLine.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => updateQty(item.id, 0)}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition cursor-pointer"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Cart Summary, Customer registers & checkout */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          {/* Customer Selection */}
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Customer Link</label>
              <button
                onClick={() => setShowAddCustomerModal(true)}
                className="flex items-center space-x-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>New Customer</span>
              </button>
            </div>
            
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full p-2 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Walk-in Customer (No profile)</option>
              {customers.map(cust => (
                <option key={cust.id} value={cust.id}>
                  {cust.name} ({cust.phone}) - Pts: {cust.loyalty_points}
                </option>
              ))}
            </select>
          </div>

          {/* Cart Pricing Breakdown */}
          <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-850 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">Bill Summary</h2>
              
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-medium text-slate-200">₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">GST Collected</span>
                <span className="font-medium text-slate-200">₹{taxAmount.toFixed(2)}</span>
              </div>

              {/* Bill discount input */}
              <div className="flex justify-between items-center text-sm gap-4">
                <span className="text-slate-400 flex-shrink-0">Bill Discount</span>
                <div className="relative w-28">
                  <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-500 text-xs">₹</span>
                  <input
                    type="number"
                    value={billDiscount || ''}
                    onChange={(e) => setBillDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full text-right pl-5 pr-2 py-1 rounded border border-slate-800 bg-slate-950 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm border-t border-slate-800 pt-3">
                <span className="text-slate-400">Total Deductions</span>
                <span className="font-medium text-red-400">-₹{totalDiscount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-end border-t border-slate-800 pt-3">
                <span className="text-sm font-semibold text-slate-300">Grand Total</span>
                <span className="text-2xl font-bold text-indigo-400">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector & Checkout */}
            <div className="mt-8 space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Select Payment Type</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => { setPaymentType('Cash'); setShowPaymentModal(false); }}
                    className={`py-2.5 rounded-lg font-semibold border flex items-center justify-center space-x-1.5 cursor-pointer ${
                      paymentType === 'Cash' 
                        ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/50' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Cash</span>
                  </button>
                  <button
                    onClick={() => { setPaymentType('Card'); setShowPaymentModal(false); }}
                    className={`py-2.5 rounded-lg font-semibold border flex items-center justify-center space-x-1.5 cursor-pointer ${
                      paymentType === 'Card' 
                        ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/50' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Card</span>
                  </button>
                  <button
                    onClick={() => { setPaymentType('UPI'); setShowPaymentModal(false); }}
                    className={`py-2.5 rounded-lg font-semibold border flex items-center justify-center space-x-1.5 cursor-pointer ${
                      paymentType === 'UPI' 
                        ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/50' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <QrCode className="h-4 w-4" />
                    <span>UPI</span>
                  </button>
                  <button
                    onClick={() => { setPaymentType('Split'); setShowPaymentModal(true); }}
                    className={`py-2.5 rounded-lg font-semibold border flex items-center justify-center space-x-1.5 cursor-pointer ${
                      paymentType === 'Split' 
                        ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/50' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="h-4 w-4" />
                    <span>Split / Multi</span>
                  </button>
                </div>
              </div>

              {/* Credit account checkbox */}
              <div className="flex items-center space-x-2 py-2 border-t border-b border-slate-800">
                <input
                  type="checkbox"
                  id="pay-credit"
                  checked={paymentType === 'Credit'}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPaymentType('Credit');
                    } else {
                      setPaymentType('Cash');
                    }
                  }}
                  className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="pay-credit" className="text-xs text-slate-300 font-medium">
                  Add total to Customer Credit Account
                </label>
              </div>

              {/* TXN Reference Input */}
              {paymentType !== 'Credit' && paymentType !== 'Split' && (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Transaction Ref (Optional)</label>
                  <input
                    type="text"
                    value={paidReference}
                    onChange={(e) => setPaidReference(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-800 bg-slate-950 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="E.g. UPI Ref, Card approval code"
                  />
                </div>
              )}

              {/* Checkout CTA */}
              <button
                onClick={handleCheckoutSubmit}
                disabled={cart.length === 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 transition duration-200 disabled:opacity-50 cursor-pointer"
              >
                <span>Checkout</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* 1. Modal: Register Customer */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Register New Customer</h3>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="E.g. Jane Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="E.g. 9876500001"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Resume Held Bills */}
      {showHeldBillsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Resume Held Bills</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {heldBills.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">No bills are currently held.</p>
              ) : (
                heldBills.map(bill => (
                  <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-850 bg-slate-950/50 hover:bg-slate-850/40 transition">
                    <div>
                      <p className="text-xs font-bold text-white">
                        Customer: {bill.customer_name || 'Walk-in'} {bill.customer_phone ? `(${bill.customer_phone})` : ''}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Held on: {new Date(bill.created_at).toLocaleString()} | Items count: {bill.items.length}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-indigo-400">₹{parseFloat(bill.total_amount).toFixed(2)}</span>
                      <button
                        onClick={() => handleResumeBill(bill.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-550 rounded text-xs font-bold text-white cursor-pointer"
                      >
                        Load
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setShowHeldBillsModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: Split Payments */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1.5">Split Payments Breakdown</h3>
            <p className="text-[11px] text-slate-400 mb-4">Required total: <span className="font-bold text-indigo-400">₹{grandTotal.toFixed(2)}</span></p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Cash Amount</label>
                <input
                  type="number"
                  value={splitAmounts.Cash || ''}
                  onChange={(e) => setSplitAmounts({ ...splitAmounts, Cash: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-indigo-500 text-right"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Card Amount</label>
                <input
                  type="number"
                  value={splitAmounts.Card || ''}
                  onChange={(e) => setSplitAmounts({ ...splitAmounts, Card: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-indigo-500 text-right"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">UPI Amount</label>
                <input
                  type="number"
                  value={splitAmounts.UPI || ''}
                  onChange={(e) => setSplitAmounts({ ...splitAmounts, UPI: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:border-indigo-500 text-right"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Split Approval reference</label>
                <input
                  type="text"
                  value={paidReference}
                  onChange={(e) => setPaidReference(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-sm text-slate-300 focus:outline-none"
                  placeholder="E.g. transaction IDs"
                />
              </div>

              {/* Total Paid check */}
              <div className="flex justify-between text-xs font-semibold border-t border-slate-850 pt-3">
                <span className="text-slate-400">Total Entered:</span>
                <span className="text-slate-200">
                  ₹{Object.values(splitAmounts).reduce((sum, v) => sum + v, 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-5">
              <button
                type="button"
                onClick={() => {
                  setPaymentType('Cash');
                  setShowPaymentModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 cursor-pointer"
              >
                Reset to Cash
              </button>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-550 text-white cursor-pointer"
              >
                Confirm Split
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Process Returns & Refund */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Process Customer Return</h3>
            <p className="text-xs text-slate-400 mb-4">Enter the sales invoice number to locate items and trigger stock restoral.</p>
            
            <form onSubmit={handleRefundSearch} className="flex space-x-2 mb-4">
              <input
                type="text"
                value={refundInvoiceNumber}
                onChange={(e) => setRefundInvoiceNumber(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none"
                placeholder="E.g. INV-20260719-0001"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 rounded-lg cursor-pointer"
              >
                Lookup
              </button>
            </form>

            {/* Found Invoice details */}
            {refundInvoiceData && (
              <div className="p-4 border border-red-500/20 bg-red-950/10 rounded-lg space-y-3 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Invoice:</span>
                  <span className="font-bold text-white">{refundInvoiceData.invoice_number}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Billing Date:</span>
                  <span className="font-semibold text-slate-300">
                    {new Date(refundInvoiceData.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Grand Total:</span>
                  <span className="font-bold text-red-400">₹{parseFloat(refundInvoiceData.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    refundInvoiceData.payment_status === 'Refunded' ? 'bg-red-500/20 text-red-300' : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {refundInvoiceData.payment_status}
                  </span>
                </div>

                {refundInvoiceData.payment_status !== 'Refunded' && (
                  <button
                    onClick={() => handleProcessRefund(refundInvoiceData.id)}
                    className="w-full mt-2 py-2 bg-red-600 hover:bg-red-500 rounded text-xs font-bold text-white cursor-pointer"
                  >
                    Confirm Full Refund & Return
                  </button>
                )}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundInvoiceData(null);
                  setRefundInvoiceNumber('');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: Receipt Preview & Printing */}
      {showReceiptModal && activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-2xl flex flex-col justify-between max-h-[90vh]">
            
            <h3 className="text-md font-bold text-white mb-3">Invoice Receipt Preview</h3>
            
            {/* Scrollable Receipt Area */}
            <div className="flex-1 overflow-y-auto border border-slate-800 bg-white text-black p-4 rounded-lg font-mono text-xs">
              <div className="text-center space-y-1 mb-4">
                <h4 className="font-extrabold text-base tracking-wider">RAD FLAGSHIP RETAIL</h4>
                <p className="text-[10px]">123 Retail Lane, Tech City</p>
                <p className="text-[10px]">Phone: 9876543210</p>
                <p className="text-[10px]">GSTIN: 29AAAAA1111A1Z1</p>
                <p className="border-t border-dashed border-slate-450 pt-2 text-[10px]">
                  Receipt: {activeReceipt.invoiceNumber}
                </p>
                <p className="text-[9px] text-slate-600">
                  Date: {new Date(activeReceipt.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="border-t border-b border-dashed border-slate-450 py-2 my-2 space-y-1">
                {activeReceipt.items && activeReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-[10px] text-slate-600">
                        {item.quantity} x ₹{parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>
                    <span className="font-bold">
                      ₹{((parseFloat(item.price) * item.quantity) - (item.discountAmount || 0)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-right text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{parseFloat(activeReceipt.subtotal).toFixed(2)}</span>
                </div>
                {parseFloat(activeReceipt.discountAmount) > 0 && (
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Discount:</span>
                    <span>-₹{parseFloat(activeReceipt.discountAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (GST):</span>
                  <span>₹{parseFloat(activeReceipt.taxAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-extrabold border-t border-dashed border-slate-450 pt-1">
                  <span>GRAND TOTAL:</span>
                  <span>₹{parseFloat(activeReceipt.totalAmount).toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center mt-6 border-t border-dashed border-slate-450 pt-3 text-[9px] text-slate-600">
                <p>Payment: {activeReceipt.paymentMethod}</p>
                <p className="mt-2 font-bold uppercase tracking-widest">Thank you for shopping!</p>
              </div>
            </div>

            {/* Print trigger actions */}
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowReceiptModal(false);
                  setActiveReceipt(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 cursor-pointer"
              >
                Close Register
              </button>
              <button
                type="button"
                onClick={triggerPrintReceipt}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-550 text-white flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print Invoice</span>
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* HIDDEN PRINT-ONLY DIV formatted for 80mm roll */}
      {activeReceipt && (
        <div className="hidden print-area print-container bg-white text-black font-mono text-[11px] leading-tight mx-auto p-2">
          <div className="text-center space-y-0.5 mb-2">
            <h4 className="font-bold text-sm">RAD FLAGSHIP RETAIL</h4>
            <p className="text-[9px]">123 Retail Lane, Tech City</p>
            <p className="text-[9px]">Phone: 9876543210</p>
            <p className="text-[9px]">GSTIN: 29AAAAA1111A1Z1</p>
            <div className="border-t border-dashed border-black my-1"></div>
            <p className="text-[9px]">Receipt: {activeReceipt.invoiceNumber}</p>
            <p className="text-[9px]">Date: {new Date(activeReceipt.createdAt).toLocaleString()}</p>
          </div>

          <div className="border-b border-dashed border-black py-1 my-1">
            {activeReceipt.items && activeReceipt.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-[10px] mb-1">
                <div>
                  <span className="font-bold">{item.name}</span>
                  <div className="text-[8px] text-gray-700">
                    {item.quantity} x ₹{parseFloat(item.price).toFixed(2)}
                  </div>
                </div>
                <span className="font-bold">
                  ₹{((parseFloat(item.price) * item.quantity) - (item.discountAmount || 0)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-0.5 text-right text-[9px] mb-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{parseFloat(activeReceipt.subtotal).toFixed(2)}</span>
            </div>
            {parseFloat(activeReceipt.discountAmount) > 0 && (
              <div className="flex justify-between font-bold">
                <span>Discount:</span>
                <span>-₹{parseFloat(activeReceipt.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST Tax:</span>
              <span>₹{parseFloat(activeReceipt.taxAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold border-t border-dashed border-black pt-1">
              <span>TOTAL DUE:</span>
              <span>₹{parseFloat(activeReceipt.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center border-t border-dashed border-black pt-2 text-[8px]">
            <p>Paid via: {activeReceipt.paymentMethod}</p>
            <p className="mt-1 font-bold">THANK YOU! VISIT AGAIN</p>
          </div>
        </div>
      )}

    </div>
  );
};
