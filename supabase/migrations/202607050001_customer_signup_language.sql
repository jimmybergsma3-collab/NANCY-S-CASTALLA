create or replace function public.handle_new_customer_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  preferred_language text;
begin
  preferred_language := case
    when new.raw_user_meta_data->>'language' in ('en', 'nl', 'de', 'es', 'sv') then new.raw_user_meta_data->>'language'
    else 'en'
  end;

  insert into public.customers (auth_user_id, name, email, language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    lower(new.email),
    preferred_language
  )
  on conflict (email) do update
    set auth_user_id = excluded.auth_user_id,
        name = coalesce(nullif(excluded.name, ''), public.customers.name),
        language = case
          when public.customers.auth_user_id is null then excluded.language
          else public.customers.language
        end,
        updated_at = now();
  return new;
end;
$$;
