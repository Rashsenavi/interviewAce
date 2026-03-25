"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3, FileBadge2, ShieldCheck, Users } from "lucide-react";

type PendingInterviewer = {
  id: number;
  nicUrl?: string | null;
  appointmentLetterUrl?: string | null;
};

export default function AdminDashboardPage() {
  const [pendingInterviewers, setPendingInterviewers] = useState<PendingInterviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/verification/pending", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          const message = data?.error?.message || data?.message || "Failed to load admin metrics";
          throw new Error(message);
        }

        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data?.interviewers)) return data.interviewers;
        return [];
      })
      .then((rows: PendingInterviewer[]) => {
        setPendingInterviewers(rows);
        setError(null);
      })
      .catch((fetchError: unknown) => {
        const message = fetchError instanceof Error ? fetchError.message : "Failed to load admin metrics";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  const docsCompleteCount = useMemo(
    () => pendingInterviewers.filter((i) => Boolean(i.nicUrl) && Boolean(i.appointmentLetterUrl)).length,
    [pendingInterviewers]
  );

  const docsMissingCount = Math.max(0, pendingInterviewers.length - docsCompleteCount);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-cyan-50 via-white to-orange-50 p-6 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-12 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-16 h-48 w-48 rounded-full bg-orange-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Control Center</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Admin Operations Hub</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Monitor interviewer onboarding health and take action on pending verifications with confidence.
            </p>
          </div>

          <Link
            href="/admin/interviewers"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Review Verifications
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Pending Reviews"
          value={loading ? "..." : String(pendingInterviewers.length)}
          subtitle="Awaiting admin decision"
          icon={<Clock3 className="h-4 w-4" />}
          tone="amber"
        />
        <KpiCard
          title="Docs Complete"
          value={loading ? "..." : String(docsCompleteCount)}
          subtitle="NIC + appointment letter"
          icon={<FileBadge2 className="h-4 w-4" />}
          tone="emerald"
        />
        <KpiCard
          title="Docs Missing"
          value={loading ? "..." : String(docsMissingCount)}
          subtitle="Needs follow-up"
          icon={<ShieldCheck className="h-4 w-4" />}
          tone="rose"
        />
        <KpiCard
          title="Action Board"
          value="Live"
          subtitle="Verification queue online"
          icon={<Users className="h-4 w-4" />}
          tone="cyan"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ActionCard
          title="Interviewer Approvals"
          description="Open the queue, inspect documents, and approve or reject with immediate state updates."
          href="/admin/interviewers"
          cta="Open Queue"
        />
        <ActionCard
          title="Quality Target"
          description="Keep document completeness above 90% before approval to maintain interviewer onboarding standards."
          href="/admin/interviewers"
          cta="Review Missing Docs"
        />
      </section>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  tone,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: "amber" | "emerald" | "rose" | "cyan";
}) {
  const toneClasses: Record<typeof tone, string> = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
        <span className={`rounded-full border px-2 py-1 ${toneClasses[tone]}`}>{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
    </article>
  );
}

function ActionCard({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
