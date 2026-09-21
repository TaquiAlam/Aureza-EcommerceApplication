import { Loader } from 'lucide-react';

/**
 * Button — Reusable button atom with variants, loading state, and icon support.
 *
 * Variants: 'primary' | 'secondary' | 'danger' | 'ghost'
 * Sizes: 'sm' | 'md' | 'lg'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  type = 'button',
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-bold rounded-lg transition-all duration-200 active:scale-[0.98] cursor-pointer select-none';

  const variantStyles = {
    primary:
      'bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-[#0F1111] border border-[#FCD200] shadow-sm',
    secondary:
      'bg-white hover:bg-[#F7FAFA] text-[#0F1111] border border-[#D5D9D9] shadow-sm',
    danger:
      'bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]',
    ghost:
      'bg-transparent hover:bg-gray-100 text-[#565959] border border-transparent',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';

  const classes = [
    baseStyles,
    variantStyles[variant] || variantStyles.primary,
    sizeStyles[size] || sizeStyles.md,
    fullWidth ? 'w-full' : '',
    disabled || loading ? disabledStyles : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        <Loader size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
        </>
      )}
    </button>
  );
}
