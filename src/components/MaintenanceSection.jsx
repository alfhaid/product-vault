import { useState, useEffect } from 'react'
import { getMaintenanceRecords, addMaintenanceRecord, deleteMaintenanceRecord } from '../lib/supabase'
import { today, formatDate, daysSince } from '../lib/utils'
import RiyalSymbol from './RiyalSymbol'

export default function MaintenanceSection({
  productId,
  readOnly = false,
  accentColor = '#111827',
  accentBg = '#F3F4F6',
  totalCost = null,
  initialRecords = null, // if provided, skips the internal fetch (avoids duplicate network calls)
}) {
  const [records, setRecords] = useState(initialRecords || [])
  const [loading, setLoading] = useState(initialRecords === null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ description: '', cost: '', date: today() })
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (initialRecords !== null) return // data already provided by parent — skip fetch
    if (!productId) { setLoading(false); return }
    getMaintenanceRecords(productId, readOnly ? 'approved' : null)
      .then(setRecords)
      .finally(() => setLoading(false))
  }, [productId, readOnly, initialRecords])

  const handleAdd = async () => {
    if (!form.description.trim()) return
    setSaving(true)
    const record = await addMaintenanceRecord({
      product_id: productId,
      date: form.date,
      description: form.description.trim(),
      cost: form.cost || null,
      status: readOnly ? 'pending' : 'approved',
    })
    if (!readOnly) setRecords(r => [record, ...r])
    setForm({ description: '', cost: '', date: today() })
    setShowAdd(false)
    setSaving(false)
    if (readOnly) setSubmitted(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا السجل؟')) return
    await deleteMaintenanceRecord(id)
    setRecords(r => r.filter(x => x.id !== id))
  }

  const statusColor = (s) => s === 'pending' ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-transparent'
  const statusBadge = (s) => s === 'pending'
    ? <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">معلق</span>
    : null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center gap-1.5 text-[17px] font-medium" style={{ color: accentColor, fontFamily: "'Tajawal', sans-serif" }}>
          <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          سجل الصيانة
        </label>
        {!submitted && (
          <button onClick={() => setShowAdd(!showAdd)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-semibold transition-transform hover:scale-105"
            style={{ backgroundColor: accentBg, color: accentColor }}>
            +
          </button>
        )}
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3 text-center">
          <p className="text-[15px] text-green-700 font-medium">✓ تم إرسال طلب الصيانة بنجاح</p>
          <p className="text-[13px] text-green-500 mt-0.5">سيتم مراجعته من قبل صاحب الصلاحية</p>
        </div>
      )}

      {showAdd && (
        <div className="border border-gray-200 rounded-xl p-4 mb-3 space-y-3 bg-gray-50">
          {readOnly && (
            <p className="text-[13px] rounded-lg px-3 py-2" style={{ color: accentColor, backgroundColor: accentBg }}>
              سيتم إرسال هذا الطلب للمراجعة قبل الإضافة
            </p>
          )}
          <div>
            <label className="text-[13px] font-medium text-gray-600 mb-1 block">وصف الصيانة *</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="مثال: تغيير شاشة، إصلاح بطارية..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-medium text-gray-600 mb-1 block">التكلفة (<RiyalSymbol />)</label>
              <input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-gray-600 mb-1 block">التاريخ</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving || !form.description.trim()}
              className="flex-1 py-2 text-white rounded-xl text-[15px] font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: accentColor }}>
              {saving ? 'جاري الإرسال...' : readOnly ? 'إرسال الطلب' : 'حفظ'}
            </button>
            <button onClick={() => setShowAdd(false)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-[15px] text-gray-500 hover:bg-gray-100 transition-colors">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-[13px] text-gray-400 text-center py-3">جاري التحميل...</p>
      ) : records.length === 0 ? (
        <p className="text-[13px] text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-xl">
          لا توجد سجلات صيانة
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {records.map((r, i) => (
              <div key={r.id} className={`flex items-start gap-3 p-3 rounded-xl border group ${statusColor(r.status)}`}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0"
                  style={{ backgroundColor: accentBg, color: accentColor }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[17px] font-medium text-gray-800">{r.description}</p>
                    {!readOnly && statusBadge(r.status)}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-[15px] text-gray-400">{formatDate(r.date)} — منذ {daysSince(r.date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.cost && (
                    <span className="text-[15px] font-medium text-gray-700 flex items-center gap-1">
                      {parseFloat(r.cost).toLocaleString()} <RiyalSymbol />
                    </span>
                  )}
                  {!readOnly && (
                    <button onClick={() => handleDelete(r.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-lg text-red-400 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalCost !== null && (
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100">
              <span className="text-[14px] text-gray-500">إجمالي الصيانة</span>
              <span className="text-[18px] font-semibold flex items-center gap-1" style={{ color: accentColor }}>
                {totalCost.toLocaleString()} <RiyalSymbol />
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
