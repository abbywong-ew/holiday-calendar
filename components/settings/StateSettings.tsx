"use client";

import { useState } from "react";
import { State, DayOfWeek, AppData } from "@/types";
import { DEFAULT_STATE_CODES } from "@/utils/storageUtils";
import { Toast, useToast } from "@/components/Toast";

type StateSettingsProps = {
  data: AppData;
  onUpdate: (data: AppData) => void;
};

type EditState = {
  id: string;
  name: string;
  code: string;
  weekendDays: DayOfWeek[];
};

const WEEKEND_OPTIONS: { label: string; value: DayOfWeek }[] = [
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
  { label: "Sunday", value: "sunday" },
];

function weekendLabel(days: DayOfWeek[]): string {
  return days
    .map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3))
    .join(", ");
}

export default function StateSettings({ data, onUpdate }: StateSettingsProps) {
  const [editingState, setEditingState] = useState<EditState | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast, showToast, hideToast } = useToast();

  function startEdit(state: State) {
    setEditingState({ id: state.id, name: state.name, code: state.code ?? "", weekendDays: state.weekendDays });
    setErrors([]);
  }

  function cancelEdit() {
    setEditingState(null);
    setErrors([]);
  }

  function toggleWeekendDay(day: DayOfWeek) {
    if (!editingState) return;
    const current = editingState.weekendDays;
    if (current.includes(day)) {
      if (current.length <= 1) return; // must keep at least 1
      setEditingState({
        ...editingState,
        weekendDays: current.filter((d) => d !== day),
      });
    } else {
      if (current.length >= 2) return; // max 2
      setEditingState({
        ...editingState,
        weekendDays: [...current, day],
      });
    }
  }

  function saveEdit() {
    if (!editingState) return;
    const errs: string[] = [];

    const trimmedName = editingState.name.trim();
    const trimmedCode = editingState.code.trim().toUpperCase();
    if (!trimmedName) errs.push("State name is required.");
    if (!trimmedCode) errs.push("State code is required.");
    if (trimmedCode && !/^[A-Z]{2,4}$/.test(trimmedCode)) errs.push("State code must be 2–4 uppercase letters.");
    if (editingState.weekendDays.length === 0)
      errs.push("At least one weekend day must be selected.");
    if (editingState.weekendDays.length > 2)
      errs.push("Maximum 2 weekend days allowed.");

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    const updatedStates = data.states.map((s) =>
      s.id === editingState.id
        ? { ...s, name: trimmedName, code: trimmedCode, weekendDays: editingState.weekendDays }
        : s
    );

    onUpdate({ ...data, states: updatedStates });
    setEditingState(null);
    setErrors([]);
    showToast("State updated successfully.");
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[#2D3320] mb-4">Manage States</h2>
      <p className="text-sm text-[#5A6640] mb-4">
        All 16 Malaysian states are pre-loaded. You can edit weekend day
        settings per state.
      </p>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F7F9F2] border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-[#2D3320]">
                State
              </th>
              <th className="text-left px-4 py-3 font-semibold text-[#2D3320]">
                Code
              </th>
              <th className="text-left px-4 py-3 font-semibold text-[#2D3320]">
                Weekend Days
              </th>
              <th className="text-center px-4 py-3 font-semibold text-[#2D3320]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.states.map((state) => (
              <tr
                key={state.id}
                className="border-b border-gray-100 hover:bg-gray-50 last:border-0"
              >
                <td className="px-4 py-3 text-[#2D3320] font-medium">
                  {state.name}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[#5A6640]">
                  {state.code ?? "—"}
                </td>
                <td className="px-4 py-3 text-[#5A6640]">
                  {weekendLabel(state.weekendDays)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => startEdit(state)}
                    className="p-1.5 rounded bg-[#F7F9F2] hover:bg-[#D6E8B0] text-[#5C6B2E] border border-[#D6E8B0] transition-colors"
                    title="Edit state"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-[#2D3320] mb-4">
              Edit State
            </h3>

            {errors.length > 0 && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {errors.map((e, i) => (
                  <div key={i}>{e}</div>
                ))}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#2D3320] mb-1">
                State Name
              </label>
              <input
                type="text"
                value={editingState.name}
                onChange={(e) =>
                  setEditingState({ ...editingState, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8C3F] focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#2D3320] mb-1">
                State Code <span className="text-[#5A6640] font-normal">(3-letter postal)</span>
              </label>
              <input
                type="text"
                value={editingState.code}
                onChange={(e) =>
                  setEditingState({ ...editingState, code: e.target.value.toUpperCase() })
                }
                maxLength={4}
                placeholder="e.g. JHR"
                className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#7A8C3F] focus:border-transparent"
              />
              {DEFAULT_STATE_CODES[editingState.id] && (
                <p className="mt-1 text-xs text-[#5A6640]">
                  Default: {DEFAULT_STATE_CODES[editingState.id]}
                </p>
              )}
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-[#2D3320] mb-2">
                Weekend Days{" "}
                <span className="text-[#5A6640] font-normal">(max 2)</span>
              </label>
              <div className="flex gap-4">
                {WEEKEND_OPTIONS.map(({ label, value }) => {
                  const checked = editingState.weekendDays.includes(value);
                  const disabled =
                    !checked && editingState.weekendDays.length >= 2;
                  return (
                    <label
                      key={value}
                      className={`flex items-center gap-2 cursor-pointer select-none ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleWeekendDay(value)}
                        disabled={disabled}
                        className="w-4 h-4 accent-[#7A8C3F]"
                      />
                      <span className="text-sm text-[#2D3320]">{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-[#5A6640] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 text-sm rounded-lg bg-[#7A8C3F] hover:bg-[#5C6B2E] text-white font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
