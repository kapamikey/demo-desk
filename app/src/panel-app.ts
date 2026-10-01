import express from 'express'
import { recordQuote } from './quote/log.js'
import { QuoteMiss, fetchQuote, isTicker, normalizeTicker } from './quote/source.js'
import { STOCK_PRICE_PHRASE, type Quote } from './quote/types.js'
import { renderPanel } from './ui/panel/page.js'

const app = express()
app.set('trust proxy', 1)
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

function wantsJson(req: express.Request): boolean {
  return req.query.format === 'json' || (req.get('accept') || '').includes('application/json')
}

function tickerFrom(req: express.Request): string {
  const raw = req.method === 'GET' ? req.query.ticker : (req.body?.ticker ?? req.query.ticker)
  return normalizeTicker(typeof raw === 'string' ? raw : '')
}

function sendQuote(req: express.Request, res: express.Response, quote: Quote) {
  if (wantsJson(req)) {
    res.json(quote)
    return
  }
  res.type('html').send(renderPanel(quote, null))
}

function sendFail(req: express.Request, res: express.Response, e: unknown) {
  const status =
    e instanceof QuoteMiss ? 404 : e && typeof e === 'object' && 'status' in e && typeof (e as { status: unknown }).status === 'number'
      ? (e as { status: number }).status
      : 500
  const message = e instanceof QuoteMiss ? e.message : status === 400 ? 'ticker is required' : 'Something went wrong'
  if (!(e instanceof QuoteMiss) && status !== 400) console.error(e)
  if (wantsJson(req)) res.status(status).json({ error: message })
  else res.status(status).type('html').send(renderPanel(null, message))
}

async function quote(req: express.Request, res: express.Response) {
  try {
    const ticker = tickerFrom(req)
    if (!isTicker(ticker)) {
      const err = new Error('ticker is required')
      ;(err as Error & { status: number }).status = 400
      throw err
    }
    const fresh = await fetchQuote(ticker)
    const saved = await recordQuote(fresh)
    sendQuote(req, res, saved)
  } catch (e) {
    sendFail(req, res, e)
  }
}

app.get('/', (_req, res) => {
  res.type('html').send(renderPanel(null, null))
})

app.get('/health', (_req, res) => {
  res.json({ ok: true, phrase: STOCK_PRICE_PHRASE })
})

app.get('/quote', quote)
app.post('/quote', quote)

export default app
