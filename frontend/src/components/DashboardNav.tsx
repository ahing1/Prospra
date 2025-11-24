"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type DashboardNavProps = { className?: string; isPro?: boolean };

const baseDashboardNavLinks = [
  { href: "/dashboard", label: "Overview", hint: "Home base" },
  { href: "/dashboard/project-studio", label: "Project Studio", hint: "Scope builds" },
  { href: "/dashboard/jobs", label: "Job Radar", hint: "Browse roles" },
  { href: "/dashboard/interview-lab", label: "Interview Lab", hint: "Behavioral prep" },
  { href: "/dashboard/profile", label: "Profile", hint: "Account" },
];

const proNavLink = { href: "/dashboard/pro", label: "Pro Lab", hint: "Coming soon" };

function isLinkActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname.startsWith(href);
}

export default function DashboardNav({ className = "", isPro }: DashboardNavProps) {
  const pathname = usePathname();
  const [isPaid, setIsPaid] = useState<boolean>(Boolean(isPro));

  useEffect(() => {
    if (typeof isPro === "boolean") {
      setIsPaid(isPro);
      return;
    }

    let cancelled = false;
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/billing/status");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.entitled) {
          setIsPaid(true);
        }
      } catch (error) {
        console.error("Unable to fetch billing status for nav", error);
      }
    };
    fetchStatus();
    return () => {
      cancelled = true;
    };
  }, [isPro]);

  const navLinks = isPaid ? [...baseDashboardNavLinks, proNavLink] : baseDashboardNavLinks;

  return (
    <nav
      aria-label="Dashboard navigation"
      className={`flex w-full flex-wrap gap-3 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white ${className}`}
    >
      {navLinks.map((link) => {
        const active = isLinkActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 transition ${
              active ? "border-white bg-white/10" : "border-white/10 hover:border-white/40"
            }`}
          >
            <span>{link.label}</span>
            <span className="text-xs text-slate-400">{link.hint}</span>
          </Link>
        );
      })}
    </nav>
  );
}
