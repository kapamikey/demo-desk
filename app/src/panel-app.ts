import express from 'express'
import Busboy from 'busboy'
import { PDF_TO_EXCEL_PHRASE } from './invoice/types.js'
import { sheetToCsv } from './invoice/csv.js'
import { InvoiceParseError } from './invoice/sheet.js'
import { sheetFromPdf } from './invoice/parse.js'
import { loadSamplePdf } from './invoice/sample.js'
import { renderPanel } from './ui/panel/page.js'

const app = express()
app.set('trust proxy', 1)
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

function wantsJson(req: express.Request): boolean {
  return req.query.format === 'json' || (req.get('accept') || '').includes('application/json')
}

function readPdf(req: express.Request): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const bb = Busboy({
      headers: req.headers,
      limits: { files: 1, fileSize: 5 * 1024 * 1024 },
    })
    const chunks: Buffer[] = []
    let tooBig = false
    let sawFile = false
    bb.on('file', (_name, file) => {
      sawFile = true
      file.on('data', (d: Buffer) => chunks.push(d))
      file.on('limit', () => {
        tooBig = true
      })
    })
    bb.on('error', reject)
    bb.on('finish', () => {
      if (tooBig) reject(new InvoiceParseError('PDF is too large'))
      else if (!sawFile || chunks.length === 0) reject(new InvoiceParseError('PDF file is required'))
      else resolve(Buffer.concat(chunks))
    })
    req.pipe(bb)
  })
}

async function pdfFromRequest(req: express.Request): Promise<Buffer> {
  const type = req.get('content-type') || ''
  if (type.includes('multipart/form-data')) return readPdf(req)
  if (String(req.body?.sample ?? '') === '1') return loadSamplePdf()
  throw new InvoiceParseError('Send the sample or upload a PDF invoice')
}

function sendSheet(req: express.Request, res: express.Response, sheet: Awaited<ReturnType<typeof sheetFromPdf>>, asCsv: boolean) {
  if (asCsv) {
    res.type('text/csv').set('Content-Disposition', 'attachment; filename="invoice.csv"').send(sheetToCsv(sheet))
    return
  }
  if (wantsJson(req)) {
    res.json(sheet)
    return
  }
  res.type('html').send(renderPanel(sheet, null))
}

function sendFail(req: express.Request, res: express.Response, e: unknown) {
  const status = e instanceof InvoiceParseError ? 400 : 500
  let message = e instanceof InvoiceParseError ? e.message : 'Something went wrong'
  if (!(e instanceof InvoiceParseError)) {
    console.error(e)
    if (req.query.debug === '1' && e instanceof Error) message = e.message
  }
  if (wantsJson(req)) res.status(status).json({ error: message })
  else res.status(status).type('html').send(renderPanel(null, message))
}

app.get('/', (_req, res) => {
  res.type('html').send(renderPanel(null, null))
})

app.post('/invoice', async (req, res) => {
  try {
    const pdf = await pdfFromRequest(req)
    const sheet = await sheetFromPdf(pdf)
    sendSheet(req, res, sheet, false)
  } catch (e) {
    sendFail(req, res, e)
  }
})

app.post('/invoice.csv', async (req, res) => {
  try {
    const pdf = await pdfFromRequest(req)
    const sheet = await sheetFromPdf(pdf)
    sendSheet(req, res, sheet, true)
  } catch (e) {
    sendFail(req, res, e)
  }
})

app.get('/invoice/sample.csv', async (req, res) => {
  try {
    const sheet = await sheetFromPdf(loadSamplePdf())
    res.type('text/csv').set('Content-Disposition', 'attachment; filename="invoice.csv"').send(sheetToCsv(sheet))
  } catch (e) {
    sendFail(req, res, e)
  }
})

app.get('/health', (_req, res) => {
  res.json({ ok: true, phrase: PDF_TO_EXCEL_PHRASE })
})

export default app
