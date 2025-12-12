import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import api from "@/lib/axios";

type ConfirmResponse = {
  status: string | null;
  plan: string | null;
  entitled: boolean;
  entitlement_expires_at: string | null;
  last_event_id: string | null;
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let sessionId: string | null = null;
  try {
    const payload = await request.json();
    if (payload?.session_id && typeof payload.session_id === "string") {
      sessionId = payload.session_id;
    }
  } catch {
    // ignore body parse errors
  }

  if (!sessionId) {
    return NextResponse.json({ error: "Missing checkout session id." }, { status: 400 });
  }

  try {
    const { data } = await api.post<ConfirmResponse>(
      "/billing/confirm",
      { session_id: sessionId },
      {
        headers: {
          "X-User-Id": userId,
        },
      },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Failed to confirm checkout session", error);
    const statusCode = error?.response?.status ?? 500;
    const message =
      error?.response?.data?.detail ?? error?.response?.data?.error ?? "Unable to confirm checkout session.";
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
