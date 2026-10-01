-- Cover the composite policy/category FK for efficient parent updates and deletes.
create index score_items_policy_category on public.score_items(policy_id,score_category_id);
