import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const shortcuts = [
  {
    title: "Project Studio",
    description: "Turn any job description into a scoped build with stack, milestones, and talking points.",
    href: "/dashboard/project-studio",
    badge: "Live",
  },
  {
    title: "Job Radar",
    description: "Browse curated listings with salary bands, stack highlights, and direct apply links.",
    href: "/dashboard/jobs",
    badge: "Live",
  },
  {
    title: "Interview Lab",
    description: "Generate behavioral prompts tied to the JD and rehearse STAR stories with coaching notes.",
    href: "/dashboard/interview-lab",
    badge: "New",
  },
  {
    title: "Profile & Saved Jobs",
    description: "Review your account details, track pinned roles, and jump back into opportunities you’re watching.",
    href: "/dashboard/profile",
    badge: "New",
  },
];

const quickStats = [
  { label: "Focus streak", value: "4 weeks" },
  { label: "Projects in flight", value: "1" },
  { label: "Upcoming interviews", value: "2" },
];

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute right-8 top-40 h-72 w-72 rounded-full bg-sky-500/20 blur-[150px]" />
        <div className="absolute left-4 bottom-20 h-60 w-60 rounded-full bg-emerald-400/15 blur-[130px]" />
      </div>

      <main className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
                Control center
              </p>
              <div>
                <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                  Welcome back, {user?.firstName || "builder"}
                </h1>
                <p className="mt-2 max-w-2xl text-slate-300">
                  Everything in Prospra connects here. Track your progress, jump into project builds, and prep upcoming loops without juggling tabs.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm font-semibold">
                <Link
                  href="/dashboard/project-studio"
                  className="rounded-full bg-white px-5 py-2 text-slate-900 transition hover:bg-slate-200"
                >
                  Generate a project
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="rounded-full border border-white/30 px-5 py-2 text-white transition hover:border-white"
                >
                  View profile
                </Link>
              </div>
            </div>
            <div className="grid w-full gap-4 sm:grid-cols-3">
              {quickStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-center">
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {shortcuts.map((shortcut) => (
            <Link
              key={shortcut.title}
              href={shortcut.href}
              className={`group flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-6 transition ${
                shortcut.href !== "#" ? "hover:-translate-y-2 hover:border-white/30" : "opacity-80"
              }`}
            >
              <div className="space-y-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    shortcut.badge === "Live" ? "bg-emerald-400/20 text-emerald-300" : "bg-white/10 text-slate-200"
                  }`}
                >
                  {shortcut.badge}
                </span>
                <h2 className="text-xl font-semibold text-white">{shortcut.title}</h2>
                <p className="text-sm text-slate-300">{shortcut.description}</p>
              </div>
              {shortcut.href !== "#" && (
                <span className="mt-4 text-sm font-semibold text-sky-300">Open workspace →</span>
              )}
            </Link>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">What's live</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">Project Studio</h3>
            <p className="mt-2 text-slate-300">
              Paste any job description and instantly generate a scoped project brief with stack recommendations, milestones, and brag-ready narratives.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-200">
              {["AI-powered stack suggestions", "Implementation roadmap", "Talking points for interviews"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-xs text-emerald-300">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/project-studio"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Launch Project Studio
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Roadmap</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">Upcoming drops</h3>
            <ul className="mt-6 space-y-4 text-sm text-slate-200">
              <li>
                <p className="font-semibold text-white">Job Radar beta</p>
                <p className="text-slate-400">Signal-based job feed with referrals, visa filters, and warm intro templates.</p>
              </li>
              <li>
                <p className="font-semibold text-white">Behavioral coach</p>
                <p className="text-slate-400">Guided STAR builder with recordings, scorecards, and mentor notes.</p>
              </li>
              <li>
                <p className="font-semibold text-white">Interview lab</p>
                <p className="text-slate-400">Daily DS&A prompts plus system design scenarios tuned to your target roles.</p>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
