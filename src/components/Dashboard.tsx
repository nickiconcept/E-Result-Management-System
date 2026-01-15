import React from 'react';
import { User, UserRole } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Clock,
  ShieldCheck,
  Bell,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const data = [
  { name: 'JSS 1', pass: 45, fail: 5 },
  { name: 'JSS 2', pass: 52, fail: 8 },
  { name: 'JSS 3', pass: 38, fail: 12 },
  { name: 'SSS 1', pass: 60, fail: 4 },
  { name: 'SSS 2', pass: 48, fail: 6 },
  { name: 'SSS 3', pass: 55, fail: 2 },
];

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const isAdmin = user.role === UserRole.ADMIN;

  const stats = [
    { label: 'Total Students', value: '1,240', icon: <Users className="text-blue-500" />, trend: '+12%', color: 'bg-blue-50' },
    { label: 'Avg. School Score', value: '72.4%', icon: <TrendingUp className="text-green-500" />, trend: '+5.2%', color: 'bg-green-50' },
    { label: 'Top Student', value: 'Abia J.', icon: <Award className="text-yellow-500" />, trend: 'JSS 3A', color: 'bg-yellow-50' },
    { label: 'Pending Results', value: '42', icon: <Clock className="text-purple-500" />, trend: 'Term 2', color: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user.name}!</h1>
          <p className="text-gray-500">Academic Overview: Second Term, 2023/2024 Session.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
          <CheckCircle2 size={14} />
          System Active & Secure
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 ${stat.color} rounded-xl group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                {stat.trend}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-sm font-semibold text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Class Performance Distribution</h3>
              <p className="text-xs text-gray-400 font-medium">Pass vs. Fail metrics per class level</p>
            </div>
            <select className="text-xs font-bold border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500">
              <option>All Classes</option>
              <option>Junior Secondary</option>
              <option>Senior Secondary</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} 
                />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="pass" fill="#10B981" radius={[4, 4, 4, 4]} barSize={20} />
                <Bar dataKey="fail" fill="#EF4444" radius={[4, 4, 4, 4]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex gap-6 justify-center">
             <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div> Passing Students
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <div className="w-3 h-3 bg-red-500 rounded-sm"></div> Below Pass Mark
             </div>
          </div>
        </div>

        {/* Notifications & Health */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Bell size={20} className="text-green-600" />
            System Alerts
          </h3>
          <div className="space-y-4 flex-1">
            {[
              { type: 'alert', msg: '12 results pending Principal approval', time: '10m ago', icon: <Clock size={14} /> },
              { type: 'info', msg: 'New student registrations: +15', time: '1h ago', icon: <Users size={14} /> },
              { type: 'warning', msg: 'Result PINs running low (< 100)', time: '3h ago', icon: <AlertTriangle size={14} /> },
              { type: 'success', msg: 'Weekly database backup successful', time: 'Yesterday', icon: <ShieldCheck size={14} /> },
            ].map((n, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100/50 transition-colors border border-transparent hover:border-gray-100">
                <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  n.type === 'alert' ? 'bg-red-100 text-red-600' : 
                  n.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 
                  n.type === 'success' ? 'bg-green-100 text-green-600' : 
                  'bg-blue-100 text-blue-600'
                }`}>
                  {n.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-700 truncate">{n.msg}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-xl transition-all">
            Manage All Alerts
          </button>
        </div>
      </div>

      {/* Admin Audit Logs Section */}
      {isAdmin && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Security Audit Log</h3>
              <p className="text-xs text-gray-400 font-medium">Real-time monitoring of sensitive actions</p>
            </div>
            <button className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">View Full Log</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                <tr>
                  <th className="px-8 py-4">Staff Member</th>
                  <th className="px-8 py-4">Action Taken</th>
                  <th className="px-8 py-4">Resource</th>
                  <th className="px-8 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { user: 'Admin Joseph', action: 'Result Batch Locked', target: 'JSS 2 Mathematics', time: '14:22:15' },
                  { user: 'Mr. Okon', action: 'Score Entry', target: 'SSS 1 Biology', time: '13:45:02' },
                  { user: 'Admin Joseph', action: 'PIN Batch Generated', target: 'ADM-2024-B1', time: '11:10:55' },
                ].map((log, i) => (
                  <tr key={i} className="hover:bg-gray-50/30 text-sm group">
                    <td className="px-8 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold uppercase">
                             {log.user.split(' ')[0][0]}{log.user.split(' ')[1]?.[0] || ''}
                          </div>
                          <span className="font-bold text-gray-700">{log.user}</span>
                       </div>
                    </td>
                    <td className="px-8 py-4">
                       <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                          log.action.includes('Locked') ? 'bg-red-50 text-red-600' : 
                          log.action.includes('Entry') ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                       }`}>
                          {log.action}
                       </span>
                    </td>
                    <td className="px-8 py-4 text-gray-500 font-medium">{log.target}</td>
                    <td className="px-8 py-4 text-gray-400 font-mono text-xs">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;