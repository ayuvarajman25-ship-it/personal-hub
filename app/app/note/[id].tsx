import React, { useEffect, useRef } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Empty, Field, IconBtn, Muted, Screen, serif } from '../../src/ui';
import { useStore } from '../../src/store';
import { useTheme } from '../../src/theme';
import { fmtDate } from '../../src/format';

export default function NoteScreen() {
  const t = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, topics, updateNote, deleteNote } = useStore();
  const note = notes.find((n) => n.id === id);

  // An empty note is thrown away when the screen closes.
  const latest = useRef({ note, deleteNote });
  latest.current = { note, deleteNote };
  useEffect(
    () => () => {
      const { note: n, deleteNote: del } = latest.current;
      if (n && !n.title.trim() && !n.body.trim()) del(n.id);
    },
    [],
  );

  if (!note) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Note' }} />
        <Empty text="This note no longer exists." />
      </Screen>
    );
  }

  const topic = topics.find((x) => x.id === note.topicId);
  return (
    <Screen>
      <Stack.Screen
        options={{
          title: 'Note',
          headerRight: () => (
            <IconBtn name="trash-outline" label="Delete note" color={t.danger} onPress={() => { router.back(); deleteNote(note.id); }} />
          ),
        }}
      />
      <Muted style={{ marginBottom: 10 }}>{`${topic?.name ?? ''} · ${fmtDate(note.updatedAt)}`}</Muted>
      <Field
        placeholder="Title"
        value={note.title}
        onChangeText={(v) => updateNote(note.id, { title: v })}
        style={{ fontFamily: serif, fontSize: 20, fontWeight: '700', marginBottom: 10 }}
        accessibilityLabel="Note title"
      />
      <Field
        placeholder="Write what you noticed, what surprised you, what to try..."
        value={note.body}
        onChangeText={(v) => updateNote(note.id, { body: v })}
        multiline
        textAlignVertical="top"
        style={{ minHeight: 320, lineHeight: 24 }}
        accessibilityLabel="Note text"
      />
    </Screen>
  );
}
