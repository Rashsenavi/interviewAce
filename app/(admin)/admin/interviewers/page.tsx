"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock3, FileBadge2, Search, XCircle } from "lucide-react";

interface Interviewer {
  id: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email: string;
  verificationStatus: string;
  nicUrl?: string;
  appointmentLetterUrl?: string;
  linkedinProfile?: string;
}

interface ApiErrorResponse {
  success?: boolean;
  error?: {
    message?: string;
  };
  message?: string;
}

const getErrorMessage = (payload: ApiErrorResponse, fallback: string) => {
  return payload.error?.message || payload.message || fallback;
};

const normalizeInterviewer = (item: Interviewer): Interviewer => {
  const derivedName = `${item.firstName || ""} ${item.lastName || ""}`.trim();

  return {
    ...item,
    fullName: item.fullName || derivedName || "Unnamed interviewer",
  };
};

export default function InterviewersPage() {
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/verification/pending", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(getErrorMessage(data, "Failed to load pending interviewers"));
        }

        return data;
      })
      .then((data) => {
        setError(null);

        if (Array.isArray(data)) {
          setInterviewers(data.map(normalizeInterviewer));
        } else if (data && Array.isArray(data.interviewers)) {
          setInterviewers(data.interviewers.map(normalizeInterviewer));
        } else if (data && Array.isArray(data.data)) {
          setInterviewers(data.data.map(normalizeInterviewer));
        } else {
          setInterviewers([]);
        }
      })
      .catch((fetchError: unknown) => {
        const fallbackMessage = "Failed to load pending interviewers";
        const message = fetchError instanceof Error ? fetchError.message : fallbackMessage;
        setError(message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredInterviewers = interviewers.filter((item) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;

    return (
      item.fullName.toLowerCase().includes(normalizedQuery) ||
      item.email.toLowerCase().includes(normalizedQuery)
    );
  });

  const docsCompleteCount = interviewers.filter(
    (item) => Boolean(item.nicUrl) && Boolean(item.appointmentLetterUrl)
  ).length;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-cyan-50 via-white to-amber-50 p-6 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-8 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Admin Console</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              Interviewer Verification Desk
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Review professional documents, approve qualified interviewers, and keep onboarding quality high.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MetricCard label="Pending" value={String(interviewers.length)} icon={<Clock3 className="h-4 w-4" />} />
            <MetricCard label="Docs Complete" value={String(docsCompleteCount)} icon={<FileBadge2 className="h-4 w-4" />} />
            <MetricCard
              label="Filtered"
              value={String(filteredInterviewers.length)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100"
          />
        </div>

        {notice ? (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {notice}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-4 space-y-3">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : filteredInterviewers.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-600">
            No pending interviewers match your search.
          </div>
        ) : (
          <>
            <div className="mt-4 hidden overflow-hidden rounded-xl border border-slate-200 md:block">
              <table className="min-w-full bg-white">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Candidate</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Documents</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterviewers.map((i) => (
                    <tr key={i.id} className="border-t border-slate-100 align-top">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">{i.fullName}</p>
                        <p className="text-sm text-slate-600">{i.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          Pending Review
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2 text-sm">
                          {i.nicUrl ? (
                            <a
                              href={i.nicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-cyan-700 hover:text-cyan-800"
                            >
                              View NIC
                            </a>
                          ) : (
                            <span className="text-slate-400">NIC missing</span>
                          )}
                          {i.appointmentLetterUrl ? (
                            <a
                              href={i.appointmentLetterUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-cyan-700 hover:text-cyan-800"
                            >
                              View Appointment Letter
                            </a>
                          ) : (
                            <span className="text-slate-400">Appointment letter missing</span>
                          )}
                          {i.linkedinProfile ? (
                            <a
                              href={i.linkedinProfile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:text-blue-700"
                            >
                              View LinkedIn Profile
                            </a>
                          ) : (
                            <span className="text-slate-400">LinkedIn Profile missing</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <ApproveRejectButtons
                          interviewerId={i.id}
                          onAction={(action) => {
                            setInterviewers((prev) => prev.filter((x) => x.id !== i.id));
                            setNotice(`${i.fullName} ${action === "approve" ? "approved" : "rejected"} successfully.`);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid gap-3 md:hidden">
              {filteredInterviewers.map((i) => (
                <article key={i.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{i.fullName}</p>
                      <p className="text-sm text-slate-600">{i.email}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      Pending
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    {i.nicUrl ? (
                      <a
                        href={i.nicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1.5 font-medium text-cyan-700"
                      >
                        NIC
                      </a>
                    ) : (
                      <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-500">NIC missing</span>
                    )}
                    {i.appointmentLetterUrl ? (
                      <a
                        href={i.appointmentLetterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1.5 font-medium text-cyan-700"
                      >
                        Appointment Letter
                      </a>
                    ) : (
                      <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-500">
                        Appointment missing
                      </span>
                    )}
                    {i.linkedinProfile ? (
                      <a
                        href={i.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 font-medium text-blue-700"
                      >
                        LinkedIn
                      </a>
                    ) : (
                      <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-500">
                        LinkedIn missing
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <ApproveRejectButtons
                      interviewerId={i.id}
                      onAction={(action) => {
                        setInterviewers((prev) => prev.filter((x) => x.id !== i.id));
                        setNotice(`${i.fullName} ${action === "approve" ? "approved" : "rejected"} successfully.`);
                      }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <span className="text-slate-500">{icon}</span>
      </div>
      <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function SkeletonRow() {
  return <div className="h-14 animate-pulse rounded-xl bg-slate-100" />;
}

function ApproveRejectButtons({
  interviewerId,
  onAction,
}: {
  interviewerId: number;
  onAction: (action: "approve" | "reject") => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleAction = async (action: "approve" | "reject", notes?: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/verification/${interviewerId}/${action}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notes ? { notes } : {}),
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(getErrorMessage(data, `Failed to ${action} interviewer`));
      }

      onAction(action);
      setIsRejectModalOpen(false);
    } catch (actionError: unknown) {
      const fallbackMessage = `Failed to ${action} interviewer`;
      const message = actionError instanceof Error ? actionError.message : fallbackMessage;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          disabled={loading}
          onClick={() => handleAction("approve")}
        >
          <CheckCircle2 className="h-4 w-4" />
          Approve
        </button>
        <button
          className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
          disabled={loading}
          onClick={() => setIsRejectModalOpen(true)}
        >
          <XCircle className="h-4 w-4" />
          Reject
        </button>
      </div>

      {error && !isRejectModalOpen && <p className="text-xs text-red-600 mt-2">{error}</p>}

      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Reject Verification</h3>
            <p className="mt-2 text-sm text-slate-600">
              Please provide a reason for rejecting this interviewer's documents. They will see this message.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., NIC image is blurry, please re-upload."
              className="mt-4 h-24 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction("reject", rejectReason)}
                disabled={loading || !rejectReason.trim()}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {loading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

