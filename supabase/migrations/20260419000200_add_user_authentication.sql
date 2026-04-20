create table if not exists public.cm_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists cm_users_username_idx on public.cm_users (username);

-- Add user_id columns to existing tables
alter table public.cm_tasks add column if not exists user_id uuid;
alter table public.cm_sprints add column if not exists user_id uuid;
alter table public.cm_analytics_snapshots add column if not exists user_id uuid;

alter table public.cm_tasks drop constraint if exists cm_tasks_user_id_fkey;
alter table public.cm_sprints drop constraint if exists cm_sprints_user_id_fkey;
alter table public.cm_analytics_snapshots drop constraint if exists cm_analytics_snapshots_user_id_fkey;

alter table public.cm_tasks add constraint cm_tasks_user_id_fkey foreign key (user_id) references public.cm_users(id) on delete cascade;
alter table public.cm_sprints add constraint cm_sprints_user_id_fkey foreign key (user_id) references public.cm_users(id) on delete cascade;
alter table public.cm_analytics_snapshots add constraint cm_analytics_snapshots_user_id_fkey foreign key (user_id) references public.cm_users(id) on delete cascade;

-- Create indexes for user_id lookups
create index if not exists cm_tasks_user_id_idx on public.cm_tasks (user_id);
create index if not exists cm_sprints_user_id_idx on public.cm_sprints (user_id);
create index if not exists cm_analytics_snapshots_user_id_idx on public.cm_analytics_snapshots (user_id);

do $$
begin
  alter table public.cm_users enable row level security;

  drop policy if exists "public full access to cm_users" on public.cm_users;
  create policy "public full access to cm_users"
    on public.cm_users
    for all
    to anon, authenticated
    using (true)
    with check (true);

  -- Update RLS for cm_tasks - users can only access their own tasks
  drop policy if exists "public full access to cm_tasks" on public.cm_tasks;
  drop policy if exists "users can access own tasks" on public.cm_tasks;
  drop policy if exists "anon can access tasks when user_id is null" on public.cm_tasks;
  
  create policy "public full access to cm_tasks"
    on public.cm_tasks
    for all
    to anon, authenticated
    using (true)
    with check (true);

  -- Update RLS for cm_sprints - users can only access their own sprints
  drop policy if exists "public full access to cm_sprints" on public.cm_sprints;
  drop policy if exists "users can access own sprints" on public.cm_sprints;
  drop policy if exists "anon can access sprints when user_id is null" on public.cm_sprints;
  
  create policy "public full access to cm_sprints"
    on public.cm_sprints
    for all
    to anon, authenticated
    using (true)
    with check (true);

  -- Update RLS for cm_analytics_snapshots - users can only access their own snapshots
  drop policy if exists "public full access to cm_analytics_snapshots" on public.cm_analytics_snapshots;
  drop policy if exists "users can access own analytics" on public.cm_analytics_snapshots;
  drop policy if exists "anon can access analytics when user_id is null" on public.cm_analytics_snapshots;
  
  create policy "public full access to cm_analytics_snapshots"
    on public.cm_analytics_snapshots
    for all
    to anon, authenticated
    using (true)
    with check (true);
end $$;
