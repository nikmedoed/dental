<script>
  import {
    ChevronRight,
    Plus,
    Sparkles,
    UsersRound,
  } from "@lucide/svelte";
  import {
    ALL_TEETH,
    LOWER_TEETH,
    UPPER_TEETH,
  } from "../../lib/dental-data.js";
  import { sortEvents, toothStateByTooth } from "../../lib/dental-utils.js";
  import EventRow from "../common/EventRow.svelte";
  import Tooth from "../common/Tooth.svelte";

  export let events = [];
  export let onAdd = () => {};
  export let onShare = () => {};
  export let onOpenTooth = () => {};
  export let onOpenEvent = () => {};
  export let onNavigate = () => {};

  let dentition = "adult";
  $: recordedStates = toothStateByTooth(events);
  $: toothStates = Object.fromEntries(
    ALL_TEETH.map((tooth) => [
      tooth,
      recordedStates[tooth] || {
        structure: "natural",
        condition: "untreated",
        hasTreatment: false,
      },
    ]),
  );
  $: recentEvents = sortEvents(events).slice(0, 4);
  const structureLabels = [
    ["natural", "Свои зубы"],
    ["implant", "Импланты"],
    ["missing", "Удалены"],
  ];
  const conditionLabels = [
    ["untreated", "Не лечили"],
    ["treated", "Лечили"],
    ["complaint", "Жалоба"],
    ["issue", "Проблема"],
  ];
  $: structureStats = structureLabels.map(([key, label]) => ({
    key,
    label,
    count: ALL_TEETH.filter((tooth) => toothStates[tooth].structure === key).length,
  }));
  $: conditionStats = conditionLabels.map(([key, label]) => ({
    key,
    label,
    count: ALL_TEETH.filter(
      (tooth) =>
        toothStates[tooth].structure !== "missing" &&
        toothStates[tooth].condition === key,
    ).length,
  }));
</script>

<div class="page dashboard-page">
  <div class="dashboard-grid">
    <section class="card odontogram-card">
      <div class="card-head">
        <div>
          <h2>Карта зубов</h2>
          <p>Нажмите на зуб, чтобы открыть его историю</p>
        </div>
        <div class="odontogram-head-actions">
          <div class="segmented">
            <button
              class:active={dentition === "adult"}
              on:click={() => (dentition = "adult")}>Постоянные</button
            >
            <button
              class:active={dentition === "baby"}
              on:click={() => (dentition = "baby")}>Молочные</button
            >
          </div>
          <button class="secondary share-top-button" on:click={onShare}>
            <UsersRound size={16} />На приём с историей
          </button>
          <button class="secondary odontogram-add" on:click={() => onAdd()}>
            <Plus size={15} />Добавить запись
          </button>
        </div>
      </div>

      {#if dentition === "baby"}
        <div class="empty-dentition">
          <Sparkles size={28} />
          <b>Данные о молочных зубах не добавлены</b>
          <span>Переключитесь на постоянные зубы или создайте запись.</span>
        </div>
      {:else}
        <div class="jaw-label"><span>ВЕРХНЯЯ ЧЕЛЮСТЬ</span><i></i></div>
        <div class="teeth-row">
          {#each [...UPPER_TEETH].reverse() as tooth, index}
            {#if index === 8}<span class="midline"></span>{/if}
            <Tooth
              {tooth}
              structure={toothStates[tooth].structure}
              condition={toothStates[tooth].condition}
              onOpen={onOpenTooth}
            />
          {/each}
        </div>
        <div class="jaw-divider">
          <span>ЛЕВО</span><i></i><span>ПРАВО</span>
        </div>
        <div class="teeth-row lower">
          {#each [...LOWER_TEETH].reverse() as tooth, index}
            {#if index === 8}<span class="midline"></span>{/if}
            <Tooth
              {tooth}
              structure={toothStates[tooth].structure}
              condition={toothStates[tooth].condition}
              onOpen={onOpenTooth}
            />
          {/each}
        </div>
        <div class="jaw-label bottom"><span>НИЖНЯЯ ЧЕЛЮСТЬ</span><i></i></div>
      {/if}

    </section>
  </div>

  <section class="card dental-stats-card">
    <div class="dental-stat-group">
      {#each structureStats as stat}
        <div><i class="stat-{stat.key}">{stat.key === "missing" ? "×" : ""}</i><b>{stat.label}</b><strong>{stat.count}</strong></div>
      {/each}
    </div>
    <div class="dental-stat-group condition-stat-group">
      {#each conditionStats as stat}
        <div><i class="stat-{stat.key}"></i><b>{stat.label}</b><strong>{stat.count}</strong></div>
      {/each}
    </div>
  </section>

  <section class="card recent-card">
    <div class="card-head">
      <div>
        <h2>Последние записи</h2>
        <p>Недавние изменения в истории лечения</p>
      </div>
      <button class="text-button" on:click={() => onNavigate("history")}
        >Вся история <ChevronRight size={16} /></button
      >
    </div>
    <div class="events-list">
      {#each recentEvents as event}<EventRow
          {event}
          onOpen={onOpenEvent}
        />{/each}
    </div>
  </section>
</div>
