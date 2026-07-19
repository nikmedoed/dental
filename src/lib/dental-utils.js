import { TREATMENT_KINDS, VISIT_TYPES } from "./dental-data.js";

export function formatDate(date, full = false) {
  if (!date || date.startsWith("0000-")) return "Дата неизвестна";
  if (/^\d{4}-00-00$/.test(date)) return `${date.slice(0, 4)} год`;
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
    VISIT_TYPES.find((type) => type.value === event.type)?.icon ||
    TREATMENT_KINDS.find((kind) => kind.value === event.kind)?.icon ||
    "＋"
  );
}

export function eventEntries(event) {
  if (Array.isArray(event.items)) return event.items;
  if (!event.tooth) return [];
  return [
    {
      id: `${event.id}-tooth-${event.tooth}`,
      tooth: event.tooth,
      kind: event.kind,
      status: event.status,
      title: event.title,
      notes: event.notes,
      surfaces: event.surfaces || [],
      attachments: [],
    },
  ];
}

export function eventTeeth(event) {
  return [...new Set(eventEntries(event).map((entry) => entry.tooth))];
}

export function flattenDentalEntries(events) {
  return events.flatMap((event) =>
    eventEntries(event).map((entry) => ({
      ...entry,
      eventId: event.id,
      parentEvent: event,
      date: event.date,
      doctor: entry.doctor || event.doctor,
      clinic: entry.clinic || event.clinic,
      visitTitle: event.title,
      cost: entry.cost ?? event.cost,
      currency: entry.currency || event.currency,
    })),
  );
}

export function latestStatusByTooth(events) {
  return flattenDentalEntries(sortEvents(events))
    .filter((entry) => entry.parentEvent?.affectsStatus !== false)
    .reduce((result, entry) => {
      if (!result[entry.tooth]) result[entry.tooth] = entry.status;
      return result;
    }, {});
}

export function toothStateByTooth(events) {
  const entries = flattenDentalEntries(sortEvents(events)).filter(
    (entry) => entry.parentEvent?.affectsStatus !== false,
  );
  const treatmentKinds = new Set([
    "filling",
    "root_canal",
    "crown",
    "implant",
    "extraction",
    "hygiene",
  ]);

  return entries.reduce((states, entry) => {
    const tooth = Number(entry.tooth);
    if (!states[tooth]) {
      const toothEntries = entries.filter((item) => Number(item.tooth) === tooth);
      const structuralEntry = toothEntries.find((item) =>
        ["implant", "missing"].includes(item.status),
      );
      const hasTreatment = toothEntries.some(
        (item) =>
          treatmentKinds.has(item.kind) ||
          ["treated", "crown", "implant", "missing"].includes(item.status),
      );
      const currentEntry = toothEntries.find((item) => item.status !== "missing");
      let condition = hasTreatment ? "treated" : "untreated";
      if (currentEntry?.kind === "complaint") condition = "complaint";
      else if (["issue", "watch"].includes(currentEntry?.status))
        condition = "issue";
      else if (currentEntry?.kind === "complaint_resolved")
        condition = hasTreatment ? "treated" : "untreated";

      states[tooth] = {
        structure: structuralEntry?.status || "natural",
        condition,
        hasTreatment,
        latestEntry: toothEntries[0],
      };
    }
    return states;
  }, {});
}

export function toothEntries(events, tooth) {
  return sortEvents(
    flattenDentalEntries(events).filter((entry) => entry.tooth === tooth),
  );
}

export function describeTooth(tooth) {
  const quadrant = Math.floor(Number(tooth) / 10);
  const position = Number(tooth) % 10;
  const locations = {
    1: "верхняя челюсть справа",
    2: "верхняя челюсть слева",
    3: "нижняя челюсть слева",
    4: "нижняя челюсть справа",
  };
  const names = {
    1: "центральный резец",
    2: "боковой резец",
    3: "клык",
    4: "первый премоляр",
    5: "второй премоляр",
    6: "первый моляр",
    7: "второй моляр",
    8: "зуб мудрости",
  };
  return `${locations[quadrant]}, ${names[position]}`;
}

export function formatMoney(amount, currency) {
  if (amount === undefined || amount === null || amount === "") return "";
  if (currency?.symbol) {
    return `${Number(amount).toLocaleString("ru-RU", {
      maximumFractionDigits: 2,
    })} ${currency.symbol}`;
  }
  const code = currency?.code || currency || "RUB";
  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `${Number(amount).toLocaleString("ru-RU")} ${code}`;
  }
}

export function providerLabel(event, separator = " · ") {
  return [event?.doctor, event?.clinic].filter(Boolean).join(separator);
}

export function stripFinancialData(event) {
  const { cost: _cost, currency: _currency, ...safeEvent } = event;
  return {
    ...safeEvent,
    items: Array.isArray(event.items)
      ? event.items.map((item) => {
          const {
            cost: _itemCost,
            currency: _itemCurrency,
            ...safeItem
          } = item;
          return safeItem;
        })
      : event.items,
  };
}
