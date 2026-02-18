# InterviewAce - Mock Interview Platform for Sri Lankan Job Seekers

## **Project Overview**

**Type:** Full-stack web application  
**Purpose:** Connect Sri Lankan job seekers with verified industry professionals for paid mock interview practice  
**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, PostgreSQL, Drizzle ORM, PayHere Gateway  
**Target Users:** University students, graduates, professionals (ages 18-45)  

## **Technical Architecture**

### **Frontend Stack:**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** React Context + Zustand
- **Forms:** React Hook Form + Zod validation
- **API Calls:** Axios with interceptors
- **Authentication:** JWT tokens in httpOnly cookies
- **Icons:** Lucide React
- **Charts:** Recharts
- **Date Handling:** date-fns
- **Video:** WebRTC / Zoom SDK

### **Backend Stack:**
- **Runtime:** Node.js
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL
- **API:** REST with Next.js API Routes
- **Payment Gateway:** PayHere
- **Email Service:** Nodemailer / SendGrid
- **File Storage:** AWS S3 or local storage

### **Project Structure:**
```
src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Auth group layout
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── verify-email/
│   │       └── page.tsx
│   ├── (dashboard)/              # Dashboard group layout
│   │   ├── job-seeker/
│   │   │   ├── page.tsx
│   │   │   ├── browse/
│   │   │   │   └── page.tsx
│   │   │   ├── sessions/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── feedback/
│   │   │   │   └── page.tsx
│   │   │   ├── questions/
│   │   │   │   └── page.tsx
│   │   │   └── videos/
│   │   │       └── page.tsx
│   │   ├── interviewer/
│   │   │   ├── page.tsx
│   │   │   ├── availability/
│   │   │   │   └── page.tsx
│   │   │   ├── sessions/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── earnings/
│   │   │       └── page.tsx
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── verify/
│   │       │   └── page.tsx
│   │       ├── users/
│   │       │   └── page.tsx
│   │       └── analytics/
│   │           └── page.tsx
│   ├── interviewer/
│   │   └── [id]/
│   │       └── page.tsx
│   ├── booking/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── payment/
│   │   ├── page.tsx
│   │   └── success/
│   │       └── page.tsx
│   ├── session/
│   │   └── [id]/
│   │       └── page.tsx
│   ├── api/                      # Backend API routes
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   ├── register/
│   │   │   │   └── route.ts
│   │   │   ├── logout/
│   │   │   │   └── route.ts
│   │   │   └── verify-email/
│   │   │       └── route.ts
│   │   ├── interviewers/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── sessions/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── payments/
│   │   │   ├── route.ts
│   │   │   └── verify/
│   │   │       └── route.ts
│   │   ├── feedback/
│   │   │   └── route.ts
│   │   └── users/
│   │       └── [id]/
│   │           └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── common/                   # Shared components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── LoadingSpinner.tsx
│   ├── auth/                     # Auth components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── interviewer/              # Interviewer components
│   │   ├── InterviewerCard.tsx
│   │   ├── InterviewerProfile.tsx
│   │   └── FilterSidebar.tsx
│   ├── booking/                  # Booking components
│   │   ├── DateTimePicker.tsx
│   │   ├── BookingSummary.tsx
│   │   └── PaymentForm.tsx
│   ├── session/                  # Session components
│   │   ├── VideoRoom.tsx
│   │   ├── SessionControls.tsx
│   │   └── ChatPanel.tsx
│   └── dashboard/                # Dashboard components
│       ├── StatsCard.tsx
│       ├── SessionCard.tsx
│       └── ProgressChart.tsx
├── lib/
│   ├── api/                      # API client functions
│   │   ├── client.ts             # Axios instance
│   │   ├── auth.ts
│   │   ├── interviewers.ts
│   │   ├── sessions.ts
│   │   ├── payments.ts
│   │   └── feedback.ts
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useInterviewers.ts
│   │   ├── useWebRTC.ts
│   │   └── useDebounce.ts
│   ├── utils/                    # Utility functions
│   │   ├── date.ts
│   │   ├── currency.ts
│   │   ├── validation.ts
│   │   └── formatters.ts
│   ├── types/                    # TypeScript types
│   │   ├── user.ts
│   │   ├── interviewer.ts
│   │   ├── session.ts
│   │   └── payment.ts
│   └── constants.ts              # App constants
├── store/                        # Zustand stores
│   ├── authStore.ts
│   ├── bookingStore.ts
│   └── notificationStore.ts
└── styles/
    └── globals.css               # Global styles
```

## **Design System**

### **Colors:**
```typescript
const colors = {
  primary: {
    DEFAULT: '#1e40af',  // Deep Blue
    hover: '#1e3a8a',
    light: '#3b82f6',
  },
  secondary: {
    DEFAULT: '#0d9488',  // Teal
    hover: '#0f766e',
  },
  accent: {
    DEFAULT: '#f97316',  // Orange
    hover: '#ea580c',
  },
  success: '#16a34a',
  error: '#dc2626',
  warning: '#eab308',
}
```

### **Typography:**
```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Poppins', 'Inter', 'sans-serif'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  }
}
```

### **Spacing:**
```typescript
const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
}
```

## **Key Features to Implement**

### **Authentication & Authorization:**
- JWT-based authentication
- Role-based access control (Job Seeker, Interviewer, Admin)
- Protected routes with redirect
- Email verification flow
- Password reset functionality

### **Core User Flows:**

**Job Seeker:**
1. Register → Verify Email → Complete Profile
2. Browse Interviewers (with filters)
3. View Interviewer Profile
4. Book Session (date/time selection)
5. Payment Processing (PayHere integration)
6. Join Video Interview
7. Receive & View Feedback
8. Track Progress

**Interviewer:**
1. Register → Submit Verification Documents
2. Wait for Admin Approval
3. Set Availability Schedule
4. Accept/Decline Booking Requests
5. Conduct Video Interviews
6. Provide Detailed Feedback
7. Track Earnings

**Admin:**
1. Verify Interviewer Documents
2. Manage Users (suspend/delete)
3. Monitor Sessions
4. Handle Payment Disputes
5. View Platform Analytics

## **TypeScript Types**

### **User Types:**
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'job_seeker' | 'interviewer' | 'admin';
  isVerified: boolean;
  createdAt: Date;
}

interface JobSeeker extends User {
  university: string;
  graduationYear: number;
  fieldOfStudy: string;
  targetIndustries: string[];
  careerGoals: string;
  preferredLanguage: 'english' | 'sinhala' | 'tamil';
  resumeUrl?: string;
}

interface Interviewer extends User {
  currentCompany: string;
  jobTitle: string;
  yearsExperience: number;
  industryExpertise: string[];
  hourlyRate: number;
  bio: string;
  linkedinProfile: string;
  isVerified: boolean;
  ratingAverage: number;
  totalInterviews: number;
}
```

### **Session Types:**
```typescript
interface InterviewSession {
  id: string;
  jobSeekerId: string;
  interviewerId: string;
  industryId: string;
  sessionType: 'behavioral' | 'technical' | 'case_study' | 'mixed';
  scheduledDate: Date;
  duration: number;
  meetingLink?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priceAmount: number;
  recordingUrl?: string;
}

interface Feedback {
  id: string;
  sessionId: string;
  givenByUserId: string;
  feedbackForUserId: string;
  ratingOverall: number;
  ratingCommunication: number;
  ratingTechnical: number;
  ratingProfessionalism: number;
  writtenFeedback: string;
  improvementSuggestions: string;
  wouldRecommend: boolean;
}
```

## **Environment Variables**

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_TIMEOUT=30000

# Auth
NEXT_PUBLIC_JWT_EXPIRY=24h
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# PayHere Integration
NEXT_PUBLIC_PAYHEREMERCHANT_ID=your-merchant-id
PAYHEREMERCHANT_SECRET=your-merchant-secret
NEXT_PUBLIC_PAYHEREAPP_URL=http://localhost:3000

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@interviewace.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/interviewace_db

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=interviewace-bucket
AWS_REGION=ap-south-1

# WebRTC
NEXT_PUBLIC_WEBRTC_TURN_URLS=turn:turn.interviewace.com
NEXT_PUBLIC_WEBRTC_TURN_USERNAME=username
NEXT_PUBLIC_WEBRTC_TURN_PASSWORD=password

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## **API Integration Pattern**

```typescript
// All API calls through centralized client
// Automatic token refresh
// Error handling with toast notifications
// Loading states
// Optimistic updates where applicable

// Example API structure:
const api = {
  auth: {
    login: (credentials) => POST('/api/auth/login'),
    register: (data) => POST('/api/auth/register'),
    logout: () => POST('/api/auth/logout'),
  },
  interviewers: {
    getAll: (filters) => GET('/api/interviewers', { params: filters }),
    getById: (id) => GET(`/api/interviewers/${id}`),
    getFavorites: () => GET('/api/interviewers/favorites'),
  },
  sessions: {
    create: (data) => POST('/api/sessions'),
    getById: (id) => GET(`/api/sessions/${id}`),
    getMySessions: () => GET('/api/sessions/me'),
  },
  payments: {
    create: (data) => POST('/api/payments'),
    verify: (id) => POST(`/api/payments/${id}/verify`),
  }
}
```

## **Styling Guidelines**

### **Tailwind CSS Usage:**
```typescript
// Use consistent utility classes
// Primary buttons: bg-blue-600 hover:bg-blue-700 text-white
// Secondary buttons: bg-white border border-gray-300 hover:bg-gray-50
// Cards: bg-white rounded-lg shadow-sm border border-gray-200
// Inputs: border border-gray-300 focus:ring-2 focus:ring-blue-500
```

### **Responsive Design:**
```typescript
// Mobile-first approach
// Breakpoints: sm:640px, md:768px, lg:1024px, xl:1280px
// Collapsible sidebar on mobile
// Stack layouts vertically on mobile
// Touch-friendly button sizes (min 44px)
```

## **Performance Optimization**

- Lazy load routes with dynamic imports
- Image optimization with Next.js Image component
- Memoize expensive calculations with useMemo
- Debounce search inputs
- Virtualize long lists (react-window)
- Code splitting by route
- Server-side rendering for SEO-critical pages

## **Accessibility Requirements**

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators visible
- Color contrast ratio 4.5:1 minimum
- Alt text for all images
- Form labels properly associated

## **Testing Strategy**

- Unit tests for utility functions
- Integration tests for API calls
- Component tests with React Testing Library
- E2E tests for critical flows with Playwright
- Test responsive layouts
- Test accessibility with axe
