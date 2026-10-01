/**
 * Demo Desk — stock price quote (current contract).
 * Source: brief lock 2026-10-01. Invoice panel is dead.
 * Do not invent past this.
 */

/** US ticker, stored uppercase. The yahoo symbol is the ticker. */
export type Ticker = string

/** One successful quote. price is the source number as a decimal string. */
export type Quote = {
  ticker: Ticker
  price: string
  quotedAt: string // ISO from the source's regularMarketTime
  use: number // count of successful quotes after this one
}

export const STOCK_PRICE_PHRASE = 'stock price' as const

/**
 * Source, locked so prove can check the same field:
 * GET https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1d&range=1d
 * price = chart.result[0].meta.regularMarketPrice
 * quotedAt = chart.result[0].meta.regularMarketTime (unix seconds → ISO)
 * A missing result is not a quote and does not count as a use.
 */
export const QUOTE_SOURCE = 'yahoo-chart-v8' as const
