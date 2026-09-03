import React, { useState, useMemo, useEffect } from 'react';
import Pagination from './Pagination';

const PaginatedList = ({ 
  items = [], 
  renderItem, 
  defaultPageSize = 50,
  pageSizeOptions = [20, 30, 50, 100],
  as = 'tbody',
  ...props
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Reset to page 1 if items length changes significantly (e.g. search filter applied)
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const Component = as;

  return (
    <>
      <Component {...props}>
        {paginatedItems.map((item, index) => renderItem(item, index + (currentPage - 1) * pageSize))}
      </Component>
      {items.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={items.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </>
  );
};

export default PaginatedList;
