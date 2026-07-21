/**
 * RAD Supermarket — Shared UI Style Helpers
 * Use these inline style objects and class helpers throughout all pages
 * for consistent theming using CSS variables.
 */

/** Page container */
export const pageWrapper = {
  container: 'space-y-5',
};

/** Inline style factories */
export const s = {
  card: () => ({
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
  }),
  cardHover: () => ({
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  }),
  input: () => ({
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: '8px',
    outline: 'none',
  }),
  select: () => ({
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: '8px',
    outline: 'none',
  }),
  label: () => ({
    color: 'var(--text-secondary)',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '4px',
    display: 'block',
  }),
  modal: () => ({
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
  }),
  overlay: () => ({
    background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(4px)',
  }),
  th: () => ({
    color: 'var(--text-secondary)',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
  }),
  td: () => ({
    color: 'var(--text-primary)',
    fontSize: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
  }),
  btnPrimary: () => ({
    background: 'var(--accent)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'opacity 0.15s',
  }),
  btnSecondary: () => ({
    background: 'var(--bg-card-hover)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'opacity 0.15s',
  }),
  btnDanger: () => ({
    background: 'rgba(239,68,68,0.08)',
    color: '#fca5a5',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  }),
  badge: (type = 'default') => {
    const variants = {
      success: { background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' },
      warning: { background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' },
      danger:  { background: 'rgba(239,68,68,0.12)',  color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' },
      accent:  { background: 'var(--accent-subtle)',  color: 'var(--accent)', border: '1px solid var(--accent-subtle-border)' },
      default: { background: 'var(--bg-card-hover)',  color: 'var(--text-secondary)', border: '1px solid var(--border)' },
    };
    return {
      ...variants[type],
      borderRadius: '6px',
      padding: '2px 8px',
      fontSize: '10px',
      fontWeight: '700',
      display: 'inline-flex',
      alignItems: 'center',
    };
  },
  kpiCard: () => ({
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px',
  }),
  pageTitle: () => ({
    color: 'var(--text-primary)',
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.02em',
  }),
  pageSubtitle: () => ({
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontWeight: '500',
    marginTop: '2px',
  }),
  feedback: (type = 'success') => ({
    background: type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(16,185,129,0.9)',
    color: '#ffffff',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '13px',
    fontWeight: '600',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    backdropFilter: 'blur(8px)',
  }),
};
