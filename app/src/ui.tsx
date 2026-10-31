import React from 'react';
import {
  Platform, Pressable, ScrollView, StyleProp, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './theme';

export const serif = Platform.select({ ios: 'Georgia', default: 'serif' });

export function Screen({ children, top = false, scroll = true }: { children: React.ReactNode; top?: boolean; scroll?: boolean }) {
  const t = useTheme();
  return (
    <SafeAreaView edges={top ? ['top'] : []} style={{ flex: 1, backgroundColor: t.bg }}>
      {scroll ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, padding: 16 }}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Title({ children, sub, right }: { children: string; sub?: string; right?: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48 }}>
        <Text style={{ flex: 1, fontSize: 28, fontWeight: '600', letterSpacing: -0.6, color: t.text }}>{children}</Text>
        {right}
      </View>
      {sub ? <Text style={{ color: t.muted, fontSize: 13 }}>{sub}</Text> : null}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return <View style={[{ backgroundColor: t.surface, borderRadius: 20, padding: 20, marginBottom: 12 }, style]}>{children}</View>;
}

export function Label({ children }: { children: string }) {
  const t = useTheme();
  return (
    <Text style={{ color: t.muted, fontSize: 12, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
      {children}
    </Text>
  );
}

export function Body({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ color: t.text, fontSize: 15, lineHeight: 21 }, style]}>{children}</Text>;
}

export function Muted({ children, style, numberOfLines }: { children: React.ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number }) {
  const t = useTheme();
  return <Text numberOfLines={numberOfLines} style={[{ color: t.muted, fontSize: 13, lineHeight: 18 }, style]}>{children}</Text>;
}

export function Btn({ title, onPress, kind = 'primary', icon, style }: {
  title: string; onPress: () => void; kind?: 'primary' | 'soft' | 'danger'; icon?: keyof typeof Ionicons.glyphMap; style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const bg = kind === 'primary' ? t.accent : kind === 'soft' ? t.accentSoft : 'transparent';
  const fg = kind === 'primary' ? t.onAccent : kind === 'danger' ? t.danger : t.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [{
        minHeight: 48, paddingHorizontal: 18, borderRadius: 14, backgroundColor: bg, opacity: pressed ? 0.8 : 1,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        borderWidth: kind === 'danger' ? 1 : 0, borderColor: t.line,
      }, style]}
    >
      {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
      <Text style={{ color: fg, fontWeight: '600', fontSize: 15 }}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ title, on, onPress, icon }: { title: string; on?: boolean; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      onPress={onPress}
      style={{
        minHeight: 40, paddingHorizontal: 14, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: on ? t.accent : t.surface,
      }}
    >
      {icon ? <Ionicons name={icon} size={16} color={on ? t.onAccent : t.text} /> : null}
      <Text style={{ color: on ? t.onAccent : t.text, fontSize: 14 }}>{title}</Text>
    </Pressable>
  );
}

export function IconBtn({ name, onPress, label, color }: { name: keyof typeof Ionicons.glyphMap; onPress: () => void; label: string; color?: string }) {
  const t = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
      style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={name} size={22} color={color ?? t.text} />
    </Pressable>
  );
}

export function Bar({ pct, color }: { pct: number; color?: string }) {
  const t = useTheme();
  return (
    <View style={{ height: 3, borderRadius: 3, backgroundColor: t.accentSoft, overflow: 'hidden' }}>
      <View style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: 3, backgroundColor: color ?? t.accent }} />
    </View>
  );
}

export function Monogram({ name, color, size = 44 }: { name: string; color: string; size?: number }) {
  const letter = name.replace(/^J\. /, '').charAt(0).toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.4, fontFamily: serif }}>{letter}</Text>
    </View>
  );
}

export function Field(props: TextInputProps) {
  const t = useTheme();
  return (
    <TextInput
      placeholderTextColor={t.muted}
      {...props}
      style={[{ minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, paddingHorizontal: 14, paddingVertical: 10, color: t.text, fontSize: 16 }, props.style]}
    />
  );
}

export function Seg<T extends string | number>({ options, value, onChange }: { options: [T, string][]; value: T; onChange: (v: T) => void }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: t.accentSoft, borderRadius: 14, padding: 4, gap: 4 }}>
      {options.map(([v, label]) => (
        <Pressable key={String(v)} accessibilityRole="button" accessibilityState={{ selected: v === value }} onPress={() => onChange(v)}
          style={{ flex: 1, minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: v === value ? t.surface : 'transparent' }}>
          <Text style={{ color: t.text, fontWeight: v === value ? '600' : '400' }}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  const t = useTheme();
  return <Text style={{ color: t.muted, textAlign: 'center', paddingVertical: 24 }}>{text}</Text>;
}

export function Row({ children, onPress, last }: { children: React.ReactNode; onPress?: () => void; last?: boolean }) {
  const t = useTheme();
  return (
    <Pressable disabled={!onPress} onPress={onPress}
      style={{ minHeight: 56, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: last ? 0 : 1, borderBottomColor: t.line }}>
      {children}
    </Pressable>
  );
}
