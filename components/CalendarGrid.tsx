"use client";

import { Holiday, State } from "@/types";
import MonthGrid from "./MonthGrid";

type CalendarGridProps = {
  year: number;
  state: State;
  holidays: Holiday[];
  allStates: State[];
};

export default function CalendarGrid({
  year,
  state,
  holidays,
  allStates,
}: CalendarGridProps) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="calendar-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:gap-2">
      {months.map((month) => (
        <MonthGrid
          key={month}
          year={year}
          month={month}
          state={state}
          holidays={holidays}
          allStates={allStates}
        />
      ))}
    </div>
  );
}
