import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import api from "@/lib/axios";

import type { JobDetailResponse, JobApplyOption } from "@/types/jobs";

export const dynamic = "force-dynamic";

async function fetchJob(jobId: string) {
  try {
    const { data } = await api.get<JobDetailResponse>(`/jobs/detail/${encodeURIComponent(jobId)}`);
    return data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw new Error("Failed to load job detail");
  }
}

type PageProps = {
  params: Promise<{ jobId: string }>;
};

export default async function JobDetailPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const resolvedParams = await params;
  const jobIdParam = resolvedParams?.jobId;
  if (!jobIdParam) {
    notFound();
  }

  const jobId = decodeURIComponent(jobIdParam);

  let data: JobDetailResponse | null = null;
  try {
    data = await fetchJob(jobId);
  } catch (error) {
    console.error("Failed to load job detail", error);
    throw error;
  }

  if (!data) {
    notFound();
  }

  const { job } = data;
  const salary = job.salary || job.detected_extensions?.salary;
  const posted = job.posted_at || job.detected_extensions?.posted_at;
  const applyOptions = job.apply_options?.filter((option) => option.link) ?? [];
  const primaryApplyLink = applyOptions[0]?.link ?? job.detected_extensions?.apply_link ?? null;
  const projectStudioHref = jobIdParam
    ? `/dashboard/project-studio?jobId=${encodeURIComponent(jobIdParam)}`
    : "/dashboard/project-studio";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute right-8 top-36 h-72 w-72 rounded-full bg-indigo-500/20 blur-[150px]" />
        <div className="absolute left-10 bottom-10 h-64 w-64 rounded-full bg-amber-400/20 blur-[140px]" />
      </div>

      <main className="relative mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="space-y-4">
          <Link href="/dashboard/jobs" className="text-sm font-semibold text-slate-400 transition hover:text-white">
            ← Back to listings
          </Link>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{job.company}</p>
            <h1 className="text-4xl font-semibold text-white">{job.title}</h1>
            <p className="text-sm text-slate-300">
              {job.location ?? "Unknown"} · {job.detected_extensions?.schedule ?? job.via ?? job.type ?? ""} · {posted ?? "Fresh"}
            </p>
          </div>
        </header>

        <div className="rounded-[32px] border border-white/10 bg-white p-8 text-slate-900 shadow-[0_40px_120px_rgba(15,23,42,0.25)]">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Compensation</p>
              <p className="text-2xl font-semibold text-slate-900">{salary ?? "Not listed"}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              {job.extensions?.length
                ? job.extensions.map((extension) => (
                    <span key={`${job.job_id}-${extension}`} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                      {extension}
                    </span>
                  ))
                : null}
            </div>
            {primaryApplyLink ? (
              <a
                href={primaryApplyLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Apply now ↗
              </a>
            ) : null}
          </div>

          <section className="mt-8 space-y-6">
            {job.description && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900">About the role</h2>
                <p className="mt-2 whitespace-pre-line text-slate-600">{job.description}</p>
              </div>
            )}

            {job.job_highlights?.length ? (
              <div className="grid gap-6 lg:grid-cols-2">
                {job.job_highlights.map((highlight) => (
                  <div key={`${highlight.title}-${highlight.items.join("-")}`}>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{highlight.title}</h3>
                    <ul className="mt-3 space-y-2 text-sm text-slate-700">
                      {highlight.items.map((item) => (
                        <li key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              {applyOptions.length > 1 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Apply options</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {applyOptions.map((option: JobApplyOption) => (
                      <li key={`${option.title}-${option.link}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
                        <a href={option.link ?? "#"} target="_blank" rel="noreferrer" className="font-semibold text-slate-900">
                          {option.title || option.link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">How to stand out</p>
                <p className="mt-3">
                  Build a tailored project in Project Studio to mirror this stack and talk track, then reference it in your outreach.
                </p>
                <Link href={projectStudioHref} className="mt-4 inline-flex text-sm font-semibold text-slate-900">
                  Generate a project →
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
