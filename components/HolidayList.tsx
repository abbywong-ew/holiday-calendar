"use client";

import { Holiday, ReplacementOverride, SchoolHoliday, State } from "@/types";
import {
  getHolidaysForYearAndState,
  HolidayEntry,
} from "@/utils/calendarUtils";
import { getReplacementEntries, getTriggeringDays } from "@/utils/replacementUtils";

type HolidayListProps = {
  year: number;
  listStateId: string;
  allStates: State[];
  holidays: Holiday[];
  replacementOverrides: ReplacementOverride[];
  schoolHolidays: SchoolHoliday[];
};

function getDayShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleString("en-US", { weekday: "short" });
}

const DAY_NAME_MAP: Record<number, string> = {
  0: "sunday", 5: "friday", 6: "saturday",
};

function getRowColor(entry: HolidayEntry, state: State | null): string {
  if (entry.holiday.isReplacement) return "text-purple-600";
  if (!state) return "text-[#2D3320]";
  const [y, m, d] = entry.date.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dayName = DAY_NAME_MAP[date.getDay()] as "friday" | "saturday" | "sunday" | undefined;
  if (!dayName || !state.weekendDays.includes(dayName)) return "text-[#2D3320]";
  const triggering = getTriggeringDays(state);
  return triggering.includes(dayName) ? "text-red-600" : "text-blue-600";
}

function durationDays(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
}

function SchoolHolidayRow({ sh, year }: { sh: SchoolHoliday; year: string }) {
  const range = sh.ranges[year];
  if (!range) return null;
  const days = durationDays(range.startDate, range.endDate);
  return (
    <div className="flex items-center gap-2 py-1 border-b border-gray-100 last:border-0 text-sm print:text-[8px] print:py-0.5 text-[#2D3320]">
      <span className="font-mono text-xs print:text-[8px] shrink-0 w-[90px]">{range.startDate}</span>
      <span className="text-xs text-[#5A6640] shrink-0">→</span>
      <span className="font-mono text-xs print:text-[8px] shrink-0 w-[90px]">{range.endDate}</span>
      <span className="flex-1">{sh.name}</span>
      <span className="text-xs text-[#5A6640] bg-[#EBF3D6] px-1.5 py-0.5 rounded-full shrink-0 print:hidden">
        {days} day{days !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

function HolidayRow({ entry, state }: { entry: HolidayEntry; state: State | null }) {
  const color = getRowColor(entry, state);
  return (
    <div className={`flex items-center gap-2 py-1 border-b border-gray-100 last:border-0 text-sm print:text-[8px] print:py-0.5 ${color}`}>
      <span className="font-mono text-xs print:text-[8px] shrink-0 w-[90px]">
        {entry.date}
      </span>
      <span className="text-xs print:text-[8px] font-medium shrink-0 w-8">
        {getDayShort(entry.date)}
      </span>
      <span>{entry.holiday.name}</span>
    </div>
  );
}

export default function HolidayList({
  year,
  listStateId,
  allStates,
  holidays,
  replacementOverrides,
  schoolHolidays,
}: HolidayListProps) {
  const { national, state: stateHolidays } = getHolidaysForYearAndState(
    year,
    listStateId,
    holidays
  );

  const stateLabel =
    listStateId === "all"
      ? "All States"
      : (allStates.find((s) => s.id === listStateId)?.name ?? listStateId);

  // Compute replacement entries (only for a specific state, not "all")
  const state = listStateId !== "all" ? (allStates.find((s) => s.id === listStateId) ?? null) : null;
  const replacements = state
    ? getReplacementEntries(year, state, holidays, replacementOverrides)
    : [];

  const replacementNational: HolidayEntry[] = replacements
    .filter((r) => r.holiday.type === "national")
    .map((r) => ({ date: r.replacementDate, holiday: r.holiday }));

  const replacementState: HolidayEntry[] = replacements
    .filter((r) => r.holiday.type === "state")
    .map((r) => ({ date: r.replacementDate, holiday: r.holiday }));

  const allNational = [...national, ...replacementNational].sort((a, b) => a.date.localeCompare(b.date));
  const allState = [...stateHolidays, ...replacementState].sort((a, b) => a.date.localeCompare(b.date));

  const yearStr = year.toString();
  const filteredSchool = schoolHolidays
    .filter((sh) => !!sh.ranges[yearStr] && (listStateId === "all" || sh.stateIds.includes(listStateId)))
    .sort((a, b) => (a.ranges[yearStr]?.startDate ?? "").localeCompare(b.ranges[yearStr]?.startDate ?? ""));

  return (
    <div className="mt-6 flex flex-col gap-4 print-holiday-list print:mt-3 print:gap-2">
      {/* National + State side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
        {/* National Holidays */}
        <div className="rounded-lg overflow-hidden border border-orange-200">
          <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 print:px-2 print:py-1">
            <h3 className="font-bold text-[#2D3320] text-sm print:text-[9px] flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--hol-national)" }} />
              National Holidays ({year})
            </h3>
          </div>
          <div className="px-4 py-1 print:px-2 bg-white">
            {allNational.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">
                No national holidays found for {year}.
              </p>
            ) : (
              allNational.map((entry, i) => <HolidayRow key={i} entry={entry} state={state} />)
            )}
          </div>
        </div>

        {/* State Holidays */}
        <div className="rounded-lg overflow-hidden border border-yellow-200">
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 print:px-2 print:py-1">
            <h3 className="font-bold text-[#2D3320] text-sm print:text-[9px] flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--hol-state)" }} />
              State Holidays {stateLabel} ({year})
            </h3>
          </div>
          <div className="px-4 py-1 print:px-2 bg-white">
            {allState.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">
                No state holidays found for {stateLabel} in {year}.
              </p>
            ) : (
              allState.map((entry, i) => <HolidayRow key={i} entry={entry} state={state} />)
            )}
          </div>
        </div>
      </div>

      {/* School Holidays — full width below */}
      {filteredSchool.length > 0 && (
        <div className="rounded-lg overflow-hidden border border-blue-200">
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 print:px-2 print:py-1">
            <h3 className="font-bold text-[#2D3320] text-sm print:text-[9px] flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--hol-school)" }} />
              School Holidays {stateLabel} ({year})
            </h3>
          </div>
          <div className="px-4 py-1 print:px-2 bg-white">
            {filteredSchool.map((sh) => <SchoolHolidayRow key={sh.id} sh={sh} year={yearStr} />)}
          </div>
        </div>
      )}
    </div>
  );
}
