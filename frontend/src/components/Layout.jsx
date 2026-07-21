import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  LogOut, 
  Building2, 
  UserCircle,
  ShieldCheck,
  Sun,
  Moon,
  Clock
} from 'lucide-react';

export const Layout = () => {
  const { user, logout, hasPermission } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      path: '/',
      label: 'POS Billing',
      icon: ShoppingCart,
      module: 'billing',
      action: 'create',
      description: 'Checkout & Payments',
    },
    {
      path: '/inventory',
      label: 'Inventory',
      icon: Package,
      module: 'inventory',
      action: 'read',
      description: 'Products & Stock',
    },
    {
      path: '/customers',
      label: 'Customers',
      icon: Users,
      module: 'customers',
      action: 'read',
      description: 'Loyalty & Credits',
    },
    {
      path: '/reports',
      label: 'Reports & Audit',
      icon: BarChart3,
      module: 'reports',
      action: 'read',
      description: 'Analytics & BI',
    },
  ];

  const allowedNavItems = navItems.filter(item =>
    hasPermission(item.module, item.action)
  );

  const isActive = (path) => location.pathname === path;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      
      {/* ── Sidebar ─────────────────────────────── */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col justify-between no-print"
        style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
      >
        <div>
          {/* Brand */}
          <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center space-x-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-base text-white shadow-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                RAD
              </div>
              <div>
                <h1 className="font-black text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
                  RAD System
                </h1>
                <p className="text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>
                  Supermarket Platform
                </p>
              </div>
            </div>
          </div>

          {/* Store Info */}
          {user && (
            <div className="mx-3 mt-3 p-3 rounded-xl" style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-subtle-border)' }}>
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                    {user.storeName || 'All Stores'}
                  </p>
                  <p className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Terminal Online
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="px-3 py-3 space-y-1">
            {allowedNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: active ? 'var(--accent)' : 'transparent',
                    color: active ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: active ? '0 2px 8px rgba(16,185,129,0.3)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'var(--accent-subtle)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Icon className="h-4.5 w-4.5 flex-shrink-0" style={{ color: active ? '#ffffff' : 'var(--accent)' }} />
                  <div>
                    <p className="leading-tight">{item.label}</p>
                    <p className="text-[10px] font-normal opacity-75 leading-tight">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-3 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
          {/* User */}
          {user && (
            <div className="flex items-center space-x-3 px-1">
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-subtle-border)' }}
              >
                <UserCircle className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {user.username}
                </p>
                <div className="flex items-center space-x-1">
                  <ShieldCheck className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <p className="text-[10px] font-semibold truncate" style={{ color: 'var(--text-secondary)' }}>
                    {user.roleName}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: 'var(--bg-base)' }}>
        
        {/* Top Header */}
        <header
          className="h-14 flex items-center justify-between px-6 flex-shrink-0 no-print"
          style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
        >
          {/* Page breadcrumb */}
          <div className="flex items-center space-x-3">
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
              style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-subtle-border)' }}
            >
              ● LIVE
            </span>
            <div className="flex items-center space-x-1.5" style={{ color: 'var(--text-secondary)' }}>
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">{timeStr}</span>
              <span className="text-xs font-medium opacity-60">· {dateStr}</span>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-[9px] uppercase font-extrabold tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Theme
            </span>
            <div
              className="flex items-center space-x-0.5 p-0.5 rounded-full"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
            >
              <button
                type="button"
                onClick={() => setTheme('light')}
                className="h-7 w-7 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200"
                style={{
                  background: theme === 'light' ? 'var(--accent)' : 'transparent',
                  color: theme === 'light' ? '#ffffff' : 'var(--text-secondary)',
                }}
                title="Light Mode — White & Green"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className="h-7 w-7 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200"
                style={{
                  background: theme === 'dark' ? 'var(--accent)' : 'transparent',
                  color: theme === 'dark' ? '#ffffff' : 'var(--text-secondary)',
                }}
                title="Dark Mode — Dark & Green"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
