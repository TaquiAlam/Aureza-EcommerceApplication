import { MapPin, Edit3, Trash2, Star } from 'lucide-react';

/**
 * AddressCard — Organism rendering a single address card.
 *
 * Extracted from AddressesPage for reuse in checkout and address management.
 */
export default function AddressCard({
  address,
  isDefault = false,
  onEdit,
  onDelete,
  onSetDefault,
  className = '',
}) {
  return (
    <div
      className={`relative bg-white border rounded-xl p-5 transition-all hover:shadow-md ${
        isDefault
          ? 'border-[#FF9900] ring-1 ring-[#FF9900]/20'
          : 'border-[#E8E2D6] hover:border-gray-300'
      } ${className}`}
    >
      {/* Default Badge */}
      {isDefault && (
        <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-[#FF9900] text-white text-[10px] font-bold uppercase rounded-full tracking-wide shadow-sm">
          Default Address
        </div>
      )}

      {/* Address Content */}
      <div className="flex items-start gap-3 mb-4 mt-1">
        <div className="w-9 h-9 bg-[#FAF7F2] rounded-lg flex items-center justify-center border border-[#F0EBE1] shrink-0">
          <MapPin size={16} className="text-[#FF9900]" />
        </div>
        <div className="flex-1 min-w-0">
          {address.buildingName && (
            <p className="text-sm font-bold text-[#0F1111] truncate">
              {address.buildingName}
            </p>
          )}
          {address.streetAddress && (
            <p className="text-xs text-[#565959] truncate">{address.streetAddress}</p>
          )}
          <p className="text-xs text-[#565959]">
            {[address.city, address.state].filter(Boolean).join(', ')}
          </p>
          <p className="text-xs text-[#565959]">
            {[address.country, address.pincode].filter(Boolean).join(' — ')}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#F0EBE1]">
        {onEdit && (
          <button
            onClick={() => onEdit(address)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#007185] hover:bg-[#F0F8FF] rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 size={13} />
            Edit
          </button>
        )}
        {onSetDefault && !isDefault && (
          <button
            onClick={() => onSetDefault(address)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#FF9900] hover:bg-[#FFF8E7] rounded-lg transition-colors cursor-pointer"
          >
            <Star size={13} />
            Set Default
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(address)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-auto"
          >
            <Trash2 size={13} />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
