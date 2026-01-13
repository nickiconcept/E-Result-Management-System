
import React, { useState } from 'react';
import { 
  Search, 
  CreditCard, 
  Download, 
  Printer, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { calculateGrade } from '../constants';

const ParentPortal: React.FC = () => {
  const [admissionNo, setAdmissionNo] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate result fetching and PIN validation
    setTimeout(() => {
      if (pin === '1234567890') {
        setResult({
          studentName: 'Chimaobi Okafor',
          class: 'JSS 3 - Diamond',
          term: 'Second Term',
          session: '2023/2024',
          scores: [
            { subject: 'Mathematics', ca: 34, exam: 55, total: 89 },
            { subject: 'English Language', ca: 30, exam: 45, total: 75 },
            { subject: 'Basic Science', ca: 28, exam: 32, total: 60 },
            { subject: 'Agricultural Science', ca: 35, exam: 58, total: 93 },
          ],
          remarks: {
            formMaster: 'Excellent performance, keep up the good work.',
            principal: 'A brilliant student with great potential.'
          }
        });
      } else {
        setError('Invalid PIN or Maximum Usage (5) reached.');
      }
      setLoading(false);
    }, 1500);
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
          {/* Result Header */}
          <div className="bg-green-800 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center font-bold text-3xl">
                CO
              </div>
              <div>
                <h1 className="text-2xl font-bold">{result.studentName}</h1>
                <p className="text-green-200">{result.class}</p>
              </div>
            </div>
            <div className="text-right md:text-right text-center">
              <p className="text-sm font-medium text-green-300 uppercase tracking-widest">Official Report Card</p>
              <p className="text-xl font-bold">{result.term} {result.session}</p>
            </div>
          </div>

          {/* Result Body */}
          <div className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-4 rounded-tl-xl font-bold text-gray-700">Subject</th>
                    <th className="p-4 font-bold text-gray-700 text-center">CA (40)</th>
                    <th className="p-4 font-bold text-gray-700 text-center">Exam (60)</th>
                    <th className="p-4 font-bold text-gray-700 text-center">Total (100)</th>
                    <th className="p-4 rounded-tr-xl font-bold text-gray-700 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.scores.map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{s.subject}</td>
                      <td className="p-4 text-center text-gray-600">{s.ca}</td>
                      <td className="p-4 text-center text-gray-600">{s.exam}</td>
                      <td className="p-4 text-center font-bold text-gray-900">{s.total}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          s.total >= 70 ? 'bg-green-100 text-green-700' : 
                          s.total >= 50 ? 'bg-blue-100 text-blue-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {calculateGrade(s.total)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 rounded-2xl">
                <h3 className="font-bold text-gray-800 mb-2">Form Master's Remarks</h3>
                <p className="text-gray-600 italic">"{result.remarks.formMaster}"</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl">
                <h3 className="font-bold text-gray-800 mb-2">Principal's Remarks</h3>
                <p className="text-gray-600 italic">"{result.remarks.principal}"</p>
              </div>
            </div>

            <div className="mt-12 flex flex-col md:flex-row gap-4 items-center justify-between border-t pt-8">
              <button 
                onClick={() => setResult(null)}
                className="flex items-center gap-2 text-gray-500 font-bold hover:text-green-800"
              >
                <ArrowLeft size={18} />
                Check Another Result
              </button>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all">
                  <Printer size={18} />
                  Print Result
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-green-800 hover:bg-green-900 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/20">
                  <Download size={18} />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg text-green-800 mb-4">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-bold text-green-900">Check Your Result</h1>
          <p className="text-green-600 mt-2">Enter your admission number and scratch card PIN</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-green-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <form onSubmit={handleCheck} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Admission Number</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="e.g., ADM/2023/001"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Result Checker PIN</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="10-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-800 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-900 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Check Result Now'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-4">Security Notice</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your PIN is valid for 5 attempts only for the selected term. 
              Keep your PIN secure and do not share it with others.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="#/login" className="text-green-800 text-sm font-bold hover:underline">
            Are you a Teacher/Staff? Login here
          </a>
        </div>
      </div>
    </div>
  );
};

export default ParentPortal;
