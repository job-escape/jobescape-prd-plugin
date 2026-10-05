/* Jobescape prototype kit — preview runtime, shared by the Web and iOS templates.
   Builds the Gallery and Flow from the <section data-screen> sources, runs the
   contract check, and handles the Platform switch. Nothing here becomes app
   code. Platform specifics come from window.JE_PLATFORM, defined just above. */
(() => {
  const P = window.JE_PLATFORM;
  const KIT_VERSION = "1.0.0";
  const ICON_BASE = "https://cdn.jsdelivr.net/npm/@gravity-ui/icons@2.18.0/svgs/";
  const PRESS_VERBS = ["back", "close", "push", "open", "action", "filter", "select", "tab", "link"];
  const NOTE_HEADINGS = ["Custom components", "Needs HeroUI Pro", "Not designed yet", "Animation losses", "Open questions"];
  const ANIM_WORDS = ["none", "linear", "ease", "ease-in", "ease-out", "ease-in-out", "step-start", "step-end", "infinite", "normal", "reverse", "alternate", "alternate-reverse", "forwards", "backwards", "both", "running", "paused"];
  const COLOR_UTIL = /^(bg|text|border|fill|stroke|from|via|to|decoration|outline|ring|shadow|caret|accent)-/;
  const RAW_COLOR = /-\[(#|rgb|hsl|oklch|oklab|lab|lch|color-mix|var\()/;
  const PALETTE = /-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}(\/\d+)?$|-(white|black)(\/\d+)?$/;
  const HAS_SIZE = /^(size|w|h|aspect|inset|min-w|min-h|max-w|max-h)-|^flex-1$/;

  /* ── State: everything lives in the address hash (a ?query is read for old links). */
  const params = new URLSearchParams(location.search);
  new URLSearchParams(location.hash.slice(1)).forEach((v, k) => params.set(k, v));
  const S = {
    view: params.get("view") === "flow" ? "flow" : "gallery",
    theme: params.get("theme") === "dark" ? "dark" : "light",
    device: params.get("device") || params.get("w") || P.devices[0].id,
    mode: params.get("mode") === "flat" ? "flat" : "device",
    screen: params.get("screen"),
    state: params.get("state"),
    only: params.get("only"),
    t: params.get("t"),
  };
  if (!P.devices.some(d => d.id === S.device)) S.device = P.devices[0].id;
  const trail = []; // Flow history for back / close

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const words = v => (v || "").split(/\s+/).filter(Boolean);
  const esc = v => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const sources = () => [...document.querySelectorAll("section[data-screen]")];
  const screenOf = name => sources().find(s => s.dataset.screen === name);
  const statesOf = sec => (words(sec.dataset.states).length ? words(sec.dataset.states) : ["default"]);

  function writeHash() {
    const h = new URLSearchParams();
    h.set("view", S.view);
    h.set("theme", S.theme);
    h.set("device", S.device);
    if (S.mode !== "device") h.set("mode", S.mode);
    if (S.view === "flow" && S.screen) h.set("screen", S.screen);
    if (S.view === "flow" && S.state) h.set("state", S.state);
    if (S.only) h.set("only", S.only);
    if (S.t) h.set("t", S.t);
    history.replaceState(null, "", location.pathname + "#" + h);
  }

  /* ── Platform switch: <feature>.web.html ↔ <feature>.ios.html in the same folder. */
  const fileName = decodeURIComponent(location.pathname.split("/").pop() || "");
  const pair = fileName.match(/^(.*)\.(web|ios)\.html$/);
  function switchPlatform(platform, device) {
    if (platform === P.id) return set({ device });
    if (!pair) return toast("Name the files <feature>.web.html and <feature>.ios.html in one folder to switch Platforms.");
    const h = new URLSearchParams({ view: S.view, theme: S.theme });
    if (device) h.set("device", device);
    if (S.mode !== "device") h.set("mode", S.mode);
    if (S.view === "flow" && S.screen) h.set("screen", S.screen);
    if (S.view === "flow" && S.state) h.set("state", S.state);
    location.href = `${pair[1]}.${platform}.html#${h}`;
  }

  /* ── Icons: <i data-icon="name"> is painted from @gravity-ui/icons by mask. */
  const iconUrl = name => `url("${ICON_BASE}${name}.svg")`;
  const paintIcons = root => root.querySelectorAll("i[data-icon]").forEach(i => i.style.setProperty("--icon", iconUrl(i.dataset.icon)));

  /* ── Motion: data-anim is a CSS animation list over the motion sheet;
     data-anim-on="view" holds it until the element scrolls into view. */
  const inView = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.style.animationPlayState = "running";
      inView.unobserve(e.target);
    }),
    { threshold: 0.15 },
  );
  function animate(root) {
    root.querySelectorAll("[data-vars]").forEach(n =>
      n.dataset.vars.split(";").forEach(pairText => {
        const at = pairText.indexOf(":");
        if (at > 0) n.style.setProperty(pairText.slice(0, at).trim(), pairText.slice(at + 1).trim());
      }),
    );
    root.querySelectorAll("[data-motion][data-delay]").forEach(n => n.style.setProperty("--pv-delay", n.dataset.delay));
    root.querySelectorAll("[data-anim]").forEach(n => (n.style.animation = n.dataset.anim));
    root.querySelectorAll('[data-anim-on="view"]').forEach(n => {
      n.style.animationPlayState = "paused";
      inView.observe(n);
    });
  }
  /* #t=600 holds every animation at that moment, so a screenshot shows the middle of an entrance. */
  function freeze() {
    if (S.t == null) return;
    requestAnimationFrame(() => requestAnimationFrame(() => document.getAnimations().forEach(a => {
      a.pause();
      a.currentTime = Number(S.t);
    })));
  }

  /* ── One Screen × State, ready for a frame. */
  function instantiate(src, st) {
    const clone = src.cloneNode(true);
    clone.querySelectorAll("[data-when]").forEach(n => !words(n.dataset.when).includes(st) && n.remove());
    clone.querySelectorAll("[data-unless]").forEach(n => words(n.dataset.unless).includes(st) && n.remove());
    P.prepare?.(clone, src, st);
    animate(clone);
    paintIcons(clone);
    return clone;
  }

  /* ── Gallery: every Screen × State side by side. */
  function gallery() {
    const stage = el("div", "je-gallery");
    sources().forEach(src => statesOf(src).forEach(st => {
      const name = src.dataset.screen;
      if (S.only && S.only !== `${name}:${st}`) return;
      const fig = el("figure", "je-item");
      const cap = el("figcaption", "", `<span><b>${esc(name)}</b> · ${esc(st)} <i>— ${esc(P.caption(src))}</i></span>`);
      const open = el("button", "je-open", "Open in Flow →");
      open.addEventListener("click", () => { trail.length = 0; set({ view: "flow", screen: name, state: st }); });
      cap.append(open);
      fig.append(cap, P.frame(instantiate(src, st), src, st, S, "gallery"));
      stage.append(fig);
    }));
    if (!stage.childElementCount) stage.append(el("p", "je-empty", "No screens yet: add a &lt;section data-screen&gt;."));
    return stage;
  }

  /* ── Flow: one Screen × State at real size, clickable through data-press. */
  function flow() {
    const stage = el("div", "je-flow");
    const first = sources()[0];
    if (!first) return stage.append(el("p", "je-empty", "No screens yet: add a &lt;section data-screen&gt;.")), stage;
    if (S.screen && !screenOf(S.screen)) {
      const note = el("div", "je-missing", `<b>“${esc(S.screen)}” isn’t designed for ${esc(P.label)} yet.</b><span>It may exist on the other Platform.</span>`);
      const back = el("button", "je-open", "Show the Gallery");
      back.addEventListener("click", () => set({ view: "gallery", screen: null, state: null }));
      note.append(back);
      return stage.append(note), stage;
    }
    const src = screenOf(S.screen) || first;
    const st = statesOf(src).includes(S.state) ? S.state : statesOf(src)[0];
    S.screen = src.dataset.screen;
    S.state = st;
    const frame = P.frame(instantiate(src, st), src, st, S, "flow");
    frame.addEventListener("click", e => {
      const hit = e.target.closest("[data-press]");
      if (!hit || !frame.contains(hit) || hit.hasAttribute("data-disabled")) return;
      e.preventDefault();
      press(hit.dataset.press, src, st);
    });
    stage.append(frame);
    return stage;
  }

  /* data-press verbs. A target that isn't designed shows a note instead of failing. */
  function press(spec, src, st) {
    const at = spec.indexOf(":");
    const verb = at < 0 ? spec : spec.slice(0, at);
    const arg = at < 0 ? "" : spec.slice(at + 1);
    const tryState = (names, remember) => {
      const hit = names.find(n => statesOf(src).includes(n));
      if (hit && remember) trail.push({ screen: src.dataset.screen, state: st }); // close returns here
      if (hit) set({ state: hit });
      return Boolean(hit);
    };
    const go = name => {
      const target = screenOf(name);
      if (!target) return toast(`“${name}” is not part of this prototype.`);
      trail.push({ screen: src.dataset.screen, state: st });
      const keep = statesOf(target).includes(st) ? st : statesOf(target)[0]; // a shared State name is a Scenario
      set({ screen: name, state: keep });
    };
    switch (verb) {
      case "push": return go(arg);
      case "tab": {
        const target = sources().find(s => P.tabOf(s) === arg);
        return target ? go(target.dataset.screen) : toast(`The “${arg}” tab is not part of this prototype.`);
      }
      case "back":
      case "close": {
        const prev = trail.pop();
        return prev ? set(prev) : toast(verb === "back" ? "Nothing to go back to." : "Nothing to close to.");
      }
      case "open": {
        const name = arg.replace(/^(sheet|dialog|menu|popover):/, "");
        return tryState([name, `${name}-open`, `sheet-${name}`], true) || toast(`Opening “${name}” is not a State of this Screen.`);
      }
      case "filter":
      case "select":
        return tryState([arg, `${verb}-${arg}`]) || toast(`${verb}: “${arg}” has no State of its own here.`);
      case "action": {
        const [name, next] = arg.split(">");
        if (next) return go(next);
        return tryState([name]) || toast(`Action “${name}”.`);
      }
      case "link": return toast(`Opens ${arg}`);
      default: return toast(`Unknown action “${spec}”.`);
    }
  }

  let toastTimer = null;
  function toast(text) {
    let n = document.querySelector(".je-toast");
    if (!n) document.body.append((n = el("div", "je-toast")));
    n.textContent = text;
    n.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => n.classList.remove("on"), 2600);
  }

  /* ── Toolbar */
  let bar = null;
  let stageEl = null;
  function toolbar() {
    bar = el("div", "je-toolbar");
    const btn = (label, attr, title) => `<button ${attr}${title ? ` title="${title}"` : ""}>${label}</button>`;
    bar.innerHTML =
      `<b>Jobescape · ${esc(P.label)} <span>kit ${KIT_VERSION}</span></b>` +
      `<span class="je-group">${btn("Gallery", 'data-set="view=gallery"')}${btn("Flow", 'data-set="view=flow"')}</span>` +
      `<span class="je-group">${btn("Web", 'data-platform="web" data-device="desktop"')}${btn("Web mobile", 'data-platform="web" data-device="mobile"')}${btn("iOS", `data-platform="ios" data-device="${P.id === "ios" ? S.device : "393"}"`)}</span>` +
      (P.id === "ios" ? `<span class="je-group">${P.devices.map(d => btn(d.label, `data-set="device=${d.id}"`)).join("")}</span>` : "") +
      `<span class="je-group">${btn("Light", 'data-set="theme=light"')}${btn("Dark", 'data-set="theme=dark"')}</span>` +
      `<span class="je-group">${btn("Device", 'data-set="mode=device"', "Fixed screen height with inner scrolling")}${btn("Expanded", 'data-set="mode=flat"', "The whole scroll content at once")}</span>` +
      `<span class="je-group je-pickers"><label>Screen <select data-pick="screen"></select></label><label>State <select data-pick="state"></select></label></span>` +
      `<button data-act="replay" title="Play every animation again">↻ Replay</button>` +
      `<button class="je-lint"></button>`;
    bar.addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.classList.contains("je-lint")) return document.querySelector(".je-lintlist").classList.toggle("on");
      if (b.dataset.act === "replay") return render();
      if (b.dataset.platform) return switchPlatform(b.dataset.platform, b.dataset.device);
      const [k, v] = b.dataset.set.split("=");
      if (k === "view" && v === "flow") trail.length = 0;
      set({ [k]: v });
    });
    bar.addEventListener("change", e => {
      const k = e.target.dataset.pick;
      if (k === "screen") { trail.length = 0; set({ screen: e.target.value, state: null }); }
      if (k === "state") set({ state: e.target.value });
    });
    return bar;
  }
  function syncToolbar() {
    bar.querySelectorAll("[data-set]").forEach(b => {
      const [k, v] = b.dataset.set.split("=");
      b.setAttribute("aria-pressed", String(S[k] === v));
    });
    bar.querySelectorAll("[data-platform]").forEach(b => {
      const on = b.dataset.platform === P.id && (P.id === "ios" || b.dataset.device === S.device);
      b.setAttribute("aria-pressed", String(on));
      if (b.dataset.platform !== P.id && !pair) b.title = "Name the files <feature>.web.html and <feature>.ios.html in one folder to switch Platforms";
    });
    const pick = bar.querySelector(".je-pickers");
    pick.hidden = S.view !== "flow";
    const screenSel = bar.querySelector('[data-pick="screen"]');
    const stateSel = bar.querySelector('[data-pick="state"]');
    screenSel.replaceChildren(...sources().map(s => new Option(s.dataset.screen, s.dataset.screen)));
    screenSel.value = S.screen || "";
    const src = screenOf(S.screen);
    stateSel.replaceChildren(...(src ? statesOf(src) : []).map(st => new Option(st, st)));
    stateSel.value = S.state || "";
  }

  /* ── Apply state to the page */
  function set(patch) {
    const structural = ["view", "screen", "state", "only"].some(k => k in patch && patch[k] !== S[k]) || (P.id === "web" && "device" in patch && patch.device !== S.device);
    Object.assign(S, patch);
    apply();
    if (structural) render();
  }
  function apply() {
    const html = document.documentElement;
    html.dataset.theme = S.theme;
    html.classList.toggle("dark", S.theme === "dark");
    html.dataset.mode = S.mode;
    html.dataset.view = S.view;
    html.dataset.device = S.device;
    P.apply?.(S);
    writeHash();
    if (bar) syncToolbar();
  }
  function render() {
    const next = S.view === "flow" ? flow() : gallery();
    if (stageEl) stageEl.replaceWith(next);
    else bar.after(next);
    stageEl = next;
    writeHash();
    syncToolbar();
    freeze();
  }

  /* ── Contract check ─────────────────────────────────────────────────────── */
  function describe(n) {
    const cls = words(n.getAttribute("class")).slice(0, 3).join(".");
    const text = (n.textContent || "").trim().replace(/\s+/g, " ").slice(0, 32);
    return `<${n.tagName.toLowerCase()}${n.dataset.hero ? ` data-hero="${n.dataset.hero}"` : ""}${cls ? ` .${cls}` : ""}>${text ? ` “${text}”` : ""}`;
  }

  function readNotes() {
    const walker = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT);
    for (let c; (c = walker.nextNode());) {
      if (!/^\s*HANDOFF NOTES/.test(c.nodeValue)) continue;
      const notes = {};
      let current = null;
      c.nodeValue.split("\n").slice(1).forEach(line => {
        const head = line.match(/^\s*([A-Za-z][A-Za-z ]+):\s*$/);
        if (head) return void (notes[(current = head[1].trim())] = []);
        const item = line.match(/^\s*-\s*(.+?)\s*$/);
        if (item && current && !/^none$/i.test(item[1])) notes[current].push(item[1]);
      });
      return notes;
    }
    return null;
  }
  const listed = (items, name) => (items || []).some(t => t.split(/\s+[—–-]\s+|\s*\(|:/)[0].trim() === name || t.startsWith(name + " "));

  /* The motion sheet: <style data-motion-sheet> holding @keyframes only. */
  function motionSheet(issues) {
    const sheet = new Map();
    const said = new Set();
    const note = msg => !said.has(msg) && said.add(msg) && issues.push({ where: "<style data-motion-sheet>", msg, screen: "motion" });
    document.querySelectorAll("style[data-motion-sheet]").forEach(tag => {
      [...(tag.sheet ? tag.sheet.cssRules : [])].forEach(rule => {
        if (!(rule instanceof CSSKeyframesRule)) return note(`the motion sheet holds only @keyframes; extra rule: ${rule.cssText.slice(0, 40)}`);
        const info = { vars: new Set(), hidden: false, rule };
        sheet.set(rule.name, info);
        if (ANIM_WORDS.includes(rule.name)) note(`@keyframes ${rule.name}: the name is a CSS animation keyword — rename it`);
        [...rule.cssRules].forEach(frame => {
          [...frame.style].forEach(prop => {
            const value = frame.style.getPropertyValue(prop);
            if (!/color|shadow/.test(prop)) (value.match(/var\(\s*(--[\w-]+)/g) || []).forEach(v => info.vars.add(v.replace(/var\(\s*/, "")));
          });
          if (frame.keyText.split(",").some(k => k.trim() === "0%") && frame.style.opacity === "0") info.hidden = true;
        });
        P.checkKeyframes?.(rule, note);
      });
    });
    return sheet;
  }

  function lint() {
    const issues = [];
    const add = (n, msg) => issues.push({ where: describe(n), msg, screen: n.closest?.("section[data-screen]")?.dataset.screen });
    const usedIcons = new Map();
    const keyframes = motionSheet(issues);
    const notes = readNotes();
    if (!notes) issues.push({ where: "<body>", msg: `no HANDOFF NOTES block — add the comment with the headings: ${NOTE_HEADINGS.join(", ")}`, screen: "notes" });
    else NOTE_HEADINGS.forEach(h => h in notes || issues.push({ where: "HANDOFF NOTES", msg: `missing heading “${h}:” (write “- none” under it when empty)`, screen: "notes" }));
    const seen = new Set();
    const tabs = new Set(sources().map(s => P.tabOf(s)).filter(Boolean));
    sources().forEach(sec => {
      const name = sec.dataset.screen;
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) add(sec, `data-screen “${name}”: use lowercase kebab-case`);
      if (seen.has(name)) add(sec, `data-screen “${name}” is declared twice`);
      seen.add(name);
      const states = statesOf(sec);
      P.checkScreen?.(sec, add);
      sec.querySelectorAll("*").forEach(n => {
        const free = n.closest("[data-illustration]");
        const classes = words(n.getAttribute("class"));
        ["when", "unless"].forEach(k => {
          if (n.dataset[k] == null) return;
          words(n.dataset[k]).forEach(st => states.includes(st) || add(n, `data-${k}="${st}": not in this Screen’s data-states (${states.join(" ")})`));
        });
        if (n.hasAttribute("style") && !free) add(n, "inline style is not allowed — use classes and tokens");
        classes.forEach(c => {
          const bare = c.replace(/^!/, "").replace(/^([\w-]+:)+/, "");
          if (!free && COLOR_UTIL.test(bare) && (RAW_COLOR.test(bare) || PALETTE.test(bare))) add(n, `colour “${c}” is not a token`);
        });
        if (n.tagName.toLowerCase() === "svg") add(n, "inline <svg> is not allowed — use <i data-icon> or <img data-asset>");
        if (n.dataset.press != null) {
          const spec = n.dataset.press;
          const at = spec.indexOf(":");
          const verb = at < 0 ? spec : spec.slice(0, at);
          const arg = at < 0 ? "" : spec.slice(at + 1);
          if (!PRESS_VERBS.includes(verb)) add(n, `data-press verb “${verb}”: use ${PRESS_VERBS.join(", ")}`);
          const target = verb === "push" ? arg : verb === "action" ? arg.split(">")[1] : null;
          if (target && !screenOf(target) && !listed(notes?.["Not designed yet"], target)) add(n, `data-press target “${target}” is not a Screen here — design it or list it under “Not designed yet”`);
          if (verb === "tab" && !tabs.has(arg) && !listed(notes?.["Not designed yet"], arg)) add(n, `tab “${arg}” has no Screen here — design it or list it under “Not designed yet”`);
        }
        if (n.dataset.hero) P.checkHero(n, add);
        if (n.dataset.slot && !n.parentElement.closest("[data-hero]")) add(n, `data-slot="${n.dataset.slot}" outside a data-hero component`);
        if (n.dataset.custom != null) {
          if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(n.dataset.custom)) add(n, `data-custom “${n.dataset.custom}”: name it in kebab-case`);
          else if (notes && !listed(notes["Custom components"], n.dataset.custom)) add(n, `Custom component “${n.dataset.custom}” is not listed under “Custom components” in HANDOFF NOTES`);
        }
        if (n.dataset.pro != null) {
          if (n.dataset.custom == null) add(n, "data-pro goes on a Custom component (data-custom) that stands in for the HeroUI Pro one");
          if (notes && !listed(notes["Needs HeroUI Pro"], n.dataset.pro)) add(n, `HeroUI Pro “${n.dataset.pro}” is not listed under “Needs HeroUI Pro” in HANDOFF NOTES`);
        }
        if (n.dataset.anim != null) {
          const own = n.dataset.vars || "";
          if (/var\(/.test(n.dataset.anim)) add(n, "data-anim: no var() — write the value");
          n.dataset.anim.replace(/\(([^)]*)\)/g, m => m.replace(/,/g, "\u0001")).split(",").forEach(raw => {
            const part = raw.replace(/\u0001/g, ",").trim();
            const tokens = part.replace(/\([^)]*\)/g, "()").split(/\s+/);
            const name = tokens.find(t => !ANIM_WORDS.includes(t) && !/^-?[\d.]+(ms|s)?$/.test(t) && !/\(\)$/.test(t));
            const info = keyframes.get(name);
            if (!info) return add(n, `data-anim: @keyframes “${name || part}” is not in <style data-motion-sheet>`);
            const times = tokens.filter(t => /^-?[\d.]+(ms|s)$/.test(t));
            if (!times.length) add(n, `data-anim “${name}”: needs a duration`);
            const probe = document.createElement("div");
            probe.style.animation = part;
            if (!probe.style.animationName) add(n, `data-anim “${name}”: the browser can’t read “${part}”`);
            const delay = times[1] ? parseFloat(times[1]) : 0;
            if (info.hidden && delay > 0 && !tokens.includes("infinite") && !tokens.includes("both") && !tokens.includes("backwards")) add(n, `data-anim “${name}”: an entrance with a delay needs “both”, or the element shows before it starts`);
            info.vars.forEach(v => new RegExp(`(^|;)\\s*${v}\\s*:`).test(own) || add(n, `data-anim “${name}”: its frames read ${v}, but the element’s data-vars doesn’t set it`));
          });
        }
        if (n.dataset.vars != null && !/^(\s*--[\w-]+\s*:\s*-?[\d.]+(px|deg|%)?\s*;?)+\s*$/.test(n.dataset.vars)) add(n, 'data-vars: numbers only — "--dx: -150px; --r: 360deg"');
        if (n.dataset.animOn && n.dataset.animOn !== "view") add(n, 'data-anim-on: only "view"');
        if (n.dataset.animOn && n.dataset.anim == null && !n.dataset.motion) add(n, "data-anim-on without data-anim");
        if (n.tagName === "I" && n.dataset.icon != null) {
          if (!n.dataset.icon) add(n, "<i data-icon> without an icon name");
          else usedIcons.set(n.dataset.icon, n);
        }
        if (n.tagName === "IMG") {
          if (!n.dataset.asset && !n.dataset.bind) add(n, "<img> without data-asset or data-bind");
          if (!classes.some(c => HAS_SIZE.test(c.replace(/^([\w-]+:)+/, "")))) add(n, "<img> without an explicit size");
        }
        P.checkNode?.(n, { add, classes, free, states, sec });
      });
    });
    P.checkFile?.(add, issues);
    return { issues, usedIcons };
  }

  function report(issues) {
    const btn = bar.querySelector(".je-lint");
    const list = document.querySelector(".je-lintlist");
    btn.dataset.count = String(issues.length);
    document.documentElement.dataset.contractIssues = String(issues.length);
    btn.textContent = issues.length ? `Issues: ${issues.length}` : "Contract: ok";
    list.innerHTML = issues.length
      ? issues.map(i => `<div>${esc(i.msg)}<small>${esc(i.screen || "")} · ${esc(i.where)}</small></div>`).join("")
      : "<div>No issues.</div>";
    if (issues.length) console.warn(`[jobescape kit ${KIT_VERSION}] ${issues.length} contract issue(s)`, issues);
  }

  async function start() {
    const warning = await P.ready?.();
    document.body.prepend(toolbar(), el("div", "je-lintlist"));
    apply();
    render();
    if (warning) toast(warning);
    const { issues, usedIcons } = lint();
    report(issues);
    /* Icon names are checked against the same package version the apps ship. */
    const missing = await Promise.all([...usedIcons].map(([name, n]) =>
      fetch(`${ICON_BASE}${name}.svg`, { method: "HEAD" })
        .then(r => (r.ok ? null : { where: describe(n), msg: `no icon “${name}” in @gravity-ui/icons`, screen: n.closest("section[data-screen]")?.dataset.screen }))
        .catch(() => null),
    ));
    const extra = missing.filter(Boolean);
    if (extra.length) report(issues.concat(extra));
  }
  /* Placeholder links in a design (href="#") must not replace the preview's address. */
  document.addEventListener("click", e => {
    if (e.target.closest?.('a[href="#"], a[href=""]') && e.target.closest(".je-gallery, .je-flow")) e.preventDefault();
  });
  window.addEventListener("hashchange", () => {
    const h = new URLSearchParams(location.hash.slice(1));
    const patch = {};
    ["view", "theme", "device", "mode", "screen", "state", "only"].forEach(k => h.has(k) && h.get(k) !== S[k] && (patch[k] = h.get(k)));
    if (Object.keys(patch).length) set(patch);
  });
  document.addEventListener("DOMContentLoaded", start);
})();
