# AGENT PLAYBOOKS

## Purpose
This repository can spin up different helper roles for Codex (the coding agent) without changing code. Keeping their instructions in versioned Markdown makes expectations explicit and easy to iterate on with pull requests.

## How To Use This File
1. Pick or create a role description that matches the task at hand.
2. Reference the file when you brief Codex (e.g. `Use the guidelines from agents/data-engineer.md`).
3. Summarize any deltas from the file directly in your request so Codex can acknowledge the context before acting.

## Shared Guardrails For Every Agent
- Keep responses reproducible, cite files + line numbers, and call out unknowns.
- Prefer incremental, testable changes; list verification steps or test gaps.
- Flag risky operations (schema changes, infra edits, destructive migrations) and wait for confirmation if needed.
- Document any new configuration, secrets usage, or runbook updates in-line.

## Project Memory (Reusable Context)
Use this section as a living scratchpad for canonical facts you want every future Codex session to remember (architecture choices, data contracts, active experiments, naming conventions, etc.). When an update matters across domains, capture it here in plain English before adding domain-specific copies.

### How To Maintain The Memory
- Log each entry with a short title, date, and owner so it is easy to audit.
- Focus on decisions, constraints, and recurring workflows rather than transient todos.
- When an item becomes obsolete, cross it out (~~like this~~) or move it to an archive subsection to preserve history.

