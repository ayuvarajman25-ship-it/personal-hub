import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Muted, Row } from './ui';
import { useTheme } from './theme';
import { fmtDate } from './format';
import { useTopicItems } from './hooks';
import { Note } from './types';

export function NoteRow({ note, last }: { note: Note; last?: boolean }) {
  const t = useTheme();
  const router = useRouter();
  const { topic, items } = useTopicItems(note.topicId);
  const item = note.itemId ? items.find((i) => i.id === note.itemId) : undefined;
  return (
    <Row last={last} onPress={() => router.push(`/note/${note.id}`)}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} style={{ color: t.text, fontWeight: '600', fontSize: 15 }}>{note.title || 'Untitled note'}</Text>
        <Text numberOfLines={2} style={{ color: t.muted, fontSize: 14 }}>{note.body || 'No text yet'}</Text>
        <Muted numberOfLines={1}>{`${fmtDate(note.updatedAt)} · ${topic?.name ?? 'Topic'}${item ? ` · ${item.title}` : ''}`}</Muted>
      </View>
    </Row>
  );
}
