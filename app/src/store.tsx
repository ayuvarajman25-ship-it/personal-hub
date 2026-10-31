import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note, Settings, State, Status, Topic } from './types';
import { seed } from './seed';

const KEY = 'personalhub.v2';
const uid = () => Math.random().toString(36).slice(2, 10);

interface Store extends State {
  ready: boolean;
  addTopic(section: Topic['section'], name: string, goal: string, color: string, byAuthor: boolean): string;
  updateTopic(id: string, patch: Partial<Pick<Topic, 'name' | 'goal' | 'color' | 'byAuthor'>>): void;
  deleteTopic(id: string): void;
  addItem(topicId: string, title: string): string;
  deleteItem(topicId: string, itemId: string): void;
  setStatus(itemId: string, status: Status): void;
  addNote(topicId: string, itemId?: string | null): string;
  updateNote(id: string, patch: Partial<Pick<Note, 'title' | 'body'>>): void;
  deleteNote(id: string): void;
  setSettings(patch: Partial<Settings>): void;
  reset(): void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(seed);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw) as State;
          if (saved && Array.isArray(saved.topics)) setState({ ...saved, progress: saved.progress ?? {} });
        }
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const mapTopic = (id: string, fn: (t: Topic) => Topic) =>
    setState((s) => ({ ...s, topics: s.topics.map((t) => (t.id === id ? fn(t) : t)) }));

  const store: Store = {
    ...state,
    ready,
    addTopic(section, name, goal, color, byAuthor) {
      const id = `t-${uid()}`;
      setState((s) => ({ ...s, topics: [...s.topics, { id, section, name, goal, color, byAuthor, items: [], custom: true }] }));
      return id;
    },
    updateTopic: (id, patch) => mapTopic(id, (t) => ({ ...t, ...patch })),
    deleteTopic: (id) =>
      setState((s) => ({ ...s, topics: s.topics.filter((t) => t.id !== id), notes: s.notes.filter((n) => n.topicId !== id) })),
    addItem(topicId, title) {
      const id = uid();
      mapTopic(topicId, (t) => ({ ...t, items: [...t.items, { id, title, kind: 'Added by me', meta: '' }] }));
      return id;
    },
    deleteItem: (topicId, itemId) => {
      mapTopic(topicId, (t) => ({ ...t, items: t.items.filter((i) => i.id !== itemId) }));
      setState((s) => {
        const { [itemId]: _gone, ...progress } = s.progress;
        return { ...s, progress, notes: s.notes.filter((n) => n.itemId !== itemId) };
      });
    },
    setStatus: (itemId, status) => setState((s) => ({ ...s, progress: { ...s.progress, [itemId]: status } })),
    addNote(topicId, itemId = null) {
      const id = uid();
      const note: Note = { id, topicId, itemId, title: '', body: '', updatedAt: Date.now() };
      setState((s) => ({ ...s, notes: [note, ...s.notes] }));
      return id;
    },
    updateNote: (id, patch) =>
      setState((s) => ({ ...s, notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)) })),
    deleteNote: (id) => setState((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) })),
    setSettings: (patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
    reset: () => setState(seed()),
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
