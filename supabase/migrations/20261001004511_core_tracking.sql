-- Phase 2 core tracking schema. Apply only to the verified development project.
-- Every public child relation includes ownership; no seeded performance history is inserted.
create sequence public.tracking_revision_seq;
grant usage on sequence public.tracking_revision_seq to authenticated;

create table public.challenges (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120), description text not null default '' check (char_length(description) <= 4000),
  start_date date not null, end_date date not null, status text not null default 'active' check (status in ('upcoming','active','completed','archived')),
  color text check (color ~ '^#[0-9A-Fa-f]{6}$'), icon text check (char_length(icon) <= 50), starter_key text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id,user_id), unique (user_id,starter_key), check (end_date >= start_date)
);
alter table public.user_preferences add column selected_challenge_id uuid;
alter table public.user_preferences add column starter_applied_on date;
alter table public.user_preferences add constraint preferences_selected_challenge_owner foreign key (selected_challenge_id,user_id) references public.challenges(id,user_id) on delete set null (selected_challenge_id);
create index preferences_challenge_owner on public.user_preferences(selected_challenge_id,user_id);

create table public.habits (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120), description text not null default '' check (char_length(description) <= 4000), icon text,
  category_id uuid, time_of_day text not null default 'anytime' check (time_of_day in ('morning','afternoon','evening','anytime')),
  is_private boolean not null default false, dosage_amount numeric check (dosage_amount > 0), dosage_unit text check (char_length(dosage_unit) between 1 and 30),
  active_from date not null, active_until date, archived_on date, archived_at timestamptz, starter_key text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id,user_id), unique (user_id,starter_key),
  foreign key (category_id,user_id) references public.categories(id,user_id) on delete no action deferrable initially deferred,
  check (active_until is null or active_until > active_from), check (archived_on is null or archived_on > active_from),
  check ((dosage_amount is null) = (dosage_unit is null)), check ((archived_on is null) = (archived_at is null))
);
create table public.habit_schedules (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, habit_id uuid not null,
  frequency text not null check (frequency in ('DAILY','WEEKDAYS','SPECIFIC_DAYS','TIMES_PER_WEEK','TIMES_PER_MONTH','CUSTOM')),
  required_count integer not null check (required_count between 1 and 1000), weekdays smallint[] not null default '{}', interval_days integer, anchor_date date,
  effective_from date not null, effective_until date, timezone text not null, week_starts_on smallint not null check (week_starts_on between 1 and 7),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (id,user_id),
  foreign key (habit_id,user_id) references public.habits(id,user_id) on delete cascade,
  check (effective_until is null or effective_until > effective_from), check (weekdays <@ array[1,2,3,4,5,6,7]::smallint[]),
  check ((frequency = 'SPECIFIC_DAYS' and cardinality(weekdays) between 1 and 7) or (frequency <> 'SPECIFIC_DAYS' and cardinality(weekdays) = 0)),
  check ((frequency = 'CUSTOM' and interval_days between 1 and 365 and anchor_date is not null) or (frequency <> 'CUSTOM' and interval_days is null and anchor_date is null))
);
create table public.habit_logs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, habit_id uuid not null,
  business_date date not null, timezone text not null, status text not null check (status in ('completed','missed','skipped')),
  completion_count integer not null check (completion_count between 0 and 10000), notes text not null default '' check (char_length(notes) <= 4000),
  revision bigint not null default nextval('public.tracking_revision_seq'), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id,user_id), unique (habit_id,business_date), foreign key (habit_id,user_id) references public.habits(id,user_id) on delete cascade,
  check ((status = 'completed' and completion_count > 0) or (status in ('missed','skipped') and completion_count = 0))
);
create table public.metric_definitions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120), description text not null default '' check (char_length(description) <= 4000), category_id uuid,
  unit text not null check (char_length(trim(unit)) between 1 and 30), source text not null check (source in ('manual','study','sleep')),
  aggregation text not null default 'sum' check (aggregation in ('sum','latest','average')), is_private boolean not null default false,
  active_from date not null, active_until date, archived_on date, archived_at timestamptz, source_available_from date, starter_key text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (id,user_id), unique (user_id,starter_key),
  foreign key (category_id,user_id) references public.categories(id,user_id) on delete no action deferrable initially deferred,
  check (active_until is null or active_until > active_from), check (archived_on is null or archived_on > active_from),
  check ((archived_on is null) = (archived_at is null)), check (source <> 'manual' or source_available_from = active_from)
);
create table public.metric_targets (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, metric_id uuid not null,
  period text not null check (period in ('daily','weekly','monthly')), direction text not null check (direction in ('minimum','maximum')), target numeric not null check (target > 0 and target <= 1e12),
  effective_from date not null, effective_until date, timezone text not null, week_starts_on smallint not null check (week_starts_on between 1 and 7),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (id,user_id),
  foreign key (metric_id,user_id) references public.metric_definitions(id,user_id) on delete cascade, check (effective_until is null or effective_until > effective_from)
);
create table public.metric_logs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, metric_id uuid not null,
  business_date date not null, timezone text not null, value numeric not null check (value >= 0 and value <= 1e12), notes text not null default '' check (char_length(notes) <= 4000),
  revision bigint not null default nextval('public.tracking_revision_seq'), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id,user_id), unique (metric_id,business_date), foreign key (metric_id,user_id) references public.metric_definitions(id,user_id) on delete cascade
);
create table public.frequency_targets (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120), description text not null default '' check (char_length(description) <= 4000), category_id uuid,
  source text not null check (source in ('metric_threshold','workouts','study_sessions')), metric_id uuid,
  count_mode text not null check (count_mode in ('sessions','distinct_days')), is_private boolean not null default false,
  active_from date not null, active_until date, archived_on date, archived_at timestamptz, source_available_from date, starter_key text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (id,user_id), unique (user_id,starter_key),
  foreign key (category_id,user_id) references public.categories(id,user_id) on delete no action deferrable initially deferred,
  foreign key (metric_id,user_id) references public.metric_definitions(id,user_id) on delete no action deferrable initially deferred,
  check (active_until is null or active_until > active_from), check (archived_on is null or archived_on > active_from), check ((archived_on is null) = (archived_at is null)),
  check ((source = 'metric_threshold' and metric_id is not null and count_mode = 'distinct_days') or (source <> 'metric_threshold' and metric_id is null))
);
create table public.frequency_target_rules (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, frequency_target_id uuid not null,
  period text not null check (period in ('weekly','monthly')), quota integer not null check (quota between 1 and 1000), threshold numeric check (threshold > 0 and threshold <= 1e12),
  effective_from date not null, effective_until date, timezone text not null, week_starts_on smallint not null check (week_starts_on between 1 and 7),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (id,user_id),
  foreign key (frequency_target_id,user_id) references public.frequency_targets(id,user_id) on delete cascade, check (effective_until is null or effective_until > effective_from)
);
create table public.score_categories (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120), position integer not null default 0 check (position >= 0), archived_at timestamptz, starter_key text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (id,user_id), unique (user_id,starter_key)
);
create table public.score_policies (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120), period text not null check (period in ('daily','weekly','monthly')), version integer not null check (version > 0),
  effective_from date not null, effective_until date, timezone text not null, week_starts_on smallint not null check (week_starts_on between 1 and 7),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (id,user_id), unique (user_id,period,version), check (effective_until is null or effective_until > effective_from)
);
create table public.score_category_weights (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, policy_id uuid not null, score_category_id uuid not null,
  weight numeric not null check (weight >= 0 and weight <= 1000), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (id,user_id), unique (policy_id,score_category_id),
  foreign key (policy_id,user_id) references public.score_policies(id,user_id) on delete cascade,
  foreign key (score_category_id,user_id) references public.score_categories(id,user_id) on delete no action deferrable initially deferred
);
create table public.score_items (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, policy_id uuid not null, score_category_id uuid not null,
  habit_id uuid, metric_id uuid, frequency_target_id uuid, weight numeric not null check (weight > 0 and weight <= 1000),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (id,user_id),
  foreign key (policy_id,user_id) references public.score_policies(id,user_id) on delete cascade,
  foreign key (score_category_id,user_id) references public.score_categories(id,user_id) on delete no action deferrable initially deferred,
  foreign key (policy_id,score_category_id) references public.score_category_weights(policy_id,score_category_id) on delete cascade,
  foreign key (habit_id,user_id) references public.habits(id,user_id) on delete cascade,
  foreign key (metric_id,user_id) references public.metric_definitions(id,user_id) on delete cascade,
  foreign key (frequency_target_id,user_id) references public.frequency_targets(id,user_id) on delete cascade,
  check (num_nonnulls(habit_id,metric_id,frequency_target_id) = 1)
);
create unique index score_items_once_habit on public.score_items(policy_id,habit_id) where habit_id is not null;
create unique index score_items_once_metric on public.score_items(policy_id,metric_id) where metric_id is not null;
create unique index score_items_once_target on public.score_items(policy_id,frequency_target_id) where frequency_target_id is not null;

create table public.challenge_habits (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, challenge_id uuid not null, habit_id uuid not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (id,user_id), unique (challenge_id,habit_id),
  foreign key (challenge_id,user_id) references public.challenges(id,user_id) on delete cascade,
  foreign key (habit_id,user_id) references public.habits(id,user_id) on delete cascade
);
create table public.challenge_metrics (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, challenge_id uuid not null, metric_id uuid not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (id,user_id), unique (challenge_id,metric_id),
  foreign key (challenge_id,user_id) references public.challenges(id,user_id) on delete cascade,
  foreign key (metric_id,user_id) references public.metric_definitions(id,user_id) on delete cascade
);
create table public.challenge_targets (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, challenge_id uuid not null, frequency_target_id uuid not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (id,user_id), unique (challenge_id,frequency_target_id),
  foreign key (challenge_id,user_id) references public.challenges(id,user_id) on delete cascade,
  foreign key (frequency_target_id,user_id) references public.frequency_targets(id,user_id) on delete cascade
);
-- Retry receipts belong to a user and metric; deleting that metric explicitly also deletes receipts.
create table public.tracking_operations (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, operation_id uuid not null,
  metric_id uuid not null, input jsonb not null, result jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id,user_id), unique (user_id,operation_id), foreign key (metric_id,user_id) references public.metric_definitions(id,user_id) on delete cascade
);

create index challenges_owner_dates on public.challenges(user_id,start_date,end_date);
create index habits_owner_active on public.habits(user_id,active_from);
create index habits_category_owner on public.habits(category_id,user_id);
create index schedules_parent_owner_dates on public.habit_schedules(habit_id,user_id,effective_from);
create index schedules_owner_dates on public.habit_schedules(user_id,effective_from);
create index habit_logs_owner_date on public.habit_logs(user_id,business_date);
create index habit_logs_parent_owner on public.habit_logs(habit_id,user_id);
create index metrics_owner_active on public.metric_definitions(user_id,active_from);
create index metrics_category_owner on public.metric_definitions(category_id,user_id);
create index metric_targets_parent_owner_dates on public.metric_targets(metric_id,user_id,effective_from);
create index metric_targets_owner_dates on public.metric_targets(user_id,effective_from);
create index metric_logs_owner_date on public.metric_logs(user_id,business_date);
create index metric_logs_parent_owner on public.metric_logs(metric_id,user_id);
create index frequency_targets_owner_active on public.frequency_targets(user_id,active_from);
create index frequency_targets_category_owner on public.frequency_targets(category_id,user_id);
create index frequency_targets_metric_owner on public.frequency_targets(metric_id,user_id);
create index frequency_rules_parent_owner_dates on public.frequency_target_rules(frequency_target_id,user_id,effective_from);
create index frequency_rules_owner_dates on public.frequency_target_rules(user_id,effective_from);
create index score_categories_owner_position on public.score_categories(user_id,position);
create index score_policies_owner_period on public.score_policies(user_id,period,effective_from);
create index score_weights_policy_owner on public.score_category_weights(policy_id,user_id);
create index score_weights_category_owner on public.score_category_weights(score_category_id,user_id);
create index score_weights_owner on public.score_category_weights(user_id);
create index score_items_policy_owner on public.score_items(policy_id,user_id);
create index score_items_category_owner on public.score_items(score_category_id,user_id);
create index score_items_habit_owner on public.score_items(habit_id,user_id);
create index score_items_metric_owner on public.score_items(metric_id,user_id);
create index score_items_target_owner on public.score_items(frequency_target_id,user_id);
create index score_items_owner on public.score_items(user_id);
create index challenge_habits_challenge_owner on public.challenge_habits(challenge_id,user_id);
create index challenge_habits_parent_owner on public.challenge_habits(habit_id,user_id);
create index challenge_habits_owner on public.challenge_habits(user_id);
create index challenge_metrics_challenge_owner on public.challenge_metrics(challenge_id,user_id);
create index challenge_metrics_parent_owner on public.challenge_metrics(metric_id,user_id);
create index challenge_metrics_owner on public.challenge_metrics(user_id);
create index challenge_targets_challenge_owner on public.challenge_targets(challenge_id,user_id);
create index challenge_targets_parent_owner on public.challenge_targets(frequency_target_id,user_id);
create index challenge_targets_owner on public.challenge_targets(user_id);
create index tracking_operations_metric_owner on public.tracking_operations(metric_id,user_id);

-- Owner policies are explicit for every command even where writes require a transactional RPC.
do $$
declare table_name text;
begin
  foreach table_name in array array['challenges','habits','habit_schedules','habit_logs','metric_definitions','metric_targets','metric_logs','frequency_targets','frequency_target_rules','score_categories','score_policies','score_category_weights','score_items','challenge_habits','challenge_metrics','challenge_targets','tracking_operations'] loop
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
-- Direct writes cannot bypass immutable history, revision checks, or atomic rule changes.
-- Authenticated security-definer RPCs below only use their independently verified auth.uid().

create function private.tracking_owner() returns uuid language plpgsql stable set search_path = '' as $$
declare owner_id uuid := auth.uid();
begin
  if owner_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  return owner_id;
end;
$$;
create function private.tracking_next_boundary(current_date_value date,period_value text,week_start integer) returns date language plpgsql immutable set search_path = '' as $$
begin
  if period_value = 'daily' then return current_date_value + 1; end if;
  if period_value = 'weekly' then return current_date_value + (7 - ((extract(isodow from current_date_value)::integer - week_start + 7) % 7)); end if;
  if period_value = 'monthly' then return (date_trunc('month',current_date_value::timestamp) + interval '1 month')::date; end if;
  raise exception 'Invalid period' using errcode = '23514';
end;
$$;
-- An owner/source advisory lock makes overlap prevention reliable under concurrent inserts.
create function private.tracking_no_overlap() returns trigger language plpgsql security definer set search_path = '' as $$
declare source_column text := tg_argv[0]; period_column text := nullif(tg_argv[1],''); source_value text; period_value text; overlap_found boolean; clause text;
begin
  source_value := to_jsonb(new)->>source_column;
  period_value := case when period_column is null then '' else to_jsonb(new)->>period_column end;
  perform pg_advisory_xact_lock(hashtextextended(tg_table_name||':'||new.user_id::text||':'||source_value||':'||period_value,0));
  clause := case when period_column is null then '' else format(' and %I::text = $6',period_column) end;
  execute format('select exists(select 1 from public.%I where user_id = $1 and %I::text = $2 and id <> $3 and daterange(effective_from,effective_until,''[)'') && daterange($4,$5,''[)'')%s)',tg_table_name,source_column,clause)
    into overlap_found using new.user_id,source_value,new.id,new.effective_from,new.effective_until,period_value;
  if overlap_found then raise exception 'Effective rules cannot overlap' using errcode = '23P01'; end if;
  return new;
end;
$$;
create trigger schedules_no_overlap before insert or update on public.habit_schedules for each row execute function private.tracking_no_overlap('habit_id','');
create trigger metric_targets_no_overlap before insert or update on public.metric_targets for each row execute function private.tracking_no_overlap('metric_id','period');
create trigger frequency_rules_no_overlap before insert or update on public.frequency_target_rules for each row execute function private.tracking_no_overlap('frequency_target_id','');
create trigger score_policies_no_overlap before insert or update on public.score_policies for each row execute function private.tracking_no_overlap('user_id','period');
-- Monotonic revisions survive clear/re-create cycles and therefore avoid stale ABA replacements.
create function private.tracking_log_revision() returns trigger language plpgsql set search_path = '' as $$
begin new.revision := nextval('public.tracking_revision_seq'); return new; end;
$$;
create trigger habit_log_revision before update on public.habit_logs for each row execute function private.tracking_log_revision();
create trigger metric_log_revision before update on public.metric_logs for each row execute function private.tracking_log_revision();

create function private.tracking_associations(owner_id uuid,challenge_id_value uuid,input_value jsonb) returns void language plpgsql set search_path = '' as $$
begin
  delete from public.challenge_habits where user_id = owner_id and challenge_id = challenge_id_value;
  delete from public.challenge_metrics where user_id = owner_id and challenge_id = challenge_id_value;
  delete from public.challenge_targets where user_id = owner_id and challenge_id = challenge_id_value;
  insert into public.challenge_habits(user_id,challenge_id,habit_id) select owner_id,challenge_id_value,value::uuid from jsonb_array_elements_text(coalesce(input_value->'habitIds','[]'::jsonb)) on conflict (challenge_id,habit_id) do nothing;
  insert into public.challenge_metrics(user_id,challenge_id,metric_id) select owner_id,challenge_id_value,value::uuid from jsonb_array_elements_text(coalesce(input_value->'metricIds','[]'::jsonb)) on conflict (challenge_id,metric_id) do nothing;
  insert into public.challenge_targets(user_id,challenge_id,frequency_target_id) select owner_id,challenge_id_value,value::uuid from jsonb_array_elements_text(coalesce(input_value->'frequencyTargetIds','[]'::jsonb)) on conflict (challenge_id,frequency_target_id) do nothing;
end;
$$;
create function public.save_tracking_challenge(p_input jsonb) returns uuid language plpgsql security definer set search_path = '' as $$
declare owner_id uuid := private.tracking_owner(); record_id uuid := nullif(p_input->>'id','')::uuid; existing public.challenges;
begin
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':definitions',0));
  if record_id is null then
    insert into public.challenges(user_id,title,description,start_date,end_date,status,color,icon) values(owner_id,p_input->>'title',coalesce(p_input->>'description',''),(p_input->>'startDate')::date,(p_input->>'endDate')::date,p_input->>'status',nullif(p_input->>'color',''),nullif(p_input->>'icon','')) returning id into record_id;
  else
    select * into existing from public.challenges where id = record_id and user_id = owner_id for update;
    if not found then raise exception 'Record unavailable' using errcode = '42501'; end if;
    if existing.updated_at is distinct from (p_input->>'expectedUpdatedAt')::timestamptz then raise exception 'This record changed. Reload before saving.' using errcode = '40001'; end if;
    update public.challenges set title=p_input->>'title',description=coalesce(p_input->>'description',''),start_date=(p_input->>'startDate')::date,end_date=(p_input->>'endDate')::date,status=p_input->>'status',color=nullif(p_input->>'color',''),icon=nullif(p_input->>'icon','') where id=record_id and user_id=owner_id;
  end if;
  perform private.tracking_associations(owner_id,record_id,p_input);
  return record_id;
end;
$$;
create function public.associate_tracking_challenge(p_input jsonb) returns uuid language plpgsql security definer set search_path = '' as $$
declare owner_id uuid := private.tracking_owner(); record_id uuid := (p_input->>'challengeId')::uuid; existing public.challenges;
begin
  select * into existing from public.challenges where id=record_id and user_id=owner_id for update;
  if not found then raise exception 'Record unavailable' using errcode='42501'; end if;
  if existing.updated_at is distinct from (p_input->>'expectedUpdatedAt')::timestamptz then raise exception 'This record changed. Reload before saving.' using errcode='40001'; end if;
  perform private.tracking_associations(owner_id,record_id,p_input);
  update public.challenges set updated_at=now() where id=record_id and user_id=owner_id;
  return record_id;
end;
$$;

create function public.save_tracking_habit(p_input jsonb) returns uuid language plpgsql security definer set search_path = '' as $$
declare owner_id uuid := private.tracking_owner(); record_id uuid := nullif(p_input->>'id','')::uuid; existing public.habits; old_rule public.habit_schedules;
  preferences public.user_preferences; today_value date; starts date; old_period text; new_period text; desired_weekdays smallint[]; desired_interval integer; desired_anchor date; requested_until date:=(p_input->>'activeUntil')::date;
begin
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':definitions',0));
  select * into strict preferences from public.user_preferences where user_id=owner_id;
  today_value := (now() at time zone preferences.timezone)::date;
  desired_weekdays := case when p_input->>'frequency'='SPECIFIC_DAYS' then array(select distinct value::smallint from jsonb_array_elements_text(coalesce(p_input->'weekdays','[]'::jsonb)) order by value::smallint) else '{}'::smallint[] end;
  desired_interval := case when p_input->>'frequency'='CUSTOM' then (p_input->>'intervalDays')::integer else null end;
  desired_anchor := case when p_input->>'frequency'='CUSTOM' then (p_input->>'anchorDate')::date else null end;
  if record_id is null then
    starts := coalesce((p_input->>'activeFrom')::date,today_value);
    if starts>today_value then raise exception 'Trackers cannot begin in the future' using errcode='23514'; end if;
    insert into public.habits(user_id,name,description,icon,category_id,time_of_day,is_private,dosage_amount,dosage_unit,active_from,active_until)
      values(owner_id,p_input->>'name',coalesce(p_input->>'description',''),nullif(p_input->>'icon',''),nullif(p_input->>'categoryId','')::uuid,p_input->>'timeOfDay',coalesce((p_input->>'isPrivate')::boolean,false),(p_input->>'dosageAmount')::numeric,case when p_input->>'dosageAmount' is null then null else nullif(p_input->>'dosageUnit','') end,starts,requested_until) returning id into record_id;
  else
    select * into existing from public.habits where id=record_id and user_id=owner_id for update;
    if not found or existing.archived_on is not null then raise exception 'Record unavailable' using errcode='42501'; end if;
    if existing.updated_at is distinct from (p_input->>'expectedUpdatedAt')::timestamptz then raise exception 'This record changed. Reload before saving.' using errcode='40001'; end if;
    if p_input->>'activeFrom' is not null and (p_input->>'activeFrom')::date<>existing.active_from then raise exception 'The activation date is fixed; create a new tracker to change it' using errcode='23514'; end if;
    if requested_until is distinct from existing.active_until and requested_until is not null and requested_until<=today_value then raise exception 'A changed end date must be in the future to preserve history' using errcode='23514'; end if;
    select * into old_rule from public.habit_schedules where user_id=owner_id and habit_id=record_id and effective_from<=today_value and (effective_until is null or effective_until>today_value) order by effective_from desc limit 1;
    if not found then raise exception 'The active habit schedule is missing' using errcode='23514'; end if;
    update public.habits set name=p_input->>'name',description=coalesce(p_input->>'description',''),icon=nullif(p_input->>'icon',''),category_id=nullif(p_input->>'categoryId','')::uuid,time_of_day=p_input->>'timeOfDay',is_private=coalesce((p_input->>'isPrivate')::boolean,false),dosage_amount=(p_input->>'dosageAmount')::numeric,dosage_unit=case when p_input->>'dosageAmount' is null then null else nullif(p_input->>'dosageUnit','') end,active_until=requested_until where id=record_id and user_id=owner_id;
    if old_rule.frequency=p_input->>'frequency' and old_rule.required_count=(p_input->>'requiredCount')::integer and old_rule.weekdays=desired_weekdays and old_rule.interval_days is not distinct from desired_interval and old_rule.anchor_date is not distinct from desired_anchor then return record_id; end if;
    old_period := case old_rule.frequency when 'TIMES_PER_WEEK' then 'weekly' when 'TIMES_PER_MONTH' then 'monthly' else 'daily' end;
    new_period := case p_input->>'frequency' when 'TIMES_PER_WEEK' then 'weekly' when 'TIMES_PER_MONTH' then 'monthly' else 'daily' end;
    starts := greatest(private.tracking_next_boundary(today_value,old_period,old_rule.week_starts_on),private.tracking_next_boundary(today_value,new_period,preferences.week_starts_on));
    delete from public.habit_schedules where user_id=owner_id and habit_id=record_id and effective_from>=starts;
    update public.habit_schedules set effective_until=starts where user_id=owner_id and habit_id=record_id and effective_from<starts and (effective_until is null or effective_until>starts);
  end if;
  insert into public.habit_schedules(user_id,habit_id,frequency,required_count,weekdays,interval_days,anchor_date,effective_from,timezone,week_starts_on)
    values(owner_id,record_id,p_input->>'frequency',(p_input->>'requiredCount')::integer,desired_weekdays,desired_interval,desired_anchor,starts,preferences.timezone,preferences.week_starts_on);
  return record_id;
end;
$$;
create function public.save_tracking_metric(p_input jsonb) returns uuid language plpgsql security definer set search_path = '' as $$
declare owner_id uuid := private.tracking_owner(); record_id uuid := nullif(p_input->>'id','')::uuid; existing public.metric_definitions; old_rule public.metric_targets;
  preferences public.user_preferences; today_value date; starts date; new_target numeric := (p_input->>'target')::numeric; period_value text:=p_input->>'targetPeriod';
begin
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':definitions',0));
  select * into strict preferences from public.user_preferences where user_id=owner_id;
  today_value := (now() at time zone preferences.timezone)::date;
  if record_id is null then
    if p_input->>'source'<>'manual' then raise exception 'Only manual sources are available in Phase 2' using errcode='23514'; end if;
    starts:=coalesce((p_input->>'activeFrom')::date,today_value);
    if starts>today_value then raise exception 'Trackers cannot begin in the future' using errcode='23514'; end if;
    insert into public.metric_definitions(user_id,name,description,category_id,unit,source,aggregation,is_private,active_from,source_available_from)
      values(owner_id,p_input->>'name',coalesce(p_input->>'description',''),nullif(p_input->>'categoryId','')::uuid,p_input->>'unit','manual',p_input->>'aggregation',coalesce((p_input->>'isPrivate')::boolean,false),starts,starts) returning id into record_id;
  else
    select * into existing from public.metric_definitions where id=record_id and user_id=owner_id for update;
    if not found or existing.archived_on is not null then raise exception 'Record unavailable' using errcode='42501'; end if;
    if existing.updated_at is distinct from (p_input->>'expectedUpdatedAt')::timestamptz then raise exception 'This record changed. Reload before saving.' using errcode='40001'; end if;
    if p_input->>'source'<>existing.source or p_input->>'unit'<>existing.unit or p_input->>'aggregation'<>existing.aggregation or (p_input->>'activeFrom' is not null and (p_input->>'activeFrom')::date<>existing.active_from) then raise exception 'The source, unit, aggregation and activation date are fixed' using errcode='23514'; end if;
    update public.metric_definitions set name=p_input->>'name',description=coalesce(p_input->>'description',''),category_id=nullif(p_input->>'categoryId','')::uuid,is_private=coalesce((p_input->>'isPrivate')::boolean,false) where id=record_id and user_id=owner_id;
    select * into old_rule from public.metric_targets where user_id=owner_id and metric_id=record_id and period=period_value and effective_from<=today_value and (effective_until is null or effective_until>today_value) order by effective_from desc limit 1;
    if old_rule.id is not null and old_rule.target is not distinct from new_target and old_rule.direction=p_input->>'direction' then return record_id; end if;
    starts:=private.tracking_next_boundary(today_value,period_value,coalesce(old_rule.week_starts_on,preferences.week_starts_on));
    delete from public.metric_targets where user_id=owner_id and metric_id=record_id and period=period_value and effective_from>=starts;
    update public.metric_targets set effective_until=starts where user_id=owner_id and metric_id=record_id and period=period_value and effective_from<starts and (effective_until is null or effective_until>starts);
  end if;
  if new_target is not null then
    insert into public.metric_targets(user_id,metric_id,period,direction,target,effective_from,timezone,week_starts_on)
      values(owner_id,record_id,period_value,p_input->>'direction',new_target,starts,preferences.timezone,preferences.week_starts_on);
  end if;
  return record_id;
end;
$$;
create function public.save_tracking_frequency(p_input jsonb) returns uuid language plpgsql security definer set search_path = '' as $$
declare owner_id uuid := private.tracking_owner(); record_id uuid := nullif(p_input->>'id','')::uuid; existing public.frequency_targets; old_rule public.frequency_target_rules;
  preferences public.user_preferences; source_metric public.metric_definitions; today_value date; starts date;
begin
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':definitions',0));
  select * into strict preferences from public.user_preferences where user_id=owner_id;
  today_value:=(now() at time zone preferences.timezone)::date;
  if record_id is null then
    if p_input->>'source'<>'metric_threshold' or p_input->>'countMode'<>'distinct_days' then raise exception 'Only metric qualifying-day targets are available in Phase 2' using errcode='23514'; end if;
    select * into source_metric from public.metric_definitions where id=(p_input->>'metricId')::uuid and user_id=owner_id and source='manual' and archived_on is null;
    if not found then raise exception 'Choose an available owned manual metric' using errcode='23514'; end if;
    starts:=greatest(coalesce((p_input->>'activeFrom')::date,today_value),source_metric.active_from);
    if starts>today_value then raise exception 'Trackers cannot begin in the future' using errcode='23514'; end if;
    insert into public.frequency_targets(user_id,name,description,category_id,source,metric_id,count_mode,is_private,active_from,source_available_from)
      values(owner_id,p_input->>'name',coalesce(p_input->>'description',''),nullif(p_input->>'categoryId','')::uuid,'metric_threshold',source_metric.id,'distinct_days',coalesce((p_input->>'isPrivate')::boolean,false),starts,starts) returning id into record_id;
  else
    select * into existing from public.frequency_targets where id=record_id and user_id=owner_id for update;
    if not found or existing.archived_on is not null then raise exception 'Record unavailable' using errcode='42501'; end if;
    if existing.updated_at is distinct from (p_input->>'expectedUpdatedAt')::timestamptz then raise exception 'This record changed. Reload before saving.' using errcode='40001'; end if;
    if p_input->>'source'<>existing.source or p_input->>'countMode'<>existing.count_mode or (p_input->>'metricId')::uuid is distinct from existing.metric_id or (p_input->>'activeFrom' is not null and (p_input->>'activeFrom')::date<>existing.active_from) then raise exception 'Frequency source and activation date are fixed' using errcode='23514'; end if;
    update public.frequency_targets set name=p_input->>'name',description=coalesce(p_input->>'description',''),category_id=nullif(p_input->>'categoryId','')::uuid,is_private=coalesce((p_input->>'isPrivate')::boolean,false) where id=record_id and user_id=owner_id;
    select * into old_rule from public.frequency_target_rules where user_id=owner_id and frequency_target_id=record_id and effective_from<=today_value and (effective_until is null or effective_until>today_value) order by effective_from desc limit 1;
    if not found then raise exception 'The active frequency rule is missing' using errcode='23514'; end if;
    if old_rule.period=p_input->>'period' and old_rule.quota=(p_input->>'quota')::integer and old_rule.threshold is not distinct from (p_input->>'threshold')::numeric then return record_id; end if;
    starts:=greatest(private.tracking_next_boundary(today_value,old_rule.period,old_rule.week_starts_on),private.tracking_next_boundary(today_value,p_input->>'period',preferences.week_starts_on));
    delete from public.frequency_target_rules where user_id=owner_id and frequency_target_id=record_id and effective_from>=starts;
    update public.frequency_target_rules set effective_until=starts where user_id=owner_id and frequency_target_id=record_id and effective_from<starts and (effective_until is null or effective_until>starts);
  end if;
  insert into public.frequency_target_rules(user_id,frequency_target_id,period,quota,threshold,effective_from,timezone,week_starts_on)
    values(owner_id,record_id,p_input->>'period',(p_input->>'quota')::integer,(p_input->>'threshold')::numeric,starts,preferences.timezone,preferences.week_starts_on);
  return record_id;
end;
$$;

create function public.write_tracking_habit_log(p_input jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); tracker public.habits; rule public.habit_schedules; existing public.habit_logs; saved public.habit_logs;
  preferences public.user_preferences; date_value date:=(p_input->>'date')::date; record_id uuid:=(p_input->>'habitId')::uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':habit:'||record_id::text||':'||date_value::text,0));
  select * into strict preferences from public.user_preferences where user_id=owner_id;
  select * into tracker from public.habits where id=record_id and user_id=owner_id for share;
  if not found then raise exception 'Record unavailable' using errcode='42501'; end if;
  if date_value>(now() at time zone preferences.timezone)::date or date_value<tracker.active_from or date_value>=coalesce(tracker.active_until,'infinity'::date) or date_value>=coalesce(tracker.archived_on,'infinity'::date) then raise exception 'Choose an eligible past or current date' using errcode='23514'; end if;
  select * into rule from public.habit_schedules where user_id=owner_id and habit_id=record_id and effective_from<=date_value and (effective_until is null or effective_until>date_value);
  if not found then raise exception 'This date has no schedule' using errcode='23514'; end if;
  if (rule.frequency='WEEKDAYS' and extract(isodow from date_value)>5)
    or (rule.frequency='SPECIFIC_DAYS' and not (extract(isodow from date_value)::smallint=any(rule.weekdays)))
    or (rule.frequency='CUSTOM' and (date_value<rule.anchor_date or ((date_value-rule.anchor_date) % rule.interval_days)<>0))
    then raise exception 'This date is not a scheduled opportunity' using errcode='23514'; end if;
  select * into existing from public.habit_logs where user_id=owner_id and habit_id=record_id and business_date=date_value for update;
  if existing.revision is distinct from (p_input->>'expectedRevision')::bigint then raise exception 'This entry changed. Reload before saving.' using errcode='40001'; end if;
  if p_input->>'status'='clear' then delete from public.habit_logs where user_id=owner_id and habit_id=record_id and business_date=date_value; return 'null'::jsonb; end if;
  insert into public.habit_logs(user_id,habit_id,business_date,timezone,status,completion_count,notes)
    values(owner_id,record_id,date_value,coalesce(existing.timezone,preferences.timezone),p_input->>'status',(p_input->>'completionCount')::integer,coalesce(p_input->>'notes',existing.notes,''))
    on conflict(habit_id,business_date) do update set status=excluded.status,completion_count=excluded.completion_count,notes=excluded.notes returning * into saved;
  return to_jsonb(saved);
end;
$$;
create function public.write_tracking_metric_log(p_input jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); tracker public.metric_definitions; existing public.metric_logs; saved public.metric_logs;
  preferences public.user_preferences; date_value date:=(p_input->>'date')::date; record_id uuid:=(p_input->>'metricId')::uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':metric:'||record_id::text||':'||date_value::text,0));
  select * into strict preferences from public.user_preferences where user_id=owner_id;
  select * into tracker from public.metric_definitions where id=record_id and user_id=owner_id for share;
  if not found then raise exception 'Record unavailable' using errcode='42501'; end if;
  if tracker.source<>'manual' then raise exception 'Derived metrics cannot receive manual logs' using errcode='23514'; end if;
  if date_value>(now() at time zone preferences.timezone)::date or date_value<tracker.active_from or date_value>=coalesce(tracker.active_until,'infinity'::date) or date_value>=coalesce(tracker.archived_on,'infinity'::date) then raise exception 'Choose an eligible past or current date' using errcode='23514'; end if;
  select * into existing from public.metric_logs where user_id=owner_id and metric_id=record_id and business_date=date_value for update;
  if existing.revision is distinct from (p_input->>'expectedRevision')::bigint then raise exception 'This entry changed. Reload before saving.' using errcode='40001'; end if;
  if p_input->>'value' is null then delete from public.metric_logs where user_id=owner_id and metric_id=record_id and business_date=date_value; return 'null'::jsonb; end if;
  insert into public.metric_logs(user_id,metric_id,business_date,timezone,value,notes)
    values(owner_id,record_id,date_value,coalesce(existing.timezone,preferences.timezone),(p_input->>'value')::numeric,coalesce(p_input->>'notes',existing.notes,''))
    on conflict(metric_id,business_date) do update set value=excluded.value,notes=excluded.notes returning * into saved;
  return to_jsonb(saved);
end;
$$;
create function public.increment_tracking_metric(p_input jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); tracker public.metric_definitions; saved public.metric_logs; receipt public.tracking_operations;
  preferences public.user_preferences; date_value date:=(p_input->>'date')::date; record_id uuid:=(p_input->>'metricId')::uuid; operation_value uuid:=(p_input->>'operationId')::uuid; amount_value numeric:=(p_input->>'amount')::numeric;
  request_value jsonb:=jsonb_build_object('metricId',record_id,'date',date_value,'amount',amount_value);
begin
  if amount_value is null or not(amount_value>0 and amount_value<=1e9) or operation_value is null then raise exception 'Use a positive increment and operation identifier' using errcode='23514'; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':operation:'||operation_value::text,0));
  select * into receipt from public.tracking_operations where user_id=owner_id and operation_id=operation_value;
  if found then
    if receipt.input<>request_value then raise exception 'Operation identifier was already used for another request' using errcode='40001'; end if;
    return receipt.result;
  end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':metric:'||record_id::text||':'||date_value::text,0));
  select * into strict preferences from public.user_preferences where user_id=owner_id;
  select * into tracker from public.metric_definitions where id=record_id and user_id=owner_id for share;
  if not found then raise exception 'Record unavailable' using errcode='42501'; end if;
  if tracker.source<>'manual' or tracker.aggregation<>'sum' then raise exception 'Only sum-based manual metrics support increments' using errcode='23514'; end if;
  if date_value>(now() at time zone preferences.timezone)::date or date_value<tracker.active_from or date_value>=coalesce(tracker.active_until,'infinity'::date) or date_value>=coalesce(tracker.archived_on,'infinity'::date) then raise exception 'Choose an eligible past or current date' using errcode='23514'; end if;
  insert into public.metric_logs(user_id,metric_id,business_date,timezone,value) values(owner_id,record_id,date_value,preferences.timezone,amount_value)
    on conflict(metric_id,business_date) do update set value=public.metric_logs.value+excluded.value returning * into saved;
  insert into public.tracking_operations(user_id,operation_id,metric_id,input,result) values(owner_id,operation_value,record_id,request_value,to_jsonb(saved));
  return to_jsonb(saved);
end;
$$;

-- The editor applies all category weights and assignments in one transaction.
-- Existing policy rows remain immutable historical versions.
create function public.save_tracking_score_category(p_input jsonb) returns uuid language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); record_id uuid:=nullif(p_input->>'id','')::uuid; existing public.score_categories;
begin
  if record_id is null then
    insert into public.score_categories(user_id,name,position) values(owner_id,p_input->>'name',(p_input->>'position')::integer) returning id into record_id;
  else
    select * into existing from public.score_categories where id=record_id and user_id=owner_id and archived_at is null for update;
    if not found then raise exception 'Record unavailable' using errcode='42501'; end if;
    if existing.updated_at is distinct from (p_input->>'expectedUpdatedAt')::timestamptz then raise exception 'This record changed. Reload before saving.' using errcode='40001'; end if;
    update public.score_categories set name=p_input->>'name',position=(p_input->>'position')::integer where id=record_id and user_id=owner_id;
  end if;
  return record_id;
end;
$$;
create function public.save_tracking_score_policy(p_input jsonb) returns uuid language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); preferences public.user_preferences; today_value date; starts date; period_value text:=p_input->>'period'; record_id uuid; previous_rule public.score_policies; next_version integer;
  weight_row jsonb; item_row jsonb;
begin
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':score:'||period_value,0));
  select * into strict preferences from public.user_preferences where user_id=owner_id;
  today_value:=(now() at time zone preferences.timezone)::date;
  select * into previous_rule from public.score_policies where user_id=owner_id and period=period_value and effective_from<=today_value and (effective_until is null or effective_until>today_value) for update;
  starts:=case when previous_rule.id is null then today_value else private.tracking_next_boundary(today_value,period_value,previous_rule.week_starts_on) end;
  select coalesce(max(version),0)+1 into next_version from public.score_policies where user_id=owner_id and period=period_value;
  delete from public.score_policies where user_id=owner_id and period=period_value and effective_from>=starts;
  update public.score_policies set effective_until=starts where user_id=owner_id and period=period_value and effective_from<starts and (effective_until is null or effective_until>starts);
  insert into public.score_policies(user_id,name,period,version,effective_from,timezone,week_starts_on)
    values(owner_id,p_input->>'name',period_value,next_version,starts,preferences.timezone,preferences.week_starts_on) returning id into record_id;
  for weight_row in select value from jsonb_array_elements(p_input->'weights') loop
    insert into public.score_category_weights(user_id,policy_id,score_category_id,weight)
      values(owner_id,record_id,(weight_row->>'scoreCategoryId')::uuid,(weight_row->>'weight')::numeric);
  end loop;
  for item_row in select value from jsonb_array_elements(p_input->'items') loop
    insert into public.score_items(user_id,policy_id,score_category_id,habit_id,metric_id,frequency_target_id,weight)
      values(owner_id,record_id,(item_row->>'scoreCategoryId')::uuid,(item_row->>'habitId')::uuid,(item_row->>'metricId')::uuid,(item_row->>'frequencyTargetId')::uuid,(item_row->>'weight')::numeric);
  end loop;
  return record_id;
end;
$$;

create function public.archive_tracking_definition(p_kind text,p_id uuid,p_expected_at timestamptz) returns void language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); preferences public.user_preferences; today_value date; row_count integer;
begin
  select * into strict preferences from public.user_preferences where user_id=owner_id;
  today_value:=(now() at time zone preferences.timezone)::date;
  if p_kind='habit' then
    update public.habits set archived_at=now(),archived_on=today_value+1 where id=p_id and user_id=owner_id and updated_at=p_expected_at and archived_at is null;
  elsif p_kind='metric' then
    update public.metric_definitions set archived_at=now(),archived_on=today_value+1 where id=p_id and user_id=owner_id and updated_at=p_expected_at and archived_at is null;
  elsif p_kind='frequency' then
    update public.frequency_targets set archived_at=now(),archived_on=today_value+1 where id=p_id and user_id=owner_id and updated_at=p_expected_at and archived_at is null;
  elsif p_kind='challenge' then
    update public.challenges set status='archived' where id=p_id and user_id=owner_id and updated_at=p_expected_at and status<>'archived';
    get diagnostics row_count=row_count;
    if row_count<>1 then raise exception 'This record changed or is unavailable. Reload before saving.' using errcode='40001'; end if;
    update public.user_preferences set selected_challenge_id=null where user_id=owner_id and selected_challenge_id=p_id;
    return;
  else raise exception 'Invalid definition type' using errcode='23514'; end if;
  get diagnostics row_count=row_count;
  if row_count<>1 then raise exception 'This record changed or is unavailable. Reload before saving.' using errcode='40001'; end if;
end;
$$;
create function public.delete_tracking_definition(p_kind text,p_id uuid,p_expected_at timestamptz) returns void language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); row_count integer;
begin
  if p_kind='habit' then
    delete from public.habits where id=p_id and user_id=owner_id and updated_at=p_expected_at;
  elsif p_kind='metric' then
    delete from public.frequency_targets where metric_id=p_id and user_id=owner_id;
    delete from public.metric_definitions where id=p_id and user_id=owner_id and updated_at=p_expected_at;
  elsif p_kind='frequency' then
    delete from public.frequency_targets where id=p_id and user_id=owner_id and updated_at=p_expected_at;
  elsif p_kind='challenge' then
    delete from public.challenges where id=p_id and user_id=owner_id and updated_at=p_expected_at;
  else raise exception 'Invalid definition type' using errcode='23514'; end if;
  get diagnostics row_count=row_count;
  if row_count<>1 then raise exception 'This record changed or is unavailable. Reload before deleting.' using errcode='40001'; end if;
end;
$$;

-- The optional starter is a single idempotent transaction. Only definitions and
-- expectations are created; no log, completion, session or score result is seeded.
create function public.complete_tracking_onboarding(p_input jsonb) returns void language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); preferences public.user_preferences; today_value date;
  area_id uuid; category_id uuid; fitness_id uuid; career_id uuid; recovery_id uuid; nutrition_id uuid; discipline_id uuid;
  creatine_id uuid; meditation_id uuid; stammering_id uuid; protein_id uuid; water_id uuid; weight_id uuid; steps_id uuid; sleep_id uuid; study_id uuid;
  gym_id uuid; study_quota_id uuid; walking_id uuid; policy_id uuid; period_value text; score_version integer; score_start date;
  steps_threshold numeric:=(p_input->>'stepThreshold')::numeric; sleep_target numeric:=(p_input->>'sleepTarget')::numeric; study_minutes numeric:=(p_input->>'studyDailyMinutes')::numeric;
begin
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':starter',0));
  select * into strict preferences from public.user_preferences where user_id=owner_id for update;
  update public.user_preferences set timezone=p_input->>'timezone',week_starts_on=(p_input->>'weekStartsOn')::smallint,onboarding_completed=true where user_id=owner_id;
  today_value:=(now() at time zone (p_input->>'timezone'))::date;
  if not coalesce((p_input->>'applyStarter')::boolean,false) or preferences.starter_applied_on is not null then return; end if;
  insert into public.life_areas(user_id,name,position) values(owner_id,'Health',0) returning id into area_id;
  insert into public.categories(user_id,life_area_id,name,position) values(owner_id,area_id,'Health',0) returning id into category_id;
  insert into public.life_areas(user_id,name,position) values(owner_id,'Career',1) returning id into area_id;
  insert into public.categories(user_id,life_area_id,name,position) values(owner_id,area_id,'Career',1) returning id into category_id;
  insert into public.life_areas(user_id,name,position) values(owner_id,'Learning',2) returning id into area_id;
  insert into public.categories(user_id,life_area_id,name,position) values(owner_id,area_id,'Learning',2) returning id into category_id;
  insert into public.life_areas(user_id,name,position) values(owner_id,'Finance',3) returning id into area_id;
  insert into public.categories(user_id,life_area_id,name,position) values(owner_id,area_id,'Finance',3) returning id into category_id;
  insert into public.life_areas(user_id,name,position) values(owner_id,'Relationships',4) returning id into area_id;
  insert into public.categories(user_id,life_area_id,name,position) values(owner_id,area_id,'Relationships',4) returning id into category_id;
  insert into public.life_areas(user_id,name,position) values(owner_id,'Mindset',5) returning id into area_id;
  insert into public.categories(user_id,life_area_id,name,position) values(owner_id,area_id,'Mindset',5) returning id into category_id;
  insert into public.life_areas(user_id,name,position) values(owner_id,'Creativity',6) returning id into area_id;
  insert into public.categories(user_id,life_area_id,name,position) values(owner_id,area_id,'Creativity',6) returning id into category_id;
  insert into public.score_categories(user_id,name,position,starter_key) values(owner_id,'Fitness',0,'fitness') returning id into fitness_id;
  insert into public.score_categories(user_id,name,position,starter_key) values(owner_id,'Career',1,'career') returning id into career_id;
  insert into public.score_categories(user_id,name,position,starter_key) values(owner_id,'Recovery',2,'recovery') returning id into recovery_id;
  insert into public.score_categories(user_id,name,position,starter_key) values(owner_id,'Nutrition',3,'nutrition') returning id into nutrition_id;
  insert into public.score_categories(user_id,name,position,starter_key) values(owner_id,'Discipline',4,'discipline') returning id into discipline_id;
  insert into public.challenges(user_id,title,description,start_date,end_date,status,color,starter_key)
    values(owner_id,'Winter Arc 2026','September 1 through December 1, inclusive.',date '2026-09-01',date '2026-12-01',case when today_value<date '2026-09-01' then 'upcoming' when today_value>date '2026-12-01' then 'completed' else 'active' end,'#a89af3','winter-arc-2026') returning id into area_id;
  update public.user_preferences set selected_challenge_id=area_id where user_id=owner_id;
  insert into public.habits(user_id,name,description,time_of_day,active_from,dosage_amount,dosage_unit,starter_key)
    values(owner_id,'Creatine','Daily supplement.','morning',today_value,3,'g','creatine') returning id into creatine_id;
  insert into public.habits(user_id,name,description,time_of_day,active_from,starter_key)
    values(owner_id,'Meditation','A daily recovery practice.','morning',today_value,'meditation') returning id into meditation_id;
  insert into public.habits(user_id,name,description,time_of_day,active_from,starter_key)
    values(owner_id,'Stammering practice','Daily speech practice.','anytime',today_value,'stammering') returning id into stammering_id;
  insert into public.habit_schedules(user_id,habit_id,frequency,required_count,effective_from,timezone,week_starts_on)
    select owner_id,id,'DAILY',1,today_value,p_input->>'timezone',(p_input->>'weekStartsOn')::smallint from public.habits where user_id=owner_id and id in(creatine_id,meditation_id,stammering_id);
  insert into public.challenge_habits(user_id,challenge_id,habit_id)
    select owner_id,area_id,id from public.habits where user_id=owner_id and id in(creatine_id,meditation_id,stammering_id);
  insert into public.metric_definitions(user_id,name,unit,source,aggregation,active_from,source_available_from,starter_key)
    values(owner_id,'Protein','g','manual','sum',today_value,today_value,'protein') returning id into protein_id;
  insert into public.metric_definitions(user_id,name,unit,source,aggregation,active_from,source_available_from,starter_key)
    values(owner_id,'Water','ml','manual','sum',today_value,today_value,'water') returning id into water_id;
  insert into public.metric_definitions(user_id,name,unit,source,aggregation,active_from,source_available_from,starter_key)
    values(owner_id,'Body weight','kg','manual','latest',today_value,today_value,'body-weight') returning id into weight_id;
  insert into public.metric_definitions(user_id,name,unit,source,aggregation,active_from,source_available_from,starter_key)
    values(owner_id,'Steps','steps','manual','sum',today_value,today_value,'steps') returning id into steps_id;
  insert into public.metric_definitions(user_id,name,unit,source,aggregation,active_from,starter_key)
    values(owner_id,'Sleep duration','hours','sleep','latest',today_value,'sleep') returning id into sleep_id;
  insert into public.metric_definitions(user_id,name,unit,source,aggregation,active_from,starter_key)
    values(owner_id,'Study duration','minutes','study','sum',today_value,'study-duration') returning id into study_id;
  insert into public.metric_targets(user_id,metric_id,period,direction,target,effective_from,timezone,week_starts_on)
    values(owner_id,protein_id,'daily','minimum',130,today_value,p_input->>'timezone',(p_input->>'weekStartsOn')::smallint),
      (owner_id,water_id,'daily','minimum',3500,today_value,p_input->>'timezone',(p_input->>'weekStartsOn')::smallint);
  if sleep_target is not null then
    insert into public.metric_targets(user_id,metric_id,period,direction,target,effective_from,timezone,week_starts_on)
      values(owner_id,sleep_id,'daily','minimum',sleep_target,today_value,p_input->>'timezone',(p_input->>'weekStartsOn')::smallint);
  end if;
  if study_minutes is not null then
    insert into public.metric_targets(user_id,metric_id,period,direction,target,effective_from,timezone,week_starts_on)
      values(owner_id,study_id,'daily','minimum',study_minutes,today_value,p_input->>'timezone',(p_input->>'weekStartsOn')::smallint);
  end if;
  insert into public.challenge_metrics(user_id,challenge_id,metric_id)
    select owner_id,area_id,id from public.metric_definitions where user_id=owner_id and id in(protein_id,water_id,weight_id,steps_id,sleep_id,study_id);
  insert into public.frequency_targets(user_id,name,source,count_mode,active_from,starter_key)
    values(owner_id,'Gym sessions','workouts','sessions',today_value,'gym') returning id into gym_id;
  insert into public.frequency_targets(user_id,name,source,count_mode,active_from,starter_key)
    values(owner_id,'Study sessions','study_sessions','sessions',today_value,'study-sessions') returning id into study_quota_id;
  insert into public.frequency_target_rules(user_id,frequency_target_id,period,quota,effective_from,timezone,week_starts_on)
    values(owner_id,gym_id,'weekly',4,today_value,p_input->>'timezone',(p_input->>'weekStartsOn')::smallint),
      (owner_id,study_quota_id,'weekly',5,today_value,p_input->>'timezone',(p_input->>'weekStartsOn')::smallint);
  if steps_threshold is not null then
    insert into public.frequency_targets(user_id,name,source,metric_id,count_mode,active_from,source_available_from,starter_key)
      values(owner_id,'Walking days','metric_threshold',steps_id,'distinct_days',today_value,today_value,'walking') returning id into walking_id;
    insert into public.frequency_target_rules(user_id,frequency_target_id,period,quota,threshold,effective_from,timezone,week_starts_on)
      values(owner_id,walking_id,'weekly',5,steps_threshold,today_value,p_input->>'timezone',(p_input->>'weekStartsOn')::smallint);
  end if;
  insert into public.challenge_targets(user_id,challenge_id,frequency_target_id)
    select owner_id,area_id,id from public.frequency_targets where user_id=owner_id and id in(gym_id,study_quota_id,walking_id);
  for period_value in select unnest(array['daily','weekly','monthly']) loop
    -- Starter defaults never replace a policy the user has already configured.
    if exists(select 1 from public.score_policies where user_id=owner_id and period=period_value) then continue; end if;
    select coalesce(max(version),0)+1 into score_version from public.score_policies where user_id=owner_id and period=period_value;
    score_start:=today_value;
    insert into public.score_policies(user_id,name,period,version,effective_from,timezone,week_starts_on)
      values(owner_id,'Starter '||period_value||' score',period_value,score_version,score_start,p_input->>'timezone',(p_input->>'weekStartsOn')::smallint) returning id into policy_id;
    insert into public.score_category_weights(user_id,policy_id,score_category_id,weight)
      values(owner_id,policy_id,fitness_id,30),(owner_id,policy_id,career_id,30),(owner_id,policy_id,recovery_id,15),(owner_id,policy_id,nutrition_id,15),(owner_id,policy_id,discipline_id,10);
    insert into public.score_items(user_id,policy_id,score_category_id,habit_id,weight)
      values(owner_id,policy_id,discipline_id,creatine_id,1),(owner_id,policy_id,recovery_id,meditation_id,1),(owner_id,policy_id,career_id,stammering_id,1);
    insert into public.score_items(user_id,policy_id,score_category_id,metric_id,weight)
      values(owner_id,policy_id,nutrition_id,protein_id,1),(owner_id,policy_id,nutrition_id,water_id,1),
        (owner_id,policy_id,recovery_id,sleep_id,1),(owner_id,policy_id,career_id,study_id,1);
    if period_value='weekly' then
      insert into public.score_items(user_id,policy_id,score_category_id,frequency_target_id,weight)
        values(owner_id,policy_id,fitness_id,gym_id,1),(owner_id,policy_id,career_id,study_quota_id,1);
      if walking_id is not null then
        insert into public.score_items(user_id,policy_id,score_category_id,frequency_target_id,weight)
          values(owner_id,policy_id,fitness_id,walking_id,1);
      end if;
    end if;
  end loop;
  update public.user_preferences set starter_applied_on=today_value where user_id=owner_id;
end;
$$;

-- Functions are available only to authenticated callers; each rechecks auth.uid().
revoke all on function public.save_tracking_challenge(jsonb),public.associate_tracking_challenge(jsonb),public.save_tracking_habit(jsonb),public.save_tracking_metric(jsonb),public.save_tracking_frequency(jsonb),public.write_tracking_habit_log(jsonb),public.write_tracking_metric_log(jsonb),public.increment_tracking_metric(jsonb),public.save_tracking_score_category(jsonb),public.save_tracking_score_policy(jsonb),public.archive_tracking_definition(text,uuid,timestamptz),public.delete_tracking_definition(text,uuid,timestamptz),public.complete_tracking_onboarding(jsonb) from public,anon;
grant execute on function public.save_tracking_challenge(jsonb),public.associate_tracking_challenge(jsonb),public.save_tracking_habit(jsonb),public.save_tracking_metric(jsonb),public.save_tracking_frequency(jsonb),public.write_tracking_habit_log(jsonb),public.write_tracking_metric_log(jsonb),public.increment_tracking_metric(jsonb),public.save_tracking_score_category(jsonb),public.save_tracking_score_policy(jsonb),public.archive_tracking_definition(text,uuid,timestamptz),public.delete_tracking_definition(text,uuid,timestamptz),public.complete_tracking_onboarding(jsonb) to authenticated;
