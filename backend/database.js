const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const isMySQL = !!(process.env.MYSQL_URL || process.env.DB_HOST);

let mysqlPool = null;
let sqliteDb = null;

if (isMySQL) {
  console.log('Database Client: Initializing MySQL connection pool...');
  const config = process.env.MYSQL_URL || {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school',
    port: parseInt(process.env.DB_PORT || '3306'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  };
  mysqlPool = mysql.createPool(config);
} else {
  console.log('Database Client: Initializing local SQLite database (school.db)...');
  const dbPath = path.join(__dirname, 'school.db');
  sqliteDb = new sqlite3.Database(dbPath);
}

function translateSQL(sql) {
  if (!isMySQL) return sql;
  return sql
    .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'INT AUTO_INCREMENT PRIMARY KEY')
    .replace(/INTEGER PRIMARY KEY/gi, 'INT PRIMARY KEY')
    .replace(/AUTOINCREMENT/gi, 'AUTO_INCREMENT')
    .replace(/\bREAL\b/gi, 'DOUBLE')
    .replace(/\bTEXT UNIQUE\b/gi, 'VARCHAR(255) UNIQUE')
    .replace(/\bTEXT NOT NULL\b/gi, 'VARCHAR(255) NOT NULL')
    .replace(/\bTEXT\b/gi, 'VARCHAR(255)')
    .replace(/created_at VARCHAR\(255\) DEFAULT CURRENT_TIMESTAMP/gi, 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
    .replace(/generated_at VARCHAR\(255\) DEFAULT CURRENT_TIMESTAMP/gi, 'generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
    .replace(/INSERT OR IGNORE/gi, 'INSERT IGNORE')
    .replace(/ON CONFLICT\([^)]+\)\s+DO\s+UPDATE\s+SET/gi, 'ON DUPLICATE KEY UPDATE')
    .replace(/excluded\.([a-zA-Z0-9_]+)/gi, 'VALUES($1)');
}

function runQuery(query, params = []) {
  const sql = translateSQL(query);
  if (isMySQL) {
    return mysqlPool.execute(sql, params).then(([results]) => {
      return {
        lastID: results.insertId,
        changes: results.affectedRows
      };
    });
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }
}

function getQuery(query, params = []) {
  const sql = translateSQL(query);
  if (isMySQL) {
    return mysqlPool.execute(sql, params).then(([results]) => results[0] || null);
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

function allQuery(query, params = []) {
  const sql = translateSQL(query);
  if (isMySQL) {
    return mysqlPool.execute(sql, params).then(([results]) => results);
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

async function initDB() {
  console.log('Initializing Database...');
  
  if (!isMySQL) {
    // Enable foreign key constraints for SQLite
    await runQuery('PRAGMA foreign_keys = ON;');
  }

  // Create SYSTEM_SETTINGS Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS SYSTEM_SETTINGS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      active_session TEXT NOT NULL,
      active_term TEXT NOT NULL,
      result_entry_open INTEGER NOT NULL DEFAULT 1
    );
  `);

  // Migrate/Extend settings table for customization fields if needed
  const checkCols = [
    'landing_school_name', 'landing_tagline', 'landing_hero_title', 'landing_hero_desc', 'landing_address', 
    'result_show_position', 'result_show_average', 'contact_phone', 'contact_email', 
    'ca1_name', 'ca2_name', 'ca3_name', 'ca4_name', 'exam_name',
    'games_master_name', 'games_master_remark', 'house_master_name', 'house_master_remark', 'principal_name', 'principal_signature',
    'next_term_fee', 'next_term_begins', 'next_term_ends', 'last_term_debit',
    'allow_past_attendance', 'allow_fm_register_student', 'allow_fm_edit_student', 'max_ca_count'
  ];
  for (const col of checkCols) {
    try {
      if (['result_show_position', 'result_show_average'].includes(col)) {
        await runQuery(`ALTER TABLE SYSTEM_SETTINGS ADD COLUMN ${col} INTEGER DEFAULT 1`);
      } else if (['allow_past_attendance', 'allow_fm_register_student', 'allow_fm_edit_student'].includes(col)) {
        await runQuery(`ALTER TABLE SYSTEM_SETTINGS ADD COLUMN ${col} INTEGER DEFAULT 0`);
      } else if (col === 'max_ca_count') {
        await runQuery(`ALTER TABLE SYSTEM_SETTINGS ADD COLUMN ${col} INTEGER DEFAULT 4`);
      } else {
        await runQuery(`ALTER TABLE SYSTEM_SETTINGS ADD COLUMN ${col} TEXT`);
      }
    } catch (e) {
      // Column already exists, ignore
    }
  }

  // Create USERS Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS USERS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student')),
      passport_photo TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create CLASSES Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS CLASSES (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      tier TEXT NOT NULL CHECK(tier IN ('nursery', 'primary', 'jss', 'sss')),
      form_master_id INTEGER,
      FOREIGN KEY(form_master_id) REFERENCES USERS(id) ON DELETE SET NULL
    );
  `);

  // Create STUDENTS Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS STUDENTS (
      id INTEGER PRIMARY KEY,
      class_id INTEGER,
      admission_number TEXT UNIQUE NOT NULL,
      date_of_birth TEXT,
      class_of_entry TEXT,
      term_year_of_entry TEXT,
      last_school_attended TEXT,
      address_residence TEXT,
      sex TEXT,
      religion TEXT,
      local_government TEXT,
      state_of_origin TEXT,
      handicapped INTEGER DEFAULT 0,
      handicap_details TEXT,
      parent_name TEXT,
      parent_address TEXT,
      parent_phone TEXT,
      undertaking_signed INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      FOREIGN KEY(id) REFERENCES USERS(id) ON DELETE CASCADE,
      FOREIGN KEY(class_id) REFERENCES CLASSES(id) ON DELETE SET NULL
    );
  `);

  // Create TEACHERS Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS TEACHERS (
      id INTEGER PRIMARY KEY,
      surname TEXT,
      first_name TEXT,
      other_names TEXT,
      address TEXT,
      state_of_residence TEXT,
      lga_of_residence TEXT,
      signature TEXT,
      status TEXT DEFAULT 'active',
      FOREIGN KEY(id) REFERENCES USERS(id) ON DELETE CASCADE
    );
  `);

  // Create SUBJECTS Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS SUBJECTS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      tier TEXT NOT NULL CHECK(tier IN ('nursery', 'primary', 'jss', 'sss')),
      UNIQUE(name, tier)
    );
  `);

  // Create CLASS_SUBJECTS Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS CLASS_SUBJECTS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER,
      subject_id INTEGER,
      teacher_id INTEGER,
      FOREIGN KEY(class_id) REFERENCES CLASSES(id) ON DELETE CASCADE,
      FOREIGN KEY(subject_id) REFERENCES SUBJECTS(id) ON DELETE CASCADE,
      FOREIGN KEY(teacher_id) REFERENCES USERS(id) ON DELETE SET NULL,
      UNIQUE(class_id, subject_id)
    );
  `);

  // Create GRADES Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS GRADES (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      subject_id INTEGER,
      term TEXT NOT NULL,
      academic_year TEXT NOT NULL,
      ca1 REAL DEFAULT 0,
      ca2 REAL DEFAULT 0,
      ca3 REAL DEFAULT 0,
      ca4 REAL DEFAULT 0,
      exam_score REAL DEFAULT 0,
      total_score REAL DEFAULT 0,
      grade_letter TEXT,
      remark TEXT,
      FOREIGN KEY(student_id) REFERENCES STUDENTS(id) ON DELETE CASCADE,
      FOREIGN KEY(subject_id) REFERENCES SUBJECTS(id) ON DELETE CASCADE,
      UNIQUE(student_id, subject_id, term, academic_year)
    );
  `);

  // Create RESULT_PINS Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS RESULT_PINS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pin TEXT UNIQUE NOT NULL,
      student_id INTEGER,
      term TEXT NOT NULL,
      academic_year TEXT NOT NULL,
      usage_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      generated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(student_id) REFERENCES STUDENTS(id) ON DELETE SET NULL
    );
  `);

  // Create PROMOTED_CLASSES Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS PROMOTED_CLASSES (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL,
      session_name TEXT NOT NULL,
      promoted_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(class_id, session_name)
    );
  `);

  // Create ATTENDANCE Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS ATTENDANCE (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'late')),
      marked_by INTEGER,
      FOREIGN KEY(student_id) REFERENCES STUDENTS(id) ON DELETE CASCADE,
      FOREIGN KEY(marked_by) REFERENCES USERS(id) ON DELETE SET NULL,
      UNIQUE(student_id, date)
    );
  `);

  // Create BEHAVIORAL_SKILLS Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS BEHAVIORAL_SKILLS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('affective', 'psychomotor')),
      target_section TEXT DEFAULT 'secondary' CHECK(target_section IN ('primary', 'secondary', 'all')),
      UNIQUE(name, category, target_section)
    );
  `);

  // Migration check to ensure all categories are lowercase
  try {
    await runQuery(`UPDATE BEHAVIORAL_SKILLS SET category = LOWER(category) WHERE category != LOWER(category)`);
  } catch (err) {}

  // Migration check to add target_section column
  try {
    await runQuery(`ALTER TABLE BEHAVIORAL_SKILLS ADD COLUMN target_section TEXT DEFAULT 'secondary' CHECK(target_section IN ('primary', 'secondary', 'all'))`);
  } catch (err) {}

  // Create STUDENT_SKILLS_EVALUATION Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS STUDENT_SKILLS_EVALUATION (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      skill_id INTEGER,
      term TEXT NOT NULL,
      academic_year TEXT NOT NULL,
      rating INTEGER CHECK(rating BETWEEN 1 AND 5),
      FOREIGN KEY(student_id) REFERENCES STUDENTS(id) ON DELETE CASCADE,
      FOREIGN KEY(skill_id) REFERENCES BEHAVIORAL_SKILLS(id) ON DELETE CASCADE,
      UNIQUE(student_id, skill_id, term, academic_year)
    );
  `);

  // Create FEE_INVOICES Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS FEE_INVOICES (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'School Fees',
      amount_due REAL NOT NULL,
      amount_paid REAL DEFAULT 0,
      status TEXT DEFAULT 'unpaid' CHECK(status IN ('unpaid', 'partial', 'paid')),
      FOREIGN KEY(student_id) REFERENCES STUDENTS(id) ON DELETE CASCADE
    );
  `);

  // Migration check for category column in FEE_INVOICES
  try {
    await runQuery(`ALTER TABLE FEE_INVOICES ADD COLUMN category TEXT DEFAULT 'School Fees'`);
  } catch (err) {}

  // Create FEE_RECEIPTS Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS FEE_RECEIPTS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER,
      receipt_number TEXT UNIQUE NOT NULL,
      amount_paid REAL NOT NULL,
      payment_date TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      logged_by INTEGER,
      FOREIGN KEY(invoice_id) REFERENCES FEE_INVOICES(id) ON DELETE CASCADE,
      FOREIGN KEY(logged_by) REFERENCES USERS(id) ON DELETE SET NULL
    );
  `);

  // Create ACADEMIC_SESSIONS Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS ACADEMIC_SESSIONS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_name TEXT UNIQUE NOT NULL,
      is_current INTEGER DEFAULT 0
    );
  `);

  // Create FEE_STRUCTURES Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS FEE_STRUCTURES (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'School Fees',
      amount REAL NOT NULL,
      tier TEXT NOT NULL CHECK(tier IN ('nursery', 'primary', 'jss', 'sss'))
    );
  `);

  // Migration check for category column in FEE_STRUCTURES
  try {
    await runQuery(`ALTER TABLE FEE_STRUCTURES ADD COLUMN category TEXT DEFAULT 'School Fees'`);
  } catch (err) {}

  // Create SCHEME_OF_WORK Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS SCHEME_OF_WORK (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      term TEXT NOT NULL,
      week INTEGER NOT NULL,
      topic TEXT NOT NULL,
      subtitle TEXT,
      objectives TEXT,
      created_by INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(class_id) REFERENCES CLASSES(id) ON DELETE CASCADE,
      FOREIGN KEY(subject_id) REFERENCES SUBJECTS(id) ON DELETE CASCADE,
      FOREIGN KEY(created_by) REFERENCES USERS(id) ON DELETE SET NULL,
      UNIQUE(class_id, subject_id, term, week)
    );
  `);

  // Migration check for subtitle column in SCHEME_OF_WORK
  try {
    await runQuery(`ALTER TABLE SCHEME_OF_WORK ADD COLUMN subtitle TEXT`);
  } catch (err) {}

  // Migrate status column on USERS
  try {
    await runQuery(`ALTER TABLE USERS ADD COLUMN status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'inactive'))`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Check if settings are already seeded
  const settings = await getQuery('SELECT COUNT(*) as count FROM SYSTEM_SETTINGS');
  if (settings.count === 0) {
    console.log('Seeding initial system settings...');
    await runQuery(`
      INSERT INTO SYSTEM_SETTINGS (active_session, active_term, result_entry_open, landing_school_name, landing_tagline, landing_hero_title, landing_hero_desc, landing_address, result_show_position, result_show_average, contact_phone, contact_email, ca1_name, ca2_name, ca3_name, ca4_name, exam_name, allow_past_attendance, allow_fm_register_student, allow_fm_edit_student, max_ca_count) 
      VALUES ('2026/2027', '3rd Term', 1, 'Jere Model Academy', 'KADUNA STATE, NIGERIA', 'Shaping Minds, Building the Future.', 'Welcome to the Jere Model Academy online school portal. We provide high-quality education from Nursery, Primary, Junior Secondary to Senior Secondary School levels. Our portal makes result checking, fee logging, and attendance tracking simple, fast, and completely digital.', 'Opposite Jabal-Annur Mosque, New Abuja Road, Jere Kagarko LGA, Kaduna State.', 1, 1, '08031234567', 'admin@jeremodel.com', 'CA 1', 'CA 2', 'CA 3', 'CA 4', 'Exam', 0, 0, 0, 4)
    `);
  } else {
    // If already seeded, ensure new columns are updated if they contain NULL
    await runQuery(`
      UPDATE SYSTEM_SETTINGS 
      SET 
        landing_school_name = COALESCE(landing_school_name, 'Jere Model Academy'),
        landing_tagline = COALESCE(landing_tagline, 'KADUNA STATE, NIGERIA'),
        landing_hero_title = COALESCE(landing_hero_title, 'Shaping Minds, Building the Future.'),
        landing_hero_desc = COALESCE(landing_hero_desc, 'Welcome to the Jere Model Academy online school portal. We provide high-quality education from Nursery, Primary, Junior Secondary to Senior Secondary School levels. Our portal makes result checking, fee logging, and attendance tracking simple, fast, and completely digital.'),
        landing_address = COALESCE(landing_address, 'Opposite Jabal-Annur Mosque, New Abuja Road, Jere Kagarko LGA, Kaduna State.'),
        result_show_position = COALESCE(result_show_position, 1),
        result_show_average = COALESCE(result_show_average, 1),
        contact_phone = COALESCE(contact_phone, '08031234567'),
        contact_email = COALESCE(contact_email, 'admin@jeremodel.com'),
        ca1_name = COALESCE(ca1_name, 'CA 1'),
        ca2_name = COALESCE(ca2_name, 'CA 2'),
        ca3_name = COALESCE(ca3_name, 'CA 3'),
        ca4_name = COALESCE(ca4_name, 'CA 4'),
        exam_name = COALESCE(exam_name, 'Exam'),
        allow_past_attendance = COALESCE(allow_past_attendance, 0),
        allow_fm_register_student = COALESCE(allow_fm_register_student, 0),
        allow_fm_edit_student = COALESCE(allow_fm_edit_student, 0),
        max_ca_count = COALESCE(max_ca_count, 4)
      WHERE id = (SELECT id FROM SYSTEM_SETTINGS ORDER BY id DESC LIMIT 1)
    `);
  }

  // 1. Seed Academic Sessions
  const sessionsCount = await getQuery('SELECT COUNT(*) as count FROM ACADEMIC_SESSIONS');
  if (sessionsCount.count === 0) {
    console.log('Seeding initial academic sessions...');
    await runQuery(`INSERT INTO ACADEMIC_SESSIONS (session_name, is_current) VALUES ('2026/2027', 1)`);
    await runQuery(`INSERT INTO ACADEMIC_SESSIONS (session_name, is_current) VALUES ('2024/2025', 0)`);
    await runQuery(`INSERT INTO ACADEMIC_SESSIONS (session_name, is_current) VALUES ('2023/2024', 0)`);
  }

  // 2. Seed Fee Structures
  const feeStructCount = await getQuery('SELECT COUNT(*) as count FROM FEE_STRUCTURES');
  if (feeStructCount.count === 0) {
    console.log('Seeding initial fee structures...');
    await runQuery(`INSERT INTO FEE_STRUCTURES (title, category, amount, tier) VALUES ('Nursery School Fee', 'School Fees', 35000, 'nursery')`);
    await runQuery(`INSERT INTO FEE_STRUCTURES (title, category, amount, tier) VALUES ('Primary School Fee', 'School Fees', 40000, 'primary')`);
    await runQuery(`INSERT INTO FEE_STRUCTURES (title, category, amount, tier) VALUES ('JSS School Fee', 'School Fees', 45000, 'jss')`);
    await runQuery(`INSERT INTO FEE_STRUCTURES (title, category, amount, tier) VALUES ('SSS School Fee', 'School Fees', 50000, 'sss')`);
  }

  // 3. Seed Default Behavioral Skills
  const skillsCount = await getQuery('SELECT COUNT(*) as count FROM BEHAVIORAL_SKILLS');
  if (skillsCount.count === 0) {
    console.log('Seeding initial behavioral skills...');
    const defaultSkills = [
      { name: 'Punctuality', category: 'affective' },
      { name: 'Neatness', category: 'affective' },
      { name: 'Honesty', category: 'affective' },
      { name: 'Self Control', category: 'affective' },
      { name: 'Peer Relationship', category: 'affective' },
      { name: 'Sports & Games', category: 'psychomotor' },
      { name: 'Manual Skills', category: 'psychomotor' },
      { name: 'Musical Skills', category: 'psychomotor' },
      { name: 'Verbal Fluency', category: 'psychomotor' }
    ];
    for (const skill of defaultSkills) {
      await runQuery(`INSERT INTO BEHAVIORAL_SKILLS (name, category) VALUES (?, ?)`, [skill.name, skill.category]);
    }
  }

  // Check if admin is seeded
  const users = await getQuery('SELECT COUNT(*) as count FROM USERS');
  if (users.count === 0) {
    console.log('Seeding initial users and classes...');
    
    // Passwords hash
    const adminPassword = await bcrypt.hash('password123', 10);
    const teacherPassword = await bcrypt.hash('password123', 10);
    const studentPassword = await bcrypt.hash('password123', 10);

    // 1. Seed Admin
    await runQuery(`
      INSERT INTO USERS (username, password_hash, email, full_name, role)
      VALUES ('admin', ?, 'admin@jeremodel.com', 'System Administrator', 'admin')
    `, [adminPassword]);

    // 2. Seed Teachers
    const johnResult = await runQuery(`
      INSERT INTO USERS (username, password_hash, email, full_name, role)
      VALUES ('johndoe', ?, 'johndoe@jeremodel.com', 'John Doe', 'teacher')
    `, [teacherPassword]);
    const johnId = johnResult.lastID;

    const janeResult = await runQuery(`
      INSERT INTO USERS (username, password_hash, email, full_name, role)
      VALUES ('janesmith', ?, 'janesmith@jeremodel.com', 'Jane Smith', 'teacher')
    `, [teacherPassword]);
    const janeId = janeResult.lastID;

    const aminuResult = await runQuery(`
      INSERT INTO USERS (username, password_hash, email, full_name, role)
      VALUES ('aminu', ?, 'aminu@jeremodel.com', 'Aminu Aliyu', 'teacher')
    `, [teacherPassword]);
    const aminuId = aminuResult.lastID;

    // 3. Seed Classes according to specification
    // Nursery & Primary (simple Arm)
    const nursery1 = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('Nursery 1', 'nursery', NULL)`)).lastID;
    const nursery2 = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('Nursery 2', 'nursery', NULL)`)).lastID;
    const nursery3 = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('Nursery 3', 'nursery', NULL)`)).lastID;
    const primary1 = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('Primary 1', 'primary', NULL)`)).lastID;
    const primary2 = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('Primary 2', 'primary', NULL)`)).lastID;
    const primary3 = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('Primary 3', 'primary', NULL)`)).lastID;
    const primary4 = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('Primary 4', 'primary', NULL)`)).lastID;
    const primary5 = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('Primary 5', 'primary', NULL)`)).lastID;
    const primary6 = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('Primary 6', 'primary', NULL)`)).lastID;
    
    // JSS: streams A and B
    const jss1a = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('JSS 1A', 'jss', ?)`), [johnId]).lastID;
    const jss1b = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('JSS 1B', 'jss', NULL)`)).lastID;
    const jss2a = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('JSS 2A', 'jss', NULL)`)).lastID;
    const jss2b = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('JSS 2B', 'jss', NULL)`)).lastID;
    const jss3a = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('JSS 3A', 'jss', NULL)`)).lastID;
    const jss3b = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('JSS 3B', 'jss', NULL)`)).lastID;

    // SSS 1: streams A and B
    const sss1a = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('SSS 1A', 'sss', NULL)`)).lastID;
    const sss1b = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('SSS 1B', 'sss', NULL)`)).lastID;

    // SSS 2: streams A, B, and C
    const sss2a = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('SSS 2A', 'sss', ?)`), [janeId]).lastID;
    const sss2b = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('SSS 2B', 'sss', NULL)`)).lastID;
    const sss2c = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('SSS 2C', 'sss', NULL)`)).lastID;

    // SSS 3: streams A, B, and C
    const sss3a = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('SSS 3A', 'sss', NULL)`)).lastID;
    const sss3b = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('SSS 3B', 'sss', NULL)`)).lastID;
    const sss3c = (await runQuery(`INSERT INTO CLASSES (name, tier, form_master_id) VALUES ('SSS 3C', 'sss', NULL)`)).lastID;

    // Assign form masters in DB
    await runQuery(`UPDATE CLASSES SET form_master_id = ? WHERE name = 'JSS 1A'`, [johnId]);
    await runQuery(`UPDATE CLASSES SET form_master_id = ? WHERE name = 'SSS 2A'`, [janeId]);

    // 4. Seed Subjects
    const mathJssId = (await runQuery(`INSERT INTO SUBJECTS (name, tier) VALUES ('Mathematics', 'jss')`)).lastID;
    const englishJssId = (await runQuery(`INSERT INTO SUBJECTS (name, tier) VALUES ('English Language', 'jss')`)).lastID;
    const basicSciJssId = (await runQuery(`INSERT INTO SUBJECTS (name, tier) VALUES ('Basic Science', 'jss')`)).lastID;
    const civicJssId = (await runQuery(`INSERT INTO SUBJECTS (name, tier) VALUES ('Civic Education', 'jss')`)).lastID;

    const mathSssId = (await runQuery(`INSERT INTO SUBJECTS (name, tier) VALUES ('Mathematics', 'sss')`)).lastID;
    const englishSssId = (await runQuery(`INSERT INTO SUBJECTS (name, tier) VALUES ('English Language', 'sss')`)).lastID;
    const physicsSssId = (await runQuery(`INSERT INTO SUBJECTS (name, tier) VALUES ('Physics', 'sss')`)).lastID;
    const chemistrySssId = (await runQuery(`INSERT INTO SUBJECTS (name, tier) VALUES ('Chemistry', 'sss')`)).lastID;

    // 5. Seed Class-Subject Assignments
    // John teaches Math & Basic Science to JSS 1A
    const jss1a_id_row = await getQuery("SELECT id FROM CLASSES WHERE name='JSS 1A'");
    const jss1a_id = jss1a_id_row.id;
    await runQuery(`INSERT INTO CLASS_SUBJECTS (class_id, subject_id, teacher_id) VALUES (?, ?, ?)`, [jss1a_id, mathJssId, johnId]);
    await runQuery(`INSERT INTO CLASS_SUBJECTS (class_id, subject_id, teacher_id) VALUES (?, ?, ?)`, [jss1a_id, basicSciJssId, johnId]);
    
    // Aminu teaches Civic Education to JSS 1A
    await runQuery(`INSERT INTO CLASS_SUBJECTS (class_id, subject_id, teacher_id) VALUES (?, ?, ?)`, [jss1a_id, civicJssId, aminuId]);

    // Jane Smith teaches English to SSS 2A
    const sss2a_id_row = await getQuery("SELECT id FROM CLASSES WHERE name='SSS 2A'");
    const sss2a_id = sss2a_id_row.id;
    await runQuery(`INSERT INTO CLASS_SUBJECTS (class_id, subject_id, teacher_id) VALUES (?, ?, ?)`, [sss2a_id, englishSssId, janeId]);
    await runQuery(`INSERT INTO CLASS_SUBJECTS (class_id, subject_id, teacher_id) VALUES (?, ?, ?)`, [sss2a_id, mathSssId, johnId]); // John also teaches Math in SSS 2A
    
    // Aminu teaches Physics & Chemistry to SSS 2A
    await runQuery(`INSERT INTO CLASS_SUBJECTS (class_id, subject_id, teacher_id) VALUES (?, ?, ?)`, [sss2a_id, physicsSssId, aminuId]);
    await runQuery(`INSERT INTO CLASS_SUBJECTS (class_id, subject_id, teacher_id) VALUES (?, ?, ?)`, [sss2a_id, chemistrySssId, aminuId]);

    // 6. Seed Students (with physical registration form info)
    const seedStudents = [
      {
        username: 'student1',
        full_name: 'Musa Ibrahim',
        adm: 'JMA/2026/0001',
        dob: '2014-04-12',
        class_name: 'JSS 1A',
        religion: 'Islam',
        lga: 'Kagarko',
        state: 'Kaduna',
        parent_name: 'Ibrahim Adamu',
        parent_phone: '08031234567',
        parent_address: 'Opposite Central Mosque, Jere'
      },
      {
        username: 'student2',
        full_name: 'Chinedu Okeke',
        adm: 'JMA/2026/0002',
        dob: '2014-08-25',
        class_name: 'JSS 1A',
        religion: 'Christianity',
        lga: 'Orlu',
        state: 'Imo',
        parent_name: 'Ignatius Okeke',
        parent_phone: '08098765432',
        parent_address: 'Block A, Abuja Road, Jere'
      },
      {
        username: 'student3',
        full_name: 'Aisha Bello',
        adm: 'JMA/2026/0003',
        dob: '2011-01-15',
        class_name: 'SSS 2A',
        religion: 'Islam',
        lga: 'Kagarko',
        state: 'Kaduna',
        parent_name: 'Bello Danladi',
        parent_phone: '08123456789',
        parent_address: 'Opposite Jabal Annur Mosque, Jere'
      }
    ];

    for (const stud of seedStudents) {
      const uRes = await runQuery(`
        INSERT INTO USERS (username, password_hash, full_name, role)
        VALUES (?, ?, ?, 'student')
      `, [stud.username, studentPassword, stud.full_name]);
      const sId = uRes.lastID;

      const cIdRow = await getQuery("SELECT id FROM CLASSES WHERE name = ?", [stud.class_name]);
      const cId = cIdRow.id;

      await runQuery(`
        INSERT INTO STUDENTS (
          id, class_id, admission_number, date_of_birth, class_of_entry, term_year_of_entry,
          last_school_attended, address_residence, sex, religion, local_government, state_of_origin,
          handicapped, parent_name, parent_address, parent_phone, undertaking_signed
        ) VALUES (
          ?, ?, ?, ?, 'JSS 1', '1st Term 2025', 'Jere LEA Primary', 'Jere Town', 'Male', ?, ?, ?, 0, ?, ?, ?, 1
        )
      `, [
        sId, cId, stud.adm, stud.dob, stud.religion, stud.lga, stud.state,
        stud.parent_name, stud.parent_address, stud.parent_phone
      ]);

      // Seed 1st & 2nd Term Grades for Cumulative Calculations
      const subList = stud.class_name === 'JSS 1A' 
        ? [{ id: mathJssId, name: 'Mathematics' }, { id: basicSciJssId, name: 'Basic Science' }, { id: civicJssId, name: 'Civic Education' }]
        : [{ id: mathSssId, name: 'Mathematics' }, { id: englishSssId, name: 'English Language' }, { id: physicsSssId, name: 'Physics' }, { id: chemistrySssId, name: 'Chemistry' }];

      for (const sub of subList) {
        // 1st Term
        const score1 = Math.floor(Math.random() * 30) + 55; // 55 to 85
        const grade1 = getGradeLetter(score1);
        await runQuery(`
          INSERT INTO GRADES (student_id, subject_id, term, academic_year, ca1, ca2, ca3, ca4, exam_score, total_score, grade_letter, remark)
          VALUES (?, ?, '1st Term', '2026/2027', 8, 7, 9, 8, ?, ?, ?, 'Completed')
        `, [sId, sub.id, score1 - 32, score1, grade1]);

        // 2nd Term
        const score2 = Math.floor(Math.random() * 30) + 55;
        const grade2 = getGradeLetter(score2);
        await runQuery(`
          INSERT INTO GRADES (student_id, subject_id, term, academic_year, ca1, ca2, ca3, ca4, exam_score, total_score, grade_letter, remark)
          VALUES (?, ?, '2nd Term', '2026/2027', 7, 8, 8, 9, ?, ?, ?, 'Completed')
        `, [sId, sub.id, score2 - 32, score2, grade2]);
        
        // Seed partial 3rd Term grades (which teacher can edit or complete)
        const ca1 = Math.floor(Math.random() * 4) + 6; // 6 to 10
        const ca2 = Math.floor(Math.random() * 4) + 6;
        const ca3 = Math.floor(Math.random() * 4) + 6;
        const ca4 = Math.floor(Math.random() * 4) + 6;
        const exam = Math.floor(Math.random() * 25) + 30; // 30 to 55
        const total = ca1 + ca2 + ca3 + ca4 + exam;
        const grade3 = getGradeLetter(total);
        await runQuery(`
          INSERT INTO GRADES (student_id, subject_id, term, academic_year, ca1, ca2, ca3, ca4, exam_score, total_score, grade_letter, remark)
          VALUES (?, ?, '3rd Term', '2026/2027', ?, ?, ?, ?, ?, ?, ?, 'Good')
        `, [sId, sub.id, ca1, ca2, ca3, ca4, exam, total, grade3]);
      }

      // Seed outstanding fee invoices
      await runQuery(`
        INSERT INTO FEE_INVOICES (student_id, title, amount_due, amount_paid, status)
        VALUES (?, '3rd Term School Fees', 45000, 0, 'unpaid')
      `, [sId]);
      await runQuery(`
        INSERT INTO FEE_INVOICES (student_id, title, amount_due, amount_paid, status)
        VALUES (?, 'Development Levy', 15000, 15000, 'paid')
      `, [sId]);
      
      // Seed a receipt for the development levy
      const invoiceRow = await getQuery("SELECT id FROM FEE_INVOICES WHERE student_id = ? AND title = 'Development Levy'", [sId]);
      await runQuery(`
        INSERT INTO FEE_RECEIPTS (invoice_id, receipt_number, amount_paid, payment_date, payment_method, logged_by)
        VALUES (?, ?, 15000, '2026-05-10', 'Transfer', 1)
      `, [invoiceRow.id, `REC-2026-000${sId}`]);

      // Seed behavioral grades for each term (1st, 2nd, 3rd)
      for (const t of ['1st Term', '2nd Term', '3rd Term']) {
        await runQuery(`
          INSERT INTO BEHAVIORAL_GRADES (
            student_id, term, academic_year, punctuality, neatness, honesty,
            self_control, peer_relationship, sports, manual_skills, musical_skills, verbal_fluency
          ) VALUES (?, ?, '2026/2027', ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          sId, t, 
          Math.floor(Math.random() * 2) + 4, // 4-5
          Math.floor(Math.random() * 2) + 4,
          Math.floor(Math.random() * 2) + 4,
          Math.floor(Math.random() * 2) + 3, // 3-4
          Math.floor(Math.random() * 2) + 4,
          Math.floor(Math.random() * 2) + 3,
          Math.floor(Math.random() * 2) + 3,
          Math.floor(Math.random() * 2) + 3,
          Math.floor(Math.random() * 2) + 4
        ]);
      }
    }

    // 7. Seed Result Pins (Universal cards that bind to whatever term they are checked on first)
    const mockPins = ['PIN1234567', 'PIN7654321', 'PIN8888888', 'PIN9999999', 'PIN5555555'];
    for (const p of mockPins) {
      await runQuery(`
        INSERT INTO RESULT_PINS (pin, term, academic_year, usage_count, status)
        VALUES (?, NULL, NULL, 0, 'active')
      `, [p]);
    }

    // 8. Seed Sample Schemes of Work (JSS 1A Math & SSS 2A English)
    console.log('Seeding sample Schemes of Work...');
    // JSS 1A Math
    const mathTopics = [
      { week: 1, topic: 'Introduction to Algebra', obj: 'Students should be able to identify variables and coefficients.' },
      { week: 2, topic: 'Linear Equations', obj: 'Students should be able to solve simple linear equations.' },
      { week: 3, topic: 'Word Problems in Algebra', obj: 'Students should be able to translate word problems to equations.' }
    ];
    for (const mt of mathTopics) {
      await runQuery(`
        INSERT INTO SCHEME_OF_WORK (class_id, subject_id, term, week, topic, objectives, created_by)
        VALUES (?, ?, '3rd Term', ?, ?, ?, ?)
      `, [jss1a_id, mathJssId, mt.week, mt.topic, mt.obj, johnId]);
    }

    // SSS 2A English
    const englishTopics = [
      { week: 1, topic: 'Nouns and Pronouns Revision', obj: 'Identify different types of nouns and pronouns in sentences.' },
      { week: 2, topic: 'Verb Tenses', obj: 'Differentiate between simple, perfect, and continuous tenses.' },
      { week: 3, topic: 'Essay Writing: Narrative Essays', obj: 'Write a narrative essay with proper structure and pacing.' }
    ];
    for (const et of englishTopics) {
      await runQuery(`
        INSERT INTO SCHEME_OF_WORK (class_id, subject_id, term, week, topic, objectives, created_by)
        VALUES (?, ?, '3rd Term', ?, ?, ?, ?)
      `, [sss2a_id, englishSssId, et.week, et.topic, et.obj, janeId]);
    }

    console.log('Seeding completed successfully!');
  }

  // Ensure required Nursery 1-3 and Primary 1-6 classes exist in the database (for existing databases)
  const requiredClasses = [
    { name: 'Nursery 1', tier: 'nursery' },
    { name: 'Nursery 2', tier: 'nursery' },
    { name: 'Nursery 3', tier: 'nursery' },
    { name: 'Primary 1', tier: 'primary' },
    { name: 'Primary 2', tier: 'primary' },
    { name: 'Primary 3', tier: 'primary' },
    { name: 'Primary 4', tier: 'primary' },
    { name: 'Primary 5', tier: 'primary' },
    { name: 'Primary 6', tier: 'primary' }
  ];
  for (const cls of requiredClasses) {
    try {
      const existing = await getQuery('SELECT id FROM CLASSES WHERE name = ?', [cls.name]);
      if (!existing) {
        await runQuery('INSERT INTO CLASSES (name, tier, form_master_id) VALUES (?, ?, NULL)', [cls.name, cls.tier]);
        console.log(`Created missing class: ${cls.name}`);
      }
    } catch (e) {
      console.error(`Error verifying/creating class ${cls.name}:`, e);
    }
  }

  // Autopopulate curriculum
  await seedNigerianCurriculum();
}

async function seedNigerianCurriculum() {
  const schemesCount = await getQuery('SELECT COUNT(*) as count FROM SCHEME_OF_WORK');
  if (schemesCount.count < 300) {
    console.log('Autopopulating Nigerian School Curriculum Subjects and Schemes of Work...');
    
    await runQuery('BEGIN TRANSACTION');
    try {
      await runQuery('DELETE FROM SCHEME_OF_WORK');
      const curriculumSubjects = {
        nursery: [
          'Numeracy',
          'Literacy',
          'Basic Science',
          'Social Norms',
          'Creative Arts'
        ],
        primary: [
          'Mathematics',
          'English Studies',
          'Basic Science & Technology',
          'Civic Education',
          'Social Studies',
          'Agricultural Science',
          'Computer Studies'
        ],
        jss: [
          'Mathematics',
          'English Studies',
          'Basic Science',
          'Civic Education',
          'Social Studies',
          'Computer Studies (ICT)',
          'Agricultural Science',
          'Business Studies'
        ],
        sss: [
          'Mathematics',
          'English Language',
          'Physics',
          'Chemistry',
          'Biology',
          'Civic Education',
          'Economics',
          'Literature-in-English'
        ]
      };

      for (const [tier, subList] of Object.entries(curriculumSubjects)) {
        for (const name of subList) {
          try {
            await runQuery('INSERT OR IGNORE INTO SUBJECTS (name, tier) VALUES (?, ?)', [name, tier]);
          } catch (e) {
            // ignore
          }
        }
      }

      const allClasses = await allQuery('SELECT id, name, tier FROM CLASSES');
      const allSubjects = await allQuery('SELECT id, name, tier FROM SUBJECTS');

      for (const cls of allClasses) {
        const tierSubjects = allSubjects.filter(sub => sub.tier === cls.tier);
        for (const sub of tierSubjects) {
          try {
            await runQuery('INSERT OR IGNORE INTO CLASS_SUBJECTS (class_id, subject_id, teacher_id) VALUES (?, ?, NULL)', [cls.id, sub.id]);
          } catch (e) {
            // ignore
          }
        }
      }

      const defaultSyllabus = {
        'Mathematics': [
          { week: 1, topic: 'Revision & Number Base System', objectives: 'Understand binary, octal, and decimal numbers.' },
          { week: 2, topic: 'Approximation & Percentage Error', objectives: 'Calculate rounding and percentage difference.' },
          { week: 3, topic: 'Sequence and Series (AP)', objectives: 'Understand Arithmetic Progressions.' },
          { week: 4, topic: 'Sequence and Series (GP)', objectives: 'Understand Geometric Progressions.' },
          { week: 5, topic: 'Quadratic Equations (Factorization)', objectives: 'Solve equations using factor method.' },
          { week: 6, topic: 'Quadratic Equations (Formula)', objectives: 'Apply the quadratic formula.' },
          { week: 7, topic: 'Mid-Term Break & Revision Test', objectives: 'Review and assess weeks 1-6.' },
          { week: 8, topic: 'Simultaneous Equations', objectives: 'Solve linear-quadratic simultaneous systems.' },
          { week: 9, topic: 'Logarithms & Indices', objectives: 'Apply rules of exponents and logs.' },
          { week: 10, topic: 'Trigonometric Ratios (SOH CAH TOA)', objectives: 'Solve right-angled triangles.' },
          { week: 11, topic: 'Revision of Terminal Work', objectives: 'Complete course revision.' },
          { week: 12, topic: 'Final Examinations', objectives: 'Assess third term terminal grades.' }
        ],
        'English Studies': [
          { week: 1, topic: 'Parts of Speech Revision', objectives: 'Review nouns, pronouns, verbs, and adjectives.' },
          { week: 2, topic: 'Subject-Verb Concord', objectives: 'Learn basic rules of grammatical agreement.' },
          { week: 3, topic: 'Reading Comprehension', objectives: 'Learn skimming and scanning techniques.' },
          { week: 4, topic: 'Narrative Essay Writing', objectives: 'Write a narrative paragraph with introduction.' },
          { week: 5, topic: 'Direct and Indirect Speech', objectives: 'Change reported statements to active quotes.' },
          { week: 6, topic: 'Prepositions & Adverbs', objectives: 'Identify prepositions of time and place.' },
          { week: 7, topic: 'Mid-Term Revision & Assessment', objectives: 'Review grammar lessons of weeks 1-6.' },
          { week: 8, topic: 'Active and Passive Voice', objectives: 'Differentiate between agent and receiver of action.' },
          { week: 9, topic: 'Formal Letter Layout', objectives: 'Identify parts of a formal letter address.' },
          { week: 10, topic: 'Figures of Speech (Simile & Metaphor)', objectives: 'Interpret figurative expressions in texts.' },
          { week: 11, topic: 'Revision Studies', objectives: 'Practice test and essay review.' },
          { week: 12, topic: 'Terminal Examinations', objectives: 'End of term testing.' }
        ],
        'Basic Science': [
          { week: 1, topic: 'Family Health & Hygiene', objectives: 'Describe cleanliness and sanitation.' },
          { week: 2, topic: 'Drug Abuse & Drug Trafficking', objectives: 'Understand the consequences of illegal drugs.' },
          { week: 3, topic: 'Resources from the Earth', objectives: 'Explain types of rocks and soil.' },
          { week: 4, topic: 'Matter and Its States', objectives: 'Differentiate solids, liquids, and gases.' },
          { week: 5, topic: 'Forces: Types and Effects', objectives: 'Describe push, pull, gravity, and friction.' },
          { week: 6, topic: 'Simple Machines', objectives: 'Understand levers, pulleys, and inclined planes.' },
          { week: 7, topic: 'Mid-Term Assessment & Test', objectives: 'Evaluate understanding of weeks 1-6.' },
          { week: 8, topic: 'Energy: Forms and Conversion', objectives: 'Describe kinetic and potential energy.' },
          { week: 9, topic: 'Environmental Pollution', objectives: 'Explain air, water, and soil pollution.' },
          { week: 10, topic: 'Climate Change', objectives: 'Describe global warming causes and effects.' },
          { week: 11, topic: 'Revision', objectives: 'Summarize term work.' },
          { week: 12, topic: 'Final Examinations', objectives: 'Terminal exam grading.' }
        ],
        'Physics': [
          { week: 1, topic: 'Measurement & Dimensions', objectives: 'Understand fundamental and derived units.' },
          { week: 2, topic: 'Position, Displacement, & Speed', objectives: 'Define kinematics terminology.' },
          { week: 3, topic: 'Equations of Motion', objectives: 'Solve linear acceleration problems.' },
          { week: 4, topic: 'Projectiles & Circular Motion', objectives: 'Analyze two-dimensional mechanics.' },
          { week: 5, topic: 'Newtonian Forces & Inertia', objectives: 'Apply Newton\'s three laws of motion.' },
          { week: 6, topic: 'Linear Momentum & Impulse', objectives: 'Analyze elastic and inelastic collisions.' },
          { week: 7, topic: 'Mid-Term Revision & Testing', objectives: 'Verify mechanical equations.' },
          { week: 8, topic: 'Work, Energy, & Power', objectives: 'Solve work-energy theorem tasks.' },
          { week: 9, topic: 'Pressure in Fluids', objectives: 'Describe Archimedes\' and Pascal\'s principles.' },
          { week: 10, topic: 'Thermal Expansion & Heat', objectives: 'Understand Celsius and Kelvin expansion scales.' },
          { week: 11, topic: 'Revision and Summary', objectives: 'Review dynamics and thermals.' },
          { week: 12, topic: 'Terminal Examinations', objectives: 'Third term exams.' }
        ],
        'Chemistry': [
          { week: 1, topic: 'Introduction to Chemistry', objectives: 'Define chemistry and laboratory safety.' },
          { week: 2, topic: 'Matter: Elements, Compounds, & Mixtures', objectives: 'Classify physical and chemical properties.' },
          { week: 3, topic: 'Separation Techniques', objectives: 'Understand filtration, distillation, and chromatography.' },
          { week: 4, topic: 'Atomic Structure & Particles', objectives: 'Describe protons, neutrons, and electrons.' },
          { week: 5, topic: 'Chemical Symbols and Formulas', objectives: 'Write molecular formulas for compounds.' },
          { week: 6, topic: 'Valency & Chemical Bonding', objectives: 'Differentiate ionic and covalent bonds.' },
          { week: 7, topic: 'Mid-Term Revision & Test', objectives: 'Verify chemical symbols and equations.' },
          { week: 8, topic: 'Periodic Table Arrangement', objectives: 'Identify groups and periods.' },
          { week: 9, topic: 'Stoichiometry & Mole Concept', objectives: 'Calculate molar masses and concentration.' },
          { week: 10, topic: 'Acids, Bases, & Indicators', objectives: 'Understand pH scale and neutralization.' },
          { week: 11, topic: 'Revision', objectives: 'Review term topics.' },
          { week: 12, topic: 'Examinations', objectives: 'Grading terminal test.' }
        ],
        'Biology': [
          { week: 1, topic: 'Energy Transformation in Nature', objectives: 'Explain food chains, webs, and ecosystem energy.' },
          { week: 2, topic: 'Relevance of Biology to Agriculture', objectives: 'Classify agricultural plants and crops.' },
          { week: 3, topic: 'Agricultural Activities & Ecosystem', objectives: 'Explain bush burning, tillage, and pesticide effects.' },
          { week: 4, topic: 'Pests and Diseases', objectives: 'Identify crop pests and their life cycles.' },
          { week: 5, topic: 'Food Production and Storage', objectives: 'Apply modern preservation and yield methods.' },
          { week: 6, topic: 'Population Growth & Food Supply', objectives: 'Explain food shortage and population relations.' },
          { week: 7, topic: 'Micro-organisms Around Us', objectives: 'Classify viruses, bacteria, and fungi.' },
          { week: 8, topic: 'Micro-organisms in Action', objectives: 'Understand benefits and disease carriers.' },
          { week: 9, topic: 'Towards Better Health', objectives: 'Discuss disease vectors and hygiene practices.' },
          { week: 10, topic: 'Aquatic Habitats (Marine)', objectives: 'Study marine adaptation and zoning.' },
          { week: 11, topic: 'Revision of Habits and Adaptations', objectives: 'Synthesize weeks 1-10 biology curriculum.' },
          { week: 12, topic: 'Terminal Examinations', objectives: 'Grade third term Biology assessments.' }
        ],
        'Economics': [
          { week: 1, topic: 'Revision & Distributive Trade', objectives: 'Channels of distribution, wholesale, retail.' },
          { week: 2, topic: 'Middlemen in Trade', objectives: 'Analyze arguments for/against eliminating middlemen.' },
          { week: 3, topic: 'Money: Origin & Characteristics', objectives: 'Barter deficiencies, functions of money.' },
          { week: 4, topic: 'Financial Institutions', objectives: 'Commercial banks, central bank controls.' },
          { week: 5, topic: 'Concept of Demand', objectives: 'Law of demand, demand schedules, and curves.' },
          { week: 6, topic: 'Concept of Supply', objectives: 'Law of supply, supply schedules, and curves.' },
          { week: 7, topic: 'Equilibrium Price Determination', objectives: 'Calculate market price through supply and demand.' },
          { week: 8, topic: 'Structure of the Nigerian Economy', objectives: 'Overview of primary, secondary, and tertiary sectors.' },
          { week: 9, topic: 'Agriculture in Nigeria', objectives: 'Systems of agriculture, reforms, and programs.' },
          { week: 10, topic: 'Mining Industry in Nigeria', objectives: 'Types of minerals, uses, and geographic locations.' },
          { week: 11, topic: 'Revision of Markets and Economics', objectives: 'Review terms and market forces.' },
          { week: 12, topic: 'Final Examinations', objectives: 'End of term exams.' }
        ],
        'Civic Education': [
          { week: 1, topic: 'Revision & Elections', objectives: 'Meaning, types, and importance in democracy.' },
          { week: 2, topic: 'Electoral Bodies (INEC & SIEC)', objectives: 'Composition, roles, and administrative functions.' },
          { week: 3, topic: 'Free and Fair Elections', objectives: 'Identify requirements and importance of integrity.' },
          { week: 4, topic: 'Electoral Malpractices', objectives: 'Definition, causes, forms, and prevention.' },
          { week: 5, topic: 'Democratic Processes', objectives: 'Characteristics of democracy and rule of law.' },
          { week: 6, topic: 'National Values', objectives: 'Learn discipline, honesty, and integrity.' },
          { week: 7, topic: 'Mid-Term Revision & Assessment', objectives: 'Mid-term check.' },
          { week: 8, topic: 'Human Rights', objectives: 'Identify fundamental human rights.' },
          { week: 9, topic: 'National Identity & Symbols', objectives: 'Respect national flag, anthem, and pledge.' },
          { week: 10, topic: 'Citizenship', objectives: 'Acquisition of citizenship, rights, and duties.' },
          { week: 11, topic: 'Revision of Civil Responsibilities', objectives: 'Synthesize national values.' },
          { week: 12, topic: 'Terminal Examinations', objectives: 'Conduct terminal exams.' }
        ],
        'Social Studies': [
          { week: 1, topic: 'Revision & Family as a Social Institution', objectives: 'Structure, types, and functions of family.' },
          { week: 2, topic: 'Culture and Social Values', objectives: 'Meaning, components, and attributes of culture.' },
          { week: 3, topic: 'Social Issues & Problems', objectives: 'Understand drug abuse, corruption, and crime.' },
          { week: 4, topic: 'Social Groups & Leadership', objectives: 'Qualities of good leadership and followership.' },
          { week: 5, topic: 'Cooperation & Conflict Resolution', objectives: 'Causes and resolutions of conflicts.' },
          { week: 6, topic: 'National Resources', objectives: 'Identification of human and mineral resources.' },
          { week: 7, topic: 'Mid-Term Revision & Test', objectives: 'Test weeks 1-6.' },
          { week: 8, topic: 'Safety Education', objectives: 'Describe road safety rules and accident prevention.' },
          { week: 9, topic: 'Science and Technology in Development', objectives: 'Effects of technology on social living.' },
          { week: 10, topic: 'Environmental Conservation', objectives: 'Learn erosion, deforestation, and preservation.' },
          { week: 11, topic: 'Revision of Social Frameworks', objectives: 'Synthesize social value systems.' },
          { week: 12, topic: 'Terminal Examinations', objectives: 'Grading end of term exam.' }
        ],
        'Agricultural Science': [
          { week: 1, topic: 'Revision & Importance of Agriculture', objectives: 'Describe food, raw materials, and income benefits.' },
          { week: 2, topic: 'Soil Composition & Types', objectives: 'Understand sandy, clay, and loamy soils.' },
          { week: 3, topic: 'Farm Tools and Implements', objectives: 'Identify hand tools, machinery, and safety.' },
          { week: 4, topic: 'Crop Production & Classification', objectives: 'Differentiate annuals, biennials, perennials.' },
          { week: 5, topic: 'Husbandry of Selected Crops', objectives: 'Learn planting, weeding, harvesting processes.' },
          { week: 6, topic: 'Farm Animals', objectives: 'Identify ruminants, non-ruminants, and poultry.' },
          { week: 7, topic: 'Mid-Term Revision & Test', objectives: 'Evaluate agricultural practices.' },
          { week: 8, topic: 'Animal Feeds & Feeding', objectives: 'Understand concentrates, roughages, and rations.' },
          { week: 9, topic: 'Weeds & Weed Control', objectives: 'Identify weeds and cultural control methods.' },
          { week: 10, topic: 'Pest Control in Agriculture', objectives: 'Recognize insect pests and control methods.' },
          { week: 11, topic: 'Revision of Farm Systems', objectives: 'Synthesize crop and animal husbandry.' },
          { week: 12, topic: 'Final Examinations', objectives: 'Assess terminal achievements.' }
        ],
        'Computer Studies': [
          { week: 1, topic: 'Revision & Introduction to Computer', objectives: 'Define computers and trace historical evolution.' },
          { week: 2, topic: 'Classification of Computers', objectives: 'Understand size, type, and generation groups.' },
          { week: 3, topic: 'Computer Hardware Components', objectives: 'Examine CPU, motherboard, and system unit.' },
          { week: 4, topic: 'Input Devices', objectives: 'Explore keyboard, mouse, and scanners.' },
          { week: 5, topic: 'Output Devices', objectives: 'Understand monitors, printers, and speakers.' },
          { week: 6, topic: 'Computer Software Classification', objectives: 'Differentiate system and application software.' },
          { week: 7, topic: 'Mid-Term Assessment & Break', objectives: 'Test hardware and software concepts.' },
          { week: 8, topic: 'Operating Systems (OS)', objectives: 'Understand functions of Windows, macOS, Linux.' },
          { week: 9, topic: 'Keyboard Skills & Word Processing', objectives: 'Practice home keys and text editing.' },
          { week: 10, topic: 'Internet & World Wide Web', objectives: 'Explain browsers, email, and search engines.' },
          { week: 11, topic: 'Revision of ICT Fundamentals', objectives: 'Synthesize computing basics.' },
          { week: 12, topic: 'Final Examinations', objectives: 'Conduct terminal testing.' }
        ],
        'Business Studies': [
          { week: 1, topic: 'Revision & Office Practice', objectives: 'Meaning, departments, and personnel.' },
          { week: 2, topic: 'Clerical Staff & Duties', objectives: 'Examine qualities and duties of an office clerk.' },
          { week: 3, topic: 'Business Transactions & Documents', objectives: 'Understand invoices, receipts, and order forms.' },
          { week: 4, topic: 'Introduction to Bookkeeping', objectives: 'Understand double-entry bookkeeping rules.' },
          { week: 5, topic: 'The Ledger', objectives: 'Learn post transactions to debit and credit columns.' },
          { week: 6, topic: 'The Cash Book', objectives: 'Examine single-column and double-column cash books.' },
          { week: 7, topic: 'Mid-Term Break & Assessment', objectives: 'Test ledger and cash bookkeeping.' },
          { week: 8, topic: 'The Trial Balance', objectives: 'Extract trial balance and correct errors.' },
          { week: 9, topic: 'Introduction to Commerce', objectives: 'Scope and importance of trade.' },
          { week: 10, topic: 'Entrepreneurship', objectives: 'Identify characteristics of an entrepreneur.' },
          { week: 11, topic: 'Revision of Business Concepts', objectives: 'Review commerce and accounting.' },
          { week: 12, topic: 'Terminal Examinations', objectives: 'Verify commercial competencies.' }
        ],
        'Literature-in-English': [
          { week: 1, topic: 'Revision & Intro to Literature', objectives: 'Learn prose, drama, and poetry genres.' },
          { week: 2, topic: 'Literary Devices', objectives: 'Explain metaphor, irony, and symbolism.' },
          { week: 3, topic: 'Prose Analysis (Text study)', objectives: 'Analyze plot, setting, and characterization.' },
          { week: 4, topic: 'Prose Analysis (Themes study)', objectives: 'Extract main themes and moral lessons.' },
          { week: 5, topic: 'Drama Analysis (Text study)', objectives: 'Analyze dramatic techniques and dialogue.' },
          { week: 6, topic: 'Drama Analysis (Conflict study)', objectives: 'Study central conflict and resolutions.' },
          { week: 7, topic: 'Mid-Term Revision & Test', objectives: 'Evaluate textual comprehension.' },
          { week: 8, topic: 'Poetry Analysis (Structure study)', objectives: 'Understand stanzas, rhyme, and meter.' },
          { week: 9, topic: 'Poetry Analysis (Imagery study)', objectives: 'Interpret sensory imagery in poems.' },
          { week: 10, topic: 'Set Book Comparative Analysis', objectives: 'Compare characters across text types.' },
          { week: 11, topic: 'Revision of Set Books', objectives: 'Synthesize plot and themes.' },
          { week: 12, topic: 'Terminal Examinations', objectives: 'Assess literature essays.' }
        ],
        'Social Norms': [
          { week: 1, topic: 'Greeting & Polite Words', objectives: 'Learn to use Please, Thank You, Excuse Me.' },
          { week: 2, topic: 'Respecting Elders & Peers', objectives: 'Learn active listening and cooperative play.' },
          { week: 3, topic: 'Table Manners', objectives: 'Understand posture and utensil use.' },
          { week: 4, topic: 'Personal Cleanliness', objectives: 'Brush teeth, wash hands, and keep clothes neat.' },
          { week: 5, topic: 'Care of Properties', objectives: 'Tidy toys, pack books, and handle equipment.' },
          { week: 6, topic: 'Obedience to Rules', objectives: 'Understand class rules and guidelines.' },
          { week: 7, topic: 'Mid-Term Break', objectives: 'Reinforce social norms at home.' },
          { week: 8, topic: 'Honesty & Truthfulness', objectives: 'Learn to speak the truth and own mistakes.' },
          { week: 9, topic: 'Kindness and Sharing', objectives: 'Promote empathy and cooperative sharing.' },
          { week: 10, topic: 'Safety Norms', objectives: 'Recognize dangers and call for help.' },
          { week: 11, topic: 'Revision of Good Conduct', objectives: 'Synthesize social norms.' },
          { week: 12, topic: 'Assessment', objectives: 'Verify behavioral development.' }
        ],
        'Creative Arts': [
          { week: 1, topic: 'Drawing Shapes and Lines', objectives: 'Draw circles, squares, and lines.' },
          { week: 2, topic: 'Primary Colors & Coloring', objectives: 'Identify red, yellow, and blue colors.' },
          { week: 3, topic: 'Clay & Plasticine Modeling', objectives: 'Model simple objects like balls and cups.' },
          { week: 4, topic: 'Paper Craft & Folding', objectives: 'Make paper planes and fans.' },
          { week: 5, topic: 'Singing Nursery Rhymes', objectives: 'Sing in melody and rhythm.' },
          { week: 6, topic: 'Traditional Dance & Movement', objectives: 'Perform simple rhythmic movements.' },
          { week: 7, topic: 'Mid-Term Break', objectives: 'Practice coloring.' },
          { week: 8, topic: 'Drama & Roleplay', objectives: 'Dramatize simple family roles.' },
          { week: 9, topic: 'Pattern Making & Stamping', objectives: 'Stamp patterns with leaves or bottle tops.' },
          { week: 10, topic: 'Collage & Gluing', objectives: 'Glue paper bits to outline drawings.' },
          { week: 11, topic: 'Revision & Exhibition', objectives: 'Showcase term artworks.' },
          { week: 12, topic: 'Assessment', objectives: 'Evaluate creative skills.' }
        ],
        'Numeracy': [
          { week: 1, topic: 'Number Identification 1-10', objectives: 'Identify and write numbers 1 to 10.' },
          { week: 2, topic: 'Counting Objects 1-20', objectives: 'Count physical counters up to 20.' },
          { week: 3, topic: 'Identification of 2D Shapes', objectives: 'Identify circle, triangle, and rectangle.' },
          { week: 4, topic: 'Writing Numbers 1-50', objectives: 'Fill missing numbers up to 50.' },
          { week: 5, topic: 'Concept of Big and Small', objectives: 'Sort objects by size comparison.' },
          { week: 6, topic: 'Simple Addition (+)', objectives: 'Add single digit numbers up to 10.' },
          { week: 7, topic: 'Mid-Term Break', objectives: 'Reinforce counting skills.' },
          { week: 8, topic: 'Simple Subtraction (-)', objectives: 'Subtract single digit numbers.' },
          { week: 9, topic: 'Telling the Time (O\'Clock)', objectives: 'Read hourly time on analog clock.' },
          { week: 10, topic: 'Sorting and Matching', objectives: 'Match similar colors and shapes.' },
          { week: 11, topic: 'Revision of Numbers', objectives: 'Review additions and shapes.' },
          { week: 12, topic: 'Assessment', objectives: 'Verify numeracy skills.' }
        ],
        'Literacy': [
          { week: 1, topic: 'Letter Recognition A-Z', objectives: 'Identify uppercase letters.' },
          { week: 2, topic: 'Phonic Sounds of Alphabet', objectives: 'Learn letter sounds (ah, buh, cuh).' },
          { week: 3, topic: 'Lowercase Letters a-z', objectives: 'Match uppercase to lowercase letters.' },
          { week: 4, topic: 'Two-letter Words (am, an, go)', objectives: 'Blend two letters together.' },
          { week: 5, topic: 'Three-letter Words (cat, dog, pen)', objectives: 'Read consonant-vowel-consonant words.' },
          { week: 6, topic: 'Pre-writing Strokes', objectives: 'Practice curves, loops, and zig-zags.' },
          { week: 7, topic: 'Mid-Term Break', objectives: 'Review letters and phonics.' },
          { week: 8, topic: 'Sight Words (the, and, you)', objectives: 'Recognize common sight words.' },
          { week: 9, topic: 'Reading Short Sentences', objectives: 'Read "The cat sat on a mat".' },
          { week: 10, topic: 'Spelling Simple Words', objectives: 'Spell three-letter words.' },
          { week: 11, topic: 'Revision of Literacy', objectives: 'Review blending and spelling.' },
          { week: 12, topic: 'Assessment', objectives: 'Verify literacy skills.' }
        ]
      };

      const getSyllabusKey = (subName) => {
        const lower = subName.toLowerCase();
        if (lower.includes('mathematics') || lower.includes('numeracy')) {
          return lower.includes('numeracy') ? 'Numeracy' : 'Mathematics';
        } else if (lower.includes('english') || lower.includes('literacy') || lower.includes('literature')) {
          if (lower.includes('literacy')) return 'Literacy';
          if (lower.includes('literature')) return 'Literature-in-English';
          return 'English Studies';
        } else if (lower.includes('basic science') || lower.includes('science') || lower.includes('technology')) {
          return 'Basic Science';
        } else if (lower.includes('physics')) {
          return 'Physics';
        } else if (lower.includes('chemistry')) {
          return 'Chemistry';
        } else if (lower.includes('biology')) {
          return 'Biology';
        } else if (lower.includes('economics')) {
          return 'Economics';
        } else if (lower.includes('civic')) {
          return 'Civic Education';
        } else if (lower.includes('social studies')) {
          return 'Social Studies';
        } else if (lower.includes('agricultural') || lower.includes('agriculture')) {
          return 'Agricultural Science';
        } else if (lower.includes('computer') || lower.includes('ict')) {
          return 'Computer Studies';
        } else if (lower.includes('business')) {
          return 'Business Studies';
        } else if (lower.includes('creative') || lower.includes('arts') || lower.includes('music')) {
          return 'Creative Arts';
        } else if (lower.includes('social norms') || lower.includes('norms')) {
          return 'Social Norms';
        }
        return 'Mathematics';
      };

      const mappedClassSubjects = await allQuery(`
        SELECT cs.class_id, cs.subject_id, s.name as subject_name 
        FROM CLASS_SUBJECTS cs
        JOIN SUBJECTS s ON cs.subject_id = s.id
      `);

      for (const cs of mappedClassSubjects) {
        const sylKey = getSyllabusKey(cs.subject_name);
        const weeks = defaultSyllabus[sylKey] || defaultSyllabus['Mathematics'];

        for (const w of weeks) {
          try {
            await runQuery(`
              INSERT OR IGNORE INTO SCHEME_OF_WORK (class_id, subject_id, term, week, topic, objectives, created_by)
              VALUES (?, ?, '3rd Term', ?, ?, ?, 1)
            `, [cs.class_id, cs.subject_id, w.week, w.topic, w.objectives]);
          } catch (e) {
            // ignore
          }
        }
      }
      await runQuery('COMMIT');
      console.log('Curriculum and Schemes of Work autopopulated successfully!');
    } catch (err) {
      await runQuery('ROLLBACK');
      console.error('Failed to seed curriculum, rolled back transaction:', err);
    }
  }
}

function getGradeLetter(score) {
  if (score >= 75) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

module.exports = {
  db: sqliteDb || mysqlPool,
  initDB,
  runQuery,
  getQuery,
  allQuery
};
