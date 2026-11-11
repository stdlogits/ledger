# AGENTS.md

## What this is

`@stdlogits/ledger` is Ledger, the design language of every Standard Logits product
(standardlogits.com, neuron-lens.com, drowse.ai, the drowse dashboard), as a package of source: the
tokens, base styles and Wix Madefor faces, the motion, the tip, the theme, and the Svelte 5 pieces drawn
in them. `DESIGN.md` is the design; it and `src/` are the source of truth. It was extracted from
neuron-lens.com, which used to define Ledger (README, provenance).

**A change here is a change to Ledger.** Every product draws in it and sees the change at its next pin
bump. Change `DESIGN.md` in the same commit, re-sync the design system made from it
(https://claude.ai/artifact/EySC7fJPJAtVAmhFndggfx), and look at the gallery in both themes and at
320 px. A piece's markup, styling and motion change only as a deliberate change to Ledger, never as a
side effect of serving one product.

## Layout

- `src/index.ts`: the one JS entry (the pieces, motion, the tip, the theme, tokens, translation).
- `src/styles/`: `tokens.css`, `base.css`, `fonts.css`, and `ledger.css`, which imports the three in
  that order.
- `src/fonts/`: Wix Madefor Display and Text, split by script, with their OFL licence.
- `src/lib/`: `motion.ts` (the curve, durations, transitions, `glide`), `textMotion.ts` (Torph, under
  `MorphText`), `tips.ts`, `theme.svelte.ts` (`createTheme`), `tokens.ts` (how tokens and contexts are
  split and shown), `translate.svelte.ts` (the `Translator` seam and its no-op default).
- `src/ui/`: the pieces.
- `src/theme-preflight.js`: the pre-paint theme script, a classic script that reads its
  `data-ledger-theme-key` attribute.
- `gallery/`: every piece on one page, the Vite root. It imports the package by its own name, so it goes
  through the exports map as a product does; `vite.config.ts` serves `theme-preflight.js` the way a
  product would. `gallery/translator.svelte.ts` is a stand-in translator.

## Rules

- Pieces take no product data and import nothing from a product. What a product supplies comes in by
  props, by CSS (`--tint`, set for the current depth) or by an injected seam (`setTranslator`, whose
  no-op default must leave every piece correct without one).
- Ship source: TypeScript and `.svelte`, no build step and no `dist`. Products compile it with Vite and
  `@sveltejs/vite-plugin-svelte`. Runes live in `.svelte.ts` modules. Write TypeScript that Svelte 5
  strips natively (types only: no enums, no parameter properties), so no product needs a preprocessor for
  it, and that passes a strict product `tsconfig` (`@tsconfig/svelte`, `verbatimModuleSyntax`).
- The exports map has one JS entry, `.` (`types` and `svelte` conditions), and plain entries for each CSS
  file, `fonts/*` and `theme-preflight.js`. A new public file goes into `exports` and into `DESIGN.md`'s
  Pieces; a new piece or helper goes into `src/index.ts`, `DESIGN.md` and the gallery.
- `DESIGN.md`'s rules hold here as everywhere: flat and borderless, the tint only as fill, Wix Madefor
  only with tabular numbers, one curve, reduced motion keeps fades and drops movement, and nothing
  scrolls sideways down to 320 px.
- `torph` is pinned exactly; `svelte` is a peer. Dev dependencies are pinned to the versions
  neuron-lens.com uses; move them together. Node 24 or newer.

## How products pin it

As a git dependency at a tag or a commit, never a branch:

```json
"dependencies": { "@stdlogits/ledger": "github:stdlogits/ledger#v0.1.3" }
```

To release: bump `version` in `package.json`, commit, tag `v<version>`, push the tag; each product then
moves its pin. While 0.x, a breaking change (a renamed export or prop, a renamed token) bumps the minor
version and says in its commit what products change.

## Commands

```bash
npm install
npm run check        # svelte-check: must be clean
npm run dev          # the gallery, http://localhost:5197
npm run build        # the gallery, into gallery/dist
npm run preview      # the built gallery, http://localhost:5198
npm pack             # the tarball a git install produces
```

The consumer check for a change to `exports`, a new module or a new dependency: install the `npm pack`
tarball into a scratch Vite + Svelte app with a strict `tsconfig`, and run its `svelte-check` and
`vite build`. Pieces resolve from `node_modules` there, unlike in the gallery.

## License

AGPL-3.0-or-later (`LICENSE`). Wix Madefor is under the SIL Open Font License 1.1
(`src/fonts/LICENSE-Wix-Madefor.txt`), which ships beside the fonts.
