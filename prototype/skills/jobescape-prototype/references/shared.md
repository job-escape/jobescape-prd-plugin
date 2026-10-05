# Shared rules — both Platforms

These rules hold in every Platform file. The Platform rules ([web.md](web.md), [ios.md](ios.md)) add what differs inside a Screen.

## The Prototype folder

One folder per feature. Each Platform file is a copy of its template; both share `assets/`.

```
challenges/
├── challenges.web.html    copy of templates/web.html
├── challenges.ios.html    copy of templates/ios.html
└── assets/                images both files use
```

- Name the files `<feature>.web.html` and `<feature>.ios.html`. The Platform switch in the toolbar finds the sibling by that name; with another name it can't switch.
- A feature may have only one Platform file. The other one is made later, as its own design: the iOS version of a Screen can differ completely from the web one.
- Everything between `KIT:BEGIN` and `KIT:END` stays as shipped. The design goes below it.

## Screens and States

One Screen is one `<section data-screen>`. Everything inside it is the design, carried into code element for element.

| Attribute | Value |
|---|---|
| `data-screen` | Screen name, lowercase kebab-case: `challenge-details` |
| `data-states` | the Screen's State names, space-separated: `default loading empty error`. Without it the Screen has one State, `default` |

- `data-when="in-progress"` on any element: shown only in that State (several names, space-separated).
- `data-unless="in-progress"`: shown in every State except that one.
- Different text per State: two sibling tags, each with `data-when`.
- A sheet, dialog or toast that is open is its own State of the Screen.
- **Scenario:** when several Screens use the same State name (`not-joined`, `finished`), that name is one situation of the user across the feature. Use the same name on every Screen it applies to; Flow keeps it when moving between Screens.
- A process of several steps on one Screen (lesson, quiz, onboarding) is one Screen with one State per step. A block that differs between steps is repeated with `data-when`; in code it becomes one component with a condition.
- When other data turns a Screen into a different one (the last day becomes the final with a certificate), that is a separate Screen. If it wasn't asked for, don't build it; list it under "Not designed yet".
- The example data is the Scenario the feature shows by default.

A Screen that loads data from the server needs a `loading` State (Skeleton, not a spinner) and an `error` State. An `empty` State only where a list can be empty. A Screen that shows something already known (a congratulation, a result) needs none of them. Hover and focus are not drawn.

## Actions: `data-press`

Anything the user taps carries `data-press="verb:target"`. In Flow the kit follows it.

| `data-press` | Meaning | In Flow |
|---|---|---|
| `push:challenge-details` | open a Screen | goes there, keeping the current State if that Screen has it |
| `back` | return | goes to the previous Screen and State |
| `close` | close a sheet, dialog or the whole flow | returns to where it was opened from |
| `open:sheet:leaderboard` | open an overlay | switches to the State `leaderboard` (or `leaderboard-open`) |
| `tab:challenges` | go to a Navigation section | goes to the Screen of that section |
| `action:join` | do something | switches to the State `join` if the Screen has one |
| `action:complete-day>day-complete` | do it, then open a Screen | goes to `day-complete` |
| `filter:7-days`, `select:option-a` | pick an option | switches to that State if the Screen has one |
| `link:https://…` | external link | shows the address |

A target that isn't designed is allowed: Flow says "not part of this prototype", and the target goes under "Not designed yet" in the handoff notes. A disabled control has `data-disabled` and no `data-press`.

## Data: `data-bind` and `data-list`

- Text or an image that comes from the server: `data-bind="course.title"`. Otherwise the example ends up in code as a constant. Name fields by meaning: `course.title`, `day.number`, `user.streak`; the developer matches the real fields.
- A dynamic piece inside a fixed phrase is a nested `<span data-bind="…">`. A server string with line breaks or highlights is one tag with `data-bind`; describe the highlighting rule in an HTML comment next to it.
- Something that comes with the data but isn't text or an image (which icon a day has, how many progress segments) goes in a comment next to the element.
- A list: a container with `data-list="lessons"` holding 2–3 real examples, one of them with the longest text. Inside a list, `data-bind` is written from the item: `data-list="lesson.steps"` → `data-bind="step.title"`.
- A list laid out in columns also gets `data-columns="2"`.
- Text that depends on a number ("1 day" / "2 days") is one example plus `<!-- plural -->` next to it.
- Strings are translated into ten languages and can be half as long again. Use `<br>` only for a deliberate break; don't fit blocks to the length of the English phrase.

## Components

Every primitive comes from the Platform's UI library: HeroUI on Web, HeroUI Native on iOS. A primitive is written by name, with its props as attributes:

```html
<button data-hero="Button" data-variant="primary" data-size="md" data-press="action:join">
  <span data-slot="label">Join now</span>
</button>
```

- `data-hero` is the component name, `data-variant` / `data-size` / `data-color` and other `data-*` are its props, `data-slot` marks its parts. In code this is `<Button variant="primary" size="md">` on both Platforms.
- `class` adds to or overrides the component's look, like `className` in code.
- Never rebuild a library primitive from blocks: no hand-made buttons, chips, inputs, switches or tabs.
- **Custom component:** when the library has nothing like it (a challenge card, a leaderboard row, a carousel), compose it from primitives, layout and tokens and mark its root `data-custom="challenge-card"`. List it under "Custom components" in the handoff notes with one line on what it does.
- **HeroUI Pro:** the kit has only the free libraries. When the design needs something HeroUI Pro provides (stepper, timeline, segment, KPI, item card), build it as a Custom component and add `data-pro="Stepper"`; list it under "Needs HeroUI Pro".
- A tappable block that is not a primitive (a card, a row, a round icon button) is a `div` or `button` with `data-press`.

## Colours: tokens only

- Colours, shadows and radii come from the theme tokens: `bg-surface`, `text-muted`, `border-border`, `shadow-surface`. Tailwind's palette (`bg-blue-500`, `text-zinc-500`, `bg-white`) doesn't exist in these files and renders nothing.
- Hex, `rgb()`, `oklch()` in classes, `style="…"` and inline `<svg>` are contract errors.
- Opacity is a modifier: `bg-accent/5`, `text-accent-foreground/80`. `border-transparent` is allowed.
- White on a coloured background is `text-accent-foreground` (light in both themes). An inverse tile is `bg-foreground` with `text-background`.
- A wrong answer in learning Screens is `warning`, not `danger`.
- Brand colours outside the theme (Claude orange, medal gold) live only inside a `data-illustration` block, where bracket colours are allowed: `bg-[#D97757]`. Such a block looks the same in light and dark, so pick a background that reads in both.

## Icons and images

- An icon is `<i data-icon="name" class="size-4 text-muted"></i>`, named from `@gravity-ui/icons` (gravity-ui.com/icons): the kebab-case of the component name, `ArrowRightFromSquare` → `arrow-right-from-square`. Size with `size-*`, colour with a `text-*` token.
- An icon Gravity doesn't have, a picture, a photo or a logo is a file in `assets/`: `<img data-asset="cover.png" src="assets/cover.png" class="…">` with an explicit size (`size-9`, `h-[130px] w-[250px]`, `w-full aspect-[3/2]`). An image from the server also has `data-bind="course.image"`.
- No text inside images.
- Draw directional icons (arrows, chevrons) for left-to-right languages; code mirrors them.

## Motion

Animations are part of the design and are written the same way on both Platforms; the Platform rules say which properties the app can play.

When carrying a design over from a source (an older prototype, the other Platform's file), carry **every** animation: entrances and their order, on-scroll entrances, loops (float, pulse, shine, wobble, particles), delays, durations and curves. The source of truth is what actually plays on screen, not the stylesheet: a rule that matches nothing or is overridden doesn't count. List all of them first (element, keyframes, duration, curve, delay, repeats), then carry them over one by one. A quirk of the source (a ring standing still until its delay) is carried as is and mentioned to the designer.

**1. The motion sheet.** One `<style data-motion-sheet>` right after the KIT block, holding only `@keyframes`. Take names from the source; don't name an animation with a CSS keyword (`ease`, `both`, `normal`, `infinite`, `linear`). Colours in frames are tokens: `var(--accent)` or `color-mix(in oklab, var(--accent) 50%, transparent)`.

**2. `data-anim` on the element** is a plain CSS `animation` list: name, duration, curve, delay, iteration count or `infinite`, direction, `both`. Several animations are comma-separated (an entrance, then a loop):

```html
<i data-icon="crown-diamond" class="size-[26px] text-accent-foreground"
   data-anim="rise 600ms cubic-bezier(0.22, 1, 0.36, 1) 850ms both, bob 2.4s ease-in-out 1.5s infinite"></i>
```

- An entrance always has `both`, or the element is visible before its delay.
- Curves: `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`, `cubic-bezier(…)`, `steps(…)`. Write values, not `var()`.
- Stagger is a different delay on each sibling. In a `data-list`, give the examples their delays and write the formula in a comment: `<!-- delay: 700ms + i × 80ms -->`.
- Two animations of the same property on one element don't add up. When both are needed (fly in and spin), put one on an outer block and the other on an inner one.
- Text animates as a block: `data-anim` goes on the whole `<p>` / heading.
- Per-element numbers for shared keyframes go in `data-vars` (numbers only, px / deg / %): `data-vars="--dx: -150px; --dy: -90px"`, read in the keyframes as `var(--dx)`.

**3. When it starts.** By default when the Screen opens. A block below the fold that appears on scroll gets `data-anim-on="view"`.

**4. What not to write.** Press feedback, screen transitions and the fade-in of a whole Screen are the app's job. Draw directional animations for left-to-right languages; code mirrors them.

Anything that can't be carried over goes under "Animation losses" in the handoff notes.

## Handoff notes

Every Platform file starts its `<body>` with this comment. The agent keeps it current; prd-writer and the developer read it first. Write `- none` under an empty heading.

```html
<!-- HANDOFF NOTES
Custom components:
- challenge-card — cover, title, day progress; tapping opens challenge-details
Needs HeroUI Pro:
- Stepper — the registration steps
Not designed yet:
- lesson — opened by "Continue day N"
Animation losses:
- none
Open questions:
- Should the leaderboard reset monthly or weekly?
-->
```

The contract checks that every `data-custom` and `data-pro` is listed, and every undesigned `data-press` target is under "Not designed yet".

## Preview and contract

Open the file in a browser. The toolbar on top:

- **Gallery** (default) shows every Screen × State side by side; **Open in Flow** on any one opens it at real size. **Flow** is clickable through `data-press`, with Screen and State pickers.
- **Web · Web mobile · iOS** switches Platform on the current Screen: the sibling file opens on the same Screen and State.
- **Light / Dark**, **Device / Expanded** (Expanded shows the whole scroll at once), **↻ Replay** plays animations again.
- The badge on the right is the contract: green "Contract: ok", or yellow with the list of issues. Fix every issue.

The same settings go in the address: `#view=flow&theme=dark&device=mobile&screen=challenge-details&state=in-progress`; `&only=screen:state` shows one frame in the Gallery; `&t=600` freezes every animation at 600 ms for a screenshot.

Without a browser window: run headless Chrome with `--dump-dom`; the `<html>` tag must carry `data-contract-issues="0"`. Icon names are checked over the network and may arrive late; check them separately. With no browser and no headless Chrome, don't claim the file was checked: say so in the first line and ask the designer to open it and send you the badge's list.

The green badge checks only what a machine can check; it doesn't replace these rules.

## Before handoff

- The badge is green. The one exception: on iOS, primitives the kit doesn't render yet (see [ios.md](ios.md)) stay listed as "unknown data-hero"; nothing else may.
- Every Screen × State has been looked at in Light and Dark, at every width of the Platform.
- Every action has `data-press`, everything dynamic has `data-bind`.
- Every animation is carried over or listed under "Animation losses".
- The handoff notes are current.
- The folder (Platform files and `assets/`) is zipped and sent.
