-- Fifty50: roommates group type + recorded payments (settlements)
-- Apply via Supabase SQL editor after 0001_init_schema.sql.

-- ============================================================
-- groups.group_type — distinguishes finite trips from persistent
-- roommate groups. Drives default UI (icon, categories) only; the
-- balance/expense model itself is identical for both.
-- ============================================================
alter table public.groups
  add column group_type text not null default 'trip' check (group_type in ('trip', 'roommates'));

-- ============================================================
-- settlements — a recorded real-world payment between two members
-- (Bizum, cash, etc). Distinct from expenses: not split, not
-- categorized, just moves balance from one member to another.
-- ============================================================
create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  from_member_id uuid not null references public.group_members(id) on delete restrict,
  to_member_id uuid not null references public.group_members(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  note text,
  created_by uuid not null references auth.users(id),
  date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint settlements_distinct_members check (from_member_id <> to_member_id)
);
create index settlements_group_id_idx on public.settlements (group_id);
alter table public.settlements enable row level security;

create policy "settlements_select_member" on public.settlements for select to authenticated using (private.is_group_member(group_id, auth.uid()));
create policy "settlements_insert_member" on public.settlements for insert to authenticated with check (private.is_group_member(group_id, auth.uid()) and created_by = auth.uid());
create policy "settlements_delete_member" on public.settlements for delete to authenticated using (private.is_group_member(group_id, auth.uid()));

-- ============================================================
-- create_group_with_creator — add p_group_type (defaults to 'trip'
-- so existing call sites keep working unchanged until updated).
-- ============================================================
create or replace function public.create_group_with_creator(
  p_name text,
  p_currency text,
  p_display_name text,
  p_group_type text default 'trip'
)
returns public.groups language plpgsql security invoker set search_path = public as $$
declare v_group public.groups;
begin
  insert into public.groups (name, currency, created_by, group_type)
    values (p_name, p_currency, auth.uid(), p_group_type) returning * into v_group;
  insert into public.group_members (group_id, user_id, display_name) values (v_group.id, auth.uid(), p_display_name);
  return v_group;
end; $$;
