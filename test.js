const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('backend/database.sqlite');
db.all(`SELECT * FROM FEE_INVOICES WHERE category != 'School Fees'`, (err, rows) => {
  console.log(err || rows);
});
