begin;
set constraints all immediate;
insert into auth.users(id,email,raw_user_meta_data)
values ('90000000-0000-4000-8000-000000000011','controls-hosted-a@example.test','{"display_name":"Data control fixture A"}'),
       ('90000000-0000-4000-8000-000000000012','controls-hosted-b@example.test','{"display_name":"Data control fixture B"}');
insert into life_areas(user_id,name) values
('90000000-0000-4000-8000-000000000011','Fixture A area'),
('90000000-0000-4000-8000-000000000012','Fixture B area');
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000011',true);
do $$
declare payload jsonb;
begin
  payload:=public.export_workspace_data();
  if payload->>'format_version'<>'1' or jsonb_array_length(payload->'data'->'life_areas')<>1
     or payload->'data' ? 'tracking_operations' then raise exception 'Export isolation failed'; end if;
  if payload->'data'->'life_areas'->0->>'user_id'<>'90000000-0000-4000-8000-000000000011' then raise exception 'Export owner failed'; end if;
  begin
    perform public.delete_workspace_data('wrong');
    raise exception 'Confirmation accepted';
  exception when check_violation then null;
  end;
  perform public.delete_workspace_data('DELETE MY DATA');
  payload:=public.export_workspace_data();
  if jsonb_array_length(payload->'data'->'life_areas')<>0 or jsonb_array_length(payload->'data'->'profiles')<>1 then raise exception 'Workspace scope failed'; end if;
end;
$$;
reset role;
do $$
begin
  if has_function_privilege('authenticated','private.clear_workspace(uuid)','execute') then raise exception 'Private helper exposed'; end if;
  if (select count(*) from life_areas where user_id='90000000-0000-4000-8000-000000000012')<>1 then raise exception 'Other owner modified'; end if;
end;
$$;
set local role anon;
do $$
begin
  begin
    perform public.export_workspace_data();
    raise exception 'Anonymous export accepted';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
delete from auth.users where id='90000000-0000-4000-8000-000000000012';
do $$
begin
  if exists(select 1 from life_areas where user_id='90000000-0000-4000-8000-000000000012') then raise exception 'Account cascade failed'; end if;
end;
$$;
rollback;
select 'Phase 8 data-control security checks passed; all fixtures rolled back' as result;
