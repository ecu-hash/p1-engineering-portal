-- =============================================
-- P1 Engineering ECU Portal — Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  email       text,
  phone       text,
  company     text,
  country     text,
  created_at  timestamptz default now()
);

-- Orders table
create table if not exists public.orders (
  id                        uuid default gen_random_uuid() primary key,
  order_number              serial,
  user_id                   uuid references public.profiles(id) on delete cascade not null,
  status                    text not null default 'pending_payment'
                              check (status in ('pending_payment','queued','in_progress','review','complete','cancelled')),
  make                      text not null,
  model                     text not null,
  year                      integer not null,
  engine                    text not null,
  ecu_type                  text not null,
  service_type              text not null
                              check (service_type in ('full_unlock','read_only','clone','checksum')),
  notes                     text,
  input_file_path           text,
  output_file_path          text,
  price_cents               integer not null,
  stripe_payment_intent_id  text,
  stripe_payment_status     text default 'pending',
  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);

-- Order events (timeline)
create table if not exists public.order_events (
  id          uuid default gen_random_uuid() primary key,
  order_id    uuid references public.orders(id) on delete cascade not null,
  event_type  text not null,
  description text not null,
  created_by  text not null default 'system',
  created_at  timestamptz default now()
);

-- Downloads log
create table if not exists public.downloads (
  id            uuid default gen_random_uuid() primary key,
  order_id      uuid references public.orders(id) on delete cascade not null,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  file_path     text not null,
  downloaded_at timestamptz default now()
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

alter table public.profiles    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_events enable row level security;
alter table public.downloads   enable row level security;

-- Profiles: users can only see/edit their own
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Orders: users can only see their own orders
create policy "Users can view own orders"
  on public.orders for select using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert with check (auth.uid() = user_id);

-- Order events: users can view events on their own orders
create policy "Users can view own order events"
  on public.order_events for select
  using (exists (
    select 1 from public.orders
    where orders.id = order_events.order_id
    and orders.user_id = auth.uid()
  ));

-- Downloads: users can insert and view their own
create policy "Users can view own downloads"
  on public.downloads for select using (auth.uid() = user_id);

create policy "Users can insert own downloads"
  on public.downloads for insert with check (auth.uid() = user_id);

-- =============================================
-- Auto-create profile on signup
-- =============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- Storage Buckets
-- Run these in Supabase Dashboard > Storage > New Bucket
-- Or via the Supabase CLI
-- =============================================

-- NOTE: Create these two buckets manually in the Supabase dashboard:
-- Bucket 1: "ecu-inputs"   — Private, max file size 32MB
-- Bucket 2: "ecu-outputs"  — Private, max file size 32MB

-- Then add these storage policies in Dashboard > Storage > Policies:

-- ecu-inputs: authenticated users can upload to their own folder
-- Policy: (bucket_id = 'ecu-inputs') AND (auth.uid()::text = (storage.foldername(name))[1])

-- ecu-outputs: authenticated users can download files for their own orders
-- (set this up in Supabase dashboard > Storage > ecu-outputs > Policies)
