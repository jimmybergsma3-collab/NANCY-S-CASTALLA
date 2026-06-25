alter table order_items add column if not exists package_label text not null default '';
alter table order_items add column if not exists package_quantity numeric not null default 1;
