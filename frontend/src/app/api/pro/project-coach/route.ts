import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import api from "@/lib/axios";
import type { CoachMessage, ProjectCoachRequest, ProjectCoachResponse } from "@/types/pro";

function normalizeHistory(history: unknown): CoachMessage[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter((item) => item && typeof item === "object")
    .map((item: any): CoachMessage => {
      const role: CoachMessage["role"] = item.role === "assistant" ? "assistant" : "user";
      const content = typeof item.content === "string" ? item.content : "";
      return { role, content };
    })
    .filter((item) => item.content.trim().length > 0)
    .slice(-10);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const payload: ProjectCoachRequest = {
    project_title: typeof body?.project_title === "string" ? body.project_title : "",
    project_summary: typeof body?.project_summary === "string" ? body.project_summary : "",
    tech_stack: Array.isArray(body?.tech_stack) ? body.tech_stack.filter((item: any) => typeof item === "string") : [],
    stage: typeof body?.stage === "string" ? body.stage : null,
    user_message: typeof body?.user_message === "string" ? body.user_message : "",
    history: normalizeHistory(body?.history),
  };

  try {
    const { data } = await api.post<ProjectCoachResponse>("/pro/project-coach", payload, {
      headers: { "X-User-Id": userId },
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Project coach request failed", error);
    const statusCode = error?.response?.status ?? 500;
    const message =
      error?.response?.data?.detail ??
      error?.response?.data?.error ??
      "Unable to reach the project coach right now.";
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
