import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { InvoiceSheet } from './types.js'
import { SAMPLE_PDF_BASE64 } from './sample-pdf.js'

const dir = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures')

export function loadSamplePdf(): Buffer {
  return Buffer.from(SAMPLE_PDF_BASE64, 'base64')
}

export function loadExpectedSheet(): InvoiceSheet {
  return JSON.parse(readFileSync(join(dir, 'sample-invoice.expected.json'), 'utf8')) as InvoiceSheet
}
