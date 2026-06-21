export const today = () => new Date().toISOString().split('T')[0]

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

export const daysLeft = (warrantyDate) => {
  if (!warrantyDate) return null
  const diff = new Date(warrantyDate) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
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
  if (years > 0) parts.push(`${years} ${years === 1 ? 'سنة' : 'سنوات'}`)
  if (months > 0) parts.push(`${months} ${months === 1 ? 'شهر' : 'أشهر'}`)
  if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'يوم' : 'أيام'}`)

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
