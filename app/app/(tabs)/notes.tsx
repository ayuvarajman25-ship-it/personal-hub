import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Card, Chip, Empty, Field, IconBtn, Screen, Title } from '../../src/ui';
import { NoteRow } from '../../src/NoteRow';
import { useStore } from '../../src/store';
import { useRouter } from 'expo-router';

export default function Notes() {
  const router = useRouter();
  const { notes, topics } = useStore();
  const [q, setQ] = useState('');
  const [topicId, setTopicId] = useState<string>('all');

  const query = q.trim().toLowerCase();
  const shown = notes
    .filter((n) => (topicId === 'all' || n.topicId === topicId) && (!query || `${n.title} ${n.body}`.toLowerCase().includes(query)))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <Screen top>
      <Title sub={`${notes.length} notes`} right={<IconBtn name="settings-outline" label="Settings" onPress={() => router.push('/settings')} />}>
        Notes
      </Title>
      <Field placeholder="Search notes" value={q} onChangeText={setQ} returnKeyType="search" accessibilityLabel="Search notes" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12, flexGrow: 0 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip title="All" on={topicId === 'all'} onPress={() => setTopicId('all')} />
          {topics.map((x) => (
            <Chip key={x.id} title={x.name} on={topicId === x.id} onPress={() => setTopicId(x.id)} />
          ))}
        </View>
      </ScrollView>
      <Card>
        {shown.length === 0 ? (
          <Empty text="No notes yet. Open a topic and tap New note." />
        ) : (
          shown.map((n, i) => <NoteRow key={n.id} note={n} last={i === shown.length - 1} />)
        )}
      </Card>
    </Screen>
  );
}
