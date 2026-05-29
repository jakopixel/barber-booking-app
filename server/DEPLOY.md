# Deploy Neon + Render

## 1. Neon
- Crea un database PostgreSQL su Neon
- Copia la `DATABASE_URL`

## 2. Render
- Crea un Web Service da `server/`
- Build: `npm install`
- Start: `npm start`

## 3. Env vars
- `DATABASE_URL` = Neon
- `JWT_SECRET` = stringa lunga casuale
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID`
- `CLIENT_URL` = url app client
- `CORS_ORIGIN` = url client separato da virgole se serve

## 4. Prisma
- Render esegue `npx prisma migrate deploy` a ogni deploy
- In locale puoi usare `npm run db:migrate`

## 5. Webhook Stripe
- Imposta su Stripe gli endpoint:
  - `/api/subscription/webhook`
  - `/api/payments/webhook`
