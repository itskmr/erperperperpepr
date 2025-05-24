import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always include first page
    pageNumbers.push(1);
    
    // Add current page and neighbors
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbers.push(i);
    }
    
    // Always include last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    // Add ellipsis where needed
    const result = [];
    let prev = 0;
    
    for (const page of pageNumbers) {
      if (page - prev > 1) {
        result.push('...');
      }
      result.push(page);
      prev = page;
    }
    
    return result;
  };

  // Only show pagination if there are multiple pages
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex justify-center my-6">
      <ul className="flex items-center -space-x-px h-10 text-base">
        {/* Previous button */}
        <li>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`flex items-center justify-center px-4 h-10 ml-0 leading-tight
              ${currentPage === 1 
                ? 'text-gray-400 cursor-not-allowed bg-white border border-gray-300 rounded-l-lg' 
                : 'text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700'}`}
          >
            <span className="sr-only">Previous</span>
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4"/>
            </svg>
          </button>
        </li>
        
        {/* Page numbers */}
        {getPageNumbers().map((item, index) => (
          item === '...' ? (
            <li key={`ellipsis-${index}`}>
              <span className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300">
                ...
              </span>
            </li>
          ) : (
            <li key={`page-${item}`}>
              <button
                onClick={() => typeof item === 'number' && onPageChange(item)}
                className={`flex items-center justify-center px-4 h-10 leading-tight
                  ${currentPage === item 
                    ? 'text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700' 
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700'}`}
              >
                {item}
              </button>
            </li>
          )
        ))}
        
        {/* Next button */}
        <li>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`flex items-center justify-center px-4 h-10 leading-tight
              ${currentPage === totalPages 
                ? 'text-gray-400 cursor-not-allowed bg-white border border-gray-300 rounded-r-lg' 
                : 'text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700'}`}
          >
            <span className="sr-only">Next</span>
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination; 