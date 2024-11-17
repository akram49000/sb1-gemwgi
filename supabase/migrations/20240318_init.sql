-- Enable RLS
alter table auth.users enable row level security;

-- Create notifications table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  created_at timestamptz default now() not null
);

-- Create push_subscriptions table
create table if not exists public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subscription jsonb not null,
  created_at timestamptz default now() not null,
  unique(user_id)
);

-- Create auth users view
create or replace view public.auth_users_view as
select 
  id,
  email,
  created_at
from auth.users;

-- Set up RLS policies
alter table public.notifications enable row level security;
alter table public.push_subscriptions enable row level security;

-- Users can only read their own notifications
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Admin can read all notifications
create policy "Admin can view all notifications"
  on public.notifications for select
  using (auth.jwt() ->> 'email' = 'karamtabet@gmail.com');

-- Admin can insert notifications
create policy "Admin can create notifications"
  on public.notifications for insert
  using (auth.jwt() ->> 'email' = 'karamtabet@gmail.com');

-- Users can manage their push subscriptions
create policy "Users can manage own push subscriptions"
  on public.push_subscriptions for all
  using (auth.uid() = user_id);

-- Grant access to the view
grant select on public.auth_users_view to anon, authenticated;

-- Grant access to tables
grant select, insert on public.notifications to anon, authenticated;
grant all on public.push_subscriptions to anon, authenticated;