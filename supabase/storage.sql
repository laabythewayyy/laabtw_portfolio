-- 3/4 File storage for the avatar, project screenshots and the CV. Run after policies.sql.
-- Bucket "media": anyone can view files, only the admin can upload/replace/delete. Max 5 MB per file.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media upload by admin" on storage.objects;
create policy "media upload by admin" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media update by admin" on storage.objects;
create policy "media update by admin" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media delete by admin" on storage.objects;
create policy "media delete by admin" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());
