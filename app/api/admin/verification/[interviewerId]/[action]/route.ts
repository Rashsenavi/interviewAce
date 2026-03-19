import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { interviewerId: string; action: string } }) {
  console.log('DEBUG BACKEND_URL:', process.env.BACKEND_URL);
  const { interviewerId, action } = params;
  const res = await fetch(`${process.env.BACKEND_URL}/api/admin/verification/${interviewerId}/${action}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  const data = await res.json();
  return NextResponse.json(data);
}
