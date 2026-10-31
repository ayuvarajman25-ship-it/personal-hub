import { useStore } from './store';
import { useContent } from './contentStore';

/** One row in a topic's reading list: either added by hand or fetched from Open Library. */
export interface ListItem {
  id: string;
  title: string;
  kind: string;
  meta: string;
  olKey?: string;
  user: boolean;
}

export function useTopicItems(topicId: string | undefined) {
  const { topics } = useStore();
  const { contents } = useContent();
  const topic = topics.find((t) => t.id === topicId);
  const content = topic ? contents[topic.id] : undefined;
  const items: ListItem[] = topic
    ? [
        ...topic.items.map((i) => ({ id: i.id, title: i.title, kind: i.kind, meta: i.meta, user: true })),
        ...(content?.books ?? []).map((b) => ({
          id: b.id, title: b.title, kind: 'Book', meta: `${b.author}${b.year ? ` · ${b.year}` : ''}`, olKey: b.olKey, user: false,
        })),
      ]
    : [];
  return { topic, content, items };
}
