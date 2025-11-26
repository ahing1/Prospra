"use client";

import { useState } from "react";

import ProjectCoach from "@/components/ProjectCoach";
import BehavioralInterviewAssistant from "@/components/BehavioralInterviewAssistant";

type ProTool = "project" | "behavioral";

const toolCards: Array<{
  id: ProTool;
  title: string;
  summary: string;
  badge: string;
  status: "live" | "coming-soon";
}> = [
  {
    id: "project",
    title: "Project assistant",
    summary: "Map a scoped build with hints, checkpoints, and coaching questions.",
    badge: "Live",
    status: "live",
  },
  {
    id: "behavioral",
    title: "Behavioral assistant",
    summary: "Simulate behavioral interviews with STAR feedback, tailored to your JD.",
    badge: "Live",
    status: "live",
  },
];

function BehavioralAssistantComingSoon() {
  return <BehavioralInterviewAssistant />;
}

export default function ProWorkspace() {
  const [activeTool, setActiveTool] = useState<ProTool | null>(null);

  const renderActivePane = () => {
    if (!activeTool) {
      return (
        <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-10 text-center text-slate-200">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Choose a Pro assistant</p>
          <p className="mt-4 text-lg text-white">Pick one of the cards above to start building or prepping.</p>
        </div>
      );
    }
    if (activeTool === "behavioral") {
      return <BehavioralAssistantComingSoon />;
    }
    return <ProjectCoach />;
  };

  return (
    <section className="space-y-8 rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur">
      <div className="grid gap-4 sm:grid-cols-2">
        {toolCards.map((tool) => {
          const active = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => setActiveTool(tool.id)}
              className={`flex h-full flex-col justify-between rounded-3xl border p-6 text-left transition ${
                active ? "border-white bg-white/10" : "border-white/15 hover:border-white/35"
              }`}
            >
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Pro option</p>
                <h3 className="text-2xl font-semibold text-white">{tool.title}</h3>
                <p className="text-sm text-slate-200">{tool.summary}</p>
              </div>
              <div className="mt-4">
                <span
                  className={`inline-flex rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${
                    tool.status === "live"
                      ? "border border-emerald-300/40 text-emerald-200"
                      : "border border-white/30 text-slate-300"
                  }`}
                >
                  {tool.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {renderActivePane()}
    </section>
  );
}
