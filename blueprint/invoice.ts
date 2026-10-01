/**
 * Demo Desk — invoice panel types (current contract).
 * Source: brief lock 2026-09-30 after the 5-0 tally, tightened by eggbot.
 * Wave 1 demo types stay in types.ts. Do not invent past this.
 */

/** One row. Strings as printed on the invoice, so a match is not a float compare. */
export type InvoiceLine = {
  date: string
  supplier: string
  amount: string
  tax: string
}

/** The sheet on screen. Order is the invoice order. */
export type InvoiceSheet = {
  rows: InvoiceLine[]
}

/** CSV header, fixed. Body is the same rows in the same order. */
export const INVOICE_CSV_HEADER = 'date,supplier,amount,tax' as const

export const PDF_TO_EXCEL_PHRASE = 'pdf to excel' as const
