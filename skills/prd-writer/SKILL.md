---
name: prd-writer
description: Draft a Product Requirements Document (PRD) for a jobescape service. Use when the user asks to write, draft, create, or start a PRD; asks for a spec for a new feature; or provides a rough feature brief that needs to become a PRD. Covers the services funnel, editscape, jobescape-app, frontend-alpha, and funnel-constructor-editor — route to the matching per-service skill (prd-funnel, prd-editscape, prd-jobescape-app, prd-frontend-alpha, prd-funnel-constructor-editor) for service-specific context before drafting.
---

# PRD Writer

You are helping a jobescape Product Manager draft a PRD. Your job is to produce a PRD that an engineering team can actually build from — not a vision statement, not a marketing brief, and not a wall of questions.

## Step 1 — Identify the service

A PRD always targets one primary service. Ask the PM which one if it isn't stated:

- **funnel** — the funnel runtime (what the user actually steps through)
- **editscape** — the editor product
- **jobescape-app** — the main jobescape application
- **frontend-alpha** — the newer frontend
- **funnel-constructor-editor** — the tool for building/constructing funnel configurations

If the change clearly spans two services (e.g. editor produces a new config type that the runtime must consume), pick the **primary** service (where the user-visible behavior lives) and call out the cross-service dependency explicitly in the Technical Notes section.

Once identified, **immediately load the matching per-service skill** (`prd-funnel`, `prd-editscape`, `prd-jobescape-app`, `prd-frontend-alpha`, `prd-funnel-constructor-editor`). That skill contains the domain terms, analytics-event locations, and technical gotchas you must respect.

## Step 2 — Judge whether the brief is sufficient

Read what the PM gave you against this checklist. If **3 or more** are missing, stop and ask clarifying questions before drafting:

1. **Problem / user** — who is this for and what are they struggling with today?
2. **Desired outcome** — what should be true after we ship?
3. **Trigger / entry point** — where does the user encounter this in the product?
4. **Scope hints** — any explicit non-goals, or is this "MVP" vs "full"?
5. **Design direction** — is there a Figma link, a sketch, or "match the existing X pattern"?
6. **Success measure** — any metric, event, or behavior we'd watch to know it worked?

Ask **no more than 5 questions at a time**, grouped logically, numbered, each standalone. Bad: "Tell me more about the users." Good: "Which user segment — new signups, returning free users, or paid users?" If the PM says "just draft it with what you have," respect that: draft and mark gaps with `**[TBD — {specific question}]**` inline.

## Step 3 — Draft the PRD

Use this template exactly. Keep sections short — a PRD earns its length, it doesn't justify it.

**On Owner fields:** the template uses `Owner` in Analytics events, Open questions, and Rollout dependencies. For each one, consult `team-roster.md` in this skill's directory and replace generic placeholders like `Owner: PM` or `Owner: design` with a specific person from the roster. If **multiple people fit a role** (e.g. multiple PMs, multiple frontend devs, multiple analysts), **don't pick silently** — keep the role-level placeholder during the draft, then ask the PM at the end as a single batched question (e.g. *"For ownership: PM is Арай, Ислам (PM), or Ельнур? Analytics is Сергей, Алёна, Мирлан, or Сабина?"*). If no one in the roster fits a role mentioned in the PRD, leave it as `Owner: {role} [TBD person]` and add an Open Questions entry asking who owns it.

```markdown
# PRD: {Feature name}

**Service:** {funnel | editscape | jobescape-app | frontend-alpha | funnel-constructor-editor}
**Author:** {PM name}
**Status:** Draft
**Last updated:** {YYYY-MM-DD}

## 1. Summary
One paragraph. What are we building and why, in plain language. A new hire should understand the whole initiative from this paragraph alone.

## 2. Problem
Who has the problem, what it looks like today, and evidence it's worth solving (user research, support tickets, metrics, intuition — label which). Avoid jumping to the solution.

## 3. Goals & Non-goals
**Goals** (what success looks like — 2-4 bullets, outcomes not features):
- ...

**Non-goals** (explicitly out of scope — protects against scope creep):
- ...

## 4. User flow
Step-by-step of the primary flow. Numbered, one sentence per step. Cover happy path only here; edge cases go in section 7.

## 5. Design
- **Figma (screens):** {URL}
- **Figma (analytics events map):** {URL}
- **Design system references:** {component names or tokens in use, if relevant}

If no Figma yet: `**[TBD — design link pending]**`. Do not invent URLs.

## 6. Analytics events
Table of events this feature must fire. Pull the definition location from the service skill — do not invent a location.

| Event name | When it fires | Properties | Owner |
|---|---|---|---|
| `...` | ... | ... | ... |

If the analytics layer is unknown in this service, write: `**[TBD — confirm analytics layer with {owner from service skill}]**`.

## 7. Technical notes
Concrete technical constraints the engineering team must respect. Pull from the service skill's "Typical technical concerns" and "Gotchas." Examples:
- Data model changes
- Cross-service dependencies (call them out by service name)
- Migrations required
- Performance / load considerations
- Feature flag / rollout strategy
- Edge cases and error states

Only list items that actually apply to this feature. Empty bullets are noise.

## 8. Acceptance criteria
Checklist form. Each criterion should be independently verifiable. Cover happy path + at least two edge cases.

- [ ] User can {specific action} from {specific entry point}
- [ ] {Specific event} fires with {specific properties} when {specific trigger}
- [ ] ...

## 9. Open questions
Unresolved **product** decisions that need a human owner before the PRD can be finalized. Strict scope: this section is for the PM and other product-side stakeholders (design, content, analytics, support), not for engineering.

**Belongs here:**
- Behavior under specific conditions ("does a skipped module count toward streaks?")
- Scope decisions ("does v1 ship for free users or paid only?")
- UX / design decisions that materially affect the user ("what does the empty state look like?")
- Success criteria not yet decided ("which metric do we move?")
- Cross-team coordination questions ("does this need a copy review with content lead?")

**Does NOT belong here — even if uncertain:**
- Engineering implementation choices: which service owns an endpoint, which file holds a flag, which library to use, where data is stored, what migrations are needed. Engineering decides these from the PRD. If there's a real **constraint** engineering must respect, write it in Section 7 (Technical notes), not here.
- Naming conventions for events / fields / files — those follow the service skill's existing patterns. If the convention is unknown, write the requirement as a Technical Note constraint ("event names must match the service's existing convention; see service skill"), not as an open question for the PM.
- Internal data flow / storage / API shape questions — same: Technical Notes if it's a constraint, otherwise omit.

**Format:**

- **{Question}** — Owner: {role or name, e.g. "PM", "design", "content lead"} — Needed by: {milestone, e.g. design freeze, kickoff, pre-launch}

**Self-check before writing each open question:** "Would an engineer reading this PRD be the one to answer it?" If yes — it doesn't belong here. Move it to Technical Notes as a constraint, or omit (engineering will decide).

## 10. Rollout & risks
- **Rollout plan:** (flag? % ramp? direct release?)
- **Risks:** (what could go wrong and how we'd detect it)
- **Dependencies:** (other teams, services, or work that must land first)
```

## Step 4 — Review before returning to the PM

Before sending the draft, check:

- **Every section is specific to this feature**, not generic boilerplate. If a section reads the same regardless of feature, delete or rewrite it.
- **No invented facts.** Figma URLs, event names, service relationships — if you don't know, mark TBD.
- **Technical notes come from the service skill**, not your prior assumptions.
- **Acceptance criteria are verifiable.** "Works well" is not verifiable; "Fires `funnel_step_completed` with `step_id` property" is.
- **Non-goals exist.** An empty Non-goals section almost always means the PM hasn't thought about scope — push back and ask.
- **Open questions are product-only.** Read every entry in Section 9 and ask: "Would an engineer answer this from the PRD?" If yes, move it to Technical Notes (as a constraint) or delete it.

## Anti-patterns — never do these

- **Don't pad.** A 3-page PRD that says something beats an 8-page PRD that says nothing.
- **Don't auto-invent analytics events.** New events must match the service's existing naming convention (see service skill) and have an owner.
- **Don't bury cross-service work.** If this PRD requires a change in another service, say so in Technical Notes with the service name in bold.
- **Don't write the engineering solution.** PRDs describe **what** and **why**; engineering chooses **how**. A few technical constraints are fine; an implementation plan is not.
- **Don't dump engineering questions into Open Questions.** That section is for product/design/content/analytics decisions only — questions like "which backend service owns this endpoint" or "what naming convention for events" are engineering's call. If there's a hard constraint, write it in Technical Notes; otherwise omit.
- **Don't skip the clarifying-questions step** just to look productive. A PRD built on guesses is more expensive than 5 minutes of questions.
