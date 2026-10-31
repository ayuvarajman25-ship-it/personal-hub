import React, { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Btn, Card, Label, Muted, Screen, Seg } from '../src/ui';
import { useStore } from '../src/store';
import { useContent } from '../src/contentStore';
import { useTheme } from '../src/theme';
import { fmtMin } from '../src/format';
import UsageStats from '../modules/usage-stats';
import { openUsageSettings } from '../src/usage';
import { Settings } from '../src/types';

export default function SettingsScreen() {
  const t = useTheme();
  const { settings, setSettings, reset } = useStore();
  const { clear } = useContent();
  const [allowed, setAllowed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setAllowed(!!UsageStats?.hasPermission());
    }, []),
  );

  const confirmReset = () =>
    Alert.alert('Reset everything?', 'Topics, items and notes go back to the starting set. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: reset },
    ]);

  return (
    <Screen>
      <Card>
        <Label>Appearance</Label>
        <Seg<Settings['theme']>
          options={[['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']]}
          value={settings.theme}
          onChange={(theme) => setSettings({ theme })}
        />
      </Card>

      <Card>
        <Label>Daily screen time limit</Label>
        <Seg<number>
          options={[[120, '2h'], [180, '3h'], [240, '4h']]}
          value={settings.limitMin}
          onChange={(limitMin) => setSettings({ limitMin })}
        />
        <Muted style={{ marginTop: 10 }}>{`The Today screen compares your screen time with ${fmtMin(settings.limitMin)}.`}</Muted>
      </Card>

      <Card>
        <Label>Instagram messages</Label>
        <Seg<'on' | 'off'>
          options={[['on', 'Messages only'], ['off', 'Full Instagram']]}
          value={settings.messagesOnly === false ? 'off' : 'on'}
          onChange={(v) => setSettings({ messagesOnly: v === 'on' })}
        />
        <Muted style={{ marginTop: 10 }}>
          Messages only sends you back to your inbox if you open the feed, explore or reels. The Messages tab shows Instagram's own website inbox, so you stay signed in with your personal account.
        </Muted>
      </Card>

      <Card>
        <Label>Usage access</Label>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: t.text, fontWeight: '600' }}>{UsageStats ? (allowed ? 'Allowed' : 'Not allowed') : 'Not available in this build'}</Text>
            <Muted>Lets Personal Hub read how long each app is open. The numbers never leave your phone.</Muted>
          </View>
          {UsageStats ? <Btn kind="soft" title={allowed ? 'Manage' : 'Allow'} onPress={() => openUsageSettings()} /> : null}
        </View>
      </Card>

      <Card>
        <Label>Downloaded content</Label>
        <Muted style={{ marginBottom: 12 }}>
          Articles, books, quotes and news are fetched from Wikipedia, Wikiquote, Open Library and Google News, and saved on this phone for offline reading.
        </Muted>
        <Btn kind="soft" title="Clear downloaded content" onPress={clear} />
      </Card>

      <Card>
        <Label>About</Label>
        <Muted>Your topics and notes are stored on this phone only. Messages are Instagram's website inbox inside the app, so there are no notifications when the app is closed.</Muted>
      </Card>

      <Btn kind="danger" title="Reset to starting data" onPress={confirmReset} />
    </Screen>
  );
}
