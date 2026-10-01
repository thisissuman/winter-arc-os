-- Reject absent JSON child arrays even from direct authenticated RPC calls.
create or replace function public.save_fitness_workout(p_input jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner(); preferences public.user_preferences; existing public.workouts; saved public.workouts;
  target_workout_id uuid:=nullif(p_input->>'id','')::uuid; date_value date:=(p_input->>'date')::date;
  item jsonb; set_item jsonb; child_id uuid; exercise_id_value uuid; position_value integer:=0; set_value integer;
begin
  select * into strict preferences from public.user_preferences where user_id=owner_id;
  if date_value is null or date_value>(now() at time zone preferences.timezone)::date then raise exception 'Choose a past or current workout date' using errcode='23514'; end if;
  if jsonb_typeof(p_input->'exercises') is distinct from 'array' or jsonb_array_length(p_input->'exercises')>30 then raise exception 'Invalid exercise list' using errcode='23514'; end if;
  if p_input->>'status'='completed' and jsonb_array_length(p_input->'exercises')=0 then raise exception 'Completed workouts need an exercise' using errcode='23514'; end if;
  if nullif(p_input->>'challengeId','') is not null and not exists(select 1 from public.challenges where id=(p_input->>'challengeId')::uuid and user_id=owner_id) then raise exception 'Challenge unavailable' using errcode='42501'; end if;
  if target_workout_id is null then
    insert into public.workouts(user_id,business_date,timezone,name,duration_seconds,notes,status,challenge_id)
      values(owner_id,date_value,preferences.timezone,p_input->>'name',(p_input->>'durationSeconds')::integer,coalesce(p_input->>'notes',''),p_input->>'status',nullif(p_input->>'challengeId','')::uuid) returning * into saved;
  else
    select * into existing from public.workouts where id=target_workout_id and user_id=owner_id for update;
    if not found then raise exception 'Workout unavailable' using errcode='42501'; end if;
    if existing.revision is distinct from (p_input->>'expectedRevision')::bigint then raise exception 'Workout changed' using errcode='40001'; end if;
    update public.workouts set business_date=date_value,name=p_input->>'name',duration_seconds=(p_input->>'durationSeconds')::integer,
      notes=coalesce(p_input->>'notes',''),status=p_input->>'status',challenge_id=nullif(p_input->>'challengeId','')::uuid
      where id=target_workout_id and user_id=owner_id returning * into saved;
    delete from public.workout_exercises where workout_id=target_workout_id and user_id=owner_id;
  end if;
  for item in select value from jsonb_array_elements(p_input->'exercises') loop
    exercise_id_value:=(item->>'exerciseId')::uuid;
    if not exists(select 1 from public.exercises where id=exercise_id_value and user_id=owner_id) then raise exception 'Exercise unavailable' using errcode='42501'; end if;
    if jsonb_typeof(item->'sets') is distinct from 'array' or jsonb_array_length(item->'sets') not between 1 and 50 then raise exception 'Invalid set list' using errcode='23514'; end if;
    insert into public.workout_exercises(user_id,workout_id,exercise_id,position,notes)
      values(owner_id,saved.id,exercise_id_value,position_value,coalesce(item->>'notes','')) returning id into child_id;
    set_value:=1;
    for set_item in select value from jsonb_array_elements(item->'sets') loop
      insert into public.workout_sets(user_id,workout_exercise_id,set_number,weight_kg,reps,rpe)
        values(owner_id,child_id,set_value,(set_item->>'weightKg')::numeric,(set_item->>'reps')::integer,(set_item->>'rpe')::numeric);
      set_value:=set_value+1;
    end loop;
    position_value:=position_value+1;
  end loop;
  if saved.status='completed' then
    update public.frequency_targets set source_available_from=coalesce(source_available_from,date_value)
      where user_id=owner_id and source='workouts' and source_available_from is null and active_from<=date_value;
  end if;
  return to_jsonb(saved);
end;
$$;
