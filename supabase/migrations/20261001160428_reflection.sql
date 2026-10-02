-- Phase 7 reflections. A saved week keeps its original start day and timezone.
create table public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  week_starts_on integer not null check (week_starts_on between 1 and 7),
  timezone text not null check (char_length(timezone) between 1 and 80),
  wins text not null default '' check (char_length(wins) <= 4000),
  difficulties text not null default '' check (char_length(difficulties) <= 4000),
  lessons text not null default '' check (char_length(lessons) <= 4000),
  next_week_changes text not null default '' check (char_length(next_week_changes) <= 4000),
  energy integer check (energy between 1 and 5),
  focus integer check (focus between 1 and 5),
  motivation integer check (motivation between 1 and 5),
  stress integer check (stress between 1 and 5),
  mood integer check (mood between 1 and 5),
  revision bigint not null default nextval('public.tracking_revision_seq'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id,user_id), unique (user_id,week_start),
  check (extract(isodow from week_start)::integer = week_starts_on)
);
create index weekly_reviews_owner_recent on public.weekly_reviews(user_id,week_start desc);

create table public.monthly_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_start date not null check (extract(day from month_start)::integer = 1),
  timezone text not null check (char_length(timezone) between 1 and 80),
  biggest_wins text not null default '' check (char_length(biggest_wins) <= 4000),
  biggest_failures text not null default '' check (char_length(biggest_failures) <= 4000),
  habits_improved text not null default '' check (char_length(habits_improved) <= 4000),
  habits_slipped text not null default '' check (char_length(habits_slipped) <= 4000),
  fitness_progress text not null default '' check (char_length(fitness_progress) <= 4000),
  career_progress text not null default '' check (char_length(career_progress) <= 4000),
  changes_next_month text not null default '' check (char_length(changes_next_month) <= 4000),
  notes text not null default '' check (char_length(notes) <= 4000),
  revision bigint not null default nextval('public.tracking_revision_seq'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id,user_id), unique (user_id,month_start)
);
create index monthly_reflections_owner_recent on public.monthly_reflections(user_id,month_start desc);

do $$
declare table_name text;
begin
  foreach table_name in array array['weekly_reviews','monthly_reflections'] loop
    execute format('alter table public.%I enable row level security',table_name);
    execute format('revoke all on public.%I from public,anon,authenticated',table_name);
    execute format('grant select on public.%I to authenticated',table_name);
    execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid())=user_id)',table_name||'_select',table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid())=user_id)',table_name||'_insert',table_name);
    execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id)',table_name||'_update',table_name);
    execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid())=user_id)',table_name||'_delete',table_name);
    execute format('create trigger %I before update on public.%I for each row execute function private.touch_updated_at()',table_name||'_updated',table_name);
    execute format('create trigger %I before update on public.%I for each row execute function private.fitness_revision()',table_name||'_revision',table_name);
  end loop;
end;
$$;

create function public.save_weekly_review(p_input jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  owner_id uuid:=private.tracking_owner();
  prefs public.user_preferences;
  anchor date:=(p_input->>'periodStart')::date;
  expected bigint:=nullif(p_input->>'expectedRevision','')::bigint;
  existing public.weekly_reviews;
  saved public.weekly_reviews;
begin
  select * into strict prefs from public.user_preferences where user_id=owner_id;
  if anchor is null or anchor>(now() at time zone prefs.timezone)::date then
    raise exception 'Choose a current or past week' using errcode='23514';
  end if;
  select * into existing from public.weekly_reviews where user_id=owner_id and week_start=anchor for update;
  if found then
    if existing.revision is distinct from expected then raise exception 'Review changed' using errcode='40001'; end if;
    update public.weekly_reviews set
      wins=coalesce(p_input->>'wins',''), difficulties=coalesce(p_input->>'difficulties',''),
      lessons=coalesce(p_input->>'lessons',''), next_week_changes=coalesce(p_input->>'nextWeekChanges',''),
      energy=nullif(p_input->>'energy','')::integer, focus=nullif(p_input->>'focus','')::integer,
      motivation=nullif(p_input->>'motivation','')::integer, stress=nullif(p_input->>'stress','')::integer,
      mood=nullif(p_input->>'mood','')::integer
      where id=existing.id and user_id=owner_id returning * into saved;
  else
    if expected is not null then raise exception 'Review changed' using errcode='40001'; end if;
    if extract(isodow from anchor)::integer<>prefs.week_starts_on then
      raise exception 'Choose the first day of your current week setting' using errcode='23514';
    end if;
    insert into public.weekly_reviews(user_id,week_start,week_starts_on,timezone,wins,difficulties,lessons,next_week_changes,energy,focus,motivation,stress,mood)
      values(owner_id,anchor,prefs.week_starts_on,prefs.timezone,
        coalesce(p_input->>'wins',''),coalesce(p_input->>'difficulties',''),
        coalesce(p_input->>'lessons',''),coalesce(p_input->>'nextWeekChanges',''),
        nullif(p_input->>'energy','')::integer,nullif(p_input->>'focus','')::integer,
        nullif(p_input->>'motivation','')::integer,nullif(p_input->>'stress','')::integer,
        nullif(p_input->>'mood','')::integer) returning * into saved;
  end if;
  return to_jsonb(saved);
end;
$$;

create function public.save_monthly_reflection(p_input jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  owner_id uuid:=private.tracking_owner();
  prefs public.user_preferences;
  anchor date:=(p_input->>'periodStart')::date;
  expected bigint:=nullif(p_input->>'expectedRevision','')::bigint;
  existing public.monthly_reflections;
  saved public.monthly_reflections;
begin
  select * into strict prefs from public.user_preferences where user_id=owner_id;
  if anchor is null or extract(day from anchor)::integer<>1 or anchor>(now() at time zone prefs.timezone)::date then
    raise exception 'Choose a current or past month' using errcode='23514';
  end if;
  select * into existing from public.monthly_reflections where user_id=owner_id and month_start=anchor for update;
  if found then
    if existing.revision is distinct from expected then raise exception 'Reflection changed' using errcode='40001'; end if;
    update public.monthly_reflections set
      biggest_wins=coalesce(p_input->>'biggestWins',''), biggest_failures=coalesce(p_input->>'biggestFailures',''),
      habits_improved=coalesce(p_input->>'habitsImproved',''), habits_slipped=coalesce(p_input->>'habitsSlipped',''),
      fitness_progress=coalesce(p_input->>'fitnessProgress',''), career_progress=coalesce(p_input->>'careerProgress',''),
      changes_next_month=coalesce(p_input->>'changesNextMonth',''), notes=coalesce(p_input->>'notes','')
      where id=existing.id and user_id=owner_id returning * into saved;
  else
    if expected is not null then raise exception 'Reflection changed' using errcode='40001'; end if;
    insert into public.monthly_reflections(user_id,month_start,timezone,biggest_wins,biggest_failures,habits_improved,habits_slipped,fitness_progress,career_progress,changes_next_month,notes)
      values(owner_id,anchor,prefs.timezone,coalesce(p_input->>'biggestWins',''),coalesce(p_input->>'biggestFailures',''),
        coalesce(p_input->>'habitsImproved',''),coalesce(p_input->>'habitsSlipped',''),
        coalesce(p_input->>'fitnessProgress',''),coalesce(p_input->>'careerProgress',''),
        coalesce(p_input->>'changesNextMonth',''),coalesce(p_input->>'notes','')) returning * into saved;
  end if;
  return to_jsonb(saved);
end;
$$;

revoke all on function public.save_weekly_review(jsonb),public.save_monthly_reflection(jsonb) from public,anon;
grant execute on function public.save_weekly_review(jsonb),public.save_monthly_reflection(jsonb) to authenticated;
