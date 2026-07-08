---
name: prd-editscape
description: Service context for writing a PRD targeting the `editscape` service — jobescape's WYSIWYG MDX editor for authoring lesson content. Load this when `prd-writer` identifies `editscape` as the target service, or when a PRD mentions MDX editor, lesson authoring, WYSIWYG, rich-text components (Figure, Blockquote, Player, Chat, Prompt, Media, Downloads), or viewport preview (desktop/tablet/mobile).
---

# editscape — service context for PRDs

## What this service is

A WYSIWYG Markdown/MDX editor used to author lesson content with live preview. Built on `@mdxeditor/editor` (Lexical-based). Supports a fixed catalog of custom MDX components (Figure, Blockquote, Player, Chat, Prompt, Media, Downloads) and three viewport modes (Desktop / Tablet / Mobile).

## How to use this context

Everything in this file is background for **you**: vocabulary, feasibility signals, scope traps, and the analytics situation. None of it is content for the PRD body — the PRD contains no technical details (see `prd-writer`). When a note below says a change is bigger than it looks, that means: scope it and question the PM accordingly — don't write the technicalities into the PRD.

## Tech stack — what matters for PRDs

- **Next.js 15** (App Router, but the editor component is SSR-disabled via dynamic import)
- **`@mdxeditor/editor` v3.35** — the Lexical-based editor core
- **Radix UI** for dialogs, selects, tabs, dropdowns, toggle groups
- **Tailwind CSS v4** for styling (no separate design-system package)
- **React Hook Form + Zod** for form validation within custom-component dialogs
- **`@mdx-js` + `remark-gfm`** for MDX parsing in the live-preview pane
- **`richtypo`** — text-normalization library applied during editing (e.g. em-dash conversion)

## User-visible surface

- `/` (from `app/page.tsx`) — single-page app with three tabs: **Editor**, **Both** (split view), **Live** (preview only)
- **Toolbar actions** — Insert Figure, Insert Player (YouTube), Insert Chat, Insert Prompt, Insert Media, Insert Downloads, plus standard markdown controls
- **File I/O** — upload `.mdx`/`.md`, download edited content as `.mdx`
- **Viewport toggle** — Desktop (100%), Tablet (50%), Mobile (393px iPhone mockup)

## Vocabulary PMs should use correctly

- **Custom component** — one of: Figure, Blockquote, Player, Chat, Prompt, Media, Downloads. These are JSX components embedded in MDX.
- **`WidthType`** — layout enum on components: `"content"` (constrained), `"breakout"` (wider), `"bleed"` (full-bleed)
- **Breakpoint** — which viewport is previewed (mobile/tablet/desktop); **transient**, not persisted across refresh
- **MDX vs Markdown** — this editor emits MDX. "Pure markdown" isn't a distinct mode.
- **Auto-formatting** — the editor auto-corrects typography as authors type (e.g. dashes, quotes). If the feature changes text handling, ask the PM whether auto-formatting should still apply — a product decision

## Analytics events — where and how

**None exist today, and PRDs for this service don't include analytics.** There is no tracking layer, and this is an internal tool — **omit the Analytics events section entirely** from editscape PRDs. Do not propose events, event names, or a tracking layer. If the PM states a success metric that would require tracking, don't design analytics for it — add an Open Question ("how do we measure this, given the editor has no tracking today?") and move on.

## Figma / design

No in-repo Figma references, no Code Connect, no design-token file. Styling is Tailwind + raw Radix colors.

**PM hook:** in the PRD's Design section, attach Figma URL explicitly. There's no design-system alignment to reference — a PRD that says "match our design system" is insufficient here because there isn't one to match. Be specific.

## Typical PRD concerns for this service

1. **Preview latency & error UX.** The live preview recomputes as the author types, and malformed content can fail to render. For the PRD: ask the PM what the author should see when content is heavy (slow preview) or broken (error state) — those are product decisions.
2. **Custom-component extensibility** *(background)*. Adding a new component touches four separate places in the editor — it's a bigger change than "add one component" sounds. For the PRD: describe the component's authoring behavior and how it looks in preview; the four artifacts are engineering's.
3. **Content size limits.** No limits exist today on document length or upload size. If the feature implies bigger content, ask the PM whether v1 should set limits and what the author sees when hitting them — product decisions.
4. **File upload dependency** *(background)*. Media uploads depend on another jobescape service. A PRD touching media has a cross-service dependency — say so in one plain-language sentence in the Summary.
5. **Viewport persistence.** The breakpoint resets on refresh today. If the feature assumes a "last used" viewport, PRD must call out the persistence change.

## Gotchas to flag in PRDs

- **Blockquote has a custom keybinding.** Inside blockquotes, `Shift+Enter` inserts a soft line break; `Enter` exits the quote. This is documented in `BLOCKQUOTE_BEHAVIOR.md` and is intentional — do not propose to "normalize" it without weighing user expectations.
- **No analytics baseline** — can't A/B test or measure editor UX today. PRDs for this service skip the Analytics events section; if the PM wants a metric, it goes to Open Questions (see Analytics events above).
- **Media vs Figure overlap.** `Figure` is image-only; `Media` infers type from the file (image/video/audio/PDF). PRDs adding a media-like feature must say which component is the target, or whether a new one is needed.
- **Editor is SSR-disabled** via dynamic import. Server-rendered preview/share features need a separate rendering path.
- **Missing `NEXT_PUBLIC_ACADEMY_API_URL` silently fails** — uploads return "Not uploaded" with no loud error. Background for you: features relying on uploads have this hidden failure mode; keep it in mind when assessing feasibility (not PRD content).
