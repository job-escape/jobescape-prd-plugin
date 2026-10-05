import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
export const NM = (process.env.FRONTEND_ALPHA || '/Users/nursakn/Documents/Nurlan/Work/job-escape/jobescape-workspace/frontend-alpha') + '/node_modules';
export const REACT = NM + '/@heroui/react/dist/components';
export const STYLES = NM + '/@heroui/styles/dist';
const require = createRequire(NM + '/');
export const postcss = require('postcss');

export function readCss() { return fs.readFileSync(STYLES + '/heroui.min.css', 'utf8'); }

// split selector list at top-level commas
export function splitTop(str, sep = ',') {
  const out = []; let depth = 0, cur = '', q = null;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (q) { cur += c; if (c === q && str[i-1] !== '\\') q = null; continue; }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === '(' || c === '[') depth++;
    if (c === ')' || c === ']') depth--;
    if (c === sep && depth === 0) { out.push(cur); cur = ''; } else cur += c;
  }
  if (cur.trim()) out.push(cur);
  return out.map(s => s.trim());
}

// split a complex selector into compounds with combinators
export function compounds(sel) {
  const out = []; let depth = 0, cur = '', q = null;
  const push = () => { if (cur.trim()) out.push(cur.trim()); cur = ''; };
  for (let i = 0; i < sel.length; i++) {
    const c = sel[i];
    if (q) { cur += c; if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === '(' || c === '[') depth++;
    if (c === ')' || c === ']') depth--;
    if (depth === 0 && (c === ' ' || c === '>' || c === '+' || c === '~')) { push(); continue; }
    cur += c;
  }
  push();
  return out;
}

export const BEM_RE = /^(?<block>[a-z0-9]+(?:-[a-z0-9]+)*)(?:__(?<el>[a-z0-9]+(?:-[a-z0-9]+)*))?(?:--(?<mod>[a-z0-9]+(?:-[a-z0-9]+)*))?$/;

// Parse a compound selector into {classes, attrs:[{name,op,value}], pseudoInner:[selectorListString]}
export function parseCompound(c) {
  const res = { classes: [], attrs: [], inner: [], tag: null };
  let i = 0;
  while (i < c.length) {
    const ch = c[i];
    if (ch === '.') {
      let j = i + 1; let name = '';
      while (j < c.length && (/[\w-]/.test(c[j]) || c[j] === '\\')) { if (c[j] === '\\') { name += c[j] + c[j+1]; j += 2; } else { name += c[j]; j++; } }
      res.classes.push(name); i = j;
    } else if (ch === '[') {
      let depth = 1, j = i + 1; let q = null;
      while (j < c.length && depth > 0) { if (q) { if (c[j] === q) q = null; } else if (c[j] === '"' || c[j] === "'") q = c[j]; else if (c[j] === '[') depth++; else if (c[j] === ']') depth--; j++; }
      const inner = c.slice(i + 1, j - 1);
      const m = /^\s*([\w:-]+)\s*(?:([~|^$*]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\s\]]+))\s*(?:[is])?)?\s*$/.exec(inner);
      if (m) res.attrs.push({ name: m[1], op: m[2] || null, value: m[3] ?? m[4] ?? m[5] ?? null });
      else res.attrs.push({ name: inner, op: '?', value: null });
      i = j;
    } else if (ch === ':') {
      let j = i + 1; if (c[j] === ':') j++;
      let name = ''; while (j < c.length && /[\w-]/.test(c[j])) { name += c[j]; j++; }
      let arg = null;
      if (c[j] === '(') { let depth = 1, k = j + 1; while (k < c.length && depth > 0) { if (c[k] === '(') depth++; else if (c[k] === ')') depth--; k++; } arg = c.slice(j + 1, k - 1); j = k; }
      if (arg !== null && ['is', 'where', 'not', 'has', 'matches', 'any'].includes(name)) res.inner.push({ pseudo: name, arg });
      i = j;
    } else if (/[\w*]/.test(ch)) { let j = i; while (j < c.length && /[\w*-]/.test(c[j])) j++; res.tag = c.slice(i, j); i = j; }
    else i++;
  }
  return res;
}

// ---- React source analysis ----
export function listDirs() { return fs.readdirSync(REACT, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort(); }
export function dirFiles(d) { return fs.readdirSync(path.join(REACT, d)).filter(f => f.endsWith('.js')); }
export function readSrc(d, f) { return fs.readFileSync(path.join(REACT, d, f), 'utf8'); }

// split a compiled js file into top-level const/function blocks
export function topLevelBlocks(src) {
  const lines = src.split('\n'); const blocks = []; let cur = null;
  for (const line of lines) {
    const m = /^(?:const|function|let|var) (\w+)\b/.exec(line);
    if (m) { cur = { name: m[1], text: line + '\n' }; blocks.push(cur); }
    else if (/^export \{/.test(line)) { cur = null; }
    else if (cur) cur.text += line + '\n';
  }
  return blocks;
}

export function analyzeBody(text) {
  const out = {};
  out.dom = [...text.matchAll(/\bdom\.(\w+)/g)].map(m => m[1]);
  out.jsxTargets = [...text.matchAll(/jsx[s]?\(([\w$.]+)\s*,/g)].map(m => m[1]);
  out.dataSlots = [...text.matchAll(/"data-slot":\s*("([^"]+)"|[^,\n]+)/g)].map(m => m[2] ?? m[1]);
  out.slotKeys = [...new Set([...text.matchAll(/[sS]lots\??\.(\w+)/g)].map(m => m[1]))];
  out.variantCalls = [...text.matchAll(/(\w+Variants)\(/g)].map(m => m[1]);
  out.variantSlotAccess = [...text.matchAll(/\w+Variants\([^)]*\)\??\.(\w+)/g)].map(m => m[1]);
  out.styles = [...text.matchAll(/\bstyle\b\s*[:=]\s*([^\n]{0,140})/g)].map(m => m[1].trim());
  out.dataAttrs = [...new Set([...text.matchAll(/"(data-(?!slot)[\w-]+)"/g)].map(m => m[1]))];
  out.ariaAttrs = [...new Set([...text.matchAll(/"(aria-[\w-]+)"/g)].map(m => m[1]))];
  out.setProp = [...text.matchAll(/(setProperty|setAttribute|dataset|classList|\.style\.)[^\n]{0,80}/g)].map(m => m[0]);
  out.jsxCount = (text.match(/\bjsxs?\(/g) || []).length;
  return out;
}
