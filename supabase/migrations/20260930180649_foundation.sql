-- Foundation only. Tracking and challenge tables arrive in later phases.
create schema if not exists private;
revoke all on schema private from public;

create function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  timezone text not null default 'Asia/Kolkata',
  week_starts_on smallint not null default 1 check (week_starts_on between 1 and 7),
  theme text not null default 'dark' check (theme in ('dark', 'light', 'system')),
  privacy_mode boolean not null default false,
  hide_private_today boolean not null default false,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function private.validate_timezone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.timezone) then
    raise exception 'Invalid timezone' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger validate_preferences_timezone
before insert or update of timezone on public.user_preferences
for each row execute function private.validate_timezone();

create table public.life_areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  icon text,
  color text,
  position integer not null default 0 check (position >= 0),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  life_area_id uuid,
  name text not null check (char_length(trim(name)) between 1 and 80),
  position integer not null default 0 check (position >= 0),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (life_area_id, user_id) references public.life_areas(id, user_id) on delete no action deferrable initially deferred
);

create index life_areas_owner_position on public.life_areas(user_id, position);
create index categories_owner_area on public.categories(user_id, life_area_id);

-- The initializer has no browser/RPC execution grant and a fixed search path.
-- Idempotence allows safe re-initialization without overwriting user settings.
create function private.initialize_user()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles(user_id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 80))
  on conflict (user_id) do nothing;
  insert into public.user_preferences(user_id)
  values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.initialize_user();

-- Include existing accounts when this migration is applied to a fresh app schema.
insert into public.profiles(user_id, display_name)
select id, left(coalesce(raw_user_meta_data ->> 'display_name', ''), 80) from auth.users
on conflict (user_id) do nothing;
insert into public.user_preferences(user_id) select id from auth.users
on conflict (user_id) do nothing;

revoke all on all functions in schema private from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.life_areas enable row level security;
alter table public.categories enable row level security;

-- Explicit grants keep RLS necessary even when project defaults differ.
revoke all on public.profiles, public.user_preferences, public.life_areas, public.categories from anon;
grant select, insert, update, delete on public.profiles, public.user_preferences, public.life_areas, public.categories to authenticated;

create policy profiles_select on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy profiles_insert on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy profiles_update on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy profiles_delete on public.profiles for delete to authenticated using ((select auth.uid()) = user_id);

create policy preferences_select on public.user_preferences for select to authenticated using ((select auth.uid()) = user_id);
create policy preferences_insert on public.user_preferences for insert to authenticated with check ((select auth.uid()) = user_id);
create policy preferences_update on public.user_preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy preferences_delete on public.user_preferences for delete to authenticated using ((select auth.uid()) = user_id);

create policy areas_select on public.life_areas for select to authenticated using ((select auth.uid()) = user_id);
create policy areas_insert on public.life_areas for insert to authenticated with check ((select auth.uid()) = user_id);
create policy areas_update on public.life_areas for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy areas_delete on public.life_areas for delete to authenticated using ((select auth.uid()) = user_id);

create policy categories_select on public.categories for select to authenticated using ((select auth.uid()) = user_id);
create policy categories_insert on public.categories for insert to authenticated with check ((select auth.uid()) = user_id);
create policy categories_update on public.categories for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy categories_delete on public.categories for delete to authenticated using ((select auth.uid()) = user_id);

create trigger profiles_updated before update on public.profiles for each row execute function private.touch_updated_at();
create trigger preferences_updated before update on public.user_preferences for each row execute function private.touch_updated_at();
create trigger areas_updated before update on public.life_areas for each row execute function private.touch_updated_at();
create trigger categories_updated before update on public.categories for each row execute function private.touch_updated_at();
