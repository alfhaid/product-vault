import { useState } from 'react'
import { addTag, deleteTag, renameTag } from '../lib/supabase'

export default function TagsModal({ tags, onClose, onRefresh }) {
  const [editingTag, setEditingTag] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(null)

  const handleRename = async (oldName) => {
    const newName = editValue.trim()
    if (!newName || newName === oldName) { setEditingTag(null); return }
    setLoading(oldName)
    await renameTag(oldName, newName)
    await onRefresh()
    setEditingTag(null)
    setLoading(null)
  }

  const handleDelete = async (name) => {
    if (!confirm(`حذف تصنيف "${name}"؟ سيُحذف من جميع المنتجات.`)) return
    setLoading(name)
    await deleteTag(name)
    await onRefresh()
    setLoading(null)
  }

  const handleAdd = async () => {
    const name = newTag.trim()
    if (!name || tags.includes(name)) return
    setLoading('new')
    await addTag(name)
    await onRefresh()
    setNewTag('')
    setLoading(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-lg">إدارة التصنيفات</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-2 max-h-80 overflow-y-auto">
          {tags.length === 0 && <p className="text-gray-400 text-sm text-center py-4">لا توجد تصنيفات</p>}
          {tags.map(tag => (
            <div key={tag} className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 group">
              {editingTag === tag ? (
                <>
                  <input
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(tag); if (e.key === 'Escape') setEditingTag(null) }}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    autoFocus
                  />
                  <button onClick={() => handleRename(tag)} disabled={loading === tag}
                    className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors disabled:opacity-50">
                    {loading === tag ? '...' : 'حفظ'}
                  </button>
                  <button onClick={() => setEditingTag(null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition-colors">
                    إلغاء
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-gray-700 font-medium">{tag}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingTag(tag); setEditValue(tag) }}
                      className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-400 transition-colors" title="تعديل">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={() => handleDelete(tag)} disabled={loading === tag}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors disabled:opacity-50" title="حذف">
                      {loading === tag
                        ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                        : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      }
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">إضافة تصنيف جديد</p>
          <div className="flex gap-2">
            <input value={newTag} onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="اسم التصنيف..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            <button onClick={handleAdd} disabled={loading === 'new' || !newTag.trim()}
              className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50">
              {loading === 'new' ? '...' : 'إضافة'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
