import React, { useState } from 'react';
import { 
  Search, 
  CreditCard, 
  Download, 
  Printer, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  School,
  FileText
} from 'lucide-react';
import { calculateGrade } from '../constants';
import { apiService } from '../services/apiService';

const ParentPortal: React.FC = () => {
  const [admissionNo, setAdmissionNo] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.checkResult(admissionNo, pin);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
          <div className="bg-green-800 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center font-bold text-2xl">
                {result.studentName.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{result.studentName}</h1>
                <p className="text-green-200 font-medium">ADMISSION NO: {result.admissionNo}</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-[10px] font-black text-green-300 uppercase tracking-[0.2em]">Academic Report</p>
              <p className="text-xl font-bold">Second Term 2023/2024</p>
            </div>
          </div>

          <div className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-4 font-black text-[10px] text-gray-400 uppercase tracking-widest rounded-tl-xl">Subject</th>
                    <th className="p-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">CA Total</th>
                    <th className="p-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">Exam</th>
                    <th className="p-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">Total</th>
                    <th className="p-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center rounded-tr-xl">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.scores.map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4 font-bold text-gray-700">{s.subject}</td>
                      <td className="p-4 text-center text-gray-500 font-medium">{s.ca}</td>
                      <td className="p-4 text-center text-gray-500 font-medium">{s.exam}</td>
                      <td className="p-4 text-center font-black text-gray-900">{s.total}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-lg text-xs font-black ${
                          ['A', 'B'].includes(s.grade) ? 'bg-green-100 text-green-700' : 
                          s.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {s.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-12 flex flex-col md:flex-row gap-4 items-center justify-between border-t pt-8 no-print">
              <button onClick={() => setResult(null)} className="flex items-center gap-2 text-gray-400 font-bold hover:text-green-800 transition-colors">
                <ArrowLeft size={18} /> Check Another Result
              </button>
              <div className="flex gap-4">
                <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all">
                  <Printer size={18} /> Print Result
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-green-800 hover:bg-green-900 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/20">
                  <Download size={18} /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-green-800"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-xl text-green-800 mb-6">
            <School size={40} />
          </div>
          <h1 className="text-4xl font-black text-green-950 tracking-tight">Parent Portal</h1>
          <p className="text-green-700 mt-2 font-medium opacity-80">Official School Result Verification</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-green-900/10 border border-green-100/50">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-shake">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          <form onSubmit={handleCheck} className="space-y-8">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Admission Number</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" size={20} />
                <input
                  type="text"
                  required
                  placeholder="ADM/2023/001"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-100 focus:bg-white focus:border-green-500 transition-all font-bold text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Scratch Card PIN</label>
              <div className="relative group">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" size={20} />
                <input
                  type="password"
                  required
                  placeholder="10-digit Security PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-100 focus:bg-white focus:border-green-500 transition-all font-mono font-black tracking-widest text-gray-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-800 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-green-900 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'View Report Card'
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-300 mb-2">
              <CheckCircle2 size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure Verification</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed max-w-[200px] mx-auto">
              Each PIN is valid for 5 attempts. Do not share your security details.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="#/login" className="text-green-800 text-xs font-black uppercase tracking-widest hover:underline opacity-60 hover:opacity-100 transition-opacity">
            Staff Administrative Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ParentPortal;