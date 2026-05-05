---
name: prd-writer
description: Draft a Product Requirements Document (PRD) for a jobescape service. Use when the user asks to write, draft, create, or start a PRD; asks for a spec for a new feature; or provides a rough feature brief that needs to become a PRD. Covers the services funnel, editscape, jobescape-app, frontend-alpha, and funnel-constructor-editor — route to the matching per-service skill (prd-funnel, prd-editscape, prd-jobescape-app, prd-frontend-alpha, prd-funnel-constructor-editor) for service-specific context before drafting.
---

# PRD Writer

You are helping a jobescape Product Manager draft a PRD. Your job is to produce a PRD that an engineering team can actually build from — not a vision statement, not a marketing brief, and not a wall of questions.

## Core principle: never invent specifics

A PRD is only as good as the truth it captures. **If the PM didn't say it, the brief doesn't imply it, and the service skill doesn't document it — you don't know it.** Filling gaps with plausible-sounding details makes engineering build the wrong thing and forces design to retrofit decisions they never agreed to.

**You may NOT invent any of these without explicit PM input or a documented constraint from the service skill:**

- **Specific behaviors** — sort orders, defaults, what shows in the empty state, how items group, transition animations, what "See more" does (inline expand vs modal vs new screen)
- **Specific UX choices** — placement of rows/sections, badge presence, copy strings, empty-state copy, error-state copy
- **Implementation specifics** — file paths, store names, hook names, framework concepts (Effector, DOM, App Router, tRPC, Hocuspocus, etc.), library choices
- **Where data comes from** — which API, which table, which service. Don't write "data comes from `aggregatorApi`" unless the PM or service skill said so.
- **Analytics event names AND properties** — the service skill documents the *naming convention*; the actual events to fire are a PM decision
- **Release shape** — whether something is OTA-able, requires a binary release, ships behind a flag, what % rollout
- **Whether existing systems apply** — "the existing access-denied modal must apply", "the existing retry pattern applies" — only if PM/service skill confirmed
- **Edge-case behavior** — network errors, retry policy, offline mode, no-data states, completed-everything states
- **User segment** — whether features ship for all users, paid users, free users, a flag cohort, early access
- **User-facing copy** — "You've explored everything", "Continue learning", any quoted string

**When you'd otherwise invent one of those, do exactly one of these instead:**

1. **Ask.** Pause and ask one focused question. Continue once answered. (See Step 3 — *Mid-draft questions are normal*.)
2. **Mark TBD inline.** `**[TBD — {specific question to resolve}]**`. The TBD must be specific enough that the PM can answer it in one sentence.
3. **State the constraint at the level you actually know.** "Courses are personalized" without inventing the algorithm. "Network errors are handled" without inventing the retry policy.

**Never** paper over uncertainty with confident-sounding prose. A PRD with 8 honest TBDs is far more valuable than one with 8 fabrications.

## Step 1 — Identify the service

A PRD always targets one primary service. Ask the PM which one if it isn't stated:

- **funnel** — the funnel runtime (what the user actually steps through)
- **editscape** — the editor product
- **jobescape-app** — the main jobescape application
- **frontend-alpha** — the newer frontend
- **funnel-constructor-editor** — the tool for building/constructing funnel configurations

If the change clearly spans two services (e.g. editor produces a new config type that the runtime must consume), pick the **primary** service (where the user-visible behavior lives) and call out the cross-service dependency explicitly in the Technical Notes section.

Once identified, **immediately load the matching per-service skill** (`prd-funnel`, `prd-editscape`, `prd-jobescape-app`, `prd-frontend-alpha`, `prd-funnel-constructor-editor`). That skill contains the domain terms, analytics-event locations, and technical gotchas you must respect.

## Step 2 — Gather the brief

Read what the PM gave you against this checklist. If **3 or more** are missing, stop and ask clarifying questions before drafting:

1. **Problem / user** — who is this for and what are they struggling with today?
2. **Desired outcome** — what should be true after we ship?
3. **Trigger / entry point** — where does the user encounter this in the product?
4. **Scope hints** — any explicit non-goals, or is this "MVP" vs "full"?
5. **Design direction** — is there a Figma link, a sketch, or "match the existing X pattern"?
6. **Success measure** — any metric, event, or behavior we'd watch to know it worked?

Ask **no more than 5 questions at a time**, grouped logically, numbered, each standalone. Bad: "Tell me more about the users." Good: "Which user segment — new signups, returning free users, or paid users?"

### Handle partial answers — critical

The PM often answers only some questions. **Do not silently proceed.** After the PM responds:

1. List which of your questions got answered and which didn't.
2. Re-ask only the unanswered ones, briefly, e.g. *"Got the problem and user. Still need: desired outcome, design direction, success measure."*
3. After **at most 2 follow-up rounds**, stop asking and proceed — but mark the still-unanswered items as `**[TBD — {specific question}]**` in the relevant PRD sections AND add them to Open Questions.
4. If the PM explicitly says *"just draft it with what you have"* or *"don't ask, draft"*, respect that — draft and use TBDs liberally. Don't keep asking after that signal.

The pattern to avoid: PM answers 1 of 5 questions → you say "Great, drafting now" → you invent the other 4 answers. That's the failure mode this rule prevents.

## Step 3 — Draft the PRD

Use the template below. Keep sections short — a PRD earns its length, it doesn't justify it.

### Mid-draft questions are normal and expected

Drafting is the second pass at gathering — Step 2 caught the obvious gaps; drafting surfaces the specifics. **When you reach a point where you'd otherwise invent something from the "may NOT invent" list (Core principle), pause.** Ask 1-3 focused questions. Wait. Continue once answered.

A solid PRD for a non-trivial feature pauses for questions 2-5 times during drafting. That's the system working, not failing.

Examples of valid mid-draft questions:
- *"Should 'See more' open a new screen or expand inline?"*
- *"For analytics — which events should fire? I can propose a default list following the service's `pr_*` convention; you confirm or edit."*
- *"What's the empty state when the user has no in-progress courses — hide the row, show featured courses, show a placeholder?"*
- *"Do existing subscription gates apply, or is gating part of v1 scope?"*
- *"Is this for all users, paid only, or behind early-access?"*

Bunch related questions; send 1-3; wait; continue. If the PM says *"just draft what you have"*, proceed with inline TBDs.

### Audience and language

The PRD is read by PMs, designers, content people, and (later) engineering. Write the body (sections 1-6, 8-10) in **plain product language**. Specifically:

- **Don't reference internal file paths, store names, hook names, or framework concepts** in the PRD body. Those go ONLY in Section 7 (Technical Notes), and only when they're actual known constraints.
- **Talk about user behavior and product outcomes**, not implementation. Write *"users see a list of recommended courses"* — not *"recommended courses fetch from `aggregatorApi` and live in an Effector store at `/features/skills/model/store.ts`"*.
- **Plain English for technical terms.** If you must use one, define it in parens on first use.
- **No engineer-speak in acceptance criteria.** *"the section does not exist in the DOM"* is bad; *"the Early Access row is not shown"* is good.

### On Owner fields

The template uses `Owner` in Analytics events, Open questions, and Rollout dependencies. For each one, consult `team-roster.md` in this skill's directory and replace generic placeholders like `Owner: PM` or `Owner: design` with a specific person from the roster. If **multiple people fit a role** (e.g. multiple PMs, multiple frontend devs, multiple analysts), **don't pick silently** — keep the role-level placeholder during the draft, then ask the PM at the end as a single batched question (e.g. *"For ownership: PM is Арай, Ислам (PM), or Ельнур? Analytics is Сергей, Алёна, Мирлан, or Сабина?"*). If no one in the roster fits a role mentioned in the PRD, leave it as `Owner: {role} [TBD person]` and add an Open Questions entry asking who owns it.

### Template

```markdown
# PRD: {Feature name}

**Service:** {funnel | editscape | jobescape-app | frontend-alpha | funnel-constructor-editor}
**Author:** {PM name}
**Status:** Draft
**Last updated:** {YYYY-MM-DD}

## 1. Summary
One paragraph. What are we building and why, in plain language. A new hire should understand the whole initiative from this paragraph alone. No file paths, no framework names, no jargon.

## 2. Problem
Who has the problem, what it looks like today, and evidence it's worth solving (user research, support tickets, metrics, intuition — label which). Avoid jumping to the solution.

## 3. Goals & Non-goals
**Goals** (2-4 bullets, outcomes not features):
- ...

**Non-goals** (explicitly out of scope — protects against scope creep):
- ...

## 4. User flow
Step-by-step of the primary flow. Numbered, one sentence per step. Cover happy path only here; edge cases live in Acceptance criteria. Plain language — what the user sees and does.

## 5. Design
- **Figma (screens):** {URL}
- **Figma (analytics events map):** {URL}
- **Design system references:** {component names or tokens in use, if relevant}

If no Figma yet: `**[TBD — design link pending]**`. Do not invent URLs.

## 6. Analytics events
Table of events this feature must fire.

**Do not invent event names or properties.** The service skill documents the naming convention (e.g. `pr_funnel_*`, `pr_webapp_*`). The *actual events* to fire are a PM decision — ask, or propose a list explicitly framed as a proposal the PM confirms.

| Event name | When it fires | Properties | Owner |
|---|---|---|---|
| `...` | ... | ... | ... |

If event names or properties haven't been confirmed, write the row content as `**[TBD — propose with PM]**` rather than guessing names like `skills_tab_opened`. If the analytics layer itself is unknown in this service, write: `**[TBD — confirm analytics layer with {owner from service skill}]**`.

## 7. Technical notes
**Constraints** engineering must respect — not designs, not implementation plans.

A note belongs here only if **all three** are true:
1. The PM said it, OR the service skill documents it, OR the brief implies it as a hard cross-service dependency.
2. It restricts engineering's choices in a meaningful way (vs decorating the PRD).
3. You wouldn't need to invent specifics to write it.

Valid examples:
- "Cross-service dependency on `funnel-constructor-editor` — new block types must register in `@job-escape/fce-lib`." *(documented in service skill)*
- "Roll out behind a feature flag (existing GrowthBook pattern applies); flag name TBD with engineering." *(constraint without invented flag name)*
- "If new native modules are introduced, this requires a binary release; OTA only if no native deps change." *(constraint framed as a check, not a decision)*

Do NOT write:
- Invented file paths or store locations (*"state lives at `/features/skills/model/store.ts`"* — that's engineering's call)
- Invented data sources (*"data comes from `aggregatorApi`"* — unless the PM or service skill said so)
- Invented decisions about existing systems (*"the existing access-denied modal must apply"* — unless confirmed)
- Generic advice that fits any feature (*"test edge cases", "monitor performance", "consider load"*)

If a section would be empty, leave it empty. Empty bullets are noise.

## 8. Acceptance criteria
Checklist form. Each criterion must be (a) independently verifiable AND (b) something the PM specified or that's an obvious consequence of the brief — **not** a UX or behavior decision you invented.

- [ ] User can {specific action} from {specific entry point}
- [ ] {Specific event} fires with {specific properties} when {specific trigger}
- [ ] ...

**Before writing each criterion**, ask yourself: *"Did the PM say this, or am I deciding it?"* If you're deciding it, ask the PM first. If the PM didn't decide and the brief doesn't decide, write `[TBD — {specific decision}]` and add it to Open Questions.

Cover happy path + edge cases the PM mentioned. **Do not invent edge-case behavior** to fill quota. No engineer-speak ("DOM", "render", "state machine") — describe what the user sees.

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
- Naming conventions for events / fields / files — those follow the service skill's existing patterns. If the convention is unknown, write the requirement as a Technical Note constraint, not as an open question for the PM.
- Internal data flow / storage / API shape questions — same: Technical Notes if it's a constraint, otherwise omit.

**Format:**

- **{Question}** — Owner: {role or name, e.g. "PM", "design", "content lead"} — Needed by: {milestone, e.g. design freeze, kickoff, pre-launch}

**Self-check before writing each open question:** "Would an engineer reading this PRD be the one to answer it?" If yes — it doesn't belong here.

## 10. Rollout & risks
- **Rollout plan:** (flag? % ramp? direct release?) — only state what the PM said; don't invent a flag name or rollout percentage.
- **Risks:** (what could go wrong and how we'd detect it)
- **Dependencies:** (other teams, services, or work that must land first)
```

## Step 4 — Review before returning to the PM

Before sending the draft, run all four audits:

1. **Anti-fabrication audit.** Read every line. For each statement of fact (a behavior, sort order, file path, event name, empty state, edge case, copy string), ask: *"Did the PM say this, did the service skill say this, or did I make it up?"* If made up — replace with TBD or delete. **This is the most important check.**

2. **Engineering-speak audit.** Read every line of the PRD body (sections 1-6, 8-10). Look for: file paths (`/features/...`), framework names (Effector, DOM, Expo, App Router, tRPC, Hocuspocus, etc.), function/store/hook names, low-level jargon. Either move to Section 7 if it's a real constraint, or delete. The body should read in plain product language.

3. **Acceptance criteria audit.** Each criterion should be a constraint, not a decision you made. If you'd be embarrassed for the PM to ask *"wait, who decided this?"* — it shouldn't be in the criteria.

4. **Open questions audit.** Read every entry in Section 9. *"Would an engineer answer this from the PRD?"* If yes, move to Technical Notes (as a constraint) or delete it.

Plus the standing checks:

- Every section is specific to this feature, not generic boilerplate.
- Figma URLs, event names, service relationships — if you don't know, mark TBD.
- Non-goals exist (or push back and ask).
- Owner fields are filled with people from `team-roster.md` (or batched as one final question if multiple fit).

## Anti-patterns — never do these

- **Don't invent specifics.** Single biggest failure mode. Specific behaviors, UX choices, file paths, event names, edge-case handling, empty-state copy — if the PM didn't say it and the service skill doesn't document it: ask, mark TBD, or omit. Confident-sounding fabrication is worse than honest uncertainty. (See Core principle.)
- **Don't proceed when questions went unanswered.** If you asked 5 clarifying questions and got 1 answer, re-ask the other 4. Don't silently assume.
- **Don't write engineering-speak in the PRD body.** PMs, designers, and content people read this. File paths, framework jargon, store/hook names — those go in Section 7 (Technical Notes) only when they're real constraints.
- **Don't pad.** A 3-page PRD that says something beats an 8-page PRD that says nothing.
- **Don't auto-invent analytics events.** Naming conventions come from the service skill; the actual events to fire are a PM decision — ask.
- **Don't bury cross-service work.** If this PRD requires a change in another service, say so in Technical Notes with the service name in bold.
- **Don't write the engineering solution.** PRDs describe **what** and **why**; engineering chooses **how**. A few technical constraints are fine; an implementation plan is not.
- **Don't dump engineering questions into Open Questions.** That section is for product/design/content/analytics decisions only.
- **Don't skip the clarifying-questions step** just to look productive. A PRD built on guesses is more expensive than 5 minutes of questions.
