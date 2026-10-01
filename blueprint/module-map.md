# demo desk — invoice panel (current)

replaces the wave 1 feed. stack stays the app at `/workspace/demo-desk/app`, deployed to https://demo-desk.vercel.app. no new supabase table. wave 1 tables stay in `pjbdiycmchuiatcpvbws` and are not served.

source: brief lock 2026-09-30. types: `blueprint/invoice.ts`.

## fields

one sheet. each row is four strings, as printed on the invoice (no float compare):

- `date`
- `supplier`
- `amount`
- `tax`

csv header is exactly `date,supplier,amount,tax`. body is the same rows in the same order.

the sample is two files forge writes from one invoice: `app/fixtures/sample-invoice.pdf` and `app/fixtures/sample-invoice.expected.json` (`InvoiceSheet`). the sheet must equal that json. blueprint does not invent the numbers.

## modules

| module | owns | does not own |
| --- | --- | --- |
| `invoice/sample` | the fixture pdf + expected json | parsing rules for other pdfs |
| `invoice/sheet` | turn the sample, or one uploaded invoice pdf, into `InvoiceSheet` | accounts, history, tax math |
| `invoice/csv` | download of the current sheet, same rows | a second store |
| `ui/panel` | the only page. sample action, upload, the sheet, the csv link. visible copy includes the exact phrase `pdf to excel` | the demo feed |

## dependency direction

```
ui/panel → invoice/sheet | invoice/csv | invoice/sample
```

no db. no auth. ui never talks sql.

## acceptance → module

1. panel replaces the demo feed at `/` → `ui/panel` (feed routes gone)
2. sample produces date, supplier, amount, tax matching the fixture → `invoice/sample` + `invoice/sheet`
3. csv contains the same rows → `invoice/csv`
4. a second invoice pdf returns rows with no re-setup → `invoice/sheet` on upload, no account
5. the description uses `pdf to excel` → copy in `ui/panel`

## out

stripe · in-chat checkout · accounts · any pdf that is not an invoice · chatgpt directory submission (needs michael's account; the phrase lives on the page) · dropping wave 1 supabase tables · scout ingest

## forge fill order

1. fixture pdf + expected json
2. `ui/panel` at `/`, feed not served
3. sample action fills the sheet
4. csv download of that sheet
5. second invoice upload replaces the sheet
6. deploy to https://demo-desk.vercel.app

## retired

wave 1 demo feed, search rules, and saves are not in this mvp. contract for that lock remains in `blueprint/types.ts`, `blueprint/schema.sql`, and `blueprint/migrations/`. do not build it further.
