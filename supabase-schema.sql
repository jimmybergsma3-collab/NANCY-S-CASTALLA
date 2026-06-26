create table if not exists products (
  id text primary key,
  name text not null,
  image_url text not null default '',
  is_visible boolean not null default false,
  category text not null,
  description text not null,
  price numeric not null default 0,
  unit text not null,
  stock_status text not null default 'available',
  type text not null default 'ambient',
  origin text not null default 'Other',
  featured boolean not null default false,
  cost_price_ex_vat numeric not null default 0,
  vat_rate numeric not null default 10,
  sale_price_incl_vat numeric not null default 0,
  margin_percent numeric not null default 0,
  profit_per_unit numeric not null default 0,
  supplier text not null default '',
  supplier_code text not null default '',
  pack_size text not null default '',
  unit_cost numeric not null default 0,
  package_options jsonb not null default '[]'::jsonb,
  ingredients text not null default '',
  directions text not null default '',
  conservation text not null default '',
  additional_info text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id text primary key,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  fulfillment text not null,
  notes text,
  total numeric not null default 0,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id text not null references orders(id) on delete cascade,
  product_id text,
  product_name text not null,
  quantity integer not null,
  unit text not null,
  package_label text not null default '',
  package_quantity numeric not null default 1,
  sale_price_incl_vat numeric not null default 0
);

alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

alter table products add column if not exists image_url text not null default '';
alter table products add column if not exists is_visible boolean not null default false;
alter table products add column if not exists package_options jsonb not null default '[]'::jsonb;
alter table products add column if not exists ingredients text not null default '';
alter table products add column if not exists directions text not null default '';
alter table products add column if not exists conservation text not null default '';
alter table products add column if not exists additional_info text not null default '';
alter table order_items add column if not exists package_label text not null default '';
alter table order_items add column if not exists package_quantity numeric not null default 1;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;
