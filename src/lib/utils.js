export const today = () => new Date().toISOString().split('T')[0]

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

export const daysLeft = (warrantyDate) => {
  if (!warrantyDate) return null
  const diff = new Date(warrantyDate) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
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
