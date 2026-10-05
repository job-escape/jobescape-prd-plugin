#!/usr/bin/env node
/* Assembles the Platform templates from prototype/kit, so the shared runtime is
   byte-identical in both, and upgrades the KIT block of existing Prototype files.

     node prototype/scripts/build.mjs                    write templates/web.html and templates/ios.html
     node prototype/scripts/build.mjs --only ios         one Platform
     node prototype/scripts/build.mjs --upgrade <file>   replace the file's KIT block with the current kit
                                      [--platform web|ios]  (default: from <feature>.web.html / .ios.html) */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const kitDir = path.join(root, "kit");
const templates = path.join(root, "skills/jobescape-prototype/templates");
const readKit = file => fs.readFileSync(path.join(kitDir, file), "utf8").trimEnd();
const read = file => (file === "web/platform.js" ? readKit(file).replace("/*{{HEROUI}}*/ {}", () => JSON.stringify(heroMap())) : readKit(file));

/* HeroUI web inventory (scripts/heroui-web-inventory.json, generated from
   @heroui/styles and @heroui/react) → the compact map the web kit reads:
   { Name: { b: block, m: { attribute: { value: class | null } }, e: { slot: class }, s: [state attrs] } } */
const inventoryPath = path.join(root, "scripts/heroui-web-inventory.json");
const inventory = fs.existsSync(inventoryPath) ? JSON.parse(fs.readFileSync(inventoryPath, "utf8")) : { components: {} };
const kebab = s => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase();
const attrOf = prop => kebab(prop.replace(/^is(?=[A-Z])/, ""));
function heroMap() {
  const map = {};
  for (const [name, c] of Object.entries(inventory.components || {})) {
    const m = {};
    for (const [prop, values] of Object.entries(c.props || {})) {
      if (!Array.isArray(values) || !values.length) continue;
      const classes = (c.modifierFor || {})[prop] || {};
      m[attrOf(prop)] = Object.fromEntries(values.map(v => [String(v).replace(/\s+/g, "-"), classes[String(v)] ?? null]));
    }
    for (const [prop, classes] of Object.entries(c.modifierFor || {})) {
      m[attrOf(prop)] ||= Object.fromEntries(Object.entries(classes).map(([v, cls]) => [v.replace(/\s+/g, "-"), cls ?? null]));
    }
    if (!c.block) continue; // Form: no CSS of its own
    const e = {};
    for (const cls of c.elements || []) e[cls.split("__").slice(1).join("__")] = cls;
    for (const [part, cls] of Object.entries(c.parts || {})) if (cls) e[kebab(part)] = cls;
    const d = {};
    for (const [prop, value] of Object.entries(c.defaults || {})) if (value !== null && value !== false && m[attrOf(prop)]) d[attrOf(prop)] = String(value);
    const t = {};
    for (const [prop, byValue] of Object.entries(c.modifierTargets || {})) t[attrOf(prop)] = byValue;
    const field = /class="label"|\(class label|class=label/.test(c.notes || "");
    map[name] = { b: c.block, m, e, d, t, s: c.stateAttrs || [], ...(field ? { f: 1 } : {}) };
  }
  return map;
}
/* What the web kit's FIXUPS (kit/web/platform.js) build for a component, in author terms. */
const KIT_NOTES = {
  Accordion: "Items are `data-slot=\"item\"` (add `data-expanded` to open one) holding a `trigger` and a `panel`; the kit adds the heading, chevron and panel body.",
  Alert: "`data-status`: default, accent, success, warning, danger. The kit adds the status icon; content goes in `content` with `title` and `description`.",
  AlertDialog: "Same shape as Modal: `backdrop` > `container` > `dialog`.",
  Avatar: "Put a `fallback` (initials) or an `<img data-slot=\"image\">` inside; `data-color` tints the fallback.",
  Button: "Text goes straight inside (or in `data-slot=\"label\"`); `data-disabled` disables it.",
  Checkbox: "`data-selected` checks it; the label is `data-slot=\"label\"`. The kit builds the box and tick.",
  CloseButton: "Leave it empty: the kit adds the cross.",
  Drawer: "Same shape as Modal; `data-placement`: bottom (default), top, left, right.",
  Meter: "`data-value` (0–100) sets the fill; optional `label` and `output` slots.",
  Modal: "`backdrop` > `container` > `dialog` holding `header` (`heading`), `body`, `footer`. Show it as a State; the kit centres it on desktop and docks it to the bottom on mobile.",
  ProgressBar: "`data-value` (0–100) sets the fill; optional `label` and `output` slots. Leave out `data-value` for an indeterminate bar.",
  Radio: "`data-selected` selects it; the label is `data-slot=\"label\"`.",
  Select: "A `label`, then a `<button data-slot=\"trigger\">` holding `data-slot=\"value\"`; the kit adds the chevron. An open list is a State with a Popover.",
  Spinner: "Leave it empty: the kit adds the spinner.",
  Switch: "`data-selected` turns it on; the label is `data-slot=\"label\"`.",
  Tabs: "A `list` of `trigger`s; `data-selected` on the current one. The kit adds the container and indicator.",
  TextField: "A `label`, an `<input data-hero=\"Input\">` (or TextArea), then `description` or `error`; `data-invalid` on both for an error.",
  Toast: "Show it as a State. `data-variant` picks the colour and icon; `data-placement` defaults to top-end; `content` holds `title` and `description`.",
};
function componentsReference() {
  const rows = Object.entries(heroMap()).sort(([a], [b]) => a.localeCompare(b)).map(([name, c]) => {
    const props = Object.entries(c.m).map(([attr, values]) => `\`data-${attr}\`: ${Object.keys(values).join(" · ")}`).join("<br>");
    const parts = Object.keys(c.e).map(s => `\`${s}\``).join(" ");
    return `| \`${name}\` | ${props || "—"} | ${parts || "—"} | ${KIT_NOTES[name] || ""} |`;
  });
  return [
    "# HeroUI web components",
    "",
    `Every component the Web kit renders, from HeroUI ${inventory.version || "3.2.1"}. Generated by \`prototype/scripts/build.mjs\`; don't edit by hand.`,
    "",
    "Write a component as `data-hero=\"<Name>\"`, a prop as `data-<prop>=\"<value>\"` (a boolean prop with no value, like `data-icon-only`), a part as `data-slot=\"<part>\"`. Labels, descriptions and errors inside form components are `data-slot=\"label\"`, `\"description\"`, `\"error\"`. A state the component shows in React (`data-selected`, `data-disabled`, `data-invalid`, `data-expanded`) is written as a bare attribute.",
    "",
    "Components without a kit note get HeroUI's classes only. Anything React would position or compute at runtime for them (a popover's position, a slider's thumb) is placed with Tailwind classes; if it still doesn't look right in the Gallery, list it under \"Open questions\".",
    "",
    "| Component | Props | Parts (`data-slot`) | Kit note |",
    "|---|---|---|---|",
    ...rows,
    "",
  ].join("\n");
}
const { version } = JSON.parse(fs.readFileSync(path.join(root, ".claude-plugin/plugin.json"), "utf8"));

const TAILWIND = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.3.1";
const HEROUI = "https://cdn.jsdelivr.net/npm/@heroui/styles@3.2.1/dist/heroui.min.css";
const FONTS = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400..700&family=Instrument+Serif&display=swap";

function kit(platform) {
  const head = {
    ios: () => [
      `<script src="${TAILWIND}"></script>`,
      `<style type="text/tailwindcss" data-kit>\n${read("ios/theme.css")}\n</style>`,
      `<style data-kit>\n${read("runtime.css")}\n${read("ios/chrome.css")}\n</style>`,
    ],
    web: () => [
      `<link rel="preconnect" href="https://fonts.googleapis.com">`,
      `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
      `<link rel="stylesheet" href="${FONTS}">`,
      `<link rel="stylesheet" crossorigin="anonymous" data-heroui href="${HEROUI}">`,
      `<script src="${TAILWIND}"></script>`,
      `<style type="text/tailwindcss" data-kit>\n${read("web/theme.css")}\n</style>`,
      `<style data-kit>\n${read("runtime.css")}\n${read("web/chrome.css")}\n</style>`,
    ],
  }[platform]();
  return [
    `<!-- ╔═ KIT:BEGIN ═══ Jobescape prototype kit ${version} · ${platform} ═══════════════════════════════`,
    `     Generated by prototype/scripts/build.mjs and copied verbatim into every`,
    `     Prototype. Do not edit by hand; the design goes below the kit. -->`,
    ...head,
    `<script>\n${read(`${platform}/platform.js`)}\n</script>`,
    `<script>\n${read("runtime.js")}\n</script>`,
    `<!-- ╚═ KIT:END ═══════════════════════════════════════════════════════════════════════ -->`,
  ].join("\n");
}

const args = process.argv.slice(2);
const flag = name => {
  const i = args.indexOf(name);
  return i < 0 ? null : args[i + 1];
};
const KIT_BLOCK = /<!-- ╔═ KIT:BEGIN[\s\S]*?KIT:END[^\n]*-->/;

if (flag("--upgrade")) {
  const file = path.resolve(flag("--upgrade"));
  const platform = flag("--platform") || (file.match(/\.(web|ios)\.html$/) || [])[1];
  if (!platform) throw new Error("Pass --platform web|ios, or name the file <feature>.web.html / <feature>.ios.html");
  const html = fs.readFileSync(file, "utf8");
  if (!KIT_BLOCK.test(html)) throw new Error(`${file}: no KIT:BEGIN … KIT:END block`);
  fs.writeFileSync(file, html.replace(KIT_BLOCK, () => kit(platform)));
  console.log(`upgraded ${path.relative(process.cwd(), file)} to kit ${version} (${platform})`);
} else {
  fs.mkdirSync(templates, { recursive: true });
  for (const platform of flag("--only") ? [flag("--only")] : ["web", "ios"]) {
    const page = read(`${platform}/page.html`).replace("{{KIT}}", () => kit(platform)) + "\n";
    fs.writeFileSync(path.join(templates, `${platform}.html`), page);
    console.log(`templates/${platform}.html  ${page.length} bytes`);
  }
  if (Object.keys(inventory.components || {}).length) {
    fs.writeFileSync(path.join(root, "skills/jobescape-prototype/references/web-components.md"), componentsReference());
    console.log(`references/web-components.md  ${Object.keys(inventory.components).length} components`);
  }
}
