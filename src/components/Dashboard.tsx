
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Clock,
  Info,
  CheckCircle2,
  ExternalLink,
  X
} from 'lucide-react';
import { apiService } from '../services/apiService';

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
  const [showGuide, setShowGuide] = useState(apiService.isDemo);

  const stats = [
    { label: 'Total Students', value: '1,240', icon: <Users className="text-blue-500" />, trend: '+12%' },
    { label: 'Avg. Class Score', value: '72%', icon: <TrendingUp className="text-green-500" />, trend: '+5%' },
    { label: 'Top Performer', value: 'Abia J.', icon: <Award className="text-yellow-500" />, trend: 'JSS 3A' },
    { label: 'Pending Results', value: '42', icon: <Clock className="text-purple-500" />, trend: 'Admin' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Demo Mode Guide Banner */}
      {showGuide && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 relative">
          <button 
            onClick={() => setShowGuide(false)}
            className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-700"
          >
            <X size={20} />
          </button>
          <div className="flex gap-4">
            <div className="bg-indigo-100 p-3 rounded-lg h-fit text-indigo-600">
              <Info size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-indigo-900 mb-2">Welcome to Demo Mode!</h2>
              <p className="text-indigo-800 text-sm mb-4 leading-relaxed max-w-2xl">
                You are currently running in a simulated environment. You can explore the dashboard, 
                edit scores in the "Results" tab, and see how the app works. Data is not currently being saved to a database.
              </p>
              
              <div className="bg-white/60 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-sm text-indigo-900 uppercase tracking-wide mb-3">How to connect real Google Sheets:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-indigo-800">
                  <li>Create a new Google Sheet (Tabs: Users, Students, Scores, Classes, Subjects).</li>
                  <li>Open <strong>Extensions &gt; Apps Script</strong> in the sheet.</li>
                  <li>Copy the code from <code>backend_google_sheet.js</code> in this project and paste it there.</li>
                  <li>Deploy as Web App (Access: Anyone) and copy the URL.</li>
                  <li>Paste the URL into <code>src/services/apiService.ts</code>.</li>
                </ol>
              </div>
              
              <div className="flex gap-3">
                 <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
                   <CheckCircle2 size={14} /> React App Running
                 </span>
                 <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                   <CheckCircle2 size={14} /> Using Mock Data
                 </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user.name}!</h1>
        <p className="text-gray-500">Here is the overview of your school activities for Second Term, 2023/2024.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                {stat.icon}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'
              }`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-sm font-medium text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Class Performance Distribution</h3>
            <select className="text-sm border-none bg-gray-50 rounded p-1 outline-none font-medium">
              <option>All Classes</option>
              <option>Junior Secondary</option>
              <option>Senior Secondary</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="pass" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fail" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">System Health & Notifications</h3>
          <div className="space-y-4">
            {[
              { type: 'alert', msg: '12 results pending approval from Principal', time: '10m ago' },
              { type: 'info', msg: 'New student registrations completed: 15', time: '1h ago' },
              { type: 'warning', msg: 'Result checking PINs running low (< 100)', time: '3h ago' },
              { type: 'info', msg: 'System backup successful', time: 'Yesterday' },
            ].map((n, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${
                  n.type === 'alert' ? 'bg-red-500' : n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-700">{n.msg}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-bold text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
            View All Notifications
          </button>
        </div>
      </div>

      {/* Audit Log Preview (Admin Only) */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Recent System Logs</h3>
            <button className="text-sm text-blue-600 font-bold hover:underline">View All Logs</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { user: 'Admin J.', action: 'Result Locked', target: 'JSS 2 Math', time: '2023-11-20 14:22' },
                { user: 'Teacher M.', action: 'Scores Uploaded', target: 'SSS 1 Physics', time: '2023-11-20 13:45' },
                { user: 'Admin J.', action: 'PIN Generated', target: 'Batch #2024A', time: '2023-11-20 11:10' },
              ].map((log, i) => (
                <tr key={i} className="hover:bg-gray-50/50 text-sm">
                  <td className="px-6 py-4 font-medium text-gray-900">{log.user}</td>
                  <td className="px-6 py-4 text-gray-600">{log.action}</td>
                  <td className="px-6 py-4 text-gray-600">{log.target}</td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
