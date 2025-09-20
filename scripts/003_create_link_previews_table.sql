-- Create link previews table for caching Open Graph data
create table if not exists public.link_previews (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  title text,
  description text,
  image_url text,
  site_name text,
  published_time timestamp with time zone,
  link_type text default 'article' check (link_type in ('article', 'twitter', 'medium', 'general')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.link_previews enable row level security;

-- RLS policies for link previews
-- Everyone can read link previews (public cache)
create policy "link_previews_public_read"
  on public.link_previews for select
  using (true);

-- Only authenticated users can insert/update link previews
create policy "link_previews_authenticated_write"
  on public.link_previews for insert
  with check (auth.uid() is not null);

create policy "link_previews_authenticated_update"
  on public.link_previews for update
  using (auth.uid() is not null);
