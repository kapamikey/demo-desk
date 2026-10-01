import { sheetFromLines } from './sheet.js'
import { pdfToLines } from './text.js'
import type { InvoiceSheet } from './types.js'

export async function sheetFromPdf(data: Uint8Array): Promise<InvoiceSheet> {
  const bytes = new Uint8Array(data)
  const lines = await pdfToLines(bytes)
  return sheetFromLines(lines)
}
