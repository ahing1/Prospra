"use client";

import { useEffect, useRef, useState } from "react";

import type { CoachMessage, ProjectCoachRequest, ProjectCoachResponse } from "@/types/pro";

type CoachTurn = CoachMessage & {
  createdAt: string;
  next_steps?: string[];
  questions?: string[];
};

const sampleTitle = "Interview prep tracker";
const sampleSummary =
  "Build a small web app that lets candidates log target companies, store JD snippets, and track outreach status with reminders.";
const sampleStack = "Next.js, FastAPI, PostgreSQL";
const sampleStage = "MVP flow: auth, CRUD for targets, reminders";
const sampleJobDescription =
  "We are hiring a full-stack engineer to build candidate-facing features in Next.js and FastAPI. You will ship project trackers, outreach workflows, and integrate Stripe for paid subscriptions.";

const splitStack = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

type ProjectCoachProps = {
  defaultJobDescription?: string;
  defaultRole?: string;
};

export default function ProjectCoach({ defaultJobDescription = "", defaultRole }: ProjectCoachProps) {
  const [title, setTitle] = useState(defaultRole || sampleTitle);
  const [summary, setSummary] = useState(sampleSummary);
  const [stackInput, setStackInput] = useState(sampleStack);
  const [stage, setStage] = useState(sampleStage);
  const [jobDescription, setJobDescription] = useState(defaultJobDescription || sampleJobDescription);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<CoachTurn[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages]);

  const resetSample = () => {
    setTitle(defaultRole || sampleTitle);
    setSummary(sampleSummary);
    setStackInput(sampleStack);
    setStage(sampleStage);
    setJobDescription(defaultJobDescription || sampleJobDescription);
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSending) return;

    const trimmedTitle = title.trim();
    const trimmedSummary = summary.trim();
    const trimmedPrompt = prompt.trim();
    const trimmedStage = stage.trim();

    if (!trimmedTitle || !trimmedSummary) {
      setError("Add a project title and summary so the coach has context.");
      return;
    }
    const initialPrompt = trimmedPrompt || "Outline the first steps to start this project.";

    setError(null);
    const history: CoachMessage[] = messages.map(({ role, content }) => ({ role, content }));
    const userTurn: CoachTurn = { role: "user", content: initialPrompt, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userTurn]);
    setIsSending(true);

    const payload: ProjectCoachRequest = {
      project_title: trimmedTitle,
      project_summary: trimmedSummary,
      tech_stack: splitStack(stackInput),
      stage: trimmedStage || null,
      user_message: initialPrompt,
      history,
    };

    try {
      const response = await fetch("/api/pro/project-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: ProjectCoachResponse & { error?: string } = await response.json();
      if (!response.ok || !data?.message) {
        throw new Error(data?.error || "The coach could not answer right now.");
      }
      const assistantTurn: CoachTurn = {
        role: "assistant",
        content: data.message,
        createdAt: new Date().toISOString(),
        next_steps: data.next_steps || [],
        questions: data.questions || [],
      };
      setMessages((prev) => [...prev, assistantTurn]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reach the coach.";
      setError(message);
    } finally {
      setPrompt("");
      setIsSending(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,1.15fr]">
      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Project brief</p>
            <h2 className="text-xl font-semibold text-white">What are you building?</h2>
            <p className="text-sm text-slate-200">
              Give the coach enough detail to teach patterns, not hand you code. Stack and stage help steer the guidance.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-100">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Example: Portfolio-ready project studio"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white placeholder:text-slate-500 focus:border-white/40 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-100">Outcome you want</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              placeholder="Describe the problem, users, and what success looks like."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white placeholder:text-slate-500 focus:border-white/40 focus:outline-none"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-100">Stack (comma separated)</label>
              <input
                value={stackInput}
                onChange={(e) => setStackInput(e.target.value)}
                placeholder="Next.js, FastAPI, PostgreSQL"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white placeholder:text-slate-500 focus:border-white/40 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-100">Current stage</label>
              <input
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                placeholder="Designing schema, wiring auth, testing payments..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white placeholder:text-slate-500 focus:border-white/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-100">Job description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              placeholder="Paste the relevant parts of the JD so the coach can tailor first steps."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white placeholder:text-slate-500 focus:border-white/40 focus:outline-none"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-6 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Project coach</p>
            <h2 className="text-xl font-semibold text-white">Ask for guidance, not answers</h2>
            <p className="text-sm text-emerald-50">
              The assistant will probe, outline options, and nudge you toward the next experiment instead of dumping code.
            </p>
          </div>
          <div className="rounded-full border border-emerald-200/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-50">
            Pro only
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-300/40 bg-rose-300/10 px-4 py-3 text-sm text-rose-50">
            {error}
          </div>
        )}

        <div
          ref={historyRef}
          className="h-[360px] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          {messages.length === 0 ? (
            <div className="space-y-2 text-sm text-emerald-50">
              <p>Share what you are building and ask something specific like:</p>
              <ul className="list-disc space-y-1 pl-5 text-emerald-100">
                <li>"How should I break the API into milestones without overbuilding?"</li>
                <li>"What tests prove the payment flow is solid before launch?"</li>
                <li>"How do I practice explaining this project in interviews?"</li>
              </ul>
            </div>
          ) : (
            messages.map((turn, index) => {
              const isAssistant = turn.role === "assistant";
              return (
                <div
                  key={`${turn.role}-${turn.createdAt}`}
                  className={`space-y-2 rounded-2xl border p-4 ${
                    isAssistant
                      ? "border-emerald-200/60 bg-emerald-50/10"
                      : "border-white/15 bg-slate-950/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em]">
                    <span className={isAssistant ? "text-emerald-100" : "text-slate-300"}>
                      {isAssistant ? "Coach" : "You"}
                    </span>
                    <span className="text-slate-400">
                      {new Date(turn.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-line text-sm text-white/90">{turn.content}</p>
                  {isAssistant && turn.next_steps && turn.next_steps.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">Next steps</p>
                      <ul className="space-y-1 text-sm text-emerald-50">
                        {turn.next_steps.map((step, stepIndex) => (
                          <li
                            key={`${step}-${stepIndex}`}
                            className="rounded-xl border border-emerald-200/30 bg-emerald-200/5 px-3 py-2"
                          >
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {isAssistant && turn.questions && turn.questions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">Questions to answer</p>
                      <ul className="space-y-1 text-sm text-emerald-50">
                        {turn.questions.map((question, questionIndex) => (
                          <li
                            key={`${question}-${questionIndex}`}
                            className="rounded-xl border border-emerald-200/30 bg-emerald-200/5 px-3 py-2"
                          >
                            {question}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          )}
          {isSending && (
            <div className="flex items-center justify-start gap-2 rounded-2xl border border-emerald-200/40 bg-emerald-200/10 px-4 py-2 text-sm text-emerald-50">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" aria-hidden />
              <span>Coach is thinking...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            What do you want to work through?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: I want to sketch the FastAPI modules for the project tracker without over-engineering."
            className="min-h-[100px] w-full rounded-2xl border border-white/20 bg-slate-950/60 p-3 text-sm text-white placeholder:text-slate-500 focus:border-white/40 focus:outline-none"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-emerald-100">
              The coach will keep answers under 220 words, favor hints, and ask for your decisions before proceeding.
            </p>
            <button
              type="submit"
              disabled={isSending}
              className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                isSending
                  ? "cursor-not-allowed border border-white/15 bg-white/10 text-slate-300"
                  : "border border-white/30 bg-white/10 text-white hover:border-white/60"
              }`}
            >
              {isSending ? "Coaching..." : "Ask the coach"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
