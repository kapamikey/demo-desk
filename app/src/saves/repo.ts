import { getDb, requireServiceRole } from '../db/client.js'
import { mapSavedItem, normalizeTags, type SavedItemRow } from '../db/mappers.js'
import type {
  SavedItem,
  SavedItemCreate,
  SavedItemId,
  SavedItemQuery,
  SavedItemRepo,
  SavedItemUpdate,
} from '../types.js'

export const savedItemRepo: SavedItemRepo = {
  async save(input: SavedItemCreate): Promise<SavedItem> {
    requireServiceRole()
    const db = getDb()
    const tags = normalizeTags(input.tags)
    const note = input.note ?? ''
    const { data, error } = await db
      .from('saved_items')
      .upsert(
        { demo_id: input.demoId, tags, note },
        { onConflict: 'demo_id' },
      )
      .select('*')
      .single()
    if (error) throw error
    return mapSavedItem(data as SavedItemRow)
  },

  async update(id: SavedItemId, input: SavedItemUpdate): Promise<SavedItem> {
    requireServiceRole()
    const db = getDb()
    const patch: Record<string, unknown> = {}
    if (input.tags !== undefined) patch.tags = normalizeTags(input.tags)
    if (input.note !== undefined) patch.note = input.note
    const { data, error } = await db
      .from('saved_items')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return mapSavedItem(data as SavedItemRow)
  },

  async remove(id: SavedItemId): Promise<void> {
    requireServiceRole()
    const db = getDb()
    const { error } = await db.from('saved_items').delete().eq('id', id)
    if (error) throw error
  },

  async find(query: SavedItemQuery): Promise<SavedItem[]> {
    requireServiceRole()
    const db = getDb()
    let q = db.from('saved_items').select('*').order('created_at', { ascending: false })
    if (query.tag) {
      q = q.contains('tags', [query.tag.trim().toLowerCase()])
    }
    if (query.noteContains) {
      q = q.ilike('note', `%${query.noteContains}%`)
    }
    const { data, error } = await q
    if (error) throw error
    return (data as SavedItemRow[]).map(mapSavedItem)
  },

  async list(): Promise<SavedItem[]> {
    requireServiceRole()
    const db = getDb()
    const { data, error } = await db
      .from('saved_items')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as SavedItemRow[]).map(mapSavedItem)
  },
}
