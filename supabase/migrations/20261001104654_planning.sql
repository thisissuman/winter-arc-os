-- Phase 5 planning. Every reference includes the owner; mutations run through checked RPCs.
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  description text not null default '' check (char_length(description) <= 4000),
  category_id uuid, challenge_id uuid, target_date date,
  status text not null default 'active' check (status in ('active','paused','completed','archived')),
  progress_mode text not null default 'manual' check (progress_mode in ('manual','milestone','metric')),
  manual_percent numeric not null default 0 check (manual_percent between 0 and 100),
  metric_id uuid, metric_aggregation text check (metric_aggregation in ('latest','sum','count')),
  metric_start_date date, metric_end_date date, metric_baseline numeric, metric_target numeric,
  is_private boolean not null default true,
  revision bigint not null default nextval('public.tracking_revision_seq'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id,user_id),
  foreign key (category_id,user_id) references public.categories(id,user_id) on delete no action deferrable initially deferred,
  foreign key (challenge_id,user_id) references public.challenges(id,user_id) on delete set null (challenge_id),
  foreign key (metric_id,user_id) references public.metric_definitions(id,user_id) on delete no action deferrable initially deferred,
  check (metric_end_date is null or metric_start_date <= metric_end_date),
  check (
    (progress_mode = 'metric' and metric_id is not null and metric_aggregation is not null and metric_start_date is not null
      and metric_baseline is not null and metric_target is not null and metric_baseline <> metric_target)
    or (progress_mode <> 'metric' and metric_id is null and metric_aggregation is null and metric_start_date is null
      and metric_end_date is null and metric_baseline is null and metric_target is null)
  ),
  check (metric_baseline is null or abs(metric_baseline) <= 1e12),
  check (metric_target is null or abs(metric_target) <= 1e12)
);
create index goals_owner_status on public.goals(user_id,status,target_date);
create index goals_category_owner on public.goals(category_id,user_id);
create index goals_challenge_owner on public.goals(challenge_id,user_id);
create index goals_metric_owner on public.goals(metric_id,user_id);

create table public.goal_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null,
  title text not null check (char_length(trim(title)) between 1 and 160),
  position integer not null default 0 check (position between 0 and 2000000000),
  completed_at timestamptz,
  revision bigint not null default nextval('public.tracking_revision_seq'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id,user_id),
  foreign key (goal_id,user_id) references public.goals(id,user_id) on delete cascade
);
create index goal_milestones_owner_goal on public.goal_milestones(user_id,goal_id,position);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  notes text not null default '' check (char_length(notes) <= 4000),
  business_date date not null, timezone text not null check (char_length(timezone) between 1 and 80),
  status text not null default 'todo' check (status in ('todo','in_progress','completed')),
  completed_at timestamptz,
  priority text not null default 'normal' check (priority in ('low','normal','high')),
  category_id uuid, goal_id uuid, challenge_id uuid,
  position integer not null default 0 check (position between 0 and 2000000000),
  estimated_seconds integer check (estimated_seconds between 0 and 604800),
  actual_seconds integer check (actual_seconds between 0 and 604800),
  is_private boolean not null default true,
  revision bigint not null default nextval('public.tracking_revision_seq'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id,user_id),
  foreign key (category_id,user_id) references public.categories(id,user_id) on delete no action deferrable initially deferred,
  foreign key (goal_id,user_id) references public.goals(id,user_id) on delete set null (goal_id),
  foreign key (challenge_id,user_id) references public.challenges(id,user_id) on delete set null (challenge_id),
  check ((status = 'completed') = (completed_at is not null))
);
create index tasks_owner_date_position on public.tasks(user_id,business_date,position,id);
create index tasks_category_owner on public.tasks(category_id,user_id);
create index tasks_goal_owner on public.tasks(goal_id,user_id);
create index tasks_challenge_owner on public.tasks(challenge_id,user_id);

create table public.task_carry_operations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  operation_id uuid not null,
  source_date date not null, target_date date not null,
  mode text not null check (mode in ('move','copy')),
  result_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id,user_id), unique (user_id,operation_id), check (target_date > source_date)
);
create index task_carry_operations_owner_source on public.task_carry_operations(user_id,source_date);

do $$
declare table_name text;
begin
  foreach table_name in array array['goals','goal_milestones','tasks','task_carry_operations'] loop
    execute format('alter table public.%I enable row level security',table_name);
    execute format('revoke all on public.%I from public,anon,authenticated',table_name);
    execute format('grant select on public.%I to authenticated',table_name);
    execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)',table_name||'_select',table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',table_name||'_insert',table_name);
    execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',table_name||'_update',table_name);
    execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',table_name||'_delete',table_name);
    execute format('create trigger %I before update on public.%I for each row execute function private.touch_updated_at()',table_name||'_updated',table_name);
  end loop;
end;
$$;
create trigger goals_revision before update on public.goals for each row execute function private.fitness_revision();
create trigger milestones_revision before update on public.goal_milestones for each row execute function private.fitness_revision();
create trigger tasks_revision before update on public.tasks for each row execute function private.fitness_revision();

create function public.save_planning_task(p_input jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); preferences public.user_preferences; existing public.tasks; saved public.tasks;
  record_id uuid:=nullif(p_input->>'id','')::uuid; date_value date:=(p_input->>'date')::date;
  category_value uuid:=nullif(p_input->>'categoryId','')::uuid; goal_value uuid:=nullif(p_input->>'goalId','')::uuid;
  challenge_value uuid:=nullif(p_input->>'challengeId','')::uuid; status_value text:=p_input->>'status';
  position_value integer;
begin
  select * into strict preferences from public.user_preferences where user_id=owner_id;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':planning-tasks',0));
  if record_id is not null then
    select * into existing from public.tasks where id=record_id and user_id=owner_id for update;
    if not found then raise exception 'Task unavailable' using errcode='42501'; end if;
    if existing.revision is distinct from (p_input->>'expectedRevision')::bigint then raise exception 'Task changed' using errcode='40001'; end if;
  end if;
  if coalesce((p_input->>'delete')::boolean,false) then
    if record_id is null then raise exception 'Choose a task to delete' using errcode='23514'; end if;
    delete from public.tasks where id=record_id and user_id=owner_id;
    return 'null'::jsonb;
  end if;
  if date_value is null then raise exception 'Choose a task date' using errcode='23514'; end if;
  if category_value is not null and not exists(select 1 from public.categories where id=category_value and user_id=owner_id and (archived_at is null or id=existing.category_id)) then raise exception 'Category unavailable' using errcode='42501'; end if;
  if goal_value is not null and not exists(select 1 from public.goals where id=goal_value and user_id=owner_id and (status<>'archived' or id=existing.goal_id)) then raise exception 'Goal unavailable' using errcode='42501'; end if;
  if challenge_value is not null and not exists(select 1 from public.challenges where id=challenge_value and user_id=owner_id and (status<>'archived' or id=existing.challenge_id)) then raise exception 'Challenge unavailable' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':tasks:'||date_value::text,0));
  if record_id is null or existing.business_date<>date_value then
    select coalesce(max(position),0)+1000 into position_value from public.tasks where user_id=owner_id and business_date=date_value;
  else position_value:=existing.position; end if;
  if record_id is null then
    insert into public.tasks(user_id,title,notes,business_date,timezone,status,completed_at,priority,category_id,goal_id,challenge_id,position,estimated_seconds,actual_seconds,is_private)
      values(owner_id,p_input->>'title',coalesce(p_input->>'notes',''),date_value,preferences.timezone,status_value,
        case when status_value='completed' then now() else null end,coalesce(p_input->>'priority','normal'),category_value,goal_value,challenge_value,
        position_value,nullif(p_input->>'estimatedSeconds','')::integer,nullif(p_input->>'actualSeconds','')::integer,coalesce((p_input->>'isPrivate')::boolean,true)) returning * into saved;
  else
    update public.tasks set title=p_input->>'title',notes=coalesce(p_input->>'notes',''),business_date=date_value,
      status=status_value,completed_at=case when status_value='completed' then coalesce(existing.completed_at,now()) else null end,
      priority=coalesce(p_input->>'priority','normal'),category_id=category_value,goal_id=goal_value,challenge_id=challenge_value,
      position=position_value,estimated_seconds=nullif(p_input->>'estimatedSeconds','')::integer,
      actual_seconds=nullif(p_input->>'actualSeconds','')::integer,is_private=coalesce((p_input->>'isPrivate')::boolean,true)
      where id=record_id and user_id=owner_id returning * into saved;
  end if;
  return to_jsonb(saved);
end;
$$;

create function public.set_planning_task_status(p_id uuid,p_status text,p_expected_revision bigint) returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); existing public.tasks; saved public.tasks;
begin
  if p_status not in ('todo','in_progress','completed') then raise exception 'Invalid task status' using errcode='23514'; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':planning-tasks',0));
  select * into existing from public.tasks where id=p_id and user_id=owner_id for update;
  if not found then raise exception 'Task unavailable' using errcode='42501'; end if;
  if existing.revision is distinct from p_expected_revision then raise exception 'Task changed' using errcode='40001'; end if;
  if existing.status=p_status then return to_jsonb(existing); end if;
  update public.tasks set status=p_status,completed_at=case when p_status='completed' then now() else null end
    where id=p_id and user_id=owner_id returning * into saved;
  return to_jsonb(saved);
end;
$$;

create function public.move_planning_task(p_id uuid,p_direction text,p_expected_revision bigint) returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); existing public.tasks; neighbor public.tasks; saved public.tasks; old_position integer;
begin
  if p_direction not in ('up','down') then raise exception 'Invalid reorder direction' using errcode='23514'; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':planning-tasks',0));
  select * into existing from public.tasks where id=p_id and user_id=owner_id for update;
  if not found then raise exception 'Task unavailable' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':tasks:'||existing.business_date::text,0));
  if existing.revision is distinct from p_expected_revision then raise exception 'Task changed' using errcode='40001'; end if;
  if p_direction='up' then
    select * into neighbor from public.tasks where user_id=owner_id and business_date=existing.business_date and id<>p_id and position<existing.position order by position desc,id desc limit 1 for update;
  else
    select * into neighbor from public.tasks where user_id=owner_id and business_date=existing.business_date and id<>p_id and position>existing.position order by position,id limit 1 for update;
  end if;
  if neighbor.id is null then return to_jsonb(existing); end if;
  old_position:=existing.position;
  update public.tasks set position=neighbor.position where id=p_id and user_id=owner_id returning * into saved;
  update public.tasks set position=old_position where id=neighbor.id and user_id=owner_id;
  return to_jsonb(saved);
end;
$$;

create function public.carry_planning_tasks(p_operation_id uuid,p_source_date date,p_target_date date,p_mode text) returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); prior public.task_carry_operations; source_task public.tasks; copied_id uuid;
  results uuid[]:='{}'; next_position integer;
begin
  if p_operation_id is null or p_source_date is null or p_target_date is null or p_target_date<=p_source_date or p_mode not in ('move','copy') then
    raise exception 'Choose a later target date and move or copy' using errcode='23514';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':planning-tasks',0));
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':task-carry',0));
  select * into prior from public.task_carry_operations where user_id=owner_id and operation_id=p_operation_id;
  if found then
    if prior.source_date<>p_source_date or prior.target_date<>p_target_date or prior.mode<>p_mode then raise exception 'Operation ID reused for a different request' using errcode='23514'; end if;
    return to_jsonb(prior);
  end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':tasks:'||p_target_date::text,0));
  select coalesce(max(position),0) into next_position from public.tasks where user_id=owner_id and business_date=p_target_date;
  for source_task in select * from public.tasks where user_id=owner_id and business_date=p_source_date and status<>'completed' order by position,id for update loop
    next_position:=next_position+1000;
    if p_mode='move' then
      update public.tasks set business_date=p_target_date,position=next_position where id=source_task.id and user_id=owner_id;
      results:=array_append(results,source_task.id);
    else
      insert into public.tasks(user_id,title,notes,business_date,timezone,status,priority,category_id,goal_id,challenge_id,position,estimated_seconds,actual_seconds,is_private)
        values(owner_id,source_task.title,source_task.notes,p_target_date,source_task.timezone,source_task.status,source_task.priority,
          source_task.category_id,source_task.goal_id,source_task.challenge_id,next_position,source_task.estimated_seconds,source_task.actual_seconds,source_task.is_private)
        returning id into copied_id;
      results:=array_append(results,copied_id);
    end if;
  end loop;
  insert into public.task_carry_operations(user_id,operation_id,source_date,target_date,mode,result_ids)
    values(owner_id,p_operation_id,p_source_date,p_target_date,p_mode,results) returning * into prior;
  return to_jsonb(prior);
end;
$$;

create function public.save_planning_goal(p_input jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); existing public.goals; saved public.goals;
  record_id uuid:=nullif(p_input->>'id','')::uuid; category_value uuid:=nullif(p_input->>'categoryId','')::uuid;
  challenge_value uuid:=nullif(p_input->>'challengeId','')::uuid; metric_value uuid:=nullif(p_input->>'metricId','')::uuid;
  mode_value text:=p_input->>'progressMode'; status_value text:=coalesce(p_input->>'status','active');
begin
  if record_id is not null then
    select * into existing from public.goals where id=record_id and user_id=owner_id for update;
    if not found then raise exception 'Goal unavailable' using errcode='42501'; end if;
    if existing.revision is distinct from (p_input->>'expectedRevision')::bigint then raise exception 'Goal changed' using errcode='40001'; end if;
  end if;
  if category_value is not null and not exists(select 1 from public.categories where id=category_value and user_id=owner_id and (archived_at is null or id=existing.category_id)) then raise exception 'Category unavailable' using errcode='42501'; end if;
  if challenge_value is not null and not exists(select 1 from public.challenges where id=challenge_value and user_id=owner_id and (status<>'archived' or id=existing.challenge_id)) then raise exception 'Challenge unavailable' using errcode='42501'; end if;
  if mode_value='metric' and not exists(select 1 from public.metric_definitions where id=metric_value and user_id=owner_id and (archived_on is null or id=existing.metric_id)) then raise exception 'Metric unavailable' using errcode='42501'; end if;
  if record_id is null then
    insert into public.goals(user_id,title,description,category_id,challenge_id,target_date,status,progress_mode,manual_percent,metric_id,metric_aggregation,metric_start_date,metric_end_date,metric_baseline,metric_target,is_private)
      values(owner_id,p_input->>'title',coalesce(p_input->>'description',''),category_value,challenge_value,nullif(p_input->>'targetDate','')::date,status_value,mode_value,
        coalesce((p_input->>'manualPercent')::numeric,0),case when mode_value='metric' then metric_value else null end,
        case when mode_value='metric' then p_input->>'metricAggregation' else null end,
        case when mode_value='metric' then nullif(p_input->>'metricStartDate','')::date else null end,
        case when mode_value='metric' then nullif(p_input->>'metricEndDate','')::date else null end,
        case when mode_value='metric' then (p_input->>'metricBaseline')::numeric else null end,
        case when mode_value='metric' then (p_input->>'metricTarget')::numeric else null end,
        coalesce((p_input->>'isPrivate')::boolean,true)) returning * into saved;
  else
    update public.goals set title=p_input->>'title',description=coalesce(p_input->>'description',''),category_id=category_value,challenge_id=challenge_value,
      target_date=nullif(p_input->>'targetDate','')::date,status=status_value,progress_mode=mode_value,
      manual_percent=coalesce((p_input->>'manualPercent')::numeric,0),metric_id=case when mode_value='metric' then metric_value else null end,
      metric_aggregation=case when mode_value='metric' then p_input->>'metricAggregation' else null end,
      metric_start_date=case when mode_value='metric' then nullif(p_input->>'metricStartDate','')::date else null end,
      metric_end_date=case when mode_value='metric' then nullif(p_input->>'metricEndDate','')::date else null end,
      metric_baseline=case when mode_value='metric' then (p_input->>'metricBaseline')::numeric else null end,
      metric_target=case when mode_value='metric' then (p_input->>'metricTarget')::numeric else null end,
      is_private=coalesce((p_input->>'isPrivate')::boolean,true)
      where id=record_id and user_id=owner_id returning * into saved;
  end if;
  return to_jsonb(saved);
end;
$$;

create function public.save_goal_milestone(p_input jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); parent public.goals; existing public.goal_milestones; saved public.goal_milestones;
  record_id uuid:=nullif(p_input->>'id','')::uuid; goal_value uuid:=(p_input->>'goalId')::uuid; position_value integer;
begin
  select * into parent from public.goals where id=goal_value and user_id=owner_id for update;
  if not found or parent.status='archived' then raise exception 'Goal unavailable' using errcode='42501'; end if;
  if record_id is not null then
    select * into existing from public.goal_milestones where id=record_id and user_id=owner_id and goal_id=goal_value for update;
    if not found then raise exception 'Milestone unavailable' using errcode='42501'; end if;
    if existing.revision is distinct from (p_input->>'expectedRevision')::bigint then raise exception 'Milestone changed' using errcode='40001'; end if;
  end if;
  if coalesce((p_input->>'delete')::boolean,false) then
    if record_id is null then raise exception 'Choose a milestone to delete' using errcode='23514'; end if;
    delete from public.goal_milestones where id=record_id and user_id=owner_id;
    return 'null'::jsonb;
  end if;
  if record_id is null then
    select coalesce(max(position),0)+1000 into position_value from public.goal_milestones where user_id=owner_id and goal_id=goal_value;
    insert into public.goal_milestones(user_id,goal_id,title,position,completed_at)
      values(owner_id,goal_value,p_input->>'title',position_value,case when coalesce((p_input->>'completed')::boolean,false) then now() else null end) returning * into saved;
  else
    update public.goal_milestones set title=p_input->>'title',completed_at=case when coalesce((p_input->>'completed')::boolean,false) then coalesce(existing.completed_at,now()) else null end
      where id=record_id and user_id=owner_id returning * into saved;
  end if;
  return to_jsonb(saved);
end;
$$;

revoke all on function public.save_planning_task(jsonb),public.set_planning_task_status(uuid,text,bigint),public.move_planning_task(uuid,text,bigint),
  public.carry_planning_tasks(uuid,date,date,text),public.save_planning_goal(jsonb),public.save_goal_milestone(jsonb) from public,anon;
grant execute on function public.save_planning_task(jsonb),public.set_planning_task_status(uuid,text,bigint),public.move_planning_task(uuid,text,bigint),
  public.carry_planning_tasks(uuid,date,date,text),public.save_planning_goal(jsonb),public.save_goal_milestone(jsonb) to authenticated;
