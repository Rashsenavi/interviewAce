"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";

export default function InterviewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (isLoading) return;

      if (!user) {
        router.replace("/login");
        return;
      }

      if (user.userType !== "interviewer") {
        router.replace("/");
        return;
      }

      const response = await apiClient.get<{ profile: { isVerified: boolean; verificationStatus: string } }>(
        "/interviewers/profile"
      );

      if (!response.success || !response.data?.profile) {
        router.replace("/login");
        return;
      }

      const profile = response.data.profile;
      const approved = Boolean(profile.isVerified) && profile.verificationStatus === "approved";

      setIsVerified(approved);

      if (!approved && pathname !== "/interviewer/verification-pending") {
        router.replace("/interviewer/verification-pending");
        return;
      }

      if (approved && pathname === "/interviewer/verification-pending") {
        router.replace("/interviewer");
        return;
      }

      setIsCheckingAccess(false);
    };

    checkAccess();
  }, [isLoading, pathname, router, user]);

  if (isLoading || isCheckingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-600">Checking account access...</p>
      </div>
    );
  }

  if (pathname === "/interviewer/verification-pending") {
    return <>{children}</>;
  }

  if (!isVerified) {
    return null;
  }

  return <DashboardShell role="interviewer">{children}</DashboardShell>;
}
