---
name: prd-funnel-constructor-editor
description: Service context for writing a PRD targeting the `funnel-constructor-editor` service — jobescape's visual builder for constructing conversion funnels (quizzes, onboarding, upsells, selling pages) that the `funnel` service consumes. Load this when `prd-writer` identifies `funnel-constructor-editor` as the target service, or when a PRD mentions the funnel builder, quiz constructor, flow editor, selling-page blocks, real-time collaboration on funnels, or the `@job-escape/fce-lib` shared library.
---

# funnel-constructor-editor — service context for PRDs

## What this service is

A visual editor for constructing multi-step conversion funnels: quiz pages, onboarding steps, upsell/selling pages, and the conditional branching between them. Produces configs (MDX + JSON in S3 + Prisma) that the `funnel` service consumes at runtime. Real-time collaborative editing via Lexical + Yjs over WebSocket.

## How to use this context

Everything in this file is background for **you**: vocabulary, feasibility signals, scope traps, and the analytics situation. None of it is content for the PRD body — the PRD contains no technical details (see `prd-writer`). When a note below says a change is bigger than it looks, that means: scope it and question the PM accordingly — don't write the technicalities into the PRD.

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

**None exist in this editor today, and PRDs for this service don't include analytics.** There is no tracking layer, and this is an internal tool — **omit the Analytics events section entirely** from funnel-constructor-editor PRDs. Do not propose events, event names, or a tracking layer. If the PM states a success metric that would require tracking (e.g. "measure editor usage"), don't design analytics for it — add an Open Question ("how do we measure this, given the editor has no tracking today?") and move on.

Note: analytics for the funnels *built with* this editor lives in the `funnel` runtime — a PRD about measuring end-user behavior targets `funnel`, not this service.

## Figma / design

No Figma integration, no design-token file. UI built directly with Radix + Tailwind.

**PM hook:** PRD Design section should attach Figma URL(s) explicitly. If the change adds a new block/component *usable inside constructed funnels* (not just editor UI), also include the design for how it renders in the `funnel` runtime — not just how it looks in the editor.

## Typical PRD concerns for this service

1. **Compatibility with the live funnel** *(background)*. This editor produces what the `funnel` runtime shows to real users — changing what funnels can contain is always a cross-service change. For the PRD: note the funnel-runtime dependency in one plain-language sentence in the Summary, and ask the PM the product question hiding here: **what happens to funnels that are already live** — do they keep working unchanged, get the new behavior, or need rebuilding? Schema/versioning/migration mechanics are engineering's.
2. **Concurrent editing.** Multiple PMs can edit the same funnel at the same time. For any feature that changes what's being edited, ask the PM the product question: what should a second editor see when someone else is changing the same thing? Don't leave simultaneous-edit behavior undefined.
3. **Branching logic safety** *(background)*. New kinds of branching conditions can produce funnels that break for users if saved wrong. Feasibility signal — validation is engineering's job; the PRD just defines what the branching should do.
4. **Undo/redo** *(background)*. It's unclear whether undo/redo fully works today — confirm before drafting a PRD that relies on it.
5. **New block types are triple work** *(background)*. A new block type touches this editor, a shared library, and the funnel runtime — one release, three moving parts. Scope/timeline signal only.

## Gotchas to flag in PRDs

- **`@job-escape/fce-lib` is the coupling point** between this editor and the `funnel` runtime. PRDs touching the component catalog are inherently cross-service — note the dependency on the funnel runtime in plain language in the PRD Summary (the version-bump mechanics are engineering's concern, not PRD content).
- **The `funnel` service is the consumer, not this editor.** A PRD that says "change what users see in the quiz" targets `funnel`; a PRD that says "change how PMs build quizzes" targets this service. Getting this wrong splits the work incorrectly.
- **S3 MDX files are the source of truth for page content** — not Postgres. Migrations must handle both.
- **Collaboration infrastructure is fragile** *(background)*. The real-time editing backend runs on a free-tier hosting plan. If the PRD's feature depends on many simultaneous editors, treat feasibility with skepticism and check with engineering before promising it.
- **No analytics** means no way to measure a PM-adoption metric today. PRDs for this service skip the Analytics events section; if the PM wants a metric, it goes to Open Questions (see Analytics events above).
