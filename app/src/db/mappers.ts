import type {
  Demo,
  DemoCategory,
  DemoId,
  EvidenceExpansion,
  HowThisWorks,
  RemixUses,
  SavedItem,
  SavedItemId,
  SearchRule,
  SearchRuleId,
} from '../types.js'
import { DEMO_CATEGORIES } from '../types.js'

export type DemoRow = {
  id: string
  tool_credit: string
  possibility: string
  source_url: string
  source: string
  media_url: string | null
  medium: string
  remix_uses: string[]
  evidence_label: string
  evidence_what_is_shown: string
  evidence_what_creator_reports: string
  evidence_what_remains_uncertain: string
  evidence_instructions_and_checks: string
  evidence_resources_checked_date: string | null
  how_what_changed: string
  how_what_made_it_work: string
  how_what_can_i_borrow: string
  how_what_remains_uncertain: string
  categories: string[]
  replicable_result: boolean
  created_at: string
  updated_at: string
}

export type SearchRuleRow = {
  id: string
  name: string
  query: string
  enabled: boolean
  created_at: string
  updated_at: string
}

export type SavedItemRow = {
  id: string
  demo_id: string
  tags: string[]
  note: string
  created_at: string
  updated_at: string
}

const CATEGORY_SET = new Set<string>(DEMO_CATEGORIES)

export function filterTaxonomyCategories(tags: string[] | undefined): DemoCategory[] {
  if (!tags) return []
  const out: DemoCategory[] = []
  const seen = new Set<string>()
  for (const t of tags) {
    const n = t.trim().toLowerCase()
    if (!n || seen.has(n) || !CATEGORY_SET.has(n)) continue
    seen.add(n)
    out.push(n as DemoCategory)
  }
  return out
}

export function mapDemo(row: DemoRow): Demo {
  const uses = row.remix_uses
  if (!uses || uses.length !== 3) {
    throw new Error(`demo ${row.id}: remix_uses must have exactly 3 items`)
  }
  const howThisWorks: HowThisWorks = {
    whatChanged: row.how_what_changed ?? '',
    whatMadeItWork: row.how_what_made_it_work ?? '',
    whatCanIBorrow: row.how_what_can_i_borrow ?? '',
    whatRemainsUncertain: row.how_what_remains_uncertain ?? '',
  }
  const evidence: EvidenceExpansion = {
    whatIsShown: row.evidence_what_is_shown ?? '',
    whatCreatorReports: row.evidence_what_creator_reports ?? '',
    whatRemainsUncertain: row.evidence_what_remains_uncertain ?? '',
    instructionsAndChecks: row.evidence_instructions_and_checks ?? '',
    resourcesCheckedDate: row.evidence_resources_checked_date ?? null,
  }
  return {
    id: row.id as DemoId,
    toolCredit: row.tool_credit,
    possibility: row.possibility,
    sourceUrl: row.source_url,
    source: row.source ?? '',
    mediaUrl: row.media_url ?? null,
    medium: row.medium ?? '',
    remixUses: [uses[0], uses[1], uses[2]] as RemixUses,
    evidenceLabel: row.evidence_label,
    evidence,
    howThisWorks,
    categories: filterTaxonomyCategories(row.categories ?? []),
    replicableResult: Boolean(row.replicable_result),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapSearchRule(row: SearchRuleRow): SearchRule {
  return {
    id: row.id as SearchRuleId,
    name: row.name,
    query: row.query,
    enabled: row.enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapSavedItem(row: SavedItemRow): SavedItem {
  return {
    id: row.id as SavedItemId,
    demoId: row.demo_id as DemoId,
    tags: row.tags ?? [],
    note: row.note ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function normalizeTags(tags: string[] | undefined): string[] {
  if (!tags) return []
  const out: string[] = []
  const seen = new Set<string>()
  for (const t of tags) {
    const n = t.trim().toLowerCase()
    if (!n || seen.has(n)) continue
    seen.add(n)
    out.push(n)
  }
  return out
}
