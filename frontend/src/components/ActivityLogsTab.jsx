import React, { useState, useEffect, useCallback } from 'react';
import { History, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import Pagination from './Pagination';

export default function ActivityLogsTab() {
  const [activityLogs, setActivityLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsMeta, setLogsMeta] = useState({ total: 0, last_page: 1, from: 0, to: 0 });
  const [logsPage, setLogsPage] = useState(1);
  const [logsPageSize, setLogsPageSize] = useState(50);
  const [logsFilters, setLogsFilters] = useState({ search: '', user_role: '', module: '', date_from: '', date_to: '' });

  const fetchLogs = useCallback(async (page, size, filters) => {
    setLogsLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: size });
      if (filters.search) params.set('search', filters.search);
      if (filters.user_role) params.set('user_role', filters.user_role);
      if (filters.module) params.set('module', filters.module);
      if (filters.date_from) params.set('date_from', filters.date_from);
      if (filters.date_to) params.set('date_to', filters.date_to);
      const res = await api.get(`/activity-logs?${params}`);
      setActivityLogs(res.data.data || []);
      setLogsMeta(res.data);
    } catch (e) {
      console.error('Failed to load logs', e);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(1, 50, { search: '', user_role: '', module: '', date_from: '', date_to: '' });
  }, [fetchLogs]);

  const handleFilterChange = (key, val) => {
    const updated = { ...logsFilters, [key]: val };
    setLogsFilters(updated);
    setLogsPage(1);
    fetchLogs(1, logsPageSize, updated);
  };

  const getRoleBadge = (r) => ({ admin: { bg: 'rgba(239,68,68,0.1)', c: '#dc2626' }, teacher: { bg: 'rgba(59,130,246,0.1)', c: '#1d4ed8' }, form_master: { bg: 'rgba(16,185,129,0.1)', c: '#065f46' }, student: { bg: 'rgba(245,158,11,0.1)', c: '#92400e' } }[r] || { bg: 'rgba(107,114,128,0.1)', c: '#374151' });
  const getModBadge = (m) => ({ auth: { bg: 'rgba(99,102,241,0.1)', c: '#4338ca' }, students: { bg: 'rgba(6,182,212,0.1)', c: '#0e7490' }, teachers: { bg: 'rgba(249,115,22,0.1)', c: '#c2410c' }, finance: { bg: 'rgba(34,197,94,0.1)', c: '#15803d' }, results: { bg: 'rgba(168,85,247,0.1)', c: '#7e22ce' }, settings: { bg: 'rgba(107,114,128,0.1)', c: '#374151' } }[m] || { bg: 'rgba(107,114,128,0.08)', c: '#374151' });

  const handlePageChange = (page) => {
    setLogsPage(page);
    fetchLogs(page, logsPageSize, logsFilters);
  };

  const handlePageSizeChange = (size) => {
    setLogsPageSize(size);
    setLogsPage(1);
    fetchLogs(1, size, logsFilters);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.3)' }}>
            <History size={24} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Activity Logs</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Full audit trail — all user actions across the portal</p>
          </div>
        </div>
        <button onClick={() => fetchLogs(logsPage, logsPageSize, logsFilters)} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px', cursor: 'pointer' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
        <input type="text" className="form-control" placeholder="Search user, action, target..." value={logsFilters.search} onChange={(e) => handleFilterChange('search', e.target.value)} style={{ flex: '2 1 200px', padding: '8px 12px', fontSize: '0.85rem' }} />
        <select className="form-control" value={logsFilters.user_role} onChange={(e) => handleFilterChange('user_role', e.target.value)} style={{ flex: '1 1 140px', padding: '8px 12px', fontSize: '0.85rem' }}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="form_master">Form Master</option>
          <option value="student">Student</option>
        </select>
        <select className="form-control" value={logsFilters.module} onChange={(e) => handleFilterChange('module', e.target.value)} style={{ flex: '1 1 140px', padding: '8px 12px', fontSize: '0.85rem' }}>
          <option value="">All Modules</option>
          <option value="auth">Auth</option>
          <option value="students">Students</option>
          <option value="teachers">Teachers</option>
          <option value="finance">Finance</option>
          <option value="results">Results</option>
          <option value="settings">Settings</option>
        </select>
        <input type="date" className="form-control" value={logsFilters.date_from} onChange={(e) => handleFilterChange('date_from', e.target.value)} style={{ flex: '1 1 150px', padding: '8px 12px', fontSize: '0.85rem' }} title="From date" />
        <input type="date" className="form-control" value={logsFilters.date_to} onChange={(e) => handleFilterChange('date_to', e.target.value)} style={{ flex: '1 1 150px', padding: '8px 12px', fontSize: '0.85rem' }} title="To date" />
        {Object.values(logsFilters).some(v => v) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { const c = { search: '', user_role: '', module: '', date_from: '', date_to: '' }; setLogsFilters(c); fetchLogs(1, logsPageSize, c); }} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>Clear Filters</button>
        )}
      </div>
      <div className="table-container">
        <table className="school-table" style={{ fontSize: '0.85rem' }}>
          <thead>
            <tr>
              <th>Timestamp</th><th>User</th><th>Role</th><th>Module</th><th>Action</th><th>Description</th><th>IP</th>
            </tr>
          </thead>
          <tbody>
            {logsLoading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading logs...</td></tr>
            ) : activityLogs.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No log entries found.</td></tr>
            ) : activityLogs.map((log, idx) => {
              const rb = getRoleBadge(log.user_role), mb = getModBadge(log.module);
              return (
                <tr key={log.id || idx}>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{log.created_at ? new Date(log.created_at).toLocaleString() : '—'}</td>
                  <td style={{ fontWeight: '600' }}>{log.user_name || '—'}</td>
                  <td><span style={{ padding: '3px 9px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: rb.bg, color: rb.c, textTransform: 'capitalize' }}>{log.user_role || '—'}</span></td>
                  <td><span style={{ padding: '3px 9px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: mb.bg, color: mb.c, textTransform: 'capitalize' }}>{log.module || '—'}</span></td>
                  <td><code style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>{log.action}</code></td>
                  <td style={{ maxWidth: '300px' }}>{log.description}</td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.ip_address || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {logsMeta.total > 0 && (
        <Pagination 
          currentPage={logsPage} 
          totalItems={logsMeta.total} 
          pageSize={logsPageSize} 
          onPageChange={handlePageChange} 
          onPageSizeChange={handlePageSizeChange} 
        />
      )}
    </div>
  );
}
