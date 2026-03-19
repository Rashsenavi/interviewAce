"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Interviewer {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  verificationStatus: string;
  nicUrl?: string;
  appointmentLetterUrl?: string;
}

export default function InterviewersPage() {
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/verification/pending")
      .then((res) => res.json())
      .then((data) => {
        console.log("API data:", data);
        // Defensive: if data is array, use as is; if object with interviewers, use that; else empty array
        if (Array.isArray(data)) {
          setInterviewers(data);
        } else if (data && Array.isArray(data.interviewers)) {
          setInterviewers(data.interviewers);
        } else {
          setInterviewers([]);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pending Interviewer Approvals</h1>
      {loading ? (
        <div>Loading...</div>
      ) : interviewers.length === 0 ? (
        <div>No pending interviewers.</div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">NIC</th>
              <th className="px-4 py-2 border">Appointment Letter</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {interviewers.map((i) => (
              <tr key={i.id}>
                <td className="border px-4 py-2">{i.fullName}</td>
                <td className="border px-4 py-2">{i.email}</td>
                <td className="border px-4 py-2">
                  {i.nicUrl ? (
                    <a href={i.nicUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border px-4 py-2">
                  {i.appointmentLetterUrl ? (
                    <a href={i.appointmentLetterUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border px-4 py-2 space-x-2">
                  <ApproveRejectButtons interviewerId={i.id} onAction={() => {
                    setInterviewers((prev) => prev.filter((x) => x.id !== i.id));
                  }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ApproveRejectButtons({ interviewerId, onAction }: { interviewerId: number; onAction: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(true);
    await fetch(`/api/admin/verification/${interviewerId}/${action}`, { method: "PUT" });
    setLoading(false);
    onAction();
  };

  return (
    <>
      <button
        className="bg-green-500 text-white px-3 py-1 rounded disabled:opacity-50"
        disabled={loading}
        onClick={() => handleAction("approve")}
      >
        Approve
      </button>
      <button
        className="bg-red-500 text-white px-3 py-1 rounded ml-2 disabled:opacity-50"
        disabled={loading}
        onClick={() => handleAction("reject")}
      >
        Reject
      </button>
    </>
  );
}
