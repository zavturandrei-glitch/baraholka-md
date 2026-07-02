create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  messenger text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id text primary key,
  name text not null,
  icon text not null default '•'
);

create type listing_status as enum ('На модерации', 'Активное', 'Отклонено');
create type listing_condition as enum ('Новое', 'Отличное', 'Хорошее', 'Б/у', 'Услуга', 'Работа');

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text not null,
  category_id text references categories(id),
  price numeric not null default 0,
  city text not null,
  seller_name text not null,
  phone text not null,
  email text,
  messenger text,
  image_url text,
  condition listing_condition not null default 'Б/у',
  status listing_status not null default 'На модерации',
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
alter table listings enable row level security;
alter table favorites enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

create policy "Public profiles are readable" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Categories are public" on categories for select using (true);

create policy "Listings are public readable" on listings for select using (true);
create policy "Users create own listings" on listings for insert with check (auth.uid() = user_id);
create policy "Users update own listings" on listings for update using (auth.uid() = user_id);
create policy "Users delete own listings" on listings for delete using (auth.uid() = user_id);

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