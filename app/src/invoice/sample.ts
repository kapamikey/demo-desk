import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { InvoiceSheet } from './types.js'

const dir = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures')

export function samplePdfPath(): string {
  return join(dir, 'sample-invoice.pdf')
}

export function loadSamplePdf(): Buffer {
  return readFileSync(samplePdfPath())
}

export function loadExpectedSheet(): InvoiceSheet {
  return JSON.parse(readFileSync(join(dir, 'sample-invoice.expected.json'), 'utf8')) as InvoiceSheet
}
