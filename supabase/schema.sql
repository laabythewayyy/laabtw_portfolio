-- 1/4 Tables for the portfolio. Run first in Supabase → SQL Editor.

-- keeps updated_at current on every update
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- the one row of single-value content
create table if not exists public.site_settings (
  id              int primary key default 1 check (id = 1),
  first_name      text not null default '',
  last_name       text not null default '',
  role_line       text not null default '',
  avatar_url      text,
  about_image_url text,          -- About section photo; null = use avatar_url
  avatar_zoom     real,          -- homepage avatar zoom 0.5–2.5 (null = automatic)
  avatar_y        real,          -- homepage avatar up/down -50–50 % (null = centred)
  open_to_work    boolean not null default true,
  cv_url          text,
  about_title     text not null default '',
  about_body      text not null default '',
  about_body_2    text not null default '',
  about_facts     jsonb not null default '[]'::jsonb,   -- [{ "label": "...", "value": "..." }]
  section_headers jsonb not null default '{}'::jsonb,   -- { about: {label, heading}, resume: …, projects: …, contact: … }
  block_titles    jsonb not null default '{}'::jsonb,   -- { skills, build, built, social }
  build_more_text text not null default '',
  copyright_text  text not null default '',
  site_title      text not null default '',
  updated_at      timestamptz not null default now()
);

create table if not exists public.skills (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  percent    int  not null check (percent between 0 and 100),
  sort_order int  not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_entries (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('education', 'work', 'achievement')),
  title       text not null,
  date_label  text not null default '',
  place       text not null default '',
  description text not null default '',
  bullets     text[] not null default '{}',
  sort_order  int  not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.build_items (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  icon        text not null default '',
  description text not null default '',
  sort_order  int  not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.project_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  sort_order int  not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  category_id uuid references public.project_categories (id) on delete set null,
  image_url   text,
  live_url    text,
  code_url    text,
  sort_order  int  not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.contacts (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('contact', 'social', 'profile')),
  platform     text not null,
  icon         text not null default '',
  label        text not null default '',
  url          text not null,
  show_in_hero boolean not null default false,
  sort_order   int  not null default 0,
  is_visible   boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- who may edit: exactly the user ids listed here
create table if not exists public.admins (
  user_id uuid primary key
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

do $$
declare t text;
begin
  foreach t in array array['site_settings','skills','resume_entries','build_items','project_categories','projects','contacts'] loop
    execute format('drop trigger if exists %1$s_updated_at on public.%1$s', t);
    execute format('create trigger %1$s_updated_at before update on public.%1$s for each row execute function public.set_updated_at()', t);
  end loop;
end $$;
