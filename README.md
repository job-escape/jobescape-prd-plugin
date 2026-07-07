# jobescape-prd-plugin

Claude Code skills that help jobescape PMs draft high-quality Product Requirements Documents (PRDs).

## What's inside

One orchestrator skill plus five per-service context skills — so the assistant knows the template **and** the domain of the service the PRD is for.

| Skill | Purpose |
|---|---|
| `prd-writer` | Orchestrator. Identifies the target service, runs a clarifying-questions protocol if the brief is thin, and drafts the PRD using the standard template. |
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
1. `prd-writer` activates, identifies the target service (`funnel` in this example), and loads `prd-funnel` for domain context.
2. If the brief is missing 3+ essential pieces (problem, outcome, entry point, scope hints, design direction, success measure), you'll get a small numbered list of clarifying questions.
3. A full PRD draft is produced using the standard template: Summary, Problem, Goals & Non-goals, User flow, Design (Figma links incl. analytics-events map), Analytics events table, Acceptance criteria, Open questions.
4. Unknowns are marked inline as `**[TBD — {specific question}]**` rather than guessed. Product unknowns only — technical details (file paths, APIs, release mechanics) are excluded from the PRD entirely, and the assistant never asks the PM technical questions. Open Questions carries only what's still unanswered when the draft lands; answered questions become settled content in the relevant sections.

The Design section is a per-screen table: each screen/flow step gets its own Figma **node** link (copy via "Copy link to selection"), with optional iOS / mobile web / desktop columns — screens that need no design are simply marked `—`. Have those node links (and the analytics-events Figma URL) handy when drafting.

## Behavior verification (optional, recommended)

The skills integrate with the **Behavior Codebase MCP** — a hosted service that answers "what does the product do today?" against a read-only codebase checkout. When its tools (`check_prd_collisions`, `check_existing_behavior`, `list_behavior_repos`) are connected to the session:

- After the brief, the assistant **automatically checks the idea for collisions** with existing behavior and turns any hits into product questions or Open Questions.
- During drafting, current-behavior facts are checked against the codebase instead of being asked of the PM or marked TBD — the PM only answers *what should change*.
- Coverage today: `frontend-alpha` (direct), `jobescape-app` (via `frontend-alpha` as a proxy — findings are always confirmed with the PM for mobile parity). Other services fall back to the normal ask/TBD protocol.

The MCP server is installed separately by the plugin maintainer — it is not bundled with this plugin. Without it, everything works as before; the behavior checks simply don't happen.

## Maintenance

Each per-service skill reflects the state of its service at the time the skill was written. When a service's tech stack, analytics conventions, or domain vocabulary changes materially, the corresponding skill needs an update. Recommended: one owner per service (typically the service's tech lead) does a review each quarter.

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
│       │   ├── SKILL.md
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
