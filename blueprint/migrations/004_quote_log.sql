-- successful stock quotes only. one row = one use. no user, no account.
-- wave 1 tables are not touched. invoice fixtures are not in the database.

create table if not exists quote_log (
  id uuid primary key default gen_random_uuid(),
  ticker text not null,
  price numeric not null,
  quoted_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table quote_log enable row level security;
