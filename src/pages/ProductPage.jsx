import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProduct } from '../lib/supabase'
import { formatDate, daysLeft } from '../lib/utils'
import { TagBadge, WarrantyBadge, Spinner } from '../components/UI'

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

  return (
    <div className="min-h-screen bg-[#f8f7f4]" dir="rtl">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="font-black text-gray-900">Product Vault</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Top bar */}
          <div className="px-6 py-5 border-b border-gray-50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-400 font-mono mb-1">#{product.id}</p>
                <h1 className="text-2xl font-black text-gray-900">{product.name}</h1>
              </div>
              <WarrantyBadge warrantyDate={product.warranty_date} />
            </div>
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {product.tags.map(t => <TagBadge key={t} tag={t} />)}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="px-6 py-5 grid grid-cols-2 gap-5">
            {[
              { label: 'تاريخ الشراء', value: formatDate(product.purchase_date) },
              { label: 'انتهاء الضمان', value: product.warranty_date ? formatDate(product.warranty_date) : null },
              { label: 'السعر', value: product.price ? `${parseFloat(product.price).toLocaleString()} ر.س` : null },
              { label: 'المتجر / المورد', value: product.store || null },
            ].filter(x => x.value).map(x => (
              <div key={x.label}>
                <p className="text-xs text-gray-400 mb-0.5">{x.label}</p>
                <p className="font-semibold text-gray-800">{x.value}</p>
              </div>
            ))}
          </div>

          {/* Warranty countdown */}
          {days !== null && (
            <div className={`mx-6 mb-5 rounded-xl p-4 ${days < 0 ? 'bg-red-50 border border-red-100' : days <= 30 ? 'bg-orange-50 border border-orange-100' : 'bg-green-50 border border-green-100'}`}>
              <p className={`font-semibold text-sm ${days < 0 ? 'text-red-700' : days <= 30 ? 'text-orange-700' : 'text-green-700'}`}>
                {days < 0 ? `انتهى الضمان منذ ${Math.abs(days)} يوم` : days === 0 ? 'الضمان ينتهي اليوم!' : `متبقي على الضمان ${days} يوم`}
              </p>
            </div>
          )}

          {/* Notes */}
          {product.notes && (
            <div className="px-6 pb-5">
              <p className="text-xs text-gray-400 mb-1">ملاحظات</p>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{product.notes}</p>
            </div>
          )}

          {/* Invoice */}
          {product.invoice_file && (
            <div className="px-6 pb-6">
              <p className="text-xs text-gray-400 mb-2">الفاتورة</p>
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
                  className="flex items-center gap-2 px-4 py-2.5 border border-teal-200 bg-teal-50 text-teal-700 rounded-xl text-sm font-medium hover:bg-teal-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" strokeLinecap="round"/></svg>
                  عرض الفاتورة — {product.invoice_name}
                </button>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          تمت الإضافة {formatDate(product.created_at?.split('T')[0])}
        </p>
      </main>
    </div>
  )
}
