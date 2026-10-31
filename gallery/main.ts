import { mount } from "svelte";
import "@stdlogits/ledger/ledger.css";
import { setTranslator } from "@stdlogits/ledger";
import { translator } from "./translator.svelte";
import Gallery from "./Gallery.svelte";

// A product that translates installs its translator once, before it mounts.
setTranslator(translator);
mount(Gallery, { target: document.getElementById("app")! });
