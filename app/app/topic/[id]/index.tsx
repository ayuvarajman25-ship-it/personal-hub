import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Body, Btn, Card, Chip, Empty, IconBtn, Label, Muted, Row, Screen, Seg, serif } from '../../../src/ui';
import { NoteRow } from '../../../src/NoteRow';
import { useStore } from '../../../src/store';
import { useContent } from '../../../src/contentStore';
import { useTopicItems } from '../../../src/hooks';
import { useTheme } from '../../../src/theme';
import { fmtDate } from '../../../src/format';
import { WikiSection } from '../../../src/content';
import { STATUS_LABELS, Status } from '../../../src/types';

type Tab = 'read' | 'books' | 'quotes' | 'news' | 'notes';
const LIMIT = 500;

function SectionCard({ s }: { s: WikiSection }) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const long = s.text.length > LIMIT;
  return (
    <Card>
      <Text style={{ fontFamily: serif, fontWeight: '700', fontSize: 18, color: t.text, marginBottom: 8 }}>{s.title}</Text>
      <Body style={{ lineHeight: 24 }}>{open || !long ? s.text : `${s.text.slice(0, LIMIT).trimEnd()}…`}</Body>
      {long ? (
        <Pressable accessibilityRole="button" onPress={() => setOpen(!open)} style={{ minHeight: 44, justifyContent: 'center' }}>
          <Text style={{ color: t.accent, fontWeight: '600' }}>{open ? 'Show less' : 'Read more'}</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

export default function TopicScreen() {
  const t = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, progress, setStatus, addNote, updateNote, deleteTopic } = useStore();
  const { load, loading, offline } = useContent();
  const { topic, content, items } = useTopicItems(id);
  const [tab, setTab] = useState<Tab>('read');

  useEffect(() => {
    if (topic) load(topic);
  }, [topic?.id, topic?.name, topic?.byAuthor, load]);

  if (!topic) {
    return (
      <Screen>
        <Stack.Screen options={{ title: '' }} />
        <Empty text="This topic no longer exists." />
      </Screen>
    );
  }

  const busy = !!loading[topic.id];
  const topicNotes = notes.filter((n) => n.topicId === topic.id);
  const confirmDelete = () =>
    Alert.alert('Delete this topic?', 'Its items and notes will be removed too.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { router.back(); deleteTopic(topic.id); } },
    ]);
  const saveQuote = (q: string) => {
    const nid = addNote(topic.id);
    updateNote(nid, { title: 'Quote', body: q });
    router.push(`/note/${nid}`);
  };

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: topic.name,
          headerRight: () => <IconBtn name="refresh" label="Refresh from the internet" onPress={() => load(topic, true)} />,
        }}
      />

      {topic.goal ? (
        <Card>
          <Label>What I want to find out</Label>
          <Body>{topic.goal}</Body>
        </Card>
      ) : null}

      {busy ? (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator color={t.accent} />
          <Muted style={{ flex: 1 }}>Fetching from Wikipedia, Open Library and the news…</Muted>
        </Card>
      ) : null}
      {!busy && offline[topic.id] ? (
        <Card style={{ backgroundColor: t.accentSoft }}>
          <Muted>{content && content.failed.length < 4 ? 'Could not reach the internet, showing the saved copy.' : 'Could not reach the internet. Check your connection and tap refresh.'}</Muted>
        </Card>
      ) : null}
      {!busy && content && content.failed.length > 0 && content.failed.length < 4 ? (
        <Muted style={{ marginBottom: 12 }}>{`Could not load: ${content.failed.join(', ')}. Tap refresh to retry.`}</Muted>
      ) : null}

      <View style={{ marginBottom: 12 }}>
        <Seg<Tab>
          options={[['read', 'Read'], ['books', 'Books'], ['quotes', 'Quotes'], ['news', 'News'], ['notes', 'Notes']]}
          value={tab}
          onChange={setTab}
        />
      </View>

      {tab === 'read' && (
        content?.wiki ? (
          <>
            <Card>
              <Label>Article</Label>
              <Text style={{ fontFamily: serif, fontWeight: '700', fontSize: 20, color: t.text }}>{content.wiki.title}</Text>
              <Muted style={{ marginTop: 4, marginBottom: 12 }}>{`Full text from Wikipedia (CC BY-SA 4.0) · fetched ${fmtDate(content.fetchedAt)}`}</Muted>
              <Btn kind="soft" icon="open-outline" title="Open on Wikipedia" onPress={() => Linking.openURL(content.wiki!.url)} />
            </Card>
            {content.wiki.sections.map((s, i) => <SectionCard key={`${i}-${s.title}`} s={s} />)}
          </>
        ) : busy ? null : (
          <Empty text="No article found for this topic yet." />
        )
      )}

      {tab === 'books' && (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <View style={{ flex: 1 }}><Label>{`Reading list · ${items.length}`}</Label></View>
            <Chip title="Add" icon="add" onPress={() => router.push({ pathname: '/add-item', params: { topicId: topic.id } })} />
          </View>
          {items.length === 0 && !busy ? <Empty text="No books found. Add what you want to read." /> : null}
          {items.map((i, idx) => {
            const st = (progress[i.id] ?? 0) as Status;
            return (
              <Row key={i.id} last={idx === items.length - 1}>
                <Pressable accessibilityRole="button" style={{ flex: 1, minHeight: 44, justifyContent: 'center' }}
                  onPress={() => router.push(`/topic/${topic.id}/${i.id}`)}>
                  <Text style={{ fontFamily: serif, fontWeight: '700', fontSize: 16, color: t.text }}>{i.title}</Text>
                  <Muted>{i.meta ? `${i.kind} · ${i.meta}` : i.kind}</Muted>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Status ${STATUS_LABELS[st]}. Tap to change`}
                  onPress={() => setStatus(i.id, ((st + 1) % 3) as Status)}
                  style={{ minHeight: 36, paddingHorizontal: 12, borderRadius: 99, justifyContent: 'center', backgroundColor: st === 2 ? t.accent : t.accentSoft }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '500', color: st === 2 ? t.onAccent : t.muted }}>{STATUS_LABELS[st]}</Text>
                </Pressable>
              </Row>
            );
          })}
          <Muted style={{ marginTop: 8 }}>Book data from Open Library.</Muted>
        </Card>
      )}

      {tab === 'quotes' && (
        content && content.quotes.length > 0 ? (
          <>
            {content.quotes.map((q, i) => (
              <Card key={i}>
                <Text style={{ fontFamily: serif, fontSize: 17, lineHeight: 25, color: t.text }}>{q}</Text>
                <Pressable accessibilityRole="button" onPress={() => saveQuote(q)} style={{ minHeight: 44, justifyContent: 'center' }}>
                  <Text style={{ color: t.accent, fontWeight: '600' }}>Save to notes</Text>
                </Pressable>
              </Card>
            ))}
            <Muted>From Wikiquote (CC BY-SA 4.0). Wording and attribution on Wikiquote can vary, so check the source.</Muted>
          </>
        ) : busy ? null : (
          <Empty text="No quotes found for this topic." />
        )
      )}

      {tab === 'news' && (
        <Card>
          <Label>{`Articles · ${content?.articles.length ?? 0}`}</Label>
          {content && content.articles.length === 0 && !busy ? <Empty text="No articles found." /> : null}
          {content?.articles.map((a, idx, arr) => (
            <Row key={a.url} last={idx === arr.length - 1} onPress={() => Linking.openURL(a.url)}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontSize: 15, fontWeight: '600', lineHeight: 21 }}>{a.title}</Text>
                <Muted>{`${a.source}${a.date ? ` · ${fmtDate(a.date)}` : ''}`}</Muted>
              </View>
            </Row>
          ))}
          <Muted style={{ marginTop: 8 }}>Search results from Google News. Articles open in your browser.</Muted>
        </Card>
      )}

      {tab === 'notes' && (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <View style={{ flex: 1 }}><Label>Notes</Label></View>
            <Chip title="New note" icon="add" onPress={() => router.push(`/note/${addNote(topic.id)}`)} />
          </View>
          {topicNotes.length === 0 ? <Empty text="Write down what you are learning." /> : null}
          {topicNotes.map((n, idx) => <NoteRow key={n.id} note={n} last={idx === topicNotes.length - 1} />)}
        </Card>
      )}

      {topic.custom ? (
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
          <Btn style={{ flex: 1 }} kind="soft" icon="create-outline" title="Edit"
            onPress={() => router.push({ pathname: '/topic-form', params: { id: topic.id } })} />
          <Btn style={{ flex: 1 }} kind="danger" icon="trash-outline" title="Delete" onPress={confirmDelete} />
        </View>
      ) : null}
    </Screen>
  );
}
