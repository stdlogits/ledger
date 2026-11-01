<script lang="ts">
  import { onMount } from "svelte";
  import {
    Context, Expander, Icon, IconButton, LabelText, Meter, MorphText, Segmented, Swap, Switch, Tabs, ThemeButton, Token,
    createTheme, expand, fadeIn, fadeOut, glide, hideTip, rise, showTip, stagger, swell, tips,
    type ContextLine, type IconName,
  } from "@stdlogits/ledger";
  import pkg from "@stdlogits/ledger/package.json";
  import { english } from "./translator.svelte";

  // Every piece of Ledger on one page, in whichever theme the button picks.
  const theme = createTheme({ key: "ledger.gallery.theme" });
  onMount(() => theme.start());

  // The depth the accent stands for: deep's share of the mix, 100 at the first layer, 0 at the last.
  const DEPTHS = [
    { value: "100", label: "0", hint: "The first layer" },
    { value: "75", label: "¼" },
    { value: "50", label: "½" },
    { value: "25", label: "¾" },
    { value: "0", label: "1", hint: "The last layer" },
  ];
  let depth = $state("75");
  const tint = $derived(`color-mix(in oklch, var(--deep) ${depth}%, var(--late))`);

  const INKS = ["ink", "ink2", "ink3"];
  const MIXES = [9, 14, 22, 26];
  const TYPES = ["title", "heading", "lead", "label", "body", "small", "control", "meta", "head"];
  const SPACE = [4, 8, 12, 16, 24, 32, 48, 64, 96];
  const RADII = ["chip", "col", "box", "row", "pill"];
  const ICONS: IconName[] = ["search", "up", "down", "left", "right", "link", "check", "close", "external", "sun", "moon", "auto", "play", "pause", "menu"];

  // Controls.
  let side = $state<"reads" | "writes" | "both">("reads");
  let size = $state<"md" | "lg">("lg");
  let tab = $state("all");
  let wide = $state("l0");
  let on = $state(true);
  let copied = $state(false);
  let pressed = $state(false);
  const WIDE = Array.from({ length: 12 }, (_, layer) => ({ value: `l${layer}`, label: `Layer ${layer}` }));

  function copy() {
    copied = true;
    setTimeout(() => (copied = false), 1200);
  }

  // Tokens and contexts.
  const TOKENS: { token: string; count?: number; times?: number; flags?: number; value?: number }[] = [
    { token: " release", count: 3, flags: 1, value: 4.21 },
    { token: " released", value: 3.06 },
    { token: "Release", times: 5 },
    { token: " 猫", value: 0.42 },
    { token: "飞机" },
    { token: " собака", flags: 1 },
    { token: "ing", value: 0.031 },
    { token: "\u0001E3 81" },
    { token: "\n" },
    { token: " " },
    { token: "" },
  ];
  const CONTEXTS: ContextLine[] = [
    ["The committee will⟦ release⟧ its findings on Monday, after the vote."],
    ["<bos>⟦Once⟧ upon a time there was a lighthouse keeper who counted ships."],
    ["She looked at the⟪ cat⟫ for a long while, and then, very slowly, the⟦ cat⟧ looked back."],
    ["私は⟦猫⟧が好きです。", "I like ⟦cats⟧.", "ja"],
    [
      "Long before the harbour was dredged and the new quay was built, the fishing boats came in on the evening tide and the whole town went down to ⟦ meet⟧ them, as it had for three hundred years, and no one thought it would ever change.",
    ],
  ];
  const LABEL = "Fires on cat in other scripts: \"猫\", собака (dog) and 飞机.";

  // Numbers and swaps.
  let count = $state(344);
  let meters = $state("a");
  const METERS: Record<string, number[]> = { a: [0.12, 0.48, 0.86], b: [0.64, 0.2, 0.97] };
  let step = $state(0);
  let direction = $state<1 | -1>(1);
  const STEPS = [
    { value: "0", label: "One" },
    { value: "1", label: "Two" },
    { value: "2", label: "Three" },
  ];
  function goTo(next: number) {
    direction = next >= step ? 1 : -1;
    step = next;
  }

  // Motion.
  let replay = $state(0);
  let opened = $state(false);
  let chosen = $state(1);
  const LIST = ["Paper", "Wash", "Wash, chosen", "Ink"];

  // The tip, called directly by something that draws its own targets.
  function point(event: PointerEvent) {
    const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.round(((event.clientX - box.left) / box.width) * 100);
    showTip(new DOMRect(event.clientX, event.clientY - 4, 0, 0), { title: `${x}%`, sub: "showTip at the pointer" });
  }
</script>

<div class="gallery" style:--tint={tint} use:tips>
  <header>
    <span class="mark">Ledger</span>
    <span class="meta">{pkg.name} {pkg.version}</span>
    <ThemeButton {theme} />
  </header>

  <main>
    <h1>Ledger</h1>

    <!-- ---------- colour -->
    <section>
      <h2>Colour</h2>
      <div class="cells">
        <div class="cell">
          <h3 class="head">paper, wash, wash2</h3>
          <div class="paper-demo">
            <span class="meta">paper</span>
            <div class="wash-demo">
              <span class="meta">wash</span>
              <div class="wash2-demo"><span class="meta">wash2</span></div>
            </div>
          </div>
        </div>
        <div class="cell">
          <h3 class="head">ink, ink2, ink3</h3>
          <div class="inks">
            {#each INKS as ink (ink)}<span class="ink" style:color="var(--{ink})">Aa<span class="meta">{ink}</span></span>{/each}
          </div>
        </div>
        <div class="cell">
          <h3 class="head">deep → late</h3>
          <div class="ramp">
            {#each [100, 75, 50, 25, 0] as share (share)}<span class="tile" style:background="color-mix(in oklch, var(--deep) {share}%, var(--late))"></span>{/each}
          </div>
          <div class="ramp-names meta"><span>deep</span><span>late</span></div>
        </div>
        <div class="cell">
          <h3 class="head">tint</h3>
          <Segmented options={DEPTHS} value={depth} onchange={(value) => (depth = value)} label="Depth" />
          <div class="mixes">
            <span class="tile" style:background="var(--tint)"></span>
            {#each MIXES as mix (mix)}<span class="mix" style:background="color-mix(in oklch, var(--tint) {mix}%, transparent)"><span class="meta num">{mix}%</span></span>{/each}
          </div>
        </div>
      </div>
    </section>

    <!-- ---------- type -->
    <section>
      <h2>Type</h2>
      <div class="types">
        {#each TYPES as type (type)}
          <div class="type">
            <span class="meta">{type}</span>
            <span class="sample" style:font="var(--type-{type})" style:color={type === "head" ? "var(--ink3)" : undefined}>Ledger 0.42</span>
          </div>
        {/each}
      </div>
      <div class="cells">
        <div class="cell">
          <h3 class="head">Text styles</h3>
          <p class="styles">
            <span class="meta">.meta 1,284</span>
            <span class="head">.head</span>
            <span class="num">.num 0.0312</span>
            <a class="prose-link" href="#type">.prose-link</a>
          </p>
        </div>
        <div class="cell">
          <h3 class="head">.toks</h3>
          <div class="toks" data-link-scope>
            {#each TOKENS.slice(0, 4) as item, i (i)}<Token {...item} {i} />{/each}
          </div>
        </div>
      </div>
    </section>

    <!-- ---------- space -->
    <section>
      <h2>Space and radii</h2>
      <div class="cells">
        <div class="cell">
          <h3 class="head">s1 … s9</h3>
          <div class="space">
            {#each SPACE as px, i (px)}<span class="meta num">s{i + 1}</span><span class="bar" style:width="var(--s{i + 1})"></span><span class="meta num">{px}</span>{/each}
          </div>
        </div>
        <div class="cell">
          <h3 class="head">r-chip … r-pill</h3>
          <div class="radii">
            {#each RADII as radius (radius)}<span class="radius" style:border-radius="var(--r-{radius})"><span class="meta">{radius}</span></span>{/each}
          </div>
        </div>
      </div>
    </section>

    <!-- ---------- controls -->
    <section>
      <h2>Controls</h2>
      <div class="cells">
        <div class="cell">
          <h3 class="head">Segmented</h3>
          <Segmented
            options={[{ value: "reads", label: "Reads" }, { value: "writes", label: "Writes" }, { value: "both", label: "Both", hint: "Reads and writes" }]}
            value={side}
            onchange={(value) => (side = value)}
            label="Side"
            {size}
          />
          <Segmented options={[{ value: "md", label: "md" }, { value: "lg", label: "lg" }]} value={size} onchange={(value) => (size = value)} label="Size" />
        </div>
        <div class="cell">
          <h3 class="head">Tabs</h3>
          <Tabs
            options={[{ value: "all", label: "All", count: "1,284" }, { value: "words", label: "Words", count: "812" }, { value: "pieces", label: "Pieces", count: "47", hint: "Parts of words" }, { value: "bytes", label: "Bytes", count: "3" }]}
            value={tab}
            onchange={(value) => (tab = value)}
            label="Tokens"
          />
          <Tabs options={WIDE} value={wide} onchange={(value) => (wide = value)} label="Layer" scroll />
        </div>
        <div class="cell">
          <h3 class="head">Switch</h3>
          <Switch checked={on} onchange={(value) => (on = value)} label="Show values" hint="A switch with a tip" />
          <Switch checked={english.on} onchange={(value) => (english.on = value)} label="English" hint="The gallery's translator" />
        </div>
        <div class="cell">
          <h3 class="head">IconButton, ThemeButton</h3>
          <div class="row">
            <IconButton icon={copied ? "check" : "link"} label={copied ? "Copied" : "Copy the link"} onclick={copy} />
            <IconButton icon={pressed ? "pause" : "play"} label={pressed ? "Pause" : "Play"} pressed={pressed} onclick={() => (pressed = !pressed)} />
            <IconButton icon="external" label="A link" href="#tokens" />
            <IconButton icon="close" label="Disabled" disabled />
            <ThemeButton {theme} />
          </div>
        </div>
        <div class="cell">
          <h3 class="head">Expander</h3>
          <Expander label="Show more" openLabel="Show less">
            <div class="stack">
              <Segmented options={[{ value: "reads", label: "Reads" }, { value: "writes", label: "Writes" }]} value={side === "writes" ? "writes" : "reads"} onchange={(value) => (side = value)} label="Side, in the fold" />
              <div class="toks">{#each TOKENS.slice(4, 8) as item, i (i)}<Token {...item} {i} />{/each}</div>
            </div>
          </Expander>
        </div>
        <div class="cell">
          <h3 class="head">Icon</h3>
          <div class="icons">
            {#each ICONS as icon (icon)}<span class="icon" data-tip={icon}><Icon name={icon} size={20} /></span>{/each}
          </div>
        </div>
      </div>
    </section>

    <!-- ---------- tokens -->
    <section id="tokens">
      <h2>Tokens and contexts</h2>
      <div class="cells">
        <div class="cell wide">
          <h3 class="head">Token</h3>
          <div class="toks" data-link-scope>
            {#each TOKENS as item, i (i)}<Token {...item} value={on ? item.value : undefined} {i} />{/each}
          </div>
          <Switch checked={english.on} onchange={(value) => (english.on = value)} label="English" />
        </div>
        <div class="cell wide">
          <h3 class="head">Context</h3>
          <div class="contexts">
            {#each CONTEXTS as context, i (i)}<Context {context} {i} />{/each}
          </div>
        </div>
        <div class="cell wide">
          <h3 class="head">LabelText</h3>
          <p class="label"><LabelText text={LABEL} interactive /></p>
          <p class="label quiet"><LabelText text="" fallback="Unclear" /></p>
        </div>
      </div>
    </section>

    <!-- ---------- numbers -->
    <section>
      <h2>Numbers and swaps</h2>
      <div class="cells">
        <div class="cell">
          <h3 class="head">MorphText</h3>
          <div class="row">
            <IconButton icon="left" label="Previous" onclick={() => (count -= 1)} />
            <span class="id"><MorphText text={`L8·n${count}`} /></span>
            <IconButton icon="right" label="Next" onclick={() => (count += 1)} />
          </div>
          <span class="lead"><MorphText text={count % 2 ? "released" : "release"} numbers={false} /></span>
        </div>
        <div class="cell">
          <h3 class="head">Meter</h3>
          <div class="meters">
            {#each METERS[meters] as value, i (i)}
              <span class="meter-row"><Meter {value} label={`${Math.round(value * 100)}th percentile`} /><span class="meta num"><MorphText text={`${Math.round(value * 100)}%`} /></span></span>
            {/each}
          </div>
          <Segmented options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} value={meters} onchange={(value) => (meters = value)} label="Values" />
        </div>
        <div class="cell">
          <h3 class="head">Swap</h3>
          <Segmented options={STEPS} value={String(step)} onchange={(value) => goTo(Number(value))} label="Step" />
          <Swap key={step} {direction}>
            <div class="card"><span class="lead">{STEPS[step].label}</span><span class="meta">rises in, falls back</span></div>
          </Swap>
        </div>
      </div>
    </section>

    <!-- ---------- motion -->
    <section>
      <h2>Motion</h2>
      <div class="cells">
        <div class="cell">
          <h3 class="head">.rise, stagger</h3>
          {#key replay}
            <ol class="rises">{#each Array.from({ length: 8 }, (_, i) => i) as i (i)}<li class="rise" style:--i={i}><span class="meta num">{stagger(i)} ms</span></li>{/each}</ol>
          {/key}
          <IconButton icon="play" label="Replay" onclick={() => (replay += 1)} />
        </div>
        <div class="cell">
          <h3 class="head">glide</h3>
          <ul class="glide-list" use:glide>
            {#each LIST as item, i (item)}<li><button type="button" aria-current={chosen === i ? "true" : undefined} onclick={() => (chosen = i)}>{item}</button></li>{/each}
          </ul>
        </div>
        <div class="cell">
          <h3 class="head">expand, fadeIn, swell, rise, fadeOut</h3>
          <Switch checked={opened} onchange={(value) => (opened = value)} label="Open" />
          {#if opened}
            <div class="opened" transition:expand>
              <div class="card">
                <span class="row">
                  <span class="dot" in:swell out:fadeOut></span>
                  <span class="meta" in:fadeIn out:fadeOut>fadeIn</span>
                  <span class="meta" in:rise={{ delay: 80 }} out:fadeOut>rise</span>
                </span>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </section>

    <!-- ---------- the tip -->
    <section>
      <h2>The tip</h2>
      <div class="cells">
        <div class="cell">
          <h3 class="head">data-tip</h3>
          <div class="row">
            <span class="target" data-tip="A body only">Body</span>
            <span class="target" data-tip-title="L8·n344" data-tip="A title above the body" data-tip-sub="And a line below">All three</span>
          </div>
        </div>
        <div class="cell">
          <h3 class="head">showTip, hideTip</h3>
          <div class="pad" role="presentation" onpointermove={point} onpointerleave={hideTip}></div>
        </div>
      </div>
    </section>
  </main>
</div>

<style>
  .gallery { min-height: 100svh; transition: --tint var(--glide) var(--ease); }
  header { display: flex; align-items: center; gap: var(--s4); width: 100%; max-width: var(--page); margin: 0 auto; padding: var(--s5) var(--gutter); }
  .mark { color: var(--ink); font: 600 20px/28px var(--display); letter-spacing: -0.02em; }
  header .meta { flex: 1; min-width: 0; overflow-wrap: anywhere; }
  main { display: grid; gap: var(--s8); width: 100%; max-width: var(--page); margin: 0 auto; padding: var(--s7) var(--gutter) var(--s9); }
  h1 { font: var(--type-title); }
  section { display: grid; gap: var(--s5); min-width: 0; }
  h2 { font: var(--type-heading); }
  .cells { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); gap: var(--s6) var(--s5); }
  .cell { display: grid; align-content: start; justify-items: start; gap: var(--s3); min-width: 0; }
  .cell > :global(*) { max-width: 100%; }
  .wide { grid-column: 1 / -1; }
  .row { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s2); }
  .stack { display: grid; justify-items: start; gap: var(--s3); }

  .paper-demo { display: grid; gap: var(--s2); width: 100%; }
  .wash-demo { display: grid; gap: var(--s2); padding: var(--s3) var(--s4) var(--s4); border-radius: var(--r-box); background: var(--wash); }
  .wash2-demo { padding: var(--s3) var(--s4); border-radius: var(--r-col); background: var(--wash2); }
  .inks { display: flex; gap: var(--s5); }
  .ink { display: grid; justify-items: start; font: var(--type-heading); }
  .ramp, .mixes { display: flex; flex-wrap: wrap; gap: var(--s2); }
  .tile { width: 40px; height: 40px; border-radius: var(--r-col); }
  .ramp-names { display: flex; justify-content: space-between; width: calc(5 * 40px + 4 * var(--s2)); }
  .mix { display: grid; place-items: center; width: 40px; height: 40px; border-radius: var(--r-col); }

  .types { display: grid; gap: var(--s3); }
  .type { display: grid; grid-template-columns: 64px minmax(0, 1fr); align-items: baseline; gap: var(--s4); }
  .sample { overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
  .styles { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--s4); }

  .space { display: grid; grid-template-columns: auto auto 1fr; align-items: center; gap: var(--s1) var(--s3); }
  .bar { height: 8px; border-radius: 2px; background: var(--wash2); }
  .radii { display: flex; flex-wrap: wrap; gap: var(--s2); }
  .radius { display: grid; place-items: center; width: 56px; height: 56px; background: var(--wash); }

  .icons { display: flex; flex-wrap: wrap; gap: var(--s3); color: var(--ink2); }
  .icon { display: grid; cursor: help; }

  .contexts { display: grid; gap: var(--s2); width: 100%; }
  .label { font: var(--type-label); }
  .quiet { color: var(--ink3); }

  .id { font: 600 20px/28px var(--display); font-variant-numeric: tabular-nums; }
  .lead { font: var(--type-lead); }
  .meters { display: grid; gap: var(--s2); }
  .meter-row { display: flex; align-items: center; gap: var(--s2); }
  .card { display: grid; gap: var(--s1); width: 100%; padding: var(--s4); border-radius: var(--r-box); background: var(--wash); }

  .rises { display: flex; flex-wrap: wrap; gap: var(--s1); }
  .rises li { padding: 2px var(--s2); border-radius: var(--r-chip); background: var(--wash); }
  .glide-list { display: grid; width: 100%; }
  .glide-list button { width: 100%; height: 36px; padding: 0 var(--s3); border: 0; border-radius: var(--r-box); background: transparent; color: var(--ink2); font: var(--type-control); text-align: start; cursor: pointer; transition: color var(--fast) var(--ease); }
  .glide-list button[aria-current="true"] { color: var(--ink); }
  @media (hover: hover) { .glide-list button:hover { color: var(--ink); } }
  .opened { width: 100%; }
  .dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: var(--tint); }

  .target { padding: var(--s2) var(--s4); border-radius: var(--r-pill); background: var(--wash); color: var(--ink2); font: var(--type-control); cursor: help; }
  .pad { width: 100%; height: 96px; border-radius: var(--r-box); background: var(--wash); cursor: crosshair; touch-action: none; }
</style>
