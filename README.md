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
