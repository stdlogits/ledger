# Ledger

`@stdlogits/ledger` is Ledger, the design language of Standard Logits: flat and borderless, one depth
accent, Wix Madefor, motion on one curve. It holds the tokens, base styles and faces, the motion, the
tip, the theme, and the Svelte 5 pieces drawn in them. [`DESIGN.md`](DESIGN.md) is the design.

## Use it

Pin it as a git dependency (Svelte 5.57 or newer, Vite with `@sveltejs/vite-plugin-svelte`; the package
ships TypeScript and `.svelte` sources for the product to compile):

```json
"dependencies": { "@stdlogits/ledger": "github:stdlogits/ledger#v0.1.3" }
```

Keep it out of Vite's dependency pre-bundling, and compile it into a server build:

```ts
// vite.config.ts
export default defineConfig({
  plugins: [svelte()],
  optimizeDeps: { exclude: ["@stdlogits/ledger"] },
  ssr: { noExternal: ["@stdlogits/ledger"] }, // only when the product renders on the server
});
```

The pre-bundler hands Ledger's runes modules (`theme.svelte.ts`, `translate.svelte.ts`) to Svelte with
their types still in, so the dev server must serve Ledger as source. Use `@sveltejs/vite-plugin-svelte`
7.1.2 or newer: before it, the dev server can't find an excluded package's compiled styles and serves
each piece's raw `.svelte` source as its stylesheet, which drops the piece's first rule and leaks the
rest, unscoped, onto the whole page. Production builds were never affected.

```ts
// main.ts
import "@stdlogits/ledger/ledger.css"; // or fonts.css, tokens.css, base.css, in that order
```

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  import { ThemeButton, Token, createTheme, tips } from "@stdlogits/ledger";
  const theme = createTheme({ key: "neuron-lens.theme" });
  onMount(() => theme.start());
</script>

<div use:tips>
  <ThemeButton {theme} />
  <Token token=" release" value={4.2} />
</div>
```

Load the pre-paint script in the head with the same key, served from the product's own origin (copy
`src/theme-preflight.js` into `public/`, or serve and emit it as this repository's `vite.config.ts`
does):

```html
<script src="/theme-preflight.js" data-ledger-theme-key="neuron-lens.theme"></script>
```

A product that has English for foreign text installs a translator before it mounts; without one,
nothing is a term and contexts show their own text.

## The gallery

Every piece on one page, with the theme button and a stand-in translator: `npm install`, then
`npm run dev` (http://localhost:5197). `npm run check` must be clean; `npm run build` writes
`gallery/dist`.

## What stays in neuron-lens.com

- The no-script summary's rules (`#app > .summary` in its `base.css`), which its `scripts/site/meta.ts`
  writes into `index.html`.
- Its translations: `src/lib/translate.svelte.ts` keeps loading `terms.json` and the English switch,
  and becomes the site's `Translator`, installed in `main.ts` before `mount`:

  ```ts
  setTranslator({
    get on() { return translation.on; },
    maybe: maybeForeign,
    inline: inlineEnglish,
    tip(term, refresh, mayLoad) {
      if (!termsReady() && mayLoad) void ensureTerms().then(refresh);
      const entry = termFor(term);
      if (!entry) return { title: term, sub: termsReady() || (translation.failed && !mayLoad) ? "No translation" : "Translating…" };
      return { title: term, lang: entry[2], roman: entry[1] || undefined, body: entry[0], sub: languageName(entry[2]) };
    },
  });
  ```

- The catalog's types and loaders (`src/lib/data.ts`). Its `tokenParts`, `stem`, `segments` and
  `formatValue` now come from here; its `Context` type is `ContextLine`.
- The header's placement of the theme button (its `margin-left: calc(var(--s2) * -1)`); the button is
  `ThemeButton`, driven by `createTheme({ key: "neuron-lens.theme" })` in place of
  `theme.svelte.ts`, and `public/theme.js` becomes `theme-preflight.js` with that key.
- The depth ramp per model (`depthColor` in `src/lib/models.ts`), the mark, the card and the icons.

## Provenance

Extracted from neuron-lens.com at commit `53753e9dcb79834c7eeef5bef32f0cceda9a1f2f`: `src/styles`,
`src/assets/fonts`, `src/ui`, `src/lib/{motion,tips,textMotion,theme.svelte}.ts`, `public/theme.js`
and `DESIGN.md`.

## Credits

By a9lim, treetown and Claude. Wix Madefor is by the Wix Madefor Project Authors, under the SIL Open
Font License 1.1 (`src/fonts/LICENSE-Wix-Madefor.txt`).

## License

[AGPL-3.0-or-later](LICENSE).
