import { TREATMENT_KINDS } from "./dental-data.js";

export function formatDate(date, full = false) {
  return new Intl.DateTimeFormat(
    "ru-RU",
    full
      ? { day: "numeric", month: "long", year: "numeric" }
      : { day: "numeric", month: "short", year: "numeric" },
  )
    .format(new Date(`${date}T12:00:00`))
    .replace(" г.", "");
}

export function sortEvents(events) {
  return [...events].sort((a, b) => b.date.localeCompare(a.date));
}

export function eventIcon(event) {
  return (
    TREATMENT_KINDS.find((kind) => kind.value === event.kind)?.icon || "＋"
  );
}

export function latestStatusByTooth(events) {
  return sortEvents(events).reduce((result, event) => {
    if (!result[event.tooth]) result[event.tooth] = event.status;
    return result;
  }, {});
}
