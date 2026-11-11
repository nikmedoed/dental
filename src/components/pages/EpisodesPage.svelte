<script>
  import {
    CalendarDays,
    Check,
    ChevronRight,
    CircleHelp,
    HeartPulse,
    MoreHorizontal,
  } from "@lucide/svelte";
  import { TREATMENT_EPISODES } from "../../lib/dental-data.js";
  import {
    eventTeeth,
    formatDate,
    sortEvents,
    toothStateByTooth,
  } from "../../lib/dental-utils.js";

  export let events = [];
  export let onOpenEvent = () => {};
  $: states = toothStateByTooth(events);
  $: episodes = [...new Set(events.flatMap(eventTeeth))]
    .sort((a, b) => a - b)
    .map((tooth) => ({
      id: tooth,
      tooth,
      title: "История зуба " + tooth,
      subtitle: "Все связанные записи по зубу",
      status: states[tooth]?.needsAttention
        ? "Требует внимания"
        : "См. историю",
      color: states[tooth]?.needsAttention ? "amber" : "teal",
      date: formatDate(states[tooth]?.latestEntry?.date),
    }));
</script>

<div class="page inner-page">
  <div class="page-title">
    <div>
      <span class="eyebrow">СВЯЗАННЫЕ СОБЫТИЯ</span>
      <h1>История по зубам</h1>
      <p>
        Связанные записи каждого зуба: от первого осмотра до последнего визита.
      </p>
    </div>
  </div>
  {#if !episodes.length}<p class="empty-state">
      Добавьте запись с номером зуба — здесь появится его история.
    </p>{/if}
  <div class="episodes-grid">
    {#each episodes as episode}
      {@const episodeEvents = events
        .filter((event) => eventTeeth(event).includes(episode.tooth))
        .sort((a, b) => a.date.localeCompare(b.date))}
      <article class="card episode-card">
        <div class="episode-band {episode.color}"></div>
        <div class="episode-content">
          <div class="episode-top">
            <span class="episode-icon {episode.color}"
              ><HeartPulse size={22} /></span
            ><span
              class="status-badge {episode.status === 'Завершён'
                ? 'done'
                : 'watching'}">{episode.status}</span
            >
          </div>
          <h2>{episode.title}</h2>
          <p>{episode.subtitle}</p>
          <div class="episode-meta">
            <CalendarDays size={15} />{episode.date}<span>•</span>Зуб {episode.tooth}
          </div>
          <div class="episode-line">
            {#each episodeEvents as event, index}
              <button on:click={() => onOpenEvent(event)}
                ><span class:last={index === episodeEvents.length - 1}
                  ><Check size={11} /></span
                >
                <div>
                  <b>{event.title}</b><small>{formatDate(event.date)}</small>
                </div></button
              >
            {/each}
          </div>
          <button
            class="episode-open"
            on:click={() => onOpenEvent(sortEvents(episodeEvents)[0])}
            >Последняя запись <ChevronRight size={16} /></button
          >
        </div>
      </article>
    {/each}
  </div>
</div>
