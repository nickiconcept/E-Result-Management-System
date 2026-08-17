import React, { useState } from 'react';
import Sidebar from './Sidebar';
import api from '../utils/api';
import { Sun, User, LogOut, Menu as MenuIcon, ShieldAlert } from 'lucide-react';

export default function DashboardLayout({ children, user, activeTab, setActiveTab, subTab, onSelectTab, onLogout, settings }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const toggleTheme = () => {
    document.body.classList.toggle('dark');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      const res = await api.changePassword(oldPassword, newPassword);
      setPasswordSuccess(res.message || 'Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  const handleSidebarSelectTab = (tabId, subTabId) => {
    if (onSelectTab) {
      onSelectTab(tabId, subTabId);
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        role={user.role}
        activeTab={activeTab}
        subTab={subTab}
        onSelectTab={handleSidebarSelectTab}
        onLogout={onLogout}
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        settings={settings}
      />
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''} mobile-only`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Main Work Area */}
      <div className="main-content" style={{ flexGrow: 1, backgroundColor: 'var(--bg-primary)' }}>
        {/* Top Header Bar */}
        <header className="glass-panel no-print" style={{
          padding: '16px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Hamburger Button for mobile */}
            <button
              className="mobile-only btn btn-secondary"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: '8px 12px',
                fontSize: '0.85rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MenuIcon size={18} />
              <span>Menu</span>
            </button>
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>
                Welcome back, {user.full_name}!
              </h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                {settings?.landing_school_name || 'Jere Model Academy'} Portal
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {settings && (
              <div style={{
                fontSize: '0.8rem',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '600'
              }} className="desktop-only">
                Active: {settings.active_session} | {settings.active_term}
                {!settings.result_entry_open && (
                  <span style={{ color: 'var(--danger)', marginLeft: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldAlert size={14} /> (Locked)
                  </span>
                )}
              </div>
            )}
            
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              fontWeight: '500'
            }} className="desktop-only">
              Date: {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>

            {/* Icon-based Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="btn btn-secondary" 
              style={{ 
                padding: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer'
              }}
              title="Toggle Theme"
            >
              <Sun size={18} />
            </button>

            {/* Profile Avatar Trigger */}
            <button 
              onClick={() => setShowProfileModal(true)} 
              className="btn btn-secondary" 
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.8rem', 
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {user.passport_photo ? (
                <img 
                  src={user.passport_photo.startsWith('data:') ? user.passport_photo : `http://localhost:5000${user.passport_photo}`} 
                  alt="Profile" 
                  style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} 
                />
              ) : (
                <User size={16} />
              )}
              <span>Profile</span>
            </button>

            <button onClick={onLogout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dynamic Inner Page View */}
        <main>
          {children}
        </main>
      </div>

      {/* User Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay no-print" style={{ zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ maxWidth: '500px', backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => {
              setShowProfileModal(false);
              setPasswordError('');
              setPasswordSuccess('');
              setOldPassword('');
              setNewPassword('');
              setConfirmPassword('');
            }} style={{ color: 'var(--text-primary)' }}>✕</button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'inline-block', position: 'relative', marginBottom: '12px' }}>
                {user.passport_photo ? (
                  <img 
                    src={user.passport_photo.startsWith('data:') ? user.passport_photo : `http://localhost:5000${user.passport_photo}`} 
                    alt="Passport" 
                    style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} 
                  />
                ) : (
                  <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--primary)', margin: '0 auto' }}>
                    <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                )}
              </div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem' }}>{user.full_name}</h3>
              <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', textTransform: 'capitalize' }}>
                {user.role === 'admin' ? 'Administrator' : user.role === 'teacher' ? 'Staff' : 'Student'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px', fontSize: '0.9rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '15px 0' }}>
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Username:</strong>
                <p style={{ margin: '3px 0 0 0', fontWeight: '500' }}>{user.username}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Status:</strong>
                <p style={{ margin: '3px 0 0 0', fontWeight: '600', color: user.status === 'active' ? 'var(--success)' : 'var(--danger)', textTransform: 'capitalize' }}>
                  {user.status || 'Active'}
                </p>
              </div>
              {user.role !== 'student' && user.email && (
                <div style={{ gridColumn: 'span 2' }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>Email:</strong>
                  <p style={{ margin: '3px 0 0 0', fontWeight: '500' }}>{user.email}</p>
                </div>
              )}
              {user.role === 'student' && (
                <>
                  <div style={{ gridColumn: 'span 2', borderTop: '1px dashed var(--border-color)', paddingTop: '10px', marginTop: '5px' }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '0.95rem' }}>Parent / Guardian Information</h5>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Parent Name:</strong>
                    <p style={{ margin: '3px 0 0 0', fontWeight: '500' }}>{user.parent_name || 'N/A'}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Parent Phone:</strong>
                    <p style={{ margin: '3px 0 0 0', fontWeight: '500' }}>{user.parent_phone || 'N/A'}</p>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Parent Email:</strong>
                    <p style={{ margin: '3px 0 0 0', fontWeight: '500' }}>{user.parent_email || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>

            <form onSubmit={handlePasswordChange} style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '15px' }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '1.05rem' }}>Change Password</h4>
              
              {passwordError && (
                <div style={{ padding: '8px 12px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 'bold' }}>
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div style={{ padding: '8px 12px', backgroundColor: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 'bold' }}>
                  {passwordSuccess}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Current Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={oldPassword} 
                    onChange={e => setOldPassword(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px', display: 'block' }}>New Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Confirm New Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
