<script>
  import { FileText, X } from "@lucide/svelte";
  import { eventIcon, formatDate } from "../../lib/dental-utils.js";
  import ModalShell from "../common/ModalShell.svelte";

  export let event;
  export let onClose = () => {};
</script>

<ModalShell className="event-modal" {onClose}>
  <div class="modal-head">
    <div class="event-modal-title">
      <span class="event-icon {event.kind}">{eventIcon(event)}</span><span
        ><small>{formatDate(event.date, true)} · Зуб {event.tooth}</small>
        <h2>{event.title}</h2></span
      >
    </div>
    <button class="close-btn" on:click={onClose}><X size={21} /></button>
  </div>
  <div class="event-details">
    <div><span>Врач</span><b>{event.doctor}</b></div>
    <div><span>Клиника</span><b>{event.clinic}</b></div>
    {#if event.cost}<div>
        <span>Стоимость</span><b>{event.cost.toLocaleString("ru-RU")} ₽</b>
      </div>{/if}
  </div>
  <div class="note-box">
    <span>ЗАМЕТКИ</span>
    <p>{event.notes}</p>
  </div>
  {#if event.surfaces.length}<div class="field-label">Поверхности</div>
    <div class="surface-tags">
      {#each event.surfaces as surface}<i>{surface}</i>{/each}
    </div>{/if}
  <div class="modal-footer">
    <button class="secondary" on:click={onClose}>Закрыть</button><button
      class="primary"><FileText size={17} />Добавить в отчёт</button
    >
  </div>
</ModalShell>
