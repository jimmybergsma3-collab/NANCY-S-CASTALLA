create table if not exists products (
  id text primary key,
  name text not null,
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
  sale_price_incl_vat numeric not null default 0
);

alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
