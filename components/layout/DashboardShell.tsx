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
  Menu,
  X,
  LogOut,
  Building2,
  Shield,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { cn } from "@/lib/utils";

type AppRole = "admin" | "interviewer" | "job_seeker";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
};

type NavGroup = {
  groupLabel?: string;
  items: NavItem[];
};

interface DashboardShellProps {
  role: AppRole;
  children: React.ReactNode;
}

const roleConfig: Record<
  AppRole,
  {
    title: string;
    accentColor: string;   // Used for active border and icon
    accentBg: string;      // Subtle active background
    groups: NavGroup[];
  }
> = {
  admin: {
    title: "Admin",
    accentColor: "text-slate-900",
    accentBg: "bg-slate-100",
    groups: [
      {
        groupLabel: "OVERVIEW",
        items: [
          { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        ],
      },
      {
        groupLabel: "MANAGEMENT",
        items: [
          { label: "Users", href: "/admin/users", icon: Users },
          { label: "Verifications", href: "/admin/interviewers", icon: Shield },
          { label: "Payouts", href: "/admin/payouts", icon: DollarSign },
        ],
      },
      {
        groupLabel: "MODERATION",
        items: [
          { label: "Support Inbox", href: "/admin/support", icon: MessageSquare },
          { label: "Videos", href: "/admin/videos", icon: Video },
          { label: "Question Review", href: "/admin/questions", icon: HelpCircle },
        ],
      },
    ],
  },
  interviewer: {
    title: "Interviewer",
    accentColor: "text-orange-600",
    accentBg: "bg-orange-50",
    groups: [
      {
        groupLabel: "MAIN",
        items: [
          { label: "Dashboard", href: "/interviewer", icon: LayoutDashboard },
          { label: "Sessions", href: "/interviewer/sessions", icon: Video },
          { label: "Schedule", href: "/interviewer/schedule", icon: Calendar },
        ],
      },
      {
        groupLabel: "FINANCES",
        items: [
          { label: "Earnings", href: "/interviewer/earnings", icon: DollarSign },
        ],
      },
      {
        groupLabel: "RESOURCES",
        items: [
          { label: "Question Bank", href: "/interviewer/questions", icon: BookOpen },
          { label: "Feedback", href: "/interviewer/feedback", icon: MessageSquare },
        ],
      },
      {
        groupLabel: "ACCOUNT",
        items: [
          { label: "Settings", href: "/interviewer/profile", icon: Settings },
          { label: "Support", href: "/interviewer/support", icon: HelpCircle },
        ],
      },
    ],
  },
  job_seeker: {
    title: "Job Seeker",
    accentColor: "text-orange-600",
    accentBg: "bg-orange-50",
    groups: [
      {
        groupLabel: "MAIN",
        items: [
          { label: "Dashboard", href: "/job-seeker", icon: LayoutDashboard },
          { label: "Find Interviewers", href: "/job-seeker/interviewers", icon: Search },
          { label: "Sessions", href: "/job-seeker/sessions", icon: Calendar },
        ],
      },
      {
        groupLabel: "LEARNING",
        items: [
          { label: "Question Bank", href: "/job-seeker/questions", icon: BookOpen },
          { label: "Videos", href: "/job-seeker/videos", icon: Video },
          { label: "Feedback", href: "/job-seeker/feedback", icon: MessageSquare },
        ],
      },
      {
        groupLabel: "ACCOUNT",
        items: [
          { label: "Payments", href: "/job-seeker/payments", icon: DollarSign },
          { label: "Settings", href: "/job-seeker/settings", icon: Settings },
          { label: "Support", href: "/job-seeker/support", icon: HelpCircle },
        ],
      },
    ],
  },
};

function isActivePath(pathname: string, href: string): boolean {
  const dashboardRoots = ["/admin", "/interviewer", "/job-seeker"];
  if (dashboardRoots.includes(href)) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({
  item,
  active,
  accentColor,
  accentBg,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  accentColor: string;
  accentBg: string;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 relative",
        active
          ? cn("font-semibold border-l-2 pl-[10px] border-orange-500", accentBg, accentColor)
          : "font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-l-2 border-transparent pl-[10px]"
      )}
    >
      <Icon
        className={cn(
          "h-[17px] w-[17px] flex-shrink-0 transition-colors",
          active ? accentColor : "text-slate-400 group-hover:text-slate-600"
        )}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function SidebarContent({
  config,
  pathname,
  user,
  userInitials,
  userDisplayName,
  onLogout,
  onNavClick,
}: {
  config: (typeof roleConfig)[AppRole];
  pathname: string;
  user: any;
  userInitials: string;
  userDisplayName: string;
  onLogout: () => void;
  onNavClick?: () => void;
}) {
  const { groups, accentColor, accentBg, title } = config;

  // For interviewers, filter out non-dashboard items if not verified
  const shouldShowAll = !(user?.userType === "interviewer" && !user?.isVerified);

  return (
    <div className="flex h-full flex-col bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-slate-100 flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white flex-shrink-0">
          IA
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">InterviewAce</p>
          <p className="text-[11px] text-slate-400 font-medium">{title} Portal</p>
        </div>
      </div>

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {groups.map((group) => {
          const visibleItems = shouldShowAll
            ? group.items
            : group.items.filter((item) => {
                const root = `/${user?.userType === "interviewer" ? "interviewer" : "job-seeker"}`;
                return item.href === root || item.href === "/interviewer/profile";
              });

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.groupLabel ?? "default"}>
              {group.groupLabel && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest uppercase text-slate-400 select-none">
                  {group.groupLabel}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={isActivePath(pathname, item.href)}
                    accentColor={accentColor}
                    accentBg={accentBg}
                    onClick={onNavClick}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* User Account Card at bottom */}
      <div className="flex-shrink-0 border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
          {/* Avatar */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 flex-shrink-0 select-none">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{userDisplayName}</p>
            <p className="text-[11px] text-slate-400 capitalize truncate leading-tight">{title}</p>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardShell({ role, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const config = roleConfig[role];

  const pageTitle = useMemo(() => {
    const allItems = config.groups.flatMap((g) => g.items);
    const exact = allItems.find((item) => item.href === pathname);
    if (exact) return exact.label;
    // Find longest matching prefix
    const matched = allItems
      .filter((item) => pathname.startsWith(item.href + "/") || pathname === item.href)
      .sort((a, b) => b.href.length - a.href.length)[0];
    return matched?.label ?? config.title;
  }, [config, pathname]);

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

  const sharedProps = {
    config,
    pathname,
    user,
    userInitials,
    userDisplayName,
    onLogout: handleLogout,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* Desktop sidebar — always expanded, never collapses */}
        <aside className="hidden w-60 lg:block flex-shrink-0">
          <div className="fixed top-0 left-0 h-screen w-60 z-20">
            <SidebarContent {...sharedProps} />
          </div>
        </aside>

        {/* Mobile: overlay + slide drawer */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden shadow-xl">
              <SidebarContent
                {...sharedProps}
                onNavClick={() => setMobileOpen(false)}
              />
            </aside>
          </>
        )}

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top header bar */}
          <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden transition-colors"
              aria-label="Toggle sidebar"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
                {config.title} Portal
              </p>
              <h1 className="text-lg font-semibold text-slate-900 truncate leading-tight">
                {pageTitle}
              </h1>
            </div>

            {/* User chip — desktop only */}
            <div className="hidden md:flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 select-none">
                {userInitials}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{userDisplayName}</p>
                <p className="text-[11px] text-slate-400 capitalize leading-tight">{config.title}</p>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}