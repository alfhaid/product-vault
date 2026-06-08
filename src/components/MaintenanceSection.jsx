import { useState, useEffect } from 'react'
import { getMaintenanceRecords, addMaintenanceRecord, deleteMaintenanceRecord } from '../lib/supabase'
import { today, formatDate } from '../lib/utils'

export default function MaintenanceSection({ productId, readOnly = false }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ description: '', cost: '', date: today() })
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!productId) { setLoading(false); return }
    // Public view shows only approved, dashboard shows all
    getMaintenanceRecords(productId, readOnly ? 'approved' : null)
      .then(setRecords)
      .finally(() => setLoading(false))
  }, [productId, readOnly])

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
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-gray-700">سجل الصيانة</label>
        {!submitted && (
          <button onClick={() => setShowAdd(!showAdd)}
            className="text-xs px-3 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors">
            + إضافة
          </button>
        )}
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3 text-center">
          <p className="text-sm text-green-700 font-medium">✓ تم إرسال طلب الصيانة بنجاح</p>
          <p className="text-xs text-green-500 mt-0.5">سيتم مراجعته من قبل صاحب الصلاحية</p>
        </div>
      )}

      {showAdd && (
        <div className="border border-gray-200 rounded-xl p-4 mb-3 space-y-3 bg-gray-50">
          {readOnly && (
            <p className="text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2">
              سيتم إرسال هذا الطلب للمراجعة قبل الإضافة
            </p>
          )}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">وصف الصيانة *</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="مثال: تغيير شاشة، إصلاح بطارية..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">التكلفة (ر.س)</label>
              <input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">التاريخ</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving || !form.description.trim()}
              className="flex-1 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50">
              {saving ? 'جاري الإرسال...' : readOnly ? 'إرسال الطلب' : 'حفظ'}
            </button>
            <button onClick={() => setShowAdd(false)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-gray-400 text-center py-3">جاري التحميل...</p>
      ) : records.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-xl">
          لا توجد سجلات صيانة
        </p>
      ) : (
        <div className="space-y-2">
          {records.map(r => (
            <div key={r.id} className={`flex items-start gap-3 p-3 rounded-xl border group ${statusColor(r.status)}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-gray-800">{r.description}</p>
                  {!readOnly && statusBadge(r.status)}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-400">{formatDate(r.date)}</span>
                  {r.cost && <span className="text-xs text-gray-500 font-medium">{parseFloat(r.cost).toLocaleString()} ر.س</span>}
                </div>
              </div>
              {!readOnly && (
                <button onClick={() => handleDelete(r.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-lg text-red-400 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
