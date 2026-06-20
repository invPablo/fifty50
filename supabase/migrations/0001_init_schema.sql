-- Tranzfr: initial multi-user schema (profiles, groups, group_members, expenses, expense_splits)
-- Apply via Supabase SQL editor or `supabase db push`. Idempotent-ish via IF NOT EXISTS / OR REPLACE
-- where reasonable, but tables are not — running twice on the same project will fail on table creation.

create extension if not exists "pgcrypto";

-- ============================================================
-- profiles — public-readable mirror of auth.users
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_authenticated" on public.profiles for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ============================================================
-- groups
-- ============================================================
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  currency text not null default 'EUR' check (currency in ('EUR','USD','GBP')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.groups enable row level security;

-- ============================================================
-- group_members — supports real users AND pending email invites
-- ============================================================
create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  invited_email text,
  display_name text not null,
  created_at timestamptz not null default now(),
  constraint group_members_identity_chk check (
    (user_id is not null and invited_email is null) or (user_id is null and invited_email is not null)
  ),
  constraint group_members_user_unique unique (group_id, user_id)
);
create unique index group_members_email_unique_ci on public.group_members (group_id, lower(invited_email)) where invited_email is not null;
create index group_members_group_id_idx on public.group_members (group_id);
create index group_members_user_id_idx on public.group_members (user_id);
alter table public.group_members enable row level security;

-- ============================================================
-- expenses
-- ============================================================
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  description text not null check (length(trim(description)) > 0),
  amount numeric(12,2) not null check (amount > 0),
  paid_by uuid not null references public.group_members(id) on delete restrict,
  category text not null default 'other' check (category in ('food','transport','housing','leisure','shopping','other')),
  created_by uuid not null references auth.users(id),
  date timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index expenses_group_id_idx on public.expenses (group_id);
alter table public.expenses enable row level security;

-- ============================================================
-- expense_splits — explicit per-member share (avoids float drift,
-- supports future unequal splits)
-- ============================================================
create table public.expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  group_member_id uuid not null references public.group_members(id) on delete restrict,
  share_amount numeric(12,2) not null check (share_amount >= 0),
  constraint expense_splits_unique unique (expense_id, group_member_id)
);
create index expense_splits_expense_id_idx on public.expense_splits (expense_id);
alter table public.expense_splits enable row level security;

-- ============================================================
-- profiles mirror on signup (defensive: never blocks signup)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
exception when others then
  raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ============================================================
-- pending-invite auto-link, gated on email confirmation (not raw signup)
-- so an unverified email can't claim a pending invite slot before
-- proving ownership of that address.
-- ============================================================
create or replace function public.handle_email_confirmed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.group_members
  set user_id = new.id, invited_email = null
  where invited_email is not null and lower(invited_email) = lower(new.email) and user_id is null;
  return new;
exception when others then
  raise warning 'handle_email_confirmed failed for %: %', new.id, sqlerrm;
  return new;
end; $$;
drop trigger if exists on_auth_user_email_confirmed on auth.users;
create trigger on_auth_user_email_confirmed after update of email_confirmed_at on auth.users
  for each row when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.handle_email_confirmed();

-- ============================================================
-- RLS recursion fix: SECURITY DEFINER helper in a non-exposed schema.
-- group_members policies need to check membership of group_members
-- itself; a self-referencing subquery in the policy would recurse.
-- ============================================================
create schema if not exists private;
create or replace function private.is_group_member(p_group_id uuid, p_user_id uuid)
returns boolean language sql security definer stable set search_path = private, public as $$
  select exists (select 1 from public.group_members gm where gm.group_id = p_group_id and gm.user_id = p_user_id);
$$;
-- SECURITY DEFINER changes the privileges used INSIDE the function, not
-- whether the caller may invoke it — RLS policies run that permission check
-- as the querying role (authenticated), so it still needs EXECUTE granted.
-- Only revoke from anon/public: no anon-facing policy calls this helper.
revoke all on function private.is_group_member(uuid, uuid) from public, anon;
grant execute on function private.is_group_member(uuid, uuid) to authenticated;

-- ============================================================
-- groups policies
-- The SELECT policy also allows the creator (created_by = auth.uid()) so that
-- INSERT ... RETURNING works at creation time: Postgres re-checks the returned
-- row against the SELECT policy, and a brand-new group has no group_members row
-- yet, so a membership-only SELECT policy would reject its own RETURNING with
-- error 42501. The creator can always see groups they created — which is also
-- the semantically correct behaviour.
-- ============================================================
create policy "groups_select_member" on public.groups for select to authenticated using (private.is_group_member(id, auth.uid()) or created_by = auth.uid());
create policy "groups_insert_self" on public.groups for insert to authenticated with check (created_by = auth.uid());
create policy "groups_update_member" on public.groups for update to authenticated using (private.is_group_member(id, auth.uid())) with check (private.is_group_member(id, auth.uid()));
create policy "groups_delete_creator" on public.groups for delete to authenticated using (created_by = auth.uid());

-- ============================================================
-- group_members policies (insert allows: existing member adding someone,
-- OR self-inserting as the very first member of a group you just
-- created — closes the bootstrap gap where a brand-new group has no
-- members yet, so the creator couldn't otherwise pass the membership
-- check to add themselves).
-- ============================================================
create policy "group_members_select_member" on public.group_members for select to authenticated using (private.is_group_member(group_id, auth.uid()));
create policy "group_members_insert_member" on public.group_members for insert to authenticated with check (
  private.is_group_member(group_id, auth.uid())
  or (
    user_id = auth.uid()
    and exists (select 1 from public.groups g where g.id = group_members.group_id and g.created_by = auth.uid())
    and not exists (select 1 from public.group_members gm2 where gm2.group_id = group_members.group_id)
  )
);
create policy "group_members_update_member" on public.group_members for update to authenticated using (private.is_group_member(group_id, auth.uid())) with check (private.is_group_member(group_id, auth.uid()));
create policy "group_members_delete_member" on public.group_members for delete to authenticated using (private.is_group_member(group_id, auth.uid()));

-- ============================================================
-- expenses policies
-- ============================================================
create policy "expenses_select_member" on public.expenses for select to authenticated using (private.is_group_member(group_id, auth.uid()));
create policy "expenses_insert_member" on public.expenses for insert to authenticated with check (private.is_group_member(group_id, auth.uid()) and created_by = auth.uid());
create policy "expenses_update_member" on public.expenses for update to authenticated using (private.is_group_member(group_id, auth.uid())) with check (private.is_group_member(group_id, auth.uid()));
create policy "expenses_delete_member" on public.expenses for delete to authenticated using (private.is_group_member(group_id, auth.uid()));

-- ============================================================
-- expense_splits policies (joins through expenses; not recursive —
-- expenses' own policy already resolves via the SECURITY DEFINER
-- helper, this subquery here just reads expenses, not expense_splits)
-- ============================================================
create policy "expense_splits_select_member" on public.expense_splits for select to authenticated using (exists (select 1 from public.expenses e where e.id = expense_splits.expense_id and private.is_group_member(e.group_id, auth.uid())));
create policy "expense_splits_insert_member" on public.expense_splits for insert to authenticated with check (exists (select 1 from public.expenses e where e.id = expense_splits.expense_id and private.is_group_member(e.group_id, auth.uid())));
create policy "expense_splits_update_member" on public.expense_splits for update to authenticated using (exists (select 1 from public.expenses e where e.id = expense_splits.expense_id and private.is_group_member(e.group_id, auth.uid()))) with check (exists (select 1 from public.expenses e where e.id = expense_splits.expense_id and private.is_group_member(e.group_id, auth.uid())));
create policy "expense_splits_delete_member" on public.expense_splits for delete to authenticated using (exists (select 1 from public.expenses e where e.id = expense_splits.expense_id and private.is_group_member(e.group_id, auth.uid())));

-- ============================================================
-- atomic group creation (group + creator-as-first-member in one call).
-- security invoker (not definer): runs as the calling user, so both
-- inserts inside it are still checked against the policies above.
-- ============================================================
create or replace function public.create_group_with_creator(p_name text, p_currency text, p_display_name text)
returns public.groups language plpgsql security invoker set search_path = public as $$
declare v_group public.groups;
begin
  insert into public.groups (name, currency, created_by) values (p_name, p_currency, auth.uid()) returning * into v_group;
  insert into public.group_members (group_id, user_id, display_name) values (v_group.id, auth.uid(), p_display_name);
  return v_group;
end; $$;
