/**
 * Spinner — Reusable loading spinner atom.
 *
 * Sizes: 'sm' | 'md' | 'lg'
 */
export default function Spinner({ size = 'md', className = '' }) {
  const sizeStyles = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[2.5px]',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div
      className={`${sizeStyles[size] || sizeStyles.md} border-[#FF9900]/30 border-t-[#FF9900] rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * FullPageSpinner — Centers a spinner on the full viewport height.
 */
export function FullPageSpinner({ size = 'lg' }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Spinner size={size} />
    </div>
  );
}
