import type { Demo, DemoListFilter } from '../../types.js'
import { DEMO_CATEGORIES } from '../../types.js'
import { escapeHtml, layout } from '../layout.js'

function formatTags(tags: string[]): string {
  if (!tags.length) return '—'
  return tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join(' ')
}

function mediaBlock(url: string | null): string {
  if (!url) return `<div class="muted">No media</div>`
  return `<div><a href="${escapeHtml(url)}" rel="noopener noreferrer" target="_blank">${escapeHtml(url)}</a></div>`
}

function howBlock(d: Demo): string {
  const h = d.howThisWorks
  return `<div class="how-this-works">
  <div class="label">How this works</div>
  <div><strong>What changed:</strong> ${escapeHtml(h.whatChanged || '—')}</div>
  <div><strong>What made it work:</strong> ${escapeHtml(h.whatMadeItWork || '—')}</div>
  <div><strong>What can I borrow:</strong> ${escapeHtml(h.whatCanIBorrow || '—')}</div>
  <div><strong>What remains uncertain:</strong> ${escapeHtml(h.whatRemainsUncertain || '—')}</div>
</div>`
}

function evidenceExpansionBlock(d: Demo): string {
  const e = d.evidence
  return `<div class="evidence-expansion">
  <div class="label">Evidence expansion</div>
  <div><strong>What is shown:</strong> ${escapeHtml(e.whatIsShown || '—')}</div>
  <div><strong>What creator reports:</strong> ${escapeHtml(e.whatCreatorReports || '—')}</div>
  <div><strong>What remains uncertain:</strong> ${escapeHtml(e.whatRemainsUncertain || '—')}</div>
  <div><strong>Instructions &amp; checks:</strong> ${escapeHtml(e.instructionsAndChecks || '—')}</div>
  <div><strong>Resources checked:</strong> ${escapeHtml(e.resourcesCheckedDate || '—')}</div>
</div>`
}

export function renderFeed(demos: Demo[], filter: DemoListFilter = {}): string {
  const cards =
    demos.length === 0
      ? `<p class="muted">No demos match.</p>`
      : demos
          .map(
            (d) => `<article class="card">
  <h3><a href="/demos/${escapeHtml(d.id)}">${escapeHtml(d.possibility)}</a></h3>
  <div class="label">Tool credit</div>
  <div>${escapeHtml(d.toolCredit)}</div>
  <div class="label">Possibility</div>
  <div>${escapeHtml(d.possibility)}</div>
  <div class="label">Source</div>
  <div>${escapeHtml(d.source || '—')} · <a href="${escapeHtml(d.sourceUrl)}" rel="noopener noreferrer" target="_blank">${escapeHtml(d.sourceUrl || 'link')}</a></div>
  <div class="label">Medium</div>
  <div>${escapeHtml(d.medium || '—')}</div>
  <div class="label">Media</div>
  ${mediaBlock(d.mediaUrl)}
  <div class="label">Remix uses</div>
  <div class="remix">1. ${escapeHtml(d.remixUses[0])}</div>
  <div class="remix">2. ${escapeHtml(d.remixUses[1])}</div>
  <div class="remix">3. ${escapeHtml(d.remixUses[2])}</div>
  <div class="label">Evidence</div>
  <div class="evidence">${escapeHtml(d.evidenceLabel)}</div>
  ${evidenceExpansionBlock(d)}
  ${howBlock(d)}
  <div class="label">Categories</div>
  <div>${formatTags(d.categories)}</div>
  <div class="label">Replicable result</div>
  <div>${d.replicableResult ? 'yes' : 'no'}</div>
  <div class="muted" style="margin-top:0.5rem">${escapeHtml(d.createdAt)}</div>
</article>`,
          )
          .join('\n')

  const catOptions = [
    `<option value="">any</option>`,
    ...DEMO_CATEGORIES.map(
      (c) =>
        `<option value="${escapeHtml(c)}"${filter.category === c ? ' selected' : ''}>${escapeHtml(c)}</option>`,
    ),
  ].join('')

  const replicableVal =
    filter.replicableResult === true ? 'true' : filter.replicableResult === false ? 'false' : ''

  const filters = `
<form method="get" action="/" class="filters">
  <label>From<input type="date" name="from" value="${escapeHtml(filter.from ?? '')}" /></label>
  <label>To<input type="date" name="to" value="${escapeHtml(filter.to ?? '')}" /></label>
  <label>Category<select name="category">${catOptions}</select></label>
  <label>Replicable<select name="replicable">
    <option value=""${replicableVal === '' ? ' selected' : ''}>any</option>
    <option value="true"${replicableVal === 'true' ? ' selected' : ''}>yes</option>
    <option value="false"${replicableVal === 'false' ? ' selected' : ''}>no</option>
  </select></label>
  <label>Source<input name="source" value="${escapeHtml(filter.source ?? '')}" placeholder="source label" /></label>
  <label>Medium<input name="medium" value="${escapeHtml(filter.medium ?? '')}" placeholder="video, image…" /></label>
  <label>My tag<input name="myTag" value="${escapeHtml(filter.myTag ?? '')}" placeholder="saved tag" /></label>
  <button type="submit">Filter</button>
  <a class="btn secondary" href="/">Clear</a>
</form>`

  return layout('Feed', `<h1>Demo Desk</h1>${filters}${cards}`)
}
