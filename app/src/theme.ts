import { useColorScheme } from 'react-native';
import { useStore } from './store';

const light = {
  bg: '#FAFAF8', surface: '#FFFFFF', text: '#171717', muted: '#8A8A84', line: '#EEEDE9',
  accent: '#2F5D50', accentSoft: '#EDF2EF', onAccent: '#FFFFFF', danger: '#B5523B', isDark: false,
};
const dark = {
  bg: '#0F0F0E', surface: '#181817', text: '#EDEDEA', muted: '#8F8F8A', line: '#242423',
  accent: '#8FBFAE', accentSoft: '#1B2420', onAccent: '#0F0F0E', danger: '#E58E78', isDark: true,
};

export type Theme = typeof light;

export function useTheme(): Theme {
  const system = useColorScheme();
  const pref = useStore().settings.theme;
  const isDark = pref === 'dark' || (pref === 'auto' && system === 'dark');
  return isDark ? dark : light;
}
