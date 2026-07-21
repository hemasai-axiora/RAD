import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { s } from '../styles';
import { 
  Search, UserPlus, Award, Phone, Mail, 
  History, Clock, Users, CreditCard, Star, ShoppingBag
} from 'lucide-react';

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', loyaltyPoints: '0', creditBalance: '0.00'
  });

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => { fetchCustomers(); }, [search]);

  const showFeedback = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      let url = '/customers';
      if (search) url += `?search=${search}`;
      const res = await axios.get(url);
      if (res.data.success) setCustomers(res.data.data);
    } catch { showFeedback('Failed to load customers', 'error'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showFeedback('Name and Phone are required', 'error'); return;
    }
    try {
      const res = await axios.post('/customers', {
        ...formData,
        loyaltyPoints: parseInt(formData.loyaltyPoints),
        creditBalance: parseFloat(formData.creditBalance)
      });
      if (res.data.success) {
        showFeedback('Customer registered!');
        setShowAddModal(false);
        setFormData({ name: '', phone: '', email: '', loyaltyPoints: '0', creditBalance: '0.00' });
        fetchCustomers();
      }
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Registration failed', 'error');
    }
  };

  const launchHistory = async (cust) => {
    setActiveCustomer(cust);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const res = await axios.get(`/customers/${cust.id}/history`);
      if (res.data.success) setPurchaseHistory(res.data.data);
    } catch { showFeedback('Failed to load history', 'error'); }
    finally { setHistoryLoading(false); }
  };

  // Computed stats
  const totalPoints = customers.reduce((s, c) => s + (c.loyalty_points || 0), 0);
  const totalCredit = customers.reduce((s, c) => s + parseFloat(c.credit_balance || 0), 0);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {message.text && (
        <div className="fixed top-5 right-5 z-[100] px-5 py-3" style={s.feedback(message.type)}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 style={s.pageTitle()}>Customer Database</h1>
          <p style={s.pageSubtitle()}>Manage customer profiles, loyalty points and credit accounts</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={s.btnPrimary()}>
          <UserPlus size={14} /> New Customer
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, icon: Users, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Total Loyalty Pts', value: totalPoints.toLocaleString('en-IN'), icon: Star, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Total Credit (₹)', value: `₹${totalCredit.toFixed(2)}`, icon: CreditCard, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Repeat Buyers', value: customers.filter(c => c.total_purchases > 1).length, icon: ShoppingBag, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="p-4 rounded-xl" style={s.kpiCard()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                <p className="text-2xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
              </div>
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="p-4 rounded-xl" style={s.card()}>
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or email..."
            style={s.input()}
            className="w-full pl-9 pr-3 py-2 text-xs"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl overflow-hidden" style={s.card()}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Customer', 'Contact', 'Loyalty Points', 'Credit Balance (₹)', 'Member Since', 'Actions'].map(h => (
                  <th key={h} style={s.th()} className={h === 'Credit Balance (₹)' ? 'text-right' : h === 'Loyalty Points' || h === 'Member Since' || h === 'Actions' ? 'text-center' : ''}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Users size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>No customers found</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Register your first customer profile</p>
                  </td>
                </tr>
              ) : (
                customers.map(cust => (
                  <tr key={cust.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-subtle)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={s.td()}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-9 w-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                          style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-subtle-border)' }}
                        >
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{cust.name}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {cust.total_purchases > 0 ? `${cust.total_purchases} purchases` : 'New member'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={s.td()}>
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-primary)' }}>
                        <Phone size={11} style={{ color: 'var(--accent)' }} />
                        <span>{cust.phone}</span>
                      </div>
                      {cust.email && (
                        <div className="flex items-center gap-1.5 text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          <Mail size={11} style={{ color: 'var(--text-muted)' }} />
                          <span>{cust.email}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ ...s.td(), textAlign: 'center' }}>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                        <Award size={11} />
                        {cust.loyalty_points} pts
                      </span>
                    </td>
                    <td style={{ ...s.td(), textAlign: 'right' }}>
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        ₹{parseFloat(cust.credit_balance).toFixed(2)}
                      </span>
                    </td>
                    <td style={{ ...s.td(), textAlign: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                        {new Date(cust.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td style={{ ...s.td(), textAlign: 'center' }}>
                      <button
                        onClick={() => launchHistory(cust)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                        style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-subtle-border)' }}
                      >
                        <History size={11} /> View Orders
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {customers.length > 0 && (
          <div className="px-4 py-3 border-t text-xs font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            {customers.length} customer{customers.length !== 1 ? 's' : ''} in database
          </div>
        )}
      </div>

      {/* ── MODAL: Register Customer ───────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={s.overlay()}
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
        >
          <div className="w-full max-w-sm" style={s.modal()}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Register New Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-lg font-bold cursor-pointer" style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleRegister} className="p-5 space-y-4">
              <div>
                <span style={s.label()}>Full Name *</span>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Ramesh Kumar" required style={s.input()} className="w-full px-3 py-2 text-xs" />
              </div>
              <div>
                <span style={s.label()}>Phone Number *</span>
                <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="9876500001" required style={s.input()} className="w-full px-3 py-2 text-xs" />
              </div>
              <div>
                <span style={s.label()}>Email Address</span>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="ramesh@example.com" style={s.input()} className="w-full px-3 py-2 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span style={s.label()}>Loyalty Points</span>
                  <input type="number" value={formData.loyaltyPoints} onChange={(e) => setFormData({ ...formData, loyaltyPoints: e.target.value })} placeholder="0" style={s.input()} className="w-full px-3 py-2 text-xs" />
                </div>
                <div>
                  <span style={s.label()}>Starting Credit (₹)</span>
                  <input type="number" step="0.01" value={formData.creditBalance} onChange={(e) => setFormData({ ...formData, creditBalance: e.target.value })} placeholder="0.00" style={s.input()} className="w-full px-3 py-2 text-xs" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={s.btnSecondary()}>Cancel</button>
                <button type="submit" style={s.btnPrimary()}>Create Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Purchase History ───────────────────────── */}
      {showHistoryModal && activeCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={s.overlay()}
          onClick={(e) => e.target === e.currentTarget && setShowHistoryModal(false)}
        >
          <div className="w-full max-w-lg" style={s.modal()}>
            {/* Header */}
            <div className="flex items-center gap-3 p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="h-11 w-11 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0"
                style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-subtle-border)' }}>
                {activeCustomer.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{activeCustomer.name}</h3>
                <div className="flex gap-4 text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  <span><Phone size={10} className="inline mr-1" />{activeCustomer.phone}</span>
                  <span><Award size={10} className="inline mr-1" style={{ color: '#f59e0b' }} />{activeCustomer.loyalty_points} pts</span>
                </div>
              </div>
              <button onClick={() => { setShowHistoryModal(false); setPurchaseHistory([]); setActiveCustomer(null); }}
                className="text-lg font-bold cursor-pointer" style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>

            {/* Purchase List */}
            <div className="p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
                Purchase History
              </h4>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {historyLoading ? (
                  <div className="py-10 text-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mx-auto" />
                  </div>
                ) : purchaseHistory.length === 0 ? (
                  <div className="py-10 text-center">
                    <ShoppingBag size={30} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>No purchases yet</p>
                  </div>
                ) : (
                  purchaseHistory.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{inv.invoice_number}</span>
                          <span style={s.badge(inv.payment_status === 'Refunded' ? 'danger' : 'success')}>
                            {inv.payment_status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                          <Clock size={10} />
                          <span>{new Date(inv.created_at).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm" style={{ color: 'var(--accent)' }}>₹{parseFloat(inv.total_amount).toFixed(2)}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{inv.payment_method}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {purchaseHistory.length > 0 && (
                <div className="mt-3 pt-3 border-t flex justify-between text-xs font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  <span>{purchaseHistory.length} transactions</span>
                  <span style={{ color: 'var(--accent)' }}>
                    Total: ₹{purchaseHistory.reduce((s, i) => s + parseFloat(i.total_amount || 0), 0).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
