-- Demo Desk wave 1 — target: dedicated project demo-desk (pjbdiycmchuiatcpvbws)
-- Isolated from trading tables. RLS on; public read demos only; writes via service role.

create extension if not exists "pgcrypto";

create table if not exists public.demos (
  id uuid primary key default gen_random_uuid(),
  tool_credit text not null check (char_length(trim(tool_credit)) > 0),
  possibility text not null check (char_length(trim(possibility)) > 0),
  source_url text not null default '',
  source text not null default '', -- filterable source label
  media_url text, -- null = no media
  medium text not null default '', -- filterable medium
  remix_uses text[] not null check (cardinality(remix_uses) = 3),
  evidence_label text not null check (char_length(trim(evidence_label)) > 0),
  evidence_what_is_shown text not null default '',
  evidence_what_creator_reports text not null default '',
  evidence_what_remains_uncertain text not null default '',
  evidence_instructions_and_checks text not null default '',
  evidence_resources_checked_date date,
  how_what_changed text not null default '',
  how_what_made_it_work text not null default '',
  how_what_can_i_borrow text not null default '',
  how_what_remains_uncertain text not null default '',
  categories text[] not null default '{}' check (
    categories <@ array[
    'graphics & branding',
    'explanations & presentations',
    'video & animation',
    'audio',
    'websites & interactive tools',
    '3d objects & spaces',
    'software & device control'
  ]::text[]
  ),
  category_tags text[] not null default '{}', -- legacy; prefer categories
  replicable_result boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists demos_created_at_idx on public.demos (created_at desc);
create index if not exists demos_categories_gin on public.demos using gin (categories);
create index if not exists demos_source_idx on public.demos (source);
create index if not exists demos_medium_idx on public.demos (medium);
create index if not exists demos_replicable_result_idx on public.demos (replicable_result);

create table if not exists public.search_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  query text not null default '',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists search_rules_created_at_idx on public.search_rules (created_at desc);

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  demo_id uuid not null references public.demos (id) on delete cascade,
  tags text[] not null default '{}', -- my tags
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (demo_id)
);

create index if not exists saved_items_tags_gin on public.saved_items using gin (tags);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists demos_set_updated_at on public.demos;
create trigger demos_set_updated_at before update on public.demos
  for each row execute function public.set_updated_at();

drop trigger if exists search_rules_set_updated_at on public.search_rules;
create trigger search_rules_set_updated_at before update on public.search_rules
  for each row execute function public.set_updated_at();

drop trigger if exists saved_items_set_updated_at on public.saved_items;
create trigger saved_items_set_updated_at before update on public.saved_items
  for each row execute function public.set_updated_at();

alter table public.demos enable row level security;
alter table public.search_rules enable row level security;
alter table public.saved_items enable row level security;

drop policy if exists demos_public_read on public.demos;
create policy demos_public_read on public.demos
  for select to anon, authenticated using (true);

-- no public write policies; admin + saves via service_role on box only
