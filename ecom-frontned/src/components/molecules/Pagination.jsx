import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination — Molecule for page navigation with Previous/Next buttons and page indicator.
 *
 * Extracted from ProductsPage. Supports compact (icon only) and full (with labels) modes.
 */
export default function Pagination({
  pageNumber,
  totalPages,
  onPageChange,
  variant = 'compact', // 'compact' | 'full'
  className = '',
}) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <button
          onClick={() => onPageChange(Math.max(0, pageNumber - 1))}
          disabled={pageNumber === 0}
          className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Previous Page"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="px-3 py-1 bg-white border border-gray-300 rounded-md text-xs font-bold text-[#0F1111] shadow-xs">
          {pageNumber + 1}
        </div>
        <button
          onClick={() => onPageChange(Math.min(Math.max(0, totalPages - 1), pageNumber + 1))}
          disabled={pageNumber >= totalPages - 1 || totalPages <= 1}
          className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Next Page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  }

  // Full variant with labels
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(Math.max(0, pageNumber - 1))}
        disabled={pageNumber === 0}
        className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <div className="px-3 py-1.5 bg-[#FFD814] border border-[#FCD200] rounded-lg text-xs font-bold text-[#0F1111]">
        Page {pageNumber + 1} of {totalPages}
      </div>
      <button
        onClick={() => onPageChange(Math.min(totalPages - 1, pageNumber + 1))}
        disabled={pageNumber >= totalPages - 1}
        className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}
