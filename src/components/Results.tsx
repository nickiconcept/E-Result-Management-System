
import React, { useState, useEffect } from 'react';
import { User, UserRole, Score } from '../types';
import { MOCK_CLASSES, MOCK_SUBJECTS, calculateGrade } from '../constants';
// Added CheckCircle2 to the imports from lucide-react
import { Save, Calculator, Filter, AlertCircle, Sparkles, FileSpreadsheet, Lock, Unlock, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/apiService';
import { geminiService } from '../services/geminiService';
import { auditService } from '../services/auditService';

interface ResultsProps { user: User; }

// Fixed typing for score fields to avoid implicit any errors
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
      setStudents([]); 
      apiService.getScores(selectedClass, selectedSubject, 't2')
        .then(data => {
          if (Array.isArray(data)) setStudents(data);
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedClass, selectedSubject]);

  const handleScoreChange = (index: number, field: ScoreField, value: number) => {
    const updated = [...students];
    updated[index][field] = value;
    const s = updated[index];
    const total = (s.ca1||0) + (s.ca2||0) + (s.assignment||0) + (s.notes||0) + (s.exam||0);
    s.total = total;
    s.grade = calculateGrade(total);
    setStudents(updated);
  };

  const generateRemark = async (student: any, index: number) => {
    setLoadingAI(student.id);
    try {
      const performance = `${student.first_name} scored a total of ${student.total} in ${MOCK_SUBJECTS.find(s => s.id === selectedSubject)?.name}. Grade: ${student.grade}.`;
      const remark = await geminiService.generateRemark(
        `${student.first_name} ${student.last_name}`,
        performance,
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
      const promises = students.map(s => apiService.saveScore({
        studentId: s.id,
        subjectId: selectedSubject,
        termId: 't2',
        sessionId: 's1',
        ca1: s.ca1, ca2: s.ca2, assignment: s.assignment, notes: s.notes, 
        exam: s.exam, total: s.total, grade: s.grade, isLocked: s.is_locked
      }));
      await Promise.all(promises);
      auditService.log(user.id, user.role, 'Batch Score Update', `Updated scores for ${students.length} students in ${selectedClass}`);
      alert('Assessment scores updated successfully!');
    } catch (err) {
      alert('Error saving scores.');
    } finally {
      setSaving(false);
    }
  };

  const isEditable = [UserRole.ADMIN, UserRole.TEACHER, UserRole.FORM_MASTER].includes(user.role);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calculator className="text-green-700" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Result Management</h1>
            <p className="text-sm text-gray-500 font-medium">Record continuous assessments and exam scores.</p>
          </div>
        </div>
        
        <div className="flex gap-2">
            <button 
              onClick={handleSave} 
              disabled={saving || !selectedClass || !selectedSubject} 
              className="px-6 py-2.5 bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-800 transition-all shadow-lg shadow-green-900/10 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Save size={18} /> Save Batch</>
              )}
            </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Class Level</label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)} 
            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500 outline-none transition-all"
          >
            <option value="">Select Class</option>
            {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Subject</label>
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)} 
            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500 outline-none transition-all"
          >
            <option value="">Select Subject</option>
            {MOCK_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
           <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="text-blue-500" size={20} />
           </div>
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Status</p>
              <p className="text-xs font-bold text-gray-700">
                {!selectedClass || !selectedSubject ? 'Awaiting Selection' : loading ? 'Fetching Records...' : `${students.length} Records Loaded`}
              </p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {!selectedClass || !selectedSubject ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-gray-400 animate-pulse">
                <Filter size={64} className="mb-4 text-gray-100" />
                <p className="font-bold">Select parameters to view assessment sheet</p>
            </div>
        ) : loading ? (
            <div className="p-24 text-center">
                <div className="inline-block w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">Accessing Student Portal...</p>
            </div>
        ) : students.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-gray-400">
                <AlertCircle size={48} className="mb-4 text-gray-300" />
                <p className="font-bold">No students found in this class level</p>
            </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-5 border-b">Student Identity</th>
                  {SCORE_FIELDS.map(f => (
                    <th key={f} className="p-2 border-b text-center w-24">
                      {f.toUpperCase()} <span className="block text-[8px] opacity-60">(10)</span>
                    </th>
                  ))}
                  <th className="p-2 border-b text-center w-28 font-black text-green-700">
                    EXAM <span className="block text-[8px] opacity-60">(60)</span>
                  </th>
                  <th className="px-6 py-5 border-b text-center bg-gray-50/50">TOTAL</th>
                  <th className="px-6 py-5 border-b text-center bg-gray-50/50">GRADE</th>
                  <th className="px-6 py-5 border-b text-center">REMARK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-green-50/20 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 group-hover:bg-green-100 group-hover:text-green-700 transition-colors">
                              {st.last_name[0]}{st.first_name[0]}
                           </div>
                           <div>
                              <p className="font-bold text-gray-800 text-sm leading-tight">{st.last_name}, {st.first_name}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{st.admission_no}</p>
                           </div>
                        </div>
                    </td>
                    {SCORE_FIELDS.map((f) => (
                        <td key={f} className="p-2 text-center">
                            <input 
                              type="number" 
                              disabled={!isEditable || st.is_locked}
                              value={st[f]} 
                              onChange={(e) => handleScoreChange(idx, f, Math.min(10, Math.max(0, parseFloat(e.target.value)||0)))} 
                              className="w-16 p-2 text-center border border-gray-100 bg-gray-50/30 rounded-lg text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50" 
                            />
                        </td>
                    ))}
                    <td className="p-2 text-center">
                      <input 
                        type="number" 
                        disabled={!isEditable || st.is_locked}
                        value={st.exam} 
                        onChange={(e) => handleScoreChange(idx, 'exam', Math.min(60, Math.max(0, parseFloat(e.target.value)||0)))} 
                        className="w-20 p-2 text-center border-2 border-green-200 bg-green-50/30 rounded-lg font-black text-gray-800 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50" 
                      />
                    </td>
                    <td className="px-6 py-4 text-center font-black bg-gray-50/30 text-gray-900">{st.total}</td>
                    <td className="px-6 py-4 text-center bg-gray-50/30">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black ${
                          st.grade === 'A' ? 'bg-green-100 text-green-700' : 
                          st.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {st.grade}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex items-center justify-center gap-2">
                          {remarks[st.id] ? (
                             <div className="relative group/remark">
                                <CheckCircle2 className="text-green-500" size={18} />
                                <div className="absolute bottom-full mb-2 right-0 w-48 p-2 bg-gray-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover/remark:opacity-100 pointer-events-none transition-opacity z-10">
                                   {remarks[st.id]}
                                </div>
                             </div>
                          ) : (
                             <button 
                               onClick={() => generateRemark(st, idx)}
                               disabled={loadingAI === st.id}
                               className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                               title="Generate AI Remark"
                             >
                               {loadingAI === st.id ? <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /> : <Sparkles size={18} />}
                             </button>
                          )}
                          {st.is_locked ? <Lock size={14} className="text-gray-400" /> : <Unlock size={14} className="text-green-300 opacity-0 group-hover:opacity-100" />}
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
