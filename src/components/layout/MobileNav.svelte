<script>
  import { Archive, FileText, History, Home, Plus } from "@lucide/svelte";

  export let page;
  export let onNavigate = () => {};
  export let onAdd = () => {};

  const beforeAdd = [
    ["dashboard", "Обзор", Home],
    ["history", "История", History],
  ];
  const afterAdd = [
    ["episodes", "Эпизоды", Archive],
    ["reports", "Отчёты", FileText],
  ];
</script>

<nav class="mobile-nav">
  {#each beforeAdd as item}
    <button
      class:active={page === item[0]}
      on:click={() => onNavigate(item[0])}
    >
      <svelte:component this={item[2]} size={20} /><span>{item[1]}</span>
    </button>
  {/each}
  <button class="mobile-add" on:click={onAdd}><Plus size={24} /></button>
  {#each afterAdd as item}
    <button
      class:active={page === item[0]}
      on:click={() => onNavigate(item[0])}
    >
      <svelte:component this={item[2]} size={20} /><span>{item[1]}</span>
    </button>
  {/each}
</nav>
