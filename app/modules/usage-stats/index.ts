import { requireOptionalNativeModule } from 'expo-modules-core';

export interface AppUsage {
  pkg: string;
  label: string;
  ms: number;
}

export interface DayUsage {
  /** Local midnight of the day, in epoch milliseconds. */
  dayStart: number;
  totalMs: number;
  /** Times the phone was unlocked that day. */
  pickups: number;
  /** Most used apps, longest first. */
  apps: AppUsage[];
}

interface UsageStatsNative {
  hasPermission(): boolean;
  openSettings(): void;
  getDailyUsage(days: number): Promise<DayUsage[]>;
}

/** null when the native module is not part of the running build (Expo Go, web). */
const UsageStats = requireOptionalNativeModule<UsageStatsNative>('UsageStats');

export default UsageStats;
