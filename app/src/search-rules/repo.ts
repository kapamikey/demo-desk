import { getDb, requireServiceRole } from '../db/client.js'
import { mapSearchRule, type SearchRuleRow } from '../db/mappers.js'
import type {
  SearchRule,
  SearchRuleCreate,
  SearchRuleId,
  SearchRuleRepo,
  SearchRuleUpdate,
} from '../types.js'

export const searchRuleRepo: SearchRuleRepo = {
  async list(): Promise<SearchRule[]> {
    requireServiceRole()
    const db = getDb()
    const { data, error } = await db
      .from('search_rules')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as SearchRuleRow[]).map(mapSearchRule)
  },

  async create(input: SearchRuleCreate): Promise<SearchRule> {
    requireServiceRole()
    const db = getDb()
    const { data, error } = await db
      .from('search_rules')
      .insert({
        name: input.name,
        query: input.query,
        enabled: input.enabled ?? true,
      })
      .select('*')
      .single()
    if (error) throw error
    return mapSearchRule(data as SearchRuleRow)
  },

  async update(id: SearchRuleId, input: SearchRuleUpdate): Promise<SearchRule> {
    requireServiceRole()
    const db = getDb()
    const patch: Record<string, unknown> = {}
    if (input.name !== undefined) patch.name = input.name
    if (input.query !== undefined) patch.query = input.query
    if (input.enabled !== undefined) patch.enabled = input.enabled
    const { data, error } = await db
      .from('search_rules')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return mapSearchRule(data as SearchRuleRow)
  },

  async remove(id: SearchRuleId): Promise<void> {
    requireServiceRole()
    const db = getDb()
    const { error } = await db.from('search_rules').delete().eq('id', id)
    if (error) throw error
  },
}
