import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ClassBroadsheet from '../components/ClassBroadsheet';

export default function TeacherDashboard({ user, settings, activeTab }) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  
  // Teacher metadata
  const [assignments, setAssignments] = useState({ subjects: [], formClass: null });
  
  // Marks Entry States
  const [selectedClassSubject, setSelectedClassSubject] = useState(null); // {class_id, class_name, subject_id, subject_name}
  const [studentsGrades, setStudentsGrades] = useState([]);
  
  // Attendance States
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRoster, setAttendanceRoster] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [attendanceReportStartDate, setAttendanceReportStartDate] = useState('');
  const [attendanceReportEndDate, setAttendanceReportEndDate] = useState('');
  const [activeAttendanceSubTab, setActiveAttendanceSubTab] = useState('take'); // 'take' or 'report'

  // Broadsheet States
  const [broadsheetData, setBroadsheetData] = useState(null);

  // Behavioral / Psychomotor States
  const [skillsList, setSkillsList] = useState([]);
  const [behavioralStudents, setBehavioralStudents] = useState({ rated: [], unrated: [] });
  const [evaluatingStudent, setEvaluatingStudent] = useState(null);
  const [skillRatings, setSkillRatings] = useState({});

  // Search & Filter States
  const [gradesSearch, setGradesSearch] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [behavioralSearch, setBehavioralSearch] = useState('');

  // Status banners
  const [notify, setNotify] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadTeacherInfo();
  }, []);

  useEffect(() => {
    if (activeTab && activeTab !== 'dashboard') {
      setActiveSubTab(activeTab);
      if (activeTab === 'attendance' && assignments.formClass) {
        fetchAttendance(assignments.formClass.id, attendanceDate);
      }
      if (activeTab === 'broadsheet' && assignments.formClass) {
        fetchBroadsheet(assignments.formClass.id);
      }
      if (activeTab === 'behavioral' && assignments.formClass) {
        loadBehavioralRoster();
      }
      if (activeTab === 'schemes' && assignments.subjects.length > 0 && teacherSchemeAssignIdx === '') {
        setTeacherSchemeAssignIdx(0);
      }
    } else if (activeTab === 'dashboard') {
      setActiveSubTab('overview');
    }
  }, [activeTab, assignments.formClass, assignments.subjects]);

  useEffect(() => {
    if (activeSubTab === 'attendance' && activeAttendanceSubTab === 'report' && assignments.formClass) {
      fetchAttendanceReport();
    }
  }, [activeSubTab, activeAttendanceSubTab, attendanceReportStartDate, attendanceReportEndDate, assignments.formClass]);

  const loadTeacherInfo = async () => {
    try {
      const info = await api.getTeacherAssignments();
      setAssignments(info);
      if (info.formClass) {
        // Automatically fetch broadsheet and attendance for form class initially
        fetchBroadsheet(info.formClass.id);
        fetchAttendance(info.formClass.id, attendanceDate);
      }
    } catch (err) {
      setErrorMsg('Failed to sync teacher assignments: ' + err.message);
    }
  };

  // ==========================================
  // MARKS ENTRY LOGIC
  // ==========================================
  const handleSelectClassSubjectForGrades = async (assign) => {
    setSelectedClassSubject(assign);
    setNotify('');
    setErrorMsg('');
    try {
      const grades = await api.getGradesForEntry(assign.class_id, assign.subject_id, settings.active_term, settings.active_session);
      setStudentsGrades(grades);
      setActiveSubTab('grades');
    } catch (err) {
      setErrorMsg('Failed to load grade book: ' + err.message);
    }
  };

  const handleGradeFieldChange = (studentId, field, value) => {
    setStudentsGrades(prev => prev.map(g => {
      if (g.student_id === studentId) {
        const updated = { ...g, [field]: value };
        
        // Auto-calculate total and grade letter
        const c1 = parseFloat(field === 'ca1' ? value : updated.ca1 || 0);
        const c2 = parseFloat(field === 'ca2' ? value : updated.ca2 || 0);
        const c3 = parseFloat(field === 'ca3' ? value : updated.ca3 || 0);
        const c4 = parseFloat(field === 'ca4' ? value : updated.ca4 || 0);
        const exam = parseFloat(field === 'exam_score' ? value : updated.exam_score || 0);
        
        const total = c1 + c2 + c3 + c4 + exam;
        updated.total_score = total;
        
        // Grade Letter mapping
        if (total >= 75) { updated.grade_letter = 'A'; updated.remark = 'Excellent'; }
        else if (total >= 60) { updated.grade_letter = 'B'; updated.remark = 'Very Good'; }
        else if (total >= 50) { updated.grade_letter = 'C'; updated.remark = 'Good'; }
        else if (total >= 40) { updated.grade_letter = 'D'; updated.remark = 'Pass'; }
        else { updated.grade_letter = 'F'; updated.remark = 'Fail'; }

        return updated;
      }
      return g;
    }));
  };

  const handleSaveGrades = async () => {
    if (!selectedClassSubject) return;
    setNotify('');
    setErrorMsg('');
    try {
      await api.saveGrades({
        class_id: selectedClassSubject.class_id,
        subject_id: selectedClassSubject.subject_id,
        term: settings.active_term,
        academic_year: settings.active_session,
        grades: studentsGrades
      });
      setNotify('Grades submitted and saved successfully!');
      // Reload broadsheet to keep synchronized
      if (assignments.formClass) fetchBroadsheet(assignments.formClass.id);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // ==========================================
  // ATTENDANCE LOGIC
  // ==========================================
  const fetchAttendance = async (classId, date) => {
    try {
      const roster = await api.getAttendance(classId, date);
      setAttendanceRoster(roster);
    } catch (err) {
      setErrorMsg('Failed to fetch attendance roster: ' + err.message);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceRoster(prev => prev.map(r => r.student_id === studentId ? { ...r, status } : r));
  };

  const handleSaveAttendance = async () => {
    if (!assignments.formClass) return;
    setNotify('');
    setErrorMsg('');
    try {
      const records = attendanceRoster.map(r => ({
        student_id: r.student_id,
        status: r.status || 'present'
      }));
      await api.saveAttendance({
        class_id: assignments.formClass.id,
        date: attendanceDate,
        records
      });
      setNotify(`Attendance successfully registered for ${attendanceDate}!`);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const fetchAttendanceReport = async () => {
    if (!assignments.formClass) return;
    try {
      const data = await api.getAttendanceReport(assignments.formClass.id, attendanceReportStartDate, attendanceReportEndDate);
      setAttendanceReport(data);
    } catch (err) {
      setErrorMsg('Failed to fetch attendance report: ' + err.message);
    }
  };

  // ==========================================
  // BROADSHEET LOGIC
  // ==========================================
  const fetchBroadsheet = async (classId) => {
    try {
      const sheet = await api.getBroadsheet(classId, settings.active_term, settings.active_session);
      setBroadsheetData(sheet);
    } catch (err) {
      setErrorMsg('Failed to sync broadsheet: ' + err.message);
    }
  };

  const loadBehavioralRoster = async () => {
    if (!assignments.formClass) return;
    try {
      // 1. Fetch Skills
      const fetchedSkills = await api.getSkills();
      setSkillsList(fetchedSkills);

      // 2. Fetch Rated/Unrated Students
      const data = await api.getSkillsStudents(assignments.formClass.id, settings.active_term, settings.active_session);
      setBehavioralStudents(data);
    } catch (err) {
      setErrorMsg('Failed to load psychomotor data: ' + err.message);
    }
  };

  const handleSelectStudentForEval = async (student) => {
    setEvaluatingStudent(student);
    setNotify('');
    setErrorMsg('');
    try {
      const existing = await api.getStudentSkillsEvaluation(student.id, settings.active_term, settings.active_session);
      const ratingsMap = {};
      existing.forEach(r => { ratingsMap[r.skill_id] = r.rating; });
      setSkillRatings(ratingsMap);
    } catch (err) {
      setErrorMsg('Failed to fetch existing ratings: ' + err.message);
    }
  };

  const handleSaveSkillEvaluation = async (e) => {
    e.preventDefault();
    if (!evaluatingStudent) return;
    setNotify('');
    setErrorMsg('');
    
    // Validate all skills have a rating
    for (let skill of skillsList) {
      if (!skillRatings[skill.id]) {
        setErrorMsg(`Please select a rating for ${skill.name}`);
        return;
      }
    }

    try {
      const payload = {
        student_id: evaluatingStudent.id,
        term: settings.active_term,
        session: settings.active_session,
        ratings: Object.keys(skillRatings).map(skill_id => ({ skill_id, rating: skillRatings[skill_id] }))
      };
      await api.saveStudentSkillsEvaluation(payload);
      setNotify('Skills evaluation saved successfully!');
      setEvaluatingStudent(null);
      loadBehavioralRoster(); // Reload roster to move student to 'rated'
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // ==========================================
  // TEACHER SCHEME OF WORK LOGIC
  // ==========================================
  const [teacherSchemeAssignIdx, setTeacherSchemeAssignIdx] = useState('');
  const [teacherSchemeTerm, setTeacherSchemeTerm] = useState('3rd Term');
  const [teacherSchemeWeeks, setTeacherSchemeWeeks] = useState(Array.from({ length: 12 }, (_, i) => ({ week: i + 1, topic: '', objectives: '', id: null })));

  const loadTeacherSchemes = async () => {
    if (teacherSchemeAssignIdx === '') return;
    const assign = assignments.subjects[teacherSchemeAssignIdx];
    if (!assign) return;

    try {
      const data = await api.getSchemes({
        class_id: assign.class_id,
        subject_id: assign.subject_id,
        term: teacherSchemeTerm
      });

      const newWeeks = Array.from({ length: 12 }, (_, i) => {
        const wkNum = i + 1;
        const entry = data.find(item => item.week === wkNum);
        return {
          week: wkNum,
          topic: entry ? entry.topic : '',
          objectives: entry ? entry.objectives || '' : '',
          id: entry ? entry.id : null
        };
      });
      setTeacherSchemeWeeks(newWeeks);
    } catch (err) {
      setErrorMsg('Failed to load schemes of work: ' + err.message);
    }
  };

  const handleTeacherSchemeFieldChange = (weekNum, field, value) => {
    setTeacherSchemeWeeks(prev => prev.map(w => {
      if (w.week === weekNum) {
        return { ...w, [field]: value };
      }
      return w;
    }));
  };

  const handleSaveTeacherSchemeWeek = async (weekObj) => {
    setNotify('');
    setErrorMsg('');
    if (teacherSchemeAssignIdx === '') return;
    const assign = assignments.subjects[teacherSchemeAssignIdx];
    if (!assign) return;

    if (!weekObj.topic) {
      setErrorMsg(`Topic for Week ${weekObj.week} is required to save.`);
      return;
    }

    try {
      await api.saveScheme({
        class_id: assign.class_id,
        subject_id: assign.subject_id,
        term: teacherSchemeTerm,
        week: weekObj.week,
        topic: weekObj.topic,
        objectives: weekObj.objectives
      });
      setNotify(`Successfully saved Week ${weekObj.week} Scheme of Work!`);
      loadTeacherSchemes();
    } catch (err) {
      setErrorMsg(`Failed to save Week ${weekObj.week}: ` + err.message);
    }
  };

  const handleDeleteTeacherSchemeWeek = async (weekObj) => {
    if (!weekObj.id) {
      handleTeacherSchemeFieldChange(weekObj.week, 'topic', '');
      handleTeacherSchemeFieldChange(weekObj.week, 'objectives', '');
      return;
    }
    setNotify('');
    setErrorMsg('');
    try {
      await api.deleteScheme(weekObj.id);
      setNotify(`Successfully deleted Week ${weekObj.week} entry.`);
      loadTeacherSchemes();
    } catch (err) {
      setErrorMsg(`Failed to delete Week ${weekObj.week}: ` + err.message);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'schemes' && teacherSchemeAssignIdx !== '') {
      loadTeacherSchemes();
    }
  }, [activeSubTab, teacherSchemeAssignIdx, teacherSchemeTerm]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      
      {/* Alert Banners */}
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
          TAB 1: ASSIGNED SUBJECTS INDEX
          ========================================== */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
            <h3>My Assigned Subjects</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '15px' }}>
              Select a subject stream below to open the grading spreadsheet.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
              {assignments.subjects.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>You are not currently assigned to teach any subjects.</p>
              ) : (
                assignments.subjects.map((assign, idx) => (
                <button
                  key={idx}
                  className="btn"
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', textAlign: 'left', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-light)'}
                  onClick={() => handleSelectClassSubjectForGrades(assign)}
                >
                    <span><strong>{assign.class_name}</strong> - {assign.subject_name}</span>
                    <span>📝 Enter Marks →</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
            <h3>Form Master Status</h3>
            {assignments.formClass ? (
              <div style={{ marginTop: '15px' }}>
                <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '16px', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Form Master of:</span>
                  <span>🏫 {assignments.formClass.name}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '15px' }}>
                  As Form Master, you have access to roll-call attendance checklists and complete class broadsheets for academic meetings.
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button className="btn btn-primary" onClick={() => { setActiveSubTab('attendance'); fetchAttendance(assignments.formClass.id, attendanceDate); }}>Mark Attendance</button>
                  <button className="btn btn-secondary" onClick={() => { setActiveSubTab('broadsheet'); fetchBroadsheet(assignments.formClass.id); }}>View Class Results</button>
                  <button className="btn btn-secondary" onClick={() => { setActiveSubTab('behavioral'); loadBehavioralRoster(); }}>Evaluate Psychomotor</button>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', marginTop: '15px' }}>
                You are not currently assigned as a Class Teacher for any class.
              </p>
            )}
          </div>

        </div>
      )}

      {/* ==========================================
          TAB 2: GRADES ENTRY SHEET (SPREADSHEET LAYOUT)
          ========================================== */}
      {activeSubTab === 'grades' && !selectedClassSubject && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
          <h3>Select Subject to Enter Marks</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '15px' }}>
            Choose one of your assigned subjects below to load the grading spreadsheet.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {assignments.subjects.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>You are not currently assigned to teach any subjects.</p>
            ) : (
              assignments.subjects.map((assign, idx) => (
                <button
                  key={idx}
                  className="btn"
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', textAlign: 'left', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-light)'}
                  onClick={() => handleSelectClassSubjectForGrades(assign)}
                >
                  <span><strong>{assign.class_name}</strong> - {assign.subject_name}</span>
                  <span>📝 Enter Marks →</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'grades' && selectedClassSubject && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
          <button className="btn btn-secondary no-print" onClick={() => { setSelectedClassSubject(null); setActiveSubTab('overview'); }} style={{ marginBottom: '20px', border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '0.85rem' }}>
            ← Back
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3>Enter Grades: {selectedClassSubject.class_name} ({selectedClassSubject.subject_name})</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                School Year & Term: {settings.active_session} | {settings.active_term}
              </p>
            </div>
            {!settings.result_entry_open ? (
              <span className="badge badge-danger">🔒 Locked by Admin</span>
            ) : (
              <button className="btn btn-primary" onClick={handleSaveGrades}>Save Marks</button>
            )}
          </div>

          {/* Student Search */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <input
              type="text"
              className="form-control"
              style={{ maxWidth: '300px', padding: '10px' }}
              placeholder="Search student by name..."
              value={gradesSearch}
              onChange={(e) => setGradesSearch(e.target.value)}
            />
          </div>

          <div className="grade-table-container">
            <table className="grade-entry-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Admission No</th>
                  <th style={{ width: '90px' }}>{settings.ca1_name || 'CA 1'} (10)</th>
                  <th style={{ width: '90px' }}>{settings.ca2_name || 'CA 2'} (10)</th>
                  <th style={{ width: '90px' }}>{settings.ca3_name || 'CA 3'} (10)</th>
                  <th style={{ width: '90px' }}>{settings.ca4_name || 'CA 4'} (10)</th>
                  <th style={{ width: '110px' }}>{settings.exam_name || 'Exam'} (60)</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Total (100)</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Grade</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {studentsGrades.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No students registered in this class.</td>
                  </tr>
                ) : (
                  studentsGrades.filter(g => 
                    g.full_name.toLowerCase().includes(gradesSearch.toLowerCase()) ||
                    g.admission_number.toLowerCase().includes(gradesSearch.toLowerCase())
                  ).map((g, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{g.full_name}</td>
                      <td><code>{g.admission_number}</code></td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          className="grade-input"
                          value={g.ca1 ?? 0}
                          onChange={(e) => handleGradeFieldChange(g.student_id, 'ca1', e.target.value)}
                          disabled={!settings.result_entry_open}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          className="grade-input"
                          value={g.ca2 ?? 0}
                          onChange={(e) => handleGradeFieldChange(g.student_id, 'ca2', e.target.value)}
                          disabled={!settings.result_entry_open}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          className="grade-input"
                          value={g.ca3 ?? 0}
                          onChange={(e) => handleGradeFieldChange(g.student_id, 'ca3', e.target.value)}
                          disabled={!settings.result_entry_open}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          className="grade-input"
                          value={g.ca4 ?? 0}
                          onChange={(e) => handleGradeFieldChange(g.student_id, 'ca4', e.target.value)}
                          disabled={!settings.result_entry_open}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          className="grade-input"
                          value={g.exam_score ?? 0}
                          onChange={(e) => handleGradeFieldChange(g.student_id, 'exam_score', e.target.value)}
                          disabled={!settings.result_entry_open}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="grade-total-col">
                          {g.total_score ?? 0}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`grade-badge ${g.grade_letter === 'F' ? 'grade-badge-fail' : 'grade-badge-pass'}`}>
                          {g.grade_letter || '-'}
                        </span>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="grade-remark-input"
                          value={g.remark || ''}
                          onChange={(e) => handleGradeFieldChange(g.student_id, 'remark', e.target.value)}
                          disabled={!settings.result_entry_open}
                          placeholder="Auto remark..."
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: CLASS ATTENDANCE SHEET (FORM MASTER)
          ========================================== */}
      {activeSubTab === 'attendance' && assignments.formClass && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
          
          {/* Sub Navigation for Attendance */}
          <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }} className="no-print">
            <button
              onClick={() => setActiveAttendanceSubTab('take')}
              style={{
                padding: '10px 15px',
                background: 'none',
                border: 'none',
                borderBottom: activeAttendanceSubTab === 'take' ? '2.5px solid var(--primary)' : 'none',
                color: activeAttendanceSubTab === 'take' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              Take Attendance
            </button>
            <button
              onClick={() => setActiveAttendanceSubTab('report')}
              style={{
                padding: '10px 15px',
                background: 'none',
                border: 'none',
                borderBottom: activeAttendanceSubTab === 'report' ? '2.5px solid var(--primary)' : 'none',
                color: activeAttendanceSubTab === 'report' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              Attendance Report
            </button>
          </div>

          {activeAttendanceSubTab === 'take' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3>Daily Attendance: {assignments.formClass.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Select the date and check student roll call status.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }} className="no-print">
                  <input
                    type="date"
                    className="form-control"
                    style={{ width: '170px' }}
                    value={attendanceDate}
                    onChange={(e) => { setAttendanceDate(e.target.value); fetchAttendance(assignments.formClass.id, e.target.value); }}
                  />
                  <button className="btn btn-primary" onClick={handleSaveAttendance}>Save Attendance</button>
                </div>
              </div>

              {/* Attendance Search */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }} className="no-print">
                <input
                  type="text"
                  className="form-control"
                  style={{ maxWidth: '300px', padding: '10px' }}
                  placeholder="Search student by name..."
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                />
              </div>

              <div className="table-container">
                <table className="school-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Admission Number</th>
                      <th>Roll Call Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRoster.filter(r => 
                      r.full_name.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
                      r.admission_number.toLowerCase().includes(attendanceSearch.toLowerCase())
                    ).map((r, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '600' }}>{r.full_name}</td>
                        <td><code>{r.admission_number}</code></td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleAttendanceChange(r.student_id, 'present')}
                              className="btn"
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.8rem',
                                backgroundColor: r.status === 'present' || !r.status ? 'var(--success)' : 'transparent',
                                color: r.status === 'present' || !r.status ? '#fff' : 'var(--success)',
                                border: '1px solid var(--success)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttendanceChange(r.student_id, 'absent')}
                              className="btn"
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.8rem',
                                backgroundColor: r.status === 'absent' ? 'var(--danger)' : 'transparent',
                                color: r.status === 'absent' ? '#fff' : 'var(--danger)',
                                border: '1px solid var(--danger)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttendanceChange(r.student_id, 'late')}
                              className="btn"
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.8rem',
                                backgroundColor: r.status === 'late' ? 'var(--warning)' : 'transparent',
                                color: r.status === 'late' ? '#fff' : 'var(--warning)',
                                border: '1px solid var(--warning)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              Late
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3>Attendance Summary Report: {assignments.formClass.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Select date filters to view student records summary.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }} className="no-print">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>From:</span>
                    <input
                      type="date"
                      className="form-control"
                      style={{ width: '150px', padding: '6px' }}
                      value={attendanceReportStartDate}
                      onChange={(e) => setAttendanceReportStartDate(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>To:</span>
                    <input
                      type="date"
                      className="form-control"
                      style={{ width: '150px', padding: '6px' }}
                      value={attendanceReportEndDate}
                      onChange={(e) => setAttendanceReportEndDate(e.target.value)}
                    />
                  </div>
                  <button className="btn btn-secondary" onClick={() => window.print()}>Print Report</button>
                </div>
              </div>

              <div className="table-container">
                <table className="school-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Admission Number</th>
                      <th style={{ textAlign: 'center' }}>Present Days</th>
                      <th style={{ textAlign: 'center' }}>Absent Days</th>
                      <th style={{ textAlign: 'center' }}>Late Days</th>
                      <th style={{ textAlign: 'center' }}>Total Days</th>
                      <th style={{ textAlign: 'center' }}>Attendance Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceReport.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No attendance records found for this period.</td>
                      </tr>
                    ) : (
                      attendanceReport.map((r, idx) => {
                        const ratio = r.total_days > 0 ? Math.round((r.present_count / r.total_days) * 100) : 0;
                        return (
                          <tr key={idx}>
                            <td style={{ fontWeight: '600' }}>{r.full_name}</td>
                            <td><code>{r.admission_number}</code></td>
                            <td style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 'bold' }}>{r.present_count}</td>
                            <td style={{ textAlign: 'center', color: 'var(--danger)', fontWeight: 'bold' }}>{r.absent_count}</td>
                            <td style={{ textAlign: 'center', color: 'var(--warning)', fontWeight: 'bold' }}>{r.late_count}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{r.total_days}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span 
                                className="badge" 
                                style={{ 
                                  backgroundColor: ratio >= 80 ? 'var(--success-light)' : ratio >= 50 ? 'var(--warning-light)' : 'var(--danger-light)', 
                                  color: ratio >= 80 ? 'var(--success)' : ratio >= 50 ? 'var(--warning)' : 'var(--danger)' 
                                }}
                              >
                                {ratio}%
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 4: CLASS BROADSHEET MATRIX (FORM MASTER)
          ========================================== */}
      {activeSubTab === 'broadsheet' && assignments.formClass && (
        <ClassBroadsheet
          data={broadsheetData}
          className={assignments.formClass.name}
          term={settings.active_term}
          session={settings.active_session}
          settings={settings}
        />
      )}

      {/* ==========================================
          TAB 5: BEHAVIORAL & PSYCHOMOTOR GRADES (FORM MASTER)
          ========================================== */}
      {activeSubTab === 'behavioral' && assignments.formClass && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
          <h3>Behavioral Traits & Psychomotor Ratings</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Evaluate students on a scale of 1 (Poor) to 5 (Excellent).
          </p>

          {!evaluatingStudent ? (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ flex: '1 1 300px' }}>
                <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>Select Student to Evaluate</label>
                <select 
                  className="form-control" 
                  onChange={(e) => {
                    const stId = parseInt(e.target.value);
                    if (!stId) return;
                    const st = [...behavioralStudents.unrated, ...behavioralStudents.rated].find(s => s.id === stId);
                    if (st) handleSelectStudentForEval(st);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>-- Select a student --</option>
                  {behavioralStudents.unrated.length > 0 && (
                    <optgroup label="Not Evaluated Yet">
                      {behavioralStudents.unrated.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name} ({s.admission_number})</option>
                      ))}
                    </optgroup>
                  )}
                  {behavioralStudents.rated.length > 0 && (
                    <optgroup label="Already Evaluated">
                      {behavioralStudents.rated.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name} ({s.admission_number}) ✅</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ margin: 0 }}>Evaluating: <span style={{ color: 'var(--primary)' }}>{evaluatingStudent.full_name}</span></h4>
                <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => setEvaluatingStudent(null)}>Cancel / Back</button>
              </div>

              <form onSubmit={handleSaveSkillEvaluation}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {skillsList.map(skill => (
                    <div key={skill.id} style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>
                        {skill.name} 
                        <span className="badge" style={{ float: 'right', fontSize: '0.7rem', backgroundColor: skill.category === 'AFFECTIVE' ? '#e0f2fe' : '#fef3c7', color: skill.category === 'AFFECTIVE' ? '#075985' : '#92400e' }}>{skill.category}</span>
                      </label>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                        {[1, 2, 3, 4, 5].map(rating => (
                          <label key={rating} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name={`skill_${skill.id}`}
                              value={rating}
                              checked={skillRatings[skill.id] === rating}
                              onChange={() => setSkillRatings(prev => ({ ...prev, [skill.id]: rating }))}
                              required
                            />
                            <span style={{ fontSize: '0.85rem', marginTop: '6px', fontWeight: skillRatings[skill.id] === rating ? 'bold' : 'normal' }}>{rating}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {skillsList.length === 0 && <p style={{ color: 'var(--danger)', marginTop: '10px' }}>No skills configured by admin yet.</p>}

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={skillsList.length === 0}>
                    Save Evaluation
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 5: TEACHER SCHEME OF WORK
          ========================================== */}
      {activeSubTab === 'schemes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Filter Bar */}
          <div className="glass-panel" style={{ padding: '20px', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Scheme of Work</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '4px 0 0 0' }}>Review and update the weekly course outline for your assigned subjects.</p>
              </div>
              {teacherSchemeAssignIdx !== '' && (
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                  onClick={() => window.print()}
                >
                  🖨️ Print Scheme
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0, flex: '1 1 200px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Select Subject</label>
                <select
                  className="form-control"
                  value={teacherSchemeAssignIdx}
                  onChange={(e) => setTeacherSchemeAssignIdx(e.target.value)}
                >
                  <option value="">Choose assigned subject...</option>
                  {assignments.subjects.map((assign, idx) => (
                    <option key={idx} value={idx}>{assign.subject_name} - {assign.class_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0, flex: '1 1 150px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Term</label>
                <select
                  className="form-control"
                  value={teacherSchemeTerm}
                  onChange={(e) => setTeacherSchemeTerm(e.target.value)}
                >
                  <option value="1st Term">1st Term</option>
                  <option value="2nd Term">2nd Term</option>
                  <option value="3rd Term">3rd Term</option>
                </select>
              </div>
            </div>
          </div>

          {/* Scheme Table */}
          {teacherSchemeAssignIdx === '' ? (
            <div className="glass-panel" style={{ padding: '40px', backgroundColor: 'var(--bg-surface)', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📋</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Please select a subject above to load the scheme of work.</p>
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
                      {assignments.subjects[teacherSchemeAssignIdx]?.subject_name || 'Subject'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {assignments.subjects[teacherSchemeAssignIdx]?.class_name || 'Class'} · {teacherSchemeTerm}
                    </div>
                  </div>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600', backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
                  {teacherSchemeWeeks.filter(w => w.topic).length} / 12 Weeks Filled
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
                    {teacherSchemeWeeks.map((w, idx) => (
                      <tr key={idx} style={{ backgroundColor: w.topic ? 'transparent' : 'rgba(255,59,48,0.03)' }}>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', borderRadius: '50%',
                            backgroundColor: w.topic ? 'var(--primary)' : 'var(--border-color)',
                            color: w.topic ? '#fff' : 'var(--text-muted)',
                            fontWeight: '700', fontSize: '0.8rem'
                          }}>{w.week}</span>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '0.88rem' }}>
                          {w.topic || <span style={{ color: 'var(--text-muted)' }}>Not specified</span>}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '0.88rem' }}>
                          {w.objectives || <span style={{ color: 'var(--text-muted)' }}>Not specified</span>}
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

    </div>
  );
}
