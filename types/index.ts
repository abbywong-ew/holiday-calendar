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
};

export type YearConfig = {
  [year: string]: boolean;
};

export type ColorConfig = {
  national: string;
  state: string;
  weekend: string;
};

export type AppData = {
  states: State[];
  holidays: Holiday[];
  years: YearConfig;
  colors: ColorConfig;
};
