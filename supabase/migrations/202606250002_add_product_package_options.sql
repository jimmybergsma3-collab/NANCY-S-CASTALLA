alter table products add column if not exists package_options jsonb not null default '[]'::jsonb;
