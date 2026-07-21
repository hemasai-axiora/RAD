import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  ShoppingCart, 
  AlertCircle, 
  Users, 
  FileSpreadsheet, 
  Calendar,
  Layers,
  User,
  Activity,
  ArrowRight,
  Clock,
  Printer,
  ChevronRight
} from 'lucide-react';

export const Reports = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview'); // overview, daily, items, customers, inventory, transactions
  const [summary, setSummary] = useState({
    todaySales: 0,
    todayTxns: 0,
    lowStockCount: 0,
    customerCount: 0
  });

  const [salesTrend, setSalesTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [gstReport, setGstReport] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // New report states
  const [dailySales, setDailySales] = useState([]);
  const [itemSales, setItemSales] = useState([]);
  const [customerSales, setCustomerSales] = useState([]);
  const [inventoryValuation, setInventoryValuation] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transactionsSummary, setTransactionsSummary] = useState({
    totalRevenue: 0,
    totalTax: 0,
    totalDiscount: 0,
    totalTransactions: 0,
    refundedTransactions: 0
  });

  // Invoice Detail Modal State
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Date range filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchReports(); // fetches GST & Audit
    } else if (activeTab === 'daily') {
      fetchDailySales();
    } else if (activeTab === 'items') {
      fetchItemSales();
    } else if (activeTab === 'customers') {
      fetchCustomerSales();
    } else if (activeTab === 'inventory') {
      fetchInventoryValuation();
    } else if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [startDate, endDate, activeTab]);

  const showFeedback = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get('/reports/summary');
      if (response.data.success) {
        setSummary(response.data.data.summary);
        const formattedTrend = response.data.data.salesTrend.map(item => ({
          ...item,
          formattedDate: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        }));
        setSalesTrend(formattedTrend);
        setTopProducts(response.data.data.topProducts);
      }
    } catch (error) {
      console.error('Fetch summary metrics error:', error);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      let queryParams = '';
      if (startDate) queryParams += `?startDate=${startDate}`;
      if (endDate) queryParams += `${startDate ? '&' : '?'}endDate=${endDate}`;

      const gstResponse = await axios.get(`/reports/gst${queryParams}`);
      if (gstResponse.data.success) {
        setGstReport(gstResponse.data.data);
      }

      const auditResponse = await axios.get('/reports/audit');
      if (auditResponse.data.success) {
        setAuditLogs(auditResponse.data.data);
      }
    } catch (error) {
      console.error('Fetch GST & Audit logs error:', error);
      showFeedback('Failed to load reports data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySales = async () => {
    setLoading(true);
    try {
      let queryParams = '';
      if (startDate) queryParams += `?startDate=${startDate}`;
      if (endDate) queryParams += `${startDate ? '&' : '?'}endDate=${endDate}`;

      const response = await axios.get(`/reports/daily-sales${queryParams}`);
      if (response.data.success) {
        setDailySales(response.data.data);
      }
    } catch (error) {
      console.error('Fetch daily sales error:', error);
      showFeedback('Failed to load daily sales report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchItemSales = async () => {
    setLoading(true);
    try {
      let queryParams = '';
      if (startDate) queryParams += `?startDate=${startDate}`;
      if (endDate) queryParams += `${startDate ? '&' : '?'}endDate=${endDate}`;

      const response = await axios.get(`/reports/item-sales${queryParams}`);
      if (response.data.success) {
        setItemSales(response.data.data);
      }
    } catch (error) {
      console.error('Fetch item-wise sales error:', error);
      showFeedback('Failed to load item-wise report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerSales = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/reports/customer-sales');
      if (response.data.success) {
        setCustomerSales(response.data.data);
      }
    } catch (error) {
      console.error('Fetch customer sales error:', error);
      showFeedback('Failed to load customer sales report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryValuation = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/reports/inventory');
      if (response.data.success) {
        setInventoryValuation(response.data.data);
      }
    } catch (error) {
      console.error('Fetch inventory valuation error:', error);
      showFeedback('Failed to load inventory valuation report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let queryParams = '';
      if (startDate) queryParams += `?startDate=${startDate}`;
      if (endDate) queryParams += `${startDate ? '&' : '?'}endDate=${endDate}`;

      const response = await axios.get(`/reports/sales${queryParams}`);
      if (response.data.success) {
        setTransactions(response.data.data.invoices);
        setTransactionsSummary(response.data.data.summary);
      }
    } catch (error) {
      console.error('Fetch transactions error:', error);
      showFeedback('Failed to load sales history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const downloadCSV = (title, headers, rows) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    rows.forEach(row => {
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.replace(/\s+/g, '_')}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback(`${title} CSV downloaded successfully`);
  };

  const exportDailySalesCSV = () => {
    const headers = ["Date", "Invoices Count", "Gross Subtotal (₹)", "Discounts Given (₹)", "GST Tax (₹)", "Net Total (₹)"];
    const rows = dailySales.map(row => [
      new Date(row.date).toLocaleDateString(),
      row.invoice_count,
      parseFloat(row.subtotal).toFixed(2),
      parseFloat(row.discount_amount).toFixed(2),
      parseFloat(row.tax_amount).toFixed(2),
      parseFloat(row.total_amount).toFixed(2)
    ]);
    downloadCSV("Daily_Sales", headers, rows);
  };

  const exportItemSalesCSV = () => {
    const headers = ["Product Name", "SKU", "Barcode", "Qty Sold", "Avg Price (₹)", "Total Discount (₹)", "Total Tax (₹)", "Total Revenue (₹)"];
    const rows = itemSales.map(row => [
      `"${row.name}"`,
      row.sku,
      row.barcode,
      row.quantity_sold,
      parseFloat(row.avg_selling_price).toFixed(2),
      parseFloat(row.total_discount).toFixed(2),
      parseFloat(row.total_tax).toFixed(2),
      parseFloat(row.total_revenue).toFixed(2)
    ]);
    downloadCSV("Itemwise_Sales", headers, rows);
  };

  const exportCustomerSalesCSV = () => {
    const headers = ["Customer Name", "Phone", "Email", "Invoices Purchased", "Total Spend (₹)", "Current Credit Balance (₹)", "Loyalty Points"];
    const rows = customerSales.map(row => [
      `"${row.name}"`,
      row.phone,
      row.email || 'N/A',
      row.total_purchases,
      parseFloat(row.total_spend).toFixed(2),
      parseFloat(row.credit_balance).toFixed(2),
      row.loyalty_points
    ]);
    downloadCSV("Customerwise_Sales", headers, rows);
  };

  const exportInventoryValuationCSV = () => {
    const headers = ["Product Name", "SKU", "Barcode", "Cost Price (₹)", "Retail Price (₹)", "Qty Stock", "Cost Value (₹)", "Retail Value (₹)", "Status"];
    const rows = inventoryValuation.map(row => [
      `"${row.name}"`,
      row.sku,
      row.barcode,
      parseFloat(row.cost_price).toFixed(2),
      parseFloat(row.price).toFixed(2),
      row.quantity,
      parseFloat(row.total_cost_value).toFixed(2),
      parseFloat(row.total_retail_value).toFixed(2),
      row.quantity <= (row.low_stock_threshold || 10) ? 'Low Stock' : 'Healthy'
    ]);
    downloadCSV("Inventory_Valuation", headers, rows);
  };

  // Aggregation computations for Inventory Report
  const totalStockUnits = inventoryValuation.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
  const totalCostValuation = inventoryValuation.reduce((sum, item) => sum + parseFloat(item.total_cost_value || 0), 0);
  const totalRetailValuation = inventoryValuation.reduce((sum, item) => sum + parseFloat(item.total_retail_value || 0), 0);
  const totalExpectedMargin = totalRetailValuation - totalCostValuation;
  const averageMarginPercent = totalRetailValuation > 0 ? (totalExpectedMargin / totalRetailValuation) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* Title & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5 no-print">
        <div>
          <h2 className="text-xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>Business Intelligence &amp; Reports</h2>
          <p className="text-xs text-slate-400 mt-0.5">Evaluate sales volumes, item velocities, customer spending patterns, and stock valuations.</p>
        </div>
        
        {/* Date Filter Panel */}
        <div className="flex items-center space-x-3 text-xs bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
          <Calendar className="h-4 w-4 text-indigo-400" />
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-950 border border-slate-850 px-2 py-1 rounded text-slate-200 outline-none focus:border-indigo-500 text-[10px]"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-950 border border-slate-850 px-2 py-1 rounded text-slate-200 outline-none focus:border-indigo-500 text-[10px]"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 rounded text-[9px] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-800 mb-6 overflow-x-auto whitespace-nowrap no-print scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'overview' ? 'border-indigo-600 text-indigo-400 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Dashboard Overview & GST
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'daily' ? 'border-indigo-600 text-indigo-400 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Daily Sales Report
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'items' ? 'border-indigo-600 text-indigo-400 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Item-wise Sales
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'customers' ? 'border-indigo-600 text-indigo-400 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Customer-wise Sales
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'inventory' ? 'border-indigo-600 text-indigo-400 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Inventory Valuation
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'transactions' ? 'border-indigo-600 text-indigo-400 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Sales Transactions History
        </button>
      </div>

      {/* FEEDBACK STATUS */}
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 rounded-lg p-4 text-sm font-semibold shadow-lg transition-all duration-300 ${
          message.type === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }`}>
          {message.text}
        </div>
      )}

      {/* TAB CONTENTS CONTAINER */}
      <div className="space-y-6">

        {/* 1. OVERVIEW & GST */}
        {activeTab === 'overview' && (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print">
              {/* Sales */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4 flex items-center space-x-4">
                <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Gross Sales Today</p>
                  <h3 className="text-xl font-extrabold mt-0.5" style={{ color: 'var(--text-primary)' }}>₹{summary.todaySales.toFixed(2)}</h3>
                </div>
              </div>

              {/* Txns */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4 flex items-center space-x-4">
                <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Transactions</p>
                  <h3 className="text-xl font-extrabold mt-0.5" style={{ color: 'var(--text-primary)' }}>{summary.todayTxns} Bills</h3>
                </div>
              </div>

              {/* Low Stock alerts */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4 flex items-center space-x-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${
                  summary.lowStockCount > 0 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Low Stock Warnings</p>
                  <h3 className="text-xl font-extrabold mt-0.5" style={{ color: summary.lowStockCount > 0 ? '#ef4444' : 'var(--text-primary)' }}>
                    {summary.lowStockCount} Items
                  </h3>
                </div>
              </div>

              {/* Customers */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4 flex items-center space-x-4">
                <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Loyalty Members</p>
                  <h3 className="text-xl font-extrabold mt-0.5" style={{ color: 'var(--text-primary)' }}>{summary.customerCount} Users</h3>
                </div>
              </div>
            </div>

            {/* Line Charts & Top Sellers */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sales Trend Line Chart */}
              <div className="lg:col-span-8 bg-slate-900/40 border border-slate-850 rounded-xl p-5 flex flex-col">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-4">
                  Sales Revenue Trend (Last 7 Days)
                </h3>
                <div className="h-72 w-full text-xs">
                  {salesTrend.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500">
                      No sales transactions registered in the last 7 days.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={salesTrend}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1b2e3c' : '#cbd5e1'} />
                        <XAxis dataKey="formattedDate" stroke={theme === 'dark' ? '#a7f3d0' : '#047857'} />
                        <YAxis stroke={theme === 'dark' ? '#a7f3d0' : '#047857'} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                            borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                            color: theme === 'dark' ? '#f8fafc' : '#0f172a' 
                          }}
                          labelStyle={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontWeight: 'bold' }}
                        />
                        <Legend />
                        <Line 
                          name="Daily Revenue (₹)"
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#10b981" 
                          strokeWidth={2.5} 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="lg:col-span-4 bg-slate-900/40 border border-slate-850 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-4">
                    Top Selling Products
                  </h3>
                  <div className="space-y-3.5">
                    {topProducts.length === 0 ? (
                      <p className="text-xs text-slate-500 py-16 text-center">No sales registered yet.</p>
                    ) : (
                      topProducts.map((prod, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-slate-950/30">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-slate-500">#{idx + 1}</span>
                            <span className="font-semibold text-slate-200 truncate max-w-[140px]">{prod.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="block font-bold text-slate-300">{prod.qty} Sold</span>
                            <span className="block text-[9px] text-slate-500 font-medium">₹{parseFloat(prod.revenue).toFixed(2)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* GST Summary & Security Log Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* GST */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-850 rounded-xl p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-4">
                  GST Tax Bucket Statement
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-850 text-[9px] font-bold text-slate-500 uppercase">
                        <th className="py-2 px-1">GST Rate %</th>
                        <th className="py-2 px-1 text-right">Taxable Value</th>
                        <th className="py-2 px-1 text-right">SGST (50%)</th>
                        <th className="py-2 px-1 text-right">CGST (50%)</th>
                        <th className="py-2 px-1 text-right">Total GST</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {gstReport.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-6 text-center text-slate-600 font-medium">No tax statements collected in this range.</td>
                        </tr>
                      ) : (
                        gstReport.map((gst, idx) => {
                          const totalTax = parseFloat(gst.tax_amount);
                          const splitTax = totalTax / 2;
                          return (
                            <tr key={idx} className="hover:bg-slate-950/20">
                              <td className="py-2.5 px-1 font-bold text-slate-350">{gst.tax_rate}%</td>
                              <td className="py-2.5 px-1 text-right text-slate-200 font-semibold">₹{parseFloat(gst.taxable_value).toFixed(2)}</td>
                              <td className="py-2.5 px-1 text-right text-slate-400">₹{splitTax.toFixed(2)}</td>
                              <td className="py-2.5 px-1 text-right text-slate-400">₹{splitTax.toFixed(2)}</td>
                              <td className="py-2.5 px-1 text-right text-indigo-400 font-bold">₹{totalTax.toFixed(2)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECURITY AUDIT TRAIL */}
              <div className="lg:col-span-7 bg-slate-900/40 border border-slate-850 rounded-xl p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-4">
                  Security & Audit Activity Trail
                </h3>
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b border-slate-850 font-bold text-slate-500 uppercase">
                        <th className="py-2 px-1">Cashier</th>
                        <th className="py-2 px-1">Action Description</th>
                        <th className="py-2 px-1">Module</th>
                        <th className="py-2 px-1 text-center">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-300">
                      {auditLogs.slice(0, 8).map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/20">
                          <td className="py-2 px-1 font-semibold text-indigo-400">{log.username || 'System'}</td>
                          <td className="py-2 px-1 font-medium">{log.action}</td>
                          <td className="py-2 px-1 text-slate-500">{log.module}</td>
                          <td className="py-2 px-1 text-center text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </>
        )}

        {/* 2. DAILY SALES REPORT */}
        {activeTab === 'daily' && (
          <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Daily Consolidated Sales Summary</h3>
              <button
                onClick={exportDailySalesCSV}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 font-bold border border-slate-700 rounded-lg cursor-pointer transition-all"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3 text-center">Invoices count</th>
                    <th className="py-3 px-3 text-right">Gross Subtotal</th>
                    <th className="py-3 px-3 text-right">Total Discount</th>
                    <th className="py-3 px-3 text-right">GST Collected</th>
                    <th className="py-3 px-3 text-right">Net Sales Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">Loading daily sales...</td>
                    </tr>
                  ) : dailySales.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">No consolidated data in range.</td>
                    </tr>
                  ) : (
                    dailySales.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/20">
                        <td className="py-3 px-3 font-semibold text-slate-200">
                          {new Date(row.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-indigo-400">{row.invoice_count} Bills</td>
                        <td className="py-3 px-3 text-right font-medium">₹{parseFloat(row.subtotal).toFixed(2)}</td>
                        <td className="py-3 px-3 text-right text-red-400">-₹{parseFloat(row.discount_amount).toFixed(2)}</td>
                        <td className="py-3 px-3 text-right text-slate-400">₹{parseFloat(row.tax_amount).toFixed(2)}</td>
                        <td className="py-3 px-3 text-right font-extrabold" style={{ color: 'var(--text-primary)' }}>₹{parseFloat(row.total_amount).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. ITEM-WISE SALES */}
        {activeTab === 'items' && (
          <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Item Velocity & Sales Analytics</h3>
              <button
                onClick={exportItemSalesCSV}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 font-bold border border-slate-700 rounded-lg cursor-pointer transition-all"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-3">Product Name</th>
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-3">Barcode</th>
                    <th className="py-3 px-3 text-center">Qty Sold</th>
                    <th className="py-3 px-3 text-right">Avg Rate</th>
                    <th className="py-3 px-3 text-right">Discount</th>
                    <th className="py-3 px-3 text-right">GST Tax</th>
                    <th className="py-3 px-3 text-right">Gross Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-500">Loading item-wise velocities...</td>
                    </tr>
                  ) : itemSales.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-500">No items sold matching range.</td>
                    </tr>
                  ) : (
                    itemSales.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/20">
                        <td className="py-3 px-3 font-semibold text-slate-200">{row.name}</td>
                        <td className="py-3 px-3 font-mono text-slate-400">{row.sku}</td>
                        <td className="py-3 px-3 text-slate-500">{row.barcode}</td>
                        <td className="py-3 px-3 text-center font-bold text-indigo-400">{row.quantity_sold} Units</td>
                        <td className="py-3 px-3 text-right">₹{parseFloat(row.avg_selling_price).toFixed(2)}</td>
                        <td className="py-3 px-3 text-right text-red-400">-₹{parseFloat(row.total_discount).toFixed(2)}</td>
                        <td className="py-3 px-3 text-right text-slate-450">₹{parseFloat(row.total_tax).toFixed(2)}</td>
                        <td className="py-3 px-3 text-right font-extrabold text-emerald-400">₹{parseFloat(row.total_revenue).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. CUSTOMER-WISE SALES */}
        {activeTab === 'customers' && (
          <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Customer Loyalty & Spend Rankings</h3>
              <button
                onClick={exportCustomerSalesCSV}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 font-bold border border-slate-700 rounded-lg cursor-pointer transition-all"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-3">Customer Profile</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3 text-center">Bills Count</th>
                    <th className="py-3 px-3 text-right">Credit Balance</th>
                    <th className="py-3 px-3 text-center">Loyalty Points</th>
                    <th className="py-3 px-3 text-right">Total Net Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">Loading customer spends...</td>
                    </tr>
                  ) : customerSales.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">No customer spend ranks.</td>
                    </tr>
                  ) : (
                    customerSales.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/20">
                        <td className="py-3 px-3 font-semibold text-slate-200">{row.name}</td>
                        <td className="py-3 px-3">
                          <p className="font-medium">{row.phone}</p>
                          <p className="text-[10px] text-slate-500">{row.email || 'No email ID'}</p>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-indigo-400">{row.total_purchases} transactions</td>
                        <td className={`py-3 px-3 text-right font-bold ${parseFloat(row.credit_balance) > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                          ₹{parseFloat(row.credit_balance).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20">
                            {row.loyalty_points} Pts
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-extrabold" style={{ color: 'var(--accent)' }}>₹{parseFloat(row.total_spend).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. INVENTORY VALUATION */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Summary details */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4">
                <p className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Stock Count</p>
                <h3 className="text-lg font-black mt-1" style={{ color: 'var(--text-primary)' }}>{totalStockUnits} Units</h3>
              </div>
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4">
                <p className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Cost Value (Valuation)</p>
                <h3 className="text-lg font-black text-amber-500 mt-1">₹{totalCostValuation.toFixed(2)}</h3>
              </div>
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4">
                <p className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Retail Sales Value</p>
                <h3 className="text-lg font-black text-emerald-500 mt-1">₹{totalRetailValuation.toFixed(2)}</h3>
              </div>
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4">
                <p className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Est. Profit Margin %</p>
                <h3 className="text-lg font-black text-indigo-400 mt-1">{averageMarginPercent.toFixed(2)}%</h3>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Inventory Assets & Value Valuation</h3>
                <button
                  onClick={exportInventoryValuationCSV}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 font-bold border border-slate-700 rounded-lg cursor-pointer transition-all"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                      <th className="py-3 px-3">Product details</th>
                      <th className="py-3 px-3 text-center">Quantity</th>
                      <th className="py-3 px-3 text-right">Cost Rate</th>
                      <th className="py-3 px-3 text-right">Retail Rate</th>
                      <th className="py-3 px-3 text-right">Total Cost Value</th>
                      <th className="py-3 px-3 text-right">Total Retail Value</th>
                      <th className="py-3 px-3 text-center">Stock status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-500">Loading stock assets...</td>
                      </tr>
                    ) : inventoryValuation.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-500">No active products in inventory.</td>
                      </tr>
                    ) : (
                      inventoryValuation.map((row, idx) => {
                        const isLow = row.quantity <= (row.low_stock_threshold || 10);
                        return (
                          <tr key={idx} className="hover:bg-slate-950/20">
                            <td className="py-3 px-3">
                              <p className="font-semibold text-slate-200">{row.name}</p>
                              <div className="flex space-x-2 text-[9px] text-slate-500 mt-0.5">
                                <span>SKU: {row.sku}</span>
                                <span>Barcode: {row.barcode}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center font-bold">{row.quantity}</td>
                            <td className="py-3 px-3 text-right text-slate-450">₹{parseFloat(row.cost_price).toFixed(2)}</td>
                            <td className="py-3 px-3 text-right font-medium">₹{parseFloat(row.price).toFixed(2)}</td>
                            <td className="py-3 px-3 text-right text-amber-500 font-semibold">₹{parseFloat(row.total_cost_value).toFixed(2)}</td>
                            <td className="py-3 px-3 text-right text-emerald-500 font-semibold">₹{parseFloat(row.total_retail_value).toFixed(2)}</td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                isLow ? 'bg-red-500/20 text-red-400 border border-red-500/35' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/35'
                              }`}>
                                {isLow ? 'Low Stock' : 'Healthy'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. TRANSACTIONS HISTORY */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            
            {/* Summary card metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4">
                <p className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Filtered Sales Revenue</p>
                <h3 className="text-lg font-black text-indigo-400 mt-1">₹{transactionsSummary.totalRevenue ? transactionsSummary.totalRevenue.toFixed(2) : '0.00'}</h3>
              </div>
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4">
                <p className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Tax Collected (GST)</p>
                <h3 className="text-lg font-black text-slate-300 mt-1">₹{transactionsSummary.totalTax ? transactionsSummary.totalTax.toFixed(2) : '0.00'}</h3>
              </div>
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4">
                <p className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Discounts Given</p>
                <h3 className="text-lg font-black text-red-400 mt-1">₹{transactionsSummary.totalDiscount ? transactionsSummary.totalDiscount.toFixed(2) : '0.00'}</h3>
              </div>
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4">
                <p className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Refunds processed</p>
                <h3 className="text-lg font-black text-red-500 mt-1">{transactionsSummary.refundedTransactions || 0} Bills</h3>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Individual Invoices Audit History</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                      <th className="py-3 px-3">Invoice #</th>
                      <th className="py-3 px-3">Date & Time</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3 text-right">Discount</th>
                      <th className="py-3 px-3 text-right">Tax</th>
                      <th className="py-3 px-3 text-right">Total Net</th>
                      <th className="py-3 px-3 text-center">Method</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {loading ? (
                      <tr>
                        <td colSpan="9" className="py-8 text-center text-slate-500">Loading transactional history...</td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="py-8 text-center text-slate-500">No invoices logged.</td>
                      </tr>
                    ) : (
                      transactions.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/20">
                          <td className="py-3 px-3 font-mono font-bold text-slate-200">{row.invoice_number}</td>
                          <td className="py-3 px-3 text-slate-400">{new Date(row.created_at).toLocaleString()}</td>
                          <td className="py-3 px-3">
                            <p className="font-semibold">{row.customer_name || 'Walk-in Customer'}</p>
                            <p className="text-[9px] text-slate-500">{row.customer_phone || ''}</p>
                          </td>
                          <td className="py-3 px-3 text-right text-red-400">-₹{parseFloat(row.discount_amount).toFixed(2)}</td>
                          <td className="py-3 px-3 text-right text-slate-450">₹{parseFloat(row.tax_amount).toFixed(2)}</td>
                          <td className="py-3 px-3 text-right font-extrabold" style={{ color: 'var(--text-primary)' }}>₹{parseFloat(row.total_amount).toFixed(2)}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[8px] bg-slate-800 text-slate-350 border border-slate-700">
                              {row.payment_method}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                              row.payment_status === 'Refunded' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {row.payment_status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => { setSelectedInvoice(row); setShowInvoiceModal(true); }}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-550 text-[10px] rounded text-white font-bold cursor-pointer transition"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* DETAILED RECEIPT VIEW MODAL */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm no-print">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-md font-bold" style={{ color: 'var(--text-primary)' }}>Receipt: {selectedInvoice.invoice_number}</h3>
                <p className="text-[10px] text-slate-400">Cashier: {selectedInvoice.cashier_name || 'Terminal Operator'}</p>
              </div>
              <button
                onClick={() => { setSelectedInvoice(null); setShowInvoiceModal(false); }}
                className="text-slate-400 hover:text-white text-xs cursor-pointer font-bold"
              >
                Close
              </button>
            </div>

            {/* Receipt details */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-200">{new Date(selectedInvoice.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Customer:</span>
                <span className="text-slate-200">{selectedInvoice.customer_name || 'Walk-in Customer'}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-500">Payment:</span>
                <span className="text-slate-200 font-semibold">{selectedInvoice.payment_method} ({selectedInvoice.payment_status})</span>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 py-1">
                {selectedInvoice.items && selectedInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs bg-slate-950/30 p-2 rounded">
                    <div>
                      <p className="font-bold text-slate-200">{item.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {item.quantity} x ₹{parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>
                    <span className="font-extrabold text-slate-300">
                      ₹{((parseFloat(item.price) * item.quantity) - (item.discountAmount || 0)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-right text-xs pt-3 border-t border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="text-slate-350">₹{parseFloat(selectedInvoice.subtotal).toFixed(2)}</span>
                </div>
                {parseFloat(selectedInvoice.discount_amount) > 0 && (
                  <div className="flex justify-between text-red-400 font-semibold">
                    <span>Discount:</span>
                    <span>-₹{parseFloat(selectedInvoice.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Tax (GST):</span>
                  <span className="text-slate-350">₹{parseFloat(selectedInvoice.tax_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold border-t border-dashed border-slate-800 pt-1.5 text-white">
                  <span>TOTAL AMOUNT:</span>
                  <span className="text-indigo-400">₹{parseFloat(selectedInvoice.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Print Action */}
            <div className="pt-2 flex space-x-3">
              <button
                onClick={handlePrintInvoice}
                className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden printable receipt roll (only for print) */}
      {selectedInvoice && (
        <div className="hidden print-area mx-auto text-black p-2 font-mono" style={{ width: '80mm' }}>
          <div className="text-center mb-3">
            <h2 className="text-sm font-black uppercase tracking-wider">RAD FLAGSHIP TERMINAL</h2>
            <p className="text-[9px]">123 Retail Lane, Tech City</p>
            <p className="text-[9px]">GSTIN: 29AAAAA1111A1Z1</p>
            <p className="text-[9px] mt-1 border-t border-dashed border-black pt-1">
              Invoice: {selectedInvoice.invoice_number}
            </p>
            <p className="text-[8px]">
              Date: {new Date(selectedInvoice.created_at).toLocaleString()}
            </p>
          </div>

          <div className="border-b border-dashed border-black py-1 my-1">
            {selectedInvoice.items && selectedInvoice.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-[9px] mb-1">
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

          <div className="space-y-0.5 text-right text-[8px] mb-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{parseFloat(selectedInvoice.subtotal).toFixed(2)}</span>
            </div>
            {parseFloat(selectedInvoice.discount_amount) > 0 && (
              <div className="flex justify-between font-bold">
                <span>Discount:</span>
                <span>-₹{parseFloat(selectedInvoice.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST Tax:</span>
              <span>₹{parseFloat(selectedInvoice.tax_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[9px] font-bold border-t border-dashed border-black pt-1">
              <span>TOTAL DUE:</span>
              <span>₹{parseFloat(selectedInvoice.total_amount).toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center border-t border-dashed border-black pt-2 text-[8px]">
            <p>Paid via: {selectedInvoice.payment_method} ({selectedInvoice.payment_status})</p>
            <p className="mt-1 font-bold">THANK YOU! VISIT AGAIN</p>
          </div>
        </div>
      )}

    </div>
  );
};
