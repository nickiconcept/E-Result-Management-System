import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalItems, 
  pageSize, 
  onPageChange, 
  onPageSizeChange,
  pageSizeOptions = [20, 30, 50, 70, 100]
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '16px 24px',
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-surface)',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <span>Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Show:</span>
          <select 
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{ 
              padding: '4px 8px', 
              borderRadius: '6px', 
              border: '1px solid var(--border-color)', 
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 10px',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            backgroundColor: currentPage === 1 ? 'var(--bg-secondary)' : 'var(--bg-primary)',
            color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <ChevronLeft size={16} />
        </button>
        
        {getPageNumbers().map(pageNum => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: pageNum === currentPage ? 'none' : '1px solid var(--border-color)',
              borderRadius: '6px',
              backgroundColor: pageNum === currentPage ? 'var(--primary)' : 'var(--bg-primary)',
              color: pageNum === currentPage ? 'white' : 'var(--text-primary)',
              fontWeight: pageNum === currentPage ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 10px',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            backgroundColor: currentPage === totalPages ? 'var(--bg-secondary)' : 'var(--bg-primary)',
            color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
