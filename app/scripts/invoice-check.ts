import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { drawInvoicePdf, invoiceLines } from '../src/invoice/draw.js'
import { sheetToCsv } from '../src/invoice/csv.js'
import type { InvoiceSheet } from '../src/invoice/types.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const expected = JSON.parse(readFileSync(join(root, 'fixtures/sample-invoice.expected.json'), 'utf8')) as InvoiceSheet
const samplePdf = readFileSync(join(root, 'fixtures/sample-invoice.pdf'))
const port = 3467
const base = `http://127.0.0.1:${port}`

const child = spawn('npx', ['tsx', 'src/server.ts'], {
  cwd: root,
  env: { ...process.env, PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe'],
})

function fail(msg: string): never {
  child.kill()
  console.error('FAIL', msg)
  process.exit(1)
}

async function waitForHealth() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${base}/health`)
      if (res.ok) return
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 150))
  }
  fail('server did not start')
}

await waitForHealth()

const home = await fetch(base + '/')
const homeHtml = await home.text()
if (home.status !== 200) fail('home status ' + home.status)
if (!homeHtml.includes('pdf to excel')) fail('home missing phrase')
if (homeHtml.toLowerCase().includes('demo desk') && homeHtml.includes('replicable')) fail('feed still on home')

const sample = await fetch(base + '/invoice?format=json', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: 'sample=1',
})
const sheet = (await sample.json()) as InvoiceSheet
if (sample.status !== 200) fail('sample status ' + sample.status + ' ' + JSON.stringify(sheet))
if (JSON.stringify(sheet) !== JSON.stringify(expected)) {
  fail('sheet mismatch ' + JSON.stringify(sheet))
}

const csvRes = await fetch(base + '/invoice/sample.csv')
const csv = await csvRes.text()
const wantCsv = sheetToCsv(expected)
if (csv !== wantCsv) fail('csv mismatch\n' + csv + '\n---\n' + wantCsv)

const second: InvoiceSheet = {
  rows: [{ date: '2026-04-02', supplier: 'Harbor Glass', amount: '$210.50', tax: '$16.84' }],
}
const secondPdf = Buffer.from(await drawInvoicePdf(invoiceLines(second.rows)))
const form = new FormData()
form.set('pdf', new Blob([secondPdf], { type: 'application/pdf' }), 'second.pdf')
const secondRes = await fetch(base + '/invoice?format=json', { method: 'POST', body: form })
const secondSheet = (await secondRes.json()) as InvoiceSheet
if (secondRes.status !== 200) fail('second status ' + secondRes.status + ' ' + JSON.stringify(secondSheet))
if (JSON.stringify(secondSheet) !== JSON.stringify(second)) fail('second mismatch ' + JSON.stringify(secondSheet))

const again = await fetch(base + '/invoice?format=json', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: 'sample=1',
})
const againSheet = await again.json()
if (JSON.stringify(againSheet) !== JSON.stringify(expected)) fail('second sample use failed')

const oldFeed = await fetch(base + '/api/demos')
if (oldFeed.status !== 404) fail('old feed still served ' + oldFeed.status)

const demoPage = await fetch(base + '/demos/57d88380-f978-4773-b36d-e5104e764fcc')
if (demoPage.status !== 404) fail('demo page still served ' + demoPage.status)

child.kill()
console.log('INVOICE OK')
console.log('rows', expected.rows.length)
console.log('csv', wantCsv.trim())
void samplePdf

process.exit(0)
