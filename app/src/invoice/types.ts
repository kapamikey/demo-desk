/** Matches blueprint/invoice.ts. Strings as printed, so a match is not a float compare. */
export type InvoiceLine = {
  date: string
  supplier: string
  amount: string
  tax: string
}

export type InvoiceSheet = {
  rows: InvoiceLine[]
}

export const INVOICE_CSV_HEADER = 'date,supplier,amount,tax' as const

export const PDF_TO_EXCEL_PHRASE = 'pdf to excel' as const
