<script>
  import { Info, Plus, Search } from "@lucide/svelte";
  import {
    HISTORY_FILTERS,
    HISTORY_SUMMARY_GROUPS,
  } from "../../lib/dental-data.js";
  import { formatDate, sortEvents } from "../../lib/dental-utils.js";
  import EventRow from "../common/EventRow.svelte";

  export let events = [];
  export let onAdd = () => {};
  export let onOpenEvent = () => {};

  let query = "";
  let filter = "all";
  $: filteredEvents = sortEvents(events).filter(
    (event) =>
      (filter === "all" || event.kind === filter) &&
      `${event.title} ${event.tooth} ${event.doctor} ${event.clinic}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  $: eventYears = [
    ...new Set(filteredEvents.map((event) => event.date.slice(0, 4))),
  ];
  $: firstEvent = [...events].sort((a, b) => a.date.localeCompare(b.date))[0];
  $: summaryGroups = HISTORY_SUMMARY_GROUPS.map((group) => ({
    ...group,
    count: events.filter((event) => group.kinds.includes(event.kind)).length,
  }));
</script>

<div class="page inner-page">
  <div class="page-title">
    <div>
      <span class="eyebrow">ЕДИНАЯ ХРОНОЛОГИЯ</span>
      <h1>История лечения</h1>
      <p>Все события, осмотры и вмешательства в одном месте.</p>
    </div>
    <button class="primary" on:click={() => onAdd()}
      ><Plus size={18} />Добавить запись</button
    >
  </div>
  <div class="toolbar card">
    <label class="search-box"
      ><Search size={18} /><input
        bind:value={query}
        placeholder="Зуб, лечение, врач или клиника"
      /></label
    >
    <div class="filter-tabs">
      {#each HISTORY_FILTERS as item}<button
          class:active={filter === item[0]}
          on:click={() => (filter = item[0])}>{item[1]}</button
        >{/each}
    </div>
  </div>
  <div class="history-layout">
    <section class="card history-card">
      {#if filteredEvents.length === 0}
        <div class="empty-state">
          <span><Search size={25} /></span><b>Ничего не найдено</b>
          <p>Попробуйте изменить запрос или фильтр.</p>
        </div>
      {/if}
      {#each eventYears as year}
        <div class="year-group">
          <div class="year-label">
            <b>{year}</b><span
              >{filteredEvents.filter((event) => event.date.startsWith(year))
                .length} записей</span
            >
          </div>
          <div>
            {#each filteredEvents.filter( (event) => event.date.startsWith(year) ) as event}<EventRow
                {event}
                onOpen={onOpenEvent}
              />{/each}
          </div>
        </div>
      {/each}
    </section>
    <aside class="history-summary card">
      <h3>Сводка истории</h3>
      <div class="summary-ring">
        <div><b>{events.length}</b><span>событий</span></div>
      </div>
      <ul>
        {#each summaryGroups as group}<li>
            <i class={group.color}></i>{group.label} <b>{group.count}</b>
          </li>{/each}
      </ul>
      {#if firstEvent}<div class="summary-note">
          <Info size={17} /><span
            >Первая запись<br /><b>{formatDate(firstEvent.date, true)}</b></span
          >
        </div>{/if}
    </aside>
  </div>
</div>
