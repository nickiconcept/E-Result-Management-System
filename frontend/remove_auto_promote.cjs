const fs = require('fs');

let current = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

// 1. Remove state declarations
current = current.replace(/  const \[showAutoPromoteModal, setShowAutoPromoteModal\] = useState\(false\);\s*const \[autoPromoForm, setAutoPromoForm\] = useState\(\{[\s\S]*?\}\);\n/, '');

// 2. Remove settingsForm init fields
current = current.replace(/        max_ca_count: settings\.max_ca_count \|\| 4,\s*global_pass_mark: settings\.global_pass_mark \|\| 40,\s*science_pass_mark: settings\.science_pass_mark \|\| 60,\s*arts_pass_mark: settings\.arts_pass_mark \|\| 40,\s*commercial_pass_mark: settings\.commercial_pass_mark \|\| 50/, '        max_ca_count: settings.max_ca_count || 4');

// 3. Remove handleAutoPromoteSubmit
current = current.replace(/  const handleAutoPromoteSubmit = async \(\) => \{[\s\S]*?  \};\n\n/, '');

// 4. Remove button
current = current.replace(/                  <button className="btn btn-warning" style={{ fontSize: "0.82rem", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px", color: "#000", fontWeight: "bold" }} onClick={\(\) => setShowAutoPromoteModal\(true\)}><Star size={14} \/> Auto-Promote by Passmark<\/button>\n/, '');

// 5. Remove passmark form fields
current = current.replace(/                <div style={{ display: 'grid', gridTemplateColumns: 'repeat\(auto-fit, minmax\(200px, 1fr\)\)', gap: '20px', marginBottom: '20px', borderTop: '1px solid var\(--border-color\)', paddingTop: '20px' }}>\s*<div className="form-group" style={{ margin: 0 }}>\s*<label style={{ fontSize: '0.8rem', color: 'var\(--text-secondary\)' }}>Global Passmark \(%\)<\/label>\s*<input type="number" className="form-control" value={settingsForm.global_pass_mark} onChange={e => setSettingsForm\(\{ ...settingsForm, global_pass_mark: parseInt\(e.target.value\) \}\)} min="0" max="100" \/>\s*<\/div>\s*<div className="form-group" style={{ margin: 0 }}>\s*<label style={{ fontSize: '0.8rem', color: 'var\(--text-secondary\)' }}>Science Passmark \(%\)<\/label>\s*<input type="number" className="form-control" value={settingsForm.science_pass_mark} onChange={e => setSettingsForm\(\{ ...settingsForm, science_pass_mark: parseInt\(e.target.value\) \}\)} min="0" max="100" \/>\s*<\/div>\s*<div className="form-group" style={{ margin: 0 }}>\s*<label style={{ fontSize: '0.8rem', color: 'var\(--text-secondary\)' }}>Arts Passmark \(%\)<\/label>\s*<input type="number" className="form-control" value={settingsForm.arts_pass_mark} onChange={e => setSettingsForm\(\{ ...settingsForm, arts_pass_mark: parseInt\(e.target.value\) \}\)} min="0" max="100" \/>\s*<\/div>\s*<div className="form-group" style={{ margin: 0 }}>\s*<label style={{ fontSize: '0.8rem', color: 'var\(--text-secondary\)' }}>Commercial Passmark \(%\)<\/label>\s*<input type="number" className="form-control" value={settingsForm.commercial_pass_mark} onChange={e => setSettingsForm\(\{ ...settingsForm, commercial_pass_mark: parseInt\(e.target.value\) \}\)} min="0" max="100" \/>\s*<\/div>\s*<\/div>\n\n/, '');

// 6. Remove the modal
const modalStartStr = "{/* AUTO-PROMOTE MODAL */}";
const modalStartIdx = current.indexOf(modalStartStr);
if (modalStartIdx !== -1) {
  let endIndex = -1;
  let parenCount = 0;
  for(let i = modalStartIdx; i < current.length; i++) {
    if (current[i] === '{') parenCount++;
    if (current[i] === '}') {
      parenCount--;
      if (parenCount === 0 && current.substring(i, i+6) === "}\n    ") {
         endIndex = i;
         break;
      }
    }
  }
  // Wait, the modal starts with `{showAutoPromoteModal && (` so it's surrounded by {} 
  // Let's just find `      {/* AUTO-PROMOTE MODAL */}` and remove until `    </div>\n  );\n}`
  const lastDivIdx = current.lastIndexOf('    </div>');
  current = current.substring(0, modalStartIdx) + current.substring(lastDivIdx);
}

// 7. Re-apply the Academic Settings Checkbox feature
const insertStr = `
                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <Award size={18} style={{ color: 'var(--primary)' }} />
                      Show Student Rank in Class?
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={settingsForm.result_show_position === 1} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, result_show_position: e.target.checked ? 1 : 0 })}
                        style={{ width: '18px', height: '18px', marginRight: '10px', accentColor: 'var(--primary)' }}
                      />
                      {settingsForm.result_show_position === 1 ? 'Enabled' : 'Disabled'}
                    </label>
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <BarChart2 size={18} style={{ color: 'var(--primary)' }} />
                      Show Class Average Score?
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={settingsForm.result_show_average === 1} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, result_show_average: e.target.checked ? 1 : 0 })}
                        style={{ width: '18px', height: '18px', marginRight: '10px', accentColor: 'var(--primary)' }}
                      />
                      {settingsForm.result_show_average === 1 ? 'Enabled' : 'Disabled'}
                    </label>
                  </div>
`;

current = current.replace(/                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var\(--bg-primary\)', borderRadius: 'var\(--radius-md\)', border: '1px solid var\(--border-color\)', boxShadow: '0 2px 8px rgba\(0,0,0,0\.02\)' }}>\s*<label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var\(--text-primary\)', marginBottom: '16px', fontSize: '0\.95rem' }}>\s*<BookOpen size={18} style={{ color: 'var\(--primary\)' }} \/>\s*Number of CAs Allowed\s*<\/label>/, insertStr + '\n                  <div className="form-group" style={{ margin: 0, padding: \'20px\', background: \'var(--bg-primary)\', borderRadius: \'var(--radius-md)\', border: \'1px solid var(--border-color)\', boxShadow: \'0 2px 8px rgba(0,0,0,0.02)\' }}>\n                    <label style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\', color: \'var(--text-primary)\', marginBottom: \'16px\', fontSize: \'0.95rem\' }}>\n                      <BookOpen size={18} style={{ color: \'var(--primary)\' }} />\n                      Number of CAs Allowed\n                    </label>');

current = current.replace(/                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var\(--bg-primary\)', borderRadius: 'var\(--radius-md\)', border: '1px solid var\(--border-color\)', boxShadow: '0 2px 8px rgba\(0,0,0,0\.02\)' }}>\s*<label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var\(--text-primary\)', marginBottom: '16px', fontSize: '0\.95rem' }}>\s*<Award size={18} style={{ color: 'var\(--primary\)' }} \/>\s*Show Student Rank in Class\?\s*<\/label>[\s\S]*?<\/div>\s*<div className="form-group" style={{ margin: 0, padding: '20px', background: 'var\(--bg-primary\)', borderRadius: 'var\(--radius-md\)', border: '1px solid var\(--border-color\)', boxShadow: '0 2px 8px rgba\(0,0,0,0\.02\)' }}>\s*<label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var\(--text-primary\)', marginBottom: '16px', fontSize: '0\.95rem' }}>\s*<BarChart2 size={18} style={{ color: 'var\(--primary\)' }} \/>\s*Show Class Average Score\?\s*<\/label>[\s\S]*?<\/div>/, '');

fs.writeFileSync('src/pages/AdminDashboard.jsx', current, 'utf8');
console.log("Done");
