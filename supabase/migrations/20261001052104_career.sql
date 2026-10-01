-- Phase 4: study history and a recoverable, single-active focus timer.
create table public.study_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid,
  name text not null check (char_length(trim(name)) between 1 and 120),
  position integer not null default 0 check (position >= 0),
  archived_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id,user_id),
  foreign key (category_id,user_id) references public.categories(id,user_id) on delete no action deferrable initially deferred
);
create unique index study_categories_active_name on public.study_categories(user_id,lower(name)) where archived_at is null;
create index study_categories_parent_owner on public.study_categories(category_id,user_id);

create table public.focus_timers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  study_category_id uuid not null,
  challenge_id uuid,
  topic text not null default '' check (char_length(topic) <= 200),
  notes text not null default '' check (char_length(notes) <= 4000),
  timezone text not null check (char_length(timezone) between 1 and 80),
  status text not null check (status in ('running','paused','finished','discarded')),
  running_since timestamptz,
  accumulated_seconds integer not null default 0 check (accumulated_seconds between 0 and 604800),
  segments jsonb not null default '[]'::jsonb check (jsonb_typeof(segments) = 'array'),
  revision bigint not null default nextval('public.tracking_revision_seq'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id,user_id),
  foreign key (study_category_id,user_id) references public.study_categories(id,user_id) on delete restrict,
  foreign key (challenge_id,user_id) references public.challenges(id,user_id) on delete set null (challenge_id),
  check ((status = 'running') = (running_since is not null))
);
create unique index focus_timers_one_active on public.focus_timers(user_id) where status in ('running','paused');
create index focus_timers_category_owner on public.focus_timers(study_category_id,user_id);
create index focus_timers_challenge_owner on public.focus_timers(challenge_id,user_id);

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  study_category_id uuid not null,
  challenge_id uuid,
  timer_id uuid,
  topic text not null default '' check (char_length(topic) <= 200),
  notes text not null default '' check (char_length(notes) <= 4000),
  business_date date not null,
  timezone text not null check (char_length(timezone) between 1 and 80),
  duration_seconds integer not null check (duration_seconds between 60 and 604800),
  start_at timestamptz, end_at timestamptz,
  segments jsonb not null default '[]'::jsonb check (jsonb_typeof(segments) = 'array'),
  source text not null check (source in ('manual','timer')),
  revision bigint not null default nextval('public.tracking_revision_seq'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id,user_id), unique (timer_id),
  foreign key (study_category_id,user_id) references public.study_categories(id,user_id) on delete restrict,
  foreign key (challenge_id,user_id) references public.challenges(id,user_id) on delete set null (challenge_id),
  foreign key (timer_id,user_id) references public.focus_timers(id,user_id) on delete restrict,
  check ((start_at is null) = (end_at is null)),
  check (end_at is null or end_at > start_at),
  check ((source = 'timer') = (timer_id is not null)),
  check (start_at is not null or segments = '[]'::jsonb)
);
create index study_sessions_owner_date on public.study_sessions(user_id,business_date);
create index study_sessions_category_owner on public.study_sessions(study_category_id,user_id);
create index study_sessions_challenge_owner on public.study_sessions(challenge_id,user_id);
create index study_sessions_timer_owner on public.study_sessions(timer_id,user_id);

do $$
declare table_name text;
begin
  foreach table_name in array array['study_categories','focus_timers','study_sessions'] loop
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
create trigger study_sessions_revision before update on public.study_sessions for each row execute function private.fitness_revision();
create trigger focus_timers_revision before update on public.focus_timers for each row execute function private.fitness_revision();

create function public.save_study_category(p_input jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); record_id uuid:=nullif(p_input->>'id','')::uuid; existing public.study_categories; saved public.study_categories;
begin
  if nullif(p_input->>'categoryId','') is not null and not exists(select 1 from public.categories where id=(p_input->>'categoryId')::uuid and user_id=owner_id and archived_at is null) then raise exception 'Category unavailable' using errcode='42501'; end if;
  if record_id is null then
    insert into public.study_categories(user_id,category_id,name,position) values(owner_id,nullif(p_input->>'categoryId','')::uuid,p_input->>'name',coalesce((p_input->>'position')::integer,0)) returning * into saved;
  else
    select * into existing from public.study_categories where id=record_id and user_id=owner_id for update;
    if not found or existing.archived_at is not null then raise exception 'Study category unavailable' using errcode='42501'; end if;
    if existing.updated_at is distinct from (p_input->>'expectedUpdatedAt')::timestamptz then raise exception 'Study category changed' using errcode='40001'; end if;
    update public.study_categories set name=p_input->>'name',category_id=nullif(p_input->>'categoryId','')::uuid,position=coalesce((p_input->>'position')::integer,0),archived_at=case when coalesce((p_input->>'archive')::boolean,false) then now() else null end
      where id=record_id and user_id=owner_id returning * into saved;
  end if;
  return to_jsonb(saved);
end;
$$;

create function public.setup_career(p_input jsonb) returns void language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); preferences public.user_preferences; today_value date; study_metric_id uuid; study_target_id uuid; selected_id uuid;
  daily_minutes numeric:=(p_input->>'dailyMinutes')::numeric; weekly_minutes numeric:=(p_input->>'weeklyMinutes')::numeric;
begin
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':career-setup',0));
  select * into strict preferences from public.user_preferences where user_id=owner_id;
  today_value:=(now() at time zone preferences.timezone)::date;
  if daily_minutes is not null and (daily_minutes<=0 or daily_minutes>10080) or weekly_minutes is not null and (weekly_minutes<=0 or weekly_minutes>10080) then raise exception 'Study target must be positive and at most 10080 minutes' using errcode='23514'; end if;
  selected_id:=preferences.selected_challenge_id;
  insert into public.metric_definitions(user_id,name,unit,source,aggregation,active_from,source_available_from,starter_key)
    values(owner_id,'Study duration','minutes','study','sum',today_value,today_value,'study-duration') on conflict(user_id,starter_key) do nothing;
  update public.metric_definitions set source_available_from=today_value where user_id=owner_id and starter_key='study-duration' and source_available_from is null and archived_on is null;
  select id into study_metric_id from public.metric_definitions where user_id=owner_id and starter_key='study-duration' and archived_on is null;
  if study_metric_id is not null then
    if selected_id is not null then insert into public.challenge_metrics(user_id,challenge_id,metric_id) values(owner_id,selected_id,study_metric_id) on conflict do nothing; end if;
    if daily_minutes is not null and not exists(select 1 from public.metric_targets where user_id=owner_id and metric_id=study_metric_id and period='daily') then
      insert into public.metric_targets(user_id,metric_id,period,direction,target,effective_from,timezone,week_starts_on) values(owner_id,study_metric_id,'daily','minimum',daily_minutes,today_value,preferences.timezone,preferences.week_starts_on);
    end if;
    if weekly_minutes is not null and not exists(select 1 from public.metric_targets where user_id=owner_id and metric_id=study_metric_id and period='weekly') then
      insert into public.metric_targets(user_id,metric_id,period,direction,target,effective_from,timezone,week_starts_on) values(owner_id,study_metric_id,'weekly','minimum',weekly_minutes,today_value,preferences.timezone,preferences.week_starts_on);
    end if;
  end if;
  insert into public.frequency_targets(user_id,name,source,count_mode,active_from,source_available_from,starter_key)
    values(owner_id,'Study sessions','study_sessions','sessions',today_value,today_value,'study-sessions') on conflict(user_id,starter_key) do nothing;
  update public.frequency_targets set source_available_from=today_value where user_id=owner_id and starter_key='study-sessions' and source_available_from is null and archived_on is null;
  select id into study_target_id from public.frequency_targets where user_id=owner_id and starter_key='study-sessions' and archived_on is null;
  if study_target_id is not null then
    if not exists(select 1 from public.frequency_target_rules where user_id=owner_id and frequency_target_id=study_target_id) then
      insert into public.frequency_target_rules(user_id,frequency_target_id,period,quota,effective_from,timezone,week_starts_on) values(owner_id,study_target_id,'weekly',5,today_value,preferences.timezone,preferences.week_starts_on);
    end if;
    if selected_id is not null then insert into public.challenge_targets(user_id,challenge_id,frequency_target_id) values(owner_id,selected_id,study_target_id) on conflict do nothing; end if;
  end if;
end;
$$;

create function public.save_study_session(p_input jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); preferences public.user_preferences; existing public.study_sessions; saved public.study_sessions;
  record_id uuid:=nullif(p_input->>'id','')::uuid; category_id_value uuid:=(p_input->>'categoryId')::uuid;
  date_value date:=(p_input->>'date')::date; start_value timestamptz:=nullif(p_input->>'startAt','')::timestamptz; end_value timestamptz:=nullif(p_input->>'endAt','')::timestamptz;
  duration_value integer:=(p_input->>'durationSeconds')::integer; timezone_value text; challenge_id_value uuid:=nullif(p_input->>'challengeId','')::uuid;
begin
  select * into strict preferences from public.user_preferences where user_id=owner_id;
  if record_id is not null then
    select * into existing from public.study_sessions where id=record_id and user_id=owner_id for update;
    if not found or existing.source<>'manual' then raise exception 'Manual session unavailable' using errcode='42501'; end if;
    if existing.revision is distinct from (p_input->>'expectedRevision')::bigint then raise exception 'Study session changed' using errcode='40001'; end if;
  end if;
  if coalesce((p_input->>'delete')::boolean,false) then
    if record_id is null then raise exception 'Choose a session to delete' using errcode='23514'; end if;
    delete from public.study_sessions where id=record_id and user_id=owner_id;
    return 'null'::jsonb;
  end if;
  if date_value is null or date_value>(now() at time zone preferences.timezone)::date then raise exception 'Choose a past or current study date' using errcode='23514'; end if;
  if not exists(select 1 from public.study_categories where id=category_id_value and user_id=owner_id and (archived_at is null or id=existing.study_category_id)) then raise exception 'Study category unavailable' using errcode='42501'; end if;
  if challenge_id_value is not null and not exists(select 1 from public.challenges where id=challenge_id_value and user_id=owner_id) then raise exception 'Challenge unavailable' using errcode='42501'; end if;
  if (start_value is null)<>(end_value is null) then raise exception 'Enter both timestamps or duration only' using errcode='23514'; end if;
  timezone_value:=coalesce(existing.timezone,preferences.timezone);
  if end_value is not null then
    if end_value<=start_value or abs(extract(epoch from(end_value-start_value))-duration_value)>=1 or (end_value at time zone timezone_value)::date<>date_value then raise exception 'Study timestamps and duration disagree' using errcode='23514'; end if;
  end if;
  if duration_value is null or duration_value<60 or duration_value>604800 then raise exception 'Study duration must be 1 minute to 7 days' using errcode='23514'; end if;
  if record_id is null then
    insert into public.study_sessions(user_id,study_category_id,challenge_id,topic,notes,business_date,timezone,duration_seconds,start_at,end_at,segments,source)
      values(owner_id,category_id_value,challenge_id_value,coalesce(p_input->>'topic',''),coalesce(p_input->>'notes',''),date_value,timezone_value,duration_value,start_value,end_value,
        case when start_value is null then '[]'::jsonb else jsonb_build_array(jsonb_build_object('start',start_value,'end',end_value)) end,'manual') returning * into saved;
  else
    update public.study_sessions set study_category_id=category_id_value,challenge_id=challenge_id_value,topic=coalesce(p_input->>'topic',''),notes=coalesce(p_input->>'notes',''),business_date=date_value,
      duration_seconds=duration_value,start_at=start_value,end_at=end_value,segments=case when start_value is null then '[]'::jsonb else jsonb_build_array(jsonb_build_object('start',start_value,'end',end_value)) end
      where id=record_id and user_id=owner_id returning * into saved;
  end if;
  update public.metric_definitions set source_available_from=date_value where user_id=owner_id and source='study' and source_available_from is null and active_from<=date_value;
  update public.frequency_targets set source_available_from=date_value where user_id=owner_id and source='study_sessions' and source_available_from is null and active_from<=date_value;
  return to_jsonb(saved);
end;
$$;

create function public.start_focus_timer(p_input jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); preferences public.user_preferences; saved public.focus_timers; category_id_value uuid:=(p_input->>'categoryId')::uuid; challenge_id_value uuid:=nullif(p_input->>'challengeId','')::uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':focus-timer',0));
  select * into strict preferences from public.user_preferences where user_id=owner_id;
  if exists(select 1 from public.focus_timers where user_id=owner_id and status in ('running','paused')) then raise exception 'A focus timer is already active' using errcode='23505'; end if;
  if not exists(select 1 from public.study_categories where id=category_id_value and user_id=owner_id and archived_at is null) then raise exception 'Study category unavailable' using errcode='42501'; end if;
  if challenge_id_value is not null and not exists(select 1 from public.challenges where id=challenge_id_value and user_id=owner_id) then raise exception 'Challenge unavailable' using errcode='42501'; end if;
  insert into public.focus_timers(user_id,study_category_id,challenge_id,topic,notes,timezone,status,running_since)
    values(owner_id,category_id_value,challenge_id_value,coalesce(p_input->>'topic',''),coalesce(p_input->>'notes',''),preferences.timezone,'running',clock_timestamp()) returning * into saved;
  return to_jsonb(saved);
end;
$$;

create function public.control_focus_timer(p_id uuid,p_action text,p_expected_revision bigint) returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); timer_value public.focus_timers; saved public.focus_timers; session_value public.study_sessions;
  now_value timestamptz:=clock_timestamp(); duration_value integer; segments_value jsonb; first_start timestamptz;
begin
  select * into timer_value from public.focus_timers where id=p_id and user_id=owner_id for update;
  if not found then raise exception 'Timer unavailable' using errcode='42501'; end if;
  if p_action='finish' and timer_value.status='finished' then
    select * into session_value from public.study_sessions where user_id=owner_id and timer_id=p_id;
    if not found then raise exception 'Finished session unavailable' using errcode='23514'; end if;
    return jsonb_build_object('timer',to_jsonb(timer_value),'session',to_jsonb(session_value));
  end if;
  if timer_value.status not in ('running','paused') or p_expected_revision is distinct from timer_value.revision then raise exception 'Timer changed' using errcode='40001'; end if;
  if p_action='resume' then
    if timer_value.status<>'paused' then raise exception 'Timer is not paused' using errcode='23514'; end if;
    update public.focus_timers set status='running',running_since=now_value where id=p_id returning * into saved;
    return jsonb_build_object('timer',to_jsonb(saved));
  end if;
  if p_action not in ('pause','finish','discard') then raise exception 'Unsupported timer action' using errcode='23514'; end if;
  segments_value:=timer_value.segments;
  duration_value:=timer_value.accumulated_seconds;
  if timer_value.status='running' then
    duration_value:=duration_value+round(extract(epoch from(now_value-timer_value.running_since)))::integer;
    segments_value:=segments_value||jsonb_build_array(jsonb_build_object('start',timer_value.running_since,'end',now_value));
  end if;
  if duration_value>604800 then raise exception 'Timer exceeds seven days; discard or review it' using errcode='23514'; end if;
  if p_action='pause' then
    if timer_value.status<>'running' then raise exception 'Timer is already paused' using errcode='23514'; end if;
    update public.focus_timers set status='paused',running_since=null,accumulated_seconds=duration_value,segments=segments_value where id=p_id returning * into saved;
    return jsonb_build_object('timer',to_jsonb(saved));
  end if;
  if p_action='discard' then
    update public.focus_timers set status='discarded',running_since=null,accumulated_seconds=duration_value,segments=segments_value where id=p_id returning * into saved;
    return jsonb_build_object('timer',to_jsonb(saved));
  end if;
  if duration_value<60 then raise exception 'Study for at least one minute or discard the timer' using errcode='23514'; end if;
  first_start:=(segments_value->0->>'start')::timestamptz;
  update public.focus_timers set status='finished',running_since=null,accumulated_seconds=duration_value,segments=segments_value where id=p_id returning * into saved;
  insert into public.study_sessions(user_id,study_category_id,challenge_id,timer_id,topic,notes,business_date,timezone,duration_seconds,start_at,end_at,segments,source)
    values(owner_id,saved.study_category_id,saved.challenge_id,saved.id,saved.topic,saved.notes,(now_value at time zone saved.timezone)::date,saved.timezone,
      duration_value,first_start,now_value,segments_value,'timer') returning * into session_value;
  update public.metric_definitions set source_available_from=(now_value at time zone saved.timezone)::date where user_id=owner_id and source='study' and source_available_from is null and active_from<=(now_value at time zone saved.timezone)::date;
  update public.frequency_targets set source_available_from=(now_value at time zone saved.timezone)::date where user_id=owner_id and source='study_sessions' and source_available_from is null and active_from<=(now_value at time zone saved.timezone)::date;
  return jsonb_build_object('timer',to_jsonb(saved),'session',to_jsonb(session_value));
end;
$$;

revoke all on function public.save_study_category(jsonb),public.setup_career(jsonb),public.save_study_session(jsonb),public.start_focus_timer(jsonb),public.control_focus_timer(uuid,text,bigint) from public,anon;
grant execute on function public.save_study_category(jsonb),public.setup_career(jsonb),public.save_study_session(jsonb),public.start_focus_timer(jsonb),public.control_focus_timer(uuid,text,bigint) to authenticated;
