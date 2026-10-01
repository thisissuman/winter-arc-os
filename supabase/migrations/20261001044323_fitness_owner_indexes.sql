-- Cover direct auth-user cascade foreign keys on fitness child tables.
create index workout_exercises_owner on public.workout_exercises(user_id);
create index workout_sets_owner on public.workout_sets(user_id);
