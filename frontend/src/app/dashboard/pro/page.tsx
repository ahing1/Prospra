import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import DashboardNav from "@/components/DashboardNav";
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
      </div>

      <main className="relative flex w-full flex-col gap-8 px-6 py-16 lg:px-12">
        <DashboardNav isPro />
        <section className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Pro members</p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">Coming soon for Pro members</h1>
            <p className="text-sm text-slate-200">
              Thanks for upgrading. Your Pro lab is on the way—expect new tools for deeper interview prep, projects, and
              outreach. We&apos;ll drop early access here first.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
