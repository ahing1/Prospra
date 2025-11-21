import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import SaveJobButton from "@/components/SaveJobButton";
import { getSavedJobs } from "@/server/jobs";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const savedJobs = await getSavedJobs(userId);

  const primaryEmail =
    user?.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    "Unknown";
  const fullName = user?.fullName ?? user?.username ?? "Anonymous";
  const joinDate =
    user?.createdAt instanceof Date
      ? user.createdAt.toLocaleDateString()
      : user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "Unknown";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute right-12 top-32 h-72 w-72 rounded-full bg-emerald-400/20 blur-[150px]" />
        <div className="absolute left-10 bottom-16 h-60 w-60 rounded-full bg-amber-500/15 blur-[130px]" />
      </div>

      <main className="relative mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="space-y-4">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-slate-400 transition hover:text-white"
          >
            ← Back to dashboard
          </Link>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">
              Profile
            </p>
            <h1 className="text-4xl font-semibold text-white">Your workspace</h1>
            <p className="text-slate-300">
              Review your account details and keep tabs on the roles you've saved while exploring
              the market.
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Account
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{fullName}</h2>
            <dl className="mt-4 space-y-3 text-sm text-slate-200">
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Email</dt>
                <dd className="font-semibold text-white">{primaryEmail}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Member since</dt>
                <dd className="font-semibold text-white">{joinDate}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Saved jobs</dt>
                <dd className="font-semibold text-white">{savedJobs.length}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Quick actions
            </p>
            <div className="mt-4 space-y-3 text-sm font-semibold text-white">
              <Link href="/dashboard/jobs" className="block rounded-2xl border border-white/10 px-4 py-3 text-center transition hover:border-white/40">
                Discover jobs
              </Link>
              <Link href="/dashboard/project-studio" className="block rounded-2xl border border-white/10 px-4 py-3 text-center transition hover:border-white/40">
                Build a project
              </Link>
              <Link href="/dashboard/interview-lab" className="block rounded-2xl border border-white/10 px-4 py-3 text-center transition hover:border-white/40">
                Prep interviews
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Saved roles
              </p>
              <h3 className="text-2xl font-semibold text-white">
                {savedJobs.length > 0 ? "Pinned opportunities" : "No saved roles yet"}
              </h3>
            </div>
            {savedJobs.length > 0 && (
              <p className="text-sm text-slate-300">{savedJobs.length} saved</p>
            )}
          </div>

          {savedJobs.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-sm text-slate-400">
              You haven’t saved any roles yet. Browse the{" "}
              <Link href="/dashboard/jobs" className="text-sky-300 hover:text-sky-200">
                job radar
              </Link>{" "}
              and tap “Save job” to pin interesting openings here.
            </div>
          ) : (
            <div className="grid gap-4">
              {savedJobs.map((saved) => {
                const job = saved.job;
                const jobId = saved.job_id;
                return (
                  <div
                    key={`${jobId}-${saved.saved_at}`}
                    className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                          {job.company}
                        </p>
                        <Link
                          href={`/dashboard/jobs/${encodeURIComponent(jobId)}`}
                          className="text-xl font-semibold text-white hover:text-emerald-300"
                        >
                          {job.title}
                        </Link>
                        <p className="text-sm text-slate-400">
                          {job.location ?? "Unknown location"} ·{" "}
                          {job.detected_extensions?.schedule ?? job.via ?? "Unknown type"}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          Saved on {new Date(saved.saved_at).toLocaleDateString()}
                        </p>
                      </div>
                      <SaveJobButton job={job} jobId={jobId} isSaved />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
