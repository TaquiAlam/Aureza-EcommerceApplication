import { Minus, Plus } from 'lucide-react';

/**
 * QuantityControl — Molecule for increment/decrement quantity controls.
 *
 * Extracted from CartPage inline JSX. Handles stock limits.
 */
export default function QuantityControl({
  quantity,
  maxQuantity,
  onIncrease,
  onDecrease,
  disabled = false,
}) {
  const isMaxReached =
    maxQuantity !== undefined && maxQuantity !== null && quantity >= maxQuantity;
  const isMinReached = quantity <= 1;

  return (
    <div className="flex items-center bg-[#F0F2F2] border border-[#D5D9D9] rounded-lg overflow-hidden shadow-xs">
      <button
        className="w-8 h-8 flex items-center justify-center text-[#0F1111] hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        onClick={onDecrease}
        disabled={disabled || isMinReached}
        title="Decrease quantity"
      >
        <Minus size={14} />
      </button>
      <span className="w-10 h-8 flex items-center justify-center font-bold text-xs text-[#0F1111] bg-white border-x border-[#D5D9D9]">
        {quantity}
      </span>
      <button
        className={`w-8 h-8 flex items-center justify-center transition-colors ${
          isMaxReached || disabled
            ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
            : 'text-[#0F1111] hover:bg-gray-200 cursor-pointer'
        }`}
        onClick={onIncrease}
        disabled={disabled || isMaxReached}
        title={
          isMaxReached
            ? `Cannot add more. Max stock (${maxQuantity}) reached`
            : 'Increase quantity'
        }
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
