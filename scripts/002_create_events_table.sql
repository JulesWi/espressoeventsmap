-- Create events table with proper relationships
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text not null,
  latitude decimal(10, 8) not null,
  longitude decimal(11, 8) not null,
  event_date timestamp with time zone not null,
  event_type text not null check (event_type in ('upcoming', 'ongoing', 'ended')),
  publication_links jsonb default '[]'::jsonb,
  created_by uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.events enable row level security;

-- RLS policies for events
-- Everyone can read events (public access)
create policy "events_public_read"
  on public.events for select
  using (true);

-- Only authenticated contributors can insert events
create policy "events_contributors_insert"
  on public.events for insert
  with check (
    auth.uid() is not null and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'contributor'
    )
  );

-- Only event creators can update their own events
create policy "events_creators_update"
  on public.events for update
  using (auth.uid() = created_by);

-- Only event creators can delete their own events
create policy "events_creators_delete"
  on public.events for delete
  using (auth.uid() = created_by);
