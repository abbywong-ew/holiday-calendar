"use client";

import { Holiday, State } from "@/types";
import {
  getHolidaysForYearAndState,
  HolidayEntry,
} from "@/utils/calendarUtils";

type HolidayListProps = {
  year: number;
  state: State;
  holidays: Holiday[];
};

function getDayShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleString("en-US", { weekday: "short" });
}

function HolidayRow({ entry }: { entry: HolidayEntry }) {
  return (
    <div className="flex items-center gap-2 py-1 border-b border-gray-100 last:border-0 text-sm print:text-[8px] print:py-0.5">
      <span className="font-mono text-xs print:text-[8px] text-[#5A6640] shrink-0 w-[90px]">
        {entry.date}
      </span>
      <span className="text-xs print:text-[8px] font-medium text-[#5A6640] shrink-0 w-8">
        {getDayShort(entry.date)}
      </span>
      <span className="text-[#2D3320]">{entry.holiday.name}</span>
    </div>
  );
}

export default function HolidayList({
  year,
  state,
  holidays,
}: HolidayListProps) {
  const { national, state: stateHolidays } = getHolidaysForYearAndState(
    year,
    state.id,
    holidays
  );

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 print-holiday-list print:mt-3 print:gap-2">
      {/* National Holidays */}
      <div className="rounded-lg overflow-hidden border border-orange-200">
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 print:px-2 print:py-1">
          <h3 className="font-bold text-[#2D3320] text-sm print:text-[9px] flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--hol-national)" }} />
            National Holidays ({year})
          </h3>
        </div>
        <div className="px-4 py-1 print:px-2 bg-white">
          {national.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">
              No national holidays found for {year}.
            </p>
          ) : (
            national.map((entry, i) => <HolidayRow key={i} entry={entry} />)
          )}
        </div>
      </div>

      {/* State Holidays */}
      <div className="rounded-lg overflow-hidden border border-yellow-200">
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 print:px-2 print:py-1">
          <h3 className="font-bold text-[#2D3320] text-sm print:text-[9px] flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--hol-state)" }} />
            {state.name} State Holidays ({year})
          </h3>
        </div>
        <div className="px-4 py-1 print:px-2 bg-white">
          {stateHolidays.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">
              No state holidays found for {state.name} in {year}.
            </p>
          ) : (
            stateHolidays.map((entry, i) => (
              <HolidayRow key={i} entry={entry} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
