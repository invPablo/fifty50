-- Tranzfr: fix premium gate loophole — the original check counted
-- currently-existing groups (count(*) from groups where created_by = ...),
-- so deleting your one free group reset the count to 0 and let you
-- create another "free" one indefinitely. Track a lifetime counter on
-- profiles instead, which only ever increments.

alter table public.profiles
  add column groups_created_count integer not null default 0;

-- Backfill from current live groups so existing users who already used
-- their free group stay capped; this can't "fix" past deletions (that
-- history is gone), it just stops the loophole going forward.
update public.profiles p
set groups_created_count = (
  select count(*) from public.groups g where g.created_by = p.id
);

create or replace function public.enforce_group_creation_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_is_premium boolean;
  v_groups_created_count int;
begin
  select is_premium, groups_created_count into v_is_premium, v_groups_created_count
  from public.profiles where id = new.created_by;

  if not coalesce(v_is_premium, false) and coalesce(v_groups_created_count, 0) >= 1 then
    raise exception 'premium_required';
  end if;

  update public.profiles
    set groups_created_count = coalesce(groups_created_count, 0) + 1
    where id = new.created_by;

  return new;
end; $$;
