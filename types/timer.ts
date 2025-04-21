export type TimerMode = "work" | "break";
export type TimerPreset = "25/5" | "50/10" | "90/20" | "custom";

export interface TimerSettings {
  workTime: number;
  breakTime: number;
  preset: TimerPreset;
}
