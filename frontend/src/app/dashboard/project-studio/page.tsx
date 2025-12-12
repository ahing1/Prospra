import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import DashboardNav from "@/components/DashboardNav";
import ProjectCoach from "@/components/ProjectCoach";
import ProjectGenerator from "@/components/ProjectGenerator";
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
    console.error("Failed to fetch job for project studio", error);
    return null;
  }
}

type SearchParams = {
  jobId?: string;
  description?: string;
  title?: string;
};

export default async function ProjectStudioPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const billing = await getBillingStatus(userId);
  const isPro = Boolean(billing?.entitled);
  const resolvedParams = await searchParams;
  const jobIdParam = typeof resolvedParams?.jobId === "string" ? resolvedParams.jobId : undefined;
  const descriptionParam = typeof resolvedParams?.description === "string" ? resolvedParams.description : undefined;
  const titleParam = typeof resolvedParams?.title === "string" ? resolvedParams.title : undefined;

  let defaultJobDescription = "";
  let defaultRole = "Software Engineer";

  if (descriptionParam) {
    defaultJobDescription = decodeURIComponent(descriptionParam);
  }
  if (titleParam) {
    defaultRole = decodeURIComponent(titleParam);
  }
  if (!defaultJobDescription && jobIdParam) {
    const jobDetail = await fetchJob(decodeURIComponent(jobIdParam));
    if (jobDetail?.job) {
      defaultJobDescription = jobDetail.job.description ?? "";
      defaultRole = jobDetail.job.title ?? defaultRole;
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute right-12 top-40 h-72 w-72 rounded-full bg-indigo-500/20 blur-[150px]" />
        <div className="absolute left-8 bottom-0 h-64 w-64 rounded-full bg-emerald-400/15 blur-[140px]" />
      </div>

      <main className="relative flex w-full flex-col gap-8 px-6 py-16 lg:px-12">
        <DashboardNav />
        <div className="flex flex-col gap-4">
          <Link href="/dashboard" className="text-sm font-semibold text-slate-400 hover:text-white">
            Back to dashboard
          </Link>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Project Studio</p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">Pro project coach</h1>
            <p className="max-w-3xl text-lg text-slate-300">
              Work with a teaching-first coach that turns your project brief into questions, next steps, and checkpoints you can
              speak to in interviews.
            </p>
            <p className="text-sm text-slate-400">Signed in as {user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>

        <div className="space-y-6">
          {!isPro && (
            <>
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_rgba(14,165,233,0.2)] backdrop-blur">
                <ProjectGenerator defaultJobDescription={defaultJobDescription} defaultRole={defaultRole} />
              </div>
              <div className="space-y-3 rounded-2xl border border-emerald-200/20 bg-emerald-200/10 p-4 text-sm text-emerald-50">
                <p>Unlock the Pro Project Coach for live coaching and next steps tailored to your stack.</p>
                <UpgradeModal
                  triggerLabel="Upgrade to unlock Project Coach"
                  title="Unlock the Project Coach"
                  description="Choose a plan to get live coaching, iterative prompts, and accountability."
                />
              </div>
            </>
          )}

          {isPro && (
            <div className="rounded-[32px] border border-emerald-200/30 bg-emerald-200/10 p-8 shadow-[0_40px_120px_rgba(16,185,129,0.18)] backdrop-blur">
              <ProjectCoach defaultJobDescription={defaultJobDescription} defaultRole={defaultRole} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
