
/* 
  INSTRUCTIONS:
  1. Open a Google Sheet.
  2. Create tabs: 'Users', 'Students', 'Scores', 'Classes', 'Subjects'.
  3. Extensions > Apps Script > Paste this code.
  4. Deploy > New Deployment > Type: Web App > Who has access: Anyone.
  5. Copy the URL and paste it into src/services/apiService.ts
*/

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const params = e.parameter;
    const action = params.action;
    
    // Parse body if available
    let body = {};
    if (e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (err) {
        body = {};
      }
    }

    let result = {};

    if (action === 'login') {
      result = handleLogin(body);
    } else if (action === 'getScores') {
      result = handleGetScores(params);
    } else if (action === 'saveScore') {
      result = handleSaveScore(body);
    } else {
      result = { error: 'Invalid action' };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'error': e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// --- HANDLERS ---

function handleLogin(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  if (!sheet) return { error: 'Database not initialized (Users sheet missing)' };
  
  const users = getSheetData(sheet);
  const user = users.find(u => u.email === data.email && u.password === data.password); // Simple check

  if (user) {
    return { 
      success: true, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        status: 'active'
      } 
    };
  }
  return { error: 'Invalid credentials' };
}

function handleGetScores(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const studentSheet = ss.getSheetByName('Students');
  const scoreSheet = ss.getSheetByName('Scores');

  if (!studentSheet || !scoreSheet) return { error: 'Sheets missing' };

  const students = getSheetData(studentSheet);
  const scores = getSheetData(scoreSheet);

  // Filter students by class
  const classStudents = students.filter(s => s.class_id === params.classId);
  
  // Join scores
  const joined = classStudents.map(student => {
    // Find score for this student, subject, and term
    const score = scores.find(sc => 
      sc.student_id == student.id && 
      sc.subject_id == params.subjectId && 
      sc.term_id == params.termId
    ) || {};

    return {
      id: student.id,
      admission_no: student.admission_no,
      first_name: student.first_name,
      last_name: student.last_name,
      // Score fields (default to 0 if not found)
      ca1: Number(score.ca1 || 0),
      ca2: Number(score.ca2 || 0),
      assignment: Number(score.assignment || 0),
      notes: Number(score.notes || 0),
      exam: Number(score.exam || 0),
      total: Number(score.total || 0),
      grade: score.grade || 'F',
      is_locked: score.is_locked === 'TRUE'
    };
  });

  return joined;
}

function handleSaveScore(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Scores');
  
  // Columns: student_id, subject_id, term_id, session_id, ca1, ca2, assignment, notes, exam, total, grade, is_locked
  const headers = ['student_id', 'subject_id', 'term_id', 'session_id', 'ca1', 'ca2', 'assignment', 'notes', 'exam', 'total', 'grade', 'is_locked'];
  
  // Check if header row exists, if not create it
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  const allScores = getSheetData(sheet);
  
  // Find row to update
  let rowIndex = -1;
  // +2 because getSheetData ignores header (row 1) and sheet rows are 1-based
  for (let i = 0; i < allScores.length; i++) {
    if (allScores[i].student_id == data.studentId && 
        allScores[i].subject_id == data.subjectId && 
        allScores[i].term_id == data.termId) {
      rowIndex = i + 2; 
      break;
    }
  }

  const rowData = [
    data.studentId, 
    data.subjectId, 
    data.termId, 
    data.sessionId,
    data.ca1,
    data.ca2,
    data.assignment,
    data.notes,
    data.exam,
    data.total,
    data.grade,
    data.isLocked ? 'TRUE' : 'FALSE'
  ];

  if (rowIndex > 0) {
    // Update existing
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    // Insert new
    sheet.appendRow(rowData);
  }

  return { success: true };
}

// --- HELPER ---
function getSheetData(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // Remove header row
  return data.map(row => {
    let obj = {};
    headers.forEach((header, i) => obj[header] = row[i]);
    return obj;
  });
}
