---
name: prd-editscape
description: Service context for writing a PRD targeting the `editscape` service — jobescape's WYSIWYG MDX editor for authoring lesson content. Load this when `prd-writer` identifies `editscape` as the target service, or when a PRD mentions MDX editor, lesson authoring, WYSIWYG, rich-text components (Figure, Blockquote, Player, Chat, Prompt, Media, Downloads), or viewport preview (desktop/tablet/mobile).
---

# editscape — service context for PRDs

## What this service is

A WYSIWYG Markdown/MDX editor used to author lesson content with live preview. Built on `@mdxeditor/editor` (Lexical-based). Supports a fixed catalog of custom MDX components (Figure, Blockquote, Player, Chat, Prompt, Media, Downloads) and three viewport modes (Desktop / Tablet / Mobile).

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
- **Sanitization** — richtypo rules run live; PRDs changing text handling must say whether sanitization still applies

## Analytics events — where and how

**None exist today.** There is no `track()` wrapper, no analytics provider, no events fired.

**PRD implication:** any PRD proposing a metric ("we'll measure editor adoption via...") must include a subsection proposing the analytics layer, not assume one. This likely means proposing alignment with the `funnel`/`jobescape-app`/`frontend-alpha` BigQuery pattern (`pr_editscape_*` event naming) — call out the decision, don't skip it.

## Figma / design

No in-repo Figma references, no Code Connect, no design-token file. Styling is Tailwind + raw Radix colors.

**PM hook:** in the PRD's Design section, attach Figma URL explicitly. There's no design-system alignment to reference — a PRD that says "match our design system" is insufficient here because there isn't one to match. Be specific.

## Typical PRD concerns for this service

1. **MDX parse performance & error UX.** Live preview re-parses on edit (200ms debounce). PRDs adding heavy components (large tables, many embeds) must address latency and the error-state UI when MDX fails to parse.
2. **Custom-component extensibility.** Adding a new component means: editor descriptor (`components/init-mdx-editor.tsx`), export in `components/custom/index.ts`, preview mapping, and dialog UI. PRD must list all four.
3. **Content size limits.** No current checks on markdown length or upload file size. If the feature implies bigger content, propose limits.
4. **File upload dependency.** S3 uploads go through `NEXT_PUBLIC_ACADEMY_API_URL` → Academy API `/v2/s3/generate_upload_url/`. PRD touching media must confirm Academy API support.
5. **Viewport persistence.** The breakpoint resets on refresh today. If the feature assumes a "last used" viewport, PRD must call out the persistence change.

## Gotchas to flag in PRDs

- **Blockquote has a custom keybinding.** Inside blockquotes, `Shift+Enter` inserts a soft line break; `Enter` exits the quote. This is documented in `BLOCKQUOTE_BEHAVIOR.md` and is intentional — do not propose to "normalize" it without weighing user expectations.
- **No analytics baseline** — can't A/B test editor UX today. Any metric-driven PRD needs an analytics proposal up front.
- **Media vs Figure overlap.** `Figure` is image-only; `Media` infers type from the file (image/video/audio/PDF). PRDs adding a media-like feature must say which component is the target, or whether a new one is needed.
- **Editor is SSR-disabled** via dynamic import. Server-rendered preview/share features need a separate rendering path.
- **Missing `NEXT_PUBLIC_ACADEMY_API_URL` silently fails** — uploads return "Not uploaded" with no loud error. PRDs introducing new environments must include this env var in the rollout checklist.
