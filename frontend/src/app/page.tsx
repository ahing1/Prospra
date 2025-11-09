"use client";

import Link from "next/link";
import { useState } from "react";

const highlights = [
  {
    title: "Live job intel",
    detail: "Curated postings with salary bands, visa info, and the exact skills recruiters flag.",
  },
  {
    title: "AI project studio",
    detail: "Drop the role description and get a scoped build plan with stack, milestones, and talking points.",
  },
  {
    title: "Interview rehearsal",
    detail: "Behavioral prompts plus LeetCode-style drills keep every loop sharp and story-ready.",
  },
  {
    title: "Career OS",
    detail: "Track applications, templates, and prep assets without juggling docs and spreadsheets.",
  },
];

const modules = [
  {
    badge: "Job Radar",
    title: "Stay ahead of hiring spikes",
    body: "Get alerts when teams expand, when headcount freezes lift, and when your stack shows up in a brief.",
  },
  {
    badge: "Project Studio",
    title: "Ship proof of skill fast",
    body: "Guided builds with repo structure, architecture notes, and demo scripts tailored to each role.",
  },
  {
    badge: "Interview Lab",
    title: "Practice like the real loop",
    body: "Sequenced behavioral prompts plus technical reps with instant feedback and suggested follow-ups.",
  },
];

const steps = [
  {
    title: "Curate your target roles",
    detail: "Filter by company stage, location, tech stack, and growth signals. Save watchers for weekly drops.",
  },
  {
    title: "Spin up bespoke projects",
    detail: "Paste the JD into Prospra and get a plan, starter repo outline, and measurable outcomes in seconds.",
  },
  {
    title: "Master every interview",
    detail: "Line up behavioral narratives, system design prompts, and code challenges all in one agenda.",
  },
];

const testimonials = [
  {
    quote:
      "Prospra helped me move from scattershot applications to a tight weekly plan. The AI projects became the centerpiece of my portfolio.",
    name: "Riya S.",
    role: "Incoming SWE @ Series C fintech",
  },
  {
    quote:
      "Having behavioral prompts, recruiter message templates, and progress tracking in one place kept me calm through five final rounds.",
    name: "Marcus L.",
    role: "Product Manager @ Big Tech",
  },
  {
    quote:
      "The job radar surfaced roles I never saw on LinkedIn, and the generated build briefs gave me ready-to-demo projects.",
    name: "Alicia D.",
    role: "Data Scientist @ Healthtech startup",
  },
];

const faqs = [
  {
    question: "Who is Prospra for?",
    answer: "Builders entering or pivoting within tech who want one workspace for job search, projects, and interview prep.",
  },
  {
    question: "Do I need previous projects?",
    answer: "No—our generator outlines projects tailored to each listing and helps you document the journey for recruiters.",
  },
  {
    question: "Is there a free plan?",
    answer: "Yes, track applications and sample prompts for free. Upgrade for unlimited project briefs and interview labs.",
  },
];

const freeFeatures = [
  "Application tracker",
  "3 AI project briefs / mo",
  "Weekly behavioral prompts",
  "Community office hours",
];

const proFeatures = [
  "Unlimited project generator runs",
  "Role-based learning paths",
  "Advanced interview analytics",
  "Priority mentor feedback",
];

const lifetimeFeatures = [
  "Everything in Pro",
  "VIP build weekends",
  "Hiring partner introductions",
  "White-glove onboarding",
];

export default function Home() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Free",
      price: "$0",
      cadence: "forever",
      description: "Track your search, sample prompts, and join live community drops.",
      features: freeFeatures,
      cta: "Get started",
      highlighted: false,
      footnote: undefined,
    },
    {
      name: billingCycle === "monthly" ? "Pro Monthly" : "Pro Yearly",
      price: billingCycle === "monthly" ? "$20" : "$13",
      cadence: "/mo",
      description:
        billingCycle === "monthly"
          ? "Flexible month-to-month access to unlimited briefs and analytics."
          : "Billed annually at 33% off, perfect for long-term growth sprints.",
      features: proFeatures,
      cta: billingCycle === "monthly" ? "Start monthly" : "Switch yearly",
      highlighted: true,
    },
    {
      name: "Lifetime",
      price: "$299",
      cadence: "once",
      description: "One-time payment for lifetime updates, events, and concierge support.",
      features: lifetimeFeatures,
      cta: "Own it forever",
      highlighted: false,
      footnote: undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-sky-500/25 blur-3xl" />
          <div className="absolute left-16 top-60 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-[140px]" />
          <div className="absolute right-10 top-72 h-48 w-48 rounded-full bg-emerald-400/20 blur-[120px]" />
        </div>

        <section
          id="hero"
          className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-24 pt-16 sm:pt-24 lg:flex-row lg:items-center">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-100">
                Prospra
                <span className="text-sky-300">Launch</span>
              </div>
              <div className="space-y-6">
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  The all-in-one career cockpit for breaking into tech.
                </h1>
                <p className="max-w-2xl text-lg text-slate-300 sm:text-xl">
                  Discover roles, spin up custom projects, and rehearse every interview—without leaving the Prospra workspace.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                >
                  Start for free
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white transition hover:border-white"
                >
                  See the product →
                </Link>
              </div>
              <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 sm:grid-cols-2">
                {highlights.map((item) => (
                  <div
                    key={item.title}
                    className="space-y-1 rounded-2xl border border-transparent p-3 transition-all duration-500 hover:-translate-y-1 hover:border-white/30"
                  >
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="text-slate-300">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <div className="relative rounded-[32px] border border-white/15 bg-white/5 p-6 shadow-[0_30px_120px_rgba(14,165,233,0.25)]">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
                  Opportunity tracker
                  <span className="text-emerald-300">Live sync</span>
                </div>
                <div className="mt-6 space-y-4">
                  {["AI Product Engineer", "Full-stack Apprentice", "Data Scientist II"].map((role) => (
                    <div
                      key={role}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 transition-all duration-500 hover:-translate-y-1 hover:border-white/30"
                    >
                      <div>
                        <p className="font-semibold text-white">{role}</p>
                        <p className="text-xs text-slate-400">Ready for project brief</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-300">In progress</span>
                    </div>
                  ))}
                </div>
                <pre className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-5 font-mono text-xs leading-relaxed text-slate-300">
{`// Prospra project seed
const blueprint = {
  role: "Platform Engineer",
  stack: ["Next.js", "tRPC", "Postgres"],
  milestones: ["scope", "build", "demo"],
  talkTrack: "Highlight async pipelines + impact",
};`}
                </pre>
              </div>
            </div>
          </div>

          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-6 pb-12 text-xs uppercase tracking-[0.35em] text-slate-500">
            {['TEALS NETWORK', 'FWD TECH', 'CLOUDNOVA', 'ATLAS DS', 'CIRCUIT CO-OP'].map((brand) => (
              <span key={brand} className="text-center">{brand}</span>
            ))}
          </div>
        </section>

        <section id="product" className="mx-auto max-w-6xl px-6 py-20">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">Built for momentum</p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Every part of the job hunt finally works together.</h2>
            <p className="max-w-3xl text-lg text-slate-300">
              From signal to offer, Prospra keeps outreach, projects, and interview prep synced so you never lose track of why you started.
            </p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {modules.map((module) => (
              <article
                key={module.title}
                className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-500 hover:-translate-y-2 hover:border-white/30"
              >
                <span className="inline-flex w-fit items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                  {module.badge}
                </span>
                <h3 className="text-xl font-semibold text-white">{module.title}</h3>
                <p className="text-sm text-slate-300">{module.body}</p>
                <span className="text-sm font-semibold text-sky-300">Learn more →</span>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-10 rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">Operating cadence</p>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Guide every week with a repeatable plan.</h2>
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className="flex gap-4 rounded-2xl border border-transparent p-3 transition-all duration-500 hover:-translate-y-1 hover:border-white/20"
                  >
                    <div className="text-sm font-semibold text-slate-400">0{index + 1}</div>
                    <div>
                      <p className="text-lg font-semibold text-white">{step.title}</p>
                      <p className="text-sm text-slate-300">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-950/60 p-6">
              <h3 className="text-xl font-semibold text-white">Weekly focus board</h3>
              <ul className="space-y-4 text-sm text-slate-200">
                {['3 outbound apps', '1 AI-generated project sprint', '2 behavioral reps', '1 technical mock'].map((item) => (
                  <li
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 transition-all duration-500 hover:-translate-y-1 hover:border-white/30"
                  >
                    <span>{item}</span>
                    <span className="text-xs font-semibold text-emerald-300">Queued</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-400">
                Prospra nudges you with reminders, templates, and mentors if you fall behind.
              </p>
            </div>
          </div>
        </section>

        <section id="community" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="flex flex-col gap-6 pb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">Community wins</p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Learners use Prospra to land roles faster.</h2>
            <p className="mx-auto max-w-3xl text-lg text-slate-300">
              Momentum comes from seeing progress. Tap into shared templates, mock interviews, and real success stories every week.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote
                key={t.name}
                className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-500 hover:-translate-y-2 hover:border-white/30"
              >
                <p className="text-sm text-slate-200">“{t.quote}”</p>
                <div>
                  <p className="text-base font-semibold text-white">{t.name}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{t.role}</p>
                </div>
              </blockquote>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Pricing</p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Pick a plan that matches your sprint.</h2>
            <p className="mx-auto max-w-3xl text-lg text-slate-300">
              Start free, toggle between monthly or yearly savings, or go all in with lifetime access.
            </p>
          </div>
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1 text-sm font-semibold">
              {(["monthly", "yearly"] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={`rounded-full px-5 py-2 transition ${billingCycle === cycle ? "bg-white text-slate-900" : "text-slate-300"}`}
                >
                  {cycle === "monthly" ? "Monthly" : "Yearly"}
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
              Save 33% with yearly access
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`flex h-full flex-col rounded-3xl border p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(14,165,233,0.25)] ${plan.highlighted ? "border-transparent bg-white text-slate-900" : "border-white/10 bg-white/5"}`}
              >
                <div className="space-y-2">
                  <p className={`text-sm font-semibold uppercase tracking-[0.3em] ${plan.highlighted ? "text-indigo-500" : "text-slate-300"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold">{plan.price}</span>
                    <span className="text-sm opacity-70">{plan.cadence}</span>
                  </div>
                  <p className="text-sm opacity-80">{plan.description}</p>
                  {plan.footnote && <p className="text-xs font-semibold text-emerald-500">{plan.footnote}</p>}
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${plan.highlighted ? "bg-slate-900/10 text-slate-900" : "bg-emerald-400/20 text-emerald-300"}`}>
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${plan.highlighted ? "bg-slate-900 text-white hover:bg-slate-800" : "border border-white/30 text-white hover:border-white"}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-5xl px-6 pb-20">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-10">
            <div className="space-y-10 lg:flex lg:items-start lg:justify-between lg:space-y-0">
              <div className="max-w-xl space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">Questions? we’ve got you.</p>
                <h2 className="text-3xl font-semibold text-white">Everything you need to get started.</h2>
                <p className="text-base text-slate-300">
                  Whether you’re prepping your first coding interview or switching roles, Prospra scales with your pace.
                </p>
              </div>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Create my workspace
              </Link>
            </div>
            <div className="mt-10 space-y-6">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 transition-all duration-500 hover:border-white/30"
                >
                  <summary className="cursor-pointer text-lg font-semibold text-white">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm text-slate-300">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-24">
          <div className="rounded-[36px] border border-white/10 bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-emerald-400/20 p-10 text-center shadow-[0_0_50px_rgba(14,165,233,0.25)]">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white">Your next chapter</p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              Join thousands of learners building with Prospra.
            </h2>
            <p className="mt-4 text-base text-slate-100">
              Secure early access, weekly drops, and community build nights that keep you accountable.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-white px-10 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Claim my invite
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-10 py-3 text-sm font-semibold text-white transition hover:border-white"
              >
                I already have access
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
