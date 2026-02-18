# Project Layout

This repo is a monorepo with a Next.js frontend at the root and an Express backend inside `backend/`.

## Top-level structure (what to open first)
- `app/` — Next.js App Router pages and layouts (frontend UI)
- `lib/` — shared frontend utilities, types, and Drizzle schema
- `backend/` — Express API server (separate Node project)
- `drizzle.config.ts` — Drizzle ORM config (points to `lib/schema.ts`)
- `package.json` — frontend dependencies and scripts
- `backend/package.json` — backend dependencies and scripts

## Frontend (Next.js)
- `app/layout.tsx` — root layout
- `app/page.tsx` — home page
- `app/login/page.tsx` — login page
- `app/register/page.tsx` — job seeker registration
- `app/(admin)/admin/` — admin dashboard (layout + pages)
- `app/(job-seeker)/job-seeker/` — job seeker dashboard (layout + pages)
- `app/(interviewer)/interviewer/` — interviewer dashboard (layout + pages)
- `app/dashboard/` — legacy dashboard pages (can be removed later)
- `app/api/` — Next.js API routes (if used)
- `lib/api/` — frontend API client/services
- `lib/types/` — shared TypeScript types
- `lib/schema.ts` — Drizzle schema (database tables)

## Backend (Express)
- `backend/src/index.ts` — API server entry
- `backend/src/routes/` — route definitions
- `backend/src/controllers/` — request handlers (logic)
- `backend/src/services/` — business logic and integrations
- `backend/src/middleware/` — auth/error handling
- `backend/src/config/` — DB/JWT/Supabase config

## Database
- `lib/schema.ts` — table definitions (Drizzle)
- `drizzle.config.ts` — Drizzle setup

## Quick mental model
- Build UI in `app/`
- Shared types and schema in `lib/`
- API server code in `backend/src/`
- DB definitions in `lib/schema.ts`
