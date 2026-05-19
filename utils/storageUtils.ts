import { AppData, Holiday, State, YearConfig } from "@/types";

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

const INITIAL_STATES: State[] = [
  { id: "johor", name: "Johor", weekendDays: ["saturday", "sunday"] },
  { id: "kedah", name: "Kedah", weekendDays: ["friday", "saturday"] },
  { id: "kelantan", name: "Kelantan", weekendDays: ["friday", "saturday"] },
  { id: "melaka", name: "Melaka", weekendDays: ["saturday", "sunday"] },
  {
    id: "negeri_sembilan",
    name: "Negeri Sembilan",
    weekendDays: ["saturday", "sunday"],
  },
  { id: "pahang", name: "Pahang", weekendDays: ["saturday", "sunday"] },
  { id: "penang", name: "Penang", weekendDays: ["saturday", "sunday"] },
  { id: "perak", name: "Perak", weekendDays: ["saturday", "sunday"] },
  { id: "perlis", name: "Perlis", weekendDays: ["friday", "saturday"] },
  { id: "sabah", name: "Sabah", weekendDays: ["saturday", "sunday"] },
  { id: "sarawak", name: "Sarawak", weekendDays: ["saturday", "sunday"] },
  { id: "selangor", name: "Selangor", weekendDays: ["saturday", "sunday"] },
  {
    id: "terengganu",
    name: "Terengganu",
    weekendDays: ["friday", "saturday"],
  },
  {
    id: "wp_kl",
    name: "Wilayah Persekutuan Kuala Lumpur",
    weekendDays: ["saturday", "sunday"],
  },
  {
    id: "wp_labuan",
    name: "Wilayah Persekutuan Labuan",
    weekendDays: ["friday", "saturday"],
  },
  {
    id: "wp_putrajaya",
    name: "Wilayah Persekutuan Putrajaya",
    weekendDays: ["saturday", "sunday"],
  },
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

const INITIAL_YEARS: YearConfig = {};
for (let year = 2020; year <= 2030; year++) {
  INITIAL_YEARS[year.toString()] = true;
}

export const INITIAL_DATA: AppData = {
  states: INITIAL_STATES,
  holidays: INITIAL_HOLIDAYS,
  years: INITIAL_YEARS,
};

export function loadData(): AppData {
  if (typeof window === "undefined") return INITIAL_DATA;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_DATA;
    return JSON.parse(stored) as AppData;
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
