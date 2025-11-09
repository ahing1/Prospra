"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const navLinks = [
  { href: "/#product", label: "Product" },
  { href: "/#workflow", label: "Workflow" },
  { href: "/#community", label: "Community" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (!isLanding) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-[0.4em] text-white">
          PROSPRA
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-300 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors duration-300 hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <SignedOut>
            <div className="flex items-center gap-3">
              <SignInButton>
                <button className="rounded-full border border-white/20 px-4 py-2 text-white transition hover:border-white">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="rounded-full bg-white px-5 py-2 text-slate-900 transition hover:bg-slate-200">
                  Get started
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
      <nav className="mx-auto mt-2 flex w-full max-w-6xl items-center gap-4 overflow-x-auto px-6 pb-3 text-xs font-semibold text-slate-400 md:hidden">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap rounded-full border border-white/10 px-3 py-1 transition hover:border-white hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
