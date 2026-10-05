import fs from 'fs';
import path from 'path';
import { listDirs, REACT, STYLES, NM } from './lib.mjs';
import { loadTv, analyzeCss, BEM, tvClassSet } from './css.mjs';

const OUT = process.argv[2] ?? 'inventory.json';
const draft = JSON.parse(fs.readFileSync('draft.json', 'utf8'));
const tv = await loadTv(); const css = analyzeCss(tv);

// ---- merge agent notes ----
const notes = {};
for (const g of ['A', 'B', 'C', 'D', 'E']) { const f = `notes_${g}.json`; if (fs.existsSync(f)) Object.assign(notes, JSON.parse(fs.readFileSync(f, 'utf8'))); }
const manual = fs.existsSync('manual_overrides.json') ? JSON.parse(fs.readFileSync('manual_overrides.json', 'utf8')) : {};


// ---------- modifier helpers ----------
const STATE_PROPS = new Set(['isSelected', 'isDisabled', 'isInvalid', 'isIndeterminate', 'disabled', 'isPending', 'isEmpty', 'visible', 'isYearPickerOpen']);
const CASCADE = [
  { comp: 'TextField', prop: 'variant', children: [['inputVariants', 'variant'], ['textAreaVariants', 'variant'], ['inputGroupVariants', 'variant']], via: 'TextFieldContext' },
  { comp: 'ComboBox', prop: 'variant', children: [['inputVariants', 'variant']], via: 'ComboBoxContext' },
  { comp: 'ButtonGroup', prop: 'size', children: [['buttonVariants', 'size']], via: 'ButtonGroupContext (direct-child Buttons only)' },
  { comp: 'ButtonGroup', prop: 'variant', children: [['buttonVariants', 'variant']], via: 'ButtonGroupContext (direct-child Buttons only)' },
  { comp: 'ButtonGroup', prop: 'fullWidth', children: [['buttonVariants', 'fullWidth']], via: 'ButtonGroupContext (direct-child Buttons only)' },
  { comp: 'TagGroup', prop: 'size', children: [['tagVariants', 'size']], via: 'TagGroupContext' },
  { comp: 'TagGroup', prop: 'variant', children: [['tagVariants', 'variant']], via: 'TagGroupContext' },
  { comp: 'ToggleButtonGroup', prop: 'size', children: [['toggleButtonVariants', 'size']], via: 'ToggleButtonGroupContext' },
  { comp: 'CheckboxGroup', prop: 'variant', children: [['checkboxVariants', 'variant']], via: 'CheckboxGroupContext' },
];
function childTargets(tvName, prop, key) {
  const v = tv[tvName]; if (!v) return { err: 'no tv ' + tvName };
  const slots = v.slots && Object.keys(v.slots).length ? v.slots : null;
  const baseCls = slots ? (slots.base ?? slots.root ?? slots.item ?? slots.toast) : v.base;
  const val = v.variants?.[prop]?.[key];
  const out = {};
  const add = (el, str) => { for (const cl of String(str).split(/\s+/).filter(Boolean)) if (css.rawClasses.has(cl)) (out[el] ??= []).push(cl); };
  if (typeof val === 'string' && val) add(baseCls, val);
  else if (val && typeof val === 'object') for (const [sk, cl] of Object.entries(val)) add(slots?.[sk] ?? baseCls, cl);
  return { baseCls, targets: Object.fromEntries(Object.entries(out).map(([k, a]) => [k, a.join(' ')])) };
}

const ORDER = ['block', 'blockNote', 'extraBlocks', 'props', 'attrProps', 'propTargets', 'cascadedProps', 'defaults', 'rootDefaults', 'modifierFor', 'modifierTargets', 'inertClasses', 'inertSlotClasses', 'slotClasses', 'parts', 'partDetails', 'elements', 'cssOnlyClasses', 'stateAttrs', 'stateAttrValues', 'otherAttrSelectors', 'cssDataSlots', 'runtimeCssVars', 'notes', 'openQuestions', 'reactDir'];
const components = {};
const warnings = [];
for (const name of Object.keys(draft.components).sort((a, b) => a.localeCompare(b))) {
  const c = JSON.parse(JSON.stringify(draft.components[name]));
  for (const pd of Object.values(c.partDetails ?? {})) delete pd.fn;
  const n = notes[name] ?? {};
  const m = manual[name] ?? {};
  if (n.propTargets) c.propTargets = n.propTargets;
  if (n.attrProps) c.attrProps = { ...(c.attrProps ?? {}), ...n.attrProps };
  // 1) split object-valued modifierFor: modifierFor = classes on the ROOT element (string|null), modifierTargets = complete element->class map
  const modifierTargets = {};
  for (const [pn, byVal] of Object.entries(c.modifierFor)) {
    if (!byVal) continue;
    for (const [val, x] of Object.entries(byVal)) {
      if (x && typeof x === 'object') { (modifierTargets[pn] ??= {})[val] = x; byVal[val] = x[c.block] ?? null; }
    }
  }
  // 2) attribute-driven DESIGN props (orientation, placement, ...). Generic state props stay in attrProps/stateAttrs only.
  for (const [pn, ap] of Object.entries(c.attrProps ?? {})) {
    if (STATE_PROPS.has(pn)) continue;
    if (!Array.isArray(ap.values)) continue;
    if (!(pn in c.props)) c.props[pn] = ap.values;
    if (!(pn in c.modifierFor)) c.modifierFor[pn] = null;
    if (ap.default !== null && ap.default !== undefined && !(pn in c.defaults)) c.defaults[pn] = ap.default;
  }
  // 3) design props that cascade from this wrapper to child components through React context
  const cascadedProps = {};
  for (const cs of CASCADE.filter(x => x.comp === name)) {
    const [t0, p0] = cs.children[0];
    const childVals = Object.keys(tv[t0].variants[p0]);
    const isBool = childVals.every(k => k === 'true' || k === 'false') || (childVals.length === 1 && childVals[0] === 'true');
    const keys = isBool ? ['true', 'false'] : childVals;
    if (!(cs.prop in c.props)) c.props[cs.prop] = isBool ? [true, false] : keys;
    const dflt = tv[t0].defaultVariants?.[cs.prop];
    if (dflt !== undefined && !(cs.prop in c.defaults)) c.defaults[cs.prop] = dflt;
    if (!c.modifierFor[cs.prop]) c.modifierFor[cs.prop] = {};
    for (const key of keys) {
      const merged = { ...(modifierTargets[cs.prop]?.[key] ?? {}) };
      if (c.modifierFor[cs.prop][key] && !(c.block in merged)) merged[c.block] = c.modifierFor[cs.prop][key];
      for (const [tn, cp] of cs.children) { const r = childTargets(tn, cp, key); if (r.err) warnings.push(r.err); else for (const [el, cl] of Object.entries(r.targets)) merged[el] = merged[el] ? merged[el] + ' ' + cl : cl; }
      if (!(key in c.modifierFor[cs.prop])) c.modifierFor[cs.prop][key] = null;
      if (Object.keys(merged).length && (Object.keys(merged).length > 1 || !(c.block in merged))) (modifierTargets[cs.prop] ??= {})[key] = merged;
    }
    cascadedProps[cs.prop] = { to: cs.children.map(([tn]) => { const b = tn.replace(/Variants$/, ''); return b[0].toUpperCase() + b.slice(1); }), via: cs.via };
  }
  if (Object.keys(modifierTargets).length) c.modifierTargets = modifierTargets;
  if (Object.keys(cascadedProps).length) c.cascadedProps = cascadedProps;
  // 4) block notes + slot classes that have no CSS rule
  if (name === 'CalendarYearPicker') c.blockNote = 'No element carries this block class: calendar-year-picker is only the prefix of its parts (trigger, year-grid, year-cell, ...), which live inside .calendar / .range-calendar.';
  if (name === 'Dropdown') c.blockNote = 'The root class .dropdown exists in CSS and as a tv slot, but Dropdown (RAC MenuTrigger) renders no DOM and React never applies it; only the dropdown__* parts appear.';
  if (c.slotClasses) { const inertSlots = Object.entries(c.slotClasses).flatMap(([k, v]) => String(v).split(/\s+/).filter(Boolean).filter(cl => !css.rawClasses.has(cl)).map(cl => cl)); if (inertSlots.length) c.inertSlotClasses = [...new Set(inertSlots)].sort(); }
  for (const [src, label] of [[n, 'agent'], [m, 'manual']]) if (src.partFixes) for (const [p, cls] of Object.entries(src.partFixes)) { if (!(p in c.parts)) warnings.push(`${label} partFix for unknown part ${name}.${p}`); else { c.parts[p] = cls; (c.partDetails[p] ??= {}).fixedBy = label; } }
  if (name === 'Popover' && c.partDetails?.Arrow) c.partDetails.Arrow.dataSlot = 'popover-overlay-arrow-group';
  if (name === 'Tooltip' && c.partDetails?.Arrow) c.partDetails.Arrow.dataSlot = 'tooltip-arrow';
  for (const pn of Object.keys(c.partDetails ?? {})) { if (c.parts[pn] === null && c.partDetails[pn].reuses) delete c.partDetails[pn].reuses; }
  c.notes = m.notes ?? n.notes ?? '';
  for (const r of m.notesReplace ?? []) { if (!c.notes.includes(r.from)) warnings.push(`notesReplace anchor not found in ${name}`); else c.notes = c.notes.replace(r.from, r.to); }
  if (n.openQuestions) c.openQuestions = n.openQuestions;
  const o = {}; for (const k of ORDER) if (c[k] !== undefined && !(Array.isArray(c[k]) && c[k].length === 0 && !['elements', 'stateAttrs'].includes(k)) ) o[k] = c[k];
  // keep empty objects for spec fields
  for (const k of ['props', 'defaults', 'modifierFor', 'parts']) if (o[k] === undefined) o[k] = c[k] ?? {};
  components[name] = Object.fromEntries(ORDER.filter(k => k in o).map(k => [k, o[k]]));
  if (!components[name].notes) warnings.push('empty notes: ' + name);
}

// ---- top-level ----
const dirs = listDirs();
const skipped = {
  rac: 'Directory is only a barrel re-exporting react-aria-components primitives (no HeroUI CSS block, no variants).',
  icons: 'Not a directory: components/icons.js + icons.d.ts export internal SVG icon components (IconChevronDown, IconSearch, CloseIcon, InfoIcon ...). They have no CSS block; React inlines them as default children (see the injected-child items in the notes of Select, Alert, Checkbox, Accordion, etc.).',
  'index.d.ts': 'Not a directory: barrel type declarations for components/.',
};
const unmappedBlocks = [];
const owned = new Set(Object.values(components).flatMap(c => [c.block, ...(c.extraBlocks ?? [])].filter(Boolean)));
for (const b of [...css.blocks].sort()) if (!owned.has(b)) unmappedBlocks.push(b);

const nonBemClasses = {
  light: 'Theme selector class (paired with [data-theme=light]); sets colour tokens, not a component.',
  dark: 'Theme selector class (paired with [data-theme=dark]); sets colour tokens, not a component.',
  default: 'Theme selector class (paired with [data-theme=default]); the default light token set.',
  container: 'Tailwind utility (responsive max-width); not HeroUI BEM.',
  grid: 'Tailwind utility (display:grid); not HeroUI BEM.',
  truncate: 'Tailwind utility (ellipsis overflow); not HeroUI BEM.',
  border: 'Tailwind utility (1px border).',
  shadow: 'Tailwind utility (box-shadow).',
  ring: 'Tailwind utility (ring).',
  outline: 'Tailwind utility (1px outline).',
  blur: 'Tailwind utility (filter blur).',
  filter: 'Tailwind utility (CSS filter composition).',
  'bg-field': 'HeroUI utility: background-color: var(--field-background, var(--default)).',
  'rounded-field': 'HeroUI utility: border-radius: var(--field-radius, calc(var(--radius) * 1.5)).',
  scrollbar: 'HeroUI utility: applies --scrollbar-width/color/gutter; driven by [data-scrollbar=thin|default|none] on an ancestor.',
};
const UNMAPPED_DETAILS = {
  'toast-top': 'Appears only inside ::view-transition-new(.toast-top) / ::view-transition-old(.toast-top) (animation rules toast-slide-top-in/out). It is a view-transition-class name, not a DOM class: @heroui/react 3.2.1 Toast sets only an inline view-transition-name: toast-<key> and never a view-transition-class, so these rules are dead unless the author sets view-transition-class: toast-top on a toast. Related component: Toast (toast-region--top*).',
  'toast-bottom': 'Appears only inside ::view-transition-new(.toast-bottom) / ::view-transition-old(.toast-bottom) (animation rules toast-slide-bottom-in/out). It is a view-transition-class name, not a DOM class: @heroui/react 3.2.1 Toast sets only an inline view-transition-name: toast-<key> and never a view-transition-class, so these rules are dead unless the author sets view-transition-class: toast-bottom on a toast. Related component: Toast (toast-region--bottom*).',
};
for (const c of css.nonBem) { if (c in UNMAPPED_DETAILS) { if (!unmappedBlocks.includes(c)) unmappedBlocks.push(c); } else if (!(c in nonBemClasses)) warnings.push('unclassified non-BEM class: ' + c); }
unmappedBlocks.sort();

const globalAttrs = {
  'data-theme': { values: ['light', 'default', 'dark'], note: 'On <html> or any ancestor (or use classes .light/.dark/.default). Token sets; required for colours to resolve outside :root defaults.' },
  'data-vibrant-palette': { values: ['true'], note: 'Ancestor flag that swaps to the vibrant palette (CSS has separate light and dark variants).' },
  'data-reduce-motion': { values: ['true'], note: 'Ancestor flag read by ~1000 selectors via :is([data-reduce-motion=true], [data-reduce-motion=true] *). Transitions/animations are applied only when it is NOT true; a static mock needs nothing.' },
  'data-scrollbar': { values: ['thin', 'default', 'none'], note: 'Ancestor flag consumed by the .scrollbar utility.' },
  dir: { values: ['rtl'], note: 'Ancestor dir=rtl flips directional rules (8 selectors).' },
};

const runtimeCssVars = {};
const SETBY = {
  '--visual-viewport-height': 'react-aria-components ModalOverlay inline style on the backdrop (px of the visual viewport; also --visual-viewport-width). Static HTML: set e.g. style="--visual-viewport-height:100vh".',
  '--trigger-width': 'react-aria-components Popover inline style (px width of the trigger element); HeroUI Autocomplete also passes it. Static HTML: set to the trigger width, e.g. style="--trigger-width:240px".',
  '--trigger-anchor-point': 'react-aria-components Popover/Tooltip inline style ("x y" px of the anchor point, used for transform-origin of the enter animation). Optional for static mocks.',
  '--disclosure-panel-height': 'react-aria useDisclosure sets it with panel.style.setProperty on the panel: "auto" when expanded, "0px" when collapsed (and hidden="until-found"); mid-animation it is the measured scrollHeight px.',
  '--table-row-level': 'react-aria-components Table (tree rows) inline style on rows.',
  '--toast-width': 'HeroUI Toast / ToastProvider inline style.',
  '--front-height': 'HeroUI Toast inline style (measured height of the frontmost toast, via useMeasuredHeight).',
  '--color-area-background': 'HeroUI ColorArea inline style (gradient background for the colour area).',
  '--color-area-thumb-color': 'HeroUI ColorArea.Thumb inline style (current colour).',
  '--track-start-color': 'HeroUI ColorSlider.Track inline style (gradient start colour).',
  '--track-end-color': 'HeroUI ColorSlider.Track inline style (gradient end colour).',
  '--color-swatch-current': 'HeroUI ColorSwatch / ColorSwatchPicker inline style (the swatch colour).',
  '--color-field-border-invalid': 'Declared nowhere in the stylesheet and set by no HeroUI/RAC source, yet read WITHOUT a fallback in the [data-invalid=true] rules of input-group, color-input-group, number-field, search-field and date-input-group, so the invalid border-colour falls back to the property initial value (currentcolor; browser result unverified). Define it yourself on :root (e.g. --color-field-border-invalid: var(--danger)) to get a red border.',
  '--default-font-feature-settings': 'Tailwind preflight reads it with a fallback; optional override hook, not set by components.',
  '--default-font-variation-settings': 'Tailwind preflight reads it with a fallback; optional override hook, not set by components.',
  '--default-mono-font-feature-settings': 'Tailwind preflight reads it with a fallback; optional override hook, not set by components.',
  '--default-mono-font-variation-settings': 'Tailwind preflight reads it with a fallback; optional override hook, not set by components.',
};
for (const v of css.undeclared) { const readBy = [...new Set([...Object.entries(components)].filter(([, c]) => (c.runtimeCssVars ?? []).includes(v)).map(([k]) => k))]; runtimeCssVars[v] = { readByComponents: readBy, setBy: SETBY[v] ?? '(not determined)' }; if (!SETBY[v]) warnings.push('no setBy for ' + v); }

const out = {
  version: '3.2.1',
  sources: {
    css: '@heroui/styles@3.2.1 dist/heroui.min.css (compiled, Tailwind 4.3.0), cross-checked against @heroui/styles dist/**/*.styles.js (tailwind-variants definitions)',
    react: '@heroui/react@3.2.1 dist/components/<dir>/*.js (+ react-aria-components / react-aria runtime sources where cited)',
  },
  _schema: {
    block: 'Root BEM class (what the root element gets). null only for Form (no HeroUI CSS). For CalendarYearPicker and Dropdown no element carries it (see blockNote).',
    blockNote: 'Present only where the `block` class is not applied to any element.',
    extraBlocks: 'Additional BEM blocks the same React component also emits (e.g. Table -> table-root + table, Toast -> toast + toast-region). `elements` can belong to an extra block: Table block is table-root but its elements are table__* (derive the element name by splitting on "__", not by slicing the block length).',
    props: 'DESIGN axis: prop -> allowed values. Sources: tailwind-variants `variants` (authoritative), attribute-driven design props (orientation, placement, hideSeparator, visibility ...; see attrProps) and design props cascaded from a wrapper to children by context (see cascadedProps). Generic runtime STATE props (isSelected, isDisabled, isInvalid, isIndeterminate, disabled, isPending, isEmpty, isYearPickerOpen) are NOT in props: they live in attrProps + stateAttrs. Boolean props are [true,false].',
    cascadedProps: 'prop -> {to: [child component names], via: React context}. These props are accepted by the wrapper, put NO class on it (unless modifierFor says so) and are forwarded to children; the child classes are listed in modifierTargets. A static author must write those child classes on every child.',
    attrProps: 'props with NO modifier class that change styling through a data attribute React sets (CSS keys on [data-...=value]); includes generic state props (those are not copied into `props`). Fields: values, default, attr (the attribute), target (elements carrying it), optional note/valueMap.',
    propTargets: 'prop -> the part/element that actually receives the prop when it is NOT the root (e.g. Modal size lives on Modal.Container), or "Root (cascades to X via context)".',
    defaults: 'tv defaultVariants merged with literal defaults in the React Root signature (e.g. Tabs orientation = "horizontal"). A prop without a default adds no class.',
    rootDefaults: 'Other literal default values in the React Root signature that are not style props.',
    modifierFor: 'prop -> value -> class(es) added to the ROOT element (the element carrying `block`): a string (space separated when several) or null. ALWAYS string|null, never an object. null = no class lands on the root: the value is the default, or the tv class has no CSS rule (see inertClasses), or the class lands on a different element (see modifierTargets), or the prop is attribute-driven (see attrProps). Boolean props use the keys "true"/"false".',
    modifierTargets: 'prop -> value -> {"<element class>": "<modifier class(es)>"}: the COMPLETE element-level mapping, present only for values where some CSS-backed class lands on an element other than the root (Modal size lg -> {"modal__dialog":"modal__dialog--lg"}) or on a cascaded child (TextField variant secondary -> {"input":"input--secondary", ...}). The key is the element class that must receive the modifier. Where the root also gets a class it is repeated here under the block key.',
    inertClasses: '"prop.value" -> class(es) that React/tv emits but for which NO rule exists in heroui.min.css (adding them is a no-op), e.g. button--md.',
    inertSlotClasses: 'Slot classes React emits (tv slots) for which NO rule exists in heroui.min.css, e.g. slider__marks, switch__icon, disclosure__heading.',
    slotClasses: 'Raw tailwind-variants slot map: slot key -> BEM class (what each slot emits). Components whose tv has no slots omit it.',
    parts: 'React compound sub-component (e.g. Card.Header) -> BEM element class it renders, or null when it renders no BEM-class element (RAC wrapper, SVG arrow styled via [data-slot], non-DOM API). Classes may be a block of another component when a part delegates (Menu.Item -> menu-item).',
    partDetails: 'Per part: tag = element React renders (dom.<tag>) when the part renders a plain element; dataSlot = the data-slot React sets (CSS sometimes keys on it); otherSlots = further slots the same part function also renders (inner wrappers); reuses = other HeroUI component the part delegates to; why = reason for manual mapping; fixedBy = correction source.',
    elements: 'Every .block__element class found in heroui.min.css for the owned blocks (modifier suffix stripped).',
    cssOnlyClasses: 'Classes that exist in the CSS but are not produced by any tv definition; reactLiteral=true means React hardcodes them outside tv (author must add by hand when the condition applies); false means React never emits them (dead/optional CSS).',
    stateAttrs: 'data-* / aria-* attribute names the CSS selects on for this block or its elements (global theme/motion flags excluded; see globalAttrs). stateAttrValues gives the literal values the selectors test; the HTML author sets those on the matching element.',
    otherAttrSelectors: 'Non data/aria attribute selectors in the CSS for this block (role=..., slot=..., type=...).',
    cssDataSlots: '[data-slot=...] values the CSS of this block selects on. React sets these on children; static HTML must set the same data-slot value on those children.',
    runtimeCssVars: 'Custom properties the CSS of this block reads but that are declared nowhere in the stylesheet (React/RAC set them inline at runtime). See top-level runtimeCssVars for who sets each.',
    notes: 'What an HTML author must add by hand that React/React Aria normally adds at runtime.',
  },
  contractWarnings: [
    'data-slot collision: HeroUI CSS itself selects on [data-slot=label] (35 rules), [data-slot=description] (20), [data-slot=field-error], [data-slot=input], [data-slot=list-box], [data-slot=separator] and 54 other values: 60 distinct data-slot values in 344 selector occurrences (see each component cssDataSlots). A design kit that uses data-slot="label" for ITS OWN child-part markup will trigger those selectors. Decide whether kit attributes are rewritten (e.g. data-hero-part) before emitting HeroUI HTML, or whether they are passed through on purpose.',
    'Some RAC state attributes (data-hovered, data-pressed, data-disabled on native controls) have pseudo-class twins (:hover, :active, :disabled) in the CSS, so they are only needed to force a state in a static mock; data-focus-visible does NOT (see next item). Attributes without a pseudo-class twin (data-selected, data-open, data-expanded, data-invalid, data-placeholder, data-orientation, data-placement, data-empty, data-pending, ...) must be written by hand to render that state.',
    'Keyboard focus rings: 36 rules use the selector `:focus-visible:not(:focus)`, which can never match natively (an element matching :focus-visible always matches :focus); the ring is only drawn through the other selector of the same rule, [data-focus-visible=true], which React Aria sets. Static HTML that wants a visible focus ring must write data-focus-visible="true" (on the element RAC sets it on: e.g. the content label for Checkbox/Radio/Switch).',
    'Overlay components (Modal, AlertDialog, Drawer, Popover, Tooltip, Select/ComboBox/Autocomplete/Dropdown popovers, Toast region) are positioned at runtime by React Aria with inline styles; the CSS only partly provides layout. See each component notes and runtimeCssVars.',
  ],
  globalAttrs,
  runtimeCssVars,
  nonBemClasses,
  components,
  skipped,
  unmappedBlocks,
  unmappedBlockDetails: Object.fromEntries(unmappedBlocks.map(b => [b, UNMAPPED_DETAILS[b] ?? ''])),
  unmappedBlocksNote: 'All other BEM blocks in heroui.min.css (87 of them) are owned by a component, either as `block` or in `extraBlocks` (secondary blocks: badge-anchor, table, toast-region, typography-prose). Only the two plain view-transition class names listed here could not be tied to a component.',
};

// ---- validations ----
const errs = [];
const compDirs = new Set(Object.values(components).map(c => c.reactDir));
for (const d of dirs) if (!compDirs.has(d) && !(d in skipped)) errs.push('dir not covered: ' + d);
for (const b of css.blocks) if (!owned.has(b) && !unmappedBlocks.includes(b)) errs.push('block uncovered: ' + b);
// every tv class appears in its component JSON
const camel = x => x.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const VAR_OVERRIDE = { 'list-box': 'listboxVariants', 'list-box-item': 'listboxItemVariants', 'list-box-section': 'listboxSectionVariants', 'input-otp': 'inputOTPVariants', textarea: 'textAreaVariants', textfield: 'textFieldVariants' };
const variantsName = d => VAR_OVERRIDE[d] ?? camel(d) + 'Variants';
const compJson = Object.fromEntries(Object.entries(components).map(([k, c]) => [k, JSON.stringify(c)]));
let tvChecked = 0;
for (const [name, c] of Object.entries(components)) {
  const v = tv[variantsName(c.reactDir)]; if (!v) continue;
  const strs = [...tvClassSet({ x: v })];
  for (const cls of strs) { tvChecked++; const re = new RegExp('(^|[^\\w-])' + cls.replace(/[-_]/g, '\\$&') + '([^\\w-]|$)'); if (!re.test(compJson[name])) errs.push(`tv class not represented: ${cls} (${name})`); }
}
console.log('tv classes checked', tvChecked);
// BEM coverage: every BEM class with a CSS rule is mentioned in the JSON of the component owning its block
for (const [b, info] of css.per) {
  const name = Object.keys(components).find(k => components[k].block === b || (components[k].extraBlocks ?? []).includes(b));
  if (!name) continue;
  for (const cls of info.classes) {
    const g = BEM.exec(cls).groups;
    const target = g.mod ? cls : (g.el ? `${g.block}__${g.el}` : cls);
    if (g.mod) { if (!compJson[name].includes(cls)) errs.push(`modifier class not represented: ${cls} (${name})`); }
    else if (g.el) { if (!components[name].elements.includes(target)) errs.push(`element not listed: ${target} (${name})`); }
  }
}
console.log('warnings:', warnings.length); warnings.forEach(w => console.log('  W', w));
console.log('errors:', errs.length); errs.forEach(e => console.log('  E', e));

// ---- compact pretty printer ----
function fmt(v, ind = 0) {
  const pad = '  '.repeat(ind);
  if (Array.isArray(v)) { if (v.every(x => x === null || typeof x !== 'object')) return JSON.stringify(v); return '[\n' + v.map(x => pad + '  ' + fmt(x, ind + 1)).join(',\n') + '\n' + pad + ']'; }
  if (v && typeof v === 'object') {
    const keys = Object.keys(v); if (!keys.length) return '{}';
    const oneLine = JSON.stringify(v);
    if (oneLine.length <= 100 && !keys.some(k => typeof v[k] === 'object' && v[k] !== null && !Array.isArray(v[k]) )) return oneLine;
    return '{\n' + keys.map(k => pad + '  ' + JSON.stringify(k) + ': ' + fmt(v[k], ind + 1)).join(',\n') + '\n' + pad + '}';
  }
  return JSON.stringify(v);
}
fs.writeFileSync(OUT, fmt(out) + '\n');
console.log('wrote', OUT, fs.statSync(OUT).size, 'bytes; components', Object.keys(components).length, 'unmapped', unmappedBlocks.length);
