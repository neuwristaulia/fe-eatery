# Adalah Pokoknya — Web Frontend

Next.js web application for the Adalah Pokoknya cafe management system. Serves two audiences:

- **Admin / Staff panel** — manage menus, orders, payments, stocks, reservations, rewards, vouchers, and view reports.
- **Customer storefront** — browse menu, place orders, track loyalty points, and manage reservations.

**Backend API:** `https://backend-main-production-f147.up.railway.app`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Custom component library (`src/components/ui/`) |
| Animation | Framer Motion |
| Charts | Recharts |
| HTTP | Native `fetch` via `apiFetch` wrapper |
| State | React `useState` / `useCallback` |
| Notifications | Sonner (toast) |
| Payment | Midtrans Snap (client-side) |

---

## Project Structure

```
src/
├── app/
│   ├── admin/
│   │   └── (dashboard)/
│   │       ├── layout.tsx          # Admin sidebar layout
│   │       ├── page.tsx            # Dashboard overview
│   │       ├── menus/              # Menu & category management
│   │       ├── orders/             # Order management
│   │       ├── payments/           # Payment processing
│   │       ├── stocks/             # Stock management
│   │       ├── tables/             # Table management
│   │       ├── reservations/       # Reservation management
│   │       ├── users/              # User management
│   │       ├── rewards/            # Loyalty reward management
│   │       └── vouchers/           # Promo voucher management
│   ├── (customer)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Homepage
│   │   ├── menu/                   # Menu browsing
│   │   └── reservations/           # Customer reservations
│   └── (auth)/
│       ├── login/
│       └── register/
├── components/
│   └── ui/                         # Reusable UI components
├── lib/
│   └── api/
│       ├── client.ts               # apiFetch wrapper
│       ├── normalize.ts            # Raw API → typed model mapping
│       ├── types.ts                # TypeScript interfaces
│       └── services/               # Per-resource API functions
│           ├── menus.ts
│           ├── orders.ts
│           ├── payments.ts
│           ├── rewards.ts
│           ├── vouchers.ts
│           └── ...
└── store/                          # Auth state (localStorage)
```

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env` in the project root:

```
NEXT_PUBLIC_API_URL=https://backend-main-production-f147.up.railway.app
NEXT_PUBLIC_MIDTRANS_SANDBOX=true
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-RuLQmikFeG8_1UAl
```

To run against a local backend instead:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Run dev server

```bash
npm run dev
```

Opens at `http://localhost:3000`.

### 4. Build for production

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_MIDTRANS_SANDBOX` | `true` for Midtrans sandbox, `false` for production |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Midtrans client key (public) |

---

## Admin Panel Features

### Dashboard
- Revenue overview (today, this week, this month)
- Order and payment counts
- Best-selling menu items chart
- Recent orders table

### Menu Management (`/admin/menus`)
- Create, edit, and delete menu items
- Category assignment
- Toggle active/inactive status
- Image URL support

### Order Management (`/admin/orders`)
- View all orders with status filter
- Update order status (created → confirmed → ready → completed / cancelled)
- View order items and customer details

### Payment Processing (`/admin/payments`)
- List payments with status filter
- Mark cash payments as paid
- Refund processing
- Sync Midtrans payment status

### Stock Management (`/admin/stocks`)
- View current stock levels
- Adjust stock (IN / OUT) with notes
- Stock adjustment history per item

### Table Management (`/admin/tables`)
- Create and manage cafe tables
- Update table status (available / occupied)

### Reservation Management (`/admin/reservations`)
- View all reservations
- Confirm, complete, or cancel reservations

### User Management (`/admin/users`)
- View all user accounts
- Customer loyalty points overview

### Rewards Management (`/admin/rewards`)
- Create loyalty rewards (`discount`, `cashback`, `free_item`)
- Set required points and optional minimum order
- Activate / deactivate rewards
- Edit and delete rewards

### Vouchers Management (`/admin/vouchers`)
- Create admin promo codes (global, shareable — no user restriction)
- Status filter tabs: **Active / Used / Expired / All** with counts
- Only manually-created promo codes appear here; reward-generated vouchers are excluded
- Copy voucher code to clipboard
- Edit status, discount percentage, expiry date, and minimum order
- Delete vouchers

---

## API Integration

All API calls go through `src/lib/api/client.ts` → `apiFetch()`:

- Automatically attaches `Authorization: Bearer <token>` when `auth: true`
- Unwraps `{ "data": ... }` response envelope
- Throws `ApiError` on non-2xx responses

Typed response shapes are in `src/lib/api/types.ts`. Raw API payloads are normalized to canonical types via `src/lib/api/normalize.ts`.

---

## Authentication

- Login/register stores `accessToken` and `refreshToken` in `localStorage`.
- Admin routes check for a valid token; unauthenticated users are redirected to `/login`.
- Tokens are refreshed automatically when the access token expires.
