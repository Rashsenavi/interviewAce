"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Ban, CheckCircle, Trash2, Search, Users, ShieldAlert } from "lucide-react";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: "job_seeker" | "interviewer" | "admin";
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  
  // Action states
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data.data);
      } else {
        throw new Error(response.error?.message || "Failed to fetch users");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? "suspend" : "activate"} this user?`)) return;
    
    setActionLoading(userId);
    setActionError(null);
    try {
      const response = await adminApi.updateUserStatus(userId, !currentStatus);
      if (response.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
      } else {
        throw new Error(response.error?.message || "Failed to update status");
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to completely DELETE this user? This action cannot be undone.")) return;
    
    setActionLoading(userId);
    setActionError(null);
    try {
      const response = await adminApi.deleteUser(userId);
      if (response.success) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        throw new Error(response.error?.message || "Failed to delete user");
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === "all" || user.userType === filterRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 md:p-8">
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Admin Console</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              User Management
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              View, edit, suspend, or delete user accounts to maintain platform quality and handle violations.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/80 p-3 rounded-2xl shadow-sm border border-slate-100 backdrop-blur-md">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Users</span>
              <span className="text-xl font-black text-slate-900">{users.length}</span>
            </div>
            <Users className="h-8 w-8 text-indigo-500 opacity-50" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="job_seeker">Job Seekers</option>
            <option value="interviewer">Interviewers</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {error ? (
          <div className="p-8 text-center text-red-600 flex flex-col items-center">
            <ShieldAlert className="h-12 w-12 text-red-400 mb-3 opacity-50" />
            <p className="font-semibold">{error}</p>
            <button onClick={fetchUsers} className="mt-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition">Retry</button>
          </div>
        ) : loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p>No users found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {actionError && (
               <div className="bg-red-50 text-red-600 px-6 py-3 text-sm font-medium border-b border-red-100 flex items-center justify-between">
                 <span>{actionError}</span>
                 <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-800">×</button>
               </div>
            )}
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white border-b border-slate-100 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${!user.isActive ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                        {user.userType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-red-600 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.isActive)}
                          disabled={actionLoading === user.id}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isActive 
                              ? 'text-amber-600 hover:bg-amber-50' 
                              : 'text-emerald-600 hover:bg-emerald-50'
                          } disabled:opacity-50`}
                          title={user.isActive ? "Suspend User" : "Activate User"}
                        >
                          {user.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={actionLoading === user.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
