alter table public.cm_tasks
  add column if not exists active_started_at timestamptz,
  add column if not exists active_status text;

create index if not exists cm_tasks_active_started_at_idx on public.cm_tasks (active_started_at);

create or replace function public.cm_start_task_timer(
  p_task_id text,
  p_user_id text,
  p_status text
)
returns setof public.cm_tasks
language plpgsql
as $$
declare
  v_updated_at bigint;
begin
  v_updated_at := floor(extract(epoch from timezone('utc', now())) * 1000)::bigint;

  return query
  update public.cm_tasks
  set
    active_started_at = timezone('utc', now()),
    active_status = p_status,
    updated_at = v_updated_at
  where id = p_task_id
    and user_id = p_user_id
  returning *;
end;
$$;

create or replace function public.cm_tick_task_timer(
  p_task_id text,
  p_user_id text
)
returns setof public.cm_tasks
language plpgsql
as $$
declare
  v_now timestamptz := timezone('utc', now());
  v_updated_at bigint;
  v_elapsed bigint := 0;
  v_status text;
begin
  v_updated_at := floor(extract(epoch from v_now) * 1000)::bigint;

  select
    greatest(
      0,
      coalesce(floor(extract(epoch from (v_now - active_started_at))), 0)::bigint
    ),
    coalesce(active_status, status)
  into v_elapsed, v_status
  from public.cm_tasks
  where id = p_task_id
    and user_id = p_user_id
    and active_started_at is not null;

  if v_elapsed <= 0 then
    return query
    select *
    from public.cm_tasks
    where id = p_task_id
      and user_id = p_user_id;
    return;
  end if;

  return query
  update public.cm_tasks
  set
    total_seconds = total_seconds + v_elapsed,
    phase_seconds = case
      when classification = 'sprintly' then
        jsonb_set(
          coalesce(phase_seconds, '{}'::jsonb),
          array[v_status],
          to_jsonb(coalesce((phase_seconds->>v_status)::bigint, 0) + v_elapsed),
          true
        )
      else phase_seconds
    end,
    active_started_at = v_now,
    active_status = v_status,
    updated_at = v_updated_at
  where id = p_task_id
    and user_id = p_user_id
  returning *;
end;
$$;

create or replace function public.cm_stop_task_timer(
  p_task_id text,
  p_user_id text
)
returns setof public.cm_tasks
language plpgsql
as $$
declare
  v_now timestamptz := timezone('utc', now());
  v_updated_at bigint;
  v_elapsed bigint := 0;
  v_status text;
begin
  v_updated_at := floor(extract(epoch from v_now) * 1000)::bigint;

  select
    greatest(
      0,
      coalesce(floor(extract(epoch from (v_now - active_started_at))), 0)::bigint
    ),
    coalesce(active_status, status)
  into v_elapsed, v_status
  from public.cm_tasks
  where id = p_task_id
    and user_id = p_user_id;

  return query
  update public.cm_tasks
  set
    total_seconds = total_seconds + v_elapsed,
    phase_seconds = case
      when classification = 'sprintly' then
        jsonb_set(
          coalesce(phase_seconds, '{}'::jsonb),
          array[v_status],
          to_jsonb(coalesce((phase_seconds->>v_status)::bigint, 0) + v_elapsed),
          true
        )
      else phase_seconds
    end,
    active_started_at = null,
    active_status = null,
    updated_at = v_updated_at
  where id = p_task_id
    and user_id = p_user_id
  returning *;
end;
$$;