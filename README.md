# Multi-Service Marketplace Platform

A production-grade, full-stack marketplace platform for accommodation and food services.

## Tech Stack

- **Runtime**: Bun
- **Backend**: Express.js + Better Auth + Prisma
- **Frontend**: Next.js 15 (App Router) + Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL
- **Authentication**: Better Auth (Email/Password + Google OAuth)
- **Image Storage**: Multer (disk storage)
- **Infrastructure**: Docker + Docker Compose

## User Roles

- **USER**: Browse services, book, leave reviews
- **SERVICE_PROVIDER**: All USER permissions + manage own services and bookings
- **ADMIN**: Full platform management, user/provider verification

## Project Structure

```
├── backend/                 # Express backend
│   ├── src/
│   │   ├── lib/            # Auth, Prisma, Upload configs
│   │   ├── middleware/     # Auth middleware
│   │   └── routes/         # API routes
│   └── prisma/             # Database schema
├── src/                    # Next.js frontend
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   └── lib/               # API client, auth client
├── docker-compose.yml
└── Dockerfile.frontend
```

## Setup Instructions

### Prerequisites

- Bun (latest)
- Docker & Docker Compose
- Node.js 20+ (for frontend)

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
bun install

# Install backend dependencies
cd backend && bun install
```

### 2. Environment Setup

```bash
# Root .env for frontend
cp .env.example .env

# Backend .env
cp backend/.env.example backend/.env
```

Edit the `.env` files:

**backend/.env**:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/marketplace"
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FRONTEND_URL="http://localhost:3000"
PORT=8000
```

### 3. Start PostgreSQL (Docker)

```bash
docker compose up postgres -d
```

### 4. Initialize Database

```bash
cd backend
bunx prisma db push
bunx prisma generate
```

### 5. Start Development Servers

```bash
# Terminal 1: Backend
cd backend && bun run dev

# Terminal 2: Frontend
bun run dev
```

### 6. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Health Check: http://localhost:8000/api/health

## Docker Production Deployment

```bash
# Create .env file with secrets
cp .env.example .env
# Edit .env with production values

# Build and start all services
docker compose up -d

# Run database migrations
docker compose exec backend bunx prisma db push
```

## API Endpoints

### Authentication (Better Auth)
- `POST /api/auth/sign-up` - Register
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get session

### Services
- `GET /api/services` - List services (public)
- `GET /api/services/:id` - Service details (public)
- `POST /api/services` - Create service (provider)
- `PUT /api/services/:id` - Update service (provider)
- `DELETE /api/services/:id` - Delete service (provider)
- `GET /api/services/provider/my-services` - Provider's services

### Bookings
- `POST /api/bookings` - Create booking (user)
- `GET /api/bookings/my-bookings` - User's bookings
- `GET /api/bookings/provider-bookings` - Provider's bookings
- `PATCH /api/bookings/:id/status` - Update status

### Reviews
- `POST /api/reviews` - Create review (completed booking)
- `GET /api/reviews/service/:serviceId` - Service reviews

### Provider
- `POST /api/provider/apply` - Apply as provider
- `GET /api/provider/profile` - Get profile
- `PUT /api/provider/profile` - Update profile
- `GET /api/provider/dashboard-stats` - Stats

### Admin
- `GET /api/admin/users` - List users
- `GET /api/admin/providers` - List providers
- `PATCH /api/admin/providers/:id/verify` - Verify provider
- `PATCH /api/admin/users/:id/role` - Change user role
- `GET /api/admin/statistics` - Platform stats

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable OAuth consent screen
4. Create OAuth 2.0 credentials
5. Add redirect URIs:
   - `http://localhost:8000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy Client ID and Secret to `.env`

## Making a User Admin

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

Or via Prisma Studio:
```bash
cd backend && bunx prisma studio
```

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker compose ps

# View logs
docker compose logs postgres
```

### Prisma Issues
```bash
# Regenerate client
cd backend && bunx prisma generate

# Reset database
bunx prisma db push --force-reset
```

### Better Auth Issues
- Ensure `BETTER_AUTH_SECRET` is set
- Check CORS settings match `FRONTEND_URL`
- Verify Google OAuth redirect URIs

## License

MIT