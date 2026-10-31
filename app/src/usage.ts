import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import UsageStats, { DayUsage } from '../modules/usage-stats';

/** sample: the native module is missing from this build, so the numbers are made up. */
export type UsageStatus = 'sample' | 'needs-permission' | 'ready';

const MIN = 60000;

function sampleDays(): DayUsage[] {
  const week = [205, 190, 154, 212, 128, 176, 161];
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  return week.map((m, i) => {
    const d = new Date(midnight);
    d.setDate(d.getDate() - (6 - i));
    const last = i === 6;
    return {
      dayStart: d.getTime(),
      totalMs: m * MIN,
      pickups: last ? 47 : 40 + i,
      apps: last
        ? [['Instagram', 58], ['YouTube', 44], ['WhatsApp', 31], ['Personal Hub', 22], ['Chrome', 6]].map(([label, m2]) => ({
            pkg: String(label), label: String(label), ms: Number(m2) * MIN,
          }))
        : [],
    };
  });
}

export function useUsage() {
  const [state, setState] = useState<{ status: UsageStatus; days: DayUsage[] }>(() =>
    UsageStats ? { status: 'needs-permission', days: [] } : { status: 'sample', days: sampleDays() },
  );

  const refresh = useCallback(async () => {
    if (!UsageStats) {
      setState({ status: 'sample', days: sampleDays() });
      return;
    }
    if (!UsageStats.hasPermission()) {
      setState({ status: 'needs-permission', days: [] });
      return;
    }
    try {
      setState({ status: 'ready', days: await UsageStats.getDailyUsage(7) });
    } catch {
      setState({ status: 'sample', days: sampleDays() });
    }
  }, []);

  useEffect(() => {
    refresh();
    // The user comes back from the system settings screen after granting access.
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return { ...state, refresh };
}

export const openUsageSettings = () => UsageStats?.openSettings();
export const hasUsageModule = !!UsageStats;
