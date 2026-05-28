# 🚀 InterviewAce Developer Guide & Architecture Overview

Welcome to the **InterviewAce** developer guide! This document provides a comprehensive, fully-covered explanation of how the project is structured, how the code works, and how all the moving parts communicate. You can use this as your primary manual for continuing development on the project.

---

## 🏗️ 1. System Architecture

InterviewAce uses a **Monorepo-style** architecture with a modern full-stack split:

- **Frontend**: Next.js 14 (App Router) + React 19 + Tailwind CSS v4.
- **Backend**: Node.js + Express + TypeScript.
- **Database**: PostgreSQL (hosted on Supabase) accessed via **Drizzle ORM**.

### 🔌 How Frontend Talks to Backend (The API Proxy)

Because the frontend runs on `localhost:3000` and the backend runs on `localhost:3001`, we use an **API Proxy** to avoid CORS issues and simplify routing.

1. The frontend code (e.g., Axios client) makes a request to `/api/support`.
2. Next.js catches this request in the Catch-all API Route (`app/api/[...path]/route.ts`).
3. Next.js securely forwards the exact request (headers, body, cookies) to `http://localhost:3001/api/support`.
4. The Express backend processes the request and sends the response back through Next.js to the browser.

---

## 📂 2. Directory Structure

### **`/app` (Next.js Frontend Routing)**
Uses Next.js App Router with **Route Groups** (folders in parentheses) to organize pages without affecting the URL:
- `(auth)/`: Login and register pages.
- `(job-seeker)/`: Pages exclusively for job seekers (e.g., booking sessions, viewing support).
- `(interviewer)/`: Pages for interviewers (e.g., managing availability).
- `(admin)/`: The admin dashboard (e.g., user management, support inbox).

### **`/components` (Frontend UI Elements)**
- `common/`: Reusable buttons, inputs, layouts.
- `support/`: Contains `UserSupport.tsx`, a highly dynamic chat interface used by **both** users and admins for support tickets.

### **`/backend` (Express API Server)**
- `src/index.ts`: The entry point that boots the Express server.
- `src/routes/`: Defines the API endpoints (e.g., `support.routes.ts`, `admin.routes.ts`).
- `src/controllers/`: Handles incoming HTTP requests, extracts parameters, and sends HTTP responses.
- `src/services/`: **The Brains.** Contains all the core business logic and database queries (e.g., `support.service.ts`).
- `src/db/`: Contains `schema.ts` defining your Drizzle database tables.
- `src/config/`: Contains `database.ts` for database connection pooling.

---

## 💾 3. Database & Connection Pooling (Crucial Details)

InterviewAce uses **Supabase PostgreSQL** with **Drizzle ORM**.

### The Connection Pooler Fix (Why it's set up this way)
Supabase's free tier has a strict limit of 60 simultaneous database connections. During development, when `tsx watch` reloads the backend after a file save, it kills the old server and starts a new one. 
If the old connections aren't closed properly, they turn into "zombies", clogging Supabase. This causes new connections to hang in a queue for ~80 seconds, resulting in `500 Connection Timeout` errors.

To fix this forever, your `backend/src/config/database.ts` implements two critical safeguards:
1. **Graceful Shutdown**: It listens for `SIGTERM` and `SIGINT` to explicitly run `pool.end()` and close database connections the millisecond the server reloads.
2. **Session Pooler URL**: We use the port `5432` pooler URL (`aws-1...pooler.supabase.com:5432`) in `.env.local` which natively supports Prepared Statements (required by Drizzle ORM).

*Always ensure your `.env.local` uses the `5432` port for the `DATABASE_URL`!*

---

## 🎫 4. Feature Deep-Dive: Support Tickets System

We recently built the Support Tickets system. Here is exactly how it flows from top to bottom so you understand how features are built:

### A. The Database (`backend/src/db/schema.ts`)
We defined two tables:
- `supportTickets`: Tracks the ticket `id`, `subject`, `status` (Open, In Progress, Resolved).
- `ticketMessages`: Tracks individual chat bubbles. Crucially, it has a `senderType` field (`user` vs `admin`) to distinguish who sent the message.

### B. The Backend (`backend/src/`)
1. **Route** (`support.routes.ts`): We map `POST /api/support` to the `createTicket` controller.
2. **Controller** (`support.controller.ts`): Validates that the request has a `subject` and `description`.
3. **Service** (`support.service.ts`): Opens a database transaction to insert the new ticket into `supportTickets` and immediately inserts the first message into `ticketMessages`.

### C. The Frontend Component (`UserSupport.tsx`)
This component is magical because it is shared between the Admin Dashboard and the User Dashboard.
- **Fetching**: It uses `useEffect` to fetch `/api/support` (for users) or `/api/admin/tickets` (for admins).
- **Message Rendering**: When mapping over messages, it checks `message.senderType === "admin"` to determine if a message should align to the left (received) or right (sent).
  - *Note: For the admin view, the alignment logic is reversed so admin replies always appear on the right.*

---

## 🛠️ 5. How to Add a New Feature (Step-by-Step)

If you want to add a new feature (e.g., "Reviews"), follow this exact flow:

1. **Database**: 
   - Add the table to `backend/src/db/schema.ts`.
   - Run `npm run db:push` in the backend folder to sync Supabase.
2. **Backend Service**:
   - Create `backend/src/services/review.service.ts`. Write functions to `getReviews()` and `createReview()`.
3. **Backend Controller**:
   - Create `backend/src/controllers/review.controller.ts` to handle the HTTP Request (`req`, `res`).
4. **Backend Route**:
   - Create `backend/src/routes/review.routes.ts` and attach the controller.
   - Register the route in `backend/src/index.ts` (e.g., `app.use("/api/reviews", reviewRoutes)`).
5. **Frontend API Client**:
   - Add the fetch functions to `lib/api/` (e.g., `api.post('/api/reviews')`).
6. **Frontend Page**:
   - Create `app/(job-seeker)/job-seeker/reviews/page.tsx` and build the UI.

---

## 🏃 6. Running the Project

To boot up the entire stack simultaneously:
```bash
npm run dev:all
```
This runs a library called `concurrently` which triggers:
1. `npm run dev` (Starts Next.js frontend on port 3000).
2. `npm run dev:backend` (Starts Express backend on port 3001 with hot-reloading).

### Troubleshooting Checklist
- **If you get 500 errors on API requests**: Check the backend terminal output. It is usually a database connection issue or a missing environment variable.
- **If database changes aren't showing up**: Run `npm run db:generate` and `npm run db:push` inside the `backend` folder to push your `schema.ts` to Supabase.
- **If messages align incorrectly in chat**: Check the `senderType` field in the database. The frontend relies entirely on this string (`user` or `admin`) to style the UI.
