export type Status = 0 | 1 | 2; // 0 to read, 1 reading, 2 done
export const STATUS_LABELS = ['To read', 'Reading', 'Done'] as const;

/** Something the user added by hand. Fetched books are not stored here, see content.ts. */
export interface Item {
  id: string;
  title: string;
  kind: string;
  meta: string;
}

/** What to search for online. Anything left out falls back to the topic name. */
export interface Sources {
  wiki?: string;
  books?: string;
  news?: string;
}

export interface Topic {
  id: string;
  section: 'lib' | 'up';
  name: string;
  color: string;
  goal: string;
  items: Item[];
  src?: Sources;
  /** Search Open Library by author name instead of by subject. */
  byAuthor?: boolean;
  custom?: boolean;
}

export interface Note {
  id: string;
  topicId: string;
  itemId: string | null;
  title: string;
  body: string;
  updatedAt: number;
}

export interface Settings {
  theme: 'auto' | 'light' | 'dark';
  limitMin: number;
  /** Keep the Instagram inbox on messages only (no feed, explore or reels). Treated as on when missing. */
  messagesOnly?: boolean;
}

export interface State {
  topics: Topic[];
  notes: Note[];
  /** Reading status by item id, for both fetched books and items added by hand. */
  progress: Record<string, Status>;
  settings: Settings;
}
