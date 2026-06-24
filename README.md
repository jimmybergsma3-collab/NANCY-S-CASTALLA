# Nancy's Castalla

Vercel-ready Next.js website for Nancy's Castalla.

## Edit business settings

Update `config/business.ts` for the WhatsApp number, address, delivery minimum, delivery fee, delivery radius, Bizum number and bank details.

## Edit products and prices

Update `src/data/products.ts`. Each product contains cost price, VAT, sale price, supplier details and margin fields. The admin pricing helper at `/admin/pricing` recalculates margin and profit from the editable values.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Import this folder into Vercel. No database or Stripe setup is required for version 1.

## Admin, orders and email

Version 2 is prepared for Supabase and Resend:

- Run `supabase-schema.sql` in Supabase SQL editor.
- Add the values from `.env.example` to Vercel environment variables.
- Supabase URL is `https://kylianmqyewlfoypcjve.supabase.co`.
- Add `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SERVICE_ROLE_KEY` from Supabase project settings under API keys.
- If you install Supabase CLI, link this project with:

```bash
supabase login
supabase init
supabase link --project-ref kylianmqyewlfoypcjve
supabase db push
```

- Do not commit the PostgreSQL connection string or service role key.
- Admin products page: `/en/admin/products`.
- Customer registration page: `/en/register`.
- Orders are sent through `/api/orders` and email is sent through Resend when `RESEND_API_KEY` is configured.
