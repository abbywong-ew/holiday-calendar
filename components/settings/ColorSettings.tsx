"use client";

import { AppData, ColorConfig } from "@/types";
import { DEFAULT_COLORS } from "@/utils/storageUtils";
import { Toast, useToast } from "@/components/Toast";

type ColorSettingsProps = {
  data: AppData;
  onUpdate: (data: AppData) => void;
};

type ColorRow = {
  key: keyof ColorConfig;
  label: string;
  description: string;
};

const COLOR_ROWS: ColorRow[] = [
  { key: "national", label: "National Holiday", description: "Public holidays observed across all states" },
  { key: "state",    label: "State Holiday",    description: "Holidays specific to individual states" },
  { key: "weekend",  label: "Weekend",           description: "Saturday/Sunday (or state-specific weekend days)" },
];

export default function ColorSettings({ data, onUpdate }: ColorSettingsProps) {
  const { toast, showToast, hideToast } = useToast();
  const colors = data.colors ?? DEFAULT_COLORS;

  function handleChange(key: keyof ColorConfig, value: string) {
    onUpdate({ ...data, colors: { ...colors, [key]: value } });
  }

  function handleReset() {
    onUpdate({ ...data, colors: DEFAULT_COLORS });
    showToast("Colors reset to defaults.");
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[#2D3320] mb-4">Calendar Colors</h2>
      <p className="text-sm text-[#5A6640] mb-6">
        Customize the highlight colors used on the calendar. Changes apply immediately.
      </p>

      <div className="space-y-4 max-w-lg">
        {COLOR_ROWS.map(({ key, label, description }) => (
          <div key={key} className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 bg-[#F7F9F2]">
            {/* Color picker */}
            <label className="cursor-pointer shrink-0">
              <input
                type="color"
                value={colors[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="sr-only"
              />
              <span
                className="block w-10 h-10 rounded-lg border-2 border-white shadow ring-1 ring-gray-300 cursor-pointer transition-transform hover:scale-105"
                style={{ backgroundColor: colors[key] }}
                onClick={(e) => (e.currentTarget.previousElementSibling as HTMLInputElement)?.click()}
              />
            </label>

            {/* Label + hex */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[#2D3320] text-sm">{label}</div>
              <div className="text-xs text-[#5A6640] mt-0.5">{description}</div>
            </div>

            {/* Hex value */}
            <span className="text-xs font-mono text-[#5A6640] shrink-0 uppercase">
              {colors[key]}
            </span>

            {/* Preview swatch */}
            <span
              className="shrink-0 w-16 h-8 rounded border border-gray-200"
              style={{ backgroundColor: colors[key] }}
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm border border-gray-300 text-[#5A6640] hover:bg-gray-50 rounded-lg transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
