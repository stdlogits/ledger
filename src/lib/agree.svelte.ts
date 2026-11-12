// What a scope's reads agree on, shared by every token in it: a word two reads name is tinted wherever it
// appears in its data-link-scope (a unit's page), not only in the lists that marked it, so one word never
// shows two ways on a page. A token from another language joins in by its English, while English is on.
import { SvelteMap } from "svelte/reactivity";

const scopes = new WeakMap<Element, SvelteMap<string, number>>();

/** The agreed words of the scope around an element (its own, outside any scope), by stem: how many tokens mark each. */
export function agreed(scope: Element): SvelteMap<string, number> {
  let words = scopes.get(scope);
  if (!words) {
    words = new SvelteMap();
    scopes.set(scope, words);
  }
  return words;
}
