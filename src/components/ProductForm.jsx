import { useState, useRef } from 'react'
import { today, uid } from '../lib/utils'
import { TagBadge } from './UI'

export default function ProductForm({ product, allTags, onSave, onCancel, onAddTag }) {
  const [form, setForm] = useState(product ? {
    ...product,
    tags: product.tags || [],
  } : {
    name: '', purchase_date: today(), warranty_date: '', price: '',
    store: '', notes: '', tags: [], invoice_file: null, invoice_name: '',
  })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleTag = (t) => set('tags', form.tags.includes(t) ? form.tags.filter(x => x !== t) : [...form.tags, t])

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => set('invoice_file', ev.target.result)
    reader.readAsDataURL(file)
    set('invoice_name', file.name)
  }

  const handleAddCustomTag = () => {
    const t = tagInput.trim()
    if (!t) return
    if (!allTags.includes(t)) onAddTag(t)
    if (!form.tags.includes(t)) set('tags', [...form.tags, t])
    setTagInput('')
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave({ ...form, id: form.id || uid() })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="font-bold text-gray-900 text-lg">{product ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">اسم المنتج *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="مثال: آيفون 15 برو"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">تاريخ الشراء</label>
              <input type="date" value={form.purchase_date} onChange={e => set('purchase_date', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">انتهاء الضمان</label>
              <input type="date" value={form.warranty_date} onChange={e => set('warranty_date', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">السعر (ر.س)</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">المتجر / المورد</label>
              <input value={form.store} onChange={e => set('store', e.target.value)}
                placeholder="أمازون، جرير..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">التاغز</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {allTags.map(t => (
                <button key={t} onClick={() => toggleTag(t)}
                  className={`px-3 py-1 rounded-full text-xs border font-medium transition-all ${form.tags.includes(t) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCustomTag()}
                placeholder="أضف تاغ جديد..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              <button onClick={handleAddCustomTag} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors">إضافة</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">ملاحظات</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
              placeholder="أي ملاحظات إضافية..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">الفاتورة</label>
            <div onClick={() => fileRef.current.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-gray-400 transition-colors">
              {form.invoice_name
                ? <p className="text-sm text-teal-600 font-medium">✓ {form.invoice_name}</p>
                : <p className="text-sm text-gray-400">اضغط لرفع الفاتورة (صورة أو PDF)</p>}
            </div>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden" />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3 rounded-b-2xl">
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors text-sm disabled:opacity-50">
            {saving ? 'جاري الحفظ...' : product ? 'حفظ التعديلات' : 'إضافة المنتج'}
          </button>
          <button onClick={onCancel} className="px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm text-gray-600">إلغاء</button>
        </div>
      </div>
    </div>
  )
}
