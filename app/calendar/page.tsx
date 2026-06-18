"use client";

import { useState, useMemo, useEffect } from "react";
import { useCalendarData } from "@/hooks/useCalendarData";
import CalendarGrid from "@/components/CalendarGrid";
import HolidayList from "@/components/HolidayList";
import HolidayDateTable from "@/components/HolidayDateTable";
import PrintButton from "@/components/PrintButton";

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_YEAR = CURRENT_YEAR >= 2020 && CURRENT_YEAR <= 2030 ? CURRENT_YEAR : 2026;
const DEFAULT_STATE_ID = "perak";

export default function CalendarPage() {
  const { data, isLoaded } = useCalendarData();
  const [selectedYear, setSelectedYear] = useState(DEFAULT_YEAR);
  const [selectedStateId, setSelectedStateId] = useState(DEFAULT_STATE_ID);

  const enabledYears = useMemo(
    () =>
      Object.keys(data.years)
        .filter((y) => data.years[y])
        .map(Number)
        .sort(),
    [data.years]
  );

  // Ensure selectedYear stays valid
  useEffect(() => {
    if (enabledYears.length > 0 && !enabledYears.includes(selectedYear)) {
      setSelectedYear(enabledYears[enabledYears.length - 1]);
    }
  }, [enabledYears, selectedYear]);

  const selectedState = useMemo(
    () =>
      data.states.find((s) => s.id === selectedStateId) ?? data.states[0],
    [data.states, selectedStateId]
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F7F9F2] flex items-center justify-center">
        <div className="text-[#5A6640] animate-pulse">Loading calendar…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 print:hidden">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Year dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#5A6640] uppercase tracking-wide">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7A8C3F] focus:border-transparent shadow-sm"
              >
                {enabledYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* State dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#5A6640] uppercase tracking-wide">
                State
              </label>
              <select
                value={selectedStateId}
                onChange={(e) => setSelectedStateId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7A8C3F] focus:border-transparent shadow-sm min-w-[220px]"
              >
                {data.states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:self-end">
            <PrintButton />
          </div>
        </div>

        {/* Print-only header */}
        <div className="hidden print:block mb-4">
          <h1 className="text-2xl font-bold text-[#2D3320]">
            {selectedYear} Holiday Calendar - {selectedState.name}
          </h1>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-xs text-[#5A6640] print:hidden">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: "var(--hol-national)" }} />
            National Holiday
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: "var(--hol-state)" }} />
            State Holiday
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: "var(--hol-weekend)" }} />
            Weekend
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded border-2 border-[#5C6B2E] bg-white" />
            Today
          </span>
        </div>

        {/* Calendar grid */}
        <CalendarGrid
          year={selectedYear}
          state={selectedState}
          holidays={data.holidays}
          allStates={data.states}
        />

        {/* Holiday summary */}
        <HolidayList
          year={selectedYear}
          state={selectedState}
          holidays={data.holidays}
        />

        {/* Holiday date table */}
        <HolidayDateTable
          selectedYear={selectedYear}
          selectedState={selectedState}
          holidays={data.holidays}
        />
      </div>
    </div>
  );
}
