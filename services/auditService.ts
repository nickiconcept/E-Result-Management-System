
import { UserRole, AuditLog } from '../types';

class AuditService {
  private logs: AuditLog[] = [];

  constructor() {
    const saved = localStorage.getItem('audit_logs');
    if (saved) {
      this.logs = JSON.parse(saved);
    }
  }

  async log(userId: string, role: UserRole, action: string, affectedRecord: string) {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      userRole: role,
      action,
      affectedRecord,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.1' // Simulated
    };
    this.logs.unshift(newLog);
    localStorage.setItem('audit_logs', JSON.stringify(this.logs));
  }

  getLogs() {
    return [...this.logs];
  }
}

export const auditService = new AuditService();
