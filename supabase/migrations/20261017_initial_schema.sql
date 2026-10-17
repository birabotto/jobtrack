
-- JobTrack: initial database schema
-- Run once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  company text not null,
  position text not null,
  status text not null default 'Applied'
    check (status in (
      'Saved', 'Applied', 'Screening',
      'Interview', 'Offer', 'Rejected'
    )),
  job_url text,
  location text,
  work_mode text
    check (work_mode in ('Remote', 'Hybrid', 'On-site')),
  salary text,
  applied_at date,
  next_follow_up_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  application_id uuid not null,
  due_at timestamptz not null,
  status text not null default 'Pending'
    check (status in ('Pending', 'Completed', 'Cancelled')),
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (application_id, user_id)
    references public.applications(id, user_id)
    on delete cascade
);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  application_id uuid not null,
  scheduled_at timestamptz not null,
  interview_type text,
  interviewer text,
  meeting_url text,
  notes text,
  result text,
  created_at timestamptz not null default now(),
  foreign key (application_id, user_id)
    references public.applications(id, user_id)
    on delete cascade
);

create table public.application_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  application_id uuid not null,
  event_type text not null,
  old_status text,
  new_status text,
  notes text,
  created_at timestamptz not null default now(),
  foreign key (application_id, user_id)
    references public.applications(id, user_id)
    on delete cascade
);

-- Indexes for common queries
create index applications_user_created_idx
  on public.applications(user_id, created_at desc);

create index applications_user_status_idx
  on public.applications(user_id, status);

create index follow_ups_user_due_idx
  on public.follow_ups(user_id, due_at);

create index interviews_user_date_idx
  on public.interviews(user_id, scheduled_at);

create index events_application_date_idx
  on public.application_events(application_id, created_at desc);

-- Automatically maintain updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger applications_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

-- Enable RLS on every public table
alter table public.applications enable row level security;
alter table public.follow_ups enable row level security;
alter table public.interviews enable row level security;
alter table public.application_events enable row level security;

-- Ownership policy for all four tables
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'applications',
    'follow_ups',
    'interviews',
    'application_events'
  ]
  loop
    execute format(
      'create policy "owner_select" on public.%I
       for select to authenticated
       using ((select auth.uid()) = user_id)',
      table_name
    );

    execute format(
      'create policy "owner_insert" on public.%I
       for insert to authenticated
       with check ((select auth.uid()) = user_id)',
      table_name
    );

    execute format(
      'create policy "owner_update" on public.%I
       for update to authenticated
       using ((select auth.uid()) = user_id)
       with check ((select auth.uid()) = user_id)',
      table_name
    );

    execute format(
      'create policy "owner_delete" on public.%I
       for delete to authenticated
       using ((select auth.uid()) = user_id)',
      table_name
    );
  end loop;
end;
$$;
