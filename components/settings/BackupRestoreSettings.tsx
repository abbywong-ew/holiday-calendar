"use client";

import { useRef, useState } from "react";
import { AppData } from "@/types";
import { ALL_STATE_IDS, DEFAULT_COLORS } from "@/utils/storageUtils";
import { Toast, useToast } from "@/components/Toast";

type Props = {
  data: AppData;
  onUpdate: (data: AppData) => void;
};

type ImportPreview = {
  states: number;
  holidays: number;
  schoolHolidays: number;
  activeYears: number;
  replacementOverrides: number;
  hasColors: boolean;
  parsed: AppData;
};

/* ── CSV helpers ── */
function csvEscape(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

// Prepend UTF-8 BOM so Excel opens CSV files with correct encoding
const CSV_BOM = "﻿";

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function durationDays(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
}

/* ── Icons ── */
function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function BackupRestoreSettings({ data, onUpdate }: Props) {
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [rawJson, setRawJson] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast, showToast, hideToast } = useToast();

  const enabledYears = Object.keys(data.years).filter((y) => data.years[y]).sort();
  const activeYears = enabledYears.length;
  const today = new Date().toISOString().slice(0, 10);

  /* ── Export JSON ── */
  function exportJSON() {
    downloadFile(`jiyuu-hato-${today}.json`, JSON.stringify(data, null, 2), "application/json");
    showToast("Backup saved as JSON.");
  }

  /* ── Export Holidays CSV ── */
  function exportHolidaysCSV() {
    const headers = ["Holiday Name", "Type", "States", ...enabledYears];
    const rows = data.holidays.map((h) => {
      const stateDisplay =
        h.stateIds.length === ALL_STATE_IDS.length
          ? "ALL"
          : h.stateIds.map((id) => data.states.find((s) => s.id === id)?.code ?? id.toUpperCase()).join(", ");
      const dateCols = enabledYears.map((y) => {
        if (h.dateType === "fixed") {
          return `${y}-${String(h.fixedMonth!).padStart(2, "0")}-${String(h.fixedDay!).padStart(2, "0")}`;
        }
        return h.variableDates?.[y] ?? "";
      });
      return [h.name, h.type === "national" ? "National" : "State", stateDisplay, ...dateCols];
    });
    const csv = CSV_BOM + [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    downloadFile(`jiyuu-hato-holidays-${today}.csv`, csv, "text/csv;charset=utf-8;");
    showToast("Holidays backed up as CSV.");
  }

  /* ── Export School Holidays CSV ── */
  function exportSchoolHolidaysCSV() {
    const yearCols = enabledYears.flatMap((y) => [`${y} Start`, `${y} End`, `${y} Days`]);
    const headers = ["Name", "States", ...yearCols];
    const rows = data.schoolHolidays.map((sh) => {
      const stateDisplay =
        sh.stateIds.length === ALL_STATE_IDS.length
          ? "ALL"
          : sh.stateIds.map((id) => data.states.find((s) => s.id === id)?.code ?? id.toUpperCase()).join(", ");
      const dateCols = enabledYears.flatMap((y) => {
        const r = sh.ranges[y];
        if (!r) return ["", "", ""];
        return [r.startDate, r.endDate, String(durationDays(r.startDate, r.endDate))];
      });
      return [sh.name, stateDisplay, ...dateCols];
    });
    const csv = CSV_BOM + [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    downloadFile(`jiyuu-hato-school-holidays-${today}.csv`, csv, "text/csv;charset=utf-8;");
    showToast("School holidays backed up as CSV.");
  }

  /* ── Import ── */
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportPreview(null);
    setConfirmReplace(false);
    setRawJson(null);
    setShowRawJson(false);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setRawJson(text);
      try {
        const raw = JSON.parse(text) as Partial<AppData>;
        if (!Array.isArray(raw.states)) throw new Error("Missing or invalid 'states' field.");
        if (!Array.isArray(raw.holidays)) throw new Error("Missing or invalid 'holidays' field.");
        if (!raw.years || typeof raw.years !== "object") throw new Error("Missing or invalid 'years' field.");

        const migrated: AppData = {
          states: raw.states,
          holidays: raw.holidays,
          years: raw.years,
          colors: { ...DEFAULT_COLORS, ...(raw.colors ?? {}) },
          schoolHolidays: raw.schoolHolidays ?? [],
          replacementOverrides: raw.replacementOverrides ?? [],
        };

        setImportPreview({
          states: migrated.states.length,
          holidays: migrated.holidays.length,
          schoolHolidays: migrated.schoolHolidays.length,
          activeYears: Object.keys(migrated.years).filter((y) => migrated.years[y]).length,
          replacementOverrides: migrated.replacementOverrides.length,
          hasColors: !!raw.colors,
          parsed: migrated,
        });
      } catch (err) {
        setImportError(err instanceof Error ? err.message : "Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  }

  function doImport() {
    if (!importPreview) return;
    onUpdate(importPreview.parsed);
    setImportPreview(null);
    setConfirmReplace(false);
    setRawJson(null);
    setShowRawJson(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showToast("Data restored successfully.");
  }

  function clearImport() {
    setImportPreview(null);
    setImportError(null);
    setConfirmReplace(false);
    setRawJson(null);
    setShowRawJson(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[#2D3320] mb-4">Backup / Restore</h2>

      {/* ── Backup ── */}
      <section className="mb-8">
        <h3 className="font-semibold text-[#2D3320] mb-1">Backup</h3>
        <p className="text-sm text-[#5A6640] mb-3">
          Download your calendar data to keep a safe copy.
        </p>

        <div className="p-4 bg-[#F7F9F2] border border-[#D6E8B0] rounded-xl space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1.5 gap-x-4 text-xs text-[#5A6640]">
            <span><span className="font-semibold text-[#2D3320]">{data.states.length}</span> states</span>
            <span><span className="font-semibold text-[#2D3320]">{data.holidays.length}</span> holidays</span>
            <span><span className="font-semibold text-[#2D3320]">{data.schoolHolidays.length}</span> school holidays</span>
            <span><span className="font-semibold text-[#2D3320]">{activeYears}</span> active years</span>
            <span><span className="font-semibold text-[#2D3320]">{data.replacementOverrides.length}</span> replacement overrides</span>
          </div>

          {/* Export buttons */}
          <div className="flex flex-wrap gap-2">
            {/* JSON — full backup */}
            <button
              onClick={exportJSON}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-[#7A8C3F] hover:bg-[#5C6B2E] text-white rounded-lg font-medium transition-colors"
            >
              <DownloadIcon />
              Backup All Data (.json)
            </button>

            {/* Holidays CSV */}
            <button
              onClick={exportHolidaysCSV}
              disabled={data.holidays.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-white hover:bg-[#EBF3D6] text-[#5C6B2E] border border-[#D6E8B0] rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <DownloadIcon />
              Backup Holidays (.csv)
            </button>

            {/* School Holidays CSV */}
            <button
              onClick={exportSchoolHolidaysCSV}
              disabled={data.schoolHolidays.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-white hover:bg-[#EBF3D6] text-[#5C6B2E] border border-[#D6E8B0] rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <DownloadIcon />
              Backup School Holidays (.csv)
            </button>
          </div>

          {/* CSV format notes */}
          <div className="text-xs text-[#5A6640] space-y-0.5">
            <p><span className="font-medium">.json</span> — full backup, use for Restore</p>
            <p><span className="font-medium">Holidays .csv</span> — columns: Name, Type, States, one date column per active year</p>
            <p><span className="font-medium">School Holidays .csv</span> — columns: Name, Year, Start Date, End Date, Duration, States</p>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200 mb-8" />

      {/* ── Restore ── */}
      <section>
        <h3 className="font-semibold text-[#2D3320] mb-1">Restore</h3>
        <p className="text-sm text-[#5A6640] mb-3">
          Restore from a previously backed up <span className="font-medium">.json</span> file.{" "}
          <span className="font-semibold text-red-600">This will replace all current data.</span>
        </p>

        <div className="p-4 bg-[#F7F9F2] border border-[#D6E8B0] rounded-xl">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="block w-full text-sm text-[#5A6640]
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-[#7A8C3F] file:text-white
              hover:file:bg-[#5C6B2E]
              file:cursor-pointer file:transition-colors"
          />

          {/* Parse error */}
          {importError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {importError}
            </div>
          )}

          {/* Raw JSON viewer — shown when any file is picked (even invalid) */}
          {rawJson && (
            <div className="mt-3">
              <button
                onClick={() => setShowRawJson((v) => !v)}
                className="text-xs text-[#7A8C3F] underline hover:no-underline"
              >
                {showRawJson ? "Hide" : "View"} raw JSON
              </button>
              {showRawJson && (
                <pre className="mt-2 max-h-64 overflow-auto text-[10px] leading-relaxed bg-gray-900 text-green-300 p-3 rounded-lg font-mono whitespace-pre-wrap break-all">
                  {rawJson}
                </pre>
              )}
            </div>
          )}

          {/* Import preview */}
          {importPreview && (
            <div className="mt-4">
              <div className="p-3 bg-white border border-gray-200 rounded-lg mb-3">
                <p className="text-xs font-semibold text-[#2D3320] mb-2">File contents:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1.5 gap-x-4 text-xs text-[#5A6640]">
                  <span><span className="font-semibold text-[#2D3320]">{importPreview.states}</span> states</span>
                  <span><span className="font-semibold text-[#2D3320]">{importPreview.holidays}</span> holidays</span>
                  <span><span className="font-semibold text-[#2D3320]">{importPreview.schoolHolidays}</span> school holidays</span>
                  <span><span className="font-semibold text-[#2D3320]">{importPreview.activeYears}</span> active years</span>
                  <span><span className="font-semibold text-[#2D3320]">{importPreview.replacementOverrides}</span> replacement overrides</span>
                  <span><span className="font-semibold text-[#2D3320]">{importPreview.hasColors ? "Custom" : "Default"}</span> colours</span>
                </div>
              </div>

              <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmReplace}
                  onChange={(e) => setConfirmReplace(e.target.checked)}
                  className="w-4 h-4 accent-[#7A8C3F]"
                />
                <span className="text-sm text-[#5A6640]">
                  I understand this will replace all current data
                </span>
              </label>

              <div className="flex gap-2">
                <button
                  onClick={clearImport}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-[#5A6640] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={doImport}
                  disabled={!confirmReplace}
                  className="px-4 py-2 text-sm rounded-lg bg-[#7A8C3F] hover:bg-[#5C6B2E] text-white font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Restore &amp; Replace
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
