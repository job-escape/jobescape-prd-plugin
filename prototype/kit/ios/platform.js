/* iOS platform layer: the phone frame, the app's tab bar, and the checks that
   only apply to React Native + HeroUI Native. The shared runtime below calls it. */
window.JE_PLATFORM = (() => {
  const ICON_BASE = "https://cdn.jsdelivr.net/npm/@gravity-ui/icons@2.18.0/svgs/";
  /* The app's tab bar. Its composition depends on experiments; this is the
     Challenges-arm bar. data-tabbar="<id>" on a tab-root Screen selects the active tab. */
  const TABS = [
    { id: "my-plan", label: "My plan", icon: "house" },
    { id: "challenges", label: "Challenges", icon: "star" },
    { id: "ai", label: "AI tools", icon: "magic-wand" },
    { id: "profile", label: "Profile", icon: "person" },
    { id: "apps", label: "Apps", icon: "layout-cells" },
  ];
  const HERO = ["Button", "CloseButton", "Chip", "Surface", "Card", "ListGroup", "Avatar", "Separator", "Tabs", "BottomSheet", "Toast", "Skeleton", "Spinner"];
  const DECOR = ["grid", "glow"];
  const GRADIENTS = ["accent"];
  const MOTION = ["fade", "rise", "pop"];
  const ROUTES = ["tab-root", "push", "overlay", "card-sheet"];
  const TEXT_TAGS = ["P", "H1", "H2", "H3", "H4", "H5", "H6", "SPAN"];
  const FORBIDDEN = [
    [/^(hover|focus|focus-visible|focus-within|active|visited|group-[\w-]+|peer-[\w-]+|first|last|odd|even|sm|md|lg|xl|2xl|desktop|phone|tablet|motion-safe|motion-reduce|print):/, "hover/focus/breakpoint variants don’t exist in the app"],
    [/^(inline-)?grid$|^grid-|^(col|row)-(span|start|end)-/, "React Native has no CSS grid — build rows with flex-row"],
    [/^(sticky|fixed)$/, "no sticky/fixed — a pinned block is a sibling of data-scroll"],
    [/^(transition|animate|duration|ease|delay)(-|$)/, "animation classes don’t carry over — use data-anim and the motion sheet"],
    [/^-?space-[xy]-|^divide-/, "no space-*/divide-* — use gap and Separator"],
    [/^backdrop-|^(blur|brightness|contrast|grayscale|saturate|sepia|invert|hue-rotate|drop-shadow)(-|$)/, "filters and backdrop don’t carry over"],
    [/^(h|w|min-h|max-h|min-w|max-w)-(screen|dvh|svh|lvh|dvw)$/, "screen height/width — use flex-1"],
    [/^(block|inline|inline-block|inline-flex|contents|table|float-|clear-|columns-)/, "no display other than flex/hidden"],
    [/^(cursor|select|outline|ring|scroll|snap|touch|will-change|appearance)-/, "web-only property"],
    [/^rounded$/, "bare rounded = 16px; pick a step: rounded-sm/md/lg/xl/2xl"],
  ];
  const TEXT_SIZE = /^text-(xs|sm|base|lg|xl|[2-9]xl|\[\d)/;
  /* In @keyframes only what Reanimated's CSS animations play natively in the app. */
  const MOTION_PROP = /^(opacity|transform|transform-origin|width|height|(min|max)-(width|height)|top|right|bottom|left|margin-(top|right|bottom|left)|padding-(top|right|bottom|left)|border-(top|bottom)-(left|right)-radius|border-(top|right|bottom|left)-(width|color)|color|background-color|box-shadow|text-shadow|font-size|letter-spacing|line-height)$/;
  const TRANSFORM_FN = /^(translate|translateX|translateY|scale|scaleX|scaleY|rotate|rotateX|rotateY|rotateZ|skewX|skewY|perspective)$/;
  const REBUILD = "rebuild it with the table in the iOS rules, or list it under “Animation losses”";
  const words = v => (v || "").split(/\s+/).filter(Boolean);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  function statusbar(style) {
    const n = el("div", "pv-statusbar", '<span class="pv-time">9:41</span><span class="pv-island"></span><span class="pv-right"><i class="pv-bars"></i><i class="pv-batt"></i></span>');
    if (style) n.dataset.style = style;
    return n;
  }
  function tabbar(active) {
    const n = el("nav", "pv-tabbar");
    TABS.forEach(t => {
      const item = el("div", "pv-tab", `<i style='--icon:url("${ICON_BASE}${t.icon}.svg")'></i><span>${t.label}</span>`);
      if (t.id === active) item.setAttribute("aria-current", "page");
      item.dataset.press = `tab:${t.id}`;
      n.appendChild(item);
    });
    return n;
  }

  return {
    id: "ios",
    label: "iOS",
    devices: [{ id: "393", label: "393" }, { id: "375", label: "375" }, { id: "430", label: "430" }],
    caption: src => src.dataset.route || "?",
    tabOf: src => (src.dataset.route === "tab-root" ? src.dataset.tabbar : null),
    apply: S => document.documentElement.style.setProperty("--device-w", S.device + "px"),
    /* BottomSheet: the kit draws the handle zone around the content slot. */
    prepare(clone) {
      clone.querySelectorAll('[data-hero="BottomSheet"] > [data-slot="content"]').forEach(content => {
        const sheet = el("div", "pv-sheet");
        content.before(sheet);
        if (content.parentElement.dataset.handle !== "none") sheet.appendChild(el("div", "pv-handle"));
        sheet.appendChild(content);
      });
      clone.querySelectorAll('[data-decor="glow"][data-tint]').forEach(n => n.style.setProperty("--pv-glow", n.dataset.tint));
    },
    frame(clone, src) {
      const scene = el("div", "pv-scene rn");
      while (clone.firstChild) scene.appendChild(clone.firstChild);
      const frame = el("div", "pv-frame");
      frame.append(scene, statusbar(src.dataset.statusbar));
      if (src.dataset.tabbar) {
        frame.dataset.tabbar = src.dataset.tabbar;
        frame.appendChild(tabbar(src.dataset.tabbar));
      }
      frame.appendChild(el("div", "pv-home"));
      return frame;
    },
    checkScreen(sec, add) {
      if (!ROUTES.includes(sec.dataset.route)) add(sec, `data-route is required: ${ROUTES.join(" | ")}`);
      if (sec.dataset.tabbar && !TABS.some(t => t.id === sec.dataset.tabbar)) add(sec, `data-tabbar: ${TABS.map(t => t.id).join(" | ")}`);
      if (sec.dataset.layout != null) add(sec, "data-layout is a Web attribute; iOS Screens use data-route");
    },
    checkHero(n, add) {
      if (!HERO.includes(n.dataset.hero)) return add(n, `unknown data-hero="${n.dataset.hero}" — iOS kit components: ${HERO.join(", ")}`);
      if (n.dataset.hero === "Button" && !n.dataset.size) add(n, "Button without data-size (sm 40 · md 48 · lg 56)");
    },
    checkNode(n, { add, classes, free }) {
      classes.forEach(c => {
        const bare = c.replace(/^!/, "").replace(/^(dark|light|rtl|ltr|ios|android):/, "");
        const hit = FORBIDDEN.find(([re]) => re.test(c) || re.test(bare));
        if (hit) add(n, `class “${c}”: ${hit[1]}`);
      });
      if (n.dataset.decor && !DECOR.includes(n.dataset.decor)) add(n, `data-decor outside the vocabulary: ${DECOR.join(", ")}`);
      if (n.dataset.gradient && !GRADIENTS.includes(n.dataset.gradient)) add(n, `data-gradient outside the vocabulary: ${GRADIENTS.join(", ")}`);
      if (n.dataset.motion && !MOTION.includes(n.dataset.motion)) add(n, `data-motion outside the vocabulary: ${MOTION.join(", ")}`);
      if (n.dataset.tint != null && !(free && n.dataset.decor === "glow" && /^#[0-9a-f]{6}$/i.test(n.dataset.tint))) add(n, 'data-tint: only on data-decor="glow" inside data-illustration, a six-digit hex');
      if (n.dataset.anim != null && n.tagName === "SPAN" && n.parentElement.closest("p,h1,h2,h3,h4,h5,h6,span")) add(n, "data-anim on part of a line doesn’t work — animate the whole text block");
      if (n.tagName === "I" && n.dataset.icon && !free && !classes.some(c => /^text-/.test(c))) add(n, `icon “${n.dataset.icon}” without a colour (text-<token>)`);
      const isText = TEXT_TAGS.includes(n.tagName);
      if (isText && !n.dataset.slot && !free && classes.some(c => TEXT_SIZE.test(c)) && !classes.some(c => /^leading-/.test(c)) && !n.parentElement.closest("p,h1,h2,h3,h4,h5,h6,span")) {
        add(n, "text size without leading-* — line height will differ between the browser and the app");
      }
      if (!isText && n.tagName !== "I" && n.tagName !== "IMG") {
        n.childNodes.forEach(c => c.nodeType === 3 && c.textContent.trim() && add(n, "text outside <p>/<span> — that’s an error in React Native"));
      }
    },
    checkKeyframes(rule, note) {
      const at = `@keyframes ${rule.name}`;
      const all = new Set();
      const edges = { "0%": null, "100%": null };
      let order = null;
      [...rule.cssRules].forEach(frame => {
        const props = [...frame.style];
        props.forEach(prop => {
          const value = frame.style.getPropertyValue(prop);
          if (!MOTION_PROP.test(prop)) return note(`${at}: “${prop}” doesn’t animate in the app — ${REBUILD}`);
          all.add(prop);
          if (/calc\(/.test(value)) note(`${at}: no calc() — write the final numbers`);
          if (/color|shadow/.test(prop)) {
            const rest = value.replace(/var\(--[\w-]+\)/g, "").replace(/color-mix\(in oklab,|transparent|currentcolor|inset|none|-?[\d.]+(px|%)?|[(),\s]/gi, "");
            if (rest) note(`${at}: colour in “${prop}” — tokens only: var(--accent) or color-mix(in oklab, var(--accent) 50%, transparent)`);
          }
        });
        frame.keyText.split(",").map(k => k.trim()).forEach(k => k in edges && (edges[k] = props));
        const tf = frame.style.transform;
        if (tf === "none") note(`${at}: no transform: none — write zeros: translateY(0) scale(1)`);
        else if (tf) {
          const fns = (tf.match(/[a-zA-Z0-9]+(?=\()/g) || []).filter(fn => fn !== "var");
          fns.forEach(fn => TRANSFORM_FN.test(fn) || note(`${at}: transform “${fn}” isn’t supported`));
          if (order == null) order = fns.join(" ");
          else if (order !== fns.join(" ")) note(`${at}: frames use different transform functions (“${order}” and “${fns.join(" ")}”) — use the same ones in the same order`);
        }
      });
      Object.entries(edges).forEach(([key, props]) => {
        const name = key === "0%" ? "from (0%)" : "to (100%)";
        if (!props) return note(`${at}: no ${name} frame — write the start and the end explicitly`);
        const missing = [...all].filter(prop => !props.includes(prop));
        if (missing.length) note(`${at}: the ${name} frame lacks “${missing.join(", ")}” — every property must be in both the first and the last frame`);
      });
    },
    /* Endless animations cost the phone on every frame: count them per State. */
    checkFile(add) {
      document.querySelectorAll("section[data-screen]").forEach(sec => {
        words(sec.dataset.states || "default").forEach(st => {
          const shown = n => {
            for (let a = n; a && a !== sec; a = a.parentElement) {
              if (a.dataset.when != null && !words(a.dataset.when).includes(st)) return false;
              if (a.dataset.unless != null && words(a.dataset.unless).includes(st)) return false;
            }
            return true;
          };
          const endless = [...sec.querySelectorAll("[data-anim]")].filter(n => /\binfinite\b/.test(n.dataset.anim) && shown(n)).length;
          if (endless > 60) add(sec, `State “${st}”: ${endless} endless animations — more than 60 is heavy for the phone; cut particles`);
        });
      });
    },
  };
})();
