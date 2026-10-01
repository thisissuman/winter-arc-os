-- Development-project Phase 2 security verification. Every fixture rolls back.
-- Run only after applying the Phase 2 migration to the configured project.
begin;
set local plpgsql.check_asserts = on;
set constraints all immediate;
do $$
declare
  owner_a uuid := gen_random_uuid();
  owner_b uuid := gen_random_uuid();
  challenge_a uuid := gen_random_uuid();
  challenge_b uuid := gen_random_uuid();
  habit_a uuid := gen_random_uuid();
  habit_b uuid := gen_random_uuid();
  metric_a uuid := gen_random_uuid();
  table_name text;
  seen integer;
  blocked boolean;
  saved jsonb;
  retried jsonb;
  date_value date := (now() at time zone 'Asia/Kolkata')::date;
begin
  insert into auth.users(id,raw_user_meta_data) values
    (owner_a,'{"display_name":"Phase 2 fixture A"}'),
    (owner_b,'{"display_name":"Phase 2 fixture B"}');
  insert into public.challenges(id,user_id,title,start_date,end_date) values
    (challenge_a,owner_a,'A',date_value,date_value+7),
    (challenge_b,owner_b,'B',date_value,date_value+7);
  insert into public.habits(id,user_id,name,active_from) values
    (habit_a,owner_a,'A habit',date_value),
    (habit_b,owner_b,'B habit',date_value);
  insert into public.habit_schedules(user_id,habit_id,frequency,required_count,effective_from,timezone,week_starts_on)
    values(owner_a,habit_a,'DAILY',1,date_value,'Asia/Kolkata',1);
  insert into public.metric_definitions(id,user_id,name,unit,source,aggregation,active_from,source_available_from)
    values(metric_a,owner_a,'Water','ml','manual','sum',date_value,date_value);

  foreach table_name in array array[
    'challenges','habits','habit_schedules','habit_logs','metric_definitions','metric_targets',
    'metric_logs','frequency_targets','frequency_target_rules','score_categories','score_policies',
    'score_category_weights','score_items','challenge_habits','challenge_metrics',
    'challenge_targets','tracking_operations'
  ] loop
    assert (select relrowsecurity from pg_class where oid=('public.'||table_name)::regclass), 'RLS disabled: '||table_name;
    assert has_table_privilege('authenticated','public.'||table_name,'select'), 'Authenticated read denied: '||table_name;
    assert not has_table_privilege('authenticated','public.'||table_name,'insert'), 'Direct insert permitted: '||table_name;
    assert not has_table_privilege('authenticated','public.'||table_name,'update'), 'Direct update permitted: '||table_name;
    assert not has_table_privilege('authenticated','public.'||table_name,'delete'), 'Direct delete permitted: '||table_name;
    execute 'set local role anon';
    blocked := false;
    begin
      execute format('select count(*) from public.%I',table_name) into seen;
    exception when insufficient_privilege then blocked := true;
    end;
    assert blocked, 'Anonymous read permitted: '||table_name;
    execute 'reset role';
    execute 'set local role authenticated';
    perform set_config('request.jwt.claim.sub',owner_a::text,true);
    execute format('select count(*) from public.%I where user_id=$1',table_name) into seen using owner_b;
    assert seen=0, 'Cross-owner read permitted: '||table_name;
    perform set_config('request.jwt.claim.sub',owner_b::text,true);
    execute format('select count(*) from public.%I where user_id=$1',table_name) into seen using owner_a;
    assert seen=0, 'Reverse cross-owner read permitted: '||table_name;
    execute 'reset role';
  end loop;

  blocked := false;
  begin
    insert into public.challenge_habits(user_id,challenge_id,habit_id) values(owner_a,challenge_b,habit_a);
  exception when foreign_key_violation then blocked := true;
  end;
  assert blocked, 'Cross-owner challenge association permitted';
  blocked := false;
  begin
    update public.user_preferences set selected_challenge_id=challenge_b where user_id=owner_a;
  exception when foreign_key_violation then blocked := true;
  end;
  assert blocked, 'Cross-owner selected challenge permitted';

  execute 'set local role authenticated';
  perform set_config('request.jwt.claim.sub',owner_a::text,true);
  saved := public.write_tracking_habit_log(jsonb_build_object('habitId',habit_a,'date',date_value,'status','completed','completionCount',1));
  assert (saved->>'completion_count')::integer=1, 'Owned habit write failed';
  blocked := false;
  begin
    perform public.write_tracking_habit_log(jsonb_build_object('habitId',habit_b,'date',date_value,'status','completed','completionCount',1));
  exception when insufficient_privilege then blocked := true;
  end;
  assert blocked, 'Cross-owner habit write permitted';
  saved := public.increment_tracking_metric(jsonb_build_object('metricId',metric_a,'date',date_value,'amount',250,'operationId',gen_random_uuid()));
  assert (saved->>'value')::numeric=250, 'Metric increment failed';
  -- A stable operation identifier returns the stored receipt, not another addition.
  saved := public.increment_tracking_metric(jsonb_build_object('metricId',metric_a,'date',date_value,'amount',500,'operationId','40000000-0000-4000-8000-000000000001'));
  retried := public.increment_tracking_metric(jsonb_build_object('metricId',metric_a,'date',date_value,'amount',500,'operationId','40000000-0000-4000-8000-000000000001'));
  assert saved=retried and (saved->>'value')::numeric=750, 'Metric retry duplicated or changed the addition';
  execute 'reset role';
end;
$$;
rollback;
select 'Phase 2 security checks passed; all fixtures rolled back' as result;
