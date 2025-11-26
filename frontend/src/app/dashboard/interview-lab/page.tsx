import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import BehavioralCoach from "@/components/BehavioralCoach";
import BehavioralInterviewAssistant from "@/components/BehavioralInterviewAssistant";
import DashboardNav from "@/components/DashboardNav";
import UpgradeModal from "@/components/UpgradeModal";
import api from "@/lib/axios";
import { getBillingStatus } from "@/server/billing";
import type { JobDetailResponse } from "@/types/jobs";

export const dynamic = "force-dynamic";

async function fetchJob(jobId: string) {
  try {
    const { data } = await api.get<JobDetailResponse>(`/jobs/detail/${encodeURIComponent(jobId)}`);
    return data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    console.error("Failed to fetch job for interview lab", error);
    return null;
  }
}

type SearchParams = {
  jobId?: string;
};

export default async function InterviewLabPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const resolvedParams = await searchParams;
  const jobIdParam = typeof resolvedParams?.jobId === "string" ? resolvedParams.jobId : undefined;

  let defaultJobDescription = "";
  let defaultRole = "Software Engineer";
  let defaultSeniority = "Senior";
  const billing = await getBillingStatus(userId);
  const isPro = Boolean(billing?.entitled);

  if (jobIdParam) {
    const jobDetail = await fetchJob(decodeURIComponent(jobIdParam));
    if (jobDetail?.job) {
      defaultJobDescription = jobDetail.job.description ?? "";
      defaultRole = jobDetail.job.title ?? defaultRole;
      const title = jobDetail.job.title?.toLowerCase() ?? "";
      if (title.includes("lead")) defaultSeniority = "Lead";
      else if (title.includes("manager")) defaultSeniority = "Manager";
      else if (title.includes("director")) defaultSeniority = "Director";
      else if (title.includes("principal")) defaultSeniority = "Senior";
      else if (title.includes("mid")) defaultSeniority = "Mid";
      else if (title.includes("junior")) defaultSeniority = "Junior";
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-10 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute right-10 top-40 h-72 w-72 rounded-full bg-sky-500/20 blur-[140px]" />
        <div className="absolute left-10 bottom-0 h-64 w-64 rounded-full bg-emerald-400/15 blur-[130px]" />
      </div>

      <main className="relative flex w-full flex-col gap-8 px-6 py-16 lg:px-12">
        <DashboardNav />
        <div className="flex flex-col gap-4">
          <Link href="/dashboard" className="text-sm font-semibold text-slate-400 transition hover:text-white">
            Back to dashboard
          </Link>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">Interview Lab</p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              Behavioral prompts plus a live assistant
            </h1>
            <p className="max-w-3xl text-lg text-slate-300">
              Feed the job description, pick the soft skill focus, and practice in a real-time interview simulation. Answer via
              text or audio, then get STAR coverage feedback tailored to the company.
            </p>
            <p className="text-sm text-slate-400">Signed in as {user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950/70 to-slate-900/40 p-8 shadow-[0_40px_140px_rgba(56,189,248,0.15)] backdrop-blur">
            <BehavioralCoach
              defaultJobDescription={defaultJobDescription}
              defaultRole={defaultRole}
              defaultSeniority={defaultSeniority}
            />
          </div>

          {!isPro && (
            <div className="space-y-3 rounded-2xl border border-sky-200/20 bg-sky-200/10 p-6 text-slate-100">
              <div>
                <p className="text-sm font-semibold text-white">Unlock the live behavioral assistant</p>
                <p className="text-sm text-slate-200">
                  Go Pro to simulate real interviews with audio transcription and STAR feedback tailored to your JD.
                </p>
              </div>
              <UpgradeModal
                triggerLabel="Upgrade to unlock Behavioral Assistant"
                title="Unlock the Behavioral Assistant"
                description="Choose a plan to practice live STAR interviews with feedback."
              />
            </div>
          )}

          {isPro && (
            <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950/70 to-slate-900/40 p-8 shadow-[0_40px_140px_rgba(56,189,248,0.15)] backdrop-blur">
              <BehavioralInterviewAssistant
                defaultJobDescription={defaultJobDescription}
                defaultRole={defaultRole}
                defaultSeniority={defaultSeniority}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
