# VolunteerConnect

A platform connecting volunteers with meaningful opportunities in their communities.

## Features

- Browse and search volunteer opportunities
- Filter by category, commitment type, and location
- Apply to volunteer opportunities
- Organizers can approve/reject applications
- Dashboard with analytics charts (Recharts)
- Responsive design (mobile, tablet, desktop)
- Authentication with Better Auth
- MongoDB Native Driver (no Mongoose)

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS v4, Recharts
- **Backend**: Express.js, TypeScript, MongoDB Native Driver
- **Auth**: Better Auth (email/password)
- **Database**: MongoDB

## Installation

```bash
# Backend
cd skillBazaar-server
npm install

# Frontend
cd skillBazaar-client
npm install
```

## Environment Variables

### Backend (`skillBazaar-server/.env`)
```
MONGODB_URI=mongodb://localhost:27017
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
```

### Frontend (`skillBazaar-client/.env`)
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
MONGODB_URI=mongodb://localhost:27017
BETTER_AUTH_SECRET=your-auth-secret
BETTER_AUTH_URL=http://localhost:3000
```

## Development

```bash
# Start backend (port 5000)
cd skillBazaar-server
npm run dev

# Start frontend (port 3000)
cd skillBazaar-client
npm run dev

# Seed demo data
cd skillBazaar-server
npm run seed
```

## Build

```bash
# Backend
cd skillBazaar-server
npm run build

# Frontend
cd skillBazaar-client
npm run build
```

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@volunteerconnect.org | admin123 | Admin |
| greenearth@example.com | password123 | Organizer |
| hopeedu@example.com | password123 | Organizer |
| communitycare@example.com | password123 | Organizer |
| alex@example.com | password123 | Volunteer |

## API Endpoints

### Opportunities
- `GET /api/opportunities` - List with search/filter/sort/pagination
- `GET /api/opportunities/:id` - Detail
- `POST /api/opportunities` - Create (auth required)
- `PATCH /api/opportunities/:id` - Update (owner only)
- `DELETE /api/opportunities/:id` - Delete (owner only)
- `GET /api/opportunities/my` - Current user's opportunities

### Applications
- `POST /api/applications` - Submit application
- `GET /api/applications/my` - My applications (volunteer)
- `GET /api/applications/received` - Received applications (organizer)
- `PATCH /api/applications/:id/approve` - Approve (organizer)
- `PATCH /api/applications/:id/reject` - Reject (organizer)
- `PATCH /api/applications/:id/withdraw` - Withdraw (volunteer)
- `PATCH /api/applications/:id/complete` - Mark complete (organizer)

### Dashboard
- `GET /api/dashboard/summary` - Aggregated stats for charts

### Landing Page
- `GET /api/landing/stats` - Community statistics
- `GET /api/landing/featured` - Featured opportunities
- `GET /api/landing/urgent` - Urgent opportunities
- `GET /api/landing/organizations` - Top organizations

### Other
- `GET /api/categories` - List categories
- `POST /api/contact` - Contact form (rate limited)
- `GET /api/auth/me` - Current user info

## Database Collections

| Collection | Purpose |
|---|---|
| `user` | Better Auth users |
| `session` | Better Auth sessions |
| `account` | Better Auth accounts |
| `verification` | Better Auth verification |
| `opportunities` | Volunteer opportunities |
| `applications` | Volunteer applications |
| `categories` | Opportunity categories |
| `organizations` | Organizations |
| `contactMessages` | Contact form submissions |

## License

ISC
