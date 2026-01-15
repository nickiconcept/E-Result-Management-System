import { MOCK_STUDENTS, MOCK_CLASSES, MOCK_SUBJECTS } from '../constants';
import { UserRole } from '../types';

class LocalDatabase {
  private prefix = 'ers_db_';

  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(this.prefix + 'students')) {
      localStorage.setItem(this.prefix + 'students', JSON.stringify(MOCK_STUDENTS));
    }
    if (!localStorage.getItem(this.prefix + 'classes')) {
      localStorage.setItem(this.prefix + 'classes', JSON.stringify(MOCK_CLASSES));
    }
    if (!localStorage.getItem(this.prefix + 'subjects')) {
      localStorage.setItem(this.prefix + 'subjects', JSON.stringify(MOCK_SUBJECTS));
    }
    if (!localStorage.getItem(this.prefix + 'scores')) {
      localStorage.setItem(this.prefix + 'scores', JSON.stringify([]));
    }
    if (!localStorage.getItem(this.prefix + 'pins')) {
      localStorage.setItem(this.prefix + 'pins', JSON.stringify([]));
    }
  }

  async query<T>(collection: string): Promise<T[]> {
    const data = localStorage.getItem(this.prefix + collection);
    return data ? JSON.parse(data) : [];
  }

  async save<T>(collection: string, data: T[]): Promise<void> {
    localStorage.setItem(this.prefix + collection, JSON.stringify(data));
  }

  async insert<T extends { id?: string }>(collection: string, item: T): Promise<T> {
    const current = await this.query<T>(collection);
    const newItem = { ...item, id: item.id || Math.random().toString(36).substr(2, 9) };
    current.push(newItem);
    await this.save(collection, current);
    return newItem;
  }

  async upsertScore(score: any): Promise<void> {
    const scores = await this.query<any>('scores');
    const index = scores.findIndex((s: any) => 
      s.studentId === score.studentId && 
      s.subjectId === score.subjectId && 
      s.termId === score.termId
    );

    if (index > -1) {
      scores[index] = { ...scores[index], ...score };
    } else {
      scores.push({ ...score, id: Math.random().toString(36).substr(2, 9) });
    }
    await this.save('scores', scores);
  }
}

export const db = new LocalDatabase();