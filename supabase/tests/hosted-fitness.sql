-- Phase 3 hosted development-project security and transaction check.
-- All synthetic rows and Auth users are rolled back, including on assertion failure.
begin;
set local plpgsql.check_asserts = on;
set constraints all immediate;
do $$
declare
  owner_a uuid:=gen_random_uuid(); owner_b uuid:=gen_random_uuid();
  day_value date:=(now() at time zone 'Asia/Kolkata')::date;
  exercise_a uuid; workout_a uuid; copied_a uuid; retry_a uuid; operation_a uuid:=gen_random_uuid();
  saved jsonb; table_name text; seen integer; blocked boolean;
begin
  insert into auth.users(id,raw_user_meta_data) values(owner_a,'{"display_name":"Fitness fixture A"}'),(owner_b,'{"display_name":"Fitness fixture B"}');
  foreach table_name in array array['sleep_logs','exercises','workouts','workout_exercises','workout_sets','workout_operations'] loop
    assert (select relrowsecurity from pg_class where oid=('public.'||table_name)::regclass), 'RLS disabled: '||table_name;
    assert has_table_privilege('authenticated','public.'||table_name,'select'), 'Authenticated read denied: '||table_name;
    assert not has_table_privilege('authenticated','public.'||table_name,'insert'), 'Direct insert permitted: '||table_name;
    assert not has_table_privilege('authenticated','public.'||table_name,'update'), 'Direct update permitted: '||table_name;
    assert not has_table_privilege('authenticated','public.'||table_name,'delete'), 'Direct delete permitted: '||table_name;
    execute 'set local role anon';
    blocked:=false;
    begin execute format('select count(*) from public.%I',table_name) into seen;
    exception when insufficient_privilege then blocked:=true; end;
    assert blocked, 'Anonymous read permitted: '||table_name;
    execute 'reset role';
    execute 'set local role authenticated';
    perform set_config('request.jwt.claim.sub',owner_a::text,true);
    execute format('select count(*) from public.%I where user_id=$1',table_name) into seen using owner_b;
    assert seen=0, 'Cross-owner read permitted: '||table_name;
    execute 'reset role';
  end loop;
  execute 'set local role authenticated';
  perform set_config('request.jwt.claim.sub',owner_a::text,true);
  perform public.setup_fitness('{"sleepTarget":8}'::jsonb);
  perform public.setup_fitness('{"sleepTarget":8}'::jsonb);
  assert (select count(*) from public.metric_definitions where user_id=owner_a and starter_key in ('protein','water','body-weight','steps','sleep'))=5, 'Fitness setup duplicated definitions';
  assert (select count(*) from public.metric_logs where user_id=owner_a)=0, 'Fitness setup fabricated measurements';
  saved:=public.save_fitness_sleep(jsonb_build_object('date',day_value,'expectedRevision',null,'clear',false,'sleepStartAt',(day_value::timestamptz-interval '6 hours'),'wakeAt',day_value::timestamptz+interval '2 hours','durationSeconds',28800,'quality',4,'notes',''));
  assert (saved->>'duration_seconds')::integer=28800, 'Sleep duration not saved';
  saved:=public.save_fitness_exercise(jsonb_build_object('id',null,'name','Squat','muscleGroup','Legs','archive',false));
  exercise_a:=(saved->>'id')::uuid;
  saved:=public.save_fitness_workout(jsonb_build_object('id',null,'expectedRevision',null,'date',day_value,'name','Fixture workout','durationSeconds',3600,'notes','','status','completed','challengeId',null,'exercises',jsonb_build_array(jsonb_build_object('exerciseId',exercise_a,'notes','','sets',jsonb_build_array(jsonb_build_object('weightKg',80,'reps',5,'rpe',8))))));
  workout_a:=(saved->>'id')::uuid;
  copied_a:=public.copy_fitness_workout(workout_a,day_value,operation_a);
  retry_a:=public.copy_fitness_workout(workout_a,day_value,operation_a);
  assert copied_a=retry_a, 'Workout copy retry created another workout';
  assert (select status from public.workouts where id=copied_a)='draft', 'Copied workout should be draft';
  assert (select count(*) from public.workout_sets where workout_exercise_id in (select id from public.workout_exercises where workout_id=copied_a))=1, 'Copied sets missing';
  execute 'reset role';
  execute 'set local role authenticated';
  perform set_config('request.jwt.claim.sub',owner_b::text,true);
  assert (select count(*) from public.workouts where id=workout_a)=0, 'Cross-owner workout read permitted';
  blocked:=false;
  begin perform public.copy_fitness_workout(workout_a,day_value,gen_random_uuid());
  exception when insufficient_privilege then blocked:=true; end;
  assert blocked, 'Cross-owner workout copy permitted';
  execute 'reset role';
end;
$$;
rollback;
select 'Phase 3 fitness security checks passed; all fixtures rolled back' as result;
