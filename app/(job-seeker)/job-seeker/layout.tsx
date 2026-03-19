import React from "react";
import DashboardShell from "@/components/layout/DashboardShell";

export default function JobSeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="job_seeker">{children}</DashboardShell>;
}
