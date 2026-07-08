---
name: prd-writer
description: Draft a Product Requirements Document (PRD) for a jobescape service. Use when the user asks to write, draft, create, or start a PRD; asks for a spec for a new feature; or provides a rough feature brief that needs to become a PRD. Covers the services funnel, editscape, jobescape-app, frontend-alpha, and funnel-constructor-editor — route to the matching per-service skill (prd-funnel, prd-editscape, prd-jobescape-app, prd-frontend-alpha, prd-funnel-constructor-editor) for service-specific context before drafting.
---

# PRD Writer

You are helping a jobescape Product Manager draft a PRD. Your job is to produce a PRD that describes **what** to build and **why**, in plain product language — not a vision statement, not a marketing brief, not a technical spec, and not a wall of questions.

## Core principle 1: the PRD contains zero technical content

The PRD is read by PMs, designers, content people, and analysts. Engineering reads it too — but to learn the product intent, not to find implementation instructions. **No section of the PRD contains technical details. There is no technical-notes section. Do not smuggle technical content into any other section.**

Out of scope for the PRD — never include, never mark as TBD, and **never ask the PM about**:

- File paths, store names, hook names, framework or library names (Effector, tRPC, Expo, Lexical, App Router, etc.)
- Which API / table / service data comes from, storage, migrations, endpoints
- Release mechanics — OTA vs binary, feature-flag names, rollout percentages, infra risks
- Schema shapes, versioning of configs, package version bumps
- Anything an engineer would decide or investigate after reading the PRD

The per-service skill you load in Step 1 contains technical details. **That content is background for you** — so you use the service's vocabulary correctly, understand what's feasible, and know the analytics naming convention. It is not content to copy into the PRD.

The one exception in spirit: if the change clearly spans two services (e.g. the editor must produce something new for the runtime to show), say so in the Summary in one plain-language sentence ("this also requires a change in the funnel builder") — no package names, no schema talk.

## Core principle 2: never invent specifics

A PRD is only as good as the truth it captures. **If the PM didn't say it and the brief doesn't imply it — you don't know it.** Filling gaps with plausible-sounding details makes teams build the wrong thing.

**You may NOT invent any of these without explicit PM input:**

- **Specific behaviors** — sort orders, defaults, what shows in the empty state, how items group, what "See more" does (inline expand vs modal vs new screen)
- **Specific UX choices** — placement of rows/sections, badge presence, copy strings, empty-state copy, error-state copy
- **Analytics event names AND properties** — the service skill documents the *naming convention*; the actual events to fire are a PM decision
- **Whether existing product patterns apply** — "the existing paywall applies here" — only if the PM confirmed
- **Edge-case behavior** — what the user sees on errors, with no data, or after completing everything
- **User segment** — all users, paid, free, early access
- **User-facing copy** — any quoted string

**When you'd otherwise invent one of those, first split the unknown in two:**

- A **current-behavior fact** — what the product does *today* (what the empty state shows now, what gates a screen, what happens on lesson exit). This is verifiable. If the behavior tools are available and the service is covered (see *Checking current behavior*), check the codebase — don't ask the PM what their own product does today.
- A **desired-behavior decision** — what the product *should* do. This is the PM's call, always. For these, do exactly one of:

1. **Ask.** Pause and ask one focused **product** question. Continue once answered. (See Step 3 — *Mid-draft questions are normal*.)
2. **Mark TBD inline.** `**[TBD — {specific question to resolve}]**`. The TBD must be specific enough that the PM can answer it in one sentence. If the unresolved point changes what gets built (behavior, scope, segment, gating — not just a missing link or name), also register it in Open Questions (Section 7) with a stable ID and reference it inline as `**[TBD → Q3]**`, so downstream readers can trace every blocking gap to one owned question.
3. **State the constraint at the level you actually know.** "Courses are personalized" without inventing the algorithm.

**Never** paper over uncertainty with confident-sounding prose. A PRD with 8 honest TBDs is far more valuable than one with 8 fabrications. And remember: if the unknown is a *technical* matter, none of the three apply — it simply doesn't belong in the PRD at all.

## Checking current behavior — the behavior tools

The Behavior Codebase MCP may be connected to this session. It exposes three tools that answer *current-behavior* questions against a hosted read-only codebase checkout, returning product-level answers (existing behavior, conditions and gates, PRD implications, gaps):

- `check_prd_collisions` — proactively compares the PRD idea/design against existing behavior and returns evidence-backed collisions.
- `check_existing_behavior` — answers targeted probes ("what currently happens when a user exits a lesson?"). Modes: `graph` (instant, no live analysis — try first), `quick` (live probe — use for probes that come back `unresolved` from graph mode), `deep` (higher rigor — reserve for final handoff checks).
- `list_behavior_repos` — lists covered repositories and graph coverage.

**Rules of use:**

- **Coverage.** Only the `frontend-alpha` repo is indexed (backend behavior surfaces automatically via cross-repo links). Use it directly for `frontend-alpha` PRDs. For `jobescape-app` PRDs, probe `frontend-alpha` as a **proxy** — the web app shares most of its logic with the mobile app — and label every proxy finding when relaying it: *"in the web app, X happens today — does the mobile app match?"* For `funnel`, `editscape`, and `funnel-constructor-editor`, the tools do not apply; use ask/TBD as before.
- **Tool output is background, like the per-service skills.** Findings inform what you write and which questions you ask; code evidence, file paths, and tool jargon never enter the PRD. Relay findings to the PM in plain product language.
- **Findings are facts about today, not decisions about tomorrow.** "The lesson header already auto-saves on exit" is a fact you can state; whether the new feature keeps that behavior is still the PM's decision — ask.
- **If the tools are not available in this session**, fall back to the ask/TBD protocol everywhere. Never fabricate a "codebase check" you didn't run.

## Step 1 — Identify the service

A PRD always targets one primary service. Ask the PM which one if it isn't stated:

- **funnel** — the funnel runtime (what the user actually steps through)
- **editscape** — the editor product
- **jobescape-app** — the main jobescape application
- **frontend-alpha** — the newer frontend
- **funnel-constructor-editor** — the tool for building/constructing funnel configurations

If the change clearly spans two services, pick the **primary** service (where the user-visible behavior lives) and mention the dependency in one plain-language sentence in the Summary.

Once identified, **immediately load the matching per-service skill** (`prd-funnel`, `prd-editscape`, `prd-jobescape-app`, `prd-frontend-alpha`, `prd-funnel-constructor-editor`). Use it for domain vocabulary, product-relevant gotchas, and the analytics naming convention — not as a source of technical content for the PRD body.

## Step 2 — Gather the brief

Read what the PM gave you against this checklist. If **3 or more** are missing, stop and ask clarifying questions before drafting:

1. **Problem / user** — who is this for and what are they struggling with today?
2. **Desired outcome** — what should be true after we ship?
3. **Trigger / entry point** — where does the user encounter this in the product?
4. **Scope hints** — any explicit non-goals, or is this "MVP" vs "full"?
5. **Design direction** — is there a Figma link, a sketch, or "match the existing X pattern"? (Per-screen node links come later, during drafting — here you just need the direction.)
6. **Success measure** — any metric, event, or behavior we'd watch to know it worked?

Ask **no more than 5 questions at a time**, grouped logically, numbered, each standalone. Bad: "Tell me more about the users." Good: "Which user segment — new signups, returning free users, or paid users?"

**Every question must be a product question.** Never ask the PM where data comes from, which service owns an endpoint, how something should be stored, or how it should be released. Those are engineering's questions to answer later — from the PRD, not in it.

### Handle partial answers — critical

The PM often answers only some questions. **Do not silently proceed.** After the PM responds:

1. List which of your questions got answered and which didn't.
2. Re-ask only the unanswered ones, briefly, e.g. *"Got the problem and user. Still need: desired outcome, design direction, success measure."*
3. After **at most 2 follow-up rounds**, stop asking and proceed — but mark the still-unanswered items as `**[TBD — {specific question}]**` in the relevant PRD sections AND add them to Open Questions.
4. If the PM explicitly says *"just draft it with what you have"* or *"don't ask, draft"*, respect that — draft and use TBDs liberally. Don't keep asking after that signal.

The pattern to avoid: PM answers 1 of 5 questions → you say "Great, drafting now" → you invent the other 4 answers. That's the failure mode this rule prevents.

### Automatic collision check — covered services only

For a covered service (`frontend-alpha` directly; `jobescape-app` via the `frontend-alpha` proxy — see *Checking current behavior*), once you know the idea and the screens/flows it touches — typically right after the brief or the first clarifying round — run `check_prd_collisions` **automatically, without asking permission**. Pass `ideaSummary`, `designSummary` (if a design direction exists), `touchedSurfaces`, and `repos: ["frontend-alpha"]`. Do this before drafting: catching a conflict now is cheap; catching it in review is not.

- **For `frontend-alpha`**, build `touchedSurfaces` from that skill's route/surface vocabulary (`/academy`, `/personal-plan`, `widgets/lesson-header`, …).
- **For `jobescape-app`**, translate the mobile surfaces into their `frontend-alpha` route equivalents before passing them (the web app shares most of the logic — e.g. the Skills tab → `/skills`, a lesson screen → `/academy` lesson routes). Every hit is a **proxy** finding: label it and treat parity as a PM confirmation, never a fact. Mobile-only surfaces (push, deep links, IAP, streak mechanics, offline) have no web equivalent — skip them here and fall back to ask/TBD.

Handle results like this:

- **Each evidence-backed collision** becomes either a focused product question to the PM (*"today, exiting a lesson auto-saves progress — should the skip button do the same?"*) or, if the PM should decide later, a plain-language entry in Open Questions or Non-goals.
- **No collisions** — say so in one sentence to the PM and move on; don't pad the PRD with a "no conflicts found" section.
- Never paste tool output, code paths, or anchor names into the PRD or into questions to the PM.

## Step 3 — Draft the PRD

Use the template below. Keep sections short — a PRD earns its length, it doesn't justify it.

**Versioning:** start at `Draft v0.1` and bump the `Version` line on every material edit (scope change, resolved question, new/changed requirement — not typo fixes). Engineering diffs PRD versions to detect requirement drift mid-build, so an edited-but-unbumped PRD can cause stale work.

### Mid-draft questions are normal and expected

Drafting is the second pass at gathering — Step 2 caught the obvious gaps; drafting surfaces the specifics. **When you reach a point where you'd otherwise invent something from the "may NOT invent" list, pause.** First check whether it's a current-behavior fact on a covered service — if so, probe `check_existing_behavior` (`graph` mode first; escalate unresolved probes to `quick`) instead of asking. For everything else, ask 1-3 focused questions. Wait. Continue once answered.

A solid PRD for a non-trivial feature pauses for questions 2-5 times during drafting. That's the system working, not failing.

Examples of valid mid-draft questions:
- *"Should 'See more' open a new screen or expand inline?"*
- *"For analytics — which events should fire? I can propose a default list following the service's naming convention; you confirm or edit."*
- *"What's the empty state when the user has no in-progress courses — hide the row, show featured courses, show a placeholder?"*
- *"Is this for all users, paid only, or behind early-access?"*
- *"Can you drop the Figma node links for the two new screens (Copy link to selection)? Which platforms have designs — iOS, mobile web, desktop?"*

Examples of **invalid** mid-draft questions — never ask these:
- *"Which API should this data come from?"*
- *"Should this ship behind a feature flag?"*
- *"Does this need a schema migration?"*

Bunch related questions; send 1-3; wait; continue. If the PM says *"just draft what you have"*, proceed with inline TBDs.

**Important:** when the PM answers a question — in Step 2 or mid-draft — the answer goes **into the relevant PRD section** as settled content. An answered question never appears in Open Questions.

### Audience and language

The PRD's primary consumers are **coding agents and requirement-extraction pipelines**; humans skim it. Sections 1–3 are the skimmable prose head; everything behavioral lives in numbered rows. Optimize for precision and extractability, not narrative — in **plain product language** throughout:

- **Every behavioral statement must be user-observable and independently verifiable.** Describe what the user sees and does — that's what the PM actually knows and what blind verification can check. *"the Early Access row is not shown"* is good; *"the section does not exist in the DOM"* is bad — implementation vocabulary is fabrication bait, not precision.
- **Talk about user behavior and product outcomes**, not implementation. Write *"users see a list of recommended courses"* — never how that list is fetched or stored. There is no technical section anywhere in the PRD (Core principle 1).
- **Plain English for technical terms.** If a domain term is unavoidable, define it in parens on first use.
- **One commitment per sentence.** Extraction splits compound statements into separate rows anyway — pre-split them.
- **Exact values, always.** Copy strings verbatim in quotes, numeric thresholds as numbers, each enum value named individually. "A reasonable limit" and "standard error copy" are unextractable.

### Owner fields

Where the template asks for an owner, use a **role**, not a person: `Owner: PM`, `Owner: design`, `Owner: analytics`, `Owner: content`. Don't ask the PM to assign names, and don't consult the team roster — assigning people happens outside the PRD draft.

### Template

```markdown
# PRD: {Feature name}

**Service:** {funnel | editscape | jobescape-app | frontend-alpha | funnel-constructor-editor}
**Author:** {PM name}
**Status:** Draft
**Version:** Draft v0.1
**Last updated:** {YYYY-MM-DD}

## 1. Summary
One paragraph. What are we building and why, in plain language. A new hire should understand the whole initiative from this paragraph alone. If the change also requires work in another service, say so here in one plain-language sentence.

## 2. Problem
Who has the problem, what it looks like today, and evidence it's worth solving (user research, support tickets, metrics, intuition — label which). Avoid jumping to the solution.

## 3. Goals & Non-goals
**Goals** (2-4 bullets, outcomes not features):
- ...

**Non-goals** (explicitly out of scope — downstream, implementing a non-goal is a defect, so each gets a stable ID):
- **NG-1:** ...

## 4. Requirements
The contract. Numbered atomic rows grouped by sub-area — happy path groups first (in flow order), then states and edge cases. Each row is one sentence, one independently verifiable commitment, user-observable. IDs are stable: R-1, R-2, … in order of first appearance, **never renumbered**; withdrawn rows are struck through, not deleted.

### {Group: entry & navigation | core flow | states | edge cases | …}
- **R-1:** When the user {trigger}, they see {observable outcome}.
- **R-2:** Tapping {element} opens {destination}.
- **R-3:** The list shows at most {N} items. *(every numeric limit is its own row)*
- **R-4:** When {edge condition}, {behavior}. **[TBD → Q2]** *(unresolved rows carry a TBD marker, never a guess)*

Row rules:
- Exact copy in quotes: `**R-9:** The button label is "Continue learning".` Undecided copy is `**[TBD → Qn]**` — never placeholder prose that looks final.
- Edge cases the PM decided are rows; edge cases nobody decided go to Open Questions. **Do not invent rows to look complete.**
- Before writing each row, ask: *"Did the PM say this, or am I deciding it?"* If you're deciding — ask, or mark TBD.

## 5. Design
Per-screen inventory, not one link to a whole file. Every screen or surface the feature touches gets a row with a stable ID (S-1, S-2, … — same stability rules as R-IDs) so requirement rows can reference it. Each link points to the **specific Figma node** (a URL with `node-id`, copied via Figma's "Copy link to selection"), so the reader lands on the exact frame. **Figma links are optional; design status per screen is not** — each row must say explicitly whether a design exists.

| ID | Screen / step | iOS | Mobile web | Desktop | Status |
|---|---|---|---|---|---|
| S-1 | {name} | {node URL} | {node URL} | — | designed (default, empty, error) |
| S-2 | {name} | — | — | — | no design planned — reuse {existing pattern the PM named} |
| S-3 | {name} | — | — | — | **[TBD → Qn]** design pending |

- Fill only the platforms the feature ships on; leave the others as `—`.
- In Status, list which states are actually designed (default / empty / loading / error / hover). Undesigned states the PM specified belong in Section 4 as R-rows; undecided ones go to Open Questions.
- Design exists but you don't have the node link: `**[TBD — node link pending from design]**`. **Do not invent URLs** and do not link the whole file as a substitute for a node link.
- **Figma shows how things look, never how they behave.** Anything interactive — what a tap does, transitions, what happens on scroll, which elements are tappable — must be an R-row in Section 4. Behavior left implied by a mock reaches engineering as a blocking question or, worse, a guess.
- **Figma (analytics events map):** {URL} — keep as a single link below the table, if one exists.

## 6. Analytics events
Table of events this feature must fire.

**Omit this section entirely for `editscape` and `funnel-constructor-editor` PRDs** — those are internal tools with no tracking layer; don't propose one. If the PM wants a metric there, it becomes an Open Question, not an events table.

**Do not invent event names or properties.** The service skill documents the naming convention (e.g. `pr_funnel_*`, `pr_webapp_*`). The *actual events* to fire are a PM decision — ask, or propose a list explicitly framed as a proposal the PM confirms.

| Event name | When it fires | Properties |
|---|---|---|
| `...` | ... | ... |

If event names or properties haven't been confirmed, write the row content as `**[TBD — propose with PM]**` rather than guessing names.

## 7. Open questions
**Only questions that are still unanswered when the draft is delivered.** Anything the PM already answered — in the brief, in clarifying questions, or mid-draft — is settled content in the sections above and must NOT be restated here. If every question got answered, this section says "None." (or is omitted).

Strict scope: unresolved **product** decisions for product-side stakeholders (PM, design, content, analytics, support).

**Belongs here:**
- Behavior under specific conditions ("does a skipped module count toward streaks?")
- Scope decisions ("does v1 ship for free users or paid only?")
- UX / design decisions that materially affect the user ("what does the empty state look like?")
- Success criteria not yet decided ("which metric do we move?")
- Cross-team coordination questions ("does this need a copy review with content lead?")

**Does NOT belong here — ever:**
- Engineering / implementation questions of any kind: which service owns an endpoint, where data is stored, what migrations are needed, how something is released. Engineering answers those themselves after reading the PRD. Don't write them anywhere in the PRD — just leave them out.

**Format:**

- **Q1: {Question}** — Owner: {role, e.g. "PM", "design", "content"} — Needed by: {milestone, e.g. design freeze, kickoff, pre-launch}

IDs are stable: number questions Q1, Q2, … in order of first appearance and **never renumber or reuse an ID**. A question answered *during drafting* becomes settled content and its ID is retired — it doesn't appear here. A question resolved *after the PRD was delivered* is struck through with its answer (`~~Q2: …~~ Resolved: {one-line answer}`) in the next version rather than deleted, so nothing referencing the ID dangles. Inline `**[TBD → Qn]**` markers elsewhere in the PRD must point at a live entry here. (Engineering workflows key off these IDs.)

**Self-check before writing each open question:** "Is this still open, and would a product-side person be the one to answer it?" If it's already answered or an engineer would answer it — it doesn't belong here.
```

## Step 4 — Review before returning to the PM

Before sending the draft, run all five audits:

1. **Anti-fabrication audit.** Read every line. For each statement of fact (a behavior, sort order, event name, empty state, edge case, copy string), ask: *"Did the PM say this, did a behavior-tool check confirm it, or did I make it up?"* If made up — replace with TBD or delete. A current-behavior claim counts as confirmed only if you actually ran the probe this session; proxy findings (web app standing in for mobile) count only if the PM confirmed parity. **This is the most important check.**

   On a covered service, before final handoff, **re-verify the load-bearing current-behavior claims** — the ones a requirement row or a "must not break" constraint depends on — with `check_existing_behavior` in `deep` mode (higher rigor than the `graph`/`quick` probes used while drafting). Reserve `deep` for these few handoff checks, not routine drafting probes.

2. **Technical-content audit.** Read every line. Look for: file paths, framework/library names, API/service/table references, release mechanics (flags, OTA, rollout %), schema talk, low-level jargon. **Delete it** — there is nowhere in the PRD for it to move to. If deleting it loses a genuine cross-service dependency, restate that dependency as one plain-language sentence in the Summary.

3. **Requirements audit.** Each R-row is atomic (one commitment), user-observable, and a constraint the PM actually set — not a decision you made. If you'd be embarrassed for the PM to ask *"wait, who decided this?"* — it shouldn't be a row. Split compound rows; make vague rows ("handles errors gracefully", "works well") exact or demote them to a TBD.

4. **Open questions audit.** Read every entry. Two kill conditions: *"Was this already answered?"* → remove it (the answer lives in the sections above). *"Would an engineer be the one to answer this?"* → delete it entirely.

5. **Traceability audit.** Every blocking `**[TBD → Qn]**` marker points at a live Open Questions entry with an owner; every Open Questions entry has a stable `Qn` ID; R-/NG-/S-IDs are sequential, unique, and never reused; every screen row in Section 5 has an explicit status (designed / no design planned / TBD → Qn); the `Version` line reflects this draft. Downstream engineering workflows extract requirements row-by-row from the PRD and anchor unresolved points to these IDs — a blocking gap without an owned question becomes a guess on the engineering side.

Plus the standing checks:

- Every section is specific to this feature, not generic boilerplate.
- Figma links are per-screen node links (URLs with `node-id`), not one link to a whole file. If you don't have a node link, mark TBD — never invent one.
- Event names — if you don't know, mark TBD.
- Non-goals exist (or push back and ask).
- Owner fields are roles, not names.

## Anti-patterns — never do these

- **Don't invent specifics.** Single biggest failure mode. Specific behaviors, UX choices, event names, edge-case handling, empty-state copy — if the PM didn't say it: ask, mark TBD, or omit. Confident-sounding fabrication is worse than honest uncertainty. (See Core principle 2.)
- **Don't put technical content anywhere in the PRD.** No file paths, framework names, APIs, schemas, flags, or release mechanics — in any section. There is no technical-notes section by design. (See Core principle 1.)
- **Don't ask the PM technical questions.** "Which API?", "behind a flag?", "OTA or binary?" — engineering answers these later, from the PRD. Asking a PM these is noise.
- **Don't ask the PM what the product does today** when the behavior tools cover the service — check the codebase and bring the PM the *decision*, not the research. Conversely, **don't claim a codebase check you didn't run**, and don't skip the collision check on a covered service.
- **Don't leak behavior-tool output into the PRD.** Findings are background; code evidence, file paths, and anchor names stay out, same as all technical content.
- **Don't restate answered questions in Open Questions.** If the PM answered it, the answer is settled content in the relevant section. Open Questions holds only what's genuinely still open.
- **Don't proceed when questions went unanswered.** If you asked 5 clarifying questions and got 1 answer, re-ask the other 4. Don't silently assume.
- **Don't pad.** A 3-page PRD that says something beats an 8-page PRD that says nothing.
- **Don't auto-invent analytics events.** Naming conventions come from the service skill; the actual events to fire are a PM decision — ask.
- **Don't write the engineering solution.** PRDs describe **what** and **why**; engineering chooses **how**.
- **Don't skip the clarifying-questions step** just to look productive. A PRD built on guesses is more expensive than 5 minutes of questions.
