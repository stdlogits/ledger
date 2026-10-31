// Auto, light or dark. Auto follows the system and stores nothing; theme-preflight.js applies a stored
// light or dark before first paint. The button (ThemeButton) steps auto → the system's opposite → the
// system's own look → auto, so every step but the last changes what the page looks like. A change of
// look cross-fades the whole page (a view transition).
//
// Each product keeps its own storage key, the same one its preflight script names:
//   export const theme = createTheme({ key: "neuron-lens.theme" });

export type Mode = "light" | "dark";
export type Choice = Mode | "auto";

const dark = () => matchMedia("(prefers-color-scheme: dark)");
const system = (): Mode => (dark().matches ? "dark" : "light");

export function createTheme({ key }: { key: string }) {
  const stored = (): Mode | null => {
    try {
      const value = localStorage.getItem(key);
      return value === "light" || value === "dark" ? value : null;
    } catch {
      return null;
    }
  };

  /** `choice` is what the viewer picked, `system` the system's look, `mode` the look the page has. */
  const state = $state<{ choice: Choice; system: Mode; mode: Mode }>({ choice: "auto", system: "light", mode: "light" });

  return {
    get choice(): Choice { return state.choice; },
    get system(): Mode { return state.system; },
    get mode(): Mode { return state.mode; },

    /** Reads the stored choice and follows the system's look; returns the stop function. */
    start() {
      state.choice = stored() ?? "auto";
      state.system = system();
      state.mode = state.choice === "auto" ? state.system : state.choice;
      const media = dark();
      const follow = () => {
        state.system = system();
        if (state.choice === "auto") state.mode = state.system;
      };
      media.addEventListener("change", follow);
      return () => media.removeEventListener("change", follow);
    },

    /** What the theme button would pick next. */
    next(): Choice {
      if (state.choice === "auto") return state.system === "dark" ? "light" : "dark";
      return state.choice === state.system ? "auto" : state.system;
    },

    set(choice: Choice) {
      const mode = choice === "auto" ? state.system : choice;
      const root = document.documentElement;
      const apply = () => {
        state.choice = choice;
        state.mode = mode;
        if (choice === "auto") delete root.dataset.theme;
        else root.dataset.theme = choice;
        try {
          if (choice === "auto") localStorage.removeItem(key);
          else localStorage.setItem(key, choice);
        } catch { /* storage blocked */ }
      };
      if (mode === state.mode || typeof document.startViewTransition !== "function" || matchMedia("(prefers-reduced-motion: reduce)").matches) return apply();
      root.dataset.vt = "theme";
      document.startViewTransition(apply).finished.finally(() => delete root.dataset.vt);
    },
  };
}

export type Theme = ReturnType<typeof createTheme>;
