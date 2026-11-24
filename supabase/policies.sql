-- 2/4 Security rules (Row Level Security). Run after schema.sql.
-- Everyone may READ visible content. Only the admin (listed in public.admins) may WRITE.

-- table access for the website's API roles (rows are still filtered by the policies below)
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
revoke all on public.admins from anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.site_settings      enable row level security;
alter table public.skills             enable row level security;
alter table public.resume_entries     enable row level security;
alter table public.build_items        enable row level security;
alter table public.project_categories enable row level security;
alter table public.projects           enable row level security;
alter table public.contacts           enable row level security;
alter table public.admins             enable row level security;   -- no policies: nobody reads it through the API

-- site_settings: anyone reads, only the admin updates
drop policy if exists "settings readable by everyone" on public.site_settings;
create policy "settings readable by everyone" on public.site_settings
  for select using (true);
drop policy if exists "settings editable by admin" on public.site_settings;
create policy "settings editable by admin" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- list tables: visible rows for everyone, everything for the admin
do $$
declare t text;
begin
  foreach t in array array['skills','resume_entries','build_items','project_categories','projects','contacts'] loop
    execute format('drop policy if exists "visible rows readable" on public.%I', t);
    execute format('create policy "visible rows readable" on public.%I for select using (is_visible or public.is_admin())', t);
    execute format('drop policy if exists "admin inserts" on public.%I', t);
    execute format('create policy "admin inserts" on public.%I for insert to authenticated with check (public.is_admin())', t);
    execute format('drop policy if exists "admin updates" on public.%I', t);
    execute format('create policy "admin updates" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('drop policy if exists "admin deletes" on public.%I', t);
    execute format('create policy "admin deletes" on public.%I for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;
