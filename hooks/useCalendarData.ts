"use client";

import { useState, useEffect, useCallback } from "react";
import { AppData, ColorConfig } from "@/types";
import { loadData, saveData, INITIAL_DATA, DEFAULT_COLORS } from "@/utils/storageUtils";

function hexToRgba(hex: string, alpha: number): string {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(0,0,0,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

function applyColors(colors: ColorConfig): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--hol-national", colors.national);
  root.style.setProperty("--hol-state", colors.state);
  root.style.setProperty("--hol-weekend", colors.weekend);
  root.style.setProperty("--hol-national-light", hexToRgba(colors.national, 0.15));
  root.style.setProperty("--hol-state-light", hexToRgba(colors.state, 0.15));
}

export function useCalendarData() {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
    setIsLoaded(true);
  }, []);

  // Apply CSS custom properties whenever colors change
  const { national, state, weekend } = data.colors ?? DEFAULT_COLORS;
  useEffect(() => {
    applyColors({ national, state, weekend });
  }, [national, state, weekend]);

  const updateData = useCallback((newData: AppData) => {
    setData(newData);
    saveData(newData);
  }, []);

  return { data, updateData, isLoaded };
}
