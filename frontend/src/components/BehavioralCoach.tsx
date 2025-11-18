"use client";

import { FormEvent, useEffect, useState } from "react";
import api from "@/lib/axios";
import type { BehavioralInterviewResponse } from "@/types/behavioral";

type BehavioralCoachProps = {
  defaultJobDescription?: string;
  defaultRole?: string;
  defaultSeniority?: string;
};

const focusAreaPresets = [
  "Leadership alignment",
  "Cross-functional collaboration",
  "Ownership & accountability",
  "Working with ambiguity",
  "Stakeholder communication",
  "Conflict navigation",
  "Hiring & mentorship",
  "Culture contribution",
];

const seniorityOptions = ["", "Junior", "Mid", "Senior", "Lead", "Manager", "Director"];

export default function BehavioralCoach({
  defaultJobDescription = "",
  defaultRole = "Software Engineer",
  defaultSeniority = "Senior",
}: BehavioralCoachProps) {
  const [jobDescription, setJobDescription] = useState(defaultJobDescription);
  const [role, setRole] = useState(defaultRole);
  const [seniority, setSeniority] = useState(defaultSeniority);
  const [focusAreas, setFocusAreas] = useState<string[]>(["Leadership alignment", "Cross-functional collaboration"]);
  const [customFocus, setCustomFocus] = useState("");
  const [numQuestions, setNumQuestions] = useState(4);
  const [result, setResult] = useState<BehavioralInterviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJobDescription(defaultJobDescription);
  }, [defaultJobDescription]);

  useEffect(() => {
    setRole(defaultRole);
  }, [defaultRole]);

  useEffect(() => {
    setSeniority(defaultSeniority);
  }, [defaultSeniority]);

  const toggleFocusArea = (area: string) => {
    setFocusAreas((prev) => (prev.includes(area) ? prev.filter((item) => item !== area) : [...prev, area]));
  };

  const addCustomFocus = () => {
    const normalized = customFocus.trim();
    if (!normalized || focusAreas.includes(normalized)) return;
    setFocusAreas((prev) => [...prev, normalized]);
    setCustomFocus("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedDescription = jobDescription.trim();
    const trimmedRole = role.trim();

    if (trimmedDescription.length < 30) {
      setError("Please provide more context in the job description (30+ characters).");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data } = await api.post<BehavioralInterviewResponse>("/behavioral/generate", {
        job_description: trimmedDescription,
        role: trimmedRole || "Software Engineer",
        seniority: seniority || undefined,
        focus_areas: focusAreas.filter(Boolean),
        num_questions: numQuestions,
      });
      setResult(data);
    } catch (err) {
      console.error("Failed to generate behavioral questions", err);
      setError("Unable to generate prompts right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Behavioral Interview Coach</h2>
        <p className="text-sm text-slate-300">
          Paste the JD, signal the soft skills that matter, and receive STAR-ready prompts with coaching notes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="behavioral-jd" className="text-sm font-semibold text-slate-200">
            Job description
          </label>
          <textarea
            id="behavioral-jd"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste responsibilities, values, or the full role posting..."
            className="min-h-[200px] w-full rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-white/40 focus:outline-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="behavioral-role" className="text-sm font-semibold text-slate-200">
              Role title
            </label>
            <input
              id="behavioral-role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/90 p-3 text-sm text-slate-900 shadow-inner focus:border-white/40 focus:outline-none"
              placeholder="Senior Software Engineer"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="behavioral-seniority" className="text-sm font-semibold text-slate-200">
              Seniority (optional)
            </label>
            <select
              id="behavioral-seniority"
              value={seniority}
              onChange={(event) => setSeniority(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/90 p-3 text-sm text-slate-900 shadow-inner focus:border-white/40 focus:outline-none"
            >
              {seniorityOptions.map((option) => (
                <option key={option || "blank"} value={option}>
                  {option || "Not specified"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="text-sm font-semibold text-slate-200">Focus areas</label>
            <p className="text-xs text-slate-400">
              Signals to emphasize (STAR themes, collaboration, leadership, etc.)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {focusAreaPresets.map((area) => {
              const selected = focusAreas.includes(area);
              return (
                <button
                  type="button"
                  key={area}
                  onClick={() => toggleFocusArea(area)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    selected
                      ? "border-sky-200 bg-gradient-to-r from-white to-sky-100/80 text-slate-900 shadow shadow-sky-500/30"
                      : "border-white/20 bg-white/5 text-slate-200 hover:border-white/40"
                  }`}
                  aria-pressed={selected}
                >
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                      selected ? "border-sky-500 bg-sky-500 text-white" : "border-white/20 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  {area}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              value={customFocus}
              onChange={(event) => setCustomFocus(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addCustomFocus();
                }
              }}
              placeholder="Add custom focus..."
              className="flex-1 rounded-2xl border border-white/10 bg-white/80 p-3 text-sm text-slate-900 shadow-inner focus:border-white/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={addCustomFocus}
              className="rounded-2xl border border-white/30 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/70"
            >
              Add
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="behavioral-count" className="text-sm font-semibold text-slate-200">
            Number of questions
          </label>
          <div className="flex items-center gap-4">
            <input
              id="behavioral-count"
              type="range"
              min={2}
              max={8}
              value={numQuestions}
              onChange={(event) => setNumQuestions(parseInt(event.target.value, 10))}
              className="flex-1 accent-white"
            />
            <span className="w-12 rounded-2xl border border-white/20 bg-white/10 py-1 text-center text-sm font-semibold text-white">
              {numQuestions}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating prompts..." : "Generate behavioral questions"}
        </button>
      </form>

      {loading && <BehavioralCoachLoading role={role} focusAreas={focusAreas} />}

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.35)]">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Generated prompts</p>
            <h3 className="text-2xl font-semibold text-white">
              {result.role}
              {result.seniority ? ` · ${result.seniority}` : ""}
            </h3>
            <p className="text-sm text-slate-300">Each card includes why it matters plus notes for your STAR story.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {result.questions.map((question, index) => (
              <article
                key={question.question.slice(0, 40) + index}
                className="flex flex-col rounded-3xl border border-white/10 bg-slate-950/60 p-5"
              >
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  <span>Prompt {index + 1}</span>
                  <span>STAR cadence</span>
                </div>
                <h4 className="mt-3 text-lg font-semibold text-white">{question.question}</h4>
                <p className="mt-2 text-sm text-slate-300">{question.why_it_matters}</p>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Coaching points</p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-200">
                      {question.coaching_points.map((point, idx) => (
                        <li key={point + idx} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Signals</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                      {question.signals.map((signal, signalIndex) => (
                        <span
                          key={`${signal}-${signalIndex}`}
                          className="rounded-full border border-slate-400/40 px-3 py-1 text-slate-200"
                        >
                          {signal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BehavioralCoachLoading({ role, focusAreas }: { role: string; focusAreas: string[] }) {
  return (
    <div className="rounded-[32px] border border-white/15 bg-slate-950/60 p-6 text-slate-200 shadow-[0_25px_70px_rgba(56,189,248,0.2)] backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="relative h-3 w-3">
          <span className="absolute inset-0 animate-ping rounded-full bg-sky-400/70" />
          <span className="relative block h-3 w-3 rounded-full bg-sky-300" />
        </div>
        <p className="text-sm font-semibold">Generating prompts for {role}…</p>
      </div>
      <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">
        Focus: {focusAreas.length ? focusAreas.join(", ") : "default signal mix"}
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[0, 1].map((idx) => (
          <div key={idx} className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-inner">
            <div className="h-3 w-32 rounded-full bg-white/10" />
            <div className="h-4 w-full rounded-full bg-white/10" />
            <div className="h-4 w-3/4 rounded-full bg-white/10" />
            <div className="flex gap-2">
              {[0, 1, 2].map((chip) => (
                <span key={chip} className="h-6 w-16 rounded-full bg-white/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
