import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ReportCard from './ReportCard';

export default function BulkResultPrinter({ classes, sessions, currentTerm, currentSession, settings, onClose, isStandalonePage = false }) {
  const [selectedClassId, setSelectedClassId] = useState(classes && classes.length > 0 ? classes[0].id : '');
  const [term, setTerm] = useState(currentTerm || '3rd Term');
  const [session, setSession] = useState(currentSession || '');
  
  const [loading, setLoading] = useState(false);
  const [bulkData, setBulkData] = useState([]);
  const [error, setError] = useState('');

  const fetchBulkResults = async () => {
    if (!selectedClassId) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getBulkReportCards(selectedClassId, term, session);
      setBulkData(data);
    } catch (err) {
      setError(err.message || 'Failed to load bulk report cards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId && term && session) {
      fetchBulkResults();
    }
  }, [selectedClassId, term, session]);

  const handlePrintAll = () => {
    window.print();
  };

  const selectedClassName = classes?.find(c => c.id === parseInt(selectedClassId))?.name || 'Class';

  const content = (
    <div className="glass-panel" style={{ backgroundColor: '#fff', color: '#000', padding: '24px', borderRadius: '12px' }}>
      
      {/* Controls & Action Bar */}
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }} className="no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e40af' }}>🖨️ Print Results</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Select a class arm to view and print all student report cards in one continuous batch.
            </p>
          </div>
          {onClose && (
            <button className="btn btn-secondary" onClick={onClose} style={{ border: '1px solid #ccc', padding: '6px 14px' }}>
              ✕ Close
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Select Class Arm</label>
            <select
              className="form-control"
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
            >
              {classes?.map((cls, idx) => (
                <option key={idx} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>School Term</label>
            <select
              className="form-control"
              value={term}
              onChange={e => setTerm(e.target.value)}
            >
              <option value="1st Term">1st Term</option>
              <option value="2nd Term">2nd Term</option>
              <option value="3rd Term">3rd Term</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>School Year</label>
            <select
              className="form-control"
              value={session}
              onChange={e => setSession(e.target.value)}
            >
              {sessions?.map((s, idx) => (
                <option key={idx} value={s.session_name}>{s.session_name}</option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={handlePrintAll}
            disabled={loading || bulkData.length === 0}
            style={{ padding: '10px 24px', fontWeight: 'bold' }}
          >
            🖨️ Print All {bulkData.length} Results
          </button>
        </div>
      </div>

      {/* Loading / Status alerts */}
      {loading && (
        <div style={{ padding: '30px', textAlign: 'center', color: '#1e40af' }} className="no-print">
          <h3>Generating Report Cards for {selectedClassName}...</h3>
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 18px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '20px' }} className="no-print">
          Warning: {error}
        </div>
      )}

      {!loading && bulkData.length === 0 && !error && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }} className="no-print">
          <p>No students or grade records found for <strong>{selectedClassName}</strong> in <strong>{term} ({session})</strong>.</p>
        </div>
      )}

      {/* BULK PRINT AREA */}
      {!loading && bulkData.length > 0 && (
        <div className="bulk-print-container print-area">
          {bulkData.map((studentReportData, idx) => (
            <div key={idx} className="bulk-single-card-page" style={{ marginBottom: '30px' }}>
              <ReportCard
                data={studentReportData}
                settings={settings}
              />
            </div>
          ))}
        </div>
      )}

      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 6mm;
          }
          .bulk-single-card-page {
            page-break-after: always !important;
            break-after: page !important;
          }
          .bulk-single-card-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}</style>

    </div>
  );

  if (isStandalonePage) {
    return content;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: '1000px', backgroundColor: 'transparent', padding: 0 }}>
        {content}
      </div>
    </div>
  );
}
