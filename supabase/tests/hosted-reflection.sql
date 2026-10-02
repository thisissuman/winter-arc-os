-- Phase 7 hosted development-project security check. All synthetic rows roll back.
begin;
set local plpgsql.check_asserts = on;
set constraints all immediate;
do $$
declare
  owner_a uuid:=gen_random_uuid(); owner_b uuid:=gen_random_uuid();
  week_anchor date:=date_trunc('week',(now() at time zone 'Asia/Kolkata'))::date;
  month_anchor date:=date_trunc('month',(now() at time zone 'Asia/Kolkata'))::date;
  saved jsonb; revised jsonb; table_name text; seen integer; blocked boolean;
begin
  insert into auth.users(id,raw_user_meta_data) values
    (owner_a,'{"display_name":"Reflection fixture A"}'),(owner_b,'{"display_name":"Reflection fixture B"}');
  foreach table_name in array array['weekly_reviews','monthly_reflections'] loop
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
  end loop;
  execute 'set local role authenticated';
  perform set_config('request.jwt.claim.sub',owner_a::text,true);
  saved:=public.save_weekly_review(jsonb_build_object('periodStart',week_anchor,'wins','Fixture win','energy',4));
  revised:=public.save_weekly_review(jsonb_build_object('periodStart',week_anchor,'expectedRevision',saved->>'revision','wins','Edited fixture'));
  assert saved->>'id'=revised->>'id', 'Weekly edit duplicated the period';
  assert saved->>'revision'<>revised->>'revision', 'Weekly revision did not change';
  perform public.save_monthly_reflection(jsonb_build_object('periodStart',month_anchor,'biggestWins','Fixture progress'));
  execute 'reset role';
  execute 'set local role authenticated';
  perform set_config('request.jwt.claim.sub',owner_b::text,true);
  assert (select count(*) from public.weekly_reviews where week_start=week_anchor)=0, 'Cross-owner weekly read permitted';
  assert (select count(*) from public.monthly_reflections where month_start=month_anchor)=0, 'Cross-owner monthly read permitted';
  blocked:=false;
  begin perform public.save_weekly_review(jsonb_build_object('periodStart',week_anchor,'expectedRevision',revised->>'revision','wins','Cross owner'));
  exception when serialization_failure then blocked:=true; end;
  assert blocked, 'Cross-owner edit succeeded';
  execute 'reset role';
end;
$$;
rollback;
select 'Phase 7 reflection security checks passed; all fixtures rolled back' as result;
