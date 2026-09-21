import { forwardRef } from 'react';

/**
 * Input — Reusable input atom with consistent styling, error state, and optional icon prefix.
 */
const Input = forwardRef(function Input(
  {
    type = 'text',
    error,
    icon: Icon,
    className = '',
    ...props
  },
  ref
) {
  const baseStyles =
    'w-full bg-[#FAF7F2] border rounded-lg px-4 py-2.5 text-[#0F1111] outline-none text-sm transition-all placeholder:text-gray-400';

  const normalBorder = 'border-[#D5D9D9] focus:bg-white focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600]';
  const errorBorder = 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-300 bg-red-50/30';

  const classes = [
    baseStyles,
    error ? errorBorder : normalBorder,
    Icon ? 'pl-10' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={17}
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${error ? 'text-red-400' : 'text-gray-400'}`}
        />
      )}
      <input ref={ref} type={type} className={classes} {...props} />
    </div>
  );
});

export default Input;
