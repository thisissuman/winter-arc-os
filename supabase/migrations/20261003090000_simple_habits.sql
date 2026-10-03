-- Approved fresh start in the configured development project only.
-- Auth, profiles and essential preferences survive. Product history is discarded.
begin;
create temporary table reset_preservation_guard on commit drop as
select (select md5(coalesce(jsonb_agg(row(id,email) order by id)::text,'')) from auth.users) as accounts, (select md5(coalesce(jsonb_agg(row(user_id,display_name) order by user_id)::text,'')) from public.profiles) as profiles, (select md5(coalesce(jsonb_agg(row(user_id,timezone,week_starts_on,theme,privacy_mode) order by user_id)::text,'')) from public.user_preferences) as preferences;
alter table public.user_preferences drop column selected_challenge_id, drop column starter_applied_on,
  drop column onboarding_completed, drop column hide_private_today;
-- Drop named RPCs using their actual catalog signatures, without CASCADE.
do $$ declare r record; begin
 for r in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname = any(array['archive_tracking_definition','associate_tracking_challenge','carry_planning_tasks','complete_tracking_onboarding','control_focus_timer','copy_fitness_workout','delete_fitness_workout','delete_tracking_definition','increment_tracking_metric','move_planning_task','save_fitness_exercise','save_fitness_sleep','save_fitness_workout','save_goal_milestone','save_monthly_reflection','save_planning_goal','save_planning_task','save_study_category','save_study_session','save_tracking_challenge','save_tracking_frequency','save_tracking_habit','save_tracking_metric','save_tracking_score_category','save_tracking_score_policy','save_weekly_review','set_planning_task_status','setup_career','setup_fitness','start_focus_timer','write_tracking_habit_log','write_tracking_metric_log']) loop
 execute format('drop function %s',r.signature);
 end loop;
end $$;
drop table public.categories, public.challenge_habits, public.challenge_metrics, public.challenge_targets, public.challenges, public.exercises, public.focus_timers, public.frequency_target_rules, public.frequency_targets, public.goal_milestones, public.goals, public.life_areas, public.metric_definitions, public.metric_logs, public.metric_targets, public.monthly_reflections, public.score_categories, public.score_category_weights, public.score_items, public.score_policies, public.sleep_logs, public.study_categories, public.study_sessions, public.task_carry_operations, public.tasks, public.tracking_operations, public.weekly_reviews, public.workout_exercises, public.workout_operations, public.workout_sets, public.workouts, public.habit_logs, public.habit_schedules, public.habits;
do $$ declare r record; begin
 for r in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='private' and p.proname=any(array['fitness_revision','tracking_associations','tracking_log_revision','tracking_next_boundary','tracking_no_overlap','tracking_owner']) loop
 execute format('drop function %s',r.signature);
 end loop;
end $$;

create function private.habit_owner() returns uuid language plpgsql stable security definer set search_path='' as $$
declare owner_id uuid:=auth.uid(); begin
 if owner_id is null then raise exception 'Sign in required' using errcode='42501'; end if;
 return owner_id;
end $$;
create function private.valid_weekdays(days smallint[]) returns boolean language sql immutable set search_path='' as $$
 select coalesce(cardinality(days) between 1 and 7 and days <@ array[1,2,3,4,5,6,7]::smallint[]
 and array_position(days,null) is null and cardinality(days)=(select count(distinct d) from unnest(days) d),false)
$$;
create table public.habits (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check(name=trim(name) and char_length(name) between 1 and 80),
 active_from date not null, archived_from date check(archived_from>active_from),
 revision integer not null default 1 check(revision>0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create index habits_owner on public.habits(user_id);
create table public.habit_schedules (
 id uuid primary key default gen_random_uuid(),user_id uuid not null,habit_id uuid not null,
 weekdays smallint[] not null check(private.valid_weekdays(weekdays)),
 effective_from date not null, effective_until date check(effective_until>effective_from),
 created_at timestamptz not null default now(),
 foreign key(habit_id,user_id) references public.habits(id,user_id) on delete cascade,
 unique(habit_id,user_id,effective_from)
);
create index habit_schedules_owner on public.habit_schedules(user_id);
create table public.habit_logs (
 id uuid primary key default gen_random_uuid(),user_id uuid not null,habit_id uuid not null,
 business_date date not null,timezone text not null,completed boolean not null,
 revision integer not null default 1 check(revision>0),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 foreign key(habit_id,user_id) references public.habits(id,user_id) on delete cascade,
 unique(habit_id,user_id,business_date)
);
create index habit_logs_owner_date on public.habit_logs(user_id,business_date);
create trigger habits_updated before update on public.habits for each row execute function private.touch_updated_at();
create trigger habit_logs_updated before update on public.habit_logs for each row execute function private.touch_updated_at();
-- Serialize overlapping interval checks with the parent lock.
create function private.habit_schedule_guard() returns trigger language plpgsql set search_path='' as $$
begin
 perform 1 from public.habits where id=new.habit_id and user_id=new.user_id for update;
 if exists(select 1 from public.habit_schedules s where s.habit_id=new.habit_id and s.user_id=new.user_id
 and s.id<>new.id and daterange(s.effective_from,s.effective_until,'[)') && daterange(new.effective_from,new.effective_until,'[)')) then
 raise exception 'Schedules overlap' using errcode='23514'; end if;
 return new;
end $$;
create trigger schedule_guard before insert or update on public.habit_schedules for each row execute function private.habit_schedule_guard();
alter table public.habits enable row level security;
alter table public.habit_schedules enable row level security;
alter table public.habit_logs enable row level security;
create policy habits_owned on public.habits for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy schedules_owned on public.habit_schedules for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy logs_owned on public.habit_logs for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
-- RPCs are the only ordinary write path: clients cannot alter dates/revisions directly.
revoke all on public.habits,public.habit_schedules,public.habit_logs from public,anon,authenticated;
grant select on public.habits,public.habit_schedules,public.habit_logs to authenticated;
revoke insert,delete on public.profiles,public.user_preferences from authenticated;

create function public.save_habit(p_name text,p_weekdays smallint[],p_habit_id uuid default null,p_expected_revision integer default 0)
returns jsonb language plpgsql security definer set search_path='' as $$
declare owner_id uuid:=private.habit_owner(); today date; h public.habits; current_days smallint[];
begin
 select (now() at time zone timezone)::date into today from public.user_preferences where user_id=owner_id for update;
 if exists(select 1 from public.user_preferences where user_id=owner_id and privacy_mode) then raise exception 'Disable Privacy Mode to edit names' using errcode='23514'; end if;
 if p_name is null or char_length(trim(p_name)) not between 1 and 80 or not private.valid_weekdays(p_weekdays) then
 raise exception 'Use a name and at least one weekday' using errcode='23514'; end if;
 select array_agg(d order by d) into p_weekdays from unnest(p_weekdays) d;
 if p_habit_id is null then
 if p_expected_revision<>0 then raise exception 'Invalid revision' using errcode='23514'; end if;
 insert into public.habits(user_id,name,active_from) values(owner_id,trim(p_name),today) returning * into h;
 insert into public.habit_schedules(user_id,habit_id,weekdays,effective_from) values(owner_id,h.id,p_weekdays,today);
 else
 select * into h from public.habits where id=p_habit_id and user_id=owner_id for update;
 if h.id is null then raise exception 'Habit unavailable' using errcode='42501'; end if;
 if h.archived_from is not null then raise exception 'Archived habits cannot be edited' using errcode='23514'; end if;
 if p_expected_revision is distinct from h.revision then raise exception 'Habit changed. Reload and try again.' using errcode='40001'; end if;
 select weekdays into current_days from public.habit_schedules where habit_id=h.id and user_id=owner_id and effective_until is null;
 if current_days is distinct from p_weekdays then
 delete from public.habit_schedules where habit_id=h.id and user_id=owner_id and effective_from=today+1;
 update public.habit_schedules set effective_until=today+1 where habit_id=h.id and user_id=owner_id and effective_until is null;
 insert into public.habit_schedules(user_id,habit_id,weekdays,effective_from) values(owner_id,h.id,p_weekdays,today+1);
 end if;
 update public.habits set name=trim(p_name),revision=revision+1 where id=h.id returning * into h;
 end if;
 return to_jsonb(h);
end $$;

create function public.set_habit_completion(p_habit_id uuid,p_business_date date,p_completed boolean,p_expected_revision integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare owner_id uuid:=private.habit_owner(); h public.habits; l public.habit_logs; today date; tz text;
begin
 select timezone,(now() at time zone timezone)::date into tz,today from public.user_preferences where user_id=owner_id for update;
 select * into h from public.habits where id=p_habit_id and user_id=owner_id for update;
 if h.id is null then raise exception 'Habit unavailable' using errcode='42501'; end if;
 if p_completed is null or p_business_date is null or p_expected_revision is null or p_expected_revision<0 then raise exception 'Invalid completion' using errcode='23514'; end if;
 if p_business_date>today or p_business_date<h.active_from or (h.archived_from is not null and p_business_date>=h.archived_from)
 or not exists(select 1 from public.habit_schedules where habit_id=h.id and user_id=owner_id
 and effective_from<=p_business_date and (effective_until is null or effective_until>p_business_date)
 and extract(isodow from p_business_date)::smallint=any(weekdays)) then
 raise exception 'This date is not available for completion' using errcode='23514'; end if;
 select * into l from public.habit_logs where habit_id=h.id and user_id=owner_id and business_date=p_business_date for update;
 -- Repeated desired-state saves are safe even if their expected revision is old.
 if l.id is not null and l.completed=p_completed then return to_jsonb(l); end if;
 if p_expected_revision is distinct from coalesce(l.revision,0) then raise exception 'Completion changed. Reload and try again.' using errcode='40001'; end if;
 insert into public.habit_logs(user_id,habit_id,business_date,timezone,completed) values(owner_id,h.id,p_business_date,tz,p_completed)
 on conflict(habit_id,user_id,business_date) do update set completed=excluded.completed,revision=public.habit_logs.revision+1
 returning * into l;
 return to_jsonb(l);
end $$;
create function public.archive_habit(p_habit_id uuid,p_expected_revision integer) returns void language plpgsql security definer set search_path='' as $$
declare owner_id uuid:=private.habit_owner(); h public.habits; today date;
begin
 select (now() at time zone timezone)::date into today from public.user_preferences where user_id=owner_id for update;
 select * into h from public.habits where id=p_habit_id and user_id=owner_id for update;
 if h.id is null then raise exception 'Habit unavailable' using errcode='42501'; end if;
 if h.archived_from is not null then return; end if;
 if p_expected_revision is distinct from h.revision then raise exception 'Habit changed. Reload and try again.' using errcode='40001'; end if;
 update public.habits set archived_from=today+1,revision=revision+1 where id=h.id;
end $$;
create function public.delete_habit(p_habit_id uuid,p_expected_revision integer,p_confirmation text) returns void language plpgsql security definer set search_path='' as $$
declare owner_id uuid:=private.habit_owner(); h public.habits;
begin
 if p_confirmation is distinct from 'DELETE HABIT' then raise exception 'Confirm permanent deletion' using errcode='23514'; end if;
 perform 1 from public.user_preferences where user_id=owner_id for update;
 select * into h from public.habits where id=p_habit_id and user_id=owner_id for update;
 if h.id is null then raise exception 'Habit unavailable' using errcode='42501'; end if;
 if p_expected_revision is distinct from h.revision then raise exception 'Habit changed. Reload and try again.' using errcode='40001'; end if;
 delete from public.habits where id=h.id;
end $$;
create or replace function private.clear_workspace(owner_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.user_preferences where user_id=owner_id for update;
 delete from public.habits where user_id=owner_id;
end $$;
create or replace function public.delete_workspace_data(p_confirmation text) returns void language plpgsql security definer set search_path='' as $$
declare owner_id uuid:=private.habit_owner(); begin
 if p_confirmation is distinct from 'DELETE MY DATA' then raise exception 'Type DELETE MY DATA to confirm' using errcode='23514'; end if;
 perform private.clear_workspace(owner_id);
end $$;
create or replace function public.export_workspace_data() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare owner_id uuid:=private.habit_owner(); table_name text; records jsonb; payload jsonb:='{}';
begin
 foreach table_name in array array['profiles','user_preferences','habits','habit_schedules','habit_logs'] loop
 execute format('select coalesce(jsonb_agg(to_jsonb(t) order by t.%I),''[]''::jsonb) from public.%I t where user_id=$1',
 case when table_name in ('profiles','user_preferences') then 'user_id' else 'id' end,table_name) into records using owner_id;
 payload:=payload||jsonb_build_object(table_name,records);
 end loop;
 return jsonb_build_object('format','winter-arc-os','format_version',2,'generated_at',now(),'data',payload);
end $$;
revoke all on all functions in schema private from public,anon,authenticated;
revoke all on function public.save_habit(text,smallint[],uuid,integer),public.set_habit_completion(uuid,date,boolean,integer),
 public.archive_habit(uuid,integer),public.delete_habit(uuid,integer,text),public.export_workspace_data(),public.delete_workspace_data(text) from public,anon;
grant execute on function public.save_habit(text,smallint[],uuid,integer),public.set_habit_completion(uuid,date,boolean,integer),
 public.archive_habit(uuid,integer),public.delete_habit(uuid,integer,text),public.export_workspace_data(),public.delete_workspace_data(text) to authenticated;
do $$ begin
 if exists(select 1 from reset_preservation_guard where accounts is distinct from (select md5(coalesce(jsonb_agg(row(id,email) order by id)::text,'')) from auth.users)
 or profiles is distinct from (select md5(coalesce(jsonb_agg(row(user_id,display_name) order by user_id)::text,'')) from public.profiles) or preferences is distinct from (select md5(coalesce(jsonb_agg(row(user_id,timezone,week_starts_on,theme,privacy_mode) order by user_id)::text,'')) from public.user_preferences)) then
 raise exception 'Essential account records changed during reset'; end if;
end $$;
commit;
