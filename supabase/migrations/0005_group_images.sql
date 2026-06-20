-- Tranzfr: group cover photos.
-- Apply via Supabase SQL editor after 0004_fix_premium_gate_loophole.sql.

-- ============================================================
-- groups.image_url — public URL of the cover photo in the
-- "group-images" storage bucket. Nullable: falls back to the
-- color/icon card in the UI when not set.
-- ============================================================
alter table public.groups add column if not exists image_url text;

-- ============================================================
-- storage bucket — public so getPublicUrl() works without signed
-- URLs (cover photos aren't sensitive). Objects are still gated by
-- the policies below; "public" only skips the anon read check.
-- Upload path convention: "<group_id>/<filename>".
-- ============================================================
insert into storage.buckets (id, name, public)
values ('group-images', 'group-images', true)
on conflict (id) do nothing;

create policy "group_images_select_public" on storage.objects
  for select to public using (bucket_id = 'group-images');

create policy "group_images_insert_member" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'group-images'
    and private.is_group_member((storage.foldername(name))[1]::uuid, auth.uid())
  );

create policy "group_images_update_member" on storage.objects
  for update to authenticated using (
    bucket_id = 'group-images'
    and private.is_group_member((storage.foldername(name))[1]::uuid, auth.uid())
  );

create policy "group_images_delete_member" on storage.objects
  for delete to authenticated using (
    bucket_id = 'group-images'
    and private.is_group_member((storage.foldername(name))[1]::uuid, auth.uid())
  );
