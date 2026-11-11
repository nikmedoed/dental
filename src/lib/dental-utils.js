import { ALL_TEETH, TREATMENT_KINDS, VISIT_TYPES } from "./dental-data.js";

export function formatDate(date, full = false) {
  if (typeof date !== "string" || !date || date.startsWith("0000-"))
    return "Дата неизвестна";
  if (/^\d{4}-00-00$/.test(date)) return `${date.slice(0, 4)} год`;
  if (!isValidDate(date)) return "Дата неизвестна";
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
  return [...events].sort(
    (a, b) =>
      String(b.date || "").localeCompare(String(a.date || "")) ||
      String(b.createdAt || b.parentEvent?.createdAt || "").localeCompare(
        String(a.createdAt || a.parentEvent?.createdAt || ""),
      ),
  );
}

export function eventIcon(event) {
  return (
    VISIT_TYPES.find((type) => type.value === event.type)?.icon ||
    TREATMENT_KINDS.find((kind) => kind.value === event.kind)?.icon ||
    "＋"
  );
}

export function eventEntries(event) {
  if (Array.isArray(event.items))
    return event.items
      .filter(Boolean)
      .map((item) => ({
        ...item,
        tooth: Number(item.tooth),
        surfaces: Array.isArray(item.surfaces) ? item.surfaces : [],
        attachments: Array.isArray(item.attachments) ? item.attachments : [],
      }));
  if (!event.tooth) return [];
  return [
    {
      id: `${event.id}-tooth-${event.tooth}`,
      tooth: Number(event.tooth),
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

export function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const parsed = new Date(value + "T12:00:00Z");
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export function localDate() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

export const CONDITION_LABELS = {
  unknown: "Нет данных о состоянии",
  healthy: "Здоров по осмотру",
  treated: "Пролечен",
  issue: "Есть проблема",
  watch: "Наблюдение или план",
  complaint: "Активная жалоба",
};

export function toothStateByTooth(events) {
  const entries = flattenDentalEntries(sortEvents(events)).filter(
    (entry) => entry.parentEvent?.affectsStatus !== false,
  );
  return Object.fromEntries(
    ALL_TEETH.map((tooth) => {
      const history = entries.filter((entry) => Number(entry.tooth) === tooth);
      const structural = history.find((entry) =>
        ["implant", "missing"].includes(entry.status),
      );
      const hasTreatment = history.some(
        (entry) =>
          entry.kind !== "hygiene" &&
          (["filling", "root_canal", "crown", "implant", "extraction"].includes(
            entry.kind,
          ) ||
            ["treated", "crown", "implant", "missing"].includes(entry.status)),
      );
      // Resolving a symptom does not erase the last recorded clinical finding.
      const clinical = history.find(
        (entry) =>
          !["complaint", "complaint_resolved"].includes(entry.kind) &&
          !["complaint", "resolved"].includes(entry.status) &&
          entry.kind !== "hygiene",
      );
      const symptom = history.find(
        (entry) =>
          ["complaint", "complaint_resolved"].includes(entry.kind) ||
          ["complaint", "resolved"].includes(entry.status),
      );
      const complaintActive = Boolean(
        symptom &&
        (symptom.kind === "complaint" || symptom.status === "complaint"),
      );
      const clinicalCondition = ["issue", "watch", "healthy"].includes(
        clinical?.status,
      )
        ? clinical.status
        : ["treated", "crown", "implant"].includes(clinical?.status)
          ? "treated"
          : "unknown";
      return [
        tooth,
        {
          structure: structural?.status || "natural",
          condition: complaintActive ? "complaint" : clinicalCondition,
          clinicalCondition,
          complaintActive,
          hasTreatment,
          latestEntry: history[0],
          clinicalEntry: clinical,
          needsAttention:
            complaintActive || ["issue", "watch"].includes(clinicalCondition),
        },
      ];
    }),
  );
}

export function dentalStatistics(events) {
  const states = toothStateByTooth(events);
  const groups = [
    [
      "healthy",
      "Здоровы по осмотру, без лечения",
      (s) => !s.hasTreatment && s.condition === "healthy",
    ],
    [
      "treated",
      "Лечили · без отмеченных проблем",
      (s) => s.hasTreatment && !s.needsAttention,
    ],
    [
      "treated-issue",
      "Лечили · требуют внимания",
      (s) => s.hasTreatment && s.needsAttention,
    ],
    [
      "untreated-issue",
      "Не лечили · требуют внимания",
      (s) => !s.hasTreatment && s.needsAttention,
    ],
    [
      "unknown",
      "Состояние неизвестно",
      (s) => !s.hasTreatment && !s.needsAttention && s.condition !== "healthy",
    ],
    ["missing", "Отсутствуют / удалены", (s) => s.structure === "missing"],
  ];
  return groups.map(([key, label, matches]) => ({
    key,
    label,
    teeth: ALL_TEETH.filter(
      (tooth) =>
        (key === "missing" || states[tooth].structure !== "missing") &&
        matches(states[tooth]),
    ),
  }));
}

export function toothEntries(events, tooth) {
  return sortEvents(
    flattenDentalEntries(events).filter(
      (entry) => Number(entry.tooth) === Number(tooth),
    ),
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

export function validateBackup(data) {
  if (!data || !Array.isArray(data.events))
    throw new Error("В архиве нет массива записей.");
  const ids = new Set();
  for (const event of data.events) {
    if (
      !event ||
      typeof event.id !== "string" ||
      !event.id ||
      ids.has(event.id) ||
      typeof event.title !== "string" ||
      typeof event.date !== "string" ||
      !(
        isValidDate(event.date) ||
        /^\d{4}-00-00$/.test(event.date) ||
        event.date === "0000-00-00"
      )
    )
      throw new Error(
        "Архив содержит некорректные даты, записи или повторяющиеся ID.",
      );
    ids.add(event.id);
    if (event.items !== undefined && !Array.isArray(event.items))
      throw new Error("Некорректные записи по зубам.");
    if (eventEntries(event).some((entry) => !ALL_TEETH.includes(entry.tooth)))
      throw new Error("В архиве есть неизвестный номер зуба.");
  }
  for (const key of ["clinics", "doctors", "currencies"])
    if (
      data[key] !== undefined &&
      (!Array.isArray(data[key]) ||
        data[key].some((item) => !item || typeof item !== "object"))
    )
      throw new Error("Некорректный справочник: " + key);
  return data;
}
