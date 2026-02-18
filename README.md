# 🎯 InterviewAce - Mock Interview Platform

> **Connect Sri Lankan job seekers with verified industry professionals for paid mock interview practice**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

InterviewAce is a full-stack web application designed to help Sri Lankan job seekers prepare for interviews by connecting them with verified industry professionals. The platform enables:

- **Job Seekers:** Book and attend mock interviews with experts
- **Interviewers:** Share knowledge and earn money
- **Admins:** Manage the platform and verify interviewers

---

## ✨ Features

### For Job Seekers
- 🔍 Browse and filter verified interviewers by industry, experience, and ratings
- 📅 Flexible scheduling with real-time availability
- 💳 Secure payment processing via PayHere
- 🎥 Video interview sessions with WebRTC
- 📊 Detailed feedback and progress tracking
- 📚 Access to question bank and video library

### For Interviewers
- ✅ Profile verification system
- 📆 Availability management
- 💰 Earnings tracking
- 📝 Comprehensive feedback tools
- 📈 Performance analytics

### For Admins
- 👥 User management
- ✔️ Interviewer verification
- 📊 Platform analytics
- 💸 Payment dispute handling

---

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui + Radix UI
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **API Client:** Axios
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL
- **API:** REST with Next.js API Routes
- **Payment:** PayHere Gateway
- **Video:** WebRTC
- **Email:** SMTP (Gmail/SendGrid)

---

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))
- npm or yarn package manager

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd interviewace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   
   Update `.env.local` with your credentials:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/interviewace_db
   NEXTAUTH_SECRET=your-secret-key
   NEXT_PUBLIC_PAYHARE_MERCHANT_ID=your-merchant-id
   ```

4. **Set up database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Visit [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
interviewace/
├── src/
│   ├── app/                    # Next.js pages and API routes
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Dashboard pages
│   │   ├── api/               # Backend API routes
│   │   └── page.tsx           # Landing page
│   │
│   ├── components/            # React components
│   │   ├── common/            # Shared components
│   │   ├── auth/              # Auth components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── interviewer/       # Interviewer components
│   │   └── layouts/           # Layout components
│   │
│   ├── lib/                   # Core utilities
│   │   ├── api/               # API client functions
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Helper functions
│   │   └── constants.ts       # App constants
│   │
│   └── store/                 # Zustand state stores
│
├── public/                    # Static assets
├── drizzle.config.ts         # Drizzle ORM config
├── tailwind.config.ts        # Tailwind CSS config
├── tsconfig.json             # TypeScript config
└── package.json              # Dependencies
```

---

## 📚 Documentation

Comprehensive guides are available in the docs folder:

- **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** - Complete project overview
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[QUICK_START.md](./QUICK_START.md)** - Quick start guide
- **[IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)** - Feature checklist
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Project summary

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio

# Code Quality
npm run lint             # Run ESLint
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make your changes**
   - Follow TypeScript best practices
   - Use existing component patterns
   - Write meaningful commit messages

3. **Test your changes**
   ```bash
   npm run dev
   # Test in browser
   ```

4. **Submit a pull request**
   ```bash
   git push origin feature/your-feature
   ```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy automatically on push

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables

Required environment variables for production:

```env
DATABASE_URL=<production-database-url>
NEXTAUTH_SECRET=<random-secret-key>
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_PAYHARE_MERCHANT_ID=<merchant-id>
PAYHARE_MERCHANT_SECRET=<merchant-secret>
SMTP_HOST=smtp.gmail.com
SMTP_USER=<email>
SMTP_PASS=<password>
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all files
- Follow the existing component patterns
- Use Tailwind CSS for styling
- Write meaningful variable and function names
- Add comments for complex logic

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Node.js, PostgreSQL, Drizzle ORM
- **DevOps:** Vercel, AWS S3

---

## 📞 Support

For support and questions:

- 📧 Email: support@interviewace.com
- 💬 Slack: [Join our workspace](https://interviewace.slack.com)
- 📖 Docs: [Read the documentation](./PROJECT_CONTEXT.md)

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Open source community for amazing tools

---

<div align="center">

**Built with ❤️ by the InterviewAce Team**

[Website](https://interviewace.com) • [Documentation](./PROJECT_CONTEXT.md) • [GitHub](https://github.com/interviewace)

</div>
