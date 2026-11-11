<script>
  import { ChevronRight, UserRound } from "@lucide/svelte";
  import {
    eventIcon,
    eventTeeth,
    isValidDate,
  } from "../../lib/dental-utils.js";

  export let event;
  export let compact = false;
  export let onOpen = () => {};

  $: dateUnknown =
    !isValidDate(event.date) && !/^\d{4}-00-00$/.test(event.date || "");
  $: yearOnly = /^\d{4}-00-00$/.test(event.date || "");
  $: eventDate =
    dateUnknown || yearOnly ? null : new Date(`${event.date}T12:00:00`);
  $: month = dateUnknown
    ? "дата"
    : yearOnly
      ? "год"
      : new Intl.DateTimeFormat("ru-RU", { month: "short" })
          .format(eventDate)
          .replace(".", "");
  $: day = dateUnknown
    ? "—"
    : yearOnly
      ? event.date.slice(0, 4)
      : eventDate.getDate();
  $: teeth = eventTeeth(event);
  $: teethLabel = teeth.length
    ? teeth.length === 1
      ? `Зуб ${teeth[0]}`
      : `${teeth.length} зубов · ${teeth.join(", ")}`
    : "Без привязки к зубу";
  $: contextLabel = [teethLabel, event.clinic, compact && event.doctor]
    .filter(Boolean)
    .join(" · ");
</script>

<button class="event-row" class:compact on:click={() => onOpen(event)}>
  <span class="event-date"
    >{#if compact && eventDate}<b
        >{event.date.slice(8, 10)}.{event.date.slice(5, 7)}</b
      >{:else}<b>{day}</b><small>{month}</small>{/if}</span
  >
  <span class="event-icon {event.type || event.kind}">{eventIcon(event)}</span>
  <span class="event-main"
    ><b>{event.title}</b><small>{contextLabel}</small></span
  >
  {#if event.doctor && !compact}<span class="event-doctor"
      ><UserRound size={15} />{event.doctor}</span
    >{/if}
  <ChevronRight class="row-chevron" size={18} />
</button>
