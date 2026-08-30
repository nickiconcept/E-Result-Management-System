const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./school.db');

db.all('SELECT * FROM class_subjects', [], (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    const json = JSON.stringify(rows);
    console.log("Length of SQLite class_subjects:", json.length);
});
db.close();
