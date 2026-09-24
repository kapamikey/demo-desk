import app from './app.js'
import { getEnv, getDbMode } from './db/client.js'

const env = getEnv()

if (!env.operatorSecret) {
  console.error('FATAL: OPERATOR_SECRET missing in .env')
  process.exit(1)
}
if (!env.url) {
  console.error('FATAL: SUPABASE_URL missing in .env')
  process.exit(1)
}
if (!env.serviceRole && !env.anon) {
  console.error('FATAL: need SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY')
  process.exit(1)
}

// On Vercel the platform invokes the Express app via api/index.ts — do not listen.
if (!process.env.VERCEL) {
  app.listen(env.port, '127.0.0.1', () => {
    const mode = (() => {
      try {
        return getDbMode()
      } catch {
        return 'none'
      }
    })()
    console.log(`Demo Desk listening on http://127.0.0.1:${env.port} (db=${mode})`)
    if (!env.serviceRole) {
      console.warn(
        'WARN: SUPABASE_SERVICE_ROLE_KEY unset — public read via anon only; admin/saves return 503 until set.',
      )
    }
  })
}

export default app
