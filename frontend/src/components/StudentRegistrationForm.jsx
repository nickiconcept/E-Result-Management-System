import React from 'react';

export default function StudentRegistrationForm({ student, onClose }) {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: '850px', backgroundColor: 'var(--bg-surface)' }}>
        <button className="modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }} className="no-print">
          <button className="btn btn-secondary" onClick={onClose} style={{ border: '1px solid var(--border-color)', padding: '8px 16px', fontSize: '0.85rem' }}>
            ← Back to Student List
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '5px' }}><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print Registration Form
          </button>
        </div>

        {/* PRINTABLE AREA */}
        <div className="physical-form-container print-area">
          <div className="physical-form-header">
            <h2>JERE MODEL ACADEMY</h2>
            <p>OPPOSITE JABAL-ANNUR MOSQUE, NEW ABUJA ROAD,</p>
            <p>JERE KAGARKO LGA, KADUNA STATE.</p>
          </div>

          <div className="physical-form-title">
            STUDENTS REGISTRATION FORM
          </div>

          <div className="physical-form-grid">
            <div className="form-fields">
              <div className="form-line-item">
                <span className="form-line-label">NAME:</span>
                <span className="form-line-value">{student.full_name}</span>
              </div>

              <div className="form-line-item">
                <span className="form-line-label">DATE OF BIRTH:</span>
                <span className="form-line-value">{student.date_of_birth || 'N/A'}</span>
              </div>

              <div className="form-line-item">
                <span className="form-line-label">CLASS OF ENTRY:</span>
                <span className="form-line-value">{student.class_of_entry || student.class_name || 'N/A'}</span>
              </div>

              <div className="form-line-item">
                <span className="form-line-label">TERM / YEAR OF ENTRY:</span>
                <span className="form-line-value">{student.term_year_of_entry || 'N/A'}</span>
              </div>

              <div className="form-line-item">
                <span className="form-line-label">LAST SCHOOL ATTENDED:</span>
                <span className="form-line-value">{student.last_school_attended || 'N/A'}</span>
              </div>

              <div className="form-line-item">
                <span className="form-line-label">ADDRESS OF RESIDENCE:</span>
                <span className="form-line-value">{student.address_residence || 'N/A'}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-line-item">
                  <span className="form-line-label">SEX:</span>
                  <span className="form-line-value">{student.sex || 'N/A'}</span>
                </div>
                <div className="form-line-item">
                  <span className="form-line-label">RELIGION:</span>
                  <span className="form-line-value">{student.religion || 'N/A'}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-line-item">
                  <span className="form-line-label">LOCAL GOVERNMENT:</span>
                  <span className="form-line-value">{student.local_government || 'N/A'}</span>
                </div>
                <div className="form-line-item">
                  <span className="form-line-label">STATE OF ORIGIN:</span>
                  <span className="form-line-value">{student.state_of_origin || 'N/A'}</span>
                </div>
              </div>

              <div className="form-line-item">
                <span className="form-line-label">HANDICAPPED (YES/NO):</span>
                <span className="form-line-value">
                  {student.handicapped ? `YES - ${student.handicap_details || 'N/A'}` : 'NO'}
                </span>
              </div>
            </div>

            <div className="physical-form-photo">
              {student.passport_photo ? (
                <img src={student.passport_photo} alt="Student Passport" />
              ) : (
                <div style={{ padding: '10px' }}>
                  PLACE<br />PASSPORT<br />PHOTO<br />HERE
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <div className="form-line-item">
              <span className="form-line-label">NAME OF PARENT/GUARDIAN:</span>
              <span className="form-line-value">{student.parent_name || 'N/A'}</span>
            </div>

            <div className="form-line-item">
              <span className="form-line-label">ADDRESS:</span>
              <span className="form-line-value">{student.parent_address || 'N/A'}</span>
            </div>

            <div className="form-line-item">
              <span className="form-line-label">PHONE NUMBER:</span>
              <span className="form-line-value">{student.parent_phone || 'N/A'}</span>
            </div>
          </div>

          {/* UNDERTAKING & RULES AND REGULATION */}
          <div className="undertaking-section">
            <h3>UNDERTAKING FORM</h3>
            
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px' }}>
              STUDENT REQUIREMENT
            </div>
            <ul className="rules-list" style={{ columns: 2 }}>
              <li>12, 60 Leaves Exercise book for JSS</li>
              <li>12, 80 Leaves Exercise books for SS</li>
              <li>1 Complete mathematical set</li>
              <li>1 scientific calculator for SS students</li>
              <li>1 pair of white socks & 1 bunch of broom</li>
              <li>1 brown sandals & 1 school bag</li>
              <li>English and Mathematics textbook (New Oxford & New General Math)</li>
            </ul>

            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px' }}>
              SCHOOL RULES AND REGULATIONS SUMMARY
            </div>
            <ol className="rules-list" style={{ columns: 2 }}>
              <li>All students must partake in school lessons 2:30pm - 3:30pm (Mon-Wed).</li>
              <li>Must belong to a society (JETS club, press, debating, quiz, etc.).</li>
              <li>Must be in school latest 7:45am.</li>
              <li>No fighting, loitering, or phone usage allowed in school.</li>
              <li>No speaking of pidgin/vernacular within school compound.</li>
              <li>No face paints, tattoos, rings, bangles, or long fingernails.</li>
              <li>Games attire at N2,500 must be obtained from games office.</li>
              <li>All fees must be footed before the middle of the term.</li>
            </ol>

            <div className="undertaking-text">
              <strong>Having read the student requirement and school rules and regulations:</strong><br />
              I, <em>{student.parent_name || '__________________________'}</em>, the father/Parent/Guardian of <em>{student.full_name}</em> in class <em>{student.class_name || '_______'}</em> guarantee and promise my child/ward shall abide by the school rules and regulations and have all necessary requirements to enhance his/her studies.
            </div>

            <div className="undertaking-signatures">
              <div className="signature-box" style={{ borderTop: '1px solid #000' }}>
                <span style={{ fontSize: '0.8rem', display: 'block', fontStyle: 'italic', color: '#555' }}>
                  Signed Digitally via Student Portal
                </span>
                Student Signature & Date
              </div>
              <div className="signature-box" style={{ borderTop: '1px solid #000' }}>
                <span style={{ fontSize: '0.8rem', display: 'block', fontStyle: 'italic', color: '#555' }}>
                  {student.parent_phone ? 'Verified OTP / Signature Logged' : 'Pending Signature'}
                </span>
                Parent/Guardian Signature & Date
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
