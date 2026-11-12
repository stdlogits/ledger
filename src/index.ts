// @stdlogits/ledger: Ledger, the design language of Standard Logits. The styles are separate entries
// (@stdlogits/ledger/ledger.css, or tokens.css, base.css and fonts.css); this is everything else.

// Pieces.
export { default as Context } from "./ui/Context.svelte";
export { default as Expander } from "./ui/Expander.svelte";
export { default as Icon, type IconName } from "./ui/Icon.svelte";
export { default as IconButton } from "./ui/IconButton.svelte";
export { default as LabelText } from "./ui/LabelText.svelte";
export { default as Meter } from "./ui/Meter.svelte";
export { default as MorphText } from "./ui/MorphText.svelte";
export { default as Segmented } from "./ui/Segmented.svelte";
export { default as Swap } from "./ui/Swap.svelte";
export { default as Switch } from "./ui/Switch.svelte";
export { default as Tabs } from "./ui/Tabs.svelte";
export { default as ThemeButton } from "./ui/ThemeButton.svelte";
export { default as Token } from "./ui/Token.svelte";

// Motion: the curve, the durations, the transitions and the glide action.
export { FAST, GLIDE, IN, OUT, ease, expand, fadeIn, fadeOut, glide, reducedMotion, rise, stagger, swell } from "./lib/motion";
export { textMotion, type TextMotionOptions } from "./lib/textMotion";

// The tip.
export { TIP_DELAY, hideTip, showTip, tips, type TipContent } from "./lib/tips";

// The theme.
export { createTheme, type Choice, type Mode, type Theme } from "./lib/theme.svelte";

// Tokens and contexts.
export { formatValue, segments, stem, tokenParts, type ContextLine, type Segment, type TokenParts } from "./lib/tokens";

// Translation, injected by a product that has it.
export { FOREIGN, FOREIGN_RUN, languageName, setTranslator, translator, type Translator } from "./lib/translate.svelte";
