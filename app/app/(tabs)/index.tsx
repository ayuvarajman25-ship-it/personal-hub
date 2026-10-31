import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bar, Body, Btn, Card, IconBtn, Label, Muted, Row, Screen, Title } from '../../src/ui';
import { Ring, WeekChart } from '../../src/charts';
import { useStore } from '../../src/store';
import { useTheme } from '../../src/theme';
import { fmtMin } from '../../src/format';
import { openUsageSettings, useUsage } from '../../src/usage';
import { TOPIC_COLORS } from '../../src/palette';

export default function Today() {
  const t = useTheme();
  const router = useRouter();
  const { settings } = useStore();
  const usage = useUsage();
  const limit = settings.limitMin;
  const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const settingsBtn = <IconBtn name="settings-outline" label="Settings" onPress={() => router.push('/settings')} />;

  if (usage.status === 'needs-permission') {
    return (
      <Screen top>
        <Title sub={date} right={settingsBtn}>Today</Title>
        <Card>
          <Label>Screen time</Label>
          <Body>To show how long you use your phone, Android needs you to turn on usage access for Personal Hub.</Body>
          <Muted style={{ marginTop: 8, marginBottom: 16 }}>
            Everything stays on your phone. Find Personal Hub in the list and switch it on, then come back.
          </Muted>
          <Btn title="Allow usage access" onPress={() => openUsageSettings()} />
        </Card>
      </Screen>
    );
  }

  const days = usage.days;
  const today = days[days.length - 1];
  const todayMin = today.totalMs / 60000;
  const over = todayMin >= limit;
  const avg = days.reduce((a, d) => a + d.totalMs / 60000, 0) / days.length;
  let streak = 0;
  for (let i = days.length - 1; i >= 0 && days[i].totalMs / 60000 <= limit; i--) streak++;

  return (
    <Screen top>
      <Title sub={date} right={settingsBtn}>Today</Title>

      {usage.status === 'sample' && (
        <Card style={{ backgroundColor: t.accentSoft }}>
          <Muted>Showing sample numbers. Your real screen time appears once the Android build with usage access is installed.</Muted>
        </Card>
      )}

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Muted>Screen time today</Muted>
            <Text style={{ fontSize: 46, fontWeight: '300', letterSpacing: -2, color: t.text, marginVertical: 6 }}>{fmtMin(todayMin)}</Text>
            <Muted style={over ? { color: t.danger } : undefined}>
              {over ? `${fmtMin(todayMin - limit)} over your limit` : `${fmtMin(limit - todayMin)} left of ${fmtMin(limit)}`}
            </Muted>
          </View>
          <Ring pct={todayMin / limit} />
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        {[[String(today.pickups), 'Unlocks'], [fmtMin(avg), 'Daily avg'], [`${streak} days`, 'Under limit']].map(([v, l]) => (
          <View key={l} style={{ flex: 1, backgroundColor: t.surface, borderRadius: 16, padding: 14 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: t.text }}>{v}</Text>
            <Muted>{l}</Muted>
          </View>
        ))}
      </View>

      <Card>
        <Label>Last 7 days</Label>
        <WeekChart days={days} limitMin={limit} />
      </Card>

      {today.apps.length > 0 && (
        <Card>
          <Label>Top apps today</Label>
          {today.apps.slice(0, 5).map((a, i, arr) => (
            <Row key={a.pkg} last={i === arr.length - 1}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                  <Text style={{ flex: 1, color: t.text, fontSize: 15 }}>{a.label}</Text>
                  <Muted>{fmtMin(a.ms / 60000)}</Muted>
                </View>
                <Bar pct={(a.ms / today.totalMs) * 100} color={TOPIC_COLORS[i % TOPIC_COLORS.length]} />
              </View>
            </Row>
          ))}
        </Card>
      )}
    </Screen>
  );
}
