import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../../.env') })

export type DbMode = 'service' | 'anon' | 'none'

let client: SupabaseClient | null = null
let mode: DbMode = 'none'

export function getEnv() {
  return {
    url: process.env.SUPABASE_URL?.trim() || '',
    serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '',
    anon: process.env.SUPABASE_ANON_KEY?.trim() || '',
    operatorSecret: process.env.OPERATOR_SECRET?.trim() || '',
    port: Number(process.env.PORT || 3456),
  }
}

/** Prefer service role; fall back to anon for public reads only. */
export function getDb(): SupabaseClient {
  if (client) return client
  const env = getEnv()
  if (!env.url) {
    throw new Error('SUPABASE_URL is missing. Copy .env.example to .env and set it.')
  }
  if (env.serviceRole) {
    client = createClient(env.url, env.serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    mode = 'service'
    return client
  }
  if (env.anon) {
    client = createClient(env.url, env.anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    mode = 'anon'
    return client
  }
  throw new Error(
    'Neither SUPABASE_SERVICE_ROLE_KEY nor SUPABASE_ANON_KEY is set. See .env.example.',
  )
}

export function getDbMode(): DbMode {
  if (!client) getDb()
  return mode
}

export function requireServiceRole(): void {
  const env = getEnv()
  if (!env.serviceRole) {
    const err = new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for this mutating route. Set it in app/.env (project pjbdiycmchuiatcpvbws (Demo Desk) — do not use trading-project keys).',
    )
    ;(err as Error & { status: number }).status = 503
    throw err
  }
  // ensure client is on service role
  if (mode !== 'service') {
    client = null
    getDb()
  }
}
