<script>
  import ToothGlyph from "./ToothGlyph.svelte";
  import { CONDITION_LABELS } from "../../lib/dental-utils.js";
  export let tooth;
  export let structure = "natural";
  export let condition = "unknown";
  export let dimmed = false;
  export let selected = false;
  export let onOpen = () => {};
  $: stateLabel = CONDITION_LABELS[condition] || "Нет данных";
  $: structureLabel = {
    natural: "свой зуб",
    implant: "имплант",
    missing: "удалён",
  }[structure];
</script>

<button
  class="tooth structure-{structure} condition-{condition}"
  class:selected
  class:dimmed
  aria-pressed={selected}
  on:click={() => onOpen(tooth)}
  aria-label="Зуб {tooth}, {structureLabel}, {stateLabel}{selected
    ? ', выбран'
    : ''}"
>
  <ToothGlyph {tooth} {structure} {condition} />
  <b>{tooth}</b>
</button>
