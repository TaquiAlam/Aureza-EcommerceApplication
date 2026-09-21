import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

/**
 * ErrorFallback — Full-page crash recovery UI.
 *
 * Displayed when ErrorBoundary catches an unhandled error.
 * Shows a clean, branded error page with retry and navigation options.
 */
export default function ErrorFallback({ error, errorInfo, onReset }) {
  const isDev = import.meta.env.DEV;

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white border border-[#E8E2D6] rounded-2xl p-8 md:p-10 shadow-lg text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-200">
          <AlertTriangle size={28} className="text-red-500" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-black text-[#0F1111] mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-[#565959] mb-6 leading-relaxed">
          An unexpected error occurred. Please try refreshing the page or go back to the home page.
        </p>

        {/* Error details in dev mode */}
        {isDev && error && (
          <div className="mb-6 p-4 bg-[#FFF8F7] border border-red-200 rounded-lg text-left overflow-auto max-h-48">
            <p className="text-xs font-bold text-red-700 mb-1">Error Details (Dev Only):</p>
            <p className="text-xs text-red-600 font-mono break-all">
              {error.toString()}
            </p>
            {errorInfo?.componentStack && (
              <pre className="text-[10px] text-red-400 mt-2 whitespace-pre-wrap">
                {errorInfo.componentStack.slice(0, 500)}
              </pre>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onReset && (
            <button
              onClick={onReset}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <RotateCcw size={16} />
              Try Again
            </button>
          )}
          <a
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-[#D5D9D9] text-[#0F1111] font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 hover:bg-[#F7FAFA] transition-all cursor-pointer"
          >
            <Home size={16} />
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
