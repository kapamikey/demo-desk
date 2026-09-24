import type { Demo, SavedItem } from '../../types.js'
import { escapeHtml, layout } from '../layout.js'

function formatTags(tags: string[]): string {
  if (!tags.length) return '—'
  return tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join(' ')
}

function linkOrDash(url: string | null | undefined, empty = '—'): string {
  if (!url) return empty
  return `<a href="${escapeHtml(url)}" rel="noopener noreferrer" target="_blank">${escapeHtml(url)}</a>`
}

export function renderDemoDetail(
  demo: Demo,
  opts?: { saved?: SavedItem | null; operator?: boolean; error?: string },
): string {
  const d = demo
  let saveForm = ''
  if (opts?.operator) {
    const s = opts.saved
    saveForm = `
<h2>Save / tag / note</h2>
${opts.error ? `<div class="err">${escapeHtml(opts.error)}</div>` : ''}
<form method="post" action="/saves">
  <input type="hidden" name="demoId" value="${escapeHtml(d.id)}" />
  ${s ? `<input type="hidden" name="savedId" value="${escapeHtml(s.id)}" />` : ''}
  <label>Tags (comma-separated)<input name="tags" value="${escapeHtml((s?.tags ?? []).join(', '))}" /></label>
  <label>Note<textarea name="note">${escapeHtml(s?.note ?? '')}</textarea></label>
  <button type="submit">${s ? 'Update save' : 'Save'}</button>
</form>
${s ? `<form method="post" action="/saves/${escapeHtml(s.id)}/delete" onsubmit="return confirm('Remove save?')"><button class="danger" type="submit">Remove save</button></form>` : ''}
<p class="muted"><a href="/saves">Find saves</a></p>`
  }

  const h = d.howThisWorks
  const e = d.evidence

  const body = `
<h1>${escapeHtml(d.possibility)}</h1>
<div class="card">
  <div class="label">Tool credit</div>
  <div>${escapeHtml(d.toolCredit)}</div>
  <div class="label">Possibility</div>
  <div>${escapeHtml(d.possibility)}</div>
  <div class="label">Source</div>
  <div>${escapeHtml(d.source || '—')} · ${linkOrDash(d.sourceUrl)}</div>
  <div class="label">Medium</div>
  <div>${escapeHtml(d.medium || '—')}</div>
  <div class="label">Media</div>
  <div>${d.mediaUrl ? linkOrDash(d.mediaUrl) : '<span class="muted">No media</span>'}</div>
  <div class="label">Remix uses</div>
  <div class="remix">1. ${escapeHtml(d.remixUses[0])}</div>
  <div class="remix">2. ${escapeHtml(d.remixUses[1])}</div>
  <div class="remix">3. ${escapeHtml(d.remixUses[2])}</div>
  <div class="label">Evidence</div>
  <div class="evidence">${escapeHtml(d.evidenceLabel)}</div>
  <div class="label">Evidence expansion</div>
  <div><strong>What is shown:</strong> ${escapeHtml(e.whatIsShown || '—')}</div>
  <div><strong>What creator reports:</strong> ${escapeHtml(e.whatCreatorReports || '—')}</div>
  <div><strong>What remains uncertain:</strong> ${escapeHtml(e.whatRemainsUncertain || '—')}</div>
  <div><strong>Instructions &amp; checks:</strong> ${escapeHtml(e.instructionsAndChecks || '—')}</div>
  <div><strong>Resources checked:</strong> ${escapeHtml(e.resourcesCheckedDate || '—')}</div>
  <div class="label">How this works</div>
  <div><strong>What changed:</strong> ${escapeHtml(h.whatChanged || '—')}</div>
  <div><strong>What made it work:</strong> ${escapeHtml(h.whatMadeItWork || '—')}</div>
  <div><strong>What can I borrow:</strong> ${escapeHtml(h.whatCanIBorrow || '—')}</div>
  <div><strong>What remains uncertain:</strong> ${escapeHtml(h.whatRemainsUncertain || '—')}</div>
  <div class="label">Categories</div>
  <div>${formatTags(d.categories)}</div>
  <div class="label">Replicable result</div>
  <div>${d.replicableResult ? 'yes' : 'no'}</div>
  <div class="label">Created</div>
  <div>${escapeHtml(d.createdAt)}</div>
  <div class="label">Updated</div>
  <div>${escapeHtml(d.updatedAt)}</div>
</div>
<p class="muted"><a href="/">← Feed</a></p>
${saveForm}`

  return layout(d.possibility, body, { nav: opts?.operator ? 'admin' : 'public' })
}

export function renderNotFound(): string {
  return layout('Not found', `<h1>Not found</h1><p><a href="/">Feed</a></p>`)
}
