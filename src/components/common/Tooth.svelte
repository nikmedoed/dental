<script>
  export let tooth;
  export let structure = "natural";
  export let condition = "untreated";
  export let onOpen = () => {};
  $: position = Number(tooth) % 10;
  $: isFront = position <= 3;
  $: stateLabel = {
    untreated: "не лечили",
    treated: "лечили",
    complaint: "жалоба",
    issue: "проблема",
  }[condition];
  $: structureLabel = {
    natural: "свой зуб",
    implant: "имплант",
    missing: "удалён",
  }[structure];
</script>

<button
  class="tooth structure-{structure} condition-{condition}"
  on:click={() => onOpen(tooth)}
  aria-label="Зуб {tooth}, {structureLabel}, {stateLabel}"
  data-tooltip="Зуб {tooth} · {structureLabel} · {stateLabel}"
>
  <span class="tooth-figure">
    {#if structure === "missing"}
      <svg viewBox="0 0 36 45" aria-hidden="true"><path class="tooth-outline" d="M9 8L27 36M27 8L9 36" /></svg>
    {:else if structure === "implant"}
      <svg viewBox="0 0 36 45" aria-hidden="true">
        <path class="implant-crown" d="M7 5Q18 0 29 5L27 18Q18 22 9 18Z" />
        <path class="implant-post" d="M15 19H21L23 36L18 42L13 36Z" />
        <path class="implant-thread" d="M14 24H22M14 28H22M14 32H22M15 36H21" />
      </svg>
    {:else}
      <svg viewBox="0 0 36 45" aria-hidden="true">
        {#if isFront}
          <path class="tooth-body" d="M9 4Q18 0 27 4L26 18Q24 24 22 40Q18 45 14 40Q12 24 10 18Z" />
        {:else}
          <path class="tooth-body" d="M5 7Q8 0 13 4Q18 0 23 4Q29 0 31 7L28 20Q25 24 25 39Q22 44 19 34Q18 31 17 35Q14 44 11 39Q11 24 8 20Z" />
        {/if}
      </svg>
    {/if}
  </span>
  <b>{tooth}</b>
</button>
