import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_CLASSES, MOCK_SUBJECTS, calculateGrade } from '../constants';
import { 
  Save, 
  Calculator, 
  Filter, 
  AlertCircle, 
  Sparkles, 
  FileSpreadsheet, 
  Lock, 
  Unlock, 
  CheckCircle2 
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { geminiService } from '../services/geminiService';
import { auditService } from '../services/auditService';

interface ResultsProps { user: User; }

const SCORE_FIELDS = ['ca1', 'ca2', 'assignment', 'notes'] as const;
type ScoreField = typeof SCORE_FIELDS[number] | 'exam';

const Results: React.FC<ResultsProps> = ({ user }) => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingAI, setLoadingAI] = useState<string | null>(null);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      setLoading(true);
      apiService.getScores(selectedClass, selectedSubject, 't2')
        .then(data => {
          if (Array.isArray(data)) setStudents(data);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedClass, selectedSubject]);

  const handleScoreChange = (index: number, field: ScoreField, value: number) => {
    const updated = [...students];
    updated[index][field] = value;
    const s = updated[index];
    const total = (Number(s.ca1)||0) + (Number(s.ca2)||0) + (Number(s.assignment)||0) + (Number(s.notes)||0) + (Number(s.exam)||0);
    s.total = total;
    s.grade = calculateGrade(total);
    setStudents(updated);
  };

  const generateRemark = async (student: any) => {
    setLoadingAI(student.id);
    try {
      const perf = `${student.first_name} scored ${student.total} in ${MOCK_SUBJECTS.find(s => s.id === selectedSubject)?.name}. Grade: ${student.grade}.`;
      const remark = await geminiService.generateRemark(
        `${student.first_name} ${student.last_name}`,
        perf,
        user.role === UserRole.PRINCIPAL ? 'Principal' : 'Form Master'
      );
      setRemarks(prev => ({ ...prev, [student.id]: remark }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = students.map(s => apiService.saveScore({ ...s, subjectId: selectedSubject }));
      await Promise.all(promises);
      auditService.log(user.id, user.role, 'Batch Score Update', `Updated scores in ${selectedClass}`);
      alert('Scores updated successfully!');
    } catch (err) {
      alert('Error saving scores.');
    } finally {
      setSaving(false);
    }
  };

  const isEditable = [UserRole.ADMIN, UserRole.TEACHER, UserRole.FORM_MASTER].includes(user.role);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-800 text-white rounded-xl shadow-lg shadow-green-900/20">
            <Calculator size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Result Management</h1>
            <p className="text-sm text-gray-500">Record and compute student academic performance.</p>
          </div>
        </div>
        
        <button 
          onClick={handleSave} 
          disabled={saving || !selectedClass || !selectedSubject} 
          className="w-full md:w-auto px-8 py-3 bg-green-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-900 transition-all disabled:opacity-50 shadow-lg shadow-green-900/10"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={18} /> Save Assessment</>}
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase mb-2">Class Level</label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)} 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="">Select Class</option>
            {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase mb-2">Subject</label>
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)} 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="">Select Subject</option>
            {MOCK_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-4 bg-green-50/50 p-3 rounded-xl border border-green-100">
           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="text-green-600" size={20} />
           </div>
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Records Found</p>
              <p className="text-xs font-bold text-gray-700">{loading ? 'Searching...' : `${students.length} Students`}</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {!selectedClass || !selectedSubject ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-gray-400">
                <Filter size={64} className="mb-4 text-gray-100" />
                <p className="font-bold">Select class and subject to begin entry</p>
            </div>
        ) : loading ? (
            <div className="p-24 text-center">
                <div className="inline-block w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-bold text-gray-400">Loading Student Portal...</p>
            </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-5 border-b">Student</th>
                  {SCORE_FIELDS.map(f => <th key={f} className="p-2 border-b text-center w-20">{f}</th>)}
                  <th className="p-2 border-b text-center w-24 text-green-700">EXAM</th>
                  <th className="px-6 py-5 border-b text-center">TOTAL</th>
                  <th className="px-6 py-5 border-b text-center">GRADE</th>
                  <th className="px-6 py-5 border-b text-center">REMARK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-green-50/20 transition-colors group">
                    <td className="px-6 py-4">
                        <p className="font-bold text-gray-800 text-sm">{st.last_name}, {st.first_name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{st.admission_no}</p>
                    </td>
                    {SCORE_FIELDS.map((f) => (
                        <td key={f} className="p-2 text-center">
                            <input 
                              type="number" 
                              disabled={!isEditable || st.is_locked}
                              value={st[f]} 
                              onChange={(e) => handleScoreChange(idx, f, Math.min(10, Math.max(0, parseInt(e.target.value)||0)))} 
                              className="w-14 p-2 text-center border border-gray-100 bg-gray-50/50 rounded-lg text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none" 
                            />
                        </td>
                    ))}
                    <td className="p-2 text-center">
                      <input 
                        type="number" 
                        disabled={!isEditable || st.is_locked}
                        value={st.exam} 
                        onChange={(e) => handleScoreChange(idx, 'exam', Math.min(60, Math.max(0, parseInt(e.target.value)||0)))} 
                        className="w-20 p-2 text-center border-2 border-green-100 bg-green-50/50 rounded-lg font-black text-gray-800 focus:ring-2 focus:ring-green-500 outline-none" 
                      />
                    </td>
                    <td className="px-6 py-4 text-center font-black text-gray-900">{st.total}</td>
                    <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-black ${st.grade === 'A' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{st.grade}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex items-center justify-center gap-2">
                          {remarks[st.id] ? (
                             <div className="relative group/remark">
                                <CheckCircle2 className="text-green-500" size={18} />
                                <div className="absolute bottom-full mb-2 right-0 w-48 p-3 bg-gray-900 text-white text-[10px] rounded-xl shadow-2xl opacity-0 group-hover/remark:opacity-100 transition-opacity z-10 pointer-events-none">
                                   {remarks[st.id]}
                                </div>
                             </div>
                          ) : (
                             <button 
                               onClick={() => generateRemark(st)}
                               disabled={loadingAI === st.id}
                               className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                             >
                               {loadingAI === st.id ? <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /> : <Sparkles size={18} />}
                             </button>
                          )}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;