import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

/**
 * Proxy all /api/[...path] requests to the Express backend.
 * This avoids browser cross-origin fetch issues (CORS, Safari "Load failed", etc.)
 * All requests flow: Browser → Next.js (same origin) → Express backend (server-to-server)
 */
async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const backendPath = path.join("/");
  const search = req.nextUrl.search || "";
  const backendUrl = `${BACKEND_URL}/api/${backendPath}${search}`;

  const headers = new Headers();

  // Forward authorization header
  const authHeader = req.headers.get("Authorization");
  if (authHeader) headers.set("Authorization", authHeader);

  // Forward content-type for POST/PUT/PATCH
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  // Forward cookie
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      body = await req.text();
    } catch {
      body = undefined;
    }
  }

  try {
    const response = await fetch(backendUrl, {
      method: req.method,
      headers,
      body,
      // Server-side fetch has no 30s browser timeout — rely on backend response
    });

    const responseBody = await response.text();
    const responseHeaders = new Headers();
    const contentTypeRes = response.headers.get("content-type");
    if (contentTypeRes) responseHeaders.set("content-type", contentTypeRes);

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[Proxy] Failed to reach backend at ${backendUrl}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BACKEND_UNREACHABLE",
          message:
            "The backend server is temporarily unavailable. Please try again in a moment.",
        },
      },
      { status: 503 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
