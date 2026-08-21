import React, { useEffect, useRef, useState } from 'react';

/**
 * StatCard — Animated stat card with:
 *   - Count-up animation on mount
 *   - Gradient icon box (color-coded by variant)
 *   - Hover lift with coloured shadow
 *   - Skeleton loading state
 *
 * Props:
 *   label    {string}  — metric name
 *   value    {number|string} — the stat value (numbers animate; strings display directly)
 *   icon     {ReactNode} — lucide-react icon element
 *   variant  {'primary'|'success'|'warning'|'danger'} — colour theme
 *   loading  {boolean} — show skeleton
 *   prefix   {string}  — e.g. '₦' before the number
 *   suffix   {string}  — e.g. '%' after the number
 */
export default function StatCard({
  label = 'Stat',
  value = 0,
  icon,
  variant = 'primary',
  loading = false,
  prefix = '',
  suffix = '',
}) {
  const [displayVal, setDisplayVal] = useState(0);
  const frameRef = useRef(null);
  const isNumeric = typeof value === 'number' && !isNaN(value);

  // Count-up animation
  useEffect(() => {
    if (!isNumeric || loading) {
      setDisplayVal(value);
      return;
    }

    const duration = 900; // ms
    const start = performance.now();
    const startVal = 0;
    const endVal = value;

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayVal(Math.round(startVal + (endVal - startVal) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, loading, isNumeric]);

  const variantMap = {
    primary: {
      iconBg: 'linear-gradient(135deg, #E0F2FE, rgba(14,165,233,0.08))',
      iconColor: 'var(--primary)',
      shadow: '0 4px 14px rgba(14,165,233,0.22)',
      bar: 'linear-gradient(90deg, #0EA5E9, #38BDF8)',
      hoverShadow: 'var(--shadow-primary)',
    },
    success: {
      iconBg: 'linear-gradient(135deg, #ECFDF5, rgba(16,185,129,0.08))',
      iconColor: 'var(--success)',
      shadow: '0 4px 14px rgba(16,185,129,0.22)',
      bar: 'linear-gradient(90deg, #10B981, #34D399)',
      hoverShadow: 'var(--shadow-success)',
    },
    warning: {
      iconBg: 'linear-gradient(135deg, #FEF3C7, rgba(245,158,11,0.08))',
      iconColor: 'var(--warning)',
      shadow: '0 4px 14px rgba(245,158,11,0.22)',
      bar: 'linear-gradient(90deg, #F59E0B, #FBBF24)',
      hoverShadow: 'var(--shadow-warning)',
    },
    danger: {
      iconBg: 'linear-gradient(135deg, #FEF2F2, rgba(239,68,68,0.08))',
      iconColor: 'var(--danger)',
      shadow: '0 4px 14px rgba(239,68,68,0.18)',
      bar: 'linear-gradient(90deg, #EF4444, #F87171)',
      hoverShadow: 'var(--shadow-danger)',
    },
  };

  const theme = variantMap[variant] || variantMap.primary;

  if (loading) {
    return (
      <div style={{
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
      }}>
        <div className="skeleton" style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="skeleton" style={{ height: '28px', width: '60%', borderRadius: '6px' }} />
          <div className="skeleton" style={{ height: '14px', width: '80%', borderRadius: '6px' }} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="stat-card"
      style={{
        '--card-bar': theme.bar,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        padding: '22px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = theme.hoverShadow;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      {/* Top colour bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: theme.bar,
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
      }} />

      <div className="stat-info">
        <h3 style={{
          fontSize: '2rem',
          fontWeight: '800',
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          color: 'var(--text-primary)',
          marginBottom: '4px',
          fontFamily: 'var(--font-heading)',
        }}>
          {prefix}{isNumeric ? displayVal.toLocaleString() : value}{suffix}
        </h3>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.78rem',
          fontWeight: '700',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          {label}
        </p>
      </div>

      {/* Icon box */}
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.iconBg,
        color: theme.iconColor,
        boxShadow: theme.shadow,
        flexShrink: 0,
        transition: 'transform 0.25s ease',
      }}>
        {icon}
      </div>
    </div>
  );
}
