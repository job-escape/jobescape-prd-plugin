# Design-first intake (Step 2.5 — when Figma designs exist)

## Contents
- The coverage ledger — the exit rule
- Phase 0 — Ingest and triage (silent)
- Phase 1 — Per-screen rounds (7-step round shape)
- Phase 2 — Flow pass (lives in its own file)
- Phase 3 — Ledger close-out + escape question
- Fatigue valves
- Time pressure and "just draft it" (incl. override precedence)
- Anti-patterns

Run this protocol **after** the Step 2 brief and **before** drafting. It replaces free-form mid-draft questioning with a structured interview driven by an inventory of the design. The brief still comes first — problem, goals, segment, and success measure do not live in any Figma file.

Without designs, skip the phases in this file and draft from the brief as before (mid-draft questions per Step 3) — but the flow pass (`flow-pass.md`, loaded per the hub's table) **still runs before any final draft**; its questions live in the flow, not in any frame. Design-first intake is a mode, not a prerequisite — a PRD may legitimately precede design.

## The coverage ledger — the exit rule

The unit of work is the **inventory item**: one component × action or component × state cell extracted from the design (plus flow-pass items). Every item ends in exactly one of three states:

1. **Settled** — the PM answered, the design itself answers it, or a behavior-tool check answered it (with provenance recorded).
2. **Open** — converted to `**[TBD → Qn]**` with an owner in Open Questions.
3. **Out of scope** — the PM explicitly said so.

**Hard exit rule: never present a final draft while any inventory item is in none of these states.** "I think we've covered everything" is not a legal stopping point — only an empty or explicitly-accepted ledger ends the interview. If more than ~20% of items end Open — and the PM hasn't explicitly chosen to ship with that residue — the draft isn't ready: say so and propose resolving the biggest ones now rather than shipping a TBD farm.

**Keep the ledger as a working markdown file next to the draft** (never inside the PRD): one line per item — screen, item, state, provenance ("from design" / "behavior check" / "PM, this session" / "standard → {pattern}"). Update it every round. It is the resume point after breaks and interruptions, and the audit trail for the coverage audit. Provenance lives **only** here — R-rows in the PRD stay clean product statements with no sourcing annotations.

## Phase 0 — Ingest and triage (silent)

1. Enumerate the file's frames cheaply first (Figma MCP: `get_metadata`), then pull context/screenshots per frame — never try to ingest a large file in one call.
2. Per screen, build the inventory: every component, its actions (taps, inputs, scrolls, swipes), and its states. Component **variants** often encode states (`state=hover/disabled/error`) — read them. **Prototype wiring** (frame-to-frame connections) shows *intended* navigation — treat it as evidence for a confirmation question ("the prototype wires Continue → Paywall — confirm?"), never as a settled fact. While ingesting, record each screen's node link — in design-first mode **you** populate the Section 5 S-table from the file; don't ask the PM to paste links you already have.
3. **Add the states the designer didn't draw.** Run a standard checklist per component type and flag missing ones as inventory items: list → empty / loading / error / one item / very many; button → disabled / loading / after-tap; input → invalid / disabled / max length; text/data → very long values (truncate or wrap?) / partial or missing data; screen → empty / loading / partially loaded / error / offline / first visit / returning / mid-flow abandon / not permitted to view *(the mock almost always shows only the ideal state — the other states are where the missing requirements live)*. Missing designed states are the single most common source of "the requirements were missing details" — enumerate them explicitly.
4. If the file has multiple platform versions of a screen (iOS / mobile web / desktop), inventory the screen **once** and add each visible platform difference as its own item — don't triple the inventory.
5. Triage every item into tiers:
   - **Tier A — the design answers it** (layout, visible copy, which states exist as variants — **appearance facts only; behavior is never Tier A**): record as settled with provenance "from design". Don't ask.
   - **Tier B — existing behavior or a named pattern answers it** (behavior tools on covered services, design-system conventions the PM already pointed at): check, record, don't ask.
   - **Tier C — a genuine PM decision**: this is the question backlog.

Inventory items are **questions, never answers**: an inferred state or action must not become an R-row until settled. Core principle 2 applies to the inventory itself.

Then send the PM a **scope confirmation**, not a question batch: list the screens found in flow order, flag frames that look like abandoned explorations ("skip these?"), and ask the one question no inventory can answer: *"Is anything in this feature NOT in this file — pushes, emails, deep links, another surface?"*

On a covered service, run the automatic collision check (rules in `behavior-tools.md`, already loaded per the hub's table) **here** (after ingest) rather than right after the brief — the inventory gives you an accurate `designSummary` and `touchedSurfaces`. Collision hits become inventory items like everything else.

## Phase 1 — Per-screen rounds

Work one screen per round, in user-flow order. Each round has a fixed shape:

1. **Present the inventory summary** — a short table so the PM sees what you extracted *before* answering anything:

   > **Screen 2 of 6: Course List**
   > | Component | Read from design | Needs your decision |
   > |---|---|---|
   > | Course card | layout, 3 fields, "Continue" label | tap target — whole card or button only? |
   > | List | 4 cards shown | empty state (no frame found), max items, sort order |

   The "read from design" column lets the PM correct a misreading before it propagates ("that's not a filter, it's a tab"). Misread inventory is worse than no inventory.

2. **Ask the Tier C batch — 3-5 questions, hard cap per message** (intentionally tighter than Step 2's general cap). A screen may take several rounds; the cap is per message, not per screen. Order: happy-path behavior → missing states → edge cases; within that, highest-impact first. **If one answer will shape the next questions, ask it alone first** — a gating question batched with its dependents wastes the batch. Each question carries its provenance in one clause — *"the mock doesn't distinguish"*, *"no frame found for this state"*, *"in the web app today X happens — match or change?"* — so questions read as legitimate, not pedantic. Phrase neutrally, per the hub's question hygiene.

3. **Follow the thread.** When an answer reveals new scope or behavior ("oh, and paid users skip this screen entirely"), pursue it with a follow-up while it's warm — don't defer it to stay on script. New unknowns become new inventory items; a ledger that grows mid-interview is the system working. Rigid adherence to the enumerated list is its own failure mode: the inventory guarantees coverage, follow-ups capture what no enumeration can.

4. **Prune rejected branches.** When an answer rules out a whole area ("no login in v1"), bulk-mark every inventory item under it as out-of-scope in one stroke — never keep asking about children of a rejected parent. When two consecutive answers in one area amount to "don't care / nothing special", stop item-by-item questioning there: one closing confirmation (*"anything else about {area} worth capturing?"*) and close the branch.

5. **Probe contradictions immediately.** When a new answer conflicts with an earlier settled item, the design, or a behavior-tool finding, raise it on the spot — *"earlier you said the row hides when empty; this suggests a placeholder — which wins?"* — and update the loser. Never silently record both; a contradiction shipped in a PRD becomes an engineering coin-flip.

6. **Record and reflect.** Write answers straight into R-rows (settled content, per template rules) and echo the ledger in one line: *"Course List: 9 settled, 2 open (empty-state copy → Q3, max items → Q4). Next: Paywall."* This running count lets the PM see coverage accumulate and intervene early. Then **re-rank what's left**: answers change which remaining items matter — reorder the backlog by relevance to what the PM just said, rather than marching in enumeration order.

7. **Partial answers** — the Step 2 rule, scoped per screen: re-ask the unanswered subset once, max twice, then convert to `**[TBD → Qn]**` and move on. Never silently carry unasked questions forward — the ledger must show them as Open.

## Phase 2 — Flow pass

Runs after the last screen. Its protocol lives in `flow-pass.md` (loaded per the hub's table); its items enter the same ledger and the same exit rule.

## Phase 3 — Ledger close-out

Before drafting the final document, show the full ledger: *"Coverage: 41 of 46 items settled, 5 open: Q3 (content), Q4 (PM), … Resolve any now, or ship the draft with these as Open Questions?"* Present open items as questions to answer **now** — the close-out is a last resolution attempt, not a formality.

Alongside it, ask the one question that escapes the inventory entirely: *"What matters about this feature that I never asked about?"* — the interview's designed exits from its own frame are this question, the Phase 0 scope check, and the flow pass. **On long interviews (4+ screens), ask the escape question once mid-interview as well, not only here** — it reliably surfaces facts no enumeration reaches (experiment mechanics, parallel workstreams, unstated constraints), and asking only at the end delivers them after the structure is already drafted.

Only after the PM responds (or explicitly accepts the residue) do you draft.

## Fatigue valves

Exhaustive enumeration must not mean exhaustive interrogation:

- **"Standard" shortcut.** The PM may answer any question with "standard" / "same as X" — resolve it against the design system or the named pattern and record it settled *with that provenance*, so it's auditable, not fabricated.
- **Batch defaults.** For low-stakes items (e.g. all disabled-button states across the flow), propose one default table in a single message — "confirm all, or flag exceptions" — instead of N separate questions.
- **Session breaks.** Large features won't fit one sitting. The ledger is the resume point: re-emit it ("3 of 6 screens done, resuming at Paywall") when the PM returns or after any interruption.

## Time pressure and "just draft it"

The PM's override beats the exit rule — but **never respond to a time signal by simply ending; respond by triaging.** When the PM says "just draft it", "I have 5 minutes", or similar:

1. Spend **one** message on only the highest-impact remaining questions — the ones whose answers change what gets built (scope, gating, core behavior) — in impact order, not screen order. Cosmetic and low-stakes items don't make this cut.
2. Then convert every remaining Tier C item to `**[TBD → Qn]**` with owners — the ledger is now fully accounted — and deliver the draft, noting the open count up front.

**Precedence:** the override beats the ledger exit rule, but it never beats the design-pending FINAL ban (hub, Step 2) — if design is still outstanding, the triaged draft is delivered promptly but stays labeled a pre-design draft requiring the design cross-check.

The failure to avoid: treating a time signal as permission to stop mid-inventory with items silently unaccounted. Triaged-then-TBD'd is fine; abandoned is not.

## Anti-patterns

- **Don't declare the interview done by feel.** "Exhaustive" is defined by the ledger — every item settled, TBD'd, or ruled out of scope. Stopping because questions "feel covered" is exactly the early-termination failure this protocol exists to prevent.
- **Don't turn inventory into requirements.** An inferred state, action, or "possible behavior" from the design analysis is a question, not a fact. It becomes an R-row only after the PM (or a design/behavior-tool check with provenance) settles it.
- **Don't interrogate past the fatigue valves.** Batch low-stakes defaults, accept "standard / same as X" with provenance, offer session breaks — a PM who stops answering leaves the PRD *less* complete than a shorter, well-triaged interview.
