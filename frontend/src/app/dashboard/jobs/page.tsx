import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import api from "@/lib/axios";

import type { JobSearchResponse } from "@/types/jobs";

async function fetchJobs(query: string, location: string, page: number) {
  try {
    const { data } = await api.get<JobSearchResponse>('/jobs/search', {
      params: { q: query, location, page }
    });
    return data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw new Error("Failed to fetch jobs");
  }
}

type SearchParams = {
  [key: string]: string | string[] | undefined;
  q?: string;
  location?: string;
  page?: string;
};

export default async function JobsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const resolvedParams = await searchParams;

  const query = typeof resolvedParams.q === "string" && resolvedParams.q.trim().length > 0
    ? resolvedParams.q
    : "software engineer";
  const location = typeof resolvedParams.location === "string" && resolvedParams.location.trim().length > 0
    ? resolvedParams.location
    : "Remote";
  const page = Number.parseInt(typeof resolvedParams.page === "string" ? resolvedParams.page : "1", 10) || 1;

  let data: JobSearchResponse | null = null;
  let error: string | null = null;

  try {
    data = await fetchJobs(query, location, page);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load job listings.";
  }

  const jobs = data?.jobs ?? [];
  const showPrev = page > 1;
  const hasResults = jobs.length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute right-10 top-32 h-72 w-72 rounded-full bg-sky-500/20 blur-[150px]" />
        <div className="absolute left-6 bottom-16 h-64 w-64 rounded-full bg-emerald-400/15 blur-[130px]" />
      </div>

      <main className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16">
        <header className="space-y-4">
          <Link href="/dashboard" className="text-sm font-semibold text-slate-400 transition hover:text-white">
            ← Back to dashboard
          </Link>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Job Radar</p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">Tech roles with transparent details</h1>
            <p className="max-w-3xl text-lg text-slate-300">
              Search across LinkedIn-powered listings via SerpAPI. Filter by keywords and location, then dive deeper for stacks, salary intel, and direct apply links.
            </p>
          </div>
        </header>

        <form className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 md:grid-cols-3" method="get">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Role</span>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="e.g. AI engineer"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-white/40 focus:outline-none"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Location</span>
            <input
              type="text"
              name="location"
              defaultValue={location}
              placeholder="Remote, San Francisco, London..."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-white/40 focus:outline-none"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Update results
            </button>
          </div>
        </form>

        {error && (
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        )}

        {!error && !hasResults && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-300">
            No results yet. Try a different query or location.
          </div>
        )}

        {hasResults && (
          <section className="grid gap-6">
            {jobs.map((job) => {
              const jobId = job.job_id || undefined;
              if (!jobId) {
                return (
                  <div key={`${job.title}-${job.location}`} className="rounded-3xl border border-white/10 bg-white/5 p-6 opacity-70">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{job.company}</p>
                    <h2 className="text-2xl font-semibold text-white">{job.title}</h2>
                    <p className="text-sm text-slate-300">{job.location || "Unknown"}</p>
                  </div>
                );
              }
              const salary = job.salary || job.detected_extensions?.salary;
              const posted = job.posted_at || job.detected_extensions?.posted_at;
              const href = jobId ? `/dashboard/jobs/${encodeURIComponent(jobId)}` : null;

              const content = (
                <>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{job.company}</p>
                      <h2 className="text-2xl font-semibold text-white">{job.title}</h2>
                      <p className="text-sm text-slate-300">
                        {job.location || job.detected_extensions?.schedule || "Unknown"} · {job.detected_extensions?.work_from_home ?? job.via ?? ""}
                      </p>
                    </div>
                    <div className="text-right text-sm text-slate-400">
                      {salary && <p className="text-base font-semibold text-white">{salary}</p>}
                      {posted && <p>{posted}</p>}
                    </div>
                  </div>
                  {job.description && (
                    <p className="mt-4 text-sm text-slate-300 line-clamp-3">{job.description}</p>
                  )}
                  {job.extensions?.length ? (
                    <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-200">
                      {job.extensions.slice(0, 6).map((extension) => (
                        <span key={`${job.job_id}-${extension}`} className="rounded-full border border-white/10 px-3 py-1">
                          {extension}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {href && (
                    <span className="mt-4 inline-flex items-center text-sm font-semibold text-sky-300">
                      View details →
                    </span>
                  )}
                </>
              );

              return href ? (
                <Link
                  key={jobId}
                  href={href}
                  className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-white/30"
                >
                  {content}
                </Link>
              ) : (
                <div key={job.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 opacity-70">
                  {content}
                </div>
              );
            })}
          </section>
        )}

        {hasResults && (
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <span>
              Page {page}
            </span>
            <div className="flex gap-3">
              <Link
                href={{
                  pathname: "/dashboard/jobs",
                  query: { q: query, location, page: page - 1 },
                }}
                className={`rounded-full border px-4 py-2 ${showPrev ? "border-white/30 text-white hover:border-white" : "border-white/10 text-slate-500"}`}
                aria-disabled={!showPrev}
              >
                Previous
              </Link>
              <Link
                href={{
                  pathname: "/dashboard/jobs",
                  query: { q: query, location, page: page + 1 },
                }}
                className="rounded-full border border-white/30 px-4 py-2 text-white hover:border-white"
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
