import React, { useState, useEffect } from 'react';
import { X, Users, RefreshCw, Check, AlertCircle } from 'lucide-react';
import api from '../utils/api';

export default function ManageGraduatesModal({ onClose, classes, fetchStudents }) {
  const [waitingRooms, setWaitingRooms] = useState([]);
  const [selectedWaitingRoom, setSelectedWaitingRoom] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [targetClass, setTargetClass] = useState('');
  const [statusAction, setStatusAction] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchWaitingRooms();
  }, []);

  const fetchWaitingRooms = async () => {
    try {
      setLoading(true);
      const data = await api.getWaitingRooms();
      setWaitingRooms(data || []);
      if (data && data.length > 0) {
        setSelectedWaitingRoom(data[0].id);
      }
    } catch (err) {
      setError('Failed to fetch waiting rooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedWaitingRoom) {
      fetchStudentsInRoom();
    }
  }, [selectedWaitingRoom]);

  const fetchStudentsInRoom = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const data = await api.getStudents();
      const filtered = data.filter(s => s.class_id == selectedWaitingRoom);
      setStudents(filtered);
      setSelectedStudentIds([]); // reset selection
    } catch (err) {
      setError('Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudentIds(students.map(s => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleSelectStudent = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(i => i !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleAssignClass = async () => {
    if (!targetClass || selectedStudentIds.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await api.bulkUpdateStudentClass(selectedStudentIds, targetClass);
      setSuccess('Students assigned to class successfully!');
      fetchStudentsInRoom();
      if (fetchStudents) fetchStudents(); // Refresh global student list
    } catch (err) {
      setError('Failed to assign class.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusAction || selectedStudentIds.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await api.bulkUpdateStudentStatus(selectedStudentIds, statusAction);
      setSuccess('Students status updated successfully!');
      fetchStudentsInRoom();
      if (fetchStudents) fetchStudents();
    } catch (err) {
      setError('Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: '900px', width: '90%', backgroundColor: 'var(--bg-surface)' }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.2)' }}>
            <Users size={24} color="var(--primary)" />
          </div>
          <h3 style={{ margin: 0 }}>Manage Graduates & Waiting Rooms</h3>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={18} /> {error}</div>}
          {success && <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={18} /> {success}</div>}

          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label>Select Waiting Room (Graduate Pool)</label>
              <select className="form-control" value={selectedWaitingRoom} onChange={(e) => setSelectedWaitingRoom(e.target.value)}>
                {waitingRooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-secondary" onClick={fetchStudentsInRoom} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
            </button>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label>Bulk Actions for Selected Students ({selectedStudentIds.length})</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select className="form-control" value={targetClass} onChange={(e) => setTargetClass(e.target.value)} disabled={selectedStudentIds.length === 0}>
                  <option value="">Select Class...</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button className="btn btn-primary" onClick={handleAssignClass} disabled={!targetClass || selectedStudentIds.length === 0 || loading}>
                  Promote
                </button>
              </div>
            </div>
            
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label>Update System Status</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select className="form-control" value={statusAction} onChange={(e) => setStatusAction(e.target.value)} disabled={selectedStudentIds.length === 0}>
                  <option value="">-- Set Status --</option>
                  <option value="active">Mark as Active</option>
                  <option value="inactive">Mark as Inactive</option>
                  <option value="graduated">Finalize (Alumni)</option>
                </select>
                <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={!statusAction || selectedStudentIds.length === 0 || loading}>
                  Apply
                </button>
              </div>
            </div>
          </div>

          <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="school-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input type="checkbox" checked={students.length > 0 && selectedStudentIds.length === students.length} onChange={handleSelectAll} />
                  </th>
                  <th>Student Name</th>
                  <th>Admission No</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} onClick={() => handleSelectStudent(student.id)} style={{ cursor: 'pointer' }}>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={selectedStudentIds.includes(student.id)} readOnly />
                    </td>
                    <td><strong>{student.full_name}</strong></td>
                    <td>{student.admission_number}</td>
                    <td>
                      <span className={`badge badge-${student.status === 'active' ? 'success' : student.status === 'inactive' ? 'danger' : 'warning'}`}>
                        {student.status?.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No students in this waiting room.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
