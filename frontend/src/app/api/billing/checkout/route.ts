import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import api from "@/lib/axios";

type CheckoutResponse = {
  checkout_url: string;
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let plan = "monthly";
  try {
    const payload = await request.json();
    if (payload?.plan && typeof payload.plan === "string") {
      plan = payload.plan;
    }
  } catch {
    // ignore body parse errors, default to monthly
  }

  try {
    const { data } = await api.post<CheckoutResponse>(
      "/billing/checkout",
      { plan },
      {
        headers: {
          "X-User-Id": userId,
        },
      },
    );
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create checkout session", error);
    const statusCode = error?.response?.status ?? 500;
    const message =
      error?.response?.data?.detail ??
      error?.response?.data?.error ??
      "Unable to create a checkout session right now.";
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
