# Design

Ledger, the design language of Standard Logits: white paper, two washes, three inks, one accent, no
lines.

Every Standard Logits surface (standardlogits.com, neuron-lens.com, drowse.ai, the drowse dashboard)
is drawn in it, and this package, `@stdlogits/ledger`, defines it: this file and `src/styles`,
`src/lib`, `src/ui` are the source of truth, and a change here is a change to Ledger. The design system
made from them (tokens for both themes, the fonts, a brand book with voice, states and contrast, and a
card per piece) is https://claude.ai/artifact/EySC7fJPJAtVAmhFndggfx; re-sync it when this changes.

## Principles

- **Flat and borderless.** Surfaces are told apart by fill alone: paper, then `--wash`, then
  `--wash2` for something chosen. No borders, rules, outlines (except focus), side bars or shadows.
  The one shadow is under the tip, a pane of frosted glass in the page's own colours.
- **One accent, sparingly.** The accent is depth: a layer's place on the ramp from `--deep` (violet,
  layer 0) to `--late` (cyan, the last layer), set as `--tint` by the product for the current
  depth (in neuron-lens.com's explorer, the current layer). It fills (a marked token, a meter, a
  bar); it never colours text.
- **Show, don't tell.** No explanatory paragraphs or provenance in a working view. A number, a token
  or a picture beats a sentence; a sentence that is still needed goes in a tip (`data-tip`) or on
  an About page. (neuron-lens.com's explorer carries one credit, "Labels by Claude Haiku 5.5".)
- **One family.** Wix Madefor Display for titles and IDs, Wix Madefor Text for everything else.
  No monospace, no capitals, tabular numerals wherever numbers line up.
- **Motion everywhere, noticed nowhere.** Every change moves, quickly, on one curve. Nothing loops,
  pulses, sweeps or ripples.

## The mark and the card

neuron-lens.com's mark (`public/favicon.svg` there) is a lens cut from the depth ramp: a tile rounded
at a quarter of its side, filled left to right from `--deep` to `--late` through their oklch mix (the
one place the whole ramp is a single gradient), with an upright biconvex lens in the paper's colour,
white in light and `#0B0D12` in dark, each theme on its own ramp. Where a platform rounds or masks
icons itself, the tile goes full bleed. Its social card (`scripts/site/card.html` there) is the
explorer in miniature: the mark and name, one unit's ID, a firing on a wash and its writes as chips,
over the model's atlas at the explorer's geometry. No sentences.

## Tokens (`src/styles/tokens.css`)

| | light | dark |
| --- | --- | --- |
| `--paper` | `#FFFFFF` | `#0B0D12` |
| `--wash` | `#F4F5F7` | `#151821` |
| `--wash2` | `#EBEDF1` | `#1D212B` |
| `--ink` | `#0E1117` | `#EEF1F7` |
| `--ink2` | `#464F61` | `#AEB6C6` |
| `--ink3` | `#636B7D` | `#8A93A6` |
| `--deep` | `#6A4FE0` | `#A08BFF` |
| `--late` | `#0B87AD` | `#4FD8F5` |

The theme is auto (the system's look, stored nowhere), light or dark. The one theme button
(`ThemeButton`) steps auto → the system's opposite → the system's own look → auto, showing and naming
the step it would take, so every step but the last changes the page. Each product stores the choice
under its own key: `createTheme({ key })` owns it, and `theme-preflight.js`, loaded in the head with
the same key in `data-ledger-theme-key`, applies it before first paint.

Tints of the accent, always mixed with `color-mix(in oklch, …)`: 9% (a token a head attended to),
14% (a token two reads agree on), 22% (the token a unit fired on), 26% (variants of a hovered token).

Type, as `font:` shorthands: `--type-title` 56 Display 600, `--type-heading` 32 Display 600,
`--type-lead` 20/500, `--type-label` 16/500, `--type-body` 16/400, `--type-small` 14/400,
`--type-control` 14/500, `--type-meta` 12/500, `--type-head` 12/600 (section heads, in `--ink3`).

Space: `--s1`…`--s9` = 4, 8, 12, 16, 24, 32, 48, 64, 96. Radii: `--r-chip` 6, `--r-col` 8,
`--r-box` 12, `--r-row` 16, `--r-pill`.

## Motion (`src/lib/motion.ts`)

One curve, `--ease` = `cubic-bezier(.2, 0, 0, 1)` (`ease` in JS).

| What | How |
| --- | --- |
| Hover, press | 120 ms (`--fast`): colour or wash; buttons and segments press to 0.97, round icon buttons (`IconButton`, `ThemeButton`) to 0.94, list rows to 0.99, faces rows to 0.995 |
| A selection moving | 240 ms (`--glide`): the `glide` action slides one thumb under the chosen child (segmented controls, the atlas column, the layer list, the faces table); an inert page around it doesn't hide the thumb, so a control in a closed `Expander` is ready when the fold opens |
| Content changing | out 120 ms, in 200 ms with a 6 px rise (`Swap`, `rise`, `fadeOut`) |
| Lists appearing | 24 ms apart, 160 ms at most (`.rise` with `--i`, `stagger(i)`) |
| Opening | height and fade together, 240 ms (`Expander`, `expand`) |
| The atlas arriving | columns 16 ms apart, once per load |
| Pages, theme | the new view fades in over the old (view transitions) |
| Text that changes in place | letter morph (`MorphText`, Torph) |

Reduced motion keeps fades and drops movement.

## Pieces (`src/ui`, `src/lib`)

Everything here is exported from `@stdlogits/ledger`. The styles are separate entries:
`@stdlogits/ledger/ledger.css` (or `fonts.css`, `tokens.css`, `base.css`, in that order), the faces
`@stdlogits/ledger/fonts/*`, and the pre-paint script `@stdlogits/ledger/theme-preflight.js`.

- **Controls.** `Segmented` (a few exclusive options, ink thumb), `Tabs` (many options, text only),
  `Switch`, `IconButton` (36 px round wash), `ThemeButton` (the one theme button), `Icon` (and
  `IconName`: search, up, down, left, right, link, check, close, external, sun, moon, auto, play,
  pause, menu; 24-unit strokes, round caps), `Expander` (a text button that opens below).
- **Tokens.** `Token` (a wash chip; · marks a word start, ×n variants, a value in 12 px), `Context` (a
  firing on a wash, the token marked), `LabelText` (a label whose foreign terms translate), `Meter` (a
  24 × 4 tint bar). Their text conventions are in `src/lib/tokens.ts`: `tokenParts` (a leading space
  marks a word start, a leading U+0001 a byte piece), `stem` (the variant key hovering links),
  `segments` (⟦ ⟧ the token where a unit fired, ⟪ ⟫ the token a head attended to), `formatValue`, and
  the `ContextLine` type.
- **Motion.** `Swap`, `MorphText` (over `textMotion`), and from `src/lib/motion.ts` the curve `ease`,
  `FAST`, `GLIDE`, `OUT`, `IN`, the transitions `rise`, `fadeIn`, `fadeOut`, `swell`, `expand`,
  `stagger`, `reducedMotion` and the `glide` action.
- **The tip** (frosted glass, blurred behind) is one element for the page (`src/lib/tips.ts`): put
  `use:tips` on the page root and give anything `data-tip` (and optionally `data-tip-title`,
  `data-tip-sub`), or call `showTip`/`hideTip`. Tokens inside a `data-link-scope` light up their
  variants.
- **The theme.** `createTheme({ key })` (`choice`, `system`, `mode`, `start`, `next`, `set`) and
  `theme-preflight.js`.
- **Translation.** Ledger draws English for foreign text and owns none of it. A product that has
  translations installs a `Translator` with `setTranslator` before it mounts (`on`, `maybe`, `inline`,
  `tip`); without one, nothing is a term, contexts show their own text and terms have no tip.
  `FOREIGN`, `FOREIGN_RUN` and `languageName` are the shared helpers.
