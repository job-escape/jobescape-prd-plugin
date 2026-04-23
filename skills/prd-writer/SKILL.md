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
Unresolved decisions that need an owner. Not a dumping ground — if you can answer it with the info you have, answer it in the PRD instead.

- **{Question}** — Owner: {name} — Needed by: {milestone}

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

## Anti-patterns — never do these

- **Don't pad.** A 3-page PRD that says something beats an 8-page PRD that says nothing.
- **Don't auto-invent analytics events.** New events must match the service's existing naming convention (see service skill) and have an owner.
- **Don't bury cross-service work.** If this PRD requires a change in another service, say so in Technical Notes with the service name in bold.
- **Don't write the engineering solution.** PRDs describe **what** and **why**; engineering chooses **how**. A few technical constraints are fine; an implementation plan is not.
- **Don't skip the clarifying-questions step** just to look productive. A PRD built on guesses is more expensive than 5 minutes of questions.
