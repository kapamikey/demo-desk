export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function layout(title: string, body: string, opts?: { nav?: 'public' | 'admin' }): string {
  const nav =
    opts?.nav === 'admin'
      ? `<nav><a href="/">Feed</a> · <a href="/admin">Admin</a> · <a href="/saves">Saves</a> · <a href="/admin/logout">Logout</a></nav>`
      : `<nav><a href="/">Feed</a> · <a href="/admin">Admin</a></nav>`
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} · Demo Desk</title>
  <style>
    :root { font-family: system-ui, sans-serif; color: #1a1a1a; background: #f6f5f2; }
    body { max-width: 720px; margin: 1.5rem auto; padding: 0 1rem; line-height: 1.45; }
    nav { margin-bottom: 1.25rem; font-size: 0.95rem; }
    a { color: #0b5fff; }
    h1 { font-size: 1.4rem; margin: 0 0 1rem; }
    h2 { font-size: 1.1rem; margin: 1.5rem 0 0.5rem; }
    .card { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 1rem 1.1rem; margin: 0.75rem 0; }
    .card h3 { margin: 0 0 0.5rem; font-size: 1.05rem; }
    .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: #666; margin-top: 0.6rem; }
    .remix { margin: 0.15rem 0; white-space: pre-wrap; }
    .evidence { margin-top: 0.5rem; font-size: 0.95rem; }
    .tag { display: inline-block; background: #eee; border-radius: 999px; padding: 0.1rem 0.5rem; font-size: 0.8rem; margin: 0.1rem 0.15rem 0.1rem 0; }
    form { display: grid; gap: 0.5rem; margin: 0.75rem 0; }
    form.filters { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); align-items: end; }
    input, textarea, button, select { font: inherit; padding: 0.4rem 0.5rem; }
    textarea { min-height: 3rem; }
    button, .btn { background: #1a1a1a; color: #fff; border: none; border-radius: 4px; cursor: pointer; padding: 0.45rem 0.8rem; text-decoration: none; display: inline-block; }
    button.secondary, .btn.secondary { background: #666; }
    button.danger { background: #a11; }
    .err { background: #fee; border: 1px solid #c66; padding: 0.6rem; border-radius: 4px; margin: 0.5rem 0; }
    .muted { color: #666; font-size: 0.9rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    td, th { border-bottom: 1px solid #ddd; padding: 0.4rem; text-align: left; vertical-align: top; }
  </style>
</head>
<body>
  ${nav}
  ${body}
</body>
</html>`
}
