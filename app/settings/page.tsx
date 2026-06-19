"use client";

import { useState } from "react";
import { useCalendarData } from "@/hooks/useCalendarData";
import StateSettings from "@/components/settings/StateSettings";
import HolidaySettings from "@/components/settings/HolidaySettings";
import SchoolHolidaySettings from "@/components/settings/SchoolHolidaySettings";
import YearSettings from "@/components/settings/YearSettings";
import ColorSettings from "@/components/settings/ColorSettings";
import BackupRestoreSettings from "@/components/settings/BackupRestoreSettings";

type Tab = "states" | "holidays" | "school" | "years" | "colors" | "importexport";

const TABS: { id: Tab; label: string }[] = [
  { id: "holidays", label: "Holidays" },
  { id: "school", label: "School Holidays" },
  { id: "states", label: "States" },
  { id: "years", label: "Year Range" },
  { id: "colors", label: "Colours" },
  { id: "importexport", label: "Backup / Restore" },
];

export default function SettingsPage() {
  const { data, updateData, isLoaded } = useCalendarData();
  const [activeTab, setActiveTab] = useState<Tab>("holidays");

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F7F9F2] flex items-center justify-center">
        <div className="text-[#5A6640] animate-pulse">Loading settings…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F2]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold text-[#2D3320] mb-6">Settings</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-[#7A8C3F] text-white shadow-sm"
                  : "text-[#5A6640] hover:bg-[#F7F9F2] hover:text-[#2D3320]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          {activeTab === "states" && (
            <StateSettings data={data} onUpdate={updateData} />
          )}
          {activeTab === "holidays" && (
            <HolidaySettings data={data} onUpdate={updateData} />
          )}
          {activeTab === "school" && (
            <SchoolHolidaySettings data={data} onUpdate={updateData} />
          )}
          {activeTab === "years" && (
            <YearSettings data={data} onUpdate={updateData} />
          )}
          {activeTab === "colors" && (
            <ColorSettings data={data} onUpdate={updateData} />
          )}
          {activeTab === "importexport" && (
            <BackupRestoreSettings data={data} onUpdate={updateData} />
          )}
        </div>
      </div>
    </div>
  );
}
