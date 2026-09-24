import { getDb, requireServiceRole } from '../db/client.js'
import { filterTaxonomyCategories, mapDemo, type DemoRow } from '../db/mappers.js'
import type {
  Demo,
  DemoCreate,
  DemoId,
  DemoListFilter,
  DemoRepo,
  DemoUpdate,
  EvidenceExpansion,
  HowThisWorks,
} from '../types.js'

function emptyHow(): HowThisWorks {
  return { whatChanged: '', whatMadeItWork: '', whatCanIBorrow: '', whatRemainsUncertain: '' }
}

function emptyEvidence(): EvidenceExpansion {
  return {
    whatIsShown: '',
    whatCreatorReports: '',
    whatRemainsUncertain: '',
    instructionsAndChecks: '',
    resourcesCheckedDate: null,
  }
}

function howToRow(h: HowThisWorks) {
  return {
    how_what_changed: h.whatChanged,
    how_what_made_it_work: h.whatMadeItWork,
    how_what_can_i_borrow: h.whatCanIBorrow,
    how_what_remains_uncertain: h.whatRemainsUncertain,
  }
}

function evidenceToRow(e: EvidenceExpansion) {
  return {
    evidence_what_is_shown: e.whatIsShown,
    evidence_what_creator_reports: e.whatCreatorReports,
    evidence_what_remains_uncertain: e.whatRemainsUncertain,
    evidence_instructions_and_checks: e.instructionsAndChecks,
    evidence_resources_checked_date: e.resourcesCheckedDate,
  }
}

export const demoRepo: DemoRepo = {
  async listPublic(filter?: DemoListFilter): Promise<Demo[]> {
    if (filter?.forceEmpty) return []
    const db = getDb()
    let q = db.from('demos').select('*').order('created_at', { ascending: false })
    if (filter?.from) {
      q = q.gte('created_at', filter.from)
    }
    if (filter?.to) {
      const to = filter.to
      const end = /^\d{4}-\d{2}-\d{2}$/.test(to) ? `${to}T23:59:59.999Z` : to
      q = q.lte('created_at', end)
    }
    if (filter?.category) {
      const cat = filter.category.trim().toLowerCase()
      if (cat) q = q.contains('categories', [cat])
    }
    if (filter?.replicableResult !== undefined) {
      q = q.eq('replicable_result', filter.replicableResult)
    }
    if (filter?.source) {
      const s = filter.source.trim()
      // exact case-insensitive match; escape ilike wildcards so unknown → empty
      if (s) {
        const escaped = s.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
        q = q.ilike('source', escaped)
      }
    }
    if (filter?.medium) {
      const m = filter.medium.trim().toLowerCase()
      if (m) q = q.eq('medium', m)
    }
    if (filter?.myTag) {
      const tag = filter.myTag.trim().toLowerCase()
      if (tag) {
        const { data: saves, error: saveErr } = await db
          .from('saved_items')
          .select('demo_id')
          .contains('tags', [tag])
        if (saveErr) throw saveErr
        const ids = (saves ?? []).map((r: { demo_id: string }) => r.demo_id)
        if (ids.length === 0) return []
        q = q.in('id', ids)
      }
    }
    const { data, error } = await q
    if (error) throw error
    return (data as DemoRow[]).map(mapDemo)
  },

  async get(id: DemoId): Promise<Demo | null> {
    const db = getDb()
    const { data, error } = await db.from('demos').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? mapDemo(data as DemoRow) : null
  },

  async create(input: DemoCreate): Promise<Demo> {
    requireServiceRole()
    const db = getDb()
    const how = input.howThisWorks ?? emptyHow()
    const evidence = input.evidence ?? emptyEvidence()
    const { data, error } = await db
      .from('demos')
      .insert({
        tool_credit: input.toolCredit,
        possibility: input.possibility,
        source_url: input.sourceUrl,
        source: (input.source ?? '').trim(),
        media_url: input.mediaUrl ?? null,
        medium: (input.medium ?? '').trim().toLowerCase(),
        remix_uses: [...input.remixUses],
        evidence_label: input.evidenceLabel,
        ...evidenceToRow(evidence),
        ...howToRow(how),
        categories: filterTaxonomyCategories(input.categories),
        replicable_result: input.replicableResult ?? false,
      })
      .select('*')
      .single()
    if (error) throw error
    return mapDemo(data as DemoRow)
  },

  async update(id: DemoId, input: DemoUpdate): Promise<Demo> {
    requireServiceRole()
    const db = getDb()
    const patch: Record<string, unknown> = {}
    if (input.toolCredit !== undefined) patch.tool_credit = input.toolCredit
    if (input.possibility !== undefined) patch.possibility = input.possibility
    if (input.sourceUrl !== undefined) patch.source_url = input.sourceUrl
    if (input.source !== undefined) patch.source = input.source.trim()
    if (input.mediaUrl !== undefined) patch.media_url = input.mediaUrl
    if (input.medium !== undefined) patch.medium = input.medium.trim().toLowerCase()
    if (input.remixUses !== undefined) patch.remix_uses = [...input.remixUses]
    if (input.evidenceLabel !== undefined) patch.evidence_label = input.evidenceLabel
    if (input.evidence !== undefined) Object.assign(patch, evidenceToRow(input.evidence))
    if (input.howThisWorks !== undefined) Object.assign(patch, howToRow(input.howThisWorks))
    if (input.categories !== undefined) patch.categories = filterTaxonomyCategories(input.categories)
    if (input.replicableResult !== undefined) patch.replicable_result = input.replicableResult
    const { data, error } = await db.from('demos').update(patch).eq('id', id).select('*').single()
    if (error) throw error
    return mapDemo(data as DemoRow)
  },

  async remove(id: DemoId): Promise<void> {
    requireServiceRole()
    const db = getDb()
    const { error } = await db.from('demos').delete().eq('id', id)
    if (error) throw error
  },
}
