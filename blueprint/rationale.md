# wave 1 schema rationale

## problem

personal see-then-build research desk: curated demos with possibility / three remix uses / evidence, admin CRUD, search-rule stubs (persist only), and single-operator save/tag/note with re-find. greenfield on box; store must land on existing supabase without touching tirone trading tables. no product inventing past brief acceptance.

## usage (caller's view)

```ts
const demos = await demoRepo.listPublic()
// card: d.possibility, d.remixUses[0|1|2], d.evidenceLabel

const d = await demoRepo.create({
  possibility: '…',
  remixUses: ['a', 'b', 'c'],
  evidenceLabel: 'tweet / repo / …',
})

await searchRuleRepo.create({ name: 'ai demos', query: 'demo OR ship' })

await savedItemRepo.save({ demoId: d.id, tags: ['voice'], note: 'try for desk' })
await savedItemRepo.find({ tag: 'voice' })
await savedItemRepo.find({ noteContains: 'desk' })
```

forge implements repos against supabase; prove drives ui against these surfaces.

## shape

three tables, three repos, ui split public / admin / saves. `remix_uses text[] check cardinality = 3` encodes the three-remix invariant in the store. hard delete on demos cascades saved_items. rls: public select on demos only; mutations via service role on the box (service key never in browser). search_rules stay inert stubs — columns exist so admin CRUD is real, engine is wave-later.

interface depth: callers see domain types + small repos; sql, rls, and mappers stay inside `db`.

## synthesis decision

single-pass greenfield sketch (no arena). acceptance forced three entities; alternatives below were weighed and rejected in-sketch rather than multi-runner.

## tradeoffs accepted

- we accept a dedicated supabase project (`pjbdiycmchuiatcpvbws`) in exchange for zero blast radius on tirone trading tables.
- we accept service-role admin on box in exchange for skipping multi-user auth (wave 1 non-goal).
- we accept unique(demo_id) on saves in exchange for one save row per demo for the single operator (no multi-save history).
- we accept minimal search_rule fields in exchange for shipping stubs without inventing a filter product.

## alternatives considered

- **json blob `payload` per demo** — lost: hides the three-remix invariant; prove/acceptance harder to check.
- **shared tirone-exo-capital project** — superseded: dedicated `pjbdiycmchuiatcpvbws` now live.
- **soft-delete demos** — lost: acceptance is "leaves the public feed"; hard delete is enough; can add later.

## open questions and risks

- are search_rule stub fields `name` / `query` / `enabled` enough, or does brief want different columns?
- operator gate: shared secret cookie vs one supabase auth user — which should prove drive?
- enable `pg_trgm` for note search, or `ilike` in app for wave 1?

## next implementation step

forge: schema lives on dedicated project `pjbdiycmchuiatcpvbws`; implement `DemoRepo` against it, prove list + create.
