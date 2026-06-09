import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  // Security: only allow Vercel Cron
  const authHeader = req.headers['authorization']
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const today = new Date()
  const in30 = new Date(today); in30.setDate(today.getDate() + 30)
  const in7  = new Date(today); in7.setDate(today.getDate() + 7)
  const in1  = new Date(today); in1.setDate(today.getDate() + 1)

  const fmt = (d) => d.toISOString().split('T')[0]

  // Get products with warranty expiring in 30, 7, or 1 day
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, warranty_date, store, purchase_date')
    .in('warranty_date', [fmt(in30), fmt(in7), fmt(in1)])

  if (error) return res.status(500).json({ error: error.message })
  if (!products?.length) return res.status(200).json({ sent: 0 })

  // Group by days left
  const group = (days) => products.filter(p => p.warranty_date === fmt(
    days === 30 ? in30 : days === 7 ? in7 : in1
  ))

  const rows = (list) => list.map(p => `
    <tr style="border-bottom:1px solid #eee">
      <td style="padding:10px 12px;font-weight:600">${p.name}</td>
      <td style="padding:10px 12px;color:#666">${p.store || '—'}</td>
      <td style="padding:10px 12px;color:#666">${p.warranty_date}</td>
    </tr>
  `).join('')

  const section = (title, color, list) => list.length ? `
    <h3 style="color:${color};margin:24px 0 8px">${title}</h3>
    <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #eee">
      <thead><tr style="background:#f8f8f8">
        <th style="padding:10px 12px;text-align:right;font-size:13px;color:#888">المنتج</th>
        <th style="padding:10px 12px;text-align:right;font-size:13px;color:#888">المتجر</th>
        <th style="padding:10px 12px;text-align:right;font-size:13px;color:#888">تاريخ الانتهاء</th>
      </tr></thead>
      <tbody>${rows(list)}</tbody>
    </table>
  ` : ''

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        <div style="background:#111;padding:20px 24px;display:flex;align-items:center;gap:12px">
          <span style="color:#fff;font-size:20px;font-weight:900">Fahad Alfhaid</span>
          <span style="color:#888;font-size:13px">— تنبيه انتهاء الضمان</span>
        </div>
        <div style="padding:24px">
          <p style="color:#333;font-size:15px;margin:0 0 16px">
            لديك <strong>${products.length} منتج</strong> ضمانهم على وشك الانتهاء:
          </p>
          ${section('⚠️ ينتهي غداً', '#E24B4A', group(1))}
          ${section('🔔 ينتهي خلال 7 أيام', '#EF9F27', group(7))}
          ${section('📅 ينتهي خلال 30 يوم', '#1D9E75', group(30))}
          <div style="margin-top:24px;text-align:center">
            <a href="${process.env.VITE_APP_URL}" 
               style="background:#111;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
              افتح لوحة التحكم
            </a>
          </div>
        </div>
        <div style="background:#f8f8f8;padding:12px 24px;text-align:center">
          <p style="color:#aaa;font-size:12px;margin:0">Fahad Alfhaid — Product Vault 2026</p>
        </div>
      </div>
    </body>
    </html>
  `

  await resend.emails.send({
    from: 'Product Vault <onboarding@resend.dev>',
    to: 'alfehaid2@gmail.com',
    subject: `⚠️ تنبيه: ${products.length} منتج ضمانهم ينتهي قريباً`,
    html,
  })

  return res.status(200).json({ sent: products.length })
}
