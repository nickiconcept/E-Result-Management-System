import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ArrowLeft, Printer, Search, FileText, Receipt } from 'lucide-react';

export default function BulkReceiptPrinter({ classes, sessions, currentTerm, currentSession, settings, onClose }) {
  const [selectedClassId, setSelectedClassId] = useState(classes && classes.length > 0 ? classes[0].id : '');
  const [term, setTerm] = useState(currentTerm || '3rd Term');
  const [session, setSession] = useState(currentSession || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [error, setError] = useState('');

  const fetchBulkReceipts = async () => {
    if (!selectedClassId) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getBulkReceipts(selectedClassId, term, session, startDate, endDate);
      setReceipts(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load bulk receipts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchBulkReceipts();
    }
  }, [selectedClassId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bulk-printer-container">
      <style>
        {`
          .bulk-printer-container {
            background-color: var(--bg-surface, #f8fafc);
            min-height: 100vh;
            padding: 20px;
            color: var(--text-primary);
          }
          .controls-panel {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            align-items: flex-end;
          }
          .receipts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
          }
          
          /* Print Styles for A4 Landscape - 3 receipts per page */
          @media print {
            body * {
              visibility: hidden;
            }
            .bulk-printer-container {
              padding: 0;
              margin: 0;
              background-color: transparent;
            }
            .bulk-printer-container * {
              visibility: visible;
            }
            .no-print {
              display: none !important;
            }
            
            @page {
              size: A4 landscape;
              margin: 5mm;
            }

            .receipts-grid {
              display: grid !important;
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 10px !important;
              width: 100% !important;
            }

            .receipt-wrapper {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              height: 195mm; /* A4 landscape height minus margins */
              box-sizing: border-box;
            }

            .page-break {
              page-break-after: always !important;
              break-after: always !important;
            }
          }
        `}
      </style>

      <div className="controls-panel no-print">
        <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e3a8a' }}><FileText size={18} style={{ display: 'inline', verticalAlign: '-2px' }}/> Print Receipts</h2>
          <button className="btn btn-primary" onClick={handlePrint} disabled={receipts.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Printer size={16} /> Print {receipts.length} Receipts
          </button>
        </div>
        
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Target Class</label>
          <select className="form-control" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Term</label>
          <select className="form-control" value={term} onChange={e => setTerm(e.target.value)}>
            <option value="">All Terms</option>
            <option value="1st Term">1st Term</option>
            <option value="2nd Term">2nd Term</option>
            <option value="3rd Term">3rd Term</option>
          </select>
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Session</label>
          <select className="form-control" value={session} onChange={e => setSession(e.target.value)}>
            <option value="">All Sessions</option>
            {sessions.map(s => <option key={s.id} value={s.session_name}>{s.session_name}</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Start Date</label>
          <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>End Date</label>
          <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div>
          <button className="btn btn-primary" onClick={fetchBulkReceipts} disabled={loading}>
            {loading ? 'Loading...' : <><Search size={16} style={{ verticalAlign: '-2px' }}/> Fetch</>}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger no-print">{error}</div>}

      {!loading && receipts.length === 0 && !error && (
        <div className="no-print" style={{ textAlign: 'center', padding: '50px', color: '#64748b', backgroundColor: '#fff', borderRadius: '8px' }}>
          No receipts found for the selected criteria.
        </div>
      )}

      <div className="receipts-grid" id="printable-receipts">
        {receipts.map((rec, index) => {
          const isThird = (index + 1) % 3 === 0;
          return (
            <React.Fragment key={rec.id}>
              <div className="receipt-wrapper" style={{ 
                fontFamily: '"Inter", "Segoe UI", sans-serif',
                border: '1px solid #ccc', 
                backgroundColor: '#fff', 
                padding: '20px 15px', 
                borderRadius: '8px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                color: '#000'
              }}>
                <div style={{ textAlign: 'center', paddingBottom: '12px', borderBottom: '2px solid #e5e7eb', marginBottom: '15px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary, #1d4ed8)', color: 'white', marginBottom: '8px' }}>
                    <Receipt size={20} />
                  </div>
                  <h3 style={{ margin: '0 0 3px 0', fontSize: '1.1rem', fontWeight: '800', color: '#000' }}>{settings?.landing_school_name || 'Jere Model Academy'}</h3>
                  <p style={{ margin: '0 0 6px 0', fontSize: '0.75rem', color: '#000' }}>{settings?.landing_tagline || 'KADUNA STATE, NIGERIA'}</p>
                  <div style={{ display: 'inline-block', padding: '3px 10px', backgroundColor: '#f3f4f6', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.5px', color: '#000' }}>
                    OFFICIAL PAYMENT RECEIPT
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#000' }}>Receipt No:</span>
                    <strong style={{ fontFamily: 'monospace' }}>{rec.receipt_number || 'N/A'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#000' }}>Date:</span>
                    <strong>{rec.payment_date || new Date().toLocaleDateString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#000' }}>Student Name:</span>
                    <strong style={{ textAlign: 'right' }}>{rec.full_name || 'N/A'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#000' }}>Admission No:</span>
                    <strong style={{ fontFamily: 'monospace' }}>{rec.admission_number || 'N/A'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#000' }}>Class:</span>
                    <strong>{rec.class_name || 'N/A'}</strong>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '12px', marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Fee Description</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#000', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '10px' }}>
                    {rec.title}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.8rem' }}>
                    {rec.true_amount_due && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#000' }}>Total Billed:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>₦{Number(rec.true_amount_due).toLocaleString()}</span>
                      </div>
                    )}
                    {rec.true_amount_paid !== undefined && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#000' }}>Cumulative Paid:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>₦{Number(rec.true_amount_paid).toLocaleString()}</span>
                      </div>
                    )}
                    {rec.true_amount_due && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                        <span>Current Balance:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>₦{Math.max(0, Number(rec.true_amount_due) - Number(rec.true_amount_paid)).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px', marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#2563eb', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>This Payment</div>
                    <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '2px' }}>via {rec.payment_method || 'Cash'}</div>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1d4ed8', fontFamily: 'monospace' }}>
                    ₦{Number(rec.amount_paid).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'auto', paddingBottom: '10px' }}>
                  {rec.true_amount_paid >= rec.true_amount_due ? (
                    <div style={{ border: '2px solid #10b981', color: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', transform: 'rotate(-5deg)' }}>
                      PAID IN FULL
                    </div>
                  ) : (
                    <div style={{ border: '2px solid #f59e0b', color: '#d97706', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      PARTIAL PAYMENT
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'center', marginTop: 'auto', borderTop: '2px solid #e5e7eb', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '5px' }}>
                    {settings?.principal_signature ? (
                      <img src={settings.principal_signature} alt="Authorized Signature" style={{ height: '35px', objectFit: 'contain', marginBottom: '2px' }} />
                    ) : (
                      <div style={{ width: '120px', borderBottom: '1px solid #000', margin: '15px auto 5px auto' }}></div>
                    )}
                    <div style={{ fontSize: '0.65rem', color: '#000' }}>Authorized Signature</div>
                  </div>
                </div>
              </div>
              {isThird && <div className="page-break no-print" style={{ display: 'none' }}></div>}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
