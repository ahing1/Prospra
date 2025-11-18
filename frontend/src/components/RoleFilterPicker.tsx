"use client";

import { useMemo, useState } from "react";

type RoleFilterPickerProps = {
  initialSelected?: string[];
  options?: string[];
};

const DEFAULT_OPTIONS = ["frontend", "backend", "machine learning", "product", "design"];

export default function RoleFilterPicker({
  initialSelected = [],
  options = DEFAULT_OPTIONS,
}: RoleFilterPickerProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    Array.from(new Set(initialSelected.map((role) => role.toLowerCase().trim()).filter(Boolean))),
  );
  const [customValue, setCustomValue] = useState("");

  const toggleRole = (role: string) => {
    const normalized = role.toLowerCase().trim();
    if (!normalized) return;
    setSelectedRoles((prev) => (prev.includes(normalized) ? prev.filter((item) => item !== normalized) : [...prev, normalized]));
  };

  const addCustomRole = () => {
    const normalized = customValue.toLowerCase().trim();
    if (!normalized) return;
    if (!selectedRoles.includes(normalized)) {
      setSelectedRoles((prev) => [...prev, normalized]);
    }
    setCustomValue("");
  };

  const optionButtons = useMemo(() => options.map((opt) => opt.toLowerCase()), [options]);

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap gap-2">
        {optionButtons.map((role) => {
          const active = selectedRoles.includes(role);
          return (
            <button
              key={role}
              type="button"
              onClick={() => toggleRole(role)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                active ? "border-white/70 bg-white text-slate-900 shadow" : "border-white/20 bg-slate-950/30 text-white"
              }`}
              aria-pressed={active}
            >
              <span
                className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${
                  active ? "bg-slate-900 text-white" : "bg-white/10 text-transparent"
                }`}
              >
                ✓
              </span>
              {role}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={customValue}
          onChange={(event) => setCustomValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustomRole();
            }
          }}
          placeholder="Add custom role keyword"
          className="flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-white/40 focus:outline-none"
        />
        <button
          type="button"
          onClick={addCustomRole}
          className="rounded-2xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:border-white"
        >
          Add
        </button>
      </div>

      {selectedRoles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedRoles.map((role) => (
            <div
              key={role}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white"
            >
              <span>{role}</span>
              <button
                type="button"
                onClick={() => toggleRole(role)}
                className="rounded-full bg-white/20 px-2 py-1 text-[10px] leading-none text-white"
                aria-label={`Remove ${role}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedRoles.map((role) => (
        <input key={role} type="hidden" name="roles" value={role} />
      ))}
    </div>
  );
}
