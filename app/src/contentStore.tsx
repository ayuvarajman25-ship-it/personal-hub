import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Topic } from './types';
import { Content, SOURCE_COUNT, WorkInfo, fetchContent, fetchWork, sigOf } from './content';

const KEY = 'personalhub.content.v1';

interface Data {
  contents: Record<string, Content>;
  works: Record<string, WorkInfo>;
}

interface ContentStore extends Data {
  ready: boolean;
  loading: Record<string, boolean>;
  /** True when the last fetch for the topic reached nothing, so the saved copy (if any) was kept. */
  offline: Record<string, boolean>;
  load(topic: Topic, force?: boolean): Promise<void>;
  loadWork(olKey: string): Promise<void>;
  clear(): void;
}

const Ctx = createContext<ContentStore | null>(null);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data>({ contents: {}, works: {} });
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [offline, setOffline] = useState<Record<string, boolean>>({});
  const dataRef = useRef(data);
  dataRef.current = data;
  const busy = useRef(new Set<string>());
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const s = JSON.parse(raw);
        setData({ contents: s.contents ?? {}, works: s.works ?? {} });
      })
      .catch(() => {})
      .finally(() => {
        hydrated.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (hydrated.current) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data]);

  const load = useCallback(async (topic: Topic, force = false) => {
    const cur = dataRef.current.contents[topic.id];
    const stale = !cur || cur.sig !== sigOf(topic) || cur.failed.length >= SOURCE_COUNT;
    if ((!force && !stale) || busy.current.has(topic.id)) return;
    busy.current.add(topic.id);
    setLoading((l) => ({ ...l, [topic.id]: true }));
    try {
      const c = await fetchContent(topic);
      const allFailed = c.failed.length >= SOURCE_COUNT;
      setOffline((o) => ({ ...o, [topic.id]: allFailed }));
      // Never replace a good saved copy with a total failure.
      setData((d) => (allFailed && d.contents[topic.id] && d.contents[topic.id].failed.length < SOURCE_COUNT
        ? d
        : { ...d, contents: { ...d.contents, [topic.id]: c } }));
    } finally {
      busy.current.delete(topic.id);
      setLoading((l) => ({ ...l, [topic.id]: false }));
    }
  }, []);

  const loadWork = useCallback(async (olKey: string) => {
    if (dataRef.current.works[olKey]) return;
    try {
      const w = await fetchWork(olKey);
      setData((d) => ({ ...d, works: { ...d.works, [olKey]: w } }));
    } catch {
      // The screen shows "no description" when this stays empty.
    }
  }, []);

  const clear = useCallback(() => {
    setData({ contents: {}, works: {} });
    setOffline({});
  }, []);

  const value: ContentStore = { ...data, ready, loading, offline, load, loadWork, clear };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useContent(): ContentStore {
  const c = useContext(Ctx);
  if (!c) throw new Error('useContent must be used inside ContentProvider');
  return c;
}
