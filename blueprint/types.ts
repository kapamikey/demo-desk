/**
 * Demo Desk — wave 1 types (contract for forge).
 * Source: brief wave 1 acceptance + stb curated-card lock. Do not invent past that.
 */

export type DemoId = string & { readonly __brand: 'DemoId' }
export type SearchRuleId = string & { readonly __brand: 'SearchRuleId' }
export type SavedItemId = string & { readonly __brand: 'SavedItemId' }

/** Exactly three remix angles; UI must not truncate these away. */
export type RemixUses = readonly [string, string, string]

/** Locked category taxonomy (brief). */
export const DEMO_CATEGORIES = [
  'graphics & branding',
  'explanations & presentations',
  'video & animation',
  'audio',
  'websites & interactive tools',
  '3d objects & spaces',
  'software & device control',
] as const
export type DemoCategory = (typeof DEMO_CATEGORIES)[number]

/** How this example works (curated card section). */
export type HowThisWorks = {
  whatChanged: string
  whatMadeItWork: string
  whatCanIBorrow: string
  whatRemainsUncertain: string
}

/** Evidence expansion beyond the short card label. */
export type EvidenceExpansion = {
  whatIsShown: string
  whatCreatorReports: string
  whatRemainsUncertain: string
  instructionsAndChecks: string
  resourcesCheckedDate: string | null // ISO date; null if unknown
}

/** Public feed card + detail. Admin CRUD. Ingest: manual only. */
export type Demo = {
  id: DemoId
  toolCredit: string
  possibility: string // one-line
  sourceUrl: string
  source: string // filterable source label (creator / outlet)
  mediaUrl: string | null
  medium: string // filterable medium (e.g. video, image, link)
  remixUses: RemixUses
  evidenceLabel: string // short card label
  evidence: EvidenceExpansion
  howThisWorks: HowThisWorks
  categories: DemoCategory[] // locked taxonomy only
  replicableResult: boolean
  createdAt: string // ISO — chronological feed + date filter
  updatedAt: string // ISO
}

export type DemoCreate = {
  toolCredit: string
  possibility: string
  sourceUrl: string
  source: string
  mediaUrl?: string | null
  medium: string
  remixUses: RemixUses
  evidenceLabel: string
  evidence: EvidenceExpansion
  howThisWorks: HowThisWorks
  categories: DemoCategory[]
  replicableResult?: boolean // default false
}

export type DemoUpdate = Partial<DemoCreate>

/** Feed list filters (wave 1). */
export type DemoListFilter = {
  from?: string // inclusive createdAt lower bound
  to?: string // inclusive createdAt upper bound
  category?: DemoCategory // MUST be a DemoCategory; unknown value → empty list (never silent full feed)
  replicableResult?: boolean
  source?: string // exact normalized match on source label
  medium?: string // exact normalized match
  myTag?: string // operator save tag — join saved_items when filtering "my tags"
}

/**
 * Search-rule stub (wave 1): persist + admin list/CRUD only.
 * Shape locked by brief: name + query + enabled. No engined filtering.
 */
export type SearchRule = {
  id: SearchRuleId
  name: string
  query: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export type SearchRuleCreate = {
  name: string
  query: string
  enabled?: boolean
}

export type SearchRuleUpdate = Partial<SearchRuleCreate>

/** Single-operator save/bookmark: my tags + note; find by tag or note text. */
export type SavedItem = {
  id: SavedItemId
  demoId: DemoId
  tags: string[] // "my tags"
  note: string
  createdAt: string
  updatedAt: string
}

export type SavedItemCreate = {
  demoId: DemoId
  tags?: string[]
  note?: string
}

export type SavedItemUpdate = {
  tags?: string[]
  note?: string
}

export type SavedItemQuery = {
  tag?: string
  noteContains?: string
}

// --- module surfaces ---

export type DemoRepo = {
  listPublic(filter?: DemoListFilter): Promise<Demo[]>
  get(id: DemoId): Promise<Demo | null>
  create(input: DemoCreate): Promise<Demo>
  update(id: DemoId, input: DemoUpdate): Promise<Demo>
  remove(id: DemoId): Promise<void>
}

export type SearchRuleRepo = {
  list(): Promise<SearchRule[]>
  create(input: SearchRuleCreate): Promise<SearchRule>
  update(id: SearchRuleId, input: SearchRuleUpdate): Promise<SearchRule>
  remove(id: SearchRuleId): Promise<void>
}

export type SavedItemRepo = {
  save(input: SavedItemCreate): Promise<SavedItem>
  update(id: SavedItemId, input: SavedItemUpdate): Promise<SavedItem>
  remove(id: SavedItemId): Promise<void>
  find(query: SavedItemQuery): Promise<SavedItem[]>
  list(): Promise<SavedItem[]>
}
