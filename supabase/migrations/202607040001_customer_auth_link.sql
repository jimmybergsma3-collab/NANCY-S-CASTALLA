create or replace function public.handle_new_customer_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customers (auth_user_id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), lower(new.email))
  on conflict (email) do update
    set auth_user_id = excluded.auth_user_id,
        name = case when customers.name = '' then excluded.name else customers.name end,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_customer on auth.users;
create trigger on_auth_user_created_create_customer
  after insert or update of email on auth.users
  for each row execute function public.handle_new_customer_auth_user();

insert into public.customers (auth_user_id, name, email)
select id, coalesce(raw_user_meta_data->>'name', split_part(email, '@', 1)), lower(email)
from auth.users
where email is not null
on conflict (email) do update set auth_user_id = excluded.auth_user_id, updated_at = now();
