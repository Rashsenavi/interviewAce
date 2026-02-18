# 📁 Project Structure - InterviewAce

## 🎯 Quick Navigation

### Public Pages (No Authentication Required)
- **Landing Page**: [app/(public)/landing.tsx](app/(public)/landing.tsx) → Access at `/`
- **Welcome Page**: [app/(public)/welcome.tsx](app/(public)/welcome.tsx) → Access at `/welcome`

### Authentication Pages
- **Login**: [app/(auth)/login.tsx](app/(auth)/login.tsx) → Access at `/login`
- **Job Seeker Registration**: [app/(auth)/register-job-seeker.tsx](app/(auth)/register-job-seeker.tsx) → Access at `/register`
- **Interviewer Registration**: [app/(auth)/register-interviewer.tsx](app/(auth)/register-interviewer.tsx) → Access at `/register-interviewer`

### Job Seeker Dashboard
- **Main Dashboard**: [app/(job-seeker)/job-seeker/page.tsx](app/(job-seeker)/job-seeker/page.tsx) → Access at `/job-seeker`
- **Layout**: [app/(job-seeker)/job-seeker/layout.tsx](app/(job-seeker)/job-seeker/layout.tsx)
- **Subpages**:
  - Sessions: `/job-seeker/sessions`
  - Browse Interviewers: `/job-seeker/interviewers`
  - Payments: `/job-seeker/payments`
  - Profile: `/job-seeker/profile`

### Interviewer Dashboard
- **Main Dashboard**: [app/(interviewer)/interviewer/page.tsx](app/(interviewer)/interviewer/page.tsx) → Access at `/interviewer`
- **Layout**: [app/(interviewer)/interviewer/layout.tsx](app/(interviewer)/interviewer/layout.tsx)
- **Subpages**:
  - Availability: `/interviewer/availability`
  - Sessions: `/interviewer/sessions`
  - Earnings: `/interviewer/earnings`
  - Profile: `/interviewer/profile`

### Admin Dashboard
- **Main Dashboard**: [app/(admin)/admin/page.tsx](app/(admin)/admin/page.tsx) → Access at `/admin`
- **Layout**: [app/(admin)/admin/layout.tsx](app/(admin)/admin/layout.tsx)
- **Subpages**:
  - Users: `/admin/users`
  - Interviewers: `/admin/interviewers`
  - Payments: `/admin/payments`
  - Settings: `/admin/settings`

---

## 🗂️ Complete Directory Structure

```
/Users/rashmisenavirathna/Documents/interviewace/
│
├── app/                                    # Frontend (Next.js 14 App Router)
│   ├── (public)/                          # Public pages (no auth)
│   │   ├── landing.tsx                    # Home page
│   │   └── welcome.tsx                    # Welcome page
│   │
│   ├── (auth)/                            # Authentication pages
│   │   ├── login.tsx                      # Login page
│   │   ├── register-job-seeker.tsx        # Job seeker registration
│   │   └── register-interviewer.tsx       # Interviewer registration
│   │
│   ├── (job-seeker)/                      # Job seeker portal
│   │   └── job-seeker/
│   │       ├── layout.tsx                 # Job seeker layout + sidebar
│   │       ├── page.tsx                   # Dashboard home
│   │       ├── sessions/                  # My interview sessions
│   │       ├── interviewers/              # Browse & book interviewers
│   │       ├── payments/                  # Payment history
│   │       └── profile/                   # My profile
│   │
│   ├── (interviewer)/                     # Interviewer portal
│   │   └── interviewer/
│   │       ├── layout.tsx                 # Interviewer layout + sidebar
│   │       ├── page.tsx                   # Dashboard home
│   │       ├── availability/              # Manage availability slots
│   │       ├── sessions/                  # Upcoming sessions
│   │       ├── earnings/                  # Earnings & payouts
│   │       └── profile/                   # Profile & verification
│   │
│   ├── (admin)/                           # Admin portal
│   │   └── admin/
│   │       ├── layout.tsx                 # Admin layout + sidebar
│   │       ├── page.tsx                   # Admin dashboard
│   │       ├── users/                     # User management
│   │       ├── interviewers/              # Interviewer verification
│   │       ├── payments/                  # Payment oversight
│   │       └── settings/                  # System settings
│   │
│   ├── layout.tsx                         # Root layout
│   ├── page.tsx                           # Re-export landing page
│   └── globals.css                        # Global styles
│
├── lib/                                    # Shared utilities
│   ├── api/                               # API client & services
│   │   ├── client.ts                      # HTTP client (fetch wrapper)
│   │   ├── auth.ts                        # Auth service
│   │   └── index.ts                       # Exports
│   ├── types/                             # TypeScript types
│   │   ├── user.ts                        # User types
│   │   ├── interviewer.ts                 # Interviewer types
│   │   ├── session.ts                     # Session types
│   │   └── payment.ts                     # Payment types
│   ├── schema.ts                          # Drizzle ORM schema (18 tables)
│   └── db.ts                              # Database client
│
├── backend/                                # Express API server
│   ├── src/
│   │   ├── index.ts                       # Server entry point
│   │   ├── routes/                        # API route definitions
│   │   │   ├── auth.routes.ts             # POST /api/auth/login, /register
│   │   │   ├── jobseeker.routes.ts        # Job seeker endpoints
│   │   │   ├── interviewer.routes.ts      # Interviewer endpoints
│   │   │   ├── session.routes.ts          # Session management
│   │   │   ├── payment.routes.ts          # Payment processing
│   │   │   ├── feedback.routes.ts         # Feedback & ratings
│   │   │   └── admin.routes.ts            # Admin endpoints
│   │   ├── controllers/                   # Request handlers
│   │   ├── services/                      # Business logic
│   │   ├── middleware/                    # Auth, error handling
│   │   │   ├── auth.ts                    # JWT authentication
│   │   │   └── errorHandler.ts            # Error middleware
│   │   ├── config/                        # Configuration
│   │   │   ├── database.ts                # Drizzle setup
│   │   │   ├── jwt.ts                     # JWT utilities
│   │   │   └── supabase.ts                # Supabase client
│   │   ├── types/                         # Backend types
│   │   └── utils/                         # Utilities
│   └── package.json                       # Backend dependencies
│
├── drizzle.config.ts                       # Drizzle configuration
├── package.json                            # Frontend dependencies
├── tsconfig.json                           # TypeScript config
├── next.config.ts                          # Next.js config
└── .env.local                              # Environment variables
```

---

## 🚀 How to Navigate

### Finding Pages by Role

**For Job Seekers:**
1. Start at: `/job-seeker` → [app/(job-seeker)/job-seeker/page.tsx](app/(job-seeker)/job-seeker/page.tsx)
2. All job seeker files are in `app/(job-seeker)/job-seeker/`

**For Interviewers:**
1. Start at: `/interviewer` → [app/(interviewer)/interviewer/page.tsx](app/(interviewer)/interviewer/page.tsx)
2. All interviewer files are in `app/(interviewer)/interviewer/`

**For Admins:**
1. Start at: `/admin` → [app/(admin)/admin/page.tsx](app/(admin)/admin/page.tsx)
2. All admin files are in `app/(admin)/admin/`

**For Public/Auth:**
- Landing page: `app/(public)/landing.tsx`
- Login: `app/(auth)/login.tsx`
- Register (Job Seeker): `app/(auth)/register-job-seeker.tsx`
- Register (Interviewer): `app/(auth)/register-interviewer.tsx`

---

## 📝 Route Groups Explanation

Next.js route groups use `(folder-name)` syntax to organize files without affecting URLs:

- `app/(public)/landing.tsx` → URL: `/` (not `/public/landing`)
- `app/(auth)/login.tsx` → URL: `/login` (not `/auth/login`)
- `app/(job-seeker)/job-seeker/page.tsx` → URL: `/job-seeker`

This keeps files organized by role while maintaining clean URLs.

---

## ✅ Benefits of This Structure

1. **Clear Separation**: Each user role has its own folder
2. **Easy to Find**: No confusion about which file is for which role
3. **Scalable**: Easy to add new pages per role
4. **Type-Safe**: Shared types in `lib/types/`
5. **Clean URLs**: Route groups don't pollute URLs

---

## 🔍 Quick File Finder

| What you need | Where to find it |
|---------------|------------------|
| Landing page | `app/(public)/landing.tsx` |
| Job seeker registration | `app/(auth)/register-job-seeker.tsx` |
| Interviewer registration | `app/(auth)/register-interviewer.tsx` |
| Job seeker dashboard | `app/(job-seeker)/job-seeker/page.tsx` |
| Interviewer dashboard | `app/(interviewer)/interviewer/page.tsx` |
| Admin dashboard | `app/(admin)/admin/page.tsx` |
| Database schema | `lib/schema.ts` |
| API client | `lib/api/client.ts` |
| Backend routes | `backend/src/routes/` |
| User types | `lib/types/user.ts` |
