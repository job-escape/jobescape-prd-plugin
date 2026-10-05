/* Web platform layer: frontend-alpha frames (desktop and mobile web), the
   Layout Navigation around each Screen, data-hero → HeroUI class translation,
   and the checks that only apply to Web. The shared runtime below calls it. */
window.JE_PLATFORM = (() => {
  /* HeroUI 3.2.1 inventory, generated from @heroui/styles and @heroui/react:
     component → { b: block class, m: { attribute: { value: modifier class | null } },
     e: { slot: element class }, s: state attributes the CSS reads }. */
  const HERO = /*{{HEROUI}}*/ {};
  /* Slots every component accepts, so the same markup works on iOS (Button's label). */
  const SHARED_SLOTS = ["label", "icon", "start", "end", "description", "error"];
  const SLOT_ALIASES = { Tabs: { trigger: "tab" } };
  const FIELD_SLOTS = { label: "label", description: "description", error: "field-error" };
  const svg = (markup, attrs = "") => {
    const t = document.createElement("template");
    t.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true" ${attrs}>${markup}</svg>`;
    return t.content.firstElementChild;
  };
  const path16 = d => svg(`<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="${d}"/>`, 'viewBox="0 0 16 16" width="16" height="16"');
  const ICON = {
    chevron: "M2.97 5.47a.75.75 0 0 1 1.06 0L8 9.44l3.97-3.97a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 0-1.06",
    close: "M3.47 3.47a.75.75 0 0 1 1.06 0L8 6.94l3.47-3.47a.75.75 0 1 1 1.06 1.06L9.06 8l3.47 3.47a.75.75 0 1 1-1.06 1.06L8 9.06l-3.47 3.47a.75.75 0 0 1-1.06-1.06L6.94 8 3.47 4.53a.75.75 0 0 1 0-1.06Z",
    info: "M8 13.5a5.5 5.5 0 1 0 0-11a5.5 5.5 0 0 0 0 11M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m1-9.5a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-.25 3a.75.75 0 0 0-1.5 0V11a.75.75 0 0 0 1.5 0z",
    warning: "M7.134 2.994L2.217 11.5a1 1 0 0 0 .866 1.5h9.834a1 1 0 0 0 .866-1.5L8.866 2.993a1 1 0 0 0-1.732 0m3.03-.75c-.962-1.665-3.366-1.665-4.329 0L.918 10.749c-.963 1.666.24 3.751 2.165 3.751h9.834c1.925 0 3.128-2.085 2.164-3.751zM8 5a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2A.75.75 0 0 1 8 5m1 5.75a1 1 0 1 1-2 0a1 1 0 0 1 2 0",
    danger: "M8 13.5a5.5 5.5 0 1 0 0-11a5.5 5.5 0 0 0 0 11M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m1-4.5a1 1 0 1 1-2 0a1 1 0 0 1 2 0M8.75 5a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0z",
    success: "M13.5 8a5.5 5.5 0 1 1-11 0a5.5 5.5 0 0 1 11 0M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0m-3.9-1.55a.75.75 0 1 0-1.2-.9L7.419 8.858L6.03 7.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.13-.08z",
  };
  const make = (tag, cls) => Object.assign(document.createElement(tag), { className: cls });
  const part = (n, cls) => [...n.querySelectorAll(`:scope .${cls}`)].find(x => x.closest("[data-hero]") === n);
  const own = (n, slot) => [...n.querySelectorAll(`[data-slot="${slot}"]`)].find(x => x.parentElement.closest("[data-hero]") === n);
  const set = (n, k, v = "true") => n && n.setAttribute(k, v);

  /* What HeroUI's React layer renders or sets at runtime that its CSS depends on. */
  function choice(n, kind) {
    if (part(n, `${kind}__content`)) return;
    const content = make("label", `${kind}__content`);
    const control = make("span", `${kind}__control`);
    if (kind === "switch") control.append(make("span", "switch__thumb"));
    else {
      const indicator = make("span", `${kind}__indicator`);
      if (kind === "checkbox") indicator.append(svg('<polyline points="1 9 7 14 15 4"/>', `viewBox="0 0 17 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="22" stroke-dashoffset="${n.hasAttribute("data-selected") ? 44 : 66}"`));
      control.append(indicator);
    }
    content.append(control);
    const label = own(n, "label");
    if (label) content.append(label);
    n.prepend(content);
  }
  const FIXUPS = {
    Button(n) { if (n.hasAttribute("data-disabled")) set(n, "aria-disabled"); },
    Avatar(n) { const f = own(n, "fallback"); if (f) f.classList.add(`avatar__fallback--${n.dataset.color || "default"}`); },
    Checkbox: n => choice(n, "checkbox"),
    Radio: n => choice(n, "radio"),
    Switch: n => choice(n, "switch"),
    ProgressBar: n => progress(n, "progress-bar"),
    Meter: n => progress(n, "meter"),
    Tabs(n) {
      n.dataset.orientation ||= "horizontal";
      const list = part(n, "tabs__list");
      if (list) {
        list.dataset.orientation ||= n.dataset.orientation;
        if (!list.parentElement.classList.contains("tabs__list-container")) {
          const wrap = make("div", "tabs__list-container");
          list.before(wrap);
          wrap.append(list);
        }
      }
      n.querySelectorAll(":scope .tabs__tab[data-selected='true']").forEach(t => t.querySelector(".tabs__indicator") || t.append(make("div", "tabs__indicator")));
    },
    Accordion(n) {
      [...n.querySelectorAll(":scope .accordion__item")].filter(i => i.closest("[data-hero]") === n).forEach(item => {
        const open = item.hasAttribute("data-expanded");
        const trigger = item.querySelector(".accordion__trigger");
        const panel = item.querySelector(".accordion__panel");
        if (trigger) {
          trigger.dataset.slot = "accordion-trigger";
          set(trigger, "aria-expanded", String(open));
          if (!trigger.closest(".accordion__heading")) { const h = make("h3", "accordion__heading"); trigger.before(h); h.append(trigger); }
          let ind = trigger.querySelector(".accordion__indicator");
          if (!ind) { ind = path16(ICON.chevron); ind.classList.add("accordion__indicator"); trigger.append(ind); }
          if (open) set(ind, "data-expanded");
        }
        if (panel) {
          if (!panel.querySelector(".accordion__body")) {
            const body = make("div", "accordion__body"), inner = make("div", "accordion__body-inner");
            inner.append(...panel.childNodes); body.append(inner); panel.append(body);
          }
          if (open) { set(panel, "data-expanded"); panel.style.setProperty("--disclosure-panel-height", "auto"); }
          else panel.hidden = true;
        }
      });
    },
    Modal: n => overlay(n, "modal"),
    AlertDialog: n => overlay(n, "alert-dialog"),
    Drawer: n => overlay(n, "drawer"),
    Select(n) {
      const trigger = part(n, "select__trigger");
      if (trigger && !trigger.querySelector(".select__indicator")) { const i = path16(ICON.chevron); i.classList.add("select__indicator"); trigger.append(i); }
    },
    Spinner(n) {
      if (n.firstElementChild) return;
      n.append(svg('<defs><linearGradient id="je-sp1" x1="50%" x2="50%" y1="5.271%" y2="91.793%"><stop offset="0%" stop-color="currentColor"/><stop offset="100%" stop-color="currentColor" stop-opacity=".55"/></linearGradient><linearGradient id="je-sp2" x1="50%" x2="50%" y1="15.24%" y2="87.15%"><stop offset="0%" stop-color="currentColor" stop-opacity="0"/><stop offset="100%" stop-color="currentColor" stop-opacity=".55"/></linearGradient></defs><g fill="none"><path fill="url(#je-sp1)" transform="translate(1.5 1.625)" d="M8.749.021a1.5 1.5 0 0 1 .497 2.958A7.5 7.5 0 0 0 3 10.375a7.5 7.5 0 0 0 7.5 7.5v3c-5.799 0-10.5-4.7-10.5-10.5C0 5.23 3.726.865 8.749.021"/><path fill="url(#je-sp2)" transform="translate(1.5 1.625)" d="M15.392 2.673a1.5 1.5 0 0 1 2.119-.115A10.48 10.48 0 0 1 21 10.375c0 5.8-4.701 10.5-10.5 10.5v-3a7.5 7.5 0 0 0 5.007-13.084a1.5 1.5 0 0 1-.115-2.118"/></g>', 'viewBox="0 0 24 24" data-slot="spinner-icon"'));
    },
    Alert(n) {
      if (part(n, "alert__indicator")) return;
      const status = n.dataset.status || "default";
      const ind = make("div", "alert__indicator");
      const icon = path16(ICON[{ success: "success", warning: "warning", danger: "danger" }[status] || "info"]);
      icon.dataset.slot = "alert-default-icon";
      ind.append(icon);
      n.prepend(ind);
    },
    CloseButton(n) { if (!n.firstElementChild) { const i = path16(ICON.close); i.dataset.slot = "close-button-icon"; n.append(i); } },
    Toast(n) {
      const placement = (n.dataset.placement || "top-end").replace(/\s+/g, "-");
      set(n, "data-frontmost");
      [...n.classList].filter(c => /^toast--(top|bottom)/.test(c)).forEach(c => n.classList.remove(c));
      n.classList.add(`toast--${placement}`);
      if (!part(n, "toast__indicator")) {
        const ind = make("div", "toast__indicator");
        const icon = path16(ICON[{ success: "success", warning: "warning", danger: "danger" }[n.dataset.variant] || "info"]);
        icon.dataset.slot = "toast-default-icon";
        ind.append(icon);
        n.prepend(ind);
      }
      if (!n.closest(".toast-region")) {
        const region = make("div", `toast-region toast-region--${placement}`);
        region.style.setProperty("--toast-width", "460px");
        region.style.width = "calc(100% - 2rem)"; // the frame's width, not the window's
        region.style.zIndex = "100"; // portalled above the page in the app
        n.before(region);
        region.append(n);
      }
    },
  };
  function progress(n, kind) {
    const value = n.dataset.value;
    let track = part(n, `${kind}__track`);
    if (!track) { track = make("div", `${kind}__track`); track.append(make("div", `${kind}__fill`)); n.append(track); }
    const fill = part(n, `${kind}__fill`);
    if (value != null) {
      set(n, "aria-valuenow", value); set(n, "aria-valuemin", "0"); set(n, "aria-valuemax", "100");
      if (fill) fill.style.width = `${Math.max(0, Math.min(100, Number(value)))}%`;
    }
  }
  function overlay(n, kind) {
    const backdrop = part(n, `${kind}__backdrop`);
    if (backdrop) {
      backdrop.style.position = "absolute"; // inside the frame, not the window
      backdrop.style.zIndex = "100"; // portalled above the page and its Navigation in the app
      backdrop.style.setProperty("--visual-viewport-height", "100%");
    }
    const placement = n.dataset.placement || (kind === "drawer" ? "bottom" : "auto");
    [`${kind}__container`, `${kind}__dialog`].forEach(c => set(part(n, c), "data-placement", placement));
  }

  /* data-hero="Button" data-variant="primary" data-size="sm" → class="button button--primary button--sm" */
  function translate(root) {
    const heroes = [...root.querySelectorAll("[data-hero]")];
    heroes.forEach(n => {
      const name = n.dataset.hero;
      const spec = HERO[name];
      if (!spec) return;
      n.classList.add(spec.b);
      const value = attr => {
        const key = attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (!(key in n.dataset)) return (spec.d || {})[attr];
        return n.dataset[key] === "" ? "true" : n.dataset[key];
      };
      Object.entries(spec.m || {}).forEach(([attr, values]) => {
        const v = value(attr);
        if (v != null && values[v]) n.classList.add(values[v]);
      });
      (spec.s || []).forEach(attr => {
        const key = attr.replace(/^data-/, "").replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (attr.startsWith("data-") && n.dataset[key] === "") n.dataset[key] = "true";
      });
      [...n.querySelectorAll("[data-slot]")].filter(s => s.parentElement.closest("[data-hero]") === n).forEach(s => {
        const slot = (SLOT_ALIASES[name] || {})[s.dataset.slot] || s.dataset.slot;
        const cls = (spec.e || {})[slot] || (spec.f && FIELD_SLOTS[slot]);
        if (cls) s.classList.add(cls);
        if (cls === "field-error") s.dataset.visible = "true";
        ["selected", "disabled", "expanded", "current"].forEach(k => s.dataset[k] === "" && (s.dataset[k] = "true"));
      });
      Object.entries(spec.t || {}).forEach(([attr, byValue]) => {
        const targets = byValue[value(attr)] || {};
        Object.entries(targets).forEach(([on, cls]) => n.querySelectorAll(`.${on}`).forEach(x => x.classList.add(cls)));
      });
    });
    heroes.forEach(n => FIXUPS[n.dataset.hero]?.(n));
  }

  const LAYOUTS = ["app", "profile", "registration", "none"];
  const DEVICES = { desktop: { w: 1280, h: 832, scale: 0.5 }, mobile: { w: 393, h: 852, scale: 1 } };
  const words = v => (v || "").split(/\s+/).filter(Boolean);
  const layoutTemplate = name => document.querySelector(`template[data-layout="${name}"]`);

  /* HeroUI's own CSS sizes some parts with min-width media queries; frames need
     them to answer to the frame instead, like the Tailwind breakpoints above. */
  async function frameHeroUI() {
    const link = document.querySelector("link[data-heroui]");
    if (!link) return;
    if (!link.sheet) await new Promise(resolve => link.addEventListener("load", resolve, { once: true }));
    let sheet;
    try { sheet = link.sheet; void sheet.cssRules; } catch {
      return "This browser won’t let the kit read HeroUI’s styles, so a few component sizes follow the window instead of the frame. Use Chrome for exact mobile sizes.";
    }
    const moved = [];
    const scan = list => {
      for (let i = list.cssRules.length - 1; i >= 0; i--) {
        const r = list.cssRules[i];
        if (r instanceof CSSMediaRule && /min-width|width\s*>=/.test(r.conditionText)) { moved.push(r.cssText.replace(/^@media/, "@container frame")); list.deleteRule(i); }
        else if (r instanceof CSSLayerBlockRule) scan(r);
      }
    };
    scan(sheet);
    const style = document.createElement("style");
    style.dataset.kit = "heroui-frames";
    style.textContent = `@layer components {\n${moved.join("\n")}\n}`;
    link.after(style);
  }

  function fillLayout(page, src, st) {
    page.querySelectorAll("[data-nav-item]").forEach(item => {
      if (item.dataset.navItem === src.dataset.nav) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    if (src.dataset.title) page.querySelectorAll("[data-title-slot]").forEach(t => (t.textContent = src.dataset.title));
    if (src.dataset.tabbar === "hidden") page.querySelectorAll("[data-tabbar]").forEach(t => t.remove());
    const steps = [...page.querySelectorAll("[data-stepper] > li")];
    const active = Number(src.dataset.step || 1);
    steps.forEach((li, i) => (li.dataset.status = i + 1 < active ? "complete" : i + 1 === active ? "active" : "inactive"));
  }

  return {
    id: "web",
    label: "Web",
    devices: [{ id: "desktop", label: "Desktop" }, { id: "mobile", label: "Mobile" }],
    caption: src => src.dataset.layout || "?",
    tabOf: src => src.dataset.nav || null,
    ready: frameHeroUI,
    prepare(clone) { translate(clone); },
    frame(clone, src, st, S, view) {
      const device = DEVICES[S.device] || DEVICES.desktop;
      const flowDesktop = view === "flow" && S.device === "desktop";
      const w = flowDesktop ? Math.max(768, Math.min(1440, innerWidth - 48)) : device.w;
      const h = flowDesktop ? Math.max(560, innerHeight - 110) : device.h;
      const scale = view === "gallery" ? device.scale : 1;
      const outer = document.createElement("div");
      outer.className = "je-web";
      outer.dataset.device = S.device;
      const viewport = document.createElement("div");
      viewport.className = "je-viewport bg-background text-foreground font-sans antialiased";
      viewport.style.setProperty("--frame-w", w + "px");
      viewport.style.setProperty("--frame-h", h + "px");
      const page = document.createElement("div");
      page.className = "je-page";
      const tpl = src.dataset.layout && src.dataset.layout !== "none" ? layoutTemplate(src.dataset.layout) : null;
      if (tpl) {
        page.append(tpl.content.cloneNode(true));
        translate(page);
        fillLayout(page, src, st);
        const outlet = page.querySelector("[data-outlet]");
        while (clone.firstChild) outlet.appendChild(clone.firstChild);
      } else {
        while (clone.firstChild) page.appendChild(clone.firstChild);
      }
      page.querySelectorAll("i[data-icon]").forEach(i => i.style.setProperty("--icon", `url("https://cdn.jsdelivr.net/npm/@gravity-ui/icons@2.18.0/svgs/${i.dataset.icon}.svg")`));
      viewport.append(page);
      outer.append(viewport);
      if (scale !== 1) {
        viewport.style.transform = `scale(${scale})`;
        outer.style.width = w * scale + "px";
        const fit = () => (outer.style.height = viewport.offsetHeight * scale + "px");
        fit();
        new ResizeObserver(fit).observe(viewport);
      }
      return outer;
    },
    checkScreen(sec, add) {
      const layout = sec.dataset.layout;
      if (!LAYOUTS.includes(layout)) return add(sec, `data-layout is required: ${LAYOUTS.join(" | ")}`);
      if (sec.dataset.route != null) add(sec, "data-route is an iOS attribute; Web Screens use data-layout");
      const tpl = layout !== "none" && layoutTemplate(layout);
      if (layout !== "none" && !tpl) return add(sec, `no <template data-layout="${layout}"> in the file — keep the Layout’s Navigation block`);
      if (sec.dataset.nav && tpl) {
        const items = [...tpl.content.querySelectorAll("[data-nav-item]")].map(i => i.dataset.navItem);
        if (!items.includes(sec.dataset.nav)) add(sec, `data-nav="${sec.dataset.nav}": the ${layout} Navigation has ${[...new Set(items)].join(", ") || "no items"}`);
      }
      if (sec.dataset.step != null && layout !== "registration") add(sec, "data-step only applies to data-layout=\"registration\"");
    },
    checkHero(n, add) {
      const name = n.dataset.hero;
      const spec = HERO[name];
      if (!spec) return add(n, `unknown data-hero="${name}" — use a HeroUI component name (Button, Card, Chip, TextField, Tabs …)`);
      Object.entries(spec.m || {}).forEach(([attr, values]) => {
        const key = attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (!(key in n.dataset)) return;
        const value = n.dataset[key] === "" ? "true" : n.dataset[key];
        if (!(value in values)) add(n, `${name} data-${attr}="${value}": use ${Object.keys(values).join(", ")}`);
      });
      [...n.querySelectorAll("[data-slot]")].filter(s => s.parentElement.closest("[data-hero]") === n).forEach(s => {
        const slot = (SLOT_ALIASES[name] || {})[s.dataset.slot] || s.dataset.slot;
        if (!(spec.e || {})[slot] && !SHARED_SLOTS.includes(slot)) add(s, `${name} has no part “${s.dataset.slot}” on Web — parts: ${Object.keys(spec.e || {}).join(", ") || "none"}`);
      });
    },
    checkNode(n, { add, classes, free }) {
      const tag = n.tagName.toLowerCase();
      if (["input", "select", "textarea"].includes(tag) && !n.closest("[data-hero]")) add(n, `native <${tag}> — use the HeroUI primitive (TextField, Select, TextArea …) via data-hero`);
      if ((tag === "button" || tag === "a") && !n.dataset.hero && n.dataset.press == null && !n.closest("[data-hero]")) add(n, `<${tag}> without data-hero or data-press — a library Button/Link, or a Custom pressable with data-press`);
      if (n.dataset.type != null) add(n, "data-type is iOS Typography; Web text uses Tailwind text classes (text-sm, font-medium …)");
      if (free) return;
      classes.forEach(c => {
        const bare = c.replace(/^!/, "").replace(/^([\w-]+:)+/, "");
        if (/^shadow-\[|^shadow-(?!surface$|overlay$|field$|none$)[\w-]+$/.test(bare)) add(n, `shadow “${c}”: only shadow-surface, shadow-overlay, shadow-field`);
        if (/^rounded(-[a-z]+)?-\[/.test(bare)) add(n, `radius “${c}”: use the radius scale (rounded-sm … rounded-4xl, rounded-full)`);
        if (/^font-\[/.test(bare)) add(n, `font “${c}”: use font-sans, font-serif or font-instrument`);
      });
    },
    checkFile(add) {
      const RAW = /#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?|oklch|oklab|lab|lch)\(/;
      document.querySelectorAll("style:not([data-motion-sheet]):not([data-kit])").forEach(st => {
        if (/^\s*\/\*! tailwindcss/.test(st.textContent)) return; // Tailwind's generated CSS
        if (!st.hasAttribute("data-feature-styles")) return add(st, "extra <style> — feature CSS goes in <style type=\"text/tailwindcss\" data-feature-styles>, animations in the motion sheet");
        if (RAW.test(st.textContent)) add(st, "raw colour in feature styles — use var(--token)");
        if (/@keyframes/.test(st.textContent)) add(st, "@keyframes go in the motion sheet");
      });
      document.querySelectorAll("template[data-layout]").forEach(tpl => tpl.content.querySelectorAll("*").forEach(n => {
        if (n.hasAttribute("style")) add(n, `Navigation (${tpl.dataset.layout}): inline style is not allowed`);
        words(n.getAttribute("class")).forEach(c => /-\[(#|rgb|hsl|oklch)/.test(c) && add(n, `Navigation (${tpl.dataset.layout}): colour “${c}” is not a token`));
      }));
    },
  };
})();
