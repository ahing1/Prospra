import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import api from "@/lib/axios";

export type BillingStatusResponse = {
  status: string | null;
  plan: string | null;
  entitled: boolean;
  entitlement_expires_at: string | null;
  last_event_id: string | null;
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data } = await api.get<BillingStatusResponse>("/billing/status", {
      headers: { "X-User-Id": userId },
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Failed to fetch billing status", error);
    const statusCode = error?.response?.status ?? 500;
    const message =
      error?.response?.data?.detail ??
      error?.response?.data?.error ??
      "Unable to load billing status.";
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
