import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProjectGenerator from "@/components/ProjectGenerator";

export default async function ProjectStudioPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute right-12 top-40 h-72 w-72 rounded-full bg-indigo-500/20 blur-[150px]" />
        <div className="absolute left-8 bottom-0 h-64 w-64 rounded-full bg-emerald-400/15 blur-[140px]" />
      </div>

      <main className="relative mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-4">
          <Link href="/dashboard" className="text-sm font-semibold text-slate-400 hover:text-white">
            ← Back to dashboard
          </Link>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Project Studio</p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              Job description → project blueprint
            </h1>
            <p className="max-w-3xl text-lg text-slate-300">
              Paste any posting and let Prospra craft a scoped project with stack recommendations, implementation steps, and talking points you can share with hiring teams.
            </p>
            <p className="text-sm text-slate-400">Signed in as {user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_rgba(14,165,233,0.2)] backdrop-blur">
          <ProjectGenerator />
        </div>
      </main>
    </div>
  );
}
