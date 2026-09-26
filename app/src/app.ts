import express from 'express'
import cookieParser from 'cookie-parser'
import { getEnv, getDbMode, requireServiceRole } from './db/client.js'
import { demoRepo } from './demos/repo.js'
import { searchRuleRepo } from './search-rules/repo.js'
import { savedItemRepo } from './saves/repo.js'
import {
  clearOperatorCookie,
  isOperator,
  requireOperator,
  setOperatorCookie,
} from './auth/operator.js'
import { renderFeed } from './ui/feed/page.js'
import { renderDemoDetail, renderNotFound } from './ui/demo/page.js'
import { renderAdmin, renderEditDemo, renderLogin } from './ui/admin/page.js'
import { renderSaves } from './ui/saves/page.js'
import { filterTaxonomyCategories } from './db/mappers.js'
import type {
  DemoCategory,
  DemoId,
  DemoListFilter,
  EvidenceExpansion,
  HowThisWorks,
  RemixUses,
  SavedItemId,
  SearchRuleId,
} from './types.js'
import { DEMO_CATEGORIES } from './types.js'

const app = express()
// Vercel (and other reverse proxies) terminate TLS; needed for secure cookies / req.secure
app.set('trust proxy', 1)
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser())

function remixFromBody(body: Record<string, unknown>): RemixUses {
  return [
    String(body.remix1 ?? '').trim(),
    String(body.remix2 ?? '').trim(),
    String(body.remix3 ?? '').trim(),
  ] as RemixUses
}

function categoriesFromBody(body: Record<string, unknown>): DemoCategory[] {
  // support multi checkbox `categories` or comma field `categoriesText`
  let raw: string[] = []
  const c = body.categories
  if (Array.isArray(c)) {
    raw = c.map(String)
  } else if (typeof c === 'string' && c.trim()) {
    raw = c.split(',').map((t) => t.trim())
  } else if (typeof body.categoriesText === 'string') {
    raw = String(body.categoriesText)
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  }
  return filterTaxonomyCategories(raw)
}

function howFromBody(body: Record<string, unknown>): HowThisWorks {
  return {
    whatChanged: String(body.howWhatChanged ?? '').trim(),
    whatMadeItWork: String(body.howWhatMadeItWork ?? '').trim(),
    whatCanIBorrow: String(body.howWhatCanIBorrow ?? '').trim(),
    whatRemainsUncertain: String(body.howWhatRemainsUncertain ?? '').trim(),
  }
}

function evidenceFromBody(body: Record<string, unknown>): EvidenceExpansion {
  const dateRaw = String(body.evidenceResourcesCheckedDate ?? '').trim()
  return {
    whatIsShown: String(body.evidenceWhatIsShown ?? '').trim(),
    whatCreatorReports: String(body.evidenceWhatCreatorReports ?? '').trim(),
    whatRemainsUncertain: String(body.evidenceWhatRemainsUncertain ?? '').trim(),
    instructionsAndChecks: String(body.evidenceInstructionsAndChecks ?? '').trim(),
    resourcesCheckedDate: dateRaw || null,
  }
}

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isUuid(s: string): boolean {
  return UUID_RE.test(s)
}

/** YYYY-MM-DD that is a real calendar date. */
function isCalendarDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

function dateParam(query: Record<string, unknown>, key: 'from' | 'to'): string | undefined {
  const v = query[key]
  if (typeof v !== 'string' || !v.trim()) return undefined
  const s = v.trim()
  if (!isCalendarDate(s)) throw new HttpError(400, `Invalid ${key} date (use YYYY-MM-DD)`)
  return s
}

function filterFromQuery(query: Record<string, unknown>): DemoListFilter {
  const filter: DemoListFilter = {}
  const from = dateParam(query, 'from')
  if (from) filter.from = from
  const to = dateParam(query, 'to')
  if (to) filter.to = to
  if (typeof query.category === 'string' && query.category.trim()) {
    const cat = query.category.trim().toLowerCase()
    if ((DEMO_CATEGORIES as readonly string[]).includes(cat)) {
      filter.category = cat as DemoCategory
    } else {
      // blueprint lock: unknown category → empty list, never silent full feed
      filter.forceEmpty = true
    }
  }
  if (typeof query.replicable === 'string' && query.replicable.trim()) {
    const v = query.replicable.trim().toLowerCase()
    if (v === 'true' || v === '1' || v === 'yes') filter.replicableResult = true
    else if (v === 'false' || v === '0' || v === 'no') filter.replicableResult = false
  }
  if (typeof query.source === 'string' && query.source.trim()) {
    filter.source = query.source.trim()
  }
  if (typeof query.medium === 'string' && query.medium.trim()) {
    filter.medium = query.medium.trim()
  }
  if (typeof query.myTag === 'string' && query.myTag.trim()) {
    filter.myTag = query.myTag.trim()
  }
  return filter
}

function demoInputFromBody(body: Record<string, unknown>) {
  const mediaRaw = String(body.mediaUrl ?? '').trim()
  const replicableRaw = body.replicableResult
  const replicableResult =
    replicableRaw === true ||
    replicableRaw === 'true' ||
    replicableRaw === 'on' ||
    replicableRaw === '1'
  return {
    toolCredit: String(body.toolCredit ?? '').trim(),
    possibility: String(body.possibility ?? '').trim(),
    sourceUrl: String(body.sourceUrl ?? '').trim(),
    source: String(body.source ?? '').trim(),
    mediaUrl: mediaRaw ? mediaRaw : null,
    medium: String(body.medium ?? '').trim(),
    remixUses: remixFromBody(body),
    evidenceLabel: String(body.evidenceLabel ?? '').trim(),
    evidence: evidenceFromBody(body),
    howThisWorks: howFromBody(body),
    categories: categoriesFromBody(body),
    replicableResult,
  }
}

function statusOf(e: unknown): number {
  if (e && typeof e === 'object' && 'status' in e) return Number((e as { status: number }).status)
  return 500
}

/** Only HttpError messages reach the client; anything else is logged and answered generically. */
function sendError(res: express.Response, e: unknown, format: 'text' | 'json' = 'text'): void {
  let status: number
  let message: string
  if (e instanceof HttpError) {
    status = e.status
    message = e.message
  } else {
    console.error(e)
    status = statusOf(e)
    message = 'Something went wrong'
  }
  if (format === 'json') res.status(status).json({ error: message })
  else res.status(status).type('text').send(message)
}

// --- public ---

app.get('/', async (req, res) => {
  try {
    const filter = filterFromQuery(req.query as Record<string, unknown>)
    const demos = await demoRepo.listPublic(filter)
    res.type('html').send(renderFeed(demos, filter))
  } catch (e) {
    sendError(res, e)
  }
})

app.get('/demos/:id', async (req, res) => {
  try {
    const demo = isUuid(req.params.id) ? await demoRepo.get(req.params.id as DemoId) : null
    if (!demo) {
      res.status(404).type('html').send(renderNotFound())
      return
    }
    let saved = null
    if (isOperator(req)) {
      try {
        requireServiceRole()
        const all = await savedItemRepo.list()
        saved = all.find((s) => s.demoId === demo.id) ?? null
      } catch {
        saved = null
      }
    }
    res.type('html').send(renderDemoDetail(demo, { saved, operator: isOperator(req) }))
  } catch (e) {
    sendError(res, e)
  }
})

app.get('/api/demos', async (req, res) => {
  try {
    const filter = filterFromQuery(req.query as Record<string, unknown>)
    const demos = await demoRepo.listPublic(filter)
    res.json(demos)
  } catch (e) {
    sendError(res, e, 'json')
  }
})

// --- auth ---

app.get('/admin/login', (req, res) => {
  if (isOperator(req)) {
    res.redirect('/admin')
    return
  }
  res.type('html').send(renderLogin())
})

app.post('/admin/login', (req, res) => {
  const env = getEnv()
  const secret = String(req.body.secret ?? '')
  if (!env.operatorSecret) {
    res.type('html').send(renderLogin('OPERATOR_SECRET is not set in .env'))
    return
  }
  if (secret !== env.operatorSecret) {
    res.status(401).type('html').send(renderLogin('Wrong secret'))
    return
  }
  setOperatorCookie(res, env.operatorSecret)
  res.redirect('/admin')
})

app.get('/admin/logout', (_req, res) => {
  clearOperatorCookie(res)
  res.redirect('/')
})

// --- admin (gated) ---

app.get('/admin', requireOperator, async (_req, res) => {
  try {
    requireServiceRole()
    const [demos, rules] = await Promise.all([demoRepo.listPublic(), searchRuleRepo.list()])
    res.type('html').send(renderAdmin(demos, rules))
  } catch (e) {
    sendError(res, e)
  }
})

app.post('/admin/demos', requireOperator, async (req, res) => {
  try {
    requireServiceRole()
    await demoRepo.create(demoInputFromBody(req.body))
    res.redirect('/admin')
  } catch (e) {
    sendError(res, e)
  }
})

app.get('/admin/demos/:id/edit', requireOperator, async (req, res) => {
  try {
    const demo = isUuid(req.params.id) ? await demoRepo.get(req.params.id as DemoId) : null
    if (!demo) {
      res.status(404).type('html').send(renderNotFound())
      return
    }
    res.type('html').send(renderEditDemo(demo))
  } catch (e) {
    sendError(res, e)
  }
})

app.post('/admin/demos/:id', requireOperator, async (req, res) => {
  try {
    requireServiceRole()
    await demoRepo.update(req.params.id as DemoId, demoInputFromBody(req.body))
    res.redirect('/admin')
  } catch (e) {
    sendError(res, e)
  }
})

app.post('/admin/demos/:id/delete', requireOperator, async (req, res) => {
  try {
    requireServiceRole()
    await demoRepo.remove(req.params.id as DemoId)
    res.redirect('/admin')
  } catch (e) {
    sendError(res, e)
  }
})

app.post('/admin/rules', requireOperator, async (req, res) => {
  try {
    requireServiceRole()
    await searchRuleRepo.create({
      name: String(req.body.name ?? '').trim(),
      query: String(req.body.query ?? ''),
      enabled: req.body.enabled === 'true' || req.body.enabled === true,
    })
    res.redirect('/admin')
  } catch (e) {
    sendError(res, e)
  }
})

app.post('/admin/rules/:id', requireOperator, async (req, res) => {
  try {
    requireServiceRole()
    if (!isUuid(req.params.id)) throw new HttpError(404, 'Rule not found')
    const name = String(req.body.name ?? '').trim()
    const query = String(req.body.query ?? '').trim()
    if (!name || !query) throw new HttpError(400, 'Name and query are required')
    const enabled = req.body.enabled === 'true' || req.body.enabled === true
    try {
      await searchRuleRepo.update(req.params.id as SearchRuleId, { name, query, enabled })
    } catch (e) {
      // .single() on zero matched rows
      if ((e as { code?: string })?.code === 'PGRST116') throw new HttpError(404, 'Rule not found')
      throw e
    }
    res.redirect('/admin')
  } catch (e) {
    sendError(res, e)
  }
})

app.post('/admin/rules/:id/toggle', requireOperator, async (req, res) => {
  try {
    requireServiceRole()
    const enabled = String(req.body.enabled) === 'true'
    await searchRuleRepo.update(req.params.id as SearchRuleId, { enabled })
    res.redirect('/admin')
  } catch (e) {
    sendError(res, e)
  }
})

app.post('/admin/rules/:id/delete', requireOperator, async (req, res) => {
  try {
    requireServiceRole()
    await searchRuleRepo.remove(req.params.id as SearchRuleId)
    res.redirect('/admin')
  } catch (e) {
    sendError(res, e)
  }
})

// --- saves (gated) ---

app.get('/saves', requireOperator, async (req, res) => {
  try {
    requireServiceRole()
    const tag = typeof req.query.tag === 'string' ? req.query.tag.trim() : undefined
    const noteContains =
      typeof req.query.noteContains === 'string' ? req.query.noteContains.trim() : undefined
    const items =
      tag || noteContains
        ? await savedItemRepo.find({ tag: tag || undefined, noteContains: noteContains || undefined })
        : await savedItemRepo.list()
    const demos = await demoRepo.listPublic()
    const demosById = new Map(demos.map((d) => [d.id as string, d]))
    res.type('html').send(renderSaves(items, demosById, { tag, noteContains }))
  } catch (e) {
    sendError(res, e)
  }
})

app.post('/saves', requireOperator, async (req, res) => {
  try {
    requireServiceRole()
    const demoId = String(req.body.demoId ?? '') as DemoId
    const tags = String(req.body.tags ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const note = String(req.body.note ?? '')
    await savedItemRepo.save({ demoId, tags, note })
    res.redirect(`/demos/${demoId}`)
  } catch (e) {
    sendError(res, e)
  }
})

app.post('/saves/:id/delete', requireOperator, async (req, res) => {
  try {
    requireServiceRole()
    await savedItemRepo.remove(req.params.id as SavedItemId)
    const back = req.get('referer') || '/saves'
    res.redirect(back)
  } catch (e) {
    sendError(res, e)
  }
})

// --- health ---

app.get('/health', (_req, res) => {
  const env = getEnv()
  let dbMode: string = 'unset'
  try {
    dbMode = getDbMode()
  } catch (e) {
    dbMode = 'error:' + (e instanceof Error ? e.message : String(e))
  }
  res.json({
    ok: true,
    dbMode,
    hasServiceRole: Boolean(env.serviceRole),
    hasOperatorSecret: Boolean(env.operatorSecret),
    port: env.port,
  })
})

export default app
