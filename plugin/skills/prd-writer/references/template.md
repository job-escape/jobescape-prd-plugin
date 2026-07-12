# Drafting the PRD — template and section rules

Keep sections short — a PRD earns its length, it doesn't justify it.

**Versioning:** start at `Draft v0.1` and bump the `Version` line on every material edit (scope change, resolved question, new/changed requirement — not typo fixes). Engineering diffs PRD versions to detect requirement drift mid-build, so an edited-but-unbumped PRD can cause stale work.

## Audience and language

The PRD's primary consumers are **coding agents and requirement-extraction pipelines**; humans skim it. Sections 1–3 are the skimmable prose head; everything behavioral lives in numbered rows. Optimize for precision and extractability, not narrative — in **plain product language** throughout:

- **Every behavioral statement must be user-observable and independently verifiable.** Describe what the user sees and does. *"the Early Access row is not shown"* is good; *"the section does not exist in the DOM"* is bad — implementation vocabulary is fabrication bait, not precision.
- **Talk about user behavior and product outcomes**, not implementation. Write *"users see a list of recommended courses"* — never how that list is fetched or stored. There is no technical section anywhere in the PRD (Core principle 1).
- **Plain English for technical terms.** If a domain term is unavoidable, define it in parens on first use.
- **One commitment per sentence.** Extraction splits compound statements into separate rows anyway — pre-split them.
- **Exact values, always.** Copy strings verbatim in quotes, numeric thresholds as numbers, each enum value named individually. "A reasonable limit" and "standard error copy" are unextractable.

## Owner fields

Where the template asks for an owner, use a **role**, not a person: `Owner: PM`, `Owner: design`, `Owner: analytics`, `Owner: content`. Don't ask the PM to assign names, and don't consult the team roster — assigning people happens outside the PRD draft.

## Template

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
Who has the problem, what it looks like today, and evidence it's worth solving (user research, support tickets, metrics, intuition — label which). Avoid jumping to the solution. In dictation mode, this section is your reading of the walkthrough — label it for PM confirmation.

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
- Prefer one of five row shapes — they force a complete trigger + observable-outcome commitment and parse cleanly downstream:
  - Always true: `The {screen/element} shows {…}.`
  - Event: `When {user action or trigger}, {observable outcome}.`
  - State: `While {condition holds}, {observable behavior}.`
  - Edge / unwanted: `If {error or edge condition}, then {what the user sees}.`
  - Segment / variant: `For {segment}, {behavior}.`
  A commitment that fits none of these is usually compound — split it.
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
- In Status, list which states are actually designed (default / empty / loading / error / hover). **A state may be listed as "designed" only if a frame for that exact state exists in the file.** A state that is specified in Section 4 but has no frame is written as *"specified, no frame"* — never folded into "designed". This is the rule most often broken: summarizing a fully-specified screen as "designed" fabricates design coverage that reviewers and engineers will act on. Undesigned states the PM specified belong in Section 4 as R-rows; undecided ones go to Open Questions.
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

If the PM **defers analytics** ("we'll define events when analytics work starts"), this section is one deferred TBD row with an owner and milestone — don't keep a proposed table "for reference"; a proposal left in the doc reads as decided.

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

## Anti-patterns

- **Don't restate answered questions in Open Questions.** If the PM answered it, the answer is settled content in the relevant section.
- **Don't auto-invent analytics events.** Naming conventions come from the service skill; the actual events to fire are a PM decision — ask.
- **Don't re-propose deferred analytics.** One deferral closes the topic: a TBD row with an owner, not another proposal table next round.
- **Don't write the engineering solution.** PRDs describe **what** and **why**; engineering chooses **how**.
