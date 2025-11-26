import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import DashboardNav from "@/components/DashboardNav";
import SaveJobButton from "@/components/SaveJobButton";
import UpgradeButton from "@/components/UpgradeButton";
import SignOutAction from "@/components/SignOutAction";
import { getBillingStatus } from "@/server/billing";
import { getSavedJobs } from "@/server/jobs";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const savedJobs = await getSavedJobs(userId);
  const billing = await getBillingStatus(userId);
  const hasPlan = Boolean(billing?.entitled);
  const planName = billing?.plan ? billing.plan.replace(/_/g, " ").toUpperCase() : "Free";
  const expires = billing?.entitlement_expires_at
    ? new Date(billing.entitlement_expires_at).toLocaleDateString()
    : null;

  const primaryEmail =
    user?.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    "Unknown";
  const fullName = user?.fullName ?? user?.username ?? "Anonymous";
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
  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment.charAt(0).toUpperCase())
      .join("") || "P";
  const profileStats = [
    { label: "Email", value: primaryEmail },
    { label: "Member since", value: joinDate },
    { label: "Saved roles", value: String(savedJobs.length) },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute right-12 top-32 h-72 w-72 rounded-full bg-emerald-400/20 blur-[150px]" />
        <div className="absolute left-10 bottom-16 h-60 w-60 rounded-full bg-amber-500/15 blur-[130px]" />
      </div>

      <main className="relative flex w-full flex-col gap-10 px-6 py-16 lg:px-12">
        <DashboardNav />

        <section className="rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/40 to-slate-950/80 p-8 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-400/20 text-3xl font-semibold text-white">
                {initials}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">Profile</p>
                <h1 className="text-4xl font-semibold text-white">{fullName}</h1>
                <p className="text-sm text-slate-300">Workspace owner - keep these details current as you explore roles</p>
              </div>
            </div>
            <div className="grid gap-3 text-sm text-white sm:grid-cols-3">
              {profileStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-lg font-semibold text-white break-words">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-white">
            <Link href="/dashboard/jobs" className="rounded-full border border-white/20 px-4 py-2 transition hover:border-white">
              Discover jobs
            </Link>
            <Link href="/dashboard/project-studio" className="rounded-full border border-white/20 px-4 py-2 transition hover:border-white">
              Build a project
            </Link>
            <Link href="/dashboard/interview-lab" className="rounded-full border border-white/20 px-4 py-2 transition hover:border-white">
              Prep interviews
            </Link>
            <SignOutAction />
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Plan</p>
            <h3 className="text-2xl font-semibold text-white">{hasPlan ? "Pro access active" : "You’re on the free plan"}</h3>
            <p className="text-sm text-emerald-100">
              Current plan: {planName}
              {hasPlan && expires ? ` · Renews ${expires}` : ""}
            </p>
            {!hasPlan && (
              <p className="text-sm text-emerald-100">
                Upgrade to enable the Project Coach and Behavioral Assistant. Checkout is a quick redirect.
              </p>
            )}
          </div>
          <div className="flex flex-col justify-center">
            {hasPlan ? (
              <div className="rounded-2xl border border-emerald-200/30 bg-emerald-200/10 p-4 text-sm text-emerald-50">
                Your Pro features are ready in Project Studio and Interview Lab.
              </div>
            ) : (
              <UpgradeButton />
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Saved roles</p>
              <h3 className="text-2xl font-semibold text-white">
                {savedJobs.length > 0 ? "Pinned opportunities" : "No saved roles yet"}
              </h3>
            </div>
            {savedJobs.length > 0 && <p className="text-sm text-slate-300">{savedJobs.length} saved</p>}
          </div>

          {savedJobs.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-sm text-slate-400">
              You have not saved any roles yet. Browse the{" "}
              <Link href="/dashboard/jobs" className="text-sky-300 hover:text-sky-200">
                job radar
              </Link>{" "}
              and tap "Save job" to pin interesting openings here.
            </div>
          ) : (
            <div className="grid gap-4">
              {savedJobs.map((saved) => {
                const job = saved.job;
                const jobId = saved.job_id;
                return (
                  <div
                    key={`${jobId}-${saved.saved_at}`}
                    className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 transition hover:border-white/30"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{job.company}</p>
                        <Link
                          href={`/dashboard/jobs/${encodeURIComponent(jobId)}`}
                          className="text-xl font-semibold text-white hover:text-emerald-300"
                        >
                          {job.title}
                        </Link>
                        <p className="text-sm text-slate-400">
                          {job.location ?? "Unknown location"} - {job.detected_extensions?.schedule ?? job.via ?? "Unknown type"}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">Saved on {new Date(saved.saved_at).toLocaleDateString()}</p>
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
