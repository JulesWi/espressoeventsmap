-- Create indexes for better performance
create index if not exists idx_events_event_type on public.events(event_type);
create index if not exists idx_events_event_date on public.events(event_date);
create index if not exists idx_events_location on public.events(latitude, longitude);
create index if not exists idx_events_created_by on public.events(created_by);
create index if not exists idx_link_previews_url on public.link_previews(url);
create index if not exists idx_profiles_role on public.profiles(role);
