# SkillBazaar — Project Rules

## Tech Stack
- **Frontend**: Next.js App Router (16.2.10) + TypeScript + Tailwind CSS v4
- **Backend**: Express.js + TypeScript (single file: `src/index.ts`)
- **Database**: MongoDB Native Driver (NO Mongoose)
- **Auth**: better-auth (frontend) — email/password, MongoDB adapter, cookie prefix `skillbazaar`
- **Payments**: Stripe Checkout + Stripe Connect
- **Validation**: Manual (no Zod)
- **Password Hashing**: Node.js built-in crypto (no bcrypt)

## Architecture

### Backend (`skillBazaar-server/`)
- Single file API: `src/index.ts` contains ALL route handlers
- Supporting files: `config/`, `types/`, `middleware/`, `utils/`, `database/`
- No MVC — no controllers/services/repositories layers
- JWT verification via better-auth session cookie (`skillbazaar.session_token`)
- Auth middleware queries MongoDB `session` collection for token validation
- `usePlural: false` for better-auth to avoid collection name conflicts with our `sessions` collection

### Frontend (`skillBazaar-client/`)
- Pages under `src/app/` using App Router
- API client at `src/lib/api.ts` (auto-unwraps `ApiResponse.data`)
- better-auth client at `src/lib/auth-client.ts` (named `authClient`)
- Auth routes at `/api/auth/*` (handled by better-auth automatically)
- Design system colors: deep-teal (#0D9488), warm-amber (#F59E0B), off-white (#F8FAFC), charcoal (#374151)

## Naming Conventions
- Routes: kebab-case (`/api/experiences/:id/sessions`)
- TypeScript interfaces: PascalCase
- Files: kebab-case
- API responses: `{ success: boolean, data?: T, message?: string, error?: string, meta?: { page, limit, total, totalPages } }`

## Collection Naming
- better-auth collections: `user`, `session`, `account`, `verification` (all singular)
- App collections: `experiences`, `sessions`, `bookings`, `reviews`, `host_profiles`, `stripeEvents`, `reports`, `contactMessages`, `categories`

## Key Rules
- No Mongoose imports anywhere
- No Zod imports anywhere  
- No bcrypt imports anywhere
- Stripe webhook route must be ABOVE `express.json()` middleware
- `useSearchParams()` must be wrapped in `<Suspense>` boundary
- All prices in smallest currency unit when talking to Stripe
- Payment confirmation ONLY from Stripe webhooks (not client redirects)
- Seat reservations use atomic MongoDB updates to prevent overbooking

## Running Locally
```bash
# Backend (port 5000)
cd skillBazaar-server && npm run dev

# Frontend (port 3000)
cd skillBazaar-client && npm run dev

# Seed demo data (5 users, 6 experiences, 21+ sessions, bookings, reviews)
cd skillBazaar-server && npm run seed
```

## Demo Accounts (after running seed)
| Email | Password | Role |
|-------|----------|------|
| admin@skillbazaar.com | admin123 | Admin |
| maria@example.com | password123 | Host (Cooking, Fitness) |
| david@example.com | password123 | Host (Arts & Crafts) |
| sarah@example.com | password123 | Host (Photography) |
| alex@example.com | password123 | Explorer (has bookings + reviews) |

## Env Files
- `skillBazaar-server/.env` — MONGODB_URI, JWT_SECRET, PORT, NODE_ENV, STRIPE_SECRET_KEY, STRIPE_PRICE_ID
- `skillBazaar-client/.env` — MONGODB_URI, NEXT_PUBLIC_APP_URL, BETTER_AUTH_*, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_PRICE_ID
