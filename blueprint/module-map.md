# demo desk — stock price (current)

replaces the invoice panel. app stays `/workspace/demo-desk/app`, live at https://demo-desk.vercel.app.

source: brief lock 2026-10-01. types: `blueprint/quote.ts`. sql: `blueprint/migrations/004_quote_log.sql`.

## fields

one quote:

- `ticker` — uppercase symbol
- `price` — `regularMarketPrice` from yahoo chart v8, as a decimal string
- `quotedAt` — that result's `regularMarketTime`, as ISO
- `use` — count of `quote_log` rows after this successful quote

a missing yahoo result is not a quote. no row, use unchanged.

## modules

| module | owns | does not own |
| --- | --- | --- |
| `quote/source` | one GET to yahoo chart v8 for the ticker | a second vendor, history, change, volume |
| `quote/log` | insert one `quote_log` row on success, return the count | accounts, failed lookups |
| `ui/panel` | the only page. a ticker in, the quote out. visible copy includes the exact phrase `stock price` | invoices, the demo feed |

## dependency direction

```
ui/panel → quote/source → quote/log → db → supabase pjbdiycmchuiatcpvbws
```

no auth. ui never talks sql.

## acceptance → module

1. the description uses `stock price` → copy in `ui/panel`
2. asking what a ticker is worth returns its latest price → `quote/source`
3. a second ticker returns its own price, no account, no re-setup → a new call, no saved ticker
4. one successful quote counts as one use → one `quote_log` row, `use` on the response

## out

stripe · accounts · the invoice panel · chatgpt directory submission (needs michael's account; the phrase lives on the page) · any field besides ticker, price, quotedAt, use · dropping wave 1 tables

## forge fill order

1. apply `004_quote_log.sql` on `pjbdiycmchuiatcpvbws`
2. `quote/source` + `quote/log`
3. `ui/panel` at `/`, invoice panel not served
4. deploy to https://demo-desk.vercel.app

## retired

invoice panel (`blueprint/invoice.ts`) and the wave 1 demo feed. do not build either further. wave 1 tables stay.
