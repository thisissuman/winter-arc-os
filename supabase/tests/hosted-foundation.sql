-- Development-project security verification. All fixtures are rolled back.
-- Run only after applying the foundation migration, using an authorized SQL connection.
-- This tests PostgreSQL roles/RLS; it does not replace Auth API or browser tests.
begin;
set local plpgsql.check_asserts = on;
set constraints all immediate;
do $$
declare
  owner_a uuid := gen_random_uuid();
  owner_b uuid := gen_random_uuid();
  area_a uuid := gen_random_uuid();
  area_b uuid := gen_random_uuid();
  table_name text;
  operation text;
  count_seen integer;
  affected integer;
  blocked boolean;
begin
  insert into auth.users(id, raw_user_meta_data) values
    (owner_a, '{"display_name":"Temporary security fixture A"}'),
    (owner_b, '{"display_name":"Temporary security fixture B"}');
  assert (select count(*) = 2 from public.profiles where user_id in (owner_a, owner_b)), 'Profile initializer failed';
  assert (select count(*) = 2 from public.user_preferences where user_id in (owner_a, owner_b) and timezone = 'Asia/Kolkata' and theme = 'dark' and week_starts_on = 1), 'Preference initializer failed';
  assert not has_function_privilege('authenticated','private.initialize_user()','execute'), 'Initializer is executable by a user';
  insert into public.life_areas(id,user_id,name) values (area_a,owner_a,'Fixture A'),(area_b,owner_b,'Fixture B');
  insert into public.categories(user_id,life_area_id,name) values (owner_a,area_a,'Fixture A'),(owner_b,area_b,'Fixture B');

  foreach table_name in array array['profiles','user_preferences','life_areas','categories'] loop
    execute 'set local role anon';
    blocked := false;
    begin
      execute format('select count(*) from public.%I',table_name) into count_seen;
    exception when insufficient_privilege then blocked := true;
    end;
    assert blocked, 'Anonymous read permitted: ' || table_name;
    foreach operation in array array['insert','update','delete'] loop
      blocked := false;
      begin
        if operation = 'insert' then
          if table_name in ('profiles','user_preferences') then
            execute format('insert into public.%I(user_id) values ($1)',table_name) using owner_a;
          else
            execute format('insert into public.%I(user_id,name) values ($1,''Anonymous'')',table_name) using owner_a;
          end if;
        elsif operation = 'update' then
          execute format('update public.%I set updated_at=now() where user_id=$1',table_name) using owner_a;
        else
          execute format('delete from public.%I where user_id=$1',table_name) using owner_a;
        end if;
      exception when insufficient_privilege then blocked := true;
      end;
      assert blocked, 'Anonymous ' || operation || ' permitted: ' || table_name;
    end loop;
    execute 'reset role';

    execute 'set local role authenticated';
    perform set_config('request.jwt.claim.sub',owner_a::text,true);
    execute format('select count(*) from public.%I where user_id in ($1,$2)',table_name) into count_seen using owner_a,owner_b;
    assert count_seen = 1, 'A/B read isolation failed: ' || table_name;
    execute format('select count(*) from public.%I where user_id=$1',table_name) into count_seen using owner_b;
    assert count_seen = 0, 'Other owner visible: ' || table_name;
    execute format('update public.%I set updated_at=now() where user_id=$1',table_name) using owner_b;
    get diagnostics affected = row_count;
    assert affected = 0, 'Other owner update permitted: ' || table_name;
    execute format('delete from public.%I where user_id=$1',table_name) using owner_b;
    get diagnostics affected = row_count;
    assert affected = 0, 'Other owner delete permitted: ' || table_name;
    execute format('update public.%I set updated_at=now() where user_id=$1',table_name) using owner_a;
    get diagnostics affected = row_count;
    assert affected = 1, 'Own update denied: ' || table_name;

    blocked := false;
    begin
      if table_name in ('profiles','user_preferences') then
        execute format('insert into public.%I(user_id) values ($1)',table_name) using owner_b;
      else
        execute format('insert into public.%I(user_id,name) values ($1,''Forged'')',table_name) using owner_b;
      end if;
    exception when insufficient_privilege then blocked := true;
    end;
    assert blocked, 'Forged owner insert permitted: ' || table_name;
    blocked := false;
    begin
      execute format('update public.%I set user_id=$1 where user_id=$2',table_name) using owner_b,owner_a;
    exception when insufficient_privilege then blocked := true;
    end;
    assert blocked, 'Ownership transfer permitted: ' || table_name;

    perform set_config('request.jwt.claim.sub',owner_b::text,true);
    execute format('select count(*) from public.%I where user_id in ($1,$2)',table_name) into count_seen using owner_a,owner_b;
    assert count_seen = 1, 'B/A read isolation failed: ' || table_name;
    execute 'reset role';
  end loop;

  execute 'set local role authenticated';
  perform set_config('request.jwt.claim.sub',owner_a::text,true);
  blocked := false;
  begin
    insert into public.categories(user_id,life_area_id,name) values (owner_a,area_b,'Cross-owner');
  exception when foreign_key_violation then blocked := true;
  end;
  assert blocked, 'Cross-owner parent insert permitted';
  blocked := false;
  begin
    update public.categories set life_area_id=area_b where user_id=owner_a;
  exception when foreign_key_violation then blocked := true;
  end;
  assert blocked, 'Cross-owner parent update permitted';

  -- Exercise owned insert/delete for each table, with dependent categories removed first.
  delete from public.categories where user_id=owner_a;
  delete from public.life_areas where user_id=owner_a;
  insert into public.life_areas(id,user_id,name) values (area_a,owner_a,'Owned');
  insert into public.categories(user_id,life_area_id,name) values (owner_a,area_a,'Owned');
  delete from public.categories where user_id=owner_a;
  delete from public.life_areas where user_id=owner_a;
  delete from public.profiles where user_id=owner_a;
  insert into public.profiles(user_id) values (owner_a);
  delete from public.user_preferences where user_id=owner_a;
  insert into public.user_preferences(user_id) values (owner_a);
  execute 'reset role';
  delete from auth.users where id=owner_b;
  assert not exists(select 1 from public.categories where user_id=owner_b), 'Category cascade failed';
  assert not exists(select 1 from public.life_areas where user_id=owner_b), 'Area cascade failed';
  assert not exists(select 1 from public.profiles where user_id=owner_b), 'Profile cascade failed';
  assert not exists(select 1 from public.user_preferences where user_id=owner_b), 'Preference cascade failed';
end;
$$;
rollback;
select 'Foundation security checks passed; all fixtures rolled back' as result;
