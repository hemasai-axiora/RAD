import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, ShoppingCart, Package, TrendingUp } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setSubmitting(true);
    const res = await login(username, password);
    setSubmitting(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div
      className="flex min-h-screen w-full overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0f1a 0%, #0d2818 50%, #0a0f1a 100%)' }}
    >
      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 20%, #059669 0%, transparent 50%)' }}
        />
        
        {/* Logo */}
        <div className="relative">
          <div className="flex items-center space-x-3">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              RAD
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">RAD System</h1>
              <p className="text-xs font-semibold" style={{ color: '#10b981' }}>Supermarket Billing & Inventory</p>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative space-y-6">
          <h2 className="text-4xl font-black text-white leading-tight">
            Complete Retail<br />
            <span style={{ color: '#10b981' }}>Management Suite</span>
          </h2>
          <p className="text-base font-medium" style={{ color: '#86efac' }}>
            Cloud-powered POS billing, inventory tracking, customer loyalty management and detailed business intelligence — all in one platform.
          </p>

          <div className="space-y-4 mt-8">
            {[
              { icon: ShoppingCart, text: 'Fast POS Billing with Barcode Scanner', sub: 'Split payments, holds, returns' },
              { icon: Package, text: 'Smart Inventory with Low-Stock Alerts', sub: '30+ seeded grocery items' },
              { icon: TrendingUp, text: 'Real-time Business Intelligence Reports', sub: 'Daily, item & customer analytics' },
            ].map(({ icon: Icon, text, sub }) => (
              <div key={text} className="flex items-start space-x-3">
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  <Icon className="h-4.5 w-4.5" style={{ color: '#10b981' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{text}</p>
                  <p className="text-xs font-medium" style={{ color: '#6b9b7a' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative">
          <p className="text-xs font-medium" style={{ color: '#4a7a5a' }}>
            © 2026 RAD Platform · Built for retail excellence
          </p>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div
          className="w-full max-w-md rounded-2xl p-8 shadow-2xl"
          style={{
            background: '#111c2d',
            border: '1px solid #1e3a2f',
          }}
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center space-x-3 mb-8">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center font-black text-white"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              RAD
            </div>
            <div>
              <h1 className="text-lg font-black text-white">RAD System</h1>
              <p className="text-xs" style={{ color: '#10b981' }}>Supermarket Platform</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-white">Sign In</h2>
            <p className="text-sm font-medium mt-1" style={{ color: '#6b9b7a' }}>
              Access your store terminal
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              className="mb-6 flex items-start space-x-3 rounded-xl p-4 text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
            >
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#86efac' }}>
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5" style={{ color: '#6b9b7a' }}>
                  <User className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  autoComplete="username"
                  disabled={submitting}
                  style={{
                    background: '#0d1520',
                    border: '1px solid #1e3a2f',
                    color: '#e8f5e9',
                    outline: 'none',
                  }}
                  className="block w-full rounded-xl py-3.5 pl-11 pr-4 text-sm placeholder-stone-600 transition-all duration-200 focus:border-emerald-500"
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#1e3a2f'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#86efac' }}>
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5" style={{ color: '#6b9b7a' }}>
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={submitting}
                  style={{
                    background: '#0d1520',
                    border: '1px solid #1e3a2f',
                    color: '#e8f5e9',
                    outline: 'none',
                  }}
                  className="block w-full rounded-xl py-3.5 pl-11 pr-4 text-sm transition-all duration-200"
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#1e3a2f'}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: submitting ? '#047857' : 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
                }}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  'Sign In to Terminal'
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div
            className="mt-8 rounded-xl p-4"
            style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#10b981' }}>
              Demo Credentials
            </p>
            <div className="space-y-2">
              {[
                { role: 'Store Admin', user: 'admin', pass: 'admin123' },
                { role: 'Super Admin', user: 'superadmin', pass: 'super123' },
              ].map(({ role, user, pass }) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: '#6b9b7a' }}>{role}</span>
                  <button
                    type="button"
                    onClick={() => { setUsername(user); setPassword(pass); }}
                    className="text-xs font-bold px-2 py-0.5 rounded-lg cursor-pointer transition-all"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
                  >
                    {user} / {pass}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
