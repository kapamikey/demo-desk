import type { InvoiceLine, InvoiceSheet } from './types.js'

const LABEL = /^(Date|Supplier|Amount|Tax):\s*(.+)$/

export class InvoiceParseError extends Error {
  constructor(message: string) {
    super(message)
  }
}

/** Turn printed invoice lines into a sheet. Values stay strings, as printed. */
export function sheetFromLines(lines: string[]): InvoiceSheet {
  const rows: InvoiceLine[] = []
  let cur: Partial<InvoiceLine> = {}

  const flush = () => {
    if (!cur.date || !cur.supplier || !cur.amount || !cur.tax) {
      throw new InvoiceParseError('Invoice row is missing date, supplier, amount, or tax')
    }
    rows.push({
      date: cur.date,
      supplier: cur.supplier,
      amount: cur.amount,
      tax: cur.tax,
    })
    cur = {}
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    const match = line.match(LABEL)
    if (!match) continue
    const key = match[1].toLowerCase() as keyof InvoiceLine
    const value = match[2].trim()
    if (!value) throw new InvoiceParseError(`Empty ${key}`)
    if (cur[key]) flush()
    cur[key] = value
    if (cur.date && cur.supplier && cur.amount && cur.tax) flush()
  }

  if (cur.date || cur.supplier || cur.amount || cur.tax) flush()
  if (rows.length === 0) {
    throw new InvoiceParseError('Not an invoice. Need date, supplier, amount, and tax.')
  }
  return { rows }
}
