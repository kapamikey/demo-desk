import { getDb, requireServiceRole } from '../db/client.js'
import type { Quote } from './types.js'

export async function recordQuote(row: { ticker: string; price: string; quotedAt: string }): Promise<Quote> {
  requireServiceRole()
  const db = getDb()
  const inserted = await db.from('quote_log').insert({
    ticker: row.ticker,
    price: row.price,
    quoted_at: row.quotedAt,
  })
  if (inserted.error) throw new Error('quote log failed')
  const counted = await db.from('quote_log').select('*', { count: 'exact', head: true })
  if (counted.error || counted.count == null) throw new Error('quote log failed')
  return { ticker: row.ticker, price: row.price, quotedAt: row.quotedAt, use: counted.count }
}
