import api from "@/lib/axios";
import type { SavedJob, SavedJobsResponse } from "@/types/jobs";

export async function getSavedJobs(userId: string): Promise<SavedJob[]> {
  const { data } = await api.get<SavedJobsResponse>("/jobs/saved", {
    headers: { "X-User-Id": userId },
  });
  return data.jobs;
}

export async function getSavedJob(userId: string, jobId: string): Promise<SavedJob | null> {
  try {
    const { data } = await api.get<SavedJob>(`/jobs/saved/${encodeURIComponent(jobId)}`, {
      headers: { "X-User-Id": userId },
    });
    return data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
