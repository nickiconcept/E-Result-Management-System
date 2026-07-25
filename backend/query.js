const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('school.db');
db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='CLASS_SUBJECTS'", (err, row) => console.log("CLASS_SUBJECTS:", row ? row.sql : "not found"));
db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='SUBJECTS'", (err, row) => console.log("SUBJECTS:", row ? row.sql : "not found"));
