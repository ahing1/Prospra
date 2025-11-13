"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type BillingCycle = "monthly" | "yearly";

const heroStats = [
  { label: "Live tech postings", value: "2,300+", detail: "Aggregated from boards, referrals, and partner drops." },
  { label: "Role-specific projects created", value: "1,900+", detail: "Briefs mapped to exact job descriptions." },
  { label: "Interview drills completed", value: "6,200+", detail: "Behavioral + technical sessions with notes." },
];

const featureTracks = [
  {
    badge: "Job Graph",
    title: "See every relevant posting in one feed",
    summary:
      "Pull listings from LinkedIn, Wellfound, YC, and private communities. Each card highlights stack, visa policy, compensation, and hiring signal.",
  },
  {
    badge: "Project Forge",
    title: "Auto-build a project for that exact role",
    summary:
      "Paste a job link and instantly get repo scaffolding, architecture notes, and delivery milestones that mirror the posting’s expectations.",
  },
  {
    badge: "Behavioral Coach",
    title: "Generate stories that speak to the JD",
    summary:
      "Prospra analyzes the role and drafts STAR prompts, recruiter outreach scripts, and follow-ups tailored to that team’s focus.",
  },
  {
    badge: "Technical Lab",
    title: "Drill the questions they will actually ask",
    summary:
      "Surface data structure, system design, or product-sense questions tied to the company’s domain with graded answers and hints.",
  },
];

const executionPillars = [
  {
    title: "Discover",
    detail: "Curated tech roles",
    bullets: [
      "Unified feed with stack, level, visa, and remote filters.",
      "Save watchers per company or keyword and get notified when new roles hit.",
      "AI-generated briefing that explains why the team is hiring now.",
    ],
  },
  {
    title: "Build",
    detail: "Job-specific projects",
    bullets: [
      "One-click scaffolds with tasks tied to acceptance criteria in the JD.",
      "Suggested repo structure, integrations, and demo narrative.",
      "Auto-generated brag docs so you capture learnings while building.",
    ],
  },
  {
    title: "Prep",
    detail: "Behavioral + technical",
    bullets: [
      "Behavioral decks referencing the company’s values and tech focus.",
      "Technical drills seeded from the role’s stack, difficulty, and interview style.",
      "Loop timelines and reminders so you rehearse the right thing each day.",
    ],
  },
];

const journey = [
  {
    label: "01",
    title: "Pull the posting",
    detail:
      "Drop a link or upload the JD. Prospra scrapes role context, team signals, and required competencies automatically.",
  },
  {
    label: "02",
    title: "Spin up the project",
    detail:
      "Generate a scoped repo, backlog, and success metrics tailored to that job so you prove the exact skills they ask for.",
  },
  {
    label: "03",
    title: "Rehearse interviews",
    detail:
      "Run behavioral prompts, system design drills, and coding reps that reference the company’s products and architecture.",
  },
  {
    label: "04",
    title: "Ship & apply",
    detail:
      "Package the project, attach loop-ready notes, and push a personalized application or recruiter message with one click.",
  },
];

const testimonials = [
  {
    quote:
      "I stopped guessing. Each job card came with a tailored project brief and interview prompts, so I always knew what to ship next.",
    name: "Lena Q.",
    role: "iOS Engineer → Staff @ Series C",
  },
  {
    quote:
      "Behavioral prep keyed off the JD’s values section. I reused the generated stories word-for-word and closed two offers.",
    name: "Omar P.",
    role: "Product Designer → Big Tech",
  },
  {
    quote:
      "The technical drills mirrored the company’s stack. By the time the onsite hit, I had rehearsed their exact scenarios.",
    name: "Sarah D.",
    role: "ML Engineer → GovTech",
  },
];

const faqs = [
  {
    question: "Where do the job postings come from?",
    answer:
      "We monitor LinkedIn, Wellfound, YC, niche communities, and partner channels. Each posting is enriched with stack, visa, compensation, and hiring-signal metadata so you can prioritize quickly.",
  },
  {
    question: "What’s inside a project brief?",
    answer:
      "Prospra turns the JD into a repo outline, milestones, acceptance criteria, suggested tech choices, and talking points. You also get demo prompts and brag-doc snippets so you document progress as you build.",
  },
  {
    question: "How specific is the interview preparation?",
    answer:
      "Behavioral prompts cite the company’s values and recent launches, while technical drills mirror the role’s stack (system design, coding, product sense, or analytics). Each session captures notes for follow-ups.",
  },
  {
    question: "What does the paid plan unlock?",
    answer:
      "Pro members get unlimited project generation, AI companions for postings, analytics on interview performance, mentor feedback, and early access to roadmap releases.",
  },
  {
    question: "Can I keep everything in one workspace?",
    answer:
      "Yes. Application tracking, project assets, interview notes, and templates live together. Upload your own docs or sync GitHub links to keep context centralized.",
  },
  {
    question: "What’s on the roadmap?",
    answer:
      "Resume reviewer and skill-gap analysis are currently being built. They will plug into the same workspace so you can tighten materials and study plans without leaving Prospra.",
  },
];

const integrations = ["Linear", "Notion", "Slack", "Figma", "GitHub", "Jira"];

const aiCompanions = [
  {
    label: "Role Scout",
    description: "Explains every posting with risk signals, interviewer intel, and suggested outreach copy.",
    availability: "Starter + Pro",
  },
  {
    label: "Project Copilot",
    description: "Turns the JD into repo scaffolds, test data, and demo steps so you can start building immediately.",
    availability: "Pro",
  },
  {
    label: "Interview Coach",
    description: "Feeds behavioral story prompts and technical questions tied to that role, then critiques your drafts.",
    availability: "Pro + Lifetime",
  },
];

const roadmapHighlights = [
  {
    title: "Resume Reviewer",
    detail: "Upload a resume and get line-by-line scoring tied back to the jobs in your pipeline. (Coming soon)",
  },
  {
    title: "Skill Gap Analysis",
    detail: "Compare your repos, interview notes, and briefs to the role requirements to surface learning plans. (Coming soon)",
  },
];

const planFeatures = {
  starter: [
    "Unified job posting feed",
    "3 job-specific project briefs / month",
    "Weekly behavioral prompt packs",
    "Community accountability sessions",
  ],
  pro: [
    "Unlimited job-specific project generator runs",
    "AI assistant per role (projects + prep + follow-ups)",
    "Behavioral + technical drill history with analytics",
    "Mentor office hours & async reviews",
  ],
  lifetime: [
    "Everything in Pro",
    "Priority access to resume reviewer (beta) & skill-gap analysis",
    "VIP build weekends & demo days",
    "White-glove onboarding + concierge",
  ],
};

export default function Home() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const plans = useMemo(
    () => [
      {
        name: "Starter",
        price: "$0",
        cadence: "forever",
        description: "Perfect for testing the workflow or tracking a lightweight search.",
        features: planFeatures.starter,
        cta: "Create free workspace",
        highlighted: false,
      },
      {
        name: billingCycle === "monthly" ? "Pro — Monthly" : "Pro — Yearly",
        price: billingCycle === "monthly" ? "$20" : "$13",
        cadence: billingCycle === "monthly" ? "/mo" : "/mo (billed annually)",
        description:
          billingCycle === "monthly"
            ? "Unlimited briefs, analytics, and mentor reviews with the flexibility to pause anytime."
            : "Lock in a 33% discount for long-form searches and ongoing portfolio refresh cycles.",
        features: planFeatures.pro,
        cta: billingCycle === "monthly" ? "Start monthly plan" : "Switch to yearly",
        highlighted: true,
      },
      {
        name: "Lifetime",
        price: "$299",
        cadence: "once",
        description: "Own every update, concierge onboarding, and VIP build weekends forever.",
        features: planFeatures.lifetime,
        cta: "Own it forever",
        highlighted: false,
      },
    ],
    [billingCycle],
  );

  return (
    <div className="bg-slate-950 text-slate-100">
      <main className="relative isolate overflow-hidden">
        <Hero stats={heroStats} />
        <IntegrationsMarquee items={integrations} />
        <section id="product" className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading
            eyebrow="Product"
            title="Designed for focused builders, tuned for shipping fast."
            description="Intuitive controls meet desktop depth so you keep momentum wherever you prep."
          />
          <FeatureRail items={featureTracks} />
        </section>
        <section id="copilots" className="bg-slate-900/50">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <SectionHeading
              eyebrow="AI copilots"
              title="Every major workflow gets a dedicated assistant."
              description="Pro subscribers unlock a specialized AI partner per job posting. Starter users still get guided summaries."
            />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {aiCompanions.map((companion) => (
                <AiCard key={companion.label} {...companion} />
              ))}
            </div>
          </div>
        </section>
        <section id="proof" className="bg-slate-900/60">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <SectionHeading
              eyebrow="Proof"
              title="Builders closing loops faster."
              description="Every win started with the same workflow you can spin up today."
            />
            <TestimonialGrid items={testimonials} />
          </div>
        </section>
        <section id="pricing" className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading
            eyebrow="Plans"
            title="Pick the runway that matches your season."
            description="Monthly flexibility, yearly discipline, or a forever pass when you want set-and-forget access."
          />
          <BillingToggle value={billingCycle} onChange={setBillingCycle} />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </section>
        <section id="faqs" className="bg-slate-900/40">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <SectionHeading
              eyebrow="Questions"
              title="Still vetting the fit?"
              description="Prospra flexes to different workflows. These quick answers highlight what to expect day one."
            />
            <dl className="mt-10 grid gap-4 md:grid-cols-2">
              {faqs.map((faq) => (
                <FaqItem key={faq.question} {...faq} />
              ))}
            </dl>
          </div>
        </section>
        <section className="border-t border-white/10">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Ready?</p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Land faster with an all-in-one job search cockpit.
            </h2>
            <p className="text-slate-300">
              Spin up a workspace in under two minutes and stop juggling screenshots, notes, and docs across devices.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Create free workspace
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-8 py-3 text-sm font-semibold text-white transition hover:border-white"
              >
                Explore demo →
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Hero({ stats }: { stats: typeof heroStats }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute left-6 top-60 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-[140px]" />
        <div className="absolute right-10 top-32 h-48 w-48 rounded-full bg-emerald-400/15 blur-[160px]" />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-6 pb-20 pt-10 lg:flex-row lg:items-center">
        <div className="w-full space-y-8 lg:w-1/2">
          <header className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
            <Link href="/" className="rounded-full border border-white/15 px-4 py-1 text-[11px] text-white transition hover:border-white">
              PROSPRA
            </Link>
          </header>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Keep your job search, projects, and interview prep flowing wherever you are.
            </h1>
            <p className="max-w-2xl text-lg text-slate-300 sm:text-xl">
              Prospra pairs AI-native planning with tactile interaction patterns so you can align targets, ship projects,
              and rehearse loops without juggling tools.
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
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition hover:border-white"
            >
              Watch walkthrough →
            </Link>
          </div>
          <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 sm:grid-cols-3">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>
        <div className="w-full lg:w-1/2">
          <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-white/5 p-6 shadow-[0_30px_120px_rgba(14,165,233,0.25)]">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">Workspace snapshot</div>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Today</p>
                <p className="mt-2 text-xl font-semibold">3 radars firing</p>
                <p className="text-sm text-slate-300">Backfills at fintech, platform squad expansion, new AI design pod.</p>
              </div>
              <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Projects live</p>
                  <p className="text-3xl font-semibold text-white">04</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Loops booked</p>
                  <p className="text-3xl font-semibold text-white">02</p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Next actions</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Record Loom walkthrough for AI infra brief.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-sky-400" />
                    Send follow-up to recruiter after system design mock.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Prep STAR notes for leadership loop.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ value, label, detail }: { value: string; label: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/30">
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-2 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

function FeatureRail({ items }: { items: typeof featureTracks }) {
  return (
    <div className="mt-10 overflow-hidden">
      <div className="flex gap-6 overflow-x-auto pb-4 pt-2 md:grid md:grid-cols-2 md:overflow-visible">
        {items.map((item) => (
          <article
            key={item.title}
            className="min-w-[280px] rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/40 md:min-w-0"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">{item.badge}</p>
            <h3 className="mt-3 text-2xl font-semibold">{item.title}</h3>
            <p className="mt-3 text-sm text-slate-300">{item.summary}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function PillarCard({
  title,
  detail,
  bullets,
}: {
  title: string;
  detail: string;
  bullets: string[];
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/30">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{detail}</span>
      </div>
      <ul className="mt-4 space-y-3 text-sm text-slate-200">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-3">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function JourneyStep({
  label,
  title,
  detail,
}: {
  label: string;
  title: string;
  detail: string;
}) {
  return (
    <li className="rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/30">
      <div className="flex items-center gap-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white">
          {label}
        </span>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="mt-4 text-sm text-slate-300">{detail}</p>
    </li>
  );
}

function TestimonialGrid({ items }: { items: typeof testimonials }) {
  return (
    <div className="mt-10 grid gap-6 md:grid-cols-3" aria-live="polite">
      {items.map((entry) => (
        <figure
          key={entry.name}
          className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/30"
        >
          <blockquote className="text-lg text-white">“{entry.quote}”</blockquote>
          <figcaption className="mt-6 text-sm text-slate-300">
            <p className="font-semibold text-white">{entry.name}</p>
            <p>{entry.role}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function BillingToggle({
  value,
  onChange,
}: {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}) {
  return (
    <div className="mt-8 inline-flex rounded-full border border-white/20 bg-white/5 p-1 text-xs font-semibold text-white">
      <button
        type="button"
        onClick={() => onChange("monthly")}
        className={`rounded-full px-5 py-2 transition ${value === "monthly" ? "bg-white text-slate-900" : "text-slate-300"}`}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange("yearly")}
        className={`rounded-full px-5 py-2 transition ${value === "yearly" ? "bg-white text-slate-900" : "text-slate-300"}`}
      >
        Yearly (save 33%)
      </button>
    </div>
  );
}

type PricingCardProps = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
};

function PricingCard({ highlighted, ...plan }: PricingCardProps) {
  return (
    <article
      className={`flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_70px_rgba(15,23,42,0.35)] ${
        highlighted ? "border-white bg-white/90 text-slate-900" : ""
      }`}
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{plan.name}</p>
        <div className={`flex items-baseline gap-2 text-4xl font-semibold ${highlighted ? "text-slate-900" : "text-white"}`}>
          {plan.price}
          <span className={`text-base font-normal ${highlighted ? "text-slate-500" : "text-slate-400"}`}>{plan.cadence}</span>
        </div>
        <p className={`text-sm ${highlighted ? "text-slate-600" : "text-slate-300"}`}>{plan.description}</p>
      </div>
      <ul className={`mt-6 space-y-3 text-sm ${highlighted ? "text-slate-700" : "text-slate-200"}`}>
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${highlighted ? "bg-slate-900" : "bg-emerald-400"}`} />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href="/sign-up"
        className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold ${
          highlighted ? "bg-slate-900 text-white hover:bg-slate-800" : "border border-white/30 text-white hover:border-white"
        }`}
      >
        {plan.cta}
      </Link>
    </article>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/30">
      <dt className="text-lg font-semibold text-white">{question}</dt>
      <dd className="mt-2 text-sm text-slate-300">{answer}</dd>
    </div>
  );
}

function IntegrationsMarquee({ items }: { items: string[] }) {
  return (
    <section className="border-y border-white/5 bg-slate-950/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 px-6 py-6 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
        {items.map((item) => (
          <span key={item} className="text-slate-400">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function AiCard({ label, description, availability }: { label: string; description: string; availability: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/30">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">{availability}</p>
      <h3 className="mt-3 text-2xl font-semibold text-white">{label}</h3>
      <p className="mt-3 text-sm text-slate-300">{description}</p>
    </article>
  );
}

function RoadmapCard({ title, detail }: { title: string; detail: string }) {
  return (
    <article className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/40">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm text-slate-300">{detail}</p>
    </article>
  );
}

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

function SectionHeading({ eyebrow, title, description, align = "center" }: SectionHeadingProps) {
  return (
    <div className={`space-y-4 ${align === "center" ? "text-center" : ""}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{eyebrow}</p>
      <h2 className="text-3xl font-semibold text-white sm:text-4xl">{title}</h2>
      {description && <p className="text-slate-300">{description}</p>}
    </div>
  );
}
