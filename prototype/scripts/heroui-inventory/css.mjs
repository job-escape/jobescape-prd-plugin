import { readCss, postcss, splitTop, compounds, parseCompound, STYLES } from './lib.mjs';
import { pathToFileURL } from 'url';

export const BEM = /^(?<block>[a-z0-9]+(?:-[a-z0-9]+)*)(?:__(?<el>[a-z0-9]+(?:[-_][a-z0-9]+)*))?(?:--(?<mod>[a-z0-9]+(?:-[a-z0-9]+)*))?$/;
export const GLOBAL_ATTRS = new Set(['data-reduce-motion', 'data-theme', 'data-vibrant-palette', 'dir']);

export async function loadTv() {
  const m = await import(pathToFileURL(STYLES + '/index.js').href);
  const tv = {};
  for (const [n, v] of Object.entries(m)) if (n.endsWith('Variants')) tv[n] = v;
  return tv;
}

function classStrings(o, out = []) {
  if (typeof o === 'string') out.push(...o.split(/\s+/).filter(Boolean));
  else if (Array.isArray(o)) o.forEach(x => classStrings(x, out));
  else if (o && typeof o === 'object') Object.values(o).forEach(x => classStrings(x, out));
  return out;
}
export function tvClassSet(tv) {
  const s = new Set();
  for (const v of Object.values(tv)) for (const part of [v.base, v.slots, v.variants, v.compoundVariants, v.compoundSlots]) classStrings(part, [...[]]).forEach(c => s.add(c));
  return s;
}

export function analyzeCss(tv) {
  const css = readCss();
  const root = postcss.parse(css);
  const tvSet = tvClassSet(tv);
  // pass 1: collect raw class names
  const rawClasses = new Set(); const escaped = new Set();
  root.walkRules(r => { if (r.parent?.type === 'atrule' && /keyframes/.test(r.parent.name)) return; for (const sel of splitTop(r.selector)) for (const m of sel.matchAll(/\.((?:[\w-]|\\.)+)/g)) (m[1].includes('\\') ? escaped : rawClasses).add(m[1]); });
  const bemClasses = [...rawClasses].filter(c => BEM.test(c));
  const blocksDerived = new Set(bemClasses.map(c => BEM.exec(c).groups).filter(g => g.el || g.mod).map(g => g.block));
  const plainInTv = new Set([...tvSet].filter(c => BEM.test(c) && !c.includes('__') && !c.includes('--')));
  const blocks = new Set([...blocksDerived, ...[...rawClasses].filter(c => plainInTv.has(c))]);
  const nonBem = [...rawClasses].filter(c => !BEM.test(c) || (!c.includes('__') && !c.includes('--') && !blocks.has(c))).sort();
  const isBemClass = c => BEM.test(c) && blocks.has(BEM.exec(c).groups.block);

  const per = new Map(); // block -> info
  const get = b => { if (!per.has(b)) per.set(b, { classes: new Set(), attrs: new Map(), otherAttrs: new Set(), dataSlots: new Set(), vars: new Set() }); return per.get(b); };
  const globalAttrs = new Map();
  const addAttr = (map, name, val) => { if (!map.has(name)) map.set(name, new Set()); if (val !== null && val !== undefined) map.get(name).add(val); };
  // custom properties
  const declared = new Set(), read = new Map(); // var -> Set(blocks)
  root.walkDecls(d => { if (d.prop.startsWith('--')) declared.add(d.prop); });
  // @property declarations also count
  root.walkAtRules('property', a => declared.add(a.params.trim()));

  const directBlocks = (c) => (!c.includes('\\') && isBemClass(c)) ? BEM.exec(c).groups.block : null;
  const blocksOf = (p, acc = new Set()) => { p.classes.forEach(c => { const b = directBlocks(c); if (b) acc.add(b); }); p.inner.forEach(i => splitTop(i.arg).forEach(s2 => compounds(s2).map(parseCompound).forEach(q => blocksOf(q, acc)))); return acc; };
  const assignAttr = (a, owners) => {
    if (GLOBAL_ATTRS.has(a.name)) { addAttr(globalAttrs, a.name, a.value); return; }
    if (!owners.size) { addAttr(globalAttrs, a.name + '(unowned)', a.value); return; }
    for (const b of owners) {
      const info = get(b);
      if (a.name === 'data-slot') { if (a.value !== null) info.dataSlots.add(a.value); }
      else if (/^(data|aria)-/.test(a.name)) addAttr(info.attrs, a.name, a.value);
      else info.otherAttrs.add(a.value !== null ? `${a.name}${a.op}${a.value}` : a.name);
    }
  };
  const processSelector = (sel, fallback) => {
    const comps = compounds(sel).map(parseCompound);
    const own = comps.map(p => blocksOf(p));
    comps.forEach((p, idx) => {
      let owners = own[idx];
      if (!owners.size) { for (let k = idx - 1; k >= 0 && !owners.size; k--) owners = own[k]; }
      if (!owners.size) { for (let k = idx + 1; k < comps.length && !owners.size; k++) owners = own[k]; }
      if (!owners.size) owners = fallback;
      p.attrs.forEach(a => assignAttr(a, owners));
      p.inner.forEach(i => splitTop(i.arg).forEach(s2 => processSelector(s2, owners)));
    });
  };
  root.walkRules(r => {
    if (r.parent?.type === 'atrule' && /keyframes/.test(r.parent.name)) return;
    for (const sel of splitTop(r.selector)) {
      const comps = compounds(sel).map(parseCompound);
      const flatClasses = [];
      const collect = (p) => { p.classes.forEach(c => flatClasses.push(c)); p.inner.forEach(i => splitTop(i.arg).forEach(s2 => compounds(s2).map(parseCompound).forEach(collect))); };
      comps.forEach(collect);
      flatClasses.filter(c => directBlocks(c)).forEach(c => get(directBlocks(c)).classes.add(c));
      processSelector(sel, new Set());
    }
    r.walkDecls(d => { for (const m of d.value.matchAll(/var\((--[\w-]+)/g)) { const v = m[1]; if (!read.has(v)) read.set(v, new Set()); const sel = r.selector; for (const c of [...sel.matchAll(/\.((?:[\w-]|\\.)+)/g)].map(x => x[1]).filter(c => !c.includes('\\') && isBemClass(c))) read.get(v).add(BEM.exec(c).groups.block); } });
  });
  const undeclared = [...read.keys()].filter(v => !declared.has(v) && !v.startsWith('--tw-'));
  for (const v of undeclared) for (const b of read.get(v)) get(b).vars.add(v);
  return { per, blocks, nonBem, globalAttrs, undeclared, escapedCount: escaped.size, isBemClass, rawClasses };
}
