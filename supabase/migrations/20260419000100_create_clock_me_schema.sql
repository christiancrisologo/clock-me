create extension if not exists pgcrypto;

create table if not exists public.cm_sprints (
	id text primary key,
	name text not null unique,
	start_date timestamptz not null,
	end_date timestamptz not null,
	capacity_hours numeric not null default 0 check (capacity_hours >= 0),
	is_current boolean not null default false,
	updated_at bigint not null
);

create index if not exists cm_sprints_updated_at_idx on public.cm_sprints (updated_at desc);

create table if not exists public.cm_tasks (
	id text primary key,
	title text not null,
	jira_id text,
	status text not null,
	type text not null,
	classification text not null check (classification in ('regular', 'sprintly')),
	phase_seconds jsonb not null default '{}'::jsonb,
	logs jsonb not null default '[]'::jsonb,
	estimated_points numeric not null default 0,
	estimated_hours numeric not null default 0,
	total_seconds bigint not null default 0,
	sessions jsonb not null default '[]'::jsonb,
	sprint_id text,
	sprint_name text,
	created_at bigint not null,
	updated_at bigint not null,
	target_date date,
	link text,
	issue_key text,
	issue_id text,
	assignee text,
	assignee_id text,
	resolution text,
	resolved text,
	codebase text,
	story_points numeric
);

create index if not exists cm_tasks_sprint_id_idx on public.cm_tasks (sprint_id);
create index if not exists cm_tasks_updated_at_idx on public.cm_tasks (updated_at desc);
create index if not exists cm_tasks_status_idx on public.cm_tasks (status);
create index if not exists cm_tasks_jira_id_idx on public.cm_tasks (jira_id);

create table if not exists public.cm_analytics_snapshots (
	snapshot_id text primary key,
	snapshot_type text not null check (snapshot_type in ('global', 'sprint', 'productivity')),
	sprint_id text,
	period text,
	task_count integer not null default 0,
	completed_task_count integer not null default 0,
	payload jsonb not null default '{}'::jsonb,
	updated_at bigint not null,
	created_at timestamptz not null default timezone('utc', now())
);

create index if not exists cm_analytics_snapshots_type_idx on public.cm_analytics_snapshots (snapshot_type);
create index if not exists cm_analytics_snapshots_sprint_id_idx on public.cm_analytics_snapshots (sprint_id);
create index if not exists cm_analytics_snapshots_period_idx on public.cm_analytics_snapshots (period);
create index if not exists cm_analytics_snapshots_updated_at_idx on public.cm_analytics_snapshots (updated_at desc);

alter table public.cm_sprints enable row level security;
alter table public.cm_tasks enable row level security;
alter table public.cm_analytics_snapshots enable row level security;

do $$
begin
	if not exists (
		select 1
		from pg_policies
		where schemaname = 'public'
			and tablename = 'cm_sprints'
			and policyname = 'public full access to cm_sprints'
	) then
		create policy "public full access to cm_sprints"
			on public.cm_sprints
			for all
			to anon, authenticated
			using (true)
			with check (true);
	end if;

	if not exists (
		select 1
		from pg_policies
		where schemaname = 'public'
			and tablename = 'cm_tasks'
			and policyname = 'public full access to cm_tasks'
	) then
		create policy "public full access to cm_tasks"
			on public.cm_tasks
			for all
			to anon, authenticated
			using (true)
			with check (true);
	end if;

	if not exists (
		select 1
		from pg_policies
		where schemaname = 'public'
			and tablename = 'cm_analytics_snapshots'
			and policyname = 'public full access to cm_analytics_snapshots'
	) then
		create policy "public full access to cm_analytics_snapshots"
			on public.cm_analytics_snapshots
			for all
			to anon, authenticated
			using (true)
			with check (true);
	end if;
end $$;
