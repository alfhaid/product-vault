import { useState, useEffect, useCallback } from 'react'
import { getProducts, getTags, upsertProduct, deleteProduct, addTag } from '../lib/supabase'
import { getPendingMaintenance, approveMaintenance, deleteMaintenanceRecord, getMaintenanceRecords } from '../lib/supabase'
import RiyalSymbol from '../components/RiyalSymbol'
import { downloadICS } from '../lib/calendar'
import { daysLeft, formatDate } from '../lib/utils'
import { TagBadge, WarrantyBadge, Spinner } from '../components/UI'
import ProductForm from '../components/ProductForm'
import QRModal from '../components/QRModal'
import TagsModal from '../components/TagsModal'

const CORRECT_PASSWORD = '651983'
const SESSION_KEY = 'vault_auth'

function LoginScreen({ onLogin }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = () => {
    if (input === CORRECT_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1')
      onLogin()
    } else {
      setError(true)
      setShake(true)
      setInput('')
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" dir="rtl" style={{ background: 'linear-gradient(160deg, #3D2410 0%, #1A0F08 70%)' }}>
      <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        <path d="M-40 60 Q 110 10, 230 65 T 470 45 T 720 70 T 880 50" fill="none" stroke="rgba(216,90,48,0.5)" strokeWidth="2" />
        <path d="M-40 130 Q 130 80, 260 135 T 510 105 T 760 140 T 880 110" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        <path d="M-40 480 Q 150 430, 290 485 T 550 455 T 800 490 T 880 460" fill="none" stroke="rgba(216,90,48,0.3)" strokeWidth="2" />
        <path d="M-40 540 Q 170 490, 310 545 T 570 515 T 820 550 T 880 520" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
        <circle cx="640" cy="40" r="3" fill="rgba(216,90,48,0.5)" />
        <circle cx="80" cy="500" r="2" fill="rgba(255,255,255,0.15)" />
        <circle cx="730" cy="520" r="3" fill="rgba(216,90,48,0.35)" />
        <circle cx="40" cy="100" r="2" fill="rgba(255,255,255,0.12)" />
      </svg>

      <div className={`relative z-10 rounded-2xl p-8 w-full max-w-sm transition-all ${shake ? 'translate-x-2' : ''}`} style={{ backgroundColor: 'rgba(255,255,255,0.97)' }}>
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16 rounded-full border-2 border-gray-900 flex items-center justify-center">
            <img src="/header-icon.png" alt="FHD" className="w-14 h-14 rounded-full" />
          </div>
        </div>
        <h1 className="text-3xl text-gray-900 text-center mb-1" style={{ fontFamily: "'Petit Formal Script', cursive" }}>Fahad Alfhaid</h1>
        <p className="text-sm text-gray-400 text-center mb-6">أدخل كلمة المرور للمتابعة</p>
        <input
          type="password"
          value={input}
          onChange={e => { setInput(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="كلمة المرور"
          className={`w-full border rounded-xl px-4 py-3 text-center text-lg tracking-widest focus:outline-none focus:ring-2 mb-3 ${error ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-200 focus:ring-[#D85A30]'}`}
          autoFocus
        />
        {error && <p className="text-red-500 text-sm text-center mb-3">كلمة المرور غير صحيحة</p>}
        <button onClick={handleSubmit} className="w-full py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-colors" style={{ backgroundColor: '#D85A30' }}>
          دخول
        </button>
      </div>
    </div>
  )
}

function ProductCard({ product, allTags, onEdit, onDelete, onViewQR }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base truncate">{product.name}</h3>
          <p className="text-xs text-gray-400 font-mono mt-0.5">#{product.id}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {product.warranty_date && (
            <button onClick={() => downloadICS(product)} className="p-1.5 hover:bg-[#FAECE7] rounded-lg transition-colors text-[#D85A30]" title="أضف للتقويم">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
          <button onClick={() => onViewQR(product)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500" title="QR">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2"/><path d="M14 14h.01M18 14h.01M14 18h.01M18 18h.01M14 21h.01M21 14h.01M21 18h.01M21 21h.01" strokeWidth="2"/></svg>
          </button>
          <button onClick={() => onEdit(product)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-blue-500" title="تعديل">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={() => onDelete(product.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-400" title="حذف">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {product.tags?.map(t => <TagBadge key={t} tag={t} allTags={allTags} />)}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
        <div>
          <span className="text-gray-400">تاريخ الشراء</span>
          <p className="text-gray-700 font-medium">{formatDate(product.purchase_date)}</p>
        </div>
        {product.warranty_date && (
          <div>
            <span className="text-gray-400">انتهاء الضمان</span>
            <p className="text-gray-700 font-medium">{formatDate(product.warranty_date)}</p>
          </div>
        )}
        {product.price && (
          <div>
            <span className="text-gray-400">السعر</span>
            <p className="text-gray-700 font-medium flex items-center gap-1">{parseFloat(product.price).toLocaleString()} <RiyalSymbol /></p>
          </div>
        )}
        {product.store && (
          <div>
            <span className="text-gray-400">المتجر</span>
            <p className="text-gray-700 font-medium truncate">{product.store}</p>
          </div>
        )}
      </div>
      {product.notes && <p className="text-xs text-gray-400 italic mb-3 border-t pt-2">{product.notes}</p>}
      <div className="flex items-center justify-between">
        <WarrantyBadge warrantyDate={product.warranty_date} />
        {product.invoice_name && (
          <span className="text-xs text-teal-600 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            فاتورة مرفقة
          </span>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [products, setProducts] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('grid')
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [filterWarranty, setFilterWarranty] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [qrProduct, setQrProduct] = useState(null)
  const [toast, setToast] = useState(null)
  const [showTags, setShowTags] = useState(false)
  const [pendingMaintenance, setPendingMaintenance] = useState([])
  const [showPending, setShowPending] = useState(false)

  const load = useCallback(async () => {
    try {
      const [p, t] = await Promise.all([getProducts(), getTags()])
      setProducts(p)
      setTags(t)
    } catch (e) {
      setError('تعذّر الاتصال بقاعدة البيانات')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadPending = useCallback(async () => {
    try {
      const pending = await getPendingMaintenance()
      setPendingMaintenance(pending)
    } catch (e) {}
  }, [])

  useEffect(() => {
    if (authed) {
      load()
      loadPending()
    }
  }, [authed, load, loadPending])

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async (product) => {
    await upsertProduct(product)
    await load()
    setShowForm(false)
    setEditProduct(null)
    showToast(editProduct ? 'تم تحديث المنتج ✓' : 'تم إضافة المنتج ✓')
  }

  const handleDelete = async (id) => {
    if (!confirm('هل تريد حذف هذا المنتج؟')) return
    await deleteProduct(id)
    setProducts(p => p.filter(x => x.id !== id))
    showToast('تم الحذف', 'error')
  }

  const handleExport = async () => {
    const allProducts = await Promise.all(
      products.map(async (p) => {
        const maintenance = await getMaintenanceRecords(p.id)
        return {
          ...p,
          invoice_file: undefined,
          maintenance: maintenance.map(m => ({
            date: m.date,
            description: m.description,
            cost: m.cost,
            status: m.status,
          }))
        }
      })
    )
    const data = {
      export_date: new Date().toISOString().split('T')[0],
      total_products: allProducts.length,
      products: allProducts,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `product-vault-backup-${data.export_date}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('تم تصدير البيانات ✓')
  }

  const handleAddTag = async (tag) => {
    await addTag(tag)
    setTags(t => [...t, tag].sort())
  }

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.tags?.some(t => t.includes(q)) || p.store?.toLowerCase().includes(q)
    const matchTag = !filterTag || p.tags?.includes(filterTag)
    const days = daysLeft(p.warranty_date)
    const matchW = filterWarranty === 'all'
      || (filterWarranty === 'active' && days !== null && days > 30)
      || (filterWarranty === 'expiring' && days !== null && days >= 0 && days <= 30)
      || (filterWarranty === 'expired' && days !== null && days < 0)
      || (filterWarranty === 'none' && days === null)
    return matchSearch && matchTag && matchW
  })

  const stats = {
    total: products.length,
    expiring: products.filter(p => { const d = daysLeft(p.warranty_date); return d !== null && d >= 0 && d <= 30 }).length,
    expired: products.filter(p => { const d = daysLeft(p.warranty_date); return d !== null && d < 0 }).length,
    totalValue: products.reduce((s, p) => s + (parseFloat(p.price) || 0), 0),
  }

  const headerBg = 'linear-gradient(160deg, #3D2410 0%, #1A0F08 70%)'

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full text-sm font-semibold shadow-lg ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {qrProduct && <QRModal product={qrProduct} onClose={() => setQrProduct(null)} />}
      {showTags && <TagsModal tags={tags} onClose={() => setShowTags(false)} onRefresh={load} />}

      {(showForm || editProduct) && (
        <ProductForm product={editProduct} allTags={tags}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditProduct(null) }}
          onAddTag={handleAddTag} />
      )}

      {/* Header — dark gradient with wave decoration, unified with product page theme */}
      <div className="relative overflow-hidden sticky top-0 z-30" style={{ background: headerBg, paddingBottom: '60px' }}>
        <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 800 230" preserveAspectRatio="xMidYMid slice">
          <path d="M-40 30 Q 110 -10, 230 25 T 470 15 T 720 30 T 880 20" fill="none" stroke="rgba(216,90,48,0.5)" strokeWidth="2" />
          <path d="M-40 60 Q 130 20, 260 55 T 510 45 T 760 60 T 880 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <path d="M-40 95 Q 150 60, 290 95 T 550 85 T 800 100 T 880 90" fill="none" stroke="rgba(216,90,48,0.25)" strokeWidth="2" />
          <circle cx="640" cy="10" r="3" fill="rgba(216,90,48,0.4)" />
          <circle cx="80" cy="80" r="2" fill="rgba(255,255,255,0.12)" />
        </svg>

        <div className="max-w-6xl mx-auto px-4 pt-7 pb-3 relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-full border border-white/30 flex items-center justify-center flex-shrink-0">
              <img src="/header-icon.png" alt="FHD" className="w-9 h-9 rounded-full" />
            </div>
            <div>
              <h1 className="text-white text-2xl leading-tight" style={{ fontFamily: "'Petit Formal Script', cursive" }}>Fahad Alfhaid</h1>
              <p className="text-[11px] text-white/40">2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowForm(true)}
              className="p-2.5 rounded-xl text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#D85A30' }} title="إضافة منتج">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>
            <button onClick={() => setShowPending(!showPending)}
              className="relative p-2.5 border border-white/15 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors" title="طلبات الصيانة">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {pendingMaintenance.length > 0 && (
                <span className="absolute -top-1 -left-1 w-4 h-4 bg-[#F0A04B] text-white text-xs rounded-full flex items-center justify-center font-bold">{pendingMaintenance.length}</span>
              )}
            </button>
            <button onClick={() => setShowTags(true)}
              className="p-2.5 border border-white/15 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors" title="إدارة التصنيفات">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={handleExport}
              className="p-2.5 border border-white/15 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors" title="تصدير البيانات">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={() => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false) }}
              className="p-2.5 border border-white/15 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors" title="تسجيل خروج">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#f8f7f4]" style={{ borderRadius: '24px 24px 0 0' }} />
      </div>

      <main className="max-w-6xl mx-auto px-4 pt-4 pb-6 bg-[#f8f7f4]">
        {loading ? <Spinner /> : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : (
          <>
            {/* Pending Maintenance */}
            {showPending && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6">
                <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round"/></svg>
                  طلبات صيانة معلقة ({pendingMaintenance.length})
                </h3>
                {pendingMaintenance.length === 0 ? (
                  <p className="text-sm text-orange-600 text-center py-2">لا توجد طلبات معلقة</p>
                ) : (
                  <div className="space-y-2">
                    {pendingMaintenance.map(r => (
                      <div key={r.id} className="bg-white rounded-xl p-4 flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{r.products?.name}</p>
                          <p className="text-sm text-gray-600">{r.description}</p>
                          <div className="flex gap-3 mt-0.5">
                            <span className="text-xs text-gray-400">{r.date}</span>
                            {r.cost && <span className="text-xs text-gray-500 inline-flex items-center gap-1">{parseFloat(r.cost).toLocaleString()} <RiyalSymbol /></span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={async () => {
                            await approveMaintenance(r.id)
                            setPendingMaintenance(p => p.filter(x => x.id !== r.id))
                            showToast('تم قبول الطلب ✓')
                          }} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors">
                            قبول ✓
                          </button>
                          <button onClick={async () => {
                            await deleteMaintenanceRecord(r.id)
                            setPendingMaintenance(p => p.filter(x => x.id !== r.id))
                            showToast('تم رفض الطلب', 'error')
                          }} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                            رفض ✗
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stats — themed cards: dark / green / orange / red */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="rounded-2xl p-4 shadow-sm" style={{ background: headerBg }}>
                <p className="text-xs text-white/40 mb-1">إجمالي المنتجات</p>
                <p className="text-xl font-black text-white">{stats.total}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">إجمالي القيمة</p>
                <p className="text-xl font-black text-[#1F6B3D] flex items-center gap-1">{stats.totalValue.toLocaleString()}<RiyalSymbol /></p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">ضمان ينتهي قريباً</p>
                <p className="text-xl font-black text-[#D85A30]">{stats.expiring}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">ضمان منتهي</p>
                <p className="text-xl font-black text-[#D14343]">{stats.expired}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 space-y-3">
              <div className="relative">
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" strokeLinecap="round"/></svg>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="ابحث بالاسم، التصنيف، المتجر..."
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D85A30]" />
              </div>
              <div className="flex flex-wrap gap-2">
                <select value={filterTag} onChange={e => setFilterTag(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D85A30] bg-white">
                  <option value="">كل التصنيفات</option>
                  {tags.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={filterWarranty} onChange={e => setFilterWarranty(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D85A30] bg-white">
                  <option value="all">كل المنتجات</option>
                  <option value="active">ضمان ساري</option>
                  <option value="expiring">ينتهي خلال 30 يوم</option>
                  <option value="expired">منتهي الضمان</option>
                  <option value="none">بدون ضمان</option>
                </select>
                <div className="flex gap-1 mr-auto">
                  <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'text-white' : 'text-gray-400 hover:bg-gray-100'}`} style={view === 'grid' ? { backgroundColor: '#D85A30' } : {}}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></svg>
                  </button>
                  <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'text-white' : 'text-gray-400 hover:bg-gray-100'}`} style={view === 'list' ? { backgroundColor: '#D85A30' } : {}}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400">{filtered.length} منتج من أصل {products.length}</p>
            </div>

            {/* Products */}
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p className="text-gray-500 font-medium mb-1">لا توجد منتجات</p>
                <p className="text-gray-400 text-sm mb-4">
                  {search || filterTag || filterWarranty !== 'all' ? 'جرب تغيير البحث أو الفلاتر' : 'ابدأ بإضافة منتجك الأول'}
                </p>
                {!search && !filterTag && filterWarranty === 'all' && (
                  <button onClick={() => setShowForm(true)} className="px-5 py-2.5 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-colors" style={{ backgroundColor: '#D85A30' }}>إضافة منتج</button>
                )}
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(p => (
                  <ProductCard key={p.id} product={p} allTags={tags}
                    onEdit={setEditProduct} onDelete={handleDelete} onViewQR={setQrProduct} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(p => (
                  <div key={p.id} className="bg-white border border-gray-100 rounded-xl px-5 py-3.5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{p.name}</span>
                        {p.tags?.map(t => <TagBadge key={t} tag={t} allTags={tags} />)}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">{formatDate(p.purchase_date)}</span>
                        {p.price && <span className="text-xs text-gray-500 font-medium inline-flex items-center gap-1">{parseFloat(p.price).toLocaleString()} <RiyalSymbol /></span>}
                        {p.store && <span className="text-xs text-gray-400">{p.store}</span>}
                      </div>
                    </div>
                    <WarrantyBadge warrantyDate={p.warranty_date} />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setQrProduct(p)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2"/><path d="M14 14h.01M18 14h.01M14 18h.01M18 18h.01" strokeWidth="2"/></svg>
                      </button>
                      <button onClick={() => setEditProduct(p)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
