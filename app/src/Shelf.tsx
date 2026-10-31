import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Bar, IconBtn, Monogram, Muted, Screen, Title, serif } from './ui';
import { useStore } from './store';
import { useTheme } from './theme';
import { useTopicItems } from './hooks';
import { Topic } from './types';

function TopicCard({ topic, wide }: { topic: Topic; wide: boolean }) {
  const t = useTheme();
  const router = useRouter();
  const { progress } = useStore();
  const { content, items } = useTopicItems(topic.id);
  const done = items.filter((i) => progress[i.id] === 2).length;
  const line = !content && items.length === 0 ? 'Loads when you open it' : `${items.length} items · ${done} done`;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/topic/${topic.id}`)}
      style={{ backgroundColor: t.surface, borderRadius: 20, padding: 16, gap: 10, width: wide ? '100%' : '48.5%', marginBottom: 12, justifyContent: 'space-between', minHeight: wide ? 0 : 150 }}
    >
      <View style={{ flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'flex-start', gap: wide ? 12 : 8 }}>
        <Monogram name={topic.name} color={topic.color} />
        <View style={{ flex: wide ? 1 : undefined, alignSelf: 'stretch' }}>
          <Text style={{ fontFamily: serif, fontWeight: '700', fontSize: 17, color: t.text }}>{topic.name}</Text>
          <Muted>{line}</Muted>
        </View>
        {wide ? <Ionicons name="chevron-forward" size={18} color={t.muted} /> : null}
      </View>
      {topic.goal ? <Muted numberOfLines={3}>{topic.goal}</Muted> : null}
      <Bar pct={items.length ? (done / items.length) * 100 : 0} color={topic.color} />
    </Pressable>
  );
}

export function Shelf({ section }: { section: Topic['section'] }) {
  const t = useTheme();
  const router = useRouter();
  const { topics } = useStore();
  const lib = section === 'lib';
  return (
    <Screen top>
      <Title
        sub={lib ? 'Thinkers and writers you are reading' : 'Sales, marketing and case studies'}
        right={<IconBtn name="settings-outline" label="Settings" onPress={() => router.push('/settings')} />}
      >
        {lib ? 'Library' : 'Upskill'}
      </Title>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {topics.filter((x) => x.section === section).map((x) => (
          <TopicCard key={x.id} topic={x} wide={!lib} />
        ))}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/topic-form', params: { section } })}
          style={{ width: lib ? '48.5%' : '100%', minHeight: lib ? 150 : 72, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: t.line, alignItems: 'center', justifyContent: 'center', gap: 4 }}
        >
          <Ionicons name="add" size={26} color={t.muted} />
          <Muted>Add topic</Muted>
        </Pressable>
      </View>
    </Screen>
  );
}
