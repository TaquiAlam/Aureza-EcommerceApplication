/**
 * Badge — Reusable badge atom for labels, tags, and status indicators.
 *
 * Variants: 'discount' | 'stock' | 'success' | 'warning' | 'info' | 'default'
 */
export default function Badge({ children, variant = 'default', className = '' }) {
  const variantStyles = {
    discount: 'bg-[#CC0C39] text-white',
    stock: 'bg-[#FFF8F7] text-[#B12704] border border-[#FADCD9]',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    info: 'bg-blue-50 text-[#007185] border border-blue-200',
    default: 'bg-[#F0EBE1] text-[#565959] border border-[#E8E2D6]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
        variantStyles[variant] || variantStyles.default
      } ${className}`}
    >
      {children}
    </span>
  );
}
