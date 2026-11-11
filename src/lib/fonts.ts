// Re-measure once web fonts arrive, without reading `document.fonts.ready`. In Chrome, reading `ready`
// once it has settled forces a synchronous style and layout update, so a getter on every mount (a
// glide thumb, a morph) made each step that mounts several pieces pay for whole-page style work. The
// set's `loadingdone` and `loadingerror` events fire when a batch of faces settles, the moment `ready`
// would resolve; one listener per page serves every piece. A face that starts loading after a piece
// mounts (a script subset first used later) reaches it too, as `ready`, read once at mount, did not.

const waiting = new Set<() => void>();
let listening = false;

function settled() {
  for (const callback of [...waiting]) callback();
}

/** Call `callback` each time a batch of fonts finishes loading, until the returned function is called. */
export function onFontsLoad(callback: () => void): () => void {
  const fonts = typeof document === "undefined" ? undefined : document.fonts;
  if (!fonts?.addEventListener) return () => {};
  if (!listening) {
    fonts.addEventListener("loadingdone", settled);
    fonts.addEventListener("loadingerror", settled);
    listening = true;
  }
  waiting.add(callback);
  return () => { waiting.delete(callback); };
}
