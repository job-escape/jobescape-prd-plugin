---
name: prd-frontend-alpha
description: Service context for writing a PRD targeting the `frontend-alpha` service — jobescape's Next.js web app (Academy, AI tools, onboarding, profile, upsell). Load this when `prd-writer` identifies `frontend-alpha` as the target service, or when a PRD mentions the webapp, Academy web, AI chat web, onboarding web, upsell pages, certificate pages, or the new App Router (Server Components) migration.
---

# frontend-alpha — service context for PRDs

## What this service is

The jobescape web app: Academy (courses, lessons, projects, certificates), AI tools, onboarding, upsell pages, and profile/subscription. Built Server-Components-first on Next.js App Router. Contains two coexisting directory trees: **`src/app/` (current, add new code here)** and **`src/pages/` (legacy, do not add to — port when touched)**.

**Note on the name:** "Alpha" is architectural (the App Router rewrite), not a separate product — there is no parallel "stable" frontend in production.

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

New events: follow `pr_webapp_{surface}_{action}` and wire through an Effector `sample()` chain rather than firing ad-hoc from a component.

## Figma / design

No Code Connect. One comment in `CertificateItem.tsx` references Figma asset URLs (`// Figma asset URLs`). No systematic link.

**PM hook:** PRD Design section should include Figma file URL + component/frame links. If the feature touches shared Academy UI, also reference the existing Radix primitives in use (accordion, dialog, etc.) so engineering knows whether new primitives are needed.

## Typical PRD concerns for this service

1. **App Router vs legacy `/pages`.** If the feature touches a route currently in `src/pages/`, the PRD should state whether it stays legacy or is ported to `src/app/` as part of the work. Default to "port" for any non-trivial change.
2. **SSR → Effector hydration.** Pages prefetch via tRPC `createCaller()` on the server; clients access data through Effector stores (`useUnit()`). PRDs cannot casually "use TanStack Query hooks in a component" without accounting for this pattern.
3. **Server vs client boundary.** New pages are server-first; interactive widgets (forms, charts, builders) are isolated client components. PRD should call out the interactivity surface explicitly.
4. **Auth expectations.** 401/403/423 handled through the parameters + cookie pipeline. PRDs cannot assume `useSession()` or a typical Next-Auth mental model.
5. **Analytics coverage.** Effector `sample()` chains fire events deterministically. A feature without an event wired through a `sample()` chain won't show in dashboards — PRD must list the chains that need new events.

## Gotchas to flag in PRDs

- **Do not add new code to `src/pages/`.** New work goes in `src/app/`. Legacy routes should be ported when touched.
- **"Parameters" ≠ JWT claims.** User preferences (plan, language, etc.) live in the `parameters` server resource, not in cookies or headers. A PRD assuming header-based config will break.
- **Effector + tRPC + TanStack coupling is load-bearing.** It's not three layers you can swap — data flows server → tRPC → Effector → component. Propose within this pattern.
- **AGENTS.md at `/src/AGENTS.md`** documents the routing and skill rules for engineers; worth referencing in PRDs so engineering sees a matching structure.
- **Onboarding has two directories** (`/onboarding`, `/onboarding-new`). If the PRD touches onboarding, state **which** explicitly — mixing them up is a common source of scope drift.
