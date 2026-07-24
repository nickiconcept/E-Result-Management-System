import React from 'react';

export default function ReportCard({ data, settings, onClose }) {
  if (!data) return null;

  const { student, grades, attendance, term, academic_year, position, total_students, class_average, behavioral } = data;

  const handlePrint = () => {
    window.print();
  };

  const is3rdTerm = term === '3rd Term';
  const classTier = (student?.tier || 'jss').toLowerCase(); // 'nursery', 'primary', 'jss', 'sss'
  const isNursery = classTier.includes('nursery') || classTier.includes('kindergarten') || classTier.includes('early');
  const isPrimary = classTier.includes('primary');

  // Term Average score
  const activeTermAverage = grades && grades.length > 0 
    ? (grades.reduce((sum, g) => sum + (g.total_score || 0), 0) / grades.length).toFixed(1)
    : '0.0';

  // Annual Cumulative average for 3rd Term
  const overallCumAverage = is3rdTerm && grades && grades.length > 0
    ? (grades.reduce((sum, g) => sum + parseFloat(g.cum_average || 0), 0) / grades.length).toFixed(1)
    : '0.0';

  const schoolName = settings?.landing_school_name || 'Jere Model Academy';
  const schoolTagline = settings?.landing_tagline || 'KADUNA STATE, NIGERIA';
  const schoolAddress = settings?.landing_address || 'Jere Kagarko LGA, Kaduna State.';

  const showPosition = settings ? (parseInt(settings.result_show_position) !== 0) : true;
  const showAverage = settings ? (parseInt(settings.result_show_average) !== 0) : true;

  // Grade color helper
  const getGradeBadgeStyle = (letter) => {
    switch (letter) {
      case 'A': return { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' };
      case 'B': return { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' };
      case 'C': return { bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
      case 'D': return { bg: '#ffedd5', color: '#9a3412', border: '#fed7aa' };
      default:  return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: '940px', backgroundColor: '#fff', color: '#000', padding: '24px' }}>
        
        {/* Navigation / Action bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }} className="no-print">
          <button className="btn btn-secondary" onClick={onClose || (() => window.history.back())} style={{ border: '1px solid #ccc', padding: '8px 16px', fontSize: '0.85rem' }}>
            ← Back to Dashboard
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="badge badge-success" style={{ padding: '6px 12px', textTransform: 'uppercase' }}>
              {isNursery ? 'Nursery Template' : isPrimary ? 'Primary Template' : 'Secondary Template'}
            </span>
            <button className="btn btn-primary" onClick={handlePrint} style={{ padding: '8px 20px', fontWeight: 'bold' }}>
              🖨️ Print Report Sheet
            </button>
          </div>
        </div>

        {/* PRINTABLE REPORT CARD CONTAINER */}
        <div className="modern-report-card print-area">
          
          {/* HEADER BANNER */}
          <div className="m-header">
            <div className="m-header-brand">
              <div className="m-logo-box">JMA</div>
              <div>
                <h1 className="m-school-title">{schoolName}</h1>
                <p className="m-school-subtitle">{schoolTagline}</p>
                <p className="m-school-address">{schoolAddress}</p>
              </div>
            </div>
            <div className="m-report-badge">
              <div className="m-badge-title">OFFICIAL REPORT CARD</div>
              <div className="m-badge-session">{term} · {academic_year}</div>
            </div>
          </div>

          {/* STUDENT BIODATA GRID */}
          <div className="m-biodata-grid">
            <div className="m-bio-details">
              <div className="m-bio-field"><span>Student Name:</span> <strong>{student.full_name}</strong></div>
              <div className="m-bio-field"><span>Admission No:</span> <code>{student.admission_number}</code></div>
              <div className="m-bio-field"><span>Class Arm:</span> <strong>{student.class_name || 'N/A'}</strong></div>
              <div className="m-bio-field"><span>Gender / Sex:</span> <span>{student.sex || 'N/A'}</span></div>
              <div className="m-bio-field"><span>School Year:</span> <span>{academic_year}</span></div>
              <div className="m-bio-field"><span>School Term:</span> <span>{term}</span></div>
            </div>

            <div className="m-photo-frame">
              {student.passport_photo ? (
                <img src={student.passport_photo} alt="Passport" />
              ) : (
                <div className="m-photo-placeholder">STUDENT PHOTO</div>
              )}
            </div>
          </div>

          {/* ACADEMIC MARKS MATRIX */}
          {!isNursery ? (
            /* PRIMARY & SECONDARY MATRIX (CA 1-4 + EXAM) */
            <div className="m-table-wrapper">
              <table className="m-matrix-table">
                <thead>
                  {is3rdTerm ? (
                    <tr>
                      <th style={{ textAlign: 'left' }}>Subject Title</th>
                      <th>1st Term (100)</th>
                      <th>2nd Term (100)</th>
                      <th>3rd Term CA (40)</th>
                      <th>3rd Term Exam (60)</th>
                      <th>3rd Term Total (100)</th>
                      <th>Annual Average</th>
                      {showPosition && <th>Subject Rank</th>}
                      <th>Grade</th>
                      <th>Teacher Remark</th>
                    </tr>
                  ) : (
                    <tr>
                      <th style={{ textAlign: 'left' }}>Subject Title</th>
                      <th>{settings?.ca1_name || 'CA 1'} (10)</th>
                      <th>{settings?.ca2_name || 'CA 2'} (10)</th>
                      <th>{settings?.ca3_name || 'CA 3'} (10)</th>
                      <th>{settings?.ca4_name || 'CA 4'} (10)</th>
                      <th>{settings?.exam_name || 'Exam'} (60)</th>
                      <th>Total Score (100)</th>
                      {showPosition && <th>Subject Rank</th>}
                      <th>Grade</th>
                      <th>Teacher Remark</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {(!grades || grades.length === 0) ? (
                    <tr>
                      <td colSpan={showPosition ? 10 : 9} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        No grade entries submitted for this term.
                      </td>
                    </tr>
                  ) : (
                    grades.map((g, idx) => {
                      const caTotal = (g.ca1 || 0) + (g.ca2 || 0) + (g.ca3 || 0) + (g.ca4 || 0);
                      const badgeStyle = getGradeBadgeStyle(is3rdTerm ? g.cum_grade : g.grade_letter);

                      if (is3rdTerm) {
                        return (
                          <tr key={idx}>
                            <td className="subject-name">{g.subject_name}</td>
                            <td>{g.term1_total}</td>
                            <td>{g.term2_total}</td>
                            <td>{caTotal}</td>
                            <td>{g.exam_score}</td>
                            <td style={{ fontWeight: 'bold' }}>{g.total_score}</td>
                            <td style={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>{g.cum_average}%</td>
                            {showPosition && <td style={{ fontWeight: 'bold' }}>{g.subject_position || '-'}</td>}
                            <td>
                              <span className="m-grade-chip" style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color, borderColor: badgeStyle.border }}>
                                {g.cum_grade}
                              </span>
                            </td>
                            <td className="remark-cell">{g.cum_remark}</td>
                          </tr>
                        );
                      } else {
                        return (
                          <tr key={idx}>
                            <td className="subject-name">{g.subject_name}</td>
                            <td>{g.ca1 ?? 0}</td>
                            <td>{g.ca2 ?? 0}</td>
                            <td>{g.ca3 ?? 0}</td>
                            <td>{g.ca4 ?? 0}</td>
                            <td>{g.exam_score ?? 0}</td>
                            <td style={{ fontWeight: 'bold' }}>{g.total_score ?? 0}</td>
                            {showPosition && <td style={{ fontWeight: 'bold' }}>{g.subject_position || '-'}</td>}
                            <td>
                              <span className="m-grade-chip" style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color, borderColor: badgeStyle.border }}>
                                {g.grade_letter}
                              </span>
                            </td>
                            <td className="remark-cell">{g.remark}</td>
                          </tr>
                        );
                      }
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* NURSERY / EARLY CHILDHOOD MATRIX */
            <div className="m-table-wrapper">
              <table className="m-matrix-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Early Learning Domain</th>
                    <th>Teacher Evaluation / Skill Mastery</th>
                    <th>Rating Scale (1 - 5)</th>
                    <th>Comments & Recommendations</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { domain: 'Literacy & Phonics Basics', eval: 'Recognizes letters, sounds out basic words', rating: 5, note: 'Excellent phonetic pronunciation' },
                    { domain: 'Numeracy & Shapes', eval: 'Identifies numbers, counts objects & basic shapes', rating: 4, note: 'Very good number recognition' },
                    { domain: 'Creative Arts & Colors', eval: 'Coloring within boundaries, hand-eye craft', rating: 5, note: 'Enthusiastic and creative' },
                    { domain: 'Physical & Motor Skills', eval: 'Outdoor games, pencil grip, coordination', rating: 4, note: 'Active and energetic' },
                    { domain: 'Health & Personal Habits', eval: 'Cleanliness, hand washing, table manners', rating: 5, note: 'Neat and well-mannered' },
                    { domain: 'Social & Emotional Growth', eval: 'Sharing toys, politeness, peer friendship', rating: 4, note: 'Friendly with classmates' }
                  ].map((row, idx) => (
                    <tr key={idx}>
                      <td className="subject-name">{row.domain}</td>
                      <td>{row.eval}</td>
                      <td style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1rem', color: '#1e40af' }}>{row.rating} / 5</td>
                      <td className="remark-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ACADEMIC SUMMARY & ATTENDANCE BOX */}
          <div className="m-summary-grid">
            <div className="m-summary-card">
              <h4>Academic Performance Summary</h4>
              <div className="m-summary-rows">
                <div><span>Total Subjects Taken:</span> <strong>{grades?.length || 0}</strong></div>
                <div>
                  <span>{is3rdTerm ? 'Annual Cumulative Average:' : 'Term Average Score:'}</span>
                  <strong style={{ fontSize: '1.05rem', color: '#1d4ed8' }}>
                    {is3rdTerm ? `${overallCumAverage}%` : `${activeTermAverage}%`}
                  </strong>
                </div>
                {showPosition && position && (
                  <div><span>Class Rank / Position:</span> <strong>{position} out of {total_students}</strong></div>
                )}
                {showAverage && class_average && (
                  <div><span>Class Overall Average:</span> <strong>{parseFloat(class_average).toFixed(1)}%</strong></div>
                )}
                <div><span>Highest Score in Class:</span> <span>{parseFloat(data.highest_average || 0).toFixed(1)}%</span></div>
                <div><span>Lowest Score in Class:</span> <span>{parseFloat(data.lowest_average || 0).toFixed(1)}%</span></div>
                {is3rdTerm && (
                  <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #cbd5e1' }}>
                    <span>Promotion Status:</span>
                    <strong style={{ textTransform: 'uppercase', color: parseFloat(overallCumAverage) >= 50 ? '#059669' : '#dc2626' }}>
                      {parseFloat(overallCumAverage) >= 50 ? 'Promoted to Next Class 🎓' : parseFloat(overallCumAverage) >= 40 ? 'Promoted on Trial' : 'Repeat Class'}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            <div className="m-summary-card">
              <h4>Attendance & Conduct Record</h4>
              <div className="m-summary-rows">
                <div><span>Days School Opened:</span> <strong>{attendance?.total || 0} Days</strong></div>
                <div><span>Days Present:</span> <strong style={{ color: '#059669' }}>{attendance?.present || 0} Days</strong></div>
                <div><span>Days Absent:</span> <strong style={{ color: '#dc2626' }}>{attendance?.absent || 0} Days</strong></div>
                <div>
                  <span>Attendance Percentage:</span>
                  <strong>
                    {attendance?.total > 0 ? `${((attendance.present / attendance.total) * 100).toFixed(1)}%` : '100%'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* AFFECTIVE & PSYCHOMOTOR DOMAINS GRID */}
          <div className="m-behavior-section">
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e293b' }}>
              Affective & Psychomotor Evaluation (Rating Scale 1 to 5)
            </h4>
            <div className="m-behavior-grid">
              <div className="m-behavior-col">
                <div className="m-behavior-header">Personal & Social Traits</div>
                {[
                  { name: 'Punctuality', val: behavioral?.punctuality || 4 },
                  { name: 'Neatness & Dressing', val: behavioral?.neatness || 4 },
                  { name: 'Honesty & Integrity', val: behavioral?.honesty || 4 },
                  { name: 'Self Control & Discipline', val: behavioral?.self_control || 4 },
                  { name: 'Peer Relationship', val: behavioral?.peer_relationship || 4 }
                ].map((item, idx) => (
                  <div key={idx} className="m-behavior-row">
                    <span>{item.name}</span>
                    <strong>{item.val}</strong>
                  </div>
                ))}
              </div>

              <div className="m-behavior-col">
                <div className="m-behavior-header">Practical & Physical Skills</div>
                {[
                  { name: 'Sports & Games', val: behavioral?.sports || 4 },
                  { name: 'Craft & Manual Skills', val: behavioral?.manual_skills || 3 },
                  { name: 'Verbal Fluency', val: behavioral?.verbal_fluency || 4 },
                  { name: 'Musical Skills', val: behavioral?.musical_skills || 3 },
                  { name: 'Handwriting & Neatness', val: 4 }
                ].map((item, idx) => (
                  <div key={idx} className="m-behavior-row">
                    <span>{item.name}</span>
                    <strong>{item.val}</strong>
                  </div>
                ))}
              </div>

              <div className="m-behavior-key">
                <div className="m-key-title">RATING SCALE KEY</div>
                <div><strong>5</strong> — Excellent / Outstanding</div>
                <div><strong>4</strong> — High Level of Display</div>
                <div><strong>3</strong> — Acceptable / Satisfactory</div>
                <div><strong>2</strong> — Developing / Fair</div>
                <div><strong>1</strong> — Needs Attention</div>
              </div>
            </div>
          </div>

          {/* OFFICIAL REMARKS & SIGNATURE STAMPS */}
          <div className="m-remarks-block">
            <div className="m-remark-row">
              <div className="m-remark-label">Class Teacher Remarks:</div>
              <div className="m-remark-text">
                {parseFloat(is3rdTerm ? overallCumAverage : activeTermAverage) >= 50
                  ? 'Satisfactory academic results and good conduct throughout the term.'
                  : 'Needs additional study dedication and academic focus.'}
              </div>
              <div className="m-sign-box">Sign: <span>{student.form_master_name || 'Form Teacher'}</span></div>
            </div>

            <div className="m-remark-row">
              <div className="m-remark-label">Principal / Headmaster Note:</div>
              <div className="m-remark-text">
                {parseFloat(is3rdTerm ? overallCumAverage : activeTermAverage) >= 40
                  ? 'Good performance. Keep up the hard work in the coming session.'
                  : 'Fair result. Parent guidance is recommended.'}
              </div>
              <div className="m-sign-box">Sign: <span>{settings?.principal_name || 'Principal Stamp (JMA)'}</span></div>
            </div>
          </div>

          {/* FUTURE TERM INFORMATION BAR */}
          <div className="m-footer-bar">
            <div>Unpaid Balance: <strong>{settings?.last_term_debit || '₦0.00'}</strong></div>
            <div>Next Term Fee: <strong>{settings?.next_term_fee || '₦45,000.00'}</strong></div>
            <div>Next Term Begins: <strong>{settings?.next_term_begins || '13/04/2026'}</strong></div>
            <div>Next Term Ends: <strong>{settings?.next_term_ends || '--/--/----'}</strong></div>
          </div>

        </div>

        {/* EMBEDDED A4 PRINT MEDIA STYLES */}
        <style>{`
          .modern-report-card {
            background: #ffffff;
            color: #0f172a;
            font-family: 'Inter', -apple-system, sans-serif;
            border: 1.5px solid #cbd5e1;
            border-radius: 8px;
            padding: 16px;
            font-size: 11px;
            line-height: 1.3;
          }

          .m-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2.5px solid #1e40af;
            padding-bottom: 10px;
            margin-bottom: 12px;
          }
          .m-header-brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .m-logo-box {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: #fff;
            font-weight: 900;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
          }
          .m-school-title {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 800;
            color: #1e3a8a;
            text-transform: uppercase;
          }
          .m-school-subtitle {
            margin: 2px 0 0 0;
            font-size: 0.78rem;
            font-weight: 700;
            color: #475569;
          }
          .m-school-address {
            margin: 1px 0 0 0;
            font-size: 0.72rem;
            color: #64748b;
          }
          .m-report-badge {
            text-align: right;
            border-left: 2px solid #e2e8f0;
            padding-left: 14px;
          }
          .m-badge-title {
            font-weight: 800;
            font-size: 0.95rem;
            color: #1e40af;
            text-transform: uppercase;
          }
          .m-badge-session {
            font-size: 0.75rem;
            color: #475569;
            font-weight: 600;
          }

          .m-biodata-grid {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            border: 1px solid #cbd5e1;
            background: #f8fafc;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 12px;
          }
          .m-bio-details {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px 16px;
          }
          .m-bio-field {
            font-size: 0.78rem;
          }
          .m-bio-field span {
            color: #64748b;
            margin-right: 4px;
          }
          .m-photo-frame {
            width: 80px;
            height: 90px;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            overflow: hidden;
            background: #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .m-photo-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .m-photo-placeholder {
            font-size: 0.65rem;
            font-weight: bold;
            color: #94a3b8;
            text-align: center;
          }

          .m-table-wrapper {
            margin-bottom: 12px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            overflow: hidden;
          }
          .m-matrix-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.78rem;
          }
          .m-matrix-table th {
            background-color: #1e40af;
            color: #ffffff;
            padding: 7px 6px;
            font-weight: 700;
            text-align: center;
            border: 1px solid #1e3a8a;
          }
          .m-matrix-table td {
            padding: 6px 6px;
            text-align: center;
            border: 1px solid #e2e8f0;
          }
          .m-matrix-table td.subject-name {
            text-align: left;
            font-weight: 600;
            color: #0f172a;
          }
          .m-matrix-table td.remark-cell {
            text-align: left;
            font-style: italic;
            color: #475569;
          }
          .m-grade-chip {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 0.75rem;
            border: 1px solid transparent;
          }

          .m-summary-grid {
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            gap: 12px;
            margin-bottom: 12px;
          }
          .m-summary-card {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px 12px;
            background: #fff;
          }
          .m-summary-card h4 {
            margin: 0 0 8px 0;
            font-size: 0.82rem;
            color: #1e40af;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
            text-transform: uppercase;
          }
          .m-summary-rows {
            display: flex;
            flex-direction: column;
            gap: 4px;
            font-size: 0.76rem;
          }
          .m-summary-rows div {
            display: flex;
            justify-content: space-between;
          }

          .m-behavior-section {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px 12px;
            margin-bottom: 12px;
            background: #f8fafc;
          }
          .m-behavior-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 0.9fr;
            gap: 12px;
          }
          .m-behavior-col {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 6px;
          }
          .m-behavior-header {
            font-weight: 700;
            font-size: 0.72rem;
            color: #1e40af;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 3px;
            margin-bottom: 4px;
          }
          .m-behavior-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.72rem;
            padding: 2px 0;
            border-bottom: 1px dashed #f1f5f9;
          }
          .m-behavior-key {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 6px;
            font-size: 0.68rem;
            color: #475569;
          }
          .m-key-title {
            font-weight: 800;
            color: #1e40af;
            margin-bottom: 4px;
            text-align: center;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 2px;
          }

          .m-remarks-block {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px 12px;
            margin-bottom: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .m-remark-row {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.76rem;
          }
          .m-remark-label {
            font-weight: 700;
            min-width: 140px;
            color: #1e293b;
          }
          .m-remark-text {
            flex: 1;
            font-style: italic;
            color: #334155;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 2px;
          }
          .m-sign-box {
            font-size: 0.72rem;
            color: #64748b;
          }
          .m-sign-box span {
            font-family: monospace;
            font-weight: bold;
            color: #0f172a;
            text-decoration: underline;
          }

          .m-footer-bar {
            display: flex;
            justify-content: space-between;
            background: #1e40af;
            color: #fff;
            padding: 8px 14px;
            border-radius: 6px;
            font-size: 0.76rem;
            font-weight: 600;
          }

          /* A4 PRINT MEDIA STYLES */
          @media print {
            @page {
              size: A4 portrait;
              margin: 8mm 8mm;
            }
            body {
              background: #fff !important;
              color: #000 !important;
            }
            .modal-overlay, .modal-content {
              position: static !important;
              max-width: 100% !important;
              padding: 0 !important;
              background: transparent !important;
              box-shadow: none !important;
              border: none !important;
            }
            .no-print {
              display: none !important;
            }
            .modern-report-card {
              border: 1px solid #000 !important;
              padding: 10px !important;
              font-size: 9.5px !important;
              line-height: 1.2 !important;
              box-shadow: none !important;
              page-break-after: always;
            }
            .m-matrix-table th {
              background-color: #1e40af !important;
              color: #ffffff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .m-grade-chip {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .m-footer-bar {
              background-color: #1e40af !important;
              color: #ffffff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
