<script>
  export let compact = false;
  export let subtitle = "личная история";
  export let onClick = () => {};
</script>

<button
  class="logo"
  class:small={compact}
  on:click={onClick}
  aria-label="На главную"
>
  <span class="logo-mark"><i></i><i></i></span>
  <span
    ><b>Denta</b>{#if !compact || subtitle}<small>{subtitle}</small>{/if}</span
  >
</button>
