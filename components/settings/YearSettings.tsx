"use client";

import { AppData } from "@/types";
import { Toast, useToast } from "@/components/Toast";

type YearSettingsProps = {
  data: AppData;
  onUpdate: (data: AppData) => void;
};

export default function YearSettings({ data, onUpdate }: YearSettingsProps) {
  const { toast, showToast, hideToast } = useToast();

  const enabledCount = Object.values(data.years).filter(Boolean).length;

  function toggleYear(year: string) {
    const current = data.years[year];
    if (current && enabledCount <= 1) {
      showToast("At least one year must remain enabled.", "error");
      return;
    }
    const updatedYears = { ...data.years, [year]: !current };
    onUpdate({ ...data, years: updatedYears });
    showToast(
      `${year} ${!current ? "enabled" : "disabled"} in calendar dropdown.`
    );
  }

  const sortedYears = Object.keys(data.years).sort();

  return (
    <div>
      <h2 className="text-xl font-bold text-[#2D3320] mb-4">Available Years</h2>
      <p className="text-sm text-[#5A6640] mb-4">
        Toggle which years are visible in the Calendar page year dropdown. At
        least one year must remain enabled.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-lg">
        {sortedYears.map((year) => {
          const enabled = data.years[year];
          const isLastEnabled = enabled && enabledCount <= 1;
          return (
            <label
              key={year}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer select-none transition-colors ${
                enabled
                  ? "bg-[#F7F9F2] border-[#9AAD52]"
                  : "bg-white border-gray-200"
              } ${isLastEnabled ? "opacity-60 cursor-not-allowed" : "hover:border-[#7A8C3F]"}`}
            >
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => toggleYear(year)}
                disabled={isLastEnabled}
                className="w-4 h-4 accent-[#7A8C3F]"
              />
              <span
                className={`font-medium text-sm ${enabled ? "text-[#2D3320]" : "text-gray-400"}`}
              >
                {year}
              </span>
            </label>
          );
        })}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
