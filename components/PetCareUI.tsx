import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewProps, TextProps } from 'react-native';

import Colors from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from './useColorScheme';

export function useColors() {
  const scheme = useColorScheme();
  return Colors[scheme];
}

export function Card({ style, ...props }: ViewProps) {
  const c = useColors();
  return (
    <View
      style={[
        {
          backgroundColor: c.card,
          borderColor: c.border,
          borderWidth: 1,
          borderRadius: 14,
          padding: 16,
        },
        style,
      ]}
      {...props}
    />
  );
}

export function Eyebrow({ children, style, ...props }: TextProps) {
  const c = useColors();
  return (
    <Text
      style={[
        {
          fontFamily: Fonts.mono,
          fontSize: 11,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: c.accent,
          marginBottom: 6,
        },
        style,
      ]}
      {...props}>
      {children}
    </Text>
  );
}

export function ScreenTitle({ children, style, ...props }: TextProps) {
  const c = useColors();
  return (
    <Text
      style={[{ fontFamily: Fonts.serif, fontSize: 28, fontWeight: '600', color: c.text }, style]}
      {...props}>
      {children}
    </Text>
  );
}

export function Muted({ children, style, ...props }: TextProps) {
  const c = useColors();
  return (
    <Text style={[{ color: c.textMuted, fontSize: 14, lineHeight: 20 }, style]} {...props}>
      {children}
    </Text>
  );
}

const severityColorKey = { low: 'riskLow', med: 'riskMed', high: 'riskHigh' } as const;

export function StatusChip({
  label,
  tone = 'low',
}: {
  label: string;
  tone?: 'low' | 'med' | 'high';
}) {
  const c = useColors();
  const color = c[severityColorKey[tone]];
  return (
    <View
      style={[
        styles.chipBase,
        { backgroundColor: color + '26', borderColor: color + '55' },
      ]}>
      <Text style={{ fontFamily: Fonts.mono, fontSize: 11, color, textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {label}
      </Text>
    </View>
  );
}

export function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterChip,
        {
          backgroundColor: active ? c.accent : c.cardSunken,
          borderColor: active ? c.accent : c.border,
        },
      ]}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: active ? '#ffffff' : c.textMuted,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return (
    <Text
      style={{
        fontFamily: Fonts.mono,
        fontSize: 11,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        color: c.textFaint,
        marginBottom: 6,
      }}>
      {children}
    </Text>
  );
}

export function TextField(props: TextInputProps) {
  const c = useColors();
  return (
    <TextInput
      placeholderTextColor={c.textFaint}
      style={[
        {
          borderWidth: 1,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 15,
          backgroundColor: c.card,
          borderColor: c.border,
          color: c.text,
        },
        props.style,
      ]}
      {...props}
    />
  );
}

export function CategoryTag({ category }: { category: string }) {
  const c = useColors();
  return (
    <View style={[styles.categoryTag, { backgroundColor: c.accentSoft }]}>
      <Text style={{ fontFamily: Fonts.mono, fontSize: 10.5, color: c.accent, textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {category}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chipBase: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
});
