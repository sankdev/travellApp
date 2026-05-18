import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

 const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    pages.push(1);
    
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    if (startPage > 2) pages.push('...');
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages - 1) pages.push('...');
    
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-6">
      <div className="hidden md:flex md:-mt-px md:flex-1 md:items-center md:justify-between">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium ${
            currentPage === 1
              ? 'cursor-not-allowed text-gray-300'
              : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
        >
          <FontAwesomeIcon icon={faChevronLeft} className="mr-3 h-5 w-5" />
          Previous
        </button>

        <div className="flex">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  onClick={() => typeof page === 'number' && onPageChange(page)}
                  className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium ${
                    currentPage === page
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium ${
            currentPage === totalPages
              ? 'cursor-not-allowed text-gray-300'
              : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
        >
          Next
          <FontAwesomeIcon icon={faChevronRight} className="ml-3 h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center md:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium ${
            currentPage === 1
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FontAwesomeIcon icon={faChevronLeft} className="h-5 w-5" />
        </button>
        <span className="mx-4 text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium ${
            currentPage === totalPages
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FontAwesomeIcon icon={faChevronRight} className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
};
export  default Pagination