import React from 'react';
import { ArrowLeft, Printer, Download } from 'lucide-react';

export default function ClassBroadsheet({ data, className, term, session, settings, onBack }) {
  if (!data) return <p>Loading broadsheet data...</p>;

  const { subjects, rows } = data;

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!data || !rows || !subjects) return;

    let csv = '\uFEFF'; // UTF-8 BOM for Microsoft Excel compatibility
    
    // Header Info
    csv += `"${(settings?.landing_school_name || 'Jere Model Academy').replace(/"/g, '""')}"\r\n`;
    csv += `"Class Results Broadsheet - ${String(className || '').replace(/"/g, '""')} (${String(term || '').replace(/"/g, '""')} - ${String(session || '').replace(/"/g, '""')})"\r\n\r\n`;

    // Header row 1 (Subject labels)
    const headers1 = ['Student Name', 'Admission No'];
    subjects.forEach(sub => {
      headers1.push(sub.name, '', '', '', '', '', '');
    });
    headers1.push('Grand Total', 'Average (%)', 'Position');
    csv += headers1.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\r\n';

    // Header row 2 (Assessment component columns)
    const ca1Name = settings?.ca1_name ? settings.ca1_name.substring(0, 3) : 'C1';
    const ca2Name = settings?.ca2_name ? settings.ca2_name.substring(0, 3) : 'C2';
    const ca3Name = settings?.ca3_name ? settings.ca3_name.substring(0, 3) : 'C3';
    const ca4Name = settings?.ca4_name ? settings.ca4_name.substring(0, 3) : 'C4';
    const examName = settings?.exam_name ? settings.exam_name.substring(0, 3) : 'Exm';

    const headers2 = ['', ''];
    subjects.forEach(() => {
      headers2.push(ca1Name, ca2Name, ca3Name, ca4Name, examName, 'Total', 'Grade');
    });
    headers2.push('', '', '');
    csv += headers2.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\r\n';

    // Student rows
    rows.forEach(r => {
      const rowVals = [
        String(r.full_name || '').replace(/"/g, '""'),
        String(r.admission_number || '').replace(/"/g, '""')
      ];

      subjects.forEach(sub => {
        const sg = (r.subject_grades || {})[sub.id] || {};
        rowVals.push(
          sg.ca1 !== undefined && sg.ca1 !== null ? sg.ca1 : '-',
          sg.ca2 !== undefined && sg.ca2 !== null ? sg.ca2 : '-',
          sg.ca3 !== undefined && sg.ca3 !== null ? sg.ca3 : '-',
          sg.ca4 !== undefined && sg.ca4 !== null ? sg.ca4 : '-',
          sg.exam !== undefined && sg.exam !== null ? sg.exam : '-',
          sg.total_score !== undefined && sg.total_score !== null ? sg.total_score : '-',
          sg.grade || '-'
        );
      });

      rowVals.push(
        r.grand_total !== undefined ? r.grand_total : '-',
        r.average !== undefined ? r.average : '-',
        r.position !== undefined ? r.position : '-'
      );

      csv += rowVals.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',') + '\r\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Broadsheet_${String(className).replace(/\s+/g, '_')}_${String(term).replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {onBack && (
        <div className="no-print">
          <button className="btn btn-secondary" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{className} Master Broadsheet</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '2px 0 0 0' }}>
              Academic Period: {session} | {term}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }} className="no-print">
          <button className="btn btn-secondary" onClick={handleExportExcel} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16} /> Export to Excel
          </button>
          <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Printer size={16} /> Print Broadsheet
          </button>
        </div>
      </div>

      <div className="broadsheet-scroll print-area">
        {/* Print Only Header */}
        <div className="only-print" style={{ textAlign: 'center', marginBottom: '15px', display: 'none' }}>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'Times New Roman' }}>JERE MODEL ACADEMY</h2>
          <p style={{ fontSize: '1rem', fontStyle: 'italic' }}>Class Master's Broadsheet for {className} ({term} - {session})</p>
        </div>

        <table className="broadsheet-table">
          <thead>
            <tr>
              <th rowSpan="2" style={{ minWidth: '150px' }}>Student Name</th>
              <th rowSpan="2" style={{ minWidth: '100px' }}>Admission No</th>
              {subjects.map((sub, idx) => (
                <th key={idx} colSpan="7" className="subject-header">
                  {sub.name}
                </th>
              ))}
              <th rowSpan="2">Grand Total</th>
              <th rowSpan="2">Average</th>
              <th rowSpan="2">Position</th>
            </tr>
            <tr>
              {subjects.map((sub, idx) => (
                <React.Fragment key={idx}>
                  <th className="sub-header">{settings?.ca1_name ? settings.ca1_name.substring(0, 3) : 'C1'}</th>
                  <th className="sub-header">{settings?.ca2_name ? settings.ca2_name.substring(0, 3) : 'C2'}</th>
                  <th className="sub-header">{settings?.ca3_name ? settings.ca3_name.substring(0, 3) : 'C3'}</th>
                  <th className="sub-header">{settings?.ca4_name ? settings.ca4_name.substring(0, 3) : 'C4'}</th>
                  <th className="sub-header">{settings?.exam_name ? settings.exam_name.substring(0, 3) : 'Exm'}</th>
                  <th className="sub-header">Tot</th>
                  <th className="sub-header">Grd</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={2 + subjects.length * 7 + 3}>No student records found in this class.</td>
              </tr>
            ) : (
              rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td style={{ textAlign: 'left', fontWeight: '600' }}>{row.full_name}</td>
                  <td style={{ fontWeight: '500' }}>{row.admission_number}</td>
                  {subjects.map((sub, sIdx) => {
                    const g = row.grades[sub.id];
                    return (
                      <React.Fragment key={sIdx}>
                        <td>{g ? g.ca1 : 0}</td>
                        <td>{g ? g.ca2 : 0}</td>
                        <td>{g ? g.ca3 : 0}</td>
                        <td>{g ? g.ca4 : 0}</td>
                        <td>{g ? g.exam : 0}</td>
                        <td className="total-col">{g ? g.total : 0}</td>
                        <td style={{ fontWeight: 'bold' }}>{g ? g.grade : '-'}</td>
                      </React.Fragment>
                    );
                  })}
                  <td style={{ fontWeight: 'bold', backgroundColor: 'var(--primary-light)' }}>
                    {row.grandTotal}
                  </td>
                  <td style={{ fontWeight: 'bold' }}>{row.average.toFixed(1)}%</td>
                  <td style={{ fontWeight: 'bold', color: row.position <= 3 ? 'var(--success)' : 'inherit' }}>
                    {row.position}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
