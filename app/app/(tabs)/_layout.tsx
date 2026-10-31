import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name={icon} size={size} color={color} />,
});

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.line },
      }}
    >
      <Tabs.Screen name="index" options={tab('Today', 'home-outline')} />
      <Tabs.Screen name="library" options={tab('Library', 'book-outline')} />
      <Tabs.Screen name="upskill" options={tab('Upskill', 'trending-up-outline')} />
      <Tabs.Screen name="notes" options={tab('Notes', 'document-text-outline')} />
    </Tabs>
  );
}
