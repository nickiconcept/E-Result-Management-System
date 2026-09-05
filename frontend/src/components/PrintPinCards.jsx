import React, { useEffect, useRef } from 'react';
import { Printer, ArrowLeft, Key, ShieldCheck } from 'lucide-react';

export default function PrintPinCards({ pins, settings, onClose }) {
  const printRef = useRef();

  useEffect(() => {
    // Inject print styles dynamically
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        body * {
          visibility: hidden;
        }
        #pin-print-area, #pin-print-area * {
          visibility: visible;
        }
        #pin-print-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .pin-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          justify-content: center;
        }
        .pin-card {
          width: 85mm;
          height: 54mm;
          border: 1px solid #000;
          border-radius: 6px;
          padding: 4mm;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          page-break-inside: avoid;
          background: #fff;
          box-sizing: border-box;
          color: #000;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: '900px', padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
        {/* Non-Printable Header */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', padding: '10px 20px' }}>
              <Printer size={20} /> Print {pins.length} PIN Cards
            </button>
          </div>
        </div>

        <div className="no-print" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '20px', color: '#334155' }}>
          <strong>Printing Instructions:</strong> For best results, use A4 paper size, select "Portrait" layout, and turn off "Headers and Footers" in your printer settings. The cards are sized at 85mm x 54mm (standard CR80 ID Card size) and will fit up to 10 per page.
        </div>

        {/* Printable Area */}
        <div id="pin-print-area">
          <div className="pin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 85mm)', gap: '15px', justifyContent: 'center' }}>
            {pins.map((pin, index) => (
              <div key={index} className="pin-card" style={{ width: '85mm', height: '54mm', border: '1px solid #333', borderRadius: '6px', padding: '4mm', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', backgroundColor: '#fff', color: '#000' }}>
                
                {/* Card Header (School Name) */}
                <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {settings?.landing_school_name || 'Jere Model Academy'}
                  </h4>
                  <div style={{ fontSize: '0.65rem', color: '#555', marginTop: '2px' }}>
                    {settings?.school_address || 'Bwarrau Road, Jere, Kaduna State'}
                  </div>
                </div>

                {/* Card Body (PIN Info) */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#333', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Key size={12} /> Result Checking PIN
                  </div>
                  
                  {/* The PIN Code */}
                  <div style={{ border: '2px dashed #000', padding: '6px 12px', background: '#f8fafc', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '2px', fontFamily: 'monospace', borderRadius: '4px', margin: '4px 0' }}>
                    {pin.pin}
                  </div>

                  <div style={{ fontSize: '0.65rem', color: '#555', marginTop: '4px' }}>
                    <strong>Term:</strong> {pin.term || settings?.active_term || 'Current'} &nbsp;|&nbsp; <strong>Year:</strong> {pin.academic_year || settings?.active_session || 'Current'}
                  </div>
                </div>

                {/* Card Footer (Instructions) */}
                <div style={{ textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '4px', marginTop: '4px', fontSize: '0.55rem', color: '#444' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', fontWeight: 'bold' }}>
                    <ShieldCheck size={10} /> Valid for {settings?.pin_max_checks || 5} checks. Do not share.
                  </div>
                  <div style={{ marginTop: '2px' }}>
                    Visit <strong>jereacademy.com</strong> to check your result.
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
