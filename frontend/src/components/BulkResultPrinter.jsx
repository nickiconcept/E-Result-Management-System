import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ReportCard from './ReportCard';
import { ArrowLeft, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function BulkResultPrinter({ classes, sessions, currentTerm, currentSession, settings, onClose, onBack, isStandalonePage = false }) {
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
    if (!selectedClassId && classes && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes]);

  useEffect(() => {
    if (!session) {
      if (currentSession) {
        setSession(currentSession);
      } else if (sessions && sessions.length > 0) {
        setSession(sessions[0].session_name);
      } else {
        setSession('2026/2027');
      }
    }
  }, [currentSession, sessions]);

  useEffect(() => {
    if (!term && currentTerm) {
      setTerm(currentTerm);
    }
  }, [currentTerm]);

  useEffect(() => {
    if (selectedClassId && term && session) {
      fetchBulkResults();
    }
  }, [selectedClassId, term, session]);



  const bulkRef = React.useRef(null);

  const handleExportPDF = () => {
    const element = bulkRef.current;
    if (!element) return;
    
    const opt = {
      margin:       0,
      filename:     `${selectedClassName}_${term}_results.pdf`.replace(/\s+/g, '_'),
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: 'css', before: '.bulk-single-card-page' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const selectedClassName = classes?.find(c => c.id === parseInt(selectedClassId))?.name || 'Class';

  const content = (
    <div className="glass-panel" style={{ backgroundColor: '#fff', color: '#000', padding: '24px', borderRadius: '12px' }}>
      {/* Controls & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} className="no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
            <Download size={24} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Download Bulk Results</h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              Select a class arm to view and download all student report cards in one continuous batch.
            </p>
          </div>
        </div>
        {onBack && (
          <button
            className="btn btn-secondary"
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', color: 'white', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px' }}
          >
            <ArrowLeft size={16} /> Close Result
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end', padding: '20px 0', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }} className="no-print">
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Select Class Arm</label>
          <select
            className="form-control"
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
          >
            {[...(classes || [])].sort((a, b) => (a.name || '').localeCompare(b.name || '')).map((cls, idx) => (
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
            {sessions && sessions.length > 0 ? (
              sessions.map((s, idx) => (
                <option key={idx} value={s.session_name}>{s.session_name}</option>
              ))
            ) : (
              <>
                <option value="2026/2027">2026/2027</option>
              </>
            )}
          </select>
        </div>

        <button
            className="btn btn-primary"
            onClick={handleExportPDF}
            disabled={loading || bulkData.length === 0}
            style={{ padding: '10px 24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '20px' }}
            title="Download as PDF"
          >
            <Download size={18} /> Download PDF
        </button>
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
        <div className="bulk-print-container print-area" ref={bulkRef}>
          {bulkData.map((studentReportData, idx) => (
            <div key={idx} className="bulk-single-card-page" style={{ marginBottom: '30px' }}>
              <ReportCard
                data={studentReportData}
                settings={settings}
                isBulk={true}
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
