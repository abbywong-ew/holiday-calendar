export type DayOfWeek = "friday" | "saturday" | "sunday";

export type State = {
  id: string;
  name: string;
  code: string;
  weekendDays: DayOfWeek[];
};

export type HolidayType = "national" | "state";
export type DateType = "fixed" | "variable";

export type Holiday = {
  id: string;
  name: string;
  type: HolidayType;
  dateType: DateType;
  fixedMonth?: number;
  fixedDay?: number;
  variableDates?: {
    [year: string]: string;
  };
  stateIds: string[];
  isReplacement?: boolean;
};

export type YearConfig = {
  [year: string]: boolean;
};

export type ColorConfig = {
  national: string;
  state: string;
  weekend: string;
  school: string;
};

export type SchoolHoliday = {
  id: string;
  name: string;
  stateIds: string[];
  ranges: Record<string, { startDate: string; endDate: string }>;
};

export type ReplacementOverride = {
  holidayId: string;
  stateId: string;
  year: string;
  originalDate: string;
  replacementDate: string;
};

export type AppData = {
  states: State[];
  holidays: Holiday[];
  years: YearConfig;
  colors: ColorConfig;
  schoolHolidays: SchoolHoliday[];
  replacementOverrides: ReplacementOverride[];
};
