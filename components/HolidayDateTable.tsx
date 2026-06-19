"use client";

import { useMemo, useState } from "react";
import { Holiday, State } from "@/types";
import { getHolidaysForYearAndState } from "@/utils/calendarUtils";
import { getShortDayName } from "@/utils/dateUtils";


type HolidayDateEntry = {
  holiday: Holiday;
  dates: {
    [year: number]: { dateStr: string; dayName: string } | null;
  };
};

type SortColumn = "name" | "year0" | "year1" | "year2" | "year3" | "year4";
type SortDirection = "asc" | "desc";

export default function HolidayDateTable({
  selectedYear,
  listStateId,
  allStates,
  holidays,
  onListStateChange,
}: {
  selectedYear: number;
  listStateId: string;
  allStates: State[];
  holidays: Holiday[];
  onListStateChange: (id: string) => void;
}) {
  const years = [selectedYear - 2, selectedYear - 1, selectedYear, selectedYear + 1, selectedYear + 2];
  const stateLabel =
    listStateId === "all"
      ? "All States"
      : (allStates.find((s) => s.id === listStateId)?.name ?? listStateId);
  const [sortColumn, setSortColumn] = useState<SortColumn>("year2");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => (
    <span className="ml-1 inline-flex flex-col" style={{ fontSize: "8px", lineHeight: 1, verticalAlign: "middle" }}>
      <span style={{ opacity: sortColumn === column && sortDirection === "asc" ? 1 : 0.3 }}>▲</span>
      <span style={{ opacity: sortColumn === column && sortDirection === "desc" ? 1 : 0.3 }}>▼</span>
    </span>
  );

  const yearColumnMap: Record<string, number> = {
    year0: years[0],
    year1: years[1],
    year2: years[2],
    year3: years[3],
    year4: years[4],
  };

  const tableData = useMemo(() => {
    const holidayMap = new Map<string, HolidayDateEntry>();

    // Collect all holidays from the 3-year range
    for (const year of years) {
      const { national, state } = getHolidaysForYearAndState(
        year,
        listStateId,
        holidays
      );

      for (const entry of [...national, ...state]) {
        const key = entry.holiday.id;

        if (!holidayMap.has(key)) {
          holidayMap.set(key, {
            holiday: entry.holiday,
            dates: {},
          });
        }

        const holidayEntry = holidayMap.get(key)!;
        holidayEntry.dates[year] = {
          dateStr: entry.date,
          dayName: getShortDayName(entry.date),
        };
      }
    }

    // Convert to array and apply sorting
    const result = Array.from(holidayMap.values());
    result.sort((a, b) => {
      let compareResult = 0;

      if (sortColumn === "name") {
        compareResult = a.holiday.name.localeCompare(b.holiday.name);
      } else {
        const year = yearColumnMap[sortColumn];
        const aDate = a.dates[year];
        const bDate = b.dates[year];

        if (!aDate && !bDate) compareResult = 0;
        else if (!aDate) compareResult = 1;
        else if (!bDate) compareResult = -1;
        else compareResult = aDate.dateStr.localeCompare(bDate.dateStr);
      }

      return sortDirection === "asc" ? compareResult : -compareResult;
    });

    return result;
  }, [selectedYear, listStateId, holidays, years, sortColumn, sortDirection, yearColumnMap]);

  if (tableData.length === 0) {
    return null;
  }

  const getRowBg = (type: "national" | "state"): string =>
    type === "national" ? "var(--hol-national-light)" : "var(--hol-state-light)";

  return (
    <div className="holiday-date-table mt-8 border-t border-[#E0E8D8] pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 print:hidden">
        <label className="text-xs font-medium text-[#5A6640] uppercase tracking-wide shrink-0">
          Listing State
        </label>
        <select
          value={listStateId}
          onChange={(e) => onListStateChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7A8C3F] focus:border-transparent shadow-sm min-w-[220px]"
        >
          <option value="all">ALL — All States</option>
          {allStates.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <h2 className="text-lg font-semibold text-[#2D3320] mb-2">
        Holiday Dates: {stateLabel} ({years[0]} - {years[4]})
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#7A8C3F]">
              <th
                className="sticky left-0 z-10 px-3 py-2 text-left text-white font-semibold cursor-pointer hover:bg-[#8B9E4D] transition-colors bg-[#7A8C3F]"
                onClick={() => handleSort("name")}
              >
                Holiday Name<SortIcon column="name" />
              </th>
              <th
                className="px-1.5 py-2 text-center text-white font-semibold min-w-[85px] cursor-pointer hover:bg-[#8B9E4D] transition-colors"
                onClick={() => handleSort("year0")}
              >
                {years[0]}<SortIcon column="year0" />
              </th>
              <th
                className="px-1.5 py-2 text-center text-white font-semibold min-w-[85px] cursor-pointer hover:bg-[#8B9E4D] transition-colors"
                onClick={() => handleSort("year1")}
              >
                {years[1]}<SortIcon column="year1" />
              </th>
              <th
                className="px-1.5 py-2 text-center text-white font-semibold min-w-[85px] bg-[#5C6B2E] cursor-pointer hover:bg-[#6B7D38] transition-colors"
                onClick={() => handleSort("year2")}
              >
                {years[2]}<SortIcon column="year2" />
              </th>
              <th
                className="px-1.5 py-2 text-center text-white font-semibold min-w-[85px] cursor-pointer hover:bg-[#8B9E4D] transition-colors"
                onClick={() => handleSort("year3")}
              >
                {years[3]}<SortIcon column="year3" />
              </th>
              <th
                className="px-1.5 py-2 text-center text-white font-semibold min-w-[85px] cursor-pointer hover:bg-[#8B9E4D] transition-colors"
                onClick={() => handleSort("year4")}
              >
                {years[4]}<SortIcon column="year4" />
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((entry) => (
              <tr
                key={entry.holiday.id}
                className="border-b border-[#E0E8D8]"
                style={{ backgroundColor: getRowBg(entry.holiday.type) }}
              >
                <td className="sticky left-0 z-10 px-3 py-2" style={{ backgroundColor: getRowBg(entry.holiday.type) }}>
                  <div className="font-medium text-[#2D3320]">
                    {entry.holiday.name}
                  </div>
                </td>
                <td className="px-1.5 py-2 text-center text-[#2D3320] text-xs font-mono">
                  {entry.dates[years[0]] ? (
                    `${entry.dates[years[0]]!.dateStr} (${entry.dates[years[0]]!.dayName})`
                  ) : (
                    <span className="text-[#9AA8A8]">-</span>
                  )}
                </td>
                <td className="px-1.5 py-2 text-center text-[#2D3320] text-xs font-mono">
                  {entry.dates[years[1]] ? (
                    `${entry.dates[years[1]]!.dateStr} (${entry.dates[years[1]]!.dayName})`
                  ) : (
                    <span className="text-[#9AA8A8]">-</span>
                  )}
                </td>
                <td className="px-1.5 py-2 text-center text-[#2D3320] text-xs font-mono">
                  {entry.dates[years[2]] ? (
                    `${entry.dates[years[2]]!.dateStr} (${entry.dates[years[2]]!.dayName})`
                  ) : (
                    <span className="text-[#9AA8A8]">-</span>
                  )}
                </td>
                <td className="px-1.5 py-2 text-center text-[#2D3320] text-xs font-mono">
                  {entry.dates[years[3]] ? (
                    `${entry.dates[years[3]]!.dateStr} (${entry.dates[years[3]]!.dayName})`
                  ) : (
                    <span className="text-[#9AA8A8]">-</span>
                  )}
                </td>
                <td className="px-1.5 py-2 text-center text-[#2D3320] text-xs font-mono">
                  {entry.dates[years[4]] ? (
                    `${entry.dates[years[4]]!.dateStr} (${entry.dates[years[4]]!.dayName})`
                  ) : (
                    <span className="text-[#9AA8A8]">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
