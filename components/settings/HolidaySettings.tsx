"use client";

import { useState, useRef } from "react";
import { Holiday, HolidayType, DateType, AppData } from "@/types";
import { ALL_STATE_IDS } from "@/utils/storageUtils";
import { MONTH_NAMES_LONG, getDaysInMonthForDropdown } from "@/utils/dateUtils";
import { Toast, useToast } from "@/components/Toast";

type HolidaySettingsProps = {
  data: AppData;
  onUpdate: (data: AppData) => void;
};

type FormState = {
  id: string | null;
  name: string;
  type: HolidayType;
  dateType: DateType;
  fixedMonth: number;
  fixedDay: number;
  variableDates: Record<string, string>;
  stateIds: string[];
  newVariableDate: string;
};

type SortField = "name" | "type" | "date";
type SortDir = "asc" | "desc";

const BLANK_FORM: FormState = {
  id: null,
  name: "",
  type: "national",
  dateType: "fixed",
  fixedMonth: 1,
  fixedDay: 1,
  variableDates: {},
  stateIds: ALL_STATE_IDS,
  newVariableDate: "",
};

function generateId(): string {
  return `holiday-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function SortIcon({ field, active, dir }: { field: string; active: boolean; dir: SortDir }) {
  return (
    <span className="ml-1 inline-flex flex-col" style={{ fontSize: "8px", lineHeight: 1 }}>
      <span style={{ opacity: active && dir === "asc" ? 1 : 0.3 }}>▲</span>
      <span style={{ opacity: active && dir === "desc" ? 1 : 0.3 }}>▼</span>
    </span>
  );
}

export default function HolidaySettings({ data, onUpdate }: HolidaySettingsProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [filterYear, setFilterYear] = useState<string>(
    Object.keys(data.years).filter((y) => data.years[y]).sort().at(-1) ?? "2026"
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [colFilterName, setColFilterName] = useState("");
  const [colFilterType, setColFilterType] = useState<"" | "national" | "state">("");
  const [colFilterDate, setColFilterDate] = useState("");
  const [colFilterDay, setColFilterDay] = useState("");
  const { toast, showToast, hideToast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  const enabledYears = Object.keys(data.years).filter((y) => data.years[y]).sort();
  const maxDays = getDaysInMonthForDropdown(form.fixedMonth);

  /* ── helpers ── */
  function scrollToForm() {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  }

  function openAddForm() {
    setForm({ ...BLANK_FORM });
    setErrors([]);
    setShowForm(true);
    scrollToForm();
  }

  function openEditForm(holiday: Holiday) {
    setForm({
      id: holiday.id,
      name: holiday.name,
      type: holiday.type,
      dateType: holiday.dateType,
      fixedMonth: holiday.fixedMonth ?? 1,
      fixedDay: holiday.fixedDay ?? 1,
      variableDates: { ...(holiday.variableDates ?? {}) },
      stateIds: [...holiday.stateIds],
      newVariableDate: "",
    });
    setErrors([]);
    setShowForm(true);
    scrollToForm();
  }

  function cancelForm() {
    setShowForm(false);
    setErrors([]);
  }

  function setFormField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTypeChange(type: HolidayType) {
    setForm((prev) => ({
      ...prev,
      type,
      stateIds: type === "national" ? ALL_STATE_IDS : [],
    }));
  }

  function toggleStateId(id: string) {
    setForm((prev) => ({
      ...prev,
      stateIds: prev.stateIds.includes(id)
        ? prev.stateIds.filter((s) => s !== id)
        : [...prev.stateIds, id],
    }));
  }

  function addVariableDate() {
    const dateVal = form.newVariableDate;
    if (!dateVal) return;
    const year = dateVal.split("-")[0];
    if (!year) return;
    setForm((prev) => ({
      ...prev,
      variableDates: { ...prev.variableDates, [year]: dateVal },
      newVariableDate: "",
    }));
  }

  function removeVariableDate(year: string) {
    setForm((prev) => {
      const updated = { ...prev.variableDates };
      delete updated[year];
      return { ...prev, variableDates: updated };
    });
  }

  function validateForm(): string[] {
    const errs: string[] = [];
    if (!form.name.trim()) errs.push("Holiday name is required.");
    if (form.stateIds.length === 0) errs.push("At least one state must be selected.");
    if (form.dateType === "variable" && Object.keys(form.variableDates).length === 0)
      errs.push("At least one variable date is required.");
    return errs;
  }

  function saveForm() {
    const errs = validateForm();
    if (errs.length > 0) { setErrors(errs); return; }

    const holiday: Holiday = {
      id: form.id ?? generateId(),
      name: form.name.trim(),
      type: form.type,
      dateType: form.dateType,
      stateIds: form.stateIds,
      ...(form.dateType === "fixed"
        ? { fixedMonth: form.fixedMonth, fixedDay: form.fixedDay }
        : { variableDates: form.variableDates }),
    };

    const holidays = form.id
      ? data.holidays.map((h) => (h.id === form.id ? holiday : h))
      : [...data.holidays, holiday];

    onUpdate({ ...data, holidays });
    setShowForm(false);
    showToast(form.id ? "Holiday updated." : "Holiday added.");
  }

  function confirmDelete(id: string) { setDeleteConfirm(id); }

  function doDelete() {
    if (!deleteConfirm) return;
    onUpdate({ ...data, holidays: data.holidays.filter((h) => h.id !== deleteConfirm) });
    setDeleteConfirm(null);
    showToast("Holiday deleted.");
  }

  function getDayShort(dateStr: string): string {
    if (!dateStr || dateStr === "—") return "—";
    const parts = dateStr.split("-").map(Number);
    if (parts.length < 3 || isNaN(parts[0])) return "—";
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleString("en-US", { weekday: "short" });
  }

  /* Date display for the table — fixed shows yyyy-mm-dd for filter year */
  function getDateDisplay(holiday: Holiday): string {
    if (holiday.dateType === "fixed") {
      const m = String(holiday.fixedMonth!).padStart(2, "0");
      const d = String(holiday.fixedDay!).padStart(2, "0");
      return `${filterYear}-${m}-${d}`;
    }
    return holiday.variableDates?.[filterYear] ?? "—";
  }

  function getStateDisplay(holiday: Holiday): string {
    if (holiday.stateIds.length === ALL_STATE_IDS.length) return "All states";
    return holiday.stateIds
      .map((id) => data.states.find((s) => s.id === id)?.name ?? id)
      .join(", ");
  }

  /* Sorting */
  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  }

  const sortedHolidays = [...data.holidays]
    .filter((h) => {
      if (colFilterName && !h.name.toLowerCase().includes(colFilterName.toLowerCase())) return false;
      if (colFilterType && h.type !== colFilterType) return false;
      if (colFilterDate && !getDateDisplay(h).includes(colFilterDate)) return false;
      if (colFilterDay) {
        const day = getDayShort(getDateDisplay(h));
        if (!day.toLowerCase().startsWith(colFilterDay.toLowerCase())) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let av = "", bv = "";
      if (sortField === "name") { av = a.name; bv = b.name; }
      else if (sortField === "type") { av = a.type; bv = b.type; }
      else { av = getDateDisplay(a); bv = getDateDisplay(b); }
      const cmp = av.localeCompare(bv);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const thClass =
    "px-4 py-3 text-left font-semibold text-[#2D3320] cursor-pointer select-none hover:bg-[#EBF3D6] transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#2D3320]">Manage Holidays</h2>
        {!showForm && (
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[#7A8C3F] hover:bg-[#5C6B2E] text-white rounded-lg font-medium transition-colors"
          >
            + Add Holiday
          </button>
        )}
      </div>

      {/* ── Add / Edit Form ── */}
      {showForm && (
        <div ref={formRef} className="bg-[#F7F9F2] border border-[#D6E8B0] rounded-xl p-5 mb-6 scroll-mt-4">
          <h3 className="font-bold text-[#2D3320] text-lg mb-4">
            {form.id ? "Edit Holiday" : "Add New Holiday"}
          </h3>

          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errors.map((e, i) => <div key={i}>• {e}</div>)}
            </div>
          )}

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#2D3320] mb-1">
              Holiday Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setFormField("name", e.target.value)}
              placeholder="e.g. Thaipusam"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8C3F]"
            />
          </div>

          {/* Holiday Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#2D3320] mb-2">Holiday Type</label>
            <div className="flex gap-6">
              {(["national", "state"] as HolidayType[]).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="holidayType"
                    checked={form.type === t}
                    onChange={() => handleTypeChange(t)}
                    className="accent-[#7A8C3F]"
                  />
                  <span className={`text-sm capitalize ${form.type === t ? "text-[#2D3320] font-medium" : "text-gray-400"}`}>
                    {t}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* States */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#2D3320] mb-2">
              Applies to States{" "}
              <span className="text-[#5A6640] font-normal text-xs">
                ({form.type === "national" ? "all pre-checked" : "none pre-checked"})
              </span>
            </label>
            <div className="grid grid-cols-2 gap-0.5 p-3 bg-white border border-gray-200 rounded-lg max-h-56 overflow-y-auto">
              {[...data.states]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((state) => (
                  <label
                    key={state.id}
                    className="flex items-center gap-2 py-0.5 cursor-pointer hover:bg-gray-50 rounded px-1"
                  >
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
              <button type="button" onClick={() => setFormField("stateIds", ALL_STATE_IDS)}
                className="text-xs text-[#7A8C3F] underline hover:no-underline">Select all</button>
              <span className="text-gray-300">|</span>
              <button type="button" onClick={() => setFormField("stateIds", [])}
                className="text-xs text-[#7A8C3F] underline hover:no-underline">Clear all</button>
            </div>
          </div>

          {/* ── Date Type — side-by-side layout ── */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#2D3320] mb-3">Date Type</label>

            <div className="flex flex-col md:flex-row md:items-stretch">
              {/* Fixed Date column */}
              <div className="flex-1 md:pr-6">
                {/* Radio — always interactive */}
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="radio"
                    name="dateType"
                    checked={form.dateType === "fixed"}
                    onChange={() => setFormField("dateType", "fixed")}
                    className="accent-[#7A8C3F]"
                  />
                  <span className={`text-sm transition-colors ${form.dateType === "fixed" ? "text-[#2D3320] font-semibold" : "text-gray-400"}`}>
                    Fixed Date (same every year)
                  </span>
                </label>
                {/* Controls — dimmed when not selected */}
                <div className={`transition-opacity ${form.dateType !== "fixed" ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
                  <p className="text-xs font-medium text-[#5A6640] mb-2">Month &amp; Day</p>
                  <div className="flex gap-3 items-end">
                    <div>
                      <label className="block text-xs text-[#5A6640] mb-1">Month</label>
                      <select
                        value={form.fixedMonth}
                        onChange={(e) => {
                          const m = Number(e.target.value);
                          const maxD = getDaysInMonthForDropdown(m);
                          setForm((prev) => ({
                            ...prev,
                            fixedMonth: m,
                            fixedDay: Math.min(prev.fixedDay, maxD),
                          }));
                        }}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8C3F]"
                      >
                        {MONTH_NAMES_LONG.map((name, i) => (
                          <option key={i + 1} value={i + 1}>{name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#5A6640] mb-1">Day</label>
                      <select
                        value={form.fixedDay}
                        onChange={(e) => setFormField("fixedDay", Number(e.target.value))}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8C3F]"
                      >
                        {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider — horizontal on mobile, vertical on desktop */}
              <div className="border-t md:border-t-0 md:border-l border-gray-200 my-4 md:my-0" />

              {/* Variable Date column */}
              <div className="flex-1 md:pl-6">
                {/* Radio — always interactive */}
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="radio"
                    name="dateType"
                    checked={form.dateType === "variable"}
                    onChange={() => setFormField("dateType", "variable")}
                    className="accent-[#7A8C3F]"
                  />
                  <span className={`text-sm transition-colors ${form.dateType === "variable" ? "text-[#2D3320] font-semibold" : "text-gray-400"}`}>
                    Variable Date (different each year)
                  </span>
                </label>
                {/* Controls — dimmed when not selected */}
                <div className={`transition-opacity ${form.dateType !== "variable" ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
                  <p className="text-xs font-medium text-[#5A6640] mb-2">Date per Year</p>
                  <div className="flex gap-2 items-end mb-3">
                    <div>
                      <label className="block text-xs text-[#5A6640] mb-1">Date (yyyy-mm-dd)</label>
                      <input
                        type="date"
                        value={form.newVariableDate}
                        onChange={(e) => setFormField("newVariableDate", e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8C3F]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addVariableDate}
                      className="px-3 py-1.5 text-sm bg-[#7A8C3F] hover:bg-[#5C6B2E] text-white rounded-lg transition-colors"
                    >
                      Add Date
                    </button>
                  </div>

                  {Object.keys(form.variableDates).length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left px-3 py-2 text-xs font-semibold text-[#5A6640]">Year</th>
                            <th className="text-left px-3 py-2 text-xs font-semibold text-[#5A6640]">Date</th>
                            <th className="text-center px-3 py-2 text-xs font-semibold text-[#5A6640]">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(form.variableDates).sort().map((year) => (
                            <tr key={year} className="border-b border-gray-100 last:border-0">
                              <td className="px-3 py-2 font-mono text-xs">{year}</td>
                              <td className="px-3 py-2 text-xs">{form.variableDates[year]}</td>
                              <td className="px-3 py-2 text-center">
                                <button type="button" onClick={() => removeVariableDate(year)}
                                  className="text-xs text-red-500 hover:text-red-700 underline">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
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
              {form.id ? "Update Holiday" : "Save Holiday"}
            </button>
          </div>
        </div>
      )}

      {/* ── Filter + Sortable Holiday Table ── */}
      <div className="flex items-center gap-3 mb-3">
        <label className="text-sm font-medium text-[#2D3320]">Filter by Year:</label>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8C3F]"
        >
          {enabledYears.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            {/* Sort headers */}
            <tr className="bg-[#F7F9F2] border-b border-gray-200">
              <th className={thClass} onClick={() => toggleSort("name")}>
                Holiday <SortIcon field="name" active={sortField === "name"} dir={sortDir} />
              </th>
              <th className={thClass} onClick={() => toggleSort("type")}>
                Type <SortIcon field="type" active={sortField === "type"} dir={sortDir} />
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[#2D3320]">States</th>
              <th className={thClass} onClick={() => toggleSort("date")}>
                Date <SortIcon field="date" active={sortField === "date"} dir={sortDir} />
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[#2D3320]">Day</th>
              <th className="text-center px-4 py-3 font-semibold text-[#2D3320]">Actions</th>
            </tr>
            {/* Column filters */}
            <tr className="bg-white border-b border-gray-200">
              <th className="px-2 py-1.5">
                <input
                  type="text"
                  placeholder="Search…"
                  value={colFilterName}
                  onChange={(e) => setColFilterName(e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs font-normal text-[#2D3320] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7A8C3F]"
                />
              </th>
              <th className="px-2 py-1.5">
                <select
                  value={colFilterType}
                  onChange={(e) => setColFilterType(e.target.value as "" | "national" | "state")}
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs font-normal text-[#2D3320] focus:outline-none focus:ring-1 focus:ring-[#7A8C3F]"
                >
                  <option value="">All</option>
                  <option value="national">National</option>
                  <option value="state">State</option>
                </select>
              </th>
              <th className="px-2 py-1.5">
                {/* no filter for States column */}
              </th>
              <th className="px-2 py-1.5">
                <input
                  type="text"
                  placeholder="yyyy-mm-dd…"
                  value={colFilterDate}
                  onChange={(e) => setColFilterDate(e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs font-normal text-[#2D3320] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7A8C3F]"
                />
              </th>
              <th className="px-2 py-1.5">
                <select
                  value={colFilterDay}
                  onChange={(e) => setColFilterDay(e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs font-normal text-[#2D3320] focus:outline-none focus:ring-1 focus:ring-[#7A8C3F]"
                >
                  <option value="">All</option>
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </th>
              <th className="px-2 py-1.5" />
            </tr>
          </thead>
          <tbody>
            {sortedHolidays.map((holiday) => {
              const stateDisplay = getStateDisplay(holiday);
              const isTruncated = stateDisplay.length > 40;
              const dateStr = getDateDisplay(holiday);
              return (
                <tr key={holiday.id} className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
                  <td className="px-4 py-3 text-[#2D3320] font-medium">{holiday.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                      holiday.type === "national"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {holiday.type === "national" ? "National" : "State"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#5A6640] max-w-[200px]"
                    title={isTruncated ? stateDisplay : undefined}>
                    <span className="line-clamp-1">
                      {isTruncated ? stateDisplay.slice(0, 40) + "…" : stateDisplay}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#5A6640] font-mono text-xs whitespace-nowrap">
                    {dateStr}
                  </td>
                  <td className="px-4 py-3 text-[#5A6640] text-xs whitespace-nowrap">
                    {getDayShort(dateStr)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEditForm(holiday)}
                        className="p-1.5 rounded bg-[#F7F9F2] hover:bg-[#D6E8B0] text-[#5C6B2E] border border-[#D6E8B0] transition-colors"
                        title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button onClick={() => confirmDelete(holiday.id)}
                        className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                        title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sortedHolidays.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                  {data.holidays.length === 0 ? "No holidays added yet." : "No holidays match the current filters."}
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
            <h3 className="text-lg font-bold text-[#2D3320] mb-2">Delete Holiday?</h3>
            <p className="text-sm text-[#5A6640] mb-5">
              Are you sure you want to delete "
              {data.holidays.find((h) => h.id === deleteConfirm)?.name}"? This cannot be undone.
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
