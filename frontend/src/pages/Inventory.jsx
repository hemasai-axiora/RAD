import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { s } from '../styles';
import { 
  Search, Plus, AlertCircle, Edit, Trash2, 
  Package, FileSpreadsheet, TrendingDown, RefreshCw
} from 'lucide-react';

/* ─── Reusable themed input ──────────────────────────────── */
const TInput = ({ ...props }) => (
  <input
    style={s.input()}
    className="w-full px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 transition-all"
    {...props}
  />
);
const TSelect = ({ children, ...props }) => (
  <select
    style={s.select()}
    className="w-full px-3 py-2 text-xs"
    {...props}
  >
    {children}
  </select>
);
const TLabel = ({ children }) => (
  <span style={s.label()}>{children}</span>
);

export const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [stats, setStats] = useState({ total: 0, lowStock: 0, outOfStock: 0, totalValue: 0 });

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Forms
  const [productForm, setProductForm] = useState({
    id: null, sku: '', barcode: '', name: '', description: '',
    category_id: '', brand_id: '', price: '', cost_price: '',
    tax_rate: '5.00', quantity: '0', low_stock_threshold: '10',
    batch_number: '', expiry_date: '', status: 'Active'
  });
  const [adjustForm, setAdjustForm] = useState({
    productId: '', quantity: '', type: 'Stock In', reason: ''
  });
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandDesc, setNewBrandDesc] = useState('');
  const [importFile, setImportFile] = useState(null);

  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [search, selectedCategory, selectedBrand, lowStockFilter]);

  const showFeedback = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const fetchAll = () => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/products?lowStock=${lowStockFilter}`;
      if (search) url += `&search=${search}`;
      if (selectedCategory) url += `&categoryId=${selectedCategory}`;
      if (selectedBrand) url += `&brandId=${selectedBrand}`;
      const res = await axios.get(url);
      if (res.data.success) {
        const data = res.data.data;
        setProducts(data);
        // Compute stats
        const lowS = data.filter(p => p.quantity <= (p.low_stock_threshold || 10) && p.quantity > 0).length;
        const outS = data.filter(p => p.quantity === 0).length;
        const val  = data.reduce((sum, p) => sum + (parseFloat(p.cost_price || 0) * (p.quantity || 0)), 0);
        setStats({ total: data.length, lowStock: lowS, outOfStock: outS, totalValue: val });
      }
    } catch { showFeedback('Failed to load products', 'error'); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/products/categories');
      if (res.data.success) setCategories(res.data.data);
    } catch {}
  };

  const fetchBrands = async () => {
    try {
      const res = await axios.get('/products/brands');
      if (res.data.success) setBrands(res.data.data);
    } catch {}
  };

  const resetProductForm = () => setProductForm({
    id: null, sku: '', barcode: '', name: '', description: '',
    category_id: '', brand_id: '', price: '', cost_price: '',
    tax_rate: '5.00', quantity: '0', low_stock_threshold: '10',
    batch_number: '', expiry_date: '', status: 'Active'
  });

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.cost_price) {
      showFeedback('Fill in Name, Cost Price & Selling Price', 'error');
      return;
    }
    try {
      const isEdit = !!productForm.id;
      const res = isEdit
        ? await axios.put(`/products/${productForm.id}`, productForm)
        : await axios.post('/products', productForm);
      if (res.data.success) {
        showFeedback(`Product ${isEdit ? 'updated' : 'added'} successfully!`);
        setShowAddModal(false);
        resetProductForm();
        fetchProducts();
      }
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const res = await axios.delete(`/products/${id}`);
      if (res.data.success) { showFeedback('Product deleted'); fetchProducts(); }
    } catch { showFeedback('Delete failed', 'error'); }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/inventory/adjust', {
        productId: adjustForm.productId,
        quantity: parseInt(adjustForm.quantity),
        type: adjustForm.type,
        reason: adjustForm.reason
      });
      if (res.data.success) {
        showFeedback('Stock adjusted!');
        setShowAdjustModal(false);
        setAdjustForm({ productId: '', quantity: '', type: 'Stock In', reason: '' });
        fetchProducts();
      }
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Adjust failed', 'error');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/products/categories', { name: newCatName, description: newCatDesc });
      if (res.data.success) {
        showFeedback('Category created');
        setNewCatName(''); setNewCatDesc(''); setShowCatModal(false);
        fetchCategories();
      }
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/products/brands', { name: newBrandName, description: newBrandDesc });
      if (res.data.success) {
        showFeedback('Brand created');
        setNewBrandName(''); setNewBrandDesc(''); setShowBrandModal(false);
        fetchBrands();
      }
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!importFile) { showFeedback('Select a CSV file', 'error'); return; }
    const fd = new FormData();
    fd.append('file', importFile);
    try {
      const res = await axios.post('/products/bulk-import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) {
        showFeedback(res.data.message);
        setShowImportModal(false); setImportFile(null); fetchProducts();
      }
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Import failed', 'error');
    }
  };

  const launchEdit = (prod) => {
    setProductForm({
      id: prod.id, sku: prod.sku, barcode: prod.barcode, name: prod.name,
      description: prod.description || '', category_id: prod.category_id || '',
      brand_id: prod.brand_id || '', price: prod.price, cost_price: prod.cost_price,
      tax_rate: prod.tax_rate, quantity: prod.quantity,
      low_stock_threshold: prod.low_stock_threshold || '10',
      batch_number: prod.batch_number || '',
      expiry_date: prod.expiry_date ? prod.expiry_date.split('T')[0] : '',
      status: prod.status || 'Active'
    });
    setShowAddModal(true);
  };

  const launchAdjust = (prod) => {
    setAdjustForm({ productId: prod.id, quantity: '', type: 'Stock In', reason: '' });
    setShowAdjustModal(true);
  };

  /* ── MODAL WRAPPER ───────────────────────────────────────── */
  const Modal = ({ show, onClose, title, children, maxW = 'max-w-lg' }) => {
    if (!show) return null;
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        style={s.overlay()}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className={`w-full ${maxW} my-6`} style={s.modal()}>
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
            <button onClick={onClose} className="text-lg font-bold cursor-pointer" style={{ color: 'var(--text-muted)' }}>✕</button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {message.text && (
        <div className="fixed top-5 right-5 z-[100] px-5 py-3" style={s.feedback(message.type)}>
          {message.text}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 style={s.pageTitle()}>Product Master & Inventory</h1>
          <p style={s.pageSubtitle()}>Manage products, stock levels, categories and brands</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowImportModal(true)} style={s.btnSecondary()}>
            <FileSpreadsheet size={14} /> CSV Import
          </button>
          <button onClick={() => setShowCatModal(true)} style={s.btnSecondary()}>
            <Plus size={14} /> Category
          </button>
          <button onClick={() => setShowBrandModal(true)} style={s.btnSecondary()}>
            <Plus size={14} /> Brand
          </button>
          <button onClick={() => { resetProductForm(); setShowAddModal(true); }} style={s.btnPrimary()}>
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: stats.total, icon: Package, color: 'accent' },
          { label: 'Low Stock', value: stats.lowStock, icon: TrendingDown, color: 'warning' },
          { label: 'Out of Stock', value: stats.outOfStock, icon: AlertCircle, color: 'danger' },
          { label: 'Inventory Value', value: `₹${stats.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`, icon: RefreshCw, color: 'success' },
        ].map(({ label, value, icon: Icon, color }) => {
          const colors = {
            accent:  { bg: 'var(--accent-subtle)', icon: 'var(--accent)' },
            warning: { bg: 'rgba(245,158,11,0.1)', icon: '#f59e0b' },
            danger:  { bg: 'rgba(239,68,68,0.1)',  icon: '#ef4444' },
            success: { bg: 'rgba(34,197,94,0.1)',  icon: '#22c55e' },
          };
          return (
            <div key={label} className="p-4 rounded-xl" style={s.kpiCard()}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                  <p className="text-2xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
                <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: colors[color].bg }}>
                  <Icon size={18} style={{ color: colors[color].icon }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl" style={s.card()}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU or barcode..."
              style={s.input()}
              className="w-full pl-9 pr-3 py-2 text-xs"
            />
          </div>
          {/* Category */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={s.select()}
              className="w-full px-3 py-2 text-xs"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {/* Brand */}
          <div className="md:col-span-3">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              style={s.select()}
              className="w-full px-3 py-2 text-xs"
            >
              <option value="">All Brands</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          {/* Low stock toggle */}
          <div className="md:col-span-1 flex items-center justify-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockFilter}
                onChange={(e) => setLowStockFilter(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: 'var(--accent)' }}
              />
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Low Stock
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl overflow-hidden" style={s.card()}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Product', 'Category / Brand', 'Cost Price', 'Selling Price', 'GST', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={s.th()} className={h === 'Cost Price' || h === 'Selling Price' ? 'text-right' : h === 'Stock' || h === 'Status' || h === 'Actions' ? 'text-center' : ''}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Package size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>No products found</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or add new products</p>
                  </td>
                </tr>
              ) : (
                products.map(prod => {
                  const isLow = prod.quantity > 0 && prod.quantity <= (prod.low_stock_threshold || 10);
                  const isOut = prod.quantity === 0;
                  return (
                    <tr key={prod.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={s.td()}>
                        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{prod.name}</p>
                        <div className="flex gap-3 mt-0.5">
                          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>SKU: <strong>{prod.sku}</strong></span>
                          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Barcode: <strong>{prod.barcode}</strong></span>
                        </div>
                        {prod.expiry_date && (
                          <div className="text-[10px] mt-0.5" style={{ color: '#f59e0b' }}>
                            Exp: {new Date(prod.expiry_date).toLocaleDateString('en-IN')}
                          </div>
                        )}
                      </td>
                      <td style={s.td()}>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{prod.category_name || '—'}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{prod.brand_name || '—'}</p>
                      </td>
                      <td style={{ ...s.td(), textAlign: 'right' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>₹{parseFloat(prod.cost_price).toFixed(2)}</span>
                      </td>
                      <td style={{ ...s.td(), textAlign: 'right' }}>
                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>₹{parseFloat(prod.price).toFixed(2)}</span>
                      </td>
                      <td style={{ ...s.td(), textAlign: 'center' }}>
                        <span style={s.badge('default')}>{prod.tax_rate}%</span>
                      </td>
                      <td style={{ ...s.td(), textAlign: 'center' }}>
                        <div>
                          <span style={s.badge(isOut ? 'danger' : isLow ? 'warning' : 'success')}>
                            {prod.quantity} units
                          </span>
                          <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            Min: {prod.low_stock_threshold || 10}
                          </div>
                        </div>
                      </td>
                      <td style={{ ...s.td(), textAlign: 'center' }}>
                        <span style={s.badge(prod.status === 'Active' ? 'success' : 'default')}>
                          {prod.status}
                        </span>
                      </td>
                      <td style={{ ...s.td(), textAlign: 'center' }}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => launchAdjust(prod)}
                            className="text-[10px] font-bold px-2 py-1 rounded cursor-pointer transition-opacity"
                            style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-subtle-border)' }}
                          >
                            Adjust
                          </button>
                          <button
                            onClick={() => launchEdit(prod)}
                            className="p-1.5 rounded cursor-pointer"
                            style={{ color: 'var(--accent)' }}
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded cursor-pointer"
                            style={{ color: '#f87171' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {products.length > 0 && (
          <div className="px-4 py-3 border-t text-xs font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* ── MODALS ─────────────────────────────────────────── */}

      {/* Add/Edit Product */}
      <Modal show={showAddModal} onClose={() => setShowAddModal(false)} title={productForm.id ? 'Edit Product' : 'Add New Product'}>
        <form onSubmit={handleProductSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <TLabel>Product Name *</TLabel>
              <TInput value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="e.g. Tata Salt" required />
            </div>
            <div>
              <TLabel>SKU (auto if blank)</TLabel>
              <TInput value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} placeholder="e.g. GRO-001" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <TLabel>Barcode (auto if blank)</TLabel>
              <TInput value={productForm.barcode} onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })} placeholder="Scan or enter" />
            </div>
            <div>
              <TLabel>Status</TLabel>
              <TSelect value={productForm.status} onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </TSelect>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <TLabel>Category</TLabel>
              <TSelect value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </TSelect>
            </div>
            <div>
              <TLabel>Brand</TLabel>
              <TSelect value={productForm.brand_id} onChange={(e) => setProductForm({ ...productForm, brand_id: e.target.value })}>
                <option value="">Select Brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </TSelect>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <TLabel>Cost Price (₹) *</TLabel>
              <TInput type="number" step="0.01" value={productForm.cost_price} onChange={(e) => setProductForm({ ...productForm, cost_price: e.target.value })} placeholder="0.00" required />
            </div>
            <div>
              <TLabel>Selling Price (₹) *</TLabel>
              <TInput type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} placeholder="0.00" required />
            </div>
            <div>
              <TLabel>GST Tax %</TLabel>
              <TSelect value={productForm.tax_rate} onChange={(e) => setProductForm({ ...productForm, tax_rate: e.target.value })}>
                <option value="0.00">0% (Exempt)</option>
                <option value="5.00">5% (Basic)</option>
                <option value="12.00">12% (Standard)</option>
                <option value="18.00">18% (GST)</option>
                <option value="28.00">28% (Luxury)</option>
              </TSelect>
            </div>
          </div>
          {!productForm.id && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <TLabel>Initial Stock Qty</TLabel>
                <TInput type="number" value={productForm.quantity} onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })} placeholder="0" />
              </div>
              <div>
                <TLabel>Low Stock Threshold</TLabel>
                <TInput type="number" value={productForm.low_stock_threshold} onChange={(e) => setProductForm({ ...productForm, low_stock_threshold: e.target.value })} placeholder="10" />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <TLabel>Batch Number</TLabel>
              <TInput value={productForm.batch_number} onChange={(e) => setProductForm({ ...productForm, batch_number: e.target.value })} placeholder="e.g. BAT-2026-01" />
            </div>
            <div>
              <TLabel>Expiry Date</TLabel>
              <TInput type="date" value={productForm.expiry_date} onChange={(e) => setProductForm({ ...productForm, expiry_date: e.target.value })} />
            </div>
          </div>
          <div>
            <TLabel>Description</TLabel>
            <textarea
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              placeholder="Optional details..."
              style={{ ...s.input(), height: '60px', resize: 'vertical' }}
              className="w-full px-3 py-2 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <button type="button" onClick={() => setShowAddModal(false)} style={s.btnSecondary()}>Cancel</button>
            <button type="submit" style={s.btnPrimary()}>{productForm.id ? 'Save Changes' : 'Add Product'}</button>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock */}
      <Modal show={showAdjustModal} onClose={() => setShowAdjustModal(false)} title="Adjust Stock Level" maxW="max-w-sm">
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <div>
            <TLabel>Product</TLabel>
            <TSelect value={adjustForm.productId} onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value })} required>
              <option value="">Select product...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
            </TSelect>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <TLabel>Adjustment Type</TLabel>
              <TSelect value={adjustForm.type} onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}>
                <option value="Stock In">Stock In (+)</option>
                <option value="Stock Out">Stock Out (−)</option>
                <option value="Adjustment">Adjustment</option>
              </TSelect>
            </div>
            <div>
              <TLabel>Quantity</TLabel>
              <TInput type="number" value={adjustForm.quantity} onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })} placeholder="Units" required />
            </div>
          </div>
          <div>
            <TLabel>Reason / Notes</TLabel>
            <textarea
              value={adjustForm.reason}
              onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
              placeholder="e.g. Received shipment, damaged goods..."
              style={{ ...s.input(), height: '56px', resize: 'vertical' }}
              className="w-full px-3 py-2 text-xs"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <button type="button" onClick={() => setShowAdjustModal(false)} style={s.btnSecondary()}>Cancel</button>
            <button type="submit" style={s.btnPrimary()}>Confirm Adjustment</button>
          </div>
        </form>
      </Modal>

      {/* Add Category */}
      <Modal show={showCatModal} onClose={() => setShowCatModal(false)} title="Add Category" maxW="max-w-sm">
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <TLabel>Category Name *</TLabel>
            <TInput value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="e.g. Fresh Vegetables" required />
          </div>
          <div>
            <TLabel>Description</TLabel>
            <TInput value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} placeholder="Short note" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <button type="button" onClick={() => setShowCatModal(false)} style={s.btnSecondary()}>Cancel</button>
            <button type="submit" style={s.btnPrimary()}>Save Category</button>
          </div>
        </form>
      </Modal>

      {/* Add Brand */}
      <Modal show={showBrandModal} onClose={() => setShowBrandModal(false)} title="Add Brand" maxW="max-w-sm">
        <form onSubmit={handleAddBrand} className="space-y-4">
          <div>
            <TLabel>Brand Name *</TLabel>
            <TInput value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} placeholder="e.g. Amul" required />
          </div>
          <div>
            <TLabel>Description</TLabel>
            <TInput value={newBrandDesc} onChange={(e) => setNewBrandDesc(e.target.value)} placeholder="Short note" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <button type="button" onClick={() => setShowBrandModal(false)} style={s.btnSecondary()}>Cancel</button>
            <button type="submit" style={s.btnPrimary()}>Save Brand</button>
          </div>
        </form>
      </Modal>

      {/* CSV Import */}
      <Modal show={showImportModal} onClose={() => setShowImportModal(false)} title="Bulk CSV Import" maxW="max-w-sm">
        <form onSubmit={handleBulkImport} className="space-y-4">
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Upload a CSV with columns: <code className="px-1 py-0.5 rounded text-[10px]" style={{ background: 'var(--bg-input)', color: 'var(--accent)' }}>
              name, sku, barcode, price, cost_price, tax_rate, quantity
            </code>
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setImportFile(e.target.files[0])}
            className="w-full text-xs cursor-pointer"
            style={{ color: 'var(--text-primary)' }}
            required
          />
          <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <button type="button" onClick={() => setShowImportModal(false)} style={s.btnSecondary()}>Cancel</button>
            <button type="submit" style={s.btnPrimary()}>Upload & Import</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
