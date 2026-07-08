---
name: prd-frontend-alpha
description: Service context for writing a PRD targeting the `frontend-alpha` service — jobescape's Next.js web app (Academy, AI tools, onboarding, profile, upsell). Load this when `prd-writer` identifies `frontend-alpha` as the target service, or when a PRD mentions the webapp, Academy web, AI chat web, onboarding web, upsell pages, certificate pages, or the new App Router (Server Components) migration.
---

# frontend-alpha — service context for PRDs

## What this service is

The jobescape web app: Academy (courses, lessons, projects, certificates), AI tools, onboarding, upsell pages, and profile/subscription. Built Server-Components-first on Next.js App Router. Contains two coexisting directory trees: **`src/app/` (current, add new code here)** and **`src/pages/` (legacy, do not add to — port when touched)**.

**Note on the name:** "Alpha" is architectural (the App Router rewrite), not a separate product — there is no parallel "stable" frontend in production.

## How to use this context

Everything in this file is background for **you**: vocabulary, feasibility signals, scope traps, and the analytics naming convention. None of it is content for the PRD body — the PRD contains no technical details (see `prd-writer`). When a note below says a change is bigger than it looks, that means: scope it and question the PM accordingly — don't write the technicalities into the PRD.

## Tech stack — what matters for PRDs

- **Next.js 16** (App Router, Server Components)
- **tRPC** as the BFF; routers: `users`, `academy`, `ai`
- **TanStack Query** for SSR hydration in client components
- **Effector** for app state (stores + `sample()` chains drive analytics)
- **Radix UI + Tailwind v4 + Emotion** for UI
- **React Hook Form + Zod** for forms
- **Auth:** cookie + JWT; session state via `parameters` table (not headers, not `useSession`)
- **Analytics:** BigQuery (custom publisher), Amplitude, Hotjar, Intercom, GTM

## User-visible surface

All under the authorized `(sidebar)` layout:
- `/academy` — course catalog, lessons, projects
- `/ai-chat` — AI conversation widget
- `/ai-tools` — AI utilities
- `/skills` — skills dashboard
- `/prompts-library` — saved prompts
- `/personal-plan` — learning plan + certificates
- `/profile` — account, billing history, subscription
- `/settings` — password, language
- `/onboarding` / `/onboarding-new` — signup flows
- `/upsell` — upsell pages (funnel-builder and selling-page, both v2)
- `/additional-offer`, `/prompt-bonus`, `/streak` — engagement mechanics

Non-auth: `/auth/login`, `/auth/register`, certificate validation (MDX-rendered).

## Vocabulary PMs should use correctly

- **Academy:** Courses, Modules, Lessons, Projects, Certifications, Personal Plans
- **Onboarding:** Steps, Variants (per-step conditions), States, Logic (quiz pages, selling pages)
- **User parameters** — server-side settings object (plan ID, language, etc.); distinct from JWT claims
- **Upsell-builder / Onboarding-builder** — internal tools for editing those pages; widget-based with interaction analytics
- **Practice** — in-lesson quizzes/polls
- **AI Mentor / AI Chat** — the conversational surface

## Analytics events — where and how

- **Server-side publisher:** `/src/shared/providers/analytics/analytics.server.ts` (BigQuery sink)
- **Event wiring:** `/src/application/events/lesson-events.ts` — Effector stores trigger events via `sample()` chains
- **Naming:** events prefixed `pr_webapp_*` (e.g. `pr_webapp_lesson_practice_start_view`, `pr_webapp_login_*`, `pr_webapp_subscription_view`)
- **Other pipelines:** Hotjar (session recordings), Amplitude (`analytics.track()`), Intercom, GTM — each with its own role

New events: follow the `pr_webapp_{surface}_{action}` convention — names, triggers, and properties confirmed with the PM, never invented.

## Figma / design

No Code Connect. One comment in `CertificateItem.tsx` references Figma asset URLs (`// Figma asset URLs`). No systematic link.

**PM hook:** Figma links are **optional** — a screen row with status "design pending" or "no design planned" is valid; engineering proceeds with design verification explicitly waived for that screen. But when designs exist, link them at the **frame level** per screen row (the URL from right-click → "Copy link to selection"), not just the file: this service's engineering workflow extracts per-screen ground truth (states, copy, spacing) directly from linked frames, and a file-level link forces engineers to hunt for the right frames. If states are designed (empty/loading/error), link those frames too. If the feature touches shared Academy UI, also reference the existing Radix primitives in use (accordion, dialog, etc.) so engineering knows whether new primitives are needed.

## Behavior verification — covered service

This service **is covered** by the Behavior Codebase MCP (see `prd-writer` → *Checking current behavior*). When those tools are connected:

- **Repo id:** `frontend-alpha`. Backend behavior (academy, ai, users) surfaces automatically through cross-repo links — don't try to query backends directly.
- **`touchedSurfaces` vocabulary:** use the routes from *User-visible surface* above (`/academy`, `/personal-plan`, `/upsell`, …) and plain widget/screen names (e.g. `widgets/lesson-header`). The closer to real route paths, the better the graph match.
- Run the automatic collision check after the brief, and prefer `check_existing_behavior` (`graph` → `quick`) over asking the PM current-behavior questions.

## Typical PRD concerns for this service

1. **Legacy pages** *(background)*. Some routes still live in an older part of the codebase; touching them usually means engineering also modernizes them, which inflates effort. Scope/timeline signal only — whether and when to port is engineering's call.
2. **Data-flow pattern is load-bearing** *(background)*. The app has one established way data reaches the screen; features that fight it cost more. Feasibility signal only.
3. **Interactivity surface.** For the PRD: be explicit about which parts of the screen the user interacts with (forms, live-updating widgets) vs just reads — it materially changes effort, and it's plain product description.
4. **Auth expectations** *(background)*. Session handling here is custom. Feasibility signal only; don't describe auth mechanics in the PRD.
5. **Analytics coverage.** Analytics is a crucial part of every PRD. A feature ships with no dashboard visibility unless its events are explicitly specified — so the PRD must list every event to fire (name, trigger, properties) in the Analytics events table, confirmed with the PM. How events are wired is engineering's.

## Gotchas to flag in PRDs

- **"Parameters" ≠ login token** *(background)*. User preferences (plan, language, etc.) live in a server-side settings object. Vocabulary note for you — use "user parameters" correctly when the PM mentions plan or language settings.
- **Two onboarding flows exist** (current and new). If the PRD touches onboarding, ask the PM **which flow** and name it explicitly in the PRD — mixing them up is a common source of scope drift, and it's a product-scope question.
