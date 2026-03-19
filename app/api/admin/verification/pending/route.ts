import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log('DEBUG BACKEND_URL:', process.env.BACKEND_URL);
  const cookie = req.headers.get("cookie") || "";
  const res = await fetch(`${process.env.BACKEND_URL}/api/admin/verification/pending`, {
    headers: {
      "Content-Type": "application/json",
      "cookie": cookie,
    },
    credentials: "include",
  });
  const data = await res.json();
  return NextResponse.json(data);
}
