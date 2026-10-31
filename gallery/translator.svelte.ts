// A stand-in for a product's translations: a few terms, and the English switch. neuron-lens.com's
// translator reads its catalog's terms.json the same way (README).
import { FOREIGN, languageName, type Translator } from "@stdlogits/ledger";

/** Term -> [English, romanization, ISO 639-1 language]. */
const TERMS: Record<string, [string, string, string]> = {
  猫: ["cat", "neko", "ja"],
  飞机: ["airplane", "fēijī", "zh"],
  собака: ["dog", "sobaka", "ru"],
  "ありがとう": ["thank you", "arigatō", "ja"],
};

export const english = $state({ on: false });

const termFor = (text: string) => TERMS[text.trim()];

export const translator: Translator = {
  get on() { return english.on; },
  maybe: (text) => FOREIGN.test(text) || termFor(text) !== undefined,
  inline(text) {
    if (!english.on) return "";
    return termFor(text)?.[0] ?? "";
  },
  tip(term) {
    const entry = termFor(term);
    if (!entry) return { title: term, sub: "No translation" };
    return { title: term, lang: entry[2], roman: entry[1] || undefined, body: entry[0], sub: languageName(entry[2]) };
  },
};
