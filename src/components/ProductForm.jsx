import { useState, useRef } from 'react'
import { today, uid } from '../lib/utils'
import { TagBadge } from './UI'
import MaintenanceSection from './MaintenanceSection'
import RiyalSymbol from './RiyalSymbol'

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

  const headerBg = 'linear-gradient(160deg, #3D2410 0%, #1A0F08 70%)'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10 relative overflow-hidden" style={{ background: headerBg }}>
          <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 600 100" preserveAspectRatio="xMidYMid slice">
            <path d="M-40 20 Q 80 -5, 170 18 T 350 10 T 540 22 T 660 14" fill="none" stroke="rgba(216,90,48,0.5)" strokeWidth="2" />
            <path d="M-40 45 Q 100 20, 190 42 T 380 35 T 560 48 T 660 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <circle cx="480" cy="10" r="2.5" fill="rgba(216,90,48,0.5)" />
            <circle cx="60" cy="60" r="2" fill="rgba(255,255,255,0.12)" />
          </svg>
          <h2 className="text-white text-lg relative z-10" style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 600 }}>
            {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </h2>
          <button onClick={onCancel} className="text-white/50 hover:text-white transition-colors relative z-10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">اسم المنتج *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="مثال: آيفون 15 برو"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D85A30] focus:border-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">تاريخ الشراء</label>
              <input type="date" value={form.purchase_date} onChange={e => set('purchase_date', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D85A30]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">انتهاء الضمان</label>
              <input type="date" value={form.warranty_date} onChange={e => set('warranty_date', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D85A30]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">السعر (<RiyalSymbol />)</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D85A30]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">المتجر / المورد</label>
              <input value={form.store} onChange={e => set('store', e.target.value)}
                placeholder="أمازون، جرير..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D85A30]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">التاغز</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {allTags.map(t => (
                <button key={t} onClick={() => toggleTag(t)}
                  className={`px-3 py-1 rounded-full text-xs border font-medium transition-all ${form.tags.includes(t) ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                  style={form.tags.includes(t) ? { backgroundColor: '#D85A30' } : {}}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCustomTag()}
                placeholder="أضف تاغ جديد..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D85A30]" />
              <button onClick={handleAddCustomTag} className="px-4 py-2 rounded-xl text-sm font-medium transition-colors" style={{ backgroundColor: '#FAECE7', color: '#712B13' }}>إضافة</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">ملاحظات</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
              placeholder="أي ملاحظات إضافية..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D85A30] resize-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">الفاتورة</label>
            <div onClick={() => fileRef.current.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#D85A30]/40 transition-colors">
              {form.invoice_name
                ? <p className="text-sm font-medium" style={{ color: '#1F6B3D' }}>✓ {form.invoice_name}</p>
                : <p className="text-sm text-gray-400">اضغط لرفع الفاتورة (صورة أو PDF)</p>}
            </div>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden" />
          </div>

          {form.id && (
            <div>
              <MaintenanceSection productId={form.id} accentColor="#D85A30" accentBg="#FAECE7" />
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3 rounded-b-2xl">
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-3 text-white rounded-xl font-semibold transition-colors text-sm disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: '#D85A30' }}>
            {saving ? 'جاري الحفظ...' : product ? 'حفظ التعديلات' : 'إضافة المنتج'}
          </button>
          <button onClick={onCancel} className="px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm text-gray-600">إلغاء</button>
        </div>
      </div>
    </div>
  )
}
