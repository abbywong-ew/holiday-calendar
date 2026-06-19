import { DayOfWeek, Holiday, ReplacementOverride, State } from "@/types";

const DAY_TO_NAME: Record<number, DayOfWeek | null> = {
  0: "sunday",
  1: null,
  2: null,
  3: null,
  4: null,
  5: "friday",
  6: "saturday",
};

// Sat/Sun states: only Sunday triggers replacement.
// Kelantan & Terengganu: only Saturday triggers replacement.
// All other Fri/Sat states (Kedah etc): only Friday triggers replacement.
const SAT_TRIGGERS_STATES = new Set(["kelantan", "terengganu"]);

export function getTriggeringDays(state: State): DayOfWeek[] {
  if (state.weekendDays.includes("sunday")) return ["sunday"];
  if (SAT_TRIGGERS_STATES.has(state.id)) return ["saturday"];
  return ["friday"];
}

function isWeekendDate(date: Date, weekendDays: DayOfWeek[]): boolean {
  const name = DAY_TO_NAME[date.getDay()];
  return name !== null && weekendDays.includes(name);
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function nextWorkingDay(
  date: Date,
  weekendDays: DayOfWeek[],
  occupied: Set<string>
): string {
  const next = new Date(date);
  do {
    next.setDate(next.getDate() + 1);
  } while (isWeekendDate(next, weekendDays) || occupied.has(toDateStr(next)));
  return toDateStr(next);
}

export type ReplacementEntry = {
  originalDate: string;
  replacementDate: string;
  holiday: Holiday;
};

export function getReplacementEntries(
  year: number,
  state: State,
  holidays: Holiday[],
  overrides: ReplacementOverride[]
): ReplacementEntry[] {
  const yearStr = year.toString();

  // Collect all holiday dates for this state/year so replacements skip over them
  const occupied = new Set<string>();
  for (const h of holidays) {
    if (!h.stateIds.includes(state.id)) continue;
    let dateStr: string | null = null;
    if (h.dateType === "fixed") {
      dateStr = `${year}-${String(h.fixedMonth!).padStart(2, "0")}-${String(h.fixedDay!).padStart(2, "0")}`;
    } else {
      dateStr = h.variableDates?.[yearStr] ?? null;
    }
    if (dateStr) occupied.add(dateStr);
  }

  const entries: ReplacementEntry[] = [];

  // Sort holidays by their date so earlier holidays claim replacement slots first
  const sorted = [...holidays]
    .filter((h) => h.stateIds.includes(state.id))
    .map((h) => {
      let dateStr: string | null = null;
      if (h.dateType === "fixed") {
        dateStr = `${year}-${String(h.fixedMonth!).padStart(2, "0")}-${String(h.fixedDay!).padStart(2, "0")}`;
      } else {
        dateStr = h.variableDates?.[yearStr] ?? null;
      }
      return { h, dateStr };
    })
    .filter((x): x is { h: Holiday; dateStr: string } => x.dateStr !== null)
    .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

  for (const { h, dateStr } of sorted) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);

    if (!isWeekendDate(date, getTriggeringDays(state))) continue;

    const override = overrides.find(
      (o) => o.holidayId === h.id && o.stateId === state.id && o.year === yearStr
    );

    const replacementDate = override
      ? override.replacementDate
      : nextWorkingDay(date, state.weekendDays, occupied);

    // Reserve this replacement slot so the next holiday doesn't claim the same date
    occupied.add(replacementDate);

    entries.push({
      originalDate: dateStr,
      replacementDate,
      holiday: {
        ...h,
        id: `${h.id}-replacement`,
        name: `${h.name} (Replacement)`,
        isReplacement: true,
      },
    });
  }

  return entries;
}
