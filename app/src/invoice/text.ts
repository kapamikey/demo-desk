type TextItem = { str: string; transform: number[] }

export async function pdfToLines(data: Uint8Array): Promise<string[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const doc = await pdfjs.getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: false,
  }).promise

  const items: { x: number; y: number; str: string }[] = []
  try {
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const content = await page.getTextContent()
      for (const item of content.items) {
        if (!item || typeof item !== 'object' || !('str' in item)) continue
        const text = item as TextItem
        if (!text.str) continue
        items.push({ x: text.transform[4] ?? 0, y: text.transform[5] ?? 0, str: text.str })
      }
    }
  } finally {
    await doc.destroy()
  }

  const groups: { y: number; parts: { x: number; str: string }[] }[] = []
  for (const item of items) {
    const group = groups.find((g) => Math.abs(g.y - item.y) < 2)
    if (group) group.parts.push({ x: item.x, str: item.str })
    else groups.push({ y: item.y, parts: [{ x: item.x, str: item.str }] })
  }
  groups.sort((a, b) => b.y - a.y)
  return groups.map((g) =>
    g.parts
      .sort((a, b) => a.x - b.x)
      .map((p) => p.str)
      .join('')
      .trim(),
  )
}
