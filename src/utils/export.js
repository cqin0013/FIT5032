// src/utils/export.js
export function exportToCSV(filename, rows, columns) {
  const header = columns.join(',')
  const body = rows.map(r => columns.map(c => safe(String(r[c] ?? ''))).join(',')).join('\n')
  const csv = header + '\n' + body
  download(filename.endsWith('.csv')?filename:filename+'.csv', csv, 'text/csv;charset=utf-8;')
}

export function exportToJSON(filename, rows) {
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })
  trigger(filename.endsWith('.json')?filename:filename+'.json', blob)
}

export async function exportToPDF(filename, columns, rows) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  doc.setFontSize(12)
  let y = 10
  doc.text(filename, 10, y); y += 8
  doc.setFontSize(10)
  doc.text(columns.join(' | '), 10, y); y += 6
  doc.line(10, y, 200, y); y += 6
  rows.forEach(r => {
    const line = columns.map(c => String(r[c] ?? '')).join(' | ')
    const split = doc.splitTextToSize(line, 190)
    doc.text(split, 10, y)
    y += 6 * split.length
    if (y > 280) { doc.addPage(); y = 10 }
  })
  doc.save(filename.endsWith('.pdf')?filename:filename+'.pdf')
}

// helpers
function safe(s){return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}
function download(name, data, mime){
  const blob = new Blob([data], { type: mime })
  trigger(name, blob)
}
function trigger(name, blob){
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name; a.click()
  URL.revokeObjectURL(url)
}
