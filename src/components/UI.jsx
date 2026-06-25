import { TAG_COLORS, daysLeft, arabicDurationPhrase } from '../lib/utils'

export function TagBadge({ tag, allTags = [], onRemove }) {
  const idx = allTags.indexOf(tag) % TAG_COLORS.length
  const color = TAG_COLORS[idx >= 0 ? idx : 0]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border font-medium ${color}`}>
      {tag}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-60 transition-opacity leading-none">×</button>
      )}
    </span>
  )
}

export function WarrantyBadge({ warrantyDate }) {
  const days = daysLeft(warrantyDate)
  if (days === null) return null
  if (days < 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300 font-semibold">منتهي الضمان</span>
  if (days <= 30) return <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-300 font-semibold">ينتهي خلال {arabicDurationPhrase(days)}</span>
  return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300 font-semibold">{arabicDurationPhrase(days)} متبقي</span>
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
