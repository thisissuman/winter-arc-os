-- Phase 8: complete snapshot exports and ordered, transactional workspace removal.
create function public.export_workspace_data() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  owner_id uuid:=private.tracking_owner();
  table_name text;
  records jsonb;
  payload jsonb:='{}'::jsonb;
begin
  foreach table_name in array array[
    'profiles','user_preferences','life_areas','categories','challenges',
    'challenge_habits','challenge_metrics','challenge_targets','habits','habit_schedules','habit_logs',
    'metric_definitions','metric_targets','metric_logs','frequency_targets','frequency_target_rules',
    'score_categories','score_policies','score_category_weights','score_items',
    'exercises','workouts','workout_exercises','workout_sets','sleep_logs',
    'study_categories','study_sessions','focus_timers','tasks','goals','goal_milestones',
    'weekly_reviews','monthly_reflections'
  ] loop
    execute format('select coalesce(jsonb_agg(to_jsonb(t) order by t.%I),''[]''::jsonb) from public.%I t where user_id=$1',
      case when table_name in ('profiles','user_preferences') then 'user_id' else 'id' end,table_name)
      into records using owner_id;
    payload:=payload||jsonb_build_object(table_name,records);
  end loop;
  return jsonb_build_object('format','winter-arc-os','format_version',1,'generated_at',now(),'data',payload);
end;
$$;

create function private.clear_workspace(owner_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare table_name text;
begin
  -- Explicit child-first order also works when constraints are immediate.
  perform 1 from public.user_preferences where user_id=owner_id for update;
  update public.user_preferences set selected_challenge_id=null,starter_applied_on=null,onboarding_completed=false where user_id=owner_id;
  foreach table_name in array array[
    'tracking_operations','workout_operations','task_carry_operations',
    'workout_sets','workout_exercises','workouts','exercises','sleep_logs',
    'study_sessions','focus_timers','study_categories','tasks','goal_milestones','goals',
    'weekly_reviews','monthly_reflections','score_items','score_category_weights','score_policies','score_categories',
    'challenge_habits','challenge_metrics','challenge_targets','frequency_target_rules','frequency_targets',
    'habit_logs','habit_schedules','habits','metric_logs','metric_targets','metric_definitions',
    'challenges','categories','life_areas'
  ] loop
    execute format('delete from public.%I where user_id=$1',table_name) using owner_id;
  end loop;
end;
$$;

create function public.delete_workspace_data(p_confirmation text) returns void
language plpgsql security definer set search_path = '' as $$
declare owner_id uuid:=private.tracking_owner();
begin
  if p_confirmation is distinct from 'DELETE MY DATA' then
    raise exception 'Type DELETE MY DATA to confirm' using errcode='23514';
  end if;
  perform private.clear_workspace(owner_id);
end;
$$;

create function private.before_account_delete() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.clear_workspace(old.id);
  return old;
end;
$$;
create trigger before_auth_account_delete before delete on auth.users
for each row execute function private.before_account_delete();

revoke all on function private.clear_workspace(uuid),private.before_account_delete() from public,anon,authenticated;
revoke all on function public.export_workspace_data(),public.delete_workspace_data(text) from public,anon;
grant execute on function public.export_workspace_data(),public.delete_workspace_data(text) to authenticated;
