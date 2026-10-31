import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, Linking, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Body, Btn, Card, Chip, Empty, Label, Muted, Screen, Seg, serif } from '../../../src/ui';
import { NoteRow } from '../../../src/NoteRow';
import { useStore } from '../../../src/store';
import { useContent } from '../../../src/contentStore';
import { useTopicItems } from '../../../src/hooks';
import { useTheme } from '../../../src/theme';
import { STATUS_LABELS, Status } from '../../../src/types';

export default function ItemScreen() {
  const t = useTheme();
  const router = useRouter();
  const { id, itemId } = useLocalSearchParams<{ id: string; itemId: string }>();
  const { notes, progress, setStatus, addNote, deleteItem } = useStore();
  const { works, loadWork } = useContent();
  const { topic, items } = useTopicItems(id);
  const item = items.find((i) => i.id === itemId);
  const olKey = item?.olKey;
  const work = olKey ? works[olKey] : undefined;

  useEffect(() => {
    if (olKey) loadWork(olKey);
  }, [olKey, loadWork]);

  if (!topic || !item) {
    return (
      <Screen>
        <Stack.Screen options={{ title: '' }} />
        <Empty text="This item no longer exists." />
      </Screen>
    );
  }

  const itemNotes = notes.filter((n) => n.itemId === item.id);
  const status = (progress[item.id] ?? 0) as Status;
  const confirmRemove = () =>
    Alert.alert('Remove this item?', 'Its notes will be removed too.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { router.back(); deleteItem(topic.id, item.id); } },
    ]);

  return (
    <Screen>
      <Stack.Screen options={{ title: topic.name }} />
      <Card>
        <Muted>{item.meta ? `${item.kind} · ${item.meta}` : item.kind}</Muted>
        <Text style={{ fontFamily: serif, fontWeight: '700', fontSize: 22, lineHeight: 28, color: t.text, marginTop: 6, marginBottom: 16 }}>{item.title}</Text>
        <Seg<number>
          options={STATUS_LABELS.map((l, n) => [n, l] as [number, string])}
          value={status}
          onChange={(v) => setStatus(item.id, v as Status)}
        />
      </Card>

      {olKey ? (
        <Card>
          <Label>About this book</Label>
          {work ? (
            <>
              <Body style={{ lineHeight: 24 }}>{work.description || 'Open Library has no description for this book.'}</Body>
              {work.subjects.length > 0 ? <Muted style={{ marginTop: 12 }}>{`Subjects: ${work.subjects.join(', ')}`}</Muted> : null}
            </>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <ActivityIndicator color={t.accent} />
              <Muted>Loading the description…</Muted>
            </View>
          )}
          <View style={{ marginTop: 12 }}>
            <Btn kind="soft" icon="open-outline" title="Open on Open Library" onPress={() => Linking.openURL(`https://openlibrary.org/works/${olKey}`)} />
          </View>
        </Card>
      ) : null}

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <View style={{ flex: 1 }}><Label>My notes</Label></View>
          <Chip title="New note" icon="add" onPress={() => router.push(`/note/${addNote(topic.id, item.id)}`)} />
        </View>
        {itemNotes.length === 0 ? <Empty text="No notes on this yet." /> : null}
        {itemNotes.map((n, i) => <NoteRow key={n.id} note={n} last={i === itemNotes.length - 1} />)}
      </Card>

      {item.user ? <Btn kind="danger" icon="trash-outline" title="Remove item" onPress={confirmRemove} /> : null}
    </Screen>
  );
}
