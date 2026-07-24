import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import api from './utils/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  // Sync settings and token session on mount
  useEffect(() => {
    fetchSettings();
    verifySession();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load system settings:', err);
    }
  };

  const verifySession = () => {
    const token = localStorage.getItem('jma_token');
    if (token) {
      try {
        // Simple client-side token payload decoding
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        // Check expiry (in seconds)
        if (payload.exp * 1000 < Date.now()) {
          handleLogout();
        } else {
          setUser(payload);
        }
      } catch (err) {
        console.error('Invalid session token:', err);
        handleLogout();
      }
    }
    setLoading(false);
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setActiveTab('dashboard'); // Default landing page
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setActiveTab('dashboard');
  };

  if (loading || !settings) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: 'var(--primary)' }}>JMA</div>
        <h3>Syncing Jere Model Academy Portal...</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>Synchronizing local database schemas</p>
      </div>
    );
  }

  // If not logged in, show Landing Page or Login Screen
  if (!user) {
    if (!showLogin) {
      return <LandingPage settings={settings} onEnterPortal={() => setShowLogin(true)} />;
    }
    return <Login onLoginSuccess={handleLoginSuccess} onBack={() => setShowLogin(false)} />;
  }

  // Logged-in view selection based on role
  return (
    <DashboardLayout
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
      settings={settings}
    >
      {user.role === 'admin' && (
        <AdminDashboard
          settings={settings}
          fetchSettings={fetchSettings}
          activeTab={activeTab}
        />
      )}
      {user.role === 'teacher' && (
        <TeacherDashboard
          user={user}
          settings={settings}
          activeTab={activeTab}
        />
      )}
      {user.role === 'student' && (
        <StudentDashboard
          user={user}
          settings={settings}
          activeTab={activeTab}
        />
      )}
    </DashboardLayout>
  );
}
