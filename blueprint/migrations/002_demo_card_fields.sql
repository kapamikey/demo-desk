-- wave 1 delta: stb card fields (tool credit, source/media, category tags)
-- apply on pjbdiycmchuiatcpvbws after base schema.sql (historical delta; already applied)

alter table public.demos
  add column if not exists tool_credit text,
  add column if not exists source_url text,
  add column if not exists media_url text,
  add column if not exists category_tags text[] not null default '{}';

update public.demos set tool_credit = coalesce(nullif(trim(tool_credit), ''), 'unknown') where tool_credit is null or trim(tool_credit) = '';
update public.demos set source_url = coalesce(source_url, '') where source_url is null;

alter table public.demos
  alter column tool_credit set not null,
  alter column source_url set not null;

alter table public.demos drop constraint if exists demos_tool_credit_nonempty;
alter table public.demos
  add constraint demos_tool_credit_nonempty check (char_length(trim(tool_credit)) > 0);

create index if not exists demos_category_tags_gin on public.demos using gin (category_tags);
create index if not exists demos_created_at_idx on public.demos (created_at desc);
