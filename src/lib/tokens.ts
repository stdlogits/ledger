// Tokens and contexts as Ledger shows them (Token, Context). A token is a tokenizer's piece of text: a
// leading space marks a word start, and a leading U+0001 marks a byte piece (a fragment of a character
// that is not text by itself). A context is a stretch of text with one token marked: ⟦ ⟧ the token
// where a unit fired, ⟪ ⟫ the token an attention head read from.

/** A context: the text with its marks, then its English and language (ISO 639-1) when translated. */
export type ContextLine = [text: string, en?: string, lang?: string];

export interface TokenParts { lead: boolean; text: string; trail: boolean; byte: boolean; empty: boolean }

/** Splits a token for display: a leading space marks a word start, byte pieces are marked, whitespace is made visible. */
export function tokenParts(raw: string): TokenParts {
  if (raw.startsWith("\u0001")) return { lead: false, text: raw.slice(1), trail: false, byte: true, empty: false };
  const lead = raw.startsWith(" ");
  const trail = raw.length > 1 && raw.endsWith(" ") && raw.trim() !== "";
  let text = raw.trim() === "" ? raw : raw.slice(lead ? 1 : 0, trail ? -1 : undefined);
  text = text.replace(/\n/g, "⏎").replace(/\r/g, "␍").replace(/\t/g, "⇥");
  if (text.trim() === "" && text.length) text = text.replace(/ /g, "␣");
  return { lead, text, trail, byte: false, empty: text === "" };
}

/** Variant key: case, leading punctuation and common English suffixes removed. Hovering a token lights
 * up the tokens with the same key in its `data-link-scope` (lib/tips.ts). */
export function stem(token: string): string {
  if (token.startsWith("\u0001")) return token;
  let key = token.trim().toLowerCase().replace(/^[_\-.]+/, "").replace(/^[/([]+/, "");
  for (const suffix of ["ing", "ed", "es", "s", "ly"]) {
    if (key.endsWith(suffix) && key.length - suffix.length >= 4) { key = key.slice(0, -suffix.length); break; }
  }
  return key.endsWith("e") && key.length > 4 ? key.slice(0, -1) : key;
}

export interface Segment { text: string; mark: "hit" | "src" | null }

/** A context split at its marks: ⟦ ⟧ the token where the unit fired, ⟪ ⟫ the token a head attended to. */
export function segments(text: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const match of text.matchAll(/⟦([^⟧]*)⟧|⟪([^⟫]*)⟫/g)) {
    const at = match.index ?? 0;
    if (at > last) out.push({ text: text.slice(last, at), mark: null });
    out.push({ text: match[1] ?? match[2] ?? "", mark: match[1] !== undefined ? "hit" : "src" });
    last = at + match[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), mark: null });
  return out;
}

/** A token's measured value, to two or three significant figures. */
export const formatValue = (value: number) =>
  Math.abs(value) >= 10 ? value.toFixed(0) : Math.abs(value) >= 1 ? value.toFixed(1) : value.toPrecision(2);
