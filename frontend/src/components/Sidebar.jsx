import React from 'react';

export default function Sidebar({ role, activeTab, setActiveTab, onLogout, user, isOpen, onClose, settings }) {
  const navItems = {
    admin: [
      { id: 'dashboard', label: 'Overview', color: '#0072ff' },
      { id: 'students', label: 'Students', color: '#38ef7d' },
      { id: 'teachers', label: 'Teachers', color: '#E100FF' },
      { id: 'classes', label: 'Classes', color: '#2948ff' },
      { id: 'subjects', label: 'Subjects', color: '#00dbde' },
      { id: 'attendance', label: 'Attendance', color: '#825a2c' },
      { id: 'schemes', label: 'Scheme of Work', color: '#ff9900' },
      { id: 'fees', label: 'School Fees', color: '#f2c94c' },
      { id: 'pins', label: 'Result PINs', color: '#F9D423' },
      { id: 'settings', label: 'Settings', color: '#ff4b2b' }
    ],
    teacher: [
      { id: 'dashboard', label: 'Overview', color: '#0072ff' },
      { id: 'grades', label: 'Enter Marks', color: '#00dbde' },
      { id: 'attendance', label: 'Attendance', color: '#38ef7d' },
      { id: 'broadsheet', label: 'Class Results', color: '#E100FF' },
      { id: 'schemes', label: 'Scheme of Work', color: '#ff9900' }
    ],
    student: [
      { id: 'dashboard', label: 'Overview', color: '#0072ff' },
      { id: 'results', label: 'My Results', color: '#38ef7d' },
      { id: 'schemes', label: 'Scheme of Work', color: '#ff9900' },
      { id: 'student-fees', label: 'Fees & Payments', color: '#f2c94c' },
      { id: 'rules', label: 'School Rules', color: '#F9D423' }
    ]
  };

  const items = navItems[role] || [];

  return (
    <aside className={`sidebar-container ${isOpen ? 'open' : ''}`} style={{
      width: '280px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-surface)',
      transition: 'transform 0.3s ease'
    }}>
      {/* Branding Header with Close button for mobile */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ fontSize: '1.10rem', fontWeight: '800', color: 'var(--primary)', margin: 0, textTransform: 'uppercase' }}>
            {settings?.landing_school_name || 'Jere Model Academy'}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>PORTAL</span>
        </div>
        <button 
          onClick={onClose} 
          className="mobile-only" 
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      {/* Navigation list */}
      <nav style={{ padding: '20px 10px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (onClose) onClose(); // Close drawer on mobile click
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: activeTab === item.id ? '600' : '500',
              backgroundColor: activeTab === item.id ? 'var(--primary-light)' : 'transparent',
              color: activeTab === item.id ? 'var(--primary)' : 'var(--text-primary)',
              textAlign: 'left',
              gap: '12px',
              transition: 'var(--transition)'
            }}
          >
            {/* Minimalist modern colored indicator instead of emoji */}
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: item.color,
              display: 'inline-block',
              flexShrink: 0
            }}></span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        {settings?.landing_school_name || 'Jere Model Academy'} Portal
      </div>
    </aside>
  );
}
