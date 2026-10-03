begin;
insert into auth.users(id,email) values('90000000-0000-4000-8000-000000000001','simple-a@example.test'),('90000000-0000-4000-8000-000000000002','simple-b@example.test');
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000001',true);
select save_habit('Rollback habit',array[1,2,3,4,5,6,7]::smallint[]);
select set_habit_completion(id,(now() at time zone 'Asia/Kolkata')::date,true,0) from habits;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000002',true);
do $$ begin
 if exists(select 1 from habits) or exists(select 1 from habit_schedules) or exists(select 1 from habit_logs) then raise exception 'Cross-account read'; end if;
 if jsonb_array_length(export_workspace_data()->'data'->'habits')<>0 then raise exception 'Cross-account export'; end if;
end $$;
select delete_workspace_data('DELETE MY DATA');
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000001',true);
do $$ begin if (select count(*) from habits)<>1 then raise exception 'Cross-account deletion'; end if; end $$;
reset role;
delete from auth.users where id='90000000-0000-4000-8000-000000000001';
do $$ begin if exists(select 1 from habits where user_id='90000000-0000-4000-8000-000000000001') then raise exception 'Account children remain'; end if; end $$;
rollback;
