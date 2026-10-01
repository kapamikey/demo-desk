import { PDFDocument, StandardFonts } from 'pdf-lib'

/** One labeled line, as it is printed on the invoice. */
export function invoiceLines(rows: { date: string; supplier: string; amount: string; tax: string }[]): string[] {
  const lines = ['INVOICE']
  for (const row of rows) {
    lines.push(`Date: ${row.date}`)
    lines.push(`Supplier: ${row.supplier}`)
    lines.push(`Amount: ${row.amount}`)
    lines.push(`Tax: ${row.tax}`)
  }
  return lines
}

export async function drawInvoicePdf(lines: string[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([612, 792])
  const font = await doc.embedFont(StandardFonts.Helvetica)
  let y = 720
  for (const line of lines) {
    page.drawText(line, { x: 72, y, size: 14, font })
    y -= 24
  }
  return doc.save()
}
