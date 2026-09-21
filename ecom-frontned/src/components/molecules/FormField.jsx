import Input from '../atoms/Input';

/**
 * FormField — Molecule combining Label + Input + optional error message.
 *
 * Used in Login, Signup, Address, and Admin forms for consistent field layout.
 */
export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon,
  required = false,
  autoComplete,
  children, // For custom input like password toggle
  className = '',
  ...inputProps
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-semibold text-[#0F1111] mb-1.5 ml-1"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children || (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          error={error}
          icon={icon}
          autoComplete={autoComplete}
          {...inputProps}
        />
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{error}</p>
      )}
    </div>
  );
}
