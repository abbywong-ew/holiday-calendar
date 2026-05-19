"use client";

import { useState, useEffect, useCallback } from "react";
import { AppData } from "@/types";
import { loadData, saveData, INITIAL_DATA } from "@/utils/storageUtils";

export function useCalendarData() {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
    setIsLoaded(true);
  }, []);

  const updateData = useCallback((newData: AppData) => {
    setData(newData);
    saveData(newData);
  }, []);

  return { data, updateData, isLoaded };
}
