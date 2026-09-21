import { Search } from 'lucide-react';

/**
 * SearchBar — Molecule with search icon, input field, and form submission.
 *
 * Extracted from ProductsPage filter bar.
 */
export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search Products',
  className = '',
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full md:w-80 ${className}`}>
      <Search
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-[#0F1111] outline-none transition-all focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] placeholder:text-gray-400"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </form>
  );
}
