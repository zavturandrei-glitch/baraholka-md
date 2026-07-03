create extension if not exists pgcrypto;

do $$ begin
  create type listing_status as enum ('На модерации', 'Активное', 'Отклонено', 'Черновик', 'Архив', 'Продано', 'Удалено');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type listing_condition as enum ('Новое', 'Отличное', 'Хорошее', 'Б/у', 'Услуга', 'Работа');
exception
  when duplicate_object then null;
end $$;

alter type listing_status add value if not exists 'Черновик';
alter type listing_status add value if not exists 'Архив';
alter type listing_status add value if not exists 'Продано';
alter type listing_status add value if not exists 'Удалено';

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  messenger text,
  avatar_url text,
  status text not null default 'normal' check (status in ('normal', 'trusted', 'suspicious', 'blocked')),
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id text primary key,
  name text not null,
  icon text not null default '•'
);

create table if not exists subcategories (
  id text primary key,
  category_id text references categories(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text not null,
  category_id text references categories(id),
  subcategory_id text references subcategories(id),
  price numeric not null default 0,
  city text not null,
  seller_name text not null,
  phone text not null,
  email text,
  messenger text,
  image_url text,
  condition listing_condition not null default 'Б/у',
  status listing_status not null default 'На модерации',
  rejection_reason text,
  moderator_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table listings add column if not exists subcategory_id text references subcategories(id);
alter table listings add column if not exists rejection_reason text;
alter table listings add column if not exists moderator_comment text;
alter table listings add column if not exists updated_at timestamptz not null default now();
alter table profiles add column if not exists status text not null default 'normal';

create table if not exists listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists listing_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  reporter_id uuid references auth.users(id) on delete set null,
  reason text not null,
  details text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'resolved')),
  admin_action text,
  created_at timestamptz not null default now()
);

create table if not exists listing_status_history (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  moderator_id uuid references auth.users(id) on delete set null,
  old_status text,
  new_status text not null,
  reason text,
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists listing_views (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  viewer_id uuid references auth.users(id) on delete set null,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table if not exists favorites (
  user_id uuid references auth.users(id) on delete cascade,
  listing_id uuid references listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  buyer_id uuid references auth.users(id) on delete cascade,
  seller_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

insert into categories (id, name, icon) values
  ('transport', 'Транспорт', '🚗'),
  ('realty', 'Недвижимость', '🏠'),
  ('phones', 'Телефоны и гаджеты', '📱'),
  ('computers', 'Компьютеры и офис', '💻'),
  ('repair', 'Строительство и ремонт', '🔨'),
  ('fashion', 'Одежда и обувь', '👕'),
  ('home', 'Дом и мебель', '🛋️'),
  ('jobs', 'Работа', '💼'),
  ('services', 'Услуги', '🧰'),
  ('kids', 'Для детей', '👶'),
  ('pets', 'Животные', '🐶'),
  ('free', 'Отдам даром', '🎁')
on conflict (id) do update set name = excluded.name, icon = excluded.icon;

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do update set public = true;

alter table profiles enable row level security;
alter table categories enable row level security;
alter table subcategories enable row level security;
alter table listings enable row level security;
alter table listing_images enable row level security;
alter table listing_reports enable row level security;
alter table listing_status_history enable row level security;
alter table listing_views enable row level security;
alter table favorites enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

drop policy if exists "Public profiles are readable" on profiles;
drop policy if exists "Users update own profile" on profiles;
drop policy if exists "Users insert own profile" on profiles;
drop policy if exists "Categories are public" on categories;
drop policy if exists "Subcategories are public" on subcategories;
drop policy if exists "Listings are public readable" on listings;
drop policy if exists "Users create own listings" on listings;
drop policy if exists "Users update own listings" on listings;
drop policy if exists "Users delete own listings" on listings;
drop policy if exists "Listing images are public" on listing_images;
drop policy if exists "Users manage own listing images" on listing_images;
drop policy if exists "Users create listing reports" on listing_reports;
drop policy if exists "Users can read own reports" on listing_reports;
drop policy if exists "Authenticated users insert status history" on listing_status_history;
drop policy if exists "Authenticated users read status history" on listing_status_history;
drop policy if exists "Anyone can insert listing views" on listing_views;
drop policy if exists "Listing views are readable" on listing_views;
drop policy if exists "Users read own favorites" on favorites;
drop policy if exists "Users manage own favorites" on favorites;
drop policy if exists "Users read own conversations" on conversations;
drop policy if exists "Users create own conversations" on conversations;
drop policy if exists "Users read own messages" on messages;
drop policy if exists "Users send own messages" on messages;
drop policy if exists "Listing photos are public" on storage.objects;
drop policy if exists "Authenticated users upload listing photos" on storage.objects;
drop policy if exists "Users update own listing photos" on storage.objects;
drop policy if exists "Users delete own listing photos" on storage.objects;

create policy "Public profiles are readable" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Categories are public" on categories for select using (true);
create policy "Subcategories are public" on subcategories for select using (true);

create policy "Listings are public readable" on listings for select using (true);
create policy "Users create own listings" on listings for insert with check (auth.uid() = user_id);
create policy "Users update own listings" on listings for update using (auth.uid() = user_id);
create policy "Users delete own listings" on listings for delete using (auth.uid() = user_id);

create policy "Listing images are public" on listing_images for select using (true);
create policy "Users manage own listing images" on listing_images for all using (
  exists (select 1 from listings l where l.id = listing_id and l.user_id = auth.uid())
) with check (
  exists (select 1 from listings l where l.id = listing_id and l.user_id = auth.uid())
);

create policy "Users create listing reports" on listing_reports for insert with check (true);
create policy "Users can read own reports" on listing_reports for select using (reporter_id = auth.uid() or reporter_id is null);

create policy "Authenticated users insert status history" on listing_status_history for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users read status history" on listing_status_history for select using (auth.role() = 'authenticated');

create policy "Anyone can insert listing views" on listing_views for insert with check (true);
create policy "Listing views are readable" on listing_views for select using (true);

create policy "Users read own favorites" on favorites for select using (auth.uid() = user_id);
create policy "Users manage own favorites" on favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users read own conversations" on conversations for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Users create own conversations" on conversations for insert with check (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Users read own messages" on messages for select using (
  exists (select 1 from conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
);
create policy "Users send own messages" on messages for insert with check (auth.uid() = sender_id);

create policy "Listing photos are public" on storage.objects for select using (bucket_id = 'listing-photos');
create policy "Authenticated users upload listing photos" on storage.objects for insert with check (bucket_id = 'listing-photos' and auth.role() = 'authenticated');
create policy "Users update own listing photos" on storage.objects for update using (bucket_id = 'listing-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users delete own listing photos" on storage.objects for delete using (bucket_id = 'listing-photos' and auth.uid()::text = (storage.foldername(name))[1]);
