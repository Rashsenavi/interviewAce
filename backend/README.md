# InterviewAce Backend

Express.js backend API for the InterviewAce platform.

## Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your database credentials:
   - `DATABASE_URL` - Your Supabase PostgreSQL connection string
   - `JWT_SECRET` - A secure random string (min 32 characters)
   - `FRONTEND_URL` - Your frontend URL (default: http://localhost:3000)

3. **Push database schema:**
   ```bash
   npm run db:push
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register/job-seeker` - Register as job seeker
- `POST /api/auth/register/interviewer` - Register as interviewer
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (authenticated)

### Job Seekers
- `GET /api/jobseekers` - Get all job seekers (admin only)
- `GET /api/jobseekers/profile` - Get job seeker profile
- `PUT /api/jobseekers/profile` - Update job seeker profile

### Interviewers
- `GET /api/interviewers` - Get all interviewers (public)
- `GET /api/interviewers/profile` - Get interviewer profile
- `PUT /api/interviewers/profile` - Update interviewer profile
- `GET /api/interviewers/:id` - Get interviewer by ID (public)

### Sessions
- `POST /api/sessions` - Book a session (job seeker only)
- `GET /api/sessions` - Get user's sessions
- `GET /api/sessions/stats` - Get session statistics
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id/status` - Update session status
- `PUT /api/sessions/:id/meeting-link` - Update meeting link

### Health Check
- `GET /health` - Health check endpoint

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run db:push` - Push schema to database
- `npm run db:generate` - Generate migrations
- `npm run db:studio` - Open Drizzle Studio

## Project Structure

```
backend/
├── src/
│   ├── config/        # Configuration (database, jwt, etc.)
│   ├── controllers/   # Request handlers
│   ├── db/            # Database schema
│   ├── middleware/    # Express middleware
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   └── index.ts       # Entry point
├── drizzle.config.ts  # Drizzle ORM config
├── package.json
└── tsconfig.json
```
