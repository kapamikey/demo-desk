# demo desk — wave 1 module map

stack: app on shared box · store = dedicated supabase `pjbdiycmchuiatcpvbws` · github optional later · no x ingest

source: brief wave 1 acceptance · types: `blueprint/types.ts` · sql: `blueprint/schema.sql`

## modules

| module | owns | does not own |
| --- | --- | --- |
| `db` | supabase client, migrations apply, generated row↔domain mappers | ui, product rules |
| `demos` | `DemoRepo` (listPublic+date/category/replicable/source/medium/myTag filter, get, create, update, remove) | feed chrome, auth |
| `search-rules` | `SearchRuleRepo` stub CRUD + list | any filter engine |
| `saves` | `SavedItemRepo` (save/update/remove/find by tag\|note) | multi-user accounts |
| `auth/operator` | single-operator gate for admin + saves (env secret or one supabase user) | stripe, multi-user |
| `ui/feed` | public list of demos; card = tool credit · possibility · source/media · 3 remix · evidence · how-this-works · categories · filters | admin |
| `ui/demo` | detail / expanded card; same three fields untruncated | edit forms |
| `ui/admin` | demo CRUD, search-rule stub CRUD | public chrome |
| `ui/saves` | save/tag/note + re-find by tag or note text | public feed |

## dependency direction

```
ui/* → demos | search-rules | saves → db → supabase
auth/operator → gates ui/admin + ui/saves (+ mutating repo calls)
```

no cycles. ui never talks sql. repos never import ui.

## acceptance → module

1. public feed cards → `ui/feed` + `demos.listPublic`
2. demo page / expanded → `ui/demo` + `demos.get`
3–5. admin add/edit/remove demo → `ui/admin` + `demos.create|update|remove`
6. search-rules stubs → `ui/admin` + `search-rules.*`
7. save/tag/note + find → `ui/saves` + `saves.*`

## non-goals (do not add modules)

nightly x scrape · chrome extension · accounts/stripe · mcp plugin · multi-user auth · engined search-rule filtering

## forge fill order

1. `db` + apply `schema.sql` (enable `pg_trgm` if using note gin)
2. `demos` repo + prove list/create/update/remove
3. `ui/feed` + `ui/demo`
4. `auth/operator` + `ui/admin` demo CRUD
5. `search-rules` + admin list/CRUD
6. `saves` + find-by-tag/note UI

## open (do not block forge on #1)

- search-rule stub fields: proposed `name` + `query` + `enabled`. ping brief if product wants different shape.
- operator auth: env shared secret vs single supabase user — pick simplest that prove can exercise.
- store: dedicated project `pjbdiycmchuiatcpvbws` (not tirone-exo-capital). trading project left alone.

## app layout (recommended path)

```
/workspace/demo-desk/
  blueprint/          # owned by blueprint — contract only
  app/                # forge fills
    package.json
    src/
      db/             # supabase client + mappers
      demos/          # DemoRepo
      search-rules/   # SearchRuleRepo
      saves/          # SavedItemRepo
      auth/           # operator gate
      ui/
        feed/
        demo/
        admin/
        saves/
    public/           # static if needed
```

root of the runnable app = `/workspace/demo-desk/app`. do not invent a second tree. github later can mirror this.


## locked demo card fields (wave 1)

card: tool_credit · possibility · source_url · source · media_url · medium · remix_uses[3] · evidence_label · categories (taxonomy) · replicable_result · created_at

how this works: how_what_changed · how_what_made_it_work · how_what_can_i_borrow · how_what_remains_uncertain

evidence expansion: evidence_what_is_shown · evidence_what_creator_reports · evidence_what_remains_uncertain · evidence_instructions_and_checks · evidence_resources_checked_date

filters: date · category · replicable_result · source · medium · my tags (via saved_items.tags)

search_rules: name + query + enabled (brief-locked)

out of schema (wave 1): try in my work · prepare to share · prompt builder · chrome · accounts/gate · scout ingest

deltas: `migrations/002_demo_card_fields.sql` · `migrations/003_stb_card_lock.sql`

## filter semantics (locked)

unknown `category` (not in the 7-value taxonomy) → **empty result**, never silent full feed. same spirit for unknown `medium`/`source` exact filters: no match → empty.
