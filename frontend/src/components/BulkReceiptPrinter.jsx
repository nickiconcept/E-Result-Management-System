import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ArrowLeft, Printer, Search, FileText } from 'lucide-react';

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
          
          /* Print Styles for A4 Landscape - 4 receipts per page */
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
              grid-template-columns: 1fr 1fr !important;
              grid-template-rows: 1fr 1fr !important;
              gap: 10px !important;
              width: 100% !important;
              height: 100% !important;
            }

            .receipt-wrapper {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              height: 95mm; /* roughly half of A4 landscape height minus margins */
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
          const isFourth = (index + 1) % 4 === 0;
          return (
            <React.Fragment key={rec.id}>
              <div className="receipt-wrapper" style={{ 
                border: '1px solid #ccc', 
                backgroundColor: '#fff', 
                padding: '15px', 
                borderRadius: '8px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '10px' }}>
                  <h3 style={{ margin: '0', fontSize: '1rem' }}>{settings?.landing_school_name || 'Jere Model Academy'}</h3>
                  <p style={{ margin: '2px 0', fontSize: '0.7rem' }}>{settings?.landing_tagline || 'KADUNA STATE, NIGERIA'}</p>
                  <p style={{ margin: '2px 0', fontSize: '0.75rem', fontWeight: 'bold' }}>OFFICIAL PAYMENT RECEIPT</p>
                </div>

                <div style={{ fontSize: '0.75rem', lineHeight: '1.4', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>RECEIPT NO:</strong> <span>{rec.receipt_number}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>DATE:</strong> <span>{rec.payment_date || new Date().toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <strong>STUDENT NAME:</strong> <span style={{ textAlign: 'right' }}>{rec.full_name || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>ADMISSION NO:</strong> <span>{rec.admission_number || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>CLASS ARM:</strong> <span>{rec.class_name || 'N/A'}</span>
                  </div>
                  
                  <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>FEE DESCRIPTION:</strong> <span style={{ textAlign: 'right' }}>{rec.title}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.8rem', fontWeight: 'bold', color: '#065f46' }}>
                    <strong>AMOUNT PAID:</strong> <span>N{parseFloat(rec.amount_paid).toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                  <div style={{ width: '120px', borderBottom: '1px solid #000', margin: '0 auto 5px auto' }}></div>
                  <div style={{ fontSize: '0.65rem' }}>Authorized Signature</div>
                </div>
              </div>
              {isFourth && <div className="page-break no-print" style={{ display: 'none' }}></div>}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
