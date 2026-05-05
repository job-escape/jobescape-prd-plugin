---
name: prd-jobescape-app
description: Service context for writing a PRD targeting the `jobescape-app` service — the React Native / Expo mobile app for career learning (Academy courses, AI tools, skills, profile). Load this when `prd-writer` identifies `jobescape-app` as the target service, or when a PRD mentions mobile app, iOS, Android, Expo, React Native, push notifications, deep links, in-app purchase, streaks, or lessons in the mobile context.
---

# jobescape-app — service context for PRDs

## What this service is

The jobescape mobile app (iOS + Android) built with Expo / React Native. Houses the main learner experience: Academy (courses, lessons, projects, assessments), AI tools (chat, agents, prompts), profile/subscription, and gamification (streaks, milestones).

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

New events must declare name, properties, trigger, and owner — and should match the BigQuery schema the dashboards consume.

## Figma / design

No Figma integration in code. Design tokens are hardcoded in `/lib/constants.ts` (`NAV_THEME` with HSL colors). Styling leans on `tailwind.config.js` and primitives from `@rn-primitives` (accordion, dialog, dropdown, tabs, etc.).

**PM hook:** in the PRD's Design section, attach Figma URL and list which existing primitives the design uses (so engineering knows whether new components are needed). "New visual component" is a scope flag — call it out explicitly.

## Typical PRD concerns for this service

1. **Native rebuild requirement.** Anything that changes native modules (audio, image picker, IAP, Intercom, AppsFlyer, localization, Customer.io) requires a new EAS build and App Store / Play Store submission. PRD must specify whether an OTA is possible or a binary release is needed.
2. **iOS vs Android parity.** Audio permissions, adaptive icons, bundle IDs differ; iPad is not currently supported. State platform-specific scope explicitly.
3. **Deep link structure.** AppsFlyer handles install attribution and deep-link routing. New deep-linked surfaces require the URL scheme spelled out in the PRD.
4. **Subscription gating.** Multiple modals cover access-denied / not-found / subscription-paused. IAP via `expo-iap`. PRD for paid features must list the gating states.
5. **No offline mode.** Data fetches assume online. PRD features that imply offline usage are a scope flag — call out explicitly.
6. **Auth token lifecycle.** Tokens in `SecureStore`; refresh via `GlobalFetcher`. PRD touching auth must respect this pipeline, not add parallel storage.

## Gotchas to flag in PRDs

- **Version mismatch noted in repo** — `app.json` v3.12.5 vs `package.json` v2.8.0; Expo SDK mentioned as 54 in README but 55 in `package.json`. Confirm the true current version at PRD time; don't cite from one source.
- **Localization is baked into the native build.** 6 locales today (en, es, de, fr, it, pt). Adding a locale requires a rebuild.
- **Effector stores are decentralized** — state per feature under `features/*/model/store.ts`. PRDs introducing cross-feature state must propose where it lives.
- **GrowthBook double init** — both `app/_layout` and `analytics-provider` initialize GrowthBook. Known race condition; flag if the PRD relies on flag-driven behavior at cold start.
- **Auth shared with other services.** Changes to auth behavior cascade — `users_backend`, `academy` API, and `aggregatorApi` all consume the same token. Any auth PRD is de facto cross-service even if the UI is mobile-only.
