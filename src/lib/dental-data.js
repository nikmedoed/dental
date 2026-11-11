export const UPPER_TEETH = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
];

export const LOWER_TEETH = [
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
];

export const ALL_TEETH = [...UPPER_TEETH, ...LOWER_TEETH];
export const DEFAULT_TOOTH = 16;

export const VISIT_TYPES = [
  { value: "complaint", label: "Жалоба", icon: "!" },
  { value: "inspection", label: "Осмотр", icon: "◎" },
  { value: "treatment", label: "Лечение", icon: "◐" },
  { value: "surgery", label: "Хирургия", icon: "⊕" },
  { value: "hygiene", label: "Гигиена", icon: "✦" },
  { value: "consultation", label: "Консультация", icon: "⌁" },
  { value: "other", label: "Другое", icon: "＋" },
];

export const DEFAULT_CURRENCIES = [
  { code: "AMD", symbol: "֏", name: "Армянский драм" },
  { code: "KZT", symbol: "₸", name: "Казахстанский тенге" },
  { code: "RUB", symbol: "₽", name: "Российский рубль" },
  { code: "USD", symbol: "$", name: "Доллар США" },
  { code: "EUR", symbol: "€", name: "Евро" },
];

export const TOOTH_STATUS = {
  healthy: {
    label: "Здоров по осмотру",
    short: "Здоров",
    className: "neutral",
  },
  treated: { label: "После лечения", short: "Лечение", className: "mint" },
  watch: { label: "Наблюдение", short: "Контроль", className: "amber" },
  issue: { label: "Требует внимания", short: "Внимание", className: "coral" },
  complaint: { label: "Активная жалоба", short: "Жалоба", className: "amber" },
  resolved: {
    label: "Жалоба снята",
    short: "Жалоба снята",
    className: "neutral",
  },
  crown: { label: "Коронка", short: "Коронка", className: "violet" },
  implant: { label: "Имплант", short: "Имплант", className: "blue" },
  missing: { label: "Удалён", short: "Удалён", className: "muted" },
};

export const TREATMENT_KINDS = [
  {
    value: "complaint_resolved",
    label: "Жалоба снята",
    icon: "✓",
    status: "resolved",
  },
  { value: "complaint", label: "Жалоба", icon: "!", status: "complaint" },
  { value: "filling", label: "Пломба", icon: "◐", status: "treated" },
  { value: "diagnosis", label: "Осмотр", icon: "◎", status: "watch" },
  {
    value: "root_canal",
    label: "Лечение каналов",
    icon: "⌁",
    status: "treated",
  },
  { value: "crown", label: "Коронка", icon: "♢", status: "crown" },
  { value: "implant", label: "Имплант", icon: "⊕", status: "implant" },
  { value: "extraction", label: "Удаление", icon: "×", status: "missing" },
  { value: "hygiene", label: "Гигиена", icon: "✦", status: "treated" },
  { value: "other", label: "Другое", icon: "＋", status: "watch" },
];

export const SURFACES = [
  "Жевательная",
  "Мезиальная",
  "Дистальная",
  "Вестибулярная",
  "Язычная",
];

export const SURFACE_HELP = [
  { name: "Жевательная", description: "верхняя поверхность боковых зубов" },
  {
    name: "Мезиальная",
    description: "сторона зуба, направленная к центру ряда",
  },
  {
    name: "Дистальная",
    description: "сторона зуба, направленная от центра ряда",
  },
  { name: "Вестибулярная", description: "наружная сторона — к губе или щеке" },
  { name: "Язычная", description: "внутренняя сторона — к языку или нёбу" },
];

export const ODONTOGRAM_LEGEND = [
  "healthy",
  "treated",
  "watch",
  "issue",
  "crown",
  "implant",
  "missing",
];

export const LOGIN_PREVIEW_TEETH = [18, 17, 16, 15, 14, 13, 12, 11];
export const LOGIN_PREVIEW_FILLED_TEETH = [16, 11];

export const NEXT_APPOINTMENT = null;

const LEGACY_SEED_EVENTS = [
  {
    id: "e1",
    tooth: 16,
    date: "2026-06-28",
    kind: "filling",
    status: "treated",
    title: "Лечение кариеса",
    notes: "Композитная реставрация. Контакт восстановлен, прикус проверен.",
    doctor: "Анна Воронова",
    clinic: "Клиника «Белая линия»",
    surfaces: ["Жевательная", "Дистальная"],
    episodeId: "ep1",
    cost: 8500,
  },
  {
    id: "e2",
    tooth: 16,
    date: "2026-06-21",
    kind: "diagnosis",
    status: "issue",
    title: "Диагностика кариеса",
    notes: "Кариес средней глубины, реакция на холод кратковременная.",
    doctor: "Анна Воронова",
    clinic: "Клиника «Белая линия»",
    surfaces: ["Жевательная"],
    episodeId: "ep1",
    cost: 1200,
  },
  {
    id: "e3",
    tooth: 26,
    date: "2026-05-14",
    kind: "crown",
    status: "crown",
    title: "Установка постоянной коронки",
    notes: "Керамическая коронка E.max. Фиксация постоянная.",
    doctor: "Михаил Громов",
    clinic: "АртДент",
    surfaces: [],
    episodeId: "ep2",
    cost: 38500,
  },
  {
    id: "e4",
    tooth: 26,
    date: "2026-04-26",
    kind: "root_canal",
    status: "treated",
    title: "Повторное лечение каналов",
    notes: "Три канала обработаны и запломбированы.",
    doctor: "Михаил Громов",
    clinic: "АртДент",
    surfaces: [],
    episodeId: "ep2",
    cost: 21900,
  },
  {
    id: "e5",
    tooth: 46,
    date: "2026-03-11",
    kind: "implant",
    status: "implant",
    title: "Установка импланта",
    notes: "Имплант установлен, заживление без особенностей.",
    doctor: "Сергей Левин",
    clinic: "Nova Dental",
    surfaces: [],
    episodeId: "ep3",
    cost: 47000,
  },
  {
    id: "e6",
    tooth: 37,
    date: "2025-11-08",
    kind: "filling",
    status: "watch",
    title: "Замена пломбы",
    notes: "Рекомендован контроль через 6 месяцев.",
    doctor: "Анна Воронова",
    clinic: "Клиника «Белая линия»",
    surfaces: ["Жевательная", "Мезиальная"],
    episodeId: "ep4",
    cost: 7200,
  },
  {
    id: "e7",
    tooth: 11,
    date: "2025-08-17",
    kind: "filling",
    status: "treated",
    title: "Реставрация скола",
    notes: "Эстетическая реставрация режущего края.",
    doctor: "Ирина Лазарева",
    clinic: "Smile Lab",
    surfaces: ["Вестибулярная"],
    episodeId: "ep5",
    cost: 10500,
  },
  {
    id: "e8",
    tooth: 48,
    date: "2025-02-03",
    kind: "extraction",
    status: "missing",
    title: "Удаление зуба мудрости",
    notes: "Атравматичное удаление, без осложнений.",
    doctor: "Сергей Левин",
    clinic: "Nova Dental",
    surfaces: [],
    episodeId: "ep6",
    cost: 12000,
  },
];

const LEGACY_TREATMENT_EPISODES = [
  {
    id: "ep1",
    title: "Лечение кариеса 16 зуба",
    subtitle: "Диагностика и реставрация",
    date: "21–28 июня 2026",
    status: "Завершён",
    tooth: 16,
    color: "teal",
  },
  {
    id: "ep2",
    title: "Восстановление 26 зуба",
    subtitle: "Каналы и керамическая коронка",
    date: "26 апреля – 14 мая 2026",
    status: "Завершён",
    tooth: 26,
    color: "violet",
  },
  {
    id: "ep3",
    title: "Имплантация 46 зуба",
    subtitle: "Хирургический этап",
    date: "11 марта 2026 – сейчас",
    status: "На контроле",
    tooth: 46,
    color: "blue",
  },
  {
    id: "ep4",
    title: "Замена пломбы 37 зуба",
    subtitle: "Реставрация и наблюдение",
    date: "8 ноября 2025",
    status: "Наблюдение",
    tooth: 37,
    color: "amber",
  },
];

export const TREATMENT_EPISODES = [];

export const HISTORY_FILTERS = [
  ["all", "Все"],
  ["filling", "Пломбы"],
  ["root_canal", "Каналы"],
  ["crown", "Коронки"],
  ["implant", "Импланты"],
];

export const HISTORY_SUMMARY_GROUPS = [
  { label: "Лечение и пломбы", kinds: ["filling", "hygiene"], color: "teal" },
  {
    label: "Коронки и каналы",
    kinds: ["crown", "root_canal"],
    color: "violet",
  },
  { label: "Имплантация", kinds: ["implant"], color: "blue" },
  { label: "Удаление", kinds: ["extraction"], color: "muted" },
];

export const SHARE_DURATIONS = [
  ["1", "1 день"],
  ["7", "7 дней"],
  ["30", "30 дней"],
];
