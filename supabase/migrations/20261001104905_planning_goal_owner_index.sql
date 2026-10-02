-- Cover the same-owner milestone -> goal foreign key in referenced-column order.
create index goal_milestones_goal_owner on public.goal_milestones(goal_id,user_id);
