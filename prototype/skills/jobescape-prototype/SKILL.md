---
name: jobescape-prototype
description: Build clickable HTML Prototypes of jobescape features for designers, in the format developers port into code and prd-writer reads. Use when a designer asks to design, prototype or mock up a screen, flow or feature for the jobescape web app (frontend-alpha, desktop or mobile web) or the iOS app (jobescape-app, "for the app", "for iOS", "mobile app version"); when they ask for the iOS version of an existing web Prototype; when they ask to fix, extend or check an existing Prototype (.web.html / .ios.html, "contract", "badge"); or when they want to hand one off. Also triggers on Russian requests: «сделай макет / прототип», «для приложения», «для мобилки», «для mobile», «для iOS», «мобильную iOS версию», «версию для React Native», «сделай для mobile после веб-прототипа», «поправь app-HTML». Not for production code or Figma.
---

# Jobescape Prototype

A Prototype is one folder per feature: a Web file, an iOS file, or both, plus their shared `assets/`. Each file is a copy of a Platform template. It is the designer's preview, the developer's spec and prd-writer's input at once, so everything in it follows the kit's rules.

## Steps

1. **Pick the Platform.** Web = the jobescape web app (frontend-alpha), desktop and mobile web: rules in [references/web.md](references/web.md). iOS = the jobescape mobile app (React Native): rules in [references/ios.md](references/ios.md). "For the app", "for iOS", "mobile app version" mean iOS; "mobile web" or "responsive" means Web. If a request names neither, ask.
2. **Read the rules** before writing any markup: [references/shared.md](references/shared.md) in full, then the Platform's file in full.
3. **Set up the folder.** Copy [templates/web.html](templates/web.html) to `<feature>/<feature>.web.html` and/or [templates/ios.html](templates/ios.html) to `<feature>/<feature>.ios.html`. Images go in `<feature>/assets/`. Leave the KIT block as shipped.
4. **Build the Screens** as `<section data-screen>` blocks with their States, actions, data marks and motion, following the rules. Keep the HANDOFF NOTES at the top of `<body>` current as you go.
5. **Check.** Open the file (or run headless Chrome with `--dump-dom`) until the contract badge is green (`data-contract-issues="0"`), and look at every Screen × State in Light and Dark at every width of the Platform. If you can't open a browser, say so in the first line and ask the designer to open the file and send the badge's list.
6. **Hand off.** Zip the folder and tell the designer what's in the handoff notes: Custom components, HeroUI Pro needs, Screens not designed yet, animation losses, open questions.

## Examples

[examples/challenges/](examples/challenges/) — the Challenges feature on iOS: a list and details, several States, a sheet, carried-over animations.

## Kit version

The KIT block of every Prototype says which kit built it. When a file's KIT block is older than the template's, replace the whole block (from `KIT:BEGIN` to `KIT:END`) with the one in the current template; nothing below it changes.
