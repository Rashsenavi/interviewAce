# 🎯 InterviewAce - Mock Interview Platform

> **Connect Sri Lankan job seekers with verified industry professionals for paid mock interview practice**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)

---

## 🌟 Overview

InterviewAce is a full-stack web application designed to help Sri Lankan job seekers prepare for interviews by connecting them with verified industry professionals. The platform enables:

- **Job Seekers:** Book and attend mock sessions, receive structured evaluations, and track progress.
- **Interviewers:** Schedule availability, conduct mock calls, submit candidate feedback, and track earnings.
- **Admins:** Handle interviewer document verifications, manage monthly payouts, and moderate session recordings.

---

## ✨ Features

### For Job Seekers
- 🔍 Browse and filter verified interviewers by role, ratings, and experience
- 📅 Flexible booking and scheduling with real-time interviewer calendars
- 💳 Secure payment processing in LKR via PayHere
- 📊 Detailed feedback reports grading communication, technical depth, problem-solving, and confidence
- 📚 Practice question bank and session video player

### For Interviewers
- ✅ Verification pipeline (NIC and corporate letter uploads)
- 📆 Availability calendar management
- 💰 Earning logs (Gross Earnings, commissions, and take-home Net Earnings)
- 📝 Structured evaluation rubrics for candidates
- 📹 Session recording uploads

### For Admins
- 👥 User account moderation and suspensions
- ✔️ Document verification desk
- 💸 Monthly payout releases with auto-release safety nets
- 📹 Session recording moderation desk (warning flags and video checks)
- 💬 Real-time multi-role support ticket desk

---

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **Context System:** Custom Toast notifications and role-based Auth contexts

### Backend
- **Runtime:** Node.js Express server
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL
- **Video Sessions:** Zoom Integration (with browser pop-up blocked fallback checks)
- **Email:** SMTP (Ethereal test mailers)
- **File & Video Storage:** Cloudinary & Supabase storage buckets

---

## 📁 Project Structure

```
interviewace/
├── app/                      # Next.js App Router pages and layouts
│   ├── (admin)/              # Admin Dashboard pages (verification, payouts, videos)
│   ├── (auth)/               # Auth pages (login, registration, forgot-password)
│   ├── (interviewer)/        # Interviewer Dashboard pages (schedule, earnings, feedback)
│   ├── (job-seeker)/         # Job Seeker Dashboard pages (payments, sessions, feedback)
│   └── (public)/             # Public welcome and landing pages
│
├── components/               # Shared frontend UI components
├── lib/                      # Frontend API client, contexts, helper utils, and schemas
│
├── backend/                  # Node.js Express API server
│   ├── src/
│   │   ├── config/           # Database, JWT, SMTP, and external service configs
│   │   ├── controllers/      # Endpoint request handlers
│   │   ├── db/               # PostgreSQL schema definition
│   │   ├── middleware/       # JWT auth guards and error handling middleware
│   │   ├── routes/           # REST API routes
│   │   └── services/         # Business logic and integrations (Zoom, Supabase, Cloudinary)
│   └── package.json
│
├── package.json              # Frontend dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```
