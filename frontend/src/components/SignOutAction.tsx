"use client";

import { SignOutButton } from "@clerk/nextjs";

export default function SignOutAction() {
  return (
    <SignOutButton redirectUrl="/">
      <button
        type="button"
        className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60"
      >
        Sign out
      </button>
    </SignOutButton>
  );
}
