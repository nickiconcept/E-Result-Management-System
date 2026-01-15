import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClassLevel, 
  Arm, 
  Subject, 
  Score, 
  Student, 
  User, 
  UserRole 
} from '../types';
import { 
  MOCK_CLASSES, 
  MOCK_ARMS, 
  MOCK_SUBJECTS, 
  MOCK_STUDENTS,
  calculateGrade 
} from '../constants';
import { 
  Save, 
  Lock, 
  Unlock, 
  Calculator, 
  Sparkles, 
  Filter,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { auditService } from '../services/auditService';

interface ResultsProps {
  user: User;
}

const Results: React.FC<ResultsProps> = ({ user }) => {
  // Filters
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedArm, setSelectedArm] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [viewMode, setViewMode] = useState<'scores' | 'remarks'>('scores');

  // Data State
  const [scores, setScores] = useState<Record<string, Score>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Derived Data
  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter(s => 
      (!selectedClass || s.classId === selectedClass) &&
      (!selectedArm || s.armId === selectedArm)
    );
  }, [selectedClass, selectedArm]);

  // Initial Data Load (Simulation)
  useEffect(() => {
    if (filteredStudents.length > 0 && selectedSubject) {
      const newScores = { ...scores };
      filteredStudents.forEach(student => {
        const key = `${student.id}-${selectedSubject}`;
        if (!newScores[key]) {
          newScores[key] = {
            id: Math.random().toString(),
            studentId: student.id,
            subjectId: selectedSubject,
            termId: 't2',
            sessionId: 's1',
            ca1: 0,
            ca2: 0,
            assignment: 0,
            notes: 0,
            exam: 0,
            total: 0,
            grade: 'F',
            isLocked: false
          };
        }
      });
      setScores(newScores);
    }
  }, [filteredStudents, selectedSubject]);

  // Handlers
  const handleScoreChange = (studentId: string, field: keyof Score, value: number) => {
    if (!selectedSubject) return;
    
    const key = `${studentId}-${selectedSubject}`;
    const currentScore = scores[key];
    
    const limits: Record<string, number> = { ca1: 10, ca2: 10, assignment: 10, notes: 10, exam: 60 };
    if (value > limits[field as string] || value < 0) return;

    // Create a safe update object with defaults
    const updatedScore: Score = {
       id: currentScore?.id || Math.random().toString(),
       studentId: currentScore?.studentId || studentId,
       subjectId: currentScore?.subjectId || selectedSubject,
       termId: currentScore?.termId || 't2',
       sessionId: currentScore?.sessionId || 's1',
       ca1: field === 'ca1' ? value : (currentScore?.ca1 || 0),
       ca2: field === 'ca2' ? value : (currentScore?.ca2 || 0),
       assignment: field === 'assignment' ? value : (currentScore?.assignment || 0),
       notes: field === 'notes' ? value : (currentScore?.notes || 0),
       exam: field === 'exam' ? value : (currentScore?.exam || 0),
       total: 0,
       grade: 'F',
       isLocked: currentScore?.isLocked || false
    };
    
    // Calculate Total
    updatedScore.total = 
      updatedScore.ca1 + 
      updatedScore.ca2 + 
      updatedScore.assignment + 
      updatedScore.notes + 
      updatedScore.exam;
      
    updatedScore.grade = calculateGrade(updatedScore.total);

    setScores(prev => ({ ...prev, [key]: updatedScore }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      auditService.log(
        user.id, 
        user.role, 
        'Save Scores', 
        `Class: ${MOCK_CLASSES.find(c => c.id === selectedClass)?.name}, Subject: ${MOCK_SUBJECTS.find(s => s.id === selectedSubject)?.name}`
      );
      alert('Scores saved successfully!');
    }, 800);
  };

  const generateAIRemark = async (student: Student) => {
    setLoadingAI(student.id);
    const performance = `The student scored an average of 75% across subjects.`;
    const remark = await geminiService.generateRemark(
      `${student.firstName} ${student.lastName}`, 
      performance, 
      user.role === UserRole.PRINCIPAL ? 'Principal' : 'Form Master'
    );
    
    setRemarks(prev => ({ ...prev, [student.id]: remark }));
    setLoadingAI(null);
    auditService.log(user.id, user.role, 'Generate AI Remark', `Student: ${student.admissionNo}`);
  };

  const canEditScores = [UserRole.ADMIN, UserRole.TEACHER, UserRole.FORM_MASTER].includes(user.role);
  const canViewRemarks = [UserRole.ADMIN, UserRole.FORM_MASTER, UserRole.PRINCIPAL].includes(user.role);

  // Render Helpers
  const renderScoresTable = () => {
    if (!selectedSubject) {
      return (
        <div className="h-[400px] flex flex-col items-center justify-center text-gray-400">
           <FileSpreadsheet size={48} className="mb-4 text-gray-300" />
           <p>Select a Subject to enter scores.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
            <tr>
              <th className="p-4 border-b">Student</th>
              <th className="p-4 border-b text-center w-20">1st CA <span className="text-[10px] text-gray-400 block">(10)</span></th>
              <th className="p-4 border-b text-center w-20">2nd CA <span className="text-[10px] text-gray-400 block">(10)</span></th>
              <th className="p-4 border-b text-center w-20">Assg <span className="text-[10px] text-gray-400 block">(10)</span></th>
              <th className="p-4 border-b text-center w-20">Notes <span className="text-[10px] text-gray-400 block">(10)</span></th>
              <th className="p-4 border-b text-center w-24">Exam <span className="text-[10px] text-gray-400 block">(60)</span></th>
              <th className="p-4 border-b text-center w-20 bg-gray-50/50">Total</th>
              <th className="p-4 border-b text-center w-20 bg-gray-50/50">Grade</th>
              <th className="p-4 border-b text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents.map((student) => {
              const score = scores[`${student.id}-${selectedSubject}`];
              return (
                <tr key={student.id} className="hover:bg-green-50/30 transition-colors group">
                  <td className="p-4">
                    <p className="font-bold text-gray-800 text-sm">{student.lastName}, {student.firstName}</p>
                    <p className="text-xs text-gray-500 font-mono">{student.admissionNo}</p>
                  </td>
                  {(['ca1', 'ca2', 'assignment', 'notes'] as const).map((field) => (
                    <td key={field} className="p-2 text-center">
                      <input
                        type="number"
                        disabled={!canEditScores || score?.isLocked}
                        value={score?.[field] || 0}
                        onChange={(e) => handleScoreChange(student.id, field, parseInt(e.target.value) || 0)}
                        className="w-16 p-2 text-center border border-gray-200 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium"
                      />
                    </td>
                  ))}
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      disabled={!canEditScores || score?.isLocked}
                      value={score?.exam || 0}
                      onChange={(e) => handleScoreChange(student.id, 'exam', parseInt(e.target.value) || 0)}
                      className="w-20 p-2 text-center border border-green-200 bg-green-50/30 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm font-bold text-gray-800"
                    />
                  </td>
                  <td className="p-4 text-center font-bold text-gray-800 bg-gray-50/30">{score?.total || 0}</td>
                  <td className="p-4 text-center bg-gray-50/30">
                     <span className={`px-2 py-1 rounded text-xs font-bold ${
                        score?.grade === 'A' ? 'bg-green-100 text-green-700' :
                        score?.grade === 'F' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                     }`}>
                       {score?.grade || 'F'}
                     </span>
                  </td>
                  <td className="p-4 text-center">
                     {score?.isLocked ? (
                       <Lock size={16} className="mx-auto text-gray-400" />
                     ) : (
                       <Unlock size={16} className="mx-auto text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                     )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderRemarksTable = () => {
    return (
      <div className="overflow-x-auto">
         <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
               <tr>
                  <th className="p-4 border-b w-1/4">Student Details</th>
                  <th className="p-4 border-b w-1/6">Performance Summary</th>
                  <th className="p-4 border-b">Form Master's Remark</th>
                  <th className="p-4 border-b w-24">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                     <td className="p-4">
                        <p className="font-bold text-gray-800">{student.lastName}, {student.firstName}</p>
                        <p className="text-xs text-gray-500">{student.admissionNo}</p>
                        <div className="mt-2 flex gap-1">
                           <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">95% Att.</span>
                        </div>
                     </td>
                     <td className="p-4">
                        <div className="space-y-1 text-sm">
                           <div className="flex justify-between">
                              <span className="text-gray-500">Total:</span>
                              <span className="font-bold">754</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-gray-500">Avg:</span>
                              <span className="font-bold text-green-600">75.4%</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-gray-500">Pos:</span>
                              <span className="font-bold">3rd</span>
                           </div>
                        </div>
                     </td>
                     <td className="p-4">
                        <textarea
                          value={remarks[student.id] || ''}
                          onChange={(e) => setRemarks(prev => ({ ...prev, [student.id]: e.target.value }))}
                          placeholder="Enter remark here..."
                          className="w-full h-24 p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none"
                        />
                     </td>
                     <td className="p-4 text-center align-top">
                        <button
                          onClick={() => generateAIRemark(student)}
                          disabled={loadingAI === student.id}
                          className="flex flex-col items-center justify-center gap-1 text-purple-600 hover:bg-purple-50 p-2 rounded-lg transition-colors w-full"
                          title="Generate AI Remark"
                        >
                           {loadingAI === student.id ? (
                              <div className="w-5 h-5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                           ) : (
                              <>
                                <Sparkles size={20} />
                                <span className="text-[10px] font-bold">Auto-Gen</span>
                              </>
                           )}
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calculator className="text-green-600" />
            Result Processing
          </h1>
          <p className="text-gray-500">Enter scores, compute grades, and manage student assessments.</p>
        </div>
        
        {canViewRemarks && (
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              onClick={() => setViewMode('scores')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
                viewMode === 'scores' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Subject Scores
            </button>
            <button
              onClick={() => setViewMode('remarks')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
                viewMode === 'remarks' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Remarks & Broadsheet
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class</label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="">Select Class</option>
            {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Arm</label>
          <select 
            value={selectedArm} 
            onChange={(e) => setSelectedArm(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="">All Arms</option>
            {MOCK_ARMS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        
        {viewMode === 'scores' && (
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">Select Subject</option>
              {MOCK_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}

        <div className="flex gap-2">
           <button 
             onClick={handleSave}
             disabled={saving || !selectedClass}
             className="flex-1 bg-green-700 hover:bg-green-800 text-white p-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {saving ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <>
                 <Save size={18} />
                 Save Changes
               </>
             )}
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {!selectedClass ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-gray-400">
            <Filter size={48} className="mb-4 text-gray-300" />
            <p>Please select a Class {viewMode === 'scores' && 'and Subject'} to view data.</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-gray-400">
            <AlertCircle size={48} className="mb-4 text-gray-300" />
            <p>No students found for this selection.</p>
          </div>
        ) : viewMode === 'scores' ? (
          renderScoresTable()
        ) : (
          renderRemarksTable()
        )}
      </div>
    </div>
  );
};

export default Results;