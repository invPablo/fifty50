-- Tranzfr: free-tier gate — 1 free group per user, then premium required.
-- Apply via Supabase SQL editor after 0002_roommates_and_settlements.sql.

alter table public.profiles
  add column is_premium boolean not null default false;

-- ============================================================
-- enforce_group_creation_limit — BEFORE INSERT trigger on groups.
-- Lives at the trigger level (not just in create_group_with_creator)
-- so it can't be bypassed by inserting into groups directly via the
-- REST API with the anon key — every insert path is covered.
-- ============================================================
create or replace function public.enforce_group_creation_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_is_premium boolean;
  v_existing_count int;
begin
  select is_premium into v_is_premium from public.profiles where id = new.created_by;
  select count(*) into v_existing_count from public.groups where created_by = new.created_by;

  if not coalesce(v_is_premium, false) and v_existing_count >= 1 then
    raise exception 'premium_required';
  end if;

  return new;
end; $$;

drop trigger if exists enforce_group_creation_limit_trg on public.groups;
create trigger enforce_group_creation_limit_trg
  before insert on public.groups
  for each row execute function public.enforce_group_creation_limit();
