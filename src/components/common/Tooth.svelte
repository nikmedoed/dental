<script>
  import { TOOTH_STATUS } from "../../lib/dental-data.js";

  export let tooth;
  export let status = "healthy";
  export let onOpen = () => {};

  $: meta = TOOTH_STATUS[status] || TOOTH_STATUS.healthy;
</script>

<button
  class="tooth {meta.className}"
  on:click={() => onOpen(tooth)}
  aria-label="Зуб {tooth}, {meta.label}"
>
  <span class="tooth-crown"><i></i><i></i><i></i></span>
  <b>{tooth}</b>
</button>
