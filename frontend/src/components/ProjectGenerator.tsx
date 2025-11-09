"use client";

import { useState } from "react";
import api from "@/lib/axios";

export default function ProjectGenerator() {
  const [jobDesc, setJobDesc] = useState("");
  const [role, setRole] = useState("Software Engineer");
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProject(null);
    setError("");

    try {
      const res = await api.post("/generate/project-helper", {
        job_description: jobDesc,
        role
      });

      setProject(res.data);
    } catch (err: any) {
      setError("Failed to generate project.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Generate a scoped project</h2>
        <p className="text-sm text-slate-300">
          Capture the core responsibilities from any job description and Prospra will outline a build plan you can ship and talk about in interviews.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="job-desc" className="text-sm font-semibold text-slate-200">
            Job description
          </label>
          <textarea
            id="job-desc"
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste the role posting, responsibilities, and requirements..."
            className="min-h-[200px] w-full rounded-2xl border border-white/10 bg-slate-900 text-slate-50 placeholder:text-slate-400 focus:border-white/40 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-semibold text-slate-200">
            Target role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/90 p-3 text-sm text-slate-900 shadow-inner focus:border-white/40 focus:outline-none"
          >
            <option className="text-slate-900" value="Software Engineer">
              Software Engineer
            </option>
            <option className="text-slate-900" value="Data Scientist">
              Data Scientist
            </option>
            <option className="text-slate-900" value="Product Manager">
              Product Manager
            </option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate Project Blueprint"}
        </button>
      </form>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      {project && (
        <div className="rounded-3xl border border-white/10 bg-white p-6 text-slate-900 shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">Draft ready</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">{project.title}</h3>
          <p className="mt-2 text-sm text-slate-600">{project.summary}</p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Tech stack
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-800">
                {project.tech_stack.map((tech: string, i: number) => (
                  <li
                    key={tech + i}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Implementation steps
              </h4>
              <ol className="mt-3 space-y-2 text-sm text-slate-800">
                {project.implementation_steps.map((step: string, i: number) => (
                  <li key={step + i} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
                    <span className="font-semibold text-slate-500">{i + 1}.</span> {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
