import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginationControls({ 
  currentPage, 
  setCurrentPage, 
  pageSize, 
  setPageSize, 
  totalItems 
}) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-surface)',
      marginTop: '10px',
      borderRadius: 'var(--radius-md)'
    }}>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Items per page:</span>
          <select 
            className="form-control" 
            style={{ padding: '4px 8px', width: 'auto', fontSize: '0.85rem', margin: 0 }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[20, 30, 50, 70, 100].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="btn btn-outline" 
            style={{ padding: '6px', minWidth: '32px' }} 
            onClick={handlePrev} 
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          
          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            className="btn btn-outline" 
            style={{ padding: '6px', minWidth: '32px' }} 
            onClick={handleNext} 
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
