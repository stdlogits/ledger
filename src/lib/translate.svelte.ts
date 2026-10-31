// English for text in other languages, when a product has it. Ledger draws the translation (a token or
// a label's term morphing into its English, a context in italic with its language, a term's tip) but
// owns no data: a product that translates installs a Translator once, before it mounts, with
// setTranslator. Without one, nothing is a term, contexts show their own text and terms have no tip.
import type { TipContent } from "./tips";

export interface Translator {
  /** Whether English is on: translated contexts show their English, and terms show theirs inline. */
  readonly on: boolean;
  /** Whether a token or term may have a translation. Such a token is a button (so a keyboard reaches
   * its tip), and only such runs of a label become terms. */
  maybe(text: string): boolean;
  /** The English to show inline in place of a term, short enough for a chip; "" for none, or with English off. */
  inline(text: string): string;
  /** A term's tip. `refresh` redraws it when its translation arrives. `mayLoad` is true on a fresh hover,
   * which may ask for the translations (again, after a failure), and false on that redraw, so a failed
   * load settles instead of retrying in a loop. */
  tip(term: string, refresh: () => void, mayLoad: boolean): TipContent | null;
}

const NONE: Translator = { on: false, maybe: () => false, inline: () => "", tip: () => null };

let current = $state.raw<Translator>(NONE);

/** The installed translator (a no-op one by default). Read inside a component's reactive code. */
export const translator = (): Translator => current;

/** Installs the product's translator; null restores the no-op one. */
export function setTranslator(next: Translator | null) {
  current = next ?? NONE;
}

/** Letters outside the Latin script: worth a lookup even before any translations have loaded. */
export const FOREIGN = /[^\P{L}\p{Script=Latin}]/u;
/** Runs of such letters (with their combining marks) inside running text, such as a label's quoted examples. */
export const FOREIGN_RUN = /(?:[^\P{L}\p{Script=Latin}]\p{M}*)+/gu;

let names: Intl.DisplayNames | null = null;
/** A language's English name from its code ("ja" → "Japanese"); the code itself when unknown. */
export function languageName(code: string): string {
  try {
    names ??= new Intl.DisplayNames(["en"], { type: "language" });
    return (code && names.of(code)) || code;
  } catch {
    return code;
  }
}
