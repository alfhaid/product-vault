export function generateICS(product) {
  const name = product.name
  const warrantyDate = product.warranty_date
  if (!warrantyDate) return null

  const dateStr = warrantyDate.replace(/-/g, '')

  const reminderDate = new Date(warrantyDate)
  reminderDate.setDate(reminderDate.getDate() - 30)
  const reminderStr = reminderDate.toISOString().split('T')[0].replace(/-/g, '')

  const uid = `warranty-${product.id}@fahad-alfhaid`
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fahad Alfhaid//Product Vault//AR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${dateStr}`,
    `DTEND;VALUE=DATE:${dateStr}`,
    `SUMMARY:⚠️ انتهاء ضمان ${name}`,
    `DESCRIPTION:ينتهي ضمان ${name} اليوم.\\nتاريخ الشراء: ${product.purchase_date || '—'}\\nالمتجر: ${product.store || '—'}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER;VALUE=DATE-TIME:' + reminderStr + 'T070000Z',
    'ACTION:DISPLAY',
    `DESCRIPTION:تذكير: ضمان ${name} ينتهي خلال 30 يوم`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return ics
}

export function downloadICS(product) {
  const ics = generateICS(product)
  if (!ics) return
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `warranty-${product.name}.ics`
  a.click()
  URL.revokeObjectURL(url)
}
