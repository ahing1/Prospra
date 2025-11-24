import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import DashboardNav from "@/components/DashboardNav";
import SaveJobButton from "@/components/SaveJobButton";
import UpgradeButton from "@/components/UpgradeButton";
import api from "@/lib/axios";
import { getSavedJobs } from "@/server/jobs";
import type { JobListing, JobSearchResponse, SavedJob } from "@/types/jobs";

type DashboardSearchParams = {
  [key: string]: string | string[] | undefined;
  billing?: string | string[];
};

async function fetchFeaturedJobs(): Promise<JobListing[]> {
  try {
    const params = new URLSearchParams();
    params.set("q", "software engineer");
    params.set("location", "Remote");
    params.set("page", "1");

    const { data } = await api.get<JobSearchResponse>(`/jobs/search?${params.toString()}`);
    return data.jobs || [];
  } catch (error) {
    console.error("Error fetching dashboard jobs:", error);
    throw new Error("Unable to load job recommendations right now.");
  }
}

function JobPreviewCard({ job, isSaved }: { job: JobListing; isSaved: boolean }) {
  const jobId = job.job_id ?? undefined;
  const salary = job.salary || job.detected_extensions?.salary;
  const posted = job.posted_at || job.detected_extensions?.posted_at;
  const href = jobId ? `/dashboard/jobs/${encodeURIComponent(jobId)}` : null;

  return (
    <article className={`rounded-3xl border border-white/10 bg-white/5 p-6 ${href ? "hover:-translate-y-1 hover:border-white/30" : "opacity-80"} transition`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{job.company}</p>
          <h3 className="text-2xl font-semibold text-white">{job.title}</h3>
          <p className="text-sm text-slate-300">
            {job.location || job.detected_extensions?.schedule || "Unknown"} -{" "}
            {job.detected_extensions?.work_from_home ?? job.via ?? "Source unknown"}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 text-sm text-slate-400 lg:items-end">
          <SaveJobButton job={job} jobId={jobId} isSaved={isSaved} />
          {salary && <p className="text-base font-semibold text-white">{salary}</p>}
          {posted && <p>{posted}</p>}
        </div>
      </div>
      {job.description && (
        <p className="mt-4 text-sm text-slate-300 line-clamp-3">{job.description}</p>
      )}
      {job.extensions?.length ? (
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-200">
          {job.extensions.slice(0, 5).map((extension) => (
            <span
              key={`${job.job_id}-${extension}`}
              className="rounded-full border border-white/10 px-3 py-1"
            >
              {extension}
            </span>
          ))}
        </div>
      ) : null}
      {href && (
        <Link href={href} className="mt-4 inline-flex items-center text-sm font-semibold text-sky-300">
          View details -&gt;
        </Link>
      )}
    </article>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<DashboardSearchParams>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const primaryEmail =
    user?.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    "Unknown";
  const isDateObject = (value: unknown): value is Date => value instanceof Date;
  const joinDate = (() => {
    const createdAt = user?.createdAt;
    if (!createdAt) return "Unknown";
    if (isDateObject(createdAt)) {
      return createdAt.toLocaleDateString();
    }
    const isSerializableValue = typeof createdAt === "string" || typeof createdAt === "number";
    if (!isSerializableValue) return "Unknown";
    const parsed = new Date(createdAt);
    return Number.isNaN(parsed.getTime()) ? "Unknown" : parsed.toLocaleDateString();
  })();

  let savedJobs: SavedJob[] = [];
  try {
    savedJobs = await getSavedJobs(userId);
  } catch (error) {
    console.error("Failed to load saved jobs for dashboard", error);
    savedJobs = [];
  }

  let jobFeed: JobListing[] = [];
  let jobError: string | null = null;

  try {
    jobFeed = await fetchFeaturedJobs();
  } catch (err) {
    jobError = err instanceof Error ? err.message : "Unable to load job recommendations.";
  }

  const savedJobIds = new Set(savedJobs.map((saved) => saved.job_id));
  const basicDetails = [
    { label: "Saved roles", value: String(savedJobs.length) },
    { label: "Email", value: primaryEmail },
    { label: "Member since", value: joinDate },
  ];
  const jobPreview = jobFeed.slice(0, 6);
  const resolvedParams: DashboardSearchParams = searchParams ? await searchParams : {};
  const billingStatus = (() => {
    const raw = resolvedParams.billing;
    if (Array.isArray(raw)) {
      return raw[0]?.toLowerCase();
    }
    return raw?.toLowerCase();
  })();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute right-8 top-40 h-72 w-72 rounded-full bg-sky-500/20 blur-[150px]" />
        <div className="absolute left-4 bottom-20 h-60 w-60 rounded-full bg-emerald-400/15 blur-[130px]" />
      </div>

      <main className="relative flex w-full flex-col gap-8 px-6 py-16 lg:px-12">
        <DashboardNav />
        {billingStatus === "success" && (
          <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm text-emerald-50">
            Stripe payment successful — premium access is on the way (temporary confirmation banner).
          </div>
        )}
        {billingStatus === "upgrade-required" && (
          <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-50">
            Upgrade required: choose a plan to unlock Pro-only areas.
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Overview</p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">Welcome back, {user?.firstName || "builder"}</h1>
              <p className="text-sm text-slate-300">Keep tabs on your account details and saved roles before diving into the latest jobs feed.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {basicDetails.map((detail) => (
                <div key={detail.label} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{detail.label}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{detail.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Billing</p>
                  <h2 className="text-2xl font-semibold text-white">Upgrade for unlimited prep & project studios</h2>
                  <p className="text-sm text-emerald-100">
                    Members get unlimited job radar saves, behavioral drills, and scoped project templates. Pick monthly or
                    lifetime access.
                  </p>
                </div>
                <div className="w-full max-w-xs">
                  <UpgradeButton />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Job list</p>
              <h2 className="text-2xl font-semibold text-white">Latest roles for you</h2>
            </div>
            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:border-white"
            >
              Open full radar
            </Link>
          </div>

          {jobError && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              {jobError}
            </div>
          )}

          {!jobError && jobPreview.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 text-sm text-slate-300">
              No roles to show yet. Try refreshing or open the full radar for more options.
            </div>
          )}

          {!jobError && jobPreview.length > 0 && (
            <div className="grid gap-4">
              {jobPreview.map((job, index) => {
                const jobId = job.job_id ?? "";
                return (
                  <JobPreviewCard
                    key={jobId || `${job.title}-${job.location}-${index}`}
                    job={job}
                    isSaved={jobId ? savedJobIds.has(jobId) : false}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
