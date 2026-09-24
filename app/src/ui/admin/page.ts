import type { Demo, SearchRule } from '../../types.js'
import { DEMO_CATEGORIES } from '../../types.js'
import { escapeHtml, layout } from '../layout.js'

function categoryCheckboxes(selected: string[] = []): string {
  const set = new Set(selected)
  return DEMO_CATEGORIES.map(
    (c) =>
      `<label style="display:block"><input type="checkbox" name="categories" value="${escapeHtml(c)}"${set.has(c) ? ' checked' : ''} /> ${escapeHtml(c)}</label>`,
  ).join('\n')
}

function demoFormFields(d?: Demo): string {
  const h = d?.howThisWorks
  const e = d?.evidence
  return `
  <label>Tool credit<input name="toolCredit" required value="${escapeHtml(d?.toolCredit ?? '')}" /></label>
  <label>Possibility<input name="possibility" required value="${escapeHtml(d?.possibility ?? '')}" /></label>
  <label>Source URL<input name="sourceUrl" required value="${escapeHtml(d?.sourceUrl ?? '')}" /></label>
  <label>Source label<input name="source" value="${escapeHtml(d?.source ?? '')}" placeholder="creator / outlet" /></label>
  <label>Media URL<input name="mediaUrl" value="${escapeHtml(d?.mediaUrl ?? '')}" placeholder="optional" /></label>
  <label>Medium<input name="medium" value="${escapeHtml(d?.medium ?? '')}" placeholder="video, image, link…" /></label>
  <label>Remix use 1<input name="remix1" required value="${escapeHtml(d?.remixUses[0] ?? '')}" /></label>
  <label>Remix use 2<input name="remix2" required value="${escapeHtml(d?.remixUses[1] ?? '')}" /></label>
  <label>Remix use 3<input name="remix3" required value="${escapeHtml(d?.remixUses[2] ?? '')}" /></label>
  <label>Evidence label<input name="evidenceLabel" required value="${escapeHtml(d?.evidenceLabel ?? '')}" /></label>
  <fieldset><legend>Evidence expansion</legend>
    <label>What is shown<textarea name="evidenceWhatIsShown">${escapeHtml(e?.whatIsShown ?? '')}</textarea></label>
    <label>What creator reports<textarea name="evidenceWhatCreatorReports">${escapeHtml(e?.whatCreatorReports ?? '')}</textarea></label>
    <label>What remains uncertain<textarea name="evidenceWhatRemainsUncertain">${escapeHtml(e?.whatRemainsUncertain ?? '')}</textarea></label>
    <label>Instructions &amp; checks<textarea name="evidenceInstructionsAndChecks">${escapeHtml(e?.instructionsAndChecks ?? '')}</textarea></label>
    <label>Resources checked date<input type="date" name="evidenceResourcesCheckedDate" value="${escapeHtml(e?.resourcesCheckedDate ?? '')}" /></label>
  </fieldset>
  <fieldset><legend>How this works</legend>
    <label>What changed<textarea name="howWhatChanged">${escapeHtml(h?.whatChanged ?? '')}</textarea></label>
    <label>What made it work<textarea name="howWhatMadeItWork">${escapeHtml(h?.whatMadeItWork ?? '')}</textarea></label>
    <label>What can I borrow<textarea name="howWhatCanIBorrow">${escapeHtml(h?.whatCanIBorrow ?? '')}</textarea></label>
    <label>What remains uncertain<textarea name="howWhatRemainsUncertain">${escapeHtml(h?.whatRemainsUncertain ?? '')}</textarea></label>
  </fieldset>
  <fieldset><legend>Categories (taxonomy)</legend>
    ${categoryCheckboxes(d?.categories ?? [])}
  </fieldset>
  <label><input type="checkbox" name="replicableResult" value="true"${d?.replicableResult ? ' checked' : ''} /> Replicable result</label>`
}

export function renderLogin(error?: string): string {
  return layout(
    'Login',
    `<h1>Operator login</h1>
${error ? `<div class="err">${escapeHtml(error)}</div>` : ''}
<form method="post" action="/admin/login">
  <label>OPERATOR_SECRET<input type="password" name="secret" required autocomplete="current-password" /></label>
  <button type="submit">Login</button>
</form>`,
  )
}

export function renderAdmin(demos: Demo[], rules: SearchRule[], flash?: string): string {
  const demoRows = demos
    .map(
      (d) => `<tr>
  <td><a href="/demos/${escapeHtml(d.id)}">${escapeHtml(d.possibility)}</a></td>
  <td>${escapeHtml(d.toolCredit)}</td>
  <td>${escapeHtml(d.categories.join(', ') || '—')}</td>
  <td>${escapeHtml(d.medium || '—')}</td>
  <td>${d.replicableResult ? 'yes' : 'no'}</td>
  <td>${escapeHtml(d.evidenceLabel)}</td>
  <td>
    <a class="btn secondary" href="/admin/demos/${escapeHtml(d.id)}/edit">Edit</a>
    <form style="display:inline" method="post" action="/admin/demos/${escapeHtml(d.id)}/delete" onsubmit="return confirm('Delete demo?')">
      <button class="danger" type="submit">Delete</button>
    </form>
  </td>
</tr>`,
    )
    .join('\n')

  const ruleRows = rules
    .map(
      (r) => `<tr>
  <td>${escapeHtml(r.name)}</td>
  <td>${escapeHtml(r.query)}</td>
  <td>${r.enabled ? 'yes' : 'no'}</td>
  <td>
    <form style="display:inline" method="post" action="/admin/rules/${escapeHtml(r.id)}/toggle">
      <input type="hidden" name="enabled" value="${r.enabled ? 'false' : 'true'}" />
      <button class="secondary" type="submit">${r.enabled ? 'Disable' : 'Enable'}</button>
    </form>
    <form style="display:inline" method="post" action="/admin/rules/${escapeHtml(r.id)}/delete" onsubmit="return confirm('Delete rule?')">
      <button class="danger" type="submit">Delete</button>
    </form>
  </td>
</tr>`,
    )
    .join('\n')

  const body = `
<h1>Admin</h1>
${flash ? `<p class="muted">${escapeHtml(flash)}</p>` : ''}

<h2>Add demo</h2>
<form method="post" action="/admin/demos">
  ${demoFormFields()}
  <button type="submit">Create</button>
</form>

<h2>Demos</h2>
<table>
  <thead><tr><th>Possibility</th><th>Tool</th><th>Categories</th><th>Medium</th><th>Replicable</th><th>Evidence</th><th></th></tr></thead>
  <tbody>${demoRows || '<tr><td colspan="7" class="muted">None</td></tr>'}</tbody>
</table>

<h2>Search rules (stubs)</h2>
<form method="post" action="/admin/rules">
  <label>Name<input name="name" required /></label>
  <label>Query<input name="query" /></label>
  <label><input type="checkbox" name="enabled" value="true" checked /> Enabled</label>
  <button type="submit">Add rule</button>
</form>
<table>
  <thead><tr><th>Name</th><th>Query</th><th>Enabled</th><th></th></tr></thead>
  <tbody>${ruleRows || '<tr><td colspan="4" class="muted">None</td></tr>'}</tbody>
</table>`

  return layout('Admin', body, { nav: 'admin' })
}

export function renderEditDemo(demo: Demo, error?: string): string {
  const d = demo
  return layout(
    'Edit demo',
    `<h1>Edit demo</h1>
${error ? `<div class="err">${escapeHtml(error)}</div>` : ''}
<form method="post" action="/admin/demos/${escapeHtml(d.id)}">
  ${demoFormFields(d)}
  <button type="submit">Save</button>
</form>
<p><a href="/admin">← Admin</a></p>`,
    { nav: 'admin' },
  )
}
