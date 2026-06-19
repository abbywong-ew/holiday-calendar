"use client";

import { useState, useMemo } from "react";
import { Holiday, ReplacementOverride, SchoolHoliday, State } from "@/types";
import { buildMonthCalendar, isDayWeekend } from "@/utils/calendarUtils";
import { MONTH_NAMES_LONG } from "@/utils/dateUtils";

type MonthGridProps = {
  year: number;
  month: number;
  state: State;
  holidays: Holiday[];
  allStates: State[];
  replacementOverrides: ReplacementOverride[];
  schoolHolidays: SchoolHoliday[];
};

const DAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];

type TooltipInfo = { wi: number; di: number; lines: string[] };

export default function MonthGrid({
  year,
  month,
  state,
  holidays,
  allStates,
  replacementOverrides,
  schoolHolidays,
}: MonthGridProps) {
  const weeks = buildMonthCalendar(year, month, state, holidays, replacementOverrides);
  const monthName = MONTH_NAMES_LONG[month - 1];
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  // Build a map of date string → school holiday name for this month's state
  const schoolDayMap = useMemo(() => {
    const map = new Map<string, string>();
    const mStart = new Date(year, month - 1, 1);
    const mEnd = new Date(year, month, 0);
    for (const sh of schoolHolidays) {
      if (!sh.stateIds.includes(state.id)) continue;
      const range = sh.ranges[year.toString()];
      if (!range) continue;
      const rangeStart = new Date(Math.max(new Date(range.startDate).getTime(), mStart.getTime()));
      const rangeEnd = new Date(Math.min(new Date(range.endDate).getTime(), mEnd.getTime()));
      if (rangeStart > rangeEnd) continue;
      const cur = new Date(rangeStart);
      while (cur <= rangeEnd) {
        const ds = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
        map.set(ds, sh.name);
        cur.setDate(cur.getDate() + 1);
      }
    }
    return map;
  }, [schoolHolidays, state.id, year, month]);

  return (
    <div className="border border-gray-300 rounded-lg text-[11px] print:text-[7px] print:rounded">
      {/* Month header – darkest green */}
      <div className="bg-[#5C6B2E] rounded-t-lg text-white text-center py-1.5 print:py-0.5 font-bold tracking-wider uppercase">
        {monthName} {year}
      </div>

      {/* Day headers – slightly lighter green; all headers white (no yellow for weekend) */}
      <div className="grid grid-cols-7 bg-[#7A8C3F]">
        {DAY_HEADERS.map((d, i) => (
          <div
            key={i}
            className="text-center py-1 print:py-0.5 text-[10px] print:text-[6px] font-bold text-white"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Week rows – always 6 rows for uniform height */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-t border-gray-200">
          {week.map((cell, di) => {
            const colWeekend = isDayWeekend(di, state.weekendDays);

            /* Empty (out-of-month) cell */
            if (!cell.isCurrentMonth) {
              return (
                <div
                  key={di}
                  className="h-9 print:h-5 border-r border-gray-100 last:border-r-0"
                  style={{ backgroundColor: colWeekend ? "var(--hol-weekend)" : "#ffffff" }}
                />
              );
            }

            /* Determine background */
            const hasNational = cell.holidays.some((h) => h.type === "national");
            const hasState = cell.holidays.some((h) => h.type === "state");
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
            const schoolName = schoolDayMap.get(dateStr);
            const hasHoliday = cell.holidays.length > 0 || !!schoolName;

            let bgColor = colWeekend ? "var(--hol-weekend)" : "#ffffff";
            const fg = "text-[#2D3320]";
            if (hasNational) bgColor = "var(--hol-national)";
            else if (hasState) bgColor = "var(--hol-state)";
            else if (schoolName) bgColor = "var(--hol-school)";

            const isHovered = tooltip?.wi === wi && tooltip?.di === di;

            const buildLines = () => {
              const lines = cell.holidays.map((h) => {
                const names =
                  h.stateIds.length === allStates.length
                    ? "ALL"
                    : h.stateIds
                        .map((id) => allStates.find((s) => s.id === id)?.code ?? id.toUpperCase())
                        .join(", ");
                return `${h.name} — ${names}`;
              });
              if (schoolName) lines.push(`School Holiday: ${schoolName}`);
              return lines;
            };

            return (
              <div
                key={di}
                className={`relative h-9 print:h-5 flex flex-col items-center justify-start print:justify-center pt-0.5 print:pt-0 border-r border-gray-100 last:border-r-0 ${fg} ${cell.isToday ? "today-outline" : ""}`}
                style={{ backgroundColor: bgColor }}
                onMouseEnter={() => {
                  if (hasHoliday) setTooltip({ wi, di, lines: buildLines() });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <span className="font-semibold leading-none text-[11px] print:text-[7px]">
                  {cell.day}
                </span>

                {/* Holiday name – single line, clipped, hidden in print */}
                {hasHoliday && (
                  <span
                    className="w-full text-center px-0.5 mt-px print:hidden"
                    style={{
                      fontSize: "8px",
                      lineHeight: "1.1",
                      display: "block",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {cell.holidays.length > 0 ? cell.holidays[0].name : schoolName}
                  </span>
                )}

                {/* Tooltip — always shows BELOW the cell */}
                {isHovered && (
                  <div
                    className="absolute z-[200] top-full left-1/2 -translate-x-1/2 mt-1.5 bg-gray-800 text-white rounded-md shadow-xl pointer-events-none print:hidden"
                    style={{
                      fontSize: "10px",
                      lineHeight: "1.6",
                      padding: "6px 10px",
                      minWidth: "200px",
                      maxWidth: "340px",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {tooltip!.lines.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                    {/* Arrow pointing up */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        borderWidth: "5px",
                        borderStyle: "solid",
                        borderColor: "transparent transparent #1f2937 transparent",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
