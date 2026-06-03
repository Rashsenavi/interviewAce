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
      className={`${headingFont.variable} ${bodyFont.variable} landing-container`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* ── Header ── */}
      <header className="landing-header">
        <div className="landing-header-container landing-max-width">
          <Link href="/" className="landing-logo">
            <span className="landing-logo-badge">
              IA
            </span>
            <span
              className="landing-logo-text"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              InterviewAce
            </span>
          </Link>

          <nav className="landing-nav">
            <a href="#how" className="landing-nav-link">How it works</a>
            <a href="#interviewers" className="landing-nav-link">Interviewers</a>
            <a href="#pricing" className="landing-nav-link">Pricing</a>
          </nav>

          <div className="landing-header-actions">
            <Link href="/login" className="btn-secondary">
              Login
            </Link>
            <Link
              href="/register"
              className="btn-primary"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-glow-left" />
        <div className="hero-glow-right" />
        <div className="hero-container landing-max-width">
          <div>
            <p className="hero-badge">
              <Sparkles className="h-3.5 w-3.5" />
              Built for Sri Lankan job seekers
            </p>
            <h1
              className="hero-title"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Practice interviews that feel real before the real one.
            </h1>
            <p className="hero-description">
              Train with verified professionals from top companies, get structured feedback, and
              turn interview anxiety into repeatable confidence.
            </p>

            <div className="hero-buttons">
              <Link
                href="/register"
                className="btn-orange"
              >
                Find an interviewer
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register-interviewer"
                className="btn-outline"
              >
                Become an interviewer
              </Link>
            </div>

            <div className="hero-rating-row">
              {[1, 2, 3, 4, 5].map((item) => (
                <Star key={item} className="h-4 w-4 fill-current" />
              ))}
              <p className="hero-rating-text">Loved by students and graduates across Sri Lanka</p>
            </div>
          </div>

          <div className="hero-visual-wrapper">
            <div className="hero-visual-inner">
              <div className="hero-flow-box">
                <p className="hero-flow-label">Sample session flow</p>
                <div className="hero-flow-steps">
                  <div className="hero-flow-step">
                    <p className="hero-flow-step-title">Technical round</p>
                    <p className="hero-flow-step-desc">DSA and system-design pressure test</p>
                  </div>
                  <div className="hero-flow-step">
                    <p className="hero-flow-step-title">Behavioral round</p>
                    <p className="hero-flow-step-desc">Story framing with STAR technique</p>
                  </div>
                </div>
              </div>

              <div className="hero-stats-subgrid">
                {stats.slice(0, 2).map((stat) => (
                  <div key={stat.label} className="hero-stat-mini-card">
                    <p className="hero-stat-mini-value">{stat.value}</p>
                    <p className="hero-stat-mini-label">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="stats-bar-section">
        <div className="stats-bar-grid landing-max-width">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="how-section landing-max-width">
        <div className="section-header">
          <p className="section-badge">How it works</p>
          <h2
            className="section-title"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            A simple loop to improve every week
          </h2>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <article key={step.title} className="step-card">
              <p className="step-num">Step 0{index + 1}</p>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-text">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="features-section">
        <div className="landing-max-width">
          <div className="section-header">
            <p className="section-badge">Why InterviewAce</p>
            <h2
              className="section-title"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Everything built around interview outcomes
            </h2>
          </div>

          <div className="features-grid">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="feature-card">
                  <div className="feature-icon-box">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-text">{feature.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Meet Our Interviewers (REAL DATA) ── */}
      {liveInterviewers.length > 0 && (
        <section id="interviewers" className="interviewers-section landing-max-width">
          <div className="interviewers-header">
            <div className="interviewers-header-intro">
              <p className="section-badge">Our Interviewers</p>
              <h2
                className="section-title"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Verified professionals ready to help you
              </h2>
              <p className="desc">
                Every interviewer on our platform is manually verified. They bring real hiring experience from top companies.
              </p>
            </div>
            <Link
              href="/register"
              className="btn-browse-all"
            >
              Browse all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="interviewers-grid">
            {liveInterviewers.slice(0, 6).map((iv: any) => {
              const initials = `${iv.firstName?.[0] ?? ""}${iv.lastName?.[0] ?? ""}`.toUpperCase();
              const rating = parseFloat(iv.ratingAverage ?? "0");
              const expertise = iv.industryExpertise
                ? iv.industryExpertise.split(",").slice(0, 2).map((s: string) => s.trim())
                : [];

              return (
                <article
                  key={iv.id}
                  className="interviewer-card"
                >
                  <div className="interviewer-top">
                    {/* Avatar */}
                    <div className="interviewer-avatar">
                      {initials}
                    </div>
                    <div className="interviewer-meta">
                      <p className="interviewer-name">
                        {iv.firstName} {iv.lastName}
                      </p>
                      <p className="interviewer-title">{iv.jobTitle}</p>
                      <div className="interviewer-company-row">
                        <Building2 className="h-3 w-3 flex-shrink-0" />
                        <p className="interviewer-company-text">{iv.currentCompany}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {expertise.length > 0 && (
                    <div className="interviewer-tags">
                      {expertise.map((tag: string) => (
                        <span
                          key={tag}
                          className="interviewer-tag"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="interviewer-footer">
                    <div className="interviewer-rating">
                      <Star className="h-3.5 w-3.5" />
                      <span className="interviewer-rating-val">
                        {rating > 0 ? rating.toFixed(1) : "New"}
                      </span>
                      {iv.totalInterviews > 0 && (
                        <span className="interviewer-sessions-val">· {iv.totalInterviews} sessions</span>
                      )}
                    </div>
                    <div className="interviewer-verified">
                      <Award className="h-3.5 w-3.5" />
                      <span className="interviewer-verified-text">Verified</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="interviewers-book-bar">
            <Link
              href="/register"
              className="btn-orange"
            >
              Book a session
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ── Testimonials (real DB data with hardcoded fallback) ── */}
      <section className="testimonials-section landing-max-width">
        <div className="section-header">
          <p className="section-badge">Success stories</p>
          <h2
            className="section-title"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Learners who converted practice into real offers
          </h2>
        </div>

        <div className="testimonials-grid">
          {displayTestimonials.map((item, i) => (
            <article key={i} className="testimonial-card">
              <div className="testimonial-stars">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="testimonial-quote">"{item.quote}"</p>
              <div className="testimonial-author">
                <p className="testimonial-author-name">{item.name}</p>
                <p className="testimonial-author-role">{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="pricing-section">
        <div className="landing-max-width">
          <div className="section-header">
            <p className="section-badge">Pricing</p>
            <h2
              className="section-title"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Clear packages, no hidden fees
            </h2>
          </div>

          <div className="pricing-grid">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={plan.highlighted ? "pricing-card-highlighted" : "pricing-card"}
              >
                <p className="pricing-name">{plan.name}</p>
                <p className="pricing-price">{plan.price}</p>
                <p className="pricing-meta">{plan.meta}</p>

                <ul className="pricing-points">
                  {plan.points.map((point) => (
                    <li key={point} className="pricing-point-item">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="pricing-cta"
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section landing-max-width">
        <div className="cta-card">
          <p className="cta-badge">
            <Clock3 className="h-3.5 w-3.5" />
            Start your first mock this week
          </p>
          <h2
            className="cta-title"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Build confidence before your next interview window
          </h2>
          <p className="cta-description">
            Join InterviewAce and practice with professionals who understand the roles you are targeting.
          </p>

          <div className="cta-buttons">
            <Link
              href="/register"
              className="btn-cta-primary"
            >
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register-interviewer"
              className="btn-cta-secondary"
            >
              Apply as interviewer
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-container landing-max-width">
          <p className="footer-copy">2026 InterviewAce. All rights reserved.</p>
          <div className="footer-links">
            <Link href="/login" className="footer-link">Login</Link>
            <Link href="/register" className="footer-link">Register</Link>
            <a href="#how" className="footer-link">How it works</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
