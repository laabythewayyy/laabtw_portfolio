-- One-time update (2026-11-25): Zoom and Up/Down sliders for the homepage avatar.
-- Run once in Supabase → SQL Editor → New query → paste → Run. Safe to run again.
-- Empty = automatic framing (the site looks exactly as before until you move a slider).
alter table public.site_settings add column if not exists avatar_zoom real;
alter table public.site_settings add column if not exists avatar_y real;
