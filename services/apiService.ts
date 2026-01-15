import { db } from './db';
import { UserRole, Student, Subject, Score } from '../types';
import { calculateGrade } from '../constants';

export const apiService = {
  async login(email: string, password: string) {
    await new Promise(r => setTimeout(r, 600));
    
    // Simplistic auth for demo
    let role = UserRole.ADMIN;
    let name = 'Admin Joseph';
    
    if (email.includes('teacher')) { role = UserRole.TEACHER; name = 'Mr. Okon'; }
    if (email.includes('principal')) { role = UserRole.PRINCIPAL; name = 'Dr. Amadi'; }
    if (email.includes('form')) { role = UserRole.FORM_MASTER; name = 'Mrs. Adebayo'; }
    
    const user = {
      id: 'u-1',
      name,
      email: email || 'admin@school.com',
      role,
      status: 'active' as const
    };

    return { success: true, user };
  },

  async getStudents(classId?: string) {
    const students = await db.query<Student>('students');
    return classId ? students.filter(s => s.classId === classId) : students;
  },

  async getScores(classId: string, subjectId: string, termId: string) {
    const students = await this.getStudents(classId);
    const allScores = await db.query<Score>('scores');

    return students.map(s => {
      const score = allScores.find(sc => sc.studentId === s.id && sc.subjectId === subjectId && sc.termId === termId);
      return {
        id: s.id,
        student_id: s.id,
        admission_no: s.admissionNo,
        first_name: s.firstName,
        last_name: s.lastName,
        ca1: score?.ca1 || 0,
        ca2: score?.ca2 || 0,
        assignment: score?.assignment || 0,
        notes: score?.notes || 0,
        exam: score?.exam || 0,
        total: score?.total || 0,
        grade: score?.grade || 'F',
        is_locked: score?.isLocked || false
      };
    });
  },

  async saveScore(data: any) {
    await db.upsertScore(data);
    return { success: true };
  },

  async generatePins(studentIds: string[], termId: string) {
    const currentPins = await db.query<any>('pins');
    const newPins = studentIds.map(sid => ({
      pin: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      studentId: sid,
      termId,
      usageCount: 0,
      maxUsage: 5,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    }));
    await db.save('pins', [...currentPins, ...newPins]);
    return newPins;
  },

  async checkResult(admissionNo: string, pin: string) {
    const students = await db.query<Student>('students');
    const pins = await db.query<any>('pins');
    const student = students.find(s => s.admissionNo === admissionNo);
    
    if (!student) throw new Error('Student not found');
    
    const pinRecord = pins.find(p => p.pin === pin && p.studentId === student.id);
    if (!pinRecord) throw new Error('Invalid PIN for this student');
    if (pinRecord.usageCount >= pinRecord.maxUsage) throw new Error('PIN has reached maximum usage limit');

    // Update PIN usage
    pinRecord.usageCount++;
    await db.save('pins', pins);

    const scores = await db.query<Score>('scores');
    const studentScores = scores.filter(sc => sc.studentId === student.id && sc.termId === pinRecord.termId);
    const subjects = await db.query<Subject>('subjects');

    return {
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNo: student.admissionNo,
      scores: studentScores.map(sc => ({
        subject: subjects.find(sub => sub.id === sc.subjectId)?.name || 'Unknown',
        ca: (sc.ca1 || 0) + (sc.ca2 || 0) + (sc.assignment || 0) + (sc.notes || 0),
        exam: sc.exam,
        total: sc.total,
        grade: sc.grade
      }))
    };
  }
};