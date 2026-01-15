import React, { useState, useEffect } from 'react';
import { Key, RefreshCw, Download, FileText, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/apiService';
import { MOCK_CLASSES } from '../constants';

const PINManager: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedPins, setGeneratedPins] = useState<any[]>([]);

  useEffect(() => {
    if (selectedClass) {
      apiService.getStudents(selectedClass).then(setStudents);
    }
  }, [selectedClass]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const pins = await apiService.generatePins(students.map(s => s.id), 't2');
      setGeneratedPins(pins);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-yellow-50 text-yellow-600 rounded-2xl">
            <Key size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">PIN Management</h1>
            <p className="text-gray-500">Generate scratch card codes for result checking.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="">Select Class</option>
            {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button 
            onClick={handleGenerate}
            disabled={!selectedClass || generating}
            className="px-6 py-3 bg-green-800 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-green-900 transition-all disabled:opacity-50 shadow-lg shadow-green-900/10"
          >
            {generating ? <RefreshCw className="animate-spin" size={18} /> : <><RefreshCw size={18} /> Generate Codes</>}
          </button>
        </div>
      </div>

      {generatedPins.length > 0 && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Generated PIN Batch</h3>
            <button className="text-sm font-bold text-blue-600 flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100">
              <Download size={16} /> Export to Excel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedPins.map((p, i) => {
              const student = students.find(s => s.id === p.studentId);
              return (
                <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Student</p>
                    <p className="text-sm font-bold text-gray-700">{student?.firstName} {student?.lastName}</p>
                    <p className="text-lg font-mono font-black text-green-700 mt-1">{p.pin.replace(/(.{4})/g, '$1 ')}</p>
                  </div>
                  <div className="text-right">
                    <CheckCircle2 className="text-green-500 ml-auto" size={20} />
                    <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Valid 90 Days</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
        <FileText className="text-blue-500 shrink-0" size={24} />
        <div className="text-sm text-blue-800 leading-relaxed">
          <p className="font-bold mb-1">Administrator Notice</p>
          Generated PINs are specific to the student and the academic term. Each PIN allows for 5 successful views. Ensure PINs are printed or sent securely to parents.
        </div>
      </div>
    </div>
  );
};

export default PINManager;