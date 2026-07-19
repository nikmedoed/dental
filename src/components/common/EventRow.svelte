<script>
  import { ChevronRight, UserRound } from "@lucide/svelte";
  import { eventIcon } from "../../lib/dental-utils.js";

  export let event;
  export let onOpen = () => {};

  $: eventDate = new Date(`${event.date}T12:00:00`);
  $: month = new Intl.DateTimeFormat("ru-RU", { month: "short" })
    .format(eventDate)
    .replace(".", "");
</script>

<button class="event-row" on:click={() => onOpen(event)}>
  <span class="event-date"
    ><b>{eventDate.getDate()}</b><small>{month}</small></span
  >
  <span class="event-icon {event.kind}">{eventIcon(event)}</span>
  <span class="event-main"
    ><b>{event.title}</b><small>Зуб {event.tooth} · {event.clinic}</small></span
  >
  <span class="event-doctor"><UserRound size={15} />{event.doctor}</span>
  <ChevronRight class="row-chevron" size={18} />
</button>
