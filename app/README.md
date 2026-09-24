# Demo Desk (wave 1)

Runnable app root for local + Vercel.

## Start

```bash
cp .env.example .env
# set keys for project pjbdiycmchuiatcpvbws only
npm install
npm start
```

URL: http://127.0.0.1:3456

## Env

- `SUPABASE_URL` — https://pjbdiycmchuiatcpvbws.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY` — server only (admin + saves)
- `SUPABASE_ANON_KEY` — optional public-read fallback
- `OPERATOR_SECRET` — admin cookie/header gate
- `PORT` — default 3456

## Smoke

```bash
npm run smoke
```

## Vercel

See repo root README. Entry: `api/index.ts` → `src/app.ts`.
