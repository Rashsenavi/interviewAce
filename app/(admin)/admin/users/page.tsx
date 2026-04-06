"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, UserCheck, UserX, Users } from "lucide-react";
import { apiClient } from "@/lib/api/client";

type UserRow = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userType: "job_seeker" | "interviewer" | "admin";
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type UsersResponse = {
  users: UserRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [querySearch, setQuerySearch] = useState("");
  const [userType, setUserType] = useState<"all" | "job_seeker" | "interviewer">("all");
  const [status, setStatus] = useState<"all" | "active" | "suspended">("all");

  const [page, setPage] = useState(1);
  const limit = 20;
  const [pagination, setPagination] = useState<UsersResponse["pagination"]>({
    page: 1,
    limit,
    total: 0,
    hasNext: false,
  });

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));

      if (querySearch.trim()) {
        params.set("search", querySearch.trim());
      }
      if (userType !== "all") {
        params.set("userType", userType);
      }
      if (status === "active") {
        params.set("isActive", "true");
      }
      if (status === "suspended") {
        params.set("isActive", "false");
      }

      const data = await apiClient.get<any>(`/admin/users?${params.toString()}`);

      if (!data?.success) {
        throw new Error(data?.error?.message || "Failed to load users");
      }

      setUsers(data.data.users || []);
      setPagination(data.data.pagination || { page: 1, limit, total: 0, hasNext: false });
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Failed to load users";
      setError(message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [page, querySearch, userType, status]);

  const activeCount = useMemo(() => users.filter((u) => u.isActive).length, [users]);
  const suspendedCount = Math.max(0, users.length - activeCount);

  const toggleUserStatus = async (user: UserRow) => {
    setActionLoadingId(user.id);
    setError(null);

    try {
      const data = await apiClient.put<any>(`/admin/users/${user.id}/status`, {
        isActive: !user.isActive,
      });

      if (!data?.success) {
        throw new Error(data?.error?.message || "Failed to update user status");
      }

      setUsers((prev) =>
        prev.map((row) => (row.id === user.id ? { ...row, isActive: !row.isActive } : row))
      );
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : "Failed to update user";
      setError(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setQuerySearch(search);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">User Management</h2>
        <p className="mt-1 text-sm text-slate-600">
          Manage active and suspended users across job seekers and interviewers.
        </p>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Visible Users" value={loading ? "..." : String(users.length)} icon={<Users className="h-4 w-4" />} />
        <StatCard title="Active" value={loading ? "..." : String(activeCount)} icon={<UserCheck className="h-4 w-4" />} />
        <StatCard title="Suspended" value={loading ? "..." : String(suspendedCount)} icon={<UserX className="h-4 w-4" />} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Search
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email"
                className="w-full bg-transparent text-sm outline-none"
              />
              <button
                onClick={handleSearch}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Apply
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              User Type
            </label>
            <select
              value={userType}
              onChange={(e) => {
                setPage(1);
                setUserType(e.target.value as "all" | "job_seeker" | "interviewer");
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="job_seeker">Job Seekers</option>
              <option value="interviewer">Interviewers</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value as "all" | "active" | "suspended");
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-sm text-slate-500">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-sm text-slate-500">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{user.fullName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{user.userType.replace("_", " ")}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {user.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        disabled={actionLoadingId === user.id}
                        onClick={() => toggleUserStatus(user)}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${
                          user.isActive ? "bg-rose-600 hover:bg-rose-500" : "bg-emerald-600 hover:bg-emerald-500"
                        } disabled:opacity-60`}
                      >
                        {actionLoadingId === user.id
                          ? "Saving..."
                          : user.isActive
                          ? "Suspend"
                          : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500">Total: {pagination.total}</p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="rounded border border-slate-300 px-3 py-1.5 text-xs disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-slate-600">Page {page}</span>
            <button
              disabled={!pagination.hasNext}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded border border-slate-300 px-3 py-1.5 text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
        <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-cyan-700">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{value}</p>
    </article>
  );
}
