const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

function getHeaders() {
  const token = localStorage.getItem('jma_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }
    return data;
  } else {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Server error (${response.status}): ${text.slice(0, 150)}`);
    }
    throw new Error('Server returned non-JSON response');
  }
}

const api = {
  // Authentication
  login: async (identifier, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await handleResponse(res);
    localStorage.setItem('jma_token', data.token);
    return data.user;
  },

  logout: () => {
    localStorage.removeItem('jma_token');
  },

  // System Settings
  getSettings: async () => {
    const res = await fetch(`${API_BASE}/settings`, { headers: getHeaders() });
    return handleResponse(res);
  },

  updateSettings: async (settings) => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(settings)
    });
    return handleResponse(res);
  },

  // Behavioral Skills Management (Affective & Psychomotor)
  getSkills: async (tier) => {
    let url = `${API_BASE}/skills`;
    if (tier) url += `?tier=${tier}`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse(res);
  },
  addSkill: async (skillData) => {
    const res = await fetch(`${API_BASE}/skills`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(skillData)
    });
    return handleResponse(res);
  },
  updateSkill: async (id, skillData) => {
    const res = await fetch(`${API_BASE}/skills/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(skillData)
    });
    return handleResponse(res);
  },
  deleteSkill: async (id, category) => {
    let url = `${API_BASE}/skills/${id}`;
    if (category) url += `?category=${category}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  getSkillsStudents: async (classId, term, session) => {
    const query = new URLSearchParams({ term, session }).toString();
    const res = await fetch(`${API_BASE}/skills/students/${classId}?${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  getStudentSkillsEvaluation: async (studentId, term, session) => {
    const query = new URLSearchParams({ term, session }).toString();
    const res = await fetch(`${API_BASE}/skills/evaluations/${studentId}?${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  saveStudentSkillsEvaluation: async (evaluationData) => {
    const res = await fetch(`${API_BASE}/skills/evaluate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(evaluationData)
    });
    return handleResponse(res);
  },

  // Users Management (Admin)
  getStudents: async () => {
    const res = await fetch(`${API_BASE}/students`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getStudentProfile: async (id) => {
    const res = await fetch(`${API_BASE}/students/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getTeachers: async () => {
    const res = await fetch(`${API_BASE}/teachers`, { headers: getHeaders() });
    return handleResponse(res);
  },

  registerStudent: async (studentData) => {
    const res = await fetch(`${API_BASE}/users/register-student`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(studentData)
    });
    return handleResponse(res);
  },

  updateStudent: async (id, studentData) => {
    const res = await fetch(`${API_BASE}/users/update-student/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(studentData)
    });
    return handleResponse(res);
  },

  updateTeacher: async (id, teacherData) => {
    const res = await fetch(`${API_BASE}/users/update-teacher/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(teacherData)
    });
    return handleResponse(res);
  },

  registerTeacher: async (teacherData) => {
    const res = await fetch(`${API_BASE}/users/register-teacher`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(teacherData)
    });
    return handleResponse(res);
  },

  // Classes & Subjects Configuration
  getClasses: async () => {
    const res = await fetch(`${API_BASE}/classes`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createClass: async (classData) => {
    const res = await fetch(`${API_BASE}/classes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(classData)
    });
    return handleResponse(res);
  },

  editClass: async (id, classData) => {
    const res = await fetch(`${API_BASE}/classes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(classData)
    });
    return handleResponse(res);
  },

  deleteClass: async (id) => {
    const res = await fetch(`${API_BASE}/classes/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  assignFormMaster: async (class_id, teacher_id) => {
    const res = await fetch(`${API_BASE}/classes/assign-form-master`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ class_id, teacher_id })
    });
    return handleResponse(res);
  },

  getSubjects: async () => {
    const res = await fetch(`${API_BASE}/subjects`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createSubject: async (subjectData) => {
    const res = await fetch(`${API_BASE}/subjects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(subjectData)
    });
    return handleResponse(res);
  },

  getClassSubjects: async () => {
    const res = await fetch(`${API_BASE}/class-subjects`, { headers: getHeaders() });
    return handleResponse(res);
  },

  assignSubjectTeacher: async (class_ids, subject_id, teacher_id, overwrite = false) => {
    const res = await fetch(`${API_BASE}/class-subjects/assign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ class_ids, subject_id, teacher_id, overwrite })
    });
    return handleResponse(res);
  },

  getTeacherAssignments: async () => {
    const res = await fetch(`${API_BASE}/teacher/assignments`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Grades entry
  getGradesForEntry: async (classId, subjectId, term, session) => {
    const res = await fetch(`${API_BASE}/grades/class-subject/${classId}/${subjectId}?term=${term}&session=${session}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  saveGrades: async (gradePayload) => {
    const res = await fetch(`${API_BASE}/grades/save`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(gradePayload)
    });
    return handleResponse(res);
  },

  // Attendance
  getAttendance: async (classId, date) => {
    const res = await fetch(`${API_BASE}/attendance/${classId}/${date}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  saveAttendance: async (attendancePayload) => {
    const res = await fetch(`${API_BASE}/attendance/save`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(attendancePayload)
    });
    return handleResponse(res);
  },

  // Broadsheets
  getBroadsheet: async (classId, term, session) => {
    const res = await fetch(`${API_BASE}/broadsheet/${classId}?term=${term}&session=${session}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Result Pins
  generatePins: async (count, term, academic_year) => {
    const res = await fetch(`${API_BASE}/pins/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ count, term, academic_year })
    });
    return handleResponse(res);
  },

  getPins: async () => {
    const res = await fetch(`${API_BASE}/pins`, { headers: getHeaders() });
    return handleResponse(res);
  },

  verifyPin: async (pin, term, academic_year) => {
    const res = await fetch(`${API_BASE}/pins/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ pin, term, academic_year })
    });
    return handleResponse(res);
  },

  // Report Card
  getReportCard: async (studentId, term, year) => {
    const res = await fetch(`${API_BASE}/report-card/${studentId}?term=${encodeURIComponent(term)}&year=${encodeURIComponent(year)}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getBulkReportCards: async (classId, term, year) => {
    const res = await fetch(`${API_BASE}/report-cards/bulk?class_id=${classId}&term=${encodeURIComponent(term)}&year=${encodeURIComponent(year)}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getStudentTimeline: async (studentId) => {
    const res = await fetch(`${API_BASE}/student/timeline/${studentId}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Result Upload Progress Trackers
  getTeacherResultProgress: async () => {
    const res = await fetch(`${API_BASE}/teacher/result-progress`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getAdminResultProgress: async () => {
    const res = await fetch(`${API_BASE}/admin/result-progress`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Fees / Finance
  getStudentFees: async (studentId) => {
    const res = await fetch(`${API_BASE}/fees/student/${studentId}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  addFeeInvoice: async (feeInvoiceData) => {
    const res = await fetch(`${API_BASE}/fees/add`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(feeInvoiceData)
    });
    return handleResponse(res);
  },

  logFeePayment: async (paymentData) => {
    const res = await fetch(`${API_BASE}/fees/pay`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData)
    });
    return handleResponse(res);
  },

  // Student Promotion (Admin)
  promoteBulk: async (source_class_id, target_class_id, selected_student_ids = []) => {
    const res = await fetch(`${API_BASE}/students/promote-bulk`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ source_class_id, target_class_id, selected_student_ids })
    });
    return handleResponse(res);
  },

  getPromotedClasses: async (session_name = '') => {
    const query = session_name ? `?session_name=${encodeURIComponent(session_name)}` : '';
    const res = await fetch(`${API_BASE}/promoted-classes${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  resetPromotedClasses: async (session_name = '') => {
    const res = await fetch(`${API_BASE}/promoted-classes/reset`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ session_name })
    });
    return handleResponse(res);
  },

  promoteIndividual: async (student_id, target_class_id, status) => {
    const res = await fetch(`${API_BASE}/students/promote-individual`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ student_id, target_class_id, status })
    });
    return handleResponse(res);
  },

  getBehavioralGrades: async (studentId, term, year) => {
    const res = await fetch(`${API_BASE}/behavioral/${studentId}?term=${encodeURIComponent(term)}&year=${encodeURIComponent(year)}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  saveBehavioralGrades: async (payload) => {
    const res = await fetch(`${API_BASE}/behavioral/save`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Schemes of Work
  getSchemes: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}/schemes?${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  saveScheme: async (schemeData) => {
    const res = await fetch(`${API_BASE}/schemes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(schemeData)
    });
    return handleResponse(res);
  },

  deleteScheme: async (id) => {
    const res = await fetch(`${API_BASE}/schemes/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // User Status Updates
  updateUserStatus: async (userId, status) => {
    const res = await fetch(`${API_BASE}/users/update-status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, status })
    });
    return handleResponse(res);
  },

  // Subjects Editing & Deleting
  updateSubject: async (id, data) => {
    const res = await fetch(`${API_BASE}/subjects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  deleteSubject: async (id) => {
    const res = await fetch(`${API_BASE}/subjects/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Academic Sessions Management
  getAcademicSessions: async () => {
    const res = await fetch(`${API_BASE}/sessions`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createAcademicSession: async (session_name) => {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ session_name })
    });
    return handleResponse(res);
  },

  setActiveSession: async (id) => {
    const res = await fetch(`${API_BASE}/sessions/set-active`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ id })
    });
    return handleResponse(res);
  },

  // Attendance Reports
  getAttendanceReport: async (classId, startDate = '', endDate = '') => {
    const query = new URLSearchParams({ start_date: startDate, end_date: endDate }).toString();
    const res = await fetch(`${API_BASE}/attendance/report/${classId}?${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Fee Structures CRUD & Audit Report
  getFeeStructures: async () => {
    const res = await fetch(`${API_BASE}/fees/structures`, { headers: getHeaders() });
    return handleResponse(res);
  },

  addFeeStructure: async (title, amount, tier, category = 'School Fees') => {
    const res = await fetch(`${API_BASE}/fees/structures`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, amount, tier, category })
    });
    return handleResponse(res);
  },

  updateFeeStructure: async (id, title, amount, tier, category = 'School Fees') => {
    const res = await fetch(`${API_BASE}/fees/structures/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ title, amount, tier, category })
    });
    return handleResponse(res);
  },

  deleteFeeStructure: async (id) => {
    const res = await fetch(`${API_BASE}/fees/structures/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getPaidFeesReport: async () => {
    const res = await fetch(`${API_BASE}/fees/report`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Authentication Settings / Profile
  changePassword: async (oldPassword, newPassword) => {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ oldPassword, newPassword })
    });
    return handleResponse(res);
  }
};

export default api;
