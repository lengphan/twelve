import * as Haptics from 'expo-haptics';
import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { colors, fonts, radius, spring } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Every tappable thing: springs down on press, light haptic tick. */
export function Tap({
  children,
  onPress,
  style,
  haptic = 'light',
  accessibilityLabel,
  disabled,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  haptic?: 'light' | 'select' | 'success' | 'none';
  accessibilityLabel?: string;
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPressIn={() => (scale.value = withSpring(0.97, spring))}
      onPressOut={() => (scale.value = withSpring(1, spring))}
      onPress={() => {
        if (haptic === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (haptic === 'select') Haptics.selectionAsync();
        if (haptic === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onPress?.();
      }}
      style={[animated, style, disabled && { opacity: 0.4 }]}
    >
      {children}
    </AnimatedPressable>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  haptic = 'light',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  haptic?: 'light' | 'select' | 'success';
  disabled?: boolean;
}) {
  const primary = variant === 'primary';
  return (
    <Tap
      onPress={onPress}
      haptic={haptic}
      disabled={disabled}
      style={[styles.button, primary ? styles.buttonPrimary : styles.buttonSecondary]}
    >
      <Text style={[styles.buttonText, { color: primary ? colors.onSlate : colors.slate }]}>{label}</Text>
    </Tap>
  );
}

/** Option chip/card with a selected state that animates its fill. */
export function Option({
  label,
  detail,
  selected,
  onPress,
  mono,
  style,
}: {
  label: string;
  detail?: string;
  selected: boolean;
  onPress: () => void;
  mono?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Tap
      onPress={onPress}
      haptic="select"
      accessibilityLabel={label}
      style={[styles.option, selected ? styles.optionOn : styles.optionOff, style]}
    >
      <Text style={[styles.optionLabel, mono && { fontFamily: fonts.mono, fontSize: 18 }, { color: selected ? colors.onSlate : colors.slate }]}>
        {label}
      </Text>
      {detail ? (
        <Text style={[styles.optionDetail, { color: selected ? colors.onSlateMuted : colors.muted }]}>{detail}</Text>
      ) : null}
    </Tap>
  );
}

/** Progress bar whose fill springs to its new value. */
export function Bar({ value, track = colors.slateLine, fill = colors.accent }: { value: number; track?: string; fill?: string }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withTiming(Math.max(0, Math.min(1, value)), { duration: 700 });
  }, [value, v]);
  const style = useAnimatedStyle(() => ({ width: `${v.value * 100}%` }));
  return (
    <View style={[styles.barTrack, { backgroundColor: track }]}>
      <Animated.View style={[styles.barFill, { backgroundColor: fill }, style]} />
    </View>
  );
}

export function Card({ children, style, dark }: { children: ReactNode; style?: StyleProp<ViewStyle>; dark?: boolean }) {
  return <View style={[styles.card, dark && styles.cardDark, style]}>{children}</View>;
}

export function Label({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

export function Num({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.num, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  button: { height: 56, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  buttonPrimary: { backgroundColor: colors.slate },
  buttonSecondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  buttonText: { fontFamily: fonts.semibold, fontSize: 16 },
  option: { borderRadius: radius.md, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 16, minHeight: 48, justifyContent: 'center' },
  optionOn: { backgroundColor: colors.slate, borderColor: colors.slate },
  optionOff: { backgroundColor: colors.card, borderColor: colors.line },
  optionLabel: { fontFamily: fonts.semibold, fontSize: 16 },
  optionDetail: { fontFamily: fonts.regular, fontSize: 13, marginTop: 3 },
  barTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16 },
  cardDark: { backgroundColor: colors.slate, borderColor: colors.slate },
  label: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 0.5, color: colors.muted },
  num: { fontFamily: fonts.mono, color: colors.slate },
});

/** Shared styles so every screen uses identical measurements. */
export const shared = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ivory },
  iconBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  h1: { fontFamily: fonts.semibold, fontSize: 28, letterSpacing: -0.84, lineHeight: 34, color: colors.slate },
  lead: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.muted },
  segments: { flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  note: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.card },
  noteText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.slateMid },
  segmented: { flexDirection: 'row', gap: 4, padding: 4, backgroundColor: colors.sunken, borderRadius: radius.md },
  segBtn: { flex: 1, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.card },
  segText: { fontFamily: fonts.medium, fontSize: 14 },
});
