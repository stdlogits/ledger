import { TextMorph } from "torph";
import { onFontsLoad } from "./fonts";

export type TextMotionOptions = {
  text: string;
  numbers: boolean;
  duration: number;
  disabled: boolean;
  identity?: string | number | null;
};

const work = new Map<Element, () => void>();
let frame = 0;

function schedule(element: Element, run: () => void) {
  work.set(element, run);
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    const jobs = [...work.values()];
    work.clear();
    for (const job of jobs) job();
  });
}

const subscribers = new Map<Element, { visible: boolean; update: () => void }>();
let intersection: IntersectionObserver | null = null;
let resize: ResizeObserver | null = null;
let reduced: MediaQueryList | null = null;

function refreshMotion() {
  for (const { update } of subscribers.values()) update();
}

function observe(element: Element, update: () => void) {
  if (!intersection) {
    reduced = matchMedia("(prefers-reduced-motion: reduce)");
    reduced.addEventListener("change", refreshMotion);
    document.addEventListener("visibilitychange", refreshMotion);
    document.addEventListener("selectionchange", refreshMotion);
    intersection = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const subscriber = subscribers.get(entry.target);
        if (!subscriber) continue;
        subscriber.visible = entry.isIntersecting;
        subscriber.update();
      }
    });
    resize = new ResizeObserver(entries => {
      for (const entry of entries) subscribers.get(entry.target)?.update();
    });
  }
  subscribers.set(element, { visible: false, update });
  intersection.observe(element);
  resize!.observe(element);
  return () => {
    work.delete(element);
    subscribers.delete(element);
    intersection!.unobserve(element);
    resize!.unobserve(element);
    if (subscribers.size) return;
    intersection!.disconnect();
    resize!.disconnect();
    intersection = null;
    resize = null;
    reduced!.removeEventListener("change", refreshMotion);
    reduced = null;
    document.removeEventListener("visibilitychange", refreshMotion);
    document.removeEventListener("selectionchange", refreshMotion);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
}

// The real text owns layout, selection, and accessibility. Torph only paints
// a non-interactive overlay, so interrupted motion cannot change the value.
export function textMotion(node: HTMLElement, initial: TextMotionOptions) {
  const host = node.parentElement!;
  const source = host.querySelector<HTMLElement>(".morph-source")!;
  let options = initial;
  let morph: TextMorph | null = null;
  let config = "";
  let disposed = false;
  let settleTimer: ReturnType<typeof setTimeout> | undefined;
  // A value that changes faster than its morph (a token count while a reply streams) shows as plain
  // text: Torph measures and restarts every letter on each change, which costs more than the frame
  // it paints. A change that lands while a morph still runs drops the overlay, and the text morphs
  // again once it has been still for one duration, from the text on screen.
  let shown = "";
  let movingUntil = 0;
  let streaming = false;
  let streamTimer: ReturnType<typeof setTimeout> | undefined;

  // Torph adds its own screen-reader copy, but the real text already lives in
  // `.morph-source`; remove it so the DOM holds the text once for search and agents.
  function dropAccessibleCopy() {
    for (const copy of node.querySelectorAll("[torph-sr]")) copy.remove();
  }

  // Once motion ends, hide the overlay again so idle text is plain, visible DOM.
  // Torph keeps its painted items, so the next change still morphs from the old text.
  function settle() {
    clearTimeout(settleTimer);
    if (disposed) return;
    const running = node.getAnimations({ subtree: true }).some(animation => animation.playState === "running");
    if (running) { settleTimer = setTimeout(settle, 60); return; }
    dropAccessibleCopy();
    host.removeAttribute("data-morph-active");
  }

  function clear() {
    clearTimeout(settleTimer);
    morph?.destroy();
    morph = null;
    node.replaceChildren();
    node.removeAttribute("style");
    host.removeAttribute("data-morph-active");
  }

  function paint() {
    if (disposed) return;
    const previous = shown;
    const changed = options.text !== previous;
    // During a stream every paint stays plain, a resize's too; only a change restarts the wait.
    if (streaming || (changed && performance.now() < movingUntil)) {
      if (!streaming) clear();
      streaming = true;
      shown = options.text;
      if (changed) {
        clearTimeout(streamTimer);
        streamTimer = setTimeout(() => { streaming = false; }, options.duration);
      }
      return;
    }
    shown = options.text;
    // The same words again (fonts arriving, a resize, a parent handing down an equal value): nothing to morph.
    // Idle text stays plain, and the painted copy is dropped so the next change measures afresh, from these words.
    if (!changed && !host.hasAttribute("data-morph-active")) {
      if (morph) { morph.destroy(); morph = null; node.replaceChildren(); node.removeAttribute("style"); }
      return;
    }
    const selected = document.getSelection();
    const enabled = !options.disabled && !reduced?.matches && !document.hidden
      && subscribers.get(host)?.visible && !host.closest("[inert]")
      && (!selected || selected.isCollapsed) && options.text.length <= 100
      && !options.text.includes("\n");
    if (!enabled) { clear(); return; }
    const style = getComputedStyle(source);
    const line = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.4;
    if (source.getBoundingClientRect().height > line * 1.5) { clear(); return; }
    const numbers = options.numbers && !/[eE][+-]?\d/.test(options.text);
    const nextConfig = JSON.stringify([options.duration, numbers, options.identity, host.closest("[data-morph-snapshot]")?.getAttribute("data-morph-snapshot")]);
    let animates = changed;
    if (!morph || config !== nextConfig) {
      // After plain text (a stream, or a pause off screen) the overlay starts from the text that was
      // shown, so the next change morphs from it; a new identity starts fresh and does not morph.
      const from = !morph && config === nextConfig ? previous : "";
      animates = changed && from !== "";
      clear();
      config = nextConfig;
      morph = new TextMorph({
        element: node,
        numbers,
        duration: options.duration,
        ease: "cubic-bezier(0.2, 0, 0, 1)",
        scale: false,
        respectReducedMotion: false,
        onAnimationComplete: () => requestAnimationFrame(() => {
          if (disposed) return;
          for (const animation of node.getAnimations({ subtree: true })) {
            if (animation.playState === "finished") animation.cancel();
          }
          settle();
        }),
      });
      if (from) morph.update(from);
    }
    morph.update(options.text);
    if (animates) movingUntil = performance.now() + options.duration;
    dropAccessibleCopy();
    host.setAttribute("data-morph-active", "");
    // Torph does not report completion when nothing changed, so settle on a timer as well.
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, options.duration + 120);
  }

  const queue = () => schedule(host, paint);
  const stop = observe(host, queue);
  const unfonts = onFontsLoad(queue);
  return {
    update(next: TextMotionOptions) {
      const same = next.text === options.text && next.numbers === options.numbers && next.duration === options.duration && next.identity === options.identity && next.disabled === options.disabled;
      options = next;
      // An equal value (a parent's state recomputed) leaves a morph under way, or plain text, as it is.
      if (same) return;
      host.removeAttribute("data-morph-active");
      queue();
    },
    destroy() { disposed = true; clearTimeout(streamTimer); unfonts(); stop(); clear(); },
  };
}
