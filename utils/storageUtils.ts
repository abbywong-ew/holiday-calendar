import { AppData, ColorConfig, Holiday, State, YearConfig } from "@/types";

export const STORAGE_KEY = "my-calendar-app-data";

export const ALL_STATE_IDS = [
  "johor",
  "kedah",
  "kelantan",
  "melaka",
  "negeri_sembilan",
  "pahang",
  "penang",
  "perak",
  "perlis",
  "sabah",
  "sarawak",
  "selangor",
  "terengganu",
  "wp_kl",
  "wp_labuan",
  "wp_putrajaya",
];

const ALL_EXCEPT_KELANTAN_TERENGGANU = ALL_STATE_IDS.filter(
  (id) => id !== "kelantan" && id !== "terengganu"
);

export const DEFAULT_STATE_CODES: Record<string, string> = {
  johor:          "JHR",
  kedah:          "KDH",
  kelantan:       "KTN",
  melaka:         "MLK",
  negeri_sembilan:"NSN",
  pahang:         "PHG",
  penang:         "PNG",
  perak:          "PRK",
  perlis:         "PLS",
  sabah:          "SBH",
  sarawak:        "SWK",
  selangor:       "SGR",
  terengganu:     "TRG",
  wp_kl:          "KUL",
  wp_labuan:      "LBN",
  wp_putrajaya:   "PJY",
};

const INITIAL_STATES: State[] = [
  { id: "johor",          name: "Johor",                            code: "JHR", weekendDays: ["saturday", "sunday"] },
  { id: "kedah",          name: "Kedah",                            code: "KDH", weekendDays: ["friday", "saturday"] },
  { id: "kelantan",       name: "Kelantan",                         code: "KTN", weekendDays: ["friday", "saturday"] },
  { id: "melaka",         name: "Melaka",                           code: "MLK", weekendDays: ["saturday", "sunday"] },
  { id: "negeri_sembilan",name: "Negeri Sembilan",                  code: "NSN", weekendDays: ["saturday", "sunday"] },
  { id: "pahang",         name: "Pahang",                           code: "PHG", weekendDays: ["saturday", "sunday"] },
  { id: "penang",         name: "Penang",                           code: "PNG", weekendDays: ["saturday", "sunday"] },
  { id: "perak",          name: "Perak",                            code: "PRK", weekendDays: ["saturday", "sunday"] },
  { id: "perlis",         name: "Perlis",                           code: "PLS", weekendDays: ["friday", "saturday"] },
  { id: "sabah",          name: "Sabah",                            code: "SBH", weekendDays: ["saturday", "sunday"] },
  { id: "sarawak",        name: "Sarawak",                          code: "SWK", weekendDays: ["saturday", "sunday"] },
  { id: "selangor",       name: "Selangor",                         code: "SGR", weekendDays: ["saturday", "sunday"] },
  { id: "terengganu",     name: "Terengganu",                       code: "TRG", weekendDays: ["friday", "saturday"] },
  { id: "wp_kl",          name: "Wilayah Persekutuan Kuala Lumpur", code: "KUL", weekendDays: ["saturday", "sunday"] },
  { id: "wp_labuan",      name: "Wilayah Persekutuan Labuan",       code: "LBN", weekendDays: ["friday", "saturday"] },
  { id: "wp_putrajaya",   name: "Wilayah Persekutuan Putrajaya",    code: "PJY", weekendDays: ["saturday", "sunday"] },
];

const INITIAL_HOLIDAYS: Holiday[] = [
  // National Holidays
  {
    id: "new-year",
    name: "New Year's Day",
    type: "national",
    dateType: "fixed",
    fixedMonth: 1,
    fixedDay: 1,
    stateIds: ALL_STATE_IDS,
  },
  {
    id: "cny-d1",
    name: "Chinese New Year Day 1",
    type: "national",
    dateType: "variable",
    variableDates: { "2026": "2026-02-17" },
    stateIds: ALL_STATE_IDS,
  },
  {
    id: "cny-d2",
    name: "Chinese New Year Day 2",
    type: "national",
    dateType: "variable",
    variableDates: { "2026": "2026-02-18" },
    stateIds: ALL_STATE_IDS,
  },
  {
    id: "labour-day",
    name: "Labour Day",
    type: "national",
    dateType: "fixed",
    fixedMonth: 5,
    fixedDay: 1,
    stateIds: ALL_STATE_IDS,
  },
  {
    id: "wesak",
    name: "Wesak Day",
    type: "national",
    dateType: "variable",
    variableDates: { "2026": "2026-05-31" },
    stateIds: ALL_STATE_IDS,
  },
  {
    id: "agong-bday",
    name: "Agong's Birthday",
    type: "national",
    dateType: "variable",
    variableDates: { "2026": "2026-06-01" },
    stateIds: ALL_STATE_IDS,
  },
  {
    id: "national-day",
    name: "National Day",
    type: "national",
    dateType: "fixed",
    fixedMonth: 8,
    fixedDay: 31,
    stateIds: ALL_STATE_IDS,
  },
  {
    id: "malaysia-day",
    name: "Malaysia Day",
    type: "national",
    dateType: "fixed",
    fixedMonth: 9,
    fixedDay: 16,
    stateIds: ALL_STATE_IDS,
  },
  {
    id: "christmas",
    name: "Christmas Day",
    type: "national",
    dateType: "fixed",
    fixedMonth: 12,
    fixedDay: 25,
    stateIds: ALL_STATE_IDS,
  },
  {
    id: "hari-raya-d1",
    name: "Hari Raya Puasa Day 1",
    type: "national",
    dateType: "variable",
    variableDates: { "2026": "2026-03-21" },
    stateIds: ALL_STATE_IDS,
  },
  {
    id: "hari-raya-d2",
    name: "Hari Raya Puasa Day 2",
    type: "national",
    dateType: "variable",
    variableDates: { "2026": "2026-03-22" },
    stateIds: ALL_STATE_IDS,
  },
  {
    id: "hari-raya-haji",
    name: "Hari Raya Haji",
    type: "national",
    dateType: "variable",
    variableDates: { "2026": "2026-05-27" },
    stateIds: ALL_STATE_IDS,
  },
  {
    id: "awal-muharam",
    name: "Awal Muharam",
    type: "national",
    dateType: "variable",
    variableDates: { "2026": "2026-06-17" },
    stateIds: ALL_STATE_IDS,
  },
  {
    id: "prophet-bday",
    name: "Prophet Muhammad's Birthday",
    type: "national",
    dateType: "variable",
    variableDates: { "2026": "2026-08-25" },
    stateIds: ALL_STATE_IDS,
  },
  // State Holidays
  {
    id: "thaipusam",
    name: "Thaipusam",
    type: "state",
    dateType: "variable",
    variableDates: { "2026": "2026-02-01" },
    stateIds: ["perak", "selangor", "penang", "wp_kl"],
  },
  {
    id: "nuzul-al-quran",
    name: "Nuzul Al-Quran",
    type: "state",
    dateType: "variable",
    variableDates: { "2026": "2026-03-07" },
    stateIds: ["perak"],
  },
  {
    id: "perak-sultan-bday",
    name: "Perak Sultan's Birthday",
    type: "state",
    dateType: "variable",
    variableDates: { "2026": "2026-11-06" },
    stateIds: ["perak"],
  },
  {
    id: "deepavali",
    name: "Deepavali",
    type: "state",
    dateType: "variable",
    variableDates: { "2026": "2026-11-08" },
    stateIds: ALL_EXCEPT_KELANTAN_TERENGGANU,
  },
];

const _currentYear = new Date().getFullYear();
const INITIAL_YEARS: YearConfig = {};
for (let year = 2020; year <= 2030; year++) {
  INITIAL_YEARS[year.toString()] = year >= _currentYear - 2 && year <= _currentYear + 2;
}

export const DEFAULT_COLORS: ColorConfig = {
  national: "#FFA726",
  state: "#FFD54F",
  weekend: "#D6E8B0",
};

export const INITIAL_DATA: AppData = {
  states: INITIAL_STATES,
  holidays: INITIAL_HOLIDAYS,
  years: INITIAL_YEARS,
  colors: DEFAULT_COLORS,
};

export function loadData(): AppData {
  if (typeof window === "undefined") return INITIAL_DATA;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_DATA;
    const parsed = JSON.parse(stored) as AppData;
    if (!parsed.colors) parsed.colors = DEFAULT_COLORS;
    parsed.states = parsed.states.map((s) =>
      s.code ? s : { ...s, code: DEFAULT_STATE_CODES[s.id] ?? "" }
    );
    return parsed;
  } catch {
    return INITIAL_DATA;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data:", e);
  }
}
