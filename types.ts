
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  FORM_MASTER = 'FORM_MASTER',
  PRINCIPAL = 'PRINCIPAL',
  PARENT = 'PARENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended';
  lastLogin?: string;
}

export interface ClassLevel {
  id: string;
  name: string;
}

export interface Arm {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  classId: string;
  armId: string;
  parentId: string;
}

export interface AcademicSession {
  id: string;
  name: string; // e.g., 2023/2024
  active: boolean;
}

export interface Term {
  id: string;
  name: 'First' | 'Second' | 'Third';
  sessionId: string;
  active: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Score {
  id?: string;
  studentId: string;
  subjectId: string;
  termId: string;
  sessionId: string;
  ca1: number; // 10
  ca2: number; // 10
  assignment: number; // 10
  notes: number; // 10
  exam: number; // 60
  total: number; // 100
  grade: string;
  isLocked: boolean;
}

export interface StudentRemark {
  studentId: string;
  termId: string;
  sessionId: string;
  formMasterRemark?: string;
  principalRemark?: string;
  affective?: Record<string, number>;
  psychomotor?: Record<string, number>;
}

export interface AuditLog {
  id: string;
  userId: string;
  userRole: UserRole;
  action: string;
  affectedRecord: string;
  timestamp: string;
  ipAddress: string;
}

export interface ResultPin {
  pin: string;
  studentId: string;
  termId: string;
  usageCount: number;
  maxUsage: number;
  expiryDate: string;
}

export interface GradeScale {
  grade: string;
  min: number;
  max: number;
  remark: string;
}
