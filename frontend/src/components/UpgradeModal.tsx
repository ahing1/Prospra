"use client";

import { useState } from "react";

import UpgradeButton from "@/components/UpgradeButton";

type UpgradeModalProps = {
  triggerLabel?: string;
  title?: string;
  description?: string;
};

export default function UpgradeModal({
  triggerLabel = "Upgrade to Pro",
  title = "Unlock Pro access",
  description = "Pick a plan to enable the full workspace experience.",
}: UpgradeModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60"
      >
        {triggerLabel}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="mt-1 text-sm text-slate-300">{description}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/60"
                aria-label="Close upgrade dialog"
              >
                Close
              </button>
            </div>
            <div className="mt-6">
              <UpgradeButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
