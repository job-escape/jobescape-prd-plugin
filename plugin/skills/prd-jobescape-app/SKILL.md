---
name: prd-jobescape-app
description: Service context for writing a PRD targeting the `jobescape-app` service — the React Native / Expo mobile app for career learning (Academy courses, AI tools, skills, profile). Load this when `prd-writer` identifies `jobescape-app` as the target service, or when a PRD mentions mobile app, iOS, Android, Expo, React Native, push notifications, deep links, in-app purchase, streaks, or lessons in the mobile context.
---

# jobescape-app — service context for PRDs

## What this service is

The jobescape mobile app (iOS + Android) built with Expo / React Native. Houses the main learner experience: Academy (courses, lessons, projects, assessments), AI tools (chat, agents, prompts), profile/subscription, and gamification (streaks, milestones).

## How to use this context

Everything in this file is background for **you**: vocabulary, feasibility signals, scope traps, and the analytics naming convention. None of it is content for the PRD body — the PRD contains no technical details (see `prd-writer`). When a note below says a change is bigger than it looks, that means: scope it and question the PM accordingly — don't write the technicalities into the PRD.

## Tech stack — what matters for PRDs

- **Expo SDK 55** + **React Native 0.83** + **TypeScript**
- **Expo Router** — file-based routing with typed routes
- **Effector** for state; **@farfetched** for API queries
- **NativeWind** (Tailwind v3.4) + **Radix UI primitives for RN** (`@rn-primitives`)
- **Auth:** tokens stored in `expo-secure-store`; shared with backend services via `GlobalFetcher` (aggregator, user, academy APIs)
- **In-app purchase:** `expo-iap`
- **Third parties:** GrowthBook (flags), Intercom (support), AppsFlyer (attribution + deep links), Customer.io (messaging), Lottie (animations)

## User-visible surface

Bottom nav tabs: **Home**, **Skills**, **AI Tools**, **Profile**.

Main flows:
- **Auth** — login, registration (email + OTP), password reset, onboarding funnel
- **Academy** — lessons → projects → assessments → certificates; portfolio of user artifacts
- **AI** — chat history, saved prompts, agents with dynamic fields, playground
- **Gamification** — streaks and milestones
- **Deep links** — routed via AppsFlyer (onboarding entry points)

## Vocabulary PMs should use correctly

- **Lesson / Course / Skill / Project / Assessment** — the learning hierarchy
- **Portfolio** — user-generated artifacts produced during projects
- **Streak / Milestone** — engagement mechanics
- **Parameters** — user profile fields stored server-side (not in JWT), e.g. plan ID, language
- **Funnel (onboarding)** — versioned signup flow (distinct from the `funnel` *service*, though conceptually related)
- **Agent** — a configurable AI persona in the AI Tools section

## Analytics events — where and how

- **Hook:** `useAnalytics()` in `/shared/context/analytics/useAnalytics.tsx`
- **Component wrapper:** `/shared/context/analytics/track.tsx`
- **Provider:** `/shared/context/analytics/analytics-provider.tsx` (also initializes GrowthBook — see Gotchas)
- **Sink:** `${EXPO_PUBLIC_API_URL}/mobile/bigquery/publish/`
- **Pattern:** `track(eventName, eventProps)`; automatically enriched with `device_id`, `user_id`, timestamp, query params
- **Naming:** follow existing conventions in the repo before proposing new names

New events must declare name, properties, and trigger — confirmed with the PM, never invented.

## Figma / design

No Figma integration in code. Design tokens are hardcoded in `/lib/constants.ts` (`NAV_THEME` with HSL colors). Styling leans on `tailwind.config.js` and primitives from `@rn-primitives` (accordion, dialog, dropdown, tabs, etc.).

**PM hook:** in the PRD's Design section, attach Figma URL and list which existing primitives the design uses (so engineering knows whether new components are needed). "New visual component" is a scope flag — call it out explicitly.

## Behavior verification — proxy coverage only

The mobile app itself is **not indexed** by the Behavior Codebase MCP, but the web app (`frontend-alpha`) shares most of its product logic — Academy, AI tools, profile/subscription, gamification all exist on both. When the behavior tools are connected (see `prd-writer` → *Checking current behavior*):

- Probe repo `frontend-alpha` as a **proxy** for current-behavior facts and collisions (pass `repos: ["frontend-alpha"]`).
- **Translate mobile surfaces into web routes before probing.** The tools speak `frontend-alpha`'s route vocabulary, not mobile tab/screen names — map the surface first: Skills tab → `/skills`, a lesson screen → the `/academy` lesson routes, Profile/subscription → `/profile`, AI Tools → `/ai-tools` / `/ai-chat`. The closer the `touchedSurfaces` are to real web routes, the better the match.
- **Always label proxy findings when relaying them**: *"in the web app, X happens today — does the mobile app behave the same?"* Parity is a PM confirmation, never an assumption — the platforms genuinely differ (see *iOS vs Android parity* below), and mobile-only surfaces (push, deep links, IAP, streak mechanics, offline expectations) have no web counterpart to check — skip those here and use ask/TBD.
- A proxy finding the PM hasn't confirmed stays a question or a TBD, not a stated fact in the PRD.

## Typical PRD concerns for this service

1. **App-store release requirement** *(background)*. Anything that touches native device capabilities (audio, camera/image picker, purchases, support chat, attribution, new languages) requires a full app-store release with review — days-to-weeks of lead time, not an instant update. Treat this as a timeline/scope signal when questioning the PM; the release mechanics themselves stay out of the PRD.
2. **iOS vs Android parity.** The platforms genuinely differ, and iPad is not currently supported. For the PRD: state platform scope explicitly (both platforms? one first?) — a product decision, ask the PM.
3. **Deep links** *(background)*. Deep-link routing goes through an attribution layer. For the PRD: state where the link should take the user and from where users arrive (ad, email, push); the URL scheme is engineering's.
4. **Subscription gating.** The app already has several access states (access denied, not found, subscription paused). For a paid feature, ask the PM what a non-entitled user sees at each entry point — existing gate or something new? Product decision; don't assume the existing gates apply.
5. **No offline mode.** Data fetches assume online. PRD features that imply offline usage are a scope flag — call out explicitly.
6. **Auth is shared plumbing** *(background)*. Login state is shared with jobescape's other services, so auth changes ripple beyond the app. A PRD touching login/registration is de facto cross-service — say so in one plain-language sentence in the Summary.

## Gotchas to flag in PRDs

- **Version mismatch noted in repo** — `app.json` v3.12.5 vs `package.json` v2.8.0; Expo SDK mentioned as 54 in README but 55 in `package.json`. Confirm the true current version at PRD time; don't cite from one source.
- **Localization is baked into the native build.** 6 locales today (en, es, de, fr, it, pt). Adding a locale requires a rebuild.
- **Cross-feature state is nontrivial** *(background)* — app state is organized per feature, so a feature that needs data from several areas at once (e.g. a dashboard combining streaks + courses + AI usage) is bigger than it looks. Scope signal only; where state lives is engineering's call.
- **GrowthBook double init** — both `app/_layout` and `analytics-provider` initialize GrowthBook. Known race condition; flag if the PRD relies on flag-driven behavior at cold start.
- **Auth shared with other services.** Changes to auth behavior cascade — `users_backend`, `academy` API, and `aggregatorApi` all consume the same token. Any auth PRD is de facto cross-service even if the UI is mobile-only.
