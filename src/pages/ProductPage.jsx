import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProduct, getMaintenanceRecords } from '../lib/supabase'
import { formatDate, daysLeft } from '../lib/utils'
import { Spinner } from '../components/UI'
import { downloadICS } from '../lib/calendar'
import MaintenanceSection from '../components/MaintenanceSection'

const CATEGORY_ICON_PATHS = {
  'السيارة': 'M5 17h14M5 17a2 2 0 100 4 2 2 0 000-4zm14 0a2 2 0 100 4 2 2 0 000-4zM5 17l1.5-7h11L19 17M6.5 10l1-3h9l1 3',
  default: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
}

function getCategoryIcon(tags) {
  if (!tags || tags.length === 0) return CATEGORY_ICON_PATHS.default
  return CATEGORY_ICON_PATHS[tags[0]] || CATEGORY_ICON_PATHS.default
}

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showInvoice, setShowInvoice] = useState(false)
  const [totalMaintenanceCost, setTotalMaintenanceCost] = useState(null)

  useEffect(() => {
    getProduct(id)
      .then(setProduct)
      .catch(() => setError('المنتج غير موجود'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!product?.id) return
    getMaintenanceRecords(product.id)
      .then(records => {
        const total = records.reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0)
        setTotalMaintenanceCost(total)
      })
      .catch(() => setTotalMaintenanceCost(0))
  }, [product?.id])

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><Spinner /></div>

  if (error) return (
    <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
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

  const warrantyColors = {
    expired:  { border: '#D14343', iconBg: '#FBE7E7', iconFg: '#8A1F1F' },
    expiring: { border: '#D85A30', iconBg: '#FAECE7', iconFg: '#712B13' },
    active:   { border: '#3B8F5C', iconBg: '#E7F5EC', iconFg: '#1F6B3D' },
  }
  const wc = warrantyStatus ? warrantyColors[warrantyStatus] : null

  const headerBg = 'linear-gradient(160deg, #3D2410 0%, #1A0F08 70%)'

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header with wave decoration — background extends behind the curve */}
        <div className="relative overflow-hidden" style={{ background: headerBg, paddingBottom: '24px' }}>
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

          <div className="relative z-10 px-5 pt-4 pb-2">
            <div className="flex items-center justify-between mb-3.5">
              <h1 className="text-[32px] font-medium text-white tracking-tight leading-none">{product.name}</h1>
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-medium text-white/60 tracking-wider leading-none">FHD</span>
                <img src="/header-icon.png" alt="FHD" className="w-9 h-9 rounded-full border border-white/30" />
              </div>
            </div>
            {product.tags?.length > 0 && (
              <span className="inline-flex items-center gap-1.5 border border-white/20 text-white/75 text-[15px] px-3 py-1.5 rounded-full backdrop-blur-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={getCategoryIcon(product.tags)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {product.tags[0]}
              </span>
            )}
          </div>

          {/* Curve cut from the SAME dark background — no gap visible */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#f8f7f4]" style={{ borderRadius: '24px 24px 0 0' }} />
        </div>

        {/* Sheet content */}
        <div className="bg-[#f8f7f4] px-4 pt-1 pb-4 relative z-10">
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2.5 mb-3.5">
            <div className="bg-white rounded-2xl px-3.5 py-3">
              <p className="text-[13px] text-gray-400 mb-1 tracking-wide">تاريخ الشراء</p>
              <p className="text-[19px] font-medium text-gray-900">{formatDate(product.purchase_date)}</p>
            </div>
            <div className="bg-white rounded-2xl px-3.5 py-3">
              <p className="text-[13px] text-gray-400 mb-1 tracking-wide">إجمالي الصيانة</p>
              <p className="text-[19px] font-medium text-gray-900">
                {totalMaintenanceCost === null ? '—' : `${totalMaintenanceCost.toLocaleString()} ر.س`}
              </p>
            </div>
          </div>

          {/* Warranty card — always shown when warranty_date exists */}
          {warrantyText && wc && (
            <div className="bg-white rounded-2xl px-4 py-3.5 mb-3.5 flex items-center gap-3" style={{ borderRight: `2.5px solid ${wc.border}` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: wc.iconBg }}>
                <svg className="w-4 h-4" style={{ color: wc.iconFg }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div>
                <p className="text-[15.5px] font-medium text-gray-900">{warrantyText}</p>
                <p className="text-[13.5px] text-gray-500 mt-0.5">{warrantySub}</p>
              </div>
            </div>
          )}

          {/* Store / extra info */}
          {product.store && (
            <div className="bg-white rounded-2xl px-4 py-3 mb-3.5 flex items-center justify-between">
              <span className="text-[14px] text-gray-400">المتجر / المورد</span>
              <span className="text-[17px] font-medium text-gray-800">{product.store}</span>
            </div>
          )}

          {/* Notes */}
          {product.notes && (
            <div className="bg-white rounded-2xl px-4 py-3 mb-3.5">
              <p className="text-[13px] text-gray-400 mb-1.5 tracking-wide">ملاحظات</p>
              <p className="text-[17px] text-gray-600">{product.notes}</p>
            </div>
          )}

          {/* Invoice */}
          {product.invoice_file && (
            <div className="bg-white rounded-2xl px-4 py-3.5 mb-3.5">
              <p className="text-[13px] text-gray-400 mb-2 tracking-wide">الفاتورة</p>
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
                  className="flex items-center gap-2 px-4 py-2.5 border border-[#D85A30]/25 bg-[#FAECE7] text-[#712B13] rounded-xl text-[17px] font-medium hover:bg-[#F5C4B3]/50 transition-colors w-full justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" strokeLinecap="round" /></svg>
                  عرض الفاتورة — {product.invoice_name}
                </button>
              )}
            </div>
          )}

          {/* Calendar reminder — only when warranty is still active */}
          {product.warranty_date && warrantyStatus !== 'expired' && (
            <button
              onClick={() => downloadICS(product)}
              className="flex items-center gap-2 px-4 py-3 bg-white rounded-2xl text-[17px] font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full justify-center mb-3.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              أضف تذكير الضمان للتقويم
            </button>
          )}

          {/* Maintenance section */}
          {product.id && (
            <div className="bg-white rounded-2xl p-4">
              <MaintenanceSection productId={product.id} readOnly={true} accentColor="#D85A30" accentBg="#FAECE7" />
            </div>
          )}

          <p className="text-center text-[13.5px] text-gray-400 mt-4 tracking-wide">
            تمت الإضافة {formatDate(product.created_at?.split('T')[0])}
          </p>
        </div>
      </div>
    </div>
  )
}
