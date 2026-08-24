const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { initDB, runQuery, getQuery, allQuery } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'jere-model-academy-super-secret-key-2026';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Catch body-parser SyntaxErrors to debug
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('BodyParser SyntaxError caught!');
    console.error('Method:', req.method);
    console.error('URL:', req.url);
    console.error('Headers:', req.headers);
    console.error('Body text:', err.body);
    console.error('Error message:', err.message);
    return res.status(400).json({ error: 'Invalid JSON payload: ' + err.message, body: err.body });
  }
  next();
});

// Middleware to Authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Middleware to Restrict to Specific Roles
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden: insufficient permissions' });
    }
    next();
  };
}

// Helper to generate a random 10-character alphanumeric PIN
function generateRandomPIN() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pin = '';
  for (let i = 0; i < 10; i++) {
    pin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pin;
}

// Helper to calculate grades
function calculateGrade(score) {
  if (score >= 75) return { grade: 'A', remark: 'Excellent' };
  if (score >= 60) return { grade: 'B', remark: 'Very Good' };
  if (score >= 50) return { grade: 'C', remark: 'Good' };
  if (score >= 40) return { grade: 'D', remark: 'Pass' };
  return { grade: 'F', remark: 'Fail' };
}

// ==========================================
// 1. AUTHENTICATION ROUTE
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body; // identifier can be username or admission number
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/Admission number and password required' });
  }

  try {
    let user = null;
    
    // Check if identifier looks like an admission number
    if (identifier.toUpperCase().startsWith('JMA/')) {
      user = await getQuery(`
        SELECT u.*, s.admission_number, s.class_id, c.name as class_name 
        FROM USERS u 
        JOIN STUDENTS s ON u.id = s.id 
        LEFT JOIN CLASSES c ON s.class_id = c.id
        WHERE s.admission_number = ?
      `, [identifier.toUpperCase()]);
    } else {
      user = await getQuery('SELECT * FROM USERS WHERE username = ?', [identifier.toLowerCase()]);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or admission number' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact the administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name || user.full_name,
      class_id: user.class_id || null,
      class_name: user.class_name || null,
      admission_number: user.admission_number || null
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '12h' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        admission_number: user.admission_number,
        class_id: user.class_id,
        class_name: user.class_name,
        passport_photo: user.passport_photo
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. SYSTEM SETTINGS
// ==========================================
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await getQuery('SELECT * FROM SYSTEM_SETTINGS ORDER BY id DESC LIMIT 1');
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', authenticateToken, requireRole('admin'), async (req, res) => {
  const { 
    active_session, 
    active_term, 
    result_entry_open,
    landing_school_name,
    landing_tagline,
    landing_hero_title,
    landing_hero_desc,
    landing_address,
    result_show_position,
    result_show_average,
    contact_phone,
    contact_email,
    ca1_name,
    ca2_name,
    ca3_name,
    ca4_name,
    exam_name,
    games_master_name,
    games_master_remark,
    house_master_name,
    house_master_remark,
    principal_name,
    principal_signature,
    next_term_fee,
    next_term_begins,
    next_term_ends,
    last_term_debit,
    allow_past_attendance,
    allow_fm_register_student,
    allow_fm_edit_student,
    max_ca_count
  } = req.body;
  try {
    const settings = await getQuery('SELECT id FROM SYSTEM_SETTINGS ORDER BY id DESC LIMIT 1');
    await runQuery(`
      UPDATE SYSTEM_SETTINGS 
      SET 
        active_session = ?, 
        active_term = ?, 
        result_entry_open = ?,
        landing_school_name = ?,
        landing_tagline = ?,
        landing_hero_title = ?,
        landing_hero_desc = ?,
        landing_address = ?,
        result_show_position = ?,
        result_show_average = ?,
        contact_phone = ?,
        contact_email = ?,
        ca1_name = ?,
        ca2_name = ?,
        ca3_name = ?,
        ca4_name = ?,
        exam_name = ?,
        games_master_name = ?,
        games_master_remark = ?,
        house_master_name = ?,
        house_master_remark = ?,
        principal_name = ?,
        principal_signature = ?,
        next_term_fee = ?,
        next_term_begins = ?,
        next_term_ends = ?,
        last_term_debit = ?,
        allow_past_attendance = ?,
        allow_fm_register_student = ?,
        allow_fm_edit_student = ?,
        max_ca_count = ?
      WHERE id = ?
    `, [
      active_session, 
      active_term, 
      result_entry_open, 
      landing_school_name,
      landing_tagline,
      landing_hero_title,
      landing_hero_desc,
      landing_address,
      result_show_position,
      result_show_average,
      contact_phone,
      contact_email,
      ca1_name || 'CA 1',
      ca2_name || 'CA 2',
      ca3_name || 'CA 3',
      ca4_name || 'CA 4',
      exam_name || 'Exam',
      games_master_name || '',
      games_master_remark || '',
      house_master_name || '',
      house_master_remark || '',
      principal_name || '',
      principal_signature || null,
      next_term_fee || '',
      next_term_begins || '',
      next_term_ends || '',
      last_term_debit || '',
      allow_past_attendance !== undefined ? allow_past_attendance : 0,
      allow_fm_register_student !== undefined ? allow_fm_register_student : 0,
      allow_fm_edit_student !== undefined ? allow_fm_edit_student : 0,
      max_ca_count || 4,
      settings.id
    ]);
    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. ADMIN PORTAL CONFIGURATION & USERS CRUD
// ==========================================

// Register Student (Includes Passport Photo & Parent Details)
app.post('/api/users/register-student', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    const settings = await getQuery('SELECT allow_fm_register_student FROM SYSTEM_SETTINGS ORDER BY id DESC LIMIT 1');
    if (!settings || !settings.allow_fm_register_student) return res.status(403).json({ error: 'Permission denied: Only Admins or permitted Form Masters can register students.' });
  }
  const {
    full_name, class_id, date_of_birth, class_of_entry,
    term_year_of_entry, last_school_attended, address_residence, sex, religion,
    local_government, state_of_origin, handicapped, handicap_details,
    parent_name, parent_address, parent_phone, passport_photo, custom_admission_number,
    offline_debt_amount
  } = req.body;

  if (!full_name) {
    return res.status(400).json({ error: 'Full name is required' });
  }

  try {
    // Auto-generate Admission Number if not custom provided
    let admission_number = custom_admission_number;
    if (!admission_number) {
      const year = new Date().getFullYear();
      const countRow = await getQuery("SELECT COUNT(*) as count FROM STUDENTS");
      const nextSeq = String(countRow.count + 1).padStart(4, '0');
      admission_number = `JMA/${year}/${nextSeq}`;
    }

    // Default credentials for student is their admission number
    const username = admission_number.toUpperCase();
    const password_hash = await bcrypt.hash(admission_number, 10);

    // Insert into USERS table
    const userRes = await runQuery(`
      INSERT INTO USERS (username, password_hash, full_name, role, passport_photo)
      VALUES (?, ?, ?, 'student', ?)
    `, [username, password_hash, full_name, passport_photo || null]);
    
    const studentId = userRes.lastID;

    // Insert into STUDENTS table
    await runQuery(`
      INSERT INTO STUDENTS (
        id, class_id, admission_number, date_of_birth, class_of_entry, term_year_of_entry,
        last_school_attended, address_residence, sex, religion, local_government, state_of_origin,
        handicapped, handicap_details, parent_name, parent_address, parent_phone, undertaking_signed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      studentId, class_id || null, admission_number, date_of_birth, class_of_entry,
      term_year_of_entry, last_school_attended, address_residence, sex, religion,
      local_government, state_of_origin, handicapped ? 1 : 0, handicap_details,
      parent_name, parent_address, parent_phone
    ]);

    // Handle optional offline debt
    if (offline_debt_amount && !isNaN(offline_debt_amount) && Number(offline_debt_amount) > 0) {
      await runQuery(`
        INSERT INTO FEE_INVOICES (student_id, title, category, amount_due, amount_paid, status)
        VALUES (?, 'Outstanding Offline Debt', 'Outstanding Debt', ?, 0, 'unpaid')
      `, [studentId, Number(offline_debt_amount)]);
    }

    res.status(201).json({ message: 'Student registered successfully', admission_number, studentId });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Username or Admission Number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Register Teacher
app.post('/api/users/register-teacher', authenticateToken, requireRole('admin'), async (req, res) => {
  const { 
    full_name, email, passport_photo,
    surname, first_name, other_names, address, state_of_residence, lga_of_residence, signature
  } = req.body;
  
  if (!full_name) {
    return res.status(400).json({ error: 'Full name is required' });
  }

  try {
    // Generate Staff ID (JMA/STF/Year/Serial)
    const year = new Date().getFullYear();
    const countRow = await getQuery("SELECT COUNT(*) as count FROM TEACHERS");
    const nextSeq = String(countRow.count + 1).padStart(3, '0');
    const staff_id = `JMA/STF/${year}/${nextSeq}`;
    
    const username = staff_id.toUpperCase();
    const password_hash = await bcrypt.hash(staff_id, 10);
    
    const userRes = await runQuery(`
      INSERT INTO USERS (username, password_hash, email, full_name, role, passport_photo)
      VALUES (?, ?, ?, ?, 'teacher', ?)
    `, [username, password_hash, email || null, full_name, passport_photo || null]);
    
    const teacherId = userRes.lastID;

    await runQuery(`
      INSERT INTO TEACHERS (
        id, surname, first_name, other_names, address, state_of_residence, lga_of_residence, signature
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      teacherId, surname || null, first_name || null, other_names || null, address || null,
      state_of_residence || null, lga_of_residence || null, signature || null
    ]);

    res.status(201).json({ message: 'Teacher registered successfully', teacherId });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Update Student Profile
app.put('/api/users/update-student/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    const settings = await getQuery('SELECT allow_fm_edit_student FROM SYSTEM_SETTINGS ORDER BY id DESC LIMIT 1');
    if (!settings || !settings.allow_fm_edit_student) return res.status(403).json({ error: 'Permission denied: Only Admins or permitted Form Masters can edit students.' });
  }
  const { id } = req.params;
  const {
    full_name, class_id, date_of_birth, class_of_entry,
    term_year_of_entry, last_school_attended, address_residence, sex, religion,
    local_government, state_of_origin, handicapped, handicap_details,
    parent_name, parent_address, parent_phone, passport_photo, custom_admission_number
  } = req.body;

  try {
    // 1. Update USERS table
    await runQuery(
      `UPDATE USERS SET full_name = ?, passport_photo = ? WHERE id = ?`,
      [full_name, passport_photo || null, id]
    );

    // 2. Update STUDENTS table
    await runQuery(
      `UPDATE STUDENTS 
       SET class_id = ?, date_of_birth = ?, class_of_entry = ?, term_year_of_entry = ?,
           last_school_attended = ?, address_residence = ?, sex = ?, religion = ?,
           local_government = ?, state_of_origin = ?, handicapped = ?, handicap_details = ?,
           parent_name = ?, parent_address = ?, parent_phone = ?, admission_number = COALESCE(?, admission_number)
       WHERE id = ?`,
      [
        class_id || null, date_of_birth || null, class_of_entry || null, term_year_of_entry || null,
        last_school_attended || null, address_residence || null, sex || null, religion || null,
        local_government || null, state_of_origin || null, handicapped ? 1 : 0, handicap_details || null,
        parent_name || null, parent_address || null, parent_phone || null, custom_admission_number || null,
        id
      ]
    );

    res.json({ message: 'Student updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Teacher Profile
app.put('/api/users/update-teacher/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Access denied: You can only update your own profile' });
  }

  const {
    full_name, surname, first_name, other_names,
    address, state_of_residence, lga_of_residence,
    passport_photo, digital_signature, signature
  } = req.body;

  const sig = digital_signature !== undefined ? digital_signature : signature;

  try {
    // 1. Update USERS table
    const computedName = full_name || `${surname || ''} ${first_name || ''} ${other_names || ''}`.trim();
    if (passport_photo !== undefined) {
      await runQuery(
        `UPDATE USERS SET full_name = ?, passport_photo = ? WHERE id = ?`,
        [computedName || 'Teacher', passport_photo, id]
      );
    } else {
      await runQuery(
        `UPDATE USERS SET full_name = ? WHERE id = ?`,
        [computedName || 'Teacher', id]
      );
    }

    // 2. Check if row exists in TEACHERS table (upsert)
    const teacherRow = await getQuery('SELECT id FROM TEACHERS WHERE id = ?', [id]);
    if (!teacherRow) {
      await runQuery(
        `INSERT INTO TEACHERS (id, surname, first_name, other_names, address, state_of_residence, lga_of_residence, signature)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          surname || null, first_name || null, other_names || null,
          address || null, state_of_residence || null, lga_of_residence || null,
          sig || null
        ]
      );
    } else {
      await runQuery(
        `UPDATE TEACHERS 
         SET surname = ?, first_name = ?, other_names = ?, 
             address = ?, state_of_residence = ?, lga_of_residence = ?, 
             signature = ?
         WHERE id = ?`,
        [
          surname || null, first_name || null, other_names || null,
          address || null, state_of_residence || null, lga_of_residence || null,
          sig || null, id
        ]
      );
    }

    res.json({ message: 'Teacher updated successfully' });
  } catch (err) {
    console.error('Error updating teacher profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// List all Students
app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    const students = await allQuery(`
      SELECT s.*, u.full_name, u.username, u.passport_photo, c.name as class_name 
      FROM STUDENTS s
      JOIN USERS u ON s.id = u.id
      LEFT JOIN CLASSES c ON s.class_id = c.id
      ORDER BY c.name, u.full_name
    `);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all Teachers
app.get('/api/teachers', authenticateToken, async (req, res) => {
  try {
    const teachers = await allQuery(`
      SELECT u.id, u.username, u.full_name, u.email, u.passport_photo, u.created_at, u.status,
             t.surname, t.first_name, t.other_names, t.address, t.state_of_residence, t.lga_of_residence,
             t.signature as digital_signature, t.signature 
      FROM USERS u
      LEFT JOIN TEACHERS t ON u.id = t.id
      WHERE u.role = 'teacher'
      ORDER BY u.full_name
    `);
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update User Status (Admin Only)
app.post('/api/users/update-status', authenticateToken, requireRole('admin'), async (req, res) => {
  const { userId, status } = req.body;
  if (!userId || !status) {
    return res.status(400).json({ error: 'User ID and status are required' });
  }
  try {
    const user = await getQuery('SELECT role FROM USERS WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await runQuery('UPDATE USERS SET status = ? WHERE id = ?', [status, userId]);

    if (user.role === 'student') {
      await runQuery('UPDATE STUDENTS SET status = ? WHERE id = ?', [status, userId]);
    }

    res.json({ message: 'User status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get detailed student profile (including parents/rules metrics)
app.get('/api/students/:id', authenticateToken, async (req, res) => {
  try {
    const student = await getQuery(`
      SELECT s.*, u.full_name, u.username, u.passport_photo, c.name as class_name, c.tier 
      FROM STUDENTS s
      JOIN USERS u ON s.id = u.id
      LEFT JOIN CLASSES c ON s.class_id = c.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. CLASS & CURRICULUM MANAGEMENT
// ==========================================

// List Classes
app.get('/api/classes', authenticateToken, async (req, res) => {
  try {
    const classes = await allQuery(`
      SELECT c.*, u.full_name as form_master_name 
      FROM CLASSES c
      LEFT JOIN USERS u ON c.form_master_id = u.id
      ORDER BY c.name ASC
    `);
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Class
app.post('/api/classes', authenticateToken, requireRole('admin'), async (req, res) => {
  const { name, tier } = req.body;
  try {
    await runQuery('INSERT INTO CLASSES (name, tier) VALUES (?, ?)', [name, tier]);
    res.status(201).json({ message: 'Class created successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Edit Class
app.put('/api/classes/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const { name, tier } = req.body;
  try {
    await runQuery('UPDATE CLASSES SET name = ?, tier = ? WHERE id = ?', [name, tier, req.params.id]);
    res.json({ message: 'Class updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Class
app.delete('/api/classes/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    await runQuery('DELETE FROM CLASSES WHERE id = ?', [req.params.id]);
    res.json({ message: 'Class deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Assign Form Master (Subject teachers can also be form masters)
app.post('/api/classes/assign-form-master', authenticateToken, requireRole('admin'), async (req, res) => {
  const { class_id, teacher_id } = req.body;
  try {
    if (teacher_id) {
      // Rule: Check if teacher is already a form master for another class
      const existingAssignment = await getQuery('SELECT id, name FROM CLASSES WHERE form_master_id = ? AND id != ?', [teacher_id, class_id]);
      if (existingAssignment) {
        return res.status(400).json({ error: `This teacher is already assigned as Form Master for ${existingAssignment.name}. A teacher can only be a form master for one class.` });
      }
    }
    
    await runQuery('UPDATE CLASSES SET form_master_id = ? WHERE id = ?', [teacher_id || null, class_id]);
    res.json({ message: 'Form master assigned successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List Subjects
app.get('/api/subjects', authenticateToken, async (req, res) => {
  try {
    const subjects = await allQuery(`
      SELECT s.*,
        (SELECT '[' || group_concat(json_object('class_id', cs.class_id)) || ']'
         FROM CLASS_SUBJECTS cs WHERE cs.subject_id = s.id) as classes
      FROM SUBJECTS s ORDER BY s.tier, s.name
    `);
    
    // Parse the classes JSON string into an array of objects
    const parsedSubjects = subjects.map(sub => {
      let classesArr = [];
      if (sub.classes) {
        try {
          classesArr = JSON.parse(sub.classes);
        } catch (e) {
          classesArr = [];
        }
      }
      return { ...sub, classes: classesArr };
    });
    
    res.json(parsedSubjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Subject
app.post('/api/subjects', authenticateToken, requireRole('admin'), async (req, res) => {
  const { name, tier, class_ids } = req.body;
  try {
    const result = await runQuery('INSERT INTO SUBJECTS (name, tier) VALUES (?, ?)', [name, tier]);
    const subjectId = result.lastID;

    if (class_ids && Array.isArray(class_ids)) {
      for (const cid of class_ids) {
        await runQuery('INSERT OR IGNORE INTO CLASS_SUBJECTS (class_id, subject_id) VALUES (?, ?)', [cid, subjectId]);
      }
    }

    res.status(201).json({ message: 'Subject created successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List Class Subject Teachers Assignments
app.get('/api/class-subjects', authenticateToken, async (req, res) => {
  try {
    const assignments = await allQuery(`
      SELECT cs.*, c.name as class_name, s.name as subject_name, u.full_name as teacher_name 
      FROM CLASS_SUBJECTS cs
      JOIN CLASSES c ON cs.class_id = c.id
      JOIN SUBJECTS s ON cs.subject_id = s.id
      LEFT JOIN USERS u ON cs.teacher_id = u.id
    `);
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign Subject Teacher
app.post('/api/class-subjects/assign', authenticateToken, requireRole('admin'), async (req, res) => {
  const { class_ids, class_id, subject_id, teacher_id, overwrite } = req.body;
  try {
    const targetClasses = class_ids || (class_id ? [class_id] : []);
    
    // Check for existing teachers if not explicitly overwriting
    if (!overwrite) {
      for (const cid of targetClasses) {
        const existing = await getQuery('SELECT teacher_id FROM CLASS_SUBJECTS WHERE class_id = ? AND subject_id = ? AND teacher_id IS NOT NULL', [cid, subject_id]);
        if (existing && existing.teacher_id !== teacher_id) {
          const cls = await getQuery('SELECT name FROM CLASSES WHERE id = ?', [cid]);
          const sub = await getQuery('SELECT name FROM SUBJECTS WHERE id = ?', [subject_id]);
          return res.status(400).json({ error: `A teacher is already assigned to ${sub.name} in ${cls.name}. Use the Edit option on the class subject to reassign.` });
        }
      }
    }

    for (const cid of targetClasses) {
      await runQuery(`
        INSERT INTO CLASS_SUBJECTS (class_id, subject_id, teacher_id) 
        VALUES (?, ?, ?)
        ON CONFLICT(class_id, subject_id) DO UPDATE SET teacher_id = excluded.teacher_id
      `, [cid, subject_id, teacher_id]);
    }
    res.json({ message: 'Subject mapped to selected classes successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ==========================================
// AFFECTIVE & PSYCHOMOTOR SKILLS
// ==========================================

// Get all Skills (Admin & Teachers)
app.get('/api/skills', authenticateToken, async (req, res) => {
  try {
    const { tier } = req.query;
    const affective = await allQuery("SELECT id, name, target_section, 'affective' as category FROM AFFECTIVE_SKILLS ORDER BY name");
    const psychomotor = await allQuery("SELECT id, name, target_section, 'psychomotor' as category FROM PSYCHOMOTOR_SKILLS ORDER BY name");
    let skills = [...affective, ...psychomotor];
    
    if (tier) {
      const t = tier.toLowerCase();
      const section = (t === 'jss' || t === 'sss') ? 'secondary' : 'primary';
      skills = skills.filter(s => s.target_section === 'all' || s.target_section === section);
    }
    
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Skill (Admin)
app.post('/api/skills', authenticateToken, requireRole('admin'), async (req, res) => {
  const { name, category, target_section } = req.body;
  const cat = (category || 'affective').toLowerCase();
  const section = (target_section || 'secondary').toLowerCase();
  try {
    if (cat === 'psychomotor') {
      await runQuery('INSERT INTO PSYCHOMOTOR_SKILLS (name, target_section) VALUES (?, ?)', [name, section]);
    } else {
      await runQuery('INSERT INTO AFFECTIVE_SKILLS (name, target_section) VALUES (?, ?)', [name, section]);
    }
    res.status(201).json({ message: 'Skill created successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Skill (Admin)
app.put('/api/skills/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const { name, category, target_section } = req.body;
  const cat = (category || 'affective').toLowerCase();
  const section = (target_section || 'secondary').toLowerCase();
  try {
    if (cat === 'psychomotor') {
      await runQuery('UPDATE PSYCHOMOTOR_SKILLS SET name = ?, target_section = ? WHERE id = ?', [name, section, req.params.id]);
    } else {
      await runQuery('UPDATE AFFECTIVE_SKILLS SET name = ?, target_section = ? WHERE id = ?', [name, section, req.params.id]);
    }
    res.json({ message: 'Skill updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Skill (Admin)
app.delete('/api/skills/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const cat = (req.query.category || 'affective').toLowerCase();
  try {
    if (cat === 'psychomotor') {
      await runQuery('DELETE FROM PSYCHOMOTOR_SKILLS WHERE id = ?', [req.params.id]);
    } else {
      await runQuery('DELETE FROM AFFECTIVE_SKILLS WHERE id = ?', [req.params.id]);
    }
    res.json({ message: 'Skill deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Unrated/Rated students for Form Master
app.get('/api/skills/students/:classId', authenticateToken, async (req, res) => {
  const { classId } = req.params;
  const { term, session } = req.query;

  try {
    if (req.user.role === 'teacher') {
      const cls = await getQuery('SELECT form_master_id FROM CLASSES WHERE id = ?', [classId]);
      if (!cls || cls.form_master_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied: Not the Form Master' });
      }
    }

    const students = await allQuery(`
      SELECT s.id, u.full_name, s.admission_number 
      FROM STUDENTS s 
      JOIN USERS u ON s.id = u.id 
      WHERE s.class_id = ?
      ORDER BY u.full_name
    `, [classId]);

      const evaluationsAffective = await allQuery(`
        SELECT DISTINCT student_id FROM STUDENT_AFFECTIVE_EVAL 
        WHERE term = ? AND academic_year = ? AND student_id IN (SELECT id FROM STUDENTS WHERE class_id = ?)
      `, [term, session, classId]);

      const evaluationsPsychomotor = await allQuery(`
        SELECT DISTINCT student_id FROM STUDENT_PSYCHOMOTOR_EVAL 
        WHERE term = ? AND academic_year = ? AND student_id IN (SELECT id FROM STUDENTS WHERE class_id = ?)
      `, [term, session, classId]);

      const ratedIds = [...new Set([...evaluationsAffective.map(e => e.student_id), ...evaluationsPsychomotor.map(e => e.student_id)])];
    const rated = students.filter(s => ratedIds.includes(s.id));
    const unrated = students.filter(s => !ratedIds.includes(s.id));

    res.json({ rated, unrated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific student's evaluation for edit
app.get('/api/skills/evaluations/:studentId', authenticateToken, async (req, res) => {
  const { studentId } = req.params;
  const { term, session } = req.query;
  try {
    const affective = await allQuery(`
      SELECT skill_id, rating, 'affective' as category FROM STUDENT_AFFECTIVE_EVAL
      WHERE student_id = ? AND term = ? AND academic_year = ?
    `, [studentId, term, session]);
    
    const psychomotor = await allQuery(`
      SELECT skill_id, rating, 'psychomotor' as category FROM STUDENT_PSYCHOMOTOR_EVAL
      WHERE student_id = ? AND term = ? AND academic_year = ?
    `, [studentId, term, session]);

    res.json([...affective, ...psychomotor]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save Student Skills Evaluation
app.post('/api/skills/evaluate', authenticateToken, async (req, res) => {
  const { student_id, term, session, ratings } = req.body; // ratings: [{ skill_id, rating, category }]
  try {
    for (const r of ratings) {
      if ((r.category || '').toLowerCase() === 'psychomotor') {
        await runQuery(`
          INSERT INTO STUDENT_PSYCHOMOTOR_EVAL (student_id, skill_id, term, academic_year, rating)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(student_id, skill_id, term, academic_year) DO UPDATE SET rating = excluded.rating
        `, [student_id, r.skill_id, term, session, r.rating]);
      } else {
        await runQuery(`
          INSERT INTO STUDENT_AFFECTIVE_EVAL (student_id, skill_id, term, academic_year, rating)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(student_id, skill_id, term, academic_year) DO UPDATE SET rating = excluded.rating
        `, [student_id, r.skill_id, term, session, r.rating]);
      }
    }
    res.json({ message: 'Skills evaluation saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Assigned Subjects for logged-in Teacher
app.get('/api/teacher/assignments', authenticateToken, requireRole('teacher', 'form_master'), async (req, res) => {
  try {
    const classes = await allQuery(`
      SELECT cs.class_id, cs.subject_id, c.name as class_name, s.name as subject_name 
      FROM CLASS_SUBJECTS cs
      JOIN CLASSES c ON cs.class_id = c.id
      JOIN SUBJECTS s ON cs.subject_id = s.id
      WHERE cs.teacher_id = ?
    `, [req.user.id]);
    
    const formClass = await getQuery(`
      SELECT id, name FROM CLASSES WHERE form_master_id = ?
    `, [req.user.id]);

    res.json({
      subjects: classes,
      formClass: formClass || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. ATTENDANCE (Form Masters & Admins Only)
// ==========================================

// Get Attendance Summary Report (Admin & Form Masters)
app.get('/api/attendance/report/:classId', authenticateToken, async (req, res) => {
  const { classId } = req.params;
  const { start_date, end_date } = req.query;

  try {
    if (req.user.role === 'teacher') {
      const cls = await getQuery('SELECT form_master_id FROM CLASSES WHERE id = ?', [classId]);
      if (!cls || cls.form_master_id != req.user.id) {
        return res.status(403).json({ error: 'Access denied: You are not the Form Master of this class.' });
      }
    }

    let dateFilter = '';
    const params = [classId];
    if (start_date && end_date) {
      dateFilter = 'AND date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    const report = await allQuery(`
      SELECT s.id as student_id, u.full_name, s.admission_number,
             SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
             SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
             SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
             COUNT(a.status) as total_days
      FROM STUDENTS s
      JOIN USERS u ON s.id = u.id
      LEFT JOIN ATTENDANCE a ON s.id = a.student_id ${dateFilter}
      WHERE s.class_id = ?
      GROUP BY s.id, u.full_name, s.admission_number
      ORDER BY u.full_name
    `, params);

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/attendance/:classId/:date', authenticateToken, async (req, res) => {
  const { classId, date } = req.params;
  
  try {
    // Check Permission: Must be Admin, or the assigned Form Master of this class
    if (req.user.role === 'teacher') {
      const cls = await getQuery('SELECT form_master_id FROM CLASSES WHERE id = ?', [classId]);
      if (!cls || cls.form_master_id != req.user.id) {
        return res.status(403).json({ error: 'Access denied: You are not the Form Master of this class' });
      }
    }

    const roster = await allQuery(`
      SELECT s.id as student_id, u.full_name, s.admission_number, a.status
      FROM STUDENTS s
      JOIN USERS u ON s.id = u.id
      LEFT JOIN ATTENDANCE a ON s.id = a.student_id AND a.date = ?
      WHERE s.class_id = ?
      ORDER BY u.full_name
    `, [date, classId]);

    res.json(roster);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attendance/save', authenticateToken, async (req, res) => {
  const { class_id, date, records } = req.body; // records: [{student_id, status}]
  
  try {
    // Check Permission
    if (req.user.role === 'teacher') {
      const cls = await getQuery('SELECT form_master_id FROM CLASSES WHERE id = ?', [class_id]);
      if (!cls || cls.form_master_id != req.user.id) {
        return res.status(403).json({ error: 'Access denied: You are not the Form Master of this class' });
      }
    }

    for (const rec of records) {
      await runQuery(`
        INSERT INTO ATTENDANCE (student_id, date, status, marked_by)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(student_id, date) DO UPDATE SET status = excluded.status, marked_by = excluded.marked_by
      `, [rec.student_id, date, rec.status, req.user.id]);
    }

    res.json({ message: 'Attendance records updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. ACADEMIC GRADES & MARKS ENTRY
// ==========================================
app.get('/api/grades/class-subject/:classId/:subjectId', authenticateToken, async (req, res) => {
  const { classId, subjectId } = req.params;
  const { term, session } = req.query;

  try {
    // Check Permission: Must be Admin, or assigned Subject Teacher
    if (req.user.role === 'teacher') {
      const assignment = await getQuery(`
        SELECT id FROM CLASS_SUBJECTS 
        WHERE class_id = ? AND subject_id = ? AND teacher_id = ?
      `, [classId, subjectId, req.user.id]);
      
      if (!assignment) {
        return res.status(403).json({ error: 'Access denied: You are not assigned to teach this class-subject' });
      }
    }

    const grades = await allQuery(`
      SELECT s.id as student_id, u.full_name, s.admission_number,
             g.ca1, g.ca2, g.ca3, g.ca4, g.exam_score, g.total_score, g.grade_letter, g.remark
      FROM STUDENTS s
      JOIN USERS u ON s.id = u.id
      LEFT JOIN GRADES g ON s.id = g.student_id AND g.subject_id = ? AND g.term = ? AND g.academic_year = ?
      WHERE s.class_id = ?
      ORDER BY u.full_name
    `, [subjectId, term, session, classId]);

    res.json(grades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/grades/save', authenticateToken, async (req, res) => {
  const { class_id, subject_id, term, academic_year, grades } = req.body; 
  // grades: [{student_id, ca1, ca2, ca3, ca4, exam_score, remark}]

  try {
    // Check if result entry is locked
    const settings = await getQuery('SELECT result_entry_open FROM SYSTEM_SETTINGS ORDER BY id DESC LIMIT 1');
    if (!settings.result_entry_open && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Result entry is currently locked by the administrator.' });
    }

    // Check teacher permission
    if (req.user.role === 'teacher') {
      const assignment = await getQuery(`
        SELECT id FROM CLASS_SUBJECTS 
        WHERE class_id = ? AND subject_id = ? AND teacher_id = ?
      `, [class_id, subject_id, req.user.id]);
      
      if (!assignment) {
        return res.status(403).json({ error: 'Access denied: You are not assigned to teach this class-subject' });
      }
    }

    for (const g of grades) {
      const c1 = parseFloat(g.ca1 || 0);
      const c2 = parseFloat(g.ca2 || 0);
      const c3 = parseFloat(g.ca3 || 0);
      const c4 = parseFloat(g.ca4 || 0);
      const exam = parseFloat(g.exam_score || 0);
      const total = c1 + c2 + c3 + c4 + exam;
      const { grade, remark } = calculateGrade(total);

      await runQuery(`
        INSERT INTO GRADES (student_id, subject_id, term, academic_year, ca1, ca2, ca3, ca4, exam_score, total_score, grade_letter, remark)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(student_id, subject_id, term, academic_year) DO UPDATE SET 
          ca1 = excluded.ca1,
          ca2 = excluded.ca2,
          ca3 = excluded.ca3,
          ca4 = excluded.ca4,
          exam_score = excluded.exam_score,
          total_score = excluded.total_score,
          grade_letter = excluded.grade_letter,
          remark = excluded.remark
      `, [g.student_id, subject_id, term, academic_year, c1, c2, c3, c4, exam, total, grade, g.remark || remark]);
    }

    res.json({ message: 'Grades saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. CLASS BROADSHEET MATRIX (Admins & Form Masters)
// ==========================================
app.get('/api/broadsheet/:classId', authenticateToken, async (req, res) => {
  const { classId } = req.params;
  const { term, session } = req.query;

  try {
    // Permission check
    if (req.user.role === 'teacher') {
      const cls = await getQuery('SELECT form_master_id FROM CLASSES WHERE id = ?', [classId]);
      if (!cls || cls.form_master_id != req.user.id) {
        return res.status(403).json({ error: 'Access denied: You are not the Form Master of this class' });
      }
    }

    // 1. Get all subjects offered in this class
    const subjects = await allQuery(`
      SELECT s.id, s.name FROM CLASS_SUBJECTS cs
      JOIN SUBJECTS s ON cs.subject_id = s.id
      WHERE cs.class_id = ?
      ORDER BY s.name
    `, [classId]);

    // 2. Get all students in this class
    const students = await allQuery(`
      SELECT s.id, u.full_name, s.admission_number
      FROM STUDENTS s
      JOIN USERS u ON s.id = u.id
      WHERE s.class_id = ?
      ORDER BY u.full_name
    `, [classId]);

    // 3. Get all grades for this class, term, session
    const gradesList = await allQuery(`
      SELECT g.* FROM GRADES g
      JOIN STUDENTS s ON g.student_id = s.id
      WHERE s.class_id = ? AND g.term = ? AND g.academic_year = ?
    `, [classId, term, session]);

    // Format grades into a map for fast lookup
    const gradeMap = {};
    gradesList.forEach(g => {
      if (!gradeMap[g.student_id]) gradeMap[g.student_id] = {};
      gradeMap[g.student_id][g.subject_id] = g;
    });

    // If 3rd Term, fetch all year grades to calculate cumulative totals for the broadsheet
    let allYearGradeMap = {};
    if (term === '3rd Term') {
      const allYearGrades = await allQuery(`
        SELECT g.student_id, g.subject_id, g.term, g.total_score 
        FROM GRADES g
        JOIN STUDENTS s ON g.student_id = s.id
        WHERE s.class_id = ? AND g.academic_year = ?
      `, [classId, session]);
      
      allYearGrades.forEach(g => {
        if (!allYearGradeMap[g.student_id]) allYearGradeMap[g.student_id] = {};
        if (!allYearGradeMap[g.student_id][g.subject_id]) allYearGradeMap[g.student_id][g.subject_id] = {};
        allYearGradeMap[g.student_id][g.subject_id][g.term] = g.total_score;
      });
    }

    // Format broadsheet lines
    const rows = students.map(student => {
      const studentGrades = {};
      let grandTotal = 0;
      let subjectCount = 0;
      
      let cumGrandTotal = 0;
      let cumSubjectCount = 0;
      
      let term1GrandTotal = 0;
      let term2GrandTotal = 0;

      subjects.forEach(sub => {
        const g = gradeMap[student.id]?.[sub.id];
        if (g) {
          let term1_total = 0;
          let term2_total = 0;
          let cum_average = 0;

          if (term === '3rd Term') {
            term1_total = allYearGradeMap[student.id]?.[sub.id]?.['1st Term'] || 0;
            term2_total = allYearGradeMap[student.id]?.[sub.id]?.['2nd Term'] || 0;
            term1GrandTotal += term1_total;
            term2GrandTotal += term2_total;

            cum_average = parseFloat(((term1_total + term2_total + g.total_score) / 3).toFixed(1));
            cumGrandTotal += cum_average;
            cumSubjectCount++;
          }

          studentGrades[sub.id] = {
            ca1: g.ca1, ca2: g.ca2, ca3: g.ca3, ca4: g.ca4,
            exam: g.exam_score, total: g.total_score, grade: g.grade_letter,
            term1_total, term2_total, cum_average
          };
          grandTotal += g.total_score;
          subjectCount++;
        } else {
          studentGrades[sub.id] = { 
            ca1: 0, ca2: 0, ca3: 0, ca4: 0, exam: 0, total: 0, grade: '-',
            term1_total: 0, term2_total: 0, cum_average: 0
          };
        }
      });

      const average = subjectCount > 0 ? (grandTotal / subjectCount) : 0;
      const cumAverage = cumSubjectCount > 0 ? parseFloat((cumGrandTotal / cumSubjectCount).toFixed(1)) : 0;
      const overallSum = term1GrandTotal + term2GrandTotal + grandTotal;

      return {
        student_id: student.id,
        full_name: student.full_name,
        admission_number: student.admission_number,
        grades: studentGrades,
        grandTotal,
        term1GrandTotal,
        term2GrandTotal,
        overallSum,
        average,
        cumAverage,
        subjectCount
      };
    });

    // Calculate Position in Class
    rows.sort((a, b) => b.grandTotal - a.grandTotal);
    rows.forEach((row, index) => {
      row.position = index + 1;
    });

    // Sort back by name for standard lists
    rows.sort((a, b) => a.full_name.localeCompare(b.full_name));

    res.json({ subjects, rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. RESULT CHECKER PINS (Students & Admins)
// ==========================================

// Bulk Generate Pins (Admin)
app.post('/api/pins/generate', authenticateToken, requireRole('admin'), async (req, res) => {
  const { count } = req.body;
  const pinCount = parseInt(count || 50);

  try {
    for (let i = 0; i < pinCount; i++) {
      const pin = generateRandomPIN();
      await runQuery(`
        INSERT INTO RESULT_PINS (pin, usage_count, status)
        VALUES (?, 0, 'active')
      `, [pin]);
    }
    res.status(201).json({ message: `Successfully generated ${pinCount} universal PINs` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List generated PINs (Admin)
app.get('/api/pins', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const pins = await allQuery(`
      SELECT p.*, u.full_name as student_name, s.admission_number
      FROM RESULT_PINS p
      LEFT JOIN STUDENTS s ON p.student_id = s.id
      LEFT JOIN USERS u ON s.id = u.id
      ORDER BY p.generated_at DESC
    `);
    res.json(pins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify Result Pin (Student binds a new PIN to a specific term's result)
app.post('/api/pins/verify', authenticateToken, requireRole('student'), async (req, res) => {
  const { pin, term, academic_year } = req.body;
  const studentId = req.user.id;

  if (!term || !academic_year) {
    return res.status(400).json({ error: 'Term and academic session are required.' });
  }

  try {
    const pinRow = await getQuery(`
      SELECT * FROM RESULT_PINS WHERE pin = ?
    `, [pin.toUpperCase()]);

    if (!pinRow) {
      return res.status(404).json({ error: 'Invalid PIN. Please check the code and try again.' });
    }

    // If already bound to a student, check if it's bound to THIS specific student + result sheet
    if (pinRow.student_id) {
      if (pinRow.student_id !== studentId || pinRow.term !== term || pinRow.academic_year !== academic_year) {
        return res.status(403).json({ error: 'This PIN has already been used to unlock another student or result.' });
      }
      if (pinRow.status === 'exhausted' || pinRow.usage_count >= 5) {
        return res.status(403).json({ error: 'This PIN has exceeded its maximum limit of 5 checks.' });
      }
    } else {
      // Bind it to this student, term, and academic session
      await runQuery(`
        UPDATE RESULT_PINS
        SET student_id = ?, term = ?, academic_year = ?, usage_count = 0, status = 'active'
        WHERE id = ?
      `, [studentId, term, academic_year, pinRow.id]);
    }

    // Fetch updated pin state
    const updatedPin = await getQuery('SELECT * FROM RESULT_PINS WHERE id = ?', [pinRow.id]);

    res.json({
      message: 'PIN successfully verified and bound to this result sheet!',
      usage_remaining: 5 - updatedPin.usage_count
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. STUDENT REPORT CARDS (CUMULATIVE ENGINE)
// ==========================================

// Top-level Helper to generate full report card data structure
async function buildReportCardData(targetStudentId, reqTerm, reqYear) {
  // Fetch Active Term Grades
  const activeGrades = await allQuery(`
    SELECT g.*, s.name as subject_name 
    FROM GRADES g
    JOIN SUBJECTS s ON g.subject_id = s.id
    WHERE g.student_id = ? AND g.term = ? AND g.academic_year = ?
  `, [targetStudentId, reqTerm, reqYear]);

  // Complete Student Information Header
  const studentInfo = await getQuery(`
    SELECT s.*, u.full_name, u.passport_photo, c.name as class_name, c.tier, 
           fm.full_name as form_master_name, fmt.signature as form_master_signature
    FROM STUDENTS s
    JOIN USERS u ON s.id = u.id
    LEFT JOIN CLASSES c ON s.class_id = c.id
    LEFT JOIN USERS fm ON c.form_master_id = fm.id
    LEFT JOIN TEACHERS fmt ON c.form_master_id = fmt.id
    WHERE s.id = ?
  `, [targetStudentId]);

  // Fetch Unpaid Balance
  const unpaidRow = await getQuery(`
    SELECT SUM(amount_due - amount_paid) as balance 
    FROM FEE_INVOICES 
    WHERE student_id = ?
  `, [targetStudentId]);
  
  if (studentInfo) {
    studentInfo.unpaid_balance = unpaidRow && unpaidRow.balance > 0 ? unpaidRow.balance : 0;
  }

  // Fetch Attendance statistics recorded for this student
  const attendanceStats = await getQuery(`
    SELECT 
      COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END) as present,
      COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
      COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
      COUNT(*) as total
    FROM ATTENDANCE
    WHERE student_id = ?
  `, [targetStudentId]); 

  // Calculate cumulative averages if it is the 3rd Term ( Nigerian standard )
  let reports = activeGrades;
  if (reqTerm === '3rd Term') {
    const allYearGrades = await allQuery(`
      SELECT subject_id, term, total_score 
      FROM GRADES 
      WHERE student_id = ? AND academic_year = ?
    `, [targetStudentId, reqYear]);

    const subTotals = {};
    allYearGrades.forEach(g => {
      if (!subTotals[g.subject_id]) subTotals[g.subject_id] = {};
      subTotals[g.subject_id][g.term] = g.total_score;
    });

    reports = activeGrades.map(g => {
      const t1 = subTotals[g.subject_id]?.['1st Term'] || 0;
      const t2 = subTotals[g.subject_id]?.['2nd Term'] || 0;
      const t3 = g.total_score;
      
      let termsTaken = 0;
      if (t1 > 0) termsTaken++;
      if (t2 > 0) termsTaken++;
      if (t3 > 0) termsTaken++;

      const cumAverage = termsTaken > 0 ? ((t1 + t2 + t3) / termsTaken) : 0;
      const { grade, remark } = calculateGrade(cumAverage);

      return {
        ...g,
        term1_total: t1 || '-',
        term2_total: t2 || '-',
        cum_average: cumAverage.toFixed(1),
        cum_grade: grade,
        cum_remark: remark
      };
    });
  }

  const affectiveBehavioral = await allQuery(`
    SELECT bs.name, 'affective' as category, bs.target_section, COALESCE(sse.rating, 4) as rating 
    FROM AFFECTIVE_SKILLS bs
    LEFT JOIN STUDENT_AFFECTIVE_EVAL sse 
      ON bs.id = sse.skill_id 
     AND sse.student_id = ? 
     AND sse.term = ? 
     AND sse.academic_year = ?
    ORDER BY bs.name
  `, [targetStudentId, reqTerm, reqYear]);

  const psychomotorBehavioral = await allQuery(`
    SELECT bs.name, 'psychomotor' as category, bs.target_section, COALESCE(sse.rating, 4) as rating 
    FROM PSYCHOMOTOR_SKILLS bs
    LEFT JOIN STUDENT_PSYCHOMOTOR_EVAL sse 
      ON bs.id = sse.skill_id 
     AND sse.student_id = ? 
     AND sse.term = ? 
     AND sse.academic_year = ?
    ORDER BY bs.name
  `, [targetStudentId, reqTerm, reqYear]);

  const behavioral = [...affectiveBehavioral, ...psychomotorBehavioral];

  let position = null;
  let total_students = 0;
  let class_average = '0.0';
  let highest_average = '0.0';
  let lowest_average = '0.0';

  if (studentInfo && studentInfo.class_id) {
    const classId = studentInfo.class_id;
    // Get all students in this class
    const classStudents = await allQuery('SELECT id FROM STUDENTS WHERE class_id = ?', [classId]);
    total_students = classStudents.length;

    // Get all grades for all students in this class for this term and session
    const classGrades = await allQuery(`
      SELECT student_id, subject_id, total_score 
      FROM GRADES 
      WHERE term = ? AND academic_year = ? AND student_id IN (
        SELECT id FROM STUDENTS WHERE class_id = ?
      )
    `, [reqTerm, reqYear, classId]);

    // Calculate the average score for each student in the class
    const studentTotals = {};
    const studentCounts = {};

    classStudents.forEach(s => {
      studentTotals[s.id] = 0;
      studentCounts[s.id] = 0;
    });

    classGrades.forEach(g => {
      studentTotals[g.student_id] = (studentTotals[g.student_id] || 0) + g.total_score;
      studentCounts[g.student_id] = (studentCounts[g.student_id] || 0) + 1;
    });

    const rankedList = classStudents.map(s => {
      const total = studentTotals[s.id] || 0;
      const count = studentCounts[s.id] || 0;
      const avg = count > 0 ? (total / count) : 0;
      return {
        student_id: s.id,
        grandTotal: total,
        avg: avg
      };
    });

    // Sort by average descending
    rankedList.sort((a, b) => b.avg - a.avg);

    // Find position
    const rankIdx = rankedList.findIndex(r => r.student_id === parseInt(targetStudentId));
    if (rankIdx !== -1) {
      position = rankIdx + 1;
    }

    // Compute overall, highest, lowest class average
    const activeAvgs = rankedList.map(r => r.avg).filter(a => a > 0);
    if (activeAvgs.length > 0) {
      const sumAvgs = activeAvgs.reduce((sum, val) => sum + val, 0);
      class_average = (sumAvgs / activeAvgs.length).toFixed(1);
      highest_average = Math.max(...activeAvgs).toFixed(1);
      lowest_average = Math.min(...activeAvgs).toFixed(1);
    }

    // Compute position per subject for the active grades
    const subjectRanks = {};
    classGrades.forEach(cg => {
      if (!subjectRanks[cg.subject_id]) subjectRanks[cg.subject_id] = [];
      subjectRanks[cg.subject_id].push({ student_id: cg.student_id, score: cg.total_score });
    });

    // Sort each subject ranked lists descending
    Object.keys(subjectRanks).forEach(subId => {
      subjectRanks[subId].sort((a, b) => b.score - a.score);
    });

    // Map subject position to report card grades
    reports = reports.map(g => {
      const subRankList = subjectRanks[g.subject_id] || [];
      const subRankIdx = subRankList.findIndex(r => r.student_id === parseInt(targetStudentId));
      return {
        ...g,
        subject_position: subRankIdx !== -1 ? subRankIdx + 1 : '-'
      };
    });
  }

  return {
    student: studentInfo,
    grades: reports,
    attendance: attendanceStats,
    academic_year: reqYear,
    term: reqTerm,
    behavioral,
    position,
    total_students,
    class_average,
    highest_average,
    lowest_average
  };
}

// Single Report Card Route
app.get('/api/report-card/:studentId', authenticateToken, async (req, res) => {
  const { studentId } = req.params;
  const { term, year } = req.query;

  if (req.user.role === 'student' && req.user.id !== parseInt(studentId)) {
    return res.status(403).json({ error: 'Unauthorized view.' });
  }

  try {
    if (req.user.role === 'student') {
      const boundPin = await getQuery(`
        SELECT * FROM RESULT_PINS 
        WHERE student_id = ? AND term = ? AND academic_year = ?
      `, [studentId, term, year]);

      if (!boundPin) {
        return res.status(403).json({ error: 'Result Locked: Please input a result checker PIN to unlock this term\'s grades.' });
      }

      const newUsage = boundPin.usage_count + 1;
      const newStatus = newUsage >= 5 ? 'exhausted' : 'active';
      await runQuery(`
        UPDATE RESULT_PINS
        SET usage_count = ?, status = ?
        WHERE id = ?
      `, [newUsage, newStatus, boundPin.id]);
    }

    const reportCardData = await buildReportCardData(studentId, term, year);
    res.json(reportCardData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Bulk Report Cards Endpoint (Bulk Printing by Class)
app.get(['/api/report-cards/bulk', '/api/report-card/bulk'], authenticateToken, requireRole('admin'), async (req, res) => {
  const { class_id, term, year } = req.query;

  if (!class_id || !term || !year) {
    return res.status(400).json({ error: 'class_id, term, and year parameters are required.' });
  }

  try {
    const classStudents = await allQuery(`
      SELECT s.id 
      FROM STUDENTS s
      JOIN USERS u ON s.id = u.id
      WHERE s.class_id = ?
      ORDER BY u.full_name ASC
    `, [class_id]);

    const results = [];
    for (const student of classStudents) {
      const report = await buildReportCardData(student.id, term, year);
      if (report && report.student) {
        results.push(report);
      }
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// RESULT UPLOAD PROGRESS TRACKING ENDPOINTS
// ==========================================

// 1. Teacher Result Upload Progress Endpoint
app.get('/api/teacher/result-progress', authenticateToken, requireRole('teacher', 'form_master'), async (req, res) => {
  try {
    const settings = await getQuery('SELECT active_term, active_session FROM SYSTEM_SETTINGS ORDER BY id DESC LIMIT 1');
    const term = settings ? settings.active_term : '3rd Term';
    const year = settings ? settings.active_session : '2026/2027';

    const assignments = await allQuery(`
      SELECT cs.class_id, cs.subject_id, c.name as class_name, s.name as subject_name 
      FROM CLASS_SUBJECTS cs
      JOIN CLASSES c ON cs.class_id = c.id
      JOIN SUBJECTS s ON cs.subject_id = s.id
      WHERE cs.teacher_id = ?
      ORDER BY c.name, s.name
    `, [req.user.id]);

    const details = [];
    let completedCount = 0;
    let inProgressCount = 0;
    let pendingCount = 0;

    for (const item of assignments) {
      const studentCountRow = await getQuery('SELECT COUNT(*) as count FROM STUDENTS WHERE class_id = ?', [item.class_id]);
      const totalStudents = studentCountRow ? studentCountRow.count : 0;

      const uploadedRow = await getQuery(`
        SELECT COUNT(DISTINCT student_id) as count 
        FROM GRADES 
        WHERE subject_id = ? AND term = ? AND academic_year = ? AND student_id IN (
          SELECT id FROM STUDENTS WHERE class_id = ?
        )
      `, [item.subject_id, term, year, item.class_id]);
      const uploadedCount = uploadedRow ? uploadedRow.count : 0;

      let status = 'Pending';
      if (totalStudents > 0 && uploadedCount >= totalStudents) {
        status = 'Completed';
        completedCount++;
      } else if (uploadedCount > 0) {
        status = 'In Progress';
        inProgressCount++;
      } else {
        pendingCount++;
      }

      const pct = totalStudents > 0 ? Math.min(100, Math.round((uploadedCount / totalStudents) * 100)) : 0;

      details.push({
        class_id: item.class_id,
        subject_id: item.subject_id,
        class_name: item.class_name,
        subject_name: item.subject_name,
        total_students: totalStudents,
        uploaded_count: uploadedCount,
        percentage: pct,
        status
      });
    }

    const total = assignments.length;
    const overallPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    res.json({
      term,
      academic_year: year,
      summary: {
        total,
        completed: completedCount,
        in_progress: inProgressCount,
        pending: pendingCount,
        percentage: overallPct
      },
      details
    });
  } catch (err) {
    console.error('Error fetching teacher result progress:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Admin Result Upload Progress Endpoint
app.get('/api/admin/result-progress', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const settings = await getQuery('SELECT active_term, active_session FROM SYSTEM_SETTINGS ORDER BY id DESC LIMIT 1');
    const term = settings ? settings.active_term : '3rd Term';
    const year = settings ? settings.active_session : '2026/2027';

    const allocations = await allQuery(`
      SELECT cs.class_id, cs.subject_id, cs.teacher_id, 
             c.name as class_name, s.name as subject_name, u.full_name as teacher_name
      FROM CLASS_SUBJECTS cs
      JOIN CLASSES c ON cs.class_id = c.id
      JOIN SUBJECTS s ON cs.subject_id = s.id
      LEFT JOIN USERS u ON cs.teacher_id = u.id
      ORDER BY c.name, s.name
    `);

    const details = [];
    let completedCount = 0;
    let inProgressCount = 0;
    let pendingCount = 0;

    for (const item of allocations) {
      const studentCountRow = await getQuery('SELECT COUNT(*) as count FROM STUDENTS WHERE class_id = ?', [item.class_id]);
      const totalStudents = studentCountRow ? studentCountRow.count : 0;

      const uploadedRow = await getQuery(`
        SELECT COUNT(DISTINCT student_id) as count 
        FROM GRADES 
        WHERE subject_id = ? AND term = ? AND academic_year = ? AND student_id IN (
          SELECT id FROM STUDENTS WHERE class_id = ?
        )
      `, [item.subject_id, term, year, item.class_id]);
      const uploadedCount = uploadedRow ? uploadedRow.count : 0;

      let status = 'Pending';
      if (totalStudents > 0 && uploadedCount >= totalStudents) {
        status = 'Completed';
        completedCount++;
      } else if (uploadedCount > 0) {
        status = 'In Progress';
        inProgressCount++;
      } else {
        pendingCount++;
      }

      const pct = totalStudents > 0 ? Math.min(100, Math.round((uploadedCount / totalStudents) * 100)) : 0;

      details.push({
        class_id: item.class_id,
        subject_id: item.subject_id,
        teacher_id: item.teacher_id,
        class_name: item.class_name,
        subject_name: item.subject_name,
        teacher_name: item.teacher_name || 'Unassigned',
        total_students: totalStudents,
        uploaded_count: uploadedCount,
        percentage: pct,
        status
      });
    }

    const total = allocations.length;
    const overallPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    res.json({
      term,
      academic_year: year,
      summary: {
        total,
        completed: completedCount,
        in_progress: inProgressCount,
        pending: pendingCount,
        percentage: overallPct
      },
      details
    });
  } catch (err) {
    console.error('Error fetching admin result progress:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get Student Complete Academic Timeline (Past terms and grades recorded)
app.get('/api/student/timeline/:studentId', authenticateToken, async (req, res) => {
  const { studentId } = req.params;
  
  if (req.user.role === 'student' && req.user.id !== parseInt(studentId)) {
    return res.status(403).json({ error: 'Unauthorized view.' });
  }

  try {
    const timeline = await allQuery(`
      SELECT DISTINCT term, academic_year 
      FROM GRADES 
      WHERE student_id = ? 
      ORDER BY academic_year DESC, term DESC
    `, [studentId]);

    // Check which terms have verified PINs bound to student
    const unlockedPins = await allQuery(`
      SELECT term, academic_year, usage_count 
      FROM RESULT_PINS 
      WHERE student_id = ?
    `, [studentId]);

    res.json({ timeline, unlockedPins });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9B. SCHEME OF WORK SYSTEM
// ==========================================

// Get schemes of work
app.get('/api/schemes', authenticateToken, async (req, res) => {
  const { class_id, subject_id, term } = req.query;
  try {
    let query = `
      SELECT s.*, c.name as class_name, sub.name as subject_name, u.full_name as author_name
      FROM SCHEME_OF_WORK s
      JOIN CLASSES c ON s.class_id = c.id
      JOIN SUBJECTS sub ON s.subject_id = sub.id
      LEFT JOIN USERS u ON s.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'teacher') {
      // Limit to teacher's assigned subjects
      query += ` AND (s.class_id, s.subject_id) IN (
        SELECT class_id, subject_id FROM CLASS_SUBJECTS WHERE teacher_id = ?
      )`;
      params.push(req.user.id);
    } else if (req.user.role === 'student') {
      // Limit to student's class
      query += ` AND s.class_id = ?`;
      params.push(req.user.class_id);
    }

    if (class_id) {
      query += ` AND s.class_id = ?`;
      params.push(class_id);
    }
    if (subject_id) {
      query += ` AND s.subject_id = ?`;
      params.push(subject_id);
    }
    if (term) {
      query += ` AND s.term = ?`;
      params.push(term);
    }

    query += ` ORDER BY s.class_id, s.subject_id, s.term, s.week`;

    const rows = await allQuery(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save or Update a scheme entry (Admin Only)
app.post('/api/schemes', authenticateToken, requireRole('admin'), async (req, res) => {
  const { class_id, subject_id, term, week, topic, subtitle, objectives } = req.body;

  if (!class_id || !subject_id || !term || !week || !topic) {
    return res.status(400).json({ error: 'Class ID, Subject ID, term, week, and topic are required' });
  }

  try {
    await runQuery(`
      INSERT INTO SCHEME_OF_WORK (class_id, subject_id, term, week, topic, subtitle, objectives, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(class_id, subject_id, term, week) DO UPDATE SET
        topic = excluded.topic,
        subtitle = excluded.subtitle,
        objectives = excluded.objectives,
        created_by = excluded.created_by
    `, [class_id, subject_id, term, week, topic, subtitle || null, objectives || null, req.user.id]);

    res.json({ message: 'Scheme of work entry saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a scheme entry (Admin Only)
app.delete('/api/schemes/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const entry = await getQuery('SELECT id FROM SCHEME_OF_WORK WHERE id = ?', [req.params.id]);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    await runQuery('DELETE FROM SCHEME_OF_WORK WHERE id = ?', [req.params.id]);
    res.json({ message: 'Scheme of work entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. FINANCE & FEES SYSTEM (OFFLINE LOGGING)
// ==========================================

// Add Invoice to specific class OR whole tier
app.post('/api/fees/add', authenticateToken, requireRole('admin'), async (req, res) => {
  const { title, category = 'School Fees', amount, class_id, tier } = req.body;
  const parsedAmount = parseFloat(amount);

  try {
    let studentIds = [];
    if (class_id) {
      const rows = await allQuery('SELECT id FROM STUDENTS WHERE class_id = ?', [class_id]);
      studentIds = rows.map(r => r.id);
    } else if (tier) {
      const rows = await allQuery(`
        SELECT s.id FROM STUDENTS s
        JOIN CLASSES c ON s.class_id = c.id
        WHERE c.tier = ?
      `, [tier]);
      studentIds = rows.map(r => r.id);
    }

    if (studentIds.length === 0) {
      return res.status(400).json({ error: 'No students found in the specified target Class/Tier.' });
    }

    for (const sId of studentIds) {
      await runQuery(`
        INSERT INTO FEE_INVOICES (student_id, title, category, amount_due, amount_paid, status)
        VALUES (?, ?, ?, ?, 0, 'unpaid')
      `, [sId, title, category || 'School Fees', parsedAmount]);
    }

    res.status(201).json({ message: `Invoice successfully created for ${studentIds.length} students.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Log payment manually (Admin registers cash / transfer)
app.post('/api/fees/pay', authenticateToken, requireRole('admin'), async (req, res) => {
  const { invoice_id, amount_paid, payment_method } = req.body;
  const paidVal = parseFloat(amount_paid);

  try {
    const invoice = await getQuery('SELECT * FROM FEE_INVOICES WHERE id = ?', [invoice_id]);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });

    const totalPaid = invoice.amount_paid + paidVal;
    let status = 'unpaid';
    if (totalPaid >= invoice.amount_due) status = 'paid';
    else if (totalPaid > 0) status = 'partial';

    // Update Invoice
    await runQuery(`
      UPDATE FEE_INVOICES 
      SET amount_paid = ?, status = ? 
      WHERE id = ?
    `, [totalPaid, status, invoice_id]);

    // Create Receipt
    const receiptNum = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await runQuery(`
      INSERT INTO FEE_RECEIPTS (invoice_id, receipt_number, amount_paid, payment_date, payment_method, logged_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [invoice_id, receiptNum, paidVal, new Date().toISOString().split('T')[0], payment_method, req.user.id]);

    res.json({ message: 'Payment successfully logged!', receipt_number: receiptNum });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Invoice receipts & outstanding fees for specific student
app.get('/api/fees/student/:studentId', authenticateToken, async (req, res) => {
  const { studentId } = req.params;

  if (req.user.role === 'student' && req.user.id !== parseInt(studentId)) {
    return res.status(403).json({ error: 'Unauthorized access.' });
  }

  try {
    const invoices = await allQuery(`
      SELECT * FROM FEE_INVOICES WHERE student_id = ?
    `, [studentId]);

    const receipts = await allQuery(`
      SELECT r.*, i.title, i.amount_due, u.full_name as logged_by_name
      FROM FEE_RECEIPTS r
      JOIN FEE_INVOICES i ON r.invoice_id = i.id
      LEFT JOIN USERS u ON r.logged_by = u.id
      WHERE i.student_id = ?
    `, [studentId]);

    res.json({ invoices, receipts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10B. BEHAVIORAL & PSYCHOMOTOR GRADES
// ==========================================
app.get('/api/behavioral/:studentId', authenticateToken, async (req, res) => {
  const { studentId } = req.params;
  const { term, year } = req.query;
  try {
    const row = await getQuery(`
      SELECT * FROM BEHAVIORAL_GRADES 
      WHERE student_id = ? AND term = ? AND academic_year = ?
    `, [studentId, term, year]);
    
    res.json(row || {
      student_id: parseInt(studentId),
      term,
      academic_year: year,
      punctuality: 3, neatness: 3, honesty: 3, self_control: 3, 
      peer_relationship: 3, sports: 3, manual_skills: 3, musical_skills: 3, verbal_fluency: 3
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/behavioral/save', authenticateToken, async (req, res) => {
  const { student_id, class_id, term, academic_year, punctuality, neatness, honesty, self_control, peer_relationship, sports, manual_skills, musical_skills, verbal_fluency } = req.body;

  try {
    if (req.user.role === 'teacher') {
      const cls = await getQuery('SELECT form_master_id FROM CLASSES WHERE id = ?', [class_id]);
      if (!cls || cls.form_master_id != req.user.id) {
        return res.status(403).json({ error: 'Access denied: You are not the Form Master of this class.' });
      }
    }

    await runQuery(`
      INSERT INTO BEHAVIORAL_GRADES (
        student_id, term, academic_year, punctuality, neatness, honesty,
        self_control, peer_relationship, sports, manual_skills, musical_skills, verbal_fluency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(student_id, term, academic_year) DO UPDATE SET
        punctuality = excluded.punctuality,
        neatness = excluded.neatness,
        honesty = excluded.honesty,
        self_control = excluded.self_control,
        peer_relationship = excluded.peer_relationship,
        sports = excluded.sports,
        manual_skills = excluded.manual_skills,
        musical_skills = excluded.musical_skills,
        verbal_fluency = excluded.verbal_fluency
    `, [
      student_id, term, academic_year, punctuality, neatness, honesty,
      self_control, peer_relationship, sports, manual_skills, musical_skills, verbal_fluency
    ]);

    res.json({ message: 'Behavioral and psychomotor grades saved successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Promoted Class IDs for active session
app.get('/api/promoted-classes', authenticateToken, async (req, res) => {
  const { session_name } = req.query;
  try {
    const settings = await getQuery('SELECT active_session FROM SYSTEM_SETTINGS ORDER BY id DESC LIMIT 1');
    const targetSession = session_name || (settings ? settings.active_session : '');
    const rows = await allQuery('SELECT class_id FROM PROMOTED_CLASSES WHERE session_name = ?', [targetSession]);
    res.json(rows.map(r => r.class_id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset Promoted Class tracking for active session (Admin)
app.post('/api/promoted-classes/reset', authenticateToken, requireRole('admin'), async (req, res) => {
  const { session_name } = req.body;
  try {
    const settings = await getQuery('SELECT active_session FROM SYSTEM_SETTINGS ORDER BY id DESC LIMIT 1');
    const targetSession = session_name || (settings ? settings.active_session : '');
    await runQuery('DELETE FROM PROMOTED_CLASSES WHERE session_name = ?', [targetSession]);
    res.json({ message: 'Promotion tracking reset for session.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 11. STUDENT PROMOTION ENGINE
// ==========================================
app.post('/api/students/promote-bulk', authenticateToken, requireRole('admin'), async (req, res) => {
  const { source_class_id, target_class_id, selected_student_ids } = req.body;

  try {
    const settings = await getQuery('SELECT active_session FROM SYSTEM_SETTINGS ORDER BY id DESC LIMIT 1');
    const activeSession = settings ? settings.active_session : '';

    let studentIdsToPromote = [];
    if (Array.isArray(selected_student_ids) && selected_student_ids.length > 0) {
      studentIdsToPromote = selected_student_ids;
    } else if (source_class_id) {
      const students = await allQuery('SELECT id FROM STUDENTS WHERE class_id = ?', [source_class_id]);
      studentIdsToPromote = students.map(s => s.id);
    }

    if (studentIdsToPromote.length === 0) {
      return res.status(400).json({ error: 'No students selected for promotion.' });
    }

    for (const studId of studentIdsToPromote) {
      if (target_class_id === 'graduate') {
        await runQuery("UPDATE STUDENTS SET status = 'graduated', class_id = NULL WHERE id = ?", [studId]);
      } else {
        await runQuery("UPDATE STUDENTS SET class_id = ? WHERE id = ?", [target_class_id, studId]);
      }
    }

    // Record source class as promoted for this active session
    if (source_class_id) {
      await runQuery(`
        INSERT OR REPLACE INTO PROMOTED_CLASSES (class_id, session_name)
        VALUES (?, ?)
      `, [source_class_id, activeSession]);
    }

    res.json({ message: `Successfully updated ${studentIdsToPromote.length} students' class status.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Promotion for individual student
app.post('/api/students/promote-individual', authenticateToken, requireRole('admin'), async (req, res) => {
  const { student_id, target_class_id, status } = req.body;

  try {
    if (target_class_id === 'graduate') {
      await runQuery("UPDATE STUDENTS SET status = 'graduated', class_id = NULL WHERE id = ?", [student_id]);
    } else {
      await runQuery("UPDATE STUDENTS SET class_id = ?, status = ? WHERE id = ?", [target_class_id, status || 'active', student_id]);
    }
    res.json({ message: 'Student promotion/status updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 12. NEW ADVANCED OPERATIONS ENDPOINTS
// ==========================================

// Subject PUT (Admin Only)
app.put('/api/subjects/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { name, tier, class_ids } = req.body;
  if (!name || !tier) {
    return res.status(400).json({ error: 'Name and tier are required' });
  }
  try {
    const subject = await getQuery('SELECT id FROM SUBJECTS WHERE id = ?', [id]);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    await runQuery('UPDATE SUBJECTS SET name = ?, tier = ? WHERE id = ?', [name, tier, id]);
    
    if (class_ids && Array.isArray(class_ids)) {
      await runQuery('DELETE FROM CLASS_SUBJECTS WHERE subject_id = ?', [id]);
      for (const cid of class_ids) {
        await runQuery('INSERT OR IGNORE INTO CLASS_SUBJECTS (class_id, subject_id) VALUES (?, ?)', [cid, id]);
      }
    }
    
    res.json({ message: 'Subject updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Subject DELETE (Admin Only)
app.delete('/api/subjects/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const subject = await getQuery('SELECT id FROM SUBJECTS WHERE id = ?', [id]);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    await runQuery('DELETE FROM SUBJECTS WHERE id = ?', [id]);
    res.json({ message: 'Subject deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Academic Sessions (All Roles)
app.get('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const sessions = await allQuery('SELECT * FROM ACADEMIC_SESSIONS ORDER BY session_name DESC');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Academic Session (Admin Only)
app.post('/api/sessions', authenticateToken, requireRole('admin'), async (req, res) => {
  const { session_name } = req.body;
  if (!session_name) return res.status(400).json({ error: 'Session name is required' });

  try {
    await runQuery('INSERT INTO ACADEMIC_SESSIONS (session_name, is_current) VALUES (?, 0)', [session_name]);
    res.status(201).json({ message: 'Academic session created successfully' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Session already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Set Active Session (Admin Only)
app.post('/api/sessions/set-active', authenticateToken, requireRole('admin'), async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Session ID is required' });

  try {
    const session = await getQuery('SELECT * FROM ACADEMIC_SESSIONS WHERE id = ?', [id]);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Transaction to update is_current
    await runQuery('UPDATE ACADEMIC_SESSIONS SET is_current = 0');
    await runQuery('UPDATE ACADEMIC_SESSIONS SET is_current = 1 WHERE id = ?', [id]);

    // Also update current active session in SYSTEM_SETTINGS
    await runQuery(`
      UPDATE SYSTEM_SETTINGS 
      SET active_session = ? 
      WHERE id = (SELECT id FROM SYSTEM_SETTINGS ORDER BY id DESC LIMIT 1)
    `, [session.session_name]);

    res.json({ message: `Session ${session.session_name} is now the active current session.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Fee Structures
app.get('/api/fees/structures', authenticateToken, async (req, res) => {
  try {
    const structures = await allQuery('SELECT * FROM FEE_STRUCTURES ORDER BY tier');
    res.json(structures);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Fee Structure (Admin Only)
app.post('/api/fees/structures', authenticateToken, requireRole('admin'), async (req, res) => {
  const { title, category = 'School Fees', amount, tier } = req.body;
  if (!title || !amount || !tier) {
    return res.status(400).json({ error: 'Title, amount, and tier are required' });
  }
  try {
    await runQuery(`
      INSERT INTO FEE_STRUCTURES (title, category, amount, tier) VALUES (?, ?, ?, ?)
    `, [title, category || 'School Fees', parseFloat(amount), tier]);
    res.status(201).json({ message: 'Fee structure created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Fee Structure (Admin Only)
app.put('/api/fees/structures/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { title, category = 'School Fees', amount, tier } = req.body;
  if (!title || !amount || !tier) {
    return res.status(400).json({ error: 'Title, amount, and tier are required' });
  }
  try {
    const structure = await getQuery('SELECT id FROM FEE_STRUCTURES WHERE id = ?', [id]);
    if (!structure) return res.status(404).json({ error: 'Fee structure not found' });

    await runQuery(`
      UPDATE FEE_STRUCTURES 
      SET title = ?, category = ?, amount = ?, tier = ? 
      WHERE id = ?
    `, [title, category || 'School Fees', parseFloat(amount), tier, id]);

    res.json({ message: 'Fee structure updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Fee Structure (Admin Only)
app.delete('/api/fees/structures/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const structure = await getQuery('SELECT id FROM FEE_STRUCTURES WHERE id = ?', [id]);
    if (!structure) return res.status(404).json({ error: 'Fee structure not found' });

    await runQuery('DELETE FROM FEE_STRUCTURES WHERE id = ?', [id]);
    res.json({ message: 'Fee structure deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get School Fees Paid Audit Report (Admin Only)
app.get('/api/fees/report', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const report = await allQuery(`
      SELECT f.*, u.full_name, s.admission_number, c.name as class_name
      FROM FEE_INVOICES f
      JOIN STUDENTS s ON f.student_id = s.id
      JOIN USERS u ON s.id = u.id
      LEFT JOIN CLASSES c ON s.class_id = c.id
      ORDER BY c.name, u.full_name, f.title
    `);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change Password Endpoint (All Authenticated Users)
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  try {
    const user = await getQuery('SELECT password_hash FROM USERS WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await runQuery('UPDATE USERS SET password_hash = ? WHERE id = ?', [hashedNew, userId]);

    res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize database then start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Jere Model Academy Backend server running on port ${PORT}...`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
