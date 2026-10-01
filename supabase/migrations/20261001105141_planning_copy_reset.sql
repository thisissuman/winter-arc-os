-- A copied plan is new work: preserve estimate, reset status and recorded actual time.
-- The operation record still returns the same copy IDs on retry.
create or replace function public.carry_planning_tasks(p_operation_id uuid,p_source_date date,p_target_date date,p_mode text) returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); prior public.task_carry_operations; source_task public.tasks; copied_id uuid;
  results uuid[]:='{}'; next_position integer;
begin
  if p_operation_id is null or p_source_date is null or p_target_date is null or p_target_date<=p_source_date or p_mode is null or p_mode not in ('move','copy') then
    raise exception 'Choose a later target date and move or copy' using errcode='23514';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':planning-tasks',0));
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':task-carry',0));
  select * into prior from public.task_carry_operations where user_id=owner_id and operation_id=p_operation_id;
  if found then
    if prior.source_date<>p_source_date or prior.target_date<>p_target_date or prior.mode<>p_mode then raise exception 'Operation ID reused for a different request' using errcode='23514'; end if;
    return to_jsonb(prior);
  end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text||':tasks:'||p_target_date::text,0));
  select coalesce(max(position),0) into next_position from public.tasks where user_id=owner_id and business_date=p_target_date;
  for source_task in select * from public.tasks where user_id=owner_id and business_date=p_source_date and status<>'completed' order by position,id for update loop
    next_position:=next_position+1000;
    if p_mode='move' then
      update public.tasks set business_date=p_target_date,position=next_position where id=source_task.id and user_id=owner_id;
      results:=array_append(results,source_task.id);
    else
      insert into public.tasks(user_id,title,notes,business_date,timezone,status,priority,category_id,goal_id,challenge_id,position,estimated_seconds,actual_seconds,is_private)
        values(owner_id,source_task.title,source_task.notes,p_target_date,source_task.timezone,'todo',source_task.priority,
          source_task.category_id,source_task.goal_id,source_task.challenge_id,next_position,source_task.estimated_seconds,null,source_task.is_private)
        returning id into copied_id;
      results:=array_append(results,copied_id);
    end if;
  end loop;
  insert into public.task_carry_operations(user_id,operation_id,source_date,target_date,mode,result_ids)
    values(owner_id,p_operation_id,p_source_date,p_target_date,p_mode,results) returning * into prior;
  return to_jsonb(prior);
end;
$$;
