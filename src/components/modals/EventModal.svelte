<script>
  import { FileText, Paperclip, X } from "@lucide/svelte";
  import {
    describeTooth,
    eventEntries,
    eventIcon,
    formatDate,
    formatMoney,
  } from "../../lib/dental-utils.js";
  import ModalShell from "../common/ModalShell.svelte";

  export let event;
  export let onClose = () => {};

  $: entries = eventEntries(event);
</script>

<ModalShell className="event-modal" {onClose}>
  <div class="modal-head">
    <div class="event-modal-title">
      <span class="event-icon {event.type || event.kind}"
        >{eventIcon(event)}</span
      ><span
        ><small
          >{formatDate(event.date, true)}{entries.length === 1
            ? ` · Зуб ${entries[0].tooth}`
            : ""}</small
        >
        <h2>{event.title}</h2></span
      >
    </div>
    <button class="close-btn" on:click={onClose}><X size={21} /></button>
  </div>
  <div class="event-details">
    {#if event.doctor}<div>
      <span>Врач</span><b>{event.doctor}</b
      >{#if event.doctorDetails?.specialty}<small
          >{event.doctorDetails.specialty}</small
        >{/if}
    </div>{/if}
    {#if event.clinic}<div><span>Клиника</span><b>{event.clinic}</b></div>{/if}
    {#if event.cost}<div>
        <span>Стоимость</span><b>{formatMoney(event.cost, event.currency)}</b>
      </div>{/if}
  </div>
  {#if event.notes}<div class="note-box">
      <span>ОБЩИЕ ЗАМЕТКИ</span>
      <p>{event.notes}</p>
    </div>{/if}
  {#if event.attachments?.length}<div class="event-attachments">
      <div class="field-label">Документы визита</div>
      {#each event.attachments as attachment}<span
          ><Paperclip size={15} />{attachment.name}</span
        >{/each}
    </div>{/if}
  {#if entries.length}
    <div class="event-entry-list">
      <div class="field-label">Записи по зубам · {entries.length}</div>
      {#each entries as entry}<article>
          <span class="entry-tooth">{entry.tooth}</span>
          <div>
            <b>{entry.title}</b><small>{describeTooth(entry.tooth)}</small
            >{#if entry.notes}<p>
                {entry.notes}
              </p>{/if}{#if entry.surfaces?.length}<div class="surface-tags">
                {#each entry.surfaces as surface}<i>{surface}</i>{/each}
              </div>{/if}{#if entry.attachments?.length}<div
                class="entry-attachment-list"
              >
                {#each entry.attachments as attachment}<span
                    ><Paperclip size={13} />{attachment.name}</span
                  >{/each}
              </div>{/if}
          </div>
        </article>{/each}
    </div>
  {/if}
  <div class="modal-footer">
    <button class="secondary" on:click={onClose}>Закрыть</button><button
      class="primary"><FileText size={17} />Добавить в отчёт</button
    >
  </div>
</ModalShell>
