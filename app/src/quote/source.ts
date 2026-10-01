import type { Ticker } from './types.js'

export class QuoteMiss extends Error {
  constructor() {
    super('no quote')
    this.name = 'QuoteMiss'
  }
}

type YahooMeta = {
  regularMarketPrice?: unknown
  regularMarketTime?: unknown
}

export function normalizeTicker(raw: string): Ticker {
  return raw.trim().toUpperCase()
}

export function isTicker(ticker: string): boolean {
  return /^[A-Z][A-Z0-9.-]{0,9}$/.test(ticker)
}

function decimalString(n: number): string {
  const s = String(n)
  if (!s.includes('e') && !s.includes('E')) return s
  return n.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
}

export async function fetchQuote(ticker: Ticker): Promise<{ ticker: Ticker; price: string; quotedAt: string }> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`
  let body: { chart?: { result?: Array<{ meta?: YahooMeta } | null> | null } }
  try {
    const res = await fetch(url, {
      headers: { accept: 'application/json', 'user-agent': 'Mozilla/5.0' },
    })
    if (!res.ok) throw new QuoteMiss()
    body = (await res.json()) as typeof body
  } catch (e) {
    if (e instanceof QuoteMiss) throw e
    throw new QuoteMiss()
  }
  const meta = body.chart?.result?.[0]?.meta
  const price = meta?.regularMarketPrice
  const quoted = meta?.regularMarketTime
  if (typeof price !== 'number' || !Number.isFinite(price) || typeof quoted !== 'number' || !Number.isFinite(quoted)) {
    throw new QuoteMiss()
  }
  return {
    ticker,
    price: decimalString(price),
    quotedAt: new Date(quoted * 1000).toISOString(),
  }
}
