import React, { useState } from 'react';
import api from '../utils/api';

export default function StudentRegistrationForm({ student, onClose, onUpdate }) {
  if (!student) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...student });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const photoInputRef = React.useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, passport_photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.updateStudent(student.id, formData);
      setIsEditing(false);
      if (onUpdate) onUpdate(); // Refresh parent data
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: '850px', backgroundColor: 'var(--bg-surface)' }}>
        <button className="modal-close no-print" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }} className="no-print">
          <button className="btn btn-secondary" onClick={onClose} style={{ border: '1px solid var(--border-color)', padding: '8px 16px', fontSize: '0.85rem' }}>
            ← Back to Student List
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            <button className="btn btn-primary" onClick={handlePrint}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '5px', verticalAlign: 'text-bottom' }}><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Form
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger no-print">{error}</div>}

        {/* SCREEN VIEW (MODERN PROFILE CARD) */}
        <div className="no-print">
          {!isEditing ? (
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 200px', textAlign: 'center' }}>
                {student.passport_photo ? (
                  <img src={student.passport_photo} alt="Student" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', border: '4px solid var(--primary-light)' }} />
                ) : (
                  <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '2rem', color: '#94a3b8' }}>
                    👤
                  </div>
                )}
                <h3 style={{ marginTop: '15px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{student.full_name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '5px 0' }}>{student.admission_number}</p>
                <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{student.class_name || 'Unassigned'}</span>
              </div>
              
              <div style={{ flex: '1 1 400px' }}>
                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px' }}>Personal Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                  <div><strong>Date of Birth:</strong> {student.date_of_birth || 'N/A'}</div>
                  <div><strong>Sex:</strong> {student.sex || 'N/A'}</div>
                  <div><strong>Religion:</strong> {student.religion || 'N/A'}</div>
                  <div><strong>Handicapped:</strong> {student.handicapped ? `Yes (${student.handicap_details})` : 'No'}</div>
                </div>

                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px' }}>Contact & Background</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Address:</strong> {student.address_residence || 'N/A'}</div>
                  <div><strong>Local Gov:</strong> {student.local_government || 'N/A'}</div>
                  <div><strong>State of Origin:</strong> {student.state_of_origin || 'N/A'}</div>
                  <div><strong>Last School:</strong> {student.last_school_attended || 'N/A'}</div>
                </div>

                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px' }}>Parent / Guardian</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div><strong>Name:</strong> {student.parent_name || 'N/A'}</div>
                  <div><strong>Phone:</strong> {student.parent_phone || 'N/A'}</div>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Address:</strong> {student.parent_address || 'N/A'}</div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 200px', textAlign: 'center' }}>
                {formData.passport_photo ? (
                  <img src={formData.passport_photo} alt="Student" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', border: '4px solid var(--primary-light)' }} />
                ) : (
                  <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '2rem', color: '#94a3b8' }}>👤</div>
                )}
                <div style={{ marginTop: '10px' }}>
                  <input type="file" accept="image/*" ref={photoInputRef} style={{ display: 'none' }} onChange={handlePhotoUpload} />
                  <button type="button" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '4px 8px' }} onClick={() => photoInputRef.current && photoInputRef.current.click()}>
                    {formData.passport_photo ? 'Change Photo' : 'Add Photo'}
                  </button>
                </div>
              </div>

              <div style={{ flex: '1 1 400px' }}>
                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px' }}>Edit Information</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" className="form-control" name="full_name" value={formData.full_name || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Admission No</label>
                    <input type="text" className="form-control" name="custom_admission_number" value={formData.custom_admission_number || formData.admission_number || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="date" className="form-control" name="date_of_birth" value={formData.date_of_birth || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Sex</label>
                    <select className="form-control" name="sex" value={formData.sex || ''} onChange={handleChange}>
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Religion</label>
                    <input type="text" className="form-control" name="religion" value={formData.religion || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Last School</label>
                    <input type="text" className="form-control" name="last_school_attended" value={formData.last_school_attended || ''} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label>Residential Address</label>
                  <textarea className="form-control" name="address_residence" value={formData.address_residence || ''} onChange={handleChange}></textarea>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                  <div className="form-group">
                    <label>LGA</label>
                    <input type="text" className="form-control" name="local_government" value={formData.local_government || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>State of Origin</label>
                    <input type="text" className="form-control" name="state_of_origin" value={formData.state_of_origin || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Parent/Guardian Name</label>
                    <input type="text" className="form-control" name="parent_name" value={formData.parent_name || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Parent Phone</label>
                    <input type="text" className="form-control" name="parent_phone" value={formData.parent_phone || ''} onChange={handleChange} />
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* PRINTABLE AREA (Only visible during print) */}
        <div className="physical-form-container print-area">
          <style>{`
            @media screen {
              .print-area { display: none !important; }
            }
          `}</style>
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
        </div>

      </div>
    </div>
  );
}
