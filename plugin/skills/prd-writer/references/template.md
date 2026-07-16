# Drafting the PRD — deliverable format and section rules

## Contents
- The two artifacts: prd.yaml (canonical) + prd.md (render)
- Interview drafts vs the final compile
- Versioning
- Language rules (audience, row precision, owner fields)
- The YAML schema (with skeleton)
- Requirement-row rules
- Screens & design status rules
- Analytics rules
- Open-items rules
- The markdown render
- Anti-patterns

## The two artifacts

The final PRD is delivered as **two files**:

1. **`prd.yaml` — canonical.** Structured YAML; the single source of truth. Its primary consumers are coding agents and requirement-extraction pipelines, which filter and traverse typed rows instead of parsing prose.
2. **`prd.md` — human render.** A readable markdown view generated FROM the YAML, opening with the line: *"Rendered from `prd.yaml` v{version} — the YAML is canonical; if they disagree, the YAML wins."* Regenerate it on every YAML change — never edit the render directly.

## Interview drafts vs the final compile

**During the interview, show the PM human-readable artifacts** — inventory tables, numbered requirement lists, flow maps — exactly as the intake protocols describe. PMs correct tables well and YAML poorly; the draft-review corrections are too valuable to lose to format friction. **Compile to YAML only when the content is settled** (after close-out / final corrections), then generate the render. Late-arriving corrections go into the YAML first, then re-render.

## Versioning

Start at `version: "0.1"` with `status: "Draft"`; bump on every material edit (scope change, resolved question, new/changed requirement — not typo fixes). Engineering diffs versions to detect requirement drift mid-build. The render always states the version it was generated from.

## Language rules

The same precision rules as ever, now applied to YAML field values:

- **Every behavioral value is user-observable and independently verifiable.** Describe what the user sees and does; implementation vocabulary is fabrication bait.
- **Plain product language.** No file paths, frameworks, APIs, schemas, or release mechanics anywhere (Core principle 1). PM-stated identifiers (a named analytics event, a named system) stay verbatim.
- **One commitment per row.** A row with two triggers or two outcomes is two rows.
- **Exact values, always.** Copy strings verbatim in quotes inside field values; numeric thresholds as numbers; each enum state its own row or named state.
- **Owner fields are roles** (`PM`, `design`, `analytics`, `content`, `engineering`), never names.

## The YAML schema

Top-level keys, in order. Keys marked *(optional)* are included only when the feature has that content — never emit empty placeholders.

```yaml
meta:
  title: "PRD: {Feature name}"
  service: "{funnel | editscape | jobescape-app | frontend-alpha | funnel-constructor-editor}"
  author: "{PM name}"
  status: "Draft"            # + design-pending note when applicable (see hub, Step 2)
  version: "0.1"
  last_updated: "YYYY-MM-DD"
  design:                    # omit if no design exists
    figma_file: "{file name}"
    figma_base: "https://www.figma.com/design/{key}/{name}?node-id="
  launch_prerequisites: []   # (optional) dependencies that must hold before ship

summary: >-
  One paragraph, plain language. What we're building and why; a new hire
  understands the initiative from this alone. Cross-service dependencies
  named here in one sentence.

problem: >-
  Who has the problem, what it looks like today, evidence (labeled).
  In dictation mode: your derived reading, labeled for PM confirmation.

goals:
  - "Outcome, not feature"

non_goals:                   # stable IDs — implementing a non-goal is a defect
  - {id: "NG-1", item: "..."}

audience_and_entry:
  platforms: {list: [...], note: "e.g. desktop behaves like web unless a row says otherwise"}
  segment: "who gets this"
  rollout: >-                # straight release, or full experiment mechanics:
    split, assignment unit and moment (PM-stated event verbatim),
    control experience, existing-user behavior
  entry_order: "where in the product flows this appears, what runs before it"
  always_reachable: "standing navigation entry points, if any"

principles: {}               # (optional) named cross-cutting rules rows rely on,
                             # e.g. origin-scoping of return paths, with R-refs

flow_map:                    # the loop-walk, made machine-readable
  nodes: {H: "Homepage", ...}          # every screen/destination in the feature's reach
  edges:
    - {from: "...", to: "...", trigger: "...", f_step: "F-2", kind: forward}
    - {from: "...", to: "...", trigger: "back", f_step: "F-9", kind: return}
    - {from: "...", to: "...", trigger: "finished", f_step: "F-10", kind: return}
  notes: []                  # incl. per-platform differences in edges

f_steps:                     # flow steps grouped by area; stable F-IDs
  {area}:
    preamble: "invariants for the group"   # (optional)
    steps:
      - {id: "F-1", description: "...", sub_steps: []}

requirements:                # the contract — typed atomic rows, stable R-IDs
  - id: "R-1"
    status: "Done"           # or "TBD → Qn" (must reference a live open item)
    f_step_group: "F-1: Entry"
    screen: "{screen}"
    component: "{component}"
    initial_state: "state before the trigger"
    initial_node: {desktop: "220-2781", mobile: "87-3609"}   # or "—" / "— (existing screen)"
    trigger: "user action or condition"
    resulting_state: "observable outcome, exact copy in quotes"
    resulting_node: {desktop: "...", mobile: "..."}
    side_effect: "—"         # e.g. "story marked viewed"
    analytics: "TBD"         # event name if decided, "TBD" if deferred, "—" if none

screens:                     # per-screen design status — stable S-IDs
  - id: "S-1"
    name: "{screen / step}"
    nodes: {desktop: "220-2781", mobile: "87-3609"}          # "—" where platform n/a
    status: "designed (default); loading/error not drawn (→ Qn)"
    # status vocabulary: designed (with which states) | specified, no frame |
    # no design planned — reuse {pattern} | design pending (→ Qn)

reuse_of_existing_entities:  # (optional) what exists today and is reused, not rebuilt
  verified_against_codebase: "YYYY-MM-DD or 'not verified — see open items'"
  entities:
    - {name: "...", note: "what exists, what the feature reuses, what must not be rebuilt",
       verification_flag: "stale — recheck at handoff"}      # (optional)

analytics:
  deferred: true             # when the PM defers: this flag + owner, nothing else
  owner: "analytics"
  needed_by: "analytics kickoff"
  events: []                 # when decided: [{event, fires_when, properties}]

open_items:                  # live questions only — stable Q-IDs
  - id: "Q3"
    item: "the question, answerable in one sentence"
    owner: "design"
    needed_by: "design freeze"
    affected_r_ids: ["R-1", "R-8"]

id_bookkeeping:
  note: >-
    R/NG/S/Q/F IDs are stable across ALL versions: numbered in order of first
    appearance, never renumbered, never reused — including across the
    pre-design snapshot → design-checked transition. Withdrawn rows keep
    their id with status "withdrawn". Q numbering is continuous; resolved
    questions' answers are folded into rows and the id retired (listed here).
  resolved_questions: "Q1–Q2, Q5 resolved during drafting"
```

## Requirement-row rules

- A row is **one trigger → one observable outcome** on one component. The old five row shapes map onto the fields: always-true rows have `trigger: "screen opens"`; state rows put the condition in `initial_state`; segment rows put the segment in `initial_state` or a Scope group.
- `status` is `Done`, `TBD → Qn` (pointing at a live open item), or `withdrawn` — never prose.
- Rows the PM decided are `Done`; edge cases nobody decided are open items, not rows. **Do not invent rows to look complete.** Before each row: *"Did the PM say this, or am I deciding it?"*
- Scope rows (who does NOT get the feature: control group, existing users) are requirements too — give them their own group.
- Undecided copy is `TBD → Qn` in the affected field — never placeholder prose that looks final.

## Screens & design status rules

- Every screen or surface the feature touches gets an S-entry with per-platform node ids and an explicit status. **A state may be listed as "designed" only if a frame for that exact state exists in the file**; specified-but-undrawn states are *"specified, no frame"*. Design-status overclaims are the single largest fabrication source in audited PRDs.
- Node ids are real (from the file), relative to `meta.design.figma_base`. **Never invent node ids**; missing link = `TBD` with an open item.
- Destinations that are existing screens outside the design file: `"— (existing screen)"`.
- **Figma shows how things look, never how they behave** — behavior lives in requirement rows, always.

## Analytics rules

Omit the analytics key entirely for `editscape` and `funnel-constructor-editor` (no tracking layer). **Do not invent event names or properties** — the service skill gives the naming convention; actual events are a PM decision. If the PM defers analytics: `deferred: true` + owner + needed_by, per-row `analytics: "TBD"`, and no proposal tables left in the doc — a proposal left in reads as decided.

## Open-items rules

Only questions still unanswered at delivery; product-side owners only (engineering questions don't exist anywhere in the PRD). Each has a stable Q-id, an owner role, a needed-by milestone, and `affected_r_ids` listing every row whose status points at it (keep the two in sync — the linter checks both directions).

## The markdown render

Generate `prd.md` from the final YAML, for humans:

- Header: title, service, status, version + the canonical-YAML notice.
- Sections in schema order: Summary, Problem, Goals & Non-goals, Audience & entry (+ principles), Flow (edges as a readable list or diagram), Requirements (grouped by `f_step_group`, one line per row: `R-n — [status] — when {trigger} in {initial_state} → {resulting_state}`), Screens table with node links resolved to full URLs, Reuse notes, Analytics, Open items.
- The render adds NOTHING that isn't in the YAML and drops nothing material. It is a view, not a document.

## Anti-patterns

- **Don't hand-edit the render** — change the YAML, regenerate.
- **Don't draft in YAML with the PM** — tables for review, YAML for delivery.
- **Don't renumber IDs between versions** — including from the pre-design snapshot to the design-checked version; new rows append after the highest existing id, whatever group they sit in.
- **Don't restate answered questions in open_items** — answers are folded into rows; the Q-id is retired in id_bookkeeping.
- **Don't auto-invent analytics events**; don't re-propose after a deferral.
- **Don't write the engineering solution.** PRDs describe what and why; engineering chooses how.
- **Don't settle absence.** A brushed-off or unanswered question is an open item — never a "no X exists / no X is defined" non-goal or row.
