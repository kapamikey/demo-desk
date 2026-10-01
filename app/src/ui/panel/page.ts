import { PDF_TO_EXCEL_PHRASE, type InvoiceSheet } from '../../invoice/types.js'
import { sheetToCsv } from '../../invoice/csv.js'

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function renderPanel(sheet: InvoiceSheet | null, error: string | null): string {
  const rows = sheet
    ? sheet.rows
        .map(
          (r) =>
            `<tr><td>${esc(r.date)}</td><td>${esc(r.supplier)}</td><td>${esc(r.amount)}</td><td>${esc(r.tax)}</td></tr>`,
        )
        .join('')
    : ''
  const csvHref = sheet
    ? `data:text/csv;charset=utf-8,${encodeURIComponent(sheetToCsv(sheet))}`
    : ''
  const table = sheet
    ? `<table>
        <thead><tr><th>date</th><th>supplier</th><th>amount</th><th>tax</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p><a download="invoice.csv" href="${csvHref}">Download CSV</a></p>`
    : ''
  const err = error ? `<p>${esc(error)}</p>` : ''
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${esc(PDF_TO_EXCEL_PHRASE)}</title>
</head>
<body>
  <h1>${esc(PDF_TO_EXCEL_PHRASE)}</h1>
  <p>Turn a PDF invoice into a sheet you can check: date, supplier, amount, and tax.</p>
  <form method="post" action="/invoice">
    <button type="submit" name="sample" value="1">Use the sample invoice</button>
  </form>
  <form method="post" action="/invoice" enctype="multipart/form-data">
    <label>PDF invoice <input type="file" name="pdf" accept="application/pdf" required></label>
    <button type="submit">Upload</button>
  </form>
  ${err}
  ${table}
</body>
</html>`
}
