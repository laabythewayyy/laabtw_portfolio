-- One-time update (2026-11-25): a separate photo for the About section.
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Safe to run again. Empty = the About section keeps showing the homepage avatar.
alter table public.site_settings add column if not exists about_image_url text;
