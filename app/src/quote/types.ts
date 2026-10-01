/** Matches blueprint/quote.ts. The app cannot import outside its root. */

export type Ticker = string

export type Quote = {
  ticker: Ticker
  price: string
  quotedAt: string
  use: number
}

export const STOCK_PRICE_PHRASE = 'stock price' as const
