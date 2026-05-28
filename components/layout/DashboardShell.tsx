"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  DollarSign,
  Settings,
  Search,
  HelpCircle,
  Video,
  BarChart3,
  Menu,
  X,
  LogOut,
  Building2,
  Shield,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

type AppRole = "admin" | "interviewer" | "job_seeker";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

interface DashboardShellProps {
  role: AppRole;
  children: React.ReactNode;
}

const roleConfig: Record<
  AppRole,
  { title: string; accent: string; badge: string; items: NavItem[] }
> = {
  admin: {
    title: "Admin",
    accent: "text-indigo-700",
    badge: "bg-indigo-50 text-indigo-700",
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard },
      { label: "User Management", href: "/admin/users", icon: Users },
      { label: "Verifications", href: "/admin/interviewers", icon: Shield },
      { label: "Payouts", href: "/admin/payouts", icon: DollarSign },
      { label: "Support Inbox", href: "/admin/support", icon: MessageSquare },
      { label: "Video Moderation", href: "/admin/videos", icon: Video },
    ],
  },
  interviewer: {
    title: "Interviewer",
    accent: "text-teal-700",
    badge: "bg-teal-50 text-teal-700",
    items: [
      { label: "Dashboard", href: "/interviewer", icon: LayoutDashboard },
      { label: "Schedule", href: "/interviewer/schedule", icon: Calendar },
      { label: "Sessions", href: "/interviewer/sessions", icon: Video },
      { label: "Earnings", href: "/interviewer/earnings", icon: DollarSign },
      { label: "Feedback", href: "/interviewer/feedback", icon: MessageSquare },
      { label: "Support", href: "/interviewer/support", icon: HelpCircle },
    ],
  },
  job_seeker: {
    title: "Job Seeker",
    accent: "text-blue-700",
    badge: "bg-blue-50 text-blue-700",
    items: [
      { label: "Dashboard", href: "/job-seeker", icon: LayoutDashboard },
      { label: "Interviewers", href: "/job-seeker/interviewers", icon: Search },
      { label: "Sessions", href: "/job-seeker/sessions", icon: Calendar },
      { label: "Payments", href: "/job-seeker/payments", icon: DollarSign },
      { label: "Feedback", href: "/job-seeker/feedback", icon: MessageSquare },
      { label: "Questions", href: "/job-seeker/questions", icon: HelpCircle },
      { label: "Videos", href: "/job-seeker/videos", icon: Video },
      { label: "Settings", href: "/job-seeker/settings", icon: Settings },
      { label: "Support", href: "/job-seeker/support", icon: MessageSquare },
    ],
  },
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/admin" || href === "/interviewer" || href === "/job-seeker") {
    return pathname === href;
  }
  return pathname.startsWith(href);
}

export default function DashboardShell({ role, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const config = roleConfig[role];

  const pageTitle = useMemo(() => {
    const exact = config.items.find((item) => item.href === pathname);
    if (exact) return exact.label;
    const top = config.items.find((item) => pathname.startsWith(item.href));
    return top?.label || config.title;
  }, [config.items, config.title, pathname]);

  const userInitials = useMemo(() => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) return user.firstName[0].toUpperCase();
    return "IA";
  }, [user]);

  const userDisplayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : "Account";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const SidebarNav = (
    <nav className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">InterviewAce</p>
            <p className={`text-xs font-medium ${config.accent}`}>{config.title} Portal</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 space-y-1 px-3 py-4">
        {config.items.filter((item) => {
          if (role === "interviewer") {
            if (!user?.isVerified && item.href !== "/interviewer") {
              return false;
            }
          }
          return true;
        }).map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="border-t border-gray-200 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-gray-200 bg-white lg:block">{SidebarNav}</aside>

        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-gray-200 bg-white lg:hidden">
              {SidebarNav}
            </aside>
          </>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
            <div className="flex h-16 items-center gap-3 px-4 md:px-6">
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 lg:hidden"
                aria-label="Toggle sidebar"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">Dashboard</p>
                <h1 className="truncate text-lg font-semibold text-gray-900">{pageTitle}</h1>
              </div>

              <span className={`hidden rounded-full px-3 py-1 text-xs font-semibold md:inline ${config.badge}`}>
                {config.title}
              </span>

              <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-2 py-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                  {userInitials}
                </div>
                <div className="hidden pr-2 md:block">
                  <p className="text-sm font-medium text-gray-900">{userDisplayName}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}