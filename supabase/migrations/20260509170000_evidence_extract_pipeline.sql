create extension if not exists pgcrypto;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  doi text,
  journal text,
  publication_year integer,
  storage_path text,
  file_sha256 text,
  created_at timestamptz not null default now()
);

create table if not exists public.evidence_snippets (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  field_path text,
  page integer not null check (page > 0),
  bbox numeric[] not null check (array_length(bbox, 1) = 4),
  quote text not null,
  source text not null check (source in ('selection', 'table-cell', 'ai-suggestion', 'reviewer-note')),
  created_at timestamptz not null default now()
);

create table if not exists public.extractions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  reviewer_id uuid not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.table_extractions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  rows jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.outcome_registry (
  id uuid primary key default gen_random_uuid(),
  canonical_name text not null unique,
  synonyms text[] not null default '{}',
  default_unit text,
  created_at timestamptz not null default now()
);

create table if not exists public.outcome_overrides (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  raw_name text not null,
  canonical_name text not null,
  reviewer_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.reconciliation_conflicts (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  field_path text not null,
  primary_value jsonb not null,
  secondary_value jsonb not null,
  resolution text,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.active_learning_events (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  error_type text not null,
  field_path text,
  note text not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;
alter table public.evidence_snippets enable row level security;
alter table public.extractions enable row level security;
alter table public.table_extractions enable row level security;
alter table public.outcome_registry enable row level security;
alter table public.outcome_overrides enable row level security;
alter table public.reconciliation_conflicts enable row level security;
alter table public.active_learning_events enable row level security;

grant usage on schema public to authenticated, service_role;
grant select, insert, update on public.documents to authenticated;
grant select, insert, update on public.evidence_snippets to authenticated;
grant select, insert, update on public.extractions to authenticated;
grant select, insert, update on public.table_extractions to authenticated;
grant select on public.outcome_registry to authenticated;
grant select, insert, update on public.outcome_overrides to authenticated;
grant select, insert, update on public.reconciliation_conflicts to authenticated;
grant select, insert, update on public.active_learning_events to authenticated;
grant all on all tables in schema public to service_role;

create policy "authenticated read documents"
  on public.documents for select
  to authenticated
  using (true);

create policy "authenticated insert documents"
  on public.documents for insert
  to authenticated
  with check (true);

create policy "authenticated update documents"
  on public.documents for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated manage snippets"
  on public.evidence_snippets for all
  to authenticated
  using (true)
  with check (true);

create policy "reviewers manage own extractions"
  on public.extractions for all
  to authenticated
  using (reviewer_id = auth.uid())
  with check (reviewer_id = auth.uid());

create policy "authenticated read table extractions"
  on public.table_extractions for select
  to authenticated
  using (true);

create policy "authenticated insert table extractions"
  on public.table_extractions for insert
  to authenticated
  with check (true);

create policy "authenticated read outcome registry"
  on public.outcome_registry for select
  to authenticated
  using (true);

create policy "authenticated manage outcome overrides"
  on public.outcome_overrides for all
  to authenticated
  using (reviewer_id = auth.uid() or reviewer_id is null)
  with check (reviewer_id = auth.uid() or reviewer_id is null);

create policy "authenticated manage conflicts"
  on public.reconciliation_conflicts for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated manage active learning"
  on public.active_learning_events for all
  to authenticated
  using (true)
  with check (true);

insert into public.outcome_registry (canonical_name, synonyms, default_unit)
values
  ('Overall survival', array['os', 'overall survival', 'death', 'mortality'], 'months'),
  ('Progression-free survival', array['pfs', 'progression-free survival', 'progression free survival'], 'months'),
  ('Objective response rate', array['orr', 'objective response', 'response rate'], 'percent'),
  ('Intracranial response', array['cns response', 'intracranial response', 'brain response'], 'percent'),
  ('Adverse events', array['toxicity', 'safety', 'adverse event', 'grade 3'], null)
on conflict (canonical_name) do update
set synonyms = excluded.synonyms,
    default_unit = excluded.default_unit;
