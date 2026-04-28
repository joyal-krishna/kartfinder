# 🛒 Kart Finder

**Your universal shopping wishlist & price tracker.**

Save products from Amazon, Flipkart, Meesho and any store in one place. Track prices, get email alerts when they drop, compare across platforms, and share wishlists with anyone.

---

## Features

- ✅ Sign up / Sign in (Email + Google OAuth)
- ✅ Paste any product URL → AI auto-fetches name, price, platform
- ✅ Chrome/Edge extension → one-click save from Amazon, Flipkart, Meesho
- ✅ Multiple wishlists (Electronics, Fashion, Home, etc.)
- ✅ Price drop email alerts
- ✅ Daily automated price checking (Vercel Cron)
- ✅ Price comparison chart across platforms
- ✅ Share wishlists via public link (no account needed to view)
- ✅ Price history tracking

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend + Backend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database + Auth | Supabase (Postgres + Auth) |
| Email | Resend |
| AI (product scraping) | Anthropic Claude API |
| Charts | Recharts |
| Hosting | Vercel |
| Browser Extension | Chrome Manifest V3 |

---

## Setup Guide

### Step 1 — Clone and install

```bash
git clone https://github.com/yourusername/kartfinder.git
cd kartfinder
npm install
```

---

### Step 2 — Create Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project** — pick a name (e.g. `kartfinder`) and a strong password
3. Wait for the project to be ready (~1 minute)
4. Go to **SQL Editor** → paste the entire contents of `supabase/schema.sql` → click **Run**
5. Go to **Authentication → Providers → Google** and enable it (optional, for Google login)
6. Go to **Project Settings → API** and copy:
   - Project URL
   - anon public key
   - service_role key (keep this secret)

---

### Step 3 — Create Resend account (for email alerts)

1. Go to [resend.com](https://resend.com) and create a free account
2. Go to **API Keys** → create a new key
3. Add and verify your sending domain (or use the Resend test domain for development)

---

### Step 4 — Get Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key

---

### Step 5 — Configure environment variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in all values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=alerts@yourdomain.com

NEXT_PUBLIC_APP_URL=http://localhost:3000

ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxx

CRON_SECRET=make_up_a_long_random_string_here
```

---

### Step 6 — Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the Kart Finder landing page.

---

### Step 7 — Deploy to Vercel

1. Push your code to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. In the **Environment Variables** section, add all the same variables from your `.env.local`
4. Change `NEXT_PUBLIC_APP_URL` to your actual Vercel URL (e.g. `https://kartfinder.vercel.app`)
5. Click **Deploy**

**Enable the price-check cron job on Vercel:**
- Go to your Vercel project → Settings → Cron Jobs
- The `vercel.json` already configures it to run daily at 9 AM UTC
- Add `CRON_SECRET` to your Vercel environment variables

---

### Step 8 — Set up Google OAuth (optional)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project → **APIs & Services → Credentials**
3. Create OAuth 2.0 Client ID (Web application)
4. Add your Supabase callback URL: `https://xxxxxxxxxxxx.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret into Supabase → Authentication → Google Provider

---

## Browser Extension Setup

### Configure the extension

Open `extension/popup.js` and update these two lines with your actual values:

```js
const APP_URL = 'https://your-kartfinder-domain.vercel.app';

// In the setupAuth() function, update:
const res = await fetch(`https://YOUR_SUPABASE_URL.supabase.co/auth/v1/token?grant_type=password`, {
  headers: { apikey: 'YOUR_SUPABASE_ANON_KEY' },
```

### Install the extension in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Toggle **Developer mode** ON (top right)
3. Click **Load unpacked**
4. Select the `extension/` folder from this project
5. The Kart Finder icon appears in your toolbar

### Install the extension in Edge

1. Go to `edge://extensions`
2. Toggle **Developer mode** ON
3. Click **Load unpacked**
4. Select the `extension/` folder

---

## How to use

### Saving via URL (web app)
1. Sign in at your deployed URL
2. Create a wishlist (e.g. "Electronics")
3. Paste any Amazon/Flipkart/Meesho product URL
4. Click **Add product** — AI extracts the details automatically
5. If price isn't detected, enter it manually

### Saving via extension (one click)
1. Browse to any product on Amazon, Flipkart, or Meesho
2. Click the Kart Finder icon in your toolbar
3. Sign in (first time only)
4. Choose a wishlist and click **Save to Kart Finder**

### Setting a price alert
1. Go to any wishlist → click the 🔔 bell icon on a product
2. Set your target price (e.g. current ₹5000, alert at ₹3999)
3. Click **Set alert**
4. You'll get an email when the price drops to or below your target

### Sharing a wishlist
1. Go to any wishlist
2. Click **🔒 Private** to toggle it to **🌐 Public**
3. Click **🔗 Share** to copy the public link
4. Share with anyone — they can view it without an account

---

## Project Structure

```
kartfinder/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── auth/
│   │   ├── login/page.tsx          # Login page
│   │   ├── signup/page.tsx         # Signup page
│   │   └── callback/route.ts       # OAuth callback
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard layout + auth guard
│   │   ├── page.tsx                # Main dashboard
│   │   ├── wishlists/
│   │   │   ├── page.tsx            # All wishlists
│   │   │   └── [id]/page.tsx       # Single wishlist
│   │   ├── compare/page.tsx        # Price comparison
│   │   ├── alerts/page.tsx         # Price alerts
│   │   └── extension/page.tsx      # Extension install guide
│   ├── share/[token]/page.tsx      # Public wishlist view
│   └── api/
│       ├── products/route.ts        # Add product
│       ├── products/[id]/route.ts   # Update/delete product
│       ├── wishlists/route.ts       # Create wishlist
│       ├── wishlists/[id]/route.ts  # Update/delete wishlist
│       ├── alerts/route.ts          # Create price alert
│       ├── extension/
│       │   ├── save/route.ts        # Extension save endpoint
│       │   └── wishlists/route.ts   # Extension fetch wishlists
│       └── cron/
│           └── check-prices/route.ts  # Daily price checker
├── components/
│   ├── layout/Sidebar.tsx
│   └── ui/
│       ├── AddProductForm.tsx
│       ├── WishlistGrid.tsx
│       └── StatsBar.tsx
├── lib/
│   ├── supabase.ts                  # Supabase client
│   ├── supabase-server.ts           # Server-side client
│   ├── scraper.ts                   # AI product scraper
│   └── email.ts                     # Resend email templates
├── types/database.ts                # TypeScript types
├── supabase/schema.sql              # Full DB schema
├── extension/
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   └── content.js
├── vercel.json                      # Cron job config
└── .env.local.example
```

---

## Environment Variables Reference

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `RESEND_API_KEY` | resend.com → API Keys |
| `RESEND_FROM_EMAIL` | Your verified sending email |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `CRON_SECRET` | Make up any long random string |

---

## Common Issues

**Product name/price not detected**
→ The AI reads from the URL slug. Some URLs don't have the product name in them. In that case, the app adds the product with "No price" and you can edit it manually.

**Extension not working after install**
→ Make sure you updated `APP_URL`, `YOUR_SUPABASE_URL`, and `YOUR_SUPABASE_ANON_KEY` in `extension/popup.js` before loading it.

**Emails not sending**
→ Check that your `RESEND_FROM_EMAIL` domain is verified in Resend. For testing, use Resend's sandbox domain.

**Google login not working**
→ Check that the Supabase callback URL is added to your Google OAuth app's authorized redirect URIs.

---

## License

MIT — free to use, modify, and deploy.
