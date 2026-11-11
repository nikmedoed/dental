// Repository-safe demo fixtures. During `npm run dev`, Vite replaces this
// module with .private/personal-data.local.js when that ignored file exists.
export const SEED_CLINICS = [
  { id: "demo-clinic", name: "Демо-клиника", city: "Демо-город" },
];

export const SEED_DOCTORS = [
  {
    id: "demo-doctor",
    name: "Демо-врач",
    specialty: "Стоматолог-терапевт",
    clinicIds: ["demo-clinic"],
  },
];

const provider = {
  doctorId: "demo-doctor",
  doctor: "Демо-врач",
  doctorDetails: {
    id: "demo-doctor",
    name: "Демо-врач",
    specialty: "Стоматолог-терапевт",
  },
  clinicId: "demo-clinic",
  clinic: "Демо-клиника",
  clinicDetails: {
    id: "demo-clinic",
    name: "Демо-клиника",
    city: "Демо-город",
  },
};

export const SEED_EVENTS = [
  {
    id: "demo-checkup",
    date: "2026-03-12",
    type: "inspection",
    kind: "diagnosis",
    status: "watch",
    title: "Профилактический осмотр",
    notes: "Рекомендовано наблюдение и профессиональная гигиена.",
    tooth: 26,
    surfaces: ["Жевательная"],
    cost: 0,
    ...provider,
  },
  {
    id: "demo-filling",
    date: "2026-03-19",
    type: "treatment",
    kind: "filling",
    status: "treated",
    title: "Лечение кариеса",
    notes: "Установлена композитная пломба, прикус проверен.",
    tooth: 26,
    surfaces: ["Жевательная", "Дистальная"],
    cost: 18000,
    currency: { code: "AMD", symbol: "֏", name: "Армянский драм" },
    ...provider,
  },
  {
    id: "demo-hygiene",
    date: "2026-04-08",
    type: "hygiene",
    kind: "hygiene",
    status: "treated",
    title: "Профессиональная гигиена",
    notes: "Удалены мягкий налёт и зубной камень.",
    items: [],
    cost: 15000,
    currency: { code: "AMD", symbol: "֏", name: "Армянский драм" },
    ...provider,
  },
];

// Private fixtures can provide a scoped, non-destructive correction for local data.
export const repairPersonalEvents = (events) => events;
