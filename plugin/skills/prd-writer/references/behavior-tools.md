# Checking current behavior — the behavior tools

Read this when the service is `frontend-alpha` or `jobescape-app`. For `funnel`, `editscape`, and `funnel-constructor-editor` the tools do not apply — use ask/TBD per Core principle 2.

The Behavior Codebase MCP may be connected to this session. It answers *current-behavior* questions against a hosted read-only codebase checkout, returning product-level answers (existing behavior, conditions and gates, PRD implications, gaps):

- `check_prd_collisions` — proactively compares the PRD idea/design against existing behavior and returns evidence-backed collisions.
- `check_existing_behavior` — answers targeted probes ("what currently happens when a user exits a lesson?"). Modes: `graph` (instant, no live analysis — try first), `quick` (live probe — for probes that come back `unresolved` from graph mode), `deep` (higher rigor — reserve for final handoff checks).
- `list_behavior_repos` — lists covered repositories and graph coverage.

## Rules of use

- **Coverage.** Only the `frontend-alpha` repo is indexed (backend behavior surfaces automatically via cross-repo links). Use it directly for `frontend-alpha` PRDs. For `jobescape-app` PRDs, probe `frontend-alpha` as a **proxy** — the web app shares most of its logic with the mobile app — and label every proxy finding when relaying it: *"in the web app, X happens today — does the mobile app match?"* Parity is a PM confirmation, never a fact.
- **Tool output is background, like the per-service skills.** Findings inform what you write and which questions you ask; code evidence, file paths, and tool jargon never enter the PRD or questions to the PM. Relay findings in plain product language.
- **Findings are facts about today, not decisions about tomorrow.** "The lesson header already auto-saves on exit" is a fact you can state; whether the new feature keeps that behavior is still the PM's decision — ask.
- **If the tools are not available in this session**, fall back to ask/TBD everywhere. Never fabricate a "codebase check" you didn't run.

## Automatic collision check — run it before drafting

Once you know the idea and the screens/flows it touches — typically right after the brief or the first clarifying round; in design-first mode, after the Phase 0 ingest instead (the inventory sharpens the inputs) — run `check_prd_collisions` **automatically, without asking permission**. Pass `ideaSummary`, `designSummary` (if a design direction exists), `touchedSurfaces`, and `repos: ["frontend-alpha"]`. Catching a conflict now is cheap; catching it in review is not.

- **For `frontend-alpha`**, build `touchedSurfaces` from that skill's route/surface vocabulary (`/academy`, `/personal-plan`, `widgets/lesson-header`, …).
- **For `jobescape-app`**, translate mobile surfaces into their `frontend-alpha` route equivalents first (Skills tab → `/skills`, a lesson screen → `/academy` lesson routes). Every hit is a **proxy** finding — label it. Mobile-only surfaces (push, deep links, IAP, streak mechanics, offline) have no web equivalent — skip them here and fall back to ask/TBD.

Handle results:
- **Each evidence-backed collision** becomes a focused product question to the PM (*"today, exiting a lesson auto-saves — should the skip button do the same?"*) or, if the PM should decide later, a plain-language Open Questions / Non-goals entry.
- **No collisions** — one sentence to the PM, move on; don't pad the PRD with a "no conflicts" section.

## Mid-draft probes and the handoff re-verify

While drafting: current-behavior questions go to `check_existing_behavior` (`graph` first; escalate unresolved probes to `quick`) instead of to the PM.

Before final handoff: **re-verify the load-bearing current-behavior claims** — the ones a requirement row or a "must not break" constraint depends on — with `check_existing_behavior` in `deep` mode. Reserve `deep` for these few handoff checks, not routine drafting probes.

## Anti-patterns

- **Don't ask the PM what the product does today** when the tools cover the service — check, and bring the PM the *decision*, not the research.
- **Don't claim a codebase check you didn't run**, and don't skip the collision check on a covered service.
- **Don't leak behavior-tool output into the PRD** — findings are background; code evidence, file paths, and anchor names stay out.
