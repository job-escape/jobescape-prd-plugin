# Changelog

## 0.9.0 — 2026-07-12

Interview rules driven by a five-condition simulation benchmark (writer agents running the skill blind against gold Homepage artifacts, scored on a frozen 144-fact inventory), plus a structural rewrite of `prd-writer`.

**New interview rules** (each traces to a failure replicated across benchmark runs):

- **Dictation mode** — a feature walkthrough counts as a complete brief; Problem/Goals are derived and confirmed at review instead of interrogated up front. (Checklist round-1 answers were PM-invented in 6/6 runs.)
- **Loop-walk** in a strengthened, always-mandatory flow pass — per reachable destination, per platform: where does back go, where does finishing land, does origin change it. (Return/completion paths missed in 5/5 scored runs.)
- **Audience & rollout checklist item** — experiment mechanics (split, assignment moment, control experience, existing users) asked directly. (Never asked unprompted in any run.)
- **Design-pending protocol** — no final PRD while a promised design is outstanding; design arrival triggers a cross-check against the draft. (Both staged-condition runs declared premature finals.)
- **S-table frame-exists rule** — a state is "designed" only if a frame for it exists; else "specified, no frame". (Design-status overclaims were the largest fabrication source.)
- **Service-ID guardrail** — ask the service and platform spread; never infer from vocabulary. (All 6 writers misidentified the service.)
- **Analytics deferral valve** — one PM deferral closes the topic; Section 6 becomes a single owned TBD.
- **PM-stated identifier carve-out** — events/systems the PM names stay in the PRD verbatim; the technical-content ban applies to writer-introduced detail only.
- **Mid-interview escape question** on long interviews, in addition to close-out.
- Explicit precedence: "just draft it" overrides the ledger exit rule, never the design-pending final ban.

**Structured-YAML deliverable** (format experiment winner — four re-expressions of the gold PRD were compared as coding-agent input; structured YAML won):

- The final PRD is now `prd.yaml` (canonical, machine-first: typed requirement rows — id/status/screen/component/initial state/trigger/resulting state/per-platform design nodes/side effect/analytics — plus a flow map of forward/return edges, F-step groups, per-screen design status, reuse-of-existing-entities, and open items with `affected_r_ids` back-references) plus a generated human render `prd.md`. Interview drafts shown to the PM stay human-readable; the YAML compile happens at close-out.
- `prd-lint.py` gained a YAML mode: ID uniqueness/gaps (Q gaps exempt — resolved ids retire), dangling `TBD → Qn` statuses, open-item owner/needed-by, `affected_r_ids` existence + reverse-sync, screens status presence, designed-without-nodes and unreturned-flow-edge warnings.
- New always-on rules folded in from the regression run: never renumber IDs across versions (including the pre-design snapshot transition), and never settle absence — a brushed-off question is an open item, not a "no X is defined" claim.

**Restructure** (same content, progressive loading):

- `prd-writer/SKILL.md` reduced from a 417-line monolith to a ~115-line hub (always-on principles, step sequence, trigger→reference load table).
- Phase protocols moved to `references/`: `behavior-tools.md`, `design-intake.md`, `flow-pass.md`, `template.md`, `audits.md` — each rule lives in exactly one place.
- New `scripts/prd-lint.py`: mechanical draft checks (dangling `TBD → Qn` refs, duplicate/missing IDs, missing owners, missing Version line, empty S-table statuses) with loop-walk and design-status warning heuristics.

## 0.8.0

Design-first intake: inventory-driven interview with coverage ledger. Structured Figma ingest (per-screen inventory incl. undrawn states, tier triage), per-screen question rounds with a running settled/open ledger, mandatory flow pass, ledger close-out with hard exit rule, fatigue valves, time-pressure triage.

## 0.6.0

Machine-first PRD template: atomic R-rows, stable R/NG/S/Q IDs, per-screen design status table. PRD content restricted to product-only (no technical sections); Behavior Codebase MCP integration (automatic collision check, current-behavior probes, deep pre-handoff re-verify; `frontend-alpha` direct, `jobescape-app` via proxy).
