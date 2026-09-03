import React from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function ClassBroadsheet({ data, className, term, session, settings, onBack }) {
  if (!data || !Array.isArray(data.subjects) || (!Array.isArray(data.rows) && !Array.isArray(data.students))) {
    return <p style={{ padding: '20px', color: 'var(--text-secondary)' }}>Loading broadsheet data...</p>;
  }

  const subjects = data.subjects;
  
  // Map backend students format to frontend rows format
  const rows = (data.rows || data.students || []).map(r => {
    if (r.full_name) return r; // Already in correct format
    
    const mappedGrades = {};
    let term1TotalSum = 0;
    let term2TotalSum = 0;
    let grandTotalSum = 0;
    let cumAverageSum = 0;
    let validCumCount = 0;

    if (Array.isArray(r.grades)) {
      r.grades.forEach(g => {
        const t1 = g.term1 !== '-' ? Number(g.term1 || 0) : 0;
        const t2 = g.term2 !== '-' ? Number(g.term2 || 0) : 0;
        const score = Number(g.score || 0);
        const cum = g.cum_avg !== '-' ? Number(g.cum_avg || 0) : 0;

        mappedGrades[g.subject_id] = {
          ca1: g.ca1 || 0,
          ca2: g.ca2 || 0,
          ca3: g.ca3 || 0,
          ca4: g.ca4 || 0,
          exam: g.exam || 0,
          total: score,
          term1_total: t1,
          term2_total: t2,
          cum_average: cum,
          cum_grade: g.cum_grade !== '-' ? g.cum_grade : '',
          grade: g.grade || ''
        };

        term1TotalSum += t1;
        term2TotalSum += t2;
        grandTotalSum += score;
        if (cum > 0) {
            cumAverageSum += cum;
            validCumCount++;
        }
      });
    }
    
    return {
      full_name: r.student?.full_name || '',
      admission_number: r.student?.admission_number || '',
      grades: mappedGrades,
      grandTotal: r.grandTotal || grandTotalSum,
      term1GrandTotal: term1TotalSum,
      term2GrandTotal: term2TotalSum,
      overallSum: term1TotalSum + term2TotalSum + grandTotalSum,
      cumAverage: validCumCount > 0 ? (cumAverageSum / validCumCount) : 0,
      average: r.average || 0,
      position: r.position || '-'
    };
  });

  const broadsheetRef = React.useRef(null);

  const handleExportPDF = () => {
    const element = broadsheetRef.current;
    if (!element) return;

    // Temporarily show .only-print elements inside the container
    const printHeaders = element.querySelectorAll('.only-print');
    printHeaders.forEach(el => el.style.display = 'block');

    const opt = {
      margin:       0.2,
      filename:     `Broadsheet_${String(className).replace(/\s+/g, '_')}_${String(term).replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      printHeaders.forEach(el => el.style.display = 'none');
    });
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
      if (term === '3rd Term') {
        let blanks = [];
        let colCount = 4; // Exam, 3rd Term Total, Cumm Avg, Grade
        if (!settings?.max_ca_count || settings.max_ca_count >= 1) colCount++;
        if (!settings?.max_ca_count || settings.max_ca_count >= 2) colCount++;
        if (!settings?.max_ca_count || settings.max_ca_count >= 3) colCount++;
        if (!settings?.max_ca_count || settings.max_ca_count >= 4) colCount++;
        colCount += 2; // 1st term, 2nd term
        for(let i=1; i<colCount; i++) blanks.push('');
        headers1.push(sub.name, ...blanks);
      } else {
        let blanks = [];
        let colCount = 3; // Exam, Total, Grade
        if (!settings?.max_ca_count || settings.max_ca_count >= 1) colCount++;
        if (!settings?.max_ca_count || settings.max_ca_count >= 2) colCount++;
        if (!settings?.max_ca_count || settings.max_ca_count >= 3) colCount++;
        if (!settings?.max_ca_count || settings.max_ca_count >= 4) colCount++;
        for(let i=1; i<colCount; i++) blanks.push('');
        headers1.push(sub.name, ...blanks);
      }
    });
    headers1.push(term === '3rd Term' ? 'Cumm Average (%)' : 'Grand Total', term === '3rd Term' ? '' : 'Average (%)', 'Position');
    csv += headers1.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\r\n';

    // Header row 2 (Assessment component columns)
    const ca1Name = settings?.ca1_name ? settings.ca1_name.substring(0, 3) : 'C1';
    const ca2Name = settings?.ca2_name ? settings.ca2_name.substring(0, 3) : 'C2';
    const ca3Name = settings?.ca3_name ? settings.ca3_name.substring(0, 3) : 'C3';
    const ca4Name = settings?.ca4_name ? settings.ca4_name.substring(0, 3) : 'C4';
    const examName = settings?.exam_name ? settings.exam_name.substring(0, 3) : 'Exm';

    const headers2 = ['', ''];
    subjects.forEach(() => {
      if (!settings?.max_ca_count || settings.max_ca_count >= 1) headers2.push(ca1Name);
      if (!settings?.max_ca_count || settings.max_ca_count >= 2) headers2.push(ca2Name);
      if (!settings?.max_ca_count || settings.max_ca_count >= 3) headers2.push(ca3Name);
      if (!settings?.max_ca_count || settings.max_ca_count >= 4) headers2.push(ca4Name);
      headers2.push(examName);
      
      if (term === '3rd Term') {
        headers2.push('3rd Term Total', '1st Term', '2nd Term', 'Cumm Avg', 'Grade');
      } else {
        headers2.push('Total', 'Grade');
      }
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
        const sg = (r.grades || {})[sub.id] || {};
        
        if (!settings?.max_ca_count || settings.max_ca_count >= 1) rowVals.push(sg.ca1 !== undefined && sg.ca1 !== null ? sg.ca1 : '-');
        if (!settings?.max_ca_count || settings.max_ca_count >= 2) rowVals.push(sg.ca2 !== undefined && sg.ca2 !== null ? sg.ca2 : '-');
        if (!settings?.max_ca_count || settings.max_ca_count >= 3) rowVals.push(sg.ca3 !== undefined && sg.ca3 !== null ? sg.ca3 : '-');
        if (!settings?.max_ca_count || settings.max_ca_count >= 4) rowVals.push(sg.ca4 !== undefined && sg.ca4 !== null ? sg.ca4 : '-');
        rowVals.push(sg.exam !== undefined && sg.exam !== null ? sg.exam : '-');

        if (term === '3rd Term') {
          rowVals.push(
            sg.total !== undefined && sg.total !== null ? sg.total : '-',
            sg.term1_total !== undefined && sg.term1_total !== null ? sg.term1_total : '-',
            sg.term2_total !== undefined && sg.term2_total !== null ? sg.term2_total : '-',
            sg.cum_average !== undefined && sg.cum_average !== null ? sg.cum_average : '-',
            sg.grade || '-'
          );
        } else {
          rowVals.push(
            sg.total !== undefined && sg.total !== null ? sg.total : '-',
            sg.grade || '-'
          );
        }
      });

      if (term === '3rd Term') {
        rowVals.push(
          r.cumAverage !== undefined ? r.cumAverage.toFixed(1) : '-',
          '', // No second average column for 3rd term
          r.position !== undefined ? r.position : '-'
        );
      } else {
        rowVals.push(
          r.grandTotal !== undefined ? r.grandTotal : '-',
          r.average !== undefined ? r.average : '-',
          r.position !== undefined ? r.position : '-'
        );
      }

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

  let colsPerSubject = term === '3rd Term' ? 6 : 3;
  if (!settings?.max_ca_count || settings.max_ca_count >= 1) colsPerSubject++;
  if (!settings?.max_ca_count || settings.max_ca_count >= 2) colsPerSubject++;
  if (!settings?.max_ca_count || settings.max_ca_count >= 3) colsPerSubject++;
  if (!settings?.max_ca_count || settings.max_ca_count >= 4) colsPerSubject++;
  const endCols = term === '3rd Term' ? 6 : 3;
  const totalCols = 2 + (subjects.length * colsPerSubject) + endCols;

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
          <button className="btn btn-primary" onClick={handleExportPDF} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      <div className="broadsheet-scroll print-area" ref={broadsheetRef}>
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
              {subjects.map((sub, idx) => {
                let colSpan = term === '3rd Term' ? 6 : 3; // 3rd Term base: Exam, 3rd Total, 1st Tot, 2nd Tot, Cumm Avg, Grade. Other terms: Exam, Total, Grade.
                if (!settings?.max_ca_count || settings.max_ca_count >= 1) colSpan++;
                if (!settings?.max_ca_count || settings.max_ca_count >= 2) colSpan++;
                if (!settings?.max_ca_count || settings.max_ca_count >= 3) colSpan++;
                if (!settings?.max_ca_count || settings.max_ca_count >= 4) colSpan++;
                return (
                  <th key={idx} colSpan={colSpan} style={{ backgroundColor: 'var(--primary)', color: 'white', borderRight: '2px solid white' }}>
                    {sub.name}
                  </th>
                );
              })}
              {term === '3rd Term' ? (
                <>
                  <th rowSpan="2">1st Term Total</th>
                  <th rowSpan="2">2nd Term Total</th>
                  <th rowSpan="2">3rd Term Total</th>
                  <th rowSpan="2">Overall Sum</th>
                  <th rowSpan="2">Cumm Avg (%)</th>
                </>
              ) : (
                <>
                  <th rowSpan="2">Grand Total</th>
                  <th rowSpan="2">Average</th>
                </>
              )}
              <th rowSpan="2">Position</th>
            </tr>
            <tr>
              {subjects.map((sub, idx) => (
                <React.Fragment key={idx}>
                  {(!settings?.max_ca_count || settings.max_ca_count >= 1) && <th className="sub-header">{settings?.ca1_name ? settings.ca1_name.substring(0, 3) : 'C1'}</th>}
                  {(!settings?.max_ca_count || settings.max_ca_count >= 2) && <th className="sub-header">{settings?.ca2_name ? settings.ca2_name.substring(0, 3) : 'C2'}</th>}
                  {(!settings?.max_ca_count || settings.max_ca_count >= 3) && <th className="sub-header">{settings?.ca3_name ? settings.ca3_name.substring(0, 3) : 'C3'}</th>}
                  {(!settings?.max_ca_count || settings.max_ca_count >= 4) && <th className="sub-header">{settings?.ca4_name ? settings.ca4_name.substring(0, 3) : 'C4'}</th>}
                  <th className="sub-header">{settings?.exam_name ? settings.exam_name.substring(0, 3) : 'Exm'}</th>
                  {term === '3rd Term' ? (
                    <>
                      <th className="sub-header">3rd Tot</th>
                      <th className="sub-header">1st Tot</th>
                      <th className="sub-header">2nd Tot</th>
                      <th className="sub-header">Cumm Avg</th>
                    </>
                  ) : (
                    <th className="sub-header">Tot</th>
                  )}
                  <th className="sub-header">Grd</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={totalCols}>No student records found in this class.</td>
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
                          {(!settings?.max_ca_count || settings.max_ca_count >= 1) && <td>{g ? g.ca1 : 0}</td>}
                          {(!settings?.max_ca_count || settings.max_ca_count >= 2) && <td>{g ? g.ca2 : 0}</td>}
                          {(!settings?.max_ca_count || settings.max_ca_count >= 3) && <td>{g ? g.ca3 : 0}</td>}
                          {(!settings?.max_ca_count || settings.max_ca_count >= 4) && <td>{g ? g.ca4 : 0}</td>}
                          <td>{g ? g.exam : 0}</td>
                          <td className="total-col">{g ? g.total : 0}</td>
                          {term === '3rd Term' && (
                            <>
                              <td className="total-col">{g ? g.term1_total : 0}</td>
                              <td className="total-col">{g ? g.term2_total : 0}</td>
                              <td className="total-col" style={{ fontWeight: 'bold' }}>{g ? g.cum_average : 0}</td>
                            </>
                          )}
                          <td style={{ fontWeight: 'bold' }}>{g ? (term === '3rd Term' && g.cum_grade ? g.cum_grade : g.grade) : '-'}</td>
                        </React.Fragment>
                      );
                    })}
                    {term === '3rd Term' ? (
                      <>
                        <td style={{ fontWeight: 'bold', backgroundColor: 'var(--primary-light)' }}>
                          {row.term1GrandTotal}
                        </td>
                        <td style={{ fontWeight: 'bold', backgroundColor: 'var(--primary-light)' }}>
                          {row.term2GrandTotal}
                        </td>
                        <td style={{ fontWeight: 'bold', backgroundColor: 'var(--primary-light)' }}>
                          {row.grandTotal}
                        </td>
                        <td style={{ fontWeight: 'bold', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                          {row.overallSum}
                        </td>
                        <td style={{ fontWeight: 'bold', backgroundColor: 'var(--primary-light)' }}>
                          {row.cumAverage !== undefined && row.cumAverage !== null ? row.cumAverage.toFixed(1) : 0}%
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ fontWeight: 'bold', backgroundColor: 'var(--primary-light)' }}>
                          {row.grandTotal}
                        </td>
                        <td style={{ fontWeight: 'bold' }}>{row.average !== undefined && row.average !== null ? row.average.toFixed(1) : 0}%</td>
                      </>
                    )}
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
