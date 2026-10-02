import { Redirect, Tabs, router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlusIcon, TodayIcon, TrendIcon } from '@/components/icons';
import { Tap } from '@/components/ui';
import { useHydrated } from '@/lib/useHydrated';
import { useStore } from '@/store';
import { colors, fonts } from '@/theme';

export default function TabsLayout() {
  const hydrated = useHydrated();
  const hasPlan = useStore((s) => !!s.plan);
  if (!hydrated) return null;
  if (!hasPlan) return <Redirect href="/onboarding" />;

  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.ivory }, animation: 'shift' }} tabBar={(p) => <TabBar {...p} />}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
    </Tabs>
  );
}

/** Three tabs: Today · Log (+) · Progress. Log opens as a sheet, not a tab. */
function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const active = state.routes[state.index]?.name;
  const go = (name: string) => {
    if (active !== name) navigation.navigate(name);
  };
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      <Tap onPress={() => go('index')} haptic="select" style={styles.item} accessibilityLabel="Today">
        <TodayIcon color={active === 'index' ? colors.slate : colors.muted} />
        <Text style={[styles.label, active === 'index' && styles.labelOn]}>Today</Text>
      </Tap>
      <Tap onPress={() => router.push('/log')} accessibilityLabel="Log a meal" style={styles.plus}>
        <PlusIcon />
      </Tap>
      <Tap onPress={() => go('progress')} haptic="select" style={styles.item} accessibilityLabel="Progress">
        <TrendIcon color={active === 'progress' ? colors.slate : colors.muted} />
        <Text style={[styles.label, active === 'progress' && styles.labelOn]}>Progress</Text>
      </Tap>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingTop: 10, paddingHorizontal: 24, backgroundColor: colors.ivory, borderTopWidth: 1, borderTopColor: colors.line },
  item: { alignItems: 'center', gap: 4, minWidth: 64, minHeight: 44, justifyContent: 'center' },
  label: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
  labelOn: { fontFamily: fonts.semibold, color: colors.slate },
  plus: { width: 60, height: 60, borderRadius: 30, marginTop: -28, backgroundColor: colors.slate, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: colors.ivory },
});
