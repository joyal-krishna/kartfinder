-- =============================================
-- KART FINDER — Supabase Database Schema
-- Run this in your Supabase SQL editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- PROFILES (extends Supabase auth.users)
-- =============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- WISHLISTS
-- =============================================
create table public.wishlists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null default 'My Wishlist',
  description text,
  is_public boolean default false,
  share_token text unique default encode(gen_random_bytes(12), 'hex'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.wishlists enable row level security;

create policy "Users can manage own wishlists"
  on public.wishlists for all using (auth.uid() = user_id);

create policy "Anyone can view public wishlists"
  on public.wishlists for select using (is_public = true);

-- =============================================
-- PRODUCTS
-- =============================================
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  wishlist_id uuid references public.wishlists(id) on delete cascade not null,
  name text not null,
  url text not null,
  platform text not null check (platform in ('amazon','flipkart','meesho','other')),
  image_url text,
  current_price numeric(10,2) default 0,
  original_price numeric(10,2) default 0,
  currency text default 'INR',
  quantity integer default 1,
  note text,
  asin text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.products enable row level security;

create policy "Users can manage own products"
  on public.products for all using (auth.uid() = user_id);

create policy "Anyone can view products in public wishlists"
  on public.products for select using (
    exists (
      select 1 from public.wishlists
      where wishlists.id = products.wishlist_id
      and wishlists.is_public = true
    )
  );

-- =============================================
-- PRICE HISTORY
-- =============================================
create table public.price_history (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  price numeric(10,2) not null,
  checked_at timestamptz default now()
);

alter table public.price_history enable row level security;

create policy "Users can view price history for own products"
  on public.price_history for select using (
    exists (
      select 1 from public.products
      where products.id = price_history.product_id
      and products.user_id = auth.uid()
    )
  );

create policy "Service role can insert price history"
  on public.price_history for insert with check (true);

-- =============================================
-- PRICE ALERTS
-- =============================================
create table public.price_alerts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  target_price numeric(10,2) not null,
  is_active boolean default true,
  last_triggered_at timestamptz,
  created_at timestamptz default now()
);

alter table public.price_alerts enable row level security;

create policy "Users can manage own alerts"
  on public.price_alerts for all using (auth.uid() = user_id);

-- =============================================
-- INDEXES
-- =============================================
create index on public.products(user_id);
create index on public.products(wishlist_id);
create index on public.price_history(product_id);
create index on public.price_alerts(user_id, is_active);
create index on public.wishlists(share_token);
