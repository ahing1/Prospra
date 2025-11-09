import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

const insights = [
  "Track applications, interviews, and projects in one view",
  "Spin up job-specific builds with AI blueprints",
  "Stay on pace with weekly nudges and community events",
];

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute right-12 top-32 h-72 w-72 rounded-full bg-indigo-500/20 blur-[160px]" />
        <div className="absolute left-10 bottom-10 h-60 w-60 rounded-full bg-emerald-400/15 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-12 px-6 py-16 md:flex-row md:items-center">
        <div className="flex-1 space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">Welcome back</p>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">Sign in to Prospra</h1>
            <p className="text-lg text-slate-300">
              Keep your job search, project generation, and interview prep in sync. Your workspace picks up right where you left off.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-slate-200">
            {insights.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs text-white">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="text-sm text-slate-400">
            Need an account?{" "}
            <Link href="/sign-up" className="text-white underline-offset-4 hover:underline">
              Create one here
            </Link>
            .
          </div>
        </div>

        <div className="flex-1">
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-[0_30px_100px_rgba(14,165,233,0.25)] backdrop-blur">
            <SignIn
              path="/sign-in"
              routing="path"
              signUpUrl="/sign-up"
              appearance={{
                layout: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "iconButton",
                },
                elements: {
                  card: "bg-transparent shadow-none border-0",
                  headerTitle: "text-white text-2xl font-semibold",
                  headerSubtitle: "text-slate-400",
                  socialButtons: "gap-3",
                  socialButtonsBlockButton: "border border-white/10 bg-white/5 text-white",
                  dividerLine: "bg-white/10",
                  dividerText: "text-slate-400 text-xs tracking-[0.3em] uppercase",
                  formFieldLabel: "text-slate-200 text-sm",
                  formFieldInput: "bg-slate-900/60 border border-white/10 text-white placeholder:text-slate-500",
                  formButtonPrimary: "bg-white text-slate-900 hover:bg-slate-200",
                  footerActionText: "text-slate-400",
                  footerActionLink: "text-white",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
