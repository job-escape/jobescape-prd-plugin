import fs from 'fs';
import path from 'path';
import { listDirs, dirFiles, readSrc, topLevelBlocks, analyzeBody, REACT, BEM_RE } from './lib.mjs';
import { loadTv, analyzeCss, BEM } from './css.mjs';

const tv = await loadTv();
const css = analyzeCss(tv);
const dirs = listDirs();

// ---------- dir -> variants name ----------
const camel = s => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const VAR_OVERRIDE = { 'list-box': 'listboxVariants', 'list-box-item': 'listboxItemVariants', 'list-box-section': 'listboxSectionVariants', 'input-otp': 'inputOTPVariants', textarea: 'textAreaVariants', textfield: 'textFieldVariants' };
const variantsName = d => VAR_OVERRIDE[d] ?? camel(d) + 'Variants';
const PASCAL_OVERRIDE = { textfield: 'TextField', textarea: 'TextArea', 'input-otp': 'InputOTP' };
const pascal = d => PASCAL_OVERRIDE[d] ?? d.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join('');

// ---------- function index over all React files ----------
const fnIndex = new Map(); // name -> [{dir,file,text}]
for (const d of dirs) for (const f of dirFiles(d)) { if (f === 'index.js') continue; for (const b of topLevelBlocks(readSrc(d, f))) { if (!fnIndex.has(b.name)) fnIndex.set(b.name, []); fnIndex.get(b.name).push({ dir: d, file: f, text: b.text }); } }
const lookupFn = (name, dir) => { const c = fnIndex.get(name); if (!c) return null; return c.find(x => x.dir === dir) ?? c[0]; };

// ---------- parse index.js ----------
function parseIndex(d) {
  const src = readSrc(d, 'index.js');
  const out = { parts: {}, mainExport: null, exports: [] };
  const mAssign = /const (\w+) = Object\.assign\(([\w$]+),\s*\{([\s\S]*?)\}\);/.exec(src);
  const exportsM = [...src.matchAll(/export \{([^}]*)\}/g)].flatMap(m => m[1].split(',').map(s => s.trim().split(/\s+as\s+/).pop()).filter(Boolean));
  out.exports = exportsM;
  if (mAssign) {
    out.mainExport = mAssign[1]; out.rootFn = mAssign[2];
    for (const line of mAssign[3].split(/,\s*\n?/).map(s => s.trim()).filter(Boolean)) {
      const m = /^(\w+)(?::\s*(\w+))?$/.exec(line); if (m) out.parts[m[1]] = m[2] ?? m[1];
    }
  } else {
    const mObj = /const (\w+) = \{([\s\S]*?)\};/.exec(src);
    if (mObj && /Trigger/.test(mObj[2])) { out.mainExport = mObj[1]; for (const line of mObj[2].split(/,\s*\n?/).map(s => s.trim()).filter(Boolean)) { const m = /^(\w+)(?::\s*(\w+))?$/.exec(line); if (m) out.parts[m[1]] = m[2] ?? m[1]; } }
    else { const mAl = /const (\w+) = (\w+);/.exec(src); if (mAl) { out.mainExport = mAl[1]; out.rootFn = mAl[2]; } }
  }
  if (!out.mainExport) { const guess = exportsM.find(n => n.toLowerCase() === d.replace(/-/g, '')) ; out.mainExport = guess ?? pascal(d); }
  return out;
}

// ---------- tv helpers ----------
function tvInfo(v) {
  const slots = v.slots && Object.keys(v.slots).length ? v.slots : null;
  const baseClass = slots ? (slots.base ?? slots.root ?? slots.item ?? slots.toast ?? null) : (v.base ?? null);
  const allClassStrs = []; const collect = o => { if (typeof o === 'string') allClassStrs.push(...o.split(/\s+/).filter(Boolean)); else if (o && typeof o === 'object') Object.values(o).forEach(collect); };
  collect(v.base); collect(v.slots);
  const owned = new Set(allClassStrs.map(c => BEM.exec(c)?.groups.block).filter(Boolean));
  return { slots, baseClass, owned, allClassStrs };
}
const hasCssRule = c => css.rawClasses.has(c);
const slotKeyOfClass = (info, cls) => { if (!info.slots) return cls === info.baseClass ? 'base' : null; const e = Object.entries(info.slots).find(([, v]) => v === cls); return e ? e[0] : null; };

// ---------- resolve part -> BEM class ----------
function resolvePart(fnName, dir, depth = 0) {
  const fn = lookupFn(fnName, dir);
  if (!fn) return { unresolved: true, reason: 'no fn' };
  const a = analyzeBody(fn.text);
  const vname = variantsName(fn.dir); const v = tv[vname]; const info = v ? tvInfo(v) : null;
  const res = { text: fn.text, fn: fnName, dir: fn.dir, file: fn.file, tag: [...new Set(a.dom)][0] ?? null, rac: null, dataSlots: [...new Set(a.dataSlots)], slotKeys: [], classes: [] };
  const keys = [...new Set([...a.slotKeys, ...a.variantSlotAccess])].filter(k => info?.slots && k in info.slots);
  if (keys.length) { res.slotKeys = keys; res.classes = keys.map(k => info.slots[k]); res.class = info.slots[keys[0]]; return res; }
  // non-slot tv: uses variants() directly
  if (info && !info.slots && a.variantCalls.includes(vname)) { res.class = info.baseClass; res.slotKeys = ['base']; res.classes = [info.baseClass]; return res; }
  // delegate to other component fn
  if (depth < 3) { for (const t of a.jsxTargets) { const base = t.split('.')[0]; if (base !== fnName && fnIndex.has(base) && /^[A-Z]/.test(base) && !/Context$/.test(base) && !/^(Icon|Info|Success|Warning|Danger|Close|External)/.test(base)) { const sub = resolvePart(base, fn.dir, depth + 1); if (!sub.unresolved && sub.class) { return { ...res, class: sub.class, slotKeys: sub.slotKeys, classes: sub.classes, reuses: base, reusesDir: sub.dir }; } } } }
  res.unresolved = true; return res;
}

// ---------- main ----------
const SKIP = {
  rac: 'Barrel that re-exports react-aria-components primitives; no HeroUI CSS block or React component of its own.',
};
const out = { components: {}, skipped: {}, diag: {} };
const claimedBlocks = new Set();
const dirResults = {};
for (const d of dirs) {
  if (SKIP[d]) { out.skipped[d] = SKIP[d]; continue; }
  const vname = variantsName(d); const v = tv[vname];
  const idx = parseIndex(d);
  const res = { dir: d, variantsName: v ? vname : null, idx };
  if (v) {
    const info = tvInfo(v); res.info = info;
    // block
    let block = info.baseClass;
    if (!block) { const counts = {}; for (const b of info.owned) counts[b] = 1; block = [...info.owned][0]; }
    res.block = block;
    res.extraBlocks = [...info.owned].filter(b => b !== block);
    [...info.owned].forEach(b => claimedBlocks.add(b));
  }
  dirResults[d] = res;
}
export { dirResults, tv, css, dirs, fnIndex, resolvePart, parseIndex, tvInfo, variantsName, hasCssRule, claimedBlocks, pascal, lookupFn, SKIP, slotKeyOfClass };
