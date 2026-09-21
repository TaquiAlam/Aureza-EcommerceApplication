import { Link } from 'react-router-dom';

/**
 * EmptyState — Reusable empty/no-data state atom.
 *
 * Shows an icon, title, description, and optional action button.
 * Used for empty cart, no products found, no addresses, etc.
 */
export default function EmptyState({
  icon: Icon,
  iconClassName = 'text-gray-400',
  title = 'Nothing here yet',
  description,
  actionLabel,
  actionTo,
  actionIcon: ActionIcon,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-20 text-center bg-white border border-[#E8E2D6] rounded-2xl p-10 shadow-sm ${className}`}
    >
      {Icon && (
        <div className="w-20 h-20 bg-[#FAF7F2] rounded-full flex items-center justify-center mx-auto mb-5 border border-[#E8E2D6]">
          <Icon size={36} className={iconClassName} />
        </div>
      )}
      <h3 className="text-xl font-bold text-[#0F1111] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#565959] mb-6 max-w-sm leading-relaxed">{description}</p>
      )}
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="btn btn-primary px-8 py-2.5 text-sm font-bold shadow-sm inline-flex items-center gap-2"
        >
          {ActionIcon && <ActionIcon size={16} />}
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button
          onClick={onAction}
          className="btn btn-primary px-8 py-2.5 text-sm font-bold shadow-sm inline-flex items-center gap-2"
        >
          {ActionIcon && <ActionIcon size={16} />}
          {actionLabel}
        </button>
      )}
    </div>
  );
}
