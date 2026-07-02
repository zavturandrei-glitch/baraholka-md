create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  messenger text,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id text primary key,
  name text not null,
  icon text not null default 'O'
);

create type listing_status as enum ('На модерации', 'Активное', 'Отклонено');

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category_id text references categories(id),
  price numeric not null default 0,
  city text not null,
  seller_name text not null,
  phone text not null,
  email text,
  messenger text,
  status listing_status not null default 'На модерации',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table categories enable row level security;
alter table listings enable row level security;
