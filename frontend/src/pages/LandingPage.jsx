import React from 'react';

export default function LandingPage({ settings, onEnterPortal }) {
  const toggleTheme = () => {
    document.body.classList.toggle('dark');
  };

  const schoolName = settings?.landing_school_name || 'Jere Model Academy';
  const schoolTagline = settings?.landing_tagline || 'KADUNA STATE, NIGERIA';
  const schoolAbbr = schoolName.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 4);
  const heroTitle = settings?.landing_hero_title || 'Shaping Minds, Building the Future.';
  const heroDesc = settings?.landing_hero_desc || 'Welcome to our online school portal. We provide high-quality education and make checking results, tracking payments, and checking attendance simple, fast, and digital.';
  const schoolAddress = settings?.landing_address || 'Opposite Jabal-Annur Mosque, New Abuja Road, Jere Kagarko LGA, Kaduna State.';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, var(--bg-primary), var(--bg-secondary))',
      color: 'var(--text-primary)',
      transition: 'var(--transition)'
    }}>
      {/* Top Navbar */}
      <header className="glass-panel" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 40px',
        margin: '20px 40px',
        backgroundColor: 'var(--bg-surface)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.05em' }}>{schoolAbbr}</span>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: '800', tracking: '-0.02em', margin: 0 }}>
              {schoolName}
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', margin: 0 }}>
              {schoolTagline}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={toggleTheme} className="theme-toggle-btn" style={{ fontSize: '0.85rem', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}>
            Switch Theme
          </button>
          <button className="btn btn-primary" onClick={onEnterPortal}>
            Login
          </button>
        </div>
      </header>

      {/* Hero Section: Two Columns */}
      <main style={{
        flexGrow: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '48px',
        alignItems: 'center',
        padding: '40px 80px',
        maxWidth: '1300px',
        margin: '0 auto'
      }}>
        
        {/* Left Column: Welcoming Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '6px 14px',
            borderRadius: '50px',
            fontSize: '0.8rem',
            fontWeight: '700',
            width: 'fit-content'
          }}>
            NURSERY TO SENIOR SECONDARY EDUCATION
          </div>
          
          <h2 style={{
            fontSize: '3rem',
            lineHeight: '1.15',
            fontWeight: '800',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            whiteSpace: 'pre-line'
          }}>
            {heroTitle}
          </h2>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}>
            {heroDesc}
          </p>

          {/* School Location Information */}
          <div className="glass-panel" style={{
            padding: '16px 20px',
            backgroundColor: 'var(--bg-surface)',
            borderLeft: '4px solid var(--primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary)' }}>School Address</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {schoolAddress}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
            <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.05rem' }} onClick={onEnterPortal}>
              Go to Portal
            </button>
          </div>
        </div>

        {/* Right Column: Portal Features Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '12px' }}>01</div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Check Results</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              View and print your report cards online instantly.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '12px' }}>02</div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>View Fees</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Check your fee status and print receipts.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '12px' }}>03</div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Result PIN Codes</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Secure check codes with a limit of 5 checks per term.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '12px' }}>04</div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Rules and Guidelines</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Read requirements and sign parent undertakings online.
            </p>
          </div>

        </div>

      </main>

      {/* Footer Info */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        © {new Date().getFullYear()} {schoolName}. All Rights Reserved.
      </footer>
    </div>
  );
}
