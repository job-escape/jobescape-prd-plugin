# jobescape-prototype (maintainers)

The plugin designers install. It ships one skill, [`skills/jobescape-prototype`](skills/jobescape-prototype/SKILL.md): rules, the two Platform templates and examples. Terms are in [`CONTEXT.md`](../CONTEXT.md).

```
kit/                    sources of the KIT block (never edited inside a Prototype)
├── runtime.js/.css     shared: toolbar, Gallery, Flow, Platform switch, motion, shared contract checks
├── web/                frontend-alpha: tokens, frame breakpoints, data-hero → HeroUI translation, web checks, page skeleton with the Navigation
└── ios/                jobescape-app: HeroUI Native theme, React Native layout, phone frame, iOS checks, page skeleton
scripts/
├── build.mjs           assembles templates/, writes references/web-components.md, upgrades a Prototype's KIT block
├── heroui-web-inventory.json   HeroUI 3.2.1 components: blocks, props → classes, parts, runtime notes
└── heroui-inventory/   regenerates that inventory from frontend-alpha's node_modules
```

## Build

```bash
node prototype/scripts/build.mjs
```

Writes `templates/web.html`, `templates/ios.html` and `references/web-components.md`. Bump `.claude-plugin/plugin.json` (and the marketplace entry) when the kit changes; the version is stamped into every KIT block.

Upgrade an existing Prototype to the current kit (replaces only its KIT block):

```bash
node prototype/scripts/build.mjs --upgrade path/to/feature.web.html
```

## When an app changes

- **frontend-alpha upgrades HeroUI or changes tokens:** update the version in the CDN URL in `scripts/build.mjs`, the token mapping in `kit/web/theme.css`, then regenerate the inventory and rebuild:
  ```bash
  cd prototype/scripts/heroui-inventory && FRONTEND_ALPHA=<path to frontend-alpha> node draft.mjs && node finalize.mjs ../heroui-web-inventory.json && rm draft.json
  ```
  `notes_*.json` and `manual_overrides.json` hold hand-checked notes per component; new components need notes added there.
- **frontend-alpha changes its Navigation:** edit the `<template data-layout>` blocks in `kit/web/page.html`.
- **jobescape-app changes its theme or HeroUI Native components:** `kit/ios/theme.css` is the app's compiled theme plus the component CSS; it has no generator yet. The original kit's author referenced a `scripts/sync-design-kit.mjs` in the app repo that isn't in any branch; ask for it before hand-editing. `kit/ios/source-skill-0.4.0.md` is the original Russian skill, translated, for reference.

## Checking a change

Open both templates and `skills/jobescape-prototype/examples/challenges/challenges.ios.html` from disk: every one must show "Contract: ok" in Light and Dark, Gallery and Flow, on every width. The contract badge's state is also on `<html data-contract-issues>` for headless runs.

Known limits: the iOS kit renders 13 HeroUI Native components (no form fields, Dialog or Popover yet); web components that need runtime positioning (Popover, Tooltip, Slider thumbs, Calendar) get HeroUI's classes but are placed by the designer.
