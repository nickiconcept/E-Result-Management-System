
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_CLASSES, MOCK_SUBJECTS, calculateGrade } from '../constants';
import { Save, Calculator, Filter, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

interface ResultsProps { user: User; }

const Results: React.FC<ResultsProps> = ({ user }) => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
          alert("Failed to fetch data. Ensure your Google Script URL is correct in apiService.ts");
        })
        .finally(() => setLoading(false));
    }
  }, [selectedClass, selectedSubject]);

  const handleScoreChange = (index: number, field: string, value: number) => {
    const updated = [...students];
    updated[index][field] = value;
    const s = updated[index];
    const total = (s.ca1||0) + (s.ca2||0) + (s.assignment||0) + (s.notes||0) + (s.exam||0);
    s.total = total;
    s.grade = calculateGrade(total);
    setStudents(updated);
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
      alert('Saved to Google Sheets successfully!');
    } catch (err) {
      alert('Error saving scores.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="text-green-600" />
        <h1 className="text-2xl font-bold text-gray-800">Result Processing (Google Sheets)</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
            <option value="">Select Class</option>
            {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
            <option value="">Select Subject</option>
            {MOCK_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !selectedClass} className="flex-1 bg-green-700 text-white p-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-800 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'} <Save size={18} />
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {!selectedClass || !selectedSubject ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-gray-400">
                <Filter size={48} className="mb-4 text-gray-300" />
                <p>Please select Class and Subject</p>
            </div>
        ) : loading ? (
            <div className="p-12 text-center text-gray-500">
                <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p>Connecting to Google Sheet...</p>
            </div>
        ) : students.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-gray-400">
                <AlertCircle size={48} className="mb-4 text-gray-300" />
                <p>No students found for this class in 'Students' sheet</p>
            </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                <tr>
                  <th className="p-4 border-b">Student</th>
                  <th className="p-2 border-b text-center w-20">1st CA</th>
                  <th className="p-2 border-b text-center w-20">2nd CA</th>
                  <th className="p-2 border-b text-center w-20">Assg</th>
                  <th className="p-2 border-b text-center w-20">Notes</th>
                  <th className="p-2 border-b text-center w-24">Exam</th>
                  <th className="p-4 border-b text-center bg-gray-50">Total</th>
                  <th className="p-4 border-b text-center bg-gray-50">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-green-50/20">
                    <td className="p-4">
                        <p className="font-bold text-gray-800 text-sm">{st.last_name}, {st.first_name}</p>
                        <p className="text-xs text-gray-500 font-mono">{st.admission_no}</p>
                    </td>
                    {['ca1', 'ca2', 'assignment', 'notes'].map((f) => (
                        <td key={f} className="p-2 text-center">
                            <input type="number" value={st[f]} onChange={(e) => handleScoreChange(idx, f, parseFloat(e.target.value)||0)} className="w-16 p-2 text-center border border-gray-200 rounded text-sm" />
                        </td>
                    ))}
                    <td className="p-2 text-center">
                      <input type="number" value={st.exam} onChange={(e) => handleScoreChange(idx, 'exam', parseFloat(e.target.value)||0)} className="w-20 p-2 text-center border border-green-200 bg-green-50/20 rounded font-bold text-gray-800" />
                    </td>
                    <td className="p-4 text-center font-bold bg-gray-50 text-gray-800">{st.total}</td>
                    <td className="p-4 text-center bg-gray-50">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${st.grade === 'A' ? 'bg-green-100 text-green-700' : st.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{st.grade}</span>
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
