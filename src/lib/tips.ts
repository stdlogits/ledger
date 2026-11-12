// The one tooltip: a pane of frosted glass that follows hover and focus. A single listener on the page
// covers every token chip (hovering one lights up its variants in the same `data-link-scope`, and a
// term from another language shows its English, from the product's translator), each translated
// context's language (its original text), and any element with data-tip (data-tip-title above it,
// data-tip-sub below). Components that draw their own targets, like an atlas, call showTip and hideTip
// directly.
import { languageName, translator } from "./translate.svelte";

const TARGET = ".tok, .term, [data-original], [data-tip]";

export interface TipContent { title?: string; body?: string; sub?: string; lang?: string; roman?: string }

let tip: HTMLDivElement | null = null;
let shownFor: Element | DOMRect | null = null;
/** How long a mouse rests on a target before its tip shows (focus and a tap show it at once). */
export const TIP_DELAY = 700;
/** A tip waiting for the pointer to rest: the latest thing it would show. */
let pending: { anchor: DOMRect | Element; content: TipContent } | null = null;
let pendingTimer: ReturnType<typeof setTimeout> | undefined;
const shownNow = () => !!tip && !tip.hidden;

function element(): HTMLDivElement {
  if (tip) return tip;
  tip = document.createElement("div");
  tip.className = "tip";
  tip.id = "tip";
  tip.setAttribute("role", "tooltip");
  tip.hidden = true;
  document.body.append(tip);
  return tip;
}

function line(className: string, text: string, lang?: string) {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  if (lang) span.lang = lang;
  return span;
}

/** Show the tip beside a box (above it when there is room). Moving between targets glides it. With `wait`
 * (a pointer passing over a chart), it shows once the pointer has been there TIP_DELAY, with whatever was
 * last asked for, unless a tip is already showing (then it moves to the new place at once). */
export function showTip(anchor: DOMRect | Element, content: TipContent, { wait = false }: { wait?: boolean } = {}) {
  if (wait && !shownNow()) {
    pending = { anchor, content };
    pendingTimer ??= setTimeout(() => {
      pendingTimer = undefined;
      const next = pending;
      pending = null;
      if (next) showTip(next.anchor, next.content);
    }, TIP_DELAY);
    return;
  }
  clearTimeout(pendingTimer);
  pendingTimer = undefined;
  pending = null;
  const node = element();
  const children = [];
  if (content.title) children.push(line("tip-title", content.title, content.lang));
  if (content.roman) children.push(line("tip-sub", content.roman));
  if (content.body) children.push(line("tip-body", content.body));
  if (content.sub) children.push(line("tip-sub", content.sub));
  if (!children.length) return hideTip();
  node.replaceChildren(...children);
  const wasShown = !node.hidden && node.classList.contains("shown");
  node.hidden = false;
  const box = anchor instanceof Element ? anchor.getBoundingClientRect() : anchor;
  node.style.maxWidth = `${Math.min(320, window.innerWidth - 24)}px`;
  const own = node.getBoundingClientRect();
  const left = Math.max(12, Math.min(window.innerWidth - own.width - 12, box.left + box.width / 2 - own.width / 2));
  const above = box.top - own.height - 8;
  const top = above > 8 ? above : box.bottom + 8;
  node.classList.toggle("gliding", wasShown);
  node.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  shownFor = anchor;
  if (!wasShown) requestAnimationFrame(() => { if (shownFor === anchor) node.classList.add("shown"); });
}

export function hideTip() {
  clearTimeout(pendingTimer);
  pendingTimer = undefined;
  pending = null;
  shownFor = null;
  if (!tip) return;
  tip.classList.remove("shown", "gliding");
  tip.hidden = true;
}

/** `mayLoad`: a fresh hover may ask for the translations (again, after a failure); the redraw when
 * they arrive may not, so a failed load settles instead of retrying in a loop (Translator.tip). */
function contentFor(target: HTMLElement, refresh: () => void, mayLoad: boolean): TipContent | null {
  const original = target.dataset.original;
  if (original) return { title: original, lang: target.dataset.lang, sub: languageName(target.dataset.lang ?? "") };
  if (target.dataset.tip) return { title: target.dataset.tipTitle, body: target.dataset.tip, sub: target.dataset.tipSub };
  const term = target.dataset.term;
  if (!term) return null;
  return translator().tip(term, refresh, mayLoad);
}

/** Svelte action for a page root: hover, focus and touch on any target inside it. A mouse's tip waits for
 * the pointer to rest (TIP_DELAY); a token's variants still light at once. */
export function tips(root: HTMLElement) {
  let linked: Element[] = [];
  let current: HTMLElement | null = null;
  /** The current target's tip is showing (not still waiting). */
  let revealed = false;
  let waiting: ReturnType<typeof setTimeout> | undefined;
  // A shown tip follows its target's words when they change under it (a button that toggles, say).
  const words = new MutationObserver(() => { if (current && revealed) show(current, false); });

  function clearLinked() {
    for (const node of linked) node.classList.remove("linked");
    linked = [];
  }

  function show(target: HTMLElement, mayLoad = true) {
    clearTimeout(waiting);
    revealed = true;
    const content = contentFor(target, () => { if (current === target && revealed) show(target, false); }, mayLoad);
    if (!content) { hideTip(); target.removeAttribute("aria-describedby"); return; }
    showTip(target, content);
    target.setAttribute("aria-describedby", "tip");
  }

  /** `now`: show the tip at once (focus, a tap), else once the pointer has rested on it, every time. */
  function enter(target: HTMLElement, now = true) {
    if (target === current) { if (now && !revealed) show(target); return; }
    // A tip shown at once glides from the last one; one that waits starts clear.
    leave(!now);
    current = target;
    const key = target.dataset.stem;
    const scope = target.closest("[data-link-scope]");
    if (key && scope) {
      linked = [...scope.querySelectorAll(`.tok[data-stem="${CSS.escape(key)}"]`)];
      if (linked.length > 1) for (const node of linked) node.classList.add("linked");
      else linked = [];
    }
    words.observe(target, { attributeFilter: ["data-tip", "data-tip-title", "data-tip-sub"] });
    if (now) show(target);
    else waiting = setTimeout(() => { if (current === target) show(target); }, TIP_DELAY);
  }

  function leave(hide = true) {
    clearTimeout(waiting);
    revealed = false;
    words.disconnect();
    clearLinked();
    current?.removeAttribute("aria-describedby");
    current = null;
    if (hide) hideTip();
  }

  const targetOf = (event: Event) => (event.target as Element | null)?.closest?.<HTMLElement>(TARGET) ?? null;
  const over = (event: Event) => {
    const target = targetOf(event);
    // A mouse waits to rest; focus and a touch don't.
    if (target && root.contains(target)) enter(target, !(event instanceof PointerEvent && event.pointerType === "mouse"));
  };
  const out = (event: PointerEvent | FocusEvent) => {
    // Focus-driven scrolling moves the element under a still pointer: keep a focused target's tip.
    if (event.type === "pointerout" && current?.contains(document.activeElement)) return;
    const next = event.relatedTarget as Element | null;
    if (next && tip?.contains(next)) return;
    if (!next || !current?.contains(next)) {
      if (!next?.closest?.(TARGET)) leave();
    }
  };
  // Touch: a tap shows the tip; a tap elsewhere hides it.
  const down = (event: PointerEvent) => {
    if (event.pointerType === "mouse") return;
    const target = targetOf(event);
    if (target && root.contains(target)) enter(target);
    else leave();
  };
  const key = (event: KeyboardEvent) => { if (event.key === "Escape") leave(); };
  const scroll = () => {
    if (!current) return;
    const box = current.getBoundingClientRect();
    if ((current.contains(document.activeElement) || current.matches(":hover")) && box.bottom > 0 && box.top < window.innerHeight) { if (revealed) show(current, false); }
    else leave();
  };

  root.addEventListener("pointerover", over);
  root.addEventListener("pointerout", out);
  root.addEventListener("focusin", over);
  root.addEventListener("focusout", out);
  document.addEventListener("pointerdown", down);
  document.addEventListener("keydown", key);
  window.addEventListener("scroll", scroll, { passive: true });

  return {
    destroy() {
      clearTimeout(waiting);
      leave();
      root.removeEventListener("pointerover", over);
      root.removeEventListener("pointerout", out);
      root.removeEventListener("focusin", over);
      root.removeEventListener("focusout", out);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", scroll);
    },
  };
}
