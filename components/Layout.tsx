
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  LogOut, 
  Key, 
  Bell,
  ChevronDown,
  CalendarDays,
  CheckCircle2
} from 'lucide-react';
import { MOCK_SESSIONS, MOCK_TERMS } from '../constants';
import { auditService } from '../services/auditService';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [currentSession, setCurrentSession] = useState(MOCK_SESSIONS.find(s => s.active) || MOCK_SESSIONS[0]);
  const [currentTerm, setCurrentTerm] = useState(MOCK_TERMS.find(t => t.active) || MOCK_TERMS[0]);

  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: Object.values(UserRole) },
    { label: 'Students', icon: <Users size={20} />, path: '/students', roles: [UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.FORM_MASTER] },
    { label: 'Results', icon: <BookOpen size={20} />, path: '/results', roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.FORM_MASTER, UserRole.PRINCIPAL] },
    { label: 'PIN Manager', icon: <Key size={20} />, path: '/pin-manager', roles: [UserRole.ADMIN] },
    { label: 'Audit Logs', icon: <ShieldCheck size={20} />, path: '/audit-logs', roles: [UserRole.ADMIN] },
  ];

  const canSwitchContext = [UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.FORM_MASTER].includes(user.role);

  const handleSwitch = (sessionId: string, termId: string) => {
    const session = MOCK_SESSIONS.find(s => s.id === sessionId);
    const term = MOCK_TERMS.find(t => t.id === termId);
    if (session && term) {
      setCurrentSession(session);
      setCurrentTerm(term);
      setShowSwitcher(false);
      auditService.log(user.id, user.role, 'Academic Context Switch', `${session.name} - ${term.name} Term`);
    }
  };

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-green-800 text-white flex-shrink-0 flex flex-col shadow-xl">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="text-green-400" />
            E-RESULT
          </h1>
          <p className="text-xs text-green-300 mt-1 uppercase tracking-widest">School Management</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {filteredMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700/50'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-green-700 space-y-4">
          <div className="flex items-center gap-3 px-4">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-green-300 capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-700 capitalize">
            {location.pathname.split('/')[1] || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-green-600 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            
            {/* Session/Term Switcher */}
            <div className="relative">
              <button 
                disabled={!canSwitchContext}
                onClick={() => setShowSwitcher(!showSwitcher)}
                className={`flex items-center gap-3 text-right px-3 py-1.5 rounded-lg transition-all ${
                  canSwitchContext ? 'hover:bg-gray-50 cursor-pointer group' : 'cursor-default'
                }`}
              >
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Academic Session</p>
                  <p className="text-sm font-bold text-green-700 leading-tight">
                    {currentSession.name} - {currentTerm.name} Term
                  </p>
                </div>
                {canSwitchContext && <ChevronDown size={16} className={`text-gray-400 group-hover:text-green-600 transition-transform ${showSwitcher ? 'rotate-180' : ''}`} />}
              </button>

              {showSwitcher && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowSwitcher(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 py-4 animate-in fade-in zoom-in duration-200">
                    <div className="px-4 pb-3 border-b border-gray-50 mb-3 flex items-center gap-2 text-gray-800 font-bold text-sm">
                      <CalendarDays size={18} className="text-green-600" />
                      Switch Academic Context
                    </div>
                    
                    <div className="px-2 space-y-4">
                      <div>
                        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase mb-2">Select Session</p>
                        <div className="space-y-1">
                          {MOCK_SESSIONS.map(s => (
                            <button
                              key={s.id}
                              onClick={() => handleSwitch(s.id, currentTerm.id)}
                              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                                currentSession.id === s.id 
                                ? 'bg-green-50 text-green-700 font-bold' 
                                : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {s.name}
                              {currentSession.id === s.id && <CheckCircle2 size={14} />}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase mb-2">Select Term</p>
                        <div className="grid grid-cols-1 gap-1">
                          {MOCK_TERMS.map(t => (
                            <button
                              key={t.id}
                              onClick={() => handleSwitch(currentSession.id, t.id)}
                              className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                                currentTerm.id === t.id 
                                ? 'bg-green-50 text-green-700 font-bold' 
                                : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {t.name} Term
                              {currentTerm.id === t.id && <CheckCircle2 size={14} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
