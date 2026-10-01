import { STOCK_PRICE_PHRASE, type Quote } from '../../quote/types.js'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function renderPanel(quote: Quote | null, error: string | null): string {
  const result = quote
    ? `<dl>
        <dt>ticker</dt><dd>${esc(quote.ticker)}</dd>
        <dt>price</dt><dd>${esc(quote.price)}</dd>
        <dt>quotedAt</dt><dd>${esc(quote.quotedAt)}</dd>
        <dt>use</dt><dd>${quote.use}</dd>
      </dl>`
    : ''
  const err = error ? `<p>${esc(error)}</p>` : ''
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${esc(STOCK_PRICE_PHRASE)}</title>
</head>
<body>
  <h1>${esc(STOCK_PRICE_PHRASE)}</h1>
  <p>Ask what a ticker is worth and get the latest stock price.</p>
  <form method="post" action="/quote">
    <label>Ticker <input name="ticker" autocomplete="off" required></label>
    <button type="submit">Get the stock price</button>
  </form>
  ${err}
  ${result}
</body>
</html>`
}
