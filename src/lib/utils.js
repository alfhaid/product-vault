export const today = () => new Date().toISOString().split('T')[0]

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', calendar: 'gregory' }) : '—'

export const daysLeft = (warrantyDate) => {
  if (!warrantyDate) return null
  const diff = new Date(warrantyDate) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Arabic number-noun agreement rule (قاعدة العدد والمعدود)
// 1 -> "يوم", 2 -> "يومان", 3-10 -> "N أيام", 11+ -> "N يوم"
export function arabicDayPhrase(n) {
  const abs = Math.abs(n)
  if (abs === 1) return 'يوم'
  if (abs === 2) return 'يومان'
  if (abs >= 3 && abs <= 10) return `${abs} أيام`
  return `${abs} يوم`
}

export function arabicMonthPhrase(n) {
  const abs = Math.abs(n)
  if (abs === 1) return 'شهر'
  if (abs === 2) return 'شهران'
  if (abs >= 3 && abs <= 10) return `${abs} أشهر`
  return `${abs} شهر`
}

export function arabicYearPhrase(n) {
  const abs = Math.abs(n)
  if (abs === 1) return 'سنة'
  if (abs === 2) return 'سنتان'
  if (abs >= 3 && abs <= 10) return `${abs} سنوات`
  return `${abs} سنة`
}

export const daysSince = (dateStr) => {
  if (!dateStr) return ''
  const diff = new Date() - new Date(dateStr)
  let totalDays = Math.floor(diff / (1000 * 60 * 60 * 24))

  const years = Math.floor(totalDays / 365)
  totalDays -= years * 365
  const months = Math.floor(totalDays / 30)
  const days = totalDays - months * 30

  const parts = []
  if (years > 0) parts.push(arabicYearPhrase(years))
  if (months > 0) parts.push(arabicMonthPhrase(months))
  if (days > 0 || parts.length === 0) parts.push(arabicDayPhrase(days))

  return parts.join(' و')
}

export const uid = () => Math.random().toString(36).slice(2, 10).toUpperCase()

export const getQRUrl = (id, size = 300) => {
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
  const productUrl = `${appUrl}/product/${id}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(productUrl)}&margin=10&format=png`
}

export const TAG_COLORS = [
  'bg-amber-100 text-amber-800 border-amber-300',
  'bg-teal-100 text-teal-800 border-teal-300',
  'bg-violet-100 text-violet-800 border-violet-300',
  'bg-rose-100 text-rose-800 border-rose-300',
  'bg-sky-100 text-sky-800 border-sky-300',
  'bg-orange-100 text-orange-800 border-orange-300',
]
