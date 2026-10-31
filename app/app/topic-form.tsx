import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Btn, Field, Muted, Screen, Seg } from '../src/ui';
import { useStore } from '../src/store';
import { useTheme } from '../src/theme';
import { TOPIC_COLORS } from '../src/palette';
import { Topic } from '../src/types';

export default function TopicForm() {
  const t = useTheme();
  const router = useRouter();
  const { id, section } = useLocalSearchParams<{ id?: string; section?: Topic['section'] }>();
  const { topics, addTopic, updateTopic } = useStore();
  const existing = id ? topics.find((x) => x.id === id) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [goal, setGoal] = useState(existing?.goal ?? '');
  const [color, setColor] = useState(existing?.color ?? TOPIC_COLORS[topics.length % TOPIC_COLORS.length]);
  const [kind, setKind] = useState<'subject' | 'person'>(existing?.byAuthor ? 'person' : 'subject');

  const save = () => {
    const n = name.trim();
    if (!n) return;
    if (existing) {
      updateTopic(existing.id, { name: n, goal: goal.trim(), color, byAuthor: kind === 'person' });
      router.back();
    } else {
      const newId = addTopic(section === 'up' ? 'up' : 'lib', n, goal.trim(), color, kind === 'person');
      router.replace(`/topic/${newId}`);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: existing ? 'Edit topic' : 'New topic' }} />
      <Muted style={{ marginBottom: 6 }}>Name</Muted>
      <Field autoFocus value={name} onChangeText={setName} placeholder="e.g. Stoicism, SQL, Negotiation" maxLength={40} accessibilityLabel="Topic name" />
      <Muted style={{ marginTop: 16, marginBottom: 6 }}>What is it?</Muted>
      <Seg<'subject' | 'person'> options={[['subject', 'A subject'], ['person', 'A person or author']]} value={kind} onChange={setKind} />
      <Muted style={{ marginTop: 6 }}>The articles, books, quotes and news for it are fetched from the internet using this name.</Muted>
      <Muted style={{ marginTop: 16, marginBottom: 6 }}>What do I want to find out?</Muted>
      <Field value={goal} onChangeText={setGoal} placeholder="Optional. One line about why you care." multiline textAlignVertical="top" style={{ minHeight: 96 }} accessibilityLabel="Goal" />
      <Muted style={{ marginTop: 16, marginBottom: 8 }}>Color</Muted>
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        {TOPIC_COLORS.map((c) => (
          <Pressable
            key={c}
            accessibilityRole="radio"
            accessibilityState={{ selected: c === color }}
            accessibilityLabel={`Color ${c}`}
            onPress={() => setColor(c)}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c, borderWidth: 3, borderColor: c === color ? t.text : 'transparent' }}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Btn style={{ flex: 1 }} kind="soft" title="Cancel" onPress={() => router.back()} />
        <Btn style={{ flex: 1 }} title="Save" onPress={save} />
      </View>
    </Screen>
  );
}
