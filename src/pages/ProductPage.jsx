import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProduct } from '../lib/supabase'
import { formatDate, daysLeft } from '../lib/utils'
import { TagBadge, Spinner } from '../components/UI'
import { downloadICS } from '../lib/calendar'
import MaintenanceSection from '../components/MaintenanceSection'

const CATEGORY_ICONS = {
  'السيارة': 'M5 17h14M5 17a2 2 0 100 4 2 2 0 000-4zm14 0a2 2 0 100 4 2 2 0 000-4zM5 17l1.5-7h11L19 17M6.5 10l1-3h9l1 3',
  default: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
}

function getCategoryIcon(tags) {
  if (!tags || tags.length === 0) return CATEGORY_ICONS.default
  return CATEGORY_ICONS[tags[0]] || CATEGORY_ICONS.default
}

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showInvoice, setShowInvoice] = useState(false)

  useEffect(() => {
    getProduct(id)
      .then(setProduct)
      .catch(() => setError('المنتج غير موجود'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center"><Spinner /></div>

  if (error) return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round"/></svg>
        </div>
        <p className="text-gray-700 font-semibold mb-1">المنتج غير موجود</p>
        <p className="text-gray-400 text-sm mb-4">تحقق من صحة الرابط</p>
        <Link to="/" className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors">العودة للرئيسية</Link>
      </div>
    </div>
  )

  const days = daysLeft(product.warranty_date)
  const warrantyStatus = days === null ? null : days < 0 ? 'expired' : days <= 30 ? 'expiring' : 'active'
  const warrantyText = days === null ? null
    : days < 0 ? `انتهى الضمان منذ ${Math.abs(days)} يوم`
    : days === 0 ? 'الضمان ينتهي اليوم!'
    : `متبقي على الضمان ${days} يوم`
  const warrantySub = days === null ? null
    : warrantyStatus === 'expired' ? 'يمكنك تسجيل طلبات الصيانة'
    : warrantyStatus === 'expiring' ? 'الضمان على وشك الانتهاء'
    : 'المنتج لا يزال تحت الضمان'

  const totalMaintenanceCost = product.id ? null : null // computed inside MaintenanceSection display only

  return (
    <div className="min-h-screen bg-[#f8f7f4]" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header with wave decoration */}
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #3D2410 0%, #1A0F08 70%)' }}>
          <svg className="absolute inset-0 w-full h-full opacity-55" viewBox="0 0 800 230" preserveAspectRatio="xMidYMid slice">
            <path d="M-40 40 Q 110 0, 230 35 T 470 25 T 720 40 T 880 30" fill="none" stroke="rgba(216,90,48,0.5)" strokeWidth="2" />
            <path d="M-40 70 Q 130 30, 260 65 T 510 55 T 760 70 T 880 60" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
            <path d="M-40 110 Q 150 70, 290 105 T 550 95 T 800 110 T 880 100" fill="none" stroke="rgba(216,90,48,0.3)" strokeWidth="2" />
            <path d="M-40 150 Q 170 110, 310 145 T 570 135 T 820 150 T 880 140" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
            <path d="M-40 185 Q 140 150, 280 178 T 560 170 T 800 185 T 880 178" fill="none" stroke="rgba(216,90,48,0.2)" strokeWidth="2" />
            <circle cx="640" cy="15" r="3" fill="rgba(216,90,48,0.5)" />
            <circle cx="80" cy="125" r="2" fill="rgba(255,255,255,0.15)" />
            <circle cx="730" cy="165" r="3" fill="rgba(216,90,48,0.35)" />
            <circle cx="40" cy="60" r="2" fill="rgba(255,255,255,0.12)" />
          </svg>

          <div className="relative z-10 px-5 pt-5 flex items-center justify-between">
            <Link to="/" className="text-white/40 hover:text-white/70 transition-colors p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>

          <div className="relative z-10 px-5 pt-3 pb-7">
            <p className="text-[11px] text-white/35 font-mono tracking-wider mb-2">#{product.id}</p>
            <div className="flex items-center justify-between mb-3.5">
              <h1 className="text-3xl font-medium text-white tracking-tight">{product.name}</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white/60 tracking-wider">FHD</span>
                <img src="/header-icon.png" alt="FHD" className="w-9 h-9 rounded-full border border-white/30" />
              </div>
            </div>
            {product.tags?.length > 0 && (
              <span className="inline-flex items-center gap-1.5 border border-white/20 text-white/75 text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={getCategoryIcon(product.tags)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {product.tags[0]}
              </span>
            )}
          </div>
        </div>

        {/* Sheet */}
        <div className="bg-[#f8f7f4] rounded-t-[24px] -mt-0 px-4 pt-5 pb-4 relative z-10">
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2.5 mb-3.5">
            <div className="bg-white rounded-2xl px-3.5 py-3">
              <p className="text-[10px] text-gray-400 mb-1 tracking-wide">تاريخ الشراء</p>
              <p className="text-base font-medium text-gray-900">{formatDate(product.purchase_date)}</p>
            </div>
            <div className="bg-white rounded-2xl px-3.5 py-3">
              <p className="text-[10px] text-gray-400 mb-1 tracking-wide">السعر</p>
              <p className="text-base font-medium text-gray-900">{product.price ? `${parseFloat(product.price).toLocaleString()} ر.س` : '—'}</p>
            </div>
          </div>

          {/* Warranty card */}
          {warrantyText && (
            <div className="bg-white rounded-2xl px-4 py-3.5 mb-3.5 flex items-center gap-3" style={{ borderRight: '2.5px solid #D85A30' }}>
              <div className="w-8 h-8 rounded-full bg-[#FAECE7] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#712B13]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div>
                <p className="text-[12.5px] font-medium text-gray-900">{warrantyText}</p>
                <p className="text-[10.5px] text-gray-500 mt-0.5">{warrantySub}</p>
              </div>
            </div>
          )}

          {/* Store / extra info */}
          {product.store && (
            <div className="bg-white rounded-2xl px-4 py-3 mb-3.5 flex items-center justify-between">
              <span className="text-xs text-gray-400">المتجر / المورد</span>
              <span className="text-sm font-medium text-gray-800">{product.store}</span>
            </div>
          )}

          {/* Notes */}
          {product.notes && (
            <div className="bg-white rounded-2xl px-4 py-3 mb-3.5">
              <p className="text-[10px] text-gray-400 mb-1.5 tracking-wide">ملاحظات</p>
              <p className="text-sm text-gray-600">{product.notes}</p>
            </div>
          )}

          {/* Invoice */}
          {product.invoice_file && (
            <div className="bg-white rounded-2xl px-4 py-3.5 mb-3.5">
              <p className="text-[10px] text-gray-400 mb-2 tracking-wide">الفاتورة</p>
              {showInvoice ? (
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  {product.invoice_file.startsWith('data:image') ? (
                    <img src={product.invoice_file} alt="الفاتورة" className="w-full" />
                  ) : (
                    <iframe src={product.invoice_file} className="w-full h-96" title="الفاتورة" />
                  )}
                </div>
              ) : (
                <button onClick={() => setShowInvoice(true)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-[#D85A30]/25 bg-[#FAECE7] text-[#712B13] rounded-xl text-sm font-medium hover:bg-[#F5C4B3]/50 transition-colors w-full justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" strokeLinecap="round" /></svg>
                  عرض الفاتورة — {product.invoice_name}
                </button>
              )}
            </div>
          )}

          {/* Calendar reminder */}
          {product.warranty_date && (
            <button
              onClick={() => downloadICS(product)}
              className="flex items-center gap-2 px-4 py-3 bg-white rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full justify-center mb-3.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              أضف تذكير الضمان للتقويم
            </button>
          )}

          {/* Maintenance section */}
          {product.id && (
            <div className="bg-white rounded-2xl p-4">
              <MaintenanceSection productId={product.id} readOnly={true} />
            </div>
          )}

          <p className="text-center text-[10.5px] text-gray-400 mt-4 tracking-wide">
            تمت الإضافة {formatDate(product.created_at?.split('T')[0])}
          </p>
        </div>
      </div>
    </div>
  )
}
