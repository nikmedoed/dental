<script>
  import ToothGlyph from "../common/ToothGlyph.svelte";
  import { Check, ChevronRight, Plus, Sparkles } from "@lucide/svelte";
  import { TOOTH_STATUS } from "../../lib/dental-data.js";
  import {
    CONDITION_LABELS,
    describeTooth,
    formatDate,
    providerLabel,
    toothEntries,
    toothStateByTooth,
  } from "../../lib/dental-utils.js";

  export let tooth;
  export let events = [];
  export let onAdd = () => {};
  export let onOpenEvent = () => {};
  export let onResolveComplaint = () => {};

  $: toothEvents = toothEntries(events, tooth);

  $: toothState = toothStateByTooth(events)[tooth] || {
    structure: "natural",
    condition: "unknown",
  };
  $: [location, toothName] = describeTooth(tooth).split(", ");
  $: statusLabel =
    toothState.structure === "missing"
      ? "Зуб отсутствует"
      : CONDITION_LABELS[toothState.condition];
  let resolving = false;
  let error = "";
  async function resolve() {
    if (resolving) return;
    resolving = true;
    error = "";
    try {
      await onResolveComplaint(tooth);
    } catch {
      error = "Не удалось сохранить. Повторите попытку.";
    } finally {
      resolving = false;
    }
  }
</script>

<aside class="card tooth-history-panel" aria-label="История зуба {tooth}">
  <div class="tooth-hero">
    <ToothGlyph
      {tooth}
      structure={toothState.structure}
      condition={toothState.condition}
    />
    <div>
      <h2>Зуб {tooth} — {toothName}</h2>
      <p>{location.charAt(0).toUpperCase() + location.slice(1)}</p>
      {#if toothState.condition === "issue" && toothState.clinicalEntry?.title}
        {#if toothState.hasTreatment}<p class="tooth-current-label"><strong>Пролечен</strong></p>{/if}
        <p class="tooth-problem"><span aria-label="Проблема">!</span> {toothState.clinicalEntry.title}</p>
      {:else}
        <p class="tooth-current-label"><strong>{toothState.hasTreatment && toothState.structure !== "missing" ? "Пролечен" : statusLabel}{toothState.structure === "implant" ? " · Имплант" : ""}</strong></p>
        {#if toothState.hasTreatment && ["watch", "complaint"].includes(toothState.condition)}<p>{statusLabel}</p>{/if}
      {/if}
    </div>
  </div>
  {#if toothState.condition === "complaint"}
    <div class="complaint-action">
      <button class="secondary" disabled={resolving} on:click={resolve}
        ><Check size={16} />Снять жалобу</button
      >
    </div>
  {/if}
  {#if error}<p class="form-error" role="alert">{error}</p>{/if}
  {#if toothState.complaintActive && ["issue", "watch"].includes(toothState.clinicalCondition)}<p
      class="orientation-note"
    >
      Также: {CONDITION_LABELS[toothState.clinicalCondition]}. Снятие жалобы не
      отменяет эту запись.
    </p>{/if}
  <div class="drawer-section">
    <div class="section-title">
      <h3>История зуба <small>({toothEvents.length})</small></h3>
      <button on:click={() => onAdd(tooth)}><Plus size={16} />Запись</button>
    </div>
    {#if toothEvents.length}
      <div class="tooth-timeline">
        {#each toothEvents as event, index}<article>
            <span class="timeline-node"
              ><i></i>{#if index < toothEvents.length - 1}<em></em>{/if}</span
            ><div class="timeline-content">
              <div class="timeline-details">
                <time datetime={event.date}>{formatDate(event.date, true)}</time>
                <button
                class="text-button timeline-open"
                type="button"
                aria-label={`Открыть запись «${event.title}» от ${formatDate(event.date, true)}`}
                on:click={() => onOpenEvent(event.parentEvent || event)}
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
              </div>
              <b>{event.title}</b>
              {#if event.notes}<p>{event.notes}</p>{/if}
              <small
                >{TOOTH_STATUS[event.status]?.label ||
                  "Состояние не указано"}{event.parentEvent?.affectsStatus ===
                false
                  ? " · Только история, не меняет карту"
                  : ""}</small
              >
              {#if event.attachments?.length}<small
                  >Файлов по зубу: {event.attachments.length}</small
                >{/if}
              {#if providerLabel(event)}<small>{providerLabel(event)}</small
                >{/if}
              {#if event.surfaces.length}<span class="surface-tags"
                  >{#each event.surfaces as surface}<i>{surface}</i
                    >{/each}</span
                >{/if}
            </div>
          </article>{/each}
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
      ><Plus size={18} />Добавить событие</button
    >
  </div>
</aside>
