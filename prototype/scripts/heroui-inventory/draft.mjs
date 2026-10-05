import fs from 'fs';
import { dirResults, tv, css, dirs, fnIndex, resolvePart, hasCssRule, pascal, lookupFn, SKIP } from './gen_core.mjs';
import { readSrc, dirFiles, analyzeBody } from './lib.mjs';
import { BEM } from './css.mjs';

const PART_OVERRIDES = {
  'Badge.Anchor': ['badge-anchor', 'Hardcoded cx("badge-anchor") in React; block listed as extraBlock'],
  'Pagination.NextIcon': [null, 'span[data-slot=pagination-next-icon][aria-hidden=true], no BEM class; default child is the chevron-right svg'],
  'Pagination.PreviousIcon': [null, 'span[data-slot=pagination-previous-icon][aria-hidden=true], no BEM class; default child is the chevron-left svg'],
  'Popover.Arrow': [null, 'No BEM class; CSS targets [data-slot=popover-overlay-arrow] (svg) and [data-slot=popover-overlay-arrow-group] wrapper'],
  'Tooltip.Arrow': [null, 'No BEM class; CSS targets [data-slot=overlay-arrow] (svg) inside [data-slot=tooltip-arrow] wrapper'],
  'Table.ResizableContainer': ['table__resizable-container', 'Hardcoded cx("table__resizable-container") in React (not a tv slot-driven call)'],
  'Table.Collection': [null, 'RAC Collection: no DOM'],
  'Autocomplete.Filter': [null, 'RAC Autocomplete wrapper: no own DOM, renders children only'],
  'Dropdown.SubmenuTrigger': [null, 'RAC SubmenuTrigger: no own DOM'],
  'ListBox.Item': ['list-box-item', 'Delegates to ListBoxItem component (block list-box-item)'],
  'ListBox.Section': ['list-box-section', 'Delegates to ListBoxSection component (block list-box-section)'],
  'Menu.Item': ['menu-item', 'Delegates to MenuItem component (block menu-item)'],
  'Menu.Section': ['menu-section', 'Delegates to MenuSection component (block menu-section)'],
  'Toast.Queue': [null, 'Non-DOM API (ToastQueue class)'],
  'Toast.toast': [null, 'Non-DOM API (imperative toast() helper)'],
  'Breadcrumbs.Item': ['breadcrumbs__item', 'Renders li.breadcrumbs__item containing a.breadcrumbs__link plus a separator span.breadcrumbs__separator (chevron svg) unless last item'],
  'Table.SortableColumnHeader': ['table__sortable-column-header', 'Also renders indicator table__sortable-column-indicator (chevron-up svg)'],
};

function ownDataSlot(text, slotKey) {
  const slots = [...text.matchAll(/"data-slot":\s*"([^"]+)"/g)].map(m => ({ v: m[1], i: m.index }));
  if (!slots.length) return null; if (slots.length === 1) return slots[0].v;
  const ref = slotKey ? text.search(new RegExp('[sS]lots\\??\\.' + slotKey + '\\b')) : -1;
  if (ref < 0) return slots[0].v;
  // nearest literal that follows the slot reference inside the same props object (className precedes data-slot)
  const after = slots.filter(s => s.i >= ref).sort((a, b) => a.i - b.i)[0];
  return (after ?? slots.sort((a, b) => Math.abs(a.i - ref) - Math.abs(b.i - ref))[0]).v;
}
const DATASLOT_FIX = {
  'Table.SortableColumnHeader': ['table-sortable-column-header', ['table-sortable-column-indicator']],
  'Calendar.NavButton': ['calendar-nav-button', ['calendar-nav-button-icon']],
  'RangeCalendar.NavButton': ['range-calendar-nav-button', ['range-calendar-nav-button-icon']],
};
const GLOBAL_PREFIX = [];
const out = { components: {}, skipped: {}, diag: { unresolvedParts: [], multiSlotParts: [], partsNotInCss: [], inert: [], cssOnly: [] } };
const claimed = new Set();
const exportName = (d, r) => {
  const norm = d.replace(/-/g, '');
  const ex = r.idx.exports.find(n => n.toLowerCase() === norm);
  return ex ?? pascal(d);
};
function boolish(keys) { return keys.length && keys.every(k => k === 'true' || k === 'false'); }

for (const d of dirs) {
  if (SKIP[d]) { out.skipped[d] = SKIP[d]; continue; }
  const r = dirResults[d]; const v = r.variantsName ? tv[r.variantsName] : null; const info = r.info;
  const name = exportName(d, r);
  const comp = {};
  comp.block = r.block ?? null;
  if (r.extraBlocks?.length) comp.extraBlocks = r.extraBlocks;
  // props / modifiers
  const props = {}, modifierFor = {}, inert = {};
  const baseSlotClass = info?.baseClass;
  if (v) {
    for (const [prop, vals] of Object.entries(v.variants ?? {})) {
      const keys = Object.keys(vals);
      const isBool = boolish(keys) || (keys.length === 1 && keys[0] === 'true');
      props[prop] = isBool ? [true, false] : keys;
      modifierFor[prop] = {};
      const allKeys = isBool ? ['true', 'false'] : keys;
      for (const key of allKeys) {
        const val = vals[key];
        const targets = {}; // class(element) -> modifier class list
        const addCls = (slotCls, clsStr) => { for (const c of String(clsStr).split(/\s+/).filter(Boolean)) { if (!hasCssRule(c)) { (inert[`${prop}.${key}`] ??= []).push(c); continue; } (targets[slotCls] ??= []).push(c); } };
        if (val === undefined || val === '' ) { /* nothing */ }
        else if (typeof val === 'string') addCls(baseSlotClass, val);
        else if (val && typeof val === 'object') for (const [slotKey, cls] of Object.entries(val)) addCls(info.slots?.[slotKey] ?? (slotKey === 'base' ? baseSlotClass : slotKey), cls);
        const tk = Object.keys(targets);
        if (!tk.length) modifierFor[prop][key] = null;
        else if (tk.length === 1 && tk[0] === baseSlotClass) modifierFor[prop][key] = targets[tk[0]].join(' ');
        else modifierFor[prop][key] = Object.fromEntries(tk.map(k => [k, targets[k].join(' ')]));
      }
    }
  }
  // JS root defaults (literal defaults in the Root param destructuring)
  const rootFnName = r.idx.rootFn; const rootFn = rootFnName ? lookupFn(rootFnName, d) : null;
  const jsDefaults = {};
  if (rootFn) {
    const head = rootFn.text.split(/\}\)\s*=>|\)\s*=>/)[0];
    for (const m of head.matchAll(/(\w+) = ("[^"]*"|true|false|-?\d+(?:\.\d+)?)(?=,|\n|\s*\})/g)) jsDefaults[m[1]] = JSON.parse(m[2]);
  }
  // attribute-driven props without a tv variant (CSS keyed on data-orientation)
  const orient = css.per.get(r.block)?.attrs.get('data-orientation');
  const attrProps = {};
  if (orient && !props.orientation && rootFn && /\borientation\b/.test(rootFn.text)) { props.orientation = [...orient].sort(); modifierFor.orientation = null; attrProps.orientation = { attr: 'data-orientation', values: [...orient].sort() }; }
  comp.props = props;
  comp.defaults = { ...(v?.defaultVariants ?? {}) };
  const rootDefaults = {};
  for (const [k, val] of Object.entries(jsDefaults)) { if (k in props && !(k in comp.defaults)) comp.defaults[k] = val; else if (!(k in props)) rootDefaults[k] = val; }
  if (Object.keys(rootDefaults).length) comp.rootDefaults = rootDefaults;
  if (Object.keys(attrProps).length) comp.attrProps = attrProps;
  comp.modifierFor = modifierFor;
  // slot classes
  if (info?.slots) comp.slotClasses = info.slots; 
  if (Object.keys(inert).length) { comp.inertClasses = inert; out.diag.inert.push([name, inert]); }
  // parts
  const parts = {}, partDetails = {};
  for (const [pn, fnName] of Object.entries(r.idx.parts)) {
    if (pn === 'Root') continue;
    const ov = PART_OVERRIDES[`${name}.${pn}`];
    if (ov) { parts[pn] = ov[0]; partDetails[pn] = { fn: fnName, why: ov[1] }; const pr0 = resolvePart(fnName, d); if (pr0.tag) partDetails[pn].tag = pr0.tag; if (pr0.dataSlots?.length) partDetails[pn].dataSlot = pr0.dataSlots[0]; continue; }
    const pr = resolvePart(fnName, d);
    if (pr.unresolved || !pr.class) { parts[pn] = null; out.diag.unresolvedParts.push(`${name}.${pn} (${fnName})`); partDetails[pn] = { fn: fnName }; continue; }
    parts[pn] = pr.class;
    partDetails[pn] = { fn: fnName };
    if (pr.tag) partDetails[pn].tag = pr.tag;
    if (pr.dataSlots.length) partDetails[pn].dataSlot = ownDataSlot(pr.text, pr.slotKeys[0]);
    if (pr.reuses) partDetails[pn].reuses = pr.reuses;
    if (pr.slotKeys.length > 1) { partDetails[pn].otherSlots = pr.slotKeys.slice(1); out.diag.multiSlotParts.push(`${name}.${pn}: ${pr.slotKeys.join(',')}`); }
    const extraDs = [...new Set(pr.dataSlots)].filter(x => x !== partDetails[pn].dataSlot);
    if (extraDs.length) partDetails[pn].innerDataSlots = extraDs;
  }
  for (const [k, [ds, inner]] of Object.entries(DATASLOT_FIX)) { const [cn, pn] = k.split('.'); if (cn === name && partDetails[pn]) { partDetails[pn].dataSlot = ds; partDetails[pn].innerDataSlots = inner; } }
  comp.parts = parts;
  // elements from CSS
  const owned = [r.block, ...(r.extraBlocks ?? [])].filter(Boolean);
  const els = new Set(), mods = new Set(), attrs = new Map(), other = new Set(), dss = new Set(), vars = new Set();
  const tvStrs = new Set(info?.allClassStrs ?? []); 
  for (const b of owned) {
    const pi = css.per.get(b); if (!pi) continue;
    for (const c of pi.classes) { const g = BEM.exec(c).groups; if (g.el) els.add(`${g.block}__${g.el}`); if (g.mod) mods.add(c); }
    for (const [k, vs] of pi.attrs) { if (!attrs.has(k)) attrs.set(k, new Set()); vs.forEach(x => attrs.get(k).add(x)); }
    pi.otherAttrs.forEach(x => other.add(x)); pi.dataSlots.forEach(x => dss.add(x)); pi.vars.forEach(x => vars.add(x));
  }
  comp.elements = [...els].sort();
  comp.stateAttrs = [...attrs.keys()].sort();
  const sav = {}; for (const k of [...attrs.keys()].sort()) { const vs = [...attrs.get(k)].sort(); if (vs.length) sav[k] = vs; }
  comp.stateAttrValues = sav;
  if (other.size) comp.otherAttrSelectors = [...other].sort();
  if (dss.size) comp.cssDataSlots = [...dss].sort();
  if (vars.size) comp.runtimeCssVars = [...vars].sort();
  // css-only classes (in CSS for this block, never produced by tv)
  const jsSrc = dirFiles(d).map(f => readSrc(d, f)).join('\n');
  const cssOnly = [];
  for (const b of owned) { const pi = css.per.get(b); if (!pi) continue; for (const c of pi.classes) { if (tvStrs.has(c)) continue; if (![...(info?.allClassStrs ?? [])].includes(c)) { const inVariants = JSON.stringify(v?.variants ?? {}).includes(`"${c}"`) ; if (!inVariants) cssOnly.push({ class: c, reactLiteral: jsSrc.includes(c) }); } } }
  if (cssOnly.length) { comp.cssOnlyClasses = cssOnly.sort((a,b)=>a.class.localeCompare(b.class)); out.diag.cssOnly.push([name, cssOnly]); }
  // check part classes exist in CSS
  for (const [pn, cls] of Object.entries(parts)) if (cls && !cls.split(/\s+/).every(c => css.rawClasses.has(c))) out.diag.partsNotInCss.push(`${name}.${pn}: ${cls}`);
  comp.reactDir = d;
  comp.partDetails = partDetails;
  out.components[name] = comp;
}
fs.writeFileSync('draft.json', JSON.stringify(out, null, 1));
console.log('components', Object.keys(out.components).length);
console.log('UNRESOLVED parts', out.diag.unresolvedParts.length, '\n', out.diag.unresolvedParts.join('\n'));
console.log('MULTI-slot parts', out.diag.multiSlotParts.length, '\n', out.diag.multiSlotParts.join('\n'));
console.log('parts class not in CSS', out.diag.partsNotInCss.join('\n'));
console.log('css-only classes', JSON.stringify(out.diag.cssOnly));
