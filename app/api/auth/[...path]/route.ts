import { NextRequest, NextResponse } from "next/server";

const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

function getBackendApiBaseUrl(): string {
  const baseUrl =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001/api";

  if (!ABSOLUTE_URL_REGEX.test(baseUrl)) {
    throw new Error(
      "BACKEND_API_URL (or NEXT_PUBLIC_API_URL fallback) must be an absolute URL, e.g. https://api.example.com/api"
    );
  }

  return baseUrl.replace(/\/$/, "");
}

function getForwardHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers);

  // Prevent incorrect upstream host/content-length values.
  headers.delete("host");
  headers.delete("content-length");

  return headers;
}

async function proxyAuthRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  try {
    const { path } = await context.params;
    const backendBaseUrl = getBackendApiBaseUrl();
    const suffix = (path || []).join("/");
    const search = request.nextUrl.search || "";
    const targetUrl = `${backendBaseUrl}/auth/${suffix}${search}`;

    const body = ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.text();

    const upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers: getForwardHeaders(request),
      body,
      redirect: "manual",
    });

    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.delete("content-encoding");

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "AUTH_PROXY_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to proxy auth request",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyAuthRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyAuthRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyAuthRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyAuthRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyAuthRequest(request, context);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyAuthRequest(request, context);
}
