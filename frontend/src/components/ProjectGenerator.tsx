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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          placeholder="Paste job description here"
          className="w-full p-3 border rounded"
          rows={6}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="Software Engineer">Software Engineer</option>
          <option value="Data Scientist">Data Scientist</option>
          <option value="Product Manager">Product Manager</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Generating..." : "Generate Project"}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {project && (
        <div className="p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-bold">{project.title}</h2>
          <p className="mb-2">{project.summary}</p>

          <h3 className="font-semibold mt-4">Tech Stack:</h3>
          <ul className="list-disc list-inside">
            {project.tech_stack.map((tech: string, i: number) => (
              <li key={i}>{tech}</li>
            ))}
          </ul>

          <h3 className="font-semibold mt-4">Implementation Steps:</h3>
          <ol className="list-decimal list-inside">
            {project.implementation_steps.map((step: string, i: number) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
