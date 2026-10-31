<script lang="ts">
  import Icon from "./Icon.svelte";
  import type { Choice, Theme } from "../lib/theme.svelte";

  // The one theme button: it shows, names and tips what it would pick next (auto → the system's
  // opposite → the system's own look → auto), and its icons trade places with a quarter turn.
  let { theme }: { theme: Theme } = $props();
  const NEXT: Record<Choice, { icon: "sun" | "moon" | "auto"; label: string; tip: string }> = {
    light: { icon: "sun", label: "Use the light theme", tip: "Light" },
    dark: { icon: "moon", label: "Use the dark theme", tip: "Dark" },
    auto: { icon: "auto", label: "Follow the system's theme", tip: "Auto" },
  };
  const next = $derived(theme.next());
</script>

<button type="button" class="theme" onclick={() => theme.set(next)} aria-label={NEXT[next].label} data-tip={NEXT[next].tip}>
  {#each Object.values(NEXT) as option (option.icon)}<span class:on={option.icon === NEXT[next].icon}><Icon name={option.icon} /></span>{/each}
</button>

<style>
  .theme { position: relative; display: grid; place-items: center; width: 36px; height: 36px; padding: 0; border: 0; border-radius: var(--r-pill); background: transparent; color: var(--ink3); cursor: pointer; transition: background-color var(--fast) var(--ease), color var(--fast) var(--ease), scale var(--fast) var(--ease); }
  .theme:active { scale: 0.94; }
  @media (hover: hover) { .theme:hover { background: var(--wash); color: var(--ink); } }
  /* The icons trade places with a quarter turn. */
  .theme span { grid-area: 1 / 1; display: grid; opacity: 0; rotate: -90deg; scale: 0.6; transition: opacity var(--glide) var(--ease), rotate var(--glide) var(--ease), scale var(--glide) var(--ease); }
  .theme span.on { opacity: 1; rotate: 0deg; scale: 1; }
</style>
