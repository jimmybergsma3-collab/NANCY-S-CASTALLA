alter table products add column if not exists is_visible boolean not null default false;
update products set is_visible = true where is_visible = false;
alter table products add column if not exists ingredients text not null default '';
alter table products add column if not exists directions text not null default '';
alter table products add column if not exists conservation text not null default '';
alter table products add column if not exists additional_info text not null default '';
