-- Keep owner-first list lookup and cover the composite parent foreign key.
create index categories_area_owner on public.categories(life_area_id, user_id);
