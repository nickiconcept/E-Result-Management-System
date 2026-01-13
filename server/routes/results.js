
const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');

module.exports = (db) => {
  
  // GET: Fetch Scores for a Class/Subject
  router.get('/', authenticate, authorize(['TEACHER', 'FORM_MASTER', 'PRINCIPAL']), async (req, res) => {
    try {
      const { classId, subjectId, termId } = req.query;
      
      // Validation: Teachers can only view assigned subjects (logic skipped for brevity)
      
      const query = `
        SELECT s.id, st.first_name, st.last_name, st.admission_no, 
               sc.ca1, sc.ca2, sc.assignment, sc.notes, sc.exam, sc.total, sc.grade, sc.is_locked
        FROM students st
        LEFT JOIN scores sc ON st.id = sc.student_id AND sc.subject_id = $2 AND sc.term_id = $3
        WHERE st.class_id = $1
        ORDER BY st.last_name ASC
      `;
      
      const result = await db.query(query, [classId, subjectId, termId]);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST: Upsert Score (Insert or Update)
  router.post('/score', authenticate, authorize(['TEACHER', 'FORM_MASTER']), async (req, res) => {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const { studentId, subjectId, termId, sessionId, ca1, ca2, assignment, notes, exam } = req.body;
      const userId = req.user.id;

      // Check if locked
      const checkLock = await client.query(
        'SELECT is_locked FROM scores WHERE student_id = $1 AND subject_id = $2 AND term_id = $3',
        [studentId, subjectId, termId]
      );

      if (checkLock.rows.length > 0 && checkLock.rows[0].is_locked) {
        throw new Error('Score entry is locked for this student/subject.');
      }

      // Upsert Logic
      const upsertQuery = `
        INSERT INTO scores (student_id, subject_id, term_id, session_id, ca1, ca2, assignment, notes, exam, updated_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (student_id, subject_id, term_id, session_id)
        DO UPDATE SET 
          ca1 = EXCLUDED.ca1, ca2 = EXCLUDED.ca2, assignment = EXCLUDED.assignment,
          notes = EXCLUDED.notes, exam = EXCLUDED.exam, updated_by = EXCLUDED.updated_by,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const result = await client.query(upsertQuery, [
        studentId, subjectId, termId, sessionId, 
        ca1 || 0, ca2 || 0, assignment || 0, notes || 0, exam || 0, 
        userId
      ]);

      // Audit Log
      await client.query(
        `INSERT INTO audit_logs (user_id, user_role, action, details) VALUES ($1, $2, $3, $4)`,
        [userId, req.user.role, 'UPDATE_SCORE', `Updated score for Student ${studentId}, Subject ${subjectId}`]
      );

      await client.query('COMMIT');
      res.json(result.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      res.status(400).json({ error: err.message });
    } finally {
      client.release();
    }
  });

  return router;
};
