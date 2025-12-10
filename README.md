# Service Marketplace Platform

A production-ready, modular service marketplace monorepo built with Turborepo, featuring microservices architecture.

## Architecture

### Frontend Apps (Next.js 14)
- **apps/web** (port 3000) - User-facing marketplace
- **apps/provider** (port 3002) - Service provider dashboard
- **apps/admin** (port 3003) - Admin management panel

### Backend Microservices (Express.js)
- **auth-service** (port 4001) - Authentication, JWT, Google OAuth
- **listing-service** (port 4002) - Service listings management
- **booking-service** (port 4003) - Booking operations
- **review-service** (port 4004) - Ratings and reviews
- **notification-service** (port 4005) - Notification placeholder
- **api-gateway** (port 3001) - API gateway for all frontends

### Shared Packages
- **packages/types** - Shared TypeScript types and Zod schemas
- **packages/utils** - Utility functions (JWT, bcrypt, etc.)
- **packages/config** - Shared configurations

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Frontend**: Next.js 14, NextUI, Tailwind CSS, Zustand
- **Backend**: Express.js, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT + Google OAuth
- **Language**: TypeScript

## Service Categories

- **ACCOMMODATION** - Hostels, PGs, flats
- **TRAVEL** - Cabs, bikes, transport
- **FOOD** - Tiffin, mess, catering
- **LAUNDRY** - Wash, iron, dry clean

## User Roles

- **USER** - Browse, book services, leave reviews
- **PROVIDER** - Create/manage listings, handle bookings
- **ADMIN** - Approve/reject listings, platform management

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9+
- PostgreSQL 16+

### Local Development

1. **Install dependencies**
```bash
pnpm install
```

2. **Set up environment variables**
```bash
# Copy env files for each service
cp services/auth-service/.env.example services/auth-service/.env
cp services/listing-service/.env.example services/listing-service/.env
cp services/booking-service/.env.example services/booking-service/.env
cp services/review-service/.env.example services/review-service/.env
cp services/api-gateway/.env.example services/api-gateway/.env
cp apps/web/.env.example apps/web/.env
```

3. **Start PostgreSQL** (or use Docker)
```bash
docker run -d --name marketplace-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine
```

4. **Run Prisma migrations**
```bash
cd services/auth-service && npx prisma db push
cd ../listing-service && npx prisma db push
cd ../booking-service && npx prisma db push
cd ../review-service && npx prisma db push
```

5. **Start development**
```bash
pnpm dev
```

### Docker Deployment

```bash
docker-compose up --build
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register user/provider
- `POST /login` - Login
- `POST /google` - Google OAuth
- `POST /refresh` - Refresh token
- `GET /me` - Current user

### Listings (`/api/listings`)
- `GET /` - List approved listings
- `GET /featured` - Featured listings
- `GET /:id` - Listing details
- `GET /categories` - Category stats

### Provider (`/api/provider`)
- `GET /listings` - Provider's listings
- `POST /listings` - Create listing
- `PUT /listings/:id` - Update listing
- `GET /bookings` - Provider's bookings
- `POST /bookings/:id/confirm` - Confirm booking
- `POST /bookings/:id/complete` - Complete booking

### Admin (`/api/admin`)
- `GET /listings/pending` - Pending listings
- `GET /listings/all` - All listings
- `POST /listings/:id/approve` - Approve listing
- `POST /listings/:id/reject` - Reject listing

### Bookings (`/api/bookings`)
- `GET /me` - User's bookings
- `POST /` - Create booking
- `POST /:id/cancel` - Cancel booking

### Reviews (`/api/reviews`)
- `GET /listing/:id` - Listing reviews
- `POST /` - Create review

## Creating Admin User

Use Prisma to seed an admin:

```bash
cd services/auth-service
npx prisma db seed
```

Or manually via API after setting up:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123","name":"Admin","role":"ADMIN"}'
```

## Project Structure

```
service-marketplace/
├── apps/
│   ├── web/              # User frontend
│   ├── provider/         # Provider dashboard
│   └── admin/            # Admin panel
├── services/
│   ├── auth-service/     # Authentication
│   ├── listing-service/  # Listings
│   ├── booking-service/  # Bookings
│   ├── review-service/   # Reviews
│   ├── notification-service/
│   └── api-gateway/      # API Gateway
├── packages/
│   ├── types/            # Shared types
│   ├── utils/            # Utilities
│   └── config/           # Configs
├── docker-compose.yml
├── turbo.json
└── package.json
```

## Main User Flow

1. **Provider** signs up at provider portal
2. **Provider** creates listing (status: PENDING)
3. **Admin** reviews and approves listing
4. **User** sees listing in marketplace
5. **User** books the service
6. **Provider** confirms and completes booking
7. **User** leaves review for completed booking

## License

MIT
