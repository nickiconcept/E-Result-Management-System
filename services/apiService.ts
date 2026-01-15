import { MOCK_STUDENTS, calculateGrade } from '../constants';
import { UserRole } from '../types';

const USE_MOCK_DATA = true;

export const apiService = {
  isDemo: USE_MOCK_DATA,

  async login(email: string, password: string) {
    await new Promise(r => setTimeout(r, 800));
    
    let role = UserRole.ADMIN;
    let name = 'Admin Joseph';
    
    if (email.includes('teacher')) { role = UserRole.TEACHER; name = 'Mr. Okon'; }
    if (email.includes('principal')) { role = UserRole.PRINCIPAL; name = 'Dr. Amadi'; }
    if (email.includes('form')) { role = UserRole.FORM_MASTER; name = 'Mrs. Adebayo'; }
    
    // Default fallback for demo
    if (!email) email = 'admin@school.com';

    return {
      success: true,
      user: {
        id: 'u-' + Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        role: role,
        status: 'active' as const
      }
    };
  },

  async getScores(classId: string, subjectId: string, termId: string) {
    await new Promise(r => setTimeout(r, 600));
    return MOCK_STUDENTS
      .filter(s => s.classId === classId)
      .map(s => {
        const ca1 = Math.floor(Math.random() * 5) + 5;
        const ca2 = Math.floor(Math.random() * 5) + 5;
        const assignment = Math.floor(Math.random() * 5) + 5;
        const notes = Math.floor(Math.random() * 5) + 5;
        const exam = Math.floor(Math.random() * 30) + 20;
        const total = ca1 + ca2 + assignment + notes + exam;
        
        return {
          id: s.id,
          student_id: s.id,
          admission_no: s.admissionNo,
          first_name: s.firstName,
          last_name: s.lastName,
          ca1, ca2, assignment, notes, exam,
          total,
          grade: calculateGrade(total),
          is_locked: false
        };
      });
  },

  async saveScore(scoreData: any) {
    await new Promise(r => setTimeout(r, 400));
    return { success: true };
  }
};