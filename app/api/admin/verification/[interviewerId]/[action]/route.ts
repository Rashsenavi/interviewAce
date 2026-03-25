import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ interviewerId: string; action: string }> }
) {
  const { interviewerId, action } = await params;
  const normalizedAction = action.toLowerCase();

  if (normalizedAction !== "approve" && normalizedAction !== "reject") {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_ACTION",
          message: "Action must be either approve or reject",
        },
      },
      { status: 400 }
    );
  }

  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BACKEND_URL_MISSING",
          message: "Backend URL is not configured",
        },
      },
      { status: 500 }
    );
  }

  const cookie = req.headers.get("cookie") || "";

  try {
    const res = await fetch(`${backendUrl}/api/admin/verification/${interviewerId}/${normalizedAction}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      credentials: "include",
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : {
          success: false,
          error: {
            code: "INVALID_BACKEND_RESPONSE",
            message: "Backend returned a non-JSON response",
          },
        };

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BACKEND_UNREACHABLE",
          message: "Unable to reach backend service",
        },
      },
      { status: 502 }
    );
  }
}
