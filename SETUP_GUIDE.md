# InterviewAce - Complete Setup Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Project Structure](#project-structure)
5. [Development Workflow](#development-workflow)
6. [Available Scripts](#available-scripts)
7. [Environment Variables](#environment-variables)
8. [Database Setup](#database-setup)
9. [API Routes](#api-routes)
10. [Component Library](#component-library)
11. [State Management](#state-management)
12. [Type System](#type-system)
13. [Styling Guide](#styling-guide)
14. [Best Practices](#best-practices)

## 🎯 Project Overview

InterviewAce is a full-stack mock interview platform built with:
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS v4
- **Backend:** Next.js API Routes, Drizzle ORM, PostgreSQL
- **State:** Zustand for global state
- **Forms:** React Hook Form + Zod validation
- **UI:** Custom components + Radix UI primitives

## ✅ Prerequisites

- **Node.js:** 18.0.0 or higher
- **PostgreSQL:** 14.0 or higher
- **npm/yarn:** Latest version
- **Git:** For version control

## 🚀 Installation

### 1. Clone & Install
```bash
git clone <repository-url>
cd interviewace
npm install
```

### 2. Environment Setup
Configure `.env.local` with your credentials (see [Environment Variables](#environment-variables))

### 3. Database Setup
```bash
# Push schema to database
npm run db:push

# Open Drizzle Studio (optional)
npm run db:studio
```

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
interviewace/
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── (auth)/                   # Auth routes (login, register)
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/              # Protected dashboard routes
│   │   │   ├── job-seeker/           # Job seeker pages
│   │   │   ├── interviewer/          # Interviewer pages
│   │   │   └── admin/                # Admin pages
│   │   ├── api/                      # Backend API routes
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── interviewers/         # Interviewer endpoints
│   │   │   ├── sessions/             # Session endpoints
│   │   │   ├── payments/             # Payment endpoints
│   │   │   └── feedback/             # Feedback endpoints
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── common/                   # Shared components
│   │   │   ├── Header.tsx            # App header
│   │   │   ├── Footer.tsx            # App footer
│   │   │   ├── Sidebar.tsx           # Dashboard sidebar
│   │   │   └── LoadingSpinner.tsx    # Loading indicator
│   │   ├── auth/                     # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── dashboard/                # Dashboard components
│   │   │   ├── StatsCard.tsx
│   │   │   ├── SessionCard.tsx
│   │   │   └── ProgressChart.tsx
│   │   ├── interviewer/              # Interviewer components
│   │   │   └── InterviewerCard.tsx
│   │   ├── booking/                  # Booking flow components
│   │   ├── session/                  # Video session components
│   │   ├── layouts/                  # Layout components
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── AuthLayout.tsx
│   │   └── ui/                       # shadcn/ui components
│   ├── lib/
│   │   ├── api/                      # API client layer
│   │   │   ├── client.ts             # Axios instance with interceptors
│   │   │   ├── auth.ts               # Auth API calls
│   │   │   ├── interviewers.ts       # Interviewer API calls
│   │   │   ├── sessions.ts           # Session API calls
│   │   │   ├── payments.ts           # Payment API calls
│   │   │   └── feedback.ts           # Feedback API calls
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.ts            # Authentication hook
│   │   │   ├── useInterviewers.ts    # Interviewers data hook
│   │   │   ├── useDebounce.ts        # Debounce hook
│   │   │   └── useWebRTC.ts          # WebRTC hook
│   │   ├── utils/                    # Utility functions
│   │   │   ├── date.ts               # Date formatting & manipulation
│   │   │   ├── currency.ts           # Currency formatting
│   │   │   ├── validation.ts         # Zod schemas
│   │   │   └── formatters.ts         # Text & data formatters
│   │   ├── types/                    # TypeScript definitions
│   │   │   ├── user.ts               # User types
│   │   │   ├── session.ts            # Session types
│   │   │   ├── payment.ts            # Payment types
│   │   │   ├── interviewer.ts        # Interviewer types
│   │   │   └── index.ts              # Barrel exports
│   │   ├── constants.ts              # App-wide constants
│   │   ├── db.ts                     # Database connection
│   │   └── schema.ts                 # Drizzle schema
│   └── store/                        # Zustand stores
│       ├── authStore.ts              # Auth state
│       ├── bookingStore.ts           # Booking state
│       └── notificationStore.ts      # Notification state
├── public/                           # Static assets
├── drizzle.config.ts                 # Drizzle configuration
├── tsconfig.json                     # TypeScript config
├── next.config.ts                    # Next.js config
├── tailwind.config.ts                # Tailwind config
├── package.json                      # Dependencies
├── .env.local                        # Environment variables
├── PROJECT_CONTEXT.md                # Project documentation
└── README.md                         # This file
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server (localhost:3000)

# Production
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint

# Database
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio
npm run db:generate      # Generate migrations

# Testing (to be set up)
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
```

## 🔐 Environment Variables

All environment variables are in `.env.local`:

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_TIMEOUT=30000

# Auth
NEXTAUTH_SECRET=<generate-random-string>
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/interviewace_db

# PayHere (Sri Lankan Payment Gateway)
NEXT_PUBLIC_PAYHARE_MERCHANT_ID=<your-merchant-id>
PAYHARE_MERCHANT_SECRET=<your-secret>

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASS=<app-password>

# AWS S3 (Optional - for file storage)
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_S3_BUCKET=interviewace-bucket
AWS_REGION=ap-south-1
```

## 🗄️ Database Setup

### Schema Location
- **File:** `lib/schema.ts`
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL (Supabase)

### Push Schema
```bash
npm run db:push
```

### Drizzle Studio (GUI)
```bash
npm run db:studio
# Opens at http://localhost:4983
```

## 🌐 API Routes

All API routes are in `src/app/api/`:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/refresh` - Token refresh

### Interviewers
- `GET /api/interviewers` - List interviewers (with filters)
- `GET /api/interviewers/:id` - Get interviewer profile
- `PUT /api/interviewers/me` - Update own profile
- `GET /api/interviewers/:id/availability` - Get availability

### Sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions/:id` - Get session details
- `GET /api/sessions/me` - Get my sessions
- `PUT /api/sessions/:id` - Update session
- `POST /api/sessions/:id/cancel` - Cancel session

### Payments
- `POST /api/payments` - Create payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/me` - Get payment history

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/:id` - Get feedback
- `GET /api/sessions/:id/feedback` - Get session feedback

## 🎨 Component Library

### Common Components
Located in `src/components/common/`:

```tsx
import { Header, Footer, Sidebar, LoadingSpinner } from '@/components/common';
```

### Dashboard Components
Located in `src/components/dashboard/`:

```tsx
import { StatsCard, SessionCard, ProgressChart } from '@/components/dashboard';
```

### Usage Example
```tsx
<StatsCard
  title="Total Sessions"
  value={42}
  icon={<Calendar />}
  trend={{ value: 12, direction: 'up' }}
  color="blue"
/>
```

## 📊 State Management

### Zustand Stores

#### Auth Store
```tsx
import { useAuthStore } from '@/store/authStore';

const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
```

#### Booking Store
```tsx
import { useBookingStore } from '@/store/bookingStore';

const { selectedInterviewer, setSelectedInterviewer } = useBookingStore();
```

#### Notification Store
```tsx
import { useNotificationStore } from '@/store/notificationStore';

const { addNotification } = useNotificationStore();

addNotification({
  type: 'success',
  title: 'Success!',
  message: 'Profile updated',
});
```

## 📝 Type System

All types are in `src/lib/types/`:

```typescript
import { User, Interviewer, InterviewSession, Payment } from '@/lib/types';
```

### Key Types
- `User` - Base user type
- `JobSeeker` - Job seeker extended type
- `Interviewer` - Interviewer extended type
- `InterviewSession` - Session data
- `Payment` - Payment information
- `Feedback` - Feedback data

## 🎨 Styling Guide

### Tailwind CSS v4
Using Tailwind CSS with custom configuration.

### Color Palette
```typescript
Primary: blue-600 (#1e40af)
Secondary: teal-600 (#0d9488)
Accent: orange-500 (#f97316)
Success: green-600 (#16a34a)
Error: red-600 (#dc2626)
```

### Component Styling Patterns
```tsx
// Primary Button
className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"

// Card
className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"

// Input
className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
```

## ✅ Best Practices

### 1. Component Organization
- Keep components small and focused
- Use TypeScript for all files
- Export named components
- Co-locate related files

### 2. State Management
- Use Zustand for global state
- Use React hooks for local state
- Avoid prop drilling

### 3. API Calls
- Use the API client layer
- Handle errors gracefully
- Show loading states
- Use TypeScript types

### 4. Forms
- Use React Hook Form
- Validate with Zod schemas
- Show field-level errors
- Disable submit during loading

### 5. Styling
- Use Tailwind utility classes
- Follow mobile-first approach
- Maintain consistent spacing
- Use design system colors

### 6. Performance
- Lazy load routes
- Memoize expensive calculations
- Optimize images
- Debounce search inputs

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy automatically

### Environment Variables in Vercel
Add all variables from `.env.local` in Vercel dashboard

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [Zustand](https://zustand-demo.pmnd.rs)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

**Need Help?** Contact the development team or refer to [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)
