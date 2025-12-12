"use client";

import { useMemo, useState } from "react";

export type BillingPlan = "monthly" | "lifetime";

type UpgradeButtonProps = {
  currentPlan?: BillingPlan | null;
};

const planOptions: Array<{
  id: BillingPlan;
  name: string;
  headline: string;
  description: string;
}> = [
  {
    id: "monthly",
    name: "Monthly",
    headline: "$20 / month",
    description: "Best for trying Prospra with a low monthly commitment.",
  },
  {
    id: "lifetime",
    name: "Lifetime",
    headline: "$200 one-time",
    description: "Pay once and unlock unlimited job radar & interview prep.",
  },
];

export default function UpgradeButton({ currentPlan }: UpgradeButtonProps) {
  const normalizedCurrentPlan = useMemo<BillingPlan | null>(() => {
    if (currentPlan === "monthly" || currentPlan === "lifetime") {
      return currentPlan;
    }
    return null;
  }, [currentPlan]);

  // Lifetime members should not see upgrade options.
  if (normalizedCurrentPlan === "lifetime") {
    return null;
  }

  const availablePlans = planOptions.filter((plan) => plan.id !== normalizedCurrentPlan);
  const defaultPlan = availablePlans[0]?.id ?? "monthly";

  const [selectedPlan, setSelectedPlan] = useState<BillingPlan>(defaultPlan);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startCheckout = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.checkout_url) {
        throw new Error(payload?.error ?? "Unable to start checkout.");
      }
      window.location.href = payload.checkout_url;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start checkout.";
      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {availablePlans.map((plan) => {
          const isActive = selectedPlan === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                isActive ? "border-emerald-300 bg-emerald-300/10 text-white" : "border-white/15 text-slate-200 hover:border-white/40"
              }`}
              aria-pressed={isActive}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em]">{plan.name}</p>
                  <p className="text-sm text-slate-300">{plan.description}</p>
                </div>
                <p className="text-base font-semibold text-white">{plan.headline}</p>
              </div>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={startCheckout}
        disabled={isLoading}
        className={`inline-flex w-full items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold transition ${
          isLoading ? "cursor-not-allowed border-white/20 text-slate-400" : "border-white/40 text-white hover:border-white"
        }`}
      >
        {isLoading ? "Preparing checkout..." : "Continue to checkout"}
      </button>
      {errorMessage && <p className="text-sm text-rose-300">{errorMessage}</p>}
    </div>
  );
}
