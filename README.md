# Demo Desk

Wave-1 Express app: public demo feed, admin CRUD, operator saves. Blueprint contract lives in `blueprint/`.

## Layout

- `app/` — runnable Express + tsx app (Vercel root directory)
- `blueprint/` — schema, types, module map, migrations

## Local start

```bash
cd app
cp .env.example .env
# fill SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, OPERATOR_SECRET
npm install
npm start
```

App: http://127.0.0.1:3456

## Environment

| Variable | Notes |
| --- | --- |
| `SUPABASE_URL` | `https://pjbdiycmchuiatcpvbws.supabase.co` (Demo Desk project) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; required for admin + saves |
| `SUPABASE_ANON_KEY` | Optional public-read fallback |
| `OPERATOR_SECRET` | Admin cookie / `x-operator-secret` gate |
| `PORT` | Local only; default `3456` |

Do **not** point this app at the trading Supabase project (`goimaocvcsyjuqyuhxse`).

## Supabase

Project id: **pjbdiycmchuiatcpvbws** (dedicated Demo Desk).

## Vercel

1. Create a project from this repo.
2. Set **Root Directory** to `app` (so `package.json` and `vercel.json` are at the Vercel root).
3. Add the same env vars in the Vercel project (no `.env` in git).
4. `vercel.json` builds `api/index.ts` with `@vercel/node` and rewrites all routes to that function. The Express app is exported from `src/app.ts`; `src/server.ts` only `listen`s when `VERCEL` is unset.

## Smoke

```bash
cd app && npm run smoke
```
