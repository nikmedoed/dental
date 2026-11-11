<script>
  import { tick } from "svelte";
  import { ChevronRight, Plus, UsersRound } from "@lucide/svelte";
  import {
    ALL_TEETH,
    LOWER_TEETH,
    UPPER_TEETH,
  } from "../../lib/dental-data.js";
  import {
    CONDITION_LABELS,
    sortEvents,
    toothStateByTooth,
  } from "../../lib/dental-utils.js";
  import EventRow from "../common/EventRow.svelte";
  import ToothHistoryPanel from "./ToothHistoryPanel.svelte";
  import Tooth from "../common/Tooth.svelte";

  export let events = [];
  export let onAdd = () => {};
  export let onShare = () => {};
  export let onOpenTooth = () => {};
  export let onOpenEvent = () => {};
  export let onNavigate = () => {};

  export let selectedTooth = null;
  export let onResolveComplaint = () => {};

  let activeFilter = null;
  let historyRegion;

  async function selectTooth(tooth) {
    onOpenTooth(tooth);
    await tick();
    historyRegion?.scrollIntoView({ block: "nearest" });
  }

  $: toothStates = toothStateByTooth(events);
  $: recentEvents = sortEvents(events).slice(0, 4);
  const legendKeys = [...Object.keys(CONDITION_LABELS), "implant", "missing"];
  $: legendGroups = Object.fromEntries(
    legendKeys.map((key) => [
      key,
      ALL_TEETH.filter((tooth) => {
        const { structure, condition } = toothStates[tooth];
        return (structure === "natural" ? condition : structure) === key;
      }),
    ]),
  );
  $: highlightedTeeth = legendGroups[activeFilter];

  function toggleFilter(key) {
    activeFilter = activeFilter === key ? null : key;
  }
</script>

<div class="page dashboard-page">
  <div class="dashboard-grid with-tooth-panel">
    <div class="dashboard-map-column">
      <section class="card odontogram-card">
        <div class="card-head">
          <div class="odontogram-title">
            <h2>Карта зубов</h2>
            <p>Нажмите на зуб, чтобы открыть его историю</p>
          </div>
          <div class="odontogram-head-actions">
            <button class="secondary share-top-button" on:click={onShare}>
              <UsersRound size={16} />На приём с историей
            </button>
            <button class="secondary odontogram-add" on:click={() => onAdd()}>
              <Plus size={15} />Добавить запись
            </button>
          </div>
        </div>

        <div
          class="odontogram-scroll"
          role="region"
          aria-label="Карта зубов, прокрутите по горизонтали на узком экране"
        >
          <div class="jaw-label"><span>ВЕРХНЯЯ ЧЕЛЮСТЬ</span></div>
          <div class="jaw-arch">
            <div class="teeth-row upper">
              {#each [...UPPER_TEETH].reverse() as tooth, index (tooth)}
                {#if index === 8}<span class="midline"></span>{/if}
                <Tooth
                  {tooth}
                  structure={toothStates[tooth].structure}
                  condition={toothStates[tooth].condition}
                  selected={selectedTooth === tooth}
                  dimmed={highlightedTeeth && !highlightedTeeth.includes(tooth)}
                  onOpen={selectTooth}
                />
              {/each}
            </div>
            <div class="jaw-divider">
              <span>ВАША ЛЕВАЯ СТОРОНА</span><i></i><span
                >ВАША ПРАВАЯ СТОРОНА</span
              >
            </div>
            <div class="teeth-row lower">
              {#each [...LOWER_TEETH].reverse() as tooth, index (tooth)}
                {#if index === 8}<span class="midline"></span>{/if}
                <Tooth
                  {tooth}
                  structure={toothStates[tooth].structure}
                  condition={toothStates[tooth].condition}
                  selected={selectedTooth === tooth}
                  dimmed={highlightedTeeth && !highlightedTeeth.includes(tooth)}
                  onOpen={selectTooth}
                />
              {/each}
            </div>
          </div>
          <div class="jaw-label bottom"><span>НИЖНЯЯ ЧЕЛЮСТЬ</span></div>
        </div>
        <div class="map-legend" aria-label="Обозначения карты">
          {#each Object.entries(CONDITION_LABELS) as [condition, label] (condition)}
            <button
              type="button"
              class="legend-item condition-{condition}"
              aria-pressed={activeFilter === condition}
              on:click={() => toggleFilter(condition)}
              ><svg viewBox="0 0 36 45" aria-hidden="true"
                ><path
                  class="tooth-body"
                  d="M9 4Q18 0 27 4L26 18L22 40Q18 45 14 40L10 18Z"
                /></svg
              ><b>{label}</b><strong>{legendGroups[condition].length}</strong
              ></button
            >
          {/each}
          <button
            type="button"
            class="legend-item"
            aria-pressed={activeFilter === "implant"}
            on:click={() => toggleFilter("implant")}
            ><svg viewBox="0 0 36 45" aria-hidden="true"
              ><path
                class="implant-crown"
                d="M7 5Q18 0 29 5L27 18Q18 22 9 18Z"
              /><path
                class="implant-post"
                d="M15 19H21L23 36L18 42L13 36Z"
              /><path
                class="implant-thread"
                d="M14 24H22M14 28H22M14 32H22M15 36H21"
              /></svg
            ><b>Имплант</b><strong>{legendGroups.implant.length}</strong
            ></button
          >
          <button
            type="button"
            class="legend-item"
            aria-pressed={activeFilter === "missing"}
            on:click={() => toggleFilter("missing")}
            ><svg viewBox="0 0 36 45" aria-hidden="true"
              ><path class="tooth-outline" d="M9 8L27 36M27 8L9 36" /></svg
            ><b>Отсутствует / удалён</b><strong
              >{legendGroups.missing.length}</strong
            ></button
          >
        </div>
        <p class="orientation-note">
          Нажмите на обозначение, чтобы выделить зубы. Повторное нажатие
          сбрасывает фильтр.
        </p>
      </section>
      <section class="card recent-card">
        <div class="card-head">
          <div>
            <h2>Последние записи</h2>
            <p>Последние визиты и события</p>
          </div>
          <button class="text-button" on:click={() => onNavigate("history")}
            >Вся история <ChevronRight size={16} /></button
          >
        </div>
        <div class="events-list">
          {#if !recentEvents.length}<p class="empty-state">
              Добавьте осмотр, жалобу или лечение — здесь появится история.
            </p>{/if}
          {#each recentEvents as event (event.id)}<EventRow
              compact
              {event}
              onOpen={onOpenEvent}
            />{/each}
        </div>
      </section>
    </div>
    <div class="tooth-history-region" bind:this={historyRegion}>
      {#if selectedTooth !== null}
        {#key selectedTooth}
          <ToothHistoryPanel
            tooth={selectedTooth}
            {events}
            {onAdd}
            {onOpenEvent}
            {onResolveComplaint}
          />
        {/key}
      {:else}
        <aside class="card tooth-history-panel tooth-history-placeholder">
          <h2>История зуба</h2>
          <p>Выберите зуб на карте.</p>
        </aside>
      {/if}
    </div>
  </div>
</div>
