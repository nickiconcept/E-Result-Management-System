import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ReportCard from '../components/ReportCard';

export default function StudentDashboard({ user, settings, activeTab }) {
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Student statistics
  const [timeline, setTimeline] = useState([]);
  const [unlockedPins, setUnlockedPins] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);

  // Result check PIN prompts
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedTermForRC, setSelectedTermForRC] = useState(null); // {term, academic_year}
  const [pinInput, setPinInput] = useState('');

  // Unlocked Result data
  const [activeReportCardData, setActiveReportCardData] = useState(null);

  // Selected receipt for printing
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Status messages
  const [notify, setNotify] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Scheme of Work States
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [schemeWeeks, setSchemeWeeks] = useState([]);

  useEffect(() => {
    loadStudentData();
  }, []);

  useEffect(() => {
    if (activeTab && activeTab !== 'dashboard') {
      setActiveSubTab(activeTab);
    } else if (activeTab === 'dashboard') {
      setActiveSubTab('overview');
    }
  }, [activeTab]);

  const loadClassSubjects = async () => {
    try {
      const allClassSubjects = await api.getClassSubjects();
      const filtered = allClassSubjects.filter(cs => cs.class_id === user.class_id);
      setStudentSubjects(filtered);
      if (filtered.length > 0) {
        setSelectedSubjectId(filtered[0].subject_id);
      }
    } catch (err) {
      setErrorMsg('Failed to load class subjects: ' + err.message);
    }
  };

  const loadStudentSchemes = async (subId) => {
    if (!subId) return;
    try {
      const data = await api.getSchemes({
        class_id: user.class_id,
        subject_id: subId,
        term: settings?.active_term || '3rd Term'
      });
      const newWeeks = Array.from({ length: 12 }, (_, i) => {
        const wkNum = i + 1;
        const entry = data.find(item => item.week === wkNum);
        return {
          week: wkNum,
          topic: entry ? entry.topic : '',
          objectives: entry ? entry.objectives || '' : ''
        };
      });
      setSchemeWeeks(newWeeks);
    } catch (err) {
      setErrorMsg('Failed to load schemes: ' + err.message);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'schemes') {
      loadClassSubjects();
    }
  }, [activeSubTab]);

  useEffect(() => {
    if (activeSubTab === 'schemes' && selectedSubjectId) {
      loadStudentSchemes(selectedSubjectId);
    }
  }, [activeSubTab, selectedSubjectId]);

  const loadStudentData = async () => {
    try {
      const tlData = await api.getStudentTimeline(user.id);
      setTimeline(tlData.timeline);
      setUnlockedPins(tlData.unlockedPins || []);

      const feeData = await api.getStudentFees(user.id);
      setInvoices(feeData.invoices);
      setReceipts(feeData.receipts);
    } catch (err) {
      setErrorMsg('Failed to sync student data: ' + err.message);
    }
  };

  const handleTermClick = (termItem) => {
    setErrorMsg('');
    setNotify('');
    const isUnlocked = unlockedPins.some(
      p => p.term === termItem.term && p.academic_year === termItem.academic_year && p.usage_count < 5
    );

    if (isUnlocked) {
      // Fetch report card immediately
      fetchReportCard(termItem.term, termItem.academic_year);
    } else {
      setSelectedTermForRC(termItem);
      setPinInput('');
      setShowPinModal(true);
    }
  };

  const fetchReportCard = async (term, year) => {
    try {
      const data = await api.getReportCard(user.id, term, year);
      setActiveReportCardData(data);
      // Reload timeline details to refresh usage counts
      loadStudentData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleVerifyPinSubmit = async (e) => {
    e.preventDefault();
    if (!pinInput || !selectedTermForRC) return;
    setErrorMsg('');
    setNotify('');

    try {
      const res = await api.verifyPin(pinInput, selectedTermForRC.term, selectedTermForRC.academic_year);
      setNotify(`${res.message} You have ${res.usage_remaining} checks remaining.`);
      setShowPinModal(false);

      // Reload student data to obtain bound activePin
      await loadStudentData();

      // Fetch result sheet
      fetchReportCard(selectedTermForRC.term, selectedTermForRC.academic_year);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handlePrintReceipt = (receipt) => {
    setActiveReceipt(receipt);
  };

  const printReceiptAction = () => {
    window.print();
  };

  // Check if outstanding fees exist
  const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid');
  const outstandingDebt = unpaidInvoices.reduce((sum, inv) => sum + (inv.amount_due - inv.amount_paid), 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>

      {/* Notifications */}
      {notify && (
        <div style={{ padding: '12px 18px', backgroundColor: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }} className="no-print">
          Success: {notify}
          <button style={{ float: 'right', background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }} onClick={() => setNotify('')}>✕</button>
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '12px 18px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }} className="no-print">
          Warning: {errorMsg}
          <button style={{ float: 'right', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} onClick={() => setErrorMsg('')}>✕</button>
        </div>
      )}



      {/* ==========================================
          TAB 1: OVERVIEW & ALERTS
          ========================================== */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Student Info Welcome card */}
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)', display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{
                width: '90px',
                height: '110px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-secondary)'
              }}>
                {user.passport_photo ? (
                  <img src={user.passport_photo} alt="Student Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>PHOTO</div>
                )}
              </div>
              <div>
                <h2>{user.full_name}</h2>
                <p style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
                  Admission Number: <code>{user.admission_number}</code>
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                  Current Class: <strong>{user.class_name || 'Not Enrolled'}</strong> | {settings?.landing_school_name || 'Jere Model Academy'} Student Portal
                </p>
              </div>
            </div>

            {/* Fee Debt Alert */}
            {outstandingDebt > 0 && (
              <div className="glass-panel" style={{ padding: '24px', borderLeft: '5px solid var(--danger)', backgroundColor: 'var(--bg-surface)' }}>
                <h3 style={{ color: 'var(--danger)' }}>Unpaid Fees: ₦{outstandingDebt.toLocaleString()}</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>
                  You have unpaid fees. In compliance with school rules, result PINs are only given after all fees are paid.
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  *Pay fees at the office to get your result PIN.
                </p>
              </div>
            )}

            {/* General Announcements */}
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <h3>School Announcements</h3>
              <div style={{ marginTop: '15px', borderLeft: '3px solid var(--primary)', paddingLeft: '15px' }}>
                <h4 style={{ fontSize: '1rem' }}>Third Term Terminal Exams Commencement</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Students are reminded that all final term grades are computed with 4 CA components (10 marks each) and final exam sheets (60 marks). Study accordingly.
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>Posted: July 2026 | Admin Office</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <h3>My Info</h3>
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Current Term</span>
                  <strong>{settings.active_term}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Unpaid Fees</span>
                  <strong style={{ color: outstandingDebt > 0 ? 'var(--danger)' : 'var(--success)' }}>
                    ₦{outstandingDebt.toLocaleString()}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                  <span className="badge badge-success">Active</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          TAB 2: REPORT CARDS ACADEMIC TIMELINE
          ========================================== */}
      {activeSubTab === 'results' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
          <h3>My Results</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '25px' }}>
            Click on a term below to view your results. Enter your PIN code when prompted.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {timeline.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No academic records found on this profile.</p>
            ) : (
              timeline.map((item, idx) => {
                const pinBinding = unlockedPins.find(p => p.term === item.term && p.academic_year === item.academic_year);
                const isUnlocked = pinBinding && pinBinding.usage_count < 5;

                return (
                  <div
                    key={idx}
                    className="glass-panel"
                    style={{
                      padding: '20px 24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'var(--bg-primary)',
                      borderLeft: isUnlocked ? '5px solid var(--success)' : '5px solid var(--warning)'
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '1.05rem' }}>{item.academic_year} - {item.term}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {isUnlocked
                          ? `🔑 Unlocked - Views Used: ${pinBinding.usage_count} / 5`
                          : '🔒 Enter PIN to view results'}
                      </p>
                    </div>

                    <button className="btn btn-primary" onClick={() => handleTermClick(item)}>
                      {isUnlocked ? 'View Report Card' : 'Check Results'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: INVOICES & RECEIPTS LEDGER
          ========================================== */}
      {activeSubTab === 'fees' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* Invoices List */}
          <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
            <h3>School Fees</h3>
            <div className="table-container" style={{ marginTop: '15px' }}>
              <table className="school-table">
                <thead>
                  <tr>
                    <th>Fee Name</th>
                    <th>Amount</th>
                    <th>Paid</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600' }}>{inv.title}</td>
                      <td>₦{inv.amount_due.toLocaleString()}</td>
                      <td>₦{inv.amount_paid.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${inv.status === 'paid' ? 'badge-success' : 'badge-danger'}`}>
                          {inv.status === 'paid' ? 'Paid' : inv.status === 'partial' ? 'Partially Paid' : 'Unpaid'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Receipts List */}
          <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
            <h3>Receipts</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Receipts for payments made.</p>

            <div className="table-container" style={{ marginTop: '15px' }}>
              <table className="school-table">
                <thead>
                  <tr>
                    <th>Receipt Number</th>
                    <th>Fee Name</th>
                    <th>Amount Paid</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center' }}>No payments logged yet.</td>
                    </tr>
                  ) : (
                    receipts.map((rec, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 'bold' }}>{rec.receipt_number}</td>
                        <td>{rec.title}</td>
                        <td>₦{rec.amount_paid.toLocaleString()}</td>
                        <td>
                          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handlePrintReceipt(rec)}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          TAB 4: SCHOOL RULES & UNDERTAKING HANDBOOK
          ========================================== */}
      {activeSubTab === 'rules' && (
        <div className="glass-panel" style={{ padding: '32px', backgroundColor: 'var(--bg-surface)', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <h2 style={{ color: 'var(--primary)' }}>{settings?.landing_school_name || 'Jere Model Academy'}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
              SCHOOL REQUIREMENTS & RULES
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '10px' }}>I. STUDENT REQUIREMENTS</h4>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              <li><strong>Books:</strong> 12 60-page books for Junior Secondary, and 12 80-page books for Senior Secondary.</li>
              <li><strong>Math Tools:</strong> 1 Math Set, and 1 scientific calculator (for Senior Secondary).</li>
              <li><strong>Attire & Items:</strong> 1 pair of white socks, 1 broom, 1 pair of brown sandals, and 1 school bag.</li>
              <li><strong>Textbooks:</strong> English and Mathematics textbooks are required.</li>
              <li><strong>Sports:</strong> Sports wear (₦2,500) from the sports office.</li>
            </ul>
          </div>

          <div>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '10px' }}>II. GENERAL SCHOOL RULES</h4>
            <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              <li><strong>Afternoon Lessons:</strong> All students must attend afternoon lessons from 2:30pm to 3:30pm (Monday to Wednesday).</li>
              <li><strong>Be on Time:</strong> All students must be in school by 7:45am.</li>
              <li><strong>No Phones:</strong> Cellphones are not allowed in school.</li>
              <li><strong>English Language:</strong> No speaking of pidgin or local languages; only correct English is allowed.</li>
              <li><strong>Grooming:</strong> No face paint, tattoos, rings, or long fingernails.</li>
              <li><strong>School Fees:</strong> All school fees must be paid by mid-term.</li>
            </ol>
          </div>

          <div style={{ marginTop: '30px', padding: '16px', backgroundColor: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', textAlign: 'center' }}>
            ✓ Signed Undertaking Form Confirmed
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 5: SCHEME OF WORK VIEW (READ-ONLY)
          ========================================== */}
      {activeSubTab === 'schemes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Filter Bar */}
          <div className="glass-panel" style={{ padding: '20px', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Scheme of Work</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '4px 0 0 0' }}>
                Review the 12-week course outline for your subjects this term ({settings?.active_term || '3rd Term'}).
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0, flex: '1 1 250px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Select Subject</label>
                <select
                  className="form-control"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                >
                  <option value="">Choose subject...</option>
                  {studentSubjects.map((sub, idx) => (
                    <option key={idx} value={sub.subject_id}>{sub.subject_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Scheme Table */}
          {!selectedSubjectId ? (
            <div className="glass-panel" style={{ padding: '40px', backgroundColor: 'var(--bg-surface)', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📋</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No subjects mapped to your class or none selected.</p>
            </div>
          ) : (
            <div className="glass-panel" style={{ backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
              {/* Subject Info Header */}
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                backgroundColor: 'var(--primary-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    backgroundColor: 'var(--primary)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', fontWeight: 'bold', flexShrink: 0
                  }}>📚</div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--primary)' }}>
                      {studentSubjects.find(s => s.subject_id === parseInt(selectedSubjectId) || s.subject_id === selectedSubjectId)?.subject_name || 'Subject'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {settings?.active_term || '3rd Term'} · {settings?.active_session || 'Current Session'}
                    </div>
                  </div>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600', backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
                  {schemeWeeks.filter(w => w.topic).length} / 12 Weeks
                </span>
              </div>

              {/* Table */}
              <div className="table-container" style={{ margin: 0, borderRadius: 0 }}>
                <table className="school-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '80px', textAlign: 'center' }}>Week</th>
                      <th style={{ width: '35%' }}>Topic / Content</th>
                      <th>Learning Objectives / Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schemeWeeks.map((w, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', borderRadius: '50%',
                            backgroundColor: w.topic ? 'var(--primary)' : 'var(--border-color)',
                            color: w.topic ? '#fff' : 'var(--text-muted)',
                            fontWeight: '700', fontSize: '0.8rem'
                          }}>{w.week}</span>
                        </td>
                        <td style={{ fontWeight: w.topic ? '500' : '400' }}>
                          {w.topic || <em style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No topic defined yet</em>}
                        </td>
                        <td style={{ color: w.objectives ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: w.objectives ? '0.9rem' : '0.85rem' }}>
                          {w.objectives || <em>—</em>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          MODAL: ENTER RESULT VERIFICATION PIN
          ========================================== */}
      {showPinModal && selectedTermForRC && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowPinModal(false)}>✕</button>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '2.5rem' }}>🔑</div>
              <h3>Enter Result PIN</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Please enter your 10-character PIN for {selectedTermForRC.academic_year} ({selectedTermForRC.term}).
              </p>
            </div>

            <form onSubmit={handleVerifyPinSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="e.g. ABC123XYZ9"
                  className="form-control"
                  style={{ textTransform: 'uppercase', fontSize: '1.3rem', textAlign: 'center', letterSpacing: '0.1em' }}
                  maxLength="10"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  required
                />
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '6px', textAlign: 'center' }}>
                  *This PIN can check results up to 5 times.
                </small>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                Check Results
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: REPORT CARD RENDERER
          ========================================== */}
      {activeReportCardData && (
        <ReportCard
          data={activeReportCardData}
          settings={settings}
          onClose={() => setActiveReportCardData(null)}
        />
      )}

      {/* ==========================================
          MODAL: RECEIPT PRINT LAYOUT
          ========================================== */}
      {activeReceipt && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '450px', backgroundColor: '#fff', color: '#000' }}>
            <button className="modal-close no-print" onClick={() => setActiveReceipt(null)} style={{ color: '#000' }}>✕</button>

            <div className="print-area" style={{ fontFamily: 'monospace', padding: '10px' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '10px', marginBottom: '15px' }}>
                <h3 style={{ margin: '0' }}>{settings?.landing_school_name || 'Jere Model Academy'}</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem' }}>{settings?.landing_address || 'Jere Kagarko LGA, Kaduna State.'}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem' }}>PAYMENT RECEIPT</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div><strong>RECEIPT NO:</strong> {activeReceipt.receipt_number}</div>
                <div><strong>DATE:</strong> {activeReceipt.payment_date}</div>
                <div><strong>STUDENT:</strong> {user.full_name}</div>
                <div><strong>ADM NO:</strong> {user.admission_number}</div>
                <div><strong>FEE DESCRIPTION:</strong> {activeReceipt.title}</div>
                <div style={{ borderBottom: '1px dashed #000', margin: '5px 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 'bold' }}>
                  <span>AMOUNT PAID:</span>
                  <span>₦{activeReceipt.amount_paid.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>METHOD:</span>
                  <span>{activeReceipt.payment_method}</span>
                </div>
                <div style={{ borderBottom: '1px dashed #000', margin: '5px 0' }}></div>
                <div style={{ fontSize: '0.75rem', textAlign: 'center', fontStyle: 'italic', marginTop: '10px' }}>
                  Logged by: {activeReceipt.logged_by_name || 'Finance Desk'}<br />
                  ~ Thank you for your payment ~
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }} className="no-print">
              <button className="btn btn-primary" onClick={printReceiptAction}>Print Slip</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
