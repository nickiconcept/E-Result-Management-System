
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Lock, Mail, ChevronRight, School } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [email, setEmail] = useState('admin@school.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);

  // Auto-update email based on role selection for convenience
  useEffect(() => {
    switch (role) {
      case UserRole.ADMIN:
        setEmail('admin@school.com');
        break;
      case UserRole.PRINCIPAL:
        setEmail('principal@school.com');
        break;
      case UserRole.TEACHER:
        setEmail('teacher@school.com');
        break;
      case UserRole.FORM_MASTER:
        setEmail('form_master@school.com');
        break;
      default:
        setEmail('');
    }
  }, [role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      let name = 'User';
      if (role === UserRole.ADMIN) name = 'Admin Joseph';
      if (role === UserRole.PRINCIPAL) name = 'Principal Amadi';
      if (role === UserRole.TEACHER) name = 'Mr. Okon';
      if (role === UserRole.FORM_MASTER) name = 'Mrs. Adebayo';

      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        role: role,
        status: 'active'
      };
      onLogin(mockUser);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-green-800 text-white shadow-xl mb-4">
            <School size={40} />
          </div>
          <h1 className="text-3xl font-bold text-green-900">E-Result Portal</h1>
          <p className="text-green-600 mt-2">School Management System (Nigeria)</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-green-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">User Role</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(UserRole).filter(r => r !== UserRole.PARENT).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r as UserRole)}
                    className={`px-3 py-2 text-xs font-bold rounded-lg border-2 transition-all ${
                      role === r 
                      ? 'border-green-600 bg-green-50 text-green-700' 
                      : 'border-gray-100 bg-white text-gray-400 hover:border-green-200'
                    }`}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-800 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In to Dashboard
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Are you a parent checking results? 
              <a href="#/portal" className="text-green-700 font-bold hover:underline ml-1">Go to Parent Portal</a>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-green-700/50 mt-8 font-medium">
          Secure E-Result Management System &copy; 2024 <br/>
          Built for Nigerian Educational Excellence
        </p>
      </div>
    </div>
  );
};

export default Login;
