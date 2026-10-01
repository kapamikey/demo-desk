import { INVOICE_CSV_HEADER, type InvoiceSheet } from './types.js'

function cell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

/** CSV of the sheet. Header is fixed. Body is the same rows in the same order. */
export function sheetToCsv(sheet: InvoiceSheet): string {
  const lines: string[] = [INVOICE_CSV_HEADER]
  for (const row of sheet.rows) {
    lines.push([row.date, row.supplier, row.amount, row.tax].map(cell).join(','))
  }
  return lines.join('\n') + '\n'
}
