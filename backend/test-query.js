const { allQuery } = require('./database');
async function run() {
  try {
    const classes = await allQuery('SELECT cs.class_id, cs.subject_id, c.name as class_name, s.name as subject_name FROM CLASS_SUBJECTS cs JOIN CLASSES c ON cs.class_id = c.id JOIN SUBJECTS s ON cs.subject_id = s.id WHERE cs.teacher_id = ?', [3]);
    console.log(classes);
  } catch(e) {
    console.error(e);
  }
}
run();
