import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from './theme';
import { DayUsage } from '../modules/usage-stats';
import { fmtMin } from './format';

export function Ring({ pct, size = 124 }: { pct: number; size?: number }) {
  const t = useTheme();
  const stroke = 12, r = (size - stroke) / 2, c = 2 * Math.PI * r, over = pct >= 1;
  const dash = Math.min(pct, 1) * c;
  return (
    <Svg width={size} height={size} accessibilityLabel={`${Math.round(pct * 100)} percent of the daily limit used`}>
      <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.accentSoft} strokeWidth={stroke} />
      <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={over ? t.danger : t.accent} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={`${dash} ${c}`} rotation={-90} origin={`${size / 2}, ${size / 2}`} />
      <SvgText x={size / 2} y={size / 2 + 7} textAnchor="middle" fontSize={22} fontWeight="700" fill={t.text}>
        {`${Math.round(pct * 100)}%`}
      </SvgText>
    </Svg>
  );
}

const LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function WeekChart({ days, limitMin }: { days: DayUsage[]; limitMin: number }) {
  const t = useTheme();
  const W = 320, H = 150, base = 120, bw = 28;
  const mins = days.map((d) => d.totalMs / 60000);
  const max = Math.max(240, limitMin + 20, ...mins);
  const gap = (W - bw * days.length) / Math.max(days.length - 1, 1);
  const y = (v: number) => base - (v / max) * (base - 14);
  return (
    <View>
      <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={150}>
        {days.map((d, i) => {
          const x = i * (bw + gap);
          const last = i === days.length - 1;
          return (
            <React.Fragment key={d.dayStart}>
              <Rect x={x} y={y(mins[i])} width={bw} height={base - y(mins[i])} rx={6} fill={last ? t.accent : t.accentSoft} />
              <SvgText x={x + bw / 2} y={base + 18} textAnchor="middle" fontSize={12} fill={t.muted}>
                {LETTERS[new Date(d.dayStart).getDay()]}
              </SvgText>
            </React.Fragment>
          );
        })}
        <Line x1={0} x2={W} y1={y(limitMin)} y2={y(limitMin)} stroke={t.danger} strokeWidth={1.5} strokeDasharray="4 4" />
      </Svg>
      <Text style={{ color: t.muted, fontSize: 13, marginTop: 4 }}>
        <Text style={{ color: t.danger }}>- - - </Text>
        {`Daily limit ${fmtMin(limitMin)}`}
      </Text>
    </View>
  );
}
