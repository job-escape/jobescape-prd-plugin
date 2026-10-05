# iOS rules — the jobescape-app (React Native + HeroUI Native)

Read [shared.md](shared.md) first; this file adds what is specific to the app. Inside `<section data-screen>` the app's rules apply, not the web's, and the file is built so the browser shows what the phone will show:

- the theme in the file is the CSS the app compiles (HeroUI Native plus the app's overrides), so `bg-surface`, `rounded-lg`, `text-muted` mean here exactly what they mean on the phone;
- every block behaves like a React Native `View`;
- HeroUI Native components are included by name and look the way the library draws them.

Full example: `examples/challenges/challenges.ios.html` (challenge list and details, three and two States, a sheet).

## Screen skeleton

| Attribute | Value |
|---|---|
| `data-route` | `tab-root`: a tab root (tab bar visible, no header); `push`: a Screen on top, header with "back"; `overlay`: full screen over the tab bar, header with a close cross; `card-sheet`: the system iOS card, only when the designer asks for it |
| `data-tabbar` | only on `tab-root`: the active tab — `my-plan`, `challenges`, `ai`, `profile`, `apps` (on Web, `data-tabbar="hidden"` means something else: no mobile tab bar) |
| `data-statusbar` | `light` when the background under the status bar is dark or coloured |

The kit draws the status bar, the tab bar and the home indicator; don't draw them.

```html
<section data-screen="challenge-details" data-route="push" data-states="default loading">
  <div class="flex-1 bg-background pt-safe">
    <header class="flex-row items-center justify-center border-b border-border px-4 py-3">
      <button data-press="back" class="absolute left-4 size-8 items-center justify-center rounded-full bg-default">
        <i data-icon="arrow-left" class="size-4 text-default-foreground"></i>
      </button>
      <p data-weight="medium">Title</p>
    </header>

    <main data-scroll class="gap-4 px-4 pt-4 pb-6"> … </main>

    <footer class="border-t border-border bg-background px-4 pt-3 pb-safe-offset-3">
      <button data-hero="Button" data-variant="primary" data-size="lg" data-press="action:submit">
        <span data-slot="label">Continue</span>
      </button>
    </footer>
  </div>
</section>
```

- The Screen root is always `flex-1 bg-background pt-safe`.
- Only `data-scroll` scrolls; its classes are the content's padding and `gap`. A pinned bottom is a sibling of `data-scroll`, not `fixed`/`sticky`. Horizontal scroll is `data-scroll="x"`.
- Bottom: a pinned block gets `pb-safe-offset-3`; a Screen without one gets `pb-safe-offset-6` on `data-scroll`.
- `tab-root` has no header: content starts right under the status bar.
- In `overlay`, a cross replaces the arrow: the CloseButton (`class="absolute left-4"`). Without a title the header is `<header class="h-[52px] justify-center px-4">` with the cross `class="self-start"` and no `border-b`.
- A result Screen (congratulations, "done") is an `overlay`. If the design has no way to close it, add a cross and say so.
- The Screen's main button is visible without scrolling at 393×852. If it falls lower in the flow, pin it in the `footer` and say so.
- The header can grow (a second row with progress, a chip on the right); the back arrow or cross stays on the left.
- The side margin is `px-4`.

## Layout: as in React Native

- Any `div` is a column. A row is only `flex-row`.
- Nothing shrinks on its own. Text in a row wraps only when it or its wrapper has `flex-1`.
- Spacing between siblings is `gap-*` on the parent; `mt-*` for one-off offsets.
- Width is fluid: `flex-1`, `w-full`, `self-stretch`. A fixed width only for avatars, icons, images. The Screen looks right at 375 and 430.
- An N-column grid is `flex-row gap-*` rows, each with N `flex-1` blocks; mark a data list laid out this way `data-columns="2"`.
- Layers are `absolute` plus coordinates; stacking order is markup order. `absolute` without coordinates goes where the parent's alignment puts it: in an `items-center justify-center` parent, at the centre (circles under an avatar or badge).
- Size scale: 1 = 4px (`p-4` = 16px, `gap-2.5` = 10px). Off-scale values in brackets: `pt-[22px]`, `h-[190px]`.

Radii in the app are larger than on the web. Write the class by pixel value:

| px | 4 | 8 | 12 | 16 | 24 | 32 | 48 | circle |
|---|---|---|---|---|---|---|---|---|
| class | `rounded-xs` | `rounded-sm` | `rounded-md` | `rounded-lg` | `rounded-xl` | `rounded-2xl` | `rounded-3xl` | `rounded-full` |

Any other value is `rounded-[20px]`. A bare `rounded` is not allowed. When the design comes from a web Prototype, find each radius in pixels first, then pick the class: same-named classes give different radii on Web and iOS.

## Colour tokens

| Class | What it is |
|---|---|
| `bg-background` | Screen background (light grey / near black) |
| `bg-surface`, `bg-surface-secondary`, `bg-surface-tertiary` | cards and nested tiles |
| `bg-default` | neutral fill: chips, tracks, round buttons |
| `bg-overlay`, `bg-backdrop` | sheets and dialogs, the dimming under them |
| `text-foreground`, `text-muted` | primary and secondary text |
| `bg-accent`, `text-accent`, `text-accent-foreground` | accent and the text on it |
| `bg-accent-soft`, `text-accent-soft-foreground` | soft accent |
| `success`, `warning`, `danger` | the same four forms: `bg-success`, `text-success-foreground`, `bg-success-soft`, `text-success-soft-foreground` |
| `border-border`, `bg-separator` | borders and separators |
| `bg-segment`, `text-segment-foreground` | the selected Tabs segment |

- Any token works with any prefix: `bg-`, `text-`, `border-` (`border-success`, `text-warning`). `border-transparent` is allowed.
- White on a coloured background is `accent-foreground` (light in both themes). An inverse tile is `bg-foreground` with `text-background`.
- A wrong answer in learning Screens is `warning`, not `danger`.
- Shadows: only `shadow-surface`, `shadow-overlay`, `shadow-field`.
- In a `data-illustration` block, `data-decor="glow"` takes its colour from `data-tint="#D97757"`. A brand chip is `data-hero="Chip"` with `data-illustration` on the chip itself. A brand glow behind ordinary content is a separate layer `<div data-illustration class="absolute inset-0">` with the glow inside. Parts of an illustration that must follow the theme use tokens as usual.

## Text

Text lives only in `<p>`, `<h1>`–`<h6>`, `<span>`; each is HeroUI Typography. Styles are not inherited from the container: text outside these tags turns pink in the preview.

| `data-type` | size / line height | weight |
|---|---|---|
| `h1` … `h6` | 36/40 · 30/36 · 24/32 · 20/28 · 18/28 · 16/24 | semibold |
| none or `body` | 16/28 | normal |
| `body-sm` | 14/24 | normal |
| `body-xs` | 12/20 | normal |

- `data-weight`: `normal` `medium` `semibold` `bold`. `data-color="muted"`. `data-align`: `center` `end`.
- Headings have tight tracking; when it isn't wanted, `tracking-normal`.
- A different line height: add `leading-*` (`data-type="body-sm" class="leading-5"` is 14/20). Changing the size with a `text-*` class always comes with a `leading-*`.
- A different colour or weight inside a line is a nested `<span>`. Truncation: `line-clamp-1`, `line-clamp-2`.
- When the source sets no line height, take it from the scale: 12/16, 14/20, 16/24.

## HeroUI Native components

Sizes and colours come from the library; `class` adds or overrides. The kit renders these today:

**Button** — `data-size` is required: `sm` 40px, `md` 48px, `lg` 56px; no other heights. `data-variant`: `primary` (default), `secondary` (grey, blue text), `tertiary` (grey, dark text), `outline`, `ghost`, `danger`, `danger-soft`. Full width by default; compact is `class="w-auto"`. Two buttons in a row: `flex-row gap-*`, the main one `class="w-auto flex-1"`, the other `class="w-auto"`. Disabled: `data-disabled`, no `data-press`. Pick the size by height (48 → `md`) and the variant by look, not by a web class name: grey with dark text is `tertiary`.

```html
<button data-hero="Button" data-variant="primary" data-size="md" data-press="action:join">
  <span data-slot="label">Join now</span>
  <i data-icon="arrow-right" class="size-4 text-accent-foreground"></i>
</button>
```

**CloseButton** — a round 32px cross: `<button data-hero="CloseButton" data-press="close"><i data-icon="xmark" class="size-[18px] text-muted"></i></button>`. Every cross in the app is `text-muted`.

**Chip** — `data-size`: `sm` (text 12), `md` (14, default), `lg` (16). `data-variant`: `primary`, `secondary`, `tertiary`, `soft`. `data-color`: `accent`, `default`, `success`, `warning`, `danger`. A chip hugs the start of its row; in a centred column add `self-center`.

```html
<div data-hero="Chip" data-variant="soft" data-color="success" data-size="sm">
  <i data-icon="check" class="size-3 text-success"></i>
  <span data-slot="label">Completed</span>
</div>
```

**Surface** and **Card** — a card: `bg-surface`, shadow, padding 16. Set the radius: `rounded-xl`, `rounded-lg`. `data-variant`: `secondary`, `tertiary`, `transparent`. A tile inside a card is a plain `div` with `bg-surface-secondary`, not a second Surface.

**ListGroup** — rows in the iOS Settings style: `<div data-hero="ListGroup">` → rows `<div data-slot="item">` → inside, `data-slot="item-content"` with `item-title` and `item-description`.

**Avatar** — `data-size`: `sm` 40, `md` 48, `lg` 64. Inside, `<img>` or `<span data-slot="fallback">AB</span>`. `data-variant="soft"`, `data-color`.

**Separator** — `<hr data-hero="Separator">`. Vertical: `data-orientation="vertical" class="h-auto self-stretch"`. A thick section divider: `data-variant="thick"`.

**Tabs** — a segmented control:

```html
<div data-hero="Tabs"><div data-slot="list">
  <button data-slot="trigger" data-selected data-press="filter:7-days"><span data-slot="label">7 days</span></button>
  <button data-slot="trigger" data-press="filter:14-days"><span data-slot="label">14 days</span></button>
</div></div>
```

**BottomSheet** — written after the Screen root, inside the section, and shown in its own State. The kit draws the handle and the dimming; no handle: `data-handle="none"`.

```html
<div data-hero="BottomSheet" data-when="sheet-open">
  <div data-slot="content" class="gap-4"> … </div>
</div>
```

**Toast** — `<div data-hero="Toast" data-when="saved"><p data-slot="label">Saved</p></div>`. It always appears at the top, under the status bar; a second line is `<p data-slot="description">`.

**Skeleton** — `<div data-hero="Skeleton" class="h-24 rounded-xl"></div>`, with the size and radius of the block it replaces. **Spinner** — `data-size`: `sm` `md` `lg`, colour via `text-*`.

**Not in the kit yet:** HeroUI Native also has TextField, TextArea, Input, InputGroup, InputOTP, SearchField, Select, Checkbox, Radio, Switch, Slider, Dialog, Popover, Menu, Accordion, Alert, TagGroup, LinkButton and more. The kit doesn't render them yet. When a Screen needs one, write it with its real name and props anyway (`data-hero="TextField" data-variant="…"`), never draw it by hand, and list it under "Open questions" as "kit needs TextField". The badge stays yellow with "unknown data-hero" for exactly these until the kit is extended; hand off with that list and tell the designer which components are missing. Every other issue must still be fixed.

**Selection rows** (a checklist, a quiz answer) are pressable rows with an indicator icon, assembled by hand: `data-press="select:name"`, on the left `<i data-icon>` — `square` / `square-check` for multiple choice, `circle` / `circle-check-fill` for single; selected and unselected are two States. The selected row's border is `border-[1.5px]`, the unselected one `border-transparent` of the same width, so the row doesn't jump.

**Segmented progress** is assembled from blocks: `flex-row gap-1`, segments `h-1.5 flex-1 rounded-full`, done `bg-accent`, the rest `bg-default`.

**Error State:** centred on the Screen — a `size-14 bg-default` circle with an icon, an `h4` title, a `body-sm` muted line, an `md` `w-auto` "Try again" button.

## Images

A raster image is at least three times its on-screen size (a 92px block → a file from 276px). If it's smaller, ask the designer for the source or an SVG.

## Decor and gradients

Closed vocabularies; each name is one shared component in the app.

- `data-decor="grid"` — a grid of lines; `data-decor="glow"` — a soft glow (size and position by classes: `size-[420px] -top-[190px] -right-[200px]`). `data-tone`: `on-accent` (on a blue background), `shade` (dimming), `surface` (a highlight under an image).
- `data-gradient="accent"` — the blue card gradient.

A new kind of decor or gradient is described to the designer in words; it gets added to the kit and the app together.

## Motion on iOS

The app plays the motion sheet's `@keyframes` natively (Reanimated), so almost everything in CSS carries over, within these limits.

What can be animated:

- `opacity` and `transform`: `translateX` / `translateY` / `translate(x, y)`, `scale`, `rotate`, `skew`, in px, deg and %;
- size and position: `width`, `height`, `top` / `left` / `right` / `bottom`, `margin-*`, `padding-*`, `border-radius`, `border-width`;
- colour: `color`, `background-color`, `border-color`;
- shadows: `box-shadow`, `text-shadow`;
- text: `font-size`, `letter-spacing`, `line-height`.

How to write frames:

- The first and last frames (`from` / `0%`, `to` / `100%`) are explicit and both contain every property of the animation; a middle frame may change only some.
- All frames of one animation use the same transform functions in the same order. No `transform: none`: write zeros, `translateY(0) scale(1)`.
- No `calc()`: final numbers.
- Growth from an edge (filling a bar) animates `width` or `height` in percent on the inner block, not `scaleX` with `transform-origin`.
- `data-anim` goes on a whole text block; a piece of a line (`<span>` in a heading) can't animate — move it into its own block above or below.
- A loop needs `both` only when the element must sit in its first frame before it starts (hidden past an edge, transparent).

What the app can't draw — rebuild:

| On the web | On iOS |
|---|---|
| glow via `filter: drop-shadow()` / `blur()` | on text `text-shadow`; on a block `box-shadow`, or a `data-decor="glow"` layer animating `opacity` and `scale` |
| shine via `background-position` or a gradient in `::after` | a narrow strip `absolute top-0 bottom-0 left-0 w-10 bg-accent-foreground/15` moved with `translateX` + `skewX`; the parent `overflow-hidden` |
| `::before` / `::after` | a real `div` in the markup |
| pulse shadow (`box-shadow` from nothing and back) | keep it: `box-shadow` in the frames |
| a ring or halo visible at rest | a separate `absolute` circle under the element (`bg-accent/10` or `border-2 border-accent`) animating `scale` and `opacity`; the parent `items-center justify-center` |
| particles, sparks, confetti placed by a script | explicit elements: position by classes, numbers in `data-vars`, own duration and delay in `data-anim` |
| per-letter gradient (`background-clip: text`), masks, `clip-path` | doesn't carry over: keep the colour token and the entrance; list it under "Animation losses" |
| scroll-linked animation (parallax, `animation-timeline`) | doesn't carry over; list it under "Animation losses" |
| `transition` on data change, counters, typing text from a script | can't be marked up: describe it in an HTML comment next to the element |
| `transition` on hover | not needed: the library gives press feedback |

Cost: `opacity` and `transform` cost the phone almost nothing, and so does any one-off animation. Endless loops are expensive:

- an endless animation of a shadow, size or colour: at most 3–4 elements per Screen. If the source pulses every button, keep the pulse on the main ones, give the rest only the `transform` part, and say so;
- constantly flying particles: up to 20 per Screen; one-off ones (confetti, sparks): up to 40 per Screen in total. When cutting, say how many there were and how many are left;
- endless animations in one State: up to 60; the check flags more.

The app also handles the sheet sliding in, the Tabs indicator moving, and the system "reduce motion" setting. The old short names `data-motion="fade | rise | pop"` with `data-delay` still work; for anything carried over from a source, use `data-anim` to keep exact durations and curves.

## Not allowed on iOS

| Web habit | On iOS |
|---|---|
| `grid`, `sticky`, `fixed` | `flex-row` rows; a pinned block is a sibling of `data-scroll` |
| `hover:`, `focus:`, `md:`, `desktop:` | no hover states and one screen size |
| `transition`, `animate-*`, `@keyframes` in your own `<style>` | the motion sheet and `data-anim` |
| `space-x-*`, `divide-*` | `gap-*`, Separator |
| `backdrop-*`, `blur`, filters | don't carry over; a blurred look is an image |
| your own `<style>` (except the motion sheet) | tokens and classes |
| sidebar, top bar, burger, site footer | the app shell the kit draws |

## Starting from a web Prototype

When the iOS file starts from the feature's web file, take its mobile layout as the content and bring it to these rules: drop the site Navigation (sidebar, top bar, tab bar of the web), take button and chip sizes from HeroUI Native, map radii by pixels, carry over every animation (list every animation of the source first: element, keyframes, duration, curve, delay, repeats — what actually plays, not what's in the stylesheet), keep the same Screen names, State names, `data-press` and `data-bind` so the Platform switch and the PRD line up. The iOS design may still differ from the web one wherever the designer wants. List everything you changed relative to the web file under "Open questions" or tell the designer directly.

## Before handoff (iOS)

In addition to [shared.md](shared.md#before-handoff): every Screen checked at 375, 393 and 430 — nothing overflows or is clipped.
