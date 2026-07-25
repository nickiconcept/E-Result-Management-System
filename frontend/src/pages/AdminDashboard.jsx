import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import StudentRegistrationForm from '../components/StudentRegistrationForm';
import TeacherProfileCard from '../components/TeacherProfileCard';
import SignaturePad from '../components/SignaturePad';
import BulkResultPrinter from '../components/BulkResultPrinter';
import ClassBroadsheet from '../components/ClassBroadsheet';

// 3D Column Chart Component
function ThreeDColumnChart({ title, subtitle, data, height = 220 }) {
  if (!data || data.length === 0) return null;
  const maxValue = Math.max(...data.map(d => Number(d.value) || 0), 1);

  return (
    <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📊</span> {title}
        </h4>
        {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>{subtitle}</p>}
      </div>

      <div style={{ height: `${height}px`, display: 'flex', alignItems: 'flex-end', gap: '14px', padding: '25px 10px 10px 10px', borderBottom: '2px solid var(--border-color)', position: 'relative', overflowX: 'auto', minWidth: '100%' }}>
        {/* Horizontal Gridlines */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: 0.12 }}>
          <div style={{ borderTop: '1px dashed currentColor', width: '100%' }}></div>
          <div style={{ borderTop: '1px dashed currentColor', width: '100%' }}></div>
          <div style={{ borderTop: '1px dashed currentColor', width: '100%' }}></div>
        </div>

        {data.map((item, idx) => {
          const val = Number(item.value) || 0;
          const pct = Math.max(10, Math.round((val / maxValue) * 100));
          const barColor = item.color || `hsl(${(idx * 65) % 360}, 80%, 55%)`;
          const topColor = item.colorTop || `hsl(${(idx * 65) % 360}, 90%, 75%)`;

          return (
            <div key={idx} style={{ flex: '1 0 44px', minWidth: '44px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
              {/* Floating Value Badge */}
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '800',
                marginBottom: '8px',
                color: barColor,
                background: 'var(--bg-primary)',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
                whiteSpace: 'nowrap'
              }}>
                {val >= 1000 ? `₦${(val / 1000).toFixed(0)}k` : val}
              </div>

              {/* 3D Column Column Bar */}
              <div style={{
                width: '65%',
                maxWidth: '46px',
                height: `${pct}%`,
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.15))'
              }}>
                {/* 3D Top Cap */}
                <div style={{
                  position: 'absolute',
                  top: '-7px',
                  left: 0,
                  right: 0,
                  height: '14px',
                  backgroundColor: topColor,
                  borderRadius: '50%',
                  transform: 'scaleY(0.45)',
                  zIndex: 2,
                  boxShadow: '0 -1px 3px rgba(255,255,255,0.7)'
                }}></div>

                {/* 3D Main Column Shaft */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(180deg, ${barColor} 0%, ${barColor}dd 100%)`,
                  borderRadius: '4px 4px 0 0',
                  boxShadow: 'inset -4px 0 8px rgba(0,0,0,0.3), inset 3px 0 6px rgba(255,255,255,0.3)'
                }}></div>
              </div>

              {/* X-axis Label */}
              <div style={{
                marginTop: '12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                maxWidth: '100%'
              }}>
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 3D Pie / Donut Chart Component
function ThreeDPieChart({ title, subtitle, data, size = 180 }) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  let accumulatedAngle = 0;
  const strokeWidth = 26;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🍩</span> {title}
        </h4>
        {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px', padding: '10px 0' }}>
        {/* SVG Donut Ring */}
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.18))' }}>
          <svg viewBox="0 0 160 160" width={size} height={size} style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}>
            {data.map((item, idx) => {
              const val = Number(item.value) || 0;
              const fraction = total > 0 ? (val / total) : 0;
              const strokeLength = fraction * circumference;
              const spaceLength = circumference - strokeLength;
              const strokeOffset = accumulatedAngle * circumference;
              accumulatedAngle += fraction;
              const color = item.color || `hsl(${(idx * 110) % 360}, 85%, 55%)`;

              return (
                <circle
                  key={idx}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${strokeLength} ${spaceLength}`}
                  strokeDashoffset={-strokeOffset}
                  style={{ transition: 'stroke-dasharray 0.6s ease' }}
                />
              );
            })}
          </svg>

          {/* Center Badge */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface)',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15)'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Total</div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {total >= 1000 ? `₦${(total / 1000).toFixed(0)}k` : total}
            </div>
          </div>
        </div>

        {/* Legend Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: '160px' }}>
          {data.map((item, idx) => {
            const val = Number(item.value) || 0;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            const color = item.color || `hsl(${(idx * 110) % 360}, 85%, 55%)`;

            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: color, display: 'inline-block' }}></span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.label}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: '800', color: 'var(--text-primary)' }}>{pct}%</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
                    {val >= 1000 ? `₦${val.toLocaleString()}` : val}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


export default function AdminDashboard({ settings, fetchSettings, activeTab }) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [settingsSubTab, setSettingsSubTab] = useState('academic');
  const [resultsSubTab, setResultsSubTab] = useState('bulk');
  
  // Data lists
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [pins, setPins] = useState([]);
  const [skills, setSkills] = useState([]);
  const [skillForm, setSkillForm] = useState({ name: '', category: 'AFFECTIVE' });
  
  // Registration form states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showBulkPrintModal, setShowBulkPrintModal] = useState(false);

  // Selected details
  const [selectedStudentForForm, setSelectedStudentForForm] = useState(null);
  const [selectedTeacherForProfile, setSelectedTeacherForProfile] = useState(null);
  
  // Form input states
  const [studentForm, setStudentForm] = useState({
    username: '', password: 'password123', full_name: '', class_id: '',
    date_of_birth: '', class_of_entry: '', term_year_of_entry: '',
    last_school_attended: '', address_residence: '', sex: 'Male', religion: 'Islam',
    local_government: '', state_of_origin: '', handicapped: false, handicap_details: '',
    parent_name: '', parent_address: '', parent_phone: '', passport_photo: '', custom_admission_number: ''
  });
  
  const [teacherForm, setTeacherForm] = useState({ 
    username: '', password: 'password123', full_name: '', email: '', passport_photo: '',
    surname: '', first_name: '', other_names: '', address: '', state_of_residence: '', lga_of_residence: '', signature: ''
  });
  const [classForm, setClassForm] = useState({ name: '', tier: 'jss' });
  const [subjectForm, setSubjectForm] = useState({ name: '', tier: 'jss', class_ids: [] });
  const [assignForm, setAssignForm] = useState({ class_ids: [], subject_id: '', teacher_id: '' });
  const [feeForm, setFeeForm] = useState({ title: '', amount: '', class_id: '', tier: '' });
  const [payForm, setPayForm] = useState({ invoice_id: '', amount_paid: '', payment_method: 'Cash', student_name: '' });
  const [pinCount, setPinCount] = useState(20);

  // Search & Filter States
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [feeSearch, setFeeSearch] = useState('');
  const [feeClassFilter, setFeeClassFilter] = useState('');
  const [pinSearch, setPinSearch] = useState('');
  
  // Promotion manager states
  const [promoSource, setPromoSource] = useState('');
  const [promoTarget, setPromoTarget] = useState('');
  const [promotedClassIds, setPromotedClassIds] = useState([]);
  const [selectedStudentIdsForPromo, setSelectedStudentIdsForPromo] = useState([]);
  const [promoStudentSearch, setPromoStudentSearch] = useState('');
  const [showAllClassesInPromo, setShowAllClassesInPromo] = useState(false);

  // PIN Generator options
  const [genPinTerm, setGenPinTerm] = useState('');
  const [genPinSession, setGenPinSession] = useState('');

  // Portal Settings Form
  const [settingsForm, setSettingsForm] = useState({
    active_session: '',
    active_term: '',
    result_entry_open: 1,
    landing_school_name: '',
    landing_tagline: '',
    landing_hero_title: '',
    landing_hero_desc: '',
    landing_address: '',
    result_show_position: 1,
    result_show_average: 1,
    contact_phone: '',
    contact_email: '',
    ca1_name: 'CA 1',
    ca2_name: 'CA 2',
    ca3_name: 'CA 3',
    ca4_name: 'CA 4',
    exam_name: 'Exam',
    games_master_name: '',
    games_master_remark: '',
    house_master_name: '',
    house_master_remark: '',
    principal_name: '',
    next_term_fee: '',
    next_term_begins: '',
    next_term_ends: '',
    last_term_debit: ''
  });

  // Notifications
  const [notify, setNotify] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Academic Sessions Management
  const [sessions, setSessions] = useState([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');

  // Subject Edit modal states
  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectEditForm, setSubjectEditForm] = useState({ name: '', tier: 'jss' });

  // Admin Attendance report states
  const [activeAdminAttendanceSubTab, setActiveAdminAttendanceSubTab] = useState('mark'); // 'mark' or 'report'
  const [adminAttendanceReport, setAdminAttendanceReport] = useState([]);
  const [adminReportClassId, setAdminReportClassId] = useState('');
  const [adminReportStartDate, setAdminReportStartDate] = useState('');
  const [adminReportEndDate, setAdminReportEndDate] = useState('');

  // Fees MVP reports and structure management states
  const [feeStructures, setFeeStructures] = useState([]);
  const [showFeeStructureModal, setShowFeeStructureModal] = useState(false);
  const [newFeeStructureForm, setNewFeeStructureForm] = useState({ title: '', amount: '', tier: 'jss' });
  const [feesReport, setFeesReport] = useState([]);
  const [activeFeesSubTab, setActiveFeesSubTab] = useState('invoices'); // 'invoices' or 'structures' or 'report'
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Payment Report filter & history states
  const [paymentReportSearch, setPaymentReportSearch] = useState('');
  const [paymentReportClassFilter, setPaymentReportClassFilter] = useState('');
  const [paymentReportStatusFilter, setPaymentReportStatusFilter] = useState('all');
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);
  const [studentHistoryData, setStudentHistoryData] = useState({ invoices: [], receipts: [] });
  const [loadingStudentHistory, setLoadingStudentHistory] = useState(false);

  // Admin Broadsheet states
  const [adminBroadsheetClassId, setAdminBroadsheetClassId] = useState('');
  const [adminBroadsheetData, setAdminBroadsheetData] = useState(null);
  const [adminBroadsheetLoading, setAdminBroadsheetLoading] = useState(false);

  const fetchAdminBroadsheet = async (classId) => {
    if (!classId) return;
    setAdminBroadsheetLoading(true);
    try {
      const term = settings?.active_term || '3rd Term';
      const year = settings?.active_session || '2025/2026';
      const res = await api.getBroadsheet(classId, term, year);
      setAdminBroadsheetData(res);
    } catch (err) {
      console.error('Failed to load broadsheet data:', err);
    } finally {
      setAdminBroadsheetLoading(false);
    }
  };

  const fetchPromotedClasses = async () => {
    try {
      const activeSess = settings?.active_session || '';
      const ids = await api.getPromotedClasses(activeSess);
      setPromotedClassIds(ids || []);
    } catch (err) {
      console.error('Failed to load promoted classes:', err);
    }
  };

  const handleResetPromotedClasses = async () => {
    try {
      const activeSess = settings?.active_session || '';
      await api.resetPromotedClasses(activeSess);
      setNotify(`Promotion status reset for session ${activeSess}.`);
      fetchPromotedClasses();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Seed standard passport photos
  const seedMockPassport = (type) => {
    const avatars = {
      student: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=60',
      teacher: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60'
    };
    if (type === 'student') setStudentForm(prev => ({ ...prev, passport_photo: avatars.student }));
    if (type === 'teacher') setTeacherForm(prev => ({ ...prev, passport_photo: avatars.teacher }));
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'promotions') {
      fetchPromotedClasses();
    }
  }, [activeSubTab, settings]);

  useEffect(() => {
    if (promoSource) {
      const sourceStuds = students.filter(s => s.class_id === parseInt(promoSource));
      setSelectedStudentIdsForPromo(sourceStuds.map(s => s.id));
    } else {
      setSelectedStudentIdsForPromo([]);
    }
  }, [promoSource, students]);

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        active_session: settings.active_session || '',
        active_term: settings.active_term || '',
        result_entry_open: settings.result_entry_open || 1,
        landing_school_name: settings.landing_school_name || '',
        landing_tagline: settings.landing_tagline || '',
        landing_hero_title: settings.landing_hero_title || '',
        landing_hero_desc: settings.landing_hero_desc || '',
        landing_address: settings.landing_address || '',
        result_show_position: settings.result_show_position === undefined ? 1 : settings.result_show_position,
        result_show_average: settings.result_show_average === undefined ? 1 : settings.result_show_average,
        contact_phone: settings.contact_phone || '',
        contact_email: settings.contact_email || '',
        ca1_name: settings.ca1_name || 'CA 1',
        ca2_name: settings.ca2_name || 'CA 2',
        ca3_name: settings.ca3_name || 'CA 3',
        ca4_name: settings.ca4_name || 'CA 4',
        exam_name: settings.exam_name || 'Exam',
        games_master_name: settings.games_master_name || '',
        games_master_remark: settings.games_master_remark || '',
        house_master_name: settings.house_master_name || '',
        house_master_remark: settings.house_master_remark || '',
        principal_name: settings.principal_name || '',
        next_term_fee: settings.next_term_fee || '',
        next_term_begins: settings.next_term_begins || '',
        next_term_ends: settings.next_term_ends || '',
        last_term_debit: settings.last_term_debit || ''
      });
    }
  }, [settings]);

  useEffect(() => {
    if (activeTab && activeTab !== 'dashboard') {
      setActiveSubTab(activeTab);
    } else if (activeTab === 'dashboard') {
      setActiveSubTab('overview');
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeSubTab === 'broadsheet') {
      const targetClassId = adminBroadsheetClassId || (classes && classes.length > 0 ? classes[0].id : '');
      if (targetClassId) {
        if (!adminBroadsheetClassId) setAdminBroadsheetClassId(targetClassId);
        fetchAdminBroadsheet(targetClassId);
      }
    }
  }, [activeSubTab, classes]);

  const loadSessions = async () => {
    try {
      const data = await api.getAcademicSessions();
      setSessions(data);
    } catch (err) {
      setErrorMsg('Failed to load academic sessions: ' + err.message);
    }
  };

  const loadFeeStructures = async () => {
    try {
      const data = await api.getFeeStructures();
      setFeeStructures(data);
    } catch (err) {
      setErrorMsg('Failed to load fee structures: ' + err.message);
    }
  };

  const loadFeesReport = async () => {
    try {
      const data = await api.getPaidFeesReport();
      setFeesReport(data);
    } catch (err) {
      setErrorMsg('Failed to load fees report: ' + err.message);
    }
  };

  const handleOpenStudentPaymentHistory = async (studentId, studentInfo = {}) => {
    setSelectedStudentForHistory(studentInfo.student_id ? studentInfo : { student_id: studentId, ...studentInfo });
    setLoadingStudentHistory(true);
    try {
      const data = await api.getStudentFees(studentId);
      setStudentHistoryData(data);
    } catch (err) {
      setErrorMsg('Failed to load student payment history: ' + err.message);
    } finally {
      setLoadingStudentHistory(false);
    }
  };

  const handleExportPaymentReportExcel = (list) => {
    if (!list || list.length === 0) return;

    let csv = '\uFEFF';
    csv += `"${(settingsForm?.landing_school_name || 'Jere Model Academy').replace(/"/g, '""')}"\r\n`;
    csv += `"STUDENT PAYMENT COLLECTIONS AUDIT REPORT"\r\n\r\n`;
    
    csv += `"Student Name","Admission No","Class Arm","Fee Description","Total Billed (NGN)","Amount Paid (NGN)","Balance Owed (NGN)","Payment Status"\r\n`;

    list.forEach(inv => {
      const remaining = inv.amount_due - inv.amount_paid;
      csv += `"${(inv.full_name || '').replace(/"/g, '""')}","${(inv.admission_number || '').replace(/"/g, '""')}","${(inv.class_name || 'Unassigned').replace(/"/g, '""')}","${(inv.title || '').replace(/"/g, '""')}",${inv.amount_due},${inv.amount_paid},${remaining},"${inv.status}"\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payment_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadAllData = async () => {
    try {
      const studList = await api.getStudents();
      const teachList = await api.getTeachers();
      const clsList = await api.getClasses();
      const subList = await api.getSubjects();
      const csList = await api.getClassSubjects();
      const pinList = await api.getPins();
      const skillsList = await api.getSkills();
      
      setStudents([...studList].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '')));
      setTeachers([...teachList].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '')));
      setClasses([...clsList].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      setSubjects(subList);
      setClassSubjects(csList);
      setPins(pinList);
      setSkills(skillsList);

      loadSessions();
      loadFeeStructures();
      loadFeesReport();
    } catch (err) {
      setErrorMsg('Failed to sync school database: ' + err.message);
    }
  };

  const handleStudentRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.registerStudent(studentForm);
      setNotify(`Student registered successfully! Auto-Admission Number: ${res.admission_number}`);
      setShowStudentModal(false);
      loadAllData();
      // Reset form
      setStudentForm({
        username: '', password: 'password123', full_name: '', class_id: '',
        date_of_birth: '', class_of_entry: '', term_year_of_entry: '',
        last_school_attended: '', address_residence: '', sex: 'Male', religion: 'Islam',
        local_government: '', state_of_origin: '', handicapped: false, handicap_details: '',
        parent_name: '', parent_address: '', parent_phone: '', passport_photo: '', custom_admission_number: ''
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleTeacherRegister = async (e) => {
    e.preventDefault();
    try {
      await api.registerTeacher(teacherForm);
      setNotify('Teacher registered successfully!');
      setShowTeacherModal(false);
      loadAllData();
      setTeacherForm({ 
        username: '', password: 'password123', full_name: '', email: '', passport_photo: '',
        surname: '', first_name: '', other_names: '', address: '', state_of_residence: '', lga_of_residence: '', signature: ''
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleClassCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createClass(classForm);
      setNotify('Class stream created successfully!');
      setShowClassModal(false);
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleBulkSubjectClassSelect = (type, isEditMode = false) => {
    let ids = [];
    if (type === 'all') {
      ids = classes.map(c => c.id);
    } else if (type === 'nursery') {
      ids = classes.filter(c => c.name.toLowerCase().includes('nursery')).map(c => c.id);
    } else if (type === 'primary') {
      ids = classes.filter(c => c.name.toLowerCase().includes('primary')).map(c => c.id);
    } else if (type === 'jss') {
      ids = classes.filter(c => c.name.toLowerCase().includes('jss')).map(c => c.id);
    } else if (type === 'sss') {
      ids = classes.filter(c => c.name.toLowerCase().includes('sss')).map(c => c.id);
    }
    
    if (isEditMode) {
      setSubjectEditForm(prev => ({ ...prev, class_ids: ids }));
    } else {
      setSubjectForm(prev => ({ ...prev, class_ids: ids }));
    }
  };

  const handleSubjectCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createSubject(subjectForm);
      setNotify('Curriculum Subject seeded successfully!');
      setShowSubjectModal(false);
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    try {
      await api.assignSubjectTeacher(assignForm.class_ids, assignForm.subject_id, assignForm.teacher_id);
      setNotify('Subject Teacher mapped successfully!');
      setShowAssignModal(false);
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleFormMasterAssign = async (classId, teacherId) => {
    try {
      await api.assignFormMaster(classId, teacherId);
      setNotify('Form Master updated successfully!');
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleFeeInvoiceCreate = async (e) => {
    e.preventDefault();
    try {
      await api.addFeeInvoice(feeForm);
      setNotify('Fees invoice generated and posted successfully!');
      setShowFeeModal(false);
      loadAllData();
      setFeeForm({ title: '', amount: '', class_id: '', tier: '' });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleSkillCreate = async (e) => {
    e.preventDefault();
    try {
      await api.addSkill(skillForm);
      setNotify('Skill added successfully!');
      setSkillForm({ name: '', category: 'AFFECTIVE' });
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleSkillDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      await api.deleteSkill(id);
      setNotify('Skill deleted successfully!');
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleLogPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.logFeePayment({
        invoice_id: payForm.invoice_id,
        amount_paid: payForm.amount_paid,
        payment_method: payForm.payment_method
      });
      setNotify(`Payment Logged successfully! Receipt generated: ${res.receipt_number}`);
      setShowPayModal(false);
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleGeneratePins = async () => {
    try {
      await api.generatePins(pinCount, '', '');
      setNotify(`Bulk generated ${pinCount} universal Result Checker PINs!`);
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await api.updateSettings(settingsForm);
      setNotify('System settings updated successfully!');
      fetchSettings();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handlePromotionBulk = async (e) => {
    e.preventDefault();
    if (!promoSource || !promoTarget) {
      setErrorMsg('Select both current and target class streams.');
      return;
    }
    if (selectedStudentIdsForPromo.length === 0) {
      setErrorMsg('Please check at least one student to promote.');
      return;
    }
    try {
      await api.promoteBulk(promoSource, promoTarget, selectedStudentIdsForPromo);
      const targetName = promoTarget === 'graduate' ? 'Graduated Alumni' : classes.find(c => c.id === parseInt(promoTarget))?.name || 'Target Class';
      setNotify(`Successfully promoted ${selectedStudentIdsForPromo.length} student(s) to ${targetName}!`);
      loadAllData();
      fetchPromotedClasses();
      setPromoSource('');
      setPromoTarget('');
      setSelectedStudentIdsForPromo([]);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // ==========================================
  // MIGRATED STATUS CHANGING HANDLER
  // ==========================================
  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      await api.updateUserStatus(userId, newStatus);
      setNotify('User status updated successfully.');
      loadAllData();
    } catch (err) {
      setErrorMsg('Failed to update status: ' + err.message);
    }
  };

  // ==========================================
  // ACADEMIC SESSIONS LOGIC
  // ==========================================
  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newSessionName) return;
    setNotify('');
    setErrorMsg('');
    try {
      await api.createAcademicSession(newSessionName);
      setNotify('Academic session created successfully!');
      setNewSessionName('');
      setShowSessionModal(false);
      loadSessions();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleSetActiveSession = async (sessionId) => {
    setNotify('');
    setErrorMsg('');
    try {
      const res = await api.setActiveSession(sessionId);
      setNotify(res.message);
      fetchSettings();
      loadSessions();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // ==========================================
  // SUBJECT CRUD LOGIC
  // ==========================================
  const handleEditSubjectClick = (sub) => {
    setSelectedSubject(sub);
    setSubjectEditForm({ 
      name: sub.name, 
      tier: sub.tier, 
      class_ids: sub.classes ? sub.classes.map(c => c.class_id) : [] 
    });
    setShowEditSubjectModal(true);
  };

  const handleEditSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubject) return;
    setNotify('');
    setErrorMsg('');
    try {
      await api.updateSubject(selectedSubject.id, {
        name: subjectEditForm.name,
        tier: subjectEditForm.tier,
        class_ids: subjectEditForm.class_ids
      });
      setNotify('Subject curriculum details updated successfully!');
      setShowEditSubjectModal(false);
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject? This will delete all mapped grades and schemes of work for this subject.')) {
      return;
    }
    setNotify('');
    setErrorMsg('');
    try {
      await api.deleteSubject(subjectId);
      setNotify('Subject curriculum successfully deleted.');
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // ==========================================
  // FEE STRUCTURE CRUD LOGIC
  // ==========================================
  const handleCreateFeeStructure = async (e) => {
    e.preventDefault();
    setNotify('');
    setErrorMsg('');
    try {
      await api.addFeeStructure(newFeeStructureForm.title, newFeeStructureForm.amount, newFeeStructureForm.tier);
      setNotify('Tier Fee Structure added successfully!');
      setNewFeeStructureForm({ title: '', amount: '', tier: 'jss' });
      setShowFeeStructureModal(false);
      loadFeeStructures();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteFeeStructure = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fee structure?')) return;
    setNotify('');
    setErrorMsg('');
    try {
      await api.deleteFeeStructure(id);
      setNotify('Fee structure deleted successfully.');
      loadFeeStructures();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // ==========================================
  // ADMIN ATTENDANCE REPORT LOGIC
  // ==========================================
  const loadAdminAttendanceReport = async () => {
    if (!adminReportClassId) return;
    setNotify('');
    setErrorMsg('');
    try {
      const data = await api.getAttendanceReport(adminReportClassId, adminReportStartDate, adminReportEndDate);
      setAdminAttendanceReport(data);
    } catch (err) {
      setErrorMsg('Failed to fetch attendance report: ' + err.message);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'attendance' && activeAdminAttendanceSubTab === 'report' && adminReportClassId) {
      loadAdminAttendanceReport();
    }
  }, [activeSubTab, activeAdminAttendanceSubTab, adminReportClassId, adminReportStartDate, adminReportEndDate]);

  // ==========================================
  // ADMIN ATTENDANCE LOGIC
  // ==========================================
  const [adminAttendanceClass, setAdminAttendanceClass] = useState('');
  const [adminAttendanceDate, setAdminAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [adminAttendanceRoster, setAdminAttendanceRoster] = useState([]);

  const loadAdminAttendance = async (classId, date) => {
    if (!classId) return;
    try {
      const roster = await api.getAttendance(classId, date);
      setAdminAttendanceRoster(roster);
    } catch (err) {
      setErrorMsg('Failed to load attendance roster: ' + err.message);
    }
  };

  const handleAdminAttendanceStatusChange = (studentId, newStatus) => {
    setAdminAttendanceRoster(prev => prev.map(item => {
      if (item.student_id === studentId) {
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  const handleSaveAdminAttendance = async () => {
    if (!adminAttendanceClass) return;
    setNotify('');
    setErrorMsg('');
    try {
      const records = adminAttendanceRoster.map(item => ({
        student_id: item.student_id,
        status: item.status || 'present'
      }));
      await api.saveAttendance({
        class_id: adminAttendanceClass,
        date: adminAttendanceDate,
        records
      });
      setNotify('Attendance saved successfully!');
      loadAdminAttendance(adminAttendanceClass, adminAttendanceDate);
    } catch (err) {
      setErrorMsg('Failed to save attendance: ' + err.message);
    }
  };

  // ==========================================
  // ADMIN SCHEME OF WORK LOGIC
  // ==========================================
  const [adminSchemeClass, setAdminSchemeClass] = useState('');
  const [adminSchemeSubject, setAdminSchemeSubject] = useState('');
  const [adminSchemeTerm, setAdminSchemeTerm] = useState('3rd Term');
  const [adminSchemeWeeks, setAdminSchemeWeeks] = useState(Array.from({ length: 12 }, (_, i) => ({ week: i + 1, topic: '', objectives: '', id: null })));

  // Admin Enter Marks States
  const [adminGradesClass, setAdminGradesClass] = useState('');
  const [adminGradesSubject, setAdminGradesSubject] = useState('');
  const [adminStudentsGrades, setAdminStudentsGrades] = useState([]);
  const [adminGradesSearch, setAdminGradesSearch] = useState('');

  useEffect(() => {
    if (adminSchemeClass) {
      const filtered = classSubjects.filter(cs => cs.class_id === parseInt(adminSchemeClass));
      const hasSelected = filtered.some(cs => cs.subject_id === parseInt(adminSchemeSubject));
      if (!hasSelected) {
        setAdminSchemeSubject(filtered.length > 0 ? String(filtered[0].subject_id) : '');
      }
    } else {
      setAdminSchemeSubject('');
    }
  }, [adminSchemeClass, classSubjects]);

  const loadAdminSchemes = async () => {
    if (!adminSchemeClass || !adminSchemeSubject) return;
    try {
      const data = await api.getSchemes({
        class_id: adminSchemeClass,
        subject_id: adminSchemeSubject,
        term: adminSchemeTerm
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
      setAdminSchemeWeeks(newWeeks);
    } catch (err) {
      setErrorMsg('Failed to load schemes: ' + err.message);
    }
  };

  const handleAdminSchemeFieldChange = (weekNum, field, value) => {
    setAdminSchemeWeeks(prev => prev.map(w => {
      if (w.week === weekNum) {
        return { ...w, [field]: value };
      }
      return w;
    }));
  };

  const handleSaveAdminSchemeWeek = async (weekObj) => {
    setNotify('');
    setErrorMsg('');
    if (!weekObj.topic) {
      setErrorMsg(`Topic for Week ${weekObj.week} is required to save.`);
      return;
    }
    try {
      await api.saveScheme({
        class_id: parseInt(adminSchemeClass),
        subject_id: parseInt(adminSchemeSubject),
        term: adminSchemeTerm,
        week: weekObj.week,
        topic: weekObj.topic,
        objectives: weekObj.objectives
      });
      setNotify(`Successfully saved Week ${weekObj.week} Scheme of Work!`);
      loadAdminSchemes();
    } catch (err) {
      setErrorMsg(`Failed to save Week ${weekObj.week}: ` + err.message);
    }
  };

  const handleDeleteAdminSchemeWeek = async (weekObj) => {
    if (!weekObj.id) {
      handleAdminSchemeFieldChange(weekObj.week, 'topic', '');
      handleAdminSchemeFieldChange(weekObj.week, 'objectives', '');
      return;
    }
    setNotify('');
    setErrorMsg('');
    try {
      await api.deleteScheme(weekObj.id);
      setNotify(`Successfully deleted Week ${weekObj.week} entry.`);
      loadAdminSchemes();
    } catch (err) {
      setErrorMsg(`Failed to delete Week ${weekObj.week}: ` + err.message);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'attendance' && adminAttendanceClass) {
      loadAdminAttendance(adminAttendanceClass, adminAttendanceDate);
    }
  }, [activeSubTab, adminAttendanceClass, adminAttendanceDate]);

  useEffect(() => {
    if (activeSubTab === 'schemes' && adminSchemeClass && adminSchemeSubject) {
      loadAdminSchemes();
    }
  }, [activeSubTab, adminSchemeClass, adminSchemeSubject, adminSchemeTerm]);

  useEffect(() => {
    if (adminGradesClass) {
      const filtered = classSubjects.filter(cs => cs.class_id === parseInt(adminGradesClass));
      const hasSelected = filtered.some(cs => cs.subject_id === parseInt(adminGradesSubject));
      if (!hasSelected) {
        setAdminGradesSubject(filtered.length > 0 ? String(filtered[0].subject_id) : '');
      }
    } else {
      setAdminGradesSubject('');
    }
  }, [adminGradesClass, classSubjects]);

  const loadAdminGrades = async () => {
    if (!adminGradesClass || !adminGradesSubject) return;
    try {
      const data = await api.getGradesForEntry(
        parseInt(adminGradesClass),
        parseInt(adminGradesSubject),
        settings.active_term,
        settings.active_session
      );
      setAdminStudentsGrades(data);
    } catch (err) {
      setErrorMsg('Failed to load grades: ' + err.message);
    }
  };

  const handleAdminGradeChange = (studentId, field, value) => {
    setAdminStudentsGrades(prev => prev.map(g => {
      if (g.student_id === studentId) {
        const updated = { ...g, [field]: value };
        const c1 = parseFloat(field === 'ca1' ? value : updated.ca1 || 0);
        const c2 = parseFloat(field === 'ca2' ? value : updated.ca2 || 0);
        const c3 = parseFloat(field === 'ca3' ? value : updated.ca3 || 0);
        const c4 = parseFloat(field === 'ca4' ? value : updated.ca4 || 0);
        const ex = parseFloat(field === 'exam_score' ? value : updated.exam_score || 0);
        const tot = c1 + c2 + c3 + c4 + ex;
        updated.total_score = isNaN(tot) ? 0 : tot;
        
        let gradeLetter = 'F';
        if (updated.total_score >= 70) gradeLetter = 'A';
        else if (updated.total_score >= 60) gradeLetter = 'B';
        else if (updated.total_score >= 50) gradeLetter = 'C';
        else if (updated.total_score >= 40) gradeLetter = 'D';
        else if (updated.total_score >= 30) gradeLetter = 'E';
        updated.grade_letter = gradeLetter;
        
        return updated;
      }
      return g;
    }));
  };

  const handleAdminSaveGrades = async () => {
    if (!adminGradesClass || !adminGradesSubject) return;
    setNotify('');
    setErrorMsg('');
    try {
      await api.saveGrades({
        class_id: parseInt(adminGradesClass),
        subject_id: parseInt(adminGradesSubject),
        term: settings.active_term,
        academic_year: settings.active_session,
        grades: adminStudentsGrades
      });
      setNotify('Grades submitted and saved successfully!');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'student-results' && resultsSubTab === 'enter-marks' && adminGradesClass && adminGradesSubject) {
      loadAdminGrades();
    }
  }, [activeSubTab, resultsSubTab, adminGradesClass, adminGradesSubject, settings.active_term, settings.active_session]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      {/* Dynamic Alerts */}
      {notify && (
        <div style={{ padding: '12px 18px', backgroundColor: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
          Success: {notify}
          <button style={{ float: 'right', background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }} onClick={() => setNotify('')}>✕</button>
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '12px 18px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
          Warning: {errorMsg}
          <button style={{ float: 'right', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} onClick={() => setErrorMsg('')}>✕</button>
        </div>
      )}



      {/* =======================================================
          TAB 1: OVERVIEW METRICS & 3D ANALYTICS
          ======================================================= */}
      {activeSubTab === 'overview' && (() => {
        // Calculate class distribution data for 3D column chart
        const classEnrollmentData = classes.map((c, idx) => {
          const count = students.filter(s => s.class_id === c.id).length;
          const colors = [
            { main: '#38ef7d', top: '#a8ff78' },
            { main: '#0072ff', top: '#00c6ff' },
            { main: '#E100FF', top: '#ff8a00' },
            { main: '#ff9900', top: '#ffdb58' },
            { main: '#825a2c', top: '#d4a373' },
            { main: '#F9D423', top: '#fff07c' }
          ];
          const colorPair = colors[idx % colors.length];
          return {
            label: c.name,
            value: count,
            color: colorPair.main,
            colorTop: colorPair.top
          };
        });

        // Calculate Revenue Distribution for 3D Pie Chart
        const totalPaid = feesReport.reduce((sum, f) => sum + (f.amount_paid || 0), 0);
        const totalOwed = feesReport.reduce((sum, f) => sum + Math.max(0, (f.amount_due || 0) - (f.amount_paid || 0)), 0);
        const feeRevenuePieData = [
          { label: 'Amount Paid (Collected)', value: totalPaid, color: 'var(--success)' },
          { label: 'Balance Owed (Pending)', value: totalOwed, color: 'var(--danger)' }
        ];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="stats-grid">
              <div className="stat-card glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div className="stat-info">
                  <h3>{students.length}</h3>
                  <p>STUDENTS REGISTERED</p>
                </div>
              </div>
              <div className="stat-card glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div className="stat-info">
                  <h3>{teachers.length}</h3>
                  <p>ACADEMIC TEACHERS</p>
                </div>
              </div>
              <div className="stat-card glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div className="stat-info">
                  <h3>{classes.length}</h3>
                  <p>CLASS ARMS</p>
                </div>
              </div>
              <div className="stat-card glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div className="stat-info">
                  <h3>{subjects.length}</h3>
                  <p>SUBJECTS OFFERED</p>
                </div>
              </div>
            </div>

            {/* Visual 3D Analytics Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              <ThreeDColumnChart
                title="Student Class Arm Enrollment"
                subtitle="Distribution of registered students across active class streams"
                data={classEnrollmentData.length > 0 ? classEnrollmentData : [
                  { label: 'JSS 1', value: 35, color: '#38ef7d', colorTop: '#a8ff78' },
                  { label: 'JSS 2', value: 28, color: '#0072ff', colorTop: '#00c6ff' },
                  { label: 'JSS 3', value: 42, color: '#E100FF', colorTop: '#ff8a00' },
                  { label: 'SSS 1', value: 30, color: '#ff9900', colorTop: '#ffdb58' },
                  { label: 'SSS 2', value: 25, color: '#825a2c', colorTop: '#d4a373' },
                  { label: 'SSS 3', value: 20, color: '#F9D423', colorTop: '#fff07c' }
                ]}
              />

              <ThreeDPieChart
                title="School Fees Collection Summary"
                subtitle="Ratio of collected tuition fees versus pending outstanding balances"
                data={feeRevenuePieData}
              />
            </div>
          </div>
        );
      })()}

      {/* =======================================================
          TAB 2: STUDENT REGISTRY
          ======================================================= */}
      {activeSubTab === 'students' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h3>Student Roster</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Click any student's name to view and print their official registration profile.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" onClick={() => setShowStudentModal(true)}>+ Register New Student</button>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-control"
              style={{ flex: 1, minWidth: '200px', padding: '10px' }}
              placeholder="Search student by name or admission number..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
            <select
              className="form-control"
              style={{ width: '200px', padding: '10px' }}
              value={studentClassFilter}
              onChange={(e) => setStudentClassFilter(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map((cls, idx) => (
                <option key={idx} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div className="table-container">
            <table className="school-table">
              <thead>
                <tr>
                  <th>Passport</th>
                  <th>Full Name</th>
                  <th>Admission Number</th>
                  <th>Class Arm</th>
                  <th>Parent Contact</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.filter(student => {
                  const matchesSearch = student.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                        student.admission_number.toLowerCase().includes(studentSearch.toLowerCase());
                  const matchesClass = studentClassFilter === '' || student.class_id === parseInt(studentClassFilter);
                  return matchesSearch && matchesClass;
                }).map((student, idx) => (
                  <tr key={idx}>
                    <td>
                      <div
                        style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', cursor: 'pointer' }}
                        onClick={() => setSelectedStudentForForm(student)}
                        title="Click to view student profile"
                      >
                        {student.passport_photo && <img src={student.passport_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedStudentForForm(student)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontWeight: '700',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '0.95rem',
                          textAlign: 'left',
                          textDecoration: 'hover'
                        }}
                        title="Click to view student profile"
                      >
                        {student.full_name}
                      </button>
                    </td>
                    <td><code>{student.admission_number}</code></td>
                    <td>{student.class_name || 'Unassigned'}</td>
                    <td>{student.parent_name} ({student.parent_phone})</td>
                    <td>
                      <select
                        className="form-control"
                        style={{ padding: '4px 8px', fontSize: '0.85rem', width: 'auto' }}
                        value={student.status || 'active'}
                        onChange={(e) => handleUserStatusChange(student.id, e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="inactive">Inactive</option>
                        <option value="graduated">Graduated</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =======================================================
          TAB 3: STAFF REGISTRY
          ======================================================= */}
      {activeSubTab === 'teachers' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h3>Teacher Registry</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Full record of registered school academic staff.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowTeacherModal(true)}>+ Register Teacher</button>
          </div>

          {/* Search Controls */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <input
              type="text"
              className="form-control"
              style={{ maxWidth: '300px', padding: '10px' }}
              placeholder="Search teacher by name or username..."
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
            />
          </div>

          <div className="table-container">
            <table className="school-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Employment Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {teachers.filter(teach => 
                  teach.full_name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                  teach.username.toLowerCase().includes(teacherSearch.toLowerCase())
                ).map((teach, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                        {teach.passport_photo ? <img src={teach.passport_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : teach.full_name.charAt(0)}
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedTeacherForProfile(teach)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                        title="Click to view teacher profile"
                      >
                        {teach.full_name}
                      </button>
                    </td>
                    <td><code>{teach.username}</code></td>
                    <td>{teach.email || 'N/A'}</td>
                    <td>{teach.created_at ? teach.created_at.split(' ')[0] : 'N/A'}</td>
                    <td>
                      <select
                        className="form-control"
                        style={{ padding: '4px 8px', fontSize: '0.85rem', width: 'auto' }}
                        value={teach.status || 'active'}
                        onChange={(e) => handleUserStatusChange(teach.id, e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =======================================================
          TAB 4: CLASSES & SUBJECTS CONFIG
          ======================================================= */}
      {activeSubTab === 'classes' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Class List */}
          <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Class streams</h3>
              <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.85rem' }} onClick={() => setShowClassModal(true)}>+ Create Class</button>
            </div>
            
            <div className="table-container">
              <table className="school-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Tier</th>
                    <th>Form Master</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((c, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600' }}>{c.name}</td>
                      <td style={{ textTransform: 'capitalize' }}>{c.tier}</td>
                      <td>
                        <select
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                          value={c.form_master_id || ''}
                          onChange={(e) => handleFormMasterAssign(c.id, e.target.value)}
                        >
                          <option value="">Assign Master...</option>
                          {teachers.map((t, idx) => (
                            <option key={idx} value={t.id}>{t.full_name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subject Assignments */}
          <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Subject assignments</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem' }} onClick={() => setShowSubjectModal(true)}>+ Seed Subject</button>
                <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.85rem' }} onClick={() => setShowAssignModal(true)}>Map Teacher</button>
              </div>
            </div>

            <div className="table-container">
              <table className="school-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Subject Teacher</th>
                  </tr>
                </thead>
                <tbody>
                  {classSubjects.map((cs, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600' }}>{cs.class_name}</td>
                      <td>{cs.subject_name}</td>
                      <td>
                        <span style={{ fontWeight: '500', color: cs.teacher_name ? 'inherit' : 'var(--danger)' }}>
                          {cs.teacher_name || '🚨 Unassigned'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* =======================================================
          TAB 5: SUBJECTS CURRICULUM MANAGEMENT
          ======================================================= */}
      {activeSubTab === 'subjects' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h3>Curriculum Subjects</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>View, add, edit, or delete subjects in the school curriculum.</p>
            </div>
            <button className="btn btn-primary" onClick={() => { setSubjectForm({ name: '', tier: 'jss', class_ids: [] }); setShowSubjectModal(true); }}>+ Add Subject</button>
          </div>

          <div className="table-container">
            <table className="school-table">
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Tier Level</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No subjects found. Add a subject to start.</td>
                  </tr>
                ) : (
                  subjects.map((sub, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600' }}>{sub.name}</td>
                      <td style={{ textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--primary)' }}>{sub.tier}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem', marginRight: '8px' }} 
                          onClick={() => handleEditSubjectClick(sub)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }} 
                          onClick={() => handleDeleteSubject(sub.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =======================================================
          TAB 5: FINANCE & INVOICES LEDGER
          ======================================================= */}
      {/* =======================================================
          TAB 5: FINANCE & INVOICES LEDGER
          ======================================================= */}
      {activeSubTab === 'fees' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
          
          {/* Sub Navigation for Fees */}
          <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveFeesSubTab('invoices')}
              style={{
                padding: '10px 15px',
                background: 'none',
                border: 'none',
                borderBottom: activeFeesSubTab === 'invoices' ? '2.5px solid var(--primary)' : 'none',
                color: activeFeesSubTab === 'invoices' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              Billing & Invoices
            </button>
            <button
              onClick={() => setActiveFeesSubTab('structures')}
              style={{
                padding: '10px 15px',
                background: 'none',
                border: 'none',
                borderBottom: activeFeesSubTab === 'structures' ? '2.5px solid var(--primary)' : 'none',
                color: activeFeesSubTab === 'structures' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              Fee Structures
            </button>
            <button
              onClick={() => setActiveFeesSubTab('report')}
              style={{
                padding: '10px 15px',
                background: 'none',
                border: 'none',
                borderBottom: activeFeesSubTab === 'report' ? '2.5px solid var(--primary)' : 'none',
                color: activeFeesSubTab === 'report' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              Paid Fees Report
            </button>
          </div>

          {activeFeesSubTab === 'invoices' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h3>Student Invoices Ledger</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Select any unpaid/partial invoice to log parent payment.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowFeeModal(true)}>+ Bill Students</button>
              </div>

              {/* Search & Filter Controls */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ flex: 1, minWidth: '200px', padding: '10px' }}
                  placeholder="Search student by name..."
                  value={feeSearch}
                  onChange={(e) => setFeeSearch(e.target.value)}
                />
                <select
                  className="form-control"
                  style={{ width: '200px', padding: '10px' }}
                  value={feeClassFilter}
                  onChange={(e) => setFeeClassFilter(e.target.value)}
                >
                  <option value="">All Classes</option>
                  {classes.map((cls, idx) => (
                    <option key={idx} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div className="table-container">
                <table className="school-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Class</th>
                      <th>Fee Title</th>
                      <th>Amount Due</th>
                      <th>Amount Paid</th>
                      <th>Balance Owed</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feesReport.filter(inv => {
                      const matchesSearch = inv.full_name.toLowerCase().includes(feeSearch.toLowerCase());
                      const matchesClass = feeClassFilter === '' || inv.class_name === classes.find(c => c.id === parseInt(feeClassFilter))?.name;
                      return matchesSearch && matchesClass;
                    }).length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No outstanding invoices found.</td>
                      </tr>
                    ) : (
                      feesReport.filter(inv => {
                        const matchesSearch = inv.full_name.toLowerCase().includes(feeSearch.toLowerCase());
                        const matchesClass = feeClassFilter === '' || inv.class_name === classes.find(c => c.id === parseInt(feeClassFilter))?.name;
                        return matchesSearch && matchesClass;
                      }).map((inv, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600' }}>{inv.full_name} (<code>{inv.admission_number}</code>)</td>
                          <td>{inv.class_name || 'Unassigned'}</td>
                          <td>{inv.title}</td>
                          <td style={{ fontWeight: 'bold' }}>₦{inv.amount_due.toLocaleString()}</td>
                          <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>₦{inv.amount_paid.toLocaleString()}</td>
                          <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>₦{(inv.amount_due - inv.amount_paid).toLocaleString()}</td>
                          <td>
                            <span className={`badge ${inv.status === 'paid' ? 'badge-success' : inv.status === 'partial' ? 'badge-warning' : 'badge-danger'}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {inv.status !== 'paid' && (
                              <button
                                className="btn btn-primary"
                                style={{ padding: '6px 12px', fontSize: '0.8rem', marginRight: '8px' }}
                                onClick={() => {
                                  setPayForm({
                                    invoice_id: inv.id,
                                    amount_paid: inv.amount_due - inv.amount_paid,
                                    payment_method: 'Cash',
                                    student_name: inv.full_name
                                  });
                                  setShowPayModal(true);
                                }}
                              >
                                Log Payment
                              </button>
                            )}
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              onClick={() => setSelectedReceipt(inv)}
                            >
                              Print
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeFeesSubTab === 'structures' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3>Tuition Fee Structures</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Define default termly school fees billed per education levels.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowFeeStructureModal(true)}>+ Add Structure</button>
              </div>

              <div className="table-container">
                <table className="school-table">
                  <thead>
                    <tr>
                      <th>Fee Title</th>
                      <th>Billed Amount</th>
                      <th>Applicable Tier Level</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeStructures.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No structures configured yet.</td>
                      </tr>
                    ) : (
                      feeStructures.map((struct, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600' }}>{struct.title}</td>
                          <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>₦{struct.amount.toLocaleString()}</td>
                          <td style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold' }}>{struct.tier}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              onClick={() => handleDeleteFeeStructure(struct.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeFeesSubTab === 'report' && (() => {
            const filteredList = feesReport.filter(inv => {
              const matchesSearch = inv.full_name.toLowerCase().includes(paymentReportSearch.toLowerCase()) ||
                                    inv.admission_number.toLowerCase().includes(paymentReportSearch.toLowerCase()) ||
                                    inv.title.toLowerCase().includes(paymentReportSearch.toLowerCase());
              const matchesClass = paymentReportClassFilter === '' || inv.class_name === classes.find(c => c.id === parseInt(paymentReportClassFilter))?.name;
              const matchesStatus = paymentReportStatusFilter === 'all' || inv.status === paymentReportStatusFilter;
              return matchesSearch && matchesClass && matchesStatus;
            });

            const totalBilled = filteredList.reduce((sum, item) => sum + (item.amount_due || 0), 0);
            const totalPaid = filteredList.reduce((sum, item) => sum + (item.amount_paid || 0), 0);
            const totalRemaining = Math.max(0, totalBilled - totalPaid);
            const paidCount = filteredList.filter(i => i.status === 'paid').length;
            const partialCount = filteredList.filter(i => i.status === 'partial').length;
            const unpaidCount = filteredList.filter(i => i.status === 'unpaid').length;

            // Chart 1 Data: Payment Status Share
            const paymentStatusPieData = [
              { label: 'Fully Paid', value: paidCount, color: 'var(--success)' },
              { label: 'Partial Payment', value: partialCount, color: 'var(--warning)' },
              { label: 'Unpaid', value: unpaidCount, color: 'var(--danger)' }
            ];

            // Chart 2 Data: Revenue Collection per Class Arm
            const classRevenueMap = {};
            filteredList.forEach(item => {
              const cName = item.class_name || 'Unassigned';
              if (!classRevenueMap[cName]) classRevenueMap[cName] = 0;
              classRevenueMap[cName] += (item.amount_paid || 0);
            });

            const classRevenueColumnData = Object.keys(classRevenueMap).map((cName, idx) => {
              const colors = [
                { main: '#38ef7d', top: '#a8ff78' },
                { main: '#0072ff', top: '#00c6ff' },
                { main: '#E100FF', top: '#ff8a00' },
                { main: '#ff9900', top: '#ffdb58' },
                { main: '#825a2c', top: '#d4a373' }
              ];
              const colorPair = colors[idx % colors.length];
              return {
                label: cName,
                value: classRevenueMap[cName],
                color: colorPair.main,
                colorTop: colorPair.top
              };
            });

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Header & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Student Payment Audit Report</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                      Click any student's name to view their complete payment history log and print receipt slips.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }} className="no-print">
                    <button className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 14px' }} onClick={() => handleExportPaymentReportExcel(filteredList)}>
                      📊 Export to Excel
                    </button>
                    <button className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 14px' }} onClick={() => window.print()}>
                      🖨️ Print Report
                    </button>
                  </div>
                </div>

                {/* Top KPI Cards (Total Billed removed as requested) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                  <div className="glass-panel" style={{ padding: '16px 20px', backgroundColor: 'var(--bg-primary)', borderLeft: '4px solid var(--success)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Amount Paid
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--success)', marginTop: '4px' }}>
                      ₦{totalPaid.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600', marginTop: '2px' }}>
                      ✓ {paidCount} Fully Paid Invoices
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '16px 20px', backgroundColor: 'var(--bg-primary)', borderLeft: '4px solid var(--danger)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Amount Remaining
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--danger)', marginTop: '4px' }}>
                      ₦{totalRemaining.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: '600', marginTop: '2px' }}>
                      ⚠️ {unpaidCount + partialCount} Pending Balances
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '16px 20px', backgroundColor: 'var(--bg-primary)', borderLeft: '4px solid var(--secondary)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Collection Efficiency
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '6px' }}>
                      {totalBilled > 0 ? `${((totalPaid / totalBilled) * 100).toFixed(1)}% Collected` : '0%'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {partialCount} partial payments
                    </div>
                  </div>
                </div>

                {/* 3D Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                  <ThreeDPieChart
                    title="Payment Status Distribution"
                    subtitle="Breakdown of fully paid, partial, and unpaid student fee records"
                    data={paymentStatusPieData}
                  />

                  <ThreeDColumnChart
                    title="Revenue Collected by Class Stream"
                    subtitle="Total amount paid in Naira per class arm"
                    data={classRevenueColumnData.length > 0 ? classRevenueColumnData : [
                      { label: 'JSS 1', value: 250000, color: '#38ef7d', colorTop: '#a8ff78' },
                      { label: 'JSS 2', value: 180000, color: '#0072ff', colorTop: '#00c6ff' },
                      { label: 'JSS 3', value: 310000, color: '#E100FF', colorTop: '#ff8a00' },
                      { label: 'SSS 1', value: 210000, color: '#ff9900', colorTop: '#ffdb58' }
                    ]}
                  />
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }} className="no-print">
                  <input
                    type="text"
                    className="form-control"
                    style={{ flex: '1 1 200px', padding: '10px' }}
                    placeholder="Search student, admission no, or fee..."
                    value={paymentReportSearch}
                    onChange={(e) => setPaymentReportSearch(e.target.value)}
                  />
                  <select
                    className="form-control"
                    style={{ width: '180px', padding: '10px' }}
                    value={paymentReportClassFilter}
                    onChange={(e) => setPaymentReportClassFilter(e.target.value)}
                  >
                    <option value="">All Classes</option>
                    {classes.map((cls, idx) => (
                      <option key={idx} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                  <select
                    className="form-control"
                    style={{ width: '180px', padding: '10px' }}
                    value={paymentReportStatusFilter}
                    onChange={(e) => setPaymentReportStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="paid">Fully Paid</option>
                    <option value="partial">Partial Payment</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>

                {/* Report Table (Total Billed & View History action button removed as requested) */}
                <div className="table-container" style={{ margin: 0 }}>
                  <table className="school-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Admission ID</th>
                        <th>Class Arm</th>
                        <th>Fee Item</th>
                        <th style={{ textAlign: 'right' }}>Amount Paid</th>
                        <th style={{ textAlign: 'right' }}>Amount Remaining</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredList.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px' }}>
                            No payment records found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        filteredList.map((inv, idx) => {
                          const remaining = inv.amount_due - inv.amount_paid;
                          return (
                            <tr key={idx}>
                              <td style={{ fontWeight: '600' }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenStudentPaymentHistory(inv.student_id, inv)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    padding: 0,
                                    fontSize: '0.92rem',
                                    textAlign: 'left'
                                  }}
                                  title="Click to view payment history & receipts"
                                >
                                  {inv.full_name} 💳
                                </button>
                              </td>
                              <td><code>{inv.admission_number}</code></td>
                              <td>{inv.class_name || 'Unassigned'}</td>
                              <td>{inv.title}</td>
                              <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 'bold' }}>₦{inv.amount_paid.toLocaleString()}</td>
                              <td style={{ textAlign: 'right', color: remaining > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 'bold' }}>
                                ₦{remaining.toLocaleString()}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`badge ${inv.status === 'paid' ? 'badge-success' : inv.status === 'partial' ? 'badge-warning' : 'badge-danger'}`}>
                                  {inv.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

        </div>
      )}

      {/* =======================================================
          TAB: STUDENT RESULTS WORKSPACE (BULK PRINT, BROADSHEET & PINS)
          ======================================================= */}
      {activeSubTab === 'student-results' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Sub-Tab Navigation Bar */}
          <div className="settings-tab-bar">
            <button
              type="button"
              className={`settings-tab-btn ${resultsSubTab === 'enter-marks' ? 'active' : ''}`}
              onClick={() => setResultsSubTab('enter-marks')}
            >
              <span>✍️</span> Enter Marks
            </button>
            <button
              type="button"
              className={`settings-tab-btn ${resultsSubTab === 'bulk' ? 'active' : ''}`}
              onClick={() => setResultsSubTab('bulk')}
            >
              <span>🖨️</span> Bulk Print Cards
            </button>
            <button
              type="button"
              className={`settings-tab-btn ${resultsSubTab === 'broadsheet' ? 'active' : ''}`}
              onClick={() => {
                setResultsSubTab('broadsheet');
                const targetClassId = adminBroadsheetClassId || (classes && classes.length > 0 ? classes[0].id : '');
                if (targetClassId) {
                  if (!adminBroadsheetClassId) setAdminBroadsheetClassId(targetClassId);
                  fetchAdminBroadsheet(targetClassId);
                }
              }}
            >
              <span>📊</span> Class Broadsheet
            </button>
            <button
              type="button"
              className={`settings-tab-btn ${resultsSubTab === 'pins' ? 'active' : ''}`}
              onClick={() => setResultsSubTab('pins')}
            >
              <span>🔑</span> Result PINs
            </button>
          </div>

          {/* Sub-Tab 1: Bulk Print Cards */}
          {resultsSubTab === 'bulk' && (
            <BulkResultPrinter
              classes={classes}
              sessions={sessions}
              currentTerm={settings?.active_term}
              currentSession={settings?.active_session}
              settings={settings}
              isStandalonePage={true}
              onBack={() => setActiveSubTab('overview')}
            />
          )}

          {/* Sub-Tab 2: Class Broadsheet */}
          {resultsSubTab === 'broadsheet' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h3>Class Results Broadsheet</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Select a class arm to view master score broadsheet, export to Excel CSV, or print.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Select Class:</label>
                  <select
                    className="form-control"
                    style={{ width: '220px', padding: '10px' }}
                    value={adminBroadsheetClassId || (classes[0]?.id || '')}
                    onChange={(e) => {
                      const cid = e.target.value;
                      setAdminBroadsheetClassId(cid);
                      fetchAdminBroadsheet(cid);
                    }}
                  >
                    {classes.map((cls, idx) => (
                      <option key={idx} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {adminBroadsheetLoading ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--primary)' }}>
                  <h4>Loading Class Broadsheet...</h4>
                </div>
              ) : adminBroadsheetData ? (
                <ClassBroadsheet
                  data={adminBroadsheetData}
                  className={classes.find(c => c.id === parseInt(adminBroadsheetClassId || classes[0]?.id))?.name || 'Class'}
                  term={settings?.active_term}
                  session={settings?.active_session}
                  settings={settings}
                  onBack={() => setActiveSubTab('overview')}
                />
              ) : (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <p>Select a class arm above to view its broadsheet.</p>
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 3: Result PINs */}
          {resultsSubTab === 'pins' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h3>Result Verification Tokens (PINs)</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Alphanumeric tokens required by students to verify results. Max usage limit of 5 checks applies.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Count</span>
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: '90px', padding: '8px' }}
                      value={pinCount}
                      onChange={(e) => setPinCount(e.target.value)}
                    />
                  </div>

                  <button className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '9px 18px' }} onClick={handleGeneratePins}>Bulk Generate</button>
                </div>
              </div>

              {/* Search Controls */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ maxWidth: '300px', padding: '10px' }}
                  placeholder="Search PIN code or student..."
                  value={pinSearch}
                  onChange={(e) => setPinSearch(e.target.value)}
                />
              </div>

              <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="school-table">
                  <thead>
                    <tr>
                      <th>Result Checker PIN</th>
                      <th>Term / Session</th>
                      <th>Assigned Student</th>
                      <th>Checks Remaining</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pins.filter(p => {
                      const query = pinSearch.toLowerCase();
                      return p.pin.toLowerCase().includes(query) ||
                             (p.student_name && p.student_name.toLowerCase().includes(query)) ||
                             (p.admission_number && p.admission_number.toLowerCase().includes(query));
                    }).map((p, idx) => (
                      <tr key={idx}>
                        <td><strong style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}>{p.pin}</strong></td>
                        <td>{p.term ? `${p.term} (${p.academic_year})` : 'Universal (Any Term/Session)'}</td>
                        <td>{p.student_name ? `${p.student_name} (${p.admission_number})` : 'Unused Token'}</td>
                        <td><strong>{5 - p.usage_count} / 5</strong></td>
                        <td>
                          <span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {resultsSubTab === 'enter-marks' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h3>Enter Student Marks</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Select a class and subject to enter or edit grades.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Class</label>
                    <select className="form-control" value={adminGradesClass} onChange={(e) => setAdminGradesClass(e.target.value)}>
                      <option value="">Choose...</option>
                      {classes.map((cls, idx) => <option key={idx} value={cls.id}>{cls.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Subject</label>
                    <select className="form-control" value={adminGradesSubject} onChange={(e) => setAdminGradesSubject(e.target.value)}>
                      <option value="">Choose...</option>
                      {classSubjects.filter(cs => cs.class_id === parseInt(adminGradesClass)).map((cs, idx) => (
                        <option key={idx} value={cs.subject_id}>{cs.subject_name}</option>
                      ))}
                    </select>
                  </div>
                  <button className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '9px 18px' }} onClick={handleAdminSaveGrades}>
                    Save Marks
                  </button>
                </div>
              </div>

              {adminGradesClass && adminGradesSubject ? (
                <>
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <input
                      type="text"
                      className="form-control"
                      style={{ maxWidth: '300px', padding: '10px' }}
                      placeholder="Search student by name..."
                      value={adminGradesSearch}
                      onChange={(e) => setAdminGradesSearch(e.target.value)}
                    />
                  </div>
                  <div className="grade-table-container">
                    <table className="grade-entry-table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Admission No</th>
                          <th>{settings.ca1_name || 'CA 1'} (10)</th>
                          <th>{settings.ca2_name || 'CA 2'} (10)</th>
                          <th>{settings.ca3_name || 'CA 3'} (10)</th>
                          <th>{settings.ca4_name || 'CA 4'} (10)</th>
                          <th>Exam (60)</th>
                          <th>Total</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminStudentsGrades.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No students found.</td>
                          </tr>
                        ) : (
                          adminStudentsGrades.filter(g => 
                            g.full_name.toLowerCase().includes(adminGradesSearch.toLowerCase()) ||
                            g.admission_number.toLowerCase().includes(adminGradesSearch.toLowerCase())
                          ).map((g, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{g.full_name}</td>
                              <td><code>{g.admission_number}</code></td>
                              <td>
                                <input type="number" className="grade-input" min="0" max="10" placeholder="-" value={g.ca1 !== null ? g.ca1 : ''} onChange={(e) => handleAdminGradeChange(g.student_id, 'ca1', e.target.value)} />
                              </td>
                              <td>
                                <input type="number" className="grade-input" min="0" max="10" placeholder="-" value={g.ca2 !== null ? g.ca2 : ''} onChange={(e) => handleAdminGradeChange(g.student_id, 'ca2', e.target.value)} />
                              </td>
                              <td>
                                <input type="number" className="grade-input" min="0" max="10" placeholder="-" value={g.ca3 !== null ? g.ca3 : ''} onChange={(e) => handleAdminGradeChange(g.student_id, 'ca3', e.target.value)} />
                              </td>
                              <td>
                                <input type="number" className="grade-input" min="0" max="10" placeholder="-" value={g.ca4 !== null ? g.ca4 : ''} onChange={(e) => handleAdminGradeChange(g.student_id, 'ca4', e.target.value)} />
                              </td>
                              <td>
                                <input type="number" className="grade-input" min="0" max="60" placeholder="-" value={g.exam_score !== null && g.exam_score !== undefined ? g.exam_score : ''} onChange={(e) => handleAdminGradeChange(g.student_id, 'exam_score', e.target.value)} />
                              </td>
                              <td>
                                <span className="grade-total">{g.total_score || 0}</span>
                              </td>
                              <td>
                                <span className={`grade-badge grade-${g.grade_letter || 'F'}`}>{g.grade_letter || '-'}</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📊</div>
                  <p>Please select a class and subject to view and enter marks.</p>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* =======================================================
          TAB: PROMOTIONS WORKSPACE (STANDALONE WITH CHECKLIST)
          ======================================================= */}
      {activeSubTab === 'promotions' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>🎓 Move Students to Next Class</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Select a class stream to view student checklist, check students to advance, and promote to their new class for session {settings?.active_session || ''}.
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => setActiveSubTab('overview')} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
              ← Back to Overview
            </button>
          </div>

          {/* Promoted Classes Notice */}
          {promotedClassIds.length > 0 && (
            <div style={{ padding: '10px 16px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span>
                ℹ️ <strong>{promotedClassIds.length} class(es)</strong> already promoted in <strong>{settings?.active_session}</strong> are hidden from selection.
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  onClick={() => setShowAllClassesInPromo(!showAllClassesInPromo)}
                >
                  {showAllClassesInPromo ? 'Hide Promoted Classes' : 'Show All Classes'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.78rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  onClick={handleResetPromotedClasses}
                >
                  Reset Session Promotion Status
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handlePromotionBulk}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'flex-end', marginBottom: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: 'bold' }}>Current Class Stream</label>
                <select
                  className="form-control"
                  value={promoSource}
                  onChange={(e) => setPromoSource(e.target.value)}
                  required
                >
                  <option value="">Select current class...</option>
                  {classes
                    .filter(c => showAllClassesInPromo || !promotedClassIds.includes(c.id))
                    .map((c, idx) => (
                      <option key={idx} value={c.id}>
                        {c.name} {promotedClassIds.includes(c.id) ? ' (Promoted)' : ''}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: 'bold' }}>Target Destination Class</label>
                <select
                  className="form-control"
                  value={promoTarget}
                  onChange={(e) => setPromoTarget(e.target.value)}
                  required
                >
                  <option value="">Select target class...</option>
                  {classes.map((c, idx) => (
                    <option key={idx} value={c.id}>{c.name}</option>
                  ))}
                  <option value="graduate">🎓 Graduated Alumni (Complete Schooling)</option>
                </select>
              </div>
            </div>

            {/* Student Roster Checklist */}
            {promoSource ? (() => {
              const sourceStudents = students.filter(s => s.class_id === parseInt(promoSource));
              const filteredStudents = sourceStudents.filter(s => 
                s.full_name.toLowerCase().includes(promoStudentSearch.toLowerCase()) || 
                s.admission_number.toLowerCase().includes(promoStudentSearch.toLowerCase())
              );
              const targetClassName = promoTarget === 'graduate' 
                ? 'Graduated Alumni' 
                : (classes.find(c => c.id === parseInt(promoTarget))?.name || 'Target Class');
              const sourceClassName = classes.find(c => c.id === parseInt(promoSource))?.name || 'Current Class';

              return (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem' }}>
                        Registered Students in {sourceClassName} ({sourceStudents.length})
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '2px 0 0 0' }}>
                        Check students who pass to advance to {promoTarget ? targetClassName : 'target class'}. Unchecked students stay in {sourceClassName}.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-control"
                        style={{ width: '220px', padding: '6px 12px', fontSize: '0.85rem' }}
                        placeholder="Search student name..."
                        value={promoStudentSearch}
                        onChange={(e) => setPromoStudentSearch(e.target.value)}
                      />

                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        onClick={() => {
                          if (selectedStudentIdsForPromo.length === sourceStudents.length) {
                            setSelectedStudentIdsForPromo([]);
                          } else {
                            setSelectedStudentIdsForPromo(sourceStudents.map(s => s.id));
                          }
                        }}
                      >
                        {selectedStudentIdsForPromo.length === sourceStudents.length ? '☐ Deselect All' : '☑ Select All'}
                      </button>
                    </div>
                  </div>

                  <div className="table-container" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                    <table className="school-table">
                      <thead>
                        <tr>
                          <th style={{ width: '50px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={sourceStudents.length > 0 && selectedStudentIdsForPromo.length === sourceStudents.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudentIdsForPromo(sourceStudents.map(s => s.id));
                                } else {
                                  setSelectedStudentIdsForPromo([]);
                                }
                              }}
                            />
                          </th>
                          <th>Admission No</th>
                          <th>Student Full Name</th>
                          <th>Promotion Action Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                              No registered students found in {sourceClassName}.
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((stud, idx) => {
                            const isChecked = selectedStudentIdsForPromo.includes(stud.id);
                            return (
                              <tr key={idx} style={{ backgroundColor: isChecked ? 'rgba(34, 197, 94, 0.04)' : 'transparent' }}>
                                <td style={{ textAlign: 'center' }}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setSelectedStudentIdsForPromo(prev => prev.filter(id => id !== stud.id));
                                      } else {
                                        setSelectedStudentIdsForPromo(prev => [...prev, stud.id]);
                                      }
                                    }}
                                  />
                                </td>
                                <td><code>{stud.admission_number}</code></td>
                                <td><strong>{stud.full_name}</strong></td>
                                <td>
                                  {isChecked ? (
                                    <span className="badge badge-success">
                                      Promote → {targetClassName}
                                    </span>
                                  ) : (
                                    <span className="badge badge-warning" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
                                      Keep in {sourceClassName}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <span>
                      Selected for Promotion: <strong>{selectedStudentIdsForPromo.length}</strong> of <strong>{sourceStudents.length}</strong> students
                    </span>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={selectedStudentIdsForPromo.length === 0 || !promoTarget}
                      style={{ padding: '10px 24px', fontWeight: 'bold' }}
                    >
                      🎓 Promote Selected ({selectedStudentIdsForPromo.length})
                    </button>
                  </div>
                </div>
              );
            })() : (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)' }}>
                <p>Select a current class stream above to view its student roster checklist.</p>
              </div>
            )}
          </form>
        </div>
      )}

      {/* =======================================================
          TAB 7: SYSTEM PORTAL SETTINGS
          ======================================================= */}
      {activeSubTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Sub-Tab Navigation Bar */}
          <div className="settings-tab-bar">
            <button
              type="button"
              className={`settings-tab-btn ${settingsSubTab === 'academic' ? 'active' : ''}`}
              onClick={() => setSettingsSubTab('academic')}
            >
              <span>📅</span> School Year & Term
            </button>
            <button
              type="button"
              className={`settings-tab-btn ${settingsSubTab === 'reports' ? 'active' : ''}`}
              onClick={() => setSettingsSubTab('reports')}
            >
              <span>📜</span> Report Card Display
            </button>
            <button
              type="button"
              className={`settings-tab-btn ${settingsSubTab === 'website' ? 'active' : ''}`}
              onClick={() => setSettingsSubTab('website')}
            >
              <span>🌐</span> Website & Contact Info
            </button>
            <button
              type="button"
              className={`settings-tab-btn ${settingsSubTab === 'skills' ? 'active' : ''}`}
              onClick={() => setSettingsSubTab('skills')}
            >
              <span>🧠</span> Psychomotor Skills
            </button>
          </div>

          {/* Sub-Tab 1: School Year & Term */}
          {settingsSubTab === 'academic' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>School Year & Term Setup</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
                Set the current school year, select the active term, and manage teacher grade entry permissions.
              </p>
              
              <form onSubmit={handleUpdateSettings}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                  
                  <div className="form-group">
                    <label>Current School Year</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        className="form-control"
                        value={sessions.find(s => s.session_name === settingsForm.active_session)?.id || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            handleSetActiveSession(val);
                            const sess = sessions.find(s => s.id === parseInt(val));
                            if (sess) setSettingsForm(prev => ({ ...prev, active_session: sess.session_name }));
                          }
                        }}
                        style={{ flex: 1 }}
                      >
                        <option value="">-- Choose School Year --</option>
                        {sessions.map((s, idx) => (
                          <option key={idx} value={s.id}>
                            {s.session_name} {s.is_current ? '(Current Year)' : '(Past Year)'}
                          </option>
                        ))}
                      </select>
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={() => setShowSessionModal(true)}
                        style={{ padding: '0 15px', fontWeight: 'bold' }}
                        title="Add New School Year"
                      >
                        + New Year
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Current School Term</label>
                    <select
                      className="form-control"
                      value={settingsForm.active_term}
                      onChange={(e) => setSettingsForm({ ...settingsForm, active_term: e.target.value })}
                    >
                      <option value="1st Term">1st Term</option>
                      <option value="2nd Term">2nd Term</option>
                      <option value="3rd Term">3rd Term</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Allow Teachers to Enter Grades?</label>
                    <select
                      className="form-control"
                      value={String(settingsForm.result_entry_open)}
                      onChange={(e) => setSettingsForm({ ...settingsForm, result_entry_open: parseInt(e.target.value) })}
                    >
                      <option value="1">Yes — Open (Teachers can type and edit marks)</option>
                      <option value="0">No — Locked (Marks entry is closed)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>Save School Year Settings</button>
              </form>
            </div>
          )}

          {/* Sub-Tab 2: Report Card Display */}
          {settingsSubTab === 'reports' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>Report Card Display & Signature Settings</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
                Choose what information shows on student report cards and customize test column headers and official remarks.
              </p>

              <form onSubmit={handleUpdateSettings}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                  
                  <div className="form-group">
                    <label>Show Student Rank in Class?</label>
                    <select
                      className="form-control"
                      value={String(settingsForm.result_show_position)}
                      onChange={(e) => setSettingsForm({ ...settingsForm, result_show_position: parseInt(e.target.value) })}
                    >
                      <option value="1">Yes — Show student rank (e.g. 1st, 2nd, 3rd)</option>
                      <option value="0">No — Hide rank on report cards</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Show Class Average Score?</label>
                    <select
                      className="form-control"
                      value={String(settingsForm.result_show_average)}
                      onChange={(e) => setSettingsForm({ ...settingsForm, result_show_average: parseInt(e.target.value) })}
                    >
                      <option value="1">Yes — Show overall class average mark</option>
                      <option value="0">No — Hide class average mark</option>
                    </select>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: 'var(--primary)' }}>Test & Exam Column Names</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.8rem' }}>1st Test Column</label>
                      <input type="text" className="form-control" value={settingsForm.ca1_name} onChange={e => setSettingsForm({ ...settingsForm, ca1_name: e.target.value })} placeholder="CA 1" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.8rem' }}>2nd Test Column</label>
                      <input type="text" className="form-control" value={settingsForm.ca2_name} onChange={e => setSettingsForm({ ...settingsForm, ca2_name: e.target.value })} placeholder="CA 2" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.8rem' }}>3rd Test Column</label>
                      <input type="text" className="form-control" value={settingsForm.ca3_name} onChange={e => setSettingsForm({ ...settingsForm, ca3_name: e.target.value })} placeholder="CA 3" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.8rem' }}>4th Test Column</label>
                      <input type="text" className="form-control" value={settingsForm.ca4_name} onChange={e => setSettingsForm({ ...settingsForm, ca4_name: e.target.value })} placeholder="CA 4" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.8rem' }}>Final Exam Column</label>
                      <input type="text" className="form-control" value={settingsForm.exam_name} onChange={e => setSettingsForm({ ...settingsForm, exam_name: e.target.value })} placeholder="Exam" />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: 'var(--primary)' }}>Official Signatures & Dates</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Sports Master / Coach Name</label>
                      <input type="text" className="form-control" value={settingsForm.games_master_name} onChange={e => setSettingsForm({ ...settingsForm, games_master_name: e.target.value })} placeholder="e.g. A. K. Bello" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Sports Master Note / Comment</label>
                      <input type="text" className="form-control" value={settingsForm.games_master_remark} onChange={e => setSettingsForm({ ...settingsForm, games_master_remark: e.target.value })} placeholder="e.g. Active in school sports." />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>House Master / Advisor Name</label>
                      <input type="text" className="form-control" value={settingsForm.house_master_name} onChange={e => setSettingsForm({ ...settingsForm, house_master_name: e.target.value })} placeholder="e.g. S. Ibrahim" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>House Master Note / Comment</label>
                      <input type="text" className="form-control" value={settingsForm.house_master_remark} onChange={e => setSettingsForm({ ...settingsForm, house_master_remark: e.target.value })} placeholder="e.g. Disciplined student." />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Principal / Headmaster Name</label>
                      <input type="text" className="form-control" value={settingsForm.principal_name} onChange={e => setSettingsForm({ ...settingsForm, principal_name: e.target.value })} placeholder="e.g. Principal Stamp (JMA)" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Tuition Fee for Next Term (₦)</label>
                      <input type="text" className="form-control" value={settingsForm.next_term_fee} onChange={e => setSettingsForm({ ...settingsForm, next_term_fee: e.target.value })} placeholder="e.g. ₦45,000.00" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Next Term Opening Date</label>
                      <input type="text" className="form-control" value={settingsForm.next_term_begins} onChange={e => setSettingsForm({ ...settingsForm, next_term_begins: e.target.value })} placeholder="e.g. 13/04/2026" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Next Term Closing Date</label>
                      <input type="text" className="form-control" value={settingsForm.next_term_ends} onChange={e => setSettingsForm({ ...settingsForm, next_term_ends: e.target.value })} placeholder="e.g. 24/07/2026" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Unpaid Balance Carryover (₦)</label>
                      <input type="text" className="form-control" value={settingsForm.last_term_debit} onChange={e => setSettingsForm({ ...settingsForm, last_term_debit: e.target.value })} placeholder="e.g. ₦0.00" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>Save Report Card Settings</button>
              </form>
            </div>
          )}

          {/* Sub-Tab 3: Website Details */}
          {settingsSubTab === 'website' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>Website & School Information</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
                Update the school name, website homepage greeting, address, and public contact information.
              </p>

              <form onSubmit={handleUpdateSettings}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Official School Name</label>
                    <input type="text" className="form-control" value={settingsForm.landing_school_name} onChange={e => setSettingsForm({ ...settingsForm, landing_school_name: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>School Motto / Tagline</label>
                    <input type="text" className="form-control" value={settingsForm.landing_tagline} onChange={e => setSettingsForm({ ...settingsForm, landing_tagline: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Homepage Banner Title</label>
                  <input type="text" className="form-control" value={settingsForm.landing_hero_title} onChange={e => setSettingsForm({ ...settingsForm, landing_hero_title: e.target.value })} />
                </div>

                <div className="form-group">
                  <label>Homepage Welcome Message</label>
                  <textarea className="form-control" style={{ minHeight: '80px', fontFamily: 'inherit' }} value={settingsForm.landing_hero_desc} onChange={e => setSettingsForm({ ...settingsForm, landing_hero_desc: e.target.value })} />
                </div>

                <div className="form-group">
                  <label>School Physical Address</label>
                  <input type="text" className="form-control" value={settingsForm.landing_address} onChange={e => setSettingsForm({ ...settingsForm, landing_address: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Contact Phone Number</label>
                    <input type="text" className="form-control" value={settingsForm.contact_phone} onChange={e => setSettingsForm({ ...settingsForm, contact_phone: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Contact Email Address</label>
                    <input type="email" className="form-control" value={settingsForm.contact_email} onChange={e => setSettingsForm({ ...settingsForm, contact_email: e.target.value })} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>Save Website Information</button>
              </form>
            </div>
          )}

          {/* Sub-Tab: Psychomotor Skills */}
          {settingsSubTab === 'skills' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>Affective & Psychomotor Skills</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
                Manage behavioral traits and skills evaluated by form masters for students' report cards.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div style={{ padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                  <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>Add New Skill</h4>
                  <form onSubmit={handleSkillCreate}>
                    <div className="form-group">
                      <label>Skill Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Punctuality" 
                        required 
                        value={skillForm.name}
                        onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select 
                        className="form-control" 
                        value={skillForm.category}
                        onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                      >
                        <option value="AFFECTIVE">Affective Domain (Character)</option>
                        <option value="PSYCHOMOTOR">Psychomotor Domain (Skills)</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Skill</button>
                  </form>
                </div>
                
                <div>
                  <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>Existing Skills</h4>
                  <div className="table-container" style={{ margin: 0, maxHeight: '400px', overflowY: 'auto' }}>
                    <table className="school-table" style={{ margin: 0 }}>
                      <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                        <tr>
                          <th>Skill Name</th>
                          <th>Category</th>
                          <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {skills.length === 0 ? (
                          <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No skills found.</td></tr>
                        ) : (
                          skills.map(s => (
                            <tr key={s.id}>
                              <td>{s.name}</td>
                              <td><span className="badge" style={{ backgroundColor: s.category === 'AFFECTIVE' ? '#e0f2fe' : '#fef3c7', color: s.category === 'AFFECTIVE' ? '#075985' : '#92400e' }}>{s.category}</span></td>
                              <td style={{ textAlign: 'center' }}>
                                <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleSkillDelete(s.id)}>Delete</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 4: Move Students Up */}
          {settingsSubTab === 'promotion' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>Move Students to Next Class</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
                Promote a whole class of students up to their new class for the new school year. Student past grade records stay safely saved in their timeline.
              </p>

              <form onSubmit={handlePromotionBulk} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Current Class</label>
                  <select
                    className="form-control"
                    value={promoSource}
                    onChange={(e) => setPromoSource(e.target.value)}
                    required
                  >
                    <option value="">Select current class...</option>
                    {classes.map((c, idx) => (
                      <option key={idx} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>New Class</label>
                  <select
                    className="form-control"
                    value={promoTarget}
                    onChange={(e) => setPromoTarget(e.target.value)}
                    required
                  >
                    <option value="">Select new class...</option>
                    <option value="graduate">Graduate (Finished School) 🎓</option>
                    {classes.map((c, idx) => (
                      <option key={idx} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-danger" style={{ padding: '10px 20px' }}>
                  Move Students Up ➔
                </button>
              </form>
            </div>
          )}

        </div>
      )}

      {/* =======================================================
          TAB 8: ATTENDANCE MANAGEMENT (ADMIN)
          ======================================================= */}
      {activeSubTab === 'attendance' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
          
          {/* Sub Navigation for Attendance */}
          <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }} className="no-print">
            <button
              onClick={() => setActiveAdminAttendanceSubTab('mark')}
              style={{
                padding: '10px 15px',
                background: 'none',
                border: 'none',
                borderBottom: activeAdminAttendanceSubTab === 'mark' ? '2.5px solid var(--primary)' : 'none',
                color: activeAdminAttendanceSubTab === 'mark' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              Mark Attendance
            </button>
            <button
              onClick={() => setActiveAdminAttendanceSubTab('report')}
              style={{
                padding: '10px 15px',
                background: 'none',
                border: 'none',
                borderBottom: activeAdminAttendanceSubTab === 'report' ? '2.5px solid var(--primary)' : 'none',
                color: activeAdminAttendanceSubTab === 'report' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              Attendance Report
            </button>
          </div>

          {activeAdminAttendanceSubTab === 'mark' ? (
            <>
              <h3>Class Attendance Management</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                Select a class and date to view or mark attendance roster.
              </p>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }} className="no-print">
                <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
                  <label>Select Class Arm</label>
                  <select
                    className="form-control"
                    value={adminAttendanceClass}
                    onChange={(e) => setAdminAttendanceClass(e.target.value)}
                  >
                    <option value="">Choose Class...</option>
                    {classes.map((cls, idx) => (
                      <option key={idx} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
                  <label>Attendance Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={adminAttendanceDate}
                    onChange={(e) => setAdminAttendanceDate(e.target.value)}
                  />
                </div>
              </div>

              {!adminAttendanceClass ? (
                <p style={{ color: 'var(--text-muted)' }}>Please select a class stream to manage attendance roster.</p>
              ) : (
                <div>
                  <div className="table-container">
                    <table className="school-table">
                      <thead>
                        <tr>
                          <th>Admission Number</th>
                          <th>Student Name</th>
                          <th>Attendance Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminAttendanceRoster.length === 0 ? (
                          <tr>
                            <td colSpan={3} style={{ textAlign: 'center' }}>No students enrolled in this class.</td>
                          </tr>
                        ) : (
                          adminAttendanceRoster.map((item, idx) => (
                            <tr key={idx}>
                              <td><code>{item.admission_number}</code></td>
                              <td style={{ fontWeight: '600' }}>{item.full_name}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleAdminAttendanceStatusChange(item.student_id, 'present')}
                                    className="btn"
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '0.8rem',
                                      backgroundColor: item.status === 'present' || !item.status ? 'var(--success)' : 'transparent',
                                      color: item.status === 'present' || !item.status ? '#fff' : 'var(--success)',
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
                                    onClick={() => handleAdminAttendanceStatusChange(item.student_id, 'absent')}
                                    className="btn"
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '0.8rem',
                                      backgroundColor: item.status === 'absent' ? 'var(--danger)' : 'transparent',
                                      color: item.status === 'absent' ? '#fff' : 'var(--danger)',
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
                                    onClick={() => handleAdminAttendanceStatusChange(item.student_id, 'late')}
                                    className="btn"
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '0.8rem',
                                      backgroundColor: item.status === 'late' ? 'var(--warning)' : 'transparent',
                                      color: item.status === 'late' ? '#fff' : 'var(--warning)',
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
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {adminAttendanceRoster.length > 0 && (
                    <button
                      className="btn btn-primary"
                      style={{ marginTop: '20px', width: '200px' }}
                      onClick={handleSaveAdminAttendance}
                    >
                      Save Attendance
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <h3>Attendance Summary Report</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                View cumulative class attendance tallies by date range.
              </p>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }} className="no-print">
                <div className="form-group" style={{ margin: 0, minWidth: '180px' }}>
                  <label>Select Class</label>
                  <select
                    className="form-control"
                    value={adminReportClassId}
                    onChange={(e) => setAdminReportClassId(e.target.value)}
                  >
                    <option value="">Choose Class...</option>
                    {classes.map((cls, idx) => (
                      <option key={idx} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>From Date</label>
                  <input
                    type="date"
                    className="form-control"
                    style={{ width: '150px' }}
                    value={adminReportStartDate}
                    onChange={(e) => setAdminReportStartDate(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>To Date</label>
                  <input
                    type="date"
                    className="form-control"
                    style={{ width: '150px' }}
                    value={adminReportEndDate}
                    onChange={(e) => setAdminReportEndDate(e.target.value)}
                  />
                </div>

                <button className="btn btn-secondary" onClick={() => window.print()}>Print Report</button>
              </div>

              {!adminReportClassId ? (
                <p style={{ color: 'var(--text-muted)' }}>Please select a class stream to load report summary.</p>
              ) : (
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
                      {adminAttendanceReport.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No attendance records found.</td>
                        </tr>
                      ) : (
                        adminAttendanceReport.map((r, idx) => {
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
              )}
            </>
          )}
        </div>
      )}

      {/* =======================================================
          TAB 9: SCHEME OF WORK MANAGEMENT (ADMIN)
          ======================================================= */}
      {activeSubTab === 'schemes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Filter Bar */}
          <div className="glass-panel" style={{ padding: '20px', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Scheme of Work Manager</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '4px 0 0 0' }}>Create and edit the weekly course outline for any class subject.</p>
              </div>
              {adminSchemeClass && adminSchemeSubject && (
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
              <div className="form-group" style={{ margin: 0, flex: '1 1 180px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Class Arm</label>
                <select
                  className="form-control"
                  value={adminSchemeClass}
                  onChange={(e) => setAdminSchemeClass(e.target.value)}
                >
                  <option value="">Choose Class...</option>
                  {classes.map((cls, idx) => (
                    <option key={idx} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0, flex: '1 1 180px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Subject</label>
                <select
                  className="form-control"
                  value={adminSchemeSubject}
                  onChange={(e) => setAdminSchemeSubject(e.target.value)}
                >
                  <option value="">Choose Subject...</option>
                  {classSubjects
                    .filter(cs => cs.class_id === parseInt(adminSchemeClass))
                    .map((cs, idx) => (
                      <option key={idx} value={cs.subject_id}>{cs.subject_name}</option>
                    ))
                  }
                </select>
              </div>
              <div className="form-group" style={{ margin: 0, flex: '1 1 150px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Term</label>
                <select
                  className="form-control"
                  value={adminSchemeTerm}
                  onChange={(e) => setAdminSchemeTerm(e.target.value)}
                >
                  <option value="1st Term">1st Term</option>
                  <option value="2nd Term">2nd Term</option>
                  <option value="3rd Term">3rd Term</option>
                </select>
              </div>
            </div>
          </div>

          {/* Scheme Table */}
          {!adminSchemeClass || !adminSchemeSubject ? (
            <div className="glass-panel" style={{ padding: '40px', backgroundColor: 'var(--bg-surface)', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📋</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Select a class and subject above to manage the scheme of work.</p>
            </div>
          ) : (
            <div className="glass-panel" style={{ backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
              {/* Table Header Info */}
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
                      {classSubjects.find(cs => cs.class_id === parseInt(adminSchemeClass) && cs.subject_id === parseInt(adminSchemeSubject))?.subject_name || 'Subject'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {classes.find(c => c.id === parseInt(adminSchemeClass))?.name || 'Class'} · {adminSchemeTerm}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600', backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
                    {adminSchemeWeeks.filter(w => w.topic).length} / 12 Weeks Filled
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="table-container" style={{ margin: 0, borderRadius: 0 }}>
                <table className="school-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '80px', textAlign: 'center' }}>Week</th>
                      <th style={{ width: '35%' }}>Topic / Content</th>
                      <th>Learning Objectives / Remarks</th>
                      <th style={{ width: '130px', textAlign: 'center' }} className="no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminSchemeWeeks.map((w, idx) => (
                      <tr key={idx} style={{ backgroundColor: w.topic ? 'transparent' : 'rgba(var(--danger-rgb, 255,59,48), 0.03)' }}>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', borderRadius: '50%',
                            backgroundColor: w.topic ? 'var(--primary)' : 'var(--border-color)',
                            color: w.topic ? '#fff' : 'var(--text-muted)',
                            fontWeight: '700', fontSize: '0.8rem'
                          }}>{w.week}</span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <input
                            type="text"
                            className="form-control"
                            style={{ fontSize: '0.88rem', padding: '8px 10px', margin: 0 }}
                            placeholder="e.g. Introduction to Algebra"
                            value={w.topic}
                            onChange={(e) => handleAdminSchemeFieldChange(w.week, 'topic', e.target.value)}
                          />
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <input
                            type="text"
                            className="form-control"
                            style={{ fontSize: '0.88rem', padding: '8px 10px', margin: 0 }}
                            placeholder="e.g. Students will be able to..."
                            value={w.objectives}
                            onChange={(e) => handleAdminSchemeFieldChange(w.week, 'objectives', e.target.value)}
                          />
                        </td>
                        <td style={{ textAlign: 'center', padding: '10px 12px' }} className="no-print">
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                              onClick={() => handleSaveAdminSchemeWeek(w)}
                            >
                              Save
                            </button>
                            {(w.id || w.topic || w.objectives) && (
                              <button
                                className="btn btn-danger"
                                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                onClick={() => handleDeleteAdminSchemeWeek(w)}
                                title="Clear this week"
                              >
                                ✕
                              </button>
                            )}
                          </div>
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

      {/* =======================================================
          MODAL: STUDENT REGISTRATION FORM
          ======================================================= */}
      {showStudentModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowStudentModal(false)}>✕</button>
            <h3>Register Student</h3>
            
            <form onSubmit={handleStudentRegister} style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => seedMockPassport('student')}>
                  📸 Seed Student Photo
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" className="form-control" required value={studentForm.full_name} onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" className="form-control" required value={studentForm.username} onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Class of Entry</label>
                  <select className="form-control" required value={studentForm.class_id} onChange={(e) => setStudentForm({ ...studentForm, class_id: e.target.value })}>
                    <option value="">Select class...</option>
                    {classes.map((c, idx) => (
                      <option key={idx} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" className="form-control" value={studentForm.date_of_birth} onChange={(e) => setStudentForm({ ...studentForm, date_of_birth: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Sex</label>
                  <select className="form-control" value={studentForm.sex} onChange={(e) => setStudentForm({ ...studentForm, sex: e.target.value })}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Religion</label>
                  <select className="form-control" value={studentForm.religion} onChange={(e) => setStudentForm({ ...studentForm, religion: e.target.value })}>
                    <option value="Islam">Islam</option>
                    <option value="Christianity">Christianity</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>LGA of Origin</label>
                  <input type="text" className="form-control" value={studentForm.local_government} onChange={(e) => setStudentForm({ ...studentForm, local_government: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>State of Origin</label>
                  <input type="text" className="form-control" value={studentForm.state_of_origin} onChange={(e) => setStudentForm({ ...studentForm, state_of_origin: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={studentForm.handicapped} onChange={(e) => setStudentForm({ ...studentForm, handicapped: e.target.checked })} />
                  Is student handicapped?
                </label>
                {studentForm.handicapped && (
                  <input type="text" className="form-control" placeholder="Specify handicap details..." value={studentForm.handicap_details} onChange={(e) => setStudentForm({ ...studentForm, handicap_details: e.target.value })} />
                )}
              </div>

              <hr style={{ margin: '20px 0', borderColor: 'var(--border-color)' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Parent / Guardian Name</label>
                  <input type="text" className="form-control" value={studentForm.parent_name} onChange={(e) => setStudentForm({ ...studentForm, parent_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Parent Phone Number</label>
                  <input type="text" className="form-control" value={studentForm.parent_phone} onChange={(e) => setStudentForm({ ...studentForm, parent_phone: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Parent Home Address</label>
                <textarea className="form-control" value={studentForm.parent_address} onChange={(e) => setStudentForm({ ...studentForm, parent_address: e.target.value })} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Student</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: TEACHER REGISTRATION FORM
          ======================================================= */}
      {showTeacherModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowTeacherModal(false)}>✕</button>
            <h3>Register Teacher</h3>

            <form onSubmit={handleTeacherRegister} style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => seedMockPassport('teacher')}>
                  📸 Add Photo
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Surname</label>
                  <input type="text" className="form-control" required value={teacherForm.surname} onChange={(e) => setTeacherForm({ ...teacherForm, surname: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" className="form-control" required value={teacherForm.first_name} onChange={(e) => setTeacherForm({ ...teacherForm, first_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Other Names</label>
                  <input type="text" className="form-control" value={teacherForm.other_names} onChange={(e) => setTeacherForm({ ...teacherForm, other_names: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Display Full Name</label>
                <input type="text" className="form-control" required placeholder="e.g. Mr. John Doe" value={teacherForm.full_name} onChange={(e) => setTeacherForm({ ...teacherForm, full_name: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Username (For Login)</label>
                  <input type="text" className="form-control" required value={teacherForm.username} onChange={(e) => setTeacherForm({ ...teacherForm, username: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="form-control" value={teacherForm.email} onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Home Address</label>
                <input type="text" className="form-control" value={teacherForm.address} onChange={(e) => setTeacherForm({ ...teacherForm, address: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>State of Residence</label>
                  <input type="text" className="form-control" value={teacherForm.state_of_residence} onChange={(e) => setTeacherForm({ ...teacherForm, state_of_residence: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>LGA of Residence</label>
                  <input type="text" className="form-control" value={teacherForm.lga_of_residence} onChange={(e) => setTeacherForm({ ...teacherForm, lga_of_residence: e.target.value })} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Digital Signature</span>
                  <label className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem', margin: 0, cursor: 'pointer' }}>
                    Upload Image
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setTeacherForm({ ...teacherForm, signature: reader.result });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </label>
                {teacherForm.signature && teacherForm.signature.startsWith('data:image') ? (
                  <div style={{ position: 'relative', display: 'inline-block', marginTop: '8px' }}>
                    <img src={teacherForm.signature} alt="Signature" style={{ height: '60px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#fff' }} />
                    <button 
                      type="button" 
                      style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'red', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', width: '20px', height: '20px', fontSize: '12px', lineHeight: '20px' }}
                      onClick={() => setTeacherForm({ ...teacherForm, signature: '' })}
                    >✕</button>
                  </div>
                ) : (
                  <div style={{ marginTop: '8px' }}>
                    <SignaturePad onSave={(dataUrl) => setTeacherForm({ ...teacherForm, signature: dataUrl })} />
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Save Teacher</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: CREATE CLASS
          ======================================================= */}
      {showClassModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowClassModal(false)}>✕</button>
            <h3>Create Class</h3>
            <form onSubmit={handleClassCreate} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Class Name</label>
                <input type="text" className="form-control" placeholder="e.g. Nursery 3 or Primary 2" required value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>School Level</label>
                <select className="form-control" value={classForm.tier} onChange={(e) => setClassForm({ ...classForm, tier: e.target.value })}>
                  <option value="nursery">Nursery School (Nursery 1-3)</option>
                  <option value="primary">Primary School (Primary 1-6)</option>
                  <option value="jss">Junior Secondary (JSS)</option>
                  <option value="sss">Senior Secondary (SSS)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Class</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: ADD SUBJECT
          ======================================================= */}
      {showSubjectModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowSubjectModal(false)}>✕</button>
            <h3>Add Subject</h3>
            <form onSubmit={handleSubjectCreate} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Subject Name</label>
                <input type="text" className="form-control" placeholder="e.g. Basic Science" required value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>School Level</label>
                <select className="form-control" value={subjectForm.tier} onChange={(e) => setSubjectForm({ ...subjectForm, tier: e.target.value })}>
                  <option value="universal">Universal (All Tiers)</option>
                  <option value="nursery">Nursery School (Nursery 1-3)</option>
                  <option value="primary">Primary School (Primary 1-6)</option>
                  <option value="jss">Junior Secondary (JSS)</option>
                  <option value="sss">Senior Secondary (SSS)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Map to Classes (Optional)</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('all')}>All Classes</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('nursery')}>All Nursery</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('primary')}>All Primary</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('jss')}>All JSS</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('sss')}>All SSS</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => setSubjectForm(prev => ({ ...prev, class_ids: [] }))}>Clear</button>
                </div>
                <div className="checkbox-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '4px' }}>
                  {classes.map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={subjectForm.class_ids.includes(c.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSubjectForm(prev => {
                            const newIds = checked 
                              ? [...prev.class_ids, c.id]
                              : prev.class_ids.filter(id => id !== c.id);
                            return { ...prev, class_ids: newIds };
                          });
                        }} 
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Subject</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: MAP SUBJECT TEACHER
          ======================================================= */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowAssignModal(false)}>✕</button>
            <h3>Assign Teacher to Class</h3>
            <form onSubmit={handleAssignTeacher} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Select Classes to Map (Check all that apply)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxHeight: '180px', overflowY: 'auto', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  {classes.map((c, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        value={c.id} 
                        checked={assignForm.class_ids.includes(c.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setAssignForm(prev => {
                            const newIds = checked 
                              ? [...prev.class_ids, c.id]
                              : prev.class_ids.filter(id => id !== c.id);
                            return { ...prev, class_ids: newIds };
                          });
                        }} 
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <select className="form-control" required value={assignForm.subject_id} onChange={(e) => setAssignForm({ ...assignForm, subject_id: e.target.value })}>
                  <option value="">Select Subject...</option>
                  {subjects.map((s, idx) => (
                    <option key={idx} value={s.id}>{s.name} ({s.tier})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Teacher</label>
                <select className="form-control" required value={assignForm.teacher_id} onChange={(e) => setAssignForm({ ...assignForm, teacher_id: e.target.value })}>
                  <option value="">Select Teacher...</option>
                  {teachers.map((t, idx) => (
                    <option key={idx} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Assignment</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: POST TERMLY FEE
          ======================================================= */}
      {showFeeModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowFeeModal(false)}>✕</button>
            <h3>Bill Students</h3>
            
            <form onSubmit={handleFeeInvoiceCreate} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Fee Description</label>
                <input type="text" className="form-control" placeholder="e.g. Tuition Fee 3rd Term" required value={feeForm.title} onChange={(e) => setFeeForm({ ...feeForm, title: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Amount (₦)</label>
                <input type="number" className="form-control" placeholder="Amount in Naira" required value={feeForm.amount} onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })} />
              </div>

              <div style={{ border: '1px solid var(--border-color)', padding: '15px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.85rem', display: 'block', marginBottom: '10px' }}>WHO SHOULD PAY? (Choose One)</span>
                
                <div className="form-group">
                  <label>Option A: Single Class</label>
                  <select className="form-control" value={feeForm.class_id} onChange={(e) => setFeeForm({ ...feeForm, class_id: e.target.value, tier: '' })}>
                    <option value="">Choose Class...</option>
                    {classes.map((c, idx) => (
                      <option key={idx} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label>Option B: Entire School Level</label>
                  <select className="form-control" value={feeForm.tier} onChange={(e) => setFeeForm({ ...feeForm, tier: e.target.value, class_id: '' })}>
                    <option value="">Choose School Level...</option>
                    <option value="nursery">Nursery School (Nursery 1-3)</option>
                    <option value="primary">Primary School (Primary 1-6)</option>
                    <option value="jss">Junior Secondary (JSS)</option>
                    <option value="sss">Senior Secondary (SSS)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Fees</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: LOG OFFLINE CASH PAYMENT
          ======================================================= */}
      {showPayModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowPayModal(false)}>✕</button>
            <h3>Record Fee Payment</h3>
            
            <form onSubmit={handleLogPayment} style={{ marginTop: '20px' }}>
              <p style={{ marginBottom: '15px' }}>
                Record payment for student: <strong>{payForm.student_name}</strong>
              </p>
              
              <div className="form-group">
                <label>Amount Paid (₦)</label>
                <input type="number" className="form-control" value={payForm.amount_paid} onChange={(e) => setPayForm({ ...payForm, amount_paid: e.target.value })} required />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select className="form-control" value={payForm.payment_method} onChange={(e) => setPayForm({ ...payForm, payment_method: e.target.value })}>
                  <option value="Cash">Cash</option>
                  <option value="Transfer">Bank Transfer</option>
                  <option value="Bank Draft">Bank Draft</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Payment & Print Receipt</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          CLICKABLE PROFILE VIEWER
          ======================================================= */}
      {selectedStudentForForm && (
        <StudentRegistrationForm
          student={selectedStudentForForm}
          onClose={() => setSelectedStudentForForm(null)}
          onUpdate={() => { setSelectedStudentForForm(null); loadAllData(); }}
        />
      )}

      {selectedTeacherForProfile && (
        <TeacherProfileCard
          teacher={selectedTeacherForProfile}
          onClose={() => setSelectedTeacherForProfile(null)}
          onUpdate={() => { setSelectedTeacherForProfile(null); loadAllData(); }}
        />
      )}

      {/* =======================================================
          MODAL: CREATE ACADEMIC SESSION
          ======================================================= */}
      {showSessionModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowSessionModal(false)}>✕</button>
            <h3>Create Academic Session</h3>
            <form onSubmit={handleCreateSession} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Session Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. 2026/2027" 
                  required 
                  value={newSessionName} 
                  onChange={(e) => setNewSessionName(e.target.value)} 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Session</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: EDIT SUBJECT DETAILS
          ======================================================= */}
      {showEditSubjectModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowEditSubjectModal(false)}>✕</button>
            <h3>Edit Subject Details</h3>
            <form onSubmit={handleEditSubjectSubmit} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Subject Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={subjectEditForm.name} 
                  onChange={(e) => setSubjectEditForm({ ...subjectEditForm, name: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>School Level</label>
                <select 
                  className="form-control" 
                  value={subjectEditForm.tier} 
                  onChange={(e) => setSubjectEditForm({ ...subjectEditForm, tier: e.target.value })}
                >
                  <option value="universal">Universal (All Tiers)</option>
                  <option value="nursery">Nursery School (Nursery 1-3)</option>
                  <option value="primary">Primary School (Primary 1-6)</option>
                  <option value="jss">Junior Secondary (JSS)</option>
                  <option value="sss">Senior Secondary (SSS)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Map to Classes (Optional)</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('all', true)}>All Classes</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('nursery', true)}>All Nursery</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('primary', true)}>All Primary</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('jss', true)}>All JSS</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('sss', true)}>All SSS</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => setSubjectEditForm(prev => ({ ...prev, class_ids: [] }))}>Clear</button>
                </div>
                <div className="checkbox-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '4px' }}>
                  {classes.map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={subjectEditForm.class_ids && subjectEditForm.class_ids.includes(c.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSubjectEditForm(prev => {
                            const newIds = checked 
                              ? [...(prev.class_ids || []), c.id]
                              : (prev.class_ids || []).filter(id => id !== c.id);
                            return { ...prev, class_ids: newIds };
                          });
                        }} 
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: ADD FEE STRUCTURE
          ======================================================= */}
      {showFeeStructureModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowFeeStructureModal(false)}>✕</button>
            <h3>Add Fee Structure</h3>
            <form onSubmit={handleCreateFeeStructure} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Fee Title / Description</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Nursery 2 Tuition Fee" 
                  required 
                  value={newFeeStructureForm.title} 
                  onChange={(e) => setNewFeeStructureForm({ ...newFeeStructureForm, title: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>Amount (₦)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="e.g. 35000" 
                  required 
                  value={newFeeStructureForm.amount} 
                  onChange={(e) => setNewFeeStructureForm({ ...newFeeStructureForm, amount: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>School Level</label>
                <select 
                  className="form-control" 
                  value={newFeeStructureForm.tier} 
                  onChange={(e) => setNewFeeStructureForm({ ...newFeeStructureForm, tier: e.target.value })}
                >
                  <option value="nursery">Nursery School (Nursery 1-3)</option>
                  <option value="primary">Primary School (Primary 1-6)</option>
                  <option value="jss">Junior Secondary (JSS)</option>
                  <option value="sss">Senior Secondary (SSS)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Structure</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: STUDENT PAYMENT HISTORY & RECEIPTS LOG
          ======================================================= */}
      {selectedStudentForHistory && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '850px', backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close no-print" onClick={() => setSelectedStudentForHistory(null)}>✕</button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                💳
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Payment History — {selectedStudentForHistory.full_name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '3px 0 0 0' }}>
                  Admission ID: <code>{selectedStudentForHistory.admission_number}</code> | Class: <strong>{selectedStudentForHistory.class_name || 'Unassigned'}</strong>
                </p>
              </div>
            </div>

            {loadingStudentHistory ? (
              <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading student payment ledger...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Mini Financial Tally */}
                {(() => {
                  const invs = studentHistoryData.invoices || [];
                  const recs = studentHistoryData.receipts || [];
                  const totalBilled = invs.reduce((sum, i) => sum + (i.amount_due || 0), 0);
                  const totalPaid = invs.reduce((sum, i) => sum + (i.amount_paid || 0), 0);
                  const balanceOwed = Math.max(0, totalBilled - totalPaid);

                  return (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                        <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', borderLeft: '4px solid var(--primary)' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Billed</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>
                            ₦{totalBilled.toLocaleString()}
                          </div>
                        </div>
                        <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--success-light)', borderLeft: '4px solid var(--success)' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Paid</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--success)', marginTop: '4px' }}>
                            ₦{totalPaid.toLocaleString()}
                          </div>
                        </div>
                        <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--danger-light)', borderLeft: '4px solid var(--danger)' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Balance Owed</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--danger)', marginTop: '4px' }}>
                            ₦{balanceOwed.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Section 1: Invoices Breakdown */}
                      <div>
                        <h4 style={{ fontSize: '0.95rem', marginBottom: '10px', color: 'var(--text-primary)' }}>📜 Fee Invoices Billed</h4>
                        <div className="table-container" style={{ margin: 0 }}>
                          <table className="school-table" style={{ margin: 0 }}>
                            <thead>
                              <tr>
                                <th>Fee Title</th>
                                <th style={{ textAlign: 'right' }}>Billed</th>
                                <th style={{ textAlign: 'right' }}>Paid</th>
                                <th style={{ textAlign: 'right' }}>Remaining</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th style={{ textAlign: 'center' }} className="no-print">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {invs.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No invoices issued yet.</td></tr>
                              ) : (
                                invs.map((inv, idx) => {
                                  const rem = inv.amount_due - inv.amount_paid;
                                  return (
                                    <tr key={idx}>
                                      <td style={{ fontWeight: '600' }}>{inv.title}</td>
                                      <td style={{ textAlign: 'right', fontWeight: '600' }}>₦{inv.amount_due.toLocaleString()}</td>
                                      <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 'bold' }}>₦{inv.amount_paid.toLocaleString()}</td>
                                      <td style={{ textAlign: 'right', color: rem > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 'bold' }}>
                                        ₦{rem.toLocaleString()}
                                      </td>
                                      <td style={{ textAlign: 'center' }}>
                                        <span className={`badge ${inv.status === 'paid' ? 'badge-success' : inv.status === 'partial' ? 'badge-warning' : 'badge-danger'}`}>
                                          {inv.status}
                                        </span>
                                      </td>
                                      <td style={{ textAlign: 'center' }} className="no-print">
                                        {inv.status !== 'paid' && (
                                          <button
                                            className="btn btn-primary"
                                            style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                                            onClick={() => {
                                              setSelectedStudentForHistory(null);
                                              setPayForm({
                                                invoice_id: inv.id,
                                                amount_paid: inv.amount_due - inv.amount_paid,
                                                payment_method: 'Cash',
                                                student_name: selectedStudentForHistory.full_name
                                              });
                                              setShowPayModal(true);
                                            }}
                                          >
                                            Log Payment
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Section 2: Payment Receipts History */}
                      <div>
                        <h4 style={{ fontSize: '0.95rem', marginBottom: '10px', color: 'var(--text-primary)' }}>🧾 Payment Receipts History</h4>
                        <div className="table-container" style={{ margin: 0 }}>
                          <table className="school-table" style={{ margin: 0 }}>
                            <thead>
                              <tr>
                                <th>Receipt #</th>
                                <th>Date</th>
                                <th>Fee Item</th>
                                <th style={{ textAlign: 'right' }}>Amount Paid</th>
                                <th>Method</th>
                                <th>Logged By</th>
                                <th style={{ textAlign: 'center' }} className="no-print">Print Slip</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recs.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No payment receipts recorded yet.</td></tr>
                              ) : (
                                recs.map((rec, idx) => (
                                  <tr key={idx}>
                                    <td><code>{rec.receipt_number}</code></td>
                                    <td>{rec.payment_date}</td>
                                    <td style={{ fontWeight: '500' }}>{rec.title}</td>
                                    <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 'bold' }}>₦{rec.amount_paid.toLocaleString()}</td>
                                    <td><span className="badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{rec.payment_method}</span></td>
                                    <td style={{ fontSize: '0.85rem' }}>{rec.logged_by_name || 'Staff'}</td>
                                    <td style={{ textAlign: 'center' }} className="no-print">
                                      <button
                                        className="btn btn-secondary"
                                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                                        onClick={() => {
                                          setSelectedReceipt({
                                            ...rec,
                                            full_name: selectedStudentForHistory.full_name,
                                            admission_number: selectedStudentForHistory.admission_number,
                                            class_name: selectedStudentForHistory.class_name,
                                            status: rec.amount_paid >= rec.amount_due ? 'paid' : 'partial'
                                          });
                                        }}
                                      >
                                        🖨️ Print Receipt
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  );
                })()}

              </div>
            )}
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: OFFICIAL PAYMENT RECEIPT
          ======================================================= */}
      {selectedReceipt && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '450px', backgroundColor: '#fff', color: '#000' }}>
            <button className="modal-close no-print" onClick={() => setSelectedReceipt(null)} style={{ color: '#000' }}>✕</button>
            
            <div className="print-area" style={{ fontFamily: 'monospace', padding: '10px' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '10px', marginBottom: '15px' }}>
                <h3 style={{ margin: '0' }}>{settingsForm?.landing_school_name || 'Jere Model Academy'}</h3>
                <p style={{ margin: '3px 0', fontSize: '0.8rem' }}>{settingsForm?.landing_tagline || 'KADUNA STATE, NIGERIA'}</p>
                <p style={{ margin: '2px 0', fontSize: '0.75rem', fontWeight: 'bold' }}>OFFICIAL PAYMENT RECEIPT</p>
              </div>

              <div style={{ fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '15px' }}>
                {selectedReceipt.receipt_number && (
                  <div><strong>RECEIPT NO:</strong> {selectedReceipt.receipt_number}</div>
                )}
                <div><strong>DATE:</strong> {selectedReceipt.payment_date || new Date().toLocaleDateString()}</div>
                <div><strong>STUDENT NAME:</strong> {selectedReceipt.full_name || selectedStudentForHistory?.full_name || 'N/A'}</div>
                <div><strong>ADMISSION NO:</strong> {selectedReceipt.admission_number || selectedStudentForHistory?.admission_number || 'N/A'}</div>
                <div><strong>CLASS ARM:</strong> {selectedReceipt.class_name || selectedStudentForHistory?.class_name || 'N/A'}</div>
                <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>
                <div><strong>FEE DESCRIPTION:</strong> {selectedReceipt.title || 'Tuition / School Fee'}</div>
                {selectedReceipt.amount_due && (
                  <div><strong>TOTAL BILLED:</strong> ₦{Number(selectedReceipt.amount_due).toLocaleString()}</div>
                )}
                <div style={{ fontSize: '1.05rem', fontWeight: 'bold', margin: '4px 0' }}>
                  <strong>AMOUNT PAID:</strong> ₦{Number(selectedReceipt.amount_paid).toLocaleString()}
                </div>
                {selectedReceipt.payment_method && (
                  <div><strong>PAYMENT METHOD:</strong> {selectedReceipt.payment_method}</div>
                )}
                {selectedReceipt.amount_due && (
                  <div><strong>BALANCE OWED:</strong> ₦{Math.max(0, Number(selectedReceipt.amount_due) - Number(selectedReceipt.amount_paid)).toLocaleString()}</div>
                )}
                {selectedReceipt.status && (
                  <div><strong>STATUS:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{selectedReceipt.status}</span></div>
                )}
              </div>

              <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '10px', fontSize: '0.75rem', marginTop: '20px' }}>
                <p style={{ margin: '2px 0' }}>~ Thank you for your payment! ~</p>
                <p style={{ margin: '2px 0', color: '#666' }}>Logged by: {selectedReceipt.logged_by_name || 'Accounts Office'}</p>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }} className="no-print">
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => window.print()}>🖨️ Print Slip</button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedReceipt(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Result Printer Modal */}
      {showBulkPrintModal && (
        <BulkResultPrinter
          classes={classes}
          sessions={sessions}
          currentTerm={settings?.active_term}
          currentSession={settings?.active_session}
          settings={settings}
          onClose={() => setShowBulkPrintModal(false)}
        />
      )}
    </div>
  );
}
