"use client";

import { useState, useRef } from "react";
import { SchoolHoliday, AppData } from "@/types";
import { ALL_STATE_IDS } from "@/utils/storageUtils";
import { Toast, useToast } from "@/components/Toast";

type SchoolHolidaySettingsProps = {
  data: AppData;
  onUpdate: (data: AppData) => void;
};

type SortDir = "asc" | "desc";

function generateId(): string {
  return `school-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className="ml-1 inline-flex flex-col" style={{ fontSize: "8px", lineHeight: 1, verticalAlign: "middle" }}>
      <span style={{ opacity: active && dir === "asc" ? 1 : 0.3 }}>▲</span>
      <span style={{ opacity: active && dir === "desc" ? 1 : 0.3 }}>▼</span>
    </span>
  );
}

function durationDays(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
}

function shortDate(iso: string): string {
  // "2026-03-14" → "03-14"
  return iso.slice(5);
}

type FormState = {
  id: string | null;
  name: string;
  stateIds: string[];
  ranges: Record<string, { startDate: string; endDate: string }>;
  newYear: string;
  newStart: string;
  newEnd: string;
};

export default function SchoolHolidaySettings({ data, onUpdate }: SchoolHolidaySettingsProps) {
  const enabledYears = Object.keys(data.years).filter((y) => data.years[y]).sort();
  const currentYear = new Date().getFullYear().toString();
  const defaultYear = enabledYears.includes(currentYear) ? currentYear : (enabledYears[0] ?? currentYear);

  const blankForm = (): FormState => ({
    id: null, name: "", stateIds: ALL_STATE_IDS, ranges: {},
    newYear: defaultYear, newStart: "", newEnd: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(blankForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingRangeYear, setEditingRangeYear] = useState<string | null>(null);
  const { toast, showToast, hideToast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  function scrollToForm() {
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }

  function openAddForm() {
    setForm(blankForm());
    setErrors([]);
    setEditingRangeYear(null);
    setShowForm(true);
    scrollToForm();
  }

  function openEditForm(sh: SchoolHoliday) {
    const firstMissingYear = enabledYears.find((y) => !sh.ranges[y]) ?? defaultYear;
    setForm({
      id: sh.id, name: sh.name, stateIds: [...sh.stateIds],
      ranges: JSON.parse(JSON.stringify(sh.ranges)),
      newYear: firstMissingYear, newStart: "", newEnd: "",
    });
    setErrors([]);
    setEditingRangeYear(null);
    setShowForm(true);
    scrollToForm();
  }

  function cancelForm() { setShowForm(false); setErrors([]); setEditingRangeYear(null); }

  function toggleStateId(id: string) {
    setForm((prev) => ({
      ...prev,
      stateIds: prev.stateIds.includes(id)
        ? prev.stateIds.filter((s) => s !== id)
        : [...prev.stateIds, id],
    }));
  }

  function addRange() {
    const { newYear, newStart, newEnd } = form;
    const errs: string[] = [];
    if (!newStart) errs.push("Start date is required.");
    if (!newEnd) errs.push("End date is required.");
    if (newStart && newEnd && newEnd < newStart) errs.push("End date must be on or after start date.");
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setEditingRangeYear(null);
    setForm((prev) => ({
      ...prev,
      ranges: { ...prev.ranges, [newYear]: { startDate: newStart, endDate: newEnd } },
      newStart: "", newEnd: "",
      newYear: enabledYears.find((y) => y !== newYear && !prev.ranges[y] && y !== newYear) ?? newYear,
    }));
  }

  function editRange(year: string) {
    setEditingRangeYear(year);
    setForm((prev) => {
      const range = prev.ranges[year];
      return { ...prev, newYear: year, newStart: range?.startDate ?? "", newEnd: range?.endDate ?? "" };
    });
  }

  function validate(): string[] {
    const errs: string[] = [];
    if (!form.name.trim()) errs.push("Name is required.");
    if (form.stateIds.length === 0) errs.push("At least one state must be selected.");
    return errs;
  }

  function saveForm() {
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }
    const sh: SchoolHoliday = {
      id: form.id ?? generateId(),
      name: form.name.trim(),
      stateIds: form.stateIds,
      ranges: form.ranges,
    };
    const schoolHolidays = form.id
      ? data.schoolHolidays.map((s) => (s.id === form.id ? sh : s))
      : [...data.schoolHolidays, sh];
    onUpdate({ ...data, schoolHolidays });
    setShowForm(false);
    showToast(form.id ? "School holiday updated." : "School holiday added.");
  }

  function doDelete() {
    if (!deleteConfirm) return;
    onUpdate({ ...data, schoolHolidays: data.schoolHolidays.filter((s) => s.id !== deleteConfirm) });
    setDeleteConfirm(null);
    showToast("School holiday deleted.");
  }

  function getStateDisplay(sh: SchoolHoliday): string {
    if (sh.stateIds.length === ALL_STATE_IDS.length) return "ALL";
    return sh.stateIds
      .map((id) => data.states.find((s) => s.id === id)?.code ?? id.toUpperCase())
      .join(", ");
  }

  const sorted = [...data.schoolHolidays].sort((a, b) => {
    const cmp = a.name.localeCompare(b.name);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const thBase = "px-3 py-3 text-left font-semibold text-[#2D3320] select-none";
  const thSort = `${thBase} cursor-pointer hover:bg-[#EBF3D6] transition-colors`;

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-xl font-bold text-[#2D3320]">Manage School Holidays</h2>
        {!showForm && (
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[#7A8C3F] hover:bg-[#5C6B2E] text-white rounded-lg font-medium transition-colors"
          >
            + Add School Holiday
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div ref={formRef} className="bg-[#F7F9F2] border border-[#D6E8B0] rounded-xl p-5 mb-6 scroll-mt-4">
          <h3 className="font-bold text-[#2D3320] text-lg mb-4">
            {form.id ? "Edit School Holiday" : "Add School Holiday"}
          </h3>

          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errors.map((e, i) => <div key={i}>• {e}</div>)}
            </div>
          )}

          {/* Name */}
          <div className="mb-4 flex items-center gap-4">
            <label className="text-sm font-medium text-[#2D3320] shrink-0 min-w-[130px]">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Mid-Term Break 1"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8C3F]"
            />
          </div>

          {/* States */}
          <div className="mb-4 flex items-start gap-4">
            <label className="text-sm font-medium text-[#2D3320] shrink-0 min-w-[130px] pt-0.5">
              Applies to States
            </label>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-0.5 p-3 bg-white border border-gray-200 rounded-lg">
                {[...data.states]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((state) => (
                    <label key={state.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                      <input
                        type="checkbox"
                        checked={form.stateIds.includes(state.id)}
                        onChange={() => toggleStateId(state.id)}
                        className="w-3.5 h-3.5 accent-[#7A8C3F]"
                      />
                      <span className="text-xs text-[#2D3320]">{state.name}</span>
                    </label>
                  ))}
              </div>
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setForm((p) => ({ ...p, stateIds: ALL_STATE_IDS }))}
                  className="text-xs text-[#7A8C3F] underline hover:no-underline">Select all</button>
                <span className="text-gray-300">|</span>
                <button type="button" onClick={() => setForm((p) => ({ ...p, stateIds: [] }))}
                  className="text-xs text-[#7A8C3F] underline hover:no-underline">Clear all</button>
              </div>
            </div>
          </div>

          {/* Date Ranges */}
          <div className="mb-4 flex items-start gap-4">
            <label className="text-sm font-medium text-[#2D3320] shrink-0 min-w-[130px] pt-0.5">
              Date Ranges
            </label>
            <div className="flex-1">
              {/* Added ranges list */}
              {Object.keys(form.ranges).length > 0 && (
                <div className="mb-3 space-y-1.5">
                  {Object.entries(form.ranges)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([year, range]) => {
                      const days = durationDays(range.startDate, range.endDate);
                      return (
                        <div key={year} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
                          <span className="font-semibold text-[#5C6B2E] w-10 shrink-0">{year}</span>
                          <span className="font-mono text-xs text-[#5A6640]">{range.startDate}</span>
                          <span className="text-[#5A6640]">→</span>
                          <span className="font-mono text-xs text-[#5A6640]">{range.endDate}</span>
                          <span className="text-xs text-[#5A6640] bg-[#EBF3D6] px-1.5 py-0.5 rounded-full ml-1">
                            {days} day{days !== 1 ? "s" : ""}
                          </span>
                          <button
                            type="button"
                            onClick={() => editRange(year)}
                            className="ml-auto p-1 rounded hover:bg-[#D6E8B0] text-[#5C6B2E] transition-colors"
                            title="Edit range"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Add range row */}
              <div className="flex flex-wrap items-end gap-2 p-3 bg-white border border-gray-200 rounded-lg">
                <div>
                  <label className="block text-xs text-[#5A6640] mb-1">Year</label>
                  <select
                    value={form.newYear}
                    onChange={(e) => setForm((p) => ({ ...p, newYear: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8C3F]"
                  >
                    {enabledYears.map((y) => (
                      <option key={y} value={y}>{y}{form.ranges[y] ? " ✓" : ""}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#5A6640] mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.newStart}
                    onChange={(e) => setForm((p) => ({ ...p, newStart: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8C3F]"
                  />
                </div>
                <span className="text-[#5A6640] pb-1.5">→</span>
                <div>
                  <label className="block text-xs text-[#5A6640] mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.newEnd}
                    onChange={(e) => setForm((p) => ({ ...p, newEnd: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8C3F]"
                  />
                </div>
                {form.newStart && form.newEnd && form.newEnd >= form.newStart && (
                  <span className="text-xs text-[#5A6640] bg-[#EBF3D6] px-1.5 py-0.5 rounded-full mb-1.5">
                    {durationDays(form.newStart, form.newEnd)} days
                  </span>
                )}
                <button
                  type="button"
                  onClick={addRange}
                  className="px-3 py-1.5 text-sm bg-[#7A8C3F] hover:bg-[#5C6B2E] text-white rounded-lg font-medium transition-colors"
                >
                  {editingRangeYear ? "Edit Range" : "+ Add Range"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-[#D6E8B0]">
            <button onClick={cancelForm}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-[#5A6640] hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={saveForm}
              className="px-4 py-2 text-sm rounded-lg bg-[#7A8C3F] hover:bg-[#5C6B2E] text-white font-medium transition-colors">
              {form.id ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F7F9F2] border-b border-gray-200">
              <th className={`${thSort} sticky left-0 z-10 bg-[#F7F9F2] border-r border-gray-200`} onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")}>
                Name <SortIcon active dir={sortDir} />
              </th>
              <th className={thBase}>States</th>
              {enabledYears.map((y) => (
                <th key={y} className={`${thBase} text-center min-w-[120px]`}>{y}</th>
              ))}
              <th className={`${thBase} text-center`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((sh) => {
              const stateDisplay = getStateDisplay(sh);
              const isTruncated = stateDisplay.length > 30;
              return (
                <tr key={sh.id} className="group border-b border-gray-100 hover:bg-gray-50 last:border-0">
                  <td className="px-3 py-3 text-[#2D3320] font-medium sticky left-0 z-10 bg-white group-hover:bg-gray-50 border-r border-gray-200">{sh.name}</td>
                  <td className="px-3 py-3 text-[#5A6640] text-xs max-w-[160px]"
                    title={isTruncated ? stateDisplay : undefined}>
                    {isTruncated ? stateDisplay.slice(0, 30) + "…" : stateDisplay}
                  </td>
                  {enabledYears.map((y) => {
                    const range = sh.ranges[y];
                    return (
                      <td key={y} className="px-3 py-3 text-center font-mono text-xs text-[#5A6640] whitespace-nowrap">
                        {range
                          ? <span className="text-[#2D3320]">{shortDate(range.startDate)} → {shortDate(range.endDate)}</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEditForm(sh)}
                        className="p-1.5 rounded bg-[#F7F9F2] hover:bg-[#D6E8B0] text-[#5C6B2E] border border-[#D6E8B0] transition-colors"
                        title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteConfirm(sh.id)}
                        className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                        title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" /><path d="M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {data.schoolHolidays.length === 0 && (
              <tr>
                <td colSpan={3 + enabledYears.length} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No school holidays added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-[#2D3320] mb-2">Delete School Holiday?</h3>
            <p className="text-sm text-[#5A6640] mb-5">
              Are you sure you want to delete "
              {data.schoolHolidays.find((s) => s.id === deleteConfirm)?.name}"? This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-[#5A6640] hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={doDelete}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
