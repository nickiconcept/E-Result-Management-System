
import { MOCK_STUDENTS } from '../constants';

// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE inside the quotes
// Example: 'https://script.google.com/macros/s/AKfycbx.../exec'
const GOOGLE_SCRIPT_URL = 'PASTE_YOUR_COPIED_GOOGLE_SCRIPT_URL_HERE'; 

const isMockMode = () => GOOGLE_SCRIPT_URL.includes('PASTE_YOUR');

export const apiService = {
  isDemo: isMockMode(),

  async login(email: string, password: string) {
    if (isMockMode()) {
      console.log('Mock Login Mode');
      // Simulate network delay
      await new Promise(r => setTimeout(r, 800));
      return {
        success: true,
        user: {
          id: 'mock-user-id',
          name: 'Demo Admin',
          email: email,
          role: 'ADMIN',
          status: 'active'
        }
      };
    }

    const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  },

  async getScores(classId: string, subjectId: string, termId: string) {
    if (isMockMode()) {
      console.log('Mock Get Scores Mode');
      await new Promise(r => setTimeout(r, 600));
      // Return mock data matching the Google Sheet structure
      return MOCK_STUDENTS.filter(s => s.classId === classId).map(s => ({
        id: s.id,
        student_id: s.id,
        admission_no: s.admissionNo,
        first_name: s.firstName,
        last_name: s.lastName,
        ca1: Math.floor(Math.random() * 10),
        ca2: Math.floor(Math.random() * 10),
        assignment: Math.floor(Math.random() * 10),
        notes: Math.floor(Math.random() * 10),
        exam: Math.floor(Math.random() * 60),
        total: 0, // Calculated on frontend usually, or we can pre-calc
        grade: '-',
        is_locked: false
      })).map(s => {
        s.total = s.ca1 + s.ca2 + s.assignment + s.notes + s.exam;
        s.grade = s.total >= 70 ? 'A' : s.total >= 60 ? 'B' : s.total >= 50 ? 'C' : s.total >= 40 ? 'D' : 'F';
        return s;
      });
    }

    const params = new URLSearchParams({ action: 'getScores', classId, subjectId, termId });
    const res = await fetch(`${GOOGLE_SCRIPT_URL}?${params}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  },

  async saveScore(data: any) {
    if (isMockMode()) {
      console.log('Mock Save Score Mode', data);
      await new Promise(r => setTimeout(r, 400));
      return { success: true };
    }

    const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=saveScore`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.error) throw new Error(result.error);
    return result;
  }
};
