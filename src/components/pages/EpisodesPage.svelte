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
  import { formatDate } from "../../lib/dental-utils.js";

  export let events = [];
  export let onOpenEvent = () => {};
</script>

<div class="page inner-page">
  <div class="page-title">
    <div>
      <span class="eyebrow">СВЯЗАННЫЕ СОБЫТИЯ</span>
      <h1>Эпизоды лечения</h1>
      <p>Весь путь от диагностики до завершения лечения.</p>
    </div>
    <button class="secondary"><CircleHelp size={18} />Как это работает</button>
  </div>
  <div class="episodes-grid">
    {#each TREATMENT_EPISODES as episode}
      {@const episodeEvents = events
        .filter((event) => event.episodeId === episode.id)
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
            ><button><MoreHorizontal size={19} /></button>
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
          <button class="episode-open"
            >Открыть эпизод <ChevronRight size={16} /></button
          >
        </div>
      </article>
    {/each}
  </div>
</div>
