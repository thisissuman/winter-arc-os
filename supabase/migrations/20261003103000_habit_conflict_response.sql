-- Optimistic-edit conflicts are business errors, not serialization failures.
-- PostgREST retries SQLSTATE 40001; PT409 returns an immediate HTTP conflict.
begin;
do $$ declare r record; definition text; changed integer:=0; begin
 for r in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname in ('save_habit','set_habit_completion','archive_habit','delete_habit') loop
 definition:=pg_get_functiondef(r.oid);
 if position('''40001''' in definition)=0 then raise exception 'Expected conflict code in reviewed routine'; end if;
 execute replace(definition,'''40001''','''PT409''');
 changed:=changed+1;
 end loop;
 if changed<>4 then raise exception 'Unexpected habit routine inventory'; end if;
end $$;
commit;
