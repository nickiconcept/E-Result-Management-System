import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ParentPortal from './components/ParentPortal';
import Layout from './components/Layout';
import Results from './components/Results';
import { auditService } from './services/auditService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    localStorage.setItem('auth_user', JSON.stringify(authenticatedUser));
    auditService.log(authenticatedUser.id, authenticatedUser.role, 'Login', 'Session Start');
  };

  const handleLogout = () => {
    if (user) {
      auditService.log(user.id, user.role, 'Logout', 'Session End');
    }
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
        } />
        
        <Route path="/portal" element={<ParentPortal />} />
        
        <Route element={user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<Dashboard user={user as User} />} />
          <Route path="/results" element={<Results user={user as User} />} />
          <Route path="/students" element={<div className="p-8 font-bold text-gray-400">Student Management Module - Coming Soon</div>} />
          <Route path="/audit-logs" element={<div className="p-8 font-bold text-gray-400">Security Audit Logs - Restricted Access</div>} />
        </Route>

        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/portal"} />} />
      </Routes>
    </HashRouter>
  );
};

export default App;