import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from '../src/store';
import { ContentProvider, useContent } from '../src/contentStore';
import { useTheme } from '../src/theme';

function Inner() {
  const { ready } = useStore();
  const content = useContent();
  const t = useTheme();
  if (!ready || !content.ready) return null;
  return (
    <>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.bg },
          headerTintColor: t.text,
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="topic-form" options={{ presentation: 'modal', title: 'Topic' }} />
        <Stack.Screen name="add-item" options={{ presentation: 'modal', title: 'Add item' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <ContentProvider>
          <Inner />
        </ContentProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
