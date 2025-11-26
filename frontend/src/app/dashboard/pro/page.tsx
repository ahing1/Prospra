import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import DashboardNav from "@/components/DashboardNav";
import ProWorkspace from "@/components/ProWorkspace";
import { getBillingStatus } from "@/server/billing";

export default async function ProPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const billing = await getBillingStatus(userId);
  if (!billing.entitled) {
    redirect("/dashboard?billing=upgrade-required");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-8 top-40 h-72 w-72 rounded-full bg-indigo-500/20 blur-[150px]" />
        <div className="absolute left-8 bottom-8 h-64 w-64 rounded-full bg-emerald-400/15 blur-[140px]" />
      </div>

      <main className="relative flex w-full flex-col gap-8 px-6 py-16 lg:px-12">
        <DashboardNav isPro />

        <section className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur">
          <div className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr] lg:items-start">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Pro lab</p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">Build with a teaching-first LLM</h1>
              <p className="max-w-2xl text-lg text-slate-200">
                Your subscription unlocks the project coach and the behavioral interview assistant. Build interview-ready work
                and rehearse STAR answers with tailored, conversational feedback.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  "Project coach aligned to your stack and stage",
                  "Behavioral assistant tuned to your JD with STAR scoring",
                  "Pushes questions before answers to keep you accountable",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-100"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-[28px] border border-emerald-200/30 bg-emerald-200/10 p-6 text-emerald-50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.3em]">How to use it</p>
                <span className="rounded-full border border-emerald-100/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
                  Pro access
                </span>
              </div>
              <ol className="space-y-2 text-sm leading-relaxed">
                <li>
                  <span className="font-semibold text-white">1)</span> Drop a brief: title, outcome, stack, and stage.
                </li>
                <li>
                  <span className="font-semibold text-white">2)</span> Ask what you are stuck on or want to practice.
                </li>
                <li>
                  <span className="font-semibold text-white">3)</span> Get a short plan, questions, and checkpoints.
                </li>
                <li>
                  <span className="font-semibold text-white">4)</span> Build, report back, and iterate with the coach.
                </li>
              </ol>
              <p className="text-xs text-emerald-100">
                The coach avoids dumping final answers; it nudges you toward reasoning, trade-offs, and delivery habits you can
                speak to in interviews.
              </p>
            </div>
          </div>
        </section>

        <ProWorkspace />
      </main>
    </div>
  );
}
