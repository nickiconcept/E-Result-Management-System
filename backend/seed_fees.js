const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'school.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.all('SELECT id, class_id FROM STUDENTS LIMIT 5', (err, students) => {
    if (err) {
      console.error(err);
      return;
    }
    
    if (students.length === 0) {
      console.log('No students found to assign custom fees.');
      return;
    }
    
    const stmt = db.prepare(`INSERT INTO FEE_INVOICES (student_id, title, category, amount_due, amount_paid, status) VALUES (?, ?, ?, ?, ?, ?)`);
    
    // Insert Lesson Fee
    students.forEach(s => {
      stmt.run(s.id, 'Lesson Fee', 'Other', 5000, 0, 'unpaid');
    });
    
    // Insert End of Year Party
    students.forEach(s => {
      stmt.run(s.id, 'End of Year Party', 'Party', 15000, 0, 'unpaid');
    });
    
    stmt.finalize();
    
    console.log('Successfully seeded custom fees!');
  });
});
