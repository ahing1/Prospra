"use client";

import { useOptimistic, useTransition } from "react";

import { saveJobAction, unsaveJobAction } from "@/app/dashboard/jobs/actions";
import type { JobListing } from "@/types/jobs";

type SaveJobButtonProps = {
  job: JobListing;
  jobId?: string | null;
  isSaved: boolean;
};

export default function SaveJobButton({ job, jobId, isSaved }: SaveJobButtonProps) {
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(isSaved);
  const [isPending, startTransition] = useTransition();

  const disabled = !jobId || isPending;

  const toggle = () => {
    if (!jobId) {
      return;
    }
    startTransition(async () => {
      try {
        if (optimisticSaved) {
          setOptimisticSaved(false);
          await unsaveJobAction(jobId);
        } else {
          setOptimisticSaved(true);
          await saveJobAction(job);
        }
      } catch (error) {
        // revert optimistic flag if request fails
        setOptimisticSaved(isSaved);
        console.error("Failed to toggle saved job state", error);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition ${
        optimisticSaved
          ? "border-emerald-400 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20"
          : "border-white/20 text-white hover:border-white/60"
      } ${disabled ? "opacity-60" : ""}`}
    >
      {optimisticSaved ? "Saved" : "Save job"}
    </button>
  );
}
