# SkillBazaar — Handoff Summary

## Project Goal
A community-driven marketplace to discover, book, and pay for unique local in-person experiences (cooking classes, pottery workshops, guitar lessons, etc.) hosted by skilled individuals. Connects "Explorers" with "Hosts/Skillers."

## Tech Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16 App Router + TypeScript + Tailwind v4 | UI, routing, SEO |
| Backend | Express.js + TypeScript (single `src/index.ts`) | REST API |
| Database | MongoDB Native Driver (NO Mongoose) | Data store |
| Auth | better-auth v1.6.23 (frontend) | Email/password, MongoDB adapter |
| Payments | Stripe Checkout + Stripe Connect + Webhooks | Payments + payouts |
| Validation | Manual (no Zod, no bcrypt) | Input validation |
| Password | Node.js built-in `crypto.scryptSync` | Hashing |

## Project Structure
```
C:\Projects\project-scic-1\
├── PRD.md                     ← Full product requirements
├── AGENTS.md                  ← Permanent project rules
├── HANDOFF.md                 ← This file
├── skillBazaar-server/        ← Express backend
│   ├── .env                   ← MONGODB_URI, JWT_SECRET, STRIPE keys
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts           ← ALL 46 API route handlers (single file)
│       ├── seed.ts            ← Demo data: 5 users, 6 experiences, 21+ sessions, bookings, reviews
│       ├── config/            ← env.ts, db.ts, stripe.ts
│       ├── types/index.ts     ← All domain interfaces
│       ├── database/collections.ts
│       ├── middleware/        ← auth.ts (session verification), errorHandler.ts
│       └── utils/             ← apiResponse.ts, errors.ts
└── skillBazaar-client/        ← Next.js frontend
    ├── .env                   ← MONGODB_URI, BETTER_AUTH_*, STRIPE keys
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── app/               ← App Router pages (30+ page files)
        │   ├── page.tsx       ← Homepage
        │   ├── explore/       ← Search/filter/paginate
        │   ├── experiences/[id]/ ← Detail + booking
        │   ├── dashboard/     ← User dashboard + host dashboard
        │   ├── dashboard/host/ ← Listings, sessions, bookings, earnings
        │   ├── admin/         ← Moderation, verification, reports
        │   ├── checkout/      ← Success/cancelled pages
        │   ├── about, contact, privacy, terms, cancellation-policy
        │   └── api/auth/[...all]/ ← better-auth handler
        ├── components/        ← layout/ (Navbar, Footer), ui/ (Cards, Badges, etc.)
        ├── lib/               ← api.ts, auth.ts, auth-client.ts
        └── types/index.ts     ← Frontend types
```

## Features Already Completed

### Backend (all in `skillBazaar-server/src/index.ts`)
- Health check + 8 default categories seeded on startup
- **Experiences**: Full CRUD with search (keyword, category, city, area, price range, rating), sort (newest, price, rating, reviews), pagination, date filtering, next-available-session enrichment, hostSelf filter for hosts to see own drafts
- **Sessions**: Create (with future-date validation), edit, delete, cancel (triggers refunds for all confirmed bookings)
- **Host Profiles**: Create, read, update, public profile view
- **Stripe Connect**: Create Express account, generate onboarding link, check status (webhook updates charges/payouts status)
- **Bookings**: Create with atomic seat reservation + Stripe Checkout session, list user's, list host's, get by ID, cancel (user with tiered refund policy), complete (auto-completes session when all bookings done)
- **Payments**: Create checkout session, process refunds, Stripe webhook handler (checkout.session.completed/expired, charge.refunded, account.updated — idempotent via stripeEvents collection)
- **Reviews**: List by experience, create (validates completed booking, one per booking, no self-review), update, delete
- **Admin**: List experiences with status filter, moderate (approve/reject), list/manage hosts verification, list/resolve reports, suspend users
- **Contact**: Submit contact form
- **Categories**: List active, create (admin)
- **Reports**: Submit report (user), manage (admin)
- **Host Dashboard Stats**: Published count, upcoming sessions, pending bookings, gross amount, platform fees, earnings

### Frontend (all pages functional)
- **Layout**: Sticky navbar (auth-aware via better-auth session), dark footer with all links, responsive
- **Design System**: deep-teal, warm-amber, off-white, charcoal colors; reusable components (Skeleton, EmptyState, Badge, StarRating, ExperienceCard)
- **Homepage**: Hero with search inputs, popular categories grid (from API), latest experiences, how it works (3 steps), host CTA
- **Explore Page**: Full filter sidebar (keyword, category, city, date, price range, sort), responsive grid, pagination with URL sync, loading/empty/error states
- **Experience Details**: Image gallery, session selector, participant count, price breakdown, booking CTA → Stripe Checkout redirect
- **User Dashboard**: Overview stats, bookings list with cancel, booking detail with refund info, profile edit, become-a-host flow
- **Host Dashboard**: Earnings stats, experience listings (drafts too), create/edit experience form, session management per experience, booking management with complete/cancel actions
- **Admin Dashboard**: Experience moderation (approve/reject with reason), host verification, report management, user suspension
- **Auth**: better-auth handles register/login at `/api/auth/*` with MongoDB adapter
- **Legal**: About, Contact (with form), Privacy Policy, Terms, Cancellation Policy
- **Checkout**: Success page with booking reference, cancelled page

## API Routes (46 total)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/webhooks/stripe | Raw | Stripe webhooks (before express.json) |
| GET | /api/health | - | Health check |
| GET | /api/auth/me | required | Current user |
| GET | /api/experiences | optional | List with filters, sort, pagination, hostSelf |
| GET | /api/experiences/:id | optional | Get by ID |
| POST | /api/experiences | required | Create (host) |
| PATCH | /api/experiences/:id | required | Update (owner/admin) |
| DELETE | /api/experiences/:id | required | Archive or delete (owner/admin) |
| PATCH | /api/experiences/:id/status | required | Change status (owner/admin) |
| GET | /api/experiences/:id/sessions | - | List sessions |
| POST | /api/experiences/:id/sessions | required | Create session (host) |
| PATCH | /api/sessions/:id | required | Update session (host) |
| DELETE | /api/sessions/:id | required | Delete session (host) |
| PATCH | /api/sessions/:id/cancel | required | Cancel session + refunds (host/admin) |
| POST | /api/hosts/profile | required | Create host profile |
| GET | /api/hosts/me | required | Get my profile |
| PATCH | /api/hosts/me | required | Update my profile |
| GET | /api/hosts/:id | - | Public host profile |
| POST | /api/stripe/connect/account | required | Create Connect account |
| POST | /api/stripe/connect/onboarding-link | required | Generate onboarding URL |
| GET | /api/stripe/connect/status | required | Connect status |
| POST | /api/bookings | required | Create booking + Checkout |
| GET | /api/bookings/me | required | My bookings |
| GET | /api/bookings/:id | required | Booking detail |
| PATCH | /api/bookings/:id/cancel | required | Cancel (user, tiered refund) |
| PATCH | /api/bookings/:id/complete | required | Complete (host) |
| GET | /api/host/bookings | required | Host's bookings |
| GET | /api/host/sessions/:sessionId/bookings | required | Session bookings (host) |
| POST | /api/payments/create-checkout-session | required | Create new Checkout (existing booking) |
| POST | /api/payments/refunds | required | Process refund (host/admin) |
| GET | /api/experiences/:id/reviews | - | Experience reviews |
| POST | /api/reviews | required | Create review |
| PATCH | /api/reviews/:id | required | Update review |
| DELETE | /api/reviews/:id | required | Delete review |
| GET | /api/admin/experiences | admin | All experiences for moderation |
| PATCH | /api/admin/experiences/:id/moderate | admin | Approve/reject |
| GET | /api/admin/hosts | admin | Host list for verification |
| PATCH | /api/admin/hosts/:id/verify | admin | Verify/reject host |
| GET | /api/admin/reports | admin | Report list |
| PATCH | /api/admin/reports/:id | admin | Update report status |
| PATCH | /api/admin/users/:id/status | admin | Suspend/activate user |
| POST | /api/reports | required | Submit report |
| POST | /api/contact | - | Contact form |
| GET | /api/categories | - | Active categories |
| POST | /api/categories | admin | Create category |
| GET | /api/host/dashboard | required | Host stats |

## Seed Script

A standalone seed script at `skillBazaar-server/src/seed.ts` creates comprehensive demo data:

```
npm run seed   # run from skillBazaar-server/
```

### What it creates:
- **5 demo users** with valid better-auth credentials (password hash matches better-auth's `scrypt` algorithm):
  - `admin@skillbazaar.com / admin123` — Admin with moderation privileges
  - `maria@example.com / password123` — Host (Cooking, Fitness)
  - `david@example.com / password123` — Host (Arts & Crafts)
  - `sarah@example.com / password123` — Host (Photography)
  - `alex@example.com / password123` — Explorer with bookings & reviews
- **3 host profiles** (verified)
- **6 experiences** across 4 categories (cooking, arts-crafts, photography, fitness)
- **21+ sessions** (3 future per experience + 3 past completed)
- **3 completed bookings** with published reviews
- **1 future confirmed booking**

### Implementation details:
- Password hashing matches better-auth's exact algorithm: `scrypt(N=16384, r=16, p=1, dkLen=64)` with `salt:key` hex format (see `@better-auth/utils/dist/password.node.mjs`)
- Creates `account` entries with `providerId: "credential"` for email/password auth
- Creates valid `session` tokens so users can log in immediately
- Clears app collections (`host_profiles`, `experiences`, `sessions`, `bookings`, `reviews`, etc.) before seeding — auth collections (`user`, `account`, `session`) are cleared per-user on re-run to allow idempotent re-seeding
- Updates experience `ratingSummary` after creating reviews

## Database Collections
| Collection | Managed By | Purpose |
|-----------|-----------|---------|
| `user` | better-auth | Auth users (singular, `usePlural: false`) |
| `session` | better-auth | Auth sessions (singular) |
| `account` | better-auth | OAuth/provider accounts |
| `verification` | better-auth | Email verification tokens |
| `experiences` | app | Experience listings |
| `sessions` | app | Experience date/time slots |
| `bookings` | app | Booking records |
| `reviews` | app | User reviews |
| `host_profiles` | app | Host profile (payment, verification) |
| `stripeEvents` | app | Stripe webhook idempotency |
| `reports` | app | User reports |
| `contactMessages` | app | Contact form submissions |
| `categories` | app | Experience categories |

## Architectural Decisions
1. **No MVC** — all API logic in `src/index.ts` (single file), supporting infrastructure in separate files
2. **better-auth for frontend auth** — handles register/login/logout at `/api/auth/*`; Express backend verifies sessions by reading `skillbazaar.session_token` cookie and querying MongoDB `session` collection
3. **Stripe webhook before express.json()** — raw body needed for signature verification
4. **Atomic seat reservations** — MongoDB `$expr` with capacity check prevents overbooking
5. **No Zod** — manual validation in handlers
6. **No bcrypt** — better-auth handles hashing with its own crypto
7. **`usePlural: false`** for better-auth to avoid collection name conflicts with our `sessions` collection

## Known Issues / Next Steps
1. **Image upload** — MVP uses URL strings; needs cloud storage integration
2. **Email notifications** — MVP doesn't send emails; transactional email provider needed
3. **Stripe Connect webhook** — `account.updated` webhook needs to be configured in Stripe dashboard to update host payout status
4. **Admin UI polish** — Basic admin pages exist; needs more refinement
5. **Error handling** — Some API error responses could be more descriptive
6. **Loading states** — Some pages could benefit from more granular loading skeletons
7. **Mobile responsiveness** — Generally works but some pages need polish
8. ~~**Seed data** — No demo experiences; would help with testing~~ ✅ Done
9. **Rate limiting** — Not implemented yet
10. **CSRF protection** — Not implemented (better-auth handles some)
11. ~~**No `.gitignore`** in server — `node_modules` might be tracked~~ ✅ Done

## Quick Start
```bash
# Start backend
cd skillBazaar-server && npm run dev

# In separate terminal, start frontend
cd skillBazaar-client && npm run dev
```
