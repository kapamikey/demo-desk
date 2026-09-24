-- wave 1 delta: stb curated card + how-this-works + evidence expansion + filter fields
-- target: pjbdiycmchuiatcpvbws

alter table public.demos
  add column if not exists source text not null default '',
  add column if not exists medium text not null default '',
  add column if not exists replicable_result boolean not null default false,
  -- how this example works
  add column if not exists how_what_changed text not null default '',
  add column if not exists how_what_made_it_work text not null default '',
  add column if not exists how_what_can_i_borrow text not null default '',
  add column if not exists how_what_remains_uncertain text not null default '',
  -- evidence expansion
  add column if not exists evidence_what_is_shown text not null default '',
  add column if not exists evidence_what_creator_reports text not null default '',
  add column if not exists evidence_what_remains_uncertain text not null default '',
  add column if not exists evidence_instructions_and_checks text not null default '',
  add column if not exists evidence_resources_checked_date date;

-- rename freeform category_tags → categories (locked taxonomy enforced in app + check)
alter table public.demos add column if not exists categories text[] not null default '{}';
-- keep only taxonomy-legal tags on backfill (freeform leftovers dropped)
update public.demos set categories = coalesce((
  select array_agg(x order by x)
  from unnest(category_tags) as x
  where x = any(array[
    'graphics & branding',
    'explanations & presentations',
    'video & animation',
    'audio',
    'websites & interactive tools',
    '3d objects & spaces',
    'software & device control'
  ]::text[])
), '{}')
where categories = '{}' and category_tags is not null;

create index if not exists demos_categories_gin on public.demos using gin (categories);
create index if not exists demos_source_idx on public.demos (source);
create index if not exists demos_medium_idx on public.demos (medium);
create index if not exists demos_replicable_result_idx on public.demos (replicable_result);

-- allowed category values (wave 1 taxonomy). empty array ok; each element must be in set.
alter table public.demos drop constraint if exists demos_categories_taxonomy;
alter table public.demos add constraint demos_categories_taxonomy check (
  categories <@ array[
    'graphics & branding',
    'explanations & presentations',
    'video & animation',
    'audio',
    'websites & interactive tools',
    '3d objects & spaces',
    'software & device control'
  ]::text[]
);
