import React, { useEffect, useState } from 'react';
import {
  Award, BookOpen, CreditCard, ShieldCheck,
  ArrowRight, MapPin, Phone, Mail, GraduationCap
} from 'lucide-react';

const features = [
  {
    icon: <Award size={22} />,
    title: 'Check Results',
    desc: 'View and print your report cards online, instantly and securely.',
    color: '#0EA5E9',
    bg: '#E0F2FE',
  },
  {
    icon: <CreditCard size={22} />,
    title: 'View Fees',
    desc: 'Check your fee balance and download official payment receipts.',
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    icon: <ShieldCheck size={22} />,
    title: 'Result PIN Codes',
    desc: 'Secure scratch card codes — limited to 5 checks per term.',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  {
    icon: <BookOpen size={22} />,
    title: 'Rules & Guidelines',
    desc: 'Read school requirements and sign parent undertakings online.',
    color: '#6366F1',
    bg: '#EEF2FF',
  },
];

export default function LandingPage({ settings, onEnterPortal }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const toggleTheme = () => {
    document.body.classList.toggle('dark');
  };

  const schoolName = settings?.landing_school_name || 'Jere Model Academy';
  const schoolTagline = settings?.landing_tagline || 'KADUNA STATE, NIGERIA';
  const schoolAbbr = schoolName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .substring(0, 4);
  const heroTitle = settings?.landing_hero_title || 'Shaping Minds,\nBuilding the Future.';
  const heroDesc =
    settings?.landing_hero_desc ||
    'Welcome to our online school portal. We provide high-quality education and make checking results, tracking payments, and attendance simple, fast, and digital.';
  const schoolAddress =
    settings?.landing_address ||
    'Opposite Jabal-Annur Mosque, New Abuja Road, Jere Kagarko LGA, Kaduna State.';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Decorative background blobs ── */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-120px', right: '-100px',
          width: '520px', height: '520px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, rgba(14,165,233,0) 70%)',
          animation: 'blobDrift 14s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '420px', height: '420px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(12,42,74,0.10) 0%, rgba(12,42,74,0) 70%)',
          animation: 'blobDrift 18s ease-in-out infinite reverse',
        }} />
      </div>

      {/* ── Top Navbar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 48px',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: '0 2px 16px rgba(15,23,42,0.06)',
        transition: 'var(--transition)',
      }}>
        {/* Logo + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 6px 18px var(--primary-glow)',
            flexShrink: 0,
          }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
              {schoolName}
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700', margin: 0, letterSpacing: '0.06em' }}>
              {schoolTagline}
            </p>
          </div>
        </div>

        {/* Nav Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{ fontSize: '0.82rem', padding: '8px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)' }}
          >
            ⚡ Theme
          </button>
          <button
            className="btn btn-primary"
            onClick={onEnterPortal}
            style={{ borderRadius: 'var(--radius-full)', padding: '10px 22px' }}
          >
            Login <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <main style={{
        flexGrow: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '56px',
        alignItems: 'center',
        padding: '72px 80px',
        maxWidth: '1300px',
        margin: '0 auto',
        width: '100%',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Left: Hero text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Badge pill */}
          <div className={visible ? 'fade-slide-up' : ''} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: '800',
            width: 'fit-content',
            letterSpacing: '0.05em',
            border: '1px solid rgba(14,165,233,0.25)',
            animation: visible ? 'fadeSlideUp 0.5s ease both' : 'none',
          }}>
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', animation: 'pulseRing 2s infinite' }} />
            NURSERY · PRIMARY · JUNIOR · SENIOR SECONDARY
          </div>

          {/* Hero headline */}
          <h2 style={{
            fontSize: '3.2rem',
            lineHeight: '1.12',
            fontWeight: '800',
            margin: 0,
            background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--primary) 60%, var(--secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            whiteSpace: 'pre-line',
            animation: visible ? 'fadeSlideUp 0.55s 0.08s ease both' : 'none',
          }}>
            {heroTitle}
          </h2>

          {/* Description */}
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.7',
            margin: 0,
            maxWidth: '480px',
            animation: visible ? 'fadeSlideUp 0.55s 0.16s ease both' : 'none',
          }}>
            {heroDesc}
          </p>

          {/* Address card */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            padding: '16px 20px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderLeft: '4px solid var(--primary)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            animation: visible ? 'fadeSlideUp 0.55s 0.24s ease both' : 'none',
          }}>
            <div style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }}>
              <MapPin size={18} />
            </div>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary)', margin: '0 0 3px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>School Address</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {schoolAddress}
              </p>
            </div>
          </div>

          {/* CTA */}
          <div style={{
            display: 'flex',
            gap: '14px',
            animation: visible ? 'fadeSlideUp 0.55s 0.32s ease both' : 'none',
          }}>
            <button
              className="btn btn-primary"
              style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: 'var(--radius-full)' }}
              onClick={onEnterPortal}
            >
              Go to Portal <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right: Features grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '18px',
        }}>
          {features.map((feat, i) => (
            <div
              key={i}
              style={{
                padding: '24px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                cursor: 'default',
                animation: visible ? `fadeSlideUp 0.55s ${0.1 + i * 0.08}s ease both` : 'none',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 12px 32px -4px ${feat.color}30`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              {/* Icon */}
              <div style={{
                width: '46px', height: '46px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: feat.bg, color: feat.color,
                boxShadow: `0 4px 12px ${feat.color}28`,
              }}>
                {feat.icon}
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                {feat.title}
              </h4>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0 }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        textAlign: 'center',
        padding: '24px 40px',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        background: 'var(--bg-surface)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap',
      }}>
        <span>© {new Date().getFullYear()} {schoolName}. All Rights Reserved.</span>
        <span style={{ color: 'var(--border-color)' }}>|</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <MapPin size={12} /> {schoolTagline}
        </span>
      </footer>
    </div>
  );
}
