---
name: prd-funnel-constructor-editor
description: Service context for writing a PRD targeting the `funnel-constructor-editor` service — jobescape's visual builder for constructing conversion funnels (quizzes, onboarding, upsells, selling pages) that the `funnel` service consumes. Load this when `prd-writer` identifies `funnel-constructor-editor` as the target service, or when a PRD mentions the funnel builder, quiz constructor, flow editor, selling-page blocks, real-time collaboration on funnels, or the `@job-escape/fce-lib` shared library.
---

# funnel-constructor-editor — service context for PRDs

## What this service is

A visual editor for constructing multi-step conversion funnels: quiz pages, onboarding steps, upsell/selling pages, and the conditional branching between them. Produces configs (MDX + JSON in S3 + Prisma) that the `funnel` service consumes at runtime. Real-time collaborative editing via Lexical + Yjs over WebSocket.

## Tech stack — what matters for PRDs

- **Next.js 15** (App Router, TypeScript)
- **Prisma + PostgreSQL** — data model (Page, SellingPage, Block, Rule, LogicRule, Subscription)
- **AWS S3** — page content stored as `.mdx` files with gray-matter frontmatter
- **Effector** + **React Query** — client state + server state
- **XYFlow + dnd-kit** — visual flow editor and drag-and-drop
- **Lexical + Yjs + Hocuspocus** — real-time collaborative rich-text editing (WebSocket: `wss://collab-server-u59i.onrender.com`)
- **`json-rules-engine`** — conditional branching logic
- **`@job-escape/fce-lib`** — external shared package providing the component registry consumed by both this editor and the `funnel` runtime

## User-visible surface

- `/dashboard` — list of quiz versions
- `/[quiz_version]` — per-version editor (page list + flow + content editor)
- **Flow editor** — visual canvas of pages, rules, branches
- **Content editor** — Lexical rich-text with live multi-user collaboration
- Settings: `/templates`, `/components`, `/event-properties`, `/users`, `/subscriptions`

## Vocabulary PMs should use correctly

- **Quiz / Funnel** — the container (pages + rules)
- **Page** — one step; many `PageType`s (`single_select_quiz`, `email_form`, etc.); stored as `.mdx` in S3
- **Block** — a content unit on a selling page (dialog, drawer, etc.); positioned via x/y
- **Rule** — conditional branching: `from → [to]` based on answers
- **LogicRule** — source → target trigger on selling pages (`on_click`, `on_scroll`, `on_payment_success`)
- **SellingPage** — monetization page with blocks + logic rules + subscriptions
- **Subscription** — pricing tier attached to a block
- **Component registry** — shared catalog in `@job-escape/fce-lib`; determines which components a quiz/selling page can use

## Analytics events — where and how

**None exist in this editor today.** No tracking layer.

**PRD implication:** any PRD claiming a "measure editor usage" or "track PM behavior" goal must propose the analytics approach — don't assume one. The `jobescape-app` / `frontend-alpha` BigQuery pattern is the likely reference; name convention `pr_fce_*` fits the existing family.

## Figma / design

No Figma integration, no design-token file. UI built directly with Radix + Tailwind.

**PM hook:** PRD Design section should attach Figma URL(s) explicitly. If the change adds a new block/component *usable inside constructed funnels* (not just editor UI), also include the design for how it renders in the `funnel` runtime — not just how it looks in the editor.

## Typical PRD concerns for this service

1. **Schema compatibility with `funnel`.** This editor produces configs; the `funnel` runtime consumes them. **Any change to page/block/rule shape is a cross-service change.** PRD must spell out:
   - What schema fields change
   - Backward-compat story for existing live funnels
   - Required version bump in `@job-escape/fce-lib`
   - Migration plan for S3 MDX files already on disk
2. **Real-time collaboration invariants.** Lexical + Yjs + Hocuspocus. Features that change the document model must work under concurrent edits — PRD should state whether the feature is CRDT-safe or requires a lock.
3. **Rule-engine validation.** Conditional branching via `json-rules-engine`. New rule types or operators need validation so a saved funnel can't break the runtime.
4. **Versioning & undo/redo.** Quiz versions live as S3 folders. Lexical history is imported but unclear whether undo/redo is fully wired — confirm if the PRD relies on it.
5. **Component-registry coordination.** Adding a new block type means updating `@job-escape/fce-lib`, this editor, AND the `funnel` runtime. Three artifacts, one release.

## Gotchas to flag in PRDs

- **`@job-escape/fce-lib` is the coupling point** between this editor and the `funnel` runtime. PRDs touching the component catalog are inherently cross-service, and the lib's version bump should appear in the Rollout section.
- **The `funnel` service is the consumer, not this editor.** A PRD that says "change what users see in the quiz" targets `funnel`; a PRD that says "change how PMs build quizzes" targets this service. Getting this wrong splits the work incorrectly.
- **S3 MDX files are the source of truth for page content** — not Postgres. Migrations must handle both.
- **Collaboration server is a rendered free-tier URL** (`onrender.com`). PRDs raising concurrency or reliability should flag that hosting arrangement as a risk.
- **No analytics** means no way to ship a PM-adoption metric today. Propose the analytics layer in the same PRD or split it out.
