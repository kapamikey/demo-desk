import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Quote } from '../src/quote/types.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const port = 3468
const base = `http://127.0.0.1:${port}`

const child = spawn('npx', ['tsx', 'src/server.ts'], {
  cwd: root,
  env: { ...process.env, PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe'],
})

function fail(msg: string): never {
  child.kill()
  console.error('FAIL', msg)
  process.exit(1)
}

async function waitForHealth() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${base}/health`)
      if (res.ok) return
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 150))
  }
  fail('server did not start')
}

function isQuote(v: unknown): v is Quote {
  if (!v || typeof v !== 'object') return false
  const q = v as Quote
  return typeof q.ticker === 'string' && typeof q.price === 'string' && typeof q.quotedAt === 'string' && typeof q.use === 'number'
}

await waitForHealth()

const home = await fetch(base + '/')
const html = await home.text()
if (home.status !== 200) fail('home ' + home.status)
if (!html.includes('stock price')) fail('missing phrase')
if (html.includes('pdf to excel')) fail('invoice panel still on home')

const invoice = await fetch(base + '/invoice', { method: 'POST' })
if (invoice.status !== 404) fail('invoice still served ' + invoice.status)

async function ask(ticker: string): Promise<{ status: number; body: unknown }> {
  const res = await fetch(base + '/quote?format=json', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: 'ticker=' + encodeURIComponent(ticker),
  })
  return { status: res.status, body: await res.json() }
}

const aapl = await ask('aapl')
if (aapl.status !== 200 || !isQuote(aapl.body) || aapl.body.ticker !== 'AAPL' || !aapl.body.price) {
  fail('aapl ' + aapl.status + ' ' + JSON.stringify(aapl.body))
}
const msft = await ask('msft')
if (msft.status !== 200 || !isQuote(msft.body) || msft.body.ticker !== 'MSFT') {
  fail('msft ' + msft.status + ' ' + JSON.stringify(msft.body))
}
if (msft.body.use !== aapl.body.use + 1) fail('use did not increase ' + aapl.body.use + ' ' + msft.body.use)

const miss = await ask('NOTREAL')
if (miss.status === 200 || (miss.body && typeof miss.body === 'object' && 'use' in miss.body)) {
  fail('miss counted ' + JSON.stringify(miss.body))
}
const again = await ask('AAPL')
if (!isQuote(again.body) || again.body.use !== msft.body.use + 1) {
  fail('miss changed the count ' + JSON.stringify(again.body))
}

child.kill()
console.log('QUOTE OK')
console.log(aapl.body.ticker, aapl.body.price, aapl.body.use)
console.log(msft.body.ticker, msft.body.price, msft.body.use)
