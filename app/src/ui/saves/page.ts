import type { Demo, SavedItem } from '../../types.js'
import { escapeHtml, layout } from '../layout.js'

export function renderSaves(
  items: SavedItem[],
  demosById: Map<string, Demo>,
  query: { tag?: string; noteContains?: string },
): string {
  const rows = items
    .map((s) => {
      const d = demosById.get(s.demoId)
      const title = d ? d.possibility : s.demoId
      return `<tr>
  <td><a href="/demos/${escapeHtml(s.demoId)}">${escapeHtml(title)}</a></td>
  <td>${escapeHtml(s.tags.join(', ') || '—')}</td>
  <td>${escapeHtml(s.note || '—')}</td>
  <td>
    <form style="display:inline" method="post" action="/saves/${escapeHtml(s.id)}/delete" onsubmit="return confirm('Remove?')">
      <button class="danger" type="submit">Remove</button>
    </form>
  </td>
</tr>`
    })
    .join('\n')

  const body = `
<h1>Saves</h1>
<form method="get" action="/saves">
  <label>Tag<input name="tag" value="${escapeHtml(query.tag ?? '')}" placeholder="exact tag" /></label>
  <label>Note contains<input name="noteContains" value="${escapeHtml(query.noteContains ?? '')}" /></label>
  <button type="submit">Find</button>
  <a class="btn secondary" href="/saves">Clear</a>
</form>
<table>
  <thead><tr><th>Demo</th><th>Tags</th><th>Note</th><th></th></tr></thead>
  <tbody>${rows || '<tr><td colspan="4" class="muted">No saves match.</td></tr>'}</tbody>
</table>`

  return layout('Saves', body, { nav: 'admin' })
}
