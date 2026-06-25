# P1 Engineering — ECU Unlock Portal

A full-stack customer portal for submitting ECU unlock orders, paying via Stripe, tracking jobs, and downloading completed files.

Built with Next.js 14, Supabase, Stripe, and Tailwind CSS.

---

## Deployment Guide (Step by Step)

### Step 1 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New project**, name it `p1-engineering`, choose a password, pick the closest region (Australia Southeast)
3. Wait ~2 minutes for it to spin up
4. Go to **SQL Editor** in the left sidebar
5. Paste the entire contents of `supabase/migrations/001_initial.sql` and click **Run**
6. Go to **Storage** → click **New bucket** → name it `ecu-inputs` → uncheck Public → click Save
7. Create a second bucket named `ecu-outputs` the same way
8. Go to **Project Settings → API** — copy your **Project URL** and **anon public** key (you'll need them in Step 4)
9. Also copy the **service_role** key (keep this secret)

---

### Step 2 — Set up Stripe

1. Log in to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Go to **Developers → API keys** — copy your **Publishable key** and **Secret key**
3. Go to **Developers → Webhooks** → click **Add endpoint**
4. Set the URL to: `https://your-vercel-domain.vercel.app/api/stripe-webhook`
   (you'll update this after deploying in Step 3 — use a placeholder for now)
5. Under **Events to listen to**, select: `checkout.session.completed`
6. Click **Add endpoint**, then copy the **Signing secret** (starts with `whsec_`)

---

### Step 3 — Deploy to Vercel

1. Push this project folder to a GitHub repository (go to [github.com](https://github.com) → New repo → upload files)
2. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
3. Click **Add New Project** → import your GitHub repo
4. Click **Deploy** — it will fail at first (no env vars yet), that's fine
5. Copy your Vercel domain (e.g. `p1-portal.vercel.app`) — go back to Stripe and update your webhook URL

---

### Step 4 — Add environment variables in Vercel

1. In Vercel, go to your project → **Settings → Environment Variables**
2. Add each of these (copy the values from Steps 1 and 2):

```
NEXT_PUBLIC_SUPABASE_URL         → from Supabase Project Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY    → from Supabase (anon public key)
SUPABASE_SERVICE_ROLE_KEY        → from Supabase (service_role key — keep secret)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → from Stripe API keys
STRIPE_SECRET_KEY                → from Stripe API keys
STRIPE_WEBHOOK_SECRET            → from Stripe webhook (whsec_...)
NEXT_PUBLIC_APP_URL              → https://your-vercel-domain.vercel.app
```

3. After adding all variables, go to **Deployments → Redeploy** (top right)

---

### Step 5 — Test it

1. Visit your Vercel URL
2. Click **Create one** to register an account
3. Submit a test ECU order
4. Use Stripe test card `4242 4242 4242 4242` (any future date, any CVC)
5. You should land back on the order page with status **Queued**

---

### Step 6 — Set up your admin panel (Retool)

1. Go to [retool.com](https://retool.com) and create a free account
2. Click **Create new → App**
3. Add a **PostgreSQL resource**: use your Supabase DB connection string
   (found in Supabase → Project Settings → Database → Connection string)
4. Build a table component pointing to the `orders` table — you can now view all orders
5. Add a dropdown to change order status and a file upload to add the output file

---

## Going Live

- Switch Stripe from **Test mode** to **Live mode** (update your API keys in Vercel)
- Set up a custom domain in Vercel (e.g. portal.p1engineering.io) — point your DNS records as instructed

---

## Project structure

```
p1-portal/
├── app/
│   ├── (auth)/         Login & register pages
│   ├── (portal)/       All authenticated pages (dashboard, submit, orders, downloads, account)
│   └── api/            Stripe checkout + webhook handlers
├── components/         Sidebar, StatusBadge, OrderTimeline
├── lib/                Supabase clients, Stripe client, TypeScript types
└── supabase/           SQL migration to set up database
```
