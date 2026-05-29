import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Compass,
  Sparkles,
  Star,
  TrendingUp,
  Video,
  Building2,
  Award,
} from "lucide-react";
import { Space_Grotesk, Manrope } from "next/font/google";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

// ─── Marketing stats (kept as-is per design decision) ────────────────────────
const stats = [
  { label: "Sessions completed", value: "2,500+" },
  { label: "Verified interviewers", value: "180+" },
  { label: "Average rating", value: "4.8 / 5" },
  { label: "Interview confidence gain", value: "+45%" },
];

const steps = [
  {
    title: "Choose your interviewer",
    text: "Filter by role, industry, and language to find the right mentor for your target role.",
  },
  {
    title: "Run a realistic mock",
    text: "Join a timed live session with industry-style questions, follow-ups, and pressure simulation.",
  },
  {
    title: "Improve with a clear plan",
    text: "Get actionable feedback on communication, structure, technical depth, and confidence.",
  },
];

const features = [
  {
    icon: Compass,
    title: "Sri Lanka-focused prep",
    text: "Interview patterns and expectations tailored for local and global employers hiring from Sri Lanka.",
  },
  {
    icon: Video,
    title: "Live 1:1 sessions",
    text: "Practice in a realistic call format instead of generic question lists.",
  },
  {
    icon: CircleDollarSign,
    title: "Transparent LKR pricing",
    text: "Simple packages with no hidden charges and clear value per session.",
  },
  {
    icon: TrendingUp,
    title: "Progress tracking",
    text: "Measure your improvement over time with session history and feedback trends.",
  },
];

// Fallback testimonials — used only if DB has fewer than 3 real reviews
const FALLBACK_TESTIMONIALS = [
  {
    quote: "I stopped freezing in technical interviews after two sessions. The feedback was specific and practical.",
    name: "Kasun Perera",
    role: "Software Engineer, WSO2",
    rating: 5,
  },
  {
    quote: "It felt like a real interview panel, not a coaching chat. That realism made all the difference.",
    name: "Thilini Fernando",
    role: "Management Trainee, Banking",
    rating: 5,
  },
  {
    quote: "The structure helped me answer behavioral questions with confidence and better storytelling.",
    name: "Ravindu Silva",
    role: "Graduate Analyst",
    rating: 5,
  },
];

const plans = [
  {
    name: "Starter",
    price: "LKR 2,500",
    meta: "1 session",
    points: ["1 live mock interview", "Summary feedback", "Basic action plan"],
    cta: "Start now",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "LKR 12,000",
    meta: "5 sessions",
    points: ["Role-focused interview tracks", "Detailed feedback after each session", "Progress trend view"],
    cta: "Choose Growth",
    highlighted: true,
  },
  {
    name: "Career Sprint",
    price: "LKR 20,000",
    meta: "10 sessions",
    points: ["Full interview preparation cycle", "Priority booking", "Comprehensive improvement plan"],
    cta: "Go all in",
    highlighted: false,
  },
];

// ─── Server-side data fetch helpers ──────────────────────────────────────────
async function fetchPublicData<T>(path: string): Promise<T | null> {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
    const res = await fetch(`${backendUrl}/api/public/${path}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default async function InterviewAceLanding() {
  // Fetch real data server-side (with 5 min cache)
  const [interviewersData, testimonialsData] = await Promise.all([
    fetchPublicData<{ interviewers: any[] }>("interviewers"),
    fetchPublicData<{ testimonials: any[] }>("testimonials"),
  ]);

  const liveInterviewers = interviewersData?.interviewers ?? [];
  const realTestimonials = testimonialsData?.testimonials ?? [];

  // Use real testimonials if we have 3+, otherwise fall back to hardcoded
  const displayTestimonials =
    realTestimonials.length >= 3
      ? realTestimonials.slice(0, 3).map((t: any) => ({
          quote: t.reviewText,
          name: `${t.reviewerFirstName} ${t.reviewerLastName}`,
          role: "InterviewAce User",
          rating: t.rating,
        }))
      : FALLBACK_TESTIMONIALS;

  return (
    <div
      className={`${headingFont.variable} ${bodyFont.variable} min-h-screen bg-[linear-gradient(180deg,#fffaf2_0%,#f7fbff_45%,#ffffff_100%)] text-slate-900`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              IA
            </span>
            <span
              className="text-base font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              InterviewAce
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-slate-600 md:flex">
            <a href="#how" className="transition-colors hover:text-slate-900">How it works</a>
            <a href="#interviewers" className="transition-colors hover:text-slate-900">Interviewers</a>
            <a href="#pricing" className="transition-colors hover:text-slate-900">Pricing</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-28 top-16 h-72 w-72 rounded-full bg-orange-200/45 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-8 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-16 pt-14 md:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pt-20">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <Sparkles className="h-3.5 w-3.5" />
              Built for Sri Lankan job seekers
            </p>
            <h1
              className="text-4xl font-bold leading-[1.05] text-slate-950 md:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Practice interviews that feel real before the real one.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
              Train with verified professionals from top companies, get structured feedback, and
              turn interview anxiety into repeatable confidence.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-orange-600"
              >
                Find an interviewer
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register-interviewer"
                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-800 transition hover:border-slate-400"
              >
                Become an interviewer
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((item) => (
                <Star key={item} className="h-4 w-4 fill-current" />
              ))}
              <p className="ml-2 text-base font-medium text-slate-600">Loved by students and graduates across Sri Lanka</p>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.45)] md:p-6">
              <div className="rounded-2xl bg-slate-950 p-5 text-white md:p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Sample session flow</p>
                <div className="mt-5 space-y-4">
                  <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                    <p className="text-sm font-semibold">Technical round</p>
                    <p className="mt-1 text-sm text-slate-300">DSA and system-design pressure test</p>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                    <p className="text-sm font-semibold">Behavioral round</p>
                    <p className="mt-1 text-sm text-slate-300">Story framing with STAR technique</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {stats.slice(0, 2).map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                    <p className="mt-1 text-xs text-slate-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-slate-200 bg-white/80">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-4 px-4 py-8 md:grid-cols-4 md:px-6 lg:px-8">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-lg font-bold text-slate-900 md:text-xl">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-600 md:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">How it works</p>
          <h2
            className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            A simple loop to improve every week
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-semibold text-orange-600">Step 0{index + 1}</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-slate-950 py-16 text-slate-100 lg:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Why InterviewAce</p>
            <h2
              className="mt-2 text-3xl font-bold md:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Everything built around interview outcomes
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                  <div className="inline-flex rounded-lg bg-slate-800 p-2">
                    <Icon className="h-5 w-5 text-orange-300" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{feature.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Meet Our Interviewers (REAL DATA) ── */}
      {liveInterviewers.length > 0 && (
        <section id="interviewers" className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6 lg:px-8 lg:py-20">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Our Interviewers</p>
              <h2
                className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Verified professionals ready to help you
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                Every interviewer on our platform is manually verified. They bring real hiring experience from top companies.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
            >
              Browse all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {liveInterviewers.slice(0, 6).map((iv: any) => {
              const initials = `${iv.firstName?.[0] ?? ""}${iv.lastName?.[0] ?? ""}`.toUpperCase();
              const rating = parseFloat(iv.ratingAverage ?? "0");
              const expertise = iv.industryExpertise
                ? iv.industryExpertise.split(",").slice(0, 2).map((s: string) => s.trim())
                : [];

              return (
                <article
                  key={iv.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-orange-200 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700 select-none">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {iv.firstName} {iv.lastName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{iv.jobTitle}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Building2 className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        <p className="text-xs text-slate-500 truncate">{iv.currentCompany}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {expertise.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {expertise.map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-slate-800">
                        {rating > 0 ? rating.toFixed(1) : "New"}
                      </span>
                      {iv.totalInterviews > 0 && (
                        <span className="text-xs text-slate-400 ml-1">· {iv.totalInterviews} sessions</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-xs font-medium text-orange-600">Verified</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Book a session
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ── Testimonials (real DB data with hardcoded fallback) ── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Success stories</p>
          <h2
            className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Learners who converted practice into real offers
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {displayTestimonials.map((item, i) => (
            <article key={i} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex gap-1 text-amber-500">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-slate-700">"{item.quote}"</p>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="bg-slate-100 py-16 lg:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pricing</p>
            <h2
              className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Clear packages, no hidden fees
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-2xl border p-6 ${
                  plan.highlighted
                    ? "border-orange-400 bg-white shadow-[0_20px_45px_-35px_rgba(234,88,12,0.5)]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <p className="text-sm font-semibold text-slate-500">{plan.name}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{plan.price}</p>
                <p className="mt-1 text-sm text-slate-600">{plan.meta}</p>

                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {plan.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`mt-7 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    plan.highlighted
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-slate-900 text-white hover:bg-slate-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center md:p-12">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Clock3 className="h-3.5 w-3.5" />
            Start your first mock this week
          </p>
          <h2
            className="mt-4 text-3xl font-bold text-slate-950 md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Build confidence before your next interview window
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            Join InterviewAce and practice with professionals who understand the roles you are targeting.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register-interviewer"
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
            >
              Apply as interviewer
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 md:flex-row md:px-6 lg:px-8">
          <p>2026 InterviewAce. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-slate-800">Login</Link>
            <Link href="/register" className="hover:text-slate-800">Register</Link>
            <a href="#how" className="hover:text-slate-800">How it works</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
