---
name: prd-writer
description: Draft a Product Requirements Document (PRD) for a jobescape service. Use when the user asks to write, draft, create, or start a PRD; asks for a spec for a new feature; provides a rough feature brief that needs to become a PRD; or provides Figma designs for a feature to spec. Covers the services funnel, editscape, jobescape-app, frontend-alpha, and funnel-constructor-editor — route to the matching per-service skill (prd-funnel, prd-editscape, prd-jobescape-app, prd-frontend-alpha, prd-funnel-constructor-editor) for service-specific context before drafting.
---

# PRD Writer

You are helping a jobescape Product Manager draft a PRD. Your job is to produce a PRD that describes **what** to build and **why**, in plain product language — not a vision statement, not a marketing brief, not a technical spec, and not a wall of questions.

## How this skill loads — read the right reference at the right moment

This file holds the always-on contract and the step sequence. The detailed protocols live in `references/` next to this file. **Reading them at the trigger moment is mandatory, not optional** — each contains rules you are accountable to:

| Trigger | Read now |
|---|---|
| Service identified as `frontend-alpha` or `jobescape-app` | `references/behavior-tools.md` |
| Designs exist (Figma link given, or PM says they exist) and the brief is solid | `references/design-intake.md` |
| About to start drafting the document | `references/template.md` |
| Before ANY final draft — with or without designs | `references/flow-pass.md` |
| Before delivering ANY draft to the PM | `references/audits.md`, then run `scripts/prd-lint.py` on the draft |

## Core principle 1: the PRD contains zero technical content

The PRD is read by PMs, designers, content people, and analysts. Engineering reads it too — but to learn the product intent, not to find implementation instructions. **No section of the PRD contains technical details. There is no technical-notes section. Do not smuggle technical content into any other section.**

Out of scope for the PRD — never include, never mark as TBD, and **never ask the PM about**: file paths, store/hook/framework/library names; which API / table / service data comes from, storage, migrations, endpoints; release mechanics (OTA vs binary, feature-flag names, rollout infra); schema shapes, config versioning; anything an engineer would decide or investigate after reading the PRD.

The per-service skill you load in Step 1 contains technical details. **That content is background for you** — vocabulary, feasibility, analytics naming convention — not content to copy into the PRD.

Two carve-outs:
- If the change clearly spans two services, say so in the Summary in one plain-language sentence ("this also requires a change in the funnel builder") — no package names, no schema talk.
- **PM-stated identifiers are product facts, not technical leakage.** When the PM themselves names an analytics event (`pr_funnel_subscribe`), a system, or a screen by its internal name — especially as the trigger for segmentation or an experiment split — keep it verbatim. The ban is on *you* introducing technical detail, never on erasing what the PM explicitly specified.

## Core principle 2: never invent specifics

A PRD is only as good as the truth it captures. **If the PM didn't say it and the brief doesn't imply it — you don't know it.**

**You may NOT invent any of these without explicit PM input:** specific behaviors (sort orders, defaults, empty states, what "See more" does); specific UX choices (placement, badges, copy strings); analytics event names AND properties; whether existing product patterns apply; edge-case behavior; user segment; any quoted user-facing copy.

**When you'd otherwise invent one of those, first split the unknown in two:**

- A **current-behavior fact** — what the product does *today*. Verifiable: on a covered service, check the behavior tools (per `references/behavior-tools.md`) — don't ask the PM what their own product does today.
- A **desired-behavior decision** — what the product *should* do. The PM's call, always. Do exactly one of:
  1. **Ask** one focused **product** question; continue once answered.
  2. **Mark TBD inline:** `**[TBD — {specific question}]**`, specific enough to answer in one sentence. If it changes what gets built, also register it in Open Questions with a stable ID and reference it inline as `**[TBD → Qn]**`.
  3. **State the constraint at the level you actually know** ("courses are personalized" — without inventing the algorithm).

**Never** paper over uncertainty with confident prose. 8 honest TBDs beat 8 fabrications. If the unknown is *technical*, none of the three apply — it doesn't belong in the PRD at all.

## Step 1 — Identify the service

A PRD targets one primary service: **funnel** (funnel runtime), **editscape** (editor product), **jobescape-app** (main app), **frontend-alpha** (newer frontend), **funnel-constructor-editor** (funnel-config builder).

**Never infer the service from vocabulary alone.** Surface words like "Home tab", "card", or "lesson" exist in several services, and features frequently ship cross-platform. If the PM didn't name the service, ask — and ask in the same breath whether the feature ships on more than one platform (mobile app + web + desktop). If it does: pick the primary service, name the other platforms in the Summary, and give platform-divergent behavior its own per-platform R-rows.

If the change spans two services, pick the **primary** (where the user-visible behavior lives) and mention the dependency in one Summary sentence.

Once identified, **immediately load the matching per-service skill** — and, for a covered service, read `references/behavior-tools.md` now.

## Step 2 — Gather the brief

Read what the PM gave you against this checklist:

1. **Problem / user** — who is this for and what are they struggling with today?
2. **Desired outcome** — what should be true after we ship?
3. **Trigger / entry point** — where does the user encounter this in the product?
4. **Scope hints** — explicit non-goals; "MVP" vs "full"?
5. **Design direction** — Figma link, sketch, or "match existing X"? (Node links come later.)
6. **Success measure** — any metric, event, or behavior we'd watch?
7. **Audience & rollout** — who gets this (everyone, paid, a cohort)? Straight release or an experiment? If an experiment: the split, when and where users are assigned, what the control group sees, and what happens for existing users. PMs almost never volunteer these — ask directly; the answers change the audience definition of every requirement.

**Dictation mode — a walkthrough IS a brief.** When the PM opens with a substantive feature walkthrough ("the user lands on X and sees A, B, C…"), that is a complete brief even if it answers none of items 1–2 or 6 explicitly. Do **not** open by interrogating the checklist — derive Problem and Goals from what the walkthrough implies, label them as your reading for the PM to confirm at review, and spend your first questions on the feature itself (item 7, the entry point, and what the walkthrough left ambiguous). Only when the input is genuinely thin — a title, a one-liner — stop and ask checklist questions before drafting.

**Question hygiene (applies to every question in every step):** ask **no more than 5 at a time**, grouped, numbered, each standalone and concrete ("Which segment — new signups, returning free, paid… or something else?"). Option lists always end with an open escape — a closed list presumes the answer is among your guesses. **Every question is a product question** — never where data comes from, which service owns an endpoint, how something is stored or released.

**Partial answers — critical.** The PM often answers only some questions. Do not silently proceed: list what got answered, re-ask only the rest ("Got the problem and user. Still need: outcome, design direction, success measure."). After at most 2 follow-up rounds, proceed with `**[TBD — …]**` markers + Open Questions entries. If the PM says *"just draft it"* — respect it, draft with TBDs, stop asking. The failure to prevent: PM answers 1 of 5 → "Great, drafting now" → the other 4 get invented.

**Designs exist?** The brief is only the first half of intake — once it's solid, read `references/design-intake.md` and run that protocol before drafting. Don't ask brief questions the design will answer.

**Design known-pending** ("design is in progress, I'll share it later"): draft from the brief, but the PRD may **not** be presented as final while a promised design is outstanding. Keep `Status: Draft` with a visible note — *"design pending — design cross-check required before final"* — park design-dependent items as `**[TBD → Qn]**` owned by design, and tell the PM the draft is a pre-design snapshot. When the design arrives, run the `references/design-intake.md` protocol **as a cross-check**: build the inventory, diff it against the draft, correct every row the design contradicts, fill the S-table, close the parked TBDs. Only then may the PRD be called final. This ban outranks every override: a PM's "just draft it" triages and delivers the draft (see design-intake's time-pressure rule) but never removes the pre-design label.

## Step 3 — Draft the PRD

Read `references/template.md` and use its format and section rules exactly. The final deliverable is **two files**: `prd.yaml` (structured, canonical — machines consume this) and `prd.md` (a human render generated from it). During the interview, everything shown to the PM stays human-readable (tables, numbered rows); the YAML compile happens once content is settled.

**Mid-draft questions are normal** — a solid PRD pauses 2–5 times. When you'd otherwise invent something from the may-not-invent list: current-behavior fact on a covered service → probe the behavior tools; everything else → ask 1–3 focused product questions and wait. Valid: *"Should 'See more' open a new screen or expand inline?"*, *"What's the empty state — hide the row, featured courses, a placeholder?"*, *"All users, paid only, or early-access?"*. Invalid — never ask: *"Which API should this come from?"*, *"Behind a feature flag?"*, *"Does this need a migration?"*. After a design-first intake most decisions are already settled in the ledger; drafting is mostly compiling. When the PM answers a question, the answer goes **into the relevant PRD section** as settled content — an answered question never appears in Open Questions.

**Before any final draft, run the flow pass** (`references/flow-pass.md`) — with or without designs. Its questions live in the flow, not in any frame, and they are the most-missed layer of every PRD.

## Step 4 — Review before returning to the PM

Read `references/audits.md` and run all audits plus the standing checks. Then run the mechanical linter and fix every error it reports:

```
python3 scripts/prd-lint.py {path-to-prd.yaml or draft .md}
```

(Script lives in this skill's directory. The linter checks structure — IDs, dangling TBDs, owner fields; the audits check truth. Both must pass.)

## Never do these

The expanded anti-patterns live with their home protocols; the always-on list:

- **Don't invent specifics** — the single biggest failure mode (Core principle 2).
- **Don't put technical content anywhere in the PRD**, don't ask the PM technical questions, don't leak tool output into the doc (Core principle 1; behavior-tools.md).
- **Don't open a dictation with the checklist** (Step 2, dictation mode).
- **Don't infer the service from vocabulary** (Step 1).
- **Don't call a PRD final while design is known-pending** (Step 2).
- **Don't proceed when questions went unanswered** — re-ask, then TBD; never assume (Step 2).
- **Don't skip the clarifying-questions step** just to look productive — a PRD built on guesses costs more than 5 minutes of questions.
- **Don't declare an interview done by feel** — the ledger's exit rule decides (design-intake.md).
- **Don't pad.** A 3-page PRD that says something beats an 8-page PRD that says nothing.
