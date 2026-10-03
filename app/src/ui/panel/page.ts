import { STOCK_PRICE_PHRASE, type Quote } from '../../quote/types.js'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function quoteTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(d)
}

export function renderPanel(quote: Quote | null, error: string | null): string {
  const result = quote
    ? `<p class="symbol">${esc(quote.ticker)}</p>
      <p class="price">${esc(quote.price)}</p>
      <time class="when" datetime="${esc(quote.quotedAt)}">${esc(quoteTime(quote.quotedAt))}</time>
      <p class="use">use ${quote.use}</p>`
    : ''
  const err = error ? `<p class="error">${esc(error)}</p>` : ''
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(STOCK_PRICE_PHRASE)}</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    html, body { height: 100%; margin: 0; }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #10140f;
      color: #f3f0e7;
      font-family: Georgia, "Iowan Old Style", Palatino, serif;
    }
    main {
      width: min(28rem, calc(100% - 2rem));
      text-align: center;
    }
    h1 {
      margin: 0 0 1.25rem;
      font-size: 1.05rem;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: lowercase;
      color: #c8c2b4;
    }
    form { display: flex; gap: 0.5rem; }
    input, button {
      font: inherit;
      border-radius: 999px;
      border: 1px solid #3a4034;
    }
    input {
      flex: 1;
      min-width: 0;
      padding: 0.7rem 1rem;
      background: #181d16;
      color: #f3f0e7;
      font-size: 1rem;
      text-align: center;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    input:focus { outline: 2px solid #d6ff4a; outline-offset: 2px; }
    button {
      padding: 0.7rem 1rem;
      background: #d6ff4a;
      color: #10140f;
      font-size: 0.95rem;
      cursor: pointer;
    }
    .error { margin: 1rem 0 0; color: #ffb4a2; font-size: 0.95rem; }
    .symbol {
      margin: 1.75rem 0 0;
      font-size: 0.85rem;
      letter-spacing: 0.16em;
      color: #c8c2b4;
    }
    .price {
      margin: 0.15rem 0 0;
      font-size: clamp(4.5rem, 16vw, 7.5rem);
      line-height: 0.9;
      font-weight: 500;
      letter-spacing: -0.04em;
    }
    .when {
      display: block;
      margin-top: 0.65rem;
      font-size: 0.95rem;
      color: #c8c2b4;
    }
    .sr {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
    }
    .use {
      margin: 1.25rem 0 0;
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      color: #8d887c;
    }
  </style>
</head>
<body>
  <main>
    <h1>${esc(STOCK_PRICE_PHRASE)}</h1>
    <form method="post" action="/quote">
      <label class="sr" for="ticker">Ticker</label>
      <input id="ticker" name="ticker" autocomplete="off" placeholder="Ticker" required>
      <button type="submit">Look up</button>
    </form>
    ${err}
    ${result}
  </main>
</body>
</html>`
}
