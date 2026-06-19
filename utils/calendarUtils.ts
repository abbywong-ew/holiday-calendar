import { Holiday, ReplacementOverride, State, DayOfWeek } from "@/types";
import { getDaysInMonth, getFirstDayOfMonth, isToday } from "./dateUtils";
import { getReplacementEntries } from "./replacementUtils";

const DAY_OF_WEEK_NAME: Record<number, DayOfWeek | null> = {
  0: "sunday",
  1: null,
  2: null,
  3: null,
  4: null,
  5: "friday",
  6: "saturday",
};

export function isDayWeekend(
  dayOfWeek: number,
  weekendDays: DayOfWeek[]
): boolean {
  const dayName = DAY_OF_WEEK_NAME[dayOfWeek];
  if (!dayName) return false;
  return weekendDays.includes(dayName);
}

export function getHolidaysForDate(
  year: number,
  month: number,
  day: number,
  stateId: string,
  holidays: Holiday[]
): Holiday[] {
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const result: Holiday[] = [];

  for (const holiday of holidays) {
    if (!holiday.stateIds.includes(stateId)) continue;

    if (holiday.dateType === "fixed") {
      if (holiday.fixedMonth === month && holiday.fixedDay === day) {
        result.push(holiday);
      }
    } else if (holiday.dateType === "variable") {
      const yearKey = year.toString();
      if (holiday.variableDates?.[yearKey] === dateStr) {
        result.push(holiday);
      }
    }
  }

  return result;
}

export type CalendarDay = {
  day: number;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isToday: boolean;
  holidays: Holiday[];
  dayOfWeek: number;
};

export function buildMonthCalendar(
  year: number,
  month: number,
  state: State,
  holidays: Holiday[],
  replacementOverrides: ReplacementOverride[] = []
): CalendarDay[][] {
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);

  // Pre-compute replacement entries for the full year, indexed by replacement date
  const replacementMap = new Map<string, Holiday[]>();
  for (const entry of getReplacementEntries(year, state, holidays, replacementOverrides)) {
    const existing = replacementMap.get(entry.replacementDate) ?? [];
    existing.push(entry.holiday);
    replacementMap.set(entry.replacementDate, existing);
  }

  const weeks: CalendarDay[][] = [];
  let week: CalendarDay[] = [];

  for (let i = 0; i < firstDay; i++) {
    week.push({
      day: 0,
      isCurrentMonth: false,
      isWeekend: false,
      isToday: false,
      holidays: [],
      dayOfWeek: i,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    const weekend = isDayWeekend(dayOfWeek, state.weekendDays);
    const today = isToday(year, month, day);
    const dayHolidays = getHolidaysForDate(
      year,
      month,
      day,
      state.id,
      holidays
    );

    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const replacementHolidays = replacementMap.get(dateStr);
    if (replacementHolidays) dayHolidays.push(...replacementHolidays);

    week.push({
      day,
      isCurrentMonth: true,
      isWeekend: weekend,
      isToday: today,
      holidays: dayHolidays,
      dayOfWeek,
    });

    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push({
        day: 0,
        isCurrentMonth: false,
        isWeekend: false,
        isToday: false,
        holidays: [],
        dayOfWeek: week.length,
      });
    }
    weeks.push(week);
  }

  // Always pad to 6 rows so all month cards have uniform height
  while (weeks.length < 6) {
    weeks.push(
      Array.from({ length: 7 }, (_, i) => ({
        day: 0,
        isCurrentMonth: false,
        isWeekend: false,
        isToday: false,
        holidays: [],
        dayOfWeek: i,
      }))
    );
  }

  return weeks;
}

export type HolidayEntry = {
  date: string;
  holiday: Holiday;
};

export function getHolidaysForYearAndState(
  year: number,
  stateId: string,
  holidays: Holiday[]
): { national: HolidayEntry[]; state: HolidayEntry[] } {
  const national: HolidayEntry[] = [];
  const state: HolidayEntry[] = [];
  const yearStr = year.toString();

  const isAll = stateId === "all";

  for (const holiday of holidays) {
    if (!isAll && !holiday.stateIds.includes(stateId)) continue;

    let dateStr: string | null = null;

    if (holiday.dateType === "fixed") {
      const monthStr = String(holiday.fixedMonth!).padStart(2, "0");
      const dayStr = String(holiday.fixedDay!).padStart(2, "0");
      dateStr = `${year}-${monthStr}-${dayStr}`;
    } else if (holiday.dateType === "variable") {
      dateStr = holiday.variableDates?.[yearStr] ?? null;
    }

    if (dateStr) {
      if (holiday.type === "national") {
        national.push({ date: dateStr, holiday });
      } else {
        state.push({ date: dateStr, holiday });
      }
    }
  }

  national.sort((a, b) => a.date.localeCompare(b.date));
  state.sort((a, b) => a.date.localeCompare(b.date));

  return { national, state };
}
