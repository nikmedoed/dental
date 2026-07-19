<script>
  import { Plus, Sparkles, X } from "@lucide/svelte";
  import { TOOTH_STATUS } from "../../lib/dental-data.js";
  import { formatDate, sortEvents } from "../../lib/dental-utils.js";

  export let tooth;
  export let events = [];
  export let onClose = () => {};
  export let onAdd = () => {};
  export let onOpenEvent = () => {};

  $: toothEvents = sortEvents(events).filter((event) => event.tooth === tooth);
  $: status = TOOTH_STATUS[toothEvents[0]?.status || "healthy"];
</script>

<div
  class="drawer-layer"
  role="presentation"
  on:mousedown={(event) => event.target === event.currentTarget && onClose()}
>
  <aside class="drawer">
    <div class="drawer-head">
      <button class="close-btn" on:click={onClose}><X size={21} /></button>
    </div>
    <div class="tooth-hero">
      <div class="large-tooth {status.className}">
        <span></span><b>{tooth}</b>
      </div>
      <div>
        <span class="eyebrow">ЗУБ {tooth}</span>
        <h2>{status.label}</h2>
        <p>
          {toothEvents.length
            ? `${toothEvents.length} записи в истории`
            : "История пока пуста"}
        </p>
      </div>
    </div>
    {#if toothEvents.length}<div class="current-state">
        <span>ТЕКУЩЕЕ СОСТОЯНИЕ</span>
        <div>
          <i class={status.className}></i><b>{status.label}</b><small
            >обновлено {formatDate(toothEvents[0].date)}</small
          >
        </div>
      </div>{/if}
    <div class="drawer-section">
      <div class="section-title">
        <h3>История зуба</h3>
        <button on:click={() => onAdd(tooth)}><Plus size={16} />Запись</button>
      </div>
      {#if toothEvents.length}
        <div class="tooth-timeline">
          {#each toothEvents as event, index}<button
              on:click={() => onOpenEvent(event)}
              ><span class="timeline-node"
                ><i></i>{#if index < toothEvents.length - 1}<em></em>{/if}</span
              ><span
                ><time>{formatDate(event.date, true)}</time><b>{event.title}</b>
                <p>{event.notes}</p>
                <small>{event.doctor} · {event.clinic}</small
                >{#if event.surfaces.length}<span class="surface-tags"
                    >{#each event.surfaces as surface}<i>{surface}</i
                      >{/each}</span
                  >{/if}</span
              ></button
            >{/each}
        </div>
      {:else}
        <div class="empty-state">
          <span><Sparkles size={25} /></span><b>Записей пока нет</b>
          <p>Добавьте первый осмотр или лечение для этого зуба.</p>
        </div>
      {/if}
    </div>
    <div class="drawer-footer">
      <button class="primary wide" on:click={() => onAdd(tooth)}
        ><Plus size={18} />Добавить событие для зуба {tooth}</button
      >
    </div>
  </aside>
</div>
