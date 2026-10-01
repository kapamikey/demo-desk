import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { drawInvoicePdf, invoiceLines } from '../src/invoice/draw.js'
import type { InvoiceSheet } from '../src/invoice/types.js'

const sheet: InvoiceSheet = {
  rows: [
    { date: '2026-03-14', supplier: 'Northwind Metals', amount: '$840.00', tax: '$67.20' },
    { date: '2026-03-14', supplier: 'Northwind Metals', amount: '$400.00', tax: '$32.00' },
  ],
}

const dir = join(dirname(fileURLToPath(import.meta.url)), '../fixtures')

const pdf = await drawInvoicePdf(invoiceLines(sheet.rows))
writeFileSync(join(dir, 'sample-invoice.pdf'), pdf)
writeFileSync(join(dir, 'sample-invoice.expected.json'), JSON.stringify(sheet, null, 2) + '\n')
console.log('wrote', dir)
