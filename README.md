# jobescape-prd-plugin

Claude Code skills that help jobescape PMs draft high-quality Product Requirements Documents (PRDs).

## What's inside

One orchestrator skill plus five per-service context skills — so the assistant knows the template **and** the domain of the service the PRD is for.

| Skill | Purpose |
|---|---|
| `prd-writer` | Orchestrator. Identifies the target service, runs a clarifying-questions protocol if the brief is thin (plus a design-first structured interview when Figma designs exist), and drafts the PRD using the standard template. Structured as a slim hub (`SKILL.md`) plus phase-specific reference files (`references/`) and a mechanical draft linter (`scripts/prd-lint.py`). |
| `prd-funnel` | Context for the conversion funnel runtime (quiz steps → selling page → checkout). A/B variants, payment processors, BigQuery analytics. |
| `prd-editscape` | Context for the WYSIWYG MDX editor for lesson authoring. Custom components, viewport preview, current analytics gap. |
| `prd-jobescape-app` | Context for the React Native / Expo mobile app. Native-rebuild gotchas, iOS/Android parity, IAP, deep links. |
| `prd-frontend-alpha` | Context for the Next.js web app (App Router migration target). tRPC + Effector + SSR patterns, `pr_webapp_*` analytics. |
| `prd-funnel-constructor-editor` | Context for the visual funnel builder. Schema compatibility with the `funnel` runtime, Lexical + Yjs collaboration, `@job-escape/fce-lib` coordination. |

## Install

```
/plugin marketplace add <git-url-of-this-repo>
/plugin install jobescape-prd@jobescape
```

After install, the skills are namespaced under the plugin. The orchestrator is `prd-writer` — invoke it naturally by asking Claude Code to draft a PRD, or explicitly via `/jobescape-prd:prd-writer`.

## How to use it (for PMs)

Minimal example:

> *"Draft a PRD for adding a new geo-specific discount step to the funnel."*

What happens:
1. `prd-writer` activates, identifies the target service (`funnel` in this example) — asking rather than guessing from vocabulary, including whether the feature ships on more than one platform — and loads `prd-funnel` for domain context.
2. **If you open with a feature walkthrough, that counts as a complete brief** — the assistant derives Problem and Goals from it for you to confirm, and its first questions go to the feature itself (including audience & rollout: straight release or A/B test, split, control experience, existing users). Only a genuinely thin brief (a title, a one-liner) triggers the clarifying-questions checklist first.
3. Before any final draft, a **flow pass** walks every exit of the feature: for each reachable destination, per platform — where does *back* go, where does *finishing* land, and does the answer change by origin. These return/completion paths are the layer screen-by-screen review always misses.
4. A full PRD draft is produced using the standard template: Summary, Problem, Goals & Non-goals (stable NG-IDs), Requirements (numbered atomic R-rows — the behavioral contract), Design (per-screen table), Analytics events table, Open questions (stable Q-IDs). Drafts are checked by six audits plus a mechanical linter (dangling TBD references, broken ID sequences, missing owners).
5. Unknowns are marked inline as `**[TBD — {specific question}]**` rather than guessed. Product unknowns only — technical details (file paths, APIs, release mechanics) are excluded from the PRD entirely, and the assistant never asks the PM technical questions (identifiers *you* name, like an analytics event, stay in verbatim). Open Questions carries only what's still unanswered when the draft lands; answered questions become settled content in the relevant sections. If you defer analytics, the section becomes one owned TBD — no proposal tables pushed back at you.

### Design-first intake (when you have Figma designs)

If you attach or link Figma designs for the feature, the assistant switches to a structured interview instead of free-form questions:

1. **Ingest & scope** — it enumerates the screens in the file, builds a per-screen inventory of every component, its actions, and its states (including states the designer *didn't* draw — empty, loading, error), and confirms scope with you ("anything in this feature not in this file?").
2. **Per-screen rounds** — for each screen it shows what it read from the design, then asks only the genuine product decisions (3-5 questions per message), with a running coverage count ("Course List: 9 settled, 2 open").
3. **Flow pass** — rounds for what no frame contains: the loop-walk (back and completion paths per destination per platform), entry points, segments and experiment mechanics, analytics.
4. **Close-out** — a final ledger of everything settled vs. open, plus the escape question ("what matters that I never asked about?"), before the draft is written.

The interview ends only when every inventory item is answered, marked TBD with an owner, or ruled out of scope — not when the assistant "feels done". To speed it up you can answer "standard" / "same as X" to any question, or confirm proposed defaults in bulk.

The Design section is a per-screen table: each screen/flow step gets a stable S-ID, its Figma **node** links (copy via "Copy link to selection") per platform (iOS / mobile web / desktop), and an explicit design status — designed (with which states), no design planned, or pending. A state is listed as "designed" only if a frame for it actually exists; specified-but-undrawn states say so. Figma links are optional; the status column is not. Have those node links (and the analytics-events Figma URL) handy when drafting.

**Design still in progress?** The assistant will draft from your brief, but the document stays visibly marked as a pre-design draft until the design arrives and a cross-check against it has run — it won't declare a PRD final while a promised design is outstanding.

## Behavior verification (optional, recommended)

The skills integrate with the **Behavior Codebase MCP** — a hosted service that answers "what does the product do today?" against a read-only codebase checkout. When its tools (`check_prd_collisions`, `check_existing_behavior`, `list_behavior_repos`) are connected to the session:

- After the brief, the assistant **automatically checks the idea for collisions** with existing behavior and turns any hits into product questions or Open Questions.
- During drafting, current-behavior facts are checked against the codebase instead of being asked of the PM or marked TBD — the PM only answers *what should change*.
- Coverage today: `frontend-alpha` (direct), `jobescape-app` (via `frontend-alpha` as a proxy — findings are always confirmed with the PM for mobile parity). Other services fall back to the normal ask/TBD protocol.

The MCP server is installed separately by the plugin maintainer — it is not bundled with this plugin. Without it, everything works as before; the behavior checks simply don't happen.

## Maintenance

Each per-service skill reflects the state of its service at the time the skill was written. When a service's tech stack, analytics conventions, or domain vocabulary changes materially, the corresponding skill needs an update. Recommended: one owner per service (typically the service's tech lead) does a review each quarter.

`prd-writer` follows a **one-rule-one-place** convention: every rule lives in exactly one file (the hub `SKILL.md` for always-on rules, the matching `references/` file for phase-specific ones) and other files may point to it but never restate it. When editing, change the rule at its home — restating it elsewhere reintroduces the drift that this structure exists to prevent. Version history: see [CHANGELOG.md](CHANGELOG.md).

## Local development

Structure:

```
jobescape-prd-plugin/                  # marketplace root
├── .claude-plugin/
│   └── marketplace.json               # marketplace manifest, lists the plugin
├── plugin/                            # plugin root (its own dir per Claude Code convention)
│   ├── .claude-plugin/
│   │   └── plugin.json                # plugin manifest
│   └── skills/
│       ├── prd-writer/
│       │   ├── SKILL.md               # slim hub: always-on rules + step sequence + load table
│       │   ├── references/            # phase-specific protocols, loaded at their trigger moment
│       │   │   ├── behavior-tools.md  #   behavior MCP usage, collision check, deep re-verify
│       │   │   ├── design-intake.md   #   coverage ledger, Phase 0/1/3, fatigue valves
│       │   │   ├── flow-pass.md       #   loop-walk, rollout/experiment, analytics deferral
│       │   │   ├── template.md        #   PRD template + section rules
│       │   │   └── audits.md          #   six audits + standing checks
│       │   ├── scripts/
│       │   │   └── prd-lint.py        # mechanical draft linter (IDs, TBD refs, owners)
│       │   └── team-roster.md         # standalone reference; not used during drafting
│       ├── prd-funnel/SKILL.md
│       ├── prd-editscape/SKILL.md
│       ├── prd-jobescape-app/SKILL.md
│       ├── prd-frontend-alpha/SKILL.md
│       └── prd-funnel-constructor-editor/SKILL.md
└── README.md
```

The marketplace lives at the repo root; the plugin lives in `./plugin/`. `marketplace.json` references it via `"source": "./plugin"`. This separation matches Claude Code's canonical layout — sharing `.claude-plugin/` between marketplace and plugin caused install errors in earlier versions.

To test changes before publishing, install from your local checkout:

```
/plugin marketplace add /absolute/path/to/jobescape-prd-plugin
/plugin install jobescape-prd@jobescape
```

After editing a skill, run `/plugin reload` (or restart Claude Code) to pick up changes.
