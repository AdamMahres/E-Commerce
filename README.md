# E-Commerce

A full-stack e-commerce app: React frontend, Express/PostgreSQL backend, Stripe Checkout (test mode) for payments.

## Tech stack

- **Frontend**: React 19, Vite (rolldown-vite), React Router 7, Tailwind CSS 4
- **Backend**: Node.js, Express 5, PostgreSQL via `pg`, JWT auth in an httpOnly cookie (`jsonwebtoken` + `bcrypt`)
- **Payments**: Stripe Checkout, test mode

## Features

- Product listing with search and category filtering
- Product detail pages
- Cart, persisted per user in the database (add/remove/update quantity, survives refresh/logout/login)
- Signup / login / logout with hashed passwords and JWT sessions
- Checkout via Stripe Checkout, with shipping info and an order summary
- Order confirmation and order history (under Profile)
- Admin panel (product management, read-only order view) for users promoted to admin — see [Admin access](#admin-access) below

## Prerequisites

- Node.js 18+ (developed and tested on v22.16.0)
- npm 10+
- PostgreSQL 14+ (developed and tested on 18.1), with the `psql` and `createdb` CLI tools available on your PATH
- A free [Stripe](https://dashboard.stripe.com/register) account, for checkout in test mode (optional — everything except paying works without it)

## Setup

### 1. Clone and install dependencies

The frontend and backend are separate npm projects — install each one:

```bash
git clone <repo-url>
cd e-commerce

cd backend
npm install

cd ../frontend
npm install
```

### 2. Create the database

```bash
createdb -U postgres e-commerce
```

You'll be prompted for your PostgreSQL password. Use whatever role you normally use for local Postgres if not `postgres`.

### 3. Run the schema

From the `backend` directory:

```bash
psql -U postgres -d e-commerce -f db/schema.sql
```

This creates `users`, `products`, `carts`, `cart_items`, `orders`, and `order_items`. It's safe to re-run (`CREATE TABLE IF NOT EXISTS`).

### 4. Configure environment variables

The frontend needs no `.env` file (it talks to the backend at a hardcoded `http://localhost:5000`). The backend does:

```bash
# from backend/
cp .env.example .env
```

Then fill in `backend/.env`:

| Variable | Description |
|---|---|
| `PORT` | Port the backend listens on. Defaults to `5000` if unset. |
| `DB_HOST` | PostgreSQL host, e.g. `localhost` |
| `DB_USER` | PostgreSQL role, e.g. `postgres` |
| `DB_PORT` | PostgreSQL port, e.g. `5432` |
| `DB_PASSWORD` | Password for `DB_USER` |
| `DB_NAME` | Database name — `e-commerce` if you followed step 2 |
| `JWT_SECRET` | Any long random string, used to sign session cookies |
| `FRONTEND_URL` | Where the frontend runs — `http://localhost:5173` for local dev. Used to build Stripe's success/cancel redirect URLs. |
| `STRIPE_SECRET_KEY` | Your Stripe **test-mode** secret key (`sk_test_...`) — see [Stripe test mode](#stripe-test-mode) below. The backend runs fine without it; only checkout will fail until it's set. |

### 5. Seed the product catalog

From `backend/`:

```bash
npm run seed
```

This pulls the current catalog from [fakestoreapi.com](https://fakestoreapi.com/products) and upserts it into your `products` table, matched on fakestore's own product id. It's idempotent — safe to re-run any time to pick up upstream changes; it will never create duplicates.

### 6. Start the backend

From `backend/`:

```bash
npm run dev
```

Starts on `http://localhost:5000` (via `nodemon`, auto-restarts on file changes). Use `npm start` for a plain, non-watching run.

### 7. Start the frontend

In a separate terminal, from `frontend/`:

```bash
npm run dev
```

Starts on `http://localhost:5173`.

### 8. Open the app

Visit **http://localhost:5173**. Sign up for an account to use the cart and checkout — browsing/searching products works without one.

## Admin access

There's no signup flow or API endpoint for becoming an admin — the only way is a direct SQL update, run by whoever has database access:

```sql
UPDATE users SET is_admin = true WHERE email = 'someone@example.com';
```

After that, the account will see an "Admin" link in the navbar on its next login (or page reload if already logged in), and can reach `/admin/products`. Every `/admin/*` API route independently re-checks `is_admin` against the database on each request — the nav link and route guard on the frontend are just UX, not the actual security boundary.

## Stripe test mode

1. Get a test-mode secret key from the [Stripe dashboard](https://dashboard.stripe.com/test/apikeys) — make sure the "Test mode" toggle is on (the URL already has `/test/` in it). Copy the **Secret key** (`sk_test_...`) into `STRIPE_SECRET_KEY` in `backend/.env`, then restart the backend.
2. At checkout, Stripe's hosted payment page accepts these test card details — no real charge is ever made:
   - Card number: `4242 4242 4242 4242`
   - Expiry: any future date
   - CVC: any 3 digits
   - Name/postal code: anything

**Caveat — payment confirmation runs on the success page, not a webhook.** After paying, Stripe redirects back to `/order-confirmation/:id`, and that page's load is what asks Stripe to verify the payment and marks the order `paid`. This is a deliberate simplification for local/test-mode dev, where there's no publicly reachable URL for Stripe to call without an ngrok/`stripe listen` tunnel. The tradeoff: if a user pays but closes the tab before the redirect completes, the order stays `pending` indefinitely. A Stripe webhook (`checkout.session.completed`) is the production-grade fix, since it hears from Stripe directly regardless of what the browser does — see the comment in `backend/routes/orders.js` where confirmation happens.

## Project structure

```
backend/
  config/db.js       Postgres connection pool
  db/schema.sql       Table definitions (run once per database)
  db/seed.js          Idempotent product-catalog seed script
  middleware/          requireAuth/requireAdmin, centralized error handling
  routes/               auth, cart, products, orders, admin
  server.js             Express app entry point

frontend/
  src/components/     Reusable UI (NavBar, Item, CartItem)
  src/contexts/         UserContext, CartContext (React Context + backend-synced state)
  src/pages/             Home, ProductDetail, Login, SignUp, MyCart, Checkout, OrderConfirmation, Profile
  src/pages/admin/     Admin panel (products, orders) — gated on user.is_admin
  src/services/api.js Fetch calls to the backend
```
