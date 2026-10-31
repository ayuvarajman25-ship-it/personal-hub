import React, { useState } from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Btn, Field, Muted, Screen } from '../src/ui';
import { useStore } from '../src/store';

export default function AddItem() {
  const router = useRouter();
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const { topics, addItem } = useStore();
  const topic = topics.find((x) => x.id === topicId);
  const [title, setTitle] = useState('');

  const save = () => {
    const v = title.trim();
    if (!v || !topic) return;
    addItem(topic.id, v);
    router.back();
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: topic ? `Add to ${topic.name}` : 'Add item' }} />
      <Muted style={{ marginBottom: 6 }}>Title</Muted>
      <Field autoFocus value={title} onChangeText={setTitle} onSubmitEditing={save} placeholder="Book, article, video, case study..." maxLength={80} returnKeyType="done" accessibilityLabel="Item title" />
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
        <Btn style={{ flex: 1 }} kind="soft" title="Cancel" onPress={() => router.back()} />
        <Btn style={{ flex: 1 }} title="Save" onPress={save} />
      </View>
    </Screen>
  );
}
