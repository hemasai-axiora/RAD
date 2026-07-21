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
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #0f172a 100%)' }}
    >
      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
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
              <p className="text-xs font-semibold text-emerald-400">Supermarket Billing & Inventory</p>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative space-y-6">
          <h2 className="text-4xl font-black text-white leading-tight">
            Complete Retail<br />
            <span className="text-emerald-400">Management Suite</span>
          </h2>
          <p className="text-base font-medium text-slate-300">
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
                  style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)' }}
                >
                  <Icon className="h-4.5 w-4.5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{text}</p>
                  <p className="text-xs font-medium text-slate-300">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative">
          <p className="text-xs font-medium text-slate-400">
            © 2026 RAD Platform · Built for retail excellence
          </p>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div
          className="w-full max-w-md rounded-2xl p-8 shadow-2xl backdrop-blur-md"
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(51, 65, 85, 0.8)',
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
              <p className="text-xs text-emerald-400">Supermarket Platform</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-white">Sign In</h2>
            <p className="text-sm font-medium mt-1 text-slate-300">
              Access your store terminal
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              className="mb-6 flex items-start space-x-3 rounded-xl p-4 text-sm"
              style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
            >
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-emerald-300">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
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
                    background: '#020617',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    outline: 'none',
                  }}
                  className="block w-full rounded-xl py-3.5 pl-11 pr-4 text-sm placeholder-slate-500 transition-all duration-200 focus:border-emerald-500"
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-emerald-300">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
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
                    background: '#020617',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    outline: 'none',
                  }}
                  className="block w-full rounded-xl py-3.5 pl-11 pr-4 text-sm transition-all duration-200"
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
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
            style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-3 text-emerald-400">
              Demo Credentials
            </p>
            <div className="space-y-2">
              {[
                { role: 'Store Admin', user: 'admin', pass: 'admin123' },
                { role: 'Super Admin', user: 'superadmin', pass: 'super123' },
              ].map(({ role, user, pass }) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">{role}</span>
                  <button
                    type="button"
                    onClick={() => { setUsername(user); setPassword(pass); }}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-all hover:bg-emerald-500/30"
                    style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)' }}
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

