"use client";

import { useState } from "react";

export default function JobInputForm() {
  const [jobDesc, setJobDesc] = useState("");
  const [role, setRole] = useState("SWE");
  const [questions, setQuestions] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("http://localhost:8000/generate/behavioral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_description: jobDesc, role }),
    });
    const data = await res.json();
    setQuestions(data.questions || []);
    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          placeholder="Paste the job description here"
          className="w-full p-3 border rounded"
          rows={6}
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="SWE">Software Engineer</option>
          <option value="DS">Data Scientist</option>
          <option value="PM">Product Manager</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Questions"}
        </button>
      </form>

      {questions && (
        <div className="mt-6 space-y-2">
          <h2 className="text-xl font-semibold">Behavioral Questions</h2>
          {questions.map((q, i) => (
            <div key={i} className="p-3 border rounded bg-gray-100">{q}</div>
          ))}
        </div>
      )}
    </div>
  );
}
