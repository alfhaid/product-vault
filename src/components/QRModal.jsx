import { useState } from 'react'
import { getQRUrl, formatDate } from '../lib/utils'

const LABEL_SIZES = [
  { name: '50×50mm', w: '50mm', h: '50mm', qrPx: 110 },
  { name: '62×29mm', w: '62mm', h: '29mm', qrPx: 65 },
  { name: '100×50mm', w: '100mm', h: '50mm', qrPx: 110 },
]

export default function QRModal({ product, onClose }) {
  const [selectedSize, setSelectedSize] = useState(0)
  const qrUrl = getQRUrl(product.id, 400)

  const handleDownload = async () => {
    try {
      const res = await fetch(qrUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-${product.name}-${product.id}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(qrUrl, '_blank')
    }
  }

  const handlePrint = () => {
    const size = LABEL_SIZES[selectedSize]
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
    const productUrl = `${appUrl}/product/${product.id}`
    const qrSmall = `https://api.qrserver.com/v1/create-qr-code/?size=${size.qrPx * 4}x${size.qrPx * 4}&data=${encodeURIComponent(productUrl)}&margin=8&format=png`

    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html><html dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>لاصقة: ${product.name}</title>
        <style>
          @page { size: ${size.w} ${size.h}; margin: 0; }
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family: Tahoma, Arial, sans-serif; background:#fff; }
          .label {
            width:${size.w}; height:${size.h};
            display:flex; align-items:center;
            border:0.3mm dashed #ccc;
            padding:2mm; gap:2mm; overflow:hidden;
          }
          .qr img { display:block; width:${size.qrPx}px; height:${size.qrPx}px; }
          .info { flex:1; overflow:hidden; }
          .name { font-size:7.5px; font-weight:bold; color:#111; line-height:1.4; margin-bottom:1.5mm; word-break:break-word; }
          .meta { font-size:6px; color:#555; line-height:1.6; }
          .meta span { display:block; }
          .id { font-family:monospace; font-size:6px; color:#999; margin-top:1mm; }
          @media print { body { -webkit-print-color-adjust:exact; } }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="qr"><img src="${qrSmall}" /></div>
          <div class="info">
            <div class="name">${product.name}</div>
            <div class="meta">
              ${product.purchase_date ? `<span>الشراء: ${product.purchase_date}</span>` : ''}
              ${product.warranty_date ? `<span>الضمان حتى: ${product.warranty_date}</span>` : ''}
              ${product.store ? `<span>${product.store}</span>` : ''}
            </div>
            <div class="id">#${product.id}</div>
          </div>
        </div>
        <script>window.onload=()=>{setTimeout(()=>window.print(),800)}<\/script>
      </body></html>
    `)
    win.document.close()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <p className="text-xs text-gray-400 font-mono mb-0.5">#{product.id}</p>
          <h3 className="font-bold text-gray-900 text-lg leading-tight">{product.name}</h3>
        </div>

        <div className="px-6 py-5 flex flex-col items-center">
          <div className="p-3 bg-white border-2 border-gray-100 rounded-2xl shadow-inner mb-2">
            <img src={qrUrl} alt="QR Code" className="w-48 h-48" crossOrigin="anonymous" />
          </div>
          <p className="text-xs text-gray-400 text-center">يفتح صفحة المنتج مباشرة عند المسح</p>
        </div>

        <div className="px-6 pb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">حجم اللاصقة</p>
          <div className="flex gap-2">
            {LABEL_SIZES.map((s, i) => (
              <button key={s.name} onClick={() => setSelectedSize(i)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedSize === i ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pb-4 grid grid-cols-2 gap-2">
          <button onClick={handleDownload}
            className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            حفظ QR
          </button>
          <button onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            طباعة لاصقة
          </button>
        </div>

        <div className="px-6 pb-5">
          <button onClick={onClose} className="w-full py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">إغلاق</button>
        </div>
      </div>
    </div>
  )
}
