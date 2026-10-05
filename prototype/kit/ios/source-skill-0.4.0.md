# Jobescape iOS screen rules (translated)

> English translation of the Russian-language iOS kit skill `jobescape-app-html` 0.4.0, kept here as source material for the prototype skill.
> It is not a live skill: the frontmatter was dropped and `_Scope:_` lines and `[iOS]` prefixes were added; all rules, numbers, tables and code follow the original.

## Jobescape app HTML

_Scope: mixed_ — iOS-only: the three bullets (app theme CSS, React Native `View` behavior, HeroUI Native components).

There is no Figma in the process: the HTML file is the only source of the design. It is both the designer's preview and the developer's spec. Everything inside `<section data-screen>` is carried into code letter for letter: a tag becomes a component, `class` becomes `className`. That is why the app's rules apply inside a screen, not the web's, and the file is built so the browser shows exactly what the phone will show:

- [iOS] the theme in the file is the same CSS the app compiles (HeroUI Native plus the app's overrides), so `bg-surface`, `rounded-lg`, `text-muted` mean here exactly what they mean on the phone;
- [iOS] every block behaves like a React Native `View`;
- [iOS] HeroUI Native components are included by name and look the way the library draws them.

## How to work

_Scope: mixed_ — iOS-only: the widths 375 / 393 / 430 in step 3, the web-prototype paragraph's site-shell removal and "button and chip sizes from HeroUI Native" clauses, and the `examples/challenges.html` pointer.

1. Copy `template.html` under a new name. Do not edit the block between `KIT:BEGIN` and `KIT:END`: it comes from the app repository.
2. Build the screens in `<body>` following the rules below. Put images in `assets/` next to the file.
3. Open the file in a browser and check: Light and Dark, widths 375 / 393 / 430,
   "Expanded" mode (the entire scroll laid out at once). The indicator in the top right must
   be green: "Contract: ok". Yellow — open the list and fix every
   issue. The "↻ Replay" button replays the animations.
   The same can be set in the URL: `?theme=dark&w=375&mode=flat&only=screen:state`,
   and `&t=600` freezes all animations at the 600th millisecond — that way the
   screenshot shows the middle of an entrance.
   Without a browser window: headless Chrome with `--dump-dom`; in the output the `<html>` tag
   must carry `data-contract-issues="0"`. Check icon names separately —
   the kit verifies them over the network and may not finish in time.
   The green indicator checks only what can be checked automatically;
   it does not replace the rules in this file.
   No browser and no headless Chrome (a plain chat) — do not pretend you
   checked. In the very first line, tell the designer the file was not opened and ask them to
   open it themselves: the indicator, both themes, three widths, the "↻ Replay" button.
   They will send you the indicator's issue list as text. The preview needs the network:
   Tailwind and icons load from a CDN.
4. Hand over the entire folder: the HTML and `assets/`.

If the source is a web prototype, take its mobile breakpoint as the content and
bring it to the rules below: remove the site shell (sidebar, top bar, burger),
take button and chip sizes from HeroUI Native, replace colors with tokens, decor with
the vocabulary from the "Decor and gradients" section, carry over all animations — see the
"Animations" section. List for the designer everything you had to change
relative to the source.

[iOS] The full example is `examples/challenges.html` (challenge list and challenge details, three and two
states, a sheet).

## Screen skeleton

_Scope: mixed_ — iOS-only: the `data-route`, `data-tabbar`, `data-statusbar` rows, the "kit draws the status bar" line, and the bullets tagged [iOS] (safe areas, scroll/pinned layout, header, routes, 393×852, site shell, side margin).

One screen — one `<section data-screen>`. Section attributes:

| Attribute | Value |
|---|---|
| `data-screen` | screen name in Latin letters: `challenge-details` |
| [iOS] `data-route` | `tab-root` — a tab root (tab bar visible, no header); `push` — a screen on top, header with "back"; `overlay` — full screen over the tab bar, header with a close cross; `card-sheet` — the system iOS card, only if the designer explicitly asks for it |
| [iOS] `data-tabbar` | only for `tab-root`: the active tab — `my-plan`, `challenges`, `ai`, `profile`, `apps` |
| `data-states` | state names separated by spaces: `default loading empty error` |
| [iOS] `data-statusbar` | `light` if the background under the status bar is dark or colored |

[iOS] The kit draws the status bar, the tab bar and the home indicator — do not draw them yourself.

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

- [iOS] The screen root is always `flex-1 bg-background pt-safe`.
- [iOS] Only `data-scroll` scrolls. Its classes are the padding and `gap` of the
  content. A pinned bottom is a sibling of `data-scroll`, not `fixed`/`sticky`.
- [iOS] Bottom: a pinned block gets `pb-safe-offset-3`; a screen without a pinned block gets
  `pb-safe-offset-6` on the `data-scroll` itself.
- [iOS] `tab-root` has no header: the content starts right below the status bar.
- [iOS] In `overlay`, a cross replaces the arrow on the left — the CloseButton component
  (`class="absolute left-4"`). There may be no title: then the header is
  `<header class="h-[52px] justify-center px-4">` with the cross
  `class="self-start"` and no `border-b`.
- [iOS] A result screen (congratulations, "done") is an `overlay`. If the web version has no way
  to close it, add a cross and tell the designer.
- [iOS] The screen's main button must be visible without scrolling at 393×852. If in
  the flow it falls below that — pin it to the bottom (`footer`) and tell the designer.
- [iOS] What belongs to the site shell on the web is not carried over: the page's top
  padding, the page title and the chips from the top bar. The title, if it is needed,
  goes into the screen header.
- If with different data the screen turns into a different screen (last day →
  finale with a certificate), that is a separate `data-screen`. Not asked — don't build it, but
  name it to the designer.
- Example data is the scenario the prototype shows by default.
- [iOS] The header can be extended (a second row with progress, a chip on the right), but the
  "back" button or the cross stays on the left in its place.
- A multi-step process on one screen (lesson, quiz, onboarding) is one
  `data-screen`, with each step getting its own state in `data-states`. A block that
  differs between steps by an attribute or class is repeated with `data-when` —
  that is fine: in code it becomes one component with a condition.
- [iOS] The screen's side margin is `px-4`.

## Layout: as in React Native

_Scope: iOS_

- Any `div` is a column. A row is only `flex-row`.
- Nothing shrinks on its own. Text in a row wraps only if it or
  its wrapper has `flex-1`.
- Spacing between siblings — `gap-*` on the parent; `mt-*` — for one-off
  offsets.
- Width is fluid: `flex-1`, `w-full`, `self-stretch`. A fixed width is
  only for avatars, icons, images. The screen must look right at 375
  and 430.
- An N-column grid is rows of `flex-row gap-*`, each with N blocks with `flex-1`.
- Layers — `absolute` plus coordinates; stacking order is markup order.
  `absolute` without coordinates goes where the parent's alignment puts it:
  in a parent with `items-center justify-center` — at the center (this is how circles
  under an avatar or a badge are built).
- Tailwind size scale: 1 = 4px (`p-4` = 16px, `gap-2.5` = 10px). An off-scale value
  goes in brackets: `pt-[22px]`, `h-[190px]`.

Radii in the app are larger than on the web. Write the class by pixel value:

| px | 4 | 8 | 12 | 16 | 24 | 32 | 48 | circle |
|---|---|---|---|---|---|---|---|---|
| class | `rounded-xs` | `rounded-sm` | `rounded-md` | `rounded-lg` | `rounded-xl` | `rounded-2xl` | `rounded-3xl` | `rounded-full` |

Any other value — `rounded-[20px]`. A bare `rounded` is forbidden. If the source
web prototype sets radii via variables or classes, first find their
value in pixels, then pick the class from the table: same-named classes on the web
and in the app give different radii.

## Colors: tokens only

_Scope: mixed_ — iOS-only: the whole token table (HeroUI Native theme names) and the shadow-token bullet; the tokens-only discipline, opacity modifiers and the `data-illustration` exception are shared.

| Class | What it is |
|---|---|
| `bg-background` | screen background (light gray / near-black) |
| `bg-surface`, `bg-surface-secondary`, `bg-surface-tertiary` | cards and nested tiles |
| `bg-default` | neutral fill: chips, tracks, round buttons |
| `bg-overlay`, `bg-backdrop` | sheets and dialogs, the dimming under them |
| `text-foreground`, `text-muted` | primary and secondary text |
| `bg-accent`, `text-accent`, `text-accent-foreground` | accent and the text on it |
| `bg-accent-soft`, `text-accent-soft-foreground` | soft accent |
| `success`, `warning`, `danger` | the same four forms: `bg-success`, `text-success-foreground`, `bg-success-soft`, `text-success-soft-foreground` |
| `border-border`, `bg-separator` | borders and separators |
| `bg-segment`, `text-segment-foreground` | the selected Tabs segment |

- Any token from the table works with any prefix: `bg-`, `text-`,
  `border-` (`border-success`, `text-warning`). `border-transparent` is allowed.
- There are no Tailwind palettes here (`bg-blue-500`, `text-zinc-500`): such classes will not
  render in the preview. The contract check flags hex and `rgb()` as errors.
- Opacity — via a modifier: `bg-accent/5`, `text-accent-foreground/80`.
- White on a colored background — `accent-foreground` (stays light in both themes).
- An inverse tile — `bg-foreground` with `text-background`.
- A wrong answer in learning screens is `warning`, not `danger`.
- [iOS] Shadows — only `shadow-surface`, `shadow-overlay`, `shadow-field`.

**Brand colors outside the theme** (Claude orange, medal gold) — only
inside a `data-illustration` block. Inside it, bracket colors are allowed:
`bg-[#D97757]`, `border-[#D97757]/40`, `text-[#D97757]`, and the
`data-decor="glow"` glow takes its color from `data-tint="#D97757"`. Such a block is identical in
the light and dark themes, so choose the background under it so that it reads in
both. Coloring ordinary UI — buttons, text, cards — this way is not allowed.
A chip in brand colors is `data-hero="Chip"` with `data-illustration` on the chip itself.
A part of the illustration that must change with the theme is colored with tokens as
usual. A brand glow behind ordinary content is a separate layer
`<div data-illustration class="absolute inset-0">` with the glow inside.

## Text

_Scope: mixed_ — iOS-only: the opening paragraph (HeroUI Typography, React Native text rule), the whole `data-type` table, and the bullets tagged [iOS]; the nested `<span>`, `<br>`/localization, clamp and plural bullets are shared.

[iOS] Text lives only in `<p>`, `<h1>`–`<h6>`, `<span>`. Every such tag is
Typography from HeroUI. Styles are not inherited from the container: text outside these tags
turns pink in the preview.

| `data-type` | size / line height | weight |
|---|---|---|
| `h1` … `h6` | 36/40 · 30/36 · 24/32 · 20/28 · 18/28 · 16/24 | semibold |
| no attribute or `body` | 16/28 | normal |
| `body-sm` | 14/24 | normal |
| `body-xs` | 12/20 | normal |

- [iOS] `data-weight`: `normal` `medium` `semibold` `bold`. `data-color="muted"`.
  `data-align`: `center` `end`.
- [iOS] Headings have tight tracking by default. If you don't want it — `tracking-normal`.
- [iOS] Need a different line height — add `leading-*`: `data-type="body-sm"
  class="leading-5"` gives 14/20. If you change the size with a `text-*` class, always write
  a `leading-*` next to it.
- A fragment of a different color or weight inside a line — a nested `<span>`.
- `<br>` — only for a deliberate line break. Strings are translated into ten languages and
  can be one and a half times longer: do not fit blocks to the length of the English phrase.
- Truncation — `line-clamp-1`, `line-clamp-2`.
- [iOS] If the source does not set a line height, take it from the scale: 12/16, 14/20, 16/24.
- Text that depends on a number ("1 day" / "2 days") — an example, with a
  `<!-- plural -->` comment next to it.

## HeroUI Native components

_Scope: mixed_ — iOS-only: the opening paragraph and every component paragraph (all tagged [iOS]); the last three paragraphs (custom pressable blocks, selection rows, the missing-component protocol) are shared, though the list of missing components and the progress-indicator recipe describe the iOS kit.

[iOS] A component is enabled with the `data-hero` attribute. Its sizes and colors come from the
library; `class` adds or overrides, like `className` in code.
Do not assemble from blocks what is in the list.

[iOS] **Button** — `data-size` is required: `sm` 40px, `md` 48px, `lg` 56px. There are no other
heights. `data-variant`: `primary` (default), `secondary` (gray, blue
text), `tertiary` (gray, dark text), `outline`, `ghost`, `danger`,
`danger-soft`. By default it stretches to the full width; a compact one — `class="w-auto"`.
Two buttons in a row: `flex-row gap-*`, the main one gets `class="w-auto flex-1"`, the
secondary one `class="w-auto"`. A disabled one — `data-disabled`; it does not need `data-press`.
Choose the size by height in pixels (48 → `md`), the variant by appearance,
not by the class name on the web: gray with dark text is `tertiary`.

```html
<button data-hero="Button" data-variant="primary" data-size="md" data-press="action:join">
  <span data-slot="label">Join now</span>
  <i data-icon="arrow-right" class="size-4 text-accent-foreground"></i>
</button>
```

[iOS] **CloseButton** — a round 32px cross:
`<button data-hero="CloseButton" data-press="close"><i data-icon="xmark" class="size-[18px] text-muted"></i></button>`.
Every cross in the app is `text-muted`.

[iOS] **Chip** — `data-size`: `sm` (text 12), `md` (14, default), `lg` (16).
`data-variant`: `primary`, `secondary`, `tertiary`, `soft`. `data-color`:
`accent`, `default`, `success`, `warning`, `danger`. A chip hugs the start of the
row; in a column with center alignment, add `self-center` to it.

```html
<div data-hero="Chip" data-variant="soft" data-color="success" data-size="sm">
  <i data-icon="check" class="size-3 text-success"></i>
  <span data-slot="label">Completed</span>
</div>
```

[iOS] **Surface** (and **Card**) — a card: `bg-surface`, shadow, padding 16. Set the radius
yourself: `rounded-xl`, `rounded-lg`. `data-variant`: `secondary`, `tertiary`,
`transparent`. A tile inside a card is a plain `div` with `bg-surface-secondary`,
not a second Surface.

[iOS] **ListGroup** — a list of rows in the iOS Settings style:
`<div data-hero="ListGroup">` → rows `<div data-slot="item">` → inside them
`data-slot="item-content"` with `item-title` and `item-description`.

[iOS] **Avatar** — `data-size`: `sm` 40, `md` 48, `lg` 64. Inside, `<img>` or
`<span data-slot="fallback">AB</span>`. `data-variant="soft"`, `data-color`.

[iOS] **Separator** — `<hr data-hero="Separator">`. Vertical:
`data-orientation="vertical" class="h-auto self-stretch"`.

[iOS] **Tabs** — a segmented control:

```html
<div data-hero="Tabs"><div data-slot="list">
  <button data-slot="trigger" data-selected data-press="filter:7-days"><span data-slot="label">7 days</span></button>
  <button data-slot="trigger" data-press="filter:14-days"><span data-slot="label">14 days</span></button>
</div></div>
```

[iOS] **BottomSheet** — written after the screen root, inside the section, and shown in
its own state. The kit draws the handle and the dimming. Without a handle — `data-handle="none"`.

```html
<div data-hero="BottomSheet" data-when="sheet-open">
  <div data-slot="content" class="gap-4"> … </div>
</div>
```

[iOS] **Toast** — `<div data-hero="Toast" data-when="saved"><p data-slot="label">Saved</p></div>`.
In the app a toast always appears at the top, under the status bar; the second line is
`<p data-slot="description">`.

[iOS] **Skeleton** — `<div data-hero="Skeleton" class="h-24 rounded-xl"></div>`: the size and
radius of the block it replaces. **Spinner** — `data-size`: `sm` `md` `lg`,
color via `text-*`.

A pressable block that is not in the list (a card, a row, a round button) is
a plain `div` or `button` with `data-press`.

A selection row (a checklist, an answer option in a quiz) is a pressable row with
an indicator icon; you may assemble it: `data-press="select:name"`, on the left
`<i data-icon>` — `square` / `square-check` for multiple choice,
`circle` / `circle-check-fill` for single choice; selected and unselected are
two screen states. Give the selected row's border `border-[1.5px]`, and the
unselected one `border-transparent` of the same thickness, so the row does not jump.

There are no input fields, Switch, Select, Dialog, dates or charts in the kit yet. If
the screen needs them — do not draw them by hand: leave an HTML comment in their place
and tell the designer the kit needs to be extended. A segmented progress
indicator is assembled from blocks: `flex-row gap-1`, segments
`h-1.5 flex-1 rounded-full`, completed ones `bg-accent`, the rest `bg-default`.

## Icons and images

_Scope: mixed_ — iOS-only: the 3× raster bullet (iPhone @3x density); the rest is shared.

- An icon is `<i data-icon="name" class="size-4 text-muted">`. The name comes from
  `@gravity-ui/icons` (gravity-ui.com/icons). Size and a color token are required.
  `<svg>` in markup is forbidden. If you can't verify a name over the network — use the ones
  already in `examples/`, and list the rest for the designer: they will see a wrong name
  in the indicator.
- Draw directional icons (arrows, chevrons) for a left-to-right language:
  code mirrors them.
- An image is `<img data-asset="name.png" src="assets/name.png" class="…">` with an explicit
  size: `size-9`, `h-[130px] w-[250px]` or `w-full aspect-[3/2]`.
- An image that comes from the server also gets `data-bind="course.image"`.
- [iOS] A raster image must be at least three times larger than its on-screen size
  (a 92px block → a file from 276px). If it is smaller in the prototype — ask the designer for the
  source file or an SVG.
- No text inside images. A drawing, photo, logo is a file in `assets/`, not
  blocks with hex. Simple brand elements made of blocks (rings, a tile, a glow)
  go in `data-illustration`, see "Colors".

## Data and actions

_Scope: shared_

- Text or an image that comes from the server: `data-bind="course.title"`.
  Otherwise the example ends up in code as a constant. Make up names by meaning —
  `course.title`, `day.number`, `user.streak`: the developer will reconcile the exact fields.
  Whatever comes with the data but is not text or an image (which icon a day has,
  how many segments a progress bar has) — as a comment next to it.
- A dynamic piece inside a constant phrase — a nested
  `<span data-bind="…">`. A server string that contains line breaks or
  highlights — one tag with `data-bind`, and describe the highlighting rule in an
  HTML comment next to it.
- A list: a container with `data-list="name"`, inside it 2–3 real examples, one of them with
  the longest text. `data-bind` inside a list is written relative to the item:
  `data-list="lesson.steps"` → `data-bind="step.title"`. A two-column grid —
  `data-columns="2"` and `flex-row` rows.
- A press: `data-press="verb:target"` — `back`, `close`,
  `push:challenge-details`, `open:sheet:leaderboard`, `action:join`,
  `filter:7-days`, `select:option-a`, `link:https://…`. Return to a tab root
  — `tab:challenges`. Close the whole flow and return to the screen beneath it —
  `close`. If after success the action leads to another screen, append it with
  an arrow: `action:complete-day>day-complete`. `push:screen` opens any
  screen; how exactly it opens is decided by that screen's `data-route`.

## States

_Scope: mixed_ — iOS-only: in the last paragraph, the error-state recipe (`size-14` circle, `h4`, `body-sm`, `md` button) and "Hover and focus are not drawn"; the rest is shared.

State names are listed in the section's `data-states`. The kit shows each state
as a separate phone.

- `data-when="in-progress"` — the block is visible only in this state (several
  names separated by spaces are allowed).
- `data-unless="in-progress"` — the block is visible in all states except this one.
- Different text per state — two adjacent tags with `data-when`.

A screen that loads data from the server itself needs `loading` (Skeleton,
not a spinner) and an error state; an empty state — only where a list can be
empty. A screen that shows what is already known (congratulations, a result)
does not need them. Error — centered on the screen: a `size-14 bg-default` circle with an icon,
an `h4` title, a `body-sm` muted line, an `md` `w-auto` "Try again" button.
A sheet, a dialog, a toast — a separate state. Hover and focus are not drawn.

## Decor and gradients

_Scope: mixed_ — iOS-only: the thick-separator sentence (`<hr data-hero="Separator" data-variant="thick">`); the closed-vocabulary rule, the decor/gradient names and `data-scroll="x"` are shared.

These are closed vocabularies. Each name is one shared component in the app.

- `data-decor="grid"` — a grid of lines; `data-decor="glow"` — a soft glow
  (size and position via classes: `size-[420px] -top-[190px] -right-[200px]`).
  `data-tone`: `on-accent` (on a blue background), `shade` (dimming), `surface`
  (a highlight under an image).
- `data-gradient="accent"` — the blue card gradient.

Need a new kind of decor or a gradient — describe it to the designer in words: it will be added
to the kit and to the app at the same time. Horizontal scroll — `data-scroll="x"`.
A thick section separator — `<hr data-hero="Separator" data-variant="thick">`.

## Animations: all of them carry over

_Scope: mixed_ — iOS-only: the intro's "the app plays the same `@keyframes` natively" sentence and everything tagged [iOS] (what can be animated, frame constraints except the color-token bullet, text-as-block, §4 rebuild table, §5 cost, §6 except its last sentence); the motion-sheet format, `data-anim` syntax, `data-vars`, `data-anim-on`, stagger and the porting method are shared.

Animations are part of the design. If the source is a web prototype, carry over **every**
one of its animations: entrances and their order, on-scroll entrances, persistent ones
(floating, pulse, shine, wobble, particles), delays, durations and easing curves.
The app plays the same `@keyframes` natively, so almost
everything in CSS carries over. Dropping an animation is not allowed: if it does not pass the
rules below — rebuild it using the table, and only when that is impossible, name
it to the designer in the loss list.

The source of truth is what actually plays on screen, not the stylesheet: a rule
that applies to nothing or is overridden by another is not carried over. Without
a browser, work this out from the text: for each element, find all rules with
`animation` that match it; the one whose selector is more specific wins, and with
equal specificity — the last one. First write out all of the screen's animations (element, keyframes,
duration, easing, delay, repeats), then carry them over following the list.
A quirk of the prototype (a ring stands as a motionless outline until its delay) —
carry it over as is and name it to the designer.

**1. Motion sheet.** One `<style data-motion-sheet>` right after the KIT block. It
contains only `@keyframes`. Take the names from the source (do not name an animation with a word from
CSS: `ease`, `both`, `normal`, `infinite`, `linear`).

[iOS] What can be animated in frames:

- [iOS] `opacity` and `transform`: `translateX` / `translateY` / `translate(x, y)`,
  `scale`, `rotate`, `skew` — in px, deg and %;
- [iOS] size and position: `width`, `height`, `top` / `left` / `right` / `bottom`,
  `margin-*`, `padding-*`, `border-radius`, `border-width`;
- [iOS] color: `color`, `background-color`, `border-color`;
- [iOS] shadows: `box-shadow`, `text-shadow`;
- [iOS] text: `font-size`, `letter-spacing`, `line-height`.

How to write frames:

- [iOS] The first and last frames (`from` / `0%` and `to` / `100%`) are written explicitly, and
  both contain every property of the animation. An intermediate frame may change only
  some of the properties.
- [iOS] All frames of one animation write the same transform functions in the same
  order. `transform: none` is not allowed — write zeros: `translateY(0) scale(1)`.
- Color — only via a token: `var(--accent)` or, with opacity,
  `color-mix(in oklab, var(--accent) 50%, transparent)`.
- [iOS] `calc()` is not allowed — final numbers.
- [iOS] Growth from an edge (filling a bar) — animate `width` or `height` in percent
  on the inner block, not `scaleX` with `transform-origin`.

```html
<style data-motion-sheet>
@keyframes rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
@keyframes bob { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-5px) rotate(-6deg); } }
@keyframes btnPulse {
  0% { box-shadow: 0 0 0 0 color-mix(in oklab, var(--accent) 50%, transparent); }
  70% { box-shadow: 0 0 0 16px color-mix(in oklab, var(--accent) 0%, transparent); }
  100% { box-shadow: 0 0 0 0 color-mix(in oklab, var(--accent) 0%, transparent); }
}
</style>
```

**2. `data-anim` on the element** — a regular CSS `animation` shorthand: name,
duration, easing, delay, iteration count or `infinite`, direction
(`reverse`, `alternate`), `both`. Several animations — comma-separated, as in CSS
(an entrance, then a persistent one):

```html
<i data-icon="crown-diamond" class="size-[26px] text-accent-foreground"
   data-anim="rise 600ms cubic-bezier(0.22, 1, 0.36, 1) 850ms both, bob 2.4s ease-in-out 1.5s infinite"></i>
```

- An entrance always gets `both`, otherwise the element is visible before its delay. A persistent
  animation needs `both` only if before its start the element must sit in its
  first frame (hidden past an edge, transparent).
- Easing curves — `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`,
  `cubic-bezier(…)`, `steps(…)`. Expand variables from the source (`var(--ease-out)`,
  `var(--t)`, `var(--delay)`) into values right inside `data-anim`.
- Sequencing (stagger) — different delays on siblings. In a data-driven list
  (`data-list`), write delays on the examples and the formula as a comment:
  `<!-- delay: 700ms + i × 80ms -->`.
- Two animations of the same property on one element do not add up: while the
  second one runs, the first is not visible (as in CSS). If you need both at once (fly-in and
  rotation) — an outer block with one animation, an inner one with the other.
- [iOS] Text is animated as a block: `data-anim` goes on the whole `<p>` / `<h1>`.
  If in the source a piece of a line is animated (a `<span>` inside a heading) — move
  that piece into a separate block below or above the rest of the text.
- `data-anim` can go on any element, including `data-hero`,
  `data-decor` and icons.

**Per-element numbers — `data-vars`.** When one `@keyframes`
flies off in different directions for different elements (sparks with `--dx` / `--dy`, confetti with
`--r`), keep `var()` in the frames and set the numbers on the element. Only numbers in px,
deg, % — not colors:

```html
<style data-motion-sheet>
@keyframes spark {
  0% { opacity: 0; transform: translateX(0) translateY(0) scale(0.4); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: translateX(var(--dx)) translateY(var(--dy)) scale(1); }
}
</style>
…
<div class="absolute size-1.5 rounded-full bg-accent" data-vars="--dx: -150px; --dy: -90px"
     data-anim="spark 1.4s cubic-bezier(0.22, 1, 0.36, 1) 700ms both"></div>
```

**3. When it starts.** By default — when the screen opened; delays are counted
from that moment. A block below the first screenful that on the web appears on scroll
(`.inview`, `.reveal`, IntersectionObserver) — `data-anim-on="view"`:
the animation starts when the block scrolls into view.

[iOS] **4. What the app cannot draw — rebuild.**

| On the web | In app-HTML |
|---|---|
| glow via `filter: drop-shadow()` / `blur()` | on text — `text-shadow`; on a block — `box-shadow` or a `data-decor="glow"` layer whose `opacity` and `scale` are animated |
| shine via `background-position` or a gradient in `::after` | a narrow strip `absolute top-0 bottom-0 left-0 w-10 bg-accent-foreground/15` with `translateX` + `skewX`; the parent gets `overflow-hidden` |
| `::before` / `::after` | a real `div` in the markup |
| pulse shadow (`box-shadow` from nothing and back) | keep it as is: `box-shadow` in the frames |
| a ring or halo that is visible at rest too | a separate `absolute` circle under the element (`bg-accent/10` or `border-2 border-accent`), animate its `scale` and `opacity`; the parent gets `items-center justify-center` |
| particles, sparks, confetti placed by a script | explicit elements: position via classes, their own numbers in `data-vars`, their own duration and delay in `data-anim` |
| per-letter gradient (`background-clip: text`), masks, `clip-path` | does not carry over: keep the color token and the entrance, name it in the loss list |
| scroll-linked animation (parallax, `animation-timeline`) | does not carry over: name it in the loss list |
| `transition` on data change, counters and typing text driven by a script | cannot be expressed in markup: describe it in words in an HTML comment next to the element |
| `transition` on hover | not needed: the library provides the press feedback |

[iOS] **5. Cost.** Animating `opacity` and `transform` costs the phone almost nothing,
and so does a one-off animation of anything. What is expensive is what loops forever:

- [iOS] an infinite animation of a shadow, size or color — no more than 3–4 elements per
  screen. If the source has a pulse shadow on every button, keep it on the main
  buttons, give the others only the `transform` part, and tell the designer;
- [iOS] constantly flying particles — up to 20 per screen; one-off ones (confetti, sparks) —
  up to 40 per screen in total. If you cut them — say how many there were and how many are left;
- [iOS] infinite animations in total in one screen state — up to 60; more than that the check
  will flag.

[iOS] **6. What not to write.** Press feedback on buttons and cards, the sheet sliding in,
the Tabs indicator moving, transitions between screens — the app does these itself.
The appearance of the whole screen at once (a fade of the root block on open) is also a
transition between screens.
The app also honors the system "reduce motion" setting itself.
Draw directional animations (an arrow sliding off to the right) for a left-to-right language:
code mirrors them.

The old short names `data-motion="fade | rise | pop"` with `data-delay` still work,
but for carrying over from a prototype use `data-anim`: that way the source's exact
durations and easing curves are preserved.

## Forbidden

_Scope: mixed_ — iOS-only: the rows tagged [iOS] (React Native layout limits, HeroUI components, web-to-app shell conversion); the motion-sheet, hex/style and `<svg>`/emoji rows are shared.

| Web | In the app |
|---|---|
| [iOS] `grid`, `sticky`, `fixed` | `flex-row` rows; a pinned block is a sibling of `data-scroll` |
| [iOS] `hover:`, `focus:`, breakpoints `md:` | there are no hover states; there is a single screen |
| `transition`, `animate-*`, `@keyframes` in your own `<style>` | the motion sheet and `data-anim` |
| [iOS] `space-x-*`, `divide-*` | `gap-*`, Separator |
| [iOS] `backdrop-*`, `blur`, filters | do not carry over; blurred content — as an image |
| hex, `style="…"`, your own `<style>` (except the motion sheet) | tokens and classes |
| `<svg>`, emoji instead of icons | `<i data-icon>` |
| [iOS] your own button, chip, card built from blocks | `data-hero` |
| [iOS] sidebar, top bar, burger, site footer | the app shell from the kit |

## Before handoff

_Scope: mixed_ — iOS-only: the "375 and 430" bullet; the rest is shared.

- The indicator reads "Contract: ok".
- Light and Dark reviewed: nothing disappeared or blended in.
- [iOS] 375 and 430: nothing overflows and nothing is clipped.
- Every state in `data-states` is a separate, meaningful phone.
- Dynamic content has `data-bind`, presses have `data-press`.
- Every animation in the source is either carried over or named in the loss list.
- The designer has been given a list of everything that differs from the source and everything
  the kit was missing.

## Glossary: kit toolbar labels

| Russian label in the kit | English used in this file |
|---|---|
| «Контракт: ок» | "Contract: ok" |
| «Развёрнуто» | "Expanded" (toolbar button for `mode=flat`) |
| «Экран» | "Device" (toolbar button for `mode=device`) |
| «↻ Анимации» | "↻ Replay" |
| «Замечаний» | "Issues" (issue-count label, e.g. `Issues: 3`) |

"Device" applies only to the toolbar button; everywhere else "экран" is translated as "screen". The word "замечание(я)" (a contract-check finding) is translated as "issue(s)" throughout. "Список потерь" is translated as "loss list".

## Russian strings in the runtime

Every Cyrillic string inside the `<script>` of `template.html` (kit 0.4.0, script lines 642–1002): 56 strings on 53 lines. The left cell gives the template line and the string body without its JS quote characters. `${…}` placeholders are kept verbatim. Guillemets «» become curly quotes “” so the English needs no escaping in any JS string literal. `\|` on line 874 is the Markdown table escape for `|`.

| Russian (template.html line) | Proposed English |
|---|---|
| L787 `варианты hover/focus/breakpoint не существуют в приложении` | `hover/focus/breakpoint variants don't exist in the app` |
| L788 `CSS grid нет в React Native — строки из flex-row` | `React Native has no CSS grid — use rows of flex-row` |
| L789 `sticky/fixed нет — прибитый блок это сосед data-scroll` | `no sticky/fixed — a pinned block is a sibling of data-scroll` |
| L790 `классы анимаций не переносятся — data-anim и motion sheet` | `animation classes don't carry over — use data-anim and the motion sheet` |
| L791 `space-*/divide-* нет — gap и Separator` | `no space-*/divide-* — use gap and Separator` |
| L792 `фильтры и backdrop не переносятся` | `filters and backdrop don't carry over` |
| L793 `высота/ширина экрана — через flex-1` | `screen height/width — use flex-1` |
| L794 `display кроме flex/hidden нет` | `no display values other than flex/hidden` |
| L795 `веб-только свойство` | `web-only property` |
| L796 `голый rounded = 16px; укажи шаг: rounded-sm/md/lg/xl/2xl` | `bare rounded = 16px; pick a step: rounded-sm/md/lg/xl/2xl` |
| L810 `пересобери по таблице из скилла или назови в списке потерь` | `rebuild it using the table in the skill or name it in the loss list` |
| L818 `в motion sheet только @keyframes, лишнее правило: ${rule.cssText.slice(0, 40)}` | `only @keyframes belong in the motion sheet; extra rule: ${rule.cssText.slice(0, 40)}` |
| L822 `${at}: имя совпадает со словом CSS-анимации — переименуй` | `${at}: the name matches a CSS animation keyword — rename it` |
| L830 `${at}: «${prop}» в приложении не анимируется — ${REBUILD}` | `${at}: “${prop}” can't be animated in the app — ${REBUILD}` |
| L832 `${at}: calc() нельзя — готовые числа` | `${at}: calc() is not allowed — use final numbers` |
| L835 `${at}: цвет в «${prop}» — только токеном: var(--accent) или color-mix(in oklab, var(--accent) 50%, transparent)` | `${at}: color in “${prop}” must be a token: var(--accent) or color-mix(in oklab, var(--accent) 50%, transparent)` |
| L842 `${at}: transform: none нельзя — напиши нули: translateY(0) scale(1)` | `${at}: transform: none is not allowed — write zeros: translateY(0) scale(1)` |
| L845 `${at}: transform «${fn}» не поддерживается` | `${at}: transform “${fn}” is not supported` |
| L847 `${at}: кадры пишут разные функции transform («${order}» и «${fns.join(" ")}») — нужны одни и те же в одном порядке` | `${at}: frames use different transform functions (“${order}” and “${fns.join(" ")}”) — use the same ones in the same order` |
| L853 `${at}: нет кадра ${name} — начало и конец пишутся явно` | `${at}: missing frame ${name} — the start and end frames must be written explicitly` |
| L855 `${at}: в кадре ${name} нет «${missing.join(", ")}» — каждое свойство должно быть и в первом, и в последнем кадре` | `${at}: frame ${name} is missing “${missing.join(", ")}” — every property must appear in both the first and the last frame` |
| L874 `data-route обязателен: ${ROUTES.join(" \| ")}` | `data-route is required: ${ROUTES.join(" \| ")}` |
| L878 `inline style запрещён — только классы и токены` | `inline style is forbidden — classes and tokens only` |
| L882 `класс «${c}»: ${hit[1]}` | `class “${c}”: ${hit[1]}` |
| L883 `цвет «${c}» — не токен` | `color “${c}” is not a token` |
| L885 `неизвестный data-hero="${n.dataset.hero}"` | `unknown data-hero="${n.dataset.hero}"` |
| L886 `Button без data-size (sm 40 · md 48 · lg 56)` | `Button without data-size (sm 40 · md 48 · lg 56)` |
| L887 `data-decor вне словаря: ${DECOR.join(", ")}` | `data-decor is outside the vocabulary: ${DECOR.join(", ")}` |
| L888 `data-gradient вне словаря: ${GRADIENTS.join(", ")}` | `data-gradient is outside the vocabulary: ${GRADIENTS.join(", ")}` |
| L889 `data-motion вне словаря: ${MOTION.join(", ")}` | `data-motion is outside the vocabulary: ${MOTION.join(", ")}` |
| L892 `data-anim: var() нельзя — разверни переменную в значение` | `data-anim: var() is not allowed — expand the variable into its value` |
| L899 `data-anim: @keyframes «${name \|\| part}» нет в <style data-motion-sheet>` | `data-anim: @keyframes “${name \|\| part}” is not in <style data-motion-sheet>` |
| L901 `data-anim «${name}»: нужна длительность` | `data-anim “${name}”: a duration is required` |
| L904 `data-anim «${name}»: браузер не понял запись «${part}»` | `data-anim “${name}”: the browser could not parse “${part}”` |
| L906 `data-anim «${name}»: появление с задержкой без both — до старта элемент будет виден` | `data-anim “${name}”: delayed entrance without both — the element will be visible before it starts` |
| L907 `data-anim «${name}»: кадры читают ${v}, а в data-vars элемента его нет` | `data-anim “${name}”: the frames read ${v}, but the element's data-vars doesn't set it` |
| L910 `data-vars: только числа — "--dx: -150px; --r: 360deg"` | `data-vars: numbers only — "--dx: -150px; --r: 360deg"` |
| L911 `data-tint: только у data-decor="glow" внутри data-illustration, hex из шести знаков` | `data-tint: only on data-decor="glow" inside data-illustration, as a six-digit hex` |
| L912 `data-anim на куске строки не работает — анимируй блок текста целиком` | `data-anim on part of a line doesn't work — animate the whole text block` |
| L913 `data-anim-on: только "view"` | `data-anim-on: only "view"` |
| L914 `data-anim-on без data-anim / data-motion` | `data-anim-on without data-anim / data-motion` |
| L915 `inline <svg> запрещён — <i data-icon> или <img data-asset>` | `inline <svg> is forbidden — use <i data-icon> or <img data-asset>` |
| L918 `иконка «${n.dataset.icon}» без цвета (text-<token>)` | `icon “${n.dataset.icon}” has no color (text-<token>)` |
| L921 `<img> без data-asset / data-bind` | `<img> without data-asset / data-bind` |
| L922 `<img> без явного размера` | `<img> without an explicit size` |
| L926 `размер текста без leading-* — высота строки будет разной в браузере и в приложении` | `text size without leading-* — the line height will differ between the browser and the app` |
| L929 `текст вне <p>/<span> — в React Native это ошибка` | `text outside <p>/<span> — this is an error in React Native` |
| L944 `состояние «${st}»: ${endless} бесконечных анимаций — больше 60 телефону тяжело, сократи частицы` | `state “${st}”: ${endless} infinite animations — more than 60 is heavy for the phone, cut particles` |
| L955 `Замечаний: ${issues.length}` | `Issues: ${issues.length}` |
| L955 `Контракт: ок` | `Contract: ok` |
| L958 `<div>Замечаний нет.</div>` | `<div>No issues.</div>` |
| L969 `Экран` (button `data-set="mode=device"`) | `Device` |
| L969 `Развёрнуто` (button `data-set="mode=flat"`) | `Expanded` |
| L970 `Проиграть анимации заново` (`title` of the replay button) | `Replay animations` |
| L970 `↻ Анимации` | `↻ Replay` |
| L993 `иконки «${name}» нет в @gravity-ui/icons` | `icon “${name}” is not in @gravity-ui/icons` |
