"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import api from "@/lib/axios";
import type { JobListing } from "@/types/jobs";

async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User must be authenticated to save jobs.");
  }
  return userId;
}

export async function saveJobAction(job: JobListing): Promise<void> {
  const userId = await requireUserId();
  if (!job.job_id) {
    throw new Error("Job is missing job_id.");
  }
  await api.post(
    "/jobs/saved",
    { job },
    {
      headers: { "X-User-Id": userId },
    },
  );
  revalidatePath("/dashboard/jobs");
  revalidatePath(`/dashboard/jobs/${encodeURIComponent(job.job_id)}`);
}

export async function unsaveJobAction(jobId: string): Promise<void> {
  const userId = await requireUserId();
  await api.delete(`/jobs/saved/${encodeURIComponent(jobId)}`, {
    headers: { "X-User-Id": userId },
  });
  revalidatePath("/dashboard/jobs");
  revalidatePath(`/dashboard/jobs/${encodeURIComponent(jobId)}`);
}
