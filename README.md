# 🍊 Spot-On — Fresh Juice & Salad Order App

A beautiful, fully functional Next.js web app for **Spot-On** — a fresh juice, smoothie, salad & sandwich business.

## Features

### Customer
- 🌿 **Landing page** — animated hero, how it works, CTA
- 🍊 **Full menu** — 19 items across Juices, Smoothies, Salads, Sandwiches with search + filter
- 🛒 **Cart drawer** — slide-in cart with quantity controls, persisted to localStorage
- 📝 **Checkout** — customer details, pickup/delivery toggle, special instructions
- 📦 **Order tracking** — real-time status tracker (auto-polls every 10s)

### Admin (`/admin`)
- 🔐 Password-protected dashboard (default: `spoton2024`)
- 📊 Today's stats — orders, revenue, status breakdown
- ⚡ Live order list — auto-refreshes every 15s
- ✅ One-click status updates: Pending → Confirmed → Preparing → Ready → Completed
- ❌ Cancel orders from the dashboard

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Framer Motion** (animations)
- **Zustand** (cart state, localStorage persisted)
- **Next.js API Routes** + **JSON file store** (zero external DB)

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Order notifications (optional)

Spot-On can send an alert when a **new order** is created.

### Option 1 (recommended): Telegram (simple + reliable)
Add these env vars:

```env
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=123456789
```

### Option 2: WhatsApp via CallMeBot (personal gateway)

```env
WHATSAPP_PROVIDER=callmebot
CALLMEBOT_PHONE=2348012345678  # country code + number (no +)
CALLMEBOT_API_KEY=xxxxxx
```

If none of the env vars are set, the app will **skip** notifications (orders still work normally).

## Environment Variables

```env
# Optional — default is spoton2024
ADMIN_PASSWORD=spoton2024
```

Copy `.env.local.example` to `.env.local` and update as needed.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/menu` | Full menu with filters |
| `/checkout` | Place an order |
| `/order/[id]` | Order status tracker |
| `/admin` | Admin dashboard |

## Admin Access

Go to `/admin` and enter the password (`spoton2024` by default).

To change it: set `ADMIN_PASSWORD` in `.env.local`.

## Data Storage

Orders are stored in `data/orders.json` (created automatically). For production, swap `src/lib/orders-store.ts` with a real DB (Supabase, Postgres, etc.).

## Deploying

Works on **Vercel** (recommended) or **Railway**:

```bash
# Vercel
vercel deploy

# Railway — add a Dockerfile or use the nixpacks auto-detect
```

> ⚠️ For production: Replace the JSON file store with a real database since serverless functions don't have persistent file system.
