
import { GradeScale, ClassLevel, Arm, Subject, Student } from './types';

export const GRADING_SCALE: GradeScale[] = [
  { grade: 'A', min: 70, max: 100, remark: 'Excellent' },
  { grade: 'B', min: 60, max: 69, remark: 'Very Good' },
  { grade: 'C', min: 50, max: 59, remark: 'Good' },
  { grade: 'D', min: 40, max: 49, remark: 'Pass' },
  { grade: 'F', min: 0, max: 39, remark: 'Fail' },
];

export const SCHOOL_LEVELS = ['Nursery', 'Primary', 'JSS', 'SSS'];

export const calculateGrade = (total: number): string => {
  const grade = GRADING_SCALE.find(g => total >= g.min && total <= g.max);
  return grade ? grade.grade : 'F';
};

export const MOCK_SESSIONS = [
  { id: 's1', name: '2023/2024', active: true },
  { id: 's2', name: '2024/2025', active: false },
];

export const MOCK_TERMS = [
  { id: 't1', name: 'First', sessionId: 's1', active: false },
  { id: 't2', name: 'Second', sessionId: 's1', active: true },
  { id: 't3', name: 'Third', sessionId: 's1', active: false },
];

export const MOCK_CLASSES: ClassLevel[] = [
  { id: 'c1', name: 'JSS 1' },
  { id: 'c2', name: 'JSS 2' },
  { id: 'c3', name: 'JSS 3' },
  { id: 'c4', name: 'SSS 1' },
  { id: 'c5', name: 'SSS 2' },
  { id: 'c6', name: 'SSS 3' },
];

export const MOCK_ARMS: Arm[] = [
  { id: 'a1', name: 'Gold' },
  { id: 'a2', name: 'Silver' },
  { id: 'a3', name: 'Diamond' },
];

export const MOCK_SUBJECTS: Subject[] = [
  { id: 'sub1', name: 'Mathematics', code: 'MTH' },
  { id: 'sub2', name: 'English Language', code: 'ENG' },
  { id: 'sub3', name: 'Basic Science', code: 'BSC' },
  { id: 'sub4', name: 'Civic Education', code: 'CVE' },
  { id: 'sub5', name: 'Agricultural Science', code: 'AGR' },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 'st1', admissionNo: 'ADM/23/001', firstName: 'Chinedu', lastName: 'Okonkwo', gender: 'M', classId: 'c1', armId: 'a1', parentId: 'p1' },
  { id: 'st2', admissionNo: 'ADM/23/002', firstName: 'Amina', lastName: 'Yusuf', gender: 'F', classId: 'c1', armId: 'a1', parentId: 'p2' },
  { id: 'st3', admissionNo: 'ADM/23/003', firstName: 'Bolaji', lastName: 'Adeyemi', gender: 'M', classId: 'c1', armId: 'a2', parentId: 'p3' },
  { id: 'st4', admissionNo: 'ADM/23/004', firstName: 'Efe', lastName: 'Okoro', gender: 'F', classId: 'c2', armId: 'a1', parentId: 'p4' },
  { id: 'st5', admissionNo: 'ADM/23/005', firstName: 'Fatima', lastName: 'Bello', gender: 'F', classId: 'c2', armId: 'a2', parentId: 'p5' },
];
