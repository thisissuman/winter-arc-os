-- Phase 3 fitness records. Source logs stay distinct from derived metric definitions.
create table public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_date date not null,
  timezone text not null check (char_length(timezone) between 1 and 80),
  sleep_start_at timestamptz,
  wake_at timestamptz,
  duration_seconds integer not null check (duration_seconds between 60 and 86400),
  quality smallint check (quality between 1 and 5),
  notes text not null default '' check (char_length(notes) <= 4000),
  revision bigint not null default nextval('public.tracking_revision_seq'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id,user_id), unique (user_id,business_date),
  check ((sleep_start_at is null) = (wake_at is null)),
  check (wake_at is null or (wake_at > sleep_start_at and abs(extract(epoch from (wake_at - sleep_start_at)) - duration_seconds) < 1))
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  muscle_group text not null check (char_length(trim(muscle_group)) between 1 and 80),
  archived_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id,user_id)
);
create unique index exercises_owner_name_active on public.exercises(user_id,lower(name)) where archived_at is null;

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_date date not null,
  timezone text not null check (char_length(timezone) between 1 and 80),
  name text not null check (char_length(trim(name)) between 1 and 120),
  duration_seconds integer check (duration_seconds between 60 and 86400),
  notes text not null default '' check (char_length(notes) <= 4000),
  status text not null default 'draft' check (status in ('draft','completed')),
  challenge_id uuid,
  revision bigint not null default nextval('public.tracking_revision_seq'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id,user_id),
  foreign key (challenge_id,user_id) references public.challenges(id,user_id) on delete set null (challenge_id)
);
create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid not null, exercise_id uuid not null,
  position integer not null check (position between 0 and 29),
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id,user_id), unique (workout_id,position),
  foreign key (workout_id,user_id) references public.workouts(id,user_id) on delete cascade,
  foreign key (exercise_id,user_id) references public.exercises(id,user_id) on delete restrict
);
create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_exercise_id uuid not null,
  set_number integer not null check (set_number between 1 and 50),
  weight_kg numeric not null check (weight_kg between 0 and 2000),
  reps integer not null check (reps between 1 and 1000),
  rpe numeric check (rpe between 1 and 10),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id,user_id), unique (workout_exercise_id,set_number),
  foreign key (workout_exercise_id,user_id) references public.workout_exercises(id,user_id) on delete cascade
);
create table public.workout_operations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  operation_id uuid not null,
  source_workout_id uuid not null,
  target_date date not null,
  result_workout_id uuid not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id,user_id), unique (user_id,operation_id),
  foreign key (source_workout_id,user_id) references public.workouts(id,user_id) on delete cascade,
  foreign key (result_workout_id,user_id) references public.workouts(id,user_id) on delete cascade
);

create index sleep_logs_owner_date on public.sleep_logs(user_id,business_date);
create index workouts_owner_date_status on public.workouts(user_id,business_date,status);
create index workouts_challenge_owner on public.workouts(challenge_id,user_id);
create index workout_exercises_workout_owner on public.workout_exercises(workout_id,user_id,position);
create index workout_exercises_exercise_owner on public.workout_exercises(exercise_id,user_id);
create index workout_sets_parent_owner on public.workout_sets(workout_exercise_id,user_id,set_number);
create index workout_operations_source_owner on public.workout_operations(source_workout_id,user_id);
create index workout_operations_result_owner on public.workout_operations(result_workout_id,user_id);

do $$
declare table_name text;
begin
  foreach table_name in array array['sleep_logs','exercises','workouts','workout_exercises','workout_sets','workout_operations'] loop
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

create function private.fitness_revision() returns trigger language plpgsql set search_path = '' as $$
begin
  new.revision := nextval('public.tracking_revision_seq');
  return new;
end;
$$;
create trigger sleep_logs_revision before update on public.sleep_logs for each row execute function private.fitness_revision();
create trigger workouts_revision before update on public.workouts for each row execute function private.fitness_revision();

create function public.save_fitness_sleep(p_input jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); preferences public.user_preferences; existing public.sleep_logs; saved public.sleep_logs;
  date_value date:=(p_input->>'date')::date; start_value timestamptz:=nullif(p_input->>'sleepStartAt','')::timestamptz;
  wake_value timestamptz:=nullif(p_input->>'wakeAt','')::timestamptz;
begin
  select * into strict preferences from public.user_preferences where user_id=owner_id;
  if date_value is null or date_value>(now() at time zone preferences.timezone)::date then raise exception 'Choose a past or current wake date' using errcode='23514'; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':sleep:'||date_value::text,0));
  select * into existing from public.sleep_logs where user_id=owner_id and business_date=date_value for update;
  if existing.revision is distinct from (p_input->>'expectedRevision')::bigint then raise exception 'Sleep entry changed' using errcode='40001'; end if;
  if coalesce((p_input->>'clear')::boolean,false) then
    delete from public.sleep_logs where user_id=owner_id and business_date=date_value;
    return 'null'::jsonb;
  end if;
  if (start_value is null) <> (wake_value is null) then raise exception 'Use both timestamps or a duration' using errcode='23514'; end if;
  if wake_value is not null and (wake_value at time zone coalesce(existing.timezone,preferences.timezone))::date<>date_value then raise exception 'Wake timestamp must match the wake date' using errcode='23514'; end if;
  insert into public.sleep_logs(user_id,business_date,timezone,sleep_start_at,wake_at,duration_seconds,quality,notes)
    values(owner_id,date_value,coalesce(existing.timezone,preferences.timezone),start_value,wake_value,(p_input->>'durationSeconds')::integer,(p_input->>'quality')::smallint,coalesce(p_input->>'notes',''))
    on conflict(user_id,business_date) do update set sleep_start_at=excluded.sleep_start_at,wake_at=excluded.wake_at,duration_seconds=excluded.duration_seconds,quality=excluded.quality,notes=excluded.notes returning * into saved;
  update public.metric_definitions set source_available_from=coalesce(source_available_from,date_value)
    where user_id=owner_id and source='sleep' and source_available_from is null and active_from<=date_value;
  return to_jsonb(saved);
end;
$$;

create function public.save_fitness_exercise(p_input jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); record_id uuid:=nullif(p_input->>'id','')::uuid; existing public.exercises; saved public.exercises;
begin
  if record_id is null then
    insert into public.exercises(user_id,name,muscle_group) values(owner_id,p_input->>'name',p_input->>'muscleGroup') returning * into saved;
  else
    select * into existing from public.exercises where id=record_id and user_id=owner_id for update;
    if not found or existing.archived_at is not null then raise exception 'Exercise unavailable' using errcode='42501'; end if;
    if existing.updated_at is distinct from (p_input->>'expectedUpdatedAt')::timestamptz then raise exception 'Exercise changed' using errcode='40001'; end if;
    update public.exercises set name=p_input->>'name',muscle_group=p_input->>'muscleGroup',archived_at=case when coalesce((p_input->>'archive')::boolean,false) then now() else null end
      where id=record_id and user_id=owner_id returning * into saved;
  end if;
  return to_jsonb(saved);
end;
$$;

create function public.save_fitness_workout(p_input jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); preferences public.user_preferences; existing public.workouts; saved public.workouts;
  workout_id uuid:=nullif(p_input->>'id','')::uuid; date_value date:=(p_input->>'date')::date;
  item jsonb; set_item jsonb; child_id uuid; exercise_id_value uuid; position_value integer:=0; set_value integer;
begin
  select * into strict preferences from public.user_preferences where user_id=owner_id;
  if date_value is null or date_value>(now() at time zone preferences.timezone)::date then raise exception 'Choose a past or current workout date' using errcode='23514'; end if;
  if jsonb_typeof(p_input->'exercises')<>'array' or jsonb_array_length(p_input->'exercises')>30 then raise exception 'Invalid exercise list' using errcode='23514'; end if;
  if p_input->>'status'='completed' and jsonb_array_length(p_input->'exercises')=0 then raise exception 'Completed workouts need an exercise' using errcode='23514'; end if;
  if nullif(p_input->>'challengeId','') is not null and not exists(select 1 from public.challenges where id=(p_input->>'challengeId')::uuid and user_id=owner_id) then raise exception 'Challenge unavailable' using errcode='42501'; end if;
  if workout_id is null then
    insert into public.workouts(user_id,business_date,timezone,name,duration_seconds,notes,status,challenge_id)
      values(owner_id,date_value,preferences.timezone,p_input->>'name',(p_input->>'durationSeconds')::integer,coalesce(p_input->>'notes',''),p_input->>'status',nullif(p_input->>'challengeId','')::uuid) returning * into saved;
  else
    select * into existing from public.workouts where id=workout_id and user_id=owner_id for update;
    if not found then raise exception 'Workout unavailable' using errcode='42501'; end if;
    if existing.revision is distinct from (p_input->>'expectedRevision')::bigint then raise exception 'Workout changed' using errcode='40001'; end if;
    update public.workouts set business_date=date_value,name=p_input->>'name',duration_seconds=(p_input->>'durationSeconds')::integer,
      notes=coalesce(p_input->>'notes',''),status=p_input->>'status',challenge_id=nullif(p_input->>'challengeId','')::uuid
      where id=workout_id and user_id=owner_id returning * into saved;
    delete from public.workout_exercises where workout_id=workout_id and user_id=owner_id;
  end if;
  for item in select value from jsonb_array_elements(p_input->'exercises') loop
    exercise_id_value:=(item->>'exerciseId')::uuid;
    if not exists(select 1 from public.exercises where id=exercise_id_value and user_id=owner_id) then raise exception 'Exercise unavailable' using errcode='42501'; end if;
    if jsonb_typeof(item->'sets')<>'array' or jsonb_array_length(item->'sets') not between 1 and 50 then raise exception 'Invalid set list' using errcode='23514'; end if;
    insert into public.workout_exercises(user_id,workout_id,exercise_id,position,notes)
      values(owner_id,saved.id,exercise_id_value,position_value,coalesce(item->>'notes','')) returning id into child_id;
    set_value:=1;
    for set_item in select value from jsonb_array_elements(item->'sets') loop
      insert into public.workout_sets(user_id,workout_exercise_id,set_number,weight_kg,reps,rpe)
        values(owner_id,child_id,set_value,(set_item->>'weightKg')::numeric,(set_item->>'reps')::integer,(set_item->>'rpe')::numeric);
      set_value:=set_value+1;
    end loop;
    position_value:=position_value+1;
  end loop;
  if saved.status='completed' then
    update public.frequency_targets set source_available_from=coalesce(source_available_from,date_value)
      where user_id=owner_id and source='workouts' and source_available_from is null and active_from<=date_value;
  end if;
  return to_jsonb(saved);
end;
$$;

create function public.copy_fitness_workout(p_source_id uuid,p_date date,p_operation_id uuid) returns uuid language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); preferences public.user_preferences; source_row public.workouts; receipt public.workout_operations; copied_id uuid;
begin
  if p_source_id is null or p_date is null or p_operation_id is null then raise exception 'Copy request is incomplete' using errcode='23514'; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':workout-copy:'||p_operation_id::text,0));
  select * into receipt from public.workout_operations where user_id=owner_id and operation_id=p_operation_id;
  if found then
    if receipt.source_workout_id<>p_source_id or receipt.target_date<>p_date then raise exception 'Operation identifier already used' using errcode='40001'; end if;
    return receipt.result_workout_id;
  end if;
  select * into strict preferences from public.user_preferences where user_id=owner_id;
  if p_date>(now() at time zone preferences.timezone)::date then raise exception 'Choose a past or current workout date' using errcode='23514'; end if;
  select * into source_row from public.workouts where id=p_source_id and user_id=owner_id;
  if not found then raise exception 'Workout unavailable' using errcode='42501'; end if;
  insert into public.workouts(user_id,business_date,timezone,name,duration_seconds,notes,status,challenge_id)
    values(owner_id,p_date,preferences.timezone,source_row.name,source_row.duration_seconds,source_row.notes,'draft',source_row.challenge_id) returning id into copied_id;
  with copied_exercises as (
    insert into public.workout_exercises(user_id,workout_id,exercise_id,position,notes)
      select owner_id,copied_id,exercise_id,position,notes from public.workout_exercises where user_id=owner_id and workout_id=p_source_id order by position
      returning id,position
  )
  insert into public.workout_sets(user_id,workout_exercise_id,set_number,weight_kg,reps,rpe)
    select owner_id,ce.id,s.set_number,s.weight_kg,s.reps,s.rpe from copied_exercises ce
    join public.workout_exercises old on old.workout_id=p_source_id and old.user_id=owner_id and old.position=ce.position
    join public.workout_sets s on s.workout_exercise_id=old.id and s.user_id=owner_id;
  insert into public.workout_operations(user_id,operation_id,source_workout_id,target_date,result_workout_id)
    values(owner_id,p_operation_id,p_source_id,p_date,copied_id);
  return copied_id;
end;
$$;

create function public.delete_fitness_workout(p_id uuid,p_expected_revision bigint) returns void language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); existing public.workouts;
begin
  select * into existing from public.workouts where id=p_id and user_id=owner_id for update;
  if not found then raise exception 'Workout unavailable' using errcode='42501'; end if;
  if existing.revision is distinct from p_expected_revision then raise exception 'Workout changed' using errcode='40001'; end if;
  delete from public.workouts where id=p_id and user_id=owner_id;
end;
$$;

-- Explicit, idempotent fitness setup for accounts that skipped the full starter.
-- Existing starter source definitions are activated prospectively; no logs are inserted.
create function public.setup_fitness(p_input jsonb) returns void language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); preferences public.user_preferences; today_value date;
  loop_metric_id uuid; selected_metric_id uuid; habit_id uuid; target_id uuid; selected_id uuid;
  sleep_target numeric:=(p_input->>'sleepTarget')::numeric;
begin
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':fitness-setup',0));
  select * into strict preferences from public.user_preferences where user_id=owner_id;
  today_value:=(now() at time zone preferences.timezone)::date;
  if sleep_target is not null and (sleep_target<=0 or sleep_target>24) then raise exception 'Sleep target must be 0–24 hours' using errcode='23514'; end if;
  selected_id:=preferences.selected_challenge_id;
  select id into habit_id from public.habits where user_id=owner_id and starter_key='creatine';
  if habit_id is null then
    insert into public.habits(user_id,name,description,time_of_day,active_from,dosage_amount,dosage_unit,starter_key)
      values(owner_id,'Creatine','Daily supplement.','morning',today_value,3,'g','creatine') returning id into habit_id;
    insert into public.habit_schedules(user_id,habit_id,frequency,required_count,effective_from,timezone,week_starts_on)
      values(owner_id,habit_id,'DAILY',1,today_value,preferences.timezone,preferences.week_starts_on);
  end if;
  if selected_id is not null then insert into public.challenge_habits(user_id,challenge_id,habit_id) values(owner_id,selected_id,habit_id) on conflict do nothing; end if;
  -- Each key is unique per owner, including archived records; never resurrect an archived definition.
  insert into public.metric_definitions(user_id,name,unit,source,aggregation,active_from,source_available_from,starter_key)
    values(owner_id,'Protein','g','manual','sum',today_value,today_value,'protein'),
      (owner_id,'Water','ml','manual','sum',today_value,today_value,'water'),
      (owner_id,'Body weight','kg','manual','latest',today_value,today_value,'body-weight'),
      (owner_id,'Steps','steps','manual','sum',today_value,today_value,'steps'),
      (owner_id,'Sleep duration','hours','sleep','latest',today_value,today_value,'sleep')
    on conflict (user_id,starter_key) do nothing;
  update public.metric_definitions set source_available_from=today_value
    where user_id=owner_id and starter_key='sleep' and source_available_from is null and archived_on is null;
  for loop_metric_id in select id from public.metric_definitions where user_id=owner_id and starter_key in ('protein','water','body-weight','steps','sleep') and archived_on is null loop
    if selected_id is not null then insert into public.challenge_metrics(user_id,challenge_id,metric_id) values(owner_id,selected_id,loop_metric_id) on conflict do nothing; end if;
  end loop;
  select id into selected_metric_id from public.metric_definitions where user_id=owner_id and starter_key='protein' and archived_on is null;
  if selected_metric_id is not null and not exists(select 1 from public.metric_targets where user_id=owner_id and metric_id=selected_metric_id and period='daily') then
    insert into public.metric_targets(user_id,metric_id,period,direction,target,effective_from,timezone,week_starts_on)
      values(owner_id,selected_metric_id,'daily','minimum',130,today_value,preferences.timezone,preferences.week_starts_on);
  end if;
  select id into selected_metric_id from public.metric_definitions where user_id=owner_id and starter_key='water' and archived_on is null;
  if selected_metric_id is not null and not exists(select 1 from public.metric_targets where user_id=owner_id and metric_id=selected_metric_id and period='daily') then
    insert into public.metric_targets(user_id,metric_id,period,direction,target,effective_from,timezone,week_starts_on)
      values(owner_id,selected_metric_id,'daily','minimum',3500,today_value,preferences.timezone,preferences.week_starts_on);
  end if;
  select id into selected_metric_id from public.metric_definitions where user_id=owner_id and starter_key='sleep' and archived_on is null;
  if sleep_target is not null and selected_metric_id is not null and not exists(select 1 from public.metric_targets where user_id=owner_id and metric_id=selected_metric_id and period='daily') then
    insert into public.metric_targets(user_id,metric_id,period,direction,target,effective_from,timezone,week_starts_on)
      values(owner_id,selected_metric_id,'daily','minimum',sleep_target,today_value,preferences.timezone,preferences.week_starts_on);
  end if;
  insert into public.frequency_targets(user_id,name,source,count_mode,active_from,source_available_from,starter_key)
    values(owner_id,'Gym sessions','workouts','sessions',today_value,today_value,'gym') on conflict (user_id,starter_key) do nothing;
  update public.frequency_targets set source_available_from=today_value
    where user_id=owner_id and starter_key='gym' and source_available_from is null and archived_on is null;
  select id into target_id from public.frequency_targets where user_id=owner_id and starter_key='gym' and archived_on is null;
  if target_id is not null then
    if not exists(select 1 from public.frequency_target_rules where user_id=owner_id and frequency_target_id=target_id) then
      insert into public.frequency_target_rules(user_id,frequency_target_id,period,quota,effective_from,timezone,week_starts_on)
        values(owner_id,target_id,'weekly',4,today_value,preferences.timezone,preferences.week_starts_on);
    end if;
    if selected_id is not null then insert into public.challenge_targets(user_id,challenge_id,frequency_target_id) values(owner_id,selected_id,target_id) on conflict do nothing; end if;
  end if;
end;
$$;

revoke all on function public.save_fitness_sleep(jsonb),public.save_fitness_exercise(jsonb),public.save_fitness_workout(jsonb),public.copy_fitness_workout(uuid,date,uuid),public.delete_fitness_workout(uuid,bigint),public.setup_fitness(jsonb) from public,anon;
grant execute on function public.save_fitness_sleep(jsonb),public.save_fitness_exercise(jsonb),public.save_fitness_workout(jsonb),public.copy_fitness_workout(uuid,date,uuid),public.delete_fitness_workout(uuid,bigint),public.setup_fitness(jsonb) to authenticated;
