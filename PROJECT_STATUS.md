# 🚦 InterviewAce Project Status & Completed Workflows

This document explicitly lists the **hardcoded reality** of the InterviewAce project up to this exact point. It distinguishes between what is fully integrated (Frontend + Backend + PostgreSQL Database) and what is pending.

You can use this as your checklist for what actually works right now.

---

## ✅ 1. Fully Working (End-to-End Integrated)

The following features have their UI built, API routes connected, and data is actively saving to/from the PostgreSQL (Supabase) database.

### 🔐 Authentication & Users
- **Registration**: Users can register as either a `Job Seeker` or an `Interviewer`. The data is securely hashed and stored in the `users` table.
- **Login**: Users can log in. The backend verifies credentials, generates a JWT token, and the frontend stores this session in Zustand (`authStore.ts`).
- **Profile Fetching**: Upon login, the app fetches `/api/auth/me` to get the logged-in user's details and roles, directing them to the correct dashboard (`/job-seeker`, `/interviewer`, or `/admin`).

### 🎫 Support Ticket System (Recently Completed)
- **Ticket Creation**: Job Seekers and Interviewers can create new support tickets via `/api/support`. This saves to the `supportTickets` database table.
- **Unified Chat Interface**: The `UserSupport.tsx` component correctly loads and displays messages between the user and admins.
- **Message Alignment**: We implemented the `senderType` logic. The system successfully detects if a message was sent by an `admin` or a `user` and aligns the chat bubbles correctly (Left vs Right) depending on who is viewing the screen.
- **Admin Inbox**: Admins can view all tickets via `/api/admin/tickets`, open them, read the history, and send replies. Replies are saved to the `ticketMessages` table.
- **Status Management**: Admins can change a ticket's status (Open, In Progress, Resolved) and it successfully persists in the database.

### 👥 Admin User Management
- **View All Users**: Admins can view the full list of registered users via `/api/admin/users`.
- **Status Toggling**: Admins can suspend or activate users (changing the `status` field in the database).
- **User Deletion**: Admins can delete users from the database.

### ⚙️ Database & Infrastructure Stability
- **Next.js API Proxy**: The `app/api/[...path]/route.ts` seamlessly intercepts all `/api/*` frontend calls and proxies them securely to the backend on port 3001.
- **Connection Leak Fix**: The `database.ts` file is configured with `SIGTERM` and `SIGINT` shutdown hooks. This completely prevents the `tsx watch` hot-reloader from spawning "zombie" connections on Supabase, which previously caused the 500 Connection Timeout errors.
- **Session Pooler Mode**: We are using Supabase's `5432` Session Pooler in `.env.local` which natively supports the Prepared Statements required by Drizzle ORM.

---

## 🚧 2. UI Built but Needs Backend/Integration Polish

These features have frontend screens and backend routes, but might still need full end-to-end testing or slight wiring.

- **Sessions & Bookings**: The routes for creating sessions (`POST /api/sessions`) and fetching stats exist, but the complete booking flow (calendar selection -> payment -> session creation) needs final wiring.
- **Interviewer Availability**: Interviewers have UI to set their schedule. The backend route `PUT /interviewer/availability` exists, but edge cases around timezone handling need testing.
- **Payments**: The `payment.routes.ts` file is created (with PayHere placeholders), but the actual webhook and checkout redirects are not yet fully processing live transactions.

---

## 📅 3. Pending Features (Next Steps)

If you are continuing work, here is what you should focus on next:

1. **WebRTC Video Calls**: The `useWebRTC.ts` hook is scaffolded, but the actual peer-to-peer signaling server (usually via Socket.io) needs to be implemented in the Express backend to allow the video calls to connect.
2. **Payment Gateway Integration**: Finalizing the PayHere integration. You need to ensure the `POST /api/payments/webhook` successfully updates the `sessions` database table to mark a booking as `PAID`.
3. **Reviews & Feedback**: The routes exist in `feedback.routes.ts`, but you need to ensure users are prompted to leave a review after a session ends, and that those reviews display on the Interviewer's public profile.

---

*Last Updated: May 2026*
