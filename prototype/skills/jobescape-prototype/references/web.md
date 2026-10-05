# Web rules — the jobescape web app (frontend-alpha)

Read [shared.md](shared.md) first; this file adds what is specific to the web app. The file uses frontend-alpha's real design system: HeroUI 3.2.1 styles, its tokens in light and dark, Tailwind 4 and the app's Navigation, so a class means here what it means in the app.

## Layouts and Navigation

The template holds the app's Navigation once per Layout, as `<template data-layout>` blocks. The kit wraps each Screen in its Layout's Navigation and fills the per-Screen parts.

| Layout | Navigation | Used for |
|---|---|---|
| `app` | sidebar and top bar (breadcrumb, streak, avatar) on desktop; title row and bottom tab bar on mobile | most of the app: Academy, Challenges, Apps, AI tools |
| `profile` | settings sidebar and breadcrumb on desktop; back-arrow header on mobile | account and settings |
| `registration` | the step indicator on top | the sign-up flow |
| `none` | nothing | full-screen pages (a lesson player, a certificate) |

A Screen chooses its frame with attributes:

| Attribute | Value |
|---|---|
| `data-layout` | `app`, `profile`, `registration` or `none` (required) |
| `data-nav` | the current Navigation item: a `data-nav-item` of that Layout (`personal-plan`, `challenges`, `apps`, `ai-tools`, `profile`, `chat`, `assistants`, `automation`, `prompts-library`; on `profile`: `account`, `preferences`, `plan-management`, `portfolio`, `legal-privacy`) |
| `data-title` | the breadcrumb and mobile title |
| `data-step` | `registration` only: the active step (`1`, `2`, `3`); earlier steps show as complete |
| `data-tabbar="hidden"` | `app` only: no bottom tab bar on mobile (detail pages). On iOS `data-tabbar` names the active tab instead |

```html
<section data-screen="challenge-details" data-layout="app" data-nav="challenges" data-title="Claude Basics"
         data-tabbar="hidden" data-states="not-joined in-progress">
  …the page content, without any Navigation…
</section>
```

- The Screen holds only the page content; the Navigation comes from the Layout. Don't draw a sidebar, top bar or tab bar inside a Screen.
- When the design changes the Navigation (a new sidebar entry, a different top bar), edit the `<template data-layout>` block itself, with the same rules as Screens. Give a new item `data-nav-item="<id>"` and `data-press="tab:<id>"`.
- Delete the Layout blocks the feature doesn't use.
- In Flow, tapping a Navigation item goes to the Screen whose `data-nav` matches it.

## Layout of the content

Normal CSS layout with Tailwind classes: flex, grid, gap, padding.

- Write mobile first. `desktop:` (or `md:`) applies from 768px, the app's only breakpoint; `phone:` below it. Each frame answers to its own width: a 393px frame shows the mobile layout even on a wide screen.
- Size the page content like the app does: a centred column `mx-auto w-full max-w-160` for most pages, wider grids where the design needs them.
- Sizes use Tailwind's scale, which accepts any number in 4px steps: `w-160` is 640px, `h-15` is 60px. Bracket values (`w-[437px]`) are fine for sizes.
- Viewport units (`h-screen`, `min-h-svh`) measure the browser window, not the frame; use `h-full` or fixed heights inside a Screen.

## Tokens

Colours (any prefix: `bg-`, `text-`, `border-`, `ring-`, `fill-`, `from-` …):

- Page and containers: `background`, `background-secondary`, `surface`, `surface-secondary`, `surface-tertiary`, `overlay`
- Text: `foreground`, `muted`, `link`
- Brand and status: `accent`, `success`, `warning`, `danger`, each with `-hover`, `-foreground` (text on it), `-soft`, `-soft-hover`, `-soft-foreground`
- Neutral controls: `default`, `default-hover`, `default-foreground`
- Lines: `border`, `separator` (plus `-secondary`, `-tertiary`), `focus`
- Form fields: `field`, `field-foreground`, `field-placeholder`, `field-border`
- Overlays: `backdrop`; Tabs: `segment`, `segment-foreground`

Shadows: `shadow-surface`, `shadow-overlay`, `shadow-field`. Radii: `rounded-xs` 2 · `sm` 4 · `md` 6 · `lg` 8 · `xl` 12 · `2xl` 16 · `3xl` 24 · `4xl` 32px, `rounded-full`, `rounded-field`; no bracket radii. Fonts: `font-sans` (Inter, the default), `font-serif` (Source Serif 4), `font-instrument` (Instrument Serif). Motion curves for transitions: `ease-smooth`, `ease-out-quad`, `ease-out-cubic`, `ease-out-quart`, `ease-out-expo`, `ease-out-fluid`, `ease-in-out-cubic`.

Radii on Web are half the iOS ones: `rounded-lg` is 8px here and 16px in the app.

## Text

Text is plain HTML with Tailwind text classes, as in frontend-alpha: `text-sm`, `text-xl leading-7 font-semibold`, `text-muted`. `data-type` is iOS-only. Headings are `<h1>`–`<h6>`, body text `<p>`.

## HeroUI components

Every HeroUI 3.2.1 component is available by its React name: `data-hero="Button"`, `"Card"`, `"Chip"`, `"TextField"`, `"Select"`, `"Tabs"`, `"Modal"`, `"Drawer"` … Props are `data-*` attributes with the React prop values; parts are `data-slot` with the React part name in kebab-case (`Card.Header` → `data-slot="header"`). The contract checks every name, prop value and part.

The everyday ones, as written in a Screen:

```html
<button data-hero="Button" data-variant="secondary" data-size="sm" data-press="action:join">Join</button>
<span data-hero="Chip" data-color="success" data-variant="soft"><span data-slot="label">Completed</span></span>
<div data-hero="Card">
  <div data-slot="header"><h3 data-slot="title">Claude Basics</h3><p data-slot="description">7 days</p></div>
  <div data-slot="footer"><button data-hero="Button" data-size="sm" data-press="push:challenge-details">Open</button></div>
</div>
<div data-hero="TextField"><span data-slot="label">Email</span><input data-hero="Input" placeholder="you@example.com"></div>
<div data-hero="Checkbox" data-selected><span data-slot="label">Remember me</span></div>
<div data-hero="Tabs"><div data-slot="list">
  <button data-slot="trigger" data-selected data-press="filter:7-days">7 days</button>
  <button data-slot="trigger" data-press="filter:14-days">14 days</button>
</div></div>
<div data-hero="ProgressBar" data-value="60"><span data-slot="label">Progress</span><span data-slot="output">60%</span></div>
```

| Need | Component |
|---|---|
| actions | `Button` (`data-variant`: primary, secondary, tertiary, outline, ghost, danger, danger-soft; `data-size`: sm, md, lg; `data-icon-only`), `Link`, `CloseButton`, `ButtonGroup`, `ToggleButton` |
| containers | `Card` (`header` › `title`, `description`; `content`; `footer`), `Surface`, `Separator`, `Accordion`, `Disclosure`, `EmptyState` |
| labels and status | `Chip`, `Badge`, `Avatar`, `Kbd`, `Alert`, `Spinner`, `Skeleton`, `ProgressBar`, `ProgressCircle`, `Meter` |
| forms | `TextField` + `Input` / `TextArea`, `InputGroup`, `SearchField`, `NumberField`, `InputOTP`, `Select`, `ComboBox`, `Autocomplete`, `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Switch`, `Slider`, `DateField`, `DatePicker`, `TimeField` |
| navigation | `Tabs`, `Breadcrumbs`, `Pagination`, `Toolbar` |
| overlays | `Modal`, `AlertDialog`, `Drawer`, `Popover`, `Tooltip`, `Dropdown` + `Menu`, `Toast` |
| data | `ListBox`, `Table`, `TagGroup` + `Tag`, `Calendar` |

Every component with its props and parts: [web-components.md](web-components.md). Open it when you use a component that isn't in the examples above.

- Native `<input>`, `<select>`, `<textarea>` are not allowed; use TextField, Select, TextArea and the other form components.
- A `<button>` or `<a>` is either a library component (`Button`, `Link`) or a Custom pressable with `data-press`.
- Behaviour HeroUI adds in React (opening a Modal, switching Tabs) is shown as States in a Prototype, not scripted: the open Modal is a State, the selected tab is `data-selected` with one State per tab when the content changes.

## Feature styles

Most designs need only classes. A Custom component that needs CSS beyond classes puts it in the `<style type="text/tailwindcss" data-feature-styles>` block in `<head>`, with `@apply` and token variables (`var(--accent)`, `var(--surface-shadow)`); no raw colours. `@keyframes` go in the motion sheet.

## Motion on Web

The motion sheet and `data-anim` are written as in [shared.md](shared.md#motion), and any CSS property can be animated, including filters, `clip-path` and gradients. When the same feature also gets an iOS file, the iOS rules decide what carries over.

Hover and focus styles (`hover:`, `focus-visible:`, `transition`) are fine on Web.

## Not allowed on Web

| Instead of | Use |
|---|---|
| hex, `rgb()`, palette classes (`bg-blue-500`, `bg-white`) | colour tokens |
| `shadow-sm`, `shadow-[…]` | `shadow-surface`, `shadow-overlay`, `shadow-field` |
| `rounded-[…]` | the radius scale |
| `style="…"`, extra `<style>` blocks | classes; the feature-styles block |
| inline `<svg>` | `<i data-icon>` or `<img data-asset>` |
| hand-built buttons, inputs, tabs, chips | `data-hero` components |
| Navigation inside a Screen | the Layout's `<template data-layout>` |

## Before handoff (Web)

In addition to [shared.md](shared.md#before-handoff): every Screen checked on **Web** and **Web mobile**.
