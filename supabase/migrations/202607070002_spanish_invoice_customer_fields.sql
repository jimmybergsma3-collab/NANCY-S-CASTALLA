alter table public.invoices add column if not exists customer_fiscal_id text not null default '';
alter table public.invoices add column if not exists customer_company_name text not null default '';
alter table public.invoices add column if not exists customer_fiscal_address text not null default '';

comment on column public.invoices.customer_fiscal_id is 'Optional customer NIF, CIF or NIE snapshot.';
comment on column public.invoices.customer_company_name is 'Optional customer legal company name snapshot.';
comment on column public.invoices.customer_fiscal_address is 'Optional customer fiscal address snapshot.';
