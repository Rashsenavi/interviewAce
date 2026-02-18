import React from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-white border-r border-gray-200 px-6 py-8">
          <div className="text-xl font-bold text-gray-900 mb-8">Admin Dashboard</div>
          <nav className="space-y-3 text-sm font-medium">
            <Link className="block text-gray-700 hover:text-blue-600" href="/admin">
              Overview
            </Link>
            <Link className="block text-gray-700 hover:text-blue-600" href="/admin/users">
              Users
            </Link>
            <Link className="block text-gray-700 hover:text-blue-600" href="/admin/interviewers">
              Interviewers
            </Link>
            <Link className="block text-gray-700 hover:text-blue-600" href="/admin/payments">
              Payments
            </Link>
            <Link className="block text-gray-700 hover:text-blue-600" href="/admin/settings">
              Settings
            </Link>
          </nav>
        </aside>
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
